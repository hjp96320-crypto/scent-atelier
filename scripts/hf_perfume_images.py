"""Read selected images from the public HF ZIP using verified HTTP byte ranges."""
import io
import urllib.request
import zipfile
from pathlib import Path

URL = 'https://huggingface.co/datasets/doevent/perfume/resolve/main/images.zip'
SIZE = 875465236
ROOT = Path(__file__).resolve().parents[1] / 'research/catalog-100'


class RemoteZip(io.RawIOBase):
    def __init__(self):
        self.position = 0

    def seekable(self):
        return True

    def tell(self):
        return self.position

    def seek(self, offset, whence=0):
        self.position = offset if whence == 0 else self.position + offset if whence == 1 else SIZE + offset
        return self.position

    def read(self, length=-1):
        start = self.position
        end = min(SIZE, start + length) if length >= 0 else SIZE
        if end <= start:
            return b''
        cache = ROOT / 'zip-ranges' / f'{start}-{end}.bin'
        cache.parent.mkdir(exist_ok=True)
        if cache.exists():
            body = cache.read_bytes()
        else:
            request = urllib.request.Request(URL + f'?range_start={start}&range_end={end}',
                                             headers={'Range': f'bytes={start}-{end-1}'})
            with urllib.request.urlopen(request, timeout=40) as response:
                expected = f'bytes {start}-{end-1}/{SIZE}'
                if response.status != 206 or response.headers.get('Content-Range') != expected:
                    raise ValueError('ZIP range not honored; refusing a full archive download')
                body = response.read()
            if len(body) != end - start:
                raise ValueError('Incomplete ZIP range')
            cache.write_bytes(body)
        self.position = end
        return body


def archive():
    return zipfile.ZipFile(RemoteZip())


if __name__ == '__main__':
    import json
    with archive() as z:
        names = z.namelist()
        (ROOT / 'image-zip-index.json').write_text(json.dumps(names), encoding='utf-8')
        print('ZIP entries:', len(names), 'sample:', names[:3])
