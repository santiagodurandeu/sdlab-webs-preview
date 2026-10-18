'use strict';
(() => {
const $ = (q,base=document)=>base.querySelector(q);
const $$ = (q,base=document)=>[...base.querySelectorAll(q)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const projects=[
 {name:'Veterinaria Huellitas',type:'Web Presencia',status:'SITIO PUBLICADO',image:'assets/huellitas-portfolio.webp',url:'https://veterinaria-huellitas-e6w.pages.dev/#inicio'},
 {name:'Fuego Lento',type:'Catálogo / Carta',status:'DEMOSTRACIÓN',image:'assets/fuego-lento-portfolio.webp',url:'https://sdlab.com.ar/demos/fuego-lento/'},
 {name:'Pulso Clima',type:'Web Presencia',status:'DEMOSTRACIÓN',image:'assets/pulso-clima-portfolio.webp',url:'https://sdlab.com.ar/demos/pulso-clima/'},
 {name:'Estudio Riva',type:'Web Presencia',status:'DEMOSTRACIÓN',image:'assets/estudio-riva-portfolio.webp',url:'https://sdlab.com.ar/demos/estudio-riva/'},
 {name:'Mostrador',type:'Catálogo / Carta',status:'DEMOSTRACIÓN',image:'assets/mostrador-portfolio.webp',url:'https://sdlab.com.ar/demos/mostrador/'}
];
// Mobile menu: one open state, no scroll-dependent header transforms.
const menu=$('#menu'),navLinks=$('#nav-links');
function closeMenu(){navLinks?.classList.remove('is-open');menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','Abrir menú')}
menu?.addEventListener('click',()=>{
 const open=menu.getAttribute('aria-expanded')==='true';
 menu.setAttribute('aria-expanded',String(!open));
 menu.setAttribute('aria-label',open?'Abrir menú':'Cerrar menú');
 navLinks.classList.toggle('is-open',!open);
});
addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu()});
addEventListener('resize',()=>{if(innerWidth>760)closeMenu()},{passive:true});
document.addEventListener('click',event=>{if(navLinks?.classList.contains('is-open')&&!event.target.closest('.nav'))closeMenu()});

// One showcased project, two secondary previews, one consistent selection.
const frameImage=$('#browser-image'),frameAddress=$('#browser-address'),frameLink=$('#browser-link');
const prevImage=$('#preview-prev-image'),nextImage=$('#preview-next-image');
const prevName=$('#preview-prev-name'),nextName=$('#preview-next-name');
const index=$('#current-number'),pause=$('#orbit-pause');
let active=0,paused=reduce.matches,visible=true,version=0;
const wrap=index=>((index%projects.length)+projects.length)%projects.length;
function renderProject(nextIndex){
 active=wrap(nextIndex);
 const item=projects[active],prev=projects[wrap(active-1)],next=projects[wrap(active+1)],token=++version;
 index.textContent=String(active+1).padStart(2,'0');
 $('#project-status').textContent=item.status;
 $('#project-caption').textContent=item.name;
 frameAddress.textContent=(item.name+' / '+item.type).toUpperCase();
 frameLink.href=item.url;
 frameLink.setAttribute('aria-label','Visitar '+item.name+' en una pestaña nueva');
 prevImage.src=prev.image;nextImage.src=next.image;
 prevName.textContent=prev.name;nextName.textContent=next.name;
 const badge1=document.createElement('small');badge1.textContent=prev.status;prevName.appendChild(badge1);
 const badge2=document.createElement('small');badge2.textContent=next.status;nextName.appendChild(badge2);
 $('#preview-prev').setAttribute('aria-label','Ver '+prev.name);
 $('#preview-next').setAttribute('aria-label','Ver '+next.name);
 if(frameImage.getAttribute('src')!==item.image){
  frameImage.style.opacity='.45';
  const preload=new Image();
  const done=()=>{if(token!==version)return;frameImage.src=item.image;frameImage.alt='Captura de '+item.name;frameImage.style.opacity='1'};
  preload.onload=done;preload.onerror=done;preload.src=item.image;
 } else {frameImage.alt='Captura de '+item.name;frameImage.style.opacity='1'}
}
function setPaused(value){
 paused=!!value;
 pause.setAttribute('aria-pressed',String(paused));
 pause.setAttribute('aria-label',paused?'Reanudar reproducción automática':'Pausar reproducción automática');
 pause.textContent=paused?'▶':'Ⅱ';
}
function select(index,manual=true){
 renderProject(index);
 if(manual)setPaused(true);
}
$('#orbit-prev').addEventListener('click',()=>select(active-1));
$('#orbit-next').addEventListener('click',()=>select(active+1));
$('#preview-prev').addEventListener('click',()=>select(active-1));
$('#preview-next').addEventListener('click',()=>select(active+1));
pause.addEventListener('click',()=>setPaused(!paused));
renderProject(0);
setPaused(reduce.matches);
reduce.addEventListener?.('change',()=>{if(reduce.matches)setPaused(true)});
if('IntersectionObserver'in window){
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting},{rootMargin:'80px'}).observe($('.hero-stage'));
}
const AUTO_MS=7000;
const autoTimer=setInterval(()=>{if(!paused&&visible&&!document.hidden)renderProject(active+1)},AUTO_MS);
addEventListener('pagehide',()=>clearInterval(autoTimer),{once:true});

// Restrained ambient starfield. Static under reduced-motion and offscreen.
const canvas=$('#universe'),ctx=canvas?.getContext('2d',{alpha:true});
let stars=[],cw=0,ch=0,lastStar=0,starFrame=0,starVisible=true,mouseX=0,mouseY=0;
function rng(){let seed=123975;return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
function resizeCanvas(){
 if(!ctx)return;
 cw=canvas.clientWidth;ch=canvas.clientHeight;
 const dpi=Math.min(devicePixelRatio||1,2);canvas.width=Math.ceil(cw*dpi);canvas.height=Math.ceil(ch*dpi);ctx.setTransform(dpi,0,0,dpi,0,0);
 const rand=rng();stars=Array.from({length:innerWidth<760?72:140},()=>({x:rand()*cw,y:rand()*ch,r:rand()*1.15+.2,alpha:rand()*.52+.12,depth:rand(),phase:rand()*6.28}));
}
function starTick(t){
 starFrame=0;
 if(!ctx)return;
 if(t-lastStar>36){
  lastStar=t;ctx.clearRect(0,0,cw,ch);
  for(const s of stars){
   ctx.beginPath();ctx.arc(s.x+mouseX*s.depth,s.y+mouseY*s.depth,s.r,0,Math.PI*2);
   ctx.fillStyle='rgba(165,219,255,'+(s.alpha+(reduce.matches?0:Math.sin(t*.001+s.phase)*.08))+')';ctx.fill();
  }
 }
 if(!reduce.matches)startStars();
}
function startStars(){if(!ctx||starFrame||reduce.matches||!starVisible||document.hidden)return;starFrame=requestAnimationFrame(starTick)}
function stopStars(){if(starFrame)cancelAnimationFrame(starFrame);starFrame=0}
if(ctx){
 resizeCanvas();requestAnimationFrame(starTick);
 addEventListener('resize',()=>{resizeCanvas();requestAnimationFrame(starTick)},{passive:true});
 addEventListener('pointermove',e=>{mouseX=(e.clientX/Math.max(innerWidth,1)-.5)*16;mouseY=(e.clientY/Math.max(innerHeight,1)-.5)*11},{passive:true});
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{starVisible=entries[0].isIntersecting;starVisible?startStars():stopStars()}).observe($('.hero'));
 addEventListener('visibilitychange',()=>document.hidden?stopStars():startStars());
 reduce.addEventListener?.('change',()=>{if(reduce.matches){stopStars();requestAnimationFrame(starTick)}else startStars()});
}

// Contact links prepare editable messages, with no persistence or automatic send.
const nameInput=$('#contact-name'),detailsInput=$('#contact-details'),linkWA=$('#contact-wa'),linkEmail=$('#contact-email');
function prepareContact(){
 const selection=$('input[name="project"]:checked')?.value||'orientacion';
 const description={presencia:'Web Presencia',catalogo:'Catálogo / Carta',orientacion:'una web para mi negocio'}[selection];
 let msg='Hola SD LAB, quisiera consultar por '+description+'.';
 if(nameInput.value.trim())msg+='\nNombre o negocio: '+nameInput.value.trim();
 if(detailsInput.value.trim())msg+='\nMi idea: '+detailsInput.value.trim();
 linkWA.href='https://wa.me/5491126174410?text='+encodeURIComponent(msg);
 linkEmail.href='mailto:contacto@sdlab.com.ar?subject='+encodeURIComponent('Consulta web · SD LAB')+'&body='+encodeURIComponent(msg);
}
$$('input[name="project"]').forEach(r=>r.addEventListener('change',prepareContact));
nameInput.addEventListener('input',prepareContact);
detailsInput.addEventListener('input',prepareContact);
$$('[data-plan]').forEach(a=>a.addEventListener('click',()=>{
 const radio=$('input[name="project"][value="'+a.dataset.plan+'"]');
 if(radio){radio.checked=true;prepareContact()}
}));
prepareContact();

// Static header: route directly to useful section content with a small breathing margin.
const routes={'#top':'.hero','#trabajos':'.projects-head','#servicios':'.section-head','#contacto':'.contact-layout','#main':'#main'};
function route(hash,behavior='smooth'){
 const target=$(routes[hash]);if(!target)return;
 const top=hash==='#top'||hash==='#main'?0:Math.max(0,scrollY+target.getBoundingClientRect().top-24);
 scrollTo({top,behavior});
}
document.addEventListener('click',e=>{
 const a=e.target.closest('a[href^="#"]');
 if(!a||a.classList.contains('skip'))return;
 const hash=a.getAttribute('href');
 if(!routes[hash])return;
 e.preventDefault();closeMenu();if(e.detail)a.blur();
 if(location.hash!==hash)history.pushState(null,'',hash);
 route(hash,reduce.matches?'instant':'smooth');
});
addEventListener('popstate',()=>route(location.hash||'#top','instant'));
addEventListener('hashchange',()=>route(location.hash||'#top','instant'));
addEventListener('load',()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{if(routes[location.hash])route(location.hash,'instant')})));
})();
