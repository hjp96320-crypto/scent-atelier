"""Verify every published asset decodes and its local HTTP bytes match the source file."""
import csv
import io
import json
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
records=json.loads((ROOT/'research/catalog-100/catalog-100.json').read_text(encoding='utf-8'))
rows=list(csv.DictReader((ROOT/'research/catalog-100/hf-perfumes.csv').open(encoding='utf-8'),delimiter='|'))
assert len(records)==100
local_http=urllib.request.build_opener(urllib.request.ProxyHandler({}))


def check(p):
    local=(ROOT/'prototype'/p['image']).read_bytes()
    with Image.open(io.BytesIO(local)) as im:
        im.load()
        assert min(im.size)>=200, p['id']
    with local_http.open('http://127.0.0.1:4187/'+p['image'],timeout=10) as response:
        assert response.status==200 and response.headers.get_content_type().startswith('image/'),p['id']
        assert response.read()==local,p['id']
    if 'datasetRowIndex' in p:
        row=rows[p['datasetRowIndex']]
        assert row['brand'].upper()==p['brand'] and row['name_perfume']==p['name'],p['id']
        assert row['image_name']==p['datasetImageName'],p['id']
    return len(local)


with ThreadPoolExecutor(8) as pool:
    sizes=list(pool.map(check,records))
with (ROOT/'research/catalog-100/catalog-100.csv').open('w',encoding='utf-8-sig',newline='') as f:
    fields=['id','brand','name','nameZh','concentration','family','notes','sourceUrl','image','imageSourceUrl','imageLicense','verifiedAt']
    writer=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');writer.writeheader()
    for p in records:
        writer.writerow(dict(p,notes=' / '.join(p['notes'])))
print(f'PASS: 100 decoded images; 100 HTTP 200 byte matches; exact dataset row/image bindings; {sum(sizes)/1024/1024:.2f} MiB total')
