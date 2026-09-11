import {test} from 'node:test'
import assert from 'node:assert/strict'
import {weeklyCount,durationStats,mapPositions,matchesFilter} from '../src/patternView.js'
test('weekly snapshot uses Monday boundary and excludes future decisions',()=>{
 const now=new Date(2026,8,10,12)
 const ds=[new Date(2026,8,6,23),new Date(2026,8,7,0),new Date(2026,8,10,11),new Date(2026,8,11)].map(d=>({completed_at:d.toISOString()}))
 assert.equal(weeklyCount(ds,now),2)
})
test('pace sorts actual durations and handles missing trend',()=>{
 const ds=[{completed_at:'2026-09-10',decision_duration_seconds:20},{completed_at:'2026-09-09',decision_duration_seconds:40}]
 assert.deepEqual(durationStats(ds),{fastest:20,slowest:40,recent:[40,20],difference:-20})
 assert.equal(durationStats(ds.slice(0,1)).difference,null)
})
test('map preserves all records beyond one canvas and filters exact recorded signals',()=>{
 const ds=Array.from({length:30},(_,i)=>({id:String(i),category:'Shopping',completed_at:'2026-09-10',selected_criteria:['Price'],used_coin_flip:i%2===0,coin_flip_reaction:'Relieved'}))
 const nodes=mapPositions(ds)
 assert.equal(new Set(nodes.map(n=>n.d.id)).size,30)
 assert.ok(nodes.every(n=>n.y<250))
 assert.equal(ds.filter(d=>matchesFilter(d,{type:'coin'})).length,15)
 assert.equal(matchesFilter(ds[0],{type:'priority',value:'price'}),true)
 assert.equal(matchesFilter(ds[1],{type:'reaction',value:'Relieved'}),false)
})
