export interface ProgramInfo {
  program: WebGLProgram,
  attribLocations: {
    position: number,
    normal: number,
    texCoord: number,
  },
  uniformLocations: {
    projection: number,
    view: number,
    model: number,
    normal: number,
    uSampler: number,
  },
};

