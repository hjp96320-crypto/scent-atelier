import concurrent.futures,urllib.request,time,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SIZE=875465236
PART=16*1024*1024
folder=ROOT/'research/catalog-full';folder.mkdir(exist_ok=True)
def part(start):
 end=min(SIZE,start+PART);p=folder/f'part-{start}.bin'
 if p.exists() and p.stat().st_size==end-start:return p
 for attempt in range(4):
  try:
   req=urllib.request.Request(f'https://huggingface.co/datasets/doevent/perfume/resolve/main/images.zip?fullpart={start}',headers={'Range':f'bytes={start}-{end-1}'})
   with urllib.request.urlopen(req,timeout=120) as res:
    assert res.status==206 and res.headers['Content-Range']==f'bytes {start}-{end-1}/{SIZE}'
    data=res.read()
   assert len(data)==end-start
   p.write_bytes(data);print('Downloaded',start,end,flush=True);return p
  except Exception:
   if attempt==3:raise
 return p
if __name__=='__main__':
 archive=folder/'images.zip'
 if not archive.exists():
  with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: parts=list(pool.map(part,range(0,SIZE,PART)))
  with archive.open('wb') as out:
   for p in parts:out.write(p.read_bytes())
 print('Archive ready',archive.stat().st_size,flush=True)
