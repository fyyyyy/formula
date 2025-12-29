const BACKGROUND = "rgba(40, 63, 86, 1)";
let LINE_COLOR = "transparent";
let POINT_SIZE = 0;

import cube from "./cube.js";
import penger from "./penger.js";
import Gun from "./Gun.js";
import stairs from "./stairs.js";
import BirchTree_1 from "./BirchTree_1.js";
import Cactus_1 from "./Cactus_1.js";
import PalmTree_1 from "./PalmTree_1.js";
import { shade, dotproduct, normal, normalise } from "./utils.js";

const models = { cube, penger, Gun, stairs, BirchTree_1, Cactus_1, PalmTree_1 };
let currentModel;
let vs;
let fs;
let dz;

game.width = 800;
game.height = 800;
const ctx = game.getContext("2d");
console.log(game, ctx);

let max_dz;
const min_dz = 0.5;
const focal = 1.2; // Focal distance of virtual lens
const FPS = 59.94;

// Shader settings
const SHADER_SETTINGS = {
  materialColor: "#36C",
  lightVector: normalise([0.5, 0.5, -1]),
  lightColor: "#aa1",
  ambientColor: "#000",
  intensity: 1.5,
};

const select = document.getElementById("select-model");
const rotateBtn = document.getElementById("rotate");
const move = document.getElementById("move");
const pointsBtn = document.getElementById("points");
const edgesBtn = document.getElementById("edges");
const backfaceBtn = document.getElementById("backface");

// Populate model selection dropdown
Object.keys(models).forEach((modelName) => {
  const option = document.createElement("option");
  option.value = modelName;
  option.textContent = modelName.toUpperCase();
  select.appendChild(option);
});

select.addEventListener("change", modelChanged);

function modelChanged(e) {
  const model = e.target.value;
  console.log("Selected model:", model);

  // load selected model
  currentModel = models[model];
  vs = currentModel.vs;
  fs = currentModel.fs;

  // calculate z distance offset
  const maxZ = structuredClone(vs).sort((a, b) => b.z - a.z)[0].z;
  dz = maxZ * 2.5;

  // calculate max z movement based on model size
  max_dz = Math.max(dz * 2, 2);
}

let angleX = 0;
let angleY = 0;
let rotateEnabled = true;
let moveEnabled = false;

rotateBtn.addEventListener("change", (e) => {
  if (e.target.checked) {
    rotateEnabled = true;
  } else {
    rotateEnabled = false;
  }
});

move.addEventListener("change", (e) => {
  if (e.target.checked) {
    moveEnabled = true;
  } else {
    moveEnabled = false;
  }
});

pointsBtn.addEventListener("change", (e) => {
  if (e.target.checked) {
    POINT_SIZE = 2;
  } else {
    POINT_SIZE = 0;
  }
});

edgesBtn.addEventListener("change", (e) => {
  if (e.target.checked) {
    LINE_COLOR = "#0392f7";
  } else {
    LINE_COLOR = "transparent";
  }
});

let renderBackfaces = true;
backfaceBtn.addEventListener("change", (e) => {
  if (e.target.checked) {
    renderBackfaces = true;
  } else {
    renderBackfaces = false;
  }
});

// Initialize with the first model
modelChanged({ target: select });

// Clear the canvas
function clear() {
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, game.width, game.height);
}

function drawPoint({ x, y, z }) {
  // points disabled ?
  if (POINT_SIZE === 0) return;

  const s = (POINT_SIZE * dz) / z;
  const a = alpha(z);
  ctx.fillStyle = "#" + a + a + "88";
  ctx.lineWidth = 1;
  ctx.beginPath();

  if (s > 0) ctx.ellipse(x, y, s, s, 0, 0, 2 * Math.PI);
  // too close to camera ?
  else moveDirection = +1;

  ctx.fill();
  ctx.closePath();
}

// calculate alpha value based on z distance
function alpha(z) {
  return ((dz / z) * 100).toString(16).padStart(2, "0").slice(0, 2);
}

function drawLine(p1, p2) {
  if (LINE_COLOR === "transparent") return;
  if (p1.z < 0.01 || p2.z < 0.01) return;
  ctx.lineWidth = dz / p1.z / 2;
  ctx.strokeStyle = LINE_COLOR + alpha((p1.z + p2.z) / 2);

  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

function drawTris(p1, p2, p3) {
  const trinormal = normal(p1, p2, p3);
  // Get vector of camera to triangle
  const cameraVector = normalise([
    p1.x + p2.x + p3.x,
    p1.y + p2.y + p3.y,
    p1.z + p2.z + p3.z,
  ]);

  const dotprod = dotproduct(trinormal, cameraVector);
  if (!renderBackfaces && dotprod < 0) return; // backface culling

  ctx.fillStyle = shade(
    SHADER_SETTINGS.materialColor,
    SHADER_SETTINGS.ambientColor,
    SHADER_SETTINGS.lightVector,
    SHADER_SETTINGS.lightColor,
    SHADER_SETTINGS.intensity,
    trinormal,
    dotprod
  );

  const s1 = screen(project(translate_z(p1, dz)));
  const s2 = screen(project(translate_z(p2, dz)));
  const s3 = screen(project(translate_z(p3, dz)));

  ctx.lineWidth = dz / s1.z;
  ctx.beginPath();
  ctx.moveTo(s1.x, s1.y);
  ctx.lineTo(s2.x, s2.y);
  ctx.lineTo(s3.x, s3.y);
  ctx.fill();
  ctx.closePath();
}

function drawScreenInfo() {
  ctx.fillStyle = "#11CCFF66";
  ctx.font = "16px Systemui, sans-serif";
  ctx.fillText(`FPS: ${FPS}`, 600, 50);
  ctx.fillText(`Focal: ${focal}`, 600, 70);
  ctx.fillText(`Z Distance: ${dz.toFixed(2)}`, 600, 90);
  ctx.fillText(`Points: ${vs.length}`, 600, 110);
  ctx.fillText(`Faces: ${fs.length}`, 600, 130);
}

// convert normalized vector coordinates to screen x/y coordinates
function screen(p) {
  // -1..1 => 0..2 => 0..1 => 0..w
  return {
    x: ((p.x + 1) / 2) * game.width,
    y: (1 - (p.y + 1) / 2) * game.height,
    // z is just for later reference ( i.e. calculate alpha based on z )
    z: p.z,
  };
}

// project 3D point to 2D using perspective projection
function project({ x, y, z }) {
  return {
    x: (x / z) * focal,
    y: (y / z) * focal,
    // z is just for later reference ( i.e. calculate alpha based on z )
    z: z,
  };
}

// move point along z axis
function translate_z({ x, y, z }, dz) {
  return { x, y, z: z + dz };
}

// rotate point around XZ axis
function rotate_xz({ x, y, z }, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    x: x * c - z * s,
    y,
    z: x * s + z * c,
  };
}

// rotate point around YZ axis
function rotate_yz({ x, y, z }, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    x,
    y: y * c - z * s,
    z: y * s + z * c,
  };
}

let moveDirection = 1;

function frame() {
  const dt = 1 / FPS;
  if (moveEnabled) {
    dz += 1 * dt * moveDirection * max_dz * 0.5;
    if (dz > max_dz) moveDirection = -1;
    if (dz < min_dz) moveDirection = +1;
  }

  if (rotateEnabled) {
    angleX += 0.5 * Math.PI * dt;
    angleY += 0.05 * Math.PI * dt;
    angleX %= 2 * Math.PI;
    angleY %= 2 * Math.PI;
  }

  clear();
  drawFaces();
  drawEdges();
  drawVertices();
  drawScreenInfo();

  // next frame
  setTimeout(frame, 1000 / FPS);
}

// start the animation loop
setTimeout(frame, 1000 / FPS);

function drawVertices() {
  for (const v of vs) {
    const p = rotate_xz(rotate_yz(v, angleY), angleX);
    drawPoint(screen(project(translate_z(p, dz))));
  }
}

function drawFaces() {
  for (const f of fs) {
    // rectangle
    if (f.length === 4) {
      const a = vs[f[0]];
      const b = vs[f[1]];
      const c = vs[f[2]];
      const d = vs[f[3]];

      const [ra, rb, rc, rd] = [a, b, c, d].map(rotate);

      // render 2 triangles for the rectangle
      drawTris(ra, rb, rc);
      drawTris(ra, rc, rd);

      // triangle
    } else if (f.length === 3) {
      const a = vs[f[0]];
      const b = vs[f[1]];
      const c = vs[f[2]];
      const [ra, rb, rc] = [a, b, c].map(rotate);

      drawTris(ra, rb, rc);
    }
  }
}

function rotate(point) {
  return rotate_xz(rotate_yz(point, angleY), angleX);
}

function drawEdges() {
  for (const f of fs) {
    for (let i = 0; i < f.length; ++i) {
      const a = vs[f[i]];
      const b = vs[f[(i + 1) % f.length]];
      const la = rotate_xz(rotate_yz(a, angleY), angleX);
      const lb = rotate_xz(rotate_yz(b, angleY), angleX);

      drawLine(
        screen(project(translate_z(la, dz))),
        screen(project(translate_z(lb, dz)))
      );
    }
  }
}
