// Official ready-to-use EDP bases. Cues, colors and family labels are editorial descriptions.
const source='https://www.galimard.com/produit/coffret-leleve-parfumeur';
export const galimardBases=[
 {id:'bergamot',name:'佛手柑',en:'Bergamote',color:'#c9a34b',cue:'明亮的柑橘，像剥开果皮的那一刻。',family:'柑橘'},
 {id:'tea',name:'绿茶',en:'Thé vert',color:'#8e9c64',cue:'清透的绿意，给气味留一点呼吸。',family:'绿意'},
 {id:'wood',name:'木质与零陵香豆',en:'Bois & Tonka',color:'#ad7950',cue:'温暖的木质，收在柔和的尾声里。',family:'木质'},
 {id:'musk',name:'麝香和弦',en:'Accord musc',color:'#b9a595',cue:'柔软、贴肤，如刚晒过的衬衫。',family:'麝香'},
 {id:'peony',name:'牡丹',en:'Pivoine',color:'#bc8990',cue:'轻盈的花瓣感，让轮廓柔和一些。',family:'花香'},
 {id:'yuzu',name:'柚子',en:'Yuzu',color:'#c7b25a',cue:'清爽的果皮印象，带一点微苦。',family:'柑橘'},
 {id:'orange-blossom',name:'穆尔西亚橙花',en:'Fleur d’oranger Murcia',color:'#d4bd82',cue:'橙花的明亮花香联想，适合探索柑橘与花瓣的交界。',family:'花香'},
 {id:'lychee',name:'荔枝',en:'Lichee',color:'#c99b91',cue:'荔枝般的甜润果香印象。',family:'果香'},
 {id:'fruity-rose',name:'果香玫瑰',en:'Rose fruitée',color:'#c38391',cue:'带果香联想的玫瑰方向，连接花瓣与甜润感。',family:'花香'},
 {id:'provence',name:'普罗旺斯气息',en:'Air de Provence',color:'#8f9c83',cue:'以普罗旺斯为主题的香气基底，具体轮廓留待试闻。',family:'芳香'},
 {id:'bamboo',name:'竹香',en:'Bambou',color:'#93a881',cue:'竹叶与绿意的联想，为组合加入清新线索。',family:'绿意'},
 {id:'pomegranate-flower',name:'石榴花',en:'Fleur de grenadier',color:'#c98c7b',cue:'以石榴花为主题的花香，供探索不同花瓣印象。',family:'花香'},
 {id:'musky-jasmine',name:'麝香茉莉',en:'Jasmin musqué',color:'#c0af91',cue:'茉莉与麝香并置的花香方向。',family:'花香'},
 {id:'marine',name:'海洋调',en:'Note marine',color:'#80a7b0',cue:'海风与水意的气味联想，让组合多一个清新维度。',family:'水生'},
 {id:'amber',name:'东方琥珀',en:'Ambre oriental',color:'#bc8c58',cue:'琥珀般的暖意联想，用来探索丰厚的香气方向。',family:'琥珀'},
 {id:'moss',name:'苔藓',en:'Mousse',color:'#889270',cue:'苔藓般的绿意与土壤联想，形成较深的气味底色。',family:'苔藓'},
 {id:'patchouli',name:'广藿香',en:'Patchouli',color:'#8d7c67',cue:'广藿香的木质与泥土联想，可与明亮方向作对照。',family:'木质'},
 {id:'praline',name:'果仁糖',en:'Praline',color:'#bd9573',cue:'果仁糖般的甜暖联想，适合探索美食调。',family:'美食'}
].map(base=>({...base,supplier:'galimard',source}));
