import React,{useEffect,useRef} from 'react';

export default function SpatialScene({mode,motion,theme='light'}) {
 const host=useRef(null),engine=useRef(null),motionRef=useRef(motion),themeRef=useRef(theme);
 motionRef.current=motion;themeRef.current=theme;
 useEffect(()=>{
  let cancelled=false;
  // Keep WebGL out of the initial content bundle. Each island owns its lifetime.
  import('./spatial-engine.js').then(({createSpatialScene})=>{
   if(cancelled)return;
   try {engine.current=createSpatialScene(host.current,mode,motionRef.current,themeRef.current);}
   catch {host.current.dataset.state='fallback';}
  }).catch(()=>{if(!cancelled)host.current.dataset.state='fallback';});
  return()=>{cancelled=true;engine.current?.dispose();engine.current=null;};
 },[mode]);
 useEffect(()=>engine.current?.setMotion(motion),[motion]);
 useEffect(()=>engine.current?.setTheme(theme),[theme]);
 return <div className="spatial-canvas" ref={host} aria-hidden="true"/>;
}
