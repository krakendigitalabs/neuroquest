'use client';

import { useEffect, useRef } from 'react';

const vertexShaderSource = `
attribute vec3 position;
attribute vec3 normal;

uniform float uTime;
uniform float uHover;
uniform vec2 uPointer;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

vec4 permute(vec4 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod(i, 289.0);
  vec4 p = permute(
    permute(
      permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0)
    )
    + i.x + vec4(0.0, i1.x, i2.x, 1.0)
  );

  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

mat3 rotationY(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat3(
    c, 0.0, -s,
    0.0, 1.0, 0.0,
    s, 0.0, c
  );
}

mat3 rotationX(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat3(
    1.0, 0.0, 0.0,
    0.0, c, s,
    0.0, -s, c
  );
}

void main() {
  vec3 basePosition = position;
  vec3 baseNormal = normal;

  float largeWave = snoise(basePosition * 1.8 + vec3(0.0, 0.0, uTime * 0.16)) * 0.18;
  float detailWave = snoise(basePosition * 3.6 - vec3(0.0, 0.0, uTime * 0.11)) * 0.06;
  float displacement = (largeWave + detailWave) * (0.95 + uHover * 0.55);

  vec3 displaced = basePosition + baseNormal * displacement;

  float rotateYAmount = uTime * 0.22 + uPointer.x * 0.18;
  float rotateXAmount = 0.35 + sin(uTime * 0.15) * 0.08 + uPointer.y * 0.12;

  mat3 rotation = rotationY(rotateYAmount) * rotationX(rotateXAmount);

  vec3 rotatedPosition = rotation * displaced;
  vec3 rotatedNormal = normalize(rotation * (baseNormal + vec3(displacement * 0.4)));

  float depth = rotatedPosition.z + 2.8;
  vec2 projected = rotatedPosition.xy / depth;
  gl_Position = vec4(projected * 1.75, 0.0, 1.0);

  vNormal = rotatedNormal;
  vPosition = rotatedPosition;
  vDisplacement = displacement;
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform float uHover;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vec3(0.1, 0.2, 1.0));
  vec3 lightDir = normalize(vec3(-0.35, 0.75, 0.9));
  vec3 rimDir = normalize(vec3(0.55, -0.3, 0.7));

  float diffuse = max(dot(normal, lightDir), 0.0);
  float rim = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.4);
  float sparkle = pow(max(dot(reflect(-lightDir, normal), viewDir), 0.0), 18.0);
  float env = max(dot(normal, rimDir), 0.0);

  vec3 cyan = vec3(0.41, 0.86, 0.98);
  vec3 blue = vec3(0.15, 0.47, 0.92);
  vec3 deep = vec3(0.04, 0.18, 0.43);
  vec3 sheen = vec3(0.9, 0.98, 1.0);

  float verticalMix = clamp(vPosition.y * 0.65 + 0.5, 0.0, 1.0);
  float depthMix = clamp(vPosition.z * 0.4 + 0.5, 0.0, 1.0);

  vec3 color = mix(blue, cyan, verticalMix);
  color = mix(color, deep, 1.0 - depthMix);
  color += diffuse * vec3(0.08, 0.12, 0.16);
  color += env * vec3(0.08, 0.11, 0.18);
  color += rim * vec3(0.22, 0.28, 0.34);
  color += sparkle * sheen * (0.65 + uHover * 0.15);
  color += abs(vDisplacement) * vec3(0.04, 0.06, 0.08);

  gl_FragColor = vec4(color, 1.0);
}
`;

type GeometryData = {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint16Array;
};

function createSphereGeometry(latitudeBands = 72, longitudeBands = 72): GeometryData {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  for (let lat = 0; lat <= latitudeBands; lat += 1) {
    const theta = (lat * Math.PI) / latitudeBands;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let lon = 0; lon <= longitudeBands; lon += 1) {
      const phi = (lon * Math.PI * 2) / longitudeBands;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      const x = cosPhi * sinTheta;
      const y = cosTheta;
      const z = sinPhi * sinTheta;

      positions.push(x, y, z);
      normals.push(x, y, z);
    }
  }

  for (let lat = 0; lat < latitudeBands; lat += 1) {
    for (let lon = 0; lon < longitudeBands; lon += 1) {
      const first = lat * (longitudeBands + 1) + lon;
      const second = first + longitudeBands + 1;

      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
  };
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('Could not create shader.');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(info || 'Shader compilation failed.');
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = gl.createProgram();

  if (!program) {
    throw new Error('Could not create WebGL program.');
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(info || 'Program linking failed.');
  }

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
}

export function InteractiveBlobLogo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true });
    if (!gl) return;

    const program = createProgram(gl);
    const geometry = createSphereGeometry();

    const positionBuffer = gl.createBuffer();
    const normalBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();

    if (!positionBuffer || !normalBuffer || !indexBuffer) {
      return;
    }

    const positionLocation = gl.getAttribLocation(program, 'position');
    const normalLocation = gl.getAttribLocation(program, 'normal');
    const timeLocation = gl.getUniformLocation(program, 'uTime');
    const hoverLocation = gl.getUniformLocation(program, 'uHover');
    const pointerLocation = gl.getUniformLocation(program, 'uPointer');

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, geometry.positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);

    const pointer = { x: 0, y: 0 };
    let hover = 0;
    let targetHover = 0;
    let animationFrame = 0;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(bounds.width * dpr));
      canvas.height = Math.max(1, Math.floor(bounds.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const render = (time: number) => {
      hover += (targetHover - hover) * 0.07;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK);

      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.enableVertexAttribArray(normalLocation);
      gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

      gl.uniform1f(timeLocation, time * 0.001);
      gl.uniform1f(hoverLocation, hover);
      gl.uniform2f(pointerLocation, pointer.x, pointer.y);

      gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0);

      animationFrame = window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      pointer.x = (x - 0.5) * 2.0;
      pointer.y = (0.5 - y) * 2.0;
    };

    const handlePointerEnter = () => {
      targetHover = 1;
    };

    const handlePointerLeave = () => {
      targetHover = 0;
      pointer.x = 0;
      pointer.y = 0;
    };

    resize();
    animationFrame = window.requestAnimationFrame(render);

    window.addEventListener('resize', resize);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerenter', handlePointerEnter);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerenter', handlePointerEnter);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(normalBuffer);
      gl.deleteBuffer(indexBuffer);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.72),rgba(255,255,255,0.32))] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-8 top-4 h-16 rounded-full bg-[radial-gradient(circle,rgba(125,211,252,0.25),transparent_72%)] blur-2xl" />
      <canvas ref={canvasRef} className="relative z-10 h-[220px] w-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}
