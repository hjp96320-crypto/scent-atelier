import {perfumeTooltip,tooltipPosition} from './catalog-atlas-tooltip.mjs?v=20261109-daily-preview';
import {densityGrid} from './catalog-atlas-density.mjs?v=20261109-clusters';
import {clusterRegions,cameraTransition} from './catalog-atlas-exploration.mjs?v=20261109-group-drilldown';
import {familyColors,continentColors,regionStatistics,extent} from './catalog-atlas-model.mjs';
import {countryBounds} from './catalog-atlas-geography.mjs';
import {groupColor,groupTitle,isGroupMember,localRecords,groupCamera} from './catalog-atlas-groups.mjs';

const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const palette=Object.fromEntries(Object.entries(familyColors).map(([key,value])=>[key,rgb(value)]));

export function normalizeCamera(previous,next){
 // OrthographicController returns a pair after dragging an independently fitted
 // X/Y view. Keep a scalar zoom for controls, while retaining both axis scales.
 return {...previous,...next,zoom:Array.isArray(next.zoom)?Math.min(...next.zoom):next.zoom};
}

export function createAtlasRenderer({host,labels,world,admin1,index,continentByRegion,onSelect,onCandidates,onRegion,onCity,onCamera,onGroups,onGroup,onSubgroup,onError}){
 const D=window.deck;
 let state={mode:'star',records:[],ownedIds:new Set(),selected:'',colorBy:'family',mapMetric:'brands',anchor:null,highlightIds:new Set()},camera,focusCamera=null,deck,groupData=[],pointData=[],heatmaps=[],baseZoom=0,dead=false,ready=false;
 let focusedGroup=null,groupSignature='',groupEntryCamera=null,localPositions=new Map();
 const position=r=>localPositions.get(r.id)||[r.x,r.y];
 const interactive=r=>isGroupMember(r,focusedGroup)&&(!state.memberIds||state.memberIds.has(r.id));
 const color=r=>state.colorBy==='groups'?rgb(groupColor(r.cluster)):state.colorBy==='region'?rgb(continentColors[continentByRegion.get(r.p.region)]||'#8f9793'):palette[r.p.families[0]];
 function buildDensity(){
  heatmaps=[];
  for(const g of groupData){
   const grid=densityGrid(g.data.map(position),192);if(!grid)continue;
   const canvas=document.createElement('canvas');canvas.width=canvas.height=grid.size;
   const ctx=canvas.getContext('2d'),image=ctx.createImageData(grid.size,grid.size),color=state.colorBy==='groups'?rgb(groupColor(g.id)):palette[g.family];
   for(let y=0;y<grid.size;y++)for(let x=0;x<grid.size;x++){
    const v=grid.values[y*grid.size+x]/grid.max,i=((grid.size-1-y)*grid.size+x)*4;
    for(let c=0;c<3;c++)image.data[i+c]=color[c];
    image.data[i+3]=Math.round(72*Math.pow(v,.65));
   }
   ctx.putImageData(image,0,0);heatmaps.push({id:g.id,image:canvas,bounds:grid.bounds});
  }
 }
 function fit(items=state.records){
  if(state.mode==='map'){
   const overview={longitude:10,latitude:23,zoom:Math.log2(Math.max(230,host.clientWidth)/560),minZoom:-1.5,maxZoom:9,pitch:0,bearing:0};
   const city=state.geography?.cities.find(c=>c.id===state.city);
   const bounds=countryBounds(world.features.find(f=>f.properties.name===state.region),state.geography?.cities.map(c=>c.position)||[]);
   if(!bounds)return overview;
   const fitted=new D.WebMercatorViewport({width:host.clientWidth,height:host.clientHeight}).fitBounds(bounds,{padding:host.clientWidth<500?48:72,maxZoom:7});
   return {...overview,longitude:city?.position[0]??fitted.longitude,latitude:city?.position[1]??fitted.latitude,zoom:city?Math.min(7,Math.max(fitted.zoom+1,5.5)):fitted.zoom};
  }
  const b=extent(items.map(r=>{const [x,y]=position(r);return {x,y};}));
  const zoomX=Math.log2(Math.max(180,host.clientWidth-40)/(b.x1-b.x0)),zoomY=Math.log2(Math.max(200,host.clientHeight-56)/(b.y1-b.y0)),zoom=Math.min(zoomX,zoomY);
  return {target:[(b.x0+b.x1)/2,(b.y0+b.y1)/2,0],zoom,minZoom:-4,maxZoom:6};
 }
 function updateLabels(){
  if(dead||!ready||!deck?.getViewports().length)return;
  const viewport=deck.getViewports()[0],placed=[],w=host.clientWidth,h=host.clientHeight;
  const limit=(w<500?4:8)+Math.max(0,Math.floor((camera.zoom-baseZoom)*2));let count=0;
  for(const el of labels.children){
   const p=el.dataset.record?position(index.byId.get(el.dataset.record)):[Number(el.dataset.x),Number(el.dataset.y)];
   const [x,y]=viewport.project(p),width=Number(el.dataset.width)||130,height=44;
   if(state.mode==='map'||el.dataset.subgroup!==undefined){
    const options=[{x0:x-width/2-5,x1:x+width/2+5,y0:y-height-17,y1:y-7,side:'above'},{x0:x-width/2-5,x1:x+width/2+5,y0:y+7,y1:y+height+17,side:'below'},{x0:x-width-17,x1:x-7,y0:y-height/2-5,y1:y+height/2+5,side:'left'},{x0:x+7,x1:x+width+17,y0:y-height/2-5,y1:y+height/2+5,side:'right'}];
    const chosen=options.find(b=>b.x0>=6&&b.x1<=w-6&&b.y0>=6&&b.y1<=h-6&&!placed.some(a=>b.x0<a.x1&&b.x1>a.x0&&b.y0<a.y1&&b.y1>a.y0));
    el.hidden=!chosen;if(chosen){placed.push(chosen);el.dataset.side=chosen.side;}
    el.style.left=x+'px';el.style.top=y+'px';continue;
   }
   const box={x0:x-width/2-5,x1:x+width/2+5,y0:y-height/2-5,y1:y+height/2+5};
   const overlaps=placed.some(b=>box.x0<b.x1&&box.x1>b.x0&&box.y0<b.y1&&box.y1>b.y0);
   el.hidden=box.x0<8||box.x1>w-8||box.y0<8||box.y1>h-8||(!el.dataset.record&&(overlaps||count>=limit));
   if(!el.hidden){placed.push(box);if(!el.dataset.record)count++;}
   el.style.left=x+'px';el.style.top=y+'px';
  }
  const visible=[...labels.children].filter(el=>!el.hidden&&el.dataset.cluster!==undefined).map(el=>Number(el.dataset.cluster));
  const signature=JSON.stringify([visible,focusedGroup,groupData.map(g=>g.data.length)]);
  if(signature!==groupSignature){groupSignature=signature;onGroups?.(visible.map(id=>{const g=groupData.find(g=>g.id===id);return {id,label:groupTitle(g),count:g.data.length};}),focusedGroup);}
  host.dataset.camera=JSON.stringify(camera);onCamera?.(camera);
 }
 function buildLabels(){
  labels.replaceChildren();
  if(state.mode==='map'){
   if(!state.region)return;
   for(const city of [...(state.geography?.cities||[])].sort((a,b)=>Number(b.id===state.city)-Number(a.id===state.city))){
    const el=document.createElement('button');el.type='button';el.className='atlas-city-label';el.dataset.city=city.id;el.dataset.x=city.position[0];el.dataset.y=city.position[1];
    el.setAttribute('aria-pressed',city.id===state.city);el.setAttribute('aria-label',`${city.name}，${city.brands.length}个品牌，查看城市`);
    const name=document.createElement('strong'),count=document.createElement('small');name.textContent=city.name;count.textContent=city.brands.length;el.append(name,count);
    el.onclick=()=>onCity(city.id);labels.append(el);
   }
   for(const el of labels.children)el.dataset.width=el.offsetWidth;
   return;
  }
  if(state.selected&&focusedGroup===null){const r=index.byId.get(state.selected),el=document.createElement('span');el.className='atlas-point-label';el.dataset.record=r.id;el.textContent=r.p.displayName;labels.append(el);}
  if(state.localView){
   for(const [i,g] of state.localView.subgroups.entries()){
    const members=pointData.filter(r=>g.ids.includes(r.id));if(!members.length)continue;
    const center=members.reduce((s,r)=>{const p=position(r);return [s[0]+p[0]/members.length,s[1]+p[1]/members.length];},[0,0]);
    const el=document.createElement('button');el.type='button';el.className='atlas-city-label';el.dataset.x=center[0];el.dataset.y=center[1];el.dataset.subgroup=i;
    el.setAttribute('aria-pressed',state.subgroup===i);el.textContent=g.label+' · '+members.length;el.onclick=()=>onSubgroup(i);labels.append(el);
   }
   return;
  }
  for(const g of [...groupData].sort((a,b)=>Number(b.id===focusedGroup)-Number(a.id===focusedGroup))){
   if(g.data.length<20&&g.id!==focusedGroup)continue;
   const el=document.createElement('button');el.type='button';el.className='atlas-cluster-label';el.dataset.cluster=g.id;el.dataset.x=g.x;el.dataset.y=g.y;
   el.setAttribute('aria-pressed',g.id===focusedGroup);
   el.style.setProperty('--cluster-color',state.colorBy==='groups'?groupColor(g.id):familyColors[g.family]);
   const name=document.createElement('strong'),count=document.createElement('small');name.textContent=groupTitle(g);count.textContent=g.data.length.toLocaleString('zh-CN')+' 条';el.append(name,count);
   el.setAttribute('aria-label',`定位${g.label}香调群组，${g.data.length}条档案`);
   el.onclick=()=>{onGroup(g.id);host.focus({preventScroll:true});};labels.append(el);
  }
  for(const el of labels.children)el.dataset.width=el.offsetWidth;
 }
 function renderLayers(){
  if(!deck||dead)return;
  let layers=[];
  if(state.mode==='star'){
   const detail=Math.max(0,Math.min(1,(camera.zoom-baseZoom)/2)),focused=!!state.anchor;
   const coordinateSystem=D.COORDINATE_SYSTEM.CARTESIAN;
   if(!state.localView&&state.colorBy!=='region')for(const g of heatmaps){
    layers.push(new D.BitmapLayer({id:'density-'+g.id,image:g.image,bounds:g.bounds,coordinateSystem,opacity:focusedGroup!==null&&g.id!==focusedGroup?.08:focused?.35:.7}));
   }
   layers.push(new D.ScatterplotLayer({id:'perfumes',data:pointData,coordinateSystem,getPosition:position,
    getFillColor:r=>[...(r.cluster<0?[146,162,152]:color(r)),Math.round((r.cluster<0?30:175)*(focused?.55:1)*(focusedGroup!==null?.12:1))],getRadius:r=>(r.cluster<0?.75:1.05)+detail*1.2,radiusUnits:'pixels',pickable:focusedGroup===null,
    updateTriggers:{getFillColor:[state.colorBy,focused,focusedGroup],getRadius:detail}}));
   layers.push(new D.ScatterplotLayer({id:'group-members',data:pointData.filter(r=>focusedGroup!==null&&interactive(r)),coordinateSystem,getPosition:position,getFillColor:[44,110,84,220],getRadius:state.localView?4:2.8,radiusUnits:'pixels',stroked:true,getLineColor:[255,255,255],getLineWidth:.7,lineWidthUnits:'pixels',pickable:true}));
   layers.push(new D.ScatterplotLayer({id:'neighbors',data:pointData.filter(r=>interactive(r)&&state.highlightIds.has(r.id)),coordinateSystem,getPosition:position,getFillColor:[30,102,75,240],getRadius:3.6,radiusUnits:'pixels',stroked:true,getLineColor:[255,255,255],getLineWidth:1,lineWidthUnits:'pixels',pickable:true}));
   layers.push(new D.ScatterplotLayer({id:'owned',data:pointData.filter(r=>interactive(r)&&state.ownedIds.has(r.id)),coordinateSystem,getPosition:position,getRadius:5,radiusUnits:'pixels',getFillColor:[255,255,255],stroked:true,getLineColor:[40,86,71],getLineWidth:2,lineWidthUnits:'pixels',pickable:true}));
   const source=pointData.find(r=>r.id===state.selected&&interactive(r));
   layers.push(new D.ScatterplotLayer({id:'selection',data:source?[source]:[],coordinateSystem,getPosition:position,getRadius:8,radiusUnits:'pixels',getFillColor:[255,255,255],stroked:true,getLineColor:[23,78,60],getLineWidth:3,lineWidthUnits:'pixels',pickable:true}));
  }else{
   const stats=regionStatistics(state.records.map(r=>r.p)),byName=new Map(stats.map(r=>[r.region,r])),value=r=>state.mapMetric==='brands'?r.brandCount:r.count,max=Math.max(1,...stats.map(value));
   const region=state.region,feature=world.features.find(f=>f.properties.name===region);
   layers=[new D.GeoJsonLayer({id:'countries',data:world,pickable:true,stroked:true,filled:true,getLineColor:[190,203,196],getLineWidth:.8,lineWidthUnits:'pixels',getFillColor:f=>{if(region)return f.properties.name===region?[234,239,225]:[244,246,241];const r=byName.get(f.properties.name);if(!r)return [241,244,237];const t=Math.sqrt(value(r)/max);return [219,231,210].map((v,i)=>Math.round(v+([57,105,83][i]-v)*t));},updateTriggers:{getFillColor:[state.records,state.mapMetric,region]},autoHighlight:true,highlightColor:[159,191,164,130]})];
   if(feature){
    layers.push(new D.GeoJsonLayer({id:'domestic-boundaries',data:admin1.features.filter(f=>f.properties.iso===feature.properties.iso),pickable:false,stroked:true,filled:false,getLineColor:[173,190,170,140],getLineWidth:.7,lineWidthUnits:'pixels'}));
    layers.push(new D.GeoJsonLayer({id:'selected-country',data:feature,pickable:false,stroked:true,filled:false,getLineColor:[88,123,94],getLineWidth:1.3,lineWidthUnits:'pixels'}));
    layers.push(new D.ScatterplotLayer({id:'brand-cities',data:state.geography?.cities||[],getPosition:c=>c.position,getRadius:c=>c.id===state.city?9:6,radiusUnits:'pixels',stroked:true,getFillColor:[35,86,63],getLineColor:[255,255,255],getLineWidth:2,lineWidthUnits:'pixels',pickable:true,updateTriggers:{getRadius:state.city}}));
   }
  }
  deck.setProps({layers});
 }
 function click(info){
  if(!info.object)return;
  if(state.mode==='map'){if(info.layer?.id==='brand-cities'){onCity(info.object.id);return;}const name=info.object.properties.name;if(index.records.some(r=>r.p.region===name))onRegion(name);return;}
  if(!interactive(info.object))return;
  if(['owned','selection','neighbors'].includes(info.layer?.id)){onSelect(info.object.id);return;}
  const viewport=deck.getViewports()[0],near=[];
  for(const r of pointData){if(!interactive(r))continue;const [x,y]=viewport.project(position(r));if(Math.hypot(info.x-x,info.y-y)<=8)near.push(r);}
  if(near.length>1)onCandidates(near);else onSelect(info.object.id);
 }
 camera=fit();
 deck=new D.Deck({parent:host,width:'100%',height:'100%',views:new D.OrthographicView({id:'scent',flipY:false}),viewState:camera,
  controller:{dragPan:true,scrollZoom:true,touchZoom:true,multiTouchDrag:'pan',dragRotate:false,doubleClickZoom:false,keyboard:false},touchAction:'none',useDevicePixels:Math.min(window.devicePixelRatio||1,2),pickingRadius:10,
  getCursor:({isDragging,isHovering})=>isDragging?'grabbing':isHovering?'pointer':'grab',
  onViewStateChange:({viewState})=>{camera=normalizeCamera(camera,viewState);deck.setProps({viewState:camera});renderLayers();updateLabels();},onLoad:()=>{ready=true;updateLabels();},onAfterRender:updateLabels,onClick:click,
  getTooltip:info=>{if(!info.object)return null;if(state.mode==='star'){if(!interactive(info.object))return null;if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches)return null;const card=perfumeTooltip(info.object);return {...card,style:{...card.style,...tooltipPosition(info.x,info.y,host.clientWidth,host.clientHeight)}};}const mapTooltip=text=>({text,className:'deck-tooltip',style:{left:'0px',top:'0px',background:'#29323c',color:'#a0a7b4',padding:'10px',maxWidth:'none',zIndex:'1'}});if(info.layer?.id==='brand-cities')return mapTooltip(`${info.object.name} · ${info.object.brands.length} 个品牌\n点击查看品牌与香水`);const name=info.object.properties.name,r=regionStatistics(state.records.map(r=>r.p)).find(r=>r.region===name);return mapTooltip(r?`${name}\n${r.brandCount} 个品牌 · ${r.count} 条档案`:`${name} · ${index.records.some(r=>r.p.region===name)?'点击切换地区':'暂未收录'}`);},
  onError:error=>{if(!dead)onError(error);}
 });
 return {
  update(next){
   const previous=state,rebuild=next.records.length!==state.records.length||next.records.some((r,i)=>r.id!==state.records[i]?.id);
   state={...state,...next};pointData=localRecords(state.records,state.localView);
   localPositions=new Map(state.localView?.points.map(([id,x,y])=>[id,[x,y]])||[]);
   focusedGroup=state.group??null;
   if(rebuild||previous.localView!==state.localView||previous.colorBy!==state.colorBy){groupData=clusterRegions(index,pointData);buildDensity();}
   const overview=fit(state.localView?pointData:state.records),mapChanged=previous.mode!==state.mode||previous.region!==state.region||previous.city!==state.city||previous.resetKey!==state.resetKey;
   if(state.mode==='map'){
    if(mapChanged)camera={...overview,...(previous.mode==='map'&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches?{transitionDuration:650,transitionInterpolator:new D.FlyToInterpolator()}:{} )};
    focusCamera=null;groupEntryCamera=null;
   }else{
    if(state.anchor&&state.anchor!==previous.anchor&&previous.localView)camera=groupEntryCamera||overview;
    const transition=cameraTransition(previous,state,camera,focusCamera,overview);camera=transition.camera;focusCamera=transition.focusCamera;
    const target=focusedGroup===null?overview:fit(pointData.filter(interactive));
    const grouped=groupCamera(previous,state,camera,groupEntryCamera,overview,target);groupEntryCamera=grouped.saved;
    if(!(state.anchor&&state.anchor!==previous.anchor)){
     const changedCamera=grouped.camera!==camera;camera=grouped.camera;
     if(changedCamera&&!state.localView&&!previous.localView&&state.group!==null&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)camera={...camera,transitionDuration:650,transitionInterpolator:new D.LinearInterpolator({transitionProps:['target','zoom']})};
    }
    if(state.subgroup!==previous.subgroup&&state.localView)camera=target;
   }
   if(rebuild||previous.mode!==state.mode)baseZoom=state.mode==='star'?overview.zoom:0;
   host.dataset.records=pointData.length;host.dataset.interactiveRecords=pointData.filter(interactive).length;host.dataset.localView=state.localView?.id??'';host.dataset.highlighted=pointData.filter(r=>state.highlightIds.has(r.id)).length;
   deck.setProps({views:state.mode==='star'?new D.OrthographicView({id:'scent',flipY:false}):new D.MapView({id:'world',repeat:false}),viewState:camera});
   buildLabels();renderLayers();updateLabels();
  },
  zoom(action){if(action==='fit'){camera=fit();buildLabels();}else{const zoom=Math.max(camera.minZoom,Math.min(camera.maxZoom,camera.zoom+(action==='in'?.6:-.6)));const delta=zoom-camera.zoom;camera={...camera,zoom,...(state.mode==='star'?{zoomX:(camera.zoomX??camera.zoom)+delta,zoomY:(camera.zoomY??camera.zoom)+delta}:{})};}deck.setProps({viewState:camera});renderLayers();updateLabels();},
  pan(dx,dy){if(state.mode==='star'){camera={...camera,target:[camera.target[0]+dx/2**(camera.zoomX??camera.zoom),camera.target[1]+dy/2**(camera.zoomY??camera.zoom),0]};}else{const viewport=deck.getViewports()[0],[longitude,latitude]=viewport.unproject([host.clientWidth/2+dx,host.clientHeight/2-dy]);camera={...camera,longitude,latitude};}deck.setProps({viewState:camera});updateLabels();},
  locate(id){if(state.mode!=='star')return;const p=position(index.byId.get(id)),viewport=ready?deck.getViewports()[0]:null;if(viewport){const [x,y]=viewport.project(p);if(x>24&&x<host.clientWidth-24&&y>24&&y<host.clientHeight-24)return;}camera={...camera,target:[...p,0]};deck.setProps({viewState:camera});updateLabels();},
  resize(){if(state.mode==='map')camera=fit();else if(focusedGroup!==null)camera=fit(pointData.filter(interactive));deck.setProps({width:'100%',height:'100%',viewState:camera});buildLabels();updateLabels();},
  destroy(){dead=true;deck.finalize();labels.replaceChildren();}
 };
}
