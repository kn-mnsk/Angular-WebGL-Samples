import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ProgramInfo } from './type.services';


@Injectable({
  providedIn: 'root'
})
export class ShaderService {

  private program = {} as WebGLProgram;
  private gl = {} as WebGL2RenderingContext;
  private completedProgramGeneration: boolean = false;

  public programInfo = {} as ProgramInfo;

  public get programStatus(): boolean {
    return this.completedProgramGeneration;
  }

  constructor(private http: HttpClient) {

  }

  public async loadProgram(gl: WebGL2RenderingContext, vsFileUrl: string, fsFileUrl: string): Promise<[string, string]> {

    var vsFile: string = "";
    let fsFile: string = "";
    let vsShader: WebGLShader = {};
    let fsShader: WebGLShader = {};
    this.gl = gl;

    try {
      // const [file1Response, file2Response] = await
      await Promise.all([fetch(vsFileUrl), fetch(fsFileUrl)]).then((values) => {
        const clonedValue0 = values[0].clone();
        clonedValue0.text().then(data => {
          vsFile = data;
          // console.log("Vertex: ", vsFile);

          const clonedValue1 = values[1].clone();
          clonedValue1.text().then(data => {
            fsFile = data;

            // console.log("Promise", fsFile);

            vsShader = this.compileShader(gl, vsFile, gl.VERTEX_SHADER);
            fsShader = this.compileShader(gl, fsFile, gl.FRAGMENT_SHADER);

            this.createProgram(gl, vsShader, fsShader);

          });

        });


      });

      return [vsFile, fsFile];

    } catch (error) {
      console.error('Error reading text files:', error);
      throw error;
    }
  }

  private compileShader(gl: WebGL2RenderingContext, shaderSource: string, type: number): WebGLShader {

    const shader = gl.createShader(type) as WebGLShader;
    try {

      gl.shaderSource(shader, shaderSource);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        console.log(`Could not compile WebGL program. \n${info}`);
        this.completedProgramGeneration = false;
      }
    } catch (e: unknown) {
      console.log(e);
      if (typeof e === "string") {
        e.toUpperCase() // works, `e` narrowed to string
        console.log(e);
        this.completedProgramGeneration = false;
        return {} as WebGLShader;
      } else if (e instanceof Error) {
        e.message // works, `e` narrowed to Error
        console.log(e.message);
        this.completedProgramGeneration = false;
       return {} as WebGLShader;
      }
    };

    return shader;
  }

  private createProgram(gl: WebGL2RenderingContext, vsShader: WebGLShader, fsShader: WebGLShader): void {

    const program = gl.createProgram() as WebGLProgram;
    gl.attachShader(program, vsShader);
    gl.attachShader(program, fsShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      console.log(`Failed in shader program LINking. \n${info}`);
      this.completedProgramGeneration = false;
      return;
      // process.exit();
      //  process.abort();

    }

    this.program = program;
    this.completedProgramGeneration = true;

    // create program info.
    /** To be coded */
  }


  public get getProgram(): WebGLProgram {
    return this.program;
  }
  /**
    * Shortcut method, called to enable the underlying WebGL program.
    */
  public useProgram(): void {
    this.gl.useProgram(this.program);
  }

  /**
  * Bind currently defined buffer to vertex attribute, specifing vertex attribute layout.
  * You have to make WebGLProgram 'Use' first:, othewise error
  * @param name uniform name
  * @param size the number of components per vertex attribute. Must be 1, 2, 3, or 4.
  * @param type specifying the data type of each component in the array. Possible values: gl.BYTE, gl.SHORT, gl.UNSIGNED_BYTE, gl.UNSIGNED_SHORT, gl.FLOAT(32-bit)
  * @param normalized specifying whether integer data values should be normalized into a certain range when being cast to a float.
  * @param stride specifying the offset in bytes between the beginning of consecutive vertex attributes.
  * @param offset an offset in bytes of the first component in the vertex attribute array. Must be a multiple of the byte length of type.
  */
  public setAttribute(name: string, size: GLint, type: GLenum, normalized: GLboolean, stride: GLsizei, offset: GLintptr) {

    const attribIndex = this.gl.getAttribLocation(this.program, name);

    this.gl.enableVertexAttribArray(attribIndex);
    this.gl.vertexAttribPointer(attribIndex, size, type, normalized, stride, offset);

  }


  /**
         * Set the unifrom boolean to the specified boolean value.
         * @param name uniform name
         * @param value 1.0 as true or 0.0 as false assuming boolean value to use
         */
  public setBool(name: string, value: 1.0 | 0.0) {

    this.gl.uniform1f(this.gl.getUniformLocation(this.program, name), value);

  }

  /**
     * Set the unifrom integer to the specified integer value.
     * @param name uniform name
     * @param value integer value to use
     */
  public setInt(name: string, value: GLint) {

    this.gl.uniform1i(this.gl.getUniformLocation(this.program, name), value);

  }

  /**
     * Set the unifrom float  to the specified float value.
     * @param name unifrom name
     * @param value float value to use
     */
  public setFloat(name: string, value: GLfloat) {

    this.gl.uniform1f(this.gl.getUniformLocation(this.program, name), value);

  }


  /**
     * Set the uniform vec3 to the specified vec3.
     * @param name uniform name
     * @param vec vec3 to use
     */
  public setVec3(name: string, vec3: Float32List) {

    this.gl.uniform3fv(this.gl.getUniformLocation(this.program, name), vec3);

  }

  /**
     * Set the uniform vec4 to the specified vec4.
     * @param name unofrm name
     * @param vec vec4 to use
     */
  public setVec4(name: string, vec4: Float32List) {

    this.gl.uniform3fv(this.gl.getUniformLocation(this.program, name), vec4);

  }

  /**
   * Set the uniform 3x3matrix to the specified matrix.
   * @param name uniform matrix name
   * @param mat3 3x3 matrix to use
   */
  public setMat3(name: string, mat3: Float32List) {

    this.gl.uniformMatrix3fv(this.gl.getUniformLocation(this.program, name), false, mat3);

  }

  /**
  * Set the uniform 4x4matrix to the specified matrix.
  * @param name uniform matrix name
  * @param mat4 4x4 matrix to use
  */
  public setMat4(name: string, mat4: Float32List) {

    this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, name), false, mat4);

  }

}

