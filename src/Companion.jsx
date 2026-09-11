import {useEffect,useRef,useState} from 'react'
import {motion,useReducedMotion} from 'framer-motion'
export default function Companion({sleeping=false,mood='ready',className='',interactive=false}){
 const ref=useRef(null),[spins,setSpins]=useState(0),[hover,setHover]=useState(false),reduced=useReducedMotion()
 const happy=['happy','excited','celebrating','celebrate','result','relieved'].includes(mood)
 useEffect(()=>{const root=ref.current;if(!root)return;let frame;const track=e=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const r=root.getBoundingClientRect();root.style.setProperty('--eye-x',Math.max(-3,Math.min(3,(e.clientX-r.left-r.width/2)/100))+'px');root.style.setProperty('--eye-y',Math.max(-2,Math.min(2,(e.clientY-r.top-r.height/2)/140))+'px')})};window.addEventListener('pointermove',track,{passive:true});return()=>{window.removeEventListener('pointermove',track);cancelAnimationFrame(frame)}},[])
 function spin(){setSpins(n=>n+1)}
 const art=<motion.svg ref={ref} className={`guide companion decision-dial pose-${mood} ${className}`} viewBox="0 0 160 160" fill="none" aria-hidden="true" onHoverStart={()=>setHover(true)} onHoverEnd={()=>setHover(false)} whileHover={reduced?{}:{rotate:4,scale:1.02}} transition={{type:"spring",stiffness:220,damping:18}}>
 <ellipse cx="80" cy="147" rx="37" ry="6" fill="#18325D" opacity=".1"/>
 <g className="dial-body"><path d="m57 125-7 13h15m30-13 8 13H89" stroke="#18325D" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/><path d="m30 86-16 9-4-6m120-3 15-13 6 5" stroke="#55A9F5" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
 <circle cx="80" cy="77" r="54" fill="#55A9F5"/><circle cx="80" cy="77" r="44" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="1 12" strokeLinecap="round"/>
 <motion.g className="dial-pointer" animate={{rotate:reduced?0:spins*360+(hover?12:0)}} transition={{type:"spring",stiffness:190,damping:19}}><path d="m80 30-10 28 10-6 10 6Z" fill="#18325D"/><path d="m80 30 10 28-10-6Z" fill="#FFFFFF"/></motion.g>
 <g className="dial-eyes">{sleeping||mood==="sleepy"?<path d="m59 78 9 2m24 0 9-2" stroke="#18325D" strokeWidth="4" strokeLinecap="round"/>:happy?<path d="m58 81q6-9 12 0m20 0q6-9 12 0" stroke="#18325D" strokeWidth="4" strokeLinecap="round"/>:<><ellipse cx="64" cy="80" rx="4" ry={mood==='nervous'?4:6} fill="#10244B"/><ellipse cx="96" cy="80" rx="4" ry={mood==='nervous'?4:6} fill="#10244B"/></>}</g>
 {mood==='surprised'||mood==='excited'?<ellipse cx="80" cy="98" rx="6" ry="7" fill="#18325D"/>:<path d={mood==='disappointed'?'M72 99q8-7 16 0':'M72 96q8 10 16 0'} stroke="#18325D" strokeWidth="3" strokeLinecap="round"/>}<ellipse cx="51" cy="92" rx="6" ry="3" fill="#F2A8B8"/><ellipse cx="109" cy="92" rx="6" ry="3" fill="#F2A8B8"/>
 {mood==='thinking'&&<g><circle cx="112" cy="90" r="14" fill="#DDEFFF" fillOpacity=".65" stroke="#18325D" strokeWidth="3"/><path d="m121 100 14 16" stroke="#18325D" strokeWidth="5" strokeLinecap="round"/></g>}
 {mood==='map'&&<g><path d="m111 110 11-5 11 5 13-4v25l-13 4-11-5-11 5Z" fill="#F8FCFF" stroke="#7386A3" strokeWidth="1.5"/><path d="m122 105 0 25m11-20v25m-18-13 9-8 15 10" stroke="#55A9F5" strokeWidth="1.5" strokeDasharray="3 3"/></g>}
 {happy&&<path className="dial-spark" d="m137 36 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="#F3D98B"/>}
 </g></motion.svg>
 return interactive?<button className="dial-interactive" onClick={spin} aria-label="Spin Decision Dial">{art}</button>:art
}
