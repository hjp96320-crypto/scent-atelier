"""Collect a finite list of official product candidates for explicit identity review."""
import concurrent.futures
import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'research/catalog-100'
DIOR = ['dior-homme-intense-Y0479201', 'eau-sauvage-eau-de-toilette-Y0097001',
        'fahrenheit-eau-de-toilette-Y0066001', 'sauvage-eau-de-parfum-Y0785220',
        'sauvage-elixir-Y0996460', 'hypnotic-poison-eau-de-toilette-Y0063401',
        'pure-poison-Y0083201']
JO = ['wild-bluebell', 'blackberry-bay', 'orange-blossom', 'nectarine-blossom-honey',
      'red-roses', 'myrrh-tonka', 'velvet-rose-oud', 'pomegranate-noir',
      'grapefruit', 'mimosa-cardamom', 'honeysuckle-davana', 'english-oak-hazelnut']


def collect(item):
    key, url = item
    path = OUT / (key + '.html')
    if not path.exists():
        path.write_bytes(urllib.request.urlopen(url, timeout=40).read())
    html = path.read_text(encoding='utf-8')
    groups = []
    for raw in re.findall(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', html, re.S):
        data = json.loads(raw)
        if isinstance(data,dict) and data.get('@type') == 'ProductGroup':
            groups.append(data)
    if len(groups) != 1:
        raise ValueError(f'{key}: ambiguous product group')
    g = groups[0]
    print(key,g['name'],[(v['sku'],v.get('size')) for v in g['hasVariant']],flush=True)
    return dict(id=key,sourceUrl=url,group=g)


if __name__ == '__main__':
    urls = [('dior-'+slug.rsplit('-Y',1)[0], 'https://www.dior.com/en_us/beauty/products/'+slug+'.html') for slug in DIOR]
    links = json.loads((OUT/'jo-links.json').read_text())
    for slug in JO:
        found = [u for u in links if u.rsplit('/',1)[-1] in (slug+'-cologne',slug+'-cologne-intense')]
        assert len(found)==1, slug
        urls.append(('jo-'+slug,found[0]))
    with concurrent.futures.ThreadPoolExecutor(4) as pool:
        groups=list(pool.map(collect,urls))
    (OUT/'official-groups.json').write_text(json.dumps(groups,ensure_ascii=False,indent=2),encoding='utf-8')
