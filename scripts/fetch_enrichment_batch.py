import json,concurrent.futures
from fetch_enrichment import fetch,ROOT
s=json.loads((ROOT/'sources.json').read_text(encoding='utf8'))
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:list(pool.map(lambda item:fetch(item[0],item[1]['url']),s.items()))
