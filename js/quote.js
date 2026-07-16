const DATA = window.VEDMAN_CATALOG;

const modal=document.getElementById("quoteModal");
const mainCat=document.getElementById("mainCat");
const subCat=document.getElementById("subCat");
const amount=document.getElementById("amount");
let unit="m³";

function fillMain(){
  mainCat.innerHTML='<option value="">Izvēlies</option>'+Object.keys(DATA).map(k=>`<option value="${k}">${k}</option>`).join("");
  updateSub();
}
function updateSub(sel=""){
  const arr=DATA[mainCat.value]||[];
  subCat.innerHTML=arr.length?arr.map(v=>`<option value="${v}">${v}</option>`).join(""):'<option value="">Nav jāizvēlas</option>';
  if(sel) subCat.value=sel;
}
function openQuote(material="",sub="",preferredUnit=""){
  modal.classList.add("open");
  if(material){mainCat.value=material;updateSub(sub);}
  if(preferredUnit){
    unit=preferredUnit;
    document.querySelectorAll(".unit-card").forEach(b=>{
      b.classList.toggle("active",b.dataset.unit===preferredUnit);
    });
  }
  document.body.style.overflow="hidden";
}
function closeQuote(){
  modal.classList.remove("open");
  document.body.style.overflow="";
}

document.querySelectorAll(".js-open,[data-material]").forEach(el=>{
  el.addEventListener("click",()=>openQuote(el.dataset.material||"",el.dataset.sub||""));
});
document.getElementById("closeModal").addEventListener("click",closeQuote);
modal.addEventListener("click",e=>{if(e.target===modal)closeQuote();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeQuote();});
mainCat.addEventListener("change",()=>updateSub());

document.getElementById("plusBtn").addEventListener("click",()=>amount.value=(Math.max(0,(parseFloat(String(amount.value||"0").replace(",", "."))||0)+1)).toFixed(1));
document.getElementById("minusBtn").addEventListener("click",()=>amount.value=(Math.max(0,(parseFloat(String(amount.value||"0").replace(",", "."))||0)-1)).toFixed(1));




function stepAmountFine(delta){
  const cur=parseFloat(String(amount.value||"0").replace(",", "."))||0;
  amount.value=(Math.max(0,cur+delta)).toFixed(1);
}
const finePlus=document.getElementById("finePlus");
const fineMinus=document.getElementById("fineMinus");
if(finePlus)finePlus.addEventListener("click",()=>stepAmountFine(0.1));
if(fineMinus)fineMinus.addEventListener("click",()=>stepAmountFine(-0.1));

document.querySelectorAll(".unit-card").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".unit-card").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    unit=btn.dataset.unit;
  });
});
document.querySelectorAll(".addon").forEach(btn=>btn.addEventListener("click",()=>btn.classList.toggle("active")));

const calcBox=document.getElementById("calcBox");
const calcL=document.getElementById("calcL");
const calcW=document.getElementById("calcW");
const calcD=document.getElementById("calcD");
const calcResult=document.getElementById("calcResult");
document.getElementById("calcToggle").addEventListener("click",()=>calcBox.classList.toggle("open"));

function calcM3(){
  const m3=(parseFloat(calcL.value||"0")||0)*(parseFloat(calcW.value||"0")||0)*((parseFloat(calcD.value||"0")||0)/100);
  calcResult.textContent=m3>0?`Aptuveni: ${m3.toFixed(2)} m³`:"m³ = garums × platums × biezums / 100";
  return m3;
}
[calcL,calcW,calcD].forEach(i=>i.addEventListener("input",calcM3));
document.getElementById("applyCalc").addEventListener("click",()=>{
  const m3=calcM3();
  if(m3>0){
    amount.value=m3.toFixed(2);
    document.querySelectorAll(".unit-card").forEach(b=>b.classList.remove("active"));
    document.querySelector('.unit-card[data-unit="m³"]').classList.add("active");
    unit="m³";
    calcBox.classList.remove("open");
  }
});

document.getElementById("sendBtn").addEventListener("click",()=>{
  const sendBtn=document.getElementById("sendBtn");
  if(sendBtn.disabled)return;

  const material=mainCat.value;
  const sub=subCat.value;
  const address=document.getElementById("address").value.trim();
  const name=document.getElementById("name").value.trim();
  const phone=document.getElementById("phone").value.trim();
  const comment=document.getElementById("comment").value.trim();
  const extras=[...document.querySelectorAll(".addon.active")].map(x=>x.dataset.extra);

  if(!material){alert("Izvēlies materiālu vai pakalpojumu.");return;}

  const msg=`*PASŪTĪJUMS — VEDMAN*

📦 Materiāls / pakalpojums:
${material}${sub?" — "+sub:""}

📏 Daudzums:
${amount.value||"0"} ${unit}

📍 Adrese:
${address||"Nav norādīta"}

⚠ Papildus:
${extras.length?extras.join(", "):"Nav"}

👤 Vārds:
${name||"Nav norādīts"}

📞 Telefons:
${phone||"Nav norādīts"}

📝 Komentārs:
${comment||"Nav"}`;

  const waUrl="https://wa.me/37122312828?text="+encodeURIComponent(msg);
  sendBtn.disabled=true;
  const hint=document.getElementById("waFallback");
  const hintLink=document.getElementById("waFallbackLink");
  if(hintLink)hintLink.href=waUrl;
  if(hint)hint.classList.remove("visible");
  const popup=window.open(waUrl,"_blank");
  if(!popup){
    if(hint)hint.classList.add("visible");
    else if(confirm("Pārlūks bloķēja jaunu logu. Atvērt WhatsApp šajā logā?")){
      window.location.href=waUrl;
    }
  }
  setTimeout(()=>{sendBtn.disabled=false;},2000);
});

fillMain();
