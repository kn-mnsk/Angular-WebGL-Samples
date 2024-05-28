import { Component, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { mat4 } from 'gl-matrix';

import { ShaderService } from '../services/shader.service';
import { SquarePlane } from '../services/mesh.service';
import { WebGLBaseWithoutTexture } from '../webglbase';

@Component({
  selector: 'app-sample2',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './sample2.component.html',
  styleUrl: './sample2.component.css',
  providers: [ShaderService, SquarePlane]
})
export class Sample2Component extends WebGLBaseWithoutTexture {

  title = "Sample2";

  constructor(@Inject(PLATFORM_ID) platformId: Object, _ngZone: NgZone, router: Router, shader: ShaderService, mesh: SquarePlane) {

    super(platformId, _ngZone, router, shader, mesh)
  }

  override ngOnInit(): void {
    // No usage
  }

  override ngOnDestroy(): void {
    if (this.isBrowser) {
      // console.log(`Debug  ${this.title}Component: in ngOnDestroy`);

      // Clean up WebGL resources
      // 1 stop animatiom
      cancelAnimationFrame(this.animationFrameId);

      // 2 free webgl resources
      // No texture to be used
      this.webglservice.freeWebglResources(this.vao, this.vbo, this.evbo, this.shader.getProgram, null);

    }

  }

  override initialize(): void {

    this.InitializeAlreadyStarted = true;

    this.gl = this.webglservice.createWebglCtx(this.canvas.nativeElement);

    this.gl.enable(this.gl.DEPTH_TEST); // Enable depth testing
    this.gl.depthRange(0, 1);
    this.gl.depthFunc(this.gl.LESS); // Near things obscure far things

    this.shader.loadProgram(this.gl, './app/shaders/sample2.vs', './app/shaders/sample2.fs');

  }

  override initializeGlBuffers(): void {

    this.mesh.genAttributes(1.0);

    /**
     * Debug
     console.log("Cube Mesh: ", this.cube.getCubeMesh(), " vertex=", this.cube.getVertices().length, " color=", this.cube.getColors().length, "\n Vertex Buffer Object: ", this.vbo);
    */

    // buffer creation
    this.vao = this.gl.createVertexArray() as WebGLVertexArrayObject;;
    this.vbo = this.gl.createBuffer() as WebGLBuffer;
    this.evbo = this.gl.createBuffer() as WebGLBuffer;

    // buffer binding
    this.gl.bindVertexArray(this.vao);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.evbo);

    // set data to buffer
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.mesh.attributes, this.gl.STATIC_DRAW);

    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.mesh.indices, this.gl.STATIC_DRAW);

    // calc stride and offset
    const stride = 5 * Float32Array.BYTES_PER_ELEMENT; // 2 for position, 3 for color
    const posOffset = 0;


    /** Debug
     *
    console.log("Stride=", stride, " posOffset=", posOffset, " color offset=", colorOffset);
    console.log("attri inde: vertex=", positionLocation, " color=", colorLocation);
    // Set up attribute
    // this.program.use();
    console.log(shader);

     */

    this.shader.useProgram();
    this.gl.bindVertexArray(this.vao);
    this.shader.setAttribute("a_position", 3, this.gl.FLOAT, false, stride, posOffset);;

  }

  override render(): void {

    this.resizeCanvas();

    this.clearViewport();

    this.adjustViewportSize();

    this.setPerspective();

    const model = mat4.create();
    mat4.translate(model, model, [0.0, 0.0, -5]);

    this.shader.setMat4("model", model);

    this.gl.drawElements(this.gl.TRIANGLES, this.mesh.indicesCount, this.gl.UNSIGNED_SHORT, 0);

    this.animationFrameId = requestAnimationFrame(this.render.bind(this));

  }
}

