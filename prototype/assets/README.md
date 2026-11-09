# 原型真实产品图片与资料来源

核验日期：2026-11-08（Asia/Shanghai）。本目录用于三款真实香水的交互原型，不代表已完成主流品牌目录或生产上线审核。

图片均为现存摄影文件，未使用图像生成、去背、修瓶或修改标签。使用 `object-fit: contain` 显示，避免裁掉瓶身或版本文字。图鉴香调由品牌官网核对；照片与资料分别记录来源。以下图片不是品牌授予本项目的代言或合作素材。

| 本地文件 | 产品与目视核验 | 来源、署名和许可 |
|---|---|---|
| `coco-mademoiselle-edp.jpg` | COCO MADEMOISELLE，盒身可读 EAU DE PARFUM、100 ml；瓶盒同框，非网页截屏 | [Open Beauty Facts 条目](https://world.openbeautyfacts.org/product/3145891165203/coco-mademoiselle-100-ml-chanel)，上传者 baslad01；按该站声明 [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)，原图未修改 |
| `sauvage-edt.jpg` | SAUVAGE 与 Dior 标识可见，盒身为 EAU DE TOILETTE；OBF 条码条目标为 EDT 200 ml；瓶盒同框，非网页截屏 | [Open Beauty Facts 条目](https://world.openbeautyfacts.org/product/3348901321129/dior-sauvage-edt-erkek-parfum-200-ml)，上传者 openfoodfacts-contributors；按该站声明 [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)，原图未修改 |
| `ck-one-edt.jpg` | CK One 经典磨砂瓶；Commons 文件说明为 CK One，照片拍摄于 2008-05-20，不代表当前包装年份 | [Wikimedia Commons 文件说明](https://commons.wikimedia.org/wiki/File:CK_One.jpg)，作者 Gonna Fly Now；[CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)，原图未修改 |

## 文件原始地址

- [Chanel 原始图片](https://images.openbeautyfacts.org/images/products/314/589/116/5203/front_fr.6.400.jpg)
- [Dior 原始图片](https://images.openbeautyfacts.org/images/products/334/890/132/1129/front_en.6.400.jpg)
- [CK One 原始图片](https://upload.wikimedia.org/wikipedia/commons/3/31/CK_One.jpg)

Open Beauty Facts 的 [官方数据与许可说明](https://world.openbeautyfacts.org/data) 将产品图片声明为 CC BY-SA 3.0。其数据库许可为 ODbL、单条内容许可为 DbCL，不能把图片许可与整库许可混同。本次仅通过小样本 API 核对身份、图片和上传者，没有导入其整个数据库。图片在页面上应保留可到达的来源、作者、许可链接和未修改说明。网站公开许可声明不等同于品牌官方素材授权；生产使用仍需核验具体素材来源链。

## 品牌信息来源

- [CHANEL COCO MADEMOISELLE EDP](https://www.chanel.com/us/fragrance/p/116420/coco-mademoiselle-eau-de-parfum-spray/)：橙子、茉莉、五月玫瑰、广藿香、香根草。官网页面展示 50 ml 规格，样本照片展示同一 EDP 的 100 ml 规格；不把规格差异当作不同香调。
- [Dior Sauvage EDT](https://www.dior.com/en_us/beauty/products/sauvage-eau-de-toilette-F068524009.html)：佛手柑、四川花椒、Ambroxan、榄香脂及木质描述。没有将 EDP 或 Parfum 的香调混入。
- [Calvin Klein CK One](https://www.calvinklein.us/en/women/fragrance/fragrance/ck-one/10740-000.html)：品牌公布前调佛手柑/小豆蔻/菠萝/木瓜，中调茉莉/紫罗兰/玫瑰/肉豆蔻，后调麝香/琥珀；品牌正文描述绿茶清新感。EDT 身份也见 [Ulta CK One EDT](https://www.ulta.com/p/ck-one-eau-de-toilette-2486)。

`family` 是依据公开描述制作的编辑导航标签，并非量化实验结果。`chemistry` 只作有来源的解释，不推断未公开分子或含量。三款信息均为独立人工核验样本，尚未接入 Scento 或商业数据库。

## 本轮未采用

Hermès 的开放样本为低质外包装照片，没有用于主界面。Dior 另一个 60 ml 开放样本目视为 Parfum，未拿来替代 EDT。CHANEL、Dior、Hermès 官网页面的本机直接抓取返回 403；没有绕过限制，也未据此获取品牌图片。品牌香调仍通过可访问的公开网页检索核对。

## 2026-11-08 新增官网图

`official/` 的7张商品图来自Dior与Jo Malone官方商品页，原图未修改。准确图片URL、SKU、规格、哈希及核查日期记录在 `../../research/official-image-manifest.json`。这些图片是品牌版权图片，不继承以上CC许可；当前用于本地原型引用，未取得独立公开再分发授权。

## 100款目录补充（2026-11-08）

当前目录使用27张官方图、70张数据集图片、3张上述开放许可实拍。新增图片逐张查看，原始文件未修改。Dior图的页面留白仅以CSS调整。

`catalog/hf-*.jpg` 取自 https://huggingface.co/datasets/doevent/perfume 的2024快照，按CSV原始image_name从images.zip逐一提取；ZIP字节范围获取不下载整个875MB文件。数据集声明MIT，但未核实其第三方图片独立授权，不将图片标成MIT。Burberry Her使用`official/burberry-her.jpg`官网替换图；先前提取的HF候选保留作审计，不计入当前图片来源数量。

新增官网图按商品编号、具体版本与容量绑定。Burberry官方图片主机为assets.burberry.com；Dior和Jo Malone沿用各自官方主机。完整来源、原图URL、文件哈希、审阅记录及数据集行索引见`../../research/catalog-100/published-manifest.json`、`visual-review.json`与`catalog-100.csv`。原先7张官网图的记录仍保留在`../../research/official-image-manifest.json`。
