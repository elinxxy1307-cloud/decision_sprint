export const STORAGE_KEY = 'decision-sprint:completed:v1'
export const criteriaByCategory = {
  Shopping: ['Price', 'Quality', 'Need', 'Style', 'Durability', 'Versatility', 'Convenience', 'Long-term value'],
  Food: ['Taste', 'Price', 'Health', 'Convenience', 'Distance', 'Craving', 'Variety', 'Comfort'],
  'Travel & Plans': ['Cost', 'Fun', 'Rest', 'Time', 'Convenience', 'Novelty', 'Flexibility', 'People'],
  Social: ['Enjoyment', 'Energy', 'Relationship', 'Convenience', 'Time', 'Comfort', 'Commitment', 'Personal need'],
  'Career & Study': ['Growth', 'Interest', 'Compensation', 'Stability', 'Time', 'Difficulty', 'Future opportunities', 'Work-life balance'],
  Other: ['Cost', 'Time', 'Enjoyment', 'Convenience', 'Risk', 'Flexibility', 'Long-term value', 'Personal importance'],
}
export const categories = Object.keys(criteriaByCategory)
export const reactions = ['Relieved', 'Disappointed', 'No reaction']
export const weights = [3, 2, 1]
export function newDecision(example = false) {
  return {
    id: crypto.randomUUID(), created_at: new Date().toISOString(), category: example ? 'Travel & Plans' : '',
    options: (example ? ['Boston', 'Stay in NYC'] : ['', '']).map(label => ({id: crypto.randomUUID(), label})),
    selected_criteria: example ? ['Rest', 'Fun', 'Cost'] : [], scores: {},
    used_coin_flip: false, coin_flip_result: null, coin_flip_reaction: null, final_choice: null,
  }
}
export function validOptions(options) {
  const labels = options.map(o => o.label.trim().toLocaleLowerCase())
  return options.length >= 2 && options.length <= 5 && labels.every(Boolean) && new Set(labels).size === labels.length
}
export function hasAllScores(d) {
  return validOptions(d.options) && d.selected_criteria.length === 3 && d.selected_criteria.every(c => d.options.every(o => Number.isInteger(d.scores[c]?.[o.id]) && d.scores[c][o.id] >= 1 && d.scores[c][o.id] <= 5))
}
export function scoreDecision(d) {
  if (!hasAllScores(d)) throw new Error('Complete all ratings first.')
  const ranked = d.options.map(o => {
    const total = d.selected_criteria.reduce((sum,c,i) => sum + d.scores[c][o.id] * weights[i], 0)
    return {...o, total, score: Math.round(total / 30 * 100)}
  }).sort((a,b) => b.total - a.total)
  const tied = ranked.filter(o => o.total === ranked[0].total)
  return {ranked, tied, recommended: ranked[0].id}
}
export function explain(d) {
  const {ranked,tied} = scoreDecision(d)
  if (tied.length > 1) return `${tied.map(o=>o.label).join(' and ')} have the same weighted total. Your ratings don’t identify a single best fit. You can choose either, or try the tie-breaker.`
  const first=ranked[0], second=ranked[1]
  const wins=d.selected_criteria.filter(c=>d.scores[c][first.id]>d.scores[c][second.id])
  const losses=d.selected_criteria.filter(c=>d.scores[c][first.id]<d.scores[c][second.id])
  const priority=c=>`${c} (#${d.selected_criteria.indexOf(c)+1})`
  return `${first.label} leads overall, scoring higher than ${second.label} on ${wins.map(priority).join(' and ')}.${losses.length ? ` ${second.label} scores higher on ${losses.map(priority).join(' and ')}, but those gains don’t outweigh the weighted total.` : ' Your priority order and ratings put it ahead.'}`
}
export function randomOption(options) {
  // Rejection sampling gives each of 2–5 options the same chance.
  const ceiling = Math.floor(4294967296 / options.length) * options.length
  let n
  do { n = crypto.getRandomValues(new Uint32Array(1))[0] } while(n >= ceiling)
  return options[n % options.length].id
}
export function completeDecision(d, now = new Date()) {
  if (!categories.includes(d.category) || !d.options.some(o=>o.id===d.final_choice)) throw new Error('Select your final choice.')
  const result = scoreDecision(d)
  if (d.used_coin_flip && (!d.options.some(o=>o.id===d.coin_flip_result) || !reactions.includes(d.coin_flip_reaction))) throw new Error('Record your reaction first.')
  return {...d, options: d.options.map(o=>({...o,label:o.label.trim()})), completed_at: now.toISOString(),
    criteria_rank: d.selected_criteria.map((name,i)=>({name,rank:i+1,weight:weights[i]})),
    option_scores: Object.fromEntries(result.ranked.map(o=>[o.id,o.score])),
    recommended_option: result.recommended, tied_options: result.tied.map(o=>o.id),
    decision_duration_seconds: Math.max(0,Math.round((now-new Date(d.created_at))/1000))}
}
export function readDecisions(storage) {
  const raw=storage.getItem(STORAGE_KEY)
  if (!raw) return []
  const data=JSON.parse(raw)
  if (!Array.isArray(data) || !data.every(d => {
    try { return typeof d.id==='string' && Number.isFinite(Date.parse(d.created_at)) && Number.isFinite(Date.parse(d.completed_at)) && categories.includes(d.category) && Array.isArray(d.options) && d.options.every(o=>typeof o.id==='string'&&typeof o.label==='string') && new Set(d.options.map(o=>o.id)).size===d.options.length && Array.isArray(d.selected_criteria) && d.selected_criteria.every(c=>typeof c==='string'&&c.trim()) && new Set(d.selected_criteria).size===3 && hasAllScores(d) && d.options.some(o=>o.id===d.final_choice) && d.options.some(o=>o.id===d.recommended_option) && Number.isFinite(d.decision_duration_seconds) && d.decision_duration_seconds>=0 && typeof d.used_coin_flip==='boolean' && (!d.used_coin_flip || (d.options.some(o=>o.id===d.coin_flip_result) && reactions.includes(d.coin_flip_reaction))) } catch {return false}
  })) throw new Error('Saved decisions could not be read.')
  return data.sort((a,b)=>new Date(b.completed_at)-new Date(a.completed_at))
}
export function getPatterns(decisions) {
  const total = decisions.length
  const count = values => Object.entries(values.reduce((acc,v)=>({...acc,[v]:(acc[v]||0)+1}),{})).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))
  const categoryCounts=count(decisions.map(d=>d.category))
  const priorityCounts=count(decisions.flatMap(d=>d.selected_criteria.map(c=>c.toLocaleLowerCase())))
  const flipped=decisions.filter(d=>d.used_coin_flip)
  const followed=decisions.filter(d=>d.final_choice===d.recommended_option).length
  return {total, unlocked:total>=5, categoryCounts, priorityCounts:priorityCounts.map(([key,n])=>[decisions.flatMap(d=>d.selected_criteria).find(c=>c.toLocaleLowerCase()===key),n]),
    flipped:flipped.length, followed, averageSeconds:total?Math.round(decisions.reduce((sum,d)=>sum+d.decision_duration_seconds,0)/total):0,
    reactions:reactions.map(r=>({name:r,count:flipped.filter(d=>d.coin_flip_reaction===r).length,percent:flipped.length?Math.round(flipped.filter(d=>d.coin_flip_reaction===r).length/flipped.length*100):0}))}
}
export function formatTime(seconds) {return `${Math.floor(seconds/60)}m ${seconds%60}s`}
