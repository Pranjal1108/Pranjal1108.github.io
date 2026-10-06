import{_ as me}from"./index-BDnD2QuY.js";const ue={version:1,wgsl:`// vgsl-module: C:\\Users\\pranj\\Documents\\Codex\\2026-10-04\\upgrade-goal-premium-interactive-3d-motion\\work\\portfolio-push\\portfolio\\src\\black-hole\\bake.wgsl
// One-shot geodesic bake: store two disk crossings, the lensed sky, and view directions.

        

struct _vgsl_20728f62__Bake {
  resolution: vec2f,
  yaw: f32,
  pitch: f32,
  orbitRadius: f32,
  diskOuter: f32,
  fov: f32,
  centerX: f32,
  centerY: f32,
  roll: f32,
}

@group(0) @binding(0) var<uniform> bake: _vgsl_20728f62__Bake;

const _vgsl_20728f62__FLAG_HOLE: f32 = 1.0;

const _vgsl_20728f62__FLAG_ESCAPED: f32 = 2.0;

struct _vgsl_20728f62__GBuffer {
  @location(0) hit1: vec2f,
  @location(1) hit2: vec2f,
  @location(2) sky: vec4f,
  @location(3) view: vec4f,
}

@fragment fn fs_main(@location(0) uv: vec2f) -> _vgsl_20728f62__GBuffer {
  let ray = _vgsl_25e01e56__cameraRay(
    uv,
    bake.resolution,
    bake.yaw,
    bake.pitch,
    bake.orbitRadius,
    bake.fov,
    bake.centerX,
    bake.centerY,
    bake.roll,
  );
  var traced = _vgsl_25e01e56__traceRay(ray.position, ray.velocity, bake.diskOuter, _vgsl_25e01e56__escapeRadiusFor(bake.orbitRadius));

  if (traced.swallowed < 0.5 && traced.escaped < 0.5) {
    traced.swallowed = 1.0;
  }

  return _vgsl_20728f62__GBuffer(
    traced.hit1Plane,
    traced.hit2Plane,
    vec4f(traced.finalVelocity, traced.swallowed * _vgsl_20728f62__FLAG_HOLE + traced.escaped * _vgsl_20728f62__FLAG_ESCAPED),
    vec4f(traced.hit1Direction, traced.hit2Direction),
  );
}

// vgsl-module: C:\\Users\\pranj\\Documents\\Codex\\2026-10-04\\upgrade-goal-premium-interactive-3d-motion\\work\\portfolio-push\\portfolio\\src\\black-hole\\geodesic.wgsl
// Shared Schwarzschild-like ray integration used by the bake and refinement passes.

 const _vgsl_25e01e56__HORIZON: f32 = 1.0;

 const _vgsl_25e01e56__ISCO: f32 = 3.0;

 const _vgsl_25e01e56__MAX_STEPS: i32 = 768;

 struct _vgsl_25e01e56__TraceResult {
  hit1Plane: vec2f,
  hit1Direction: vec2f,
  hit2Plane: vec2f,
  hit2Direction: vec2f,
  hitCount: i32,
  swallowed: f32,
  escaped: f32,

  finalVelocity: vec3f,
}

 struct _vgsl_25e01e56__CameraRay {
  position: vec3f,
  velocity: vec3f,
}

 fn _vgsl_25e01e56__escapeRadiusFor(orbitRadius: f32) -> f32 {
  return max(120.0, orbitRadius + 8.0);
}

 fn _vgsl_25e01e56__encodeDirection(direction: vec3f) -> vec2f {
  return vec2f(direction.y, atan2(direction.z, direction.x));
}

fn _vgsl_25e01e56__geodesicAcceleration(position: vec3f, velocity: vec3f) -> vec3f {
  let r2 = max(dot(position, position), 0.0001);
  let angularMomentum = cross(position, velocity);
  let h2 = dot(angularMomentum, angularMomentum);
  return -1.5 * h2 * position / (r2 * r2 * sqrt(r2));
}

 fn _vgsl_25e01e56__cameraRay(
  uv: vec2f,
  resolution: vec2f,
  yaw: f32,
  pitch: f32,
  orbitRadius: f32,
  fov: f32,
  centerX: f32,
  centerY: f32,
  roll: f32,
) -> _vgsl_25e01e56__CameraRay {
  let aspect = resolution.x / max(resolution.y, 1.0);
  let ndc = vec2f(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0);
  let screenPlane = (ndc - vec2f(centerX, centerY)) * vec2f(aspect, 1.0);
  let cosine = cos(roll);
  let sine = sin(roll);
  let screen = vec2f(
    screenPlane.x * cosine - screenPlane.y * sine,
    screenPlane.x * sine + screenPlane.y * cosine,
  );

  let clampedPitch = clamp(pitch, -1.319, 1.319);
  let cameraPosition = vec3f(
    sin(yaw) * cos(clampedPitch) * orbitRadius,
    sin(clampedPitch) * orbitRadius,
    cos(yaw) * cos(clampedPitch) * orbitRadius,
  );
  let forward = normalize(vec3f(0.0) - cameraPosition);
  let right = normalize(cross(forward, vec3f(0.0, 1.0, 0.0)));
  let up = cross(right, forward);

  var ray: _vgsl_25e01e56__CameraRay;
  ray.position = cameraPosition;
  ray.velocity = normalize(forward * fov + right * screen.x + up * screen.y);
  return ray;
}

 fn _vgsl_25e01e56__traceRay(cameraPosition: vec3f, initialVelocity: vec3f, diskOuter: f32, escapeRadius: f32) -> _vgsl_25e01e56__TraceResult {
  var position = cameraPosition;
  var velocity = initialVelocity;

  var result: _vgsl_25e01e56__TraceResult;
  result.hit1Plane = vec2f(0.0);
  result.hit1Direction = vec2f(0.0);
  result.hit2Plane = vec2f(0.0);
  result.hit2Direction = vec2f(0.0);
  result.hitCount = 0;
  result.swallowed = 0.0;
  result.escaped = 0.0;

  for (var stepIndex = 0; stepIndex < _vgsl_25e01e56__MAX_STEPS; stepIndex++) {
    let radius = length(position);
    if (radius < _vgsl_25e01e56__HORIZON * 1.004) {
      result.swallowed = 1.0;
      break;
    }
    if (radius > escapeRadius && dot(position, velocity) > 0.0) {
      result.escaped = 1.0;
      break;
    }

    let stepSize = clamp((radius - _vgsl_25e01e56__HORIZON) * 0.035, 0.0045, 0.075 * max(1.0, radius / 6.0));

    let previousPosition = position;
    let previousVelocity = velocity;

    let acceleration0 = _vgsl_25e01e56__geodesicAcceleration(position, velocity);
    velocity += acceleration0 * (0.5 * stepSize);
    position += velocity * stepSize;
    let acceleration1 = _vgsl_25e01e56__geodesicAcceleration(position, velocity);
    velocity += acceleration1 * (0.5 * stepSize);
    velocity = normalize(velocity);

    if (result.hitCount < 2) {
      let previousSide = select(-1.0, 1.0, previousPosition.y >= 0.0);
      let currentSide = select(-1.0, 1.0, position.y >= 0.0);
      if (previousSide != currentSide) {
        let t = clamp(previousPosition.y / (previousPosition.y - position.y), 0.0, 1.0);
        let crossing = mix(previousPosition, position, t);
        let planeRadius = length(crossing.xz);
        if (planeRadius >= _vgsl_25e01e56__ISCO && planeRadius <= diskOuter) {
          let direction = _vgsl_25e01e56__encodeDirection(normalize(mix(previousVelocity, velocity, t)));
          if (result.hitCount == 0) {
            result.hit1Plane = crossing.xz;
            result.hit1Direction = direction;
          } else {
            result.hit2Plane = crossing.xz;
            result.hit2Direction = direction;
          }
          result.hitCount += 1;
        }
      }
    }
  }

  result.finalVelocity = velocity;
  return result;
}
`,functionExports:[{name:"escapeRadiusFor",resolvedName:"_vgsl_25e01e56__escapeRadiusFor",parameterNames:["orbitRadius"]},{name:"encodeDirection",resolvedName:"_vgsl_25e01e56__encodeDirection",parameterNames:["direction"]},{name:"cameraRay",resolvedName:"_vgsl_25e01e56__cameraRay",parameterNames:["uv","resolution","yaw","pitch","orbitRadius","fov","centerX","centerY","roll"]},{name:"traceRay",resolvedName:"_vgsl_25e01e56__traceRay",parameterNames:["cameraPosition","initialVelocity","diskOuter","escapeRadius"]}]},b={version:1,wgsl:`// HDR bloom downsample and separable Gaussian blur.

struct Bloom {
  sourceSize: vec2f,
  direction: vec2f,
  params: vec4f,
}

@group(0) @binding(0) var<uniform> bloom: Bloom;
@group(0) @binding(1) var source: texture_2d<f32>;
@group(0) @binding(2) var linearSampler: sampler;

fn softThreshold(color: vec3f) -> vec3f {
  let threshold = bloom.params.x;
  if (threshold <= 0.0) {
    return color;
  }

  let brightness = dot(color, vec3f(0.2126, 0.7152, 0.0722));
  let knee = max(min(bloom.params.y, threshold), 0.000001);
  let soft = clamp(brightness - threshold + knee, 0.0, 2.0 * knee);
  let softContribution = soft * soft / (4.0 * knee + 0.0001);
  let contribution = max(brightness - threshold, softContribution) / max(brightness, 0.0001);
  return color * contribution;
}

fn downsample(uv: vec2f) -> vec3f {
  let texel = 1.0 / bloom.sourceSize;
  let offset = texel * 0.5;
  let color = (
    textureSample(source, linearSampler, uv + vec2f(-offset.x, -offset.y)).rgb +
    textureSample(source, linearSampler, uv + vec2f( offset.x, -offset.y)).rgb +
    textureSample(source, linearSampler, uv + vec2f(-offset.x,  offset.y)).rgb +
    textureSample(source, linearSampler, uv + vec2f( offset.x,  offset.y)).rgb
  ) * 0.25;
  return softThreshold(color);
}

fn gaussianBlur(uv: vec2f) -> vec3f {
  let sigma = max(bloom.params.z, 0.5);
  let inverseTwoSigmaSquared = 0.5 / (sigma * sigma);
  let w0 = 1.0;
  let w1 = exp(-1.0 * inverseTwoSigmaSquared);
  let w2 = exp(-4.0 * inverseTwoSigmaSquared);
  let w3 = exp(-9.0 * inverseTwoSigmaSquared);
  let w4 = exp(-16.0 * inverseTwoSigmaSquared);

  let pair12 = w1 + w2;
  let pair34 = w3 + w4;
  let offset12 = (w1 + 2.0 * w2) / max(pair12, 0.000001);
  let offset34 = (3.0 * w3 + 4.0 * w4) / max(pair34, 0.000001);
  let normalization = w0 + 2.0 * (pair12 + pair34);
  let texel = bloom.direction / bloom.sourceSize;

  var color = textureSample(source, linearSampler, uv).rgb * w0;
  color += textureSample(source, linearSampler, uv + texel * offset12).rgb * pair12;
  color += textureSample(source, linearSampler, uv - texel * offset12).rgb * pair12;
  color += textureSample(source, linearSampler, uv + texel * offset34).rgb * pair34;
  color += textureSample(source, linearSampler, uv - texel * offset34).rgb * pair34;
  return color / normalization;
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  var color: vec3f;
  if (bloom.params.w > 0.5) {
    color = gaussianBlur(uv);
  } else {
    color = downsample(uv);
  }
  return vec4f(color, 1.0);
}
`,functionExports:[]},ve={version:1,wgsl:`// Combine bloom levels, tone map, vignette, and convert to display output.

struct Composite {
  params: vec4f,
}

@group(0) @binding(0) var<uniform> composite: Composite;
@group(0) @binding(1) var scene: texture_2d<f32>;
@group(0) @binding(2) var bloomNear: texture_2d<f32>;
@group(0) @binding(3) var bloomMedium: texture_2d<f32>;
@group(0) @binding(4) var bloomFar: texture_2d<f32>;
@group(0) @binding(5) var linearSampler: sampler;

const EXPOSURE: f32 = 1.15;
const SATURATION: f32 = 0.0;

fn aces(x: vec3f) -> vec3f {
  let a = 2.51;
  let b = 0.03;
  let c = 2.43;
  let d = 0.59;
  let e = 0.14;
  return clamp((x * (a * x + vec3f(b))) / (x * (c * x + vec3f(d)) + vec3f(e)), vec3f(0.0), vec3f(1.0));
}

fn tonemap(linearColor: vec3f, uv: vec2f) -> vec3f {
  var color = aces(linearColor * EXPOSURE);

  let centered = uv - vec2f(0.5);
  let vignette = 1.0 - smoothstep(0.55, 1.15, length(centered) * 1.6);
  color *= mix(0.72, 1.0, vignette);

  color = pow(color, vec3f(1.0 / 2.2));
  let luma = dot(color, vec3f(0.2126, 0.7152, 0.0722));
  return mix(vec3f(luma), color, SATURATION);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let sceneColor = textureSample(scene, linearSampler, uv).rgb;
  let bloom =
    textureSample(bloomNear, linearSampler, uv).rgb * 0.50 +
    textureSample(bloomMedium, linearSampler, uv).rgb * 0.32 +
    textureSample(bloomFar, linearSampler, uv).rgb * 0.18;
  let hdr = sceneColor + bloom * composite.params.x;
  return vec4f(tonemap(hdr, uv), 1.0);
}
`,functionExports:[]},se=64,pe="r8unorm",ge=13,c=Math.fround,O=e=>c(e-Math.floor(e)),he=c(.1031),be=c(.103),ye=c(.0973),B=c(33.33);function xe(e,n,a){let s=O(c(e*he)),o=O(c(n*be)),t=O(c(a*ye));const d=c(c(c(s*c(o+B))+c(o*c(t+B)))+c(t*c(s+B)));return s=c(s+d),o=c(o+d),t=c(t+d),O(c(c(s+o)*t))}function M(e,n){return e<n/2?e:e-n}function Se(e,n){const a=new Uint8Array(e*e*e),s=n*1024;let o=0;for(let t=0;t<e;t++){const d=M(t,e)+s;for(let r=0;r<e;r++){const f=M(r,e);for(let i=0;i<e;i++)a[o++]=Math.min(255,Math.round(xe(M(i,e),f,d)*255))}}return a}const J=new Map;function ke(e,n){const a=`${e}:${n}`;let s=J.get(a);return s||(s=Se(e,n),J.set(a,s)),s}function we(e,n=se,a="black-hole-noise"){const s=e.device.createTexture({kind:"3d",size:[n,n,n],format:pe,usage:["texture_binding","copy_dst"],label:a});try{return e.gpu.queue.writeTexture({texture:s.gpu},ke(n,ge),{offset:0,bytesPerRow:n,rowsPerImage:n},{width:n,height:n,depthOrArrayLayers:n}),s}catch(o){try{s.destroy()}catch{}throw o}}function Re(e,n){return e.sampler(n,{addressModeU:"repeat",addressModeV:"repeat",addressModeW:"repeat",minFilter:"linear",magFilter:"linear"})}const Ae={version:1,wgsl:`// vgsl-module: C:\\Users\\pranj\\Documents\\Codex\\2026-10-04\\upgrade-goal-premium-interactive-3d-motion\\work\\portfolio-push\\portfolio\\src\\black-hole\\refine.wgsl
// One-shot photon-ring refinement: measure sub-pixel coverage and synthesize missed crossings.

          

struct _vgsl_f12962cb__Refine {
  resolution: vec2f,
  yaw: f32,
  pitch: f32,
  orbitRadius: f32,
  diskOuter: f32,
  fov: f32,
  centerX: f32,
  centerY: f32,
  roll: f32,
}

@group(0) @binding(0) var<uniform> refine: _vgsl_f12962cb__Refine;

@group(0) @binding(1) var gHit1: texture_2d<f32>;

@group(0) @binding(2) var gSky: texture_2d<f32>;

const _vgsl_f12962cb__SUB_STEPS: i32 = 4;

const _vgsl_f12962cb__MASK_RADIUS: i32 = 2;

const _vgsl_f12962cb__GRADIENT_LIMIT: f32 = 0.12;

const _vgsl_f12962cb__B_CRIT: f32 = 2.59807621;

const _vgsl_f12962cb__CRITICAL_BAND: f32 = 0.06;

fn _vgsl_f12962cb__isHitAt(plane: vec2f) -> bool {
  return length(plane) > _vgsl_25e01e56__ISCO * 0.5;
}

struct _vgsl_f12962cb__RefineOut {
  @location(0) coverage: vec2f,
  @location(1) geometry: vec4f,
}

@fragment fn fs_main(@location(0) uv: vec2f) -> _vgsl_f12962cb__RefineOut {
  let dimensions = vec2i(textureDimensions(gHit1, 0));
  let texel = vec2i(clamp(uv * refine.resolution, vec2f(0.0), refine.resolution - vec2f(1.0)));
  let annulus = max(refine.diskOuter - _vgsl_25e01e56__ISCO, 0.001);

  let centerPlane = textureLoad(gHit1, texel, 0).xy;
  let centerHit = _vgsl_f12962cb__isHitAt(centerPlane);
  let centerHole = (i32(textureLoad(gSky, texel, 0).w + 0.5) & 1) != 0;
  let centerRadiusNorm = clamp((length(centerPlane) - _vgsl_25e01e56__ISCO) / annulus, 0.0, 1.0);

  let centerRay = _vgsl_25e01e56__cameraRay(
    uv,
    refine.resolution,
    refine.yaw,
    refine.pitch,
    refine.orbitRadius,
    refine.fov,
    refine.centerX,
    refine.centerY,
    refine.roll,
  );
  let impactParameter = length(cross(centerRay.position, centerRay.velocity));

  var boundary = abs(impactParameter - _vgsl_f12962cb__B_CRIT) < _vgsl_f12962cb__CRITICAL_BAND * _vgsl_25e01e56__HORIZON;
  for (var dy = -_vgsl_f12962cb__MASK_RADIUS; dy <= _vgsl_f12962cb__MASK_RADIUS; dy++) {
    for (var dx = -_vgsl_f12962cb__MASK_RADIUS; dx <= _vgsl_f12962cb__MASK_RADIUS; dx++) {
      let neighbor = clamp(texel + vec2i(dx, dy), vec2i(0), dimensions - vec2i(1));
      let plane = textureLoad(gHit1, neighbor, 0).xy;
      let hit = _vgsl_f12962cb__isHitAt(plane);
      let hole = (i32(textureLoad(gSky, neighbor, 0).w + 0.5) & 1) != 0;
      if (hit != centerHit || hole != centerHole) {
        boundary = true;
      }
      if (hit && centerHit) {
        let radiusNorm = clamp((length(plane) - _vgsl_25e01e56__ISCO) / annulus, 0.0, 1.0);
        if (abs(radiusNorm - centerRadiusNorm) > _vgsl_f12962cb__GRADIENT_LIMIT) {
          boundary = true;
        }
      }
    }
  }

  if (!boundary) {
    return _vgsl_f12962cb__RefineOut(vec2f(select(0.0, 1.0, centerHit), 0.0), vec4f(0.0));
  }

  let escapeRadius = _vgsl_25e01e56__escapeRadiusFor(refine.orbitRadius);
  var hits = 0.0;
  var minRadius = 1e9;
  var maxRadius = -1e9;
  var bestPlane = vec2f(0.0);
  var bestDirection = vec2f(0.0);
  var bestRadius = 0.0;
  var bestDistance = 1e9;
  for (var sy = 0; sy < _vgsl_f12962cb__SUB_STEPS; sy++) {
    for (var sx = 0; sx < _vgsl_f12962cb__SUB_STEPS; sx++) {
      let offset = (vec2f(f32(sx), f32(sy)) + vec2f(0.5)) / f32(_vgsl_f12962cb__SUB_STEPS);
      let subUv = (vec2f(texel) + offset) / refine.resolution;
      let ray = _vgsl_25e01e56__cameraRay(
        subUv,
        refine.resolution,
        refine.yaw,
        refine.pitch,
        refine.orbitRadius,
        refine.fov,
        refine.centerX,
        refine.centerY,
        refine.roll,
      );
      let traced = _vgsl_25e01e56__traceRay(ray.position, ray.velocity, refine.diskOuter, escapeRadius);
      if (traced.hitCount > 0) {
        let radius = length(traced.hit1Plane);
        hits += 1.0;
        minRadius = min(minRadius, radius);
        maxRadius = max(maxRadius, radius);
        let distance = length(offset - vec2f(0.5));
        if (distance < bestDistance) {
          bestDistance = distance;
          bestPlane = traced.hit1Plane;
          bestDirection = traced.hit1Direction;
          bestRadius = radius;
        }
      }
    }
  }

  let coverage = hits / f32(_vgsl_f12962cb__SUB_STEPS * _vgsl_f12962cb__SUB_STEPS);
  if (hits < 0.5) {
    return _vgsl_f12962cb__RefineOut(vec2f(0.0, 0.0), vec4f(0.0));
  }

  var r0 = length(centerPlane);
  var span = 0.0;
  var geometry = vec4f(0.0);
  if (centerHit) {
    span = 2.0 * max(abs(maxRadius - r0), abs(r0 - minRadius));
  } else {
    r0 = 0.5 * (minRadius + maxRadius);
    span = maxRadius - minRadius;
    geometry = vec4f(bestPlane * (r0 / max(bestRadius, _vgsl_25e01e56__ISCO)), bestDirection);
  }
  return _vgsl_f12962cb__RefineOut(vec2f(coverage, clamp(span / annulus, 0.0, 1.0)), geometry);
}

// vgsl-module: C:\\Users\\pranj\\Documents\\Codex\\2026-10-04\\upgrade-goal-premium-interactive-3d-motion\\work\\portfolio-push\\portfolio\\src\\black-hole\\geodesic.wgsl
// Shared Schwarzschild-like ray integration used by the bake and refinement passes.

 const _vgsl_25e01e56__HORIZON: f32 = 1.0;

 const _vgsl_25e01e56__ISCO: f32 = 3.0;

 const _vgsl_25e01e56__MAX_STEPS: i32 = 768;

 struct _vgsl_25e01e56__TraceResult {
  hit1Plane: vec2f,
  hit1Direction: vec2f,
  hit2Plane: vec2f,
  hit2Direction: vec2f,
  hitCount: i32,
  swallowed: f32,
  escaped: f32,

  finalVelocity: vec3f,
}

 struct _vgsl_25e01e56__CameraRay {
  position: vec3f,
  velocity: vec3f,
}

 fn _vgsl_25e01e56__escapeRadiusFor(orbitRadius: f32) -> f32 {
  return max(120.0, orbitRadius + 8.0);
}

 fn _vgsl_25e01e56__encodeDirection(direction: vec3f) -> vec2f {
  return vec2f(direction.y, atan2(direction.z, direction.x));
}

fn _vgsl_25e01e56__geodesicAcceleration(position: vec3f, velocity: vec3f) -> vec3f {
  let r2 = max(dot(position, position), 0.0001);
  let angularMomentum = cross(position, velocity);
  let h2 = dot(angularMomentum, angularMomentum);
  return -1.5 * h2 * position / (r2 * r2 * sqrt(r2));
}

 fn _vgsl_25e01e56__cameraRay(
  uv: vec2f,
  resolution: vec2f,
  yaw: f32,
  pitch: f32,
  orbitRadius: f32,
  fov: f32,
  centerX: f32,
  centerY: f32,
  roll: f32,
) -> _vgsl_25e01e56__CameraRay {
  let aspect = resolution.x / max(resolution.y, 1.0);
  let ndc = vec2f(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0);
  let screenPlane = (ndc - vec2f(centerX, centerY)) * vec2f(aspect, 1.0);
  let cosine = cos(roll);
  let sine = sin(roll);
  let screen = vec2f(
    screenPlane.x * cosine - screenPlane.y * sine,
    screenPlane.x * sine + screenPlane.y * cosine,
  );

  let clampedPitch = clamp(pitch, -1.319, 1.319);
  let cameraPosition = vec3f(
    sin(yaw) * cos(clampedPitch) * orbitRadius,
    sin(clampedPitch) * orbitRadius,
    cos(yaw) * cos(clampedPitch) * orbitRadius,
  );
  let forward = normalize(vec3f(0.0) - cameraPosition);
  let right = normalize(cross(forward, vec3f(0.0, 1.0, 0.0)));
  let up = cross(right, forward);

  var ray: _vgsl_25e01e56__CameraRay;
  ray.position = cameraPosition;
  ray.velocity = normalize(forward * fov + right * screen.x + up * screen.y);
  return ray;
}

 fn _vgsl_25e01e56__traceRay(cameraPosition: vec3f, initialVelocity: vec3f, diskOuter: f32, escapeRadius: f32) -> _vgsl_25e01e56__TraceResult {
  var position = cameraPosition;
  var velocity = initialVelocity;

  var result: _vgsl_25e01e56__TraceResult;
  result.hit1Plane = vec2f(0.0);
  result.hit1Direction = vec2f(0.0);
  result.hit2Plane = vec2f(0.0);
  result.hit2Direction = vec2f(0.0);
  result.hitCount = 0;
  result.swallowed = 0.0;
  result.escaped = 0.0;

  for (var stepIndex = 0; stepIndex < _vgsl_25e01e56__MAX_STEPS; stepIndex++) {
    let radius = length(position);
    if (radius < _vgsl_25e01e56__HORIZON * 1.004) {
      result.swallowed = 1.0;
      break;
    }
    if (radius > escapeRadius && dot(position, velocity) > 0.0) {
      result.escaped = 1.0;
      break;
    }

    let stepSize = clamp((radius - _vgsl_25e01e56__HORIZON) * 0.035, 0.0045, 0.075 * max(1.0, radius / 6.0));

    let previousPosition = position;
    let previousVelocity = velocity;

    let acceleration0 = _vgsl_25e01e56__geodesicAcceleration(position, velocity);
    velocity += acceleration0 * (0.5 * stepSize);
    position += velocity * stepSize;
    let acceleration1 = _vgsl_25e01e56__geodesicAcceleration(position, velocity);
    velocity += acceleration1 * (0.5 * stepSize);
    velocity = normalize(velocity);

    if (result.hitCount < 2) {
      let previousSide = select(-1.0, 1.0, previousPosition.y >= 0.0);
      let currentSide = select(-1.0, 1.0, position.y >= 0.0);
      if (previousSide != currentSide) {
        let t = clamp(previousPosition.y / (previousPosition.y - position.y), 0.0, 1.0);
        let crossing = mix(previousPosition, position, t);
        let planeRadius = length(crossing.xz);
        if (planeRadius >= _vgsl_25e01e56__ISCO && planeRadius <= diskOuter) {
          let direction = _vgsl_25e01e56__encodeDirection(normalize(mix(previousVelocity, velocity, t)));
          if (result.hitCount == 0) {
            result.hit1Plane = crossing.xz;
            result.hit1Direction = direction;
          } else {
            result.hit2Plane = crossing.xz;
            result.hit2Direction = direction;
          }
          result.hitCount += 1;
        }
      }
    }
  }

  result.finalVelocity = velocity;
  return result;
}
`,functionExports:[{name:"escapeRadiusFor",resolvedName:"_vgsl_25e01e56__escapeRadiusFor",parameterNames:["orbitRadius"]},{name:"encodeDirection",resolvedName:"_vgsl_25e01e56__encodeDirection",parameterNames:["direction"]},{name:"cameraRay",resolvedName:"_vgsl_25e01e56__cameraRay",parameterNames:["uv","resolution","yaw","pitch","orbitRadius","fov","centerX","centerY","roll"]},{name:"traceRay",resolvedName:"_vgsl_25e01e56__traceRay",parameterNames:["cameraPosition","initialVelocity","diskOuter","escapeRadius"]}]},Pe={version:1,wgsl:`// vgsl-module: C:\\Users\\pranj\\Documents\\Codex\\2026-10-04\\upgrade-goal-premium-interactive-3d-motion\\work\\portfolio-push\\portfolio\\src\\black-hole\\shade.wgsl
// Per-frame shading: decode the bake, shade stars and disk layers, then composite them.

           
        
      

struct _vgsl_ab9752b2__Shade {
  resolution: vec2f,
  time: f32,
  diskOuter: f32,
  sceneYaw: f32,
  centerFade: f32,
}

const _vgsl_ab9752b2__DISK_GAIN: f32 = 1.35;

fn _vgsl_ab9752b2__centeredCopyFade(uvY: f32) -> f32 {
  let distanceFromCenter = abs(uvY - 0.5);
  return pow(smoothstep(0.08, 0.38, distanceFromCenter), 2.2);
}

@group(0) @binding(0) var<uniform> shade: _vgsl_ab9752b2__Shade;
@group(0) @binding(1) var gHit1: texture_2d<f32>;
@group(0) @binding(2) var gHit2: texture_2d<f32>;
@group(0) @binding(3) var gSky: texture_2d<f32>;
@group(0) @binding(4) var gView: texture_2d<f32>;
@group(0) @binding(5) var<uniform> disk: _vgsl_502f0163__DiskLook;
@group(0) @binding(6) var<uniform> stars: _vgsl_efe8d35a__StarLook;

@group(0) @binding(7) var noiseVolume: texture_3d<f32>;
@group(0) @binding(8) var noiseSampler: sampler;

@group(0) @binding(9) var gAa: texture_2d<f32>;

@group(0) @binding(10) var gAaGeom: texture_2d<f32>;

fn _vgsl_ab9752b2__diskFootprintAxes(g: _vgsl_1a2474de__GBufferSample) -> vec2f {
  let angular = max(disk.stretch, 0.05);
  let noiseAngle = g.diskPolar.y
    - min(shade.time, _vgsl_502f0163__SHEAR_PERIOD * 0.5) * (disk.speed * 0.55 / pow(g.diskPolar.x, 1.5));
  let noiseCoords = vec3f(
    cos(noiseAngle) * angular,
    sin(noiseAngle) * angular,
    g.diskPolar.x * disk.detail,
  );
  return vec2f(
    max(fwidth(noiseCoords.x), fwidth(noiseCoords.y)),
    fwidth(noiseCoords.z),
  );
}

fn _vgsl_ab9752b2__diskFootprint(axes: vec2f) -> f32 {
  return min(max(axes.x, axes.y), 4.0);
}

fn _vgsl_ab9752b2__rotateY(v: vec3f, angle: f32) -> vec3f {
  let c = cos(angle);
  let s = sin(angle);
  return vec3f(c * v.x + s * v.z, v.y, -s * v.x + c * v.z);
}

fn _vgsl_ab9752b2__wrapAngle(angle: f32) -> f32 {
  return angle - _vgsl_1a2474de__TAU * floor((angle + _vgsl_1a2474de__PI_CONST) / _vgsl_1a2474de__TAU);
}

fn _vgsl_ab9752b2__rotateSample(g: _vgsl_1a2474de__GBufferSample, angle: f32) -> _vgsl_1a2474de__GBufferSample {
  var rotated = g;
  rotated.position = _vgsl_ab9752b2__rotateY(g.position, angle);
  rotated.viewDirection = _vgsl_ab9752b2__rotateY(g.viewDirection, angle);
  rotated.rayDirection = _vgsl_ab9752b2__rotateY(g.rayDirection, angle);
  let azimuth = _vgsl_ab9752b2__wrapAngle(g.diskPolar.y - angle);
  rotated.diskPolar = vec2f(g.diskPolar.x, azimuth);
  rotated.diskUv = vec2f(g.diskUv.x, (azimuth + _vgsl_1a2474de__PI_CONST) / _vgsl_1a2474de__TAU);
  return rotated;
}

fn _vgsl_ab9752b2__rotateLayers(layers: _vgsl_1a2474de__GBufferLayers, angle: f32) -> _vgsl_1a2474de__GBufferLayers {
  var rotated: _vgsl_1a2474de__GBufferLayers;
  rotated.front = _vgsl_ab9752b2__rotateSample(layers.front, angle);
  rotated.back = _vgsl_ab9752b2__rotateSample(layers.back, angle);
  return rotated;
}

const _vgsl_ab9752b2__AA_TAPS: i32 = 6;

const _vgsl_ab9752b2__AA_SPAN_MIN: f32 = 0.15;

fn _vgsl_ab9752b2__shadeFront(g: _vgsl_1a2474de__GBufferSample, footprint: f32, angularFootprint: f32) -> _vgsl_502f0163__DiskSample {
  let annulus = max(shade.diskOuter - _vgsl_1a2474de__ISCO, 0.001);
  let spanWorld = g.span * annulus;
  if (g.span <= _vgsl_ab9752b2__AA_SPAN_MIN) {
    return _vgsl_502f0163__shadeDisk(g, disk, shade.time, footprint, noiseVolume, noiseSampler);
  }

  let tapFootprint = min(max(angularFootprint, max(disk.detail, 0.05) * (spanWorld / f32(_vgsl_ab9752b2__AA_TAPS))), 4.0);
  let step = spanWorld / f32(_vgsl_ab9752b2__AA_TAPS);
  let start = g.diskPolar.x - spanWorld * 0.5;

  var sumEmission = vec3f(0.0);
  var sumAlpha = 0.0;
  var taps = 0.0;
  for (var i = 0; i < _vgsl_ab9752b2__AA_TAPS; i++) {
    let radius = start + (f32(i) + 0.5) * step;
    if (radius < _vgsl_1a2474de__ISCO || radius > shade.diskOuter) {
      continue;
    }
    let tap = _vgsl_502f0163__shadeDisk(
      _vgsl_1a2474de__sampleAtRadius(g, radius, shade.diskOuter), disk, shade.time,
      tapFootprint, noiseVolume, noiseSampler,
    );
    sumEmission += tap.color * tap.alpha;
    sumAlpha += tap.alpha;
    taps += 1.0;
  }
  if (taps < 0.5) {
    return _vgsl_502f0163__shadeDisk(g, disk, shade.time, footprint, noiseVolume, noiseSampler);
  }

  var sample: _vgsl_502f0163__DiskSample;
  let meanAlpha = sumAlpha / taps;
  sample.alpha = meanAlpha;
  sample.color = select(vec3f(0.0), (sumEmission / taps) / max(meanAlpha, 1e-6), meanAlpha > 1e-6);
  return sample;
}

fn _vgsl_ab9752b2__emptyDiskSample() -> _vgsl_502f0163__DiskSample {
  var sample: _vgsl_502f0163__DiskSample;
  sample.color = vec3f(0.0);
  sample.alpha = 0.0;
  return sample;
}

fn _vgsl_ab9752b2__compositeDisk(under: vec3f, sample: _vgsl_502f0163__DiskSample) -> vec3f {
  return sample.color * sample.alpha * _vgsl_ab9752b2__DISK_GAIN + under * (1.0 - sample.alpha);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let dimensions = vec2f(textureDimensions(gHit1, 0));
  let texel = vec2i(clamp(uv * dimensions, vec2f(0.0), dimensions - vec2f(1.0)));

  let aa = textureLoad(gAa, texel, 0).xy;
  let aaGeom = textureLoad(gAaGeom, texel, 0);

  let baked = _vgsl_1a2474de__decodeGBuffer(
    textureLoad(gHit1, texel, 0).xy,
    textureLoad(gHit2, texel, 0).xy,
    textureLoad(gSky, texel, 0),
    textureLoad(gView, texel, 0),
    shade.diskOuter,
    aa,
    aaGeom,
  );

  let frontAxes = _vgsl_ab9752b2__diskFootprintAxes(baked.front);
  let backAxes = _vgsl_ab9752b2__diskFootprintAxes(baked.back);
  let frontFootprint = _vgsl_ab9752b2__diskFootprint(frontAxes);
  let backFootprint = _vgsl_ab9752b2__diskFootprint(backAxes);

  let bakedRayDirection = baked.front.rayDirection;
  let skyDdx = dpdx(bakedRayDirection);
  let skyDdy = dpdy(bakedRayDirection);

  let layers = _vgsl_ab9752b2__rotateLayers(baked, -shade.sceneYaw);
  let g = layers.front;
  let skyDdxRotated = _vgsl_ab9752b2__rotateY(skyDdx, -shade.sceneYaw);
  let skyDdyRotated = _vgsl_ab9752b2__rotateY(skyDdy, -shade.sceneYaw);

  var background = vec3f(0.0);
  if (!g.isBlackHole && g.escaped) {
    background = _vgsl_efe8d35a__shadeStars(g.rayDirection, stars, shade.time, skyDdxRotated, skyDdyRotated);
  }

  var backSample = _vgsl_ab9752b2__emptyDiskSample();
  var frontSample = _vgsl_ab9752b2__emptyDiskSample();
  if (layers.back.isHit) {
    backSample = _vgsl_502f0163__shadeDisk(layers.back, disk, shade.time, backFootprint, noiseVolume, noiseSampler);
  }
  if (layers.front.isHit) {
    frontSample = _vgsl_ab9752b2__shadeFront(layers.front, frontFootprint, frontAxes.x);
    frontSample.alpha *= layers.front.coverage;
  }

  var color = background;
  color = _vgsl_ab9752b2__compositeDisk(color, backSample);
  color = _vgsl_ab9752b2__compositeDisk(color, frontSample);

  let centerMask = mix(
    1.0,
    _vgsl_ab9752b2__centeredCopyFade(uv.y),
    clamp(shade.centerFade, 0.0, 1.0),
  );
  let heroFade = centerMask;

  color *= heroFade;

  return vec4f(color, 1.0);
}

// vgsl-module: C:\\Users\\pranj\\Documents\\Codex\\2026-10-04\\upgrade-goal-premium-interactive-3d-motion\\work\\portfolio-push\\portfolio\\src\\black-hole\\gbuffer.wgsl
// Shared decoding contract for the baked crossings consumed by the frame shader.

 const _vgsl_1a2474de__HORIZON: f32 = 1.0;

 const _vgsl_1a2474de__ISCO: f32 = 3.0;
 const _vgsl_1a2474de__TAU: f32 = 6.28318530718;
 const _vgsl_1a2474de__PI_CONST: f32 = 3.14159265359;

 struct _vgsl_1a2474de__GBufferSample {
  position: vec3f,
  normal: vec3f,
  diskUv: vec2f,
  diskPolar: vec2f,
  rayDirection: vec3f,
  viewDirection: vec3f,
  side: f32,
  coverage: f32,
  span: f32,
  isHit: bool,
  synthesized: bool,
  isBlackHole: bool,
  escaped: bool,
}

 struct _vgsl_1a2474de__GBufferLayers {
  front: _vgsl_1a2474de__GBufferSample,
  back: _vgsl_1a2474de__GBufferSample,
}

fn _vgsl_1a2474de__decodeDirection(encoded: vec2f) -> vec3f {
  let horizontal = sqrt(max(1.0 - encoded.x * encoded.x, 0.0));
  return vec3f(cos(encoded.y) * horizontal, encoded.x, sin(encoded.y) * horizontal);
}

fn _vgsl_1a2474de__decodeLayer(
  plane: vec2f, encodedDirection: vec2f, sky: vec4f, flags: i32,
  diskOuter: f32, aa: vec2f, synthesized: bool,
) -> _vgsl_1a2474de__GBufferSample {
  var sample: _vgsl_1a2474de__GBufferSample;
  let planeRadius = length(plane);
  let isHit = planeRadius > _vgsl_1a2474de__ISCO * 0.5;
  let radius = max(planeRadius, _vgsl_1a2474de__ISCO);
  let azimuth = atan2(plane.y, plane.x);
  let direction = _vgsl_1a2474de__decodeDirection(encodedDirection);
  let side = select(1.0, -1.0, direction.y > 0.0);

  sample.position = select(vec3f(0.0), vec3f(plane.x, 0.0, plane.y), isHit);
  sample.normal = select(vec3f(0.0), vec3f(0.0, side, 0.0), isHit);
  sample.diskUv = vec2f(
    clamp((radius - _vgsl_1a2474de__ISCO) / max(diskOuter - _vgsl_1a2474de__ISCO, 0.001), 0.0, 1.0),
    (azimuth + _vgsl_1a2474de__PI_CONST) / _vgsl_1a2474de__TAU,
  );
  sample.diskPolar = vec2f(radius, azimuth);
  sample.rayDirection = sky.xyz;
  sample.viewDirection = direction;
  sample.side = select(0.0, side, isHit);
  sample.coverage = clamp(aa.x, 0.0, 1.0);
  sample.span = clamp(aa.y, 0.0, 1.0);
  sample.isHit = isHit;
  sample.synthesized = synthesized && isHit;
  sample.isBlackHole = (flags & 1) != 0;
  sample.escaped = (flags & 2) != 0;
  return sample;
}

 fn _vgsl_1a2474de__decodeGBuffer(
  hit1: vec2f, hit2: vec2f, sky: vec4f, view: vec4f,
  diskOuter: f32, aa: vec2f, aaGeom: vec4f,
) -> _vgsl_1a2474de__GBufferLayers {
  let flags = i32(sky.w + 0.5);
  let substitute = length(hit1) <= _vgsl_1a2474de__ISCO * 0.5 && length(aaGeom.xy) > _vgsl_1a2474de__ISCO * 0.5;
  let frontPlane = select(hit1, aaGeom.xy, substitute);
  let frontDirection = select(view.xy, aaGeom.zw, substitute);
  var layers: _vgsl_1a2474de__GBufferLayers;
  layers.front = _vgsl_1a2474de__decodeLayer(frontPlane, frontDirection, sky, flags, diskOuter, aa, substitute);
  layers.back = _vgsl_1a2474de__decodeLayer(hit2, view.zw, sky, flags, diskOuter, vec2f(1.0, 0.0), false);
  if (!layers.front.isHit) {
    layers.back.isHit = false;
    layers.back.side = 0.0;
    layers.back.normal = vec3f(0.0);
  }
  return layers;
}

 fn _vgsl_1a2474de__sampleAtRadius(g: _vgsl_1a2474de__GBufferSample, radius: f32, diskOuter: f32) -> _vgsl_1a2474de__GBufferSample {
  var moved = g;
  let clamped = clamp(radius, _vgsl_1a2474de__ISCO, max(diskOuter, _vgsl_1a2474de__ISCO));
  let azimuth = g.diskPolar.y;
  moved.position = vec3f(cos(azimuth) * clamped, 0.0, sin(azimuth) * clamped);
  moved.diskPolar = vec2f(clamped, azimuth);
  moved.diskUv = vec2f(
    clamp((clamped - _vgsl_1a2474de__ISCO) / max(diskOuter - _vgsl_1a2474de__ISCO, 0.001), 0.0, 1.0),
    g.diskUv.y,
  );
  return moved;
}

// vgsl-module: C:\\Users\\pranj\\Documents\\Codex\\2026-10-04\\upgrade-goal-premium-interactive-3d-motion\\work\\portfolio-push\\portfolio\\src\\black-hole\\disk.wgsl
// Accretion-disk material with deterministic tiled noise and radial prefiltering.

       

 struct _vgsl_502f0163__DiskLook {
  brightness: f32,
  speed: f32,
  stretch: f32,
  detail: f32,
  turbulence: f32,
  density: f32,
  doppler: f32,
  cloudScale: f32,
  cloudSpeed: f32,
  cloudStrength: f32,
  spare0: f32,
  spare1: f32,
  spare2: f32,
  spare3: f32,
}

 struct _vgsl_502f0163__DiskSample {
  color: vec3f,
  alpha: f32,
}

struct _vgsl_502f0163__NoiseLattice {
  invSize: f32,
}

fn _vgsl_502f0163__noise3(tex: texture_3d<f32>, samp: sampler, lattice: _vgsl_502f0163__NoiseLattice, p: vec3f) -> f32 {
  let i = floor(p);
  let f = p - i;
  let u = f * f * (3.0 - 2.0 * f);
  return textureSampleLevel(tex, samp, (i + u + vec3f(0.5)) * lattice.invSize, 0.0).r;
}

fn _vgsl_502f0163__streakFbm(
  tex: texture_3d<f32>,
  samp: sampler,
  lattice: _vgsl_502f0163__NoiseLattice,
  angle: f32,
  radius: f32,
  angScale: f32,
  radScale: f32,
  octaves: i32,
  dAngle: f32,
  dRadius: f32,
  lacAng: f32,
  lacRad: f32,
  seed: f32,
) -> f32 {
  var value: f32 = 0.0;
  var total: f32 = 0.0;
  var amplitude: f32 = 0.5;
  var a = angScale;
  var r = radScale;
  var offset = seed;
  for (var i = 0; i < octaves; i++) {
    let visible = clamp(1.0 - 1.7 * max(dAngle * a, dRadius * r), 0.0, 1.0);
    var sampleValue: f32 = 0.5;
    if (visible > 0.004) {
      sampleValue = mix(
        0.5,
        _vgsl_502f0163__noise3(tex, samp, lattice, vec3f(cos(angle) * a, sin(angle) * a, radius * r + offset)),
        visible,
      );
    }
    value += amplitude * sampleValue;
    total += amplitude;
    a *= lacAng;
    r *= lacRad;
    offset += 23.7;
    amplitude *= 0.55;
  }
  return value / max(total, 0.0001);
}

fn _vgsl_502f0163__ridgeFbm(
  tex: texture_3d<f32>,
  samp: sampler,
  lattice: _vgsl_502f0163__NoiseLattice,
  angle: f32,
  radius: f32,
  angScale: f32,
  radScale: f32,
  octaves: i32,
  dAngle: f32,
  dRadius: f32,
  lacAng: f32,
  lacRad: f32,
  seed: f32,
) -> f32 {
  var value: f32 = 0.0;
  var total: f32 = 0.0;
  var amplitude: f32 = 0.5;
  var a = angScale;
  var r = radScale;
  var offset = seed;
  for (var i = 0; i < octaves; i++) {
    let visible = clamp(1.0 - 1.7 * max(dAngle * a, dRadius * r), 0.0, 1.0);
    var crest: f32 = 0.42;
    if (visible > 0.004) {
      let n = _vgsl_502f0163__noise3(tex, samp, lattice, vec3f(cos(angle) * a, sin(angle) * a, radius * r + offset));
      crest = mix(0.42, pow(1.0 - abs(n * 2.0 - 1.0), 1.35), visible);
    }
    value += amplitude * crest;
    total += amplitude;
    a *= lacAng;
    r *= lacRad;
    offset += 41.9;
    amplitude *= 0.62;
  }
  return value / max(total, 0.0001);
}

struct _vgsl_502f0163__FieldParams {
  angBase: f32,
  radBase: f32,
  flowRad: f32,
  chaos: f32,
  outward: f32,
  dAngle: f32,
  dRadius: f32,
}

fn _vgsl_502f0163__smokeField(
  tex: texture_3d<f32>, samp: sampler, lattice: _vgsl_502f0163__NoiseLattice,
  angle: f32, radius: f32, p: _vgsl_502f0163__FieldParams,
) -> vec2f {
  let warpA = (_vgsl_502f0163__streakFbm(
    tex, samp, lattice, angle, radius, p.angBase * 0.55, p.flowRad * 1.6,
    2, p.dAngle, p.dRadius, 1.6, 2.0, 3.7,
  )) - 0.5;
  let warpB = (_vgsl_502f0163__streakFbm(
    tex, samp, lattice, angle + 2.4, radius * 1.13,
    p.angBase * 2.8, p.radBase * 0.45, 3, p.dAngle, p.dRadius,
    1.7, 2.0, 61.3,
  )) - 0.5;
  let radiusW = radius + (warpA * 1.9 + warpB * 1.25 * p.outward) * p.chaos;
  let angleW = angle + (warpB * 0.9 - warpA * 0.35) * p.chaos * 0.55 / max(radius * 0.22, 0.35);

  let flow = _vgsl_502f0163__streakFbm(
    tex, samp, lattice, angleW, radiusW, p.angBase, p.flowRad,
    3, p.dAngle, p.dRadius, 2.0, 1.12, 131.7,
  );
  let threads = _vgsl_502f0163__ridgeFbm(
    tex, samp, lattice, angleW, radiusW, p.angBase * 0.85, p.radBase,
    5, p.dAngle, p.dRadius, 1.26, 2.05, 0.0,
  );

  let fineVis = clamp(1.0 - 1.7 * max(p.dAngle * p.angBase * 0.85, p.dRadius * p.radBase), 0.0, 1.0);
  let field = mix(flow, flow * 0.22 + threads * 1.05, fineVis);
  let rim = (warpA + warpB * 0.5) * 0.9;
  return vec2f(f32(field), rim);
}

const _vgsl_502f0163__FIELD_MEAN = 0.52;

const _vgsl_502f0163__SHEAR_REF_RADIUS = 6.5;

 const _vgsl_502f0163__SHEAR_PERIOD: f32 = 10.0;
const _vgsl_502f0163__TWO_PI = 6.283185307;

 fn _vgsl_502f0163__shadeDisk(
  g: _vgsl_1a2474de__GBufferSample,
  look: _vgsl_502f0163__DiskLook,
  time: f32,
  footprint: f32,
  noiseTex: texture_3d<f32>,
  noiseSampler: sampler,
) -> _vgsl_502f0163__DiskSample {
  var lattice: _vgsl_502f0163__NoiseLattice;
  lattice.invSize = 1.0 / f32(textureDimensions(noiseTex).x);

  let plane = vec2f(g.position.x, g.position.z);
  let radius = g.diskPolar.x;
  let azimuth = g.diskPolar.y;
  let radiusNorm = clamp(g.diskUv.x, 0.0, 1.0);
  let viewDirection = g.viewDirection;

  let slant = max(abs(viewDirection.y), 0.022);
  let grazing = min(1.0 / slant, 34.0);

  let viewPlane = normalize(vec2f(viewDirection.x, viewDirection.z) + vec2f(1e-6, 0.0));
  let radialDir = normalize(plane + vec2f(1e-6, 0.0));
  let alignR = clamp(abs(dot(radialDir, viewPlane)), 0.0, 1.0);
  let alignT = sqrt(max(1.0 - alignR * alignR, 0.0));
  let stretchSq = grazing * grazing - 1.0;
  let kR = sqrt(1.0 + stretchSq * alignR * alignR);   // radial elongation
  let kT = sqrt(1.0 + stretchSq * alignT * alignT);   // tangential elongation
  let baseScaleR = max(look.detail, 0.05);
  let baseScaleA = max(look.stretch, 0.05);
  let pixelWorld = footprint / max(baseScaleR * kR, baseScaleA * kT / max(radius, _vgsl_1a2474de__ISCO));
  let dRadius = pixelWorld * kR;
  let dAngle = pixelWorld * kT / max(radius, _vgsl_1a2474de__ISCO);

  let omega = look.speed * 0.55 / pow(radius, 1.5);
  let omegaRef = look.speed * 0.55 / pow(_vgsl_502f0163__SHEAR_REF_RADIUS, 1.5);
  let dOmega = omega - omegaRef;
  let rigid = fract(time * omegaRef / _vgsl_502f0163__TWO_PI) * _vgsl_502f0163__TWO_PI;
  let swirl = max(0.0, 0.85 + look.spare1);
  let flowBase = azimuth - rigid + swirl * log(radius / _vgsl_1a2474de__ISCO);

  let cycle = time / _vgsl_502f0163__SHEAR_PERIOD;
  let u0 = fract(cycle);
  let u1 = fract(cycle + 0.5);
  let shear0 = (u0 - 0.5) * _vgsl_502f0163__SHEAR_PERIOD;
  let shear1 = (u1 - 0.5) * _vgsl_502f0163__SHEAR_PERIOD;
  let w0 = 1.0 - abs(2.0 * u0 - 1.0);
  let w1 = 1.0 - w0;
  let angle0 = flowBase - dOmega * shear0;
  let angle1 = flowBase - dOmega * shear1;

  let outward = smoothstep(0.0, 0.92, radiusNorm);
  let fray = max(0.0, 1.0 + look.spare3);
  let chaos = look.turbulence * (0.08 + 2.10 * outward * outward) * fray;

  let angBase = max(look.stretch, 0.05) * 0.45 * (0.80 + 1.45 * outward * fray);
  let radBase = max(look.detail, 0.05) * 2.35;
  let flowRad = max(look.detail, 0.05) * 0.105;

  var params: _vgsl_502f0163__FieldParams;
  params.angBase = angBase;
  params.radBase = radBase;
  params.flowRad = flowRad;
  params.chaos = chaos;
  params.outward = outward;
  params.dAngle = dAngle;
  params.dRadius = dRadius;
  let lobeShift = abs(dOmega) * _vgsl_502f0163__SHEAR_PERIOD * 0.5 * angBase * 0.85;
  let rho = 1.0 - smoothstep(0.12, 1.1, lobeShift);

  var blended: vec2f;
  var lobeVariance = 1.0;
  if (rho > 0.98) {
    let angleMerged = mix(angle1, angle0, w0);
    blended = _vgsl_502f0163__smokeField(noiseTex, noiseSampler, lattice, angleMerged, radius, params);
  } else {
    let lobe0 = _vgsl_502f0163__smokeField(noiseTex, noiseSampler, lattice, angle0, radius, params);
    let lobe1 = _vgsl_502f0163__smokeField(noiseTex, noiseSampler, lattice, angle1, radius, params);
    blended = mix(lobe1, lobe0, w0);
    lobeVariance = sqrt(max(w0 * w0 + w1 * w1 + 2.0 * rho * w0 * w1, 0.25));
  }
  var field = _vgsl_502f0163__FIELD_MEAN + (blended.x - _vgsl_502f0163__FIELD_MEAN) / lobeVariance;

  let cloudRate = omegaRef * look.cloudSpeed;
  let cloudRigid = fract(time * cloudRate / _vgsl_502f0163__TWO_PI) * _vgsl_502f0163__TWO_PI;
  let cloudAngle = azimuth - cloudRigid + 0.32 * log(radius / _vgsl_1a2474de__ISCO);
  let cloudScale = max(look.cloudScale, 0.05);
  let cloudRaw = _vgsl_502f0163__streakFbm(
    noiseTex,
    noiseSampler,
    lattice,
    cloudAngle,
    radius,
    cloudScale,
    cloudScale * 0.34,
    2,
    dAngle,
    dRadius,
    1.72,
    1.86,
    211.7,
  );
  let cloud = smoothstep(0.28, 0.72, cloudRaw);
  let cloudStrength = clamp(look.cloudStrength, 0.0, 0.95);
  let cloudMultiplier = mix(1.0 - cloudStrength, 1.0 + cloudStrength, cloud);
  field *= cloudMultiplier;

  let rimNoise = blended.y;
  let innerEdge = smoothstep(0.0, 0.055, radiusNorm);
  let outerEdge = 1.0 - smoothstep(0.42 + rimNoise * 0.30 * fray, 1.0, radiusNorm);
  let envelope = innerEdge * outerEdge * mix(1.0, 0.62, outward);

  let contrast = max(0.2, 1.0 + look.spare2);
  let lo = 0.50 - 0.16 / contrast;
  let hi = 0.50 + 0.21 / contrast;
  var smoke = clamp(pow(smoothstep(lo, hi, field), 1.0 + 0.9 * contrast) * envelope, 0.0, 1.0);

  let fieldN = clamp((field - (lo - 0.10)) / max(hi - lo + 0.26, 0.02), 0.0, 1.0);
  let emissivity = (mix(0.05, 1.0, pow(fieldN, 1.35)) + 2.2 * pow(fieldN, 5.0)) * envelope;

  let path = pow(grazing, 0.62);
  let thickness = mix(0.30, 0.85, radiusNorm);
  let opticalDepth = smoke * thickness * path * look.density * 0.95;
  let coverage = 1.0 - exp(-opticalDepth);

  let heat = pow(1.0 - radiusNorm, 1.25);
  var thermal = mix(vec3f(0.52, 0.14, 0.03), vec3f(1.0, 0.56, 0.17), smoothstep(0.03, 0.5, heat));
  thermal = mix(thermal, vec3f(1.0, 0.94, 0.83), pow(heat, 2.2));

  let tangent = normalize(vec3f(-plane.y, 0.0, plane.x));
  let orbitalSpeed = min(0.64, 0.94 / sqrt(max(radius - _vgsl_1a2474de__HORIZON, 0.25)));
  let towardObserver = dot(tangent, -normalize(viewDirection));
  let beaming = pow(clamp(1.0 / (1.0 - orbitalSpeed * towardObserver), 0.72, 1.55), 1.5 * look.doppler);
  let redshift = sqrt(max(1.0 - _vgsl_1a2474de__HORIZON / radius, 0.025));

  let facing = mix(0.82, 1.0, step(0.0, g.side));

  let flux = pow(clamp(_vgsl_1a2474de__ISCO / radius, 0.0, 1.0), 1.7);
  let core = 1.0 + 2.6 * pow(1.0 - radiusNorm, 5.0);

  let arcLift = max(0.0, 1.0 + look.spare0);
  let faceOn = smoothstep(0.16, 0.75, abs(viewDirection.y));
  let lift = 1.0 + 1.55 * arcLift * faceOn;
  let edgeGlow = 1.0 + 0.55 * smoothstep(6.0, 26.0, grazing);

  let source = thermal * beaming * redshift * facing * flux * lift * edgeGlow * core * emissivity;
  let emission = source * look.brightness * 1.35;

  var sample: _vgsl_502f0163__DiskSample;
  sample.color = vec3f(emission);
  sample.alpha = coverage;
  return sample;
}

// vgsl-module: C:\\Users\\pranj\\Documents\\Codex\\2026-10-04\\upgrade-goal-premium-interactive-3d-motion\\work\\portfolio-push\\portfolio\\src\\black-hole\\stars.wgsl
// Procedural lensed star field with anisotropic footprint prefiltering.

      

const _vgsl_efe8d35a__STAR_INTENSITY: f32 = 1.9;

const _vgsl_efe8d35a__ANCHOR_CELLS: f32 = 36.0;
const _vgsl_efe8d35a__ANCHOR_FILL: f32 = 0.75;
const _vgsl_efe8d35a__ANCHOR_RADIUS: f32 = 0.00110;
const _vgsl_efe8d35a__ANCHOR_PEAK: f32 = 1.0;

const _vgsl_efe8d35a__FIELD_CELLS: f32 = 93.0;
const _vgsl_efe8d35a__FIELD_FILL: f32 = 0.75;
const _vgsl_efe8d35a__FIELD_RADIUS: f32 = 0.00070;
const _vgsl_efe8d35a__FIELD_PEAK: f32 = 0.45;

const _vgsl_efe8d35a__DUST_CELLS: f32 = 151.0;
const _vgsl_efe8d35a__DUST_FILL: f32 = 0.75;
const _vgsl_efe8d35a__DUST_RADIUS: f32 = 0.00040;
const _vgsl_efe8d35a__DUST_PEAK: f32 = 0.22;

const _vgsl_efe8d35a__COUNT_SLOPE: f32 = 2.0;

const _vgsl_efe8d35a__STAR_FLUX_AREA: f32 = 0.5385;

const _vgsl_efe8d35a__MAX_PREFILTER_PIXELS: f32 = 4.0;

const _vgsl_efe8d35a__STAR_WARM: vec3f = vec3f(1.1741, 0.9745, 0.7397);
const _vgsl_efe8d35a__STAR_COOL: vec3f = vec3f(0.8954, 1.0131, 1.1781);

 struct _vgsl_efe8d35a__StarLook {
  brightness: f32,
  density: f32,
  contrast: f32,
  warmth: f32,
  twinkle: f32,
}

fn _vgsl_efe8d35a__faceCoords(direction: vec3f) -> vec3f {
  let magnitude = abs(direction);
  if (magnitude.x >= magnitude.y && magnitude.x >= magnitude.z) {
    return vec3f(direction.yz / magnitude.x, select(1.0, 0.0, direction.x > 0.0));
  }
  if (magnitude.y >= magnitude.z) {
    return vec3f(direction.xz / magnitude.y, select(3.0, 2.0, direction.y > 0.0));
  }
  return vec3f(direction.xy / magnitude.z, select(5.0, 4.0, direction.z > 0.0));
}

fn _vgsl_efe8d35a__faceProject(direction: vec3f, axis: i32) -> vec2f {
  if (axis == 0) {
    return direction.yz / abs(direction.x);
  }
  if (axis == 1) {
    return direction.xz / abs(direction.y);
  }
  return direction.xy / abs(direction.z);
}

struct _vgsl_efe8d35a__SkyFilter {
  inverseJacobian: mat2x2f,
  pixelsPerFace: f32,
  faceMajor: f32,
}

fn _vgsl_efe8d35a__skyFilter(direction: vec3f, axis: i32, ddx: vec3f, ddy: vec3f) -> _vgsl_efe8d35a__SkyFilter {
  let base = _vgsl_efe8d35a__faceProject(direction, axis);
  let jx = _vgsl_efe8d35a__faceProject(direction + ddx, axis) - base;
  let jy = _vgsl_efe8d35a__faceProject(direction + ddy, axis) - base;

  let determinant = jx.x * jy.y - jx.y * jy.x;
  let safeDeterminant = select(determinant, 1.0e-24, abs(determinant) < 1.0e-24);
  let inverse = mat2x2f(vec2f(jy.y, -jx.y), vec2f(-jy.x, jx.x)) * (1.0 / safeDeterminant);

  var prefilter: _vgsl_efe8d35a__SkyFilter;
  prefilter.inverseJacobian = inverse;
  prefilter.pixelsPerFace = 1.0 / sqrt(max(abs(determinant), 1.0e-24));
  prefilter.faceMajor = max(length(jx), length(jy));
  return prefilter;
}

struct _vgsl_efe8d35a__SkyState {
  brightness: f32,
  rangePower: f32,
  meanFlux: f32,
  warmth: f32,
  twinkle: f32,
  time: f32,
  fillScale: f32,
  radiusScale: f32,
}

fn _vgsl_efe8d35a__resolveSky(look: _vgsl_efe8d35a__StarLook, face: vec2f, time: f32) -> _vgsl_efe8d35a__SkyState {
  let range = clamp(look.contrast, 1.0, 512.0);
  let rangePower = range * range;

  let compression = 1.0 + dot(face, face);
  let root = sqrt(compression);

  var sky: _vgsl_efe8d35a__SkyState;
  sky.brightness = max(0.0, look.brightness) * _vgsl_efe8d35a__STAR_INTENSITY;
  sky.rangePower = rangePower;
  sky.meanFlux = _vgsl_efe8d35a__COUNT_SLOPE / (range + _vgsl_efe8d35a__COUNT_SLOPE - 1.0);
  sky.warmth = clamp(look.warmth, 0.0, 1.0);
  sky.twinkle = clamp(look.twinkle, 0.0, 1.0);
  sky.time = time;
  sky.fillScale = max(0.0, look.density) / (compression * root);
  sky.radiusScale = sqrt(compression * root);
  return sky;
}

struct _vgsl_efe8d35a__Species {
  cells: f32,
  fill: f32,
  peak: f32,
  faceRadius: f32,
  radiusPixels: f32,
  gain: f32,
}

fn _vgsl_efe8d35a__resolveSpecies(
  cells: f32,
  fill: f32,
  peak: f32,
  angularRadius: f32,
  sky: _vgsl_efe8d35a__SkyState,
  prefilter: _vgsl_efe8d35a__SkyFilter,
) -> _vgsl_efe8d35a__Species {
  let faceRadius = angularRadius * sky.radiusScale;
  let starPixels = faceRadius * prefilter.pixelsPerFace;

  var species: _vgsl_efe8d35a__Species;
  species.cells = cells;
  species.fill = clamp(fill * sky.fillScale, 0.0, 1.0);
  species.peak = peak * sky.brightness;
  species.faceRadius = faceRadius;
  species.radiusPixels = clamp(starPixels, 1.0, _vgsl_efe8d35a__MAX_PREFILTER_PIXELS);
  species.gain = min(1.0, starPixels * starPixels);
  return species;
}

fn _vgsl_efe8d35a__starPoint(
  cell: vec2f,
  grid: vec2f,
  faceIndex: i32,
  seed: i32,
  species: _vgsl_efe8d35a__Species,
  sky: _vgsl_efe8d35a__SkyState,
  prefilter: _vgsl_efe8d35a__SkyFilter,
) -> vec3f {
  let hashed = _vgsl_4802ec39__pcg3d(bitcast<vec3u>(vec3i(vec2i(cell), faceIndex * 131 + seed)));
  let presence = _vgsl_4802ec39__unitFloat(hashed.x);
  if (presence > species.fill) {
    return vec3f(0.0);
  }

  let jitter = vec2f(_vgsl_4802ec39__unitFloat(hashed.y), _vgsl_4802ec39__unitFloat(hashed.z)) - vec2f(0.5);
  let center = cell + vec2f(0.5) + jitter * 0.8;
  let offsetPixels = prefilter.inverseJacobian * ((grid - center) / species.cells);
  let falloff = 1.0 - smoothstep(0.0, species.radiusPixels, length(offsetPixels));

  let uniform01 = presence / max(species.fill, 1.0e-6);
  let flux = inverseSqrt(1.0 + uniform01 * (sky.rangePower - 1.0));

  let tint = mix(vec3f(1.0), mix(_vgsl_efe8d35a__STAR_WARM, _vgsl_efe8d35a__STAR_COOL, _vgsl_4802ec39__unitFloat(hashed.y ^ hashed.z)), sky.warmth);

  let phase = _vgsl_4802ec39__unitFloat(hashed.y) * 6.2831853;
  let shimmer = 1.0 + sky.twinkle * 0.06 * sin(sky.time * (0.35 + _vgsl_4802ec39__unitFloat(hashed.z) * 0.4) + phase);
  return tint * (falloff * falloff * species.peak * flux * shimmer * species.gain);
}

fn _vgsl_efe8d35a__starSpecies(
  face: vec3f,
  seed: i32,
  species: _vgsl_efe8d35a__Species,
  sky: _vgsl_efe8d35a__SkyState,
  prefilter: _vgsl_efe8d35a__SkyFilter,
) -> vec3f {
  let faceIndex = i32(face.z);
  let grid = face.xy * species.cells;
  let total = _vgsl_efe8d35a__starPoint(floor(grid), grid, faceIndex, seed, species, sky, prefilter);

  let extent = species.faceRadius * species.cells;
  let mean = species.peak * sky.meanFlux * species.fill * _vgsl_efe8d35a__STAR_FLUX_AREA * extent * extent;
  let meanTint = mix(vec3f(1.0), 0.5 * (_vgsl_efe8d35a__STAR_WARM + _vgsl_efe8d35a__STAR_COOL), sky.warmth);
  let cellsPerPixel = species.cells * prefilter.faceMajor;
  return mix(total, meanTint * mean, smoothstep(1.0, 3.0, cellsPerPixel));
}

 fn _vgsl_efe8d35a__shadeStars(direction: vec3f, look: _vgsl_efe8d35a__StarLook, time: f32, ddx: vec3f, ddy: vec3f) -> vec3f {
  let d = normalize(direction);
  let face = _vgsl_efe8d35a__faceCoords(d);
  let prefilter = _vgsl_efe8d35a__skyFilter(d, i32(face.z) / 2, ddx, ddy);
  let sky = _vgsl_efe8d35a__resolveSky(look, face.xy, time);

  return _vgsl_efe8d35a__starSpecies(
    face, 17,
    _vgsl_efe8d35a__resolveSpecies(_vgsl_efe8d35a__ANCHOR_CELLS, _vgsl_efe8d35a__ANCHOR_FILL, _vgsl_efe8d35a__ANCHOR_PEAK, _vgsl_efe8d35a__ANCHOR_RADIUS, sky, prefilter),
    sky, prefilter,
  ) + _vgsl_efe8d35a__starSpecies(
    face, 71,
    _vgsl_efe8d35a__resolveSpecies(_vgsl_efe8d35a__FIELD_CELLS, _vgsl_efe8d35a__FIELD_FILL, _vgsl_efe8d35a__FIELD_PEAK, _vgsl_efe8d35a__FIELD_RADIUS, sky, prefilter),
    sky, prefilter,
  ) + _vgsl_efe8d35a__starSpecies(
    face, 149,
    _vgsl_efe8d35a__resolveSpecies(_vgsl_efe8d35a__DUST_CELLS, _vgsl_efe8d35a__DUST_FILL, _vgsl_efe8d35a__DUST_PEAK, _vgsl_efe8d35a__DUST_RADIUS, sky, prefilter),
    sky, prefilter,
  );
}

// vgsl-module: C:\\Users\\pranj\\Documents\\Codex\\2026-10-04\\upgrade-goal-premium-interactive-3d-motion\\work\\portfolio-push\\node_modules\\@vgpu\\wgsl-std\\src\\hash\\index.wgsl
// Wellons lowbias32: https://github.com/skeeto/hash-prospector
 

 

 fn _vgsl_4802ec39__pcg3d(value: vec3u) -> vec3u {
  var hashed = value * 1664525u + 1013904223u;
  hashed.x = hashed.x + hashed.y * hashed.z;
  hashed.y = hashed.y + hashed.z * hashed.x;
  hashed.z = hashed.z + hashed.x * hashed.y;
  hashed = hashed ^ (hashed >> vec3u(16u));
  hashed.x = hashed.x + hashed.y * hashed.z;
  hashed.y = hashed.y + hashed.z * hashed.x;
  hashed.z = hashed.z + hashed.x * hashed.y;
  hashed = hashed ^ (hashed >> vec3u(16u));
  return hashed;
}

 fn _vgsl_4802ec39__unitFloat(hash: u32) -> f32 {
  return f32(hash >> 8u) * (1.0 / 16777216.0);
}

 

 

 
`,functionExports:[{name:"decodeGBuffer",resolvedName:"_vgsl_1a2474de__decodeGBuffer",parameterNames:["hit1","hit2","sky","view","diskOuter","aa","aaGeom"]},{name:"sampleAtRadius",resolvedName:"_vgsl_1a2474de__sampleAtRadius",parameterNames:["g","radius","diskOuter"]},{name:"shadeDisk",resolvedName:"_vgsl_502f0163__shadeDisk",parameterNames:["g","look","time","footprint","noiseTex","noiseSampler"]},{name:"shadeStars",resolvedName:"_vgsl_efe8d35a__shadeStars",parameterNames:["direction","look","time","ddx","ddy"]},{name:"pcg3d",resolvedName:"_vgsl_4802ec39__pcg3d",parameterNames:["value"]},{name:"unitFloat",resolvedName:"_vgsl_4802ec39__unitFloat",parameterNames:["hash"]}]},De=["rg32float","rg32float","rgba16float","rgba16float"],Oe=["rg8unorm","rgba16float"],g=[0,0,0,1];function Ie(e,n){const a=e.sampler(n,{minFilter:"linear",magFilter:"linear"}),s=Re(e,n);return{bake:e.effect(n,ue,{label:"optimized-black-hole-bake"}),refine:e.effect(n,Ae,{label:"optimized-black-hole-refine"}),shade:e.effect(n,Pe,{label:"optimized-black-hole-shade"}),bloomExtract:e.effect(n,b),bloomBlurH0:e.effect(n,b),bloomBlurV0:e.effect(n,b),bloomDown1:e.effect(n,b),bloomBlurH1:e.effect(n,b),bloomBlurV1:e.effect(n,b),bloomDown2:e.effect(n,b),bloomBlurH2:e.effect(n,b),bloomBlurV2:e.effect(n,b),composite:e.effect(n,ve),postSampler:a,noiseSampler:s,noiseVolume:we(n,se)}}function Q(e,n,a){const s=Le(a),o=H(s,2),t=H(s,4),d=H(s,8),r=_=>e.target(n,{size:_,colors:[{format:"rgba16float"}]}),f=[],i=_=>(f.push(_),_);try{return{gbuffer:i(e.target(n,{size:s,colors:De.map(_=>({format:_}))})),aa:i(e.target(n,{size:s,colors:Oe.map(_=>({format:_}))})),scene:i(r(s)),bloom0:i(r(o)),bloomPing0:i(r(o)),bloom1:i(r(t)),bloomPing1:i(r(t)),bloom2:i(r(d)),bloomPing2:i(r(d))}}catch(_){try{oe(f.reverse())}catch{}throw _}}function $(e){oe([e.gbuffer,e.aa,e.scene,e.bloom0,e.bloomPing0,e.bloom1,e.bloomPing1,e.bloom2,e.bloomPing2])}function oe(e){let n=!1,a;for(const s of e)try{Fe(s)}catch(o){n||(a=o),n=!0}if(n)throw a}function Fe(e){e?.destroy?.()}function ee(e,n){const[a,s,o,t]=n.gbuffer.colors,[d,r]=n.aa.colors;e.bake.set({bake:{resolution:n.gbuffer.size}}),e.refine.set({gHit1:a,gSky:o,refine:{resolution:n.gbuffer.size}}),e.shade.set({gHit1:a,gHit2:s,gSky:o,gView:t,gAa:d,gAaGeom:r,noiseVolume:e.noiseVolume,noiseSampler:e.noiseSampler,shade:{resolution:n.gbuffer.size}});const f=n.scene.colors[0],i=n.bloom0.colors[0],_=n.bloomPing0.colors[0],m=n.bloom1.colors[0],v=n.bloomPing1.colors[0],y=n.bloom2.colors[0],x=n.bloomPing2.colors[0];e.bloomExtract.set({source:f,linearSampler:e.postSampler}),e.bloomBlurH0.set({source:i,linearSampler:e.postSampler}),e.bloomBlurV0.set({source:_,linearSampler:e.postSampler}),e.bloomDown1.set({source:i,linearSampler:e.postSampler}),e.bloomBlurH1.set({source:m,linearSampler:e.postSampler}),e.bloomBlurV1.set({source:v,linearSampler:e.postSampler}),e.bloomDown2.set({source:m,linearSampler:e.postSampler}),e.bloomBlurH2.set({source:y,linearSampler:e.postSampler}),e.bloomBlurV2.set({source:x,linearSampler:e.postSampler}),e.composite.set({scene:f,bloomNear:i,bloomMedium:m,bloomFar:y,linearSampler:e.postSampler})}function ne(e,n,a){const s={resolution:n.gbuffer.size,yaw:0,pitch:a.cameraY,orbitRadius:a.distance,diskOuter:a.diskRadius,fov:a.fov,centerX:a.centerX,centerY:a.centerY,roll:a.cameraRoll};e.bake.set({bake:s}),e.refine.set({refine:s})}function ae(e,n,a,s,o){e.shade.set({shade:{resolution:n.gbuffer.size,time:s,diskOuter:a.diskRadius,sceneYaw:o,centerFade:a.centerFade},disk:a.disk,stars:a.stars})}function te(e,n,a){const s=Math.max(0,a.bloom.threshold),o=Math.max(1e-4,a.bloom.knee),t=Math.max(.1,a.bloom.radius),d=(f,i)=>({sourceSize:f,direction:[0,0],params:[i?s:-1,o,t,0]}),r=(f,i,_)=>({sourceSize:f,direction:[i,_],params:[-1,o,t,1]});e.bloomExtract.set({bloom:d(n.scene.size,!0)}),e.bloomBlurH0.set({bloom:r(n.bloom0.size,1,0)}),e.bloomBlurV0.set({bloom:r(n.bloomPing0.size,0,1)}),e.bloomDown1.set({bloom:d(n.bloom0.size,!1)}),e.bloomBlurH1.set({bloom:r(n.bloom1.size,1,0)}),e.bloomBlurV1.set({bloom:r(n.bloomPing1.size,0,1)}),e.bloomDown2.set({bloom:d(n.bloom1.size,!1)}),e.bloomBlurH2.set({bloom:r(n.bloom2.size,1,0)}),e.bloomBlurV2.set({bloom:r(n.bloomPing2.size,0,1)}),e.composite.set({composite:{params:[Math.max(0,a.bloom.strength),0,0,0]}})}async function Ee(e,n,a,s){const o={colors:[n.bloom0.format]};let t=0;await Promise.all([e.bake.compile(n.gbuffer),e.refine.compile(n.aa),e.shade.compile(n.scene),e.bloomExtract.compile(o),e.bloomBlurH0.compile(o),e.bloomBlurV0.compile(o),e.bloomDown1.compile(o),e.bloomBlurH1.compile(o),e.bloomBlurV1.compile(o),e.bloomDown2.compile(o),e.bloomBlurH2.compile(o),e.bloomBlurV2.compile(o),e.composite.compile({colors:[a.format]})].map(d=>d.then(()=>s?.(++t,13))))}function Ce(e,n,a,s,o){o&&(e.pass({target:a.gbuffer,clear:g},t=>t.draw(n.bake)),e.pass({target:a.aa,clear:g},t=>t.draw(n.refine))),e.pass({target:a.scene,clear:g},t=>t.draw(n.shade)),e.pass({target:a.bloom0,clear:g},t=>t.draw(n.bloomExtract)),e.pass({target:a.bloomPing0,clear:g},t=>t.draw(n.bloomBlurH0)),e.pass({target:a.bloom0,clear:g},t=>t.draw(n.bloomBlurV0)),e.pass({target:a.bloom1,clear:g},t=>t.draw(n.bloomDown1)),e.pass({target:a.bloomPing1,clear:g},t=>t.draw(n.bloomBlurH1)),e.pass({target:a.bloom1,clear:g},t=>t.draw(n.bloomBlurV1)),e.pass({target:a.bloom2,clear:g},t=>t.draw(n.bloomDown2)),e.pass({target:a.bloomPing2,clear:g},t=>t.draw(n.bloomBlurH2)),e.pass({target:a.bloom2,clear:g},t=>t.draw(n.bloomBlurV2)),e.pass({target:s,clear:g},t=>t.draw(n.composite))}function Le(e){return[Math.max(1,Math.floor(e[0])),Math.max(1,Math.floor(e[1]))]}function H(e,n){return[Math.max(1,Math.floor(e[0]/n)),Math.max(1,Math.floor(e[1]/n))]}function Te(){return{cameraY:.16,distance:13.5,diskRadius:9,fov:3,centerX:.8,centerY:.3,cameraRoll:-.27,mouseYaw:.15,centerFade:0,bloom:{strength:1,threshold:0,knee:.18,radius:1.5},disk:{brightness:.75,speed:.75,stretch:5.75,detail:3.44,turbulence:4.46,density:1.38,doppler:1.21,cloudScale:20,cloudSpeed:.3,cloudStrength:.2,spare0:.43,spare1:-.25,spare2:-.67,spare3:.69},stars:{brightness:1,density:1,contrast:13,warmth:.5,twinkle:0}}}const ze=.325,Ne=.1,Be=60,Me=2,He=1e3/Be-Me,Ue="(max-width: 767px)";function Xe({canvas:e,onProgress:n}){const a=Te(),s={centerX:a.centerX,centerY:a.centerY,cameraRoll:a.cameraRoll,mouseYaw:a.mouseYaw,centerFade:a.centerFade},o=window.matchMedia(Ue),t=()=>{Object.assign(a,o.matches?{centerX:.35,centerY:.1,cameraRoll:-.27,mouseYaw:0,centerFade:0}:s)};t();const d=Math.min(Math.max(window.devicePixelRatio,1),2)/2;a.bloom.radius*=d,a.bloom.strength*=d;let r=!1,f,i,_,m,v,y,x,I,F=typeof document>"u"?!0:!document.hidden,E=!0,U=!1,C=0,R,S=0,L,A=!0,T=0,k=0,w;const V=()=>{t(),A=!0};o.addEventListener("change",V);const G=l=>{if(l.pointerType!=="mouse")return;const p=Math.max(window.innerWidth,1);T=Math.min(1,Math.max(-1,l.clientX/p*2-1))},P=()=>{T=0},Y=l=>{l.relatedTarget===null&&P()},X=()=>{document.hidden&&P(),F=!document.hidden,z()};function z(){if(!U||!i||!f)return;const l=!r&&F&&E;l!==!!y&&(l?(R=void 0,w=void 0,y=le(f,i)):(y?.stop(),y=void 0))}function le(l,p){let u=!1,h;const D=Z=>{if(!u){if(h===void 0||Z-h>=He){h=Z;try{l.frame(p,j)}catch(fe){N(fe)}}u||(K=requestAnimationFrame(D))}};let K=requestAnimationFrame(D);return{stop(){u=!0,cancelAnimationFrame(K)}}}const re=l=>(C+=R===void 0?0:Math.max(0,(l-R)/1e3),R=l,C),j=l=>{if(r||!m||!v||!_)return;const p=Ve(),u=A;A=!1,u&&ne(m,v,a),ae(m,v,a,re(p),ie(p)),Ce(l,m,v,_,u)},ie=l=>{if(a.mouseYaw<=0)return k=0,w=l,0;const p=w===void 0?0:Math.min(Math.max((l-w)/1e3,0),Ne);w=l;const u=T*Math.max(0,a.mouseYaw);return k+=(u-k)*(1-Math.exp(-p/ze)),k},_e=()=>{S=0;const l=L;if(L=void 0,!(r||!l||!i||!f||!m||!v||!_))try{const p=v,u=Q(f,i,[Math.max(1,Math.round(l.width)),Math.max(1,Math.round(l.height))]);try{ee(m,u),te(m,u,a)}catch(h){throw $(u),h}v=u,$(p),A=!0}catch(p){N(p)}},ce=l=>{r||l.width<=0||l.height<=0||(L=l,S||(S=requestAnimationFrame(_e)))},W=()=>{ce({width:e.clientWidth,height:e.clientHeight})},q=()=>{r||(r=!0,y?.stop(),S&&cancelAnimationFrame(S),x?.disconnect(),I?.disconnect(),typeof window<"u"&&(o.removeEventListener("change",V),window.removeEventListener("pointermove",G),window.removeEventListener("pointerout",Y),window.removeEventListener("blur",P),document.removeEventListener("visibilitychange",X)),i?.dispose())},de=async()=>{n?.(10);const l=await me(()=>import("./index-BZUyrK5m.js"),[]);n?.(20);const{init:p}=l;if(r)return;const u=await p();if(r){u.dispose();return}n?.(35),i=u,f=l,_=l.surface(i,e,{dpr:1}),m=Ie(l,i),v=Q(l,i,_.size),ne(m,v,a),ae(m,v,a,C,k),ee(m,v),te(m,v,a),n?.(40),await Ee(m,v,_,(h,D)=>{r||n?.(40+Math.round(h/D*55))}),!r&&(x=typeof ResizeObserver>"u"?void 0:new ResizeObserver(W),x?.observe(e),window.addEventListener("pointermove",G,{passive:!0}),window.addEventListener("pointerout",Y,{passive:!0}),window.addEventListener("blur",P),document.addEventListener("visibilitychange",X),typeof IntersectionObserver<"u"&&(I=new IntersectionObserver(h=>{E=h[h.length-1]?.isIntersecting??E,z()},{threshold:0}),I.observe(e)),W(),l.frame(i,j),n?.(100),U=!0,F=!document.hidden,z())};function N(l){throw q(),l}return{ready:de().catch(l=>{r||N(l)}),dispose:q}}function Ve(){return typeof performance>"u"?Date.now():performance.now()}export{Xe as createRenderer};
