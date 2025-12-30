import cube from "./models/cube.js";
import penger from "./models/penger.js";
import Gun from "./models/Gun.js";
import stairs from "./models/stairs.js";
import BirchTree_1 from "./models/BirchTree_1.js";
import Cactus_1 from "./models/Cactus_1.js";
import PalmTree_1 from "./models/PalmTree_1.js";
import { parseOBJ } from "./utils.js";
import { modelChanged } from "./index.js";

export const models = {
  cube,
  penger,
  Gun,
  stairs,
  BirchTree_1,
  Cactus_1,
  PalmTree_1,
};
const DEFAULT_MODEL = "stairs";

export const selectBtn = document.getElementById("select-model");

// Populate model selection dropdown
Object.keys(models).forEach((modelName) => {
  const option = document.createElement("option");
  option.value = modelName;
  option.textContent = modelName.toUpperCase();
  if (modelName === DEFAULT_MODEL) option.selected = true;
  selectBtn.appendChild(option);
});

const rotateBtn = document.getElementById("rotate");
const move = document.getElementById("move");
const trianglesBtn = document.getElementById("triangles");
const pointsBtn = document.getElementById("points");
const edgesBtn = document.getElementById("edges");
const backfaceBtn = document.getElementById("backface");
const fileInput = document.getElementById("file");

export const SETTINGS = {
  rotateEnabled: true,
  moveEnabled: false,
  POINT_SIZE: 0,
  LINE_COLOR: "transparent",
  renderTriangles: true,
  renderBackfaces: true,
};

rotateBtn.addEventListener("change", (e) => {
  if (e.target.checked) {
    SETTINGS.rotateEnabled = true;
  } else {
    SETTINGS.rotateEnabled = false;
  }
});
move.addEventListener("change", (e) => {
  if (e.target.checked) {
    SETTINGS.moveEnabled = true;
  } else {
    SETTINGS.moveEnabled = false;
  }
});
trianglesBtn.addEventListener("change", (e) => {
  if (e.target.checked) {
    SETTINGS.renderTriangles = true;
  } else {
    SETTINGS.renderTriangles = false;
  }
});
pointsBtn.addEventListener("change", (e) => {
  if (e.target.checked) {
    SETTINGS.POINT_SIZE = 2;
  } else {
    SETTINGS.POINT_SIZE = 0;
  }
});
edgesBtn.addEventListener("change", (e) => {
  if (e.target.checked) {
    SETTINGS.LINE_COLOR = "#0392f7";
  } else {
    SETTINGS.LINE_COLOR = "transparent";
  }
});

backfaceBtn.addEventListener("change", (e) => {
  if (e.target.checked) {
    SETTINGS.renderBackfaces = true;
  } else {
    SETTINGS.renderBackfaces = false;
  }
});

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const contents = event.target.result;
    let model;

    if (file.name.endsWith(".obj")) {
      model = parseOBJ(contents);
    } else {
      alert("Unsupported file format. Please upload a .obj file.");
      return;
    }
    // Add the new model to the models list and select it
    models[model.name] = model;
    const option = document.createElement("option");
    option.value = model.name;
    option.textContent = model.name.toUpperCase();
    option.selected = true;
    selectBtn.appendChild(option);
    selectBtn.value = model.name;
    modelChanged({ target: selectBtn });
  };
  reader.readAsText(file);
});
