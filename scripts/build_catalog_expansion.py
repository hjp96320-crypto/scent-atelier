"""Build the reviewed catalog addition. Image hash changes require a new visual review."""
import csv
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'research/catalog-100'
HF = 'https://huggingface.co/datasets/doevent/perfume'


def read(name):
    return json.loads((DATA/name).read_text(encoding='utf-8'))


def build():
    curation={int(r['rowIndex']):r for r in csv.DictReader((DATA/'curation.tsv').open(encoding='utf-8'),delimiter='\t')}
    references={r['rowIndex']:r for r in read('official-references.json')}
    reviews={r['id']:r for r in read('visual-review.json')}
    csv_hash=hashlib.sha256((DATA/'hf-perfumes.csv').read_bytes()).hexdigest()
    records=[]
    for r in read('hf-candidates.json'):
        index=r['rowIndex'];c=curation[index];ref=references[index]
        record=dict(id=f'hf-{index}',brand=r['brand'].upper(),name=r['name_perfume'],nameZh=r['nameZh'],
                    concentration=r['concentration'],family=c['family'],notes=c['notes'].split('、'),description=c['description'],
                    sourceUrl=ref['officialReferenceUrl'] if ref['useAsPrimary'] else HF,
                    sourceLabel='品牌官网资料' if ref['useAsPrimary'] else '2024 数据集 · 旧版资料',
                    officialReferenceUrl=ref['officialReferenceUrl'],datasetUrl=HF,datasetRowIndex=index,
                    datasetRecordName=r['brand']+' / '+r['name_perfume'],datasetCsvSha256=csv_hash,
                    datasetImageName=r['image_name'],datasetSnapshot='2024',
                    image=r['image'],imageAlt=f'{r["brand"]} {r["name_perfume"]}，{r["concentration"]}，2024 数据集收录的真实商品瓶图',
                    imageSourceType='dataset',imageSourceUrl=HF+'/blob/main/images.zip',
                    imageCredit='doevent/perfume（Hugging Face）收录的商品图片；原图未修改',
                    imageLicense='数据集声明 MIT；第三方商品图片的独立授权未核实',imageRightsStatus='third-party-rights-unverified',
                    verifiedAt='2026-11-08',width=r['width'],height=r['height'],sha256=r['sha256'],
                    matchMethod='exact CSV brand + product row + image_name; bottle and version visual review',
                    versionNote='图片为 2024 数据集收录包装，可能与现售包装不同。香调摘要结合品牌资料与数据集整理。')
        if index==8146:
            record['versionNote']='旧版 The One for Men EDP（2024 数据集收录）。本条保留烟草、琥珀香调，不与当前官网 2026 新版合并。'
            record['nameZh']='唯我男士 · 旧版'
        if index==25646:
            b=read('burberry-official-image.json')
            assert b['product']['sku']=='40804591' and b['product']['name']=='Her Eau de Parfum 100ml - Women | Burberry® Official'
            record.update(image='assets/official/burberry-her.jpg',imageSourceType='official',imageOriginalUrl=b['url'],
                          imageSourceUrl=ref['officialReferenceUrl'],imageAlt='BURBERRY Her Eau de Parfum，100 mL 官网商品图',
                          imageCredit='BURBERRY 官方商品图片；原图未修改',imageLicense='品牌版权图片；未取得独立公开再分发授权',
                          imageRightsStatus='brand-copyright-unlicensed',sku=b['product']['sku'],imageSize='100ml',imageSizeLabel='100 mL',
                          width=b['width'],height=b['height'],sha256=b['sha256'],officialName=b['product']['name'],
                          matchMethod='official Product JSON-LD exact name + SKU 40804591 + 100ml',
                          versionNote='图片按官网 Her Eau de Parfum 100 mL 商品编号匹配；非 Elixir、Intense 或 Parfum 版本。')
        records.append(record)
    records.extend(read('official-candidates.json'))
    assert len(records)==90 and len({r['id'] for r in records})==90
    for r in records:
        review=reviews[r['id']]
        digest=hashlib.sha256((ROOT/'prototype'/r['image']).read_bytes()).hexdigest()
        assert digest==r['sha256']==review['sha256'],f'Image requires review: {r["id"]}'
        r.update(reviewStatus='visually-verified',reviewNote=review['note'])
    (ROOT/'prototype/catalog-expansion.js').write_text(
        '// Built from reviewed source records by scripts/build_catalog_expansion.py.\nexport const catalogExpansion = '+json.dumps(records,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
    (DATA/'published-manifest.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
    print('Built',len(records),'reviewed entries')


if __name__=='__main__':
    build()
