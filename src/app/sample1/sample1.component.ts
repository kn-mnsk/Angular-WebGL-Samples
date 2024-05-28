import { Component, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { WebGLBasicBase } from '../webglbase';

@Component({
  selector: 'app-sample1',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './sample1.component.html',
  styleUrl: './sample1.component.css',
})
export class Sample1Component extends WebGLBasicBase {

  title = "Sample1";


  constructor(@Inject(PLATFORM_ID) platformId: Object, _ngZone: NgZone) {

    super(platformId, _ngZone)
  }

  override ngOnInit(): void {
    // No usage
  }

  override ngOnDestroy(): void {
    if (this.isBrowser) {
      // console.log(`Debug  ${this.title}Component: in ngOnDestroy`);

      // Clean up WebGL resources
      // 1 stop animatiom
      // None to Stop
      //cancelAnimationFrame(this.animationFrameId);

      // 2 free webgl resources
      this.webglservice.freeWebglResources(null, null, null, null, null);

    }

  }

  override initialize(): void {

    this.gl = this.webglservice.createWebglCtx(this.canvas.nativeElement);

    this.gl.enable(this.gl.DEPTH_TEST); // Enable depth testing
    this.gl.depthRange(0, 1);
    this.gl.depthFunc(this.gl.LESS); // Near things obscure far things

  }

  override initializeGlBuffers(): void {
    // do noting

  }

  override render(): void {

    this.resizeCanvas();

    this.clearViewport();

    this.adjustViewportSize();

  }

}
