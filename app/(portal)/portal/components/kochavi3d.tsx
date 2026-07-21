'use client';

/**
 * כוכבי 3D — real WebGL version of the mascot (three.js).
 *
 * A polished metallic gold star with true depth: extruded + beveled geometry,
 * environment lighting, 3D eyes/smile, and the side points as rigged arms.
 * Motion is ORGANIC, not looped: layered sine noise with per-instance random
 * phases, randomly-timed hops, blinks, glances and wave bursts — no two
 * seconds ever look identical, and no two Kochavis are ever in sync.
 *
 * three.js is imported dynamically inside the effect so it stays out of the
 * main bundle. Under prefers-reduced-motion a single static frame renders.
 */

import { useEffect, useRef } from 'react';
import type { KochaviAnim } from './kochavi';

interface Kochavi3DProps {
  size?: number;
  anim?: KochaviAnim;
  className?: string;
}

export function Kochavi3D({ size = 120, anim = 'idle', className }: Kochavi3DProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const animRef = useRef(anim);
  animRef.current = anim;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let raf = 0;
    let cleanup: (() => void) | null = null;

    (async () => {
      const THREE = await import('three');
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      if (disposed || !hostRef.current) return;

      // The canvas is much larger than the layout footprint, with transparent
      // margins all around — so a raised waving arm or a hop NEVER gets cut
      // by the canvas edge. The host div keeps the requested layout size.
      const CANVAS = Math.round(size * 1.8);
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(CANVAS, CANVAS);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      Object.assign(renderer.domElement.style, {
        position: 'absolute',
        width: `${CANVAS}px`,
        height: `${CANVAS}px`,
        left: '50%',
        top: '52%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      });
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
      camera.position.set(0, 0.1, 4.8);

      const key = new THREE.DirectionalLight(0xfff3d0, 2.2);
      key.position.set(2, 3, 4);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x9db4ff, 0.9);
      rim.position.set(-3, -1, -2);
      scene.add(rim);
      scene.add(new THREE.AmbientLight(0xffffff, 0.35));

      // ---- star geometry: body without side tips + two arm prisms ----
      const OUTER = 1.05;
      const INNER = 0.48;
      const pt = (deg: number, r: number): [number, number] => [
        Math.cos((deg * Math.PI) / 180) * r,
        Math.sin((deg * Math.PI) / 180) * r,
      ];
      // CCW: O90 I126 [O162=left arm] I198 O234 I270 O306 I342 [O18=right arm] I54
      const bodyPts: [number, number][] = [
        pt(90, OUTER), pt(126, INNER), pt(198, INNER), pt(234, OUTER),
        pt(270, INNER), pt(306, OUTER), pt(342, INNER), pt(54, INNER),
      ];
      const shapeFrom = (pts: [number, number][]) => {
        const s = new THREE.Shape();
        s.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
        s.closePath();
        return s;
      };
      const extrude = (shape: InstanceType<typeof THREE.Shape>, depth: number) =>
        new THREE.ExtrudeGeometry(shape, {
          depth,
          bevelEnabled: true,
          bevelThickness: 0.09,
          bevelSize: 0.07,
          bevelSegments: 3,
        }).translate(0, 0, -depth / 2);

      const gold = new THREE.MeshPhysicalMaterial({
        color: 0xdcb75f,
        metalness: 0.85,
        roughness: 0.28,
        clearcoat: 0.6,
        clearcoatRoughness: 0.3,
      });

      const root = new THREE.Group();
      scene.add(root);
      const star = new THREE.Group();
      root.add(star);

      const body = new THREE.Mesh(extrude(shapeFrom(bodyPts), 0.34), gold);
      star.add(body);

      // arms: triangles I342-O18-I54 (right) / I126-O162-I198 (left),
      // slightly thinner + tucked so they hide inside the body at rest
      const mkArm = (tris: [number, number][], pivotDeg: number) => {
        const pivot2 = pt(pivotDeg, INNER * 0.82);
        const shifted = tris.map(([x, y]) => [x - pivot2[0], y - pivot2[1]] as [number, number]);
        const mesh = new THREE.Mesh(extrude(shapeFrom(shifted), 0.28), gold);
        const g = new THREE.Group();
        g.position.set(pivot2[0], pivot2[1], 0);
        g.add(mesh);
        star.add(g);
        return g;
      };
      const armR = mkArm([pt(342, INNER), pt(18, OUTER), pt(54, INNER), pt(18, INNER * 0.55)], 18);
      const armL = mkArm([pt(126, INNER), pt(162, OUTER), pt(198, INNER), pt(162, INNER * 0.55)], 162);

      // ---- face (real 3D objects on the front face) ----
      const face = new THREE.Group();
      face.position.z = 0.34 / 2 + 0.09;
      star.add(face);
      const white = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const black = new THREE.MeshBasicMaterial({ color: 0x1d1704 });
      // Cute recipe: big flat oval whites (not bulging spheres), oversized
      // pupils with a sparkle highlight — friendly cartoon eyes, not fish eyes
      const mkEye = (x: number) => {
        const eye = new THREE.Group();
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.155, 20, 16), white);
        ball.scale.set(0.92, 1.05, 0.2);
        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 12), black);
        pupil.scale.z = 0.4;
        pupil.position.z = 0.035;
        const sparkle = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), white);
        sparkle.position.set(0.032, 0.034, 0.07);
        pupil.add(sparkle);
        eye.add(ball, pupil);
        eye.position.set(x, 0.1, 0);
        face.add(eye);
        return { eye, pupil };
      };
      const eyeL = mkEye(-0.27);
      const eyeR = mkEye(0.27);
      const smile = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.045, 10, 28, Math.PI * 0.75), black);
      smile.position.set(0, -0.13, 0.02);
      smile.rotation.z = Math.PI + (Math.PI * 0.25) / 2 + Math.PI * 0.0;
      face.add(smile);
      // surprised "O" mouth (hidden until the expression machine calls it)
      const oMouth = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.032, 10, 22), black);
      oMouth.position.set(0, -0.16, 0.02);
      oMouth.scale.setScalar(0.001);
      face.add(oMouth);
      // eyebrows — the soul of the face
      const mkBrow = (x: number) => {
        const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.017, 0.085, 3, 8), black);
        b.rotation.z = Math.PI / 2;
        b.position.set(x, 0.29, 0.02);
        face.add(b);
        return b;
      };
      const browL = mkBrow(-0.27);
      const browR = mkBrow(0.27);
      const cheekMat = new THREE.MeshBasicMaterial({ color: 0xd98a6a, transparent: true, opacity: 0.5 });
      const mkCheek = (x: number) => {
        const c = new THREE.Mesh(new THREE.CircleGeometry(0.075, 16), cheekMat);
        c.position.set(x, -0.09, 0.01);
        face.add(c);
      };
      mkCheek(-0.43);
      mkCheek(0.43);

      // ---- soft ground shadow (radial gradient sprite) ----
      const shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = shadowCanvas.height = 128;
      const sctx = shadowCanvas.getContext('2d')!;
      const grad = sctx.createRadialGradient(64, 64, 6, 64, 64, 62);
      grad.addColorStop(0, 'rgba(0,0,0,.5)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 128, 128);
      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(1.9, 0.55),
        new THREE.MeshBasicMaterial({
          map: new THREE.CanvasTexture(shadowCanvas),
          transparent: true,
          depthWrite: false,
        }),
      );
      shadow.position.y = -1.42;
      root.add(shadow);

      // Star fills ~the layout footprint; the rest of the canvas is headroom.
      root.scale.setScalar(0.58);

      // ---- organic motion brain: layered noise + randomly-timed impulses ----
      const rnd = (a: number, b: number) => a + Math.random() * (b - a);
      const phase = [rnd(0, 6.3), rnd(0, 6.3), rnd(0, 6.3), rnd(0, 6.3)];
      let nextHop = rnd(2, 6);
      let hopT = -1;
      let nextBlink = rnd(1, 4);
      let blinkT = -1;
      let nextGlance = rnd(2, 5);
      let glance = { x: 0, y: 0 };
      let glanceTarget = { x: 0, y: 0 };
      let nextWave = rnd(4, 10);
      let waveT = -1;

      // expression machine: random moods with eased transitions — his face
      // keeps changing like a living creature, never one frozen smile
      type Expr = { browY: number; tiltL: number; tiltR: number; smile: number; o: number; squint: number };
      const EXPRESSIONS: Record<string, Expr> = {
        neutral: { browY: 0, tiltL: 0, tiltR: 0, smile: 1, o: 0, squint: 0 },
        happy: { browY: 0.025, tiltL: 0.12, tiltR: -0.12, smile: 1.32, o: 0, squint: 0.18 },
        curious: { browY: 0.05, tiltL: 0.35, tiltR: -0.05, smile: 0.8, o: 0, squint: 0 },
        surprised: { browY: 0.08, tiltL: 0.05, tiltR: -0.05, smile: 0.2, o: 1, squint: 0 },
        laugh: { browY: 0.03, tiltL: 0.18, tiltR: -0.18, smile: 1.4, o: 0, squint: 0.5 },
      };
      const exprKeys = ['neutral', 'happy', 'curious', 'surprised', 'laugh'];
      const exprWeights = [0.3, 0.28, 0.18, 0.1, 0.14];
      const pickExpr = () => {
        let r = Math.random();
        for (let i = 0; i < exprKeys.length; i++) {
          if ((r -= exprWeights[i]) <= 0) return exprKeys[i];
        }
        return 'neutral';
      };
      const cur: Expr = { ...EXPRESSIONS.neutral };
      let target: Expr = EXPRESSIONS.happy;
      let nextExpr = rnd(1.5, 3);

      const clock = new THREE.Clock();
      let t = 0;

      // Perf: render at ~30fps, and stop entirely while offscreen or when the
      // tab is hidden — a mascot must never be the reason the portal drags.
      let visible = true;
      const vio = new IntersectionObserver(
        (entries) => {
          visible = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0.01 },
      );
      vio.observe(host);
      const FRAME_MS = 1000 / 30;
      let lastRender = 0;

      const frame = () => {
        if (!visible || document.hidden) {
          clock.getDelta(); // keep dt sane across the pause
          raf = requestAnimationFrame(frame);
          return;
        }
        const now = performance.now();
        if (now - lastRender < FRAME_MS) {
          raf = requestAnimationFrame(frame);
          return;
        }
        lastRender = now;
        const dt = Math.min(clock.getDelta(), 0.05);
        t += dt;
        const mode = animRef.current;

        // depth yaw + tilt — two incommensurate sines = never repeats
        star.rotation.y = 0.34 * Math.sin(t * 0.53 + phase[0]) + 0.12 * Math.sin(t * 1.31 + phase[1]);
        star.rotation.z = 0.05 * Math.sin(t * 0.71 + phase[2]);

        // bob + random hops
        let y = 0.06 * Math.sin(t * 1.1 + phase[3]);
        if (mode !== 'sleep' && t > nextHop && hopT < 0) {
          hopT = 0;
          nextHop = t + rnd(3.5, 9);
        }
        if (hopT >= 0) {
          hopT += dt;
          const d = 0.62;
          if (hopT >= d) hopT = -1;
          else y += 0.5 * Math.sin((hopT / d) * Math.PI);
        }
        if (mode === 'party') y += 0.35 * Math.abs(Math.sin(t * 5.2));
        star.position.y = y;
        shadow.scale.setScalar(1 - y * 0.35);
        (shadow.material as InstanceType<typeof THREE.MeshBasicMaterial>).opacity = 0.9 - y * 0.5;

        // arms: lazy sway + surprise wave bursts
        const sway = 0.1 * Math.sin(t * 0.9 + phase[1]);
        if (mode !== 'sleep' && mode !== 'party' && t > nextWave && waveT < 0) {
          waveT = 0;
          nextWave = t + rnd(6, 14);
        }
        let armRRot = sway;
        if (mode === 'wave') armRRot = 0.55 + 0.45 * Math.sin(t * 7);
        else if (waveT >= 0) {
          waveT += dt;
          const d = 1.6;
          if (waveT >= d) waveT = -1;
          else armRRot = Math.sin((waveT / d) * Math.PI) * (0.5 + 0.4 * Math.sin(waveT * 9));
        }
        if (mode === 'party') {
          armRRot = 0.7 + 0.3 * Math.sin(t * 6);
          armL.rotation.z = -0.7 - 0.3 * Math.sin(t * 6 + 0.5);
        } else {
          armL.rotation.z = -sway;
        }
        armR.rotation.z = armRRot;

        // expression machine — pick a new mood at random moments, ease into it
        if (t > nextExpr) {
          const name = mode === 'party' ? 'laugh' : mode === 'sleep' ? 'neutral' : pickExpr();
          target = EXPRESSIONS[name];
          // surprise is a quick reaction; other moods linger
          nextExpr = t + (name === 'surprised' ? rnd(0.7, 1.1) : rnd(2.2, 6.5));
        }
        const k = Math.min(1, dt * 6);
        cur.browY += (target.browY - cur.browY) * k;
        cur.tiltL += (target.tiltL - cur.tiltL) * k;
        cur.tiltR += (target.tiltR - cur.tiltR) * k;
        cur.smile += (target.smile - cur.smile) * k;
        cur.o += (target.o - cur.o) * k;
        cur.squint += (target.squint - cur.squint) * k;
        browL.position.y = 0.31 + cur.browY + (cur.tiltL > 0.2 ? 0.015 : 0);
        browR.position.y = 0.31 + cur.browY;
        browL.rotation.z = Math.PI / 2 + cur.tiltL;
        browR.rotation.z = Math.PI / 2 + cur.tiltR;
        smile.scale.setScalar(Math.max(0.001, cur.smile * (1 - cur.o)));
        oMouth.scale.setScalar(Math.max(0.001, cur.o));

        // blinks (random, sometimes double) + sleepy lids
        if (mode === 'sleep') {
          eyeL.eye.scale.y = eyeR.eye.scale.y = 0.12;
        } else {
          if (t > nextBlink && blinkT < 0) {
            blinkT = 0;
            nextBlink = t + (Math.random() < 0.25 ? rnd(0.25, 0.4) : rnd(2, 6));
          }
          let s = 1;
          if (blinkT >= 0) {
            blinkT += dt;
            const d = 0.16;
            if (blinkT >= d) blinkT = -1;
            else s = Math.max(0.08, Math.abs(Math.cos((blinkT / d) * Math.PI)));
          }
          // squint (laughing/beaming) narrows the eyes on top of blinking
          eyeL.eye.scale.y = eyeR.eye.scale.y = s * (1 - cur.squint * 0.6);
        }

        // wandering gaze
        if (t > nextGlance) {
          glanceTarget = { x: rnd(-0.05, 0.05), y: rnd(-0.03, 0.04) };
          nextGlance = t + rnd(1.5, 5);
        }
        glance.x += (glanceTarget.x - glance.x) * Math.min(1, dt * 6);
        glance.y += (glanceTarget.y - glance.y) * Math.min(1, dt * 6);
        eyeL.pupil.position.x = glance.x;
        eyeR.pupil.position.x = glance.x;
        eyeL.pupil.position.y = glance.y;
        eyeR.pupil.position.y = glance.y;

        // agreeing nod
        star.rotation.x = mode === 'nod' ? 0.1 + 0.08 * Math.sin(t * 2.4) : 0.04 * Math.sin(t * 0.62 + phase[2]);

        renderer.render(scene, camera);
        if (!reduced) raf = requestAnimationFrame(frame);
      };
      frame();

      cleanup = () => {
        cancelAnimationFrame(raf);
        vio.disconnect();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
    // size is stable per mount in practice; anim changes flow through animRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ width: size, height: size * 1.12, position: 'relative', overflow: 'visible' }}
      aria-hidden="true"
    />
  );
}
