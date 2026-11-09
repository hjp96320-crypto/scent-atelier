import concurrent.futures,urllib.request
from pathlib import Path
root=Path('research/catalog-full');size=875465236;part=16*1024*1024;small=1024*1024
missing=[x for x in range(0,size,part) if not (root/f'part-{x}.bin').exists()]
def piece(t):
 a,b=t
 path=root/f'small-{a}.bin'
 if path.exists() and path.stat().st_size==b-a:return path.read_bytes()
 for attempt in range(4):
  try:
   req=urllib.request.Request(f'https://huggingface.co/datasets/doevent/perfume/resolve/main/images.zip?smallrange={a}-{b}&attempt={attempt}',headers={'Range':f'bytes={a}-{b-1}'})
   with urllib.request.urlopen(req,timeout=45) as r:
    assert r.status==206 and r.headers['Content-Range']==f'bytes {a}-{b-1}/{size}'
    data=r.read()
   assert len(data)==b-a
   path.write_bytes(data);return data
  except Exception:
   if attempt==3:raise

for start in missing:
 end=min(size,start+part)
 with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:data=b''.join(pool.map(piece,[(a,min(a+small,end)) for a in range(start,end,small)]))
 (root/f'part-{start}.bin').write_bytes(data)
 print('Recovered',start,flush=True)
if all((root/f'part-{a}.bin').exists() for a in range(0,size,part)):
 with (root/'images.zip').open('wb') as out:
  for a in range(0,size,part):out.write((root/f'part-{a}.bin').read_bytes())
 print('Archive ready',flush=True)
