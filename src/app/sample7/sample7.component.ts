import { Component, ViewChild, ElementRef, AfterViewInit, OnInit, Inject, inject, PLATFORM_ID, NgZone, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';

import { mat4, vec3 } from 'gl-matrix';

import { WebglService } from '../services/webgl.service';
import { ShaderService } from '../services/shader.service';
import { Cube } from '../services/mesh.service';
import { TextureService } from '../services/texture.service';

import { WebGLBase } from '../webglbase';


@Component({
  selector: 'app-sample7',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './sample7.component.html',
  styleUrl: './sample7.component.css',
  providers: [ShaderService, Cube, TextureService]
})
export class Sample7Component extends WebGLBase {

  title = "Sample7";

  constructor(@Inject(PLATFORM_ID) platformId: Object, _ngZone: NgZone, router: Router, shader: ShaderService, mesh: Cube, texture: TextureService) {

    super(platformId, _ngZone, router, shader, mesh, texture)
  }

  override ngOnInit(): void {
    // no code
  }

  override ngOnDestroy(): void {
    if (this.isBrowser) {
      // console.log(`Debug  ${this.title}Component: in ngOnDestroy`);

      // Clean up WebGL resources
      // 1 stop animatiom
      cancelAnimationFrame(this.animationFrameId);
      // 2 Unbind textures

      this.webglservice.freeWebglResources(this.vao, this.vbo, this.evbo, this.shader.getProgram, this.texture0);

    }

  }

  override initialize(): void {

    this.InitializeAlreadyStarted = true;

    this.gl =  this.webglservice.createWebglCtx(this.canvas.nativeElement);
    this.gl.enable(this.gl.DEPTH_TEST); //
    this.gl.depthRange(0, 1);
    this.gl.depthFunc(this.gl.LESS); // Near things obscure far things

    this.shader.loadProgram(this.gl, './app/shaders/sample7.vs', './app/shaders/sample7.fs');

  }

  override initializeGlBuffers(): void {

    this.mesh.genAttributes(1.0);

    this.texture0 = this.texture.genTexture(this.gl);

    this.texture.bindImage(this.gl, this.texture0, "./assets/textures/image/cubetexture.png");

    // Flip image pixels into the bottom-to-top order that WebGL expects.
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

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
    const stride = 11 * Float32Array.BYTES_PER_ELEMENT; // 3 for position, 3 for normal and 2 for texcoord, 3 for facecolor
    const posOffset = 0;
    const normalOffset = 3 * Float32Array.BYTES_PER_ELEMENT
    const texOffset = 6 * Float32Array.BYTES_PER_ELEMENT

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
    this.shader.setAttribute("a_normal", 3, this.gl.FLOAT, false, stride, normalOffset);
    this.shader.setAttribute("a_texcoord", 2, this.gl.FLOAT, false, stride, texOffset);
  }

  override render(): void {

    this.resizeCanvas();

    this.clearViewport();

    this.adjustViewportSize();

    this.setPerspective();

    this.now = new Date().getTime(); // in seconds
    const deltaTime: number = this.now - this.then;
    this.then = this.now;
    this.rotationAngle += deltaTime / 1000;

    const model = mat4.create();
    // start drawing the square.
    mat4.translate(model, model, [0.0, 0.0, -5]);
    // axis to rotate around Z
    mat4.rotate(model, model, this.rotationAngle, vec3.fromValues(0.0, 0.0, 1.0));
    // axis to rotate around Y
    mat4.rotate(model, model, this.rotationAngle * 0.7, vec3.fromValues(0.0, 1.0, 0.0));
    // axis to rotate around X
    mat4.rotate(model, model, this.rotationAngle * 0.3, vec3.fromValues(1.0, 0.0, 0.0));
    this.shader.setMat4("model", model);

    const normal = mat4.create();
    mat4.invert(normal, model);
    mat4.transpose(normal, normal);
    this.shader.setMat4("normal", normal);

    // Tell WebGL we want to affect texture unit 0
    this.gl.activeTexture(this.gl.TEXTURE0);
    // Bind the texture to texture unit 0
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture0);

    this.gl.drawElements(this.gl.TRIANGLES, this.mesh.indicesCount, this.gl.UNSIGNED_SHORT, 0);

    this.animationFrameId = requestAnimationFrame(this.render.bind(this));

  }

}
