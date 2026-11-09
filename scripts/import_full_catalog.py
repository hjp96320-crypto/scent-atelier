"""Import every source row with its exact image filename; never imply manual review."""
import ast,csv,json,zipfile,hashlib,unicodedata,re
from pathlib import Path
from PIL import Image
from concurrent.futures import ThreadPoolExecutor
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'research/catalog-100/hf-perfumes.csv'
FAMILIES={'FLORAL':'花香','WOODY':'木质','AMBERY (ORIENTAL)':'琥珀','AROMATIC FOUGERE':'馥奇','CITRUS':'柑橘','CHYPRE':'西普','LEATHER':'皮革','FRUITY':'果香','GREEN':'绿叶','MUSK SKIN':'麝香','WATERY':'水生','GOURMAND':'美食','SPICY':'辛香','ALDEHYDIC':'醛香','TOBACCO':'烟草'}
COUNTRIES=dict(zip(['France','United States of America','Italy','United Kingdom','Germany','Spain','United Arab Emirates','Brazil','India','Sweden','Japan','Switzerland','Canada','Saudi Arabia','Netherlands',"People\'s Republic of China",'Oman','Greece','Argentina','Türkiye','Peru','Ireland','Mexico','Australia','Czech Republic','Belgium','Poland','Denmark','Portugal','Kuwait','South Korea','Romania','Bahrain','Iceland','Philippines','Austria','Monaco','Lebanon','Bulgaria','Thailand','Norway','Singapore','Israel','South Africa','Russian Federation','Croatia','Vietnam','Hong Kong'],['法国','美国','意大利','英国','德国','西班牙','阿联酋','巴西','印度','瑞典','日本','瑞士','加拿大','沙特阿拉伯','荷兰','中国','阿曼','希腊','阿根廷','土耳其','秘鲁','爱尔兰','墨西哥','澳大利亚','捷克','比利时','波兰','丹麦','葡萄牙','科威特','韩国','罗马尼亚','巴林','冰岛','菲律宾','奥地利','摩纳哥','黎巴嫩','保加利亚','泰国','挪威','新加坡','以色列','南非','俄罗斯','克罗地亚','越南','中国香港']))
def normalize(s):return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())
if __name__=='__main__':
 rows=list(csv.DictReader(SOURCE.open(encoding='utf8'),delimiter='|'))
 curated=json.loads((ROOT/'research/catalog-100/catalog-100.json').read_text(encoding='utf8'))
 matches={p['datasetRowIndex']:p['id'] for p in curated if 'datasetRowIndex' in p}
 # Only exact unique brand + product names can bind an additional curated record.
 for p in curated:
  if p['id'] in matches.values():continue
  candidates=[i for i,r in enumerate(rows) if normalize(r['brand'])==normalize(p['brand']) and normalize(r['name_perfume'])==normalize(p['name'])]
  if len(candidates)==1 and candidates[0] not in matches:matches[candidates[0]]=p['id']
 target=ROOT/'prototype/assets/catalog-full';target.mkdir(exist_ok=True)
 archive=ROOT/'research/catalog-full/images.zip'
 with zipfile.ZipFile(archive) as z:
  names=set(z.namelist())
  missing=[i for i,r in enumerate(rows) if 'images/'+r['image_name'] not in names]
  assert all(not rows[i]['image_name'] for i in missing),missing
  (ROOT/'research/catalog-full/missing-images.json').write_text(json.dumps([dict(rowIndex=i,**rows[i]) for i in missing],ensure_ascii=False,indent=2),encoding='utf8')
  # zipfile validates CRC. Never extract arbitrary archive paths.
  for n,name in enumerate(dict.fromkeys(r['image_name'] for r in rows)):
   if not name:continue
   assert Path(name).name==name
   out=target/name
   if not out.exists():out.write_bytes(z.read('images/'+name))
   if n%5000==0:print('Extracted',n,flush=True)
 def check(name):
  with Image.open(target/name) as im:im.load();assert min(im.size)>0
 with ThreadPoolExecutor(max_workers=8) as pool:list(pool.map(check,set(r['image_name'] for r in rows if r['image_name'])))
 compact=[]
 for i,r in enumerate(rows):
  notes=ast.literal_eval(r['ingredients']) if r['ingredients'] else []
  assert isinstance(notes,list)
  compact.append([r['brand'].upper(),r['name_perfume'],FAMILIES.get(r['family'],r['family']),FAMILIES.get(r['subfamily'],r['subfamily']),COUNTRIES.get(r['origin'],r['origin']) or '未提供',notes,r['description'],r['image_name'],matches.get(i)])
 output=ROOT/'prototype/catalog-full-rows.js'
 output.write_text('export default '+json.dumps(compact,ensure_ascii=False,separators=(',',':'))+';',encoding='utf8')
 report={'sourceRows':len(rows),'sourceBrands':len(set(r['brand'] for r in rows)),'uniqueImages':len(set(r['image_name'] for r in rows if r['image_name'])),'missingImageRows':missing,'curatedBindings':matches,'sourceSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'allImagesDecoded':True,'missingRegions':sum(not r['origin'] for r in rows),'metadataBytes':output.stat().st_size}
 (ROOT/'research/catalog-full/import-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
 print(json.dumps({k:v for k,v in report.items() if k!='curatedBindings'},ensure_ascii=False),flush=True)
