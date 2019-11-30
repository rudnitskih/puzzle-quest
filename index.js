import {getPieces} from "./getPieces.js";


const canvas = document.querySelector('.canvas');
canvas.innerHTML = getPieces();
const isTestMode = location.search.includes('test');

MicroModal.init();
setZoomListeners();

if (isTestMode) {
  document.body.classList.add('test');
} else {
  document.body.classList.add('prod');
  void infinityUpdateVisiblePuzzles();
}

function setZoomListeners() {
  let currentZoom = Number(window.getComputedStyle(canvas).zoom);

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
}


function updateVisiblePieces() {
  const numberColumnName = 'Номера';
  const isOpenedColumnName = 'Пазл открытый?';
  const publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1u4ycZNkGmTczthSVnijAOzAuZ53-K8Wk76hswaSlViI/edit?usp=sharing';
  const pieces = [...document.querySelectorAll('.pc')];

  return new Promise((resolve) => {
    Tabletop.init( { key: publicSpreadsheetUrl,
      callback: (rows) => {
        function onlyUnique(value, index, self) {
          return self.indexOf(value) === index;
        }

        const values = rows
          .filter((row) => {
            return !!row[isOpenedColumnName];
          })
          .map((row) => row[numberColumnName].split(',').map((stringValue) => stringValue.trim())
          ).reduce((acc, arrayOfValues) => {
            acc = acc.concat(arrayOfValues);
            return acc;
          }, [])
          .filter(onlyUnique)
          .sort((a, b) => a - b);

        pieces.forEach((piece) => {
          if (values.includes(piece.textContent.trim())) {
            piece.classList.add('active');
          } else {
            piece.classList.remove('active');
          }
        });


        resolve();
      },
      simpleSheet: true
    })
  });
}

async function infinityUpdateVisiblePuzzles() {
  await updateVisiblePieces();

  setTimeout(() => {
    void infinityUpdateVisiblePuzzles();
  }, 5000)
}
