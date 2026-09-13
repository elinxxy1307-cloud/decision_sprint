import {categories,scoreDecision} from './decision.js'
export const milestones=[{count:5,title:'Decision Landscape'},{count:10,title:'Decision Dimensions'}]
export const remainingCopy=(total,target=10)=>`${Math.max(0,target-total)} more ${target-total===1?'choice':'choices'} to reveal your ${milestones.find(m=>m.count===target)?.title||'map'}.`
export function coverage(decisions){
 const regions=categories.map(category=>{const records=decisions.filter(d=>d.category===category);return {category,records,criteria:[...new Set(records.flatMap(d=>d.selected_criteria))]}})
 const total=decisions.length
 const dimensions=[['Values',decisions.filter(d=>d.selected_criteria?.length),'priorities'],['Trade-offs',decisions.filter(d=>d.scores&&d.options?.length>1),'comparison'],['Decision speed',decisions.filter(d=>Number.isFinite(d.decision_duration_seconds)),'speed'],['Decision method',decisions.filter(d=>typeof d.used_coin_flip==='boolean'),'method'],['First reactions',decisions.filter(d=>d.used_coin_flip&&d.coin_flip_reaction),'reaction'],['Confidence',[],'unrecorded'],['Outcomes',[],'unrecorded']].map(([name,records,type])=>({name,type,count:records.length,state:type==='unrecorded'?'Not collected':records.length>=5?'Unlocked':records.length?'Emerging':'Needs more data'}))
 return {total,regions,explored:regions.filter(r=>r.records.length),unexplored:regions.filter(r=>!r.records.length),dimensions,next:milestones.find(m=>m.count>total)}
}
export function selectDecisions(decisions,filter={}){return decisions.filter(d=>(!filter.category||filter.category==='All'||d.category===filter.category)&&(!filter.priority||d.selected_criteria.some(c=>c.toLowerCase()===filter.priority.toLowerCase())))}
export function evidenceLevel(n,hits){return n<3?null:n<5?'Emerging pattern':n>=10&&hits/n>=.8?'Consistent pattern':'Observed pattern'}
export function patternMetrics(decisions){
 const rows=decisions.map(d=>{const s=scoreDecision(d);return {d,gap:s.ranked[0].score-s.ranked[1].score,followed:s.tied.some(o=>o.id===d.final_choice)}})
 const priorities=[...new Set(decisions.flatMap(d=>d.selected_criteria).map(c=>c.toLowerCase()))].map(key=>({name:decisions.flatMap(d=>d.selected_criteria).find(c=>c.toLowerCase()===key),records:decisions.filter(d=>d.selected_criteria.some(c=>c.toLowerCase()===key))})).sort((a,b)=>b.records.length-a.records.length||a.name.localeCompare(b.name))
 return {rows,priorities,close:rows.filter(r=>r.gap<=10).map(r=>r.d),wide:rows.filter(r=>r.gap>10).map(r=>r.d),flips:decisions.filter(d=>d.used_coin_flip),followed:rows.filter(r=>r.followed).map(r=>r.d)}
}
export function buildPatterns(decisions){
 const m=patternMetrics(decisions),patterns=[]
 const add=(id,type,title,body,records,sample,extra={})=>{
  if(sample.length<3||records.length<3)return
  const times=sample.map(d=>Date.parse(d.completed_at)).filter(Number.isFinite)
  patterns.push({id,type,title,body,records,n:sample.length,hits:records.length,percent:Math.round(records.length/sample.length*100),level:evidenceLevel(sample.length,records.length),categories:[...new Set(records.map(d=>d.category))],start:Math.min(...times),end:Math.max(...times),...extra})
 }
 for(const p of m.priorities)add('value-'+p.name,'Values',p.name+' appears in your saved priorities.',p.name+' was selected as one of your Top 3. This records what mattered in these situations, not a fixed personal value.',p.records,decisions,{priority:p.name})
 add('method','Decision method','Chance has been part of your decision process.','These choices included a coin flip after the structured comparison. A coin flip does not establish that you relied on intuition.',m.flips,decisions)
 add('comparison-only','Decision method','These decisions used comparison without a coin flip.','The record shows no coin flip in these sprints; it does not tell us whether the choice felt easy.',decisions.filter(d=>!d.used_coin_flip),decisions)
 add('follow','Trade-offs','Your final choice matched a highest-scored option.','Any option tied for the highest score counts as a match. Your final choice remains separate from the recommendation.',m.followed,decisions)
 for(const reaction of ['Relieved','Disappointed','No reaction'])add('reaction-'+reaction,'First reactions',reaction+' was a recorded first reaction.','This was the immediate reaction to a coin flip, not satisfaction with the eventual decision.',m.flips.filter(d=>d.coin_flip_reaction===reaction),m.flips)
 if(m.close.length>=3&&m.wide.length>=3){const a=m.close.filter(d=>d.used_coin_flip),b=m.wide.filter(d=>d.used_coin_flip);if(a.length>=3&&a.length/m.close.length>b.length/m.wide.length)add('gap','Trade-offs','Coin flips appeared more often with closely scored options.','Closely scored means a gap of at most 10 points out of 100 between the top two options. This is an association in these records, not an explanation of why.',a,m.close,{comparison:`Close scores: ${a.length}/${m.close.length}. Wider gaps: ${b.length}/${m.wide.length}.`,level:m.close.length<5||m.wide.length<5?'Emerging pattern':'Observed pattern'})}
 for(const category of categories){const within=decisions.filter(d=>d.category===category),outside=decisions.filter(d=>d.category!==category);if(within.length<3||outside.length<3)continue;const p=patternMetrics(within).priorities[0];if(!p)continue;const elsewhere=outside.filter(d=>d.selected_criteria.some(c=>c.toLowerCase()===p.name.toLowerCase()));if(p.records.length/within.length>elsewhere.length/outside.length)add('category-'+category,'Values',p.name+' appeared more often in '+category+'.','The comparison uses the proportion of decisions with this priority inside and outside this category.',p.records,within,{priority:p.name,comparison:`${category}: ${p.records.length}/${within.length}. Other categories: ${elsewhere.length}/${outside.length}.`,level:within.length<5||outside.length<5?'Emerging pattern':'Observed pattern'})}
 const timed=decisions.filter(d=>Number.isFinite(d.decision_duration_seconds));if(timed.length>=3){const sorted=timed.map(d=>d.decision_duration_seconds).sort((a,b)=>a-b),mid=Math.floor(sorted.length/2),median=sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;add('speed','Decision speed','Your median recorded sprint took '+Math.round(median)+' seconds.','This is elapsed time from starting to saving, including any pauses. It does not measure difficulty or indecision.',timed,timed,{level:timed.length<5?'Emerging pattern':'Observed pattern'})}
 return patterns
}
