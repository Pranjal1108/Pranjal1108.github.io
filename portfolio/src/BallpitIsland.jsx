import {paletteColor} from './palette.js';
import React,{lazy,Suspense,useEffect,useRef,useState} from 'react';
const Ballpit=lazy(()=>import('./Ballpit.jsx'));
const colors=[0xffffff,0x000000,paletteColor('#c2d9b3')];
export function ballCountForWidth(width){
 return width<480?60:width<768?100:width<1100?180:width<1600?280:width<2200?360:500;
}
export default function BallpitIsland({motion}){
 const host=useRef(null);const [near,setNear]=useState(false);
 const [count,setCount]=useState(()=>ballCountForWidth(window.innerWidth));
 useEffect(()=>{
  const o=new IntersectionObserver(([e])=>setNear(e.isIntersecting),{rootMargin:'200px'});
  const size=new ResizeObserver(([e])=>setCount(ballCountForWidth(e.contentRect.width)));
  o.observe(host.current);size.observe(host.current);
  return()=>{o.disconnect();size.disconnect();};
 },[]);
 return <div className="ballpit-island" ref={host} data-ball-count={count} aria-hidden="true">{near&&motion?<Suspense fallback={null}><Ballpit count={count} gravity={0.1} friction={1} wallBounce={1} followCursor={false} colors={colors}/></Suspense>:<div className="ballpit-rest"/>}</div>;
}
