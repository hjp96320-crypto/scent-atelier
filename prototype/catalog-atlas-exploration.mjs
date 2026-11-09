// Neighbour exploration is an overlay, while an explicit cluster is a filter.
export function applyAtlasScope(items,scope){
 return scope&&scope.kind!=='anchor'?items.filter(p=>scope.ids.has(p.id)):items;
}

export function cameraTransition(previous,next,camera,focusCamera,overview){
 const changed=previous.mode!==next.mode||previous.resetKey!==next.resetKey||previous.records.length!==next.records.length||previous.records.some((r,i)=>r.id!==next.records[i].id);
 if(changed)return {camera:overview,focusCamera:next.anchor?overview:null};
 if(!previous.anchor&&next.anchor)return {camera,focusCamera:camera};
 if(previous.anchor&&!next.anchor)return {camera:focusCamera||overview,focusCamera:null};
 return {camera,focusCamera};
}

export function clusterRegions(index,records=index.records){
 return index.data.clusters.flatMap(cluster=>{
  const data=records.filter(r=>r.cluster===cluster.id),families=new Map();
  if(!data.length)return [];
  const x=data.reduce((s,r)=>s+r.x,0)/data.length,y=data.reduce((s,r)=>s+r.y,0)/data.length;
  let anchor=data[0];
  for(const r of data){const family=r.p.families[0];families.set(family,(families.get(family)||0)+1);if(Math.hypot(r.x-x,r.y-y)<Math.hypot(anchor.x-x,anchor.y-y))anchor=r;}
  return [{...cluster,data,x:anchor.x,y:anchor.y,family:[...families].sort((a,b)=>b[1]-a[1])[0][0]}];
 }).sort((a,b)=>b.data.length-a.data.length||a.id-b.id);
}

// Trim only the camera fit, never the group's membership or plotted coordinates.
export function clusterFocusRecords(records){
 if(records.length<20)return records;
 const xs=records.map(r=>r.x).sort((a,b)=>a-b),ys=records.map(r=>r.y).sort((a,b)=>a-b);
 const lo=Math.floor((records.length-1)*.05),hi=Math.ceil((records.length-1)*.95);
 return records.filter(r=>r.x>=xs[lo]&&r.x<=xs[hi]&&r.y>=ys[lo]&&r.y<=ys[hi]);
}
