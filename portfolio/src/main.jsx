import './palette.js';
import './palettes.css';
import React from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';

const loader = document.getElementById('opening-loader');
const progress = document.getElementById('loading-progress');
const status = document.getElementById('loading-status');
function imageReady(url){return new Promise(resolve=>{const img=new Image();img.onload=img.onerror=resolve;img.src=url;});}
async function start(){
 const jobs=[
  import('./App.jsx'), import('./SpatialScene.jsx'), import('./spatial-engine.js'),
  import('./Ballpit.jsx'), import('./SplashCursor.jsx'), import('./DitherVeil.jsx'),
  import('./black-hole/renderer'),
  document.fonts.load('500 16px Manrope Variable'),
  imageReady('/assets/sculpture-poster.webp'),imageReady('/assets/sculpture-dark-poster.webp'),
  imageReady('https://images.unsplash.com/photo-1737071371043-761e02b1ef95?q=80&w=1400&auto=format&fit=crop')
 ];
 let completed=0;
 const results=await Promise.allSettled(jobs.map(job=>Promise.race([job,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Asset loading timed out')),15000))]).finally(()=>{
  completed++; const percent=Math.round(completed/jobs.length*100);
  if(progress)progress.textContent=percent+'%';
  loader?.style.setProperty('--progress',percent+'%');
 })));
 if(results[0].status==='rejected'){
  if(status)status.textContent='Connection interrupted. Please reload to try again.';
  const retry=document.createElement('button');retry.textContent='Reload website';retry.onclick=()=>location.reload();loader?.append(retry);return;
 }
 const App=results[0].value.default;
 createRoot(document.getElementById('root')).render(<App/>);
 requestAnimationFrame(()=>requestAnimationFrame(()=>{loader?.classList.add('is-complete');document.body.classList.remove('is-loading');setTimeout(()=>loader?.remove(),450);}));
}
start();
