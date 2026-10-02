import React,{useState} from 'react';
import {Folder,ShieldCheck,GitBranch,CloudUpload,ArrowRight,RotateCcw} from 'lucide-react';
const steps=[
 {name:'Choose a folder',icon:Folder,detail:'Start with an existing project on your computer.'},
 {name:'Check credentials',icon:ShieldCheck,detail:'Scan changed files for common credential formats before committing.'},
 {name:'Choose a branch',icon:GitBranch,detail:'Keep the existing branch and remote, or explicitly choose a new branch.'},
 {name:'Commit & push',icon:CloudUpload,detail:'Create the commit and send the project to GitHub.'}
];
export function GitWorkflow(){
 const [step,setStep]=useState(0),Icon=steps[step].icon;
 return <figure className="project-visual git-visual"><figcaption>Inside GIT PUSHer</figcaption><div className="workflow-path">{steps.map((s,i)=><React.Fragment key={s.name}><button aria-label={s.name} aria-pressed={step===i} onClick={()=>setStep(i)}><s.icon/></button>{i<3&&<ArrowRight className="path-arrow"/>}</React.Fragment>)}</div><div className="workflow-detail"><Icon/><h3>{steps[step].name}</h3><p>{steps[step].detail}</p></div><p className="visual-note">Explore the workflow</p></figure>;
}
const targets=[[72,34],[26,67],[63,70],[34,29],[79,62],[49,47]];
export function AimPreview(){
 const [hits,setHits]=useState(0),[started,setStarted]=useState(false);
 return <figure className="project-visual aim-visual"><figcaption>Aim Trainer / interactive sketch</figcaption><div className="aim-field"><span className="aim-score">{String(hits).padStart(2,'0')} <small>hits</small></span><button className="aim-target" style={{left:targets[hits%6][0]+'%',top:targets[hits%6][1]+'%'}} aria-label="Hit target" onClick={()=>{setHits(h=>h+1);setStarted(true);}}/><p>{started?'Keep going.':'Click the target.'}</p></div><div className="visual-footer"><span>A small browser version of the core mechanic.</span><button aria-label="Reset target practice" onClick={()=>{setHits(0);setStarted(false);}}><RotateCcw/></button></div></figure>;
}
export function JobSource(){
 return <figure className="project-visual source-visual"><figcaption>From the project / JobServlet.java</figcaption><div className="source-flow"><span>Application</span><ArrowRight/><span>Servlet</span><ArrowRight/><span>Database</span></div><pre><code>{'String query =\n  "INSERT INTO applications " +\n  "(user_id, job_id) VALUES (?, ?)";\n\ntry (PreparedStatement stmt =\n    conn.prepareStatement(query)) {\n  stmt.setInt(1, userId);\n  stmt.setInt(2, jobId);\n  stmt.executeUpdate();\n}'}</code></pre><a className="visual-note" href="https://github.com/Pranjal1108/Online-Job-Portal/blob/main/src/Main/Java/com/onlinejobportal/JobServlet.java" target="_blank" rel="noreferrer">Read the application handler ↗</a></figure>;
}
export function AirportChart(){
 const [metric,setMetric]=useState('capacity');
 const values=metric==='capacity'?[12,30,50,70]:[4588,5983,8415,10575],max=Math.max(...values);
 return <figure className="project-visual airport-visual"><figcaption>Noida airport / project dataset</figcaption><div className="chart-switch"><button aria-pressed={metric==='capacity'} onClick={()=>setMetric('capacity')}>Passenger capacity</button><button aria-pressed={metric==='cost'} onClick={()=>setMetric('cost')}>Estimated cost</button></div><p className="chart-unit">{metric==='capacity'?'Million passengers per annum':'₹ crore'}</p><div className="airport-bars">{values.map((value,i)=><div key={i}><strong>{value.toLocaleString('en-IN')}</strong><span style={{height:(value/max*130)+'px'}}/><small>Phase {i+1}</small></div>)}</div><a className="visual-note" href="https://github.com/Pranjal1108/DataAnalytics/blob/main/noida_airport_data.csv" target="_blank" rel="noreferrer">View the repository dataset ↗</a></figure>;
}

