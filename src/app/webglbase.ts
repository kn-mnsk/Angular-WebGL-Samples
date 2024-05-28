import { Directive, ViewChild, ElementRef, AfterViewInit, OnInit, OnDestroy, Inject, inject, PLATFORM_ID, NgZone, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { mat4 } from 'gl-matrix';

import { WebglService } from './services/webgl.service';
import { ShaderService } from './services/shader.service';
import { Cube } from './services/mesh.service';
import { TextureService } from './services/texture.service';


/**
 * Abstract class for WebGL Rendering
 * @ShaderProgram Necessary
 * @Mesh Necessary
 * @Texture Necessaryt
 * The followings need to be implemented;
 * @property title
 * @LifeCcycleHook ngOnInit
 * @LifeCcycleHook ngOnDestroy
 * @method initialize
 * @method glBufferInit
 * @method render
 */
@Directive()
export abstract class WebGLBase implements OnInit, AfterViewInit, OnDestroy {

  public abstract title: string;

  protected animationFrameId: number = -1;

  protected browserClientWidth: number = 0;//512;
  protected browserClientHeight: number = 0;//512;
  protected canvasWidth: number = 0;
  protected canvasHeight: number = 0;
  protected canvasClientWidth: number = 0;
  protected canvasClientHeight: number = 0;

  protected canvasClientScale: number = 1.0;
  protected canvasScale: number = 0.8;


  protected elapsed: number = 0;
  protected delay: number = 3;

  protected video = {} as HTMLVideoElement;

  protected webglCtx = {} as WebGL2RenderingContext;
  protected webglservice = {} as WebglService;

  @ViewChild('canvas', { static: false }) protected canvas = {} as ElementRef<HTMLCanvasElement>;

  protected get gl(): WebGL2RenderingContext {
    return this.webglCtx;
  }
  protected set gl(webglctx: WebGL2RenderingContext) {
    this.webglCtx = webglctx;
  }

  public isBrowser = false as boolean;
  protected InitializeAlreadyStarted: boolean = false;

  protected vao = {} as WebGLVertexArrayObject;
  protected vbo = {} as WebGLBuffer;
  protected evbo = {} as WebGLBuffer;
  protected texture0 = {} as WebGLTexture;
  protected now = 0 as number;
  protected then = 0 as number;

  protected rotationAngle = 0 as number;
  protected currentRoute: string = "";

  constructor(@Inject(PLATFORM_ID) protected platformId: Object, protected _ngZone: NgZone, protected router: Router, protected shader: ShaderService, protected mesh: any, protected texture: TextureService) {

    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.webglservice = inject(WebglService);
    }

  }


  /**
   * Not necessary to code, but need to implement no code, though
   */
  abstract ngOnInit(): void;

  ngAfterViewInit(): void {
    /**
     * To stabilize Angular hydration process to use NgZone
     * Loop outside of the Angular zone so the UI DOES NOT refresh after each setTimeout cycle;
     *
     * Enable to advance to the rendering process only after the completion pf processing of shader program generation following asynchronously reading shader source files
     *
     * @ReferTo https://angular.io/api/core/NgZone#usage-notes
     *
     */
    this._ngZone.runOutsideAngular(() => {
      this._initialize(() => {
        // reenter the Angular zone and display done
        this._ngZone.run(() => {
          // console.log('Debug  WegGL Initialization Done!: Outside of Angular Zone \nTotal elapsed time of initializing ', this.elapsed, 'miliseconds');
        });
      });
    });
  }

  /**
   * @sampleCoing
   *
   * if (this.isBrowser) {
   *    // Clean up WebGL resources
   *    // 1 stop animatiom
   *     cancelAnimationFrame(this.animationFrameId);
    *     // 2 free webgl resources
    *     this.webglservice.freeWebglResources(this.vao, this.vbo, this.evbo, this.shader.getProgram, this.texture0);
    *  }
   */
  abstract ngOnDestroy(): void;

  @HostListener('window:resize', ['$event'])
  protected onResize(event: any) {
    this.getWindowSize();
  }

  protected getWindowSize() {

    this.browserClientWidth = window.innerWidth;
    this.browserClientHeight = window.innerHeight;

    if (this.browserClientHeight < this.browserClientWidth) {
      this.canvasWidth = this.browserClientHeight * this.canvasScale;
      this.canvasHeight = this.browserClientHeight * this.canvasScale;
    } else {

      this.canvasWidth = this.browserClientWidth * this.canvasScale;
      this.canvasHeight = this.browserClientWidth * this.canvasScale;

    }

    this.canvasClientWidth = this.browserClientWidth * this.canvasClientScale;
    this.canvasClientHeight = this.browserClientWidth * this.canvasClientScale;
  }


  protected _initialize(callback: () => void) {

    // this.elapsed += this.delay;
    // console.log(`initializing elapsed: ${this.elapsed} miliseconds`);


    if (!this.shader.programStatus) {
      if (!this.InitializeAlreadyStarted && this.isBrowser) {
        /** NOTE
         * this.isBorwser must be true, otherwise type error will happen, saying ' TypeError: Cannot read properties of undefined (reading 'nativeElement') on the server side' in the following this.initialize()
        */
        this.initialize();
        // console.log(`Debug  ${this.title}component: Initializing Done`);
      }

      setTimeout(() => this._initialize(callback), this.delay);
    } else {
      callback();
      // console.log(`Debug ${this.title}component: drawScene to Start`);
      // console.log(`Debug ${this.title}component: WebGL2RenderingContext`, this.gl);
      this.drawScene();

    };

  }

  /**
   *
   */
  abstract initialize(): void;

  protected clearViewport(): void {
    /*
     Clearing the viewport is left at this level (not in Program impl), because
     there might be more than one program for a single application, but the viewport
     is reset once per render() call.
     */
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  /**
   *
   */
  abstract initializeGlBuffers(): void;

  protected resizeCanvas(): void {

    this.getWindowSize();

    this.gl.canvas.width = this.canvasWidth;
    this.gl.canvas.height = this.canvasHeight;

  }

  protected drawScene(): void {

    this.initializeGlBuffers();

    this.render();

  }
  protected setPerspective(): void {

    const projection = mat4.create();
    const fieldOfView: number = (45 * Math.PI) / 180; // in radians

    const aspect: number = <number>(this.gl.canvas.width / this.gl.canvas.height);
    const zNear: number = 1;
    const zFar: number = 100;

    mat4.perspective(projection, fieldOfView, aspect, zNear, zFar);
    this.shader.setMat4("projection", projection);


  }

  protected adjustViewportSize(): void {

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

  }

  /**
   * the follwing four methods needs to be processed in the first place
   * @resizeCanvas
   * @clearViewport
   * @adjustViewportSize
   * @setPerspective
   *
   */
  abstract render(): void;

}


/**
 * Abstract class for WebGL Rendering
 * @ShaderProgram Necessary
 * @Mesh Necessary
 * @Texture No ussage
 * The followings need to be implemented;
 * @property title
 * @LifeCcycleHook ngOnInit
 * @LifeCcycleHook ngOnDestroy
 * @method initialize
 * @method initializeGlBuffers
 * @method render
 */
@Directive()
export abstract class WebGLBaseWithoutTexture implements OnInit, AfterViewInit, OnDestroy {

  public abstract title: string;

  protected animationFrameId: number = -1;

  protected browserClientWidth: number = 0;//512;
  protected browserClientHeight: number = 0;//512;
  protected canvasWidth: number = 0;
  protected canvasHeight: number = 0;
  protected canvasClientWidth: number = 0;
  protected canvasClientHeight: number = 0;

  protected canvasClientScale: number = 1.0;
  protected canvasScale: number = 0.8;

  protected elapsed: number = 0;
  protected delay: number = 3;

  // protected video = {} as HTMLVideoElement;

  protected webglCtx = {} as WebGL2RenderingContext;
  protected webglservice = {} as WebglService;

  @ViewChild('canvas', { static: false }) protected canvas = {} as ElementRef<HTMLCanvasElement>;

  protected get gl(): WebGL2RenderingContext {
    return this.webglCtx;
  }
  protected set gl(webglctx: WebGL2RenderingContext) {
    this.webglCtx = webglctx;
  }

  public isBrowser = false as boolean;
  protected InitializeAlreadyStarted: boolean = false;

  protected vao = {} as WebGLVertexArrayObject;
  protected vbo = {} as WebGLBuffer;
  protected evbo = {} as WebGLBuffer;
  protected texture0 = {} as WebGLTexture;
  protected now = 0 as number;
  protected then = 0 as number;

  protected rotationAngle = 0 as number;
  protected currentRoute: string = "";

  constructor(@Inject(PLATFORM_ID) protected platformId: Object, protected _ngZone: NgZone, protected router: Router, protected shader: ShaderService, protected mesh: any) {

    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.webglservice = inject(WebglService);
    }

  }


  /**
   * Not necessary to code, but need to implement no code, though
   */
  abstract ngOnInit(): void;

  ngAfterViewInit(): void {
    /**
     * To stabilize Angular hydration process to use NgZone
     * Loop outside of the Angular zone so the UI DOES NOT refresh after each setTimeout cycle;
     *
     * Enable to advance to the rendering process only after the completion pf processing of shader program generation following asynchronously reading shader source files
     *
     * @ReferTo https://angular.io/api/core/NgZone#usage-notes
     *
     */
    this._ngZone.runOutsideAngular(() => {
      this._initialize(() => {
        // reenter the Angular zone and display done
        this._ngZone.run(() => {
          // console.log('Debug  WegGL Initialization Done!: Outside of Angular Zone \nTotal elapsed time of initializing ', this.elapsed, 'miliseconds');
        });
      });
    });
  }

  /**
   * @sampleCoing
   *
   * if (this.isBrowser) {
   *    // Clean up WebGL resources
   *    // 1 stop animatiom
   *     cancelAnimationFrame(this.animationFrameId);
    *     // 2 free webgl resources
    *     this.webglservice.freeWebglResources(this.vao, this.vbo, this.evbo, this.shader.getProgram, this.texture0);
    *  }
   */
  abstract ngOnDestroy(): void;

  @HostListener('window:resize', ['$event'])
  protected onResize(event: any) {
    this.getWindowSize();
  }

  protected getWindowSize() {

    this.browserClientWidth = window.innerWidth;
    this.browserClientHeight = window.innerHeight;

    if (this.browserClientHeight < this.browserClientWidth) {
      this.canvasWidth = this.browserClientHeight * this.canvasScale;
      this.canvasHeight = this.browserClientHeight * this.canvasScale;
    } else {

      this.canvasWidth = this.browserClientWidth * this.canvasScale;
      this.canvasHeight = this.browserClientWidth * this.canvasScale;

    }

    this.canvasClientWidth = this.browserClientWidth * this.canvasClientScale;
    this.canvasClientHeight = this.browserClientWidth * this.canvasClientScale;
  }


  protected _initialize(callback: () => void) {

    // this.elapsed += this.delay;
    // console.log(`initializing elapsed: ${this.elapsed} miliseconds`);


    if (!this.shader.programStatus) {
      if (!this.InitializeAlreadyStarted && this.isBrowser) {
        /** NOTE
         * this.isBorwser must be true, otherwise type error will happen, saying ' TypeError: Cannot read properties of undefined (reading 'nativeElement') on the server side' in the following this.initialize()
        */
        this.initialize();
        // console.log(`Debug  ${this.title}component: Initializing Done`);
      }

      setTimeout(() => this._initialize(callback), this.delay);
    } else {
      callback();
      // console.log(`Debug ${this.title}component: drawScene to Start`);
      // console.log(`Debug ${this.title}component: WebGL2RenderingContext`, this.gl);
      this.drawScene();

    };

  }

  /**
   *
   */
  abstract initialize(): void;

  protected clearViewport(): void {
    /*
     Clearing the viewport is left at this level (not in Program impl), because
     there might be more than one program for a single application, but the viewport
     is reset once per render() call.
     */
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  /**
   *
   */
  abstract initializeGlBuffers(): void;

  protected resizeCanvas(): void {

    this.getWindowSize();

    this.gl.canvas.width = this.canvasWidth;
    this.gl.canvas.height = this.canvasHeight;

  }

  protected drawScene(): void {

    this.initializeGlBuffers();

    this.render();

  }
  protected setPerspective(): void {

    const projection = mat4.create();
    const fieldOfView: number = (45 * Math.PI) / 180; // in radians

    const aspect: number = <number>(this.gl.canvas.width / this.gl.canvas.height);
    const zNear: number = 1;
    const zFar: number = 100;

    mat4.perspective(projection, fieldOfView, aspect, zNear, zFar);
    this.shader.setMat4("projection", projection);


  }

  protected adjustViewportSize(): void {

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

  }

  /**
   * the follwing four methods needs to be processed in the first place
   * @resizeCanvas
   * @clearViewport
   * @adjustViewportSize
   * @setPerspective
   *
   */
  abstract render(): void;

}



/**
 * Abstract class for WebGL Rendering
 * @ShaderProgram No usage
 * @Mesh No usage
 * @Texture No ussage
 * The followings need to be implemented;
 * @property title
 * @LifeCcycleHook ngOnInit
 * @LifeCcycleHook ngOnDestroy
 * @method initialize
 * @method initializeGlBuffers
 * @method render
 */
@Directive()
export abstract class WebGLBasicBase implements OnInit, AfterViewInit, OnDestroy {

  public abstract title: string;

  protected browserClientWidth: number = 0;//512;
  protected browserClientHeight: number = 0;//512;
  protected canvasWidth: number = 0;
  protected canvasHeight: number = 0;
  protected canvasClientWidth: number = 0;
  protected canvasClientHeight: number = 0;

  protected canvasClientScale: number = 1.0;
  protected canvasScale: number = 0.8;

  protected delay: number = 3;

  protected webglCtx = {} as WebGL2RenderingContext;
  protected webglservice = {} as WebglService;

  @ViewChild('canvas', { static: false }) protected canvas = {} as ElementRef<HTMLCanvasElement>;

  protected get gl(): WebGL2RenderingContext {
    return this.webglCtx;
  }
  protected set gl(webglctx: WebGL2RenderingContext) {
    this.webglCtx = webglctx;
  }

  protected isBrowser = false as boolean;


  constructor(@Inject(PLATFORM_ID) protected platformId: Object, protected _ngZone: NgZone) {

    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.webglservice = inject(WebglService);
    }

  }


  /**
   * Not necessary to code, but need to implement no code, though
   */
  abstract ngOnInit(): void;

  ngAfterViewInit(): void {
    /**
     * To stabilize Angular hydration process to use NgZone
     * Loop outside of the Angular zone so the UI DOES NOT refresh after each setTimeout cycle;
     *
     * Enable to advance to the rendering process only after the completion pf processing of shader program generation following asynchronously reading shader source files
     *
     * @ReferTo https://angular.io/api/core/NgZone#usage-notes
     *
     */
    this._ngZone.runOutsideAngular(() => {
      this._initialize(() => {
        // reenter the Angular zone and display done
        this._ngZone.run(() => {
          // console.log('Debug  WegGL Initialization Done!: Outside of Angular Zone \nTotal elapsed time of initializing ', this.elapsed, 'miliseconds');
        });
      });
    });
  }

  /**
   * @sampleCoing
   *
   * if (this.isBrowser) {
   *    // Clean up WebGL resources
   *    // 1 stop animatiom
   *     cancelAnimationFrame(this.animationFrameId);
    *     // 2 free webgl resources
    *     this.webglservice.freeWebglResources(this.vao, this.vbo, this.evbo, this.shader.getProgram, this.texture0);
    *  }
   */
  abstract ngOnDestroy(): void;

  @HostListener('window:resize', ['$event'])
  protected onResize(event: any) {
    this.getWindowSize();
  }

  protected getWindowSize() {

    this.browserClientWidth = window.innerWidth;
    this.browserClientHeight = window.innerHeight;

    if (this.browserClientHeight < this.browserClientWidth) {
      this.canvasWidth = this.browserClientHeight * this.canvasScale;
      this.canvasHeight = this.browserClientHeight * this.canvasScale;
    } else {

      this.canvasWidth = this.browserClientWidth * this.canvasScale;
      this.canvasHeight = this.browserClientWidth * this.canvasScale;

    }

    this.canvasClientWidth = this.browserClientWidth * this.canvasClientScale;
    this.canvasClientHeight = this.browserClientWidth * this.canvasClientScale;
  }


  protected _initialize(callback: () => void) {

    // this.elapsed += this.delay;
    // console.log(`initializing elapsed: ${this.elapsed} miliseconds`);


    if (!this.isBrowser) {

      setTimeout(() => this._initialize(callback), this.delay);
    } else {
      this.initialize();
      // console.log(`${this.title}component: Initializing Done`);
      callback();
      // console.log(`${this.title}component: drawScene to Start`);
      this.drawScene();
    };

  }

  /**
   *
   */
  abstract initialize(): void;

  protected clearViewport(): void {
    /*
     Clearing the viewport is left at this level (not in Program impl), because
     there might be more than one program for a single application, but the viewport
     is reset once per render() call.
     */
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  /**
   *
   */
  abstract initializeGlBuffers(): void;

  protected resizeCanvas(): void {

    this.getWindowSize();

    this.gl.canvas.width = this.canvasWidth;
    this.gl.canvas.height = this.canvasHeight;

  }

  protected drawScene(): void {

    this.initializeGlBuffers();

    this.render();

  }

  protected adjustViewportSize(): void {

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

  }

  /**
   * the follwing four methods needs to be processed in the first place
   * @resizeCanvas
   * @clearViewport
   * @adjustViewportSize
   * @setPerspective
   *
   */
  abstract render(): void;

}
