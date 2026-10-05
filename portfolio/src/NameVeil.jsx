import {paletteColor} from './palette.js';
import React,{lazy,Suspense,useEffect,useRef,useState} from 'react';
const DitherVeil=lazy(()=>import('./DitherVeil.jsx'));
export default function NameVeil({motion,theme}){
 const host=useRef(null);const [near,setNear]=useState(false);
 useEffect(()=>{const o=new IntersectionObserver(([e])=>setNear(e.isIntersecting),{rootMargin:'200px'});o.observe(host.current);return()=>o.disconnect();},[]);
 return <div className="name-veil" ref={host}>
  <div className="name-veil-art" aria-hidden="true">{near&&motion&&<Suspense fallback={null}><DitherVeil revealRadius={300} pixelSize={1} linger={0} contrast={1.85} softness={0.95} reverse={true} fit="contain" pattern="floyd" palette="duotone" inkColor={paletteColor(theme==='dark'?'#1d241d':'#f4f4ee')} paperColor="#f4f1ea" rimColor="#a78bfa"/></Suspense>}</div>
  <p className="name-veil-name">Pranjal Saini<span>Curiosity, in practice.</span></p>
 </div>;
}

