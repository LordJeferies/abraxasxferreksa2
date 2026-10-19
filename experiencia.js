'use strict';
(() => {
 const $=s=>document.querySelector(s);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const slider = $('#comparison-range');
 function compare(value) {
  const v=Math.max(0,Math.min(100,Number(value)));
  slider.value=String(v);
  $('#room-comparison').style.setProperty('--comparison', `${v}%`);
  slider.setAttribute('aria-valuetext', `${v}% de la imagen renovada visible`);
 }
 slider.addEventListener('input', () => compare(slider.value));
 document.querySelectorAll('[data-compare]').forEach(b => b.addEventListener('click', () => compare(b.dataset.compare)));
 let estimate = null;
 const fields = ['#paint-area','#paint-coats','#paint-coverage','#paint-margin'].map($);
 function invalidate() { estimate=null;$('#paint-result').hidden=true;$('#paint-status').textContent=''; }
 fields.forEach(el=>el.addEventListener('input',invalidate));
 $('#paint-form').addEventListener('submit',event=>{
  event.preventDefault();
  if (!$('#paint-form').reportValidity()) return;
  const [area,coats,coverage,margin]=fields.map(el=>Number(el.value));
  if(![area,coats,coverage,margin].every(Number.isFinite)||area<=0||coverage<=0||!Number.isInteger(coats)||coats<1||margin<0){$('#paint-status').textContent='Comprueba las medidas y el rendimiento introducidos.';return;}
  const liters = Math.ceil((area*coats/coverage*(1+margin/100)-1e-10)*10)/10;
  estimate={area,coats,coverage,margin,liters};
  const fmt=n=>n.toLocaleString('es-VE',{maximumFractionDigits:2});
  $('#paint-liters').textContent=`${fmt(liters)} L`;
  $('#paint-formula').textContent=`${fmt(area)} m² × ${coats} manos ÷ ${fmt(coverage)} m²/L + ${fmt(margin)}% de margen.`;
  $('#paint-result').hidden=false;
  $('#paint-status').textContent='Estimación calculada. Puedes añadirla a tu lista para consultar.';
 });
 $('#add-paint-estimate').addEventListener('click',()=>{
  if(!estimate)return;
  const e=estimate;
  const line=`Estimación de pintura: ${e.liters.toLocaleString('es-VE')} L para ${e.area} m², ${e.coats} manos, rendimiento introducido ${e.coverage} m²/L por mano y margen ${e.margin}%. Confirmar producto, cantidad y envases.`;
  const box=$('#materials');
  if(!box.value.includes(line)){
   const next=box.value.trim()+(box.value.trim()?'\n\n':'')+line;
   if(next.length>box.maxLength){$('#paint-status').textContent='Tu lista está llena. Copia la estimación o reduce el texto de materiales.';return;}
   box.value=next;box.dispatchEvent(new Event('input',{bubbles:true}));
  }
  $('#project-type').value='Remodelación';$('#project-type').dispatchEvent(new Event('input',{bubbles:true}));
  $('#paint-status').textContent='Estimación añadida a tu cotización.';
  $('#cotizar').scrollIntoView({behavior:reduced.matches?'instant':'smooth'});
  box.focus({preventScroll:true});
 });
 if('IntersectionObserver' in window){const quoteObserver=new IntersectionObserver(entries=>{document.body.classList.toggle('quote-active',entries[0].isIntersecting);},{threshold:0});quoteObserver.observe($('#cotizar'));}
 const navLinks=[...document.querySelectorAll('#main-nav a')];
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
   for(const entry of entries){
    if(entry.isIntersecting){navLinks.forEach(link=>{if(link.hash===`#${entry.target.id}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}
   }
  },{rootMargin:'-15% 0px -55% 0px',threshold:0});
  navLinks.forEach(link=>{const section=document.querySelector(link.hash);if(section)observer.observe(section);});
 }
})();
