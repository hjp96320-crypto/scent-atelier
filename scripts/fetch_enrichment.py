import urllib.request,json,re,sys,hashlib
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]/'research/catalog-enrichment'
def fetch(key,url):
 p=ROOT/f'{key}.html'
 try:
  if not p.exists():
   with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=35) as r:p.write_bytes(r.read())
  soup=BeautifulSoup(p.read_bytes(),'html.parser')
  meta=[x.get('content') for x in soup.select('meta[property="og:image"],meta[name="twitter:image"]')]
  ld=[]
  for x in soup.select('script[type="application/ld+json"]'):
   try:ld.append(json.loads(x.string or x.get_text()))
   except ValueError:pass
  images=[{'src':x.get('src') or x.get('data-src'),'alt':x.get('alt')} for x in soup.select('img') if x.get('alt')]
  data={'url':url,'title':soup.title.get_text() if soup.title else '', 'og':meta,'ld':ld,'images':images}
  (ROOT/f'{key}-metadata.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
  for x in soup(['script','style','nav','footer']):x.decompose()
  (ROOT/f'{key}.txt').write_text(soup.get_text(' ',strip=True),encoding='utf8')
  print(key,json.dumps(data,ensure_ascii=False)[:5000])
 except Exception as e:print(key,type(e).__name__,str(e))
if __name__=='__main__':fetch(sys.argv[1],sys.argv[2])
