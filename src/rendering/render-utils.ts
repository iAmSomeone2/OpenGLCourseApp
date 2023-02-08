import { downloadTextFile } from "../utils";

export async function createShader(gl: WebGL2RenderingContext, type: number, sourceUrl: string): Promise<WebGLShader> {
  const source = await downloadTextFile(sourceUrl);

  const shader = gl.createShader(type);
  if (!shader) {
    return Promise.reject("Failed to allocate shader.");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    gl.deleteShader(shader);
    const infoLog = gl.getShaderInfoLog(shader) ?? "Unknown shader compilation error";
    return Promise.reject(infoLog);
  }

  return Promise.resolve(shader);
}

export function compileShaderProgram(gl: WebGL2RenderingContext, shaders: WebGLShader[]): WebGLProgram {
  const program = gl.createProgram();
  if (!program) {
    throw Error("Failed to allocate shader program");
  }

  for (const shader of shaders) {
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    gl.deleteProgram(program);
    const errorLog = gl.getProgramInfoLog(program) ?? "Unknown shader linking error";
    throw Error(errorLog);
  }

  return program;
}
