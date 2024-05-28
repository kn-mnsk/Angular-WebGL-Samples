import { Component, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { mat4, vec3 } from 'gl-matrix';

import { ShaderService } from '../services/shader.service';
import { Cube } from '../services/mesh.service';
import { WebGLBaseWithoutTexture } from '../webglbase';


@Component({
  selector: 'app-sample5',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './sample5.component.html',
  styleUrl: './sample5.component.css',
  providers: [ShaderService, Cube]
})
export class Sample5Component extends WebGLBaseWithoutTexture  {

  title = "Sample5";

  constructor(@Inject(PLATFORM_ID) platformId: Object, _ngZone: NgZone, router: Router, shader: ShaderService, mesh: Cube) {

    super(platformId, _ngZone, router, shader, mesh)
  }

  override ngOnInit(): void {
    // No usage
  }

  override ngOnDestroy(): void {
    if (this.isBrowser) {
      // console.log(`Debug  ${this.title}Component: in ngOnDestroy`);

      // Clean up WebGL resources
      if (this.shader == null) {
        // 1 free webgl resources
        this.webglservice.freeWebglResources(this.vao, this.vbo, this.evbo, null, null);
      } else {
        // 1 stop animatiom
        cancelAnimationFrame(this.animationFrameId);
        // 2 free webgl resources
        // No texture used
        this.webglservice.freeWebglResources(this.vao, this.vbo, this.evbo, this.shader.getProgram, null);

      }

    }

  }

  override initialize(): void {

    this.InitializeAlreadyStarted = true;
    this.gl = this.webglservice.createWebglCtx(this.canvas.nativeElement);

    this.gl.enable(this.gl.DEPTH_TEST); // Enable depth testing
    this.gl.depthRange(0, 1);
    this.gl.depthFunc(this.gl.LESS); // Near things obscure far things

  if (this.shader != null){
    this.shader.loadProgram(this.gl, './app/shaders/sample5.vs', './app/shaders/sample5.fs');

  }

  }

  override initializeGlBuffers(): void {


    this.mesh.genAttributes(1.0);

    /**
     * Debug
     console.log("Cube Mesh: ", this.mesh.getCubeMesh(), " vertex=", this.mesh.getVertices().length, " color=", this.mesh.getColors().length, "\n Vertex Buffer Object: ", this.vbo);
    */


    // buffer creation
    this.vao = this.gl.createVertexArray() as WebGLVertexArrayObject;
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
    const stride = 11 * Float32Array.BYTES_PER_ELEMENT; // 3 for position, 3 for normal, 2 for texcoord, 3 for facecolor
    const posOffset = 0;
    const colorOffset = 8 * Float32Array.BYTES_PER_ELEMENT

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

    this.shader.setAttribute("a_position", 3, this.gl.FLOAT, false, stride, posOffset);
    this.shader.setAttribute("a_color", 3, this.gl.FLOAT, false, stride, colorOffset);
  }

  override render(): void {

    this.resizeCanvas();

    this.clearViewport();

    this.adjustViewportSize();

    this.setPerspective();

    this.now = performance.now() * 0.001; // convert to miliseconds
    const deltaTime = this.now - this.then;
    this.then = this.now;

    const initModel = mat4.create();
    const model = mat4.create();

    mat4.translate(initModel, initModel, [0.0, 0.0, -5]);

    // axis to rotate around Z
    mat4.rotate(model, initModel, this.rotationAngle, vec3.fromValues(0.0, 0.0, 1.0));
    // axis to rotate around Y
    mat4.rotate(model, model, this.rotationAngle * 0.7, vec3.fromValues(0.0, 1.0, 0.0));
    // axis to rotate around X
    mat4.rotate(model, model, this.rotationAngle * 0.3, vec3.fromValues(1.0, 0.0, 0.0));

    this.shader.setMat4("model", model);

    this.gl.drawElements(this.gl.TRIANGLES, this.mesh.indicesCount, this.gl.UNSIGNED_SHORT, 0);

    this.rotationAngle += deltaTime;

    this.animationFrameId = requestAnimationFrame(this.render.bind(this));

  }
}




