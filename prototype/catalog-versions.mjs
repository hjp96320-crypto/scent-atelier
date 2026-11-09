// Explicit reviewed editions; names or concentration alone never infer membership.
export const versionGroups=[
 {label:'香奈儿 · 蔚蓝',ids:['hf-full-21386','hf-20113','hf-full-1817']},
 {label:'迪奥 · 旷野',ids:['dior-sauvage-edt','dior-sauvage-eau-de-parfum','hf-full-10744','dior-sauvage-elixir']},
 {label:'香奈儿 · 邂逅柔情',ids:['hf-full-25596','hf-16094']},
 {label:'库尔吉安 · 百家乐红晶 540',ids:['hf-2581','hf-full-4304']},
 {label:'范思哲 · 爱神',ids:['hf-7685','hf-full-6674']},
 {label:'古驰 · 花悦',ids:['hf-full-14626','hf-4504']},
 {label:'娇兰 · 理想男士',ids:['hf-full-22679','hf-12399']},
 {label:'雨果博斯 · 博斯经典',ids:['hf-full-16124','hf-full-4333']},
 {label:'纳西索 · For Her',ids:['hf-full-7647','hf-full-21448']},
 {label:'高缇耶 · 裸男',ids:['hf-full-7312','hf-15181','hf-full-20067']},
 {label:'圣罗兰 · 自由之水',ids:['hf-12922','hf-full-3383']},
 {label:'纪梵希 · 心无禁忌',ids:['hf-2584','hf-full-23266']},
 {label:'迪奥 · 桀骜',ids:['dior-homme','dior-dior-homme-intense']},
 {label:'纪梵希 · 绅士',ids:['hf-full-2300','hf-12699']},
 {label:'阿玛尼 · Sì',ids:['hf-21484','hf-full-24495']},
 {label:'卡罗琳娜 · Good Girl',ids:['hf-full-4178','hf-full-7776']}
];

export function compareVersions(perfumes,id){
 const group=versionGroups.find(g=>g.ids.includes(id));if(!group)return null;
 const byId=new Map(perfumes.map(p=>[p.id,p]));
 const items=group.ids.map(key=>byId.get(key)).filter(p=>p?.reviewedProfile&&p.concentrationKey!=='unknown');
 if(items.length<2)return null;
 const common=items[0].reviewedProfile.notes.filter(n=>items.every(p=>p.reviewedProfile.notes.includes(n)));
 return {label:group.label,common,items:items.map(p=>({p,distinct:p.reviewedProfile.notes.filter(n=>!common.includes(n))}))};
}
