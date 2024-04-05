const ROWS = 9;
const COLS = 9;
const SIZE = 36;

const audio = new Audio();

const body = document.getElementById("body");
const grid = document.getElementById("grid");
const timer = document.getElementById("timer");
const restart = document.getElementById("restart");

let cells;
let failedBombKey;
let revealedKeys;
let flaggedKeys;
let map;

let firstClick;
let seconds = 0;
let highlighted = false;
let intervalId;
let partyIntervalId;

restart.style.width = `${SIZE}px`;
restart.style.height = `${SIZE}px`;
restart.style.fontSize = SIZE / 1.8 + "px";

function toKey(row, col) {
  return row + "-" + col;
}

function fromKey(key) {
  return key.split("-").map(Number);
}

function createButtons() {
  grid.style.width = `${ROWS * SIZE}px`;
  grid.style.height = `${COLS * SIZE}px`;

  for (let i = 0; i < ROWS; i += 1) {
    for (let j = 0; j < COLS; j += 1) {
      let cell = document.createElement("button");

      cell.style.float = "left";
      cell.style.boxShadow = "none";
      cell.style.width = `${SIZE}px`;
      cell.style.height = `${SIZE}px`;

      cell.oncontextmenu = (event) => {
        if (failedBombKey !== null) {
          return;
        }

        event.preventDefault();
        toggleFlag(key);
        updateButtons();
      };

      cell.onclick = () => {
        if (!partyIntervalId) {
          party();
        }

        if (failedBombKey !== null) {
          return;
        }

        if (flaggedKeys.has(key)) {
          return;
        }

        revealCell(key);
        updateButtons();
      };

      grid.appendChild(cell);

      let key = toKey(i, j);
      cells.set(key, cell);
    }
  }

  restart.onclick = startGame;
}

function startGame() {
  failedBombKey = null;
  revealedKeys = new Set();
  flaggedKeys = new Set();
  map = generateMap(generateBombs());

  if (cells) {
    updateButtons();
  } else {
    cells = new Map();
    createButtons();
  }

  if (highlighted) {
    toggleBombHighlighting();
    highlighted = false;
  }
}

function updateButtons() {
  if (firstClick === undefined) {
    intervalId = setInterval(updateTimer, 1000);
    firstClick = true;
  } else {
    firstClick = false;
  }

  for (let i = 0; i < ROWS; i += 1) {
    for (let j = 0; j < COLS; j += 1) {
      let key = toKey(i, j);
      let cell = cells.get(key);

      cell.style.color = "black";
      cell.textContent = "";
      cell.disabled = false;

      let value = map.get(key);

      if (failedBombKey !== null && value === "bomb") {
        cell.disabled = true;
        cell.textContent = "💣";

        if (key === failedBombKey) {
          clearInterval(intervalId);
        }
      } else if (revealedKeys.has(key)) {
        cell.disabled = true;

        if (value === undefined) {
          // empty
        } else if (value === 1) {
          cell.textContent = "1";
        } else if (value === 2) {
          cell.textContent = "2";
        } else if (value >= 3) {
          cell.textContent = value;
        } else {
          throw Error("should never happen");
        }
      } else if (flaggedKeys.has(key)) {
        cell.textContent = "🚩";
      }
    }
  }

  if (failedBombKey !== null) {
    grid.style.pointerEvents = "none";
    restart.innerText = "😵";
    clearInterval(partyIntervalId);
    document.querySelector('#try-again').style.display = 'block';
  } else {
    grid.style.pointerEvents = "";
    restart.innerText = "🙂";
  }

  checkWinnings();
}

function toggleFlag(key) {
  if (flaggedKeys.has(key)) {
    flaggedKeys.delete(key);
  } else {
    flaggedKeys.add(key);
  }
}

function revealCell(key) {
  if (map.get(key) === "bomb") {
    failedBombKey = key;
  } else {
    propagateReveal(key, new Set());
  }
}

function propagateReveal(key, visited) {
  revealedKeys.add(key);
  visited.add(key);

  let isEmpty = !map.has(key);

  if (isEmpty) {
    for (let neighborKey of getNeighbors(key)) {
      if (!visited.has(neighborKey)) {
        propagateReveal(neighborKey, visited);
      }
    }
  }
}

function isInBounds([row, col]) {
  if (row < 0 || col < 0) {
    return false;
  }

  if (row >= ROWS || col >= COLS) {
    return false;
  }

  return true;
}

function getNeighbors(key) {
  let [row, col] = fromKey(key);

  let neighborRowCols = [
    [row - 1, col - 1],
    [row - 1, col],
    [row - 1, col + 1],
    [row, col - 1],
    [row, col + 1],
    [row + 1, col - 1],
    [row + 1, col],
    [row + 1, col + 1],
  ];

  return neighborRowCols.filter(isInBounds).map(([r, c]) => toKey(r, c));
}

function generateBombs() {
  let count = Math.round(Math.sqrt(ROWS * COLS));
  let allKeys = [];

  for (let i = 0; i < ROWS; i += 1) {
    for (let j = 0; j < COLS; j += 1) {
      allKeys.push(toKey(i, j));
    }
  }

  allKeys.sort(() => {
    let coinFlip = Math.random() > 0.5;

    return coinFlip ? 1 : -1;
  });

  return allKeys.slice(0, count);
}

function generateMap(seedBombs) {
  let map = new Map();

  function incrementDanger(neighborKey) {
    if (!map.has(neighborKey)) {
      map.set(neighborKey, 1);
    } else {
      let oldVal = map.get(neighborKey);

      if (oldVal !== "bomb") {
        map.set(neighborKey, oldVal + 1);
      }
    }
  }

  for (let key of seedBombs) {
    map.set(key, "bomb");

    for (let neighborKey of getNeighbors(key)) {
      incrementDanger(neighborKey);
    }
  }

  return map;
}

function checkWinnings() {
  const flaggedCells = [...flaggedKeys.keys()].sort().join();
  const bombedCells = [...map.entries()]
    .filter(([, value]) => value === "bomb")
    .map(([key]) => key)
    .sort()
    .join();

  if (
    cells.size === flaggedKeys.size + revealedKeys.size &&
    bombedCells === flaggedCells &&
    failedBombKey === null
  ) {
    restart.innerText = "😎";

    clearInterval(intervalId);
  }
}

function updateTimer() {
  seconds += 1;
  timer.textContent = seconds;
}

function party() {
  window.onload = setInterval(AudioLoop, 1000 / 10); //10fps

  audio.src = 'soundtrack.mp3';

  function AudioLoop() {
      audio.play().catch(() => {});

      if (audio.paused == true) {
          audio.play().catch(() => {});
      }
  }

  const fubars = document.querySelectorAll('.fubar');
  fubars.forEach((fubar) => {
    fubar.style.opacity = '1';
  });

  partyIntervalId = setInterval(() => {
    body.style.backgroundColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

    fubars.forEach((fubar) => {
      fubar.style.color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    });

    for (let i = 0; i < ROWS; i += 1) {
      for (let j = 0; j < COLS; j += 1) {
        let key = toKey(i, j);
        let cell = cells.get(key);

        if (cell.disabled) {
          cell.style.backgroundColor = '#fff';
        } else {
          cell.style.color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
          cell.style.backgroundColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        }
      }
    }
  }, 150);
}

startGame();
