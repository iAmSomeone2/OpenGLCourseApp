import "./style.css";
import vertexShaderUrl from "./shaders/shader.vs.glsl?url";
import fragmentShaderUrl from "./shaders/shader.fs.glsl?url";
import { mat4 } from "gl-matrix";
import Mesh from "./rendering/mesh";
import Shader from "./rendering/shader";
import { downloadTextFile } from "./utils";
import Model from "./rendering/model";
import InputHandler from "./input";
import Camera from "./rendering/camera";

// -----------
// -- SETUP --
// -----------

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const CANVAS_ID = "gl-app";
const PERF_INFO_ID = "perf-info";
const FPS_INFO_ID = "fps-info";
const FRAMETIME_INFO_ID = "frametime-info";

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div id="${PERF_INFO_ID}">
      <p id="${FPS_INFO_ID}">00.00 FPS</p>
      <p id="${FRAMETIME_INFO_ID}">0.000 ms</p>
    </div>
    <canvas id="${CANVAS_ID}" width="${CANVAS_WIDTH}px" height="${CANVAS_HEIGHT}px"></canvas>
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
// const FRAMETIME_CAPTURE_COUNT = 500;
let frametimes: number[] = new Array<number>();

let camera: Camera | null = null;

function createPyramidMesh(): Mesh {
  if (!gl) {
    throw Error("Valid WebGL context required to construct model.");
  }

  const indices = [
    0, 4, 1,
    1, 4, 2,
    2, 4, 0,
    0, 1, 2,
    2, 3, 4,
    4, 0, 3,
    3, 2, 0
  ];

  const vertices = [
    -1.0, -1.0, 0.0,  // 0
    0.0, -1.0, 1.0,   // 1 
    1.0, -1.0, 0.0,   // 2
    0.0, -1.0, -1.0,  // 3
    0.0, 1.0, 0.0     // 4
  ];


  return new Mesh(gl, vertices, indices);
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

function updatePerformanceInfo(): void {
  // Calculate average frametime and FPS
  let totalFt = 0;
  for (const ft of frametimes) {
    totalFt += ft;
  }
  const avgFt = totalFt / frametimes.length;
  const fps = 1 / avgFt;

  frametimes = [];

  const fpsInfo = document.getElementById(FPS_INFO_ID) as HTMLParagraphElement;
  const frametimeInfo = document.getElementById(FRAMETIME_INFO_ID) as HTMLParagraphElement;

  const fpsFormat = new Intl.NumberFormat("en-US", {
    style: "decimal",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    minimumIntegerDigits: 2,
  });

  const msFormat = new Intl.NumberFormat("en-US", {
    style: "unit",
    unit: "millisecond",
    unitDisplay: 'short'
  });

  fpsInfo.innerText = `${fpsFormat.format(fps)} FPS`;
  frametimeInfo.innerText = `${msFormat.format(avgFt * 1000)}`;
}

function update(time: DOMHighResTimeStamp): void {
  if (!gl || !camera) {
    console.error("A required rendering component is 'null'");
    return;
  }
  // Update deltaTime
  const deltaTime = (time - lastFrameTime) / 1000;
  lastFrameTime = time;
  frametimes.push(deltaTime);

  // Poll inputs
  const pointerPosDelta = inputHandler.pollPointerPositionDelta();
  const keyEvents = inputHandler.pollKeyboardEvents();

  // Update logic
  camera.mouseControl(pointerPosDelta, deltaTime);
  camera.keyControl(keyEvents, deltaTime);

  // const angleIncrement = (ANGLE_INCREMENT * deltaTime)
  // models[0].rotateBy(angleIncrement, 0, 0);
  // models[1].rotateBy(0, angleIncrement, 0);

  // Draw
  {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const viewMatrix = camera.getViewMatrix();
    // Render models
    for (const model of models) {
      model.render(gl, projectionMatrix, viewMatrix);
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

  camera = new Camera([0, 0, 2.5]);

  // Set up projection matrix
  mat4.perspective(projectionMatrix, FOV, ASPECT_RATIO, 0.1, 100.0);

  // Create models
  const pyramidMesh = createPyramidMesh();

  models.push(new Model(pyramidMesh, axisShader));
  models[0].setTranslation(0, -0.5, 0)
  models[0].setScale(0.45, 0.45, 0.45)

  models.push(new Model(pyramidMesh, axisShader));
  models[1].setTranslation(0, 0.5, 0)
  models[1].setScale(0.45, 0.45, 0.45)
  models[1].setRotation(0, 90, 0);

  // Set up depth buffer
  gl.enable(gl.DEPTH_TEST);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  setInterval(updatePerformanceInfo, 500);

  // Start update loop
  window.requestAnimationFrame(update);
}
