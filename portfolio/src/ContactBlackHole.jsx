import React,{useEffect,useRef,useState} from 'react';
export default function ContactBlackHole({motion}){
 const host=useRef(null),canvas=useRef(null);const [near,setNear]=useState(false);const [ready,setReady]=useState(false);
 useEffect(()=>{const o=new IntersectionObserver(([e])=>setNear(e.isIntersecting),{rootMargin:'150px'});o.observe(host.current);return()=>o.disconnect();},[]);
 useEffect(()=>{if(!near||!motion||!navigator.gpu)return;let stopped=false,renderer;import('./black-hole/renderer').then(({createRenderer})=>{if(stopped)return;renderer=createRenderer({canvas:canvas.current});return renderer.ready;}).then(()=>{if(!stopped)setReady(true);}).catch(()=>{if(!stopped)setReady(false);});return()=>{stopped=true;renderer?.dispose();setReady(false);};},[near,motion]);
 return <div ref={host} className={'contact-black-hole '+(ready?'is-ready':'')} aria-hidden="true"><div className="black-hole-fallback"/><canvas ref={canvas}/></div>;
}
