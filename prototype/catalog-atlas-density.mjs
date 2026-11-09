// Fixed data-space kernel; zooming never changes density values. Float64 CPU
// accumulation avoids mobile GPU float-texture precision limits.
export function densityGrid(points,size=160){
 if(points.length<20)return null;
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
 const span=Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys),1),pad=span*.12;
 const x0=Math.min(...xs)-pad,y0=Math.min(...ys)-pad,step=(span+pad*2)/(size-1),sigma=3.2,radius=10;
 const values=new Float64Array(size*size),kernel=[];
 for(let d=-radius;d<=radius;d++)kernel.push(Math.exp(-d*d/(2*sigma*sigma)));
 for(const [x,y] of points){
  const cx=Math.round((x-x0)/step),cy=Math.round((y-y0)/step);
  for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
   const gx=cx+dx,gy=cy+dy;if(gx>=0&&gx<size&&gy>=0&&gy<size)values[gy*size+gx]+=kernel[dx+radius]*kernel[dy+radius];
  }
 }
 return {values,max:Math.max(...values),size,bounds:[x0,y0,x0+step*(size-1),y0+step*(size-1)]};
}
