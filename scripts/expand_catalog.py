"""Curated HF row selection and original image extraction; never auto-approves review."""
import csv
import hashlib
import io
import json
from http.client import IncompleteRead
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image
from hf_perfume_images import archive

ROOT = Path(__file__).resolve().parents[1]
# Explicit row, version, Chinese display name. The source name is retained unchanged.
SELECTION = '''
20113|EDP|蔚蓝
13685|EDP|五号
16094|EDP|邂逅柔情
7559|EDP|邂逅
520|EDP|黑色可可
3788|EDT|男士运动
19018|EDP|嘉柏丽尔精粹
24249|EDP|东方屏风
21769|EDT|寄情男士
21484|EDP|挚爱
16021|EDP|自我无界
2301|Parfum|密码香精
25237|EDP|因为你 · 浓情
12922|EDP|自由之水
12795|EDP|黑鸦片
3430|EDP|Y 男士
5757|EDP|反转巴黎
4588|EDT|天之骄子暗夜
24810|EDP|美丽人生
16711|EDP|是我
1489|EDP|奇迹
14097|EDT|普拉达男士
26030|EDT|卓越之水炭黑
879|EDP|我本莫测
4504|EDP|绽放
4121|EDP|罪爱男士
9897|EDP|绚丽栀子花
22500|EDT|狄伦蓝男士
19055|EDT|晶钻
7685|EDT|爱神
5199|EDT|经典男士
25646|EDP|她
8685|EDT|伦敦男士
23746|EDP|我的博柏利
22470|EDT|浅蓝女士
8146|EDP|唯我男士
6579|EDP|倾心
2584|EDP|心无禁忌
12699|EDP|绅士私藏
13956|EDP|怦然心动
22577|EDT|大地
3123|EDT|尼罗河花园
5550|EDP|丝意
3744|EDT|橘彩星光
7014|EDP|暗黑兰花
12625|EDP|珍华乌木
6830|EDP|烟草香草
11109|EDP|失落樱桃
18197|EDP|异域
6092|EDP|天使
5015|EDT|雏菊
12614|EDP|完美
14863|EDP|花之怒
12724|EDP|极致香料炸弹
15181|EDP Intense|裸男香精版
15201|EDP|美丽女人
1079|EDP|返璞归真
2468|EDP|莫哈维之影
14824|EDP|吉普赛之水
5473|EDP|杜桑
10504|EDP|希腊无花果
12474|EDP|爵梦
2581|EDP|百家乐红晶 540
18108|EDP|大夜
23113|EDP|拿破仑之水
2465|EDT|慵懒周末
5734|EDT|爵士酒廊
23511|EDT|壁炉火光
12399|EDP|理想男士
12735|EDP|一千零一夜
18249|EDP|我的娇兰
'''


def select():
    rows = list(csv.DictReader((ROOT / 'research/catalog-100/hf-perfumes.csv').open(encoding='utf-8'), delimiter='|'))
    result = []
    for line in SELECTION.strip().splitlines():
        index, concentration, name_zh = line.split('|')
        row = rows[int(index)]
        result.append(dict(rowIndex=int(index), concentration={'EDP':'Eau de Parfum','EDT':'Eau de Toilette','EDP Intense':'Eau de Parfum Intense'}.get(concentration,concentration), nameZh=name_zh, **row))
    return result


def extract(row):
    target = ROOT / f"prototype/assets/catalog/hf-{row['rowIndex']}.jpg"
    target.parent.mkdir(exist_ok=True)
    if not target.exists():
        for attempt in range(3):
            try:
                with archive() as z:
                    body = z.read('images/' + row['image_name'])
                break
            except (OSError, EOFError, IncompleteRead) as exc:
                if attempt == 2:
                    raise
                print('Retry',row['rowIndex'],type(exc).__name__,flush=True)
        target.write_bytes(body)
    body = target.read_bytes()
    with Image.open(io.BytesIO(body)) as im:
        im.load()
        width, height = im.size
        assert min(width,height)>=200 and im.format=='JPEG'
    print(row['rowIndex'], row['brand'], row['name_perfume'], width, height, flush=True)
    return dict(row, image=f'assets/catalog/{target.name}', width=width, height=height,
                sha256=hashlib.sha256(body).hexdigest(), reviewStatus='pending-visual-review')


if __name__ == '__main__':
    selected = select()
    print('Selected',len(selected),flush=True)
    with ThreadPoolExecutor(max_workers=4) as pool:
        result = list(pool.map(extract, selected))
    (ROOT/'research/catalog-100/hf-candidates.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
