export const familyColors={花香:'#c67596',木质:'#98734b',琥珀:'#d6a241',馥奇:'#5a947e',柑橘:'#c6ad38',西普:'#507c64',皮革:'#8d6d5f',果香:'#cc8b74',绿叶:'#80a95f',麝香:'#7999b6',水生:'#589eb5',美食:'#bc965c',辛香:'#ac7452',醛香:'#9d93b6',烟草:'#7c6756'};
export const continentColors={'亚洲':'#c49a4b','欧洲':'#7a9f88','北美洲':'#7e9fc5','南美洲':'#cc8f99','非洲':'#ad8267','大洋洲':'#90a965','跨洲（欧亚）':'#a391bb','其他':'#8f9793'};

export function indexAtlas(data,perfumes){
 const catalog=new Map(perfumes.map(p=>[p.id,p]));
 if(data.population!==perfumes.length||data.rows.length!==data.population)throw new Error('图形数据与当前图鉴版本不一致');
 const records=data.rows.map(([id,x,y,cluster,noteIds,features])=>{
  const p=catalog.get(id);if(!p||!Number.isFinite(x)||!Number.isFinite(y))throw new Error('图形档案缺失或坐标无效');
  const vector=[];let norm=0;
  for(let i=0;i<features.length;i+=2){const v=features[i+1]*data.weights[features[i]];vector.push(features[i],v);norm+=v*v;}
  norm=Math.sqrt(norm);for(let i=1;i<vector.length;i+=2)vector[i]/=norm;
  return {id,p,x,y,cluster,noteIds,notes:noteIds.map(i=>data.notes[i]),vector,signature:features.join(',')};
 });
 const byId=new Map(records.map(r=>[r.id,r]));if(byId.size!==catalog.size)throw new Error('图形档案 ID 重复');
 const identical=new Map();for(const r of records){if(!identical.has(r.signature))identical.set(r.signature,[]);identical.get(r.signature).push(r.id);}
 return {data,records,byId,identical};
}

export function relatedPerfumes(index,id,allowedIds,limit=8){
 const source=index.byId.get(id);if(!source)return [];
 const weights=new Map();for(let i=0;i<source.vector.length;i+=2)weights.set(source.vector[i],source.vector[i+1]);
 const sourceNotes=new Set(source.notes),ranked=[];
 for(const r of index.records){
  if(r.id===id||(allowedIds&&!allowedIds.has(r.id)))continue;
  let score=0;const sharedFeatures=[];
  for(let i=0;i<r.vector.length;i+=2){const w=weights.get(r.vector[i]);if(w){score+=w*r.vector[i+1];sharedFeatures.push(index.data.featureNames[r.vector[i]]);}}
  if(score<=0)continue;
  const common=r.notes.filter(n=>sourceNotes.has(n)),rootOf=n=>index.data.featureParents?.[n]||n;
  const commonRoots=new Set(common.map(rootOf)),sharedRoots=[...new Set(sharedFeatures.map(rootOf))];
  const groupedCommon=sharedRoots.filter(n=>!commonRoots.has(n));
  ranked.push({record:r,score,common,sharedFeatures,groupedCommon,different:r.notes.filter(n=>!sourceNotes.has(n)),
   sourceOnly:source.notes.filter(n=>!r.notes.includes(n)),partial:sharedRoots.length<2||Math.min(source.notes.length,r.notes.length)<3});
 }
 return ranked.sort((a,b)=>b.score-a.score||a.record.id.localeCompare(b.record.id)).slice(0,limit);
}

export function regionStatistics(items){
 const regions=new Map();
 for(const p of items){if(!regions.has(p.region))regions.set(p.region,{region:p.region,count:0,brands:new Set(),families:new Map()});const r=regions.get(p.region);r.count++;r.brands.add(p.brand);for(const f of new Set(p.families))r.families.set(f,(r.families.get(f)||0)+1);}
 return [...regions.values()].map(r=>({...r,brandCount:r.brands.size})).sort((a,b)=>b.count-a.count||a.region.localeCompare(b.region,'zh'));
}

export function regionHeatmap(items,regionOrder,sort='similarity'){
 const order=new Map(regionOrder.map((r,i)=>[r,i]));
 const rows=regionStatistics(items).map(r=>({...r,clustered:order.has(r.region),small:r.count<20,
  cells:Object.keys(familyColors).map(family=>({family,count:r.families.get(family)||0,total:r.count,coverage:(r.families.get(family)||0)/r.count}))}));
 if(sort==='similarity')rows.sort((a,b)=>(order.get(a.region)??Infinity)-(order.get(b.region)??Infinity)||b.count-a.count||a.region.localeCompare(b.region,'zh'));
 return rows;
}

export function extent(records){
 if(!records.length)return {x0:-35,x1:1035,y0:-35,y1:1035};
 let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
 for(const r of records){x0=Math.min(x0,r.x);x1=Math.max(x1,r.x);y0=Math.min(y0,r.y);y1=Math.max(y1,r.y);}
 const dx=Math.max(35,(x1-x0)*.08),dy=Math.max(35,(y1-y0)*.08);
 return {x0:x0-dx,x1:x1+dx,y0:y0-dy,y1:y1+dy};
}
