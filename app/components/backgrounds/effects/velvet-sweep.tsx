"use client"

import { useEffect, useRef, type CSSProperties } from "react"
import { cn } from "@/lib/utils"

/**
 * Velvet Sweep — soft sweeping brand light on a deep velvet field.
 * Path mirrors getdesign Animated Backgrounds convention:
 *   app/components/backgrounds/effects/velvet-sweep.tsx
 *
 * Default brand: accent #3230e0 · field #0F1013
 */
export type VelvetSweepProps = {
  /** Sweep / glow accent */
  color?: string
  /** Base velvet field */
  background?: string
  /** Animation speed multiplier (1 = default) */
  speed?: number
  /** Overall glow strength 0–1 */
  intensity?: number
  className?: string
  style?: CSSProperties
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim()
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.padEnd(6, "0").slice(0, 6)
  const n = parseInt(full, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_color;
uniform vec3 u_bg;
uniform float u_intensity;
uniform float u_speed;

// soft value noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  // keep aspect so sweeps don't squash on mobile/desktop
  float aspect = u_res.x / max(u_res.y, 1.0);
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);

  float t = u_time * u_speed;

  // primary diagonal velvet sweep
  float band1 = sin(p.x * 1.35 + p.y * 2.1 - t * 0.55);
  // secondary counter-sweep
  float band2 = sin(p.x * -1.8 + p.y * 1.15 + t * 0.38 + 1.2);
  // slow rolling sheet
  float sheet = sin(p.y * 3.2 + t * 0.22) * 0.5 + 0.5;

  float n = fbm(p * 2.4 + vec2(t * 0.08, -t * 0.05));
  float n2 = fbm(p * 5.0 - vec2(t * 0.04, t * 0.07));

  // soft velvet lobes
  float sweep =
    smoothstep(0.15, 0.85, band1 * 0.5 + 0.5) * 0.55 +
    smoothstep(0.25, 0.9, band2 * 0.5 + 0.5) * 0.35 +
    sheet * 0.2;
  sweep *= mix(0.75, 1.15, n);
  sweep += (n2 - 0.5) * 0.12;

  // radial falloff — keep center readable for hero content
  float vignette = 1.0 - smoothstep(0.15, 0.95, length(p) * 1.15);
  float glow = max(sweep, 0.0) * vignette * u_intensity;

  // deep velvet field with brand lift
  vec3 col = u_bg;
  col += u_color * glow * 0.55;
  col += u_color * pow(max(glow, 0.0), 2.2) * 0.35;
  // subtle highlight edge
  col += vec3(0.85, 0.88, 1.0) * pow(max(glow, 0.0), 4.0) * 0.08;

  // film grain (very light)
  float grain = (hash(gl_FragCoord.xy + t * 60.0) - 0.5) * 0.035;
  col += grain;

  gl_FragColor = vec4(col, 1.0);
}
`

export function VelvetSweep({
  color = "#3230e0",
  background = "#0F1013",
  speed = 1,
  intensity = 0.9,
  className,
  style,
}: VelvetSweepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    })
    if (!gl) {
      // CSS fallback if WebGL unavailable
      canvas.style.background = `radial-gradient(ellipse 80% 70% at 50% 40%, ${color}44 0%, ${background} 70%)`
      return
    }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn("[VelvetSweep]", gl.getShaderInfoLog(s))
        gl.deleteShader(s)
        return null
      }
      return s
    }

    const vs = compile(gl.VERTEX_SHADER, VERT)
    const fs = compile(gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return

    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("[VelvetSweep]", gl.getProgramInfoLog(prog))
      return
    }
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    )
    const aPos = gl.getAttribLocation(prog, "a_pos")
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(prog, "u_res")
    const uTime = gl.getUniformLocation(prog, "u_time")
    const uColor = gl.getUniformLocation(prog, "u_color")
    const uBg = gl.getUniformLocation(prog, "u_bg")
    const uIntensity = gl.getUniformLocation(prog, "u_intensity")
    const uSpeed = gl.getUniformLocation(prog, "u_speed")

    const [cr, cg, cb] = parseHex(color)
    const [br, bg, bb] = parseHex(background)
    gl.uniform3f(uColor, cr, cg, cb)
    gl.uniform3f(uBg, br, bg, bb)
    gl.uniform1f(uIntensity, intensity)
    gl.uniform1f(uSpeed, reduced ? 0 : speed)

    const isMobile = () => window.matchMedia("(max-width: 768px)").matches

    const resize = () => {
      const parent = canvas.parentElement
      const w = parent?.clientWidth || window.innerWidth
      const h = parent?.clientHeight || window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile() ? 1.25 : 1.75)
      const rw = Math.max(1, Math.floor(w * dpr))
      const rh = Math.max(1, Math.floor(h * dpr))
      if (canvas.width !== rw || canvas.height !== rh) {
        canvas.width = rw
        canvas.height = rh
        canvas.style.width = `${w}px`
        canvas.style.height = `${h}px`
      }
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uRes, canvas.width, canvas.height)
    }

    resize()
    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)
    window.addEventListener("resize", resize, { passive: true })

    let start = performance.now()
    let running = true

    const frame = (now: number) => {
      if (!running) return
      if (document.visibilityState === "hidden") {
        rafRef.current = requestAnimationFrame(frame)
        return
      }
      const t = reduced ? 0 : (now - start) / 1000
      gl.uniform1f(uTime, t)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      if (!reduced) rafRef.current = requestAnimationFrame(frame)
    }

    // always paint at least one frame
    gl.drawArrays(gl.TRIANGLES, 0, 6)
    if (!reduced) {
      rafRef.current = requestAnimationFrame(frame)
    } else {
      gl.uniform1f(uTime, 0)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    const onVis = () => {
      if (document.visibilityState === "visible" && !reduced && running) {
        start = performance.now() - (performance.now() - start)
      }
    }
    document.addEventListener("visibilitychange", onVis)

    return () => {
      running = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", onVis)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buf)
    }
  }, [color, background, speed, intensity])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("block h-full w-full", className)}
      style={{ background, ...style }}
    />
  )
}

export default VelvetSweep
