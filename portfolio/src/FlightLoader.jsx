import React,{useEffect,useRef} from 'react';
import {gsap} from 'gsap';

// Adapted from ThreeUI Kage's preloader and Uplink Loader's illuminated ticks.
// Copyright (c) 2026 Meng To. MIT; see licenses/threeui.txt.
// Progress is supplied by actual asset and renderer milestones, never a timer.
export default function FlightLoader({progress,ready,slow,onSkip,onExit}){
 const panel=useRef(null),skip=useRef(null);
 useEffect(()=>{
  const old=document.body.style.overflow;document.body.style.overflow='hidden';
  skip.current?.focus({preventScroll:true});
  return()=>{document.body.style.overflow=old;};
 },[]);
 useEffect(()=>{
  if(!ready)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tween=gsap.to(panel.current,{yPercent:-100,borderBottomLeftRadius:'45%',borderBottomRightRadius:'45%',duration:reduce?0:.85,ease:'power3.inOut',onComplete:onExit});
  return()=>tween.kill();
 },[ready,onExit]);
 const phase=progress<15?'Opening the journey':progress<80?'Loading the landscape':progress<96?'Preparing the light':'Almost there';
 return <div ref={panel} className="flight-loader" role="dialog" aria-modal="true" aria-labelledby="loader-title" onKeyDown={e=>{if(e.key==='Escape')onSkip();if(e.key==='Tab'){e.preventDefault();skip.current?.focus();}}}>
  <span className="loader-brand">PRANJAL SAINI</span>
  <div className="pre-in">
   <div className="loader-orbit" aria-hidden="true"><i/><i/><i/></div>
   <h2 id="loader-title">A little anticipation.</h2>
   <p>Good things are just beyond the horizon.</p>
   <div className="pre-bar" role="progressbar" aria-label="Scene preparation" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
    {Array.from({length:40},(_,i)=><i key={i} className={'tick '+(i%5===0?'mk ':'')+(i<progress/2.5?'on':'')}/>)}
   </div>
   <div className="pre-meta"><span role="status">{slow?'Taking a little longer. You can skip the scene.':phase}</span><b>{Math.round(progress)}%</b></div>
  </div>
  <button ref={skip} className="loader-skip" onClick={onSkip}>Continue without the 3D scene <span aria-hidden="true">↗</span></button>
 </div>;
}
