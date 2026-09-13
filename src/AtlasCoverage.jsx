import {remainingCopy} from './decisionInsights'
export default function AtlasCoverage({data,onAnalysis}){
 return <>
 <section id="mapped-dimensions" className="coverage-dimensions"><span className="eyebrow">10 DECISIONS · DECISION DIMENSIONS</span><h2>{data.total>=10?'Your decision map is getting deeper.':'Dimensions are taking shape.'}</h2><p>{data.total>=10?'Explore the kinds of data your history contains.':remainingCopy(data.total,10)}</p><div className="dimension-nodes">{data.dimensions.map(d=><button key={d.name} disabled={data.total<10||d.state!=='Unlocked'} onClick={()=>onAnalysis({type:d.name})} className={d.state==='Unlocked'?'mapped':'unmapped'}><span>{d.state==='Unlocked'?'✦':d.state==='Emerging'?'◌':'⌑'} {d.name}</span><small>{d.state} · {d.count} records</small></button>)}</div><p className="world-note">Recorded dimensions unlock at 5 relevant records; 1–4 are emerging. Confidence and later outcomes are not collected in this version. First reactions are not outcomes.</p></section>

 </>
}
