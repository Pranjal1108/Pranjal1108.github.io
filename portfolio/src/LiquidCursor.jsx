import React,{useEffect,useRef} from 'react';
// React Bits Click Spark (David Haz), adapted into water wavefronts.
// Same bounded spark lifecycle/ease-out drawing pattern; no perpetual RAF.
// See licenses/react-bits.txt. Refraction is handled by the shared 3D renderer.
export default function LiquidCursor({enabled,onRipple,theme}){
 const canvasRef=useRef(null),callback=useRef(onRipple);
 callback.current=onRipple;
 useEffect(()=>{
  if(!enabled)return;
  const canvas=canvasRef.current,ctx=canvas.getContext('2d'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let sparks=[],frame=0,lastX=-1000,lastY=-1000,lastTime=0;
  const resize=()=>{const dpr=Math.min(devicePixelRatio,1.5);canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);};
  const draw=timestamp=>{
   frame=0;ctx.clearRect(0,0,innerWidth,innerHeight);
   sparks=sparks.filter(spark=>{
    const progress=(timestamp-spark.startTime)/1200;if(progress>=1)return false;
    const eased=progress*(2-progress),radius=12+eased*spark.radius;
    ctx.globalAlpha=(1-progress)**2*spark.strength*.6;
    ctx.strokeStyle=theme==='day'?'#426675':'#dbf3ff';ctx.lineWidth=1.1;
    ctx.beginPath();ctx.ellipse(spark.x,spark.y,radius,radius*.96,0,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha*=.4;ctx.lineWidth=3;ctx.beginPath();ctx.arc(spark.x,spark.y,radius+4,Math.PI*.95,Math.PI*1.7);ctx.stroke();
    return true;
   });
   canvas.dataset.active=String(sparks.length);
   if(sparks.length&&!document.hidden)frame=requestAnimationFrame(draw);
  };
  const emit=(e,strength)=>{
   if(reduce.matches||document.hidden)return;
   const now=performance.now();
   if(strength<1&&(now-lastTime<110||Math.hypot(e.clientX-lastX,e.clientY-lastY)<44))return;
   lastTime=now;lastX=e.clientX;lastY=e.clientY;
   sparks.push({x:e.clientX,y:e.clientY,startTime:now,radius:innerHeight*.3,strength});sparks=sparks.slice(-6);
   callback.current?.(e.clientX/innerWidth,e.clientY/innerHeight,strength);
   if(!frame)frame=requestAnimationFrame(draw);
  };
  const move=e=>{if(e.pointerType==='mouse')emit(e,.55);};
  const press=e=>emit(e,1);
  const clear=()=>{sparks=[];cancelAnimationFrame(frame);frame=0;ctx.clearRect(0,0,innerWidth,innerHeight);canvas.dataset.active='0';};
  resize();window.addEventListener('resize',resize);window.addEventListener('pointermove',move,{passive:true});window.addEventListener('pointerdown',press,{passive:true});
  document.addEventListener('visibilitychange',clear);reduce.addEventListener('change',clear);
  return()=>{clear();window.removeEventListener('resize',resize);window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',press);document.removeEventListener('visibilitychange',clear);reduce.removeEventListener('change',clear);};
 },[enabled,theme]);
 return <canvas ref={canvasRef} className="liquid-cursor" aria-hidden="true"/>;
}
