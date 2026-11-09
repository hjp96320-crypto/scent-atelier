// Chinese scent vocabulary. Named aroma materials retain their trade names.
// Roles describe common olfactory use, never a product's undisclosed formula.
import {extraNoteLabels} from './catalog-note-translations.mjs';

const vocabulary = `
Aldehyde|醛香
Amber|琥珀
Ambergris|龙涎香调
Ambre 83 de Laire|德莱尔 83 号琥珀香基
Ambrette Seed|黄葵籽
Angelica|当归
Animalic Notes|动物香调
Anise|茴香
Apple|苹果
Apricot|杏子
Aromatic Notes|草本芳香
Artemisia|蒿草
Arum Lily|马蹄莲
Balsam|香脂
Bamboo|竹子
Bay|月桂叶
Beeswax|蜂蜡
Benzoin|安息香
Bergamot|佛手柑
Birch|桦木
Birch Tar|桦木焦油调
Bitter Orange|苦橙
Black Pepper|黑胡椒
Blackberry|黑莓
Blackcurrant Bud|黑加仑芽
Buaya Laos|Buaya Laos（香调原名）
Candy|糖果
Caramel|焦糖
Cardamom|小豆蔻
Carnation|康乃馨
Cashmere Wood|开司米木调
Castoreum|海狸香调
Caviar Lime|鱼子青柠
Cedarwood|雪松
Cherry|樱桃
Chilipepper|辣椒
Chypre Accord|西普香调
Cinnamon|肉桂
Ciste Labdanum|岩蔷薇脂
Citrata Mint|柑橘薄荷
Citruses|柑橘
Civet|灵猫香调
Clary Sage|快乐鼠尾草
Clementine|克莱门汀橘
Clove|丁香香料
Cocoa|可可
Coffee|咖啡
Cologne Accord|古龙香调
Coriander|芫荽籽
Cotton Candy|棉花糖
Cranberry|蔓越莓
Crinum Lily|文殊兰
Curcuma|姜黄
Cypriol / Nagarmota|莎草
Dew Drop|露珠感
Dry Amber|干燥琥珀调
Elemi|榄香脂
Everlasting Flower|蜡菊
Fig|无花果
Floral Notes|花香调
Freesia|小苍兰
Fresh Cut Grass|新割青草
Fresh Spices|清新辛香
Fruity Notes|果香调
Galbanum|白松香
Gardenia|栀子花
Gardenia Leaves|栀子叶
Genmai-Cha Tea Accord|玄米茶调
Geranium|香叶天竺葵
Ginger|生姜
Gourmand Accord|美食香调
Grapefruit|葡萄柚
Green Apple|青苹果
Green Notes|绿叶调
Green Tea|绿茶
Green of Tangerine|青橘调
Guaiac Wood|愈创木
Guarana|瓜拉纳
Gunpowder|火药调
Hay|干草
Heliotrope|天芥菜
Hellabore Flower|嚏根草花调
Honeysuckle|忍冬
Hot Pepper|辣椒
Hot Spices|温暖辛香
Hyacinth|风信子
Incense|焚香
Incense / Olibanum|乳香
Ink|墨水调
Iris|鸢尾
Iris / Orris|鸢尾与鸢尾根
Ivy|常春藤
Jasmine|茉莉
Juniper Berries|杜松子
Kingwood|Kingwood（木香原名）
Kyphi Accord|古埃及凯菲香调
Lavandin|杂交薰衣草
Lavender|薰衣草
Leather|皮革
Lemon|柠檬
Lemon Zest|柠檬皮
Lentisk|乳香黄连木
Lily|百合
Lily Of The Valley|铃兰
Lime|青柠
Limequat|莱檬金柑
Lotus|莲花
Lychee|荔枝
Magnolia|木兰
Mahonial|Mahonial（花香材料）
Mandarin|橘子
Mandarin Orange Blossom|橘花
Mango|芒果
Marine|海洋调
Marjoram|马郁兰
Massoia|马索亚木
Mate|马黛茶
Melon|甜瓜
Mimosa|含羞草
Mint|薄荷
Mirabelle|黄香李
Musk|麝香
Musk Ambrette|葵子麝香
Myrrh|没药
Narcissus|水仙
Nerium Oleander|夹竹桃
Neroli|苦橙花
Night Blooming Jasmine|夜来香调
Nutmeg|肉豆蔻
Oakmoss|橡苔
Oolong Tea|乌龙茶
Opoponax|甜没药
Orange|橙子
Orange Blossom|橙花
Orchid|兰花
Osmanthus|桂花
Oud|沉香
Oud / Agarwood|沉香
Ozonic Notes|清透空气调
Palisander Rosewood|玫瑰木
Palo Santo|秘鲁圣木
Passion Fruit|百香果
Patchouli|广藿香
Peach|桃子
Pear|梨
Peony|牡丹
Pepper|胡椒
Peppermint|胡椒薄荷
Petitgrain|苦橙叶
Pimento Leaves|多香果叶
Pineapple|菠萝
Pink Pepper|粉红胡椒
Plum|李子
Praline|果仁糖
Queenwood|Queenwood（香调原名）
Raspberry|覆盆子
Red Apple|红苹果
Red Chili|红辣椒
Red Ginger|红姜
Rhubarb|大黄
Rose|玫瑰
Rose Centifolia|千叶玫瑰
Rose Damascena|大马士革玫瑰
Rose Water|玫瑰水
Rosemary|迷迭香
Rum|朗姆酒
Saffron|藏红花
Salty Amber|咸感琥珀调
Salty Caramel|咸焦糖
Sandalwood|檀香
Sclarene|Sclarene（香调原名）
Sea Breeze|海风调
Sea Water|海水调
Spearmint|留兰香
Spicy Notes|辛香调
Star Anise|八角
Strawberry|草莓
Suede|麂绒
Sweet Pea|甜豌豆花
Tangerine|柑橘
Tarragon|龙蒿
Tea|茶香
Thyme|百里香
Tiare|大溪地栀子花
Tobacco Accord|烟草调
Tobacco Leaf|烟草叶
Toffee|太妃糖
Tonka Bean|零陵香豆
Tonkin Musk|Tonkin（麝香调）
Tuberose|晚香玉
Vanilla|香草
Vetiver|香根草
Violet|紫罗兰
Violet Leaves|紫罗兰叶
White Sugared Almond|糖霜杏仁
White Truffle|白松露
Woody Notes|木质调
Ylang-ylang|依兰
Yuzu|日本柚子
Ambroxan|降龙涎香醚（Ambroxan）
Vanillin|香兰素
Hedione|二氢茉莉酮酸甲酯（Hedione）
Absinth|苦艾
Aldehydes|醛香
Almond|杏仁
Almond blossom|杏仁花
Alyssum|香雪球花
Amaryllis|孤挺花
Amazon lily|亚马逊百合
Amber Xtreme™|Amber Xtreme™（琥珀木质香材料）
Ambermax®|Ambermax®（琥珀木质香材料）
Amberwood|琥珀木调
Ambrox|Ambrox（龙涎香材料）
Amyris|阿米香树
Aniseed|茴香籽
Apple blossom|苹果花
Apricot blossom|杏花
Apricot nectar|杏子蜜汁调
Aquatic flowers|水生花香
Aquatic notes|水生香调
Asafoetida|阿魏
Atlas cedar|阿特拉斯雪松
Australian sandalwood|澳大利亚檀香
Balsamic notes|香脂调
Bamboo leaf|竹叶
Basil|罗勒
Bellflower|风铃草
Benzoin Siam|暹罗安息香
Birch leaf|桦树叶
Birch wood|桦木
Bitter almond|苦杏仁
Bitter orange zest|苦橙皮
Black amber|黑琥珀调
Black caraway|黑葛缕子
Black cedar|黑雪松调
Black cherry|黑樱桃
Black leather|黑色皮革调
Black musk|黑麝香调
Black orchid|黑兰花调
Black pepper Orpur®|黑胡椒（Orpur®）
Black rose|黑玫瑰调
Black sesame|黑芝麻
Black tea|红茶
Black truffle|黑松露
Blackcurrant|黑加仑
Blackcurrant blossom|黑加仑花
Blackcurrant leaf|黑加仑叶
Blackcurrant liqueur|黑加仑利口酒
Blond woods|浅色木香调
Blood orange|血橙
Blossoms|花香调
Blue atlas cedar|蓝色阿特拉斯雪松
Blue cypress|蓝柏
Blue iris|蓝鸢尾
Blueberry|蓝莓
Boronia|波罗尼花
Bourbon vanilla|波旁香草
Bourbon vanilla absolute|波旁香草原精
Bourbon vetiver|波旁香根草
Brazilian gardenia|巴西栀子花
Brazilian rosewood|巴西玫瑰木
Broom|金雀花
Broom absolute|金雀花原精
Brown sugar|红糖
Bulgarian rose|保加利亚玫瑰
Cade juniper wood|刺柏木
Calabrian bergamot|卡拉布里亚佛手柑
Calabrian bitter orange|卡拉布里亚苦橙
Calamondin|四季橘
Calone|西瓜酮（Calone）
Calypso orchid|布袋兰
Candied apple|糖渍苹果
Candied fruits|蜜饯水果
Cape gooseberry|灯笼果
Caraway|葛缕子
Cascalone®|Cascalone®（水生香材料）
Cashmeran|开司米酮（Cashmeran）
Cashmere|开司米香调
Cassia|桂皮
Cedar|雪松
Cedar leaf|雪松叶
Ceylon tea|锡兰红茶
Chamomile|洋甘菊
Champaca absolute|黄玉兰原精
Champagne|香槟调
Chili|辣椒
Chinese cedar|中国雪松
Chinese jasmine|中国茉莉
Chocolate|巧克力
Church incense|教堂焚香调
Cistus|岩蔷薇
Cistus absolute|岩蔷薇原精
Citron|香橼
Citrus fruits|柑橘果香
Citrus notes|柑橘香调
Clary sage absolute|快乐鼠尾草原精
Coconut|椰子
Coconut milk|椰奶
Coffee berry|咖啡果
Comorian ylang-ylang|科摩罗依兰
Cotton|棉花调
Cotton flower|棉花花香调
Coumarin|香豆素
Crystal musk|晶透麝香调
Cucumber|黄瓜
Cumin|孜然
Currant bud|醋栗芽
Custard|蛋奶甜酱调
Cyclamen|仙客来
Cypress|柏树
Cypress absolute|柏树原精
Cypress leaf|柏树叶
Cypriol|莎草
Damask rose|大马士革玫瑰
Datura|曼陀罗花
Davana|印蒿
Dewberry|露莓
Dog rose|犬蔷薇
Dragée|糖衣杏仁
Driftwood|浮木调
Ebony|乌木
Egyptian geranium|埃及香叶天竺葵
Egyptian jasmine|埃及茉莉
Egyptian jasmine absolute|埃及茉莉原精
Egyptian tuberose|埃及晚香玉
Elemi resin|榄香脂
English lilac|英国紫丁香
Eucalyptus acorn|桉树果
Exotic blossoms|异域花香调
Exotic notes|异域香调
Exotic woods|异域木香调
Fenugreek|葫芦巴
Fig leaf|无花果叶
Fir balsam|冷杉香脂
Fir needle|冷杉针叶
Florentine iris|佛罗伦萨鸢尾
Florentine iris absolute|佛罗伦萨鸢尾原精
Frangipani|鸡蛋花
Frankincense|乳香
Frankincense resin|乳香树脂
French carnation|法国康乃馨
French lavender|法国薰衣草
Fresh notes|清新香调
Fruits|水果香调
Gaiac wood|愈创木
Gentian absolute|龙胆原精
Georgywood®|Georgywood®（木质香材料）
Geranium absolute|香叶天竺葵原精
Geranium leaf|香叶天竺葵叶
Glycyrrhiza glabra|光果甘草
Goldenwood®|Goldenwood®（木质香材料）
Gourmand notes|美食香调
Granny Smith apple|澳洲青苹果
Grass|青草
Grasse rose|格拉斯玫瑰
Green cardamom|绿豆蔻
Green leaves|绿叶
Green lemon|青柠檬
Green mandarin orange|青橘
Green mandarin orange zest|青橘皮
Green pear|青梨
Green pepper|青椒
Guatemala patchouly|危地马拉广藿香
Guava|番石榴
Habanero chili|哈瓦那辣椒
Haitian vetiver|海地香根草
Hawthorn|山楂花
Hay absolute|干草原精
Hazelnut|榛子
Hazelnut cream|榛子奶油调
Hibiscus seed|黄葵籽
Honey|蜂蜜
Honey pomelo|蜜柚
Indian jasmine sambac|印度沙巴茉莉
Indian jasmine sambac absolute|印度沙巴茉莉原精
Indian myrrh|印度没药
Indian sandalwood|印度檀香
Indian vetiver|印度香根草
Indonesian patchouli|印度尼西亚广藿香
Iris pallida|香根鸢尾
Iris pallida concrete|香根鸢尾浸膏
Italian bergamot|意大利佛手柑
Italian citron|意大利香橼
Italian citrus fruits|意大利柑橘果香
Italian jasmine|意大利茉莉
Italian lemon|意大利柠檬
Italian mandarin orange|意大利橘子
Italian orange|意大利甜橙
Italian rose|意大利玫瑰
Jasmine absolute|茉莉原精
Jasmine sambac|沙巴茉莉
Jasmine sambac absolute|沙巴茉莉原精
Jasmine tea|茉莉花茶
Jasminum auriculatum absolute|毛茉莉原精
Java vetiver|爪哇香根草
Juniper|杜松
Juniper berry|杜松子
Labdanum|岩蔷薇脂
Labdanum absolute|岩蔷薇脂原精
Lavender absolute|薰衣草原精
Leathery notes|皮革调
Lemon blossom|柠檬花
Lemon grass|柠檬草
Lemon leaf|柠檬叶
Lemon vervain|柠檬马鞭草
Licorice liqueur|甘草利口酒
Lilac|紫丁香
Lime blossom|椴树花
Liquorice|甘草
Lotus wood|Lotus wood（木香原名）
Lychee praliné|荔枝果仁糖调
Madagascan ylang-ylang|马达加斯加依兰
Madonna lily|圣母百合
Mahogany|桃花心木
Mahonial®|Mahonial®（花香材料）
Malayan patchouli|马来亚广藿香
Maltol|麦芽酚
Mandarin orange|橘子
Mandarin orange leaf|橘叶
Mandarin orange nectar|橘子蜜汁调
Mandarin orange wood|橘木
Marine notes|海洋香调
Maritima®|Maritima®（海洋香材料）
Marshmallow|棉花糖
Mastic|乳香黄连木脂
Mastic absolute|乳香黄连木脂原精
Maté|马黛茶
Maté absolute|马黛茶原精
Maté tea|马黛茶
May rose|五月玫瑰
May rose absolute|五月玫瑰原精
Mediterranean herbs|地中海草本
Mexican orange|墨西哥橘香调
Michelia dianica|Michelia dianica（含笑属花香调）
Milk|牛奶调
Minerals|矿物调
Mirabelle plum|黄香李
Moroccan chamomile|摩洛哥洋甘菊
Moroccan orange blossom absolute|摩洛哥橙花原精
Morocco leather|摩洛哥皮革调
Morrocan orange blossom|摩洛哥橙花
Moss|苔藓
Musk rose|麝香玫瑰
Mysore sandalwood|迈索尔檀香
Nashi pear|亚洲梨
Neroli absolute|苦橙花原精
New Caledonian sandalwood|新喀里多尼亚檀香
Night-blooming jasmine|夜来香调
Nootka cypress|努特卡柏木
Oaken barrel|橡木桶调
Olive wood|橄榄木
Operanide®|Operanide®（琥珀香材料）
Orcanox|Orcanox（龙涎香材料）
Orange blossom absolute|橙花原精
Orris root|鸢尾根
Osmanthus absolute|桂花原精
Pamplezest|Pamplezest（香料材料）
Papyrus|纸莎草
Passion flower|西番莲花
Patchouli Orpur®|广藿香（Orpur®）
Patchouli absolute|广藿香原精
Peach blossom|桃花
Pear blossom|梨花
Pear leaf|梨叶
Persian musk|波斯麝香调
Peru balsam|秘鲁香脂
Petalia®|Petalia®（花香材料）
Pimento|多香果
Pine needle|松针
Pink grapefruit|粉红葡萄柚
Pistachio|开心果
Pomegranate|石榴
Pot marigold|金盏花
Praliné|果仁糖
Precious woods|珍贵木香调
Primofiore lemon|初花柠檬
Provençal lavender|普罗旺斯薰衣草
Purple basil|紫罗勒
Queen-of-the-night|Queen-of-the-night（花香原名）
Quince|榅桲
Raspberry leaf|覆盆子叶
Red berries|红色莓果
Red berry sorbet|红莓雪酪调
Red currant|红醋栗
Red grapefruit|红葡萄柚
Red pepper|红椒
Red sandalwood|红檀香调
Red woods|红色木香调
Resins|树脂调
Rhubarb leaf|大黄叶
Roasted almond|烘烤杏仁
Rock samphire|海茴香
Rondeletia|Rondeletia（花香原名）
Rosa centifolia|千叶玫瑰
Rosa centifolia absolute|千叶玫瑰原精
Rose absolute|玫瑰原精
Rose leaf|玫瑰叶
Rose macaron|玫瑰马卡龙调
Rosewood|玫瑰木
Rosyfolia®|Rosyfolia®（花香材料）
Rum absolute|朗姆酒原精
Russian leather|俄罗斯皮革调
Sage|鼠尾草
Sharry baby orchid|香水文心兰
Shiso|紫苏
Siberian stone pine|西伯利亚红松
Sicilian bergamot|西西里佛手柑
Sicilian lemon|西西里柠檬
Sicilian mandarin orange|西西里橘子
Sicilian orange|西西里甜橙
Sicilian tangerine|西西里柑橘
Silk tree blossom|合欢花
Smoked ebony wood|烟熏乌木调
Solar note|日光香调
Southern magnolia|广玉兰
Spanish galbanum|西班牙白松香
Spices|辛香料
Stephanotis|马达加斯加茉莉
Styrax|苏合香
Sugar cane|甘蔗
Sulawesi patchouli|苏拉威西广藿香
Sumatra benzoin|苏门答腊安息香
Tagetes|万寿菊
Tahitian vanilla|大溪地香草
Tahitian vanilla orchid|大溪地香草兰
Taif rose|塔伊夫玫瑰
Teakwood|柚木
Thai basil|泰国罗勒
Tiaré absolute|大溪地栀子花原精
Tiger Liana|Tiger Liana（植物香调原名）
Tiger orchid|虎斑兰花调
Tobacco|烟草
Tolu balm|吐鲁香脂
Tonka bean absolute|零陵香豆原精
True lavender|真正薰衣草
Tuberose absolute|晚香玉原精
Tunisian neroli|突尼斯苦橙花
Turkish damask rose|土耳其大马士革玫瑰
Turkish rose|土耳其玫瑰
Turkish rose absolute|土耳其玫瑰原精
Vanilla absolute|香草原精
Venezuelan tonka bean|委内瑞拉零陵香豆
Vervain|马鞭草
Vetiver Orpur®|香根草（Orpur®）
Vetiveryl acetate|乙酸香根酯
Vinyl|黑胶气味调
Violet leaf|紫罗兰叶
Violet leaf absolute|紫罗兰叶原精
Virginia cedar|弗吉尼亚雪松
Water jasmine|水茉莉
Water lily|睡莲
Waterlily|睡莲
White blossoms|白花香调
White cedar|白雪松调
White cedarwood|白雪松调
White chocolate|白巧克力
White currant|白醋栗
White flowers absolute|白花原精
White iris|白鸢尾
White lilac|白丁香
White moss|白苔藓调
White musk|白麝香
White peach|白桃
White peony|白牡丹
White pepper|白胡椒
White rose|白玫瑰
White tea|白茶
White thyme|白百里香
White woods|白木香调
Wild peach|野桃
Wild rose|野玫瑰
Wine|葡萄酒
Woodland strawberry|野草莓
Woods|木香调
`;
const names=new Map(vocabulary.trim().split('\n').map(line=>{const [en,zh]=line.split('|');return [en.toLowerCase(),zh];}));
const extraNames=new Map(Object.entries(extraNoteLabels).map(([en,zh])=>[en.toLowerCase(),zh]));
const variants={
 'alaska':'阿拉斯加','america':'美洲','arabia':'阿拉伯','arabica':'阿拉比卡','assam':'阿萨姆','atlas':'阿特拉斯','australia':'澳大利亚','africa':'非洲','bangalore':'班加罗尔','bourbon':'波旁','bulgaria':'保加利亚','calabria':'卡拉布里亚','cambodia':'柬埔寨','china':'中国','columbia':'哥伦比亚','darjeeling':'大吉岭','delavayi':'滇藏','egypt':'埃及','english':'英国','finger':'指橙','florentine/tuscany':'佛罗伦萨／托斯卡纳','grandiflorum':'大花','grasse':'格拉斯','green':'青','guatemala':'危地马拉','haiti':'海地','himalaya':'喜马拉雅','india':'印度','indonesia':'印度尼西亚','italia':'意大利','jamaica':'牙买加','japan':'日本','java':'爪哇','kyoto':'京都','laos':'老挝','lebanon':'黎巴嫩','madagascar':'马达加斯加','mayotte':'马约特','mexico':'墨西哥','morello':'酸樱桃','mysore':'迈索尔','new caledonia':'新喀里多尼亚','nigeria':'尼日利亚','nyon aop':'尼翁原产地认证','ougan da':'乌干达','ouganda':'乌干达','pallida':'香根鸢尾','persian':'波斯','peru':'秘鲁','planifolia':'平叶','provence':'普罗旺斯','red':'红','sambac':'沙巴','seville':'塞维利亚','siam':'暹罗','sicily':'西西里','somalia':'索马里','sri lankan':'斯里兰卡','sumatra':'苏门答腊','taif':'塔伊夫','tahiti':'大溪地','tahitensis':'大溪地种','texas':'得克萨斯','thailand':'泰国','tibet':'西藏','tunisia':'突尼斯','turkey':'土耳其','turkish':'土耳其式','virginia':'弗吉尼亚','black':'黑','jalapeno':'墨西哥辣椒','r��union':'留尼汪','réunion':'留尼汪'
};
variants.morocco='摩洛哥';
const materialQualifiers={
 'musk':'麝香材料','ambergris':'龙涎香材料','fruity notes':'果香材料','fruity note':'果香材料','lily of the valley':'铃兰香材料','marine':'海洋香材料','sandalwood':'檀香材料','woody musky':'木质麝香材料','cedarwood note':'雪松香材料','animal note':'动物香材料','tonka bean note':'零陵香豆香材料','turmeric':'姜黄','light jasmine':'轻盈茉莉香材料','heliotrope':'天芥菜香材料','floral notes':'花香材料','floral note':'花香材料','woody note':'木香材料','ylang-ylang':'依兰香材料','praline':'果仁糖香材料','melon note':'甜瓜香材料','plum':'李子香材料','aldehyde':'醛香材料','saffron':'藏红花香材料','suede note':'麂绒香材料','green note':'绿叶香材料','vanilla note':'香草香材料'
};
export function noteLabel(note){
 const value=String(note||'').trim();if(!value)return '';
 const direct=names.get(value.toLowerCase());if(direct)return direct;
 if(/^Champagne Ros/i.test(value))return '桃红香槟调';
 if(/^Foug.+re accord$/i.test(value))return '馥奇香调';
 const match=value.match(/^(.+?)\s*\((.+?)\)$/);
 if(match){
  const base=names.get(match[1].trim().toLowerCase()),qualifier=match[2].trim().toLowerCase();
  if(base&&variants[qualifier])return `${variants[qualifier]}${base}`;
  if(base&&materialQualifiers[qualifier])return base;
  if(materialQualifiers[qualifier])return `${match[1].trim()}（${materialQualifiers[qualifier]}）`;
 }
 const extra=extraNames.get(value.toLowerCase());
 return extra&&extra.toLowerCase()!==value.toLowerCase()?extra:value;
}

const roles=[
 {key:'top',label:'前调',subtitle:'初闻的印象',match:/佛手柑|柠檬|青柠|柑橘|橘子|橙子|苦橙叶|苦橙花|葡萄柚|日本柚子|鱼子青柠|莱檬金柑|克莱门汀|青橘|粉红胡椒|薄荷|留兰香|新割青草|绿叶|无花果叶|柿子|苹果|梨$|青梨|红色莓果|莓果|黑莓|覆盆子|草莓|黑加仑|蔓越莓|荔枝|菠萝|百香果|青芒果|芒果|甜瓜|西瓜|露珠|海风|海水|海洋|空气调|杜松子|醛香|大黄/,
  explanation:'这些清新、明亮或轻快的气味，常可用来理解初闻时的印象。'},
 {key:'heart',label:'中调',subtitle:'逐渐展开的性格',match:/玫瑰|玫瑰水|茉莉|花香|木兰|薰衣草|橙花|橘花|依兰|鸢尾|紫罗兰|含羞草|栀子|晚香玉|牡丹|百合|铃兰|忍冬|水仙|兰花|莲花|风信子|桂花|天芥菜|小苍兰|康乃馨|马蹄莲|文殊兰|嚏根草|夹竹桃|甜豌豆|蓝风铃|梨花|桃子|李子|樱桃|杏子|无花果$|生姜|红姜|小豆蔻|丁香|肉桂|胡椒|藏红花|芫荽|姜黄|辣椒|辛香|香叶天竺葵|鼠尾草|迷迭香|百里香|蒿草|印蒿|月桂叶|龙蒿|马郁兰|茴香|八角|茶香|绿茶|乌龙茶|玄米茶|马黛茶|罗勒|当归|常春藤|竹子|白松香|栀子叶|咖啡|朗姆|威士忌/,
  explanation:'这些花香、香料或草本线索，适合观察香气展开后的轮廓与层次。'},
 {key:'base',label:'后调',subtitle:'慢慢留下的余韵',match:/木质|雪松|檀香|香根草|广藿香|沉香|玫瑰木|愈创木|马索亚木|秘鲁圣木|木香|无花果木|鸢尾木|橡木|琥珀|龙涎香|麝香|黄葵籽|香草|零陵香豆|香豆素|安息香|乳香|焚香|没药|岩蔷薇|香脂|莎草|橡苔|苔藓|皮革|麂绒|桦木|海狸|灵猫|动物香|蜂蜡|干草|烟草|焦糖|糖果|棉花糖|果仁糖|太妃糖|可可|红糖|杏仁|美食/,
  explanation:'这些木质、树脂、柔软或甜暖的气味，常用于理解香气停留后的质感。'}
];
function labels(values){return [...new Set((Array.isArray(values)?values:[]).map(noteLabel).filter(Boolean))];}
export function explainEvolution(perfume){
 if(perfume.reviewedProfile){
  const p=perfume.reviewedProfile,documented=!!p.pyramid;
  return {mode:documented?'documented':'interpretation',title:documented?'前中后调':'三阶段试香解读',sourceUrl:p.sourceUrl,disclaimer:documented?'香调顺序依据品牌说明；下方用日常语言解释气味，各层可能交织。':'品牌介绍了主要香气，以下按初闻、展开、余韵提供观察建议，不是官方前中后调表。',stages:roles.map((role,i)=>({key:role.key,label:role.label,subtitle:role.subtitle,notes:documented?p.pyramid[role.key]:[],referenceNotes:documented?[]:p.notes.slice(0,3),explanation:p.stages[i]}))};
 }

 const pyramid=perfume.pyramid;
 const documented=Boolean(pyramid&&roles.some(role=>Array.isArray(pyramid[role.key])&&pyramid[role.key].length));
 const allNotes=labels(perfume.notes);
 return {
  mode:documented?'documented':'interpretation',
  title:documented?'前中后调':'气味演变参考',
  disclaimer:documented?'已公布的香调按来源展示；补充的试香提示结合整体香调解读。各层可能同时被闻到。':'结合已收录香调整理的三阶段试香解读，供理解气味变化；不是品牌公布的分层配方。',
  sourceUrl:documented?pyramid.sourceUrl:undefined,
  stages:roles.map(role=>{
   const notes=documented?labels(pyramid[role.key]):allNotes.filter(note=>role.match.test(note));
   let explanation;
   if(documented){
    const phase={top:'构成最初的气味印象，可留意初喷时的轮廓。',heart:'呈现香气展开后的核心性格，与前后层次相互交织。',base:'描绘余韵的气味质感，不代表具体留香时长。'};
    explanation=notes.length?`${notes.slice(0,3).join('、')}${phase[role.key]}`:'';
   }else{
    explanation=notes.length?`${notes.slice(0,3).join('、')}。${role.explanation}`:'';
   }
   const referenceNotes=notes.length?[]:allNotes.slice(0,3);
   if(!explanation){
    const scent=referenceNotes.join('、')||'这款香水的整体气味';
    explanation={top:`初闻时，可以先从${scent}辨认整体轮廓。留意最先吸引你的气味，以及刚喷出时的轻盈或饱满感。`,heart:`展开后，围绕${scent}观察气味之间的衔接：哪种更突出，哪些融合在一起，整体是否由鲜明变得柔和。`,base:`香气渐淡时，回到${scent}这些整体线索，辨认仍可察觉的部分，并记录余韵偏干燥、柔软还是甜润。具体留下什么、持续多久，以实际试闻为准。`}[role.key];
   }
   return {key:role.key,label:role.label,subtitle:role.subtitle,notes,referenceNotes,explanation};
  })
 };
}
