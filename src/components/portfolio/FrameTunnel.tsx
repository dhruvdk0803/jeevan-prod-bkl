"use client";

import { useEffect, useRef, useState } from "react";
import type { PortfolioImage } from "@/content/portfolio";
import { portfolioSrc } from "@/content/portfolio";

/**
 * The opening: a WebGL corridor of JP's frames that the camera flies through
 * as you scroll.
 *
 * - The section is tall (see `SCROLL_VH`); a sticky full-viewport stage holds
 *   the canvas. Scroll progress through the section drives the camera's depth,
 *   smoothed with a critically-damped lerp, so it feels like a dolly move.
 * - Frames sit on a golden-angle spiral around the camera path. Their shader
 *   bends them along the direction of travel and splits RGB with velocity —
 *   motion blur you can feel, gone the moment you stop.
 * - Everything here is decorative (`aria-hidden`); the heading, copy and the
 *   frame counter live in normal DOM in <PortfolioHero>. With reduced motion
 *   or no WebGL, <PortfolioHero> renders a still mosaic instead and this never
 *   mounts.
 * - The render loop sleeps while the section is off-screen, and every GPU
 *   resource is disposed on unmount.
 */

type Props = {
  frames: Pick<PortfolioImage, "id" | "width" | "height" | "color">[];
  /** Section whose scroll progress (0→1) drives the camera. */
  sectionRef: React.RefObject<HTMLElement | null>;
  /** Called with the index of the frame nearest the camera, for the counter. */
  onFrame?: (index: number, progress: number) => void;
  onReady?: () => void;
};

const SPACING = 3.1; // world units between consecutive frames along z
const RADIUS = 2.25;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

const VERT = /* glsl */ `
  uniform float uVelocity;
  uniform float uTime;
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vUv = uv;
    vec3 p = position;
    // Bend the plane along its width in the direction of travel.
    float bend = sin(uv.x * 3.14159) * uVelocity * 0.9;
    p.z -= bend;
    // A breath of drift so the corridor never feels frozen.
    p.y += sin(uTime * 0.6 + position.x * 1.5) * 0.02;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uImage;   // image aspect (w, h)
  uniform vec2 uPlane;   // plane aspect (w, h)
  uniform float uVelocity;
  uniform float uReveal; // 0 → 1 as the texture arrives
  uniform vec3 uTint;    // dominant colour, shown before the texture loads
  uniform vec3 uFog;
  varying vec2 vUv;
  varying float vDepth;

  vec2 coverUv(vec2 uv) {
    float ri = uImage.x / uImage.y;
    float rp = uPlane.x / uPlane.y;
    vec2 scale = ri > rp ? vec2(rp / ri, 1.0) : vec2(1.0, ri / rp);
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    vec2 uv = coverUv(vUv);
    float shift = clamp(abs(uVelocity), 0.0, 1.0) * 0.018;
    vec3 col;
    col.r = texture2D(uMap, uv + vec2(shift, 0.0)).r;
    col.g = texture2D(uMap, uv).g;
    col.b = texture2D(uMap, uv - vec2(shift, 0.0)).b;
    col = mix(uTint, col, uReveal);

    // Film-like vignette inside each frame.
    float v = smoothstep(0.95, 0.35, distance(vUv, vec2(0.5)));
    col *= mix(0.78, 1.0, v);

    // Depth fog into the page's ink, and a soft fade as a frame passes the lens.
    float fog = smoothstep(13.0, 42.0, vDepth);
    float near = smoothstep(0.3, 1.6, vDepth);
    col = mix(col, uFog, fog);
    gl_FragColor = vec4(col, near);
  }
`;

export function FrameTunnel({ frames, sectionRef, onFrame, onReady }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    const section = sectionRef.current;
    if (!mount || !section) return;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
      } catch {
        setFailed(true);
        return;
      }

      const ink = new THREE.Color("#131319");
      renderer.setClearColor(ink, 1);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      mount.appendChild(renderer.domElement);
      renderer.domElement.setAttribute("aria-hidden", "true");

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 80);

      const loader = new THREE.TextureLoader();
      const geometry = new THREE.PlaneGeometry(1, 1, 24, 1);
      const materials: import("three").ShaderMaterial[] = [];
      const textures: import("three").Texture[] = [];
      const meshes: import("three").Mesh[] = [];

      frames.forEach((f, i) => {
        const aspect = f.width / f.height;
        // Portraits a touch taller, landscapes a touch wider — never distorted.
        const h = aspect >= 1 ? 1.35 : 1.75;
        const w = h * aspect;
        const mat = new THREE.ShaderMaterial({
          vertexShader: VERT,
          fragmentShader: FRAG,
          transparent: true,
          depthWrite: false,
          uniforms: {
            uMap: { value: null },
            uImage: { value: new THREE.Vector2(f.width, f.height) },
            uPlane: { value: new THREE.Vector2(w, h) },
            uVelocity: { value: 0 },
            uTime: { value: 0 },
            uReveal: { value: 0 },
            uTint: { value: new THREE.Color(f.color) },
            uFog: { value: ink },
          },
        });
        const mesh = new THREE.Mesh(geometry, mat);
        mesh.scale.set(w, h, 1);
        const a = i * GOLDEN;
        const r = RADIUS * (0.82 + ((i * 37) % 11) / 30);
        mesh.position.set(Math.cos(a) * r * 1.2, Math.sin(a) * r * 0.78, -i * SPACING);
        // Frames turn slightly toward the path, like pages fanned open.
        mesh.rotation.y = -Math.cos(a) * 0.35;
        mesh.rotation.x = Math.sin(a) * 0.18;
        scene.add(mesh);
        meshes.push(mesh);
        materials.push(mat);

        loader.load(portfolioSrc(f.id, "sm"), (tex) => {
          if (disposed) return tex.dispose();
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          textures.push(tex);
          mat.uniforms.uMap.value = tex;
          mat.userData.revealAt = performance.now();
        });
      });

      const pathLength = (frames.length - 1) * SPACING;

      /* ---- size ---- */
      const resize = () => {
        const { clientWidth: w, clientHeight: h } = mount;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // Pull the lens wider on tall phones so frames still read as a corridor.
        camera.fov = w / h < 0.8 ? 72 : 55;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(mount);

      /* ---- input ---- */
      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      const onPointer = (e: PointerEvent) => {
        pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", onPointer, { passive: true });

      /* ---- visibility: sleep off-screen ---- */
      let visible = true;
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
      });
      io.observe(section);

      /* ---- loop ---- */
      let raf = 0;
      let z = 0;
      let lastZ = 0;
      let velocity = 0;
      const t0 = performance.now();
      let readySent = false;

      const progressOf = () => {
        const rect = section.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        return total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      };

      const tick = () => {
        raf = 0;
        if (disposed || !visible) return;

        const p = progressOf();
        const targetZ = 3.2 - p * (pathLength + 1.5);
        z += (targetZ - z) * 0.085;
        const dz = z - lastZ;
        lastZ = z;
        velocity += (Math.max(-1, Math.min(1, dz * 1.6)) - velocity) * 0.18;

        pointer.x += (pointer.tx - pointer.x) * 0.05;
        pointer.y += (pointer.ty - pointer.y) * 0.05;

        camera.position.set(pointer.x * 0.55, -pointer.y * 0.35, z);
        camera.rotation.set(pointer.y * 0.05, -pointer.x * 0.08, velocity * 0.12);

        const now = performance.now();
        const time = (now - t0) / 1000;
        for (const m of materials) {
          m.uniforms.uVelocity.value = velocity;
          m.uniforms.uTime.value = time;
          const at = m.userData.revealAt as number | undefined;
          if (at !== undefined) m.uniforms.uReveal.value = Math.min(1, (now - at) / 700);
        }

        renderer.render(scene, camera);

        if (!readySent) {
          readySent = true;
          onReady?.();
        }

        // Called every frame (progress moves continuously); the parent writes
        // straight to the DOM rather than setting React state.
        const nearest = Math.max(0, Math.min(frames.length - 1, Math.round((3.2 - z - 2) / SPACING)));
        onFrame?.(nearest, p);

        start();
      };
      const start = () => {
        if (!raf && visible && !disposed) raf = requestAnimationFrame(tick);
      };
      start();

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("pointermove", onPointer);
        meshes.forEach((m) => scene.remove(m));
        geometry.dispose();
        materials.forEach((m) => m.dispose());
        textures.forEach((t) => t.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [frames, sectionRef, onFrame, onReady]);

  if (failed) return null;
  return <div ref={mountRef} className="absolute inset-0 [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full" />;
}
