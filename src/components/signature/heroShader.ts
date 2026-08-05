/**
 * The hero background, rendered per pixel.
 *
 * The whole point of doing this in GLSL rather than on a 2D canvas is that a
 * fragment shader evaluates a field at every pixel, so it produces *volume* —
 * soft masses with interiors. Stamping strokes or dots onto a 2D canvas can
 * only ever produce line art, however carefully it is tuned.
 *
 * The shape comes from domain warping: sample fbm noise, use the result to
 * offset the coordinates, then sample again. Feeding a noise field back into
 * itself is what turns smooth blobs into the folded, marbled forms that read
 * as smoke rather than as a lava lamp.
 *
 * It is deliberately dim. The base sits at the page background and the bright
 * term peaks around 0.12 luminance, so this is texture you feel behind the
 * type rather than a pattern competing with it.
 */

export const VERTEX_SRC = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

export const FRAGMENT_SRC = `
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;   // normalised 0..1, y up, already eased on the CPU
uniform float u_active;  // 0 when the pointer has left, 1 when it is present
uniform float u_dim;     // 1 on the home hero, lower where it is only a backdrop

/* ---- 3D simplex noise (Ashima / Gustavson formulation) ------------------ */

vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
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

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

/* two octaves is enough: more detail only shows up as grain at this dimness */
float fbm(vec3 p) {
  float sum = 0.0;
  float amp = 0.6;
  for (int i = 0; i < 2; i++) {
    sum += amp * snoise(p);
    p *= 1.9;
    amp *= 0.5;
  }
  return sum;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;

  vec2 p = uv;       p.x *= aspect;
  vec2 m = u_mouse;  m.x *= aspect;

  float t = u_time * 0.028;   // slow enough that it never reads as a loop
  vec2 sp = p * 0.75;         // few, large regions rather than busy detail

  // domain warp: sample the field, then use it to displace the coordinates
  // before sampling again. This is what folds the masses into each other.
  vec2 q = vec2(
    fbm(vec3(sp + m * 0.18, t)),
    fbm(vec3(sp + vec2(2.3, 1.1) - m * 0.18, t))
  );
  float n = fbm(vec3(sp + q * 0.45 + m * 0.1, t * 0.8)) * 0.5 + 0.5;

  vec3  base   = vec3(0.031, 0.035, 0.043);        // the page background
  vec3  accent = vec3(0.369, 0.918, 0.831);        // #5eead4

  float shade = smoothstep(0.28, 0.88, n);

  // the bright regions carry the accent, the rest stay neutral, so the colour
  // arrives with the volume instead of tinting the whole plane
  vec3 outc = base
            + vec3(0.075) * shade
            + accent * 0.075 * smoothstep(0.5, 1.0, n);

  // a soft light that follows the cursor, fading out when it leaves
  float d = distance(p, m);
  outc += accent * smoothstep(0.9, 0.0, d) * 0.05 * u_active;

  // vignette, so the edges stay quiet behind the header and the footer
  float vig = smoothstep(1.3, 0.45, distance(uv, vec2(0.5)));
  outc *= mix(0.82, 1.0, vig);

  /*
   * Dimming happens here rather than with CSS opacity on the canvas.
   *
   * An opacity layer over a full screen canvas is a separate composited
   * surface that has to be blended every frame, and on the about page that
   * alone was costing about a fifth of the frames while scrolling. There is
   * nothing between this canvas and the page background, so mixing toward the
   * background colour is the same picture for free.
   */
  const vec3 PAGE_BG = vec3(0.031, 0.035, 0.043);
  gl_FragColor = vec4(mix(PAGE_BG, outc, u_dim), 1.0);
}
`;
