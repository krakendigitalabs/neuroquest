'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, extend, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Environment, shaderMaterial } from '@react-three/drei';
import { Bloom, DepthOfField, EffectComposer } from '@react-three/postprocessing';

const BRAND_SYMBOL = 'https://res.cloudinary.com/dr50ioh9h/image/upload/v1774648742/simbolo_nq_okc053.png';

const BlobMaterial = shaderMaterial(
  {
    uTime: 0,
    uHover: 0,
    uPointer: new THREE.Vector2(0, 0),
    uColorA: new THREE.Color('#6bd7ff'),
    uColorB: new THREE.Color('#1f6be8'),
    uColorC: new THREE.Color('#102b63'),
  },
  `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying float vWave;

    uniform float uTime;
    uniform float uHover;
    uniform vec2 uPointer;

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

    void main() {
      vec3 displaced = position;
      float breathing = sin(uTime * 0.42) * 0.03;
      float waveA = snoise(position * 1.55 + vec3(0.0, 0.0, uTime * 0.12)) * 0.18;
      float waveB = snoise(position * 3.25 - vec3(0.0, 0.0, uTime * 0.08)) * 0.05;
      float pointerField = dot(normalize(position.xy + 0.0001), uPointer) * 0.04;
      float displacement = (waveA + waveB + breathing + pointerField) * (1.0 + uHover * 0.18);

      displaced += normal * displacement;

      vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
      vec4 mvPosition = viewMatrix * worldPosition;
      gl_Position = projectionMatrix * mvPosition;

      vNormal = normalize(normalMatrix * normal);
      vWorldPosition = worldPosition.xyz;
      vWave = displacement;
    }
  `,
  `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying float vWave;

    uniform float uHover;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      vec3 lightDir = normalize(vec3(-0.4, 0.8, 0.65));
      vec3 rimDir = normalize(vec3(0.45, -0.2, 1.0));

      float diffuse = max(dot(normal, lightDir), 0.0);
      float rim = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.2);
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.4);
      float verticalMix = clamp(vWorldPosition.y * 0.35 + 0.5, 0.0, 1.0);
      float depthMix = clamp(vWorldPosition.z * 0.28 + 0.5, 0.0, 1.0);

      vec3 color = mix(uColorB, uColorA, verticalMix);
      color = mix(color, uColorC, 1.0 - depthMix);
      color += diffuse * vec3(0.08, 0.12, 0.2);
      color += max(dot(normal, rimDir), 0.0) * vec3(0.06, 0.1, 0.16);
      color += rim * vec3(0.14, 0.2, 0.3);
      color += fresnel * vec3(0.18, 0.24, 0.36) * (0.8 + uHover * 0.12);
      color += abs(vWave) * vec3(0.12, 0.14, 0.18);

      gl_FragColor = vec4(color, 0.97);
    }
  `,
);

extend({ BlobMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    blobMaterial: {
      uTime?: number;
      uHover?: number;
      uPointer?: THREE.Vector2;
      uColorA?: THREE.Color;
      uColorB?: THREE.Color;
      uColorC?: THREE.Color;
      transparent?: boolean;
      roughness?: number;
      metalness?: number;
    };
  }
}

function supportsReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function useLowPowerMode() {
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px), (pointer: coarse)');
    const update = () => setLowPower(media.matches || supportsReducedMotion());
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return lowPower;
}

function BlobCore({ hover }: { hover: number }) {
  const materialRef = useRef<THREE.ShaderMaterial & {
    uTime: number;
    uHover: number;
    uPointer: THREE.Vector2;
  }>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();
  const lowPower = useLowPowerMode();
  const geometryArgs = lowPower ? [1, 96, 96] : [1, 160, 160];

  useFrame((state, delta) => {
    if (!materialRef.current || !meshRef.current) return;
    materialRef.current.uTime = state.clock.elapsedTime;
    materialRef.current.uHover = THREE.MathUtils.damp(materialRef.current.uHover, hover, 4, delta);
    materialRef.current.uPointer.lerp(new THREE.Vector2(pointer.x * 0.6, pointer.y * 0.4), 0.06);

    meshRef.current.rotation.y += delta * 0.14;
    meshRef.current.rotation.x = THREE.MathUtils.damp(meshRef.current.rotation.x, pointer.y * 0.12, 4, delta);
    meshRef.current.rotation.z = THREE.MathUtils.damp(meshRef.current.rotation.z, -pointer.x * 0.08, 4, delta);
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.55) * 0.05;
  });

  return (
    <mesh ref={meshRef} scale={1.4}>
      <sphereGeometry args={geometryArgs as [number, number, number]} />
      <blobMaterial ref={materialRef} transparent />
    </mesh>
  );
}

function BrandPlane() {
  const texture = useLoader(THREE.TextureLoader, BRAND_SYMBOL);
  const planeRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
  }, [texture]);

  useFrame((state) => {
    if (!planeRef.current) return;
    planeRef.current.position.y = 0.06 + Math.sin(state.clock.elapsedTime * 0.72) * 0.03;
    planeRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.28) * 0.08;
  });

  return (
    <mesh ref={planeRef} position={[0, 0.08, 1.5]} scale={[1.1, 1.1, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshPhysicalMaterial
        map={texture}
        transparent
        transmission={0.18}
        thickness={0.6}
        roughness={0.08}
        metalness={0.15}
        clearcoat={1}
        clearcoatRoughness={0.1}
        toneMapped={false}
      />
    </mesh>
  );
}

function OrbitingParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const lowPower = useLowPowerMode();

  const { positions, sizes } = useMemo(() => {
    const count = lowPower ? 84 : 144;
    const positionArray = new Float32Array(count * 3);
    const sizeArray = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      const radius = 2.1 + Math.random() * 1.25;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 2.4;
      positionArray[i * 3] = Math.cos(angle) * radius;
      positionArray[i * 3 + 1] = height;
      positionArray[i * 3 + 2] = Math.sin(angle) * radius;
      sizeArray[i] = 0.04 + Math.random() * 0.05;
    }

    return { positions: positionArray, sizes: sizeArray };
  }, [lowPower]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.04;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.08;
    pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.03;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        color="#9adfff"
        size={0.04}
        sizeAttenuation
        transparent
        opacity={0.38}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Scene({ hover }: { hover: number }) {
  return (
    <>
      <fog attach="fog" args={['#f7f9fc', 4.5, 8.5]} />
      <ambientLight intensity={0.75} color="#dff3ff" />
      <directionalLight position={[3.5, 4.2, 4.5]} intensity={2} color="#ffffff" />
      <directionalLight position={[-2.8, -1.4, 2.8]} intensity={0.6} color="#9cdfff" />
      <spotLight position={[0, 3.5, 2.5]} intensity={1.5} angle={0.4} penumbra={1} color="#f5fbff" />
      <BlobCore hover={hover} />
      <BrandPlane />
      <OrbitingParticles />
      <Environment preset="city" />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.34} luminanceSmoothing={0.42} />
        <DepthOfField focusDistance={0.018} focalLength={0.03} bokehScale={1.8} height={420} />
      </EffectComposer>
    </>
  );
}

function StaticFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] border border-white/55 bg-[radial-gradient(circle_at_25%_20%,rgba(107,215,255,0.24),transparent_24%),radial-gradient(circle_at_75%_22%,rgba(31,107,232,0.12),transparent_30%),linear-gradient(145deg,rgba(255,255,255,0.58),rgba(255,255,255,0.18))] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl">
      <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(107,215,255,0.48),rgba(31,107,232,0.32)_48%,rgba(16,43,99,0.18)_66%,transparent_72%)] blur-md" />
      <div className="absolute inset-x-[18%] top-[16%] h-32 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.42),transparent_72%)] blur-2xl" />
    </div>
  );
}

export function HeroNeuralCanvas() {
  const [hover, setHover] = useState(0);
  const lowPower = useLowPowerMode();

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden rounded-[2.5rem] border border-white/55 bg-[linear-gradient(145deg,rgba(255,255,255,0.56),rgba(255,255,255,0.18))] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl"
      onPointerEnter={() => setHover(1)}
      onPointerLeave={() => setHover(0)}
    >
      <div className="pointer-events-none absolute inset-x-[8%] top-[6%] h-28 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.38),transparent_70%)] blur-3xl" />
      {lowPower ? (
        <StaticFallback />
      ) : (
        <Canvas
          dpr={[1, 1.6]}
          camera={{ position: [0, 0, 4.2], fov: 34 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          className="h-full w-full"
        >
          <Scene hover={hover} />
        </Canvas>
      )}
    </div>
  );
}
