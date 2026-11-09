// Editorial wearing suggestions, not measured performance or brand prescriptions.
// Family vocabulary reference: https://experimentalperfumeclub.com/en-us/blogs/journal/understand-your-fragrance-family-and-find-your-perfect-match
const profiles={
 '花香':['花朵的芬芳与层次','柔和、舒展的花束感',['日常约会','白天聚会','周末出游']],
 '木质':['木材的干燥与温暖','沉静、利落的木质感',['日常通勤','逛展看书','晚餐聚会']],
 '琥珀':['圆润的树脂甜感','温暖、包裹的气味氛围',['晚间约会','秋冬出门','晚餐聚会']],
 '馥奇':['草本与芳香植物的气息','清爽、整洁的经典气质',['日常通勤','白天会面','周末散步']],
 '柑橘':['明亮的果皮香气','轻快、利落的清新感',['日常通勤','周末外出','白天聚会']],
 '西普':['清新与苔藓、木质的对比','层次分明、略带复古的气质',['正式会面','逛展看书','晚餐聚会']],
 '皮革':['干燥皮革与深沉气息','鲜明、有棱角的气味风格',['晚间聚会','音乐演出','秋冬出门']],
 '果香':['鲜果般的甜润气息','活泼、轻松的果香氛围',['朋友聚会','周末出游','日常约会']],
 '绿叶':['青叶与植物茎秆的气息','清绿、自然的气味氛围',['周末散步','白天外出','日常通勤']],
 '麝香':['柔软的粉感与肌肤气息','柔和、贴近肌肤的气味联想',['独处阅读','轻松约会','日常出门']],
 '水生':['水汽、空气与海风的联想','轻盈、通透的水感',['周末出游','白天外出','休闲聚会']],
 '美食':['甜点般的香甜气息','甜暖、柔软的气味氛围',['咖啡馆小聚','秋冬出门','晚间约会']],
 '辛香':['香料的温暖与鲜明感','带一点锐度与暖意的气味层次',['晚餐聚会','音乐演出','秋冬出门']],
 '醛香':['明亮的皂感与粉感','干净、复古的气味印象',['正式会面','日常通勤','白天聚会']],
 '烟草':['烟草叶的干燥与醇厚','深沉、温暖的气味氛围',['晚间聚会','独处阅读','秋冬出门']]
};

export function describeWear(perfume){
 if(perfume.reviewedProfile)return perfume.reviewedProfile.wear;
 const families=[...new Set(perfume.families)].map(family=>profiles[family]).filter(Boolean);
 const [main,accent]=families;
 if(!main)return {audience:'想从自己的气味偏好出发，探索新香气的人。',occasions:['日常出门','周末小聚'],impression:'可先用小样试闻，观察它与个人风格是否合拍。'};
 const notes=(perfume.notesZh||[]).slice(0,2);
 return {
  audience:`喜欢${main[0]}${accent?`，也欣赏${accent[0]}`:''}的人。`,
  occasions:[...new Set([...main[2].slice(0,2),...(accent?accent[2]:main[2])])].slice(0,3),
  impression:`${main[1]}${accent?`，融入${accent[1]}`:''}。${notes.length?`试闻时可留意${notes.join('、')}的气味线索。`:''}`
 };
}
