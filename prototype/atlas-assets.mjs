// Cache successful downloads, and only request geography for the map view.
export function createAtlasAssetLoader(fetchJSON,loadRenderer){
 const cache=new Map();
 function get(key,load){
  if(!cache.has(key))cache.set(key,Promise.resolve().then(load).catch(error=>{cache.delete(key);throw error;}));
  return cache.get(key);
 }
 const json=file=>get(file,()=>fetchJSON('assets/atlas/'+file));
 return mode=>Promise.all([
  json('atlas-data.json'),
  mode==='map'?json('world.json'):Promise.resolve({type:'FeatureCollection',features:[]}),
  mode==='map'?json('brand-locations.json'):Promise.resolve({brands:[]}),
  mode==='map'?json('admin1.json'):Promise.resolve({type:'FeatureCollection',features:[]}),
  mode==='star'?json('local-groups.json?v=20261109-all-groups'):Promise.resolve({groups:[]}),
  get('renderer',loadRenderer)
 ]);
}
