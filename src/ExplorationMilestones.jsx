import {motion,useReducedMotion} from 'framer-motion'
import {getPatterns} from './decision'
export default function ExplorationMilestones({decisions}){
 const p=getPatterns(decisions),reduced=useReducedMotion()
 return <section className="exploration-milestones" aria-label="Exploration milestones">{[[5,'Category insights'],[10,'Deeper patterns'],[20,'Personal constellations']].map(([n,title])=><details key={n} className={p.total>=n?'unlocked':'future'}><summary><motion.span initial={!reduced&&p.total===n?{scale:.82}:false} animate={{scale:1}} transition={{type:'spring',stiffness:200,damping:18}}>{p.total>=n?'✓':'⌑'}</motion.span><strong>{n} decisions</strong><small>{title}</small></summary>{p.total<n?<p>{n-p.total} more choices to reveal this reflection. All saved decisions remain accessible.</p>:n===5?<p>{p.categoryCounts.map(([c,count])=>`${c}: ${count}`).join(' · ')}</p>:n===10?<p>{p.priorityCounts.slice(0,5).map(([c,count])=>`${c} appeared in ${count} decisions`).join(' · ')}</p>:<div className="constellation">{p.priorityCounts.slice(0,8).map(([c,count])=><span key={c}>✦ {c} · {count}</span>)}</div>}</details>)}</section>
}
