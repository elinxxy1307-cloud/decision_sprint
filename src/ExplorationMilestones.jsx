import {motion,useReducedMotion} from 'framer-motion'
import {milestones,remainingCopy} from './decisionInsights'
export default function ExplorationMilestones({data,onExplore}){
 const reduced=useReducedMotion()
 return <section className="exploration-milestones" aria-label="Exploration milestones">{milestones.map(({count,title})=><details key={count} className={data.total>=count?'unlocked':'future'}><summary><motion.span initial={!reduced&&data.total===count?{scale:.82}:false} animate={{scale:1}}>{data.total>=count?'✓':'⌑'}</motion.span><strong>{count} decisions</strong><small>{title}</small><small>{data.total>=count?'Unlocked':data.total+' / '+count+' · Locked'}</small></summary>{data.total<count?<p>{remainingCopy(data.total,count)}</p>:<><p>{count===5?data.explored.length+' categories documented. '+data.unexplored.length+' remain unexplored.':data.dimensions.filter(d=>d.state==='Unlocked').length+' dimensions have enough recorded history to explore.'}</p><button className="text-button" onClick={()=>onExplore(count)}>{count===5?'Explore your landscape':'View mapped dimensions'} →</button></>}</details>)}</section>
}
