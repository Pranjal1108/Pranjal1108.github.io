import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
const v=()=>new T.Vector3();
const bone=(root,pattern)=>{let result;root.traverse(o=>{if(o.isBone&&pattern.test(o.name))result??=o;});return result;};
function aim(root,a,b,direction){
 const joint=bone(root,a),end=bone(root,b);if(!joint||!end)return;
 root.updateMatrixWorld(true);
 const from=end.getWorldPosition(v()).sub(joint.getWorldPosition(v())).normalize();
 const to=new T.Vector3(...direction).normalize();
 const q=new T.Quaternion().setFromUnitVectors(from,to).multiply(joint.getWorldQuaternion(new T.Quaternion()));
 joint.quaternion.copy(joint.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(q));root.updateMatrixWorld(true);
}
function limb(root,a,b,c,u,l){aim(root,a,b,u);aim(root,b,c,l);}
export async function loadCharacter(){
 const gltf=await new GLTFLoader().loadAsync('/assets/characters/deadpool.glb');
 const root=new T.Group(),normalizer=new T.Group();root.add(normalizer);normalizer.add(gltf.scene);
 gltf.scene.rotation.y=-Math.PI/2;root.updateMatrixWorld(true);
 const box=new T.Box3().setFromObject(root,true),height=box.getSize(v()).y;
 normalizer.scale.setScalar(1/height);normalizer.position.copy(box.getCenter(v())).multiplyScalar(-1/height);root.updateMatrixWorld(true);
 limb(root,/L_Arm02_Shoulder/,/L_Arm03_Elbow/,/L_Arm04_Hand/,[-.6,-.7,.15],[-.1,-1,.3]);
 limb(root,/R_Arm02_Shoulder/,/R_Arm03_Elbow/,/R_Arm04_Hand/,[-.8,.3,.06],[.98,.23,.02]);
 limb(root,/L_Leg01_Thigh/,/L_Leg02_Knee/,/L_Leg03_Ankle/,[-.18,-1,.08],[.08,-1,.02]);
 limb(root,/R_Leg01_Thigh/,/R_Leg02_Knee/,/R_Leg03_Ankle/,[.02,-1,.17],[-.02,-1,-.05]);
 normalizer.rotation.z=Math.PI/2-.23;
 root.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.castShadow=o.receiveShadow=true;for(const m of Array.isArray(o.material)?o.material:[o.material]){m.metalness=Math.min(m.metalness??0,.22);m.roughness=.58;m.envMapIntensity=.8;m.emissiveIntensity=0;}}});
 root.updateMatrixWorld(true);root.traverse(o=>{if(o.isSkinnedMesh){o.skeleton.update();o.computeBoundingBox();}});
 const posed=new T.Box3().setFromObject(root,true);normalizer.position.sub(posed.getCenter(v()));root.updateMatrixWorld(true);
 return {root,bounds:new T.Box3().setFromObject(root,true).getSize(v())};
}
function release(group){const mats=new Set(),maps=new Set();group.traverse(o=>{o.geometry?.dispose();o.skeleton?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])mats.add(m);});mats.forEach(m=>{Object.values(m).forEach(x=>{if(x?.isTexture)maps.add(x);});m.dispose();});maps.forEach(t=>t.dispose());}
export function createCharacters(scene,{wake,onStatus}){
 const stage=document.querySelector('.name-stage'),overlay=new T.Scene();
 const camera=new T.OrthographicCamera(-4.5,4.5,2.7,-2.7,.1,40);camera.position.set(0,1.1,12);camera.lookAt(0,.7,0);
 const composition=new T.Group();overlay.add(composition);
 overlay.add(new T.HemisphereLight('#d7e7ff','#28202b',2));
 const key=new T.DirectionalLight('#ffe2c4',4.2);key.position.set(-3,6,7);key.castShadow=true;
 key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-5,right:5,top:4,bottom:-3,near:.1,far:25});key.shadow.normalBias=.015;
 overlay.add(key,key.target);const rim=new T.DirectionalLight('#aecbff',2.4);rim.position.set(5,3,-2);overlay.add(rim);
 let disposed=false,ready=false,visible=false,viewport=null;
 Promise.all([loadCharacter(),new FontLoader().loadAsync('/assets/characters/helvetiker_bold.typeface.json'),new T.TextureLoader().loadAsync('/assets/materials/concrete-color.webp')]).then(([model,font,texture])=>{
  if(disposed){release(model.root);texture.dispose();return;}
  texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(2.5,2.5);
  const front=new T.MeshStandardMaterial({color:'#c63a45',map:texture,roughness:.65,metalness:.15,emissive:'#5d1018',emissiveIntensity:.22});
  const edge=new T.MeshStandardMaterial({color:'#302b32',roughness:.38,metalness:.8});
  const geometry=new TextGeometry('PRANJAL',{font,size:1,depth:.3,curveSegments:6,bevelEnabled:true,bevelThickness:.022,bevelSize:.018,bevelSegments:2});
  geometry.computeBoundingBox();const width=geometry.boundingBox.max.x-geometry.boundingBox.min.x,letterTop=geometry.boundingBox.max.y-.55;
  geometry.translate(-width/2,-.55,0);const letters=new T.Mesh(geometry,[front,edge]);letters.castShadow=letters.receiveShadow=true;composition.add(letters);
  // Shared coordinates keep the posed model in contact with the capital tops.
  const scale=width*.97/model.bounds.x;model.root.scale.setScalar(scale);
  model.root.updateMatrixWorld(true);const support=new T.Box3().setFromObject(model.root,true);model.root.position.set(0,letterTop-support.min.y-.09,.14);composition.add(model.root);
  const floor=new T.Mesh(new T.PlaneGeometry(12,8),new T.ShadowMaterial({color:'#020509',opacity:.32}));floor.rotation.x=-Math.PI/2;floor.position.y=-.59;floor.receiveShadow=true;composition.add(floor);
  composition.rotation.y=-.12;composition.rotation.x=.015;
  ready=true;stage.dataset.loaded='true';onStatus?.([{name:'deadpool',status:'ready'}]);wake();
 }).catch(e=>{onStatus?.([{name:'deadpool',status:'failed'}]);console.error('Deadpool composition:',e);});
 return {update(){if(!stage)return;const r=stage.getBoundingClientRect();visible=ready&&r.bottom>80&&r.top<innerHeight&&r.width>0;viewport=r;},
  renderOverlay(renderer){if(!visible||!viewport)return;
   const r=viewport,oldViewport=renderer.getViewport(new T.Vector4()),oldScissor=renderer.getScissor(new T.Vector4()),oldTest=renderer.getScissorTest(),auto=renderer.autoClear;
   const aspect=r.width/r.height;camera.left=-3.25;camera.right=3.25;camera.top=3.25/aspect;camera.bottom=-3.25/aspect;camera.updateProjectionMatrix();
   renderer.setViewport(r.left,innerHeight-r.bottom,r.width,r.height);renderer.setScissor(Math.max(0,r.left),Math.max(0,innerHeight-r.bottom),Math.min(innerWidth,r.width),Math.min(innerHeight,r.height));renderer.setScissorTest(true);
   renderer.autoClear=false;renderer.clearDepth();renderer.shadowMap.needsUpdate=true;renderer.render(overlay,camera);
   renderer.setViewport(oldViewport);renderer.setScissor(oldScissor);renderer.setScissorTest(oldTest);renderer.autoClear=auto;
  },dispose(){disposed=true;release(overlay);key.shadow.dispose();}};
}

