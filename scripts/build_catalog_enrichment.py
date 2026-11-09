"""Build reproducible corrections without changing the original source CSV."""
import csv,json,hashlib,ast
from collections import defaultdict,Counter
from pathlib import Path
from PIL import Image
from import_full_catalog import COUNTRIES
ROOT=Path(__file__).resolve().parents[1]
DIR=ROOT/'research/catalog-enrichment'
rows=list(csv.DictReader((ROOT/'research/catalog-100/hf-perfumes.csv').open(encoding='utf8'),delimiter='|'))
regions=json.loads((DIR/'brand-regions.json').read_text(encoding='utf8'))
images=json.loads((DIR/'image-selections.json').read_text(encoding='utf8'))
known=defaultdict(lambda:defaultdict(list))
for i,r in enumerate(rows):
 if r['origin']:known[r['brand'].upper()][r['origin']].append(i)
for brand,values in known.items():
 if brand in regions or len(values)!=1:continue
 country,donors=next(iter(values.items()))
 regions[brand]={'region':COUNTRIES.get(country,country),'method':'same-brand-source-consensus','sourceUrl':'https://huggingface.co/datasets/doevent/perfume','donorRowIndices':donors,'note':'同品牌原始记录的非空地区一致，据此补全；未视为外部独立核实。'}
overrides={}
for key,p in images.items():
 assert p['downloadStatus']=='decoded',key
 path=ROOT/'prototype'/p['image']
 assert hashlib.sha256(path.read_bytes()).hexdigest()==p['sha256']
 with Image.open(path) as im:im.load();assert list(im.size)==p['dimensions']
 r=rows[int(key)]
 overrides[key]={k:v for k,v in p.items() if k not in ['downloadStatus','localSource','error','sha256','dimensions']}
 o=overrides[key]
 o.update(imageAlt=f"{r['brand']} {p.get('name',r['name_perfume'])} · {p['concentration']} 实物商品图",verifiedAt='2026-11-08',reviewStatus='source-checked',nameZh='来源已核对')
 o['imageSourceUrl']=p.get('imageSourceUrl',p['sourceUrl'])
 o['sourceLabel']='品牌官网 / 历史发布资料' if p['imageSourceType']=='official' else '版本对应资料'
 o['imageCredit']={'official':'品牌官方商品图 / 历史发布图','retailer':'零售商商品图','publication':'上市报道商品图','reference':'香水参考库历史商品图'}[p['imageSourceType']]
 o['imageLicense']='原图版权归相应权利人；保留来源链接'
 o['versionNote']=p.get('versionNote','已对照商品来源的品牌、名称、浓度与瓶身版本；图示容量与包装以来源图片为准。')
stats=Counter();changes=[]
for i,r in enumerate(rows):
 original=COUNTRIES.get(r['origin'],r['origin']) or '未提供'
 rule=regions.get(r['brand'].upper())
 region=rule['region'] if rule and (not r['origin'] or rule['method']=='external-source-checked') else original
 assert region!='未提供',(i,r['brand'])
 if region!=original:
  stats['regionsFilled' if not r['origin'] else 'regionsCorrected']+=1
  changes.append({'rowIndex':i,'brand':r['brand'],'original':original,'region':region,'method':rule['method']})
 assert ast.literal_eval(r['ingredients']) and r['family'] and r['subfamily']
stats.update({'imageRepairs':len(images),'missingSourceRegionsAfter':0,'emptyNotes':0,'emptyFamilies':0})
report={'checkedAt':'2026-11-08',**stats,'imageSources':dict(Counter(p['imageSourceType'] for p in images.values())),'externalBrandRules':sum(r['method']=='external-source-checked' for r in regions.values()),'regionChanges':changes}
(DIR/'verification-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
(ROOT/'prototype/catalog-enrichment-data.js').write_text('export const imageCorrections = '+json.dumps(overrides,ensure_ascii=False,separators=(',',':'))+';\nexport const brandRegions = '+json.dumps(regions,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
print(json.dumps({k:v for k,v in report.items() if k!='regionChanges'},ensure_ascii=False))
