import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const VALID_ROLES=["owner","admin","editor"];
const ROLE_LABELS={owner:"Owner",admin:"Admin",editor:"Editor"};

const loginEl=document.getElementById("login");
const appEl=document.getElementById("app");
const loginError=document.getElementById("loginError");
const loginEmail=document.getElementById("loginEmail");
const loginPass=document.getElementById("loginPass");
const loginBtn=document.getElementById("loginBtn");
const logoutBtn=document.getElementById("logoutBtn");
const roleBadge=document.getElementById("roleBadge");

let app,auth,storage,db,firebaseOK=false;
let currentUserRole=null;
let panelReady=false;

function showLoginError(msg){
  loginError.textContent=msg;
  loginError.style.display="block";
}

function hideLoginError(){
  loginError.style.display="none";
}

function showLoginView(){
  loginEl.style.display="block";
  appEl.style.display="none";
  roleBadge.hidden=true;
  currentUserRole=null;
  panelReady=false;
  firebaseOK=false;
}

function showAppView(role){
  loginEl.style.display="none";
  appEl.style.display="block";
  roleBadge.textContent=ROLE_LABELS[role]||role;
  roleBadge.hidden=false;
}

function canDeleteInPanel(){
  return currentUserRole==="owner"||currentUserRole==="admin";
}

async function ensureFirebaseApp(){
  if(app)return true;
  if(!window.VEDMAN_FIREBASE_READY||!window.VEDMAN_FIREBASE_CONFIG){
    showLoginError("Firebase config nav gatavs. Pārbaudi firebase-config.js.");
    return false;
  }
  app=initializeApp(window.VEDMAN_FIREBASE_CONFIG);
  auth=getAuth(app);
  storage=getStorage(app);
  db=getFirestore(app);
  return true;
}

async function denyAccess(message){
  currentUserRole=null;
  panelReady=false;
  firebaseOK=false;
  if(auth&&auth.currentUser){
    try{await signOut(auth);}catch(e){}
  }
  showLoginView();
  showLoginError(message);
}

async function resolveAuthorization(user){
  if(!user)return showLoginView();

  try{
    const snap=await getDoc(doc(db,"users",user.uid));
    if(!snap.exists()){
      return denyAccess("Nav piekļuves. Lietotāja profils nav atrasts (users/"+user.uid+").");
    }

    const data=snap.data();
    if(data.isActive!==true){
      return denyAccess("Konts nav aktīvs. Sazinies ar administratoru.");
    }
    if(!VALID_ROLES.includes(data.role)){
      return denyAccess("Nederīga loma. Atļautās: owner, admin, editor.");
    }

    hideLoginError();
    currentUserRole=data.role;
    showAppView(data.role);
    await initFirebasePanel();
  }catch(e){
    console.error(e);
    const hint=e.code==="permission-denied"
      ? " Nav tiesību lasīt users/{uid}. Pievieno Phase B interim Firestore rule (skat. FIREBASE_USERS_BOOTSTRAP.md)."
      : "";
    return denyAccess("Autorizācijas kļūda: "+(e.message||e.code||e)+hint);
  }
}

async function doLogin(){
  hideLoginError();
  loginBtn.disabled=true;
  loginBtn.textContent="Pieslēdzas...";

  const email=loginEmail.value.trim();
  const password=loginPass.value;

  if(!email||!password){
    showLoginError("Ievadi e-pastu un paroli.");
    loginBtn.disabled=false;
    loginBtn.textContent="Ieiet";
    return;
  }

  if(!await ensureFirebaseApp()){
    loginBtn.disabled=false;
    loginBtn.textContent="Ieiet";
    return;
  }

  try{
    await signInWithEmailAndPassword(auth,email,password);
  }catch(e){
    console.error(e);
    showLoginError("Nepareizs e-pasts vai parole.");
    loginBtn.disabled=false;
    loginBtn.textContent="Ieiet";
  }
}

loginBtn.addEventListener("click",doLogin);
loginPass.addEventListener("keydown",e=>{if(e.key==="Enter")doLogin();});
logoutBtn.addEventListener("click",async()=>{
  if(auth){
    try{await signOut(auth);}catch(e){console.error(e);}
  }
  showLoginView();
  hideLoginError();
});

(async function boot(){
  if(!await ensureFirebaseApp()){
    showLoginView();
    return;
  }
  onAuthStateChanged(auth,async user=>{
    loginBtn.disabled=false;
    loginBtn.textContent="Ieiet";
    if(!user)return showLoginView();
    await resolveAuthorization(user);
  });
})();

const CATEGORIES=[
  ["skembas","Šķembas"],
  ["grants","Grants"],
  ["smilts","Smilts"],
  ["melnzeme","Melnzeme"],
  ["betons","Betons"],
  ["manipulators","Manipulators"],
  ["zemes-darbi","Zemes darbi"],
  ["koku-serviss","Koku serviss"],
  ["objekti","Objekti"],
  ["video","Video"]
];

const cat=document.getElementById("category");
cat.innerHTML=CATEGORIES.map(c=>`<option value="${c[0]}">${c[1]}</option>`).join("");

const status=document.getElementById("firebaseStatus");
const list=document.getElementById("list");
const progress=document.getElementById("progress");
const bar=progress.querySelector("span");
const ok=document.getElementById("okMsg");
const err=document.getElementById("errMsg");
const configHelp=document.getElementById("configHelp");

function showErr(msg){
  err.style.display="block";
  err.textContent=msg;
}

function clearMsg(){
  err.style.display="none";
  ok.style.display="none";
}

async function initFirebasePanel(){
  if(panelReady)return;
  if(!app||!storage||!db){
    status.textContent="Firebase nav inicializēts.";
    return;
  }

  try{
    firebaseOK=true;
    panelReady=true;

    status.textContent="Firebase savienots ("+ROLE_LABELS[currentUserRole]+"). Var augšupielādēt.";
    status.classList.add("ready");
    configHelp.style.display="none";

    await loadList();
  }catch(e){
    status.textContent="Firebase kļūda: "+e.message;
  }
}

function safeName(name){
  return (
    name.toLowerCase()
    .replace(/\.[^.]+$/,"")
    .replace(/[^a-z0-9āčēģīķļņōŗšūž-]+/gi,"-")
    .replace(/-+/g,"-")
    .replace(/^-|-$/g,"") || "vedman"
  )+"-"+Date.now();
}

function canCanvasCompress(file){
  return file.type.startsWith("image/") && !file.name.toLowerCase().match(/\.heic|\.heif$/);
}

function imageToWebp(file,maxWidth=1600,quality=0.80){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    const url=URL.createObjectURL(file);

    img.onload=()=>{
      URL.revokeObjectURL(url);

      let w=img.width;
      let h=img.height;

      if(w>maxWidth){
        h=Math.round(h*maxWidth/w);
        w=maxWidth;
      }

      const canvas=document.createElement("canvas");
      canvas.width=w;
      canvas.height=h;
      canvas.getContext("2d").drawImage(img,0,0,w,h);

      canvas.toBlob(blob=>{
        if(blob) resolve(blob);
        else reject(new Error("WEBP kompresija neizdevās"));
      },"image/webp",quality);
    };

    img.onerror=()=>{
      URL.revokeObjectURL(url);
      reject(new Error("Attēlu nevar nolasīt. HEIC drošāk konvertēt uz JPG."));
    };

    img.src=url;
  });
}

async function uploadOne(file,i,total){
  const category=cat.value;
  const title=document.getElementById("title").value.trim() || CATEGORIES.find(c=>c[0]===category)[1];
  const description=document.getElementById("description").value.trim();

  const isVideo=file.type.startsWith("video/") || file.name.toLowerCase().match(/\.mov|\.mp4$/);

  let uploadBlob=file;
  let ext=isVideo ? (file.name.toLowerCase().endsWith(".mov")?".mov":".mp4") : ".webp";
  let mime=isVideo ? (file.type || "video/mp4") : "image/webp";

  if(!isVideo && canCanvasCompress(file)){
    uploadBlob=await imageToWebp(file,1600,0.80);
  }else if(!isVideo){
    ext=file.name.toLowerCase().match(/\.heic|\.heif$/)?".heic":".jpg";
    mime=file.type || "image/jpeg";
  }

  const filename=safeName(file.name)+ext;
  const path=`${category}/${filename}`;
  const storageRef=ref(storage,path);

  const task=uploadBytesResumable(storageRef,uploadBlob,{
    contentType:mime,
    customMetadata:{
      originalName:file.name,
      category
    }
  });

  await new Promise((resolve,reject)=>{
    task.on("state_changed",
      snap=>{
        bar.style.width=Math.min(100,((i+snap.bytesTransferred/snap.totalBytes)/total)*100)+"%";
      },
      reject,
      resolve
    );
  });

  const url=await getDownloadURL(storageRef);

  await addDoc(collection(db,"gallery"),{
    category,
    title,
    description,
    url,
    path,
    type:mime,
    originalName:file.name,
    sizeOriginal:file.size,
    sizeOptimized:uploadBlob.size,
    createdAt:serverTimestamp()
  });
}

document.getElementById("uploadBtn").addEventListener("click",async()=>{
  clearMsg();

  if(!firebaseOK){
    showErr("Firebase nav savienots. Pārbaudi firebase-config.js.");
    return;
  }

  const files=[...document.getElementById("files").files];

  if(!files.length){
    showErr("Izvēlies vismaz vienu failu.");
    return;
  }

  progress.style.display="block";
  bar.style.width="0%";

  try{
    for(let i=0;i<files.length;i++){
      await uploadOne(files[i],i,files.length);
    }

    ok.textContent="Augšupielāde pabeigta.";
    ok.style.display="block";
    document.getElementById("files").value="";
    bar.style.width="100%";

    await loadList();
  }catch(e){
    showErr(e.message);
  }
});

async function loadList(){
  if(!firebaseOK) return;

  const q=query(collection(db,"gallery"),orderBy("createdAt","desc"));
  const snap=await getDocs(q);
  const items=[];

  snap.forEach(d=>items.push({id:d.id,...d.data()}));

  list.innerHTML=items.length ? items.map(i=>{
    const isVideo=(i.type || "").startsWith("video");
    const media=isVideo
      ? `<video src="${i.url}" controls preload="metadata"></video>`
      : `<img src="${i.url}" loading="lazy" alt="${i.title || "VEDMAN galerija"}">`;

    return `
      <div class="item">
        ${media}
        <h3>${i.title || ""}</h3>
        <p>${i.description || ""}</p>
        <p><b>${i.category}</b><br>${i.originalName || ""}<br>${Math.round((i.sizeOptimized || 0)/1024)} KB</p>
        ${canDeleteInPanel()?`<button class="btn danger" data-id="${i.id}" data-path="${i.path}">Dzēst</button>`:"<p class=\"small\">Dzēšana nav pieejama (editor).</p>"}
      </div>
    `;
  }).join("") : "<p>Vēl nav ierakstu.</p>";

  list.querySelectorAll("button[data-id]").forEach(btn=>{
    btn.addEventListener("click",async()=>{
      if(!confirm("Dzēst šo ierakstu un failu?")) return;

      await deleteDoc(doc(db,"gallery",btn.dataset.id));

      try{
        await deleteObject(ref(storage,btn.dataset.path));
      }catch(e){}

      await loadList();
    });
  });
}

document.getElementById("refreshBtn").addEventListener("click",loadList);

const drop=document.getElementById("drop");

["dragenter","dragover"].forEach(ev=>{
  drop.addEventListener(ev,e=>{
    e.preventDefault();
    drop.classList.add("drag");
  });
});

["dragleave","drop"].forEach(ev=>{
  drop.addEventListener(ev,e=>{
    e.preventDefault();
    drop.classList.remove("drag");
  });
});

drop.addEventListener("drop",e=>{
  document.getElementById("files").files=e.dataTransfer.files;
});
