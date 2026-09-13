import {test} from 'node:test'
import assert from 'node:assert/strict'
import {newDecision,completeDecision} from '../src/decision.js'
import {coverage,milestones,remainingCopy,evidenceLevel,patternMetrics,buildPatterns,selectDecisions} from '../src/decisionInsights.js'
function fixture({coin=false,reaction='Relieved',tie=true,category='Other'}={}){
 const d=newDecision(true);d.category=category;d.selected_criteria=['Cost','Time','Enjoyment']
 for(const c of d.selected_criteria)d.scores[c]=Object.fromEntries(d.options.map((o,i)=>[o.id,tie?3:i?1:5]))
 d.final_choice=d.options[1].id;d.used_coin_flip=coin;d.coin_flip_result=coin?d.options[0].id:null;d.coin_flip_reaction=coin?reaction:null
 return completeDecision(d)
}
test('coverage milestones and singular remaining copy use only 5 and 10',()=>{
 assert.deepEqual(milestones.map(m=>m.count),[5,10])
 for(const n of [0,5,10,12,18]){const c=coverage(Array.from({length:n},()=>fixture()));assert.equal(c.next?.count,n<5?5:n<10?10:undefined)}
 assert.match(remainingCopy(9),/^1 more choice to/);assert.match(remainingCopy(7),/^3 more choices to/)
})
test('coverage never invents confidence or outcomes, category links use actual priorities',()=>{
 const c=coverage([fixture()]);assert.equal(c.explored.length,1);assert.equal(c.unexplored.length,5)
 assert.deepEqual(c.dimensions.filter(d=>['Confidence','Outcomes'].includes(d.name)).map(d=>[d.count,d.state]),[[0,'Not collected'],[0,'Not collected']])
 assert.deepEqual(c.explored[0].criteria,['Cost','Time','Enjoyment'])
})
test('small samples suppressed, emerging and consistent labels require evidence',()=>{
 assert.deepEqual(buildPatterns([fixture(),fixture()]),[])
 assert.ok(buildPatterns(Array.from({length:3},()=>fixture())).every(s=>s.level==='Emerging pattern'))
 assert.equal(evidenceLevel(15,4),'Observed pattern');assert.equal(evidenceLevel(15,12),'Consistent pattern')
})
test('any tied highest option counts as following the comparison',()=>{
 const d=fixture();assert.notEqual(d.final_choice,d.recommended_option)
 assert.equal(patternMetrics([d]).followed.length,1)
})
test('reaction denominator and supporting rows are exact, not all coin flips',()=>{
 const ds=Array.from({length:8},(_,i)=>fixture({coin:i<6,reaction:i<3?'Relieved':'Disappointed'}))
 const s=buildPatterns(ds).find(p=>p.id==='reaction-Relieved');assert.equal(s.n,6);assert.equal(s.hits,3);assert.equal(s.percent,50)
 assert.ok(s.records.every(d=>d.coin_flip_reaction==='Relieved'))
})
test('score gap comparisons require two eligible cohorts and never equate coin flips with intuition',()=>{
 const close=Array.from({length:4},()=>fixture({coin:true})),wide=Array.from({length:4},()=>fixture({tie:false}))
 assert.equal(buildPatterns(close).some(p=>p.id==='gap'),false)
 const s=buildPatterns([...close,...wide]).find(p=>p.id==='gap');assert.equal(s.n,4);assert.equal(s.hits,4);assert.equal(s.level,'Emerging pattern')
})
test('combined category and priority filters only return matching records',()=>{
 const a=fixture({category:'Social'}),b=fixture({category:'Shopping'})
 assert.deepEqual(selectDecisions([a,b],{category:'Social',priority:'cost'}),[a])
})
