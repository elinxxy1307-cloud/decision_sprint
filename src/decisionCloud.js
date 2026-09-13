import {STORAGE_KEY, readDecisions, completeDecision} from './decision.js'
export const MIGRATION_OWNER = `${STORAGE_KEY}:cloud-owner`
const fields = ['id','category','options','selected_criteria','scores','final_choice','used_coin_flip','coin_flip_result','coin_flip_reaction','created_at','completed_at','decision_duration_seconds']
export function toRow(decision, owner) {
 const row = Object.fromEntries(fields.map(k=>[k,decision[k]]))
 return {...row, owner_id:owner, scoring_version:1, coin_flip_result:decision.used_coin_flip?decision.coin_flip_result:null, coin_flip_reaction:decision.used_coin_flip?decision.coin_flip_reaction:null}
}
export function fromRow(row) {
 if(row.scoring_version!==1) throw new Error('Unsupported decision scoring version.')
 return {...completeDecision(row,new Date(row.completed_at)),decision_duration_seconds:row.decision_duration_seconds}
}
function canonical(value) {
 if(Array.isArray(value)) return value.map(canonical)
 if(value&&typeof value==='object') return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]))
 return value
}
export function sameRow(a,b) {
 const normalized=r=>({...toRow(r,r.owner_id),created_at:new Date(r.created_at).toISOString(),completed_at:new Date(r.completed_at).toISOString()})
 return JSON.stringify(canonical(normalized(a)))===JSON.stringify(canonical(normalized(b)))
}
export function cloudStore(client, owner) {
 async function checkSession() {
  const {data,error}=await client.auth.getSession()
  if(error||data.session?.user.id!==owner) throw new Error('Your session changed. Log in again to continue.')
 }
 return {
 async list() {
  await checkSession(); let all=[]
  for(let start=0;;start+=500){
   const {data,error}=await client.from('decisions').select('*').eq('owner_id',owner).order('completed_at',{ascending:false}).order('id').range(start,start+499)
   if(error) throw new Error('Could not load your cloud decisions. Please retry.')
   all=all.concat(data); if(data.length<500) break
  }
  return all.map(fromRow)
 },
 async insert(decision) {
  await checkSession(); const row=toRow(decision,owner)
  const {data,error}=await client.from('decisions').insert(row).select('*').single()
  if(!error&&data&&sameRow(row,data)) return fromRow(data)
  // A retry after a lost response must verify the existing content, never overwrite it.
  if(error){
   await checkSession()
   const existing=await client.from('decisions').select('*').eq('owner_id',owner).eq('id',row.id).maybeSingle()
   if(!existing.error&&existing.data&&sameRow(row,existing.data)) return fromRow(existing.data)
  }
  throw new Error('Cloud save could not be verified. Your original record has been kept. Please retry.')
 },
 async remove(id) {
  await checkSession()
  const {error}=await client.from('decisions').delete().eq('owner_id',owner).eq('id',id)
  if(error) throw new Error('Could not delete this decision. Please retry.')
  await checkSession()
  const check=await client.from('decisions').select('id').eq('owner_id',owner).eq('id',id).maybeSingle()
  if(check.error||check.data) throw new Error('Deletion could not be verified. Please retry.')
 }
 }
}
export async function migrateLegacy(storage, owner, repository) {
 const work=async()=>{
  const raw=storage.getItem(STORAGE_KEY)
  if(!raw) return 0
  const bound=storage.getItem(MIGRATION_OWNER)
  if(bound&&bound!==owner) return 0
  const records=readDecisions(storage)
  if(!records.length) return 0
  storage.setItem(MIGRATION_OWNER,owner)
  for(const record of records) await repository.insert(record)
  // Never remove newly added or edited legacy records from another tab.
  if(storage.getItem(STORAGE_KEY)===raw) storage.removeItem(STORAGE_KEY)
  return records.length
 }
 if(globalThis.navigator?.locks) return navigator.locks.request('decision-sprint-legacy-migration',work)
 return work()
}
