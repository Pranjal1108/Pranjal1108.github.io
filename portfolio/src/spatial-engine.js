import {paletteColor} from './palette.js';
import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const vertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
// Screen-space refraction of the actual rendered scene, never a CSS blur.
// The relaxing DataTexture flow field is adapted from React Bits GridDistortion.
const fragment=`
varying vec2 vUv;uniform sampler2D image;uniform sampler2D flow;
uniform vec2 resolution;uniform vec3 wave;uniform float time;
void main(){
 vec4 paint=texture2DLodEXT(flow,vUv,0.);
 vec2 velocity=paint.rg/resolution;
 float energy=clamp(length(paint.rg)/38.,0.,1.);
 vec2 offset=velocity*1.4;
 if(length(offset*resolution)<.08){
  gl_FragColor=texture2DLodEXT(image,vUv,0.);
  #include <colorspace_fragment>
  return;
 }
 // Sample the scene along the wake: the pixels themselves stretch and smear.
 vec3 col=vec3(0.);
 for(int i=0;i<4;i++){
  float t=float(i)/3.;vec2 uv=clamp(vUv-offset*(.2+t),vec2(.001),vec2(.999));
  col+=vec3(texture2DLodEXT(image,uv+offset*.16,0.).r,texture2DLodEXT(image,uv,0.).g,texture2DLodEXT(image,uv-offset*.16,0.).b)/4.;
 }
 gl_FragColor=vec4(col,1.);
 #include <colorspace_fragment>
}`;

export function createSpatialScene(host,mode,initialMotion,initialTheme='light') {
 const compact=innerWidth<800 || navigator.connection?.saveData || (navigator.hardwareConcurrency||8)<=4;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const renderer=new T.WebGLRenderer({antialias:!compact,alpha:false,powerPreference:'default'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,compact?1:1.5));
 renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
 host.appendChild(renderer.domElement);
 const scene=new T.Scene();scene.background=new T.Color(mode==='field'?paletteColor('#dedfd6'):paletteColor('#e8e9e2'));
 const camera=new T.PerspectiveCamera(35,1,.1,50);camera.position.set(0,0,8);
 const group=new T.Group();scene.add(group);
 let env,pmrem,room,object,grid,gridBase,gridPositions,gridGeometry,pointMaterial;
 const fieldTime={value:0},fieldPointer={value:new T.Vector2()};
 const resources=[];
 if(mode==='sculpture') {
  pmrem=new T.PMREMGenerator(renderer);room=new RoomEnvironment();env=pmrem.fromScene(room,.04);scene.environment=env.texture;
  const geometry=new T.TorusKnotGeometry(1.2,.36,compact?160:240,compact?20:32,2,3);
  const material=new T.MeshPhysicalMaterial({color:paletteColor('#d1d9d4'),metalness:1,roughness:.16,clearcoat:1,clearcoatRoughness:.14,iridescence:.24,iridescenceIOR:1.3,iridescenceThicknessRange:[120,330],envMapIntensity:1.8});
  object=new T.Mesh(geometry,material);object.rotation.set(.32,-.45,.45);group.add(object);resources.push(geometry,material);
  scene.add(new T.HemisphereLight(paletteColor('#ffffff'),paletteColor('#616d59'),2));
  const light=new T.DirectionalLight(paletteColor('#ffffff'),4);light.position.set(3,5,4);scene.add(light);
 } else {
  // A breathing spherical membrane: evenly distributed points, no loops or chain.
  const count=compact?3000:6500,positions=new Float32Array(count*3);
  for(let i=0;i<count;i++){const y=1-2*(i+.5)/count,r=Math.sqrt(1-y*y),angle=i*Math.PI*(3-Math.sqrt(5));positions.set([Math.cos(angle)*r*1.6,y*1.6,Math.sin(angle)*r*1.6],i*3);}
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));
  pointMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{clock:fieldTime,pointer:fieldPointer,tint:{value:new T.Color(paletteColor('#354137'))},pointSize:{value:compact?16:18}},vertexShader:`
   uniform float clock;uniform vec2 pointer;uniform float pointSize;varying float shade;
   void main(){vec3 n=normalize(position);float lat=atan(n.z,n.x);float wave=sin(lat*6.+clock*.7+n.y*5.)*.10+sin(n.y*9.-clock*.8)*.06;
   float pull=pow(max(0.,dot(n,normalize(vec3(pointer*.8,1.)))),8.)*.16;
   vec3 p=position*(1.+wave+pull);vec4 mv=modelViewMatrix*vec4(p,1.);shade=.45+.55*max(0.,(modelMatrix*vec4(n,0.)).z);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(pointSize/-mv.z,1.,3.);}`,fragmentShader:`
   uniform vec3 tint;varying float shade;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(tint,shade*(1.-smoothstep(.3,.5,d)));
   #include <colorspace_fragment>
   }`});
  object=new T.Points(geometry,pointMaterial);object.rotation.set(.15,-.3,.1);group.add(object);resources.push(geometry,pointMaterial);
  // One indexed line grid, bent locally by proximity and click wavefronts.
  const n=compact?28:42,coords=[],indices=[];
  for(let y=0;y<n;y++)for(let x=0;x<n;x++)coords.push((x/(n-1)-.5)*9,(y/(n-1)-.5)*7,-1.8);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=x+y*n;if(x<n-1)indices.push(i,i+1);if(y<n-1)indices.push(i,i+n);}
  gridPositions=new Float32Array(coords);gridBase=new Float32Array(coords);gridGeometry=new T.BufferGeometry();
  gridGeometry.setAttribute('position',new T.BufferAttribute(gridPositions,3).setUsage(T.DynamicDrawUsage));gridGeometry.setIndex(indices);
  const material=new T.LineBasicMaterial({color:paletteColor('#667568'),transparent:true,opacity:.16});grid=new T.LineSegments(gridGeometry,material);scene.add(grid);resources.push(gridGeometry,material);
 }
 const target=new T.WebGLRenderTarget(1,1,{depthBuffer:true,type:T.UnsignedByteType});target.samples=compact?0:2;
 const size=compact?48:96,data=new Float32Array(size*size*4),scratch=new Float32Array(size*size*4),flow=new T.DataTexture(data,size,size,T.RGBAFormat,T.FloatType);
 flow.magFilter=T.LinearFilter;flow.minFilter=T.LinearFilter;flow.needsUpdate=true;
 const uniforms={image:{value:target.texture},flow:{value:flow},resolution:{value:new T.Vector2(1,1)},wave:{value:new T.Vector3(-5,-5,-100)},time:{value:0}};
 const postScene=new T.Scene(),postCamera=new T.Camera(),postGeometry=new T.PlaneGeometry(2,2),postMaterial=new T.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms,depthTest:false,depthWrite:false});
 postScene.add(new T.Mesh(postGeometry,postMaterial));resources.push(postGeometry,postMaterial,flow,target);
 let width=1,height=1,frame=0,visible=false,disposed=false,enabled=initialMotion&&!reduced.matches,last=0,time=0;
 let pointer={x:.5,y:.5,dx:0,dy:0,active:false,fromX:.5,fromY:.5},cx=0,cy=0,quality=renderer.getPixelRatio(),slow=0,frameCount=0,frameAverage=16.7;
 let scrollProgress=0;
 const section=host.closest(mode==='field'?'.field-section':'.hero');
 const scrollTrigger=section?ScrollTrigger.create({trigger:section,start:'top bottom',end:'bottom top',onUpdate:self=>{if(enabled){scrollProgress=self.progress;request();}}}):null;
 const raycaster=new T.Raycaster(),plane=new T.Plane(new T.Vector3(0,0,1),1.8),gridPointer=new T.Vector3(100,100,0);
 function resize(){const r=host.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);renderer.setSize(width,height);camera.aspect=width/height;camera.position.z=mode==='sculpture'?(width/height<.8?9.4:7.3):8.5;camera.updateProjectionMatrix();if(mode==='sculpture'){
   group.scale.setScalar(width<800?.68:.9);const viewHeight=2*camera.position.z*Math.tan(35*Math.PI/360);
   group.position.x=width>=800?viewHeight*camera.aspect*.22:0;
   group.position.y=width>=800?0:-viewHeight*.22;
  }const dpr=renderer.getPixelRatio();target.setSize(Math.floor(width*dpr),Math.floor(height*dpr));uniforms.resolution.value.set(width,height);request();}
 function move(e){if(!enabled||reduced.matches||!visible)return;const r=host.getBoundingClientRect();if(e.clientY<r.top||e.clientY>r.bottom||e.clientX<r.left||e.clientX>r.right){leave();return;}const x=(e.clientX-r.left)/r.width,y=1-(e.clientY-r.top)/r.height;
  if(pointer.active){pointer.dx+=Math.max(-.07,Math.min(.07,x-pointer.x));pointer.dy+=Math.max(-.07,Math.min(.07,y-pointer.y));}else{pointer.fromX=x;pointer.fromY=y;}
  pointer.x=x;pointer.y=y;pointer.active=true;
  raycaster.setFromCamera(new T.Vector2(x*2-1,y*2-1),camera);raycaster.ray.intersectPlane(plane,gridPointer);request();
 }
 function leave(){pointer.active=false;pointer.dx=pointer.dy=0;gridPointer.set(100,100,0);request();}
 function press(e){if(!enabled||reduced.matches||!visible)return;const r=host.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;move(e);uniforms.wave.value.set(pointer.x,pointer.y,time);host.dataset.ripples=String(Number(host.dataset.ripples||0)+1);request();}
 function updateFlow(dt){const cpuStart=performance.now();
  const decay=Math.pow(.94,dt*60),inkDecay=Math.pow(.92,dt*60);
  // Advect and diffuse the low-resolution velocity field. This retains a short,
  // directional wake rather than drawing a shape that follows the pointer.
  for(let y=1;y<size-1;y++)for(let x=1;x<size-1;x++){
   const i=4*(x+y*size),vx=data[i],vy=data[i+1];
   const ax=Math.max(0,Math.min(size-1,x-vx*dt*size/width)),ay=Math.max(0,Math.min(size-1,y-vy*dt*size/height));
   const ix=Math.floor(ax),iy=Math.floor(ay),fx=ax-ix,fy=ay-iy;
   const j=4*(ix+iy*size),right=4*Math.min(ix+1,size-1)+iy*size*4,up=4*(ix+Math.min(iy+1,size-1)*size),ur=4*(Math.min(ix+1,size-1)+Math.min(iy+1,size-1)*size);
   for(let c=0;c<3;c++){
    const adv=(data[j+c]*(1-fx)+data[right+c]*fx)*(1-fy)+(data[up+c]*(1-fx)+data[ur+c]*fx)*fy;
    const diffuse=(data[i-4+c]+data[i+4+c]+data[i-size*4+c]+data[i+size*4+c])*.25;
    scratch[i+c]=(adv*.88+diffuse*.12)*(c===2?inkDecay:decay);
   }
  }
  data.set(scratch);
  const dx=pointer.dx*width,dy=pointer.dy*height,speed=Math.hypot(dx,dy);
  if(pointer.active&&speed>.15){
   const x0=pointer.fromX*width,y0=pointer.fromY*height,x1=pointer.x*width,y1=pointer.y*height;
   const sx=x1-x0,sy=y1-y0,seg=sx*sx+sy*sy;
   const radius=compact?30:36;
   const minX=Math.max(1,Math.floor((Math.min(x0,x1)-radius*2)/width*size)),maxX=Math.min(size-2,Math.ceil((Math.max(x0,x1)+radius*2)/width*size));
   const minY=Math.max(1,Math.floor((Math.min(y0,y1)-radius*2)/height*size)),maxY=Math.min(size-2,Math.ceil((Math.max(y0,y1)+radius*2)/height*size));
   for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
    const px=x/(size-1)*width,py=y/(size-1)*height,t=seg?Math.max(0,Math.min(1,((px-x0)*sx+(py-y0)*sy)/seg)):0;
    const d=Math.hypot(px-x0-sx*t,py-y0-sy*t),weight=Math.exp(-d*d/(radius*radius)*2.7),i=4*(x+y*size);
    data[i]=Math.max(-65,Math.min(65,data[i]+dx*weight*.65));data[i+1]=Math.max(-65,Math.min(65,data[i+1]+dy*weight*.65));data[i+2]=Math.min(1,data[i+2]+weight*.6);
   }
  }
  pointer.fromX=pointer.x;pointer.fromY=pointer.y;pointer.dx=pointer.dy=0;flow.needsUpdate=true;host.dataset.flowMs=(performance.now()-cpuStart).toFixed(2);
  if(frameCount%15===0)host.dataset.paintEnergy=Math.max(...data.filter((_,i)=>i%4===2)).toFixed(3);
 }
 function render(timestamp){const renderStart=performance.now();frame=0;if(disposed||document.hidden||!visible)return;
  const elapsed=last?timestamp-last:16.7;const dt=Math.min(elapsed/1000,.05);last=timestamp;
  if(enabled){time+=dt;updateFlow(dt);const follow=1-Math.exp(-7*dt),gainX=mode==='sculpture'?.72:.4,gainY=mode==='sculpture'?.52:.32;cx+=((pointer.active?(pointer.x-.5)*gainX:0)-cx)*follow;cy+=((pointer.active?(pointer.y-.5)*gainY:0)-cy)*follow;
   group.rotation.z=cx*.18;host.dataset.pointerTilt=[cx.toFixed(3),cy.toFixed(3)].join(",");group.rotation.y=time*.075+cx+scrollProgress*.8;group.rotation.x=Math.sin(time*.2)*.08-cy+scrollProgress*.18;
   group.scale.setScalar(mode==='field'?1+scrollProgress*.16:(width<800?.68:.9));
   if(mode==='field')group.position.y=Math.sin(time*.6)*.045;else{const vh=2*camera.position.z*Math.tan(35*Math.PI/360);group.position.x=(width>=800?vh*camera.aspect*.22:0)+cx*.28;group.position.y=(width>=800?0:-vh*.22)+Math.sin(time*.6)*.045+cy*.16;}
   fieldTime.value=time;fieldPointer.value.set(cx*4,cy*4);
   if(grid){const wave=uniforms.wave.value,age=time-wave.z;
    for(let i=0;i<gridPositions.length;i+=3){const x=gridBase[i],y=gridBase[i+1],d=Math.hypot(x-gridPointer.x,y-gridPointer.y),pull=pointer.active?Math.exp(-d*d*.8):0;
     const waveX=(wave.x-.5)*9,waveY=(wave.y-.5)*7,wd=Math.hypot(x-waveX,y-waveY);
     const ripple=age<2?Math.sin(wd*5-age*8)*Math.exp(-((wd-age*2.3)**2)*1.5)*Math.exp(-age)*.3:0;
     gridPositions[i]=x+(gridPointer.x-x)*pull*.14;gridPositions[i+1]=y+(gridPointer.y-y)*pull*.14;gridPositions[i+2]=-1.8+pull*.9+ripple;
    }gridGeometry.attributes.position.needsUpdate=true;
   }
  }
  uniforms.time.value=time;
  renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.setRenderTarget(null);renderer.render(postScene,postCamera);
  host.dataset.renderMs=(performance.now()-renderStart).toFixed(2);host.dataset.state='ready';host.dataset.frames=String(++frameCount);frameAverage=frameAverage*.95+elapsed*.05;
  if(frameCount%60===0){host.dataset.frameMs=frameAverage.toFixed(1);host.dataset.pixelRatio=String(renderer.getPixelRatio());host.dataset.drawCalls=String(renderer.info.render.calls);}
  if(enabled&&frameCount>30&&elapsed>25)slow++;else slow=Math.max(0,slow-1);
  if(slow>50&&quality>.8){quality=Math.max(.8,quality*.8);renderer.setPixelRatio(quality);slow=0;resize();}
  if(enabled)request();
 }
 function request(){if(!frame&&visible&&!document.hidden&&!disposed)frame=requestAnimationFrame(render);}
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){last=0;request();}else{cancelAnimationFrame(frame);frame=0;host.dataset.rendering='paused';}host.dataset.rendering=visible?'visible':'paused';},{threshold:0});observer.observe(host);
 const resizer=new ResizeObserver(resize);resizer.observe(host);
 const visibility=()=>{cancelAnimationFrame(frame);frame=0;last=0;if(!document.hidden)request();};
 const contextLost=e=>{e.preventDefault();cancelAnimationFrame(frame);frame=0;host.dataset.state='fallback';renderer.domElement.style.opacity='0';};
 const contextRestored=()=>{host.dataset.state='loading';renderer.domElement.style.opacity='';request();};
 function setTheme(theme){const dark=theme==='dark';scene.background.set(dark?(mode==='field'?paletteColor('#1d241d'):paletteColor('#171c17')):(mode==='field'?paletteColor('#dedfd6'):paletteColor('#e8e9e2')));if(pointMaterial)pointMaterial.uniforms.tint.value.set(dark?paletteColor('#bdcea9'):paletteColor('#354137'));if(grid){grid.material.color.set(dark?paletteColor('#a2b093'):paletteColor('#667568'));grid.material.opacity=dark?.07:.10;}host.dataset.theme=theme;request();}
 window.addEventListener('pointermove',move,{passive:true});document.documentElement.addEventListener('pointerleave',leave);window.addEventListener('pointerdown',press,{passive:true});document.addEventListener('visibilitychange',visibility);
 renderer.domElement.addEventListener('webglcontextlost',contextLost);renderer.domElement.addEventListener('webglcontextrestored',contextRestored);
 setTheme(initialTheme);resize();
 return {setTheme,setMotion(value){enabled=value&&!reduced.matches;last=0;if(!enabled){data.fill(0);scratch.fill(0);flow.needsUpdate=true;uniforms.wave.value.z=-100;leave();}request();},
  dispose(){disposed=true;cancelAnimationFrame(frame);scrollTrigger?.kill();observer.disconnect();resizer.disconnect();window.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',leave);window.removeEventListener('pointerdown',press);document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',contextLost);renderer.domElement.removeEventListener('webglcontextrestored',contextRestored);resources.forEach(r=>r.dispose());env?.dispose();room?.dispose();pmrem?.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}
 };
}
