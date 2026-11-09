import {searchAliases} from './catalog-search-aliases.mjs';
const DATASET='https://huggingface.co/datasets/doevent/perfume';
export function mergeCatalog(curated,rows){
 const existing=new Map(curated.map(p=>[p.id,{...p,region:'未提供',families:[p.family],reviewStatus:p.reviewStatus||'visually-verified'}]));
 const additions=[];
 rows.forEach(([brand,name,family,subfamily,region,notes,description,imageName,curatedId],index)=>{
  if(curatedId&&existing.has(curatedId)){
   const p=existing.get(curatedId);p.region=region;p.families=[family,subfamily];p.sourceRowIndex=index;return;
  }
  additions.push({id:`hf-full-${index}`,brand,name,nameZh:'数据库收录',concentration:'浓度未单独标注',family:`${family} · ${subfamily}`,families:[family,subfamily],region,notes,description:description||'数据库未提供描述。',image:imageName?`assets/catalog-full/${imageName}`:'',imageAlt:`${brand} ${name} 数据集原图`,sourceUrl:DATASET,sourceLabel:'Hugging Face 数据集原始记录',imageSourceUrl:DATASET+'/blob/main/images.zip',imageCredit:'doevent/perfume 收录的商品图片；按原始 image_name 关联',imageLicense:'数据集声明 MIT；第三方商品照片授权未核实',imageSourceType:'dataset',datasetUrl:DATASET,datasetRowIndex:index,datasetRecordName:`${brand} / ${name}`,sourceRowIndex:index,reviewStatus:'dataset-imported',versionNote:'2024 数据库原始档案。图片按原始文件名绑定；本轮未重新逐款检索所有历史档案。香调保留来源描述，国家/地区不代表生产地。'});
 });
 return [...existing.values(),...additions];
}
const normalizeSearch=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘]/g,"'").toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
export function catalogSearchText(p,aliases={}){return normalizeSearch([searchAliases(p),p.brand,aliases[p.brand],p.displayBrand,p.name,p.originalName,p.nameZh,p.displayName,...p.notes,...(p.notesZh||[]),p.family,p.region,p.concentration,p.concentrationZh,p.concentration==='Eau de Toilette'?'EDT':p.concentration.includes('Eau de Parfum')?'EDP':''].join(' '));}
export function filterCatalog(items,{query='',brand='',region='',family='',concentration='',review='',image=''}={},searchTexts){
 const terms=query.trim().split(/\s+/).map(normalizeSearch).filter(Boolean);
 return items.filter((p,i)=>terms.every(term=>(searchTexts?.[i]||catalogSearchText(p)).includes(term))&&(!brand||p.brand===brand)&&(!region||p.region===region)&&(!family||p.families.includes(family))&&(!concentration||p.concentrationKey===concentration)&&(!image||(image==='available'?Boolean(p.image):!p.image))&&(!review||(review==='reviewed'?p.reviewStatus!=='dataset-imported':p.reviewStatus==='dataset-imported')));
}
export function catalogPage(items,page,size=24){const pages=Math.max(1,Math.ceil(items.length/size));page=Math.max(1,Math.min(page,pages));return {items:items.slice((page-1)*size,page*size),page,pages,total:items.length};}
