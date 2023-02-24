import "./style.css";
import vertexShaderUrl from "./shaders/shader.vs.glsl?url";
import fragmentShaderUrl from "./shaders/shader.fs.glsl?url";
import woodTexture1Url from "/textures/wood1.jpg?url";
import woodTexture2Url from "/textures/wood2.jpg?url";
import whiteTextureUrl from "/textures/white_square.png?url";

import { mat4 } from "gl-matrix";
import Mesh from "./rendering/mesh";
import Shader from "./rendering/shader";
import { calculateAverageNormals, downloadTextFile } from "./utils";
import Model from "./rendering/model";
import InputHandler from "./input";
import Camera from "./rendering/camera";
import Texture from "./rendering/texture";
import { DirectionalLight, PointLight } from "./rendering/light";
import Material from "./rendering/material";

// -----------
// -- SETUP --
// -----------

// const CANVAS_WIDTH = 1280;
// const CANVAS_HEIGHT = 720;

const CANVAS_ID = "gl-app";
const PERF_INFO_ID = "perf-info";
const FPS_INFO_ID = "fps-info";
const FRAMETIME_INFO_ID = "frametime-info";
const RESOLUTION_INFO = "resolution-info";

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
      <div id="${PERF_INFO_ID}">
        <p id="${FPS_INFO_ID}" class="stat">00.00 FPS</p>
        <p id="${FRAMETIME_INFO_ID}" class="stat">0.000 ms</p>
        <p id="${RESOLUTION_INFO}" class="stat">0000 x 0000</p>
      </div>
    <canvas id="${CANVAS_ID}">
    </canvas>
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
let directionalLight: DirectionalLight | null = null;
let pointLights: PointLight[] = [];

const FOV = 45;
// const ASPECT_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT;

const ANGLE_INCREMENT = 80.0;

const projectionMatrix = mat4.create();

let lastFrameTime: number = 0;
let frametimes: number[] = new Array<number>();

let camera: Camera | null = null;

function createPyramidMesh(): Mesh {
  if (!gl) {
    throw Error("Valid WebGL context required to construct model.");
  }

  const indices = [
    0, 4, 1,
    1, 4, 2,
    2, 4, 3,
    3, 4, 0,
    0, 1, 2,
    2, 3, 0
  ];

  const vertices = [
    // X     Y     Z    U    V    nX   nY   nZ
    -1.0, -1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, // 0
    0.0, -1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, // 1 
    1.0, -1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, // 2
    0.0, -1.0, -1.0, 1.0, 0.0, 0.0, 0.0, 0.0, // 3
    0.0, 1.0, 0.0, 0.5, 1.0, 0.0, 0.0, 0.0, // 4
  ];


  calculateAverageNormals(indices, vertices, 8, 5);

  return new Mesh(gl, vertices, indices);
}

function createFloorMesh(): Mesh {
  if (!gl) {
    throw Error("Valid WebGL context required to construct model.");
  }

  const indices = [
    0, 1, 3,
    3, 1, 2
  ];

  const vertices = [
    // X     Y     Z    U    V    nX   nY   nZ
    -1.0, 0.0, 1.0, 0.0, 0.0, 0.0, -1.0, 0.0, // 0
    1.0, 0.0, 1.0, 10.0, 0.0, 0.0, -1.0, 0.0, // 1 
    1.0, 0.0, -1.0, 10.0, 10.0, 0.0, -1.0, 0.0, // 2
    -1.0, 0.0, -1.0, 0.0, 10.0, 0.0, -1.0, 0.0, // 3
  ];

  // calculateAverageNormals(indices, vertices, 8, 5);

  return new Mesh(gl, vertices, indices);
}

function createPointLights(): void {
  // Light 1
  const pLight1 = new PointLight(gl!, 0.3, 0.2, 0.1);
  pLight1.setColor(1.0, 0.0, 0.0);
  pLight1.setPosition(-2.0, 0, 0);
  pLight1.setIntensity(0.01);
  pLight1.setDiffuseIntensity(2.0);

  pointLights.push(pLight1);

  // Light 2
  const pLight2 = new PointLight(gl!, 0.3, 0.2, 0.1);
  pLight2.setColor(0.0, 0.0, 1.0);
  pLight2.setPosition(2.0, 0, 0.0);
  pLight2.setIntensity(0.01);
  pLight2.setDiffuseIntensity(2.0);

  pointLights.push(pLight2);

  // Light 3
  const pLight3 = new PointLight(gl!, 0.3, 0.2, 0.1);
  pLight3.setColor(0.0, 1.0, 0.0);
  pLight3.setPosition(0.0, 0, 2.0);
  pLight3.setIntensity(0.01);
  pLight3.setDiffuseIntensity(2.0);

  pointLights.push(pLight3);
}

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

function resizeViewport(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const aspectRatio = gl!.canvas.width / gl!.canvas.height;
  // Set up projection matrix
  mat4.perspective(projectionMatrix, FOV, aspectRatio, 0.1, 100.0);
  // Update viewport
  gl?.viewport(0, 0, gl!.canvas.width, gl!.canvas.height);

  // Update resolution info
  const resolutionInfo = document.getElementById(RESOLUTION_INFO) as HTMLParagraphElement;
  resolutionInfo.innerText = `${canvas.width} x ${canvas.height}`;
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

  const angleIncrement = (ANGLE_INCREMENT * deltaTime)
  models[0].rotateBy(0, angleIncrement, 0);
  // models[1].rotateBy(0, angleIncrement, 0);

  // Draw
  {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const viewMatrix = camera.getViewMatrix();
    // Render models
    for (const model of models) {
      model.render(projectionMatrix, viewMatrix, camera.getPosition(), directionalLight!, pointLights);
    }
  }

  window.requestAnimationFrame(update);
}

async function run(): Promise<void> {
  if (!gl) {
    return Promise.reject("A browser with support for WebGL2 is required.");
  }

  // Load textures
  const texPromise0 = Texture.createFromUrl(gl, woodTexture1Url);
  // const texPromise1 = Texture.createFromUrl(gl, woodTexture2Url);
  const texPromise2 = Texture.createFromUrl(gl, whiteTextureUrl);

  // Create shader program
  const vertexShaderSrc = await downloadTextFile(vertexShaderUrl);
  const fragmentShaderSrc = await downloadTextFile(fragmentShaderUrl);

  const axisShader = Shader.createFromStrings(gl, vertexShaderSrc, fragmentShaderSrc);

  camera = new Camera([0, 0, 2.5]);

  // Create models
  const pyramidMesh = createPyramidMesh();
  const material = new Material(gl, 0.1, 2);
  const shinyMaterial = new Material(gl, 10, 256);

  // models.push(new Model(gl, pyramidMesh, axisShader));
  // models[0].setTranslation(0, -0.5, -2.5);
  // models[0].setScale(0.45, 0.45, 0.45);
  // models[0].setRotation(180, 0, 0);
  // try {
  //   models[0].setAlbedo(await texPromise0);
  // } catch (reason) {
  //   console.error(reason);
  // }
  // models[0].setMaterial(material);

  models.push(new Model(gl, pyramidMesh, axisShader));
  models[0].setScale(0.45, 0.45, 0.45);
  try {
    models[0].setAlbedo(await texPromise0);
  } catch (reason) {
    console.error(reason);
  }
  models[0].setMaterial(material);

  models.push(new Model(gl, createFloorMesh(), axisShader));
  models[1].setTranslation(0, -0.98, 0.0);
  models[1].setScale(10, 10, 10);
  try {
    models[1].setAlbedo(await texPromise2);
  } catch (reason) {
    console.error(reason);
  }
  models[1].setMaterial(shinyMaterial);

  // Set up directional light

  directionalLight = new DirectionalLight(gl);
  directionalLight.setDirection(-1.0, -1, 0.0);
  directionalLight.setIntensity(0.3);
  directionalLight.setDiffuseIntensity(0.4);

  // Set up point lights
  createPointLights();

  // Set up depth buffer
  gl.enable(gl.DEPTH_TEST);

  resizeViewport();
  window.onresize = (_ev) => {
    resizeViewport();
  }

  setInterval(updatePerformanceInfo, 500);

  // Start update loop
  window.requestAnimationFrame(update);
}
