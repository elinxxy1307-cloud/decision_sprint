import {categories} from './decision.js'
export const categoryColors=['#F4B69D','#F6DEA0','#CCB9F2','#79C987','#A9D8EA','#DAD4C9']
export const shortCategory=c=>({'Travel & Plans':'Plans','Career & Study':'Career'}[c]||c)
export function weeklyCount(decisions,now=new Date()){
 const start=new Date(now);start.setHours(0,0,0,0);start.setDate(start.getDate()-(start.getDay()+6)%7)
 return decisions.filter(d=>new Date(d.completed_at)>=start&&new Date(d.completed_at)<=now).length
}
export function matchesFilter(d,filter){
 if(!filter)return true
 if(filter.type==='category')return d.category===filter.value
 if(filter.type==='priority')return d.selected_criteria.some(c=>c.toLowerCase()===filter.value.toLowerCase())
 if(filter.type==='reaction')return d.used_coin_flip&&d.coin_flip_reaction===filter.value
 if(filter.type==='coin')return d.used_coin_flip
 if(filter.type==='follow')return d.final_choice===d.recommended_option
 return true
}
export function mapPositions(decisions){
 const sorted=[...decisions].sort((a,b)=>categories.indexOf(a.category)-categories.indexOf(b.category)||new Date(a.completed_at)-new Date(b.completed_at))
 return sorted.map((d,i)=>({d,x:35+(i%4)*80+Math.floor(i/12)*340,y:50+Math.floor((i%12)/4)*82+(i%2?12:0)}))
}
export function durationStats(decisions){
 if(!decisions.length)return {fastest:0,slowest:0,recent:[],difference:null}
 const durations=decisions.map(d=>d.decision_duration_seconds)
 const recent=[...decisions].sort((a,b)=>new Date(a.completed_at)-new Date(b.completed_at)).slice(-10).map(d=>d.decision_duration_seconds)
 return {fastest:Math.min(...durations),slowest:Math.max(...durations),recent,difference:recent.length>=2?recent.at(-1)-recent[0]:null}
}
