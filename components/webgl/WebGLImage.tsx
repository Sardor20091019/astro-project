"use client";
/**
 * WebGLImage — Drop-in replacement for <img> that applies
 * chromatic aberration + displacement on hover and scroll velocity spike.
 *
 * Falls back to a plain <img> if WebGL is unavailable.
 */
import { useEffect, useRef, useState } from "react";
import { useLenis } from "@/hooks/useLenis";

interface Props {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fill?: boolean;
  sizes?: string;
}

const VERT = `
attribute vec2 a_position;
attribute vec2 a_uv;
varying vec2 v_uv;
void main(){
  v_uv = a_uv;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D u_tex;
uniform vec2  u_mouse;  
uniform float u_hover;   
uniform float u_vel;    
varying vec2  v_uv;

void main(){
  float warp    = u_hover * 0.025 + u_vel * 0.018;
  float dist    = length(v_uv - u_mouse);
  float bulge   = warp * smoothstep(0.55, 0.0, dist);
  vec2  delta   = normalize(v_uv - u_mouse + 0.0001) * bulge;
  vec2  uv      = v_uv - delta;

  float ca      = (u_hover * 0.006 + u_vel * 0.007);
  float r       = texture2D(u_tex, uv + vec2( ca, 0.0)).r;
  float g       = texture2D(u_tex, uv               ).g;
  float b       = texture2D(u_tex, uv - vec2( ca, 0.0)).b;

  gl_FragColor  = vec4(r, g, b, 1.0);
}`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  return sh;
}

export default function WebGLImage({ src, alt, className, style, fill, sizes }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const glRef      = useRef<WebGLRenderingContext | null>(null);
  const progRef    = useRef<WebGLProgram | null>(null);
  const texRef     = useRef<WebGLTexture | null>(null);
  const uniRef     = useRef<Record<string, WebGLUniformLocation | null>>({});
  const stateRef   = useRef({ mx: 0.5, my: 0.5, hover: 0, vel: 0, rafId: 0 });
  const [fallback, setFallback] = useState(false);


  useLenis(({ velocity }) => {
    stateRef.current.vel = Math.min(Math.abs(velocity) / 18, 1);
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) { setFallback(true); return; }
    glRef.current = gl;


    const vert = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert); gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    gl.useProgram(prog);
    progRef.current = prog;


    const pos = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
    const uvs = new Float32Array([ 0, 0, 1, 0,  0,1, 1,1]);
    const pb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, pb);
    gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const ub = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, ub);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
    const aUv = gl.getAttribLocation(prog, "a_uv");
    gl.enableVertexAttribArray(aUv); gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);


    uniRef.current = {
      u_tex:   gl.getUniformLocation(prog, "u_tex"),
      u_mouse: gl.getUniformLocation(prog, "u_mouse"),
      u_hover: gl.getUniformLocation(prog, "u_hover"),
      u_vel:   gl.getUniformLocation(prog, "u_vel"),
    };
    gl.uniform1i(uniRef.current.u_tex, 0);


    const tex = gl.createTexture()!;
    texRef.current = tex;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([200,200,200]));

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    };
    img.src = src;


    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    });
    ro.observe(canvas);
    canvas.width  = canvas.offsetWidth  || 400;
    canvas.height = canvas.offsetHeight || 300;
    gl.viewport(0, 0, canvas.width, canvas.height);


    function onEnter() { stateRef.current.hover = 1; }
    function onLeave() { stateRef.current.hover = 0; stateRef.current.mx = 0.5; stateRef.current.my = 0.5; }
    function onMove(e: MouseEvent) {
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      stateRef.current.mx = (e.clientX - r.left) / r.width;
      stateRef.current.my = 1 - (e.clientY - r.top) / r.height;
    }
    canvas.addEventListener("mouseenter", onEnter);
    canvas.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("mousemove", onMove);

  
    function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
    const lerpState = { hover: 0, vel: 0, mx: 0.5, my: 0.5 };

    function render() {
      if (!gl) return;
      if (!glRef.current || !progRef.current) return;
      const s = stateRef.current;
      lerpState.hover = lerp(lerpState.hover, s.hover, 0.06);
      lerpState.vel   = lerp(lerpState.vel,   s.vel,   0.08);
      lerpState.mx    = lerp(lerpState.mx,    s.mx,    0.08);
      lerpState.my    = lerp(lerpState.my,    s.my,    0.08);

      gl.uniform2f(uniRef.current.u_mouse, lerpState.mx, lerpState.my);
      gl.uniform1f(uniRef.current.u_hover, lerpState.hover);
      gl.uniform1f(uniRef.current.u_vel,   lerpState.vel);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      stateRef.current.rafId = requestAnimationFrame(render);
    }
    stateRef.current.rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(stateRef.current.rafId);
      canvas.removeEventListener("mouseenter", onEnter);
      canvas.removeEventListener("mouseleave", onLeave);
      canvas.removeEventListener("mousemove", onMove);
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteTexture(tex);
    };
  }, [src]);

  if (fallback) {
    return (
      <img src={src} alt={alt} className={className} style={style} sizes={sizes} />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-label={alt}
      className={className}
      style={{
        display: "block",
        ...style,
        ...(fill ? { position: "absolute", inset: 0, width: "100%", height: "100%" } : {}),
      }}
    />
  );
}