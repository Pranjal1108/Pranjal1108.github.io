import {useEffect} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ignoreMobileResize:true});
export function useChoreography(root,enabled) {
 useEffect(()=>{
  if(!enabled)return;
  const mm=gsap.matchMedia();
  const ctx=gsap.context(()=>{
   mm.add('(prefers-reduced-motion: no-preference)',()=>{
    gsap.from('.hero .text-mask > span',{yPercent:105,duration:1.15,stagger:.13,ease:'power4.out',clearProps:'transform'});
    gsap.from('.hero-description, .hero .round-link',{opacity:0,y:20,duration:.8,delay:.35,stagger:.15,clearProps:'all'});
    gsap.utils.toArray('.reveal').forEach(el=>gsap.from(el,{opacity:0,y:45,duration:.85,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%',once:true},clearProps:'all'}));
   });
   mm.add('(min-width: 900px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',()=>{
    gsap.to('.hero-copy',{y:100,opacity:.4,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
    const field=gsap.timeline({scrollTrigger:{trigger:'.field-section',start:'top top',end:()=>'+='+innerHeight*.75,pin:true,scrub:1,invalidateOnRefresh:true}});
    field.to('.field-title',{y:-60,opacity:0,duration:.6}).fromTo('.field-end',{y:50,opacity:0},{y:0,opacity:1,duration:.6},.4);
   });
  },root);
  // React Bits Magnet proximity bounds, adapted to direct transforms instead
  // of React state per pointer event. Source and license notice in licenses/.
  const buttons=[...root.current.querySelectorAll('.magnetic')].map(el=>({el,x:gsap.quickTo(el,'x',{duration:.55,ease:'power3.out'}),y:gsap.quickTo(el,'y',{duration:.55,ease:'power3.out'})}));
  const pointer=e=>{
   if(e.pointerType!=='mouse'||!matchMedia('(pointer:fine)').matches)return;
   buttons.forEach(({el,x,y})=>{const r=el.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;
    const active=Math.abs(dx)<r.width/2+45&&Math.abs(dy)<r.height/2+45;
    x(active?Math.max(-12,Math.min(12,dx*.1)):0);y(active?Math.max(-9,Math.min(9,dy*.1)):0);
   });
  };
  const reset=()=>buttons.forEach(({x,y})=>{x(0);y(0);});
  window.addEventListener('pointermove',pointer,{passive:true});document.documentElement.addEventListener('pointerleave',reset);
  return()=>{window.removeEventListener('pointermove',pointer);document.documentElement.removeEventListener('pointerleave',reset);buttons.forEach(({el,x,y})=>{x.tween.kill();y.tween.kill();gsap.set(el,{clearProps:'transform'});});mm.revert();ctx.revert();};
 },[root,enabled]);
}

