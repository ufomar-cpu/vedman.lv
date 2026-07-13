import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

window.loadFirebaseGallery = async function(){
  const tabs=document.getElementById("galleryTabs");
  const grid=document.getElementById("galleryGrid");
  if(!tabs||!grid)return false;
  if(!window.VEDMAN_FIREBASE_READY)return false;
  try{
    const app=initializeApp(window.VEDMAN_FIREBASE_CONFIG);
    const db=getFirestore(app);
    const q=query(collection(db,"gallery"), orderBy("createdAt","desc"));
    const snap=await getDocs(q);
    const items=[];
    snap.forEach(doc=>items.push(doc.data()));
    if(!items.length)return false;

    const cats=[["all","Visi"],["skembas","Šķembas"],["grants","Grants"],["smilts","Smilts"],["melnzeme","Melnzeme"],["betons","Betons"],["manipulators","Manipulators"],["zemes-darbi","Zemes darbi"],["koku-serviss","Koku serviss"],["objekti","Objekti"],["video","Video"]];
    tabs.innerHTML=cats.map((c,i)=>`<button class="gallery-filter ${i===0?"active":""}" type="button" data-gallery-filter="${c[0]}">${c[1]}</button>`).join("");
    function render(filter="all"){
      const filtered=filter==="all"?items:items.filter(i=>i.category===filter);
      grid.innerHTML=filtered.length?filtered.map(i=>{
        const isVideo=(i.type||"").startsWith("video") || (i.url||"").match(/\\.mp4($|\\?)/i) || (i.url||"").match(/\\.mov($|\\?)/i);
        return `<article class="gallery-card">${isVideo?`<video src="${i.url}" controls preload="metadata"></video>`:`<img src="${i.url}" alt="${i.title||''}" loading="lazy">`}<h3>${i.title||''}</h3><p>${i.description||''}</p></article>`;
      }).join(""):'<div class="empty-gallery">Šajā kategorijā vēl nav bilžu.</div>';
    }
    tabs.querySelectorAll(".gallery-filter").forEach(btn=>btn.addEventListener("click",()=>{tabs.querySelectorAll(".gallery-filter").forEach(b=>b.classList.remove("active"));btn.classList.add("active");render(btn.dataset.galleryFilter);}));
    render();
    return true;
  }catch(e){
    console.warn("Firebase gallery fallback:", e);
    return false;
  }
}

if (typeof loadGallery === "function") {
  loadGallery();
}
