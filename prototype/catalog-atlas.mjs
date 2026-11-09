import {groupTitle,groupClues,isGroupMember} from './catalog-atlas-groups.mjs';
import {indexAtlas,relatedPerfumes,regionStatistics,regionHeatmap,familyColors,continentColors} from './catalog-atlas-model.mjs';
import {createAtlasRenderer} from './catalog-atlas-renderer.mjs?v=20261109-all-groups';
import {brandGeography} from './catalog-atlas-geography.mjs';
import {compareVersions} from './catalog-versions.mjs';
import {regionGroups} from './catalog-filter-groups.mjs';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={plus:'M12 5v14M5 12h14',minus:'M5 12h14',fit:'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5',close:'m6 6 12 12M6 18 18 6',arrow:'M5 12h14m-5-5 5 5-5 5',chevron:'m7 14 5-5 5 5'};
const icon=name=>`<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]}"/></svg>`;
const fetchJSON=async url=>{const response=await fetch(url);if(!response.ok)throw new Error('无法加载图形数据');return response.json();};
let assetPromise;
function loadAssets(){
 if(!assetPromise)assetPromise=Promise.all([
  fetchJSON('assets/atlas/atlas-data.json'),fetchJSON('assets/atlas/world.json'),fetchJSON('assets/atlas/brand-locations.json'),fetchJSON('assets/atlas/admin1.json'),fetchJSON('assets/atlas/local-groups.json?v=20261109-all-groups'),
  ...['deck-gl-9.4.1.min.js'].map(file=>new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='vendor/'+file;script.onload=resolve;script.onerror=()=>{script.remove();reject(new Error('无法加载图形组件'));};document.head.append(script);}))
 ]).catch(error=>{assetPromise=null;throw error;});
 return assetPromise;
}

export function createCatalogAtlas({root,perfumes,onDetail,onCompare,onFilter,onScope,onReset,onExplore,initialMode='star'}){
 let disposed=false,index,worldData,chart,observer,mode=initialMode,found=perfumes,records=[],allowedIds=new Set(),filters={};
 let selected='',expanded=false,related=false,candidates=[],candidatePage=1;
 let showList=false,listPage=1,colorBy='groups',mapMetric='brands';
 let showHeatmap=false,heatMetric='coverage',heatSort='similarity',ownedIds=new Set();
 let visibleGroups=[],focusedGroup=null,groupPage=1,localData,localView=null,subgroup=null;
 let locations,admin1,mapCity='',mapBrand='',geography;
 const groups=regionGroups([...new Set(perfumes.map(p=>p.region))]);
 const continentByRegion=new Map(groups.flatMap(g=>g.values.map(r=>[r,g.label])));
 const $=selector=>root.querySelector(selector);
 const format=n=>n.toLocaleString('zh-CN');
 const valid=()=>!disposed&&root.isConnected;
 const tagList=notes=>notes.map(n=>`<span class="atlas-note">${esc(n)}</span>`).join('');

 function shell(){
  root.innerHTML=`<div class="atlas-toolbar"><button class="secondary" id="atlas-options-toggle" aria-expanded="false">图形选项</button><div class="atlas-star-options"><label>着色<select id="atlas-color"><option value="groups">按群组归属</option><option value="family">按香型</option><option value="region">按洲分组</option></select></label><label>香调群组<select id="atlas-cluster"><option value="">全部档案</option>${index.data.clusters.map(c=>`<option value="${c.id}">${esc(c.label)} · ${c.count} 条</option>`).join('')}<option value="-1">未形成稳定群组</option></select></label></div><div class="atlas-map-options" hidden><label>地图统计<select id="atlas-metric"><option value="brands">品牌数</option><option value="records">档案数</option></select></label></div><button class="secondary" id="atlas-list-toggle" aria-expanded="false" aria-controls="atlas-results">查看结果列表</button></div>
  <div class="atlas-continents" role="group" aria-label="按洲探索" hidden>${['',...groups.map(g=>g.label)].map(label=>`<button class="chip" data-atlas-continent="${esc(label)}" aria-pressed="false">${label||'全球'}</button>`).join('')}</div>
  <div class="atlas-layout"><section class="atlas-chart-panel" aria-label="图形探索"><div class="atlas-chart-heading"><h2 id="atlas-title">香气星图</h2><span id="atlas-point-count"></span></div><div class="atlas-chart-wrap"><div id="atlas-chart" tabindex="0" role="img" aria-label="香气星图，可通过下方结果列表选择每个档案"></div><div id="atlas-cluster-labels" class="atlas-cluster-labels"></div><div class="atlas-chart-empty" hidden><h3>这里暂时没有香水</h3><p>减少筛选条件，继续探索。</p><button class="secondary" data-atlas-reset>清除筛选</button></div><div class="atlas-zoom" aria-label="缩放图形"><button data-atlas-zoom="fit" aria-label="适合当前结果">${icon('fit')}</button><button data-atlas-zoom="in" aria-label="放大">${icon('plus')}</button><button data-atlas-zoom="out" aria-label="缩小">${icon('minus')}</button></div></div><div class="atlas-chart-footer"><span id="atlas-gesture-hint">拖动平移 · 滚轮或双指缩放 · 点选查看</span></div><div id="atlas-legend" class="atlas-legend"></div></section><aside id="atlas-inspector" class="atlas-inspector" aria-label="所选香水与探索建议"></aside></div>
  <section id="atlas-results" class="atlas-results" aria-labelledby="atlas-results-title" hidden></section>
  <details class="atlas-method"><summary>这张图如何帮助选香？</summary><p>每个点是一条真实档案，位置按已列香调与香型的关系排列。图中名称来自已验证的 33 个香调群组，缩放后逐步显示；未形成稳定群组的档案也保留在背景中。深浅只辅助观察图上的疏密，不表示气味强度。点“从这瓶出发”会高亮相近档案，保留全图背景和位置；取消高亮后恢复进入探索前的视角。</p><p>布局使用 75% 香调特征与 25% 香型标签；这是模型权重，不是香料配比。稳定群组只保留两次聚类一致的核心，其余档案正常展示。完整的气味还需实际试闻。</p><p>地图按档案中的品牌国家／地区统计，表示本库收录情况，不代表生产地、原料产地或市场规模。底图：Natural Earth。</p></details>`;
  $('.atlas-map-options').insertAdjacentHTML('beforeend','<button class="secondary" id="atlas-heat-toggle" aria-expanded="false" aria-controls="atlas-heatmap">地区 × 香型</button>');
  $('.atlas-chart-heading').insertAdjacentHTML('afterend','<nav id="atlas-map-nav" class="atlas-map-nav" aria-label="地图探索路径" hidden></nav>');
  $('.atlas-chart-heading').insertAdjacentHTML('afterend','<nav id="atlas-star-nav" class="atlas-map-nav" aria-label="香调群组探索路径" hidden></nav>');
  $('#atlas-results').insertAdjacentHTML('afterend','<section id="atlas-heatmap" class="atlas-heatmap" hidden aria-labelledby="atlas-heat-title"></section>');
  root.onclick=handleClick;
  $('#atlas-color').onchange=e=>{colorBy=e.target.value;draw();};
  $('#atlas-cluster').onchange=e=>openGroup(e.target.value===''?null:Number(e.target.value));
  $('#atlas-metric').onchange=e=>{mapMetric=e.target.value;draw();};
  $('#atlas-chart').onkeydown=e=>{
   if(['+','=','-','0'].includes(e.key)){e.preventDefault();zoom(e.key==='0'?'fit':e.key==='-'?'out':'in');}
   if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();chart.pan(e.key==='ArrowLeft'?-70:e.key==='ArrowRight'?70:0,e.key==='ArrowUp'?70:e.key==='ArrowDown'?-70:0);}
  };
  initChart();
  observer=new ResizeObserver(()=>{if(!valid()||!chart)return;chart.resize();});observer.observe($('#atlas-chart'));
 }

 function initChart(){
  chart?.destroy();chart=createAtlasRenderer({host:$('#atlas-chart'),labels:$('#atlas-cluster-labels'),world:worldData,admin1,index,continentByRegion,
   onSelect:id=>select(id),onCandidates:openCandidates,onGroup:openGroup,onSubgroup:openSubgroup,onRegion:openRegion,onCity:openCity,onCamera:camera=>{root.dataset.viewport=JSON.stringify(camera);},
   onGroups:groups=>{visibleGroups=groups;if(mode==='star')drawStar();},
   onError:()=>{if(!valid())return;$('#atlas-gesture-hint').textContent='当前设备无法绘制图形，请使用结果列表继续浏览。';showList=true;renderList();}
  });
 }

 function draw(){
  if(!valid()||!index||!chart)return;
  const started=performance.now();
  geography=brandGeography(found,locations);
  if(mapCity&&!geography.cities.some(c=>c.id===mapCity))mapCity='';
  if(mapBrand&&!geography.brands.some(b=>b.brand===mapBrand))mapBrand='';
  root.dataset.view=mode;root.dataset.interactive=true;
  $('.atlas-star-options').hidden=mode!=='star';$('.atlas-map-options').hidden=mode!=='map';$('.atlas-continents').hidden=mode!=='map';
  $('.atlas-chart-empty').hidden=found.length>0;$('#atlas-title').textContent=mode==='star'?(localView?'本组内部视图':'香气分布'):'品牌地图';
  const highlighted=records.filter(r=>filters.highlightIds?.has(r.id)).length;
  $('#atlas-point-count').textContent=(localView?format(groupRecords().length)+' / '+format(records.filter(r=>r.cluster===focusedGroup).length)+' 款组内香水':format(found.length)+' 条档案')+(filters.anchor?' · 高亮 '+highlighted+' 条':'');
  $('.atlas-chart-empty h3').textContent=filters.ownedOnly&&!ownedIds.size?'香柜里还没有香水':'这里暂时没有香水';
  $('.atlas-chart-empty p').textContent=filters.ownedOnly&&!ownedIds.size?'先到图鉴打开喜欢的香水，将它加入香柜。':'减少筛选条件，继续探索。';
  $('#atlas-cluster').value=focusedGroup??'';
  const groupCounts=new Map();for(const r of records)groupCounts.set(r.cluster,(groupCounts.get(r.cluster)||0)+1);
  for(const option of $('#atlas-cluster').options){if(option.value!==''){const id=Number(option.value),count=groupCounts.get(id)||0;option.disabled=!count;option.textContent=(id===-1?'未形成稳定群组':groupTitle(index.data.clusters.find(g=>g.id===id)))+' · '+format(count)+' 条'+(localData.groups.some(g=>g.id===id&&g.available)?' · 可展开':'');}}
  for(const b of root.querySelectorAll('[data-atlas-continent]'))b.setAttribute('aria-pressed',b.dataset.atlasContinent===(filters.continent||''));
  $('#atlas-chart').setAttribute('aria-label',mode==='star'?'可拖动的香气分布图。加减号缩放，方向键移动，0 适合当前结果；所有档案可用结果列表选择。':'品牌地理地图。点选国家自动缩放，点选城市查看品牌；加减号缩放，方向键平移，0 适合当前地区，也可用列表操作。');
  chart.update({mode,records,ownedIds,selected,group:focusedGroup,localView,subgroup,memberIds:focusedGroup===null?null:new Set(groupRecords().map(r=>r.id)),colorBy,mapMetric,region:filters.region,city:mapCity,geography,anchor:filters.anchor,highlightIds:filters.highlightIds||new Set(),resetKey:filters.resetKey});
  $('#atlas-map-nav').hidden=mode!=='map';$('#atlas-star-nav').hidden=mode!=='star'||focusedGroup===null;
  if(mode==='star')drawStar();else drawMap();
  renderInspector();renderList();renderHeatmap();
  root.dataset.renderMs=(performance.now()-started).toFixed(1);
 }

 function groupName(){return groupTitle(index.data.clusters.find(g=>g.id===focusedGroup));}
 function groupRecords(){const ids=subgroup===null?null:new Set(localView?.subgroups[subgroup]?.ids||[]);return records.filter(r=>isGroupMember(r,focusedGroup)&&(!ids||ids.has(r.id)));}
 function openSubgroup(id){subgroup=id;selected='';candidates=[];groupPage=1;listPage=1;draw();}
 function toggleLocal(){localView=localView?null:localData.groups.find(g=>g.id===focusedGroup&&g.available);subgroup=null;selected='';candidates=[];groupPage=1;draw();}
 function openGroup(id){
  if(id!==null&&!records.some(r=>r.cluster===id))return;
  focusedGroup=id;localView=null;subgroup=null;groupPage=1;listPage=1;selected='';candidates=[];expanded=false;related=false;draw();
 }
 function groupExplanation(){
  const all=records.filter(r=>r.cluster===focusedGroup),group=index.data.clusters.find(g=>g.id===focusedGroup),pilot=localData.groups.find(g=>g.id===focusedGroup);
  const clues=groupClues(index,group,all);
  return `<details class="atlas-group-evidence"><summary>本组气味线索与覆盖</summary><p>名称概括代表气味，并非每款都含有所有线索。</p>${clues.map(c=>`<div><span>${esc(c.label)}</span><strong>${c.count} / ${c.total}</strong><meter min="0" max="${c.total}" value="${c.count}" aria-label="${esc(c.label)}覆盖 ${c.count} / ${c.total}"></meter></div>`).join('')}<small>按资料中同类香调统计，不代表香料浓度。</small></details>${pilot?.available?`<button class="secondary atlas-local-toggle" data-atlas-local>${localView?'返回本组全局分布':'展开本组内部视图'}</button>`:pilot?'<p class="atlas-local-note">此组暂用全局分布浏览，完整成员见下方列表。</p>':''}${localView?`<p class="atlas-local-note">仅比较本组香水 · 全部成员保留。${localView.subgroups.length?'二级分类保留跨次计算一致、且香调有差异的核心；其余成员仍在本组。':'尚无足够稳定的二级分类，按成员直接探索。'}</p><div class="atlas-subgroups"><button class="chip" data-atlas-subgroup="" aria-pressed="${subgroup===null}">本组全部 ${all.length}</button>${localView.subgroups.map((g,i)=>`<button class="chip" data-atlas-subgroup="${i}" aria-pressed="${subgroup===i}">${esc(g.label)} · ${all.filter(r=>g.ids.includes(r.id)).length}</button>`).join('')}</div>`:''}`;
 }
 function drawStar(){
  $('#atlas-gesture-hint').textContent=localView?'仅比较本组香水 · 拖动与缩放 · 点选查看':'拖动平移 · 滚轮或双指缩放 · 点选查看';
  $('#atlas-star-nav').innerHTML=focusedGroup===null?'':`<button data-atlas-group-reset>全部香气</button><span aria-hidden="true">/</span><span aria-current="page">${esc(groupName())}${localView?" / 组内视图":""}${subgroup===null?"":" / "+esc(localView.subgroups[subgroup].label)}</span><button class="atlas-map-level" data-atlas-group-list>查看本组 ${format(groupRecords().length)} 款香水 →</button>`;
  if(localView){$('#atlas-legend').innerHTML=`<div class="atlas-group-heading"><strong>${localView.subgroups.length?'本组二级分类':'本组完整成员'}</strong><button class="text-button" data-atlas-group-reset>返回全图</button></div><div class="atlas-subgroups"><button class="chip" data-atlas-subgroup="" aria-pressed="${subgroup===null}">本组全部</button>${localView.subgroups.map((g,i)=>`<button class="chip" data-atlas-subgroup="${i}" aria-pressed="${subgroup===i}">${esc(g.label)}</button>`).join('')}</div><small>仅比较本组香水；偏离主体的点仍保留为本组成员。二维距离不是气味强度，返回全图恢复原先视角。</small>`;return;}
  const ownedCount=records.filter(r=>ownedIds.has(r.id)).length;
  $('#atlas-legend').innerHTML=`<div class="atlas-group-heading"><strong>图中香调群组</strong><button class="text-button" data-atlas-group-reset>返回全图</button></div><div class="atlas-group-nav" aria-label="定位图中香调群组">${visibleGroups.map(g=>`<button data-atlas-group="${g.id}" aria-pressed="${g.id===focusedGroup}" aria-label="定位${esc(g.label)}，${g.count}条档案"><span>${esc(g.label)}</span><small>${format(g.count)}</small></button>`).join('')||'<span>移动或缩小图形，查看群组名称。</span>'}</div>${ownedCount?`<span><i class="atlas-owned-ring" aria-hidden="true"></i>我的香柜 · ${ownedCount} 条</span>`:''}${colorBy==='region'?`<div class="atlas-region-key">${Object.entries(continentColors).map(([label,color])=>`<span><i style="--swatch:${color}" aria-hidden="true"></i>${esc(label)}</span>`).join('')}</div>`:''}<small>${localView?'仅比较本组香水，位置独立展开；返回全图恢复原先视角。':focusedGroup!==null?'深绿圆点与右侧列表属于同一组；淡色背景不能点选。返回全图可继续探索其他香水。':'与图内同名标签对应，点击定位并突出该组香水。'}${filters.anchor?'深绿圆点为本次相近香水。':''}</small>`;
 }
 function drawMap(){
  const stats=regionStatistics(found);
  const city=geography.cities.find(c=>c.id===mapCity);
  $('#atlas-title').textContent=filters.region?`${filters.region} · 品牌足迹`:'品牌地图';
  $('#atlas-map-nav').innerHTML=`<button data-atlas-region-back ${!filters.region?'aria-current="page"':''}>世界</button>${filters.region?`<span aria-hidden="true">/</span><button data-atlas-country ${!city?'aria-current="page"':''}>${esc(filters.region)}</button>`:''}${city?`<span aria-hidden="true">/</span><span aria-current="page">${esc(city.name)}</span>`:''}<span class="atlas-map-level">${filters.region?'点选城市 · 数字为品牌数':'点选国家，放大探索'}</span>`;
  $('#atlas-legend').innerHTML=filters.region?`<div class="atlas-map-key"><i aria-hidden="true"></i><span>${geography.located} 个品牌已定位至 ${geography.cities.length} 座城市</span></div><small>按品牌创立地、总部或工坊定位至城市；点位不代表门店地址。${geography.unlocated.length?`另有 ${geography.unlocated.length} 个品牌暂未定位到城市。`:''}</small>`:`<div class="atlas-map-scale"><span>少</span><i></i><span>多 · ${mapMetric==='brands'?'品牌数':'档案数'}</span></div><small>${format(stats.reduce((s,r)=>s+r.brandCount,0))} 个品牌 · ${stats.length} 个国家／地区；${geography.located} 个品牌已有城市位置。</small>`;
  $('#atlas-legend').insertAdjacentHTML('beforeend','<small class="atlas-map-attribution">底图 Natural Earth · 城市坐标 <a href="https://www.geonames.org/" target="_blank" rel="noreferrer">GeoNames</a>（CC BY 4.0）</small>');
 }
 function zoom(action){if(action==='fit'&&mode==='star'&&focusedGroup!==null)openGroup(null);else chart.zoom(action);}
 function openRegion(region){
  selected='';candidates=[];expanded=false;mapCity='';mapBrand='';onFilter('region',region);
  $('#atlas-chart').focus({preventScroll:true});
  if(window.innerWidth<=760)$('#atlas-chart').scrollIntoView({block:'center'});
 }
 function openCity(id){mapCity=id;mapBrand='';listPage=1;draw();$('#atlas-region-title')?.focus({preventScroll:true});if(window.innerWidth<=760)$('#atlas-inspector').scrollIntoView({block:'start'});}
 function mapRecords(){const city=geography?.cities.find(c=>c.id===mapCity),brands=city?new Set(city.brands.map(b=>b.brand)):null;return records.filter(r=>(!mapBrand||r.p.brand===mapBrand)&&(!brands||brands.has(r.p.brand)));}
 function brandMarkup(b){return `<button class="atlas-result atlas-brand-result" data-atlas-brand="${esc(b.brand)}"><img src="${esc(b.items[0].image)}" alt="" width="52" height="64" loading="lazy"><span><strong>${esc(b.name)}</strong><small>${esc(b.location?b.location.city+' · '+b.location.basis:'暂未定位到城市')} · ${b.items.length} 款</small></span>${icon('arrow')}</button>`;}
 function openCandidates(items){candidates=[...new Map(items.filter(r=>groupRecords().some(m=>m.id===r.id)).map(r=>[r.id,r])).values()];candidatePage=1;selected='';expanded=true;related=false;draw();$('#atlas-selection-title')?.focus({preventScroll:true});}
 function select(id,focus=false){
  if(!allowedIds.has(id)||(mode==='star'&&!groupRecords().some(r=>r.id===id)))return;selected=id;candidates=[];related=false;expanded=false;
  chart.locate(id);
  draw();if(focus)$('#atlas-selection-title')?.focus({preventScroll:true});
 }
 function rowMarkup(r){return `<button class="atlas-result" data-atlas-select="${esc(r.id)}"><img src="${esc(r.p.image)}" alt="" width="52" height="64" loading="lazy"><span><strong>${esc(r.p.displayName)}</strong><small>${esc(r.p.displayBrand)} · ${esc(r.p.concentrationZh)}</small></span>${icon('arrow')}</button>`;}
 function inspectorControls(){return `<div class="atlas-sheet-controls"><button id="atlas-expand" class="text-button" aria-expanded="${expanded}" aria-label="${expanded?'收起':'展开'}香水详情">${icon('chevron')}<span>${expanded?'收起详情':'展开详情'}</span></button><button class="icon-button" data-atlas-close aria-label="关闭所选香水">${icon('close')}</button></div>`;}

 function renderInspector(){
  const panel=$('#atlas-inspector');panel.classList.toggle('has-selection',!!selected||candidates.length>0);panel.classList.toggle('expanded',expanded);root.classList.toggle('has-selection',!!selected||candidates.length>0);
  if(candidates.length){const pages=Math.ceil(candidates.length/12);panel.innerHTML=`${inspectorControls()}<div class="atlas-panel-content"><h2 id="atlas-selection-title" tabindex="-1">这里有 ${candidates.length} 条档案</h2><p>选择具体香水与版本。</p>${candidates.slice((candidatePage-1)*12,candidatePage*12).map(rowMarkup).join('')}<div class="atlas-pages"><button class="secondary" data-atlas-candidate-page="-1" ${candidatePage===1?'disabled':''}>上一页</button><span>${candidatePage} / ${pages}</span><button class="secondary" data-atlas-candidate-page="1" ${candidatePage===pages?'disabled':''}>下一页</button></div></div>`;bindSheet();return;}
  const r=index.byId.get(selected);
  if(r){
   const same=index.identical.get(r.signature).filter(id=>allowedIds.has(id));
   const neighbors=related?relatedPerfumes(index,r.id,allowedIds,8):[];
   panel.innerHTML=`${inspectorControls()}<div class="atlas-panel-content"><div class="atlas-selected-product"><img src="${esc(r.p.image)}" alt="${esc(r.p.displayBrand+' '+r.p.displayName+' '+r.p.concentrationZh)}" width="240" height="260"><div><p>${esc(r.p.displayBrand)}</p><h2 id="atlas-selection-title" tabindex="-1">${esc(r.p.displayName)}</h2><p>${esc(r.p.concentrationZh)} · ${esc(r.p.region)}</p><div class="atlas-notes">${tagList(r.notes.slice(0,3))}</div></div></div><button class="primary atlas-related" data-atlas-related>探索相近香气 ${icon('arrow')}</button><div class="atlas-expanded-content"><h3>这瓶的气味线索</h3><div class="atlas-notes">${tagList(r.notes)}</div>${r.notes.length<=2?'<p class="atlas-caution">这条资料仅列出少量香调，比较只能反映部分线索。</p>':''}<button class="secondary" data-atlas-detail="${esc(r.id)}">查看完整档案与穿香建议</button>${same.length>1?`<button class="text-button" data-atlas-identical>查看 ${same.length} 条香调集合相同的档案</button>`:''}${related?`<section class="atlas-related-list"><h3>当前筛选中的相近线索</h3><p>按已列香调比较，和屏幕距离分别计算。</p>${neighbors.length?neighbors.map(n=>`<div class="atlas-neighbor">${rowMarkup(n.record)}<p><strong>${n.partial?'部分线索相交':'共同线索'}</strong> · ${esc([...n.common,...n.groupedCommon.map(label=>label+'（同类线索）')].slice(0,4).join('、'))}</p><p>对方另有 · ${esc(n.different.slice(0,4).join('、')||'未列出其他香调')}</p></div>`).join(''):'<p>当前筛选中没有其他共享香调的档案。试试放宽筛选。</p>'}</section>`:''}</div></div>`;
   $('.atlas-expanded-content').insertAdjacentHTML('afterbegin',`<button class="secondary" data-atlas-anchor aria-pressed="${filters.anchor===r.id}">${filters.anchor===r.id?'取消相近高亮':'在星图中高亮相近香气'}</button>${compareVersions(perfumes,r.id)?'<button class="secondary" data-atlas-compare>对比同系列版本</button>':''}`);
   if(mode==='star'&&focusedGroup!==null)$('.atlas-panel-content').insertAdjacentHTML('afterbegin',`<button class="text-button atlas-group-back" data-atlas-group-back>← 返回${esc(groupName())}列表</button>`);
   bindSheet();return;
  }
  if(mode==='map'){
   if(filters.region){
    const city=geography.cities.find(c=>c.id===mapCity),brand=geography.brands.find(b=>b.brand===mapBrand),items=mapRecords();
    const back=brand?'data-atlas-brand-back':city?'data-atlas-country':'data-atlas-region-back';
    let content='';
    if(brand)content=`<p class="atlas-place-basis">${esc(brand.location?brand.location.city+' · '+brand.location.basis:'暂未定位到城市')}</p>${items.slice(0,8).map(rowMarkup).join('')}`;
    else if(city)content=`<p class="atlas-place-basis">${esc(city.region)} · 城市内品牌</p>${city.brands.map(brandMarkup).join('')}`;
    else content=`<div class="atlas-place-stats"><span><strong>${geography.cities.length}</strong>座已定位城市</span><span><strong>${geography.located}<small> / ${geography.brands.length}</small></strong>品牌已定位</span></div><h3>城市里的香气</h3>${geography.cities.map(c=>`<button class="atlas-city-row" data-atlas-city="${c.id}"><span class="atlas-city-dot" aria-hidden="true"></span><span><strong>${esc(c.name)}</strong><small>${esc(c.brands.slice(0,2).map(b=>b.name).join('、'))}${c.brands.length>2?'等':''}</small></span><span class="atlas-city-count">${c.brands.length}<small>品牌</small></span>${icon('arrow')}</button>`).join('')||'<p>这个地区尚无已核实的城市位置，可以先从下方品牌探索。</p>'}${geography.unlocated.length?`<details class="atlas-unlocated"><summary>暂未定位到城市 · ${geography.unlocated.length} 个品牌</summary>${geography.unlocated.map(brandMarkup).join('')}</details>`:''}`;
    panel.innerHTML=`<div class="atlas-panel-content atlas-region-detail"><button class="text-button" ${back}>← ${brand?'返回品牌列表':city?'返回国家分布':'返回世界地图'}</button><h2 id="atlas-region-title" tabindex="-1">${esc(brand?.name||city?.name||filters.region)}</h2><p>${brand?'':`${city?.brands.length??geography.brands.length} 个品牌 · `}${format(items.length)} 款香水</p>${content}<button class="secondary atlas-region-all" data-atlas-region-results>浏览全部 ${format(items.length)} 款香水 ${icon('arrow')}</button></div>`;
    return;
   }
   const stats=regionStatistics(found).sort((a,b)=>(mapMetric==='brands'?b.brandCount-a.brandCount:b.count-a.count)||a.region.localeCompare(b.region,'zh'));
   panel.innerHTML=`<div class="atlas-panel-content"><h2 id="atlas-region-title" tabindex="-1">从一个地区开始</h2><p>选择地区，继续看品牌与香水。</p><div class="atlas-region-list">${stats.map(r=>`<button data-atlas-region="${esc(r.region)}"><strong>${esc(r.region)}</strong><span>${r.brandCount} 个品牌<small>${format(r.count)} 条档案</small></span>${icon('arrow')}</button>`).join('')||'<p>当前筛选下没有地区结果。</p>'}</div></div>`;
  }else if(focusedGroup!==null){
   const items=groupRecords(),pages=Math.max(1,Math.ceil(items.length/6));groupPage=Math.min(groupPage,pages);
   panel.innerHTML=`<div class="atlas-panel-content atlas-group-detail"><button class="text-button atlas-group-back" data-atlas-group-reset>← 返回全部香气</button><h2 id="atlas-group-title" tabindex="-1">${esc(subgroup===null?groupName():localView.subgroups[subgroup].label)}</h2><p>${format(items.length)} 款香水 · ${subgroup===null?'当前筛选中的完整成员':'本子群完整成员'}</p>${groupExplanation()}<div class="atlas-group-list">${items.slice((groupPage-1)*6,groupPage*6).map(rowMarkup).join('')}</div><div class="atlas-pages"><button class="secondary" data-atlas-group-page="-1" ${groupPage===1?'disabled':''}>上一页</button><span aria-live="polite">${groupPage} / ${pages}</span><button class="secondary" data-atlas-group-page="1" ${groupPage===pages?'disabled':''}>下一页</button></div><button class="text-button atlas-group-back" data-atlas-region-results>浏览全部 ${format(items.length)} 款 →</button></div>`;
  }else{
   const starting=['hf-3123','dior-sauvage-edt','chanel-coco-mademoiselle-edp'].map(id=>index.byId.get(id)).filter(r=>r&&allowedIds.has(r.id));
   panel.innerHTML=`<div class="atlas-panel-content"><h2>从熟悉的一瓶出发</h2><p>点选图中的香水，看它与其他档案共有的气味线索。</p>${(starting.length?starting:records.slice(0,3)).map(rowMarkup).join('')}<p class="atlas-small">颜色辅助区分${colorBy==='groups'?'香调群组归属；中性色为未形成稳定归属的档案':colorBy==='family'?'档案首个香型标签':'洲分组'}，不是香气强度。可用上方搜索定位你熟悉的名字。</p></div>`;
  }
 }
 function bindSheet(){
  const handle=$('#atlas-expand');if(!handle)return;let y=null;
  handle.onpointerdown=e=>{y=e.clientY;handle.setPointerCapture(e.pointerId);};
  handle.onpointerup=e=>{if(y!==null&&Math.abs(e.clientY-y)>30){expanded=e.clientY<y;renderInspector();}y=null;};
  handle.onpointercancel=()=>y=null;
 }
 function renderList(){
  const records=mode==='map'?mapRecords():groupRecords();
  const el=$('#atlas-results');el.hidden=!showList;$('#atlas-list-toggle').setAttribute('aria-expanded',showList);$('#atlas-list-toggle').textContent=showList?'收起结果列表':'查看结果列表';if(!showList)return;
  const pages=Math.max(1,Math.ceil(records.length/24));listPage=Math.min(listPage,pages);
  el.innerHTML=`<div class="atlas-list-heading"><h2 id="atlas-results-title" tabindex="-1">${format(records.length)} 条结果</h2><span>第 ${listPage} / ${pages} 页</span></div><div class="atlas-result-grid">${records.slice((listPage-1)*24,listPage*24).map(rowMarkup).join('')||'<p>没有符合条件的档案。</p>'}</div><div class="atlas-pages"><button class="secondary" data-atlas-page="-1" ${listPage===1?'disabled':''}>上一页</button><label>页码<input id="atlas-list-page" type="number" min="1" max="${pages}" value="${listPage}"></label><button class="secondary" data-atlas-go>跳转</button><span>/ ${pages}</span><button class="secondary" data-atlas-page="1" ${listPage===pages?'disabled':''}>下一页</button></div>`;
  $('#atlas-list-page').onkeydown=e=>{if(e.key==='Enter')root.querySelector('[data-atlas-go]').click();};
 }
 function renderHeatmap(){
  const panel=$('#atlas-heatmap');panel.hidden=mode!=='map'||!showHeatmap;$('#atlas-heat-toggle').setAttribute('aria-expanded',showHeatmap);if(panel.hidden)return;
  const rows=regionHeatmap(found,index.data.regionOrder,heatSort),families=Object.keys(familyColors);
  const max=heatMetric==='coverage'?1:Math.max(1,...rows.flatMap(r=>r.cells.map(c=>c.count)));
  panel.innerHTML=`<div class="atlas-heat-heading"><div><h2 id="atlas-heat-title">地区与香型</h2><p>看看当前收录的香气分布。</p></div><div class="atlas-heat-controls"><label>显示<select id="atlas-heat-metric"><option value="coverage">地区内覆盖率</option><option value="count">档案数量</option></select></label><label>排列<select id="atlas-heat-sort"><option value="similarity">按全库香型相近排序</option><option value="count">按当前档案数排序</option></select></label></div></div><p class="atlas-heat-explanation">分母是当前筛选中各地区的档案数，一款可属于多个香型，行内覆盖率合计可超过 100%。点选色块，同时筛选该地区与香型。左右滚动可查看全部香型。</p><div class="atlas-heat-scale"><span>0${heatMetric==='coverage'?'%':''}</span>${[0,1,2,3,4].map(level=>`<i data-level="${level}" aria-hidden="true"></i>`).join('')}<span>${heatMetric==='coverage'?'100%':format(max)+' 条'}</span></div>${rows.length?`<div class="atlas-heat-scroll"><table><caption>当前 ${format(found.length)} 条档案 · ${rows.length} 个地区。方向键移动单元格，回车选择；表格可横向滚动。</caption><thead><tr><th scope="col">国家／地区</th>${families.map(f=>`<th scope="col">${esc(f)}</th>`).join('')}</tr></thead><tbody>${rows.map((r,i)=>`<tr><th scope="row">${esc(r.region)}<small>${format(r.count)} 条${r.small?' · 小样本':''}</small>${!r.clustered?'<small>未参与全库排序</small>':''}</th>${r.cells.map((c,j)=>{const value=heatMetric==='coverage'?c.coverage:c.count,level=value===0?0:Math.min(4,Math.ceil(value/max*4));return `<td><button data-heat-region="${esc(r.region)}" data-heat-family="${esc(c.family)}" data-heat-row="${i}" data-heat-col="${j}" data-level="${level}" tabindex="${i===0&&j===0?0:-1}" aria-label="${esc(r.region+'，'+c.family)}，${c.count} / ${c.total} 条，覆盖率 ${(c.coverage*100).toFixed(1)}%">${heatMetric==='coverage'?(c.coverage*100).toFixed(1)+'%':format(c.count)}</button></td>`;}).join('')}</tr>`).join('')}</tbody></table></div>`:'<p>当前筛选下没有可比较的地区。清除筛选后再看看。</p>'}<p class="atlas-heat-explanation">相近排序使用全库香型覆盖率的层次聚类，筛选时保留顺序。全库少于 20 条的 15 个地区不参与聚类，列在末尾；“小样本”表示本次筛选下少于 20 条。颜色和排序不代表当地消费者偏好。</p>`;
  $('#atlas-heat-metric').value=heatMetric;$('#atlas-heat-sort').value=heatSort;
  $('#atlas-heat-metric').onchange=e=>{heatMetric=e.target.value;renderHeatmap();$('#atlas-heat-metric').focus({preventScroll:true});};
  $('#atlas-heat-sort').onchange=e=>{heatSort=e.target.value;renderHeatmap();$('#atlas-heat-sort').focus({preventScroll:true});};
  panel.onkeydown=e=>{const b=e.target.closest('[data-heat-row]');if(!b||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();let row=Number(b.dataset.heatRow),col=Number(b.dataset.heatCol);if(e.key==='ArrowUp')row--;if(e.key==='ArrowDown')row++;if(e.key==='ArrowLeft')col--;if(e.key==='ArrowRight')col++;if(e.key==='Home')col=0;if(e.key==='End')col=families.length-1;const next=panel.querySelector(`[data-heat-row="${Math.max(0,Math.min(rows.length-1,row))}"][data-heat-col="${Math.max(0,Math.min(families.length-1,col))}"]`);b.tabIndex=-1;next.tabIndex=0;next.focus();};
 }
 function handleClick(e){
  const b=e.target.closest('button');if(!b||!root.contains(b))return;
  if(b.hasAttribute('data-atlas-local')){toggleLocal();return;}
  if(b.dataset.atlasSubgroup!==undefined){openSubgroup(b.dataset.atlasSubgroup===''?null:Number(b.dataset.atlasSubgroup));return;}
  if(b.hasAttribute('data-atlas-group-reset')){openGroup(null);$('[data-atlas-group-reset]').focus({preventScroll:true});if(window.innerWidth<=760)$('.atlas-chart-panel').scrollIntoView({block:'start'});return;}
  if(b.dataset.atlasGroup!==undefined){const id=Number(b.dataset.atlasGroup);openGroup(id);$(`[data-atlas-group="${id}"]`)?.focus({preventScroll:true});if(window.innerWidth<=760)$('.atlas-chart-panel').scrollIntoView({block:'start'});return;}
  if(b.hasAttribute('data-atlas-group-back')||b.hasAttribute('data-atlas-group-list')){selected='';candidates=[];expanded=false;draw();$('#atlas-inspector').scrollIntoView({block:window.innerWidth<=760?'start':'nearest'});$('#atlas-group-title')?.focus({preventScroll:true});return;}
  if(b.dataset.atlasGroupPage){groupPage+=Number(b.dataset.atlasGroupPage);renderInspector();if(window.innerWidth<=760)$('#atlas-inspector').scrollIntoView({block:'start'});$('#atlas-group-title')?.focus({preventScroll:true});return;}
  if(b.dataset.heatRegion){onFilter('cross',{region:b.dataset.heatRegion,family:b.dataset.heatFamily});return;}
  if(b.id==='atlas-heat-toggle'){showHeatmap=!showHeatmap;renderHeatmap();if(showHeatmap)$('#atlas-heatmap').scrollIntoView({block:'start'});return;}
  if(b.hasAttribute('data-atlas-compare')){onCompare(selected);return;}
  if(b.hasAttribute('data-atlas-anchor')){
   const id=selected;if(filters.anchor===id){onScope(null);return;}
   onExplore?.(true);const neighbors=relatedPerfumes(index,id,allowedIds,48);
   onScope({ids:new Set([id,...neighbors.map(n=>n.record.id)]),label:index.byId.get(id).p.displayName+'周围',kind:'anchor',anchor:id});
   if(window.innerWidth<=760){expanded=false;renderInspector();$('.atlas-chart-panel').scrollIntoView({block:'start'});}return;
  }
  if(b.dataset.atlasSelect){if(mode==='map'&&filters.region)onDetail(b.dataset.atlasSelect);else select(b.dataset.atlasSelect,true);return;}
  if(b.dataset.atlasZoom){zoom(b.dataset.atlasZoom);return;}
  if(b.dataset.atlasRegion){openRegion(b.dataset.atlasRegion);return;}
  if(b.dataset.atlasCity){openCity(b.dataset.atlasCity);return;}
  if(b.dataset.atlasBrand){mapBrand=b.dataset.atlasBrand;listPage=1;draw();$('#atlas-region-title')?.focus({preventScroll:true});return;}
  if(b.hasAttribute('data-atlas-brand-back')){mapBrand='';listPage=1;draw();$('#atlas-region-title')?.focus({preventScroll:true});return;}
  if(b.hasAttribute('data-atlas-country')){openRegion(filters.region);return;}
  if(b.hasAttribute('data-atlas-region-back')){openRegion('');return;}
  if(b.hasAttribute('data-atlas-region-results')){showList=true;renderList();$('#atlas-results').scrollIntoView({block:'start'});$('#atlas-results-title').focus({preventScroll:true});return;}
  if(b.hasAttribute('data-atlas-continent')){onFilter('continent',b.dataset.atlasContinent);return;}
  if(b.hasAttribute('data-atlas-reset')){onReset();return;}
  if(b.hasAttribute('data-atlas-detail')){onDetail(b.dataset.atlasDetail);return;}
  if(b.hasAttribute('data-atlas-close')){if(filters.anchor)onScope(null);selected='';candidates=[];expanded=false;draw();$('#atlas-chart').focus({preventScroll:true});return;}
  if(b.hasAttribute('data-atlas-related')){onExplore?.();related=true;expanded=true;renderInspector();return;}
  if(b.hasAttribute('data-atlas-identical')){openCandidates(index.identical.get(index.byId.get(selected).signature).filter(id=>allowedIds.has(id)).map(id=>index.byId.get(id)));return;}
  if(b.dataset.atlasCandidatePage){candidatePage+=Number(b.dataset.atlasCandidatePage);renderInspector();return;}
  if(b.id==='atlas-expand'){expanded=!expanded;renderInspector();$('#atlas-expand')?.focus({preventScroll:true});return;}
  if(b.id==='atlas-options-toggle'){const open=root.classList.toggle('options-open');b.setAttribute('aria-expanded',open);return;}

  if(b.id==='atlas-list-toggle'){showList=!showList;renderList();if(showList)$('#atlas-results').scrollIntoView({block:'start',behavior:'auto'});return;}
  if(b.dataset.atlasPage){listPage+=Number(b.dataset.atlasPage);renderList();$('#atlas-results').scrollIntoView({block:'start'});return;}
  if(b.hasAttribute('data-atlas-go')){const input=$('#atlas-list-page');if(input.reportValidity()){listPage=Number(input.value);renderList();$('#atlas-results').scrollIntoView({block:'start'});}}
 }

 async function start(){
  root.innerHTML='<div class="atlas-loading" role="status">正在打开香气地图…<span>首次载入需要稍等片刻</span></div>';
  try{const [data,world,places,boundaries,local]=await loadAssets();if(!valid())return;index=indexAtlas(data,perfumes);worldData=world;locations=places;admin1=boundaries;localData=local;shell();records=found.map(p=>index.byId.get(p.id));allowedIds=new Set(found.map(p=>p.id));if(filters.anchor&&allowedIds.has(filters.anchor)){selected=filters.anchor;}draw();}
  catch(error){if(!valid())return;root.innerHTML=`<div class="atlas-loading" role="alert"><h2>图形暂时没能打开</h2><p>${esc(error.message)}。可重试，或切回卡片继续浏览。</p><button class="secondary" id="atlas-retry">重新加载</button></div>`;$('#atlas-retry').onclick=start;}
 }
 start();
 return {
  update(items,state={}){const newAnchor=state.anchor&&state.anchor!==filters.anchor;const nextMode=state.mode||mode;if(mode!==nextMode||state.resetKey!==filters.resetKey||newAnchor||items.length!==found.length||items.some((p,i)=>p.id!==found[i]?.id)){focusedGroup=null;localView=null;subgroup=null;groupPage=1;}if(mode!==nextMode||state.region!==filters.region){mode=nextMode;selected='';candidates=[];mapCity='';mapBrand='';}found=items;filters=state;ownedIds=new Set(state.ownedIds||[]);listPage=1;if(!index)return;records=found.map(p=>index.byId.get(p.id));allowedIds=new Set(found.map(p=>p.id));if(selected&&!allowedIds.has(selected)){selected='';related=false;expanded=false;}candidates=candidates.filter(r=>allowedIds.has(r.id));if(state.anchor&&allowedIds.has(state.anchor)&&newAnchor){selected=state.anchor;candidates=[];}draw();},
  locateSearch(){if(!index)return;if(records.length===1){select(records[0].id);$('#atlas-chart').focus({preventScroll:true});$('#atlas-chart').scrollIntoView({block:'start'});}else{showList=true;renderList();$('#atlas-results').scrollIntoView({block:'start'});}},
  destroy(){disposed=true;observer?.disconnect();chart?.destroy();root.onclick=null;}
 };
}
