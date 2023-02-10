import "./style.css";
import vertexShaderUrl from "./shaders/shader.vs.glsl?url";
import fragmentShaderUrl from "./shaders/shader.fs.glsl?url";
import { mat4 } from "gl-matrix";
import Mesh from "./rendering/mesh";
import Shader from "./rendering/shader";
import { downloadTextFile } from "./utils";
import Model from "./rendering/model";
import InputHandler from "./input";

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

// Set up user input
const inputHandler = new InputHandler(canvas);

const gl = canvas.getContext("webgl2");
run()
  .catch((reason) => {
    console.error(reason);
  });

// ---------------  
// -- EXECUTION --
// ---------------

const models = new Array<Model>();

const FOV = 45;
const ASPECT_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT;
const TO_RADIANS = Math.PI / 180;

// Triangle state
let direction = true;
const TRI_MAX_OFFSET = 0.7;
const TRI_INCREMENT = 1.0;

const ANGLE_INCREMENT = 80.0;

let sizeDirection = true;
let modelScale = 0.4;
const MIN_SCALE = 0.1;
const MAX_SCALE = 0.8;
const SCALE_INCREMENT = 0.1;

const projectionMatrix = mat4.create();

let lastFrameTime: number = 0;

function createPyramidModel(shader: Shader): Model {
  if (!gl) {
    throw Error("Valid WebGL context required to construct model.");
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


  const mesh = new Mesh(gl, vertices, indices);
  return new Model(mesh, shader);
}

// function updateTriangleModel(deltaTime: number): mat4 {
//   if (direction) {
//     triOffset += (TRI_INCREMENT * deltaTime);
//   } else {
//     triOffset -= (TRI_INCREMENT * deltaTime);
//   }

//   if (Math.abs(triOffset) >= TRI_MAX_OFFSET) {
//     direction = !direction;
//   }

//   currentAngle += ANGLE_INCREMENT * deltaTime;
//   if (currentAngle >= 360.0) {
//     currentAngle -= 360.0;
//   }

//   if (sizeDirection) {
//     modelScale += (SCALE_INCREMENT * deltaTime);
//   } else {
//     modelScale -= (SCALE_INCREMENT * deltaTime);
//   }

//   if (modelScale <= MIN_SCALE || modelScale >= MAX_SCALE) {
//     sizeDirection = !sizeDirection;
//   }

//   let modelMatrix: mat4 = mat4.create();
//   mat4.translate(modelMatrix, modelMatrix, [0, -0.5, -2.5]);
//   mat4.rotateY(modelMatrix, modelMatrix, currentAngle * TO_RADIANS);
//   mat4.scale(modelMatrix, modelMatrix, [0.4, 0.4, 1.0]);

//   return modelMatrix;
// }

function update(time: DOMHighResTimeStamp): void {
  if (!gl) {
    console.error("A required rendering component is 'null'");
    return;
  }
  // Update deltaTime
  const deltaTime = (time - lastFrameTime) / 1000;
  lastFrameTime = time;

  // Poll inputs
  const relativePointerPos = inputHandler.pollRelativePointerPosition();

  // Update logic
  const angleIncrement = ANGLE_INCREMENT * deltaTime;
  models[0].rotateBy(0, angleIncrement, 0);
  models[1].rotateBy(0, -angleIncrement, 0);

  // Draw
  {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Render models
    for (const model of models) {
      model.render(gl, projectionMatrix);
    }
  }

  window.requestAnimationFrame(update);
}

async function run(): Promise<void> {
  if (!gl) {
    return Promise.reject("A browser with support for WebGL2 is required.");
  }

  // Create shader program
  const vertexShaderSrc = await downloadTextFile(vertexShaderUrl);
  const fragmentShaderSrc = await downloadTextFile(fragmentShaderUrl);

  const axisShader = Shader.createFromStrings(gl, vertexShaderSrc, fragmentShaderSrc);

  // Set up projection matrix
  mat4.perspective(projectionMatrix, FOV, ASPECT_RATIO, 0.1, 100.0);

  // Create models
  models.push(createPyramidModel(axisShader));
  models[0].setTranslation(0, -0.5, -2.5)
  models[0].setScale(0.45, 0.45, 0.45)

  models.push(createPyramidModel(axisShader));
  models[1].setTranslation(0, 0.5, -2.5)
  models[1].setScale(0.45, 0.45, 0.45)

  // Set up depth buffer
  gl.enable(gl.DEPTH_TEST);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Start update loop
  window.requestAnimationFrame(update);
}
