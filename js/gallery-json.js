async function loadGallery(){
  if(window.loadFirebaseGallery && await window.loadFirebaseGallery()) return;
  const tabs=document.getElementById("galleryTabs");
  const grid=document.getElementById("galleryGrid");
  if(!tabs||!grid)return;
  try{
    const res=await fetch("gallery.json?v=101",{cache:"no-store"});
    const data=await res.json();
    const cats=data.categories||[];
    const items=data.items||[];
    tabs.innerHTML='<button class="gallery-filter active" type="button" data-gallery-filter="all">Visi</button>'+cats.map(c=>`<button class="gallery-filter" type="button" data-gallery-filter="${c.id}">${c.title}</button>`).join("");
    function render(filter="all"){
      const filtered=filter==="all"?items:items.filter(i=>i.category===filter);
      grid.innerHTML=filtered.length?filtered.map(i=>`<article class="gallery-card"><img src="${i.src}" alt="${i.title||''}" loading="lazy"><h3>${i.title||''}</h3><p>${i.description||''}</p></article>`).join(""):'<div class="empty-gallery">Šajā kategorijā vēl nav bilžu.</div>';
    }
    tabs.querySelectorAll(".gallery-filter").forEach(btn=>btn.addEventListener("click",()=>{tabs.querySelectorAll(".gallery-filter").forEach(b=>b.classList.remove("active"));btn.classList.add("active");render(btn.dataset.galleryFilter);}));
    render();
  }catch(e){
    grid.innerHTML='<div class="empty-gallery">Galerijas dati vēl nav pievienoti. Atver admin.html un sagatavo gallery.json.</div>';
  }
}
