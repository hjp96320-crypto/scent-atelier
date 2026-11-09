// Everyday smell associations for browsing, not ingredient lists or measured effects.
export const scentCategories=['柑橘果香','花朵香气','茶与绿叶','树木与森林','海风与雨水','干净柔软','甜点与咖啡','辛香与暖香'];
const familyCategories={
 柑橘:'柑橘果香',果香:'柑橘果香',花香:'花朵香气',茶香:'茶与绿叶',绿意:'茶与绿叶',芳香:'茶与绿叶',
 木质:'树木与森林',苔藓:'树木与森林',水生:'海风与雨水',麝香:'干净柔软',洁净:'干净柔软',
 美食:'甜点与咖啡',辛香:'辛香与暖香',琥珀:'辛香与暖香',树脂:'辛香与暖香',皮革:'辛香与暖香',烟草:'辛香与暖香'
};
const everyday={
 wood:{label:'甜暖木头',reference:'像干木头旁飘来的香草甜点气息，木香中带一点甜暖联想。'},
 musk:{label:'干净棉衣',reference:'像刚洗净晒干的棉衬衫，气味印象柔软、干净。'},
 'orange-blossom':{label:'明亮橙花',reference:'像走近开花的橙树，花香中带一点果皮的清新联想。'},
 'fruity-rose':{label:'果甜玫瑰',reference:'像玫瑰花瓣与甜润果香放在一起。'},
 provence:{label:'南法花草气息',reference:'以南法风景为主题，可以从阳光下的草本花园去联想。'},
 bamboo:{label:'清新竹叶',reference:'像走近一丛青竹，想到竹叶和植物枝条的绿意。'},
 'musky-jasmine':{label:'柔软茉莉',reference:'像茉莉花香落在干净织物上，花香里多一点柔软联想。'},
 marine:{label:'海风空气',reference:'像站在海边迎面吹来的湿润空气，带一点海风的联想。'},
 amber:{label:'柔甜暖香',reference:'像香草糖与晒暖的木头交织，整体是圆润、偏暖的气味联想。'},
 moss:{label:'潮湿苔藓',reference:'像雨后走过林地，脚边苔藓和湿土散出的气味。'},
 patchouli:{label:'湿土木香',reference:'像翻起湿土时闻到的植物根系与木头气息。'},
 'demeter-earl-grey-tea':{label:'伯爵红茶',reference:'像捧起一杯带果皮清香的茶，先想到茶叶，再想到清亮的柑橘。'},
 'demeter-chai-tea':{label:'暖香料茶',reference:'像热茶旁放着肉桂、豆蔻一类香料，是茶香与香料的生活联想。'},
 'demeter-honeysuckle':{label:'忍冬花香',reference:'像走近开花的藤蔓，闻到柔甜的白色小花香。'},
 'demeter-violet':{label:'紫罗兰花香',reference:'像花瓣香里带一点柔软粉扑的气息。'},
 'demeter-dark-roses':{label:'深色玫瑰',reference:'像玫瑰花瓣旁放着木头，花香中多一些深沉的联想。'},
 'demeter-sandalwood':{label:'柔润檀木',reference:'像温润、摸得光滑的木头，气味联想偏柔和。'},
 'demeter-vetiver':{label:'干草根香',reference:'像晒干的草根、干土与木头交织，带一点大地的气息。'},
 'demeter-fraser-fir':{label:'清凉冷杉',reference:'像走进冷杉林，靠近一簇清凉的针叶。'},
 'demeter-siberian-pine':{label:'松针森林',reference:'像揉开松针后闻到的青绿木香。'},
 'demeter-blue-spruce':{label:'清新针叶',reference:'像山间针叶林的树枝与冷凉空气。'},
 'demeter-mahogany':{label:'温暖木材',reference:'像靠近一件木质家具，闻到干燥、偏暖的木头气息。'},
 'demeter-sawdust':{label:'新鲜木屑',reference:'像木工台上刚刨下的木屑，干燥又带一点新鲜木头感。'},
 'demeter-paperback':{label:'旧书纸页',reference:'像翻开一本放了很久的书，闻到纸张与书架的气息。'},
 'demeter-rain':{label:'窗边雨水',reference:'像下雨时从窗边透进来的湿润空气。'},
 'demeter-salt-air':{label:'微咸海风',reference:'像海边一阵风吹过，想到湿润空气与微咸的海水。'},
 'demeter-thunderstorm':{label:'雷雨湿土',reference:'像一场雷雨过后，潮湿空气里混着地面的土壤气味。'},
 'demeter-snow':{label:'冬日冷空气',reference:'像冬天刚打开窗，迎面而来的冷凉、干净空气。'},
 'demeter-mountain-air':{label:'清凉山风',reference:'像走到山上，迎面吹来的一阵开阔、清凉的风。'},
 'demeter-pure-soap':{label:'肥皂清香',reference:'像洗手时闻到的肥皂泡沫，简单、干净。'},
 'demeter-clean-skin':{label:'沐浴后的干净感',reference:'像刚洗完澡后，皮肤和干净毛巾留下的柔和气息。'},
 'demeter-linen':{label:'干净晾衣',reference:'像收下刚晾干的棉麻床单，带一点织物和空气的联想。'},
 'demeter-fig-leaf':{label:'无花果绿叶',reference:'像揉开一片厚绿叶，闻到叶片与植物汁液的气息。'},
 'demeter-tomato':{label:'番茄枝叶',reference:'像走进种着番茄的小菜园，碰到枝条和叶子时的青绿气味。'},
 'demeter-royal-apricot':{label:'熟杏子',reference:'像切开一颗成熟杏子，柔和果甜中带一点果肉感。'},
 'demeter-clove':{label:'丁香香料',reference:'像香料罐里干燥的丁香，辛暖、微甜；不是紫丁香花的方向。'},
 'demeter-cardamom':{label:'清爽豆蔻',reference:'像热茶里加入香料，温暖中带一点清凉的气味联想。'},
 'demeter-cinnamon-bark':{label:'肉桂木香',reference:'像烘焙时闻到的肉桂粉，也带一点干树皮的联想。'},
 'demeter-frankincense':{label:'清透焚香',reference:'像香炉里缓缓升起的淡香，清透中带一点木头的联想。'},
 'demeter-myrrh':{label:'微苦树香',reference:'像干树皮与凝固的树胶，偏暖，带一点微苦的气味联想。'},
 'demeter-amber':{label:'甜暖香气',reference:'像香草糖与温热木头的气味联想，甜润、偏暖。'},
 'demeter-marshmallow':{label:'软绵糖果',reference:'像一颗蓬松的棉花软糖，想到柔软、轻甜的糖香。'},
 'demeter-hawaiian-vanilla':{label:'柔甜香草',reference:'像香草甜点刚端到面前时飘来的温暖甜香。'},
 'demeter-cotton-candy':{label:'拉丝棉花糖',reference:'像游乐园里现做的棉花糖，空气中飘着砂糖甜香。'},
 'demeter-angel-food':{label:'蓬松蛋糕',reference:'像切开一块轻软蛋糕，闻到柔和的奶甜与烘焙气息。'},
 'demeter-leather':{label:'皮包皮衣',reference:'像打开皮包，或靠近一件皮衣时闻到的干燥气息。'},
 'demeter-patchouli':{label:'雨后泥土',reference:'像雨后翻起的泥土，混着湿润植物和深色木头的联想。'},
 'demeter-pipe-tobacco':{label:'干烟叶',reference:'像尚未点燃的干烟叶，带一点暖甜的气味联想。'},
 'demeter-bonfire':{label:'篝火木烟',reference:'像木头燃烧后留下的余烬与淡淡烟气。'}
};

export function guideForBase(base){
 return {category:familyCategories[base.family],label:base.name,reference:base.cue,originalName:base.name,...everyday[base.id]};
}
