export function untilNextDay(date=new Date()){
 const next=new Date(date);next.setHours(24,0,0,0);return next.getTime()-date.getTime()+100;
}
