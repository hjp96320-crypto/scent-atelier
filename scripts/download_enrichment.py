"""Cache selected original product photographs and record decode/hash evidence."""
import json,urllib.request,hashlib,io,shutil
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
manifest=ROOT/'research/catalog-enrichment/image-selections.json'
entries=json.loads(manifest.read_text(encoding='utf8'))
def fetch(item):
 key,p=item
 try:
  if p.get('localSource'):data=(ROOT/p['localSource']).read_bytes()
  elif p.get('image') and (ROOT/'prototype'/p['image']).exists():data=(ROOT/'prototype'/p['image']).read_bytes()
  else:
   req=urllib.request.Request(p['imageOriginalUrl'],headers={'User-Agent':'Mozilla/5.0'})
   with urllib.request.urlopen(req,timeout=40) as response:data=response.read()
  with Image.open(io.BytesIO(data)) as im:
   im.load();assert min(im.size)>=100,(key,im.size)
   p['dimensions']=list(im.size);ext={'JPEG':'jpg','PNG':'png','WEBP':'webp','GIF':'gif'}[im.format]
  p['image']=f'assets/enriched/{key}.{ext}'
  (ROOT/'prototype'/p['image']).write_bytes(data)
  p['sha256']=hashlib.sha256(data).hexdigest();p['downloadStatus']='decoded';p.pop('error',None)
 except Exception as ex:p['downloadStatus']='failed';p['error']=str(ex)
 print(key,p['downloadStatus'],p.get('error',''),flush=True)
 return key,p
with ThreadPoolExecutor(max_workers=6) as pool:entries=dict(pool.map(fetch,entries.items()))
manifest.write_text(json.dumps(entries,ensure_ascii=False,indent=2),encoding='utf8')
