import json
from pathlib import Path
from popular_profile_expansion import append_profiles
from popular_profile_100 import append_profiles as append_100
rows=[]
def add(id,c,source,notes,stages,wear,pyramid=None):
 rows.append(dict(id=id,concentration=c,sourceUrl=source,checkedAt='2026-11-08',notes=notes.split('|'),stages=stages,wear=dict(audience=wear[0],occasions=wear[1],impression=wear[2],consideration=wear[3]),pyramid=({k:v.split('|') for k,v in zip(['top','heart','base'],pyramid)} if pyramid else None)))
add('chanel-coco-mademoiselle-edp','Eau de Parfum','https://www.chanel.com/us/fragrance/p/116390/coco-mademoiselle-eau-de-parfum-spray/','橙子|茉莉|五月玫瑰|广藿香|香根草',[
'橙子的果皮香让开场显得明亮。可以联想刚剥开的橙皮，留意那种轻快的清爽感。',
'茉莉与五月玫瑰形成花香主体，果皮香与花香可以同时出现，不一定按顺序完全替换。',
'广藿香和香根草带出木质与根系感，为花香留下较干燥的收尾；留香时长因人而异。'],[
'喜欢明亮花香，同时能接受广藿香与干燥木质余韵的人。',['白天会面','晚餐约会'],'明亮果皮香接上茉莉、玫瑰花束，木质余韵让整体多一份干爽。','近距离办公时先少量试穿；不喜欢广藿香的人，建议连同后段一起试闻。'],['橙子','茉莉、五月玫瑰','广藿香、香根草'])
add('hf-20113','Eau de Parfum','https://www.chanel.com/us/fragrance/p/107360/bleu-de-chanel-eau-de-parfum-spray/','芳香调|雪松|檀香|琥珀调|麝香调',[
'初闻时先辨认清爽芳香与木头气息的对比，观察自己觉得轻快还是厚实。',
'展开后可重点留意雪松的干爽木质感，与檀香较圆润的质感如何衔接。',
'气味渐淡时，留意檀香的圆润木质、琥珀的暖意，以及麝香的柔软感。'],[
'喜欢有干爽木质感，又希望带一点圆润温暖感的人。',['日常通勤','正式会面'],'雪松与檀香构成木质轮廓，琥珀、麝香增加柔和印象。','会议室或近距离交流时先少量试穿，观察干爽木质和柔和暖意是否符合自己的偏好。'])
add('dior-sauvage-edt','Eau de Toilette','https://www.dior.com/en_us/beauty/products/sauvage-eau-de-toilette-F068524009.html','佛手柑|四川胡椒|降龙涎香醚（Ambroxan）|榄香脂|木质调',[
'佛手柑带来明亮的果皮清新感，胡椒添一点辛锐，像清爽果皮旁撒了少许香料。',
'展开时可对照清新的柑橘与辛香、琥珀木质感，看看哪一部分对你更突出。',
'后段可留意降龙涎香醚（Ambroxan）偏干燥、带琥珀感的木质印象，以及榄香脂的树脂气息。'],[
'喜欢鲜明柑橘、胡椒辛香和琥珀木质感的人。',['白天外出','日常社交'],'开场清亮，辛香与木质形成较清晰的轮廓。','对锐利胡椒或琥珀木质敏感的人先试小样；办公室里不要把清新等同于低存在感。'])
add('dior-sauvage-eau-de-parfum','Eau de Parfum','https://www.dior.com/en_us/beauty/products/sauvage-eau-de-parfum-Y0785220.html','佛手柑|辛香调|香草|琥珀木质调',[
'先辨认佛手柑的果皮香与辛香感，开场仍有清新的一面。',
'展开时观察果皮清新感与香草的圆润感怎样交织，留意辛香是否仍然鲜明。',
'后段围绕香草与琥珀木质感试闻，留意甜暖感与干爽木质之间的平衡。'],[
'喜欢柑橘木质，但也希望有香草甜暖感的人。',['微凉傍晚','晚餐社交'],'佛手柑与香草形成清新、甜暖并置的印象。','天气闷热或距离很近时先减少用量。EDP 的差别是香气表达，不只是把 EDT 加浓。'])
add('dior-jadore','Eau de Parfum','https://www.dior.com/en_us/beauty/products/j%E2%80%99adore-eau-de-parfum-Y0998031.html','依兰|大马士革玫瑰|大花茉莉|沙巴茉莉',[
'初闻可从依兰明亮、略带果香的花香印象切入，想象走近一束饱满的鲜花。',
'玫瑰与两种茉莉构成花束的主要层次。试着分辨花瓣的柔和感和白花的饱满感。',
'香气渐淡时，观察花束是否变得更柔和；留意茉莉或玫瑰还剩多少，以及贴近皮肤时的感受。'],[
'喜欢完整花束、能接受茉莉和依兰等白花气息的人。',['白天聚会','庆祝晚餐'],'明亮花束感，重点是依兰、玫瑰与茉莉之间的融合。','庆祝晚餐或聚会可试试完整花束的感觉；若不习惯饱满白花，先少量试穿并观察后段。'])
add('hf-22577','Eau de Toilette','https://www.hermes.com/us/en/product/terre-d-hermes-eau-de-toilette-V107748V0/','葡萄柚|雪松|燧石矿物调',[
'初闻可留意葡萄柚的果皮清亮与微苦感，像揉开一小片新鲜柚皮。',
'展开后观察果皮香与干燥矿物感的对比。“燧石”可联想晒过太阳的石面，带一点干硬质感。',
'渐淡时可留意雪松的干爽木质感，像靠近干燥木材；再观察矿物感是否还在。'],[
'喜欢干燥木质、微苦果皮和矿物气息的人。',['日常通勤','正式会面'],'葡萄柚的明亮与雪松、燧石般的干燥感相互衬托。','正式会面时可尝试它的干爽木质感；若偏爱奶甜或柔软花香，建议先试闻后段再决定。'])
add('hf-5550','Eau de Parfum','https://www.hermes.com/us/en/product/twilly-d-hermes-eau-de-parfum-V107265V0/','生姜|晚香玉|檀香',[
'先辨认生姜的辛暖与带甜意的联想，留意它与花香同时出现时的对比。',
'展开时观察晚香玉的饱满花香，与生姜的鲜明感如何融合；留意花香的厚度。',
'渐淡时可留意檀香的柔润、奶感木质联想，看看姜香与白花是否还在其中。'],[
'喜欢白花，又想加入一点姜香反差的人。',['周末看展','晚餐约会'],'生姜、晚香玉和柔润檀香构成辛暖花木感。','晚香玉不一定适合所有白花爱好者，近距离活动前先少量试穿。'])
add('jo-wood','Cologne','https://www.jomalone.com/scents/woody/wood-sage-sea-salt','黄葵籽|海盐调|鼠尾草',[
'黄葵籽带来柔和的开场，可联想略带麝香感的种子气息，留意那种圆润、细软的质感。',
'海盐调可以联想海边吹来的清爽空气，带一点矿物感，让香气显得更开阔。',
'鼠尾草带出草本与偏木质、大地感的收尾，像海风里混进岸边植物的气息。'],[
'喜欢草本、海边空气和偏干燥木质联想的人。',['周末散步','休闲通勤'],'清爽海边空气感与草本木质感结合，带一点干燥、开阔的气味印象。','散步或休闲出门时可试试草本、海风般的感觉；办公时先少量，留意近距离的感受。'],['黄葵籽','海盐调','鼠尾草'])
add('jo-pear','Cologne','https://www.jomalone.com/product/25946/12553/colognes/english-pear-freesia-cologne','威廉梨|小苍兰|广藿香',[
'威廉梨提供成熟、带汁水感的果香，可以联想到刚切开的梨子，清甜里透着鲜润。',
'小苍兰让果香接到较清透的花香上，留意梨子的甜润感如何与花瓣感融合。',
'广藿香给后段带来较深的木质感，衬着梨子与花香；可以留意清甜和木质的变化。'],[
'喜欢果香与花香结合，也能接受木质收尾的人。',['午后见面','日常通勤'],'梨子的甜润、小苍兰的清透与广藿香的木质感相接。','若只喜欢纯果香，试闻时应多等一会儿，确认自己是否喜欢后段的广藿香。'],['威廉梨','小苍兰','广藿香'])
add('jo-peony','Cologne','https://www.jomalone.co.uk/product/25946/27028/colognes/peony-blush-suede-cologne','红苹果|牡丹|麂绒调',[
'红苹果带来清脆、带汁水感的果香开场，作为花香前的一点明亮感。',
'牡丹形成花香主体，可联想柔和花瓣与一点清绿感，观察苹果的果香如何接到花香上。',
'麂绒调可联想手指轻触柔软绒面时的细腻质感，给花香添一点温暖的收尾。'],[
'喜欢柔和花香、果香开场与柔软质感的人。',['白天约会','朋友小聚'],'红苹果的清脆与牡丹、柔软麂绒感相衬。','白天见面可试试果香与柔和花香的组合；试闻后段时，确认自己是否喜欢麂绒般的温暖感。'],['红苹果','牡丹','麂绒调'])
add('hf-12922','Eau de Parfum','https://www.yslbeautyus.com/fragrance/womens-fragrances/libre/libre-eau-de-parfum/109YSL.html','薰衣草|橙花|麝香调|香草',[
'先观察薰衣草的草本清新与橙花的花香对比，像青绿枝叶中透出白色花朵。',
'展开时重点留意橙花与薰衣草相互融合的部分，辨认花香和草本哪个更吸引你。',
'渐淡时观察香草的温暖甜感与麝香的柔软感，留意草本、花香还有多少。'],[
'喜欢橙花，也能接受草本气息和甜暖收尾的人。',['晚餐会面','微凉天气外出'],'草本清新与橙花、香草的温暖感形成对比。','微凉天气可尝试花香与甜暖感的组合；密闭空间先少量，观察橙花和草本的存在感。'])
add('hf-12795','Eau de Parfum','https://www.yslbeautyus.com/fragrance/womens-fragrances/black-opium/black-opium-eau-de-parfum-spray/252YSL.html','咖啡|白花|香草',[
'初闻可围绕咖啡的烘焙联想与甜感辨认整体，像咖啡馆里同时飘着咖啡和甜点香。',
'展开后观察白花如何融入咖啡与香草之间，分辨花香是否让甜暖感多了层次。',
'渐淡时留意香草的温暖甜感，以及咖啡、花香还剩多少，观察后段是否符合自己的甜度偏好。'],[
'喜欢咖啡、香草甜暖感，也愿意尝试其中花香的人。',['微凉晚间','咖啡馆聚会'],'烘焙咖啡联想与白花、香草相结合，整体偏甜暖。','微凉晚间可试试咖啡与香草的甜暖感；闷热或近距离办公时先减少用量。'])
# Narrative-based Chanel staging uses separate notes, never a combined ingredient label.
rows[0]['pyramid']={'top':['橙子'],'heart':['茉莉','五月玫瑰'],'base':['广藿香','香根草']}
append_profiles(add)
assert len(rows)==len({r['id'] for r in rows})==50
append_100(add)
identities={p['id']:p for p in json.loads(Path('research/popular-100/catalog-identities.json').read_text('utf-8'))}
for row in rows:
 if row['id'] in identities:
  row['identity']={k:identities[row['id']][k] for k in ['brand','name']}
assert len(rows)==len({r['id'] for r in rows})==100
Path('prototype/popular-perfume-profiles.mjs').write_text('// Source-backed key notes; wearing advice and stage prose are editorial explanations.\nexport const popularProfiles='+json.dumps({r['id']:{k:v for k,v in r.items() if k!='id'} for r in rows},ensure_ascii=False,indent=2)+';\n','utf-8')
Path('research/popular-100').mkdir(exist_ok=True)
Path('research/popular-100/verified-profiles.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),'utf-8')
print('profiles',len(rows))
