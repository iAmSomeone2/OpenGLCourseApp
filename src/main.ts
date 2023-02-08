import "./style.css";
import vertexShaderUrl from "./shaders/shader.vs.glsl?url";
import fragmentShaderUrl from "./shaders/shader.fs.glsl?url";
import { compileShaderProgram, createShader } from './rendering/render-utils';
import { mat4 } from "gl-matrix";

// -----------
// -- SETUP --
// -----------

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const CANVAS_ID = "gl-app";

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <canvas id="${CANVAS_ID}" width="${CANVAS_WIDTH}px" height="${CANVAS_HEIGHT}px"></canvas
`;

const canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement;

const gl = canvas.getContext("webgl2");
run()
  .catch((reason) => {
    console.error(reason);
  });

// ---------------  
// -- EXECUTION --
// ---------------

const FOV = 45;
const ASPECT_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT;
const TO_RADIANS = Math.PI / 180;

// Triangle state
let direction = true;
let triOffset = 0.0;
const TRI_MAX_OFFSET = 0.7;
const TRI_INCREMENT = 1.0;

let currentAngle = 0.0;
const ANGLE_INCREMENT = 20.0;

let sizeDirection = true;
let modelScale = 0.4;
const MIN_SCALE = 0.1;
const MAX_SCALE = 0.8;
const SCALE_INCREMENT = 0.1;

let shaderProgram: WebGLProgram | null = null;
/** Vertex buffer object */
let vbo: WebGLBuffer | null = null;
/** Index buffer object */
let ibo: WebGLBuffer | null = null;
/** Vertex array object */
let vao: WebGLVertexArrayObject | null = null;

let uniformModel: WebGLUniformLocation | null = null;
let projectionModel: WebGLUniformLocation | null = null;

let projectionMatrix = mat4.create();

let lastFrameTime: number = 0;

function createTriangle() {
  if (!gl) {
    return;
  }

  const indices = [
    0, 3, 1,
    1, 3, 2,
    2, 3, 0,
    0, 1, 2
  ];

  const vertices = [
    -1.0, -1.0, 0.0,  // 0
    0.0, -1.0, 1.0,   // 1 
    1.0, -1.0, 0.0,   // 2
    0.0, 1.0, 0.0     // 3
  ];

  // Create vertex buffer
  vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  {
    ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);

    vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    {
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
  gl.bindVertexArray(null);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

function updateTriangleModel(deltaTime: number): mat4 {
  if (direction) {
    triOffset += (TRI_INCREMENT * deltaTime);
  } else {
    triOffset -= (TRI_INCREMENT * deltaTime);
  }

  if (Math.abs(triOffset) >= TRI_MAX_OFFSET) {
    direction = !direction;
  }

  currentAngle += ANGLE_INCREMENT * deltaTime;
  if (currentAngle >= 360.0) {
    currentAngle -= 360.0;
  }

  if (sizeDirection) {
    modelScale += (SCALE_INCREMENT * deltaTime);
  } else {
    modelScale -= (SCALE_INCREMENT * deltaTime);
  }

  if (modelScale <= MIN_SCALE || modelScale >= MAX_SCALE) {
    sizeDirection = !sizeDirection;
  }

  let modelMatrix: mat4 = mat4.create();
  mat4.translate(modelMatrix, modelMatrix, [0, 0, -2.5]);
  mat4.rotateY(modelMatrix, modelMatrix, currentAngle * TO_RADIANS);
  mat4.scale(modelMatrix, modelMatrix, [0.4, 0.4, 1.0]);

  return modelMatrix;
}

function update(time: DOMHighResTimeStamp): void {
  if (!gl || !shaderProgram || !vbo || !vao) {
    console.error("A required rendering component is 'null'");
    return;
  }
  // Update deltaTime
  const deltaTime = (time - lastFrameTime) / 1000;
  lastFrameTime = time;

  // Update logic
  const triModel = updateTriangleModel(deltaTime);

  // Draw
  {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(shaderProgram);
    {
      gl.uniformMatrix4fv(uniformModel, false, new Float32Array(triModel));
      gl.uniformMatrix4fv(projectionModel, false, new Float32Array(projectionMatrix));

      gl.bindVertexArray(vao);
      {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.drawElements(gl.TRIANGLES, 12, gl.UNSIGNED_INT, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      }
      gl.bindVertexArray(null);
    }
    gl.useProgram(null);
  }

  window.requestAnimationFrame(update);
}

async function run(): Promise<void> {
  if (!gl) {
    return Promise.reject("A browser with support for WebGL2 is required.");
  }

  // Create shader program
  const vertexShader = await createShader(gl, gl.VERTEX_SHADER, vertexShaderUrl);
  const fragmentShader = await createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderUrl);

  shaderProgram = compileShaderProgram(gl, [vertexShader, fragmentShader]);

  uniformModel = gl.getUniformLocation(shaderProgram, "model");
  projectionModel = gl.getUniformLocation(shaderProgram, "projection");

  // Set up projection matrix
  mat4.perspective(projectionMatrix, FOV, ASPECT_RATIO, 0.1, 100.0);

  // Create triangle
  createTriangle();

  // Set up depth buffer
  gl.enable(gl.DEPTH_TEST);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Start update loop
  window.requestAnimationFrame(update);
}