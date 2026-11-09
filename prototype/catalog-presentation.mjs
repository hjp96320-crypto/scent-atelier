import {popularProfiles} from './popular-perfume-profiles.mjs';
import {brandLabels,productLabels,productPyramids} from './catalog-zh-names.mjs';
import {catalogPyramids} from './catalog-pyramids.js?v=20261108-note-evidence';
import {catalogNoteOverrides,unresolvedPyramidIds} from './catalog-note-overrides.mjs?v=20261108-note-evidence';
import {noteLabel,explainEvolution} from './fragrance-notes.mjs?v=20261108-note-evidence';
import {namedConcentration,concentrationGroup} from './catalog-concentration.mjs';
import {concentrationEvidence} from './catalog-concentration-data.mjs';

const concentrationLabels={'Eau de Toilette':'淡香水 · EDT','Eau de Parfum':'淡香精 · EDP','Parfum':'香精','Pure Parfum':'纯香精','Extrait de Parfum':'香精萃取','Cologne':'古龙水','Eau de Cologne':'古龙水 · EDC','Eau de Parfum Légère':'轻盈淡香精','Eau de Toilette Intense':'浓郁淡香水','Eau de Parfum Intense':'浓郁淡香精','Elixir':'馥郁香精','Cologne Intense':'浓郁古龙水','Eau de Parfum Absolue':'纯香淡香精','Deo Parfum':'香氛 · Deo Parfum'};
function concentrationLabel(p){
 if(concentrationLabels[p.concentration])return concentrationLabels[p.concentration];
 if(/[\u3400-\u9fff]/.test(p.concentration)&&p.concentration!=='浓度未单独标注')return p.concentration;
 const explicit=namedConcentration(p.name);
 return concentrationLabels[explicit]||'香水';
}
const familyImpressions={'花香':'花朵的柔和与芬芳','木质':'木材的干燥与温暖','琥珀':'温暖、圆润的树脂甜感','馥奇':'草本与芳香植物的清爽','柑橘':'明亮、清新的果皮气息','西普':'清新感与苔藓、木质的对比','皮革':'皮革般的干燥与深沉','果香':'鲜果般的甜润与多汁感','绿叶':'青叶与植物茎秆的清新','麝香':'柔软、贴近肌肤的气息','水生':'轻盈、湿润的水感','美食':'甜点般的香甜与柔软','辛香':'香料的温暖与鲜明感','醛香':'明亮、通透的皂感','烟草':'烟草叶的干燥与醇厚'};
const unresolvedPyramids=new Set(unresolvedPyramidIds);
export function localizeCatalog(items){
 return items.map(p=>{
  const key=`${p.brand}|${p.name}`;
  const evidence=catalogNoteOverrides[p.id];
  const pyramid=unresolvedPyramids.has(p.id)?undefined:evidence?.pyramid||productPyramids[key]||catalogPyramids[p.sourceRowIndex]||p.pyramid;
  const complete=['top','heart','base'].every(stage=>pyramid?.[stage]?.length);
  const notesZh=[...new Set((complete?['top','heart','base'].flatMap(stage=>pyramid[stage]):p.notes).map(noteLabel))];
  const candidate=popularProfiles[p.id];
  const identityMatches=candidate&&(!candidate.identity||(candidate.identity.brand===p.brand&&candidate.identity.name===p.name));
  const concentration=evidence?.concentration||(concentrationGroup(p.concentration)!=='unknown'?p.concentration:(identityMatches&&candidate.identity?candidate.concentration:null)||namedConcentration(p.name)||concentrationEvidence[p.id]?.concentration||p.concentration);
  const profile=identityMatches&&candidate.concentration===concentration?candidate:null;
  const nameZh=productLabels[key]||(/[\u3400-\u9fff]/.test(p.nameZh)&&!['来源已核对','数据库收录'].includes(p.nameZh)?p.nameZh:'');
  const hasChineseDescription=/[\u3400-\u9fff]/.test(p.description)&&!p.description.includes('未提供描述');
  const displayDescription=p.descriptionZh||(hasChineseDescription?p.description:`${p.families.join('与')}调的组合，带有${notesZh.slice(0,5).join('、')}等气味线索。可以从${p.families.map(f=>familyImpressions[f]).filter(Boolean).join('，以及')}来理解它的香气风格。`);
  return {...p,concentration,concentrationKey:concentrationGroup(concentration),displayName:nameZh||p.name,displayBrand:brandLabels[p.brand]||p.brand,notesZh,displayDescription,descriptionKind:hasChineseDescription||p.descriptionZh?'description':'interpretation',concentrationZh:concentrationLabel({...p,concentration}),pyramid,...(profile?{reviewedProfile:profile,notesZh:profile.notes,displayDescription:`核心香气：${profile.notes.join('、')}。${profile.wear.impression}`,descriptionKind:'interpretation',pyramid:profile.pyramid?{...profile.pyramid,sourceUrl:profile.sourceUrl}:undefined}:{} )};
 });
}
export {explainEvolution};
