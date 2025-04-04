import {
  GLSL3,
  HalfFloatType,
  MeshBasicMaterial,
  ShaderMaterial,
  WebGLRenderTarget,
} from "three";
import { FullScreenQuad, Pass } from "three/addons/postprocessing/Pass.js";
import vertexShader from "./rgbtrail.vert?raw";

export class RGBTrailPass extends Pass {
  constructor() {
    super();

    this.uniforms = { frames: { value: null } };

    const echoes = [
      ["r", "g", "b", "a"],
      // Red
      ["2.0", "0.0", "0.0", "0.8 * a"],
      // Green
      ["0.0", "2.0", "0.0", "0.6 * a"],
      // Blue
      ["0.0", "0.0", "2.0", "0.4 * a"],
      ["0.0", "0.0", "2.0", "0.3 * a"],
      ["0.0", "0.0", "2.0", "0.2 * a"],
      ["0.0", "0.0", "2.0", "0.1 * a"],
    ].map(([r, g, b, a], i) => ({ r, g, b, a, i }));

    const fragmentShader = `
      #include <common>

      uniform sampler2D frames[${echoes.length}];
      in vec2 xy;
      out vec4 outputPixel;

      vec4 blend(vec4 bg, vec4 fg) {
        vec4 result = mix(bg, fg, fg.a);
        result = max(bg, result);
        return result;
      }

      void main() {
        outputPixel = vec4(0.0);
        ${echoes
          .map(
            ({ r, g, b, a, i }) => `
        {
          vec4 pixel = texture(frames[${i}], xy);
          pixel.r = ${r.replace("r", "pixel.r")};
          pixel.g = ${g.replace("g", "pixel.g")};
          pixel.b = ${b.replace("b", "pixel.b")};
          pixel.a = ${a.replace("a", "pixel.a")};
          outputPixel = blend(outputPixel, pixel);
        }`,
          )
          .join("\n")}
      }
    `;

    const shader = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
      glslVersion: GLSL3,
    });

    const params = [0, 0, { type: HalfFloatType }];

    this.comp = {
      target: new WebGLRenderTarget(...params),
      quad: new FullScreenQuad(shader),
    };

    this.frames = Array(echoes.length)
      .fill()
      .map(() => ({
        target: new WebGLRenderTarget(...params),
        quad: new FullScreenQuad(new MeshBasicMaterial({ transparent: true })),
      }));
  }

  render(renderer, writeBuffer, readBuffer) {
    this.frames.unshift(this.frames.pop());

    renderer.setRenderTarget(this.frames[0].target);
    this.frames[0].quad.material.map = readBuffer.texture;
    this.frames[0].quad.render(renderer);

    this.uniforms.frames.value = this.frames.map(
      (frame) => frame.target.texture,
    );

    renderer.setRenderTarget(writeBuffer);
    this.comp.quad.render(renderer);
  }

  setSize(width, height) {
    this.comp.target.setSize(width, height);
    for (const frame of this.frames) frame.target.setSize(width, height);
  }
}
