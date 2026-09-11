import {test} from 'node:test'
import assert from 'node:assert/strict'
import {newDecision,scoreDecision,completeDecision,getPatterns,readDecisions,validOptions,randomOption} from '../src/decision.js'
function sample(){const d=newDecision(true);d.options=[{id:'a',label:'Boston'},{id:'b',label:'Stay in NYC'}];d.scores={Rest:{a:2,b:5},Fun:{a:5,b:3},Cost:{a:3,b:5}};return d}
test('3/2/1 weights, normalization and recommendation',()=>{const r=scoreDecision(sample());assert.equal(r.recommended,'b');assert.equal(r.ranked[0].total,26);assert.equal(r.ranked[0].score,87);assert.equal(r.ranked[1].score,63)})
test('ties are explicit and preserve original order',()=>{const d=sample();d.scores={Rest:{a:3,b:3},Fun:{a:3,b:3},Cost:{a:3,b:3}};assert.equal(scoreDecision(d).tied.length,2);assert.equal(scoreDecision(d).recommended,'a')})
test('rank changes affect result without changing ratings',()=>{const d=sample();d.selected_criteria=['Fun','Cost','Rest'];assert.equal(scoreDecision(d).ranked.find(o=>o.id==='a').total,23)})
test('incomplete ratings and final choices cannot be completed',()=>{const d=sample();assert.throws(()=>completeDecision(d));d.final_choice='b';delete d.scores.Rest.a;assert.throws(()=>completeDecision(d));assert.equal(validOptions([{label:'A'},{label:' a '}]),false)})
test('coin reaction is required; final choice need not match coin or recommendation',()=>{const d=sample();Object.assign(d,{used_coin_flip:true,coin_flip_result:'b',final_choice:'a'});assert.throws(()=>completeDecision(d));d.coin_flip_reaction='Disappointed';assert.equal(completeDecision(d).final_choice,'a')})
test('5 completed decisions unlock exact data-derived patterns',()=>{
 const list=Array.from({length:5},(_,i)=>{const d=sample();d.created_at='2026-09-09T10:00:00Z';Object.assign(d,{final_choice:i<3?'b':'a',used_coin_flip:i<2,coin_flip_result:i<2?'a':null,coin_flip_reaction:i===0?'Relieved':i===1?'Disappointed':null});return completeDecision(d,new Date('2026-09-09T10:02:00Z'))})
 assert.equal(getPatterns(list.slice(0,4)).unlocked,false)
 const p=getPatterns(list);assert.equal(p.unlocked,true);assert.equal(p.flipped,2);assert.equal(p.followed,3);assert.equal(p.averageSeconds,120);assert.deepEqual(p.categoryCounts,[['Travel & Plans',5]]);assert.equal(p.reactions[0].percent,50);assert.equal(p.priorityCounts[0][1],5)
})
test('completed data survives storage round trip and malformed data is rejected',()=>{const d=sample();d.final_choice='b';const saved=completeDecision(d);assert.deepEqual(readDecisions({getItem:()=>JSON.stringify([saved])}),[saved]);assert.throws(()=>readDecisions({getItem:()=>'{'}));assert.deepEqual(readDecisions({getItem:()=>null}),[])})
test('random choice always belongs to current options, including five options',()=>{const options=Array.from({length:5},(_,i)=>({id:String(i)}));for(let i=0;i<100;i++){const picked=randomOption(options);assert.ok(options.some(o=>o.id===picked))}})
