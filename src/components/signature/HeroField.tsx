"use client";

import { useEffect, useRef, useState } from "react";
import { FRAGMENT_SRC, VERTEX_SRC } from "./heroShader";
import Signature from "./Signature";
import { prefersReducedMotion, hasFinePointer } from "@/lib/gsapSetup";

/**
 * The hero background: a full-screen fragment shader.
 *
 * Rendered at a fraction of device resolution and upscaled by CSS. The image
 * is soft volume with no edges to alias, so the downscale is invisible — and
 * a full-screen fbm shader at DPR 2 is several million pixels of noise per
 * frame, which is the difference between comfortable and unusable on a phone.
 *
 * If WebGL is missing or the program fails to link, this falls back to the 2D
 * `hero` program rather than leaving a black rectangle. That path is easy to
 * forget and impossible to notice locally, so it is deliberately explicit.
 */
export default function HeroField({
  className = "",
  /** track the cursor; the About page uses this purely as a backdrop */
  interactive = true,
}: {
  className?: string;
  interactive?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) {
      setFailed(true);
      return;
    }

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compile(gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    const program = vs && fs ? gl.createProgram() : null;

    if (!vs || !fs || !program) {
      setFailed(true);
      return;
    }

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      setFailed(true);
      return;
    }
    gl.useProgram(program);

    // one triangle large enough to cover the clip space square, which avoids
    // the seam a two triangle quad puts down the diagonal
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uActive = gl.getUniformLocation(program, "u_active");

    const reduced = prefersReducedMotion();
    const wantsPointer = interactive && hasFinePointer() && !reduced;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      // a soft field does not need device pixels; half resolution is plenty
      const scale = Math.min(window.devicePixelRatio || 1, 2) * 0.55;
      const w = Math.max(1, Math.round(rect.width * scale));
      const h = Math.max(1, Math.round(rect.height * scale));
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };
    resize();

    // eased toward the raw target so the light has weight rather than snapping
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: 0, tActive: 0 };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = (e.clientX - rect.left) / rect.width;
      pointer.ty = 1 - (e.clientY - rect.top) / rect.height;
      pointer.tActive = 1;
    };
    const onLeave = () => {
      pointer.tActive = 0;
    };

    if (wantsPointer) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(
      (records) => {
        visible = records.some((r) => r.isIntersecting);
        if (visible && !raf && !reduced) raf = requestAnimationFrame(frame);
      },
      { rootMargin: "80px" },
    );
    io.observe(canvas);

    const start = performance.now();

    const draw = (seconds: number) => {
      gl.uniform1f(uTime, seconds);
      gl.uniform2f(uMouse, pointer.x, pointer.y);
      gl.uniform1f(uActive, pointer.active);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    function frame(now: number) {
      raf = 0;
      if (!visible) return;
      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;
      pointer.active += (pointer.tActive - pointer.active) * 0.06;
      draw((now - start) / 1000);
      raf = requestAnimationFrame(frame);
    }

    if (reduced) {
      // one settled frame, far enough in that the field has developed
      draw(24);
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      if (wantsPointer) {
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerleave", onLeave);
      }
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, [interactive]);

  if (failed) {
    return <Signature variant="hero" className={className} interactive={interactive} />;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`block h-full w-full ${className}`.trim()}
    />
  );
}
