/* Satellite Interference Optimizer — script.js */

let grid = [];
let N = 8;
const CELL = 52;
const GAP = 3;

/* ─── Grid generation ─── */
function generateGrid(keepCells = false) {
  N = parseInt(document.getElementById('size').value) || 8;
  N = Math.max(4, Math.min(15, N));

  if (!keepCells) {
    grid = Array.from({ length: N }, () => Array(N).fill('.'));
  }

  const gridDiv = document.getElementById('grid');
  gridDiv.innerHTML = '';
  gridDiv.style.gridTemplateColumns = `repeat(${N}, ${CELL}px)`;
  gridDiv.style.gap = GAP + 'px';
  gridDiv.style.padding = GAP + 'px';

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.onclick = () => toggleCell(i, j);
      gridDiv.appendChild(cell);
    }
  }

  clearCanvas();
  // Delay canvas resize until layout settles
  setTimeout(resizeCanvas, 100);
  updateUI();
  setStatus('IDLE', '');
  document.getElementById('scoreVal').textContent = '—';
  document.getElementById('scoreSub').textContent = 'Run solve to compute';
}

/* ─── Toggle cell state: . → X → P → . ─── */
function toggleCell(i, j) {
  if (grid[i][j] === '.') grid[i][j] = 'X';
  else if (grid[i][j] === 'X') grid[i][j] = 'P';
  else grid[i][j] = '.';
  clearCanvas();
  updateUI();
}

/* ─── Render grid state ─── */
function updateUI(solution = null) {
  document.querySelectorAll('.cell').forEach(cell => {
    const i = +cell.dataset.row;
    const j = +cell.dataset.col;

    cell.className = 'cell';
    cell.innerHTML = '';

    if (grid[i][j] === 'X') {
      cell.classList.add('blocked');
      cell.innerHTML = '<span class="cell-icon">✕</span>';
    } else if (grid[i][j] === 'P') {
      cell.classList.add('priority');
      cell.innerHTML = '<span class="cell-icon">P</span>';
    }

    if (solution && solution[i][j] === 1) {
      cell.classList.add('station');
      cell.innerHTML = '<span class="cell-icon">S</span>';
    }
  });
}

/* ─── Canvas helpers ─── */
function resizeCanvas() {
  const gridDiv = document.getElementById('grid');
  const canvas = document.getElementById('overlay');
  const rect = gridDiv.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
}

function clearCanvas() {
  const canvas = document.getElementById('overlay');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/* Returns pixel center of cell (i, j) relative to canvas top-left */
function cellCenter(i, j) {
  const off = GAP; // initial padding on the grid div
  return {
    x: off + j * (CELL + GAP) + CELL / 2,
    y: off + i * (CELL + GAP) + CELL / 2
  };
}

/* ─── Draw interference lines on canvas ─── */
function drawAttackLines(solution) {
  const canvas = document.getElementById('overlay');
  const ctx = canvas.getContext('2d');
  clearCanvas();

  const W = canvas.width;
  const H = canvas.height;

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      if (solution[i][j] !== 1) continue;

      const { x, y } = cellCenter(i, j);

      ctx.lineWidth = 1;

      // Row & Column — cyan
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.18)';
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();

      // Diagonals — purple
      ctx.strokeStyle = 'rgba(124, 58, 237, 0.18)';

      // Diagonal ↘
      ctx.beginPath();
      const dx1 = Math.min(x, y);
      ctx.moveTo(x - dx1, y - dx1);
      const dx2 = Math.min(W - x, H - y);
      ctx.lineTo(x + dx2, y + dx2);
      ctx.stroke();

      // Diagonal ↙
      ctx.beginPath();
      const d1 = Math.min(W - x, y);
      ctx.moveTo(x + d1, y - d1);
      const d2 = Math.min(x, H - y);
      ctx.lineTo(x - d2, y + d2);
      ctx.stroke();

      // Glow dot at station center
      const grd = ctx.createRadialGradient(x, y, 1, x, y, 20);
      grd.addColorStop(0, 'rgba(0, 255, 157, 0.55)');
      grd.addColorStop(1, 'rgba(0, 255, 157, 0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2); ctx.fill();
    }
  }
}

/* ─── Status bar helper ─── */
function setStatus(txt, mode) {
  document.getElementById('statusTxt').textContent = txt;
  const dot = document.getElementById('statusDot');
  dot.className = 'status-dot' + (mode ? ' ' + mode : '');
}

/* ─── Solve — POST to Flask then animate ─── */
async function solve() {
  setStatus('SOLVING', 'solving');
  const btn = document.getElementById('solveBtn');
  btn.disabled = true;
  btn.textContent = '⏳ Solving…';
  clearCanvas();

  try {
    const response = await fetch('/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grid })
    });

    if (!response.ok) throw new Error('Server error ' + response.status);

    const data = await response.json();
    const sol = data.solution;

    // Animate stations appearing one by one
    const temp = Array.from({ length: N }, () => Array(N).fill(0));
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (sol[i][j] === 1) {
          temp[i][j] = 1;
          updateUI(temp);
          drawAttackLines(temp);
          await delay(110);
        }
      }
    }

    document.getElementById('scoreVal').textContent = data.score;
    document.getElementById('scoreSub').textContent = 'Optimal placement found';
    setStatus('DONE', 'done');

  } catch (err) {
    document.getElementById('scoreVal').textContent = 'ERR';
    document.getElementById('scoreSub').textContent = err.message;
    setStatus('ERROR', '');
  }

  btn.disabled = false;
  btn.textContent = '▶ Solve';
}

/* ─── Clear all cell states ─── */
function clearAll() {
  grid = Array.from({ length: N }, () => Array(N).fill('.'));
  clearCanvas();
  updateUI();
  setStatus('IDLE', '');
  document.getElementById('scoreVal').textContent = '—';
  document.getElementById('scoreSub').textContent = 'Run solve to compute';
}

/* ─── Utility ─── */
function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/* ─── Resize canvas on window resize ─── */
window.addEventListener('resize', () => {
  resizeCanvas();
  // Redraw existing attack lines
  const sol = Array.from({ length: N }, () => Array(N).fill(0));
  document.querySelectorAll('.cell.station').forEach(c => {
    sol[+c.dataset.row][+c.dataset.col] = 1;
  });
  drawAttackLines(sol);
});

/* ─── Boot ─── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('generateBtn').addEventListener('click', () => generateGrid(false));
  document.getElementById('solveBtn').addEventListener('click', solve);
  document.getElementById('clearBtn').addEventListener('click', clearAll);
  generateGrid();
});