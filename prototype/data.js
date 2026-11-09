import fullRows from './catalog-full-rows.js';
import {mergeCatalog} from './catalog-model.mjs';
import {enrichCatalog} from './catalog-enrichment.mjs';
import {localizeCatalog} from './catalog-presentation.mjs?v=20261108-calendar';
import {brandLabels} from './catalog-zh-names.mjs';
import {officialPerfumes} from './official-perfumes.js?v=20261108-reviewed';
import {catalogExpansion} from './catalog-expansion.js?v=20261108-100';
export const brandNames = brandLabels;
// Original three licensed-image samples, checked against the linked brand pages on 2026-11-08.
// Families are editorial navigation labels. Notes summarize published olfactory notes,
// not molecular composition or percentages. Image rights and credits remain separate.
export const curatedPerfumes = [
  {
    id: 'chanel-coco-mademoiselle-edp',
    brand: 'CHANEL',
    name: 'COCO MADEMOISELLE',
    nameZh: '可可小姐',
    concentration: 'Eau de Parfum',
    family: '琥珀花香',
    notes: ['橙子', '茉莉', '五月玫瑰', '广藿香', '香根草'],
    description: '明亮橙香展开，茉莉与五月玫瑰形成花香中心，随后呈现广藿香和香根草的侧面。',
    image: 'assets/coco-mademoiselle-edp.jpg',
    imageAlt: 'CHANEL COCO MADEMOISELLE Eau de Parfum 100 ml 实物瓶与包装盒，白色背景',
    sourceUrl: 'https://www.chanel.com/us/fragrance/p/116420/coco-mademoiselle-eau-de-parfum-spray/',
    imageSourceUrl: 'https://world.openbeautyfacts.org/product/3145891165203/coco-mademoiselle-100-ml-chanel',
    imageCredit: 'baslad01 / Open Beauty Facts；原图未修改',
    imageLicense: 'CC BY-SA 3.0（按 Open Beauty Facts 公布的图片许可）',
    imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    verifiedAt: '2026-11-08',
    chemistry: {
      title: '从香调走向成分',
      text: '品牌公开的橙子、花香与广藿香描述用于说明气味。官网另列成分表，但未公布各原料比例；这些香调不能直接换算成分子含量。',
      sourceUrl: 'https://www.chanel.com/us/fragrance/p/116420/coco-mademoiselle-eau-de-parfum-spray/'
    }
  },
  {
    id: 'dior-sauvage-edt',
    brand: 'DIOR',
    name: 'SAUVAGE',
    nameZh: '旷野',
    concentration: 'Eau de Toilette',
    family: '柑橘木质',
    notes: ['卡拉布里亚佛手柑', '四川花椒', 'Ambroxan', '榄香脂', '木质'],
    description: '佛手柑带来清新开场，辛香与琥珀木质侧面相接。此处专指 Eau de Toilette 版本。',
    image: 'assets/sauvage-edt.jpg',
    imageAlt: 'Dior Sauvage Eau de Toilette 实物瓶与包装盒，白色背景',
    sourceUrl: 'https://www.dior.com/en_us/beauty/products/sauvage-eau-de-toilette-F068524009.html',
    imageSourceUrl: 'https://world.openbeautyfacts.org/product/3348901321129/dior-sauvage-edt-erkek-parfum-200-ml',
    imageCredit: 'openfoodfacts-contributors / Open Beauty Facts；原图未修改',
    imageLicense: 'CC BY-SA 3.0（按 Open Beauty Facts 公布的图片许可）',
    imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    verifiedAt: '2026-11-08',
    chemistry: {
      title: 'Ambroxan 与木质琥珀感',
      text: 'Dior 在这款 EDT 的官方香调资料中特别介绍 Ambroxan 的海洋木质侧面。这支持了解一种代表原料，但没有给出其实际含量或完整配方。',
      sourceUrl: 'https://www.dior.com/en_us/beauty/products/sauvage-eau-de-toilette-F068524009.html'
    }
  },
  {
    id: 'calvin-klein-ck-one-edt',
    brand: 'CALVIN KLEIN',
    name: 'CK ONE',
    nameZh: 'CK One',
    concentration: 'Eau de Toilette',
    family: '清新柑橘',
    notes: ['佛手柑', '小豆蔻', '菠萝', '木瓜', '茉莉', '紫罗兰', '玫瑰', '肉豆蔻', '麝香', '琥珀'],
    description: '品牌以贯穿的绿茶清新感描述这款香水；果香与辛香开启，接续花香和麝香、琥珀侧面。',
    image: 'assets/ck-one-edt.jpg',
    imageAlt: 'Calvin Klein CK One 经典磨砂瓶实拍，白色背景；2008 年照片',
    sourceUrl: 'https://www.calvinklein.us/en/women/fragrance/fragrance/ck-one/10740-000.html',
    imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:CK_One.jpg',
    imageCredit: 'Gonna Fly Now / Wikimedia Commons；2008 年照片，原图未修改',
    imageLicense: 'CC BY-SA 2.0',
    imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    verifiedAt: '2026-11-08',
    chemistry: {
      title: '“绿茶感”描述什么',
      text: '绿茶是品牌对整体香气的描述。公开香调没有提供完整分子组成，因此不能仅凭这段描述推算茶提取物或其他原料的比例。',
      sourceUrl: 'https://www.calvinklein.us/en/women/fragrance/fragrance/ck-one/10740-000.html'
    }
  },
  ...officialPerfumes,
  ...catalogExpansion
];

export const perfumes = localizeCatalog(enrichCatalog(mergeCatalog(curatedPerfumes, fullRows)));
