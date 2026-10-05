import VisualBoundary from './VisualBoundary.jsx';
import ContactBlackHole from './ContactBlackHole.jsx';
import BallpitIsland from './BallpitIsland.jsx';
import Credits from './Credits.jsx';
import NameVeil from './NameVeil.jsx';
import {paletteColor} from './palette.js';
import React, {useEffect, useRef, useState, lazy, Suspense} from 'react';
import {ArrowUpRight, ArrowRight, Plus, Minus, Pause, Play, Menu, X, Sun, Moon} from 'lucide-react';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import data from './portfolio.json';
import GradualBlur from './GradualBlur.jsx';
import {useChoreography} from './motion.js';
const SplashCursor=lazy(()=>import('./SplashCursor.jsx'));
const SpatialScene = lazy(()=>import('./SpatialScene.jsx'));
const categories=['Developer tooling','Interactive systems','Web applications','Data & visualization'];
const summaries=['Less setup. More shipping.','Precision, built into play.','A better path to the next role.','Complex data. Clearer decisions.'];
const projectLinks=[data.projects[0].url,null,'https://github.com/Pranjal1108/Online-Job-Portal','https://github.com/Pranjal1108/DataAnalytics'];

function SceneIsland({mode='sculpture',motion,theme}) {
 const host=useRef(null); const [near,setNear]=useState(mode==='sculpture');
 useEffect(()=>{const observer=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){setNear(true);observer.disconnect();}},{rootMargin:'300px'});observer.observe(host.current);return()=>observer.disconnect();},[]);
 return <div ref={host} className={'scene-island '+mode}>
  <img className="scene-poster" src={'/assets/'+mode+(theme==='dark'?'-dark':'')+'-poster.webp'} alt="" aria-hidden="true" width="1200" height="1000" loading={mode==='sculpture'?'eager':'lazy'}/>
  {near&&<Suspense fallback={null}><VisualBoundary><SpatialScene mode={mode} motion={motion} theme={theme}/></VisualBoundary></Suspense>}
  {mode!=='field'&&<GradualBlur className="scene-edge-blur" position="bottom" strength={1.5} divCount={5} exponential zIndex={1}/>}
 </div>;
}
function Project({project,index}) {
 const [expanded,setExpanded]=useState(false);
 return <article className={'project project-'+index} id={'project-'+index}>
  <div className="project-heading"><span className="project-index">{String(index+1).padStart(2,'0')}</span><span>{categories[index]}</span></div>
  <div className="project-composition"><div className="project-copy"><h3>{project.name}</h3><p className="project-lead">{summaries[index]}</p><p className="project-tech">{project.tech}</p>
   <button className="detail-toggle" aria-expanded={expanded} aria-controls={'detail-'+index} onClick={()=>{setExpanded(!expanded);setTimeout(()=>ScrollTrigger.refresh(),350);}}>Project details {expanded?<Minus/>:<Plus/>}</button>
   <div id={'detail-'+index} className="project-details" hidden={!expanded}>{project.points.map(point=><p key={point}>{point}</p>)}</div>
   {projectLinks[index]&&<a className="source-link magnetic" href={projectLinks[index]} target="_blank" rel="noopener noreferrer">View source <ArrowUpRight/></a>}
  </div></div>
 </article>;
}
export default function App() {
 const root=useRef(null);
 const [motion,setMotion]=useState(()=>!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [menu,setMenu]=useState(false);
 const [theme,setTheme]=useState(()=>{try{return localStorage.getItem('portfolio-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');}catch{return 'light';}});
 useEffect(()=>{document.documentElement.dataset.theme=theme;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',paletteColor(theme==='dark'?'#171c17':'#e8e9e2'));try{localStorage.setItem('portfolio-theme',theme);}catch{}},[theme]);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setMotion(!media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
 useEffect(()=>{const close=e=>{if(e.key==='Escape')setMenu(false);};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[]);
 useChoreography(root,motion);
 return <main ref={root} data-theme={theme} className={'portfolio '+(!motion?'motion-paused':'')}>
  {motion&&<Suspense fallback={null}><VisualBoundary><SplashCursor SIM_RESOLUTION={innerWidth<800?64:128} DYE_RESOLUTION={innerWidth<800?256:512} PRESSURE_ITERATIONS={innerWidth<800?8:12} DENSITY_DISSIPATION={5} VELOCITY_DISSIPATION={9} PRESSURE={0.9} CURL={0} STRAIGHT_TRAIL={true} SPLAT_RADIUS={0.37 / 4} SPLAT_FORCE={2800} RAINBOW_MODE={true} COLOR_UPDATE_SPEED={18}/></VisualBoundary></Suspense>}
  <a className="skip" href="#work">Skip to content</a>
  <header className="masthead"><a href="#intro" className="identity" aria-label="Pranjal Saini, home">pranjal<span className="identity-star">✳</span></a>
   <nav id="mobile-nav" aria-label="Main navigation" className={menu?'is-open':''}><a href="#work" onClick={()=>setMenu(false)}>Work</a><a href="#about" onClick={()=>setMenu(false)}>About</a><a href="#contact" onClick={()=>setMenu(false)}>Contact <ArrowUpRight/></a></nav>
   <div className="nav-controls"><button className="theme-toggle" onClick={()=>setTheme(theme==='dark'?'light':'dark')} aria-label={theme==='dark'?'Switch to light mode':'Switch to dark mode'} aria-pressed={theme==='dark'}>{theme==='dark'?<Sun/>:<Moon/>}</button><button className="motion-toggle" onClick={()=>setMotion(!motion)} aria-label={motion?'Pause animations':'Enable animations'} aria-pressed={!motion}>{motion?<Pause/>:<Play/>}</button><button className="menu-toggle" aria-expanded={menu} aria-controls="mobile-nav" aria-label={menu?'Close menu':'Open menu'} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></div>
  </header>
  <section className="hero" id="intro">
   <div className="hero-art"><SceneIsland motion={motion} theme={theme}/></div>
   <div className="hero-copy"><p className="hero-role">Software developer & CS student</p><h1><span className="text-mask"><span>Ideas into</span></span><span className="text-mask"><span>something<span className="heading-period">.</span></span></span></h1><p className="hero-description">Thoughtful software. Playful exploration.<br/>Built with purpose, from the ground up.</p><a href="#work" className="round-link magnetic"><span>Explore my work</span><span className="round-arrow"><ArrowUpRight/></span></a></div>
   <div className="hero-bottom"><span>Pranjal Saini</span><span>Code with intention.</span></div>
  </section>
  <section className="statement section-space"><p className="statement-copy reveal">Good software starts<br/>with <span>a better question.</span></p><div className="statement-bottom"><p>I turn problems into practical tools, connected applications, and experiences you can interact with.</p><a className="line-link" href="#about">The person behind the work <ArrowRight/></a></div></section>
  <section id="work" className="work section-space"><div className="work-layout"><div className="work-intro"><span className="section-label">Selected work</span><h2>Made to<br/> do more.</h2><p>Four projects.<br/>Different problems.<br/>One curious mind.</p><a className="line-link" href={data.links[2].href} target="_blank" rel="noopener noreferrer">All repositories <ArrowUpRight/></a></div><div className="projects">{data.projects.map((project,index)=><Project key={project.name} project={project} index={index}/>)}</div></div></section>
  <section className="field-section" aria-labelledby="field-title"><div className="field-title"><h2 id="field-title" className="reveal">A little curiosity.<br/>A different dimension.</h2><p>Move your cursor. Stir things up.</p></div><div className="field-art"><VisualBoundary fallback={<div className="ballpit-rest"/>}><BallpitIsland motion={motion}/></VisualBoundary></div><p className="field-end" aria-hidden="true">Build.<br/>Learn.<br/>Repeat.</p></section>
  <section id="about" className="about section-space"><VisualBoundary><NameVeil motion={motion} theme={theme}/></VisualBoundary><div className="about-top"><span className="section-label">A work in progress</span><h2 className="reveal">Always building.<br/><span>Always learning.</span></h2></div><div className="about-body"><p className="about-intro">I’m a Computer Science student at Galgotias University, exploring the space between an idea and a working application.</p><div><p>My projects span Python tools, Java applications, data visualization, and interactive systems. Right now, I’m learning computer automation with PyAutoGUI, OpenCV, and Selenium.</p><p>I care about clear thinking, clean structure, and making things that are useful to someone.</p></div></div>
   <div className="background-grid"><div className="education"><h3>Education</h3>{data.education.map(item=><div className="education-item" key={item.name}><h4>{item.name}</h4><p>{item.degree}</p><small>{item.meta}</small></div>)}</div><div className="certifications"><h3>Beyond the classroom</h3>{data.certifications.map(item=><div className="cert-row" key={item.name}><span>{item.name}</span><span>{item.issuer}</span></div>)}</div></div>
  </section>
  <section id="skills" className="skills section-space"><h2>Tools of<br/><span>the practice.</span></h2><div className="skills-list">{data.skills.map(group=><div className="skill-row" key={group.name}><h3>{group.name}</h3><p>{group.items.join(' / ')}</p><ArrowUpRight aria-hidden="true"/></div>)}</div></section>
  <footer id="contact" className="contact section-space"><ContactBlackHole motion={motion}/><div className="contact-top"><p>Have something in mind?</p><span>Open to opportunities & collaboration</span></div><a className="contact-title magnetic" href={data.links[0].href}>Let’s make<br/>it happen.<ArrowUpRight/></a><a href={data.links[0].href} className="email-link">pranjalsaini3030@gmail.com <ArrowUpRight/></a><Credits/><div className="footer-bottom"><a href="#intro" className="identity">pranjal<span className="identity-star">✳</span></a><div className="social-links">{data.links.slice(1).map(link=><a href={link.href} key={link.name} target="_blank" rel="noopener noreferrer">{link.name}<ArrowUpRight/></a>)}</div><div className="footer-info"><span>© {new Date().getFullYear()} Pranjal Saini</span></div></div></footer>
 </main>;
}











