import cube from "./models/cube.js";
import penger from "./models/penger.js";
import Gun from "./models/Gun.js";
import stairs from "./models/stairs.js";
import BirchTree_1 from "./models/BirchTree_1.js";
import Cactus_1 from "./models/Cactus_1.js";
import PalmTree_1 from "./models/PalmTree_1.js";

const rotateBtn = document.getElementById("rotate");
const move = document.getElementById("move");
const pointsBtn = document.getElementById("points");
const edgesBtn = document.getElementById("edges");
const backfaceBtn = document.getElementById("backface");
export const select = document.getElementById("select-model");

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

// Populate model selection dropdown
Object.keys(models).forEach((modelName) => {
  const option = document.createElement("option");
  option.value = modelName;
  option.textContent = modelName.toUpperCase();
  if (modelName === DEFAULT_MODEL) option.selected = true;
  select.appendChild(option);
});

export const SETTINGS = {
  rotateEnabled: true,
  moveEnabled: false,
  POINT_SIZE: 0,
  LINE_COLOR: "transparent",
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
