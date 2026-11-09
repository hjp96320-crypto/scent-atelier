const titles={15:'梨香花果方向',19:'晚香玉白花方向',4:'绿茶清新方向'};
const colors=['#467b69','#be7895','#8a78ac','#b29442','#528da1','#ae8060'];
export const groupColor=id=>id<0?'#a9b3ac':colors[id%colors.length];
export const groupTitle=group=>group?titles[group.id]||group.label+'方向':'未形成稳定群组';
export const isGroupMember=(record,group)=>!!record&&(group===null||record.cluster===group);
export function groupClues(index,group,records){
 const root=n=>index.data.featureParents?.[n]||n;
 return (group?.clues||[]).slice(0,3).map(clue=>({label:clue.label,count:records.filter(r=>r.notes.some(n=>root(n)===root(clue.label))).length,total:records.length}));
}
export function localRecords(records,view){
 if(!view)return records;
 const coordinates=new Map(view.points.map(([id,x,y])=>[id,{x,y}]));
 return records.filter(r=>coordinates.has(r.id)).map(r=>({...r,...coordinates.get(r.id)}));
}
// Save only a global camera. Moving between local/group views must not overwrite it.
export function groupCamera(previous,next,camera,saved,overview,target){
 const changed=previous.mode!==next.mode||previous.resetKey!==next.resetKey||previous.records.length!==next.records.length||previous.records.some((r,i)=>r.id!==next.records[i]?.id);
 if(changed)saved=null;
 const from=previous.group??null,to=next.group??null;
 if(from===null&&to!==null)saved=changed?overview:camera;
 if(from!==null&&to===null)return {camera:saved||overview,saved:null};
 if(to!==null&&(from!==to||previous.localView!==next.localView||changed))return {camera:target,saved};
 return {camera,saved};
}
