// Locations are reviewed city representatives. Never infer a city from a country.
export function brandGeography(items,locations){
 const lookup=new Map(locations.brands.map(b=>[b.brand,b])),brands=new Map(),cities=new Map(),unlocated=[];
 for(const p of items){
  if(!brands.has(p.brand))brands.set(p.brand,{brand:p.brand,name:p.displayBrand,items:[],location:null});
  brands.get(p.brand).items.push(p);
 }
 for(const b of brands.values()){
  const l=lookup.get(b.brand);
  if(!l||!b.items.every(p=>p.region===l.region)){unlocated.push(b);continue;}
  b.location=l;
  if(!cities.has(l.cityId))cities.set(l.cityId,{id:l.cityId,name:l.city,region:l.region,position:l.position,brands:[],count:0});
  const city=cities.get(l.cityId);city.brands.push(b);city.count+=b.items.length;
 }
 for(const city of cities.values())city.brands.sort((a,b)=>b.items.length-a.items.length||a.name.localeCompare(b.name,'zh'));
 return {cities:[...cities.values()].sort((a,b)=>b.brands.length-a.brands.length||b.count-a.count),
  brands:[...brands.values()],unlocated,located:brands.size-unlocated.length};
}

// Fit the main territory and nearby islands, including any reviewed city points.
// Remote overseas components do not force France or the US back to a world view.
export function countryBounds(feature,positions=[]){
 if(!feature)return null;
 const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;
 const area=ring=>Math.abs(ring.reduce((s,p,i)=>{const q=ring[(i+1)%ring.length];return s+p[0]*q[1]-q[0]*p[1];},0));
 const main=[...polygons].sort((a,b)=>area(b[0])-area(a[0]))[0][0];
 const center=main.reduce((s,p)=>s+p[0],0)/main.length;
 const unwrap=x=>x-center>180?x-360:x-center< -180?x+360:x;
 const mainX=main.map(p=>unwrap(p[0])),x0=Math.min(...mainX),x1=Math.max(...mainX);
 const rings=polygons.map(p=>p[0]).filter(r=>r.some(p=>unwrap(p[0])>=x0-12&&unwrap(p[0])<=x1+12&&Math.abs(p[1]-main[0][1])<70));
 // France's overseas territories and US Alaska/Hawaii are excluded from the initial mainland frame.
 const points=(['法国','美国'].includes(feature.properties.name)?[main]:rings).flat().concat(positions);
 const xs=points.map(p=>unwrap(p[0])),ys=points.map(p=>Math.max(-80,Math.min(80,p[1])));
 return [[Math.min(...xs),Math.min(...ys)],[Math.max(...xs),Math.max(...ys)]];
}
