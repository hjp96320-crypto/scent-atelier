// Editorial trial starts, not supplier recipes or measured olfactory predictions.
import {baseById} from './blend-model.mjs';
import {guideForBase} from './scent-guide.mjs';
export const tips=[
 {id:'fresh',supplier:'galimard',title:'清新木质',category:'茶感绿意',entries:[['bergamot',45],['tea',35],['wood',20]],why:'清爽果皮配上绿茶，再用甜暖木头添一点暖意。',scene:'通勤、白天外出，想带一点清新感时。',adjust:'如果木头味盖过茶香，下一版可减少甜暖木头、等量增加绿茶。'},
 {id:'floral',supplier:'galimard',title:'柔和花香',category:'柔和花香',entries:[['peony',50],['musk',30],['tea',20]],why:'牡丹花香配上干净棉衣般的柔软气息，绿茶带来清新感。',scene:'日常见面、下午茶，喜欢柔和花香时。',adjust:'如果牡丹太突出，可减少牡丹、等量增加绿茶，再试闻。'},
 {id:'warm',supplier:'galimard',title:'温暖木质',category:'温暖木质',entries:[['wood',50],['musk',30],['bergamot',20]],why:'把甜暖木头与清爽果皮搭在一起，再加入干净柔软的气息。',scene:'微凉天气、晚间活动，想尝试暖木香时。',adjust:'如果觉得太厚重，可减少甜暖木头、等量增加佛手柑。'},
 {id:'citrus-morning',supplier:'galimard',title:'晨光柑橘',category:'清新柑橘',entries:[['bergamot',45],['yuzu',35],['musk',20]],why:'佛手柑和柚子都带果皮清香，再配一点干净棉衣般的柔软气息。',scene:'白天出行、周末市集，喜欢明亮果香时。',adjust:'如果柚子的微苦感太明显，可减少柚子、等量增加佛手柑。'},
 {id:'yuzu-garden',supplier:'galimard',title:'柚光花园',category:'清新柑橘',entries:[['yuzu',40],['peony',35],['tea',25]],why:'柚子的清爽配上牡丹花香，绿茶补一点青绿气息。',scene:'午后散步、朋友见面，想试带花香的果皮香时。',adjust:'如果花香盖过果皮香，可减少牡丹、等量增加柚子。'},
 {id:'citrus-wood',supplier:'galimard',title:'双柑木调',category:'清新柑橘',entries:[['bergamot',35],['yuzu',30],['wood',25],['musk',10]],why:'把两种果皮香与甜暖木头放在一起，再加一点干净柔软的气息。',scene:'城市漫步、白天聚会，想让果香带一点木头味时。',adjust:'如果木头味太明显，可减少甜暖木头、等量增加佛手柑，其余不变。'},
 {id:'yuzu-tea',supplier:'galimard',title:'柚子茶香',category:'茶感绿意',entries:[['tea',45],['yuzu',35],['musk',20]],why:'绿茶配柚子，像茶杯旁放着刚剥开的果皮；再添一点柔软气息。',scene:'阅读、居家午后，喜欢茶香与柑橘时。',adjust:'如果柚子盖过茶香，可减少柚子、等量增加绿茶。'},
 {id:'green-rain',supplier:'galimard',title:'雨后绿意',category:'茶感绿意',entries:[['tea',45],['bergamot',25],['peony',20],['musk',10]],why:'绿茶和佛手柑配上牡丹，试试带花香的清新茶味。',scene:'日常通勤、安静的下午，想试清新花茶香时。',adjust:'如果花香太突出，可减少牡丹、等量增加绿茶，另外两项先不改。'},
 {id:'peony-dew',supplier:'galimard',title:'晨露牡丹',category:'柔和花香',entries:[['peony',40],['yuzu',35],['musk',25]],why:'牡丹花香与柚子果皮搭配，再加干净棉衣般的柔软气息。',scene:'周末约会、午后见面，喜欢清爽花香时。',adjust:'如果柚子太突出，可减少柚子、等量增加牡丹。'},
 {id:'flower-woods',supplier:'galimard',title:'花木之间',category:'柔和花香',entries:[['peony',40],['wood',30],['tea',20],['bergamot',10]],why:'花香配甜暖木头，绿茶与佛手柑添一点清爽。',scene:'看展、晚餐聚会，想让花香带一点木头味时。',adjust:'如果木头味盖过花香，可减少甜暖木头、等量增加牡丹。'},
 {id:'wood-flower',supplier:'galimard',title:'木与花影',category:'温暖木质',entries:[['wood',40],['peony',35],['musk',25]],why:'甜暖木头配上牡丹花香，再加入干净柔软的气息。',scene:'微凉傍晚、晚餐约会，喜欢带花香的暖木香时。',adjust:'如果觉得甜暖感太重，可减少甜暖木头、等量增加牡丹。'},
 {id:'evening-tea',supplier:'galimard',title:'夜色茶木',category:'温暖木质',entries:[['wood',40],['tea',35],['yuzu',15],['musk',10]],why:'绿茶和甜暖木头搭在一起，再加一点柚子的果皮清香。',scene:'秋日散步、晚间独处，喜欢茶与木头气味时。',adjust:'如果木头味压住茶香，可减少甜暖木头、等量增加绿茶，其余不变。'},
 {id:'demeter-citrus-spark',supplier:'demeter',title:'柑橘气泡',category:'清新柑橘',entries:[['demeter-pink-grapefruit',45],['demeter-gingerale',35],['demeter-sweet-orange',20]],why:'葡萄柚和甜橙配上姜汁汽水，试试带一点辛甜的果皮香。',scene:'周末市集、白天聚会，喜欢清爽果香时。',adjust:'如果姜味太突出，可减少姜汁汽水、等量增加甜橙。'},
 {id:'demeter-orange-morning',supplier:'demeter',title:'橙花晨光',category:'清新柑橘',entries:[['demeter-sweet-orange',40],['demeter-orange-blossom',35],['demeter-clean-skin',25]],why:'甜橙果香配上橙花，再加入沐浴后般的干净气息。',scene:'日常见面、春日散步，喜欢果香与花香时。',adjust:'如果花香盖过果皮香，可减少橙花、等量增加甜橙。'},
 {id:'demeter-sea-citrus',supplier:'demeter',title:'海风柚光',category:'清新柑橘',entries:[['demeter-pink-grapefruit',40],['demeter-salt-air',35],['demeter-rain',25]],why:'葡萄柚配海风和雨水，试试带一点微咸空气感的果皮香。',scene:'旅行、晴日外出，喜欢清凉海风气味时。',adjust:'如果微咸海风太明显，可减少它、等量增加窗边雨水。'},
 {id:'demeter-earl-grey',supplier:'demeter',title:'佛手红茶',category:'茶感绿意',entries:[['demeter-earl-grey-tea',40],['demeter-black-tea',30],['demeter-orange-blossom',20],['demeter-sweet-orange',10]],why:'伯爵红茶与红茶搭配，橙花和甜橙添一点花香、果皮香。',scene:'阅读、午后茶叙，喜欢茶叶气味时。',adjust:'如果橙花盖过茶香，可减少橙花、等量增加红茶，其余不变。'},
 {id:'demeter-rain-garden',supplier:'demeter',title:'雨后草地',category:'茶感绿意',entries:[['demeter-rain',45],['demeter-grass',35],['demeter-fig-leaf',20]],why:'雨水配青草和绿叶，像刚下过雨的小花园。',scene:'周末独处、户外散步，喜欢雨后绿叶气味时。',adjust:'如果青草味太重，可减少青草、等量增加窗边雨水。'},
 {id:'demeter-sweet-tea',supplier:'demeter',title:'午后甜茶',category:'茶感绿意',entries:[['demeter-sweet-tea',45],['demeter-honey',30],['demeter-pink-grapefruit',25]],why:'甜茶配蜂蜜，再添葡萄柚的微酸果皮香。',scene:'午后休息、轻松聚会，想试甜茶气味时。',adjust:'如果觉得太甜，可减少蜂蜜、等量增加粉红葡萄柚。'},
 {id:'demeter-white-garden',supplier:'demeter',title:'花园白花',category:'柔和花香',entries:[['demeter-jasmine',40],['demeter-orange-blossom',35],['demeter-honeysuckle',25]],why:'把茉莉、橙花和忍冬搭在一起，试试清甜的白花香。',scene:'花园散步、朋友聚会，喜欢花朵香气时。',adjust:'如果茉莉太突出，可减少茉莉、等量增加橙花，再试闻。'},
 {id:'demeter-rose-violet',supplier:'demeter',title:'玫瑰紫雾',category:'柔和花香',entries:[['demeter-bulgarian-rose',45],['demeter-violet',30],['demeter-clean-skin',25]],why:'玫瑰花香配紫罗兰的柔软粉香，再添一点干净气息。',scene:'约会、看展，喜欢柔软花香时。',adjust:'如果紫罗兰的粉香太明显，可减少紫罗兰、等量增加保加利亚玫瑰。'},
 {id:'demeter-sunny-woods',supplier:'demeter',title:'晴日木香',category:'温暖木质',entries:[['demeter-sandalwood',35],['demeter-cedar',30],['demeter-pink-grapefruit',25],['demeter-clean-skin',10]],why:'柔润檀木配干爽雪松，再添葡萄柚的清爽和沐浴后的干净感。',scene:'城市漫步、日常通勤，想试清爽木头香时。',adjust:'如果雪松闻着太硬，可减少雪松、等量增加柔润檀木，其余不变。'},
 {id:'demeter-rain-vetiver',supplier:'demeter',title:'雨中岩兰',category:'温暖木质',entries:[['demeter-vetiver',40],['demeter-rain',35],['demeter-fig-leaf',25]],why:'干草根的土木气息配雨水和绿叶，试试带湿润感的森林气味。',scene:'微凉天气、傍晚散步，喜欢植物和泥土气味时。',adjust:'如果干草根香盖过绿叶香，可减少它、等量增加无花果绿叶。'},
 {id:'demeter-coffee-vanilla',supplier:'demeter',title:'咖啡香草',category:'甜香美食',entries:[['demeter-fresh-brewed-coffee',45],['demeter-hawaiian-vanilla',35],['demeter-caramel',20]],why:'现煮咖啡配柔甜香草和焦糖，像咖啡馆里飘来的甜香。',scene:'秋冬午后、居家休息，喜欢咖啡甜点气味时。',adjust:'如果焦糖太甜，可减少焦糖、等量增加现煮咖啡。'},
 {id:'demeter-cocoa-coconut',supplier:'demeter',title:'黑巧椰香',category:'甜香美食',entries:[['demeter-dark-chocolate',40],['demeter-coconut',35],['demeter-hawaiian-vanilla',25]],why:'微苦黑巧克力配椰香，再加柔甜香草，试试椰子巧克力般的气味。',scene:'周末休闲、晚间聚会，喜欢甜点气味时。',adjust:'如果椰子味太突出，可减少椰子、等量增加黑巧克力。'}
];
export function rankedTips(rows,limit=3){
 const ids=new Set(rows.map(r=>r.id)),categories=new Set(rows.map(r=>guideForBase(baseById(r.id)).category));
 const score=tip=>tip.entries.reduce((sum,[id])=>sum+(ids.has(id)?100:0)+(categories.has(guideForBase(baseById(id)).category)?1:0),0);
 return [...tips].sort((a,b)=>score(b)-score(a)).slice(0,limit);
}
