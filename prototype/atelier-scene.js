import {cleanAppearance} from './blend-model.mjs';
let sequence=0;
export const shapes={square:'M278 131H322V158Q322 170 339 178L368 192Q386 200 386 222V352Q386 373 365 373H235Q214 373 214 352V222Q214 200 232 192L261 178Q278 170 278 158Z',round:'M278 131H322V160Q322 171 341 183C425 210 417 369 300 373C183 369 175 210 259 183Q278 171 278 160Z',oval:'M278 131H322V173Q322 184 343 193C441 221 430 365 300 373C170 365 159 221 257 193Q278 184 278 173Z'};
export function createAtelierScene(container){
 const id='bottle-'+(++sequence),root=document.createElement('div');root.style.cssText='height:100%;width:100%';
 root.innerHTML=`<svg viewBox="80 0 460 425" width="100%" height="100%" role="img" aria-label="调香瓶预览"><defs><linearGradient id="${id}-glass"><stop stop-color="#d9e1e7" stop-opacity=".6"/><stop offset=".12" stop-color="#fff" stop-opacity=".9"/><stop offset=".45" stop-color="#fff" stop-opacity=".1"/><stop offset=".9" stop-color="#b6c5ce" stop-opacity=".3"/><stop offset="1" stop-color="#fff"/></linearGradient><linearGradient id="${id}-metal"><stop stop-color="#8c692e"/><stop offset=".3" stop-color="#f8e2a4"/><stop offset=".6" stop-color="#c69b46"/><stop offset=".9" stop-color="#a3782b"/></linearGradient><linearGradient id="${id}-cap"><stop stop-color="#929ba5"/><stop offset=".3" stop-color="#f3f6f9"/><stop offset=".65" stop-color="#b7c0c8"/><stop offset="1" stop-color="#828e9b"/></linearGradient><clipPath id="${id}-clip"><path data-body/></clipPath></defs>
 <ellipse cx="300" cy="385" rx="99" ry="7" fill="#dfe4ea" opacity=".55"/>
 <path data-body fill="url(#${id}-glass)" stroke="#8a98a5" stroke-width="1.5"/>
 <g clip-path="url(#${id}-clip)"><rect data-liquid x="170" y="370" width="260" height="0" fill="#e5b24e" fill-opacity=".55"/><path data-surface fill="none" stroke="#c78d25" stroke-width="1.5"/><path data-inside fill="none" stroke="#c99127" stroke-width="2"/><path data-tube d="M300 130V332Q300 350 282 358" fill="none" stroke="#a8a6a0" stroke-width="2"/><path d="M227 213V340" stroke="white" stroke-width="5" opacity=".8"/>
 <rect x="249" y="265" width="102" height="53" rx="2" fill="#fff" fill-opacity=".8"/><text x="300" y="285" text-anchor="middle" font-family="sans-serif" font-size="8" letter-spacing="2" fill="#5d6672">SCENT ATELIER</text><text data-name x="300" y="304" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#303b48"></text></g>
 <g data-mouth><ellipse cx="300" cy="132" rx="22" ry="5" fill="#f7f9fa" stroke="#8a98a5"/><ellipse cx="300" cy="132" rx="16" ry="2.5" fill="#c3cdd2"/></g>
 <g data-pump><rect x="278" y="115" width="44" height="28" rx="2" fill="url(#${id}-metal)" stroke="#8a7b5b" stroke-width=".8"/><rect x="285" y="86" width="30" height="30" rx="3" fill="url(#${id}-metal)" stroke="#8a7b5b" stroke-width=".8"/><ellipse cx="300" cy="86" rx="14" ry="2" fill="#f3e9d3"/><circle cx="307" cy="98" r="3" fill="#444e58"/></g>
 <g data-cap transform="translate(418 318)"><rect width="42" height="54" rx="4" fill="url(#${id}-cap)" stroke="#8e96a0"/><ellipse cx="21" cy="1" rx="20" ry="4" fill="url(#${id}-cap)"/></g>
 <g data-source style="transform-origin:390px 90px;transition:transform 350ms ease-out"><rect x="378" y="53" width="24" height="12" rx="2" fill="#e5d7b1" stroke="#9e9683"/><rect x="369" y="65" width="42" height="81" rx="7" fill="#fbf7eb" stroke="#a9a491"/><rect x="374" y="106" width="32" height="34" rx="4" fill="#dfbb67" opacity=".6"/><rect x="373" y="83" width="34" height="23" fill="white"/><text x="390" y="98" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#646c75">BASE</text></g>
 <path data-stream d="M345 84Q318 95 300 132" fill="none" stroke="#c99127" stroke-width="2"/>
 </svg>`;
 container.append(root);const q=s=>root.querySelector(s);let state={},frame=0;
 const metal={gold:['#8c692e','#f8e2a4','#c69b46','#a3782b'],silver:['#87939e','#f7fafc','#b8c3cd','#84909d']};
 function colorGradient(name,color){q('#'+id+'-'+name).querySelectorAll('stop').forEach((stop,i)=>stop.setAttribute('stop-color',metal[color][i]));}
 function update(next){state={...state,...next};const a=cleanAppearance(state.appearance),finished=!!(state.finished||state.sealed),ratio=Math.max(0,Math.min(1,state.total/state.capacity||0)),y=370-ratio*175;
 root.querySelectorAll('[data-body]').forEach(p=>p.setAttribute('d',shapes[a.shape]));colorGradient('metal',a.nozzle);colorGradient('cap',a.cap==='none'?'silver':a.cap);
 q('[data-liquid]').setAttribute('y',y);q('[data-liquid]').setAttribute('height',370-y);q('[data-surface]').setAttribute('d',`M170 ${y}H430`);q('[data-surface]').style.opacity=ratio?1:0;
 q('[data-pump]').style.display=finished?'':'none';q('[data-tube]').style.display=finished?'':'none';q('[data-mouth]').style.display=finished?'none':'';q('[data-cap]').style.display=finished&&a.cap!=='none'?'':'none';q('[data-source]').style.display=finished?'none':'';
 q('[data-source]').style.transition=state.reducedMotion?'none':'transform 350ms ease-out';q('[data-source]').style.transform=state.pouring&&!finished?'translate(-38px, 0px) rotate(-105deg)':'none';
 q('[data-stream]').style.opacity=q('[data-inside]').style.opacity=state.pouring&&!finished?'1':'0';q('[data-inside]').setAttribute('d',`M300 132V${y}`);
 q('[data-name]').textContent=Array.from(state.name||'未命名配方').slice(0,12).join('');q('svg').setAttribute('aria-label',`${{square:'方瓶',round:'圆瓶',oval:'扁圆瓶'}[a.shape]}，${finished?(a.nozzle==='gold'?'金色':'银色')+'喷头，'+(a.cap==='none'?'无外盖':a.cap==='gold'?'金色外盖':'银色外盖'):'开口调配'}，已加入${Number((state.total||0).toFixed(1))}mL`);
 if(state.pouring&&!finished){if(!frame)frame=requestAnimationFrame(track);}else{cancelAnimationFrame(frame);frame=0;}
 }
 function track(){frame=0;const transform=new DOMMatrixReadOnly(getComputedStyle(q('[data-source]')).transform),x=390+transform.e+transform.c*(-37),y=90+transform.f+transform.d*(-37);q('[data-stream]').setAttribute('d',`M${x} ${y}Q${(x+300)/2} ${y+25} 300 132`);if(state.pouring)frame=requestAnimationFrame(track);}
 update({total:0,capacity:10});return {update,destroy(){cancelAnimationFrame(frame);root.remove();}};
}
