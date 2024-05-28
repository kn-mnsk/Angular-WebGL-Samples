import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TextureService {

  title = "TextureService";

  private texture = {} as WebGLTexture;
  private gl = {} as WebGL2RenderingContext;


  // will set to true when video can be copied to texture
  private copyVideo = false;
  public get copiedVideo(): boolean {
    return this.copyVideo;
  }
  private set copiedVideo(b: boolean) {
    this.copyVideo = b;
  }

  constructor() { }

  public genTexture(gl: WebGL2RenderingContext): WebGLTexture {

    this.texture = gl.createTexture() as WebGLTexture;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    // Because video has to be download over the internet
    // they might take a moment until it's ready so
    // put a single pixel in the texture so we can
    // use it immediately.
    const level = 0;

    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      width,
      height,
      border,
      srcFormat,
      srcType,
      pixel
    );

    // Turn off mips and set wrapping to clamp to edge so it
    // will work regardless of the dimensions of the video.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    return this.texture;

  }
  /**
   * @Reference https://stackoverflow.com/questions/40930316/webgl-invalid-value-teximage2d-no-video-error-in-chrome
   * @param gl
   * @param texture
   * @param data
   */
  public updateVideoTexture(gl: WebGL2RenderingContext, texture: WebGLTexture, data: HTMLVideoElement): void {

    // console.log(`${this.title}: updateVideoTexture`);

    const level = 0;
    const internalFormat = gl.RGBA;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      srcFormat,
      srcType,
      data
    );

  }

  public checkCopyVideo(callback: () => void) {

    const delay: number = 3;

    if (!this.copiedVideo) {
      // console.log(`Debug  ${this.title} saying asysncLoadVideo in porgress`);
      setTimeout(() => this.checkCopyVideo(callback), delay);
    } else {
      callback();
    }
  }

  private checkVideoReady(playing: boolean, timeupdate: boolean) {
    if (playing && timeupdate) {
      this.copyVideo = true;
    }
  }

  public loadVideo(videoUrl: string): HTMLVideoElement {

    const video: HTMLVideoElement = document.createElement("video");

    //console.log("Video Object: \n", video)

    let playing = false;
    let timeupdate = false;

    video.playsInline = true;
    video.muted = true;
    video.loop = true;

    // Waiting for these 2 events ensures
    // there is data in the video

    video.addEventListener(
      "playing",
      () => {
        playing = true;
        this.checkVideoReady(playing, timeupdate);
      },
      true
    );

    video.addEventListener(
      "timeupdate",
      () => {
        timeupdate = true;
        this.checkVideoReady(playing, timeupdate);
      },
      true
    );

    video.src = videoUrl;
    video.play();

    return video;

  }

  public async asyncLoadVideo(videoUrl: string, video: HTMLVideoElement): Promise<void> {
    return new Promise((resolve, reject) => {

      fetch(videoUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`${this.title}: asyncLoadVideo2 saying HTTP error! status: ${response.status}`);
          }
          return response.blob();
        })
        .then(blob => {

          video.src = URL.createObjectURL(blob);
          let playing = false;
          let timeupdate = false;

          video.playsInline = true;
          video.muted = true;
          video.loop = true;
          // video.preload = "auto";

          // Waiting for these 2 events ensures
          // there is data in the video
          video.addEventListener(
            "playing",
            () => {
              playing = true;
              this.checkVideoReady(playing, timeupdate);
            },
            true
          );

          video.addEventListener(
            "timeupdate",
            () => {
              timeupdate = true;
              this.checkVideoReady(playing, timeupdate);;
            },
            true
          );

          resolve();

          video.play();

          // console.log(`Debug  ${this.title} saying "finished asynLoadVideo, "`, video);

        })
        .catch(error => {
          console.error(`${this.title} saying asyncLoadVideo Fetch Error:`, error, video);
          reject(error);
        });
    });
  }

  public async asyncLoadImage(imageUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imageUrl;
    });
  }

  public updateImageTexture(gl: WebGL2RenderingContext, texture: WebGLTexture, data: HTMLImageElement): void {

    const level = 0;
    const internalFormat = gl.RGBA;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      srcFormat,
      srcType,
      data
    );

  }

  // wrapper function
  public async bindImage(gl: WebGL2RenderingContext, texture: WebGLTexture, imageUrl: string): Promise<void> {

    this.asyncLoadImage(imageUrl).then(image => {
      this.updateImageTexture(gl, texture, image);
    })
      .catch(error => {
        console.error("Error binding image:", error);
      });
  }



}
