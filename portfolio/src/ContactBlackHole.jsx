import React,{useEffect,useRef,useState} from 'react';
import {SlidingNumber} from './SlidingNumber';
export default function ContactBlackHole({motion}){
 const host=useRef(null),canvas=useRef(null);
 const [near,setNear]=useState(false),[ready,setReady]=useState(false);
 const [progress,setProgress]=useState(1),[loading,setLoading]=useState(false);
 useEffect(()=>{const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setNear(true);o.disconnect();}},{rootMargin:'300px'});o.observe(host.current);return()=>o.disconnect();},[]);
 useEffect(()=>{
  if(!near||!motion||!navigator.gpu)return;
  let stopped=false,renderer,finish;
  setProgress(1);setLoading(true);
  import('./black-hole/renderer').then(({createRenderer})=>{
   if(stopped)return;
   renderer=createRenderer({canvas:canvas.current,onProgress:value=>{if(!stopped)setProgress(value);}});
   return renderer.ready;
  }).then(()=>{
   if(stopped)return;
   setProgress(100);setReady(true);
   finish=setTimeout(()=>setLoading(false),550);
  }).catch(()=>{if(!stopped){setReady(false);setLoading(false);}});
  return()=>{stopped=true;clearTimeout(finish);renderer?.dispose();setReady(false);setLoading(false);};
 },[near,motion]);
 return <>
  <div ref={host} className={'contact-black-hole '+(ready?'is-ready':'')} aria-hidden="true"><div className="black-hole-fallback"/><canvas ref={canvas}/></div>
  {loading&&<div className={'black-hole-progress '+(ready?'is-complete':'')} role="progressbar" aria-label="Preparing black hole" aria-valuemin={1} aria-valuemax={100} aria-valuenow={progress}>
   <div className="black-hole-progress-label"><span>Preparing the scene</span><span className="black-hole-progress-number" aria-hidden="true"><SlidingNumber value={progress} padStart/>%</span></div>
   <div className="black-hole-progress-track"><span style={{transform:`scaleX(${progress/100})`}}/></div>
  </div>}
 </>;
}

