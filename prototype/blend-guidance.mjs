import {baseById,makeBlend} from './blend-model.mjs';
import {guideForBase} from './scent-guide.mjs';

// Editorial experiments with complete bases, not measured smell predictions.
export const blendScenes={
 通勤:'通勤与办公室：先试少量，留意近距离交流时是否太浓；清新香气也可能很有存在感。',
 约会:'晚餐与约会：先在自己身上试闻，再观察近距离的感受；吃饭时尤其留意气味是否抢过食物。',
 户外:'散步与户外：可观察清新、绿叶或木头的感觉；风和温度会改变感受，不能据此保证扩散或留香。',
 居家:'阅读与居家：选择自己愿意反复闻的气味；小空间先少量试闻，不必追求强烈的存在感。'
};
const pairIdeas=[
 [['柑橘果香','茶与绿叶'],'果皮或果肉的明亮感与茶叶、绿叶的青绿感相衬；可以想象茶杯旁放着水果，试闻时留意谁盖住了谁。','阅读、午后茶叙或日常通勤时，可探索水果与茶叶的轻快联想。'],
 [['柑橘果香','树木与森林'],'明亮果香与木头气息形成清爽和沉稳的对照；试闻时留意果香是否还清楚。','城市散步或白天会面时，可试试果香与干爽木质相衬的感觉。'],
 [['花朵香气','干净柔软'],'花香与干净织物般的气息放在一起，可尝试“花瓣落在棉衣上”的柔和联想；不代表混合后一定更淡。','下午茶或朋友小聚时，可探索花瓣与干净织物相衬的柔和感觉。'],
 [['花朵香气','茶与绿叶'],'花朵与绿叶、茶叶像同一座花园的两面；留意青绿感是衬出花香，还是遮住了它。','周末散步或看展时，可探索花朵、绿叶和茶香的植物感。'],
 [['甜点与咖啡','树木与森林'],'甜点气息与干木头形成甜润和干爽的对照；先观察甜感是否仍然过重。','微凉午后或居家休息时，可探索甜点与木头交织的温暖印象。'],
 [['辛香与暖香','树木与森林'],'辛暖气息与木头相接，适合探索温暖的木香印象；若感觉厚重，下一版可减少其中一种。','微凉傍晚或晚餐聚会时，可探索偏暖的木质气息。'],
 [['海风与雨水','柑橘果香'],'湿润空气感与明亮果香相遇，可探索清凉的果香印象；海风、雨水都是气味联想，不等于真实海水的成分。','白天出游或海边散步时，可尝试湿润空气与果香相衬的感觉。'],
 [['甜点与咖啡','柑橘果香'],'甜点与水果像点心配果皮的联想；增添果香不一定能抵消甜感，要看具体基底的表现。','午后茶叙或轻松聚会时，可探索水果与甜点相接的气味联想。']
];
export function pairingGuidance(entries,capacity=10,scene='通勤'){
 const rows=entries.map(([id,percent])=>({id,percent,...guideForBase(baseById(id))}));
 let pair;
 for(const [categories,why,occasion] of pairIdeas){const a=rows.find(r=>r.category===categories[0]),b=rows.find(r=>r.category===categories[1]);if(a&&b){pair={a,b,why,occasion};break;}}
 if(!pair&&rows.length>=2){const [a,b]=rows;pair={a,b,why:a.category===b.category?'两种气味属于同一大类，可以先分别闻，再比较相似处和差别；叠加不一定增加层次。':`${a.label}可这样联想：${a.reference} ${b.label}可这样联想：${b.reference} 混合时先确认这两种感觉是否都能辨认。`};}
 let valid=true;try{makeBlend(capacity,entries);}catch{valid=false;}
 // Move five percentage points between existing bases only; no implicit rebalancing.
 const fresh=['柑橘果香','茶与绿叶','海风与雨水'];
 const donor=rows.filter(r=>['甜点与咖啡','辛香与暖香','树木与森林'].includes(r.category)&&r.percent>=5.1).sort((a,b)=>b.percent-a.percent)[0];
 const recipient=rows.find(r=>fresh.includes(r.category)&&r.percent<=94.8);
 const adjustment=valid&&donor&&recipient?{
  title:`想让${recipient.label}更突出？`,
  explanation:`试着把${donor.label}的 5 个百分点移给${recipient.label}，其余不变。这是对比试配的起点，不保证气味按比例增强。`,
  changes:[{id:donor.id,label:donor.label,before:donor.percent,after:Math.round((donor.percent-5)*10)/10},{id:recipient.id,label:recipient.label,before:recipient.percent,after:Math.round((recipient.percent+5)*10)/10}],
  entries:entries.map(([id,p])=>[id,Math.round((p+(id===donor.id?-5:id===recipient.id?5:0))*10)/10])
 }:null;
 return {pair:pair?{title:`${pair.a.label} × ${pair.b.label}`,why:pair.why,occasion:pair.occasion||'先在居家空闲时做少量对比试闻，再决定是否用于通勤或聚会。'}:null,scene:blendScenes[scene]||blendScenes.通勤,adjustment,valid};
}
