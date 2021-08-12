import {getPieces} from "./getPieces.js";

const canvas = document.querySelector('.canvas');
const modalNext = document.querySelector('.modal__next');
const modalInput = document.querySelector('.modal__input');
canvas.innerHTML = getPieces();
const isTestMode = location.search.includes('test');

MicroModal.init();
setZoomListeners();

(async function init() {
  if (isTestMode) {
    document.body.classList.add('test');
  } else {
    document.body.classList.add('prod');
    window.currentTask = 100;
    await Promise.all([loadPuzzleData(), getCurrentStep()]);

    updateVisiblePieces();
    updateTaskModal();
  }
})();


modalInput.addEventListener('input', (e) => {
    modalNext.disabled = (e.target.value || '').toLowerCase() !== window.puzzleTasks[window.currentTask].password.toLowerCase();
});

modalNext.addEventListener('click', () => {
  setCurrentTask(window.currentTask + 1);
});


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


function loadPuzzleData() {
  return Promise.resolve(null); // test

  const publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1u4ycZNkGmTczthSVnijAOzAuZ53-K8Wk76hswaSlViI/edit?usp=sharing';

  return new Promise((resolve) => {
    Tabletop.init( { key: publicSpreadsheetUrl,
      callback: (data) => {
        const taskDescriptionColumnName = 'Задание';
        const taskPasswordColumnName = 'Пароль';
        const taskNumberName = 'Номер задачи';

        window.puzzleData = data;
        window.puzzleTasks = data.reduce((acc, row) => {
          if (row[taskDescriptionColumnName] && row[taskPasswordColumnName]) {
            acc[Number(row[taskNumberName])] = {
              description: row[taskDescriptionColumnName],
              password: row[taskPasswordColumnName],
            }
          }

          return acc;
        }, []);

        resolve();
      },
      simpleSheet: true
    })
  });
}

function updateVisiblePieces() {
  const pieces = [...document.querySelectorAll('.pc')];
  const numberColumnName = 'Номера';
  const taskNumber = 'Номер задачи';

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  const values = window.puzzleData
    .filter((row) => {
      return Number(row[taskNumber]) < window.currentTask;
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
}

function updateTaskModal(currentTaskNumber = window.currentTask) {
  const modalTitle = document.querySelector('.modal__title');
  const modalDescription = document.querySelector('.modal__task-description');

  modalTitle.innerHTML = `Задание ${currentTaskNumber} из ${window.puzzleTasks.length - 1}`;
  modalDescription.innerHTML = window.puzzleTasks[currentTaskNumber].description;

  modalNext.disabled = true;
  modalInput.value = '';


  if (currentTaskNumber === window.puzzleTasks.length - 1) {
    modalInput.style.display = 'none';
    modalNext.style.display = 'none';
  }
}

async function getCurrentStep() {
  const response = await fetch('https://5de6a2cab1ad690014a4dc7c.mockapi.io/tasks/1');
  const {currentTask} = await response.json();

  window.currentTask = currentTask;
}

async function setCurrentTask(state) {
  window.currentTask = state;
  updateVisiblePieces();
  updateTaskModal();

  return await fetch('https://5de6a2cab1ad690014a4dc7c.mockapi.io/tasks/1', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      currentTask: state,
    })
  });
}

window.setCurrentTask = setCurrentTask;
