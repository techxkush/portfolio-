'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const vertexSource = `
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const fragmentSource = `
  precision mediump float;
  uniform sampler2D uPortrait;
  uniform float uProgress;
  uniform vec2 uResolution;
  varying vec2 vUv;
  void main() {
    float portraitAspect = 0.8003;
    float canvasAspect = uResolution.x / uResolution.y;
    vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
    if (canvasAspect > portraitAspect) {
      float widthRatio = portraitAspect / canvasAspect;
      if (abs(vUv.x - 0.5) > widthRatio * 0.5) { gl_FragColor = vec4(0.0); return; }
      uv.x = (vUv.x - 0.5) / widthRatio + 0.5;
    } else {
      float heightRatio = canvasAspect / portraitAspect;
      if (abs(vUv.y - 0.5) > heightRatio * 0.5) { gl_FragColor = vec4(0.0); return; }
      uv.y = (0.5 - vUv.y) / heightRatio + 0.5;
    }

    float amount = smoothstep(0.01, 0.72, uProgress);
    float band = floor(uv.y * 24.0);
    float slice = sin(band * 12.87) * amount * 0.075;
    uv.x += slice + sin(uv.y * 24.0) * amount * 0.032;
    uv.y += cos(vUv.x * 19.0) * amount * 0.018;

    vec4 photo = texture2D(uPortrait, uv);
    float luminance = dot(photo.rgb, vec3(0.299, 0.587, 0.114));
    vec3 monochrome = vec3(luminance);
    vec3 tone = mix(monochrome, vec3(0.91, 0.88, 0.81), 0.08);
    gl_FragColor = vec4(tone, photo.a * (1.0 - amount * 0.12));
  }
`;

export default function DistortedPortrait() {
  useEffect(() => {
    const host = document.querySelector<HTMLElement>('.hero-portrait');
    if (!host) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'distortion-canvas';
    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let texture: WebGLTexture | null = null;
    let image: HTMLImageElement | null = null;
    try {
      gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power', premultipliedAlpha: false });
      if (!gl) return;
      const compile = (type: number, source: string) => {
        const shader = gl!.createShader(type);
        if (!shader) throw new Error('Unable to create shader');
        gl!.shaderSource(shader, source);
        gl!.compileShader(shader);
        if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(shader) || 'Shader compile failed');
        return shader;
      };
      const vertex = compile(gl.VERTEX_SHADER, vertexSource);
      const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
      program = gl.createProgram();
      if (!program) throw new Error('Unable to create program');
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'Shader link failed');
      buffer = gl.createBuffer();
      if (!buffer) throw new Error('Unable to create buffer');
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
      gl.useProgram(program);
      const position = gl.getAttribLocation(program, 'aPosition');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      texture = gl.createTexture();
      if (!texture) throw new Error('Unable to create texture');
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(gl.getUniformLocation(program, 'uPortrait'), 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      host.appendChild(canvas);
    } catch {
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
      return;
    }

    const ctx = gl!;
    const draw = () => {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.round(rect.width * ratio);
      const height = Math.round(rect.height * ratio);
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      ctx.viewport(0, 0, width, height);
      ctx.clearColor(0, 0, 0, 0);
      ctx.clear(ctx.COLOR_BUFFER_BIT);
      ctx.useProgram(program);
      ctx.uniform2f(ctx.getUniformLocation(program!, 'uResolution'), rect.width, rect.height);
      ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, 4);
    };
    image = new Image();
    image.onload = () => {
      if (!texture) return;
      ctx.bindTexture(ctx.TEXTURE_2D, texture);
      ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
      ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, image!);
      host.classList.add('shader-ready');
      draw();
    };
    image.src = '/portrait-cutout.webp';
    gsap.registerPlugin(ScrollTrigger);
    const spread = gsap.fromTo(host, { scale: 1 }, {
      scale: 1.55,
      transformOrigin: '50% 45%',
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
    });
    const trigger = ScrollTrigger.create({
      trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6,
      onUpdate: (self) => { ctx.uniform1f(ctx.getUniformLocation(program!, 'uProgress'), self.progress); draw(); },
    });
    const resize = new ResizeObserver(draw);
    resize.observe(host);
    return () => {
      trigger.kill();
      spread.scrollTrigger?.kill();
      spread.kill();
      resize.disconnect();
      host.classList.remove('shader-ready');
      if (image) image.onload = null;
      if (texture) ctx.deleteTexture(texture);
      if (buffer) ctx.deleteBuffer(buffer);
      if (program) ctx.deleteProgram(program);
      ctx.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    };
  }, []);

  return null;
}
