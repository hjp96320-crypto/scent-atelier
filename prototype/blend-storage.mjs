import {cleanAppearance,isComplete} from './blend-model.mjs?v=20261108-selection-flow';

export function saveFinishedBlend(blend,works,name,persist){
 if(blend.sealed)throw new Error('这瓶作品已经保存。');
 if(!isComplete(blend))throw new Error('请先完成所有基底的注入。');
 const label=typeof name==='string'?name.trim():'';
 if(!label)throw new Error('请为作品取一个名字。');
 if(label.length>24)throw new Error('作品名称最多 24 个字。');
 const draft=structuredClone(blend);
 draft.name=label;
 draft.sealed=true;
 draft.appearance=cleanAppearance(draft.appearance);
 const id=typeof globalThis.crypto?.randomUUID==='function'?globalThis.crypto.randomUUID():`local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
 const work={id,name:label,capacity:draft.capacity,rows:structuredClone(draft.rows),appearance:cleanAppearance(draft.appearance),date:new Date().toISOString()};
 const candidate={draft,works:[work,...structuredClone(works)]};
 if(persist(candidate)===false)throw new Error('浏览器未能保存，请重试。');
 return candidate;
}
