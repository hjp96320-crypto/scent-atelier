// Summarize saved audits; this script does not regenerate audits or catalog data.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {perfumes} from '../prototype/data.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const outputDir=path.join(root,'research/catalog-pyramids-discovery');
const bulkDir=path.join(outputDir,'bulk-dry-run');
const readJson=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const before=readJson(path.join(root,'research/catalog-pyramids/audit-current-coverage.json'));
const after=readJson(path.join(outputDir,'audit-after-coverage.json'));
const manual=readJson(path.join(outputDir,'manual-research.json')).records;
const unmatched=Object.fromEntries(['parfumo','fragrantica'].map(source=>[source,new Map(readJson(path.join(bulkDir,source,'unmatched.json')).map(record=>[record.sourceRowIndex,record.reason]))]));
const conflicts=new Map(readJson(path.join(bulkDir,'cross-source-stage-diffs.json')).map(record=>[record.sourceRowIndex,record]));
const currentById=new Map(perfumes.map(perfume=>[perfume.id,perfume]));
const manualById=new Map(manual.map(record=>[record.id,record]));
const manualByRow=new Map(manual.filter(record=>Number.isInteger(record.sourceRowIndex)).map(record=>[record.sourceRowIndex,record]));
const beforeMissing=new Set(before.incompleteRecords.map(record=>record.id));
const afterMissing=new Set(after.incompleteRecords.map(record=>record.id));
const resolvedIds=[...beforeMissing].filter(id=>!afterMissing.has(id)).sort();
const newlyMissingIds=[...afterMissing].filter(id=>!beforeMissing.has(id)).sort();

function totals(audit){
 const summary=audit.summary;
 const stages=Object.values(summary.emptyByMode);
 return {total:summary.total,documented:summary.modes.documented||0,
  completeDocumented:(summary.modes.documented||0)-(summary.emptyByMode.documented?.records||0),
  interpretation:summary.modes.interpretation||0,
  completeRenderedStages:summary.threeNonemptyStages,missingRecords:summary.recordsWithEmpty,
  missingStages:Object.fromEntries(['top','heart','base'].map(stage=>[stage,stages.reduce((sum,item)=>sum+(item[stage]||0),0)]))};
}
const beforeTotals=totals(before),afterTotals=totals(after);
const summary={generatedAt:new Date().toISOString(),auditTimes:{before:before.generatedAt,after:after.generatedAt},
 before:beforeTotals,after:afterTotals,
 resolvedMissing:{count:resolvedIds.length,ids:resolvedIds},newlyMissing:{count:newlyMissingIds.length,ids:newlyMissingIds},
 newDocumented:{net:afterTotals.documented-beforeTotals.documented,exactIdsAvailable:false,
  reason:'Baseline audit contains only incomplete-record details, not the mode of every catalog record; exact newly documented IDs cannot be reconstructed.'},
 definitions:{completeDocumented:'Documented records whose three note stages are nonempty.',completeRenderedStages:'All records with three nonempty rendered stages, including educational interpretations.',remainingReason:'A missing or rejected match is not evidence that information does not exist on the internet.'}};

const headers=['id','brand','name','version','sourceRowIndex','missingStages','parfumoReason','fragranticaReason','crossSourceStatus','conflictNotes','manualStatus','manualApprovedForCatalog','coverageReason'];
const rows=after.incompleteRecords.map(record=>{
 const current=currentById.get(record.id);
 const rowIndex=record.sourceRowIndex??current?.sourceRowIndex;
 const review=manualById.get(record.id)??manualByRow.get(rowIndex);
 const comparison=conflicts.get(rowIndex);
 const hasConflict=Boolean(comparison&&!comparison.compatibleStagePositions);
 const crossStatus=!comparison?'':hasConflict?'shared-note-stage-conflict':comparison.compatibleOmissions?'compatible-omissions':'matching-stage-identities';
 const fallback=hasConflict?'cross-source-stage-conflict':'no-approved-complete-pyramid';
 const parfumoReason=unmatched.parfumo.get(rowIndex)||fallback;
 const fragranticaReason=unmatched.fragrantica.get(rowIndex)||fallback;
 const manualPartial=review?.approvedForCatalog&&review.pyramid&&!['top','heart','base'].every(stage=>review.pyramid[stage]?.length);
 const coverageReason=review&&!review.approvedForCatalog?`manual:${review.status}`:manualPartial?'manual-source-partial-pyramid':hasConflict?'cross-source-stage-conflict':[...new Set([parfumoReason,fragranticaReason])].join(';');
 return [record.id,record.brand,record.name,record.concentration??current?.concentration??'',rowIndex??'',record.missingStages.join('+'),
  parfumoReason,fragranticaReason,crossStatus,comparison?.sharedNoteStageConflicts.map(item=>item.note).join(';')||'',
  review?.status||'not-manually-reviewed',review?String(Boolean(review.approvedForCatalog)):'',coverageReason];
});
const quote=value=>'"'+String(value??'').replaceAll('"','""')+'"';
const csv='\ufeff'+[headers,...rows].map(row=>row.map(quote).join(',')).join('\r\n')+'\r\n';
fs.mkdirSync(outputDir,{recursive:true});
fs.writeFileSync(path.join(outputDir,'coverage-summary.json'),JSON.stringify(summary,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outputDir,'remaining-missing-stages.csv'),csv,'utf8');
console.log(JSON.stringify({before:beforeTotals,after:afterTotals,resolvedMissing:resolvedIds.length,newlyMissing:newlyMissingIds.length,newDocumentedNet:summary.newDocumented.net,csvRows:rows.length},null,2));
