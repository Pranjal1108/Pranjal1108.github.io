import React,{useEffect,useRef,useState} from 'react';
import {ArrowUpRight,ArrowDown,Pause,Play,Sun,Moon} from 'lucide-react';
import data from './portfolio.json';
import {GitWorkflow,AimPreview,JobSource,AirportChart} from './ProjectVisuals.jsx';
const visuals=[GitWorkflow,AimPreview,JobSource,AirportChart];
const summaries=['From a project folder to a GitHub repository.','A faster aim starts with one target.','Connecting job seekers with their next opportunity.','Turning airport development data into a clearer picture.'];
const projectLinks=['https://github.com/Pranjal1108/git-pusher',null,'https://github.com/Pranjal1108/Online-Job-Portal','https://github.com/Pranjal1108/DataAnalytics'];
function Chapter({id,side='left',label,children,className='',visual}){
 return <section id={id} data-side={side} className={'flight-chapter '+className}><div className="chapter-frame"><div className={'chapter-layout '+(visual?'with-visual':'')}><article className={'scene-copy '+side}>{children}</article>{visual}</div>{label&&<span className="place-note">{label}</span>}</div></section>;
}
export default function App(){
 const mount=useRef(null),engine=useRef(null),motionRef=useRef(true),themeRef=useRef('night');
 const [ready,setReady]=useState(false),[failed,setFailed]=useState(false),[motion,setMotion]=useState(true);
 const [theme,setTheme]=useState(()=>{try{return localStorage.getItem('portfolio-scene-theme')||'night';}catch{return 'night';}});
 useEffect(()=>{let cancelled=false;import('./flight.js').then(async({createFlight})=>{
  if(cancelled)return;try{const next=await createFlight(mount.current,{onReady:()=>!cancelled&&setReady(true),onError:()=>!cancelled&&setFailed(true),isCancelled:()=>cancelled});
  if(cancelled){next?.dispose();return;}engine.current=next;next.setMotion(motionRef.current);next.setTheme(themeRef.current);
  }catch{if(!cancelled)setFailed(true);}}).catch(()=>{if(!cancelled)setFailed(true);});
  return()=>{cancelled=true;engine.current?.dispose();};
 },[]);
 useEffect(()=>{motionRef.current=motion;engine.current?.setMotion(motion);},[motion]);
 useEffect(()=>{themeRef.current=theme;engine.current?.setTheme(theme);try{localStorage.setItem('portfolio-scene-theme',theme);}catch{}},[theme]);
 return <main data-theme={theme} className={'portfolio '+(failed?'scene-fallback':'')}>
  <a className="skip" href="#about">Skip to content</a>
  <div className="world" ref={mount} aria-hidden="true"/><div className="film-shade" aria-hidden="true"/><div className="aperture-veil" aria-hidden="true"/>
  <header className="masthead"><a className="identity" href="#intro">PS<span>Pranjal Saini</span></a>
   <nav aria-label="Portfolio"><a className="wide-nav" href="#about">About</a><a href="#education">Education</a><a href="#project-0">Work</a><a className="wide-nav" href="#skills">Skills</a><a href="#contact">Contact <ArrowUpRight/></a></nav>
   <button className="theme-toggle" aria-label={theme==='day'?'Switch to night':'Switch to day'} onClick={()=>setTheme(theme==='day'?'night':'day')}>{theme==='day'?<Moon/>:<Sun/>}<span>{theme==='day'?'Night':'Day'}</span></button>
   <button className="motion-toggle" aria-label={motion?'Disable camera motion':'Enable camera motion'} aria-pressed={!motion} onClick={()=>setMotion(!motion)}>{motion?<Pause/>:<Play/>}</button>
  </header>
  <div className="flight-story">
   <section className="flight-chapter opening" data-side="left" id="intro"><div className="chapter-frame"><div className="intro-type"><p className="eyebrow">Pranjal Saini / Portfolio</p><h1>A different<br/>point of view.</h1><p className="intro-description">Come for the journey.<br/>Stay for what I’m building.</p><a href="#about" className="primary-link">Come along <ArrowDown/></a><a href="#project-0" className="quiet-link">Or go straight to my work <ArrowUpRight/></a></div><span className="opening-location">A flight through my world</span></div></section>
   <section className="flight-chapter about-chapter" data-side="left" id="about"><div className="chapter-frame"><div className="about-layout"><div className="name-stage" role="img" aria-label="Sculpted red letters spelling Pranjal"><h2 className="name-fallback">PRANJAL</h2></div><article className="about-copy"><p className="eyebrow">Meet the person behind the code</p><h2>A little about me.</h2><p className="role">{data.role}</p><p>{data.about}</p><a className="scene-link" href="#education">Where I’m learning <ArrowDown/></a></article></div></div></section>
   <Chapter id="education" label="Galgotias University, Greater Noida"><p className="eyebrow">Education</p><h2>Where it<br/>takes shape.</h2><div className="resume-list">{data.education.map(e=><div className="resume-row" key={e.name}><h3>{e.name}</h3><p>{e.degree.replace('—',',')}</p><small>{e.meta}</small></div>)}</div><a className="scene-link" href="#certifications">Beyond the classroom <ArrowDown/></a></Chapter>
   <Chapter id="certifications" side="right" className="certifications-chapter"><h2>Still curious.</h2><p className="body-copy">Learning beyond the degree.</p><div className="resume-list compact">{data.certifications.map(c=><div className="resume-row" key={c.name}><h3>{c.name}</h3><p>{c.issuer}</p></div>)}</div><a className="scene-link" href="#project-0">See what I’ve built <ArrowUpRight/></a></Chapter>
   {data.projects.map((p,i)=>{const Visual=visuals[i];return <Chapter id={'project-'+i} side="left" key={p.name} className={'work-chapter project-'+i} visual={<Visual/>}>{i===0&&<p className="eyebrow">Selected work</p>}<h2>{p.name}</h2><p className="project-summary">{summaries[i]}</p><p className="project-tech">{p.tech.replaceAll(' · ', ' / ')}</p><div className="project-description">{p.points.map(t=><p key={t}>{t}</p>)}</div>{projectLinks[i]?<a className="primary-link" href={projectLinks[i]} target="_blank" rel="noopener noreferrer">Explore the source <ArrowUpRight/></a>:<a className="scene-link" href="#project-2">Next project <ArrowDown/></a>}</Chapter>;})}
   <Chapter id="skills" className="skills-chapter"><h2>What I work with.</h2><div className="skills-layout">{data.skills.map(g=><div className="skill-group" id={g.name==='Concepts'?'approach':undefined} key={g.name}><h3>{g.name}</h3><p>{g.items.join(', ')}</p></div>)}</div><a href="#contact" className="scene-link">Let’s connect <ArrowDown/></a></Chapter>
   <Chapter id="contact" className="contact-chapter"><p className="eyebrow">You’ve reached the next chapter</p><h2>Let’s build<br/>something.</h2><p className="body-copy">{data.contact}</p><a className="contact-email" href={data.links[0].href}>Email me <ArrowUpRight/></a><div className="contact-links">{data.links.slice(1).map(l=><a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">{l.name}<ArrowUpRight/></a>)}</div><div className="contact-bottom"><p>© 2026 Pranjal Saini</p><a href="#intro">Back to the beginning ↑</a></div><details className="asset-credits"><summary>Scene credits</summary><p><a href="https://unsplash.com/photos/infssQ2tjeM" target="_blank" rel="noreferrer">Himalayan photograph by Eugene Ga</a></p></details></Chapter>
  </div>
  <p className="sr-only" role="status">{failed?'The 3D view could not load. All portfolio content is available.':ready?'The flight is ready. Scroll to travel.':'Loading the scene. Portfolio content is available.'}</p>
 </main>;
}

