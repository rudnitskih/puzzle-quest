import {getPieces} from "./getPieces.js";

const canvas = document.querySelector('.canvas');
let currentZoom = Number(window.getComputedStyle(canvas).zoom);

canvas.innerHTML = getPieces();

document.querySelector('.zoom_plus').addEventListener('click', () => {
  updateZoom(0.02);
});

document.querySelector('.zoom_minus').addEventListener('click', () => {
  updateZoom(-0.02);
});

function updateZoom(delta) {
  currentZoom += delta;
  canvas.style.zoom = `${currentZoom}`;
}
