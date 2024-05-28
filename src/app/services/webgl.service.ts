import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebglService {

  title = "WebglService";

  private webglCtx = {} as WebGL2RenderingContext | null;

  constructor() { }

  public createWebglCtx(canvas: HTMLCanvasElement): WebGL2RenderingContext {

    this.webglCtx = canvas.getContext('webgl2');

    if (!this.webglCtx) {

      throw new Error(`${this.title}: Failed to get WebGL2RenderingContext!`);
    }

    return this.webglCtx as WebGL2RenderingContext;

  }

  public get getWebglCtx(): WebGL2RenderingContext {
    return this.webglCtx as WebGL2RenderingContext;

  }

  /**
   * https://stackoverflow.com/questions/23598471/how-do-i-clean-up-and-unload-a-webgl-canvas-context-from-gpu-after-use
   * @param vao
   * @param vbo
   * @param evbo
   * @param program
   * @param texture
   */
  public freeWebglResources(vao: WebGLBuffer | null, vbo: WebGLBuffer | null, evbo: WebGLBuffer | null, program: WebGLProgram | null, texture: WebGLTexture | null): void {

    // Need to refactor
    const gl = this.webglCtx as WebGL2RenderingContext;

    // 1 Unbind textures
    var numTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    for (var unit = 0; unit < numTextureUnits; ++unit) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    }

    // Unbind the old buffers from the attributes.
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    var numAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    for (var attrib = 0; attrib < numAttributes; ++attrib) {
      gl.vertexAttribPointer(attrib, 1, gl.FLOAT, false, 0, 0);
    }

    if (vao != null) {
      gl.deleteVertexArray(vao);
    }

    if (vbo != null) {
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, 1, gl.STATIC_DRAW);
      gl.deleteBuffer(vbo);
    }

    if (evbo != null) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, evbo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 1, gl.STATIC_DRAW);
      gl.deleteBuffer(evbo);
    }

    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    if (program != null){
      gl.deleteProgram(program);
    }

    if (texture != null){
      gl.deleteTexture(texture);
    }
    // then, finally set the canvas size to 1x1 pixel.
    gl.canvas.width = 1.0;
    gl.canvas.height = 1.0;

  }

}
