const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function perfumeTooltip(record){
 const p=record.p,notes=(record.notes||p.notesZh||[]).slice(0,3);
 return {
  className:'atlas-perfume-tooltip',
  style:{background:'transparent',color:'#21372f',padding:'0',zIndex:'10',maxWidth:'calc(100% - 24px)',pointerEvents:'none'},
  html:`<div class="atlas-hover-card"><div class="atlas-hover-product"><img src="${esc(p.image)}" alt="" width="72" height="94"><div><small>${esc(p.displayBrand)}</small><strong>${esc(p.displayName)}</strong><p>${esc(p.concentrationZh)}${p.region?' · '+esc(p.region):''}</p></div></div>${notes.length?`<div class="atlas-hover-notes">${notes.map(n=>`<span>${esc(n)}</span>`).join('')}</div>`:''}<p class="atlas-hover-hint">点击圆点，查看香水详情</p></div>`
 };
}

export function tooltipPosition(x,y,width,height){
 const left=Math.max(12,Math.min(x+12>width-284?x-284:x+12,width-284));
 const top=Math.max(12,Math.min(y+12>height-212?y-212:y+12,height-212));
 return {left:(left-x)+'px',top:(top-y)+'px'};
}
