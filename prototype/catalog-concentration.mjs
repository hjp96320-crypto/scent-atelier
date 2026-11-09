// Version labels are categorical metadata, never inferred oil percentages.
const labels=['Eau de Parfum Intense','Eau de Parfum Légère','Eau de Parfum Absolue','Eau de Toilette Intense','Extrait de Parfum','Eau de Parfum','Eau de Toilette','Eau de Cologne','Pure Parfum','Cologne Intense','Parfum','Cologne','Elixir'];
export function canonicalConcentration(value){return labels.find(label=>label.toLowerCase()===String(value||'').trim().toLowerCase())||'';}
export function namedConcentration(name){
 // A bare 'Parfum', 'Cologne' or 'Elixir' can be part of a fragrance name.
 const match=String(name).match(/\b(Extrait de Parfum|Eau de Parfum(?: Intense| Légère| Absolue)?|Eau de Toilette(?: Intense)?|Eau de Cologne)\b/i);
 return canonicalConcentration(match?.[1]);
}
export function concentrationGroup(value){
 if(!value||['浓度未单独标注','浓度未知'].includes(value))return 'unknown';
 if(/^Eau de Parfum/i.test(value))return 'edp';
 if(/^Eau de Toilette/i.test(value))return 'edt';
 if(/^(?:Pure Parfum|Parfum|Extrait de Parfum)$/i.test(value))return 'parfum';
 if(/^(?:Eau de Cologne|Cologne(?: Intense)?)$/i.test(value))return 'cologne';
 return 'other';
}
