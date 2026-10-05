import React,{useState} from 'react';
import {Plus} from 'lucide-react';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
const credits=[
 ['Ravi Katiyar / 21st.dev','https://21st.dev/@ravikatiyar162/components/loader-13','Infinity opening loader'],
 ['VGPU / Vercel Labs','https://21st.dev/@vgpu/components/optimized-black-hole','Optimized Black Hole contact backdrop'],
 ['React Bits','https://reactbits.dev','Ballpit, Splash Cursor, Gradual Blur & Dither Veil'],
 ['Pavel Dobryakov','https://github.com/PavelDoGreat/WebGL-Fluid-Simulation','Fluid simulation behind the cursor'],
 ['GSAP','https://gsap.com','Scroll choreography & animation'],
 ['Three.js','https://threejs.org','Interactive 3D scenes'],
 ['OGL','https://github.com/oframe/ogl','Dither Veil rendering'],
 ['Lucide','https://lucide.dev','Interface icons'],
 ['Manrope / Fontsource','https://fontsource.org/fonts/manrope','Typography'],
 ['Unsplash','https://images.unsplash.com/photo-1737071371043-761e02b1ef95','Iridescent portrait used in Dither Veil'],
 ['React','https://react.dev','Interface framework'],
 ['Vite','https://vite.dev','Development & build tools']
];
export default function Credits(){const [open,setOpen]=useState(false);return <section className="site-credits" aria-labelledby="references-toggle"><h2 className="references-heading"><button id="references-toggle" className="references-toggle" aria-expanded={open} aria-controls="references-panel" onClick={()=>setOpen(!open)}>Design references<Plus aria-hidden="true"/></button></h2><div id="references-panel" role="region" aria-labelledby="references-toggle" aria-hidden={!open} inert={!open} className={'references-panel '+(open?'is-open':'')} onTransitionEnd={e=>{if(e.target===e.currentTarget)ScrollTrigger.refresh();}}><div className="references-inner">
 <div className="coding-disclosure"><span className="section-label">How this site was made</span><h2 id="credits-title">This website is vibe coded.</h2><p>Built with AI assistance through Codex, shaped through iterative design and feedback, and powered by the work of the creators credited below.</p></div>
 <div className="credits-grid">{credits.map(([name,url,role])=><a key={name} href={url} target="_blank" rel="noopener noreferrer"><span>{name} ↗</span><small>{role}</small></a>)}</div>
 <p className="credits-note">Design references: <a href="https://21st.dev" target="_blank" rel="noopener noreferrer">21st.dev</a> and <a href="https://lusion.co" target="_blank" rel="noopener noreferrer">Lusion</a>. Retained shader utilities: <a href="https://smoothui.dev" target="_blank" rel="noopener noreferrer">SmoothUI / Eduardo Calvo</a>. Thank you to the open-source community.</p>
 </div></div></section>}




