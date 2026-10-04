import * as T from 'three';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
function release(group){const mats=new Set(),maps=new Set();group.traverse(o=>{o.geometry?.dispose();o.skeleton?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])mats.add(m);});mats.forEach(m=>{Object.values(m).forEach(x=>{if(x?.isTexture)maps.add(x);});m.dispose();});maps.forEach(t=>t.dispose());}
export function createNameDisplay(scene,{wake,onStatus}){
 const stage=document.querySelector('.name-stage'),overlay=new T.Scene();
 const camera=new T.OrthographicCamera(-4.5,4.5,2.7,-2.7,.1,40);camera.position.set(0,1.1,12);camera.lookAt(0,.7,0);
 const composition=new T.Group();overlay.add(composition);
 overlay.add(new T.HemisphereLight('#d7e7ff','#28202b',2));
 const key=new T.DirectionalLight('#ffe2c4',4.2);key.position.set(-3,6,7);key.castShadow=true;
 key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-5,right:5,top:4,bottom:-3,near:.1,far:25});key.shadow.normalBias=.015;
 overlay.add(key,key.target);const rim=new T.DirectionalLight('#aecbff',2.4);rim.position.set(5,3,-2);overlay.add(rim);
 let disposed=false,ready=false,visible=false,viewport=null;
 Promise.all([new FontLoader().loadAsync('/assets/characters/helvetiker_bold.typeface.json'),new T.TextureLoader().loadAsync('/assets/materials/concrete-color.webp')]).then(([font,texture])=>{
  if(disposed){texture.dispose();return;}
  texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(2.5,2.5);
  const front=new T.MeshStandardMaterial({color:'#c63a45',map:texture,roughness:.65,metalness:.15,emissive:'#5d1018',emissiveIntensity:.22});
  const edge=new T.MeshStandardMaterial({color:'#302b32',roughness:.38,metalness:.8});
  const geometry=new TextGeometry('PRANJAL',{font,size:1,depth:.3,curveSegments:6,bevelEnabled:true,bevelThickness:.022,bevelSize:.018,bevelSegments:2});
  geometry.computeBoundingBox();const width=geometry.boundingBox.max.x-geometry.boundingBox.min.x;
  geometry.translate(-width/2,-.55,0);const letters=new T.Mesh(geometry,[front,edge]);letters.castShadow=letters.receiveShadow=true;composition.add(letters);
  const floor=new T.Mesh(new T.PlaneGeometry(12,8),new T.ShadowMaterial({color:'#020509',opacity:.32}));floor.rotation.x=-Math.PI/2;floor.position.y=-.59;floor.receiveShadow=true;composition.add(floor);
  composition.rotation.y=-.12;composition.rotation.x=.015;
  ready=true;stage.dataset.loaded='true';onStatus?.([{name:'name-display',status:'ready'}]);wake();
 }).catch(e=>{onStatus?.([{name:'name-display',status:'failed'}]);console.error('Name display:',e);});
 return {update(){if(!stage)return;const r=stage.getBoundingClientRect();visible=ready&&r.bottom>80&&r.top<innerHeight&&r.width>0;viewport=r;},
  renderOverlay(renderer){if(!visible||!viewport)return;
   const r=viewport,oldViewport=renderer.getViewport(new T.Vector4()),oldScissor=renderer.getScissor(new T.Vector4()),oldTest=renderer.getScissorTest(),auto=renderer.autoClear;
   const aspect=r.width/r.height;camera.left=-3.25;camera.right=3.25;camera.top=3.25/aspect;camera.bottom=-3.25/aspect;camera.updateProjectionMatrix();
   renderer.setViewport(r.left,innerHeight-r.bottom,r.width,r.height);renderer.setScissor(Math.max(0,r.left),Math.max(0,innerHeight-r.bottom),Math.min(innerWidth,r.width),Math.min(innerHeight,r.height));renderer.setScissorTest(true);
   renderer.autoClear=false;renderer.clearDepth();renderer.shadowMap.needsUpdate=true;renderer.render(overlay,camera);
   renderer.setViewport(oldViewport);renderer.setScissor(oldScissor);renderer.setScissorTest(oldTest);renderer.autoClear=auto;
  },dispose(){disposed=true;release(overlay);key.shadow.dispose();}};
}
