// The UI uses Chinese descriptions or generated impressions. Keep untranslated
// source prose in the repository, instead of downloading it with every catalog.
export function compactCatalogRows(rows){
 return rows.map(row=>{
  const copy=[...row];
  if(!/[\u3400-\u9fff]/.test(copy[6]||''))copy[6]='';
  return copy;
 });
}
