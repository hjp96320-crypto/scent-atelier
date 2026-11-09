"""Fetch exact, curated official product variants; emit candidates for visual review.

python scripts/match_official_images.py [--refresh]
Existing research HTML snapshots are reused unless --refresh is given.
Never publishes candidates automatically or treats a brand photo as CC-licensed.
"""
import hashlib
import io
import json
import re
import sys
import urllib.request
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
HOSTS = {'DIOR': 'www.dior.com', 'JO MALONE LONDON': 'www.jomalone.com'}


def pick_variant(html, spec):
    groups = []
    for raw in re.findall(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', html, re.S):
        data = json.loads(raw)
        if isinstance(data, dict) and data.get('@type') == 'ProductGroup':
            groups.append(data)
    groups = [g for g in groups if g.get('name') == spec['expectedName']]
    if len(groups) != 1:
        raise ValueError('Product name/version is missing or ambiguous')
    variants = [v for v in groups[0].get('hasVariant', []) if v.get('sku') == spec['sku']]
    if len(variants) != 1 or variants[0].get('size') != spec['expectedSize']:
        raise ValueError('Exact SKU/size is missing or ambiguous')
    variant = variants[0]
    if variant.get('name') not in (spec['expectedName'], spec['expectedName'] + ' - ' + spec['expectedSize']):
        raise ValueError('Variant name differs from the selected fragrance')
    image = variant.get('image', '')
    if urlparse(image).scheme != 'https' or urlparse(image).hostname != HOSTS[spec['brand']]:
        raise ValueError('Image is not on the verified official host')
    return variant


def fetch(url, host):
    if urlparse(url).scheme != 'https' or urlparse(url).hostname != host:
        raise ValueError('Unexpected source host')
    with urllib.request.urlopen(url, timeout=30) as response:
        if urlparse(response.url).hostname != host:
            raise ValueError('Unexpected redirect; manual review needed')
        return response.read(), response.headers.get_content_type()


def main():
    specs = json.loads((ROOT / 'research/official-catalog-sources.json').read_text(encoding='utf-8'))
    results, failures = [], []
    for spec in specs:
        try:
            host = HOSTS[spec['brand']]
            page = ROOT / f"research/{spec['id']}.html"
            if '--refresh' in sys.argv or not page.exists():
                body, content_type = fetch(spec['sourceUrl'], host)
                if content_type != 'text/html':
                    raise ValueError('Not an HTML product page')
                page.write_text(body.decode('utf-8'), encoding='utf-8')
            html = page.read_text(encoding='utf-8')
            variant = pick_variant(html, spec)
            body, content_type = fetch(variant['image'], host)
            if not content_type.startswith('image/'):
                raise ValueError('Image URL did not return an image')
            with Image.open(io.BytesIO(body)) as im:
                im.load()
                width, height = im.size
                if min(width, height) < 400 or im.format not in ('JPEG', 'PNG', 'WEBP'):
                    raise ValueError('Image too small or unsupported')
                suffix = {'JPEG': 'jpg', 'PNG': 'png', 'WEBP': 'webp'}[im.format]
            relative = f"assets/official/{spec['id']}.{suffix}"
            (ROOT / 'prototype' / relative).write_bytes(body)
            record = {k: v for k, v in spec.items() if k not in ('expectedName', 'expectedSize')}
            size_label = re.sub(r'_00_ml$|_ML$|ml$', ' mL', variant['size'])
            record.update(image=relative, imageAlt=f"{spec['brand']} {spec['name']} {spec['concentration']}，{size_label} 官网商品图",
                          imageSizeLabel=size_label,
                          imageSourceUrl=spec['sourceUrl'], imageOriginalUrl=variant['image'],
                          imageCredit=f"{spec['brand']} 官方商品图片；原图未修改",
                          imageLicense='品牌版权图片；未取得独立公开再分发授权',
                          imageRightsStatus='brand-copyright-unlicensed',
                          verifiedAt=date.today().isoformat(), officialName=variant['name'],
                          imageSize=variant['size'], width=width, height=height,
                          sha256=hashlib.sha256(body).hexdigest(),
                          pageSha256=hashlib.sha256(html.encode()).hexdigest(),
                          matchMethod='official JSON-LD exact product name + SKU + size',
                          reviewStatus='pending-visual-review')
            results.append(record)
            print(spec['id'], 'matched', width, height, flush=True)
        except Exception as exc:
            failures.append({'id': spec['id'], 'reason': str(exc)})
            print(spec['id'], 'pending:', str(exc), flush=True)
    (ROOT / 'research/official-image-candidates.json').write_text(
        json.dumps({'candidates': results, 'failures': failures}, ensure_ascii=False, indent=2), encoding='utf-8')
    if failures:
        sys.exit(1)


if __name__ == '__main__':
    main()
