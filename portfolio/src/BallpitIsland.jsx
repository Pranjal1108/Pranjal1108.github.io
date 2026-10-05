import {paletteColor} from './palette.js';
import React,{lazy,Suspense,useEffect,useRef,useState} from 'react';
const Ballpit=lazy(()=>import('./Ballpit.jsx'));
const colors=[0xffffff,0x000000,paletteColor('#c2d9b3')];
export default function BallpitIsland({motion}){
 const host=useRef(null);const [near,setNear]=useState(false);
 useEffect(()=>{const o=new IntersectionObserver(([e])=>setNear(e.isIntersecting),{rootMargin:'200px'});o.observe(host.current);return()=>o.disconnect();},[]);
 return <div className="ballpit-island" ref={host} aria-hidden="true">{near&&motion?<Suspense fallback={null}><Ballpit count={500} gravity={0.1} friction={1} wallBounce={1} followCursor={false} colors={colors}/></Suspense>:<div className="ballpit-rest"/>}</div>;
}

