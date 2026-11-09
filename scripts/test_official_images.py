import json
import unittest
from pathlib import Path

from match_official_images import pick_variant


class OfficialMatchTest(unittest.TestCase):
    def setUp(self):
        self.spec = {'brand': 'DIOR', 'expectedName': 'Example Eau de Parfum',
                     'sku': 'SKU100', 'expectedSize': '100ml'}
        self.product = {'@type': 'ProductGroup', 'name': 'Example Eau de Parfum',
                        'hasVariant': [{'sku': 'SKU100', 'name': 'Example Eau de Parfum',
                                        'size': '100ml', 'image': 'https://www.dior.com/example.jpg'}]}

    def match(self):
        return pick_variant('<script type="application/ld+json">' + json.dumps(self.product) + '</script>', self.spec)

    def test_exact_match(self):
        self.assertEqual(self.match()['sku'], 'SKU100')

    def test_reject_different_concentration(self):
        self.product['name'] = 'Example Eau de Toilette'
        with self.assertRaises(ValueError):
            self.match()

    def test_reject_size_or_sku_mismatch(self):
        for field, value in [('size', '50ml'), ('sku', 'BODY_LOTION')]:
            with self.subTest(field=field):
                original = self.product['hasVariant'][0][field]
                self.product['hasVariant'][0][field] = value
                with self.assertRaises(ValueError):
                    self.match()
                self.product['hasVariant'][0][field] = original

    def test_reject_unverified_image_host(self):
        self.product['hasVariant'][0]['image'] = 'https://other.example/image.jpg'
        with self.assertRaises(ValueError):
            self.match()

    def test_reject_ambiguous_products(self):
        self.product['hasVariant'] *= 2
        with self.assertRaises(ValueError):
            self.match()


if __name__ == '__main__':
    unittest.main()
