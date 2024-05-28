import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SquarePlane {

  private size: number = 0;
  private attributesData: number[] = [];

  constructor() { }

  public genAttributes(size: number) {
    this.size = size;

    const position = this.position;
    const colors = this.colors;

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 2; j++) {
        this.attributesData.push(position[2 * i + j]);
      }

      for (let k = 0; k < 3; k++) {
        this.attributesData.push(colors[3 * i + k]);
      }
    }
  }

  private get position(): Float32Array {
    const s: number = this.size;
    return new Float32Array([s, s, -s, s, s, -s, -s, -s]);
  }


  public get indices(): Uint16Array {
    return new Uint16Array([3, 1, 0, 0, 2, 3]);
  }


  private get colors(): Float32Array {

    const r = [1.0, 0.0, 0.0];
    const g = [0.0, 1.0, 0.0];
    const b = [0.0, 0.0, 1.0];
    const y = [1.0, 1.0, 0.0];
    const p = [1.0, 0.0, 1.0]; //purple
    const w = [1.0, 1.0, 1.0];
    const squarecolors = [w, r, g, b];


    let colors = [] as number[];

    for (let i = 0; i < 4; i++) {
      colors = colors.concat(squarecolors[i]);
    }

    // console.log("Debug: model squareplane color ", colors);
    return new Float32Array(colors);
  }

  public get attributes(): Float32Array {

    // console.log("Debug: model attributes pos(2), color(3) ", this.attributesData);

    return new Float32Array(this.attributesData);
  }

  public get verticesCount(): number {
    return this.position.length;
  }

  public get indicesCount(): number {
    return this.indices.length;
  }

}


@Injectable({
  providedIn: 'root'
})
export class Cube {

  private edgeLength: number = 0;
  private attributesData: number[] = [];

  constructor() { }

  /**
   * Generate cube mesh
   * @param length edge length of cube
   */
  public genAttributes(length: number) {

    this.edgeLength = length;

    const position: Float32Array = this.position;
    const normal: Float32Array = this.normal;
    const texcoord: Float32Array = this.texcoord;
    const facecolors: Float32Array = this.facecolors;

    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 3; j++) {
        this.attributesData.push(position[3 * i + j]);
      }
      for (let k = 0; k < 3; k++) {
        this.attributesData.push(normal[3 * i + k]);
      }
      for (let l = 0; l < 2; l++) {
        this.attributesData.push(texcoord[2 * i + l]);
      }
      for (let m = 0; m < 3; m++) {
        this.attributesData.push(facecolors[3 * i + m]);
      }
    }

  }

  public get attributes(): Float32Array {
    return new Float32Array(this.attributesData);
  }

  private get facecolors(): Float32Array {

    const r = [1.0, 0.0, 0.0];
    const g = [0.0, 1.0, 0.0];
    const b = [0.0, 0.0, 1.0];
    const y = [1.0, 1.0, 0.0];
    const p = [1.0, 0.0, 1.0]; //purple
    const w = [1.0, 1.0, 1.0];
    const facecolors = [w, r, g, b, y, p];

    let colors = [] as number[];
    for (let side = 0; side < facecolors.length; side++) {
      for (let i = 0; i < 4; i++) {
        colors = colors.concat(facecolors[side]);
      }
    }

    return new Float32Array(colors);
  }

  /**
   * return position
   */
  private get position(): Float32Array {
    const len: number = this.edgeLength / 2.0;
    return new Float32Array([
      // Front face
      -len, -len, len, len, -len, len, len, len, len, -len, len, len,

      // Back face
      -len, -len, -len, -len, len, -len, len, len, -len, len, -len, -len,

      // Top face
      -len, len, -len, -len, len, len, len, len, len, len, len, -len,

      // Bottom face
      -len, -len, -len, len, -len, -len, len, -len, len, -len, -len, len,

      // Right face
      len, -len, -len, len, len, -len, len, len, len, len, -len, len,

      // Left face
      -len, -len, -len, -len, -len, len, -len, len, len, -len, len, -len,
    ]);
  }

  /**
   * return ve2 texure coordinate
   */
  private get texcoord(): Float32Array {
    return new Float32Array([
      // Front
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Back
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Top
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Bottom
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Right
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Left
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    ]);
  }

  /**
   * return vec3 normal
   */
  private get normal(): Float32Array {
    return new Float32Array([
      // Front
      0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,

      // Back
      0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,

      // Top
      0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,

      // Bottom
      0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,

      // Right
      1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,

      // Left
      -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
    ]);
  }


  public get indices(): Uint16Array {
    return new Uint16Array([
      // front
      0, 1, 2, 0, 2, 3,
      // back
      4, 5, 6, 4, 6, 7,
      // top
      8, 9, 10, 8, 10, 11,
      // bottom
      12, 13, 14, 12, 14, 15,
      // right
      16, 17, 18, 16, 18, 19,
      // left
      20, 21, 22, 20, 22, 23
    ])
  }


  public get indicesCount(): number {
    return this.indices.length;
  }


  public get verticesCount(): number {
    return this.position.length / 12;
  }

}
