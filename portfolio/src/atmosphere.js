import * as T from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export function createAtmosphere(renderer,camera){
 let seed=581;
 const bytes=new Uint8Array(64*64*64);
 for(let i=0;i<bytes.length;i++){seed=(seed*1664525+1013904223)>>>0;bytes[i]=seed>>>24;}
 const noise=new T.Data3DTexture(bytes,64,64,64);
 noise.format=T.RedFormat;noise.minFilter=noise.magFilter=T.LinearFilter;
 noise.wrapS=noise.wrapT=noise.wrapR=T.RepeatWrapping;noise.needsUpdate=true;
 const sceneTarget=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,samples:2});
 sceneTarget.depthTexture=new T.DepthTexture(1,1);sceneTarget.depthTexture.type=T.UnsignedIntType;
 const cloudTarget=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,depthBuffer:false});
 const blurTarget=cloudTarget.clone(),cleanCloudTarget=cloudTarget.clone();
 const inverse=new T.Matrix4();
 const uniforms={depth:{value:sceneTarget.depthTexture},noiseVolume:{value:noise},inverseVP:{value:inverse},eye:{value:camera.position},night:{value:1}};
 const vertex='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
 const cloudMaterial=new T.ShaderMaterial({uniforms,depthTest:false,depthWrite:false,vertexShader:vertex,fragmentShader:`
 precision highp sampler3D;
 varying vec2 vUv;uniform sampler2D depth;uniform sampler3D noiseVolume;
 uniform mat4 inverseVP;uniform vec3 eye;uniform float night;
 float n(vec3 p){vec3 cell=floor(p),f=fract(p);f=f*f*(3.-2.*f);return texture(noiseVolume,(cell+f+.5)/64.).r;}
 float fbm(vec3 p){return n(p)*.57+n(p*2.03+17.)*.28+n(p*4.11+9.)*.15;}
 float density(vec3 p){
  float top=18.+(fbm(vec3(p.x*.018,13.,p.z*.018))-.45)*56.;
  float billow=fbm(p*.105);
  float d=clamp((top-p.y)*.16+(billow-.48)*2.2,0.,1.)*smoothstep(3.,12.,p.y);
  float campus=exp(-pow(length((p.xz-vec2(70.,-130.))/vec2(52.,27.)),2.));
  float gate=exp(-dot(p.xz/vec2(17.,25.),p.xz/vec2(17.,25.)));
  float tower=exp(-dot((p.xz-vec2(-45.,-252.))/vec2(64.,50.),(p.xz-vec2(-45.,-252.))/vec2(64.,50.)));
  float clearing=smoothstep(.35,.65,fbm(vec3(p.x*.009,7.,p.z*.009)));
  return d*(1.-.80*campus)*(1.-.75*gate)*(1.-.66*tower)*mix(.35,1.,clearing);
 }
 void main(){
  vec4 farP=inverseVP*vec4(vUv*2.-1.,1.,1.);vec3 ray=normalize(farP.xyz/farP.w-eye);
  float z=texture2D(depth,vUv).r;vec4 wp=inverseVP*vec4(vUv*2.-1.,z*2.-1.,1.);
  float stop=z>.99995?950.:length(wp.xyz/wp.w-eye);
  float a=(61.-eye.y)/ray.y,b=(4.-eye.y)/ray.y;
  float start=max(0.,min(a,b)),finish=min(stop,min(800.,max(a,b)));
  if(finish<=start){gl_FragColor=vec4(0.);return;}
  float stepLength=(finish-start)/64.;vec4 sum=vec4(0.);float jitter=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);
  vec3 lightDir=normalize(vec3(-.5,.8,.3));
  float forward=pow(max(0.,dot(ray,lightDir)),5.);
  for(int i=0;i<64;i++){
   vec3 p=eye+ray*(start+(float(i)+jitter)*stepLength);float d=density(p);
   if(d>.012){
    float shadow=density(p+lightDir*4.)*.65+density(p+lightDir*10.)*.35;
    float lit=exp(-shadow*2.8);
    vec3 day=mix(vec3(.20,.28,.39),vec3(1.25,1.13,.90),lit);
    day+=vec3(.48,.25,.09)*forward*lit;
    vec3 dark=mix(vec3(.022,.040,.068),vec3(.20,.28,.38),lit);
    float beacon=exp(-length(p.xz)*.08)+exp(-length(p.xz-vec2(70.,-130.))*.065)+exp(-length(p.xz-vec2(-45.,-252.))*.07);
    dark+=vec3(.32,.13,.035)*beacon;
    float alpha=1.-exp(-d*stepLength*.27);
    sum.rgb+=(1.-sum.a)*alpha*mix(day,dark,night);sum.a+=(1.-sum.a)*alpha;
    if(sum.a>.992)break;
   }
  }
  float horizonFade=smoothstep(280.,750.,start);
  vec3 horizon=mix(vec3(.55,.66,.75),vec3(.024,.053,.10),night);
  sum.rgb=mix(sum.rgb,horizon*sum.a,horizonFade);gl_FragColor=sum;
 }`});
 // A depth-aware spatial filter removes ray-march speckles without changing density or light.
 const cleanMaterial=new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{image:{value:null},sceneDepth:{value:sceneTarget.depthTexture},direction:{value:new T.Vector2()},nearPlane:{value:camera.near},farPlane:{value:camera.far}},vertexShader:vertex,fragmentShader:`
 varying vec2 vUv;uniform sampler2D image,sceneDepth;uniform vec2 direction;uniform float nearPlane,farPlane;
 float viewDepth(vec2 uv){float z=texture2D(sceneDepth,uv).r;return nearPlane*farPlane/(farPlane-(farPlane-nearPlane)*z);}
 void main(){float center=viewDepth(vUv);vec4 sum=vec4(0.);float total=0.;
 for(int i=-4;i<=4;i++){vec2 uv=vUv+direction*float(i);float d=viewDepth(uv);float weight=exp(-float(i*i)/7.)*exp(-abs(center-d)*.12);sum+=texture2D(image,uv)*weight;total+=weight;}
 gl_FragColor=sum/max(total,.0001);}`});
 const composite=new ShaderPass({uniforms:{sceneColor:{value:null},cloudColor:{value:null}},vertexShader:vertex,fragmentShader:`
 varying vec2 vUv;uniform sampler2D sceneColor,cloudColor;
 void main(){vec4 c=texture2D(cloudColor,vUv);vec3 s=texture2D(sceneColor,vUv).rgb;gl_FragColor=vec4(s*(1.-c.a)+c.rgb,1.);}`});
 composite.uniforms.sceneColor.value=sceneTarget.texture;composite.uniforms.cloudColor.value=cleanCloudTarget.texture;
 const composer=new EffectComposer(renderer,new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,depthBuffer:false}));
 composer.setPixelRatio(1);
 const bloom=new UnrealBloomPass(new T.Vector2(1,1),1.15,.85,.85);
 const output=new OutputPass();composer.addPass(composite);composer.addPass(bloom);composer.addPass(output);
 const screen=new T.Scene(),ortho=new T.OrthographicCamera(-1,1,1,-1,0,1);
 const quad=new T.Mesh(new T.PlaneGeometry(2,2),cloudMaterial);screen.add(quad);
 return {
  resize(w,h){sceneTarget.setSize(w,h);cloudTarget.setSize(Math.max(1,Math.round(w*.6)),Math.max(1,Math.round(h*.6)));blurTarget.setSize(cloudTarget.width,cloudTarget.height);cleanCloudTarget.setSize(cloudTarget.width,cloudTarget.height);composer.setSize(w,h);},
  setNight(v){uniforms.night.value=v;bloom.strength=T.MathUtils.lerp(.18,.32,v);bloom.threshold=T.MathUtils.lerp(1.4,1.2,v);},
  render(scene){
   camera.updateMatrixWorld();inverse.multiplyMatrices(camera.matrixWorld,camera.projectionMatrixInverse);
   renderer.setRenderTarget(sceneTarget);renderer.render(scene,camera);
   quad.material=cloudMaterial;renderer.setRenderTarget(cloudTarget);renderer.render(screen,ortho);
   quad.material=cleanMaterial;cleanMaterial.uniforms.image.value=cloudTarget.texture;cleanMaterial.uniforms.direction.value.set(1/cloudTarget.width,0);renderer.setRenderTarget(blurTarget);renderer.render(screen,ortho);
   cleanMaterial.uniforms.image.value=blurTarget.texture;cleanMaterial.uniforms.direction.value.set(0,1/cloudTarget.height);renderer.setRenderTarget(cleanCloudTarget);renderer.render(screen,ortho);
   renderer.setRenderTarget(null);composer.render();
  },
  dispose(){sceneTarget.dispose();cloudTarget.dispose();blurTarget.dispose();cleanCloudTarget.dispose();cleanMaterial.dispose();noise.dispose();quad.geometry.dispose();cloudMaterial.dispose();composite.dispose();bloom.dispose();output.dispose();composer.dispose();}
 };
}

