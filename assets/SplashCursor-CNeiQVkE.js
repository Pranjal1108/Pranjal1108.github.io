import{r as j,R as me}from"./index-C1LHecPl.js";function dt({SIM_RESOLUTION:he=128,DYE_RESOLUTION:xe=1440,CAPTURE_RESOLUTION:lt=512,DENSITY_DISSIPATION:Te=3.5,VELOCITY_DISSIPATION:Re=2,PRESSURE:pe=.1,PRESSURE_ITERATIONS:ge=20,CURL:Ee=3,STRAIGHT_TRAIL:Se=!1,SPLAT_RADIUS:De=.2,SPLAT_FORCE:ye=6e3,SHADING:Fe=!0,COLOR_UPDATE_SPEED:Ae=10,BACK_COLOR:st={r:.5,g:0,b:0},TRANSPARENT:ft=!0,RAINBOW_MODE:we=!0,COLOR:_e="#a855f7"}){const J=j.useRef(null),h=j.useRef(null);return j.useEffect(()=>{const a=J.current;if(!a)return;let Q=!0,Y=-1/0;const P={Texture:new Set,Framebuffer:new Set,Buffer:new Set,Shader:new Set,Program:new Set},y=(e,r)=>(P[e].add(r),r);function be(){this.id=-1,this.texcoordX=0,this.texcoordY=0,this.prevTexcoordX=0,this.prevTexcoordY=0,this.deltaX=0,this.deltaY=0,this.down=!1,this.moved=!1,this.color=[0,0,0]}let s={SIM_RESOLUTION:he,DYE_RESOLUTION:xe,DENSITY_DISSIPATION:Te,VELOCITY_DISSIPATION:Re,PRESSURE:pe,PRESSURE_ITERATIONS:ge,CURL:Ee,STRAIGHT_TRAIL:Se,SPLAT_RADIUS:De,SPLAT_FORCE:ye,SHADING:Fe,COLOR_UPDATE_SPEED:Ae,RAINBOW_MODE:we,COLOR:_e},F=[new be];const{gl:t,ext:x}=Le(a);if(!t||!x.formatRGBA||!x.formatRG||!x.formatR){a.dataset.state="fallback";return}a.dataset.state="ready",a.dataset.motion=s.STRAIGHT_TRAIL?"straight":"fluid",a.dataset.simResolution=String(s.SIM_RESOLUTION),a.dataset.dyeResolution=String(s.DYE_RESOLUTION),x.supportLinearFiltering||(s.DYE_RESOLUTION=256,s.SHADING=!1);function Le(e){const r={alpha:!0,depth:!1,stencil:!1,antialias:!1,preserveDrawingBuffer:!1};let i=e.getContext("webgl2",r);const o=!!i;if(o||(i=e.getContext("webgl",r)||e.getContext("experimental-webgl",r)),!i)return{gl:null,ext:{}};let n,c;o?(i.getExtension("EXT_color_buffer_float"),c=i.getExtension("OES_texture_float_linear")):(n=i.getExtension("OES_texture_half_float"),c=i.getExtension("OES_texture_half_float_linear")),i.clearColor(0,0,0,1);const l=o?i.HALF_FLOAT:n&&n.HALF_FLOAT_OES;let v,f,S;return o?(v=A(i,i.RGBA16F,i.RGBA,l),f=A(i,i.RG16F,i.RG,l),S=A(i,i.R16F,i.RED,l)):(v=A(i,i.RGBA,i.RGBA,l),f=A(i,i.RGBA,i.RGBA,l),S=A(i,i.RGBA,i.RGBA,l)),{gl:i,ext:{formatRGBA:v,formatRG:f,formatR:S,halfFloatTexType:l,supportLinearFiltering:c}}}function A(e,r,i,o){if(!Ue(e,r,i,o))switch(r){case e.R16F:return A(e,e.RG16F,e.RG,o);case e.RG16F:return A(e,e.RGBA16F,e.RGBA,o);default:return null}return{internalFormat:r,format:i}}function Ue(e,r,i,o){const n=y("Texture",e.createTexture());e.bindTexture(e.TEXTURE_2D,n),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,r,4,4,0,i,o,null);const c=y("Framebuffer",e.createFramebuffer());return e.bindFramebuffer(e.FRAMEBUFFER,c),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,n,0),e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE}class Be{constructor(r,i){this.vertexShader=r,this.fragmentShaderSource=i,this.programs=[],this.activeProgram=null,this.uniforms=[]}setKeywords(r){let i=0;for(let n=0;n<r.length;n++)i+=ct(r[n]);let o=this.programs[i];if(o==null){let n=R(t.FRAGMENT_SHADER,this.fragmentShaderSource,r);o=Z(this.vertexShader,n),this.programs[i]=o}o!==this.activeProgram&&(this.uniforms=$(o),this.activeProgram=o)}bind(){t.useProgram(this.activeProgram)}}class D{constructor(r,i){this.uniforms={},this.program=Z(r,i),this.uniforms=$(this.program)}bind(){t.useProgram(this.program)}}function Z(e,r){let i=y("Program",t.createProgram());return t.attachShader(i,e),t.attachShader(i,r),t.linkProgram(i),t.getProgramParameter(i,t.LINK_STATUS)||console.trace(t.getProgramInfoLog(i)),i}function $(e){let r=[],i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<i;o++){let n=t.getActiveUniform(e,o).name;r[n]=t.getUniformLocation(e,n)}return r}function R(e,r,i){r=Pe(r,i);const o=y("Shader",t.createShader(e));return t.shaderSource(o,r),t.compileShader(o),t.getShaderParameter(o,t.COMPILE_STATUS)||console.trace(t.getShaderInfoLog(o)),o}function Pe(e,r){if(!r)return e;let i="";return r.forEach(o=>{i+="#define "+o+`
`}),i+e}const g=R(t.VERTEX_SHADER,`
        precision highp float;
        attribute vec2 aPosition;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform vec2 texelSize;

        void main () {
            vUv = aPosition * 0.5 + 0.5;
            vL = vUv - vec2(texelSize.x, 0.0);
            vR = vUv + vec2(texelSize.x, 0.0);
            vT = vUv + vec2(0.0, texelSize.y);
            vB = vUv - vec2(0.0, texelSize.y);
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
      `),Ie=R(t.FRAGMENT_SHADER,`
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;

        void main () {
            gl_FragColor = texture2D(uTexture, vUv);
        }
      `),Ce=R(t.FRAGMENT_SHADER,`
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;
        uniform float value;

        void main () {
            gl_FragColor = value * texture2D(uTexture, vUv);
        }
      `),Xe=`
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uTexture;
      uniform sampler2D uDithering;
      uniform vec2 ditherScale;
      uniform float uTime;
      uniform float uFade;
      uniform vec2 texelSize;

      vec3 linearToGamma (vec3 color) {
          color = max(color, vec3(0));
          return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
      }

      void main () {
          vec3 c = texture2D(uTexture, vUv).rgb;
          #ifdef SHADING
              vec3 lc = texture2D(uTexture, vL).rgb;
              vec3 rc = texture2D(uTexture, vR).rgb;
              vec3 tc = texture2D(uTexture, vT).rgb;
              vec3 bc = texture2D(uTexture, vB).rgb;

              float dx = length(rc) - length(lc);
              float dy = length(tc) - length(bc);

              vec3 n = normalize(vec3(dx, dy, length(texelSize)));
              vec3 l = vec3(0.0, 0.0, 1.0);

              float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
              c *= diffuse;
          #endif

          float a = max(c.r, max(c.g, c.b));
          // Color shifts along the screen plane, never across density contours:
          // density-driven spectral bands would outline each splat as rings.
          float filmPhase=dot(vUv,vec2(.42,-.24))+uTime*.055;
          vec3 film=.5+.5*cos(6.283185*(filmPhase+vec3(0.,.333,.667)));
          c=mix(c,(.12+.88*film)*a,.82);
          gl_FragColor = vec4(c*uFade, a*uFade);
      }
    `,Me=R(t.FRAGMENT_SHADER,`
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uTarget;
        uniform float aspectRatio;
        uniform vec3 color;
        uniform vec2 point;
        uniform float radius;

        void main () {
            vec2 p = vUv - point.xy;
            p.x *= aspectRatio;
            vec3 splat = exp(-dot(p, p) / radius) * color;
            vec3 base = texture2D(uTarget, vUv).xyz;
            gl_FragColor = vec4(base + splat, 1.0);
        }
      `),Oe=R(t.FRAGMENT_SHADER,`
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform vec2 texelSize;
        uniform vec2 dyeTexelSize;
        uniform float dt;
        uniform float dissipation;

        vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
            vec2 st = uv / tsize - 0.5;
            vec2 iuv = floor(st);
            vec2 fuv = fract(st);

            vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
            vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
            vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
            vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

            return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
        }

        void main () {
            #ifdef MANUAL_FILTERING
                vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
                vec4 result = bilerp(uSource, coord, dyeTexelSize);
            #else
                vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
                vec4 result = texture2D(uSource, coord);
            #endif
            float decay = 1.0 + dissipation * dt;
            gl_FragColor = result / decay;
        }
      `,x.supportLinearFiltering?null:["MANUAL_FILTERING"]),Ne=R(t.FRAGMENT_SHADER,`
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uVelocity, vL).x;
            float R = texture2D(uVelocity, vR).x;
            float T = texture2D(uVelocity, vT).y;
            float B = texture2D(uVelocity, vB).y;

            vec2 C = texture2D(uVelocity, vUv).xy;
            if (vL.x < 0.0) { L = -C.x; }
            if (vR.x > 1.0) { R = -C.x; }
            if (vT.y > 1.0) { T = -C.y; }
            if (vB.y < 0.0) { B = -C.y; }

            float div = 0.5 * (R - L + T - B);
            gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
        }
      `),ze=R(t.FRAGMENT_SHADER,`
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uVelocity, vL).y;
            float R = texture2D(uVelocity, vR).y;
            float T = texture2D(uVelocity, vT).x;
            float B = texture2D(uVelocity, vB).x;
            float vorticity = R - L - T + B;
            gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
        }
      `),Ge=R(t.FRAGMENT_SHADER,`
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uVelocity;
        uniform sampler2D uCurl;
        uniform float curl;
        uniform float dt;

        void main () {
            float L = texture2D(uCurl, vL).x;
            float R = texture2D(uCurl, vR).x;
            float T = texture2D(uCurl, vT).x;
            float B = texture2D(uCurl, vB).x;
            float C = texture2D(uCurl, vUv).x;

            vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
            force /= length(force) + 0.0001;
            force *= curl * C;
            force.y *= -1.0;

            vec2 velocity = texture2D(uVelocity, vUv).xy;
            velocity += force * dt;
            velocity = min(max(velocity, -1000.0), 1000.0);
            gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `),Ye=R(t.FRAGMENT_SHADER,`
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uDivergence;

        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            float C = texture2D(uPressure, vUv).x;
            float divergence = texture2D(uDivergence, vUv).x;
            float pressure = (L + R + B + T - divergence) * 0.25;
            gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
        }
      `),He=R(t.FRAGMENT_SHADER,`
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            vec2 velocity = texture2D(uVelocity, vUv).xy;
            velocity.xy -= vec2(R - L, T - B);
            gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `),T=(t.bindBuffer(t.ARRAY_BUFFER,y("Buffer",t.createBuffer())),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,-1,1,1,1,1,-1]),t.STATIC_DRAW),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,y("Buffer",t.createBuffer())),t.bufferData(t.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,0,2,3]),t.STATIC_DRAW),t.vertexAttribPointer(0,2,t.FLOAT,!1,0,0),t.enableVertexAttribArray(0),(e,r=!1)=>{e==null?(t.viewport(0,0,t.drawingBufferWidth,t.drawingBufferHeight),t.bindFramebuffer(t.FRAMEBUFFER,null)):(t.viewport(0,0,e.width,e.height),t.bindFramebuffer(t.FRAMEBUFFER,e.fbo)),r&&(t.clearColor(0,0,0,1),t.clear(t.COLOR_BUFFER_BIT)),t.drawElements(t.TRIANGLES,6,t.UNSIGNED_SHORT,0)});let d,u,I,C,m;const ee=new D(g,Ie),H=new D(g,Ce),w=new D(g,Me),p=new D(g,Oe),V=new D(g,Ne),W=new D(g,ze),b=new D(g,Ge),X=new D(g,Ye),M=new D(g,He),L=new Be(g,Xe);function U(e){e&&(t.deleteTexture(e.texture),P.Texture.delete(e.texture),t.deleteFramebuffer(e.fbo),P.Framebuffer.delete(e.fbo))}function te(){U(I),U(C),m&&(U(m.read),U(m.write));let e=ne(s.SIM_RESOLUTION),r=ne(s.DYE_RESOLUTION);const i=x.halfFloatTexType,o=x.formatRGBA,n=x.formatRG,c=x.formatR,l=x.supportLinearFiltering?t.LINEAR:t.NEAREST;t.disable(t.BLEND),d?d=re(d,r.width,r.height,o.internalFormat,o.format,i,l):d=k(r.width,r.height,o.internalFormat,o.format,i,l),u?u=re(u,e.width,e.height,n.internalFormat,n.format,i,l):u=k(e.width,e.height,n.internalFormat,n.format,i,l),I=B(e.width,e.height,c.internalFormat,c.format,i,t.NEAREST),C=B(e.width,e.height,c.internalFormat,c.format,i,t.NEAREST),m=k(e.width,e.height,c.internalFormat,c.format,i,t.NEAREST)}function B(e,r,i,o,n,c){t.activeTexture(t.TEXTURE0);let l=y("Texture",t.createTexture());t.bindTexture(t.TEXTURE_2D,l),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,c),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,c),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texImage2D(t.TEXTURE_2D,0,i,e,r,0,o,n,null);let v=y("Framebuffer",t.createFramebuffer());t.bindFramebuffer(t.FRAMEBUFFER,v),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,l,0),t.viewport(0,0,e,r),t.clear(t.COLOR_BUFFER_BIT);let f=1/e,S=1/r;return{texture:l,fbo:v,width:e,height:r,texelSizeX:f,texelSizeY:S,attach(_){return t.activeTexture(t.TEXTURE0+_),t.bindTexture(t.TEXTURE_2D,l),_}}}function k(e,r,i,o,n,c){let l=B(e,r,i,o,n,c),v=B(e,r,i,o,n,c);return{width:e,height:r,texelSizeX:l.texelSizeX,texelSizeY:l.texelSizeY,get read(){return l},set read(f){l=f},get write(){return v},set write(f){v=f},swap(){let f=l;l=v,v=f}}}function Ve(e,r,i,o,n,c,l){let v=B(r,i,o,n,c,l);return ee.bind(),t.uniform1i(ee.uniforms.uTexture,e.attach(0)),T(v),U(e),v}function re(e,r,i,o,n,c,l){return e.width===r&&e.height===i||(e.read=Ve(e.read,r,i,o,n,c,l),U(e.write),e.write=B(r,i,o,n,c,l),e.width=r,e.height=i,e.texelSizeX=1/r,e.texelSizeY=1/i),e}function We(){let e=[];s.SHADING&&e.push("SHADING"),L.setKeywords(e)}We(),te();let O=Date.now(),N=0;function z(){if(h.current=null,!Q||document.hidden)return;const e=performance.now()-Y;if(a.dataset.idleMs=String(Math.round(e)),e>=1e3){t.clearColor(0,0,0,0);for(const i of[d.read,d.write,u.read,u.write,m.read,m.write])t.bindFramebuffer(t.FRAMEBUFFER,i.fbo),t.clear(t.COLOR_BUFFER_BIT);t.bindFramebuffer(t.FRAMEBUFFER,null),t.clear(t.COLOR_BUFFER_BIT),a.dataset.active="false";return}a.dataset.active="true";const r=ke();Ke()&&te(),qe(r),je(),Je(r),Qe(null),h.current=requestAnimationFrame(z)}function ke(){let e=Date.now(),r=(e-O)/1e3;return r=Math.min(r,.016666),O=e,r}function Ke(){let e=E(a.clientWidth),r=E(a.clientHeight);return a.width!==e||a.height!==r?(a.width=e,a.height=r,!0):!1}function qe(e){N+=e*s.COLOR_UPDATE_SPEED,N>=1&&(N=ut(N,0,1),F.forEach(r=>{r.color=q()}))}function je(){F.forEach(e=>{e.moved&&(e.moved=!1,$e(e))})}function Je(e){if(t.disable(t.BLEND),!s.STRAIGHT_TRAIL){W.bind(),t.uniform2f(W.uniforms.texelSize,u.texelSizeX,u.texelSizeY),t.uniform1i(W.uniforms.uVelocity,u.read.attach(0)),T(C),b.bind(),t.uniform2f(b.uniforms.texelSize,u.texelSizeX,u.texelSizeY),t.uniform1i(b.uniforms.uVelocity,u.read.attach(0)),t.uniform1i(b.uniforms.uCurl,C.attach(1)),t.uniform1f(b.uniforms.curl,s.CURL),t.uniform1f(b.uniforms.dt,e),T(u.write),u.swap(),V.bind(),t.uniform2f(V.uniforms.texelSize,u.texelSizeX,u.texelSizeY),t.uniform1i(V.uniforms.uVelocity,u.read.attach(0)),T(I),H.bind(),t.uniform1i(H.uniforms.uTexture,m.read.attach(0)),t.uniform1f(H.uniforms.value,s.PRESSURE),T(m.write),m.swap(),X.bind(),t.uniform2f(X.uniforms.texelSize,u.texelSizeX,u.texelSizeY),t.uniform1i(X.uniforms.uDivergence,I.attach(0));for(let i=0;i<s.PRESSURE_ITERATIONS;i++)t.uniform1i(X.uniforms.uPressure,m.read.attach(1)),T(m.write),m.swap();M.bind(),t.uniform2f(M.uniforms.texelSize,u.texelSizeX,u.texelSizeY),t.uniform1i(M.uniforms.uPressure,m.read.attach(0)),t.uniform1i(M.uniforms.uVelocity,u.read.attach(1)),T(u.write),u.swap()}p.bind(),t.uniform2f(p.uniforms.texelSize,u.texelSizeX,u.texelSizeY),x.supportLinearFiltering||t.uniform2f(p.uniforms.dyeTexelSize,u.texelSizeX,u.texelSizeY);let r=u.read.attach(0);t.uniform1i(p.uniforms.uVelocity,r),t.uniform1i(p.uniforms.uSource,r),t.uniform1f(p.uniforms.dt,e),t.uniform1f(p.uniforms.dissipation,s.VELOCITY_DISSIPATION),T(u.write),u.swap(),x.supportLinearFiltering||t.uniform2f(p.uniforms.dyeTexelSize,d.texelSizeX,d.texelSizeY),t.uniform1i(p.uniforms.uVelocity,u.read.attach(0)),t.uniform1i(p.uniforms.uSource,d.read.attach(1)),t.uniform1f(p.uniforms.dissipation,s.DENSITY_DISSIPATION),T(d.write),d.swap()}function Qe(e){t.blendFunc(t.ONE,t.ONE_MINUS_SRC_ALPHA),t.enable(t.BLEND),Ze(e)}function Ze(e){let r=t.drawingBufferWidth,i=t.drawingBufferHeight;L.bind();const o=Math.max(0,Math.min(1,1-(performance.now()-Y-150)/850));t.uniform1f(L.uniforms.uFade,o*o*(3-2*o)),t.uniform1f(L.uniforms.uTime,performance.now()/1e3),s.SHADING&&t.uniform2f(L.uniforms.texelSize,1/r,1/i),t.uniform1i(L.uniforms.uTexture,d.read.attach(0)),T(e)}function $e(e){let r=e.deltaX*s.SPLAT_FORCE,i=e.deltaY*s.SPLAT_FORCE;ie(e.texcoordX,e.texcoordY,r,i,e.color)}function et(e){const r=q();r.r*=2.5,r.g*=2.5,r.b*=2.5;let i=s.STRAIGHT_TRAIL?0:10*(Math.random()-.5),o=s.STRAIGHT_TRAIL?0:30*(Math.random()-.5);ie(e.texcoordX,e.texcoordY,i,o,r)}function ie(e,r,i,o,n){w.bind(),t.uniform1i(w.uniforms.uTarget,u.read.attach(0)),t.uniform1f(w.uniforms.aspectRatio,a.width/a.height),t.uniform2f(w.uniforms.point,e,r),t.uniform3f(w.uniforms.color,i,o,0),t.uniform1f(w.uniforms.radius,tt(s.SPLAT_RADIUS/100)),T(u.write),u.swap(),t.uniform1i(w.uniforms.uTarget,d.read.attach(0)),t.uniform3f(w.uniforms.color,n.r,n.g,n.b),T(d.write),d.swap()}function tt(e){let r=a.width/a.height;return r>1&&(e*=r),e}function K(e,r,i,o){e.id=r,e.down=!0,e.moved=!1,e.texcoordX=i/a.width,e.texcoordY=1-o/a.height,e.prevTexcoordX=e.texcoordX,e.prevTexcoordY=e.texcoordY,e.deltaX=0,e.deltaY=0,e.color=q()}function oe(e,r,i,o){e.prevTexcoordX=e.texcoordX,e.prevTexcoordY=e.texcoordY,e.texcoordX=r/a.width,e.texcoordY=1-i/a.height,e.deltaX=it(e.texcoordX-e.prevTexcoordX),e.deltaY=ot(e.texcoordY-e.prevTexcoordY),e.moved=Math.abs(e.deltaX)>0||Math.abs(e.deltaY)>0,e.color=o}function rt(e){e.down=!1}function it(e){let r=a.width/a.height;return r<1&&(e*=r),e}function ot(e){let r=a.width/a.height;return r>1&&(e/=r),e}function nt(e){let r=e.replace("#","");r.length===3&&(r=r[0]+r[0]+r[1]+r[1]+r[2]+r[2]);const i=parseInt(r.slice(0,2),16)/255,o=parseInt(r.slice(2,4),16)/255,n=parseInt(r.slice(4,6),16)/255;return{r:i*.15,g:o*.15,b:n*.15}}function q(){if(!s.RAINBOW_MODE)return nt(s.COLOR);let e=at((performance.now()*13e-5+F[0].texcoordX*.15)%1,.75,1);return e.r*=.15,e.g*=.15,e.b*=.15,e}function at(e,r,i){let o,n,c,l,v,f,S,_;switch(l=Math.floor(e*6),v=e*6-l,f=i*(1-r),S=i*(1-v*r),_=i*(1-(1-v)*r),l%6){case 0:o=i,n=_,c=f;break;case 1:o=S,n=i,c=f;break;case 2:o=f,n=i,c=_;break;case 3:o=f,n=S,c=i;break;case 4:o=_,n=f,c=i;break;case 5:o=i,n=f,c=S;break}return{r:o,g:n,b:c}}function ut(e,r,i){const o=i-r;return(e-r)%o+r}function ne(e){let r=t.drawingBufferWidth/t.drawingBufferHeight;r<1&&(r=1/r);const i=Math.round(e),o=Math.round(e*r);return t.drawingBufferWidth>t.drawingBufferHeight?{width:o,height:i}:{width:i,height:o}}function E(e){const r=Math.min(window.devicePixelRatio||1,innerWidth<800?1:1.25);return Math.floor(e*r)}function ct(e){if(e.length===0)return 0;let r=0;for(let i=0;i<e.length;i++)r=(r<<5)-r+e.charCodeAt(i),r|=0;return r}function G(){Y=performance.now(),!h.current&&!document.hidden&&(O=Date.now(),h.current=requestAnimationFrame(z))}function ae(){cancelAnimationFrame(h.current),h.current=null,document.hidden||(O=Date.now(),h.current=requestAnimationFrame(z))}function ue(e){e.preventDefault(),cancelAnimationFrame(h.current),h.current=null,a.dataset.state="fallback"}function ce(e){G(),a.dataset.splats=String(Number(a.dataset.splats||0)+1);let r=F[0],i=E(e.clientX),o=E(e.clientY);K(r,-1,i,o),s.STRAIGHT_TRAIL||et(r)}let le=!1;function se(e){G(),a.dataset.splats=String(Number(a.dataset.splats||0)+1);let r=F[0],i=E(e.clientX),o=E(e.clientY);le?oe(r,i,o,r.color):(K(r,-1,i,o),r.down=!1,le=!0)}function fe(e){G();const r=e.targetTouches;let i=F[0];for(let o=0;o<r.length;o++){let n=E(r[o].clientX),c=E(r[o].clientY);K(i,r[o].identifier,n,c)}}function ve(e){G();const r=e.targetTouches;let i=F[0];for(let o=0;o<r.length;o++){let n=E(r[o].clientX),c=E(r[o].clientY);oe(i,n,c,i.color)}}function de(e){const r=e.changedTouches;let i=F[0];for(let o=0;o<r.length;o++)rt(i)}return window.addEventListener("mousedown",ce),window.addEventListener("mousemove",se),window.addEventListener("touchstart",fe),window.addEventListener("touchmove",ve,{passive:!0}),window.addEventListener("touchend",de),document.addEventListener("visibilitychange",ae),a.addEventListener("webglcontextlost",ue),z(),()=>{Q=!1,h.current&&(cancelAnimationFrame(h.current),h.current=null),window.removeEventListener("mousedown",ce),window.removeEventListener("mousemove",se),window.removeEventListener("touchstart",fe),window.removeEventListener("touchmove",ve),window.removeEventListener("touchend",de),document.removeEventListener("visibilitychange",ae),a.removeEventListener("webglcontextlost",ue);for(const e of Object.keys(P))for(const r of P[e])t["delete"+e](r)}},[]),me.createElement("div",{style:{position:"fixed",opacity:"var(--fluid-opacity)",top:0,left:0,zIndex:50,pointerEvents:"none",width:"100%",height:"100%"}},me.createElement("canvas",{ref:J,className:"splash-cursor","aria-hidden":"true",style:{width:"100vw",height:"100vh",display:"block"}}))}export{dt as default};
