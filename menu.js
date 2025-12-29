const rotateBtn = document.getElementById("rotate");
const move = document.getElementById("move");
const pointsBtn = document.getElementById("points");
const edgesBtn = document.getElementById("edges");
const backfaceBtn = document.getElementById("backface");

export const SETTINGS = {
  rotateEnabled: true,
  moveEnabled: false,
  POINT_SIZE: 0,
  LINE_COLOR: "transparent",
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
