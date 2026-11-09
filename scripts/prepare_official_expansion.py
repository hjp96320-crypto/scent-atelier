"""Match exact 100 mL official SKUs and download originals for visual review."""
import concurrent.futures
import hashlib
import io
import json
from pathlib import Path
from PIL import Image
from match_official_images import pick_variant, fetch, HOSTS

ROOT = Path(__file__).resolve().parents[1]
META = '''
dior-dior-homme-intense|桀骜浓香|Eau de Parfum Intense|鸢尾木质|鸢尾、琥珀、雪松
dior-eau-sauvage-eau-de-toilette|清新之水|Eau de Toilette|柑橘西普|佛手柑、Hedione、薰衣草、西普调
dior-fahrenheit-eau-de-toilette|华氏温度|Eau de Toilette|皮革木质|柑橘、紫罗兰叶、皮革、木质调
dior-sauvage-eau-de-parfum|旷野浓香|Eau de Parfum|柑橘琥珀|佛手柑、香草
dior-sauvage-elixir|旷野之心|Elixir|辛香木质|肉桂、肉豆蔻、小豆蔻、薰衣草、木质调
dior-hypnotic-poison-eau-de-toilette|蛊媚奇葩|Eau de Toilette|琥珀美食|苦杏仁、茉莉、香草
dior-pure-poison|纯真诱惑|Eau de Parfum|白花琥珀|橙花、茉莉、栀子花、琥珀、檀香
jo-wild-bluebell|蓝风铃|Cologne|清新花香|蓝风铃、铃兰、野蔷薇、柿子
jo-blackberry-bay|黑莓与月桂叶|Cologne|绿意果香|黑莓、月桂叶
jo-orange-blossom|橙花|Cologne|柑橘花香|克莱门汀橘、橙花、白丁香、鸢尾木
jo-nectarine-blossom-honey|油桃花与蜂蜜|Cologne|甜润果香|桃子
jo-red-roses|红玫瑰|Cologne|玫瑰花香|玫瑰、紫罗兰叶、柠檬
jo-myrrh-tonka|没药与零陵香|Cologne Intense|树脂琥珀|没药、零陵香豆、杏仁、香草
jo-velvet-rose-oud|丝绒玫瑰与乌木|Cologne Intense|花香木质|大马士革玫瑰、沉香调、丁香、果仁糖
jo-pomegranate-noir|黑石榴|Cologne|果香木质|石榴、粉红胡椒、百合、广藿香、愈创木
jo-grapefruit|葡萄柚|Cologne|柑橘芳香|葡萄柚、迷迭香、薄荷、多香果
jo-mimosa-cardamom|含羞草与小豆蔻|Cologne|花香辛香|含羞草、小豆蔻、零陵香豆、檀香、天芥菜
jo-honeysuckle-davana|忍冬与印蒿|Cologne|芳香花香|忍冬、玫瑰、印蒿、苔藓
jo-english-oak-hazelnut|英国橡树与榛果|Cologne|绿意木质|青榛果、香根草、烘烤橡木
'''
TABLE={v[0]:v[1:] for v in (line.split('|') for line in META.strip().splitlines())}


def prepare(item):
    key=item['id'];group=item['group'];brand='DIOR' if key.startswith('dior-') else 'JO MALONE LONDON'
    name_zh,concentration,family,notes=TABLE[key]
    variants=[v for v in group['hasVariant'] if (v.get('size') or '').lower() in ['100ml','100_ml','100_00_ml']]
    assert len(variants)==1
    selected=variants[0]
    spec=dict(brand=brand,expectedName=group['name'],sku=selected['sku'],expectedSize=selected['size'])
    html=(ROOT/f'research/catalog-100/{key}.html').read_text(encoding='utf-8')
    variant=pick_variant(html,spec)
    body,ctype=fetch(variant['image'],HOSTS[brand])
    assert ctype.startswith('image/')
    with Image.open(io.BytesIO(body)) as im:
        im.load();width,height=im.size;suffix={'PNG':'png','JPEG':'jpg'}[im.format]
        assert min(width,height)>=400
    relative=f'assets/official/{key}.{suffix}'
    (ROOT/'prototype'/relative).write_bytes(body)
    record=dict(id=key,brand=brand,name=group['name'].strip(),nameZh=name_zh,concentration=concentration,family=family,
                notes=notes.split('、'),description=f'官网香调摘要：{notes}。资料与图片对应本次核对的 {concentration} 版本。',
                sourceUrl=item['sourceUrl'],image=relative,imageAlt=f'{brand} {group["name"].strip()}，100 mL 官网商品图',
                imageSourceUrl=item['sourceUrl'],imageOriginalUrl=variant['image'],imageSourceType='official',
                imageCredit=f'{brand} 官方商品图片；原图未修改',imageLicense='品牌版权图片；未取得独立公开再分发授权',
                imageRightsStatus='brand-copyright-unlicensed',verifiedAt='2026-11-08',officialName=group['name'],
                sku=variant['sku'],imageSize=variant['size'],imageSizeLabel='100 mL',width=width,height=height,
                sha256=hashlib.sha256(body).hexdigest(),pageSha256=hashlib.sha256(html.encode()).hexdigest(),
                matchMethod='official JSON-LD exact product name + SKU + size',reviewStatus='pending-visual-review')
    print(key,width,height,flush=True)
    return record


if __name__=='__main__':
    groups=json.loads((ROOT/'research/catalog-100/official-groups.json').read_text(encoding='utf-8'))
    with concurrent.futures.ThreadPoolExecutor(4) as pool:
        records=list(pool.map(prepare,groups))
    (ROOT/'research/catalog-100/official-candidates.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
