const continentRegions={
 '亚洲':['中国','中国香港','日本','韩国','印度','新加坡','泰国','越南','以色列','黎巴嫩','巴林','沙特阿拉伯','科威特','阿曼','阿联酋'],
 '欧洲':['丹麦','保加利亚','克罗地亚','冰岛','圣马力诺','奥地利','希腊','德国','意大利','挪威','捷克','摩纳哥','比利时','法国','波兰','爱尔兰','瑞典','瑞士','罗马尼亚','英国','荷兰','葡萄牙','西班牙'],
 '北美洲':['加拿大','美国','墨西哥'],
 '南美洲':['阿根廷','巴西','秘鲁'],
 '非洲':['南非'],
 '大洋洲':['澳大利亚'],
 '跨洲（欧亚）':['俄罗斯','土耳其']
};
const continentByRegion=new Map(Object.entries(continentRegions).flatMap(([label,values])=>values.map(region=>[region,label])));
const letterOrder=['0–9',...'ABCDEFGHIJKLMNOPQRSTUVWXYZ','#'];
const brandOrder=new Intl.Collator('en',{numeric:true,sensitivity:'base',ignorePunctuation:true});
const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘]/g,"'").toUpperCase();
// Curated shortcuts, not a sales ranking; original brand keys remain unchanged.
const popularBrandOrder=['CHANEL','DIOR','HERMÈS','JO MALONE LONDON','GUERLAIN','YVES SAINT LAURENT','TOM FORD','GUCCI','GIORGIO ARMANI','PRADA','BURBERRY','DIPTYQUE'];

export function popularBrands(brands){
 const available=new Set(brands);
 return popularBrandOrder.filter(brand=>available.has(brand));
}

export function regionGroups(regions){
 const groups=new Map([...Object.keys(continentRegions),'其他'].map(label=>[label,[]]));
 for(const region of new Set(regions))groups.get(continentByRegion.get(region)||'其他').push(region);
 return [...groups].filter(([,values])=>values.length).map(([label,values])=>({label,values:values.sort((a,b)=>a.localeCompare(b,'zh'))}));
}

export function brandInitial(name){
 const first=normalize(name).match(/[A-Z0-9]/)?.[0];
 return first?(/[0-9]/.test(first)?'0–9':first):'#';
}

export function groupBrands(brands,aliases={},query='',initial=''){
 const term=normalize(query.trim()),groups=new Map(letterOrder.map(label=>[label,[]]));
 for(const brand of new Set(brands)){
  const letter=brandInitial(brand);
  if(initial&&initial!==letter)continue;
  if(term&&!normalize(`${brand} ${aliases[brand]||''}`).includes(term))continue;
  groups.get(letter).push(brand);
 }
 return [...groups].filter(([,values])=>values.length).map(([label,values])=>({label,values:values.sort(brandOrder.compare)}));
}
