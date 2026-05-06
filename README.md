# 🛰️ Satellite Interference Optimizer

A grid-based satellite station placement solver built with **Flask + vanilla JS**.  
Places stations to maximize coverage score while ensuring no two stations interfere  
(same row, column, or diagonal — a weighted N-Queens variant).

---

## ✨ Features

- 🔲 Interactive N×N grid (4–15 cells)
- 🚫 Mark cells as **Blocked** (stations cannot be placed)
- ⭐ Mark cells as **Priority** (worth 2× coverage score)
- ⚡ Animated solve with interference line visualization
- 🌌 Space-ops UI — Orbitron font, scanlines, glowing stations
- 🔁 Backtracking solver finds optimal placement

---

## 📁 Project Structure

```
satellite-optimizer/
├── README.md
└── backend/
    ├── app.py                  ← Flask server + solver
    ├── templates/
    │   └── index.html          ← Jinja2 template
    └── static/
        ├── style.css           ← Space-ops dark theme
        ├── script.js           ← Grid logic + canvas animation
        └── satellite.png       ← App icon (add your own)
```

---

## 🚀 Setup & Run

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/satellite-optimizer.git
cd satellite-optimizer/backend
```

### 2. Create a virtual environment
```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

### 3. Install dependencies
```bash
pip install flask
```

### 4. Run the app
```bash
py app.py        # Windows
python app.py    # macOS / Linux
```

### 5. Open in browser
```
http://127.0.0.1:5001
```

---

## 🎮 How to Use

| Action | Effect |
|---|---|
| Click an **empty** cell | Marks it **Blocked** (red ✕) — no station allowed |
| Click a **blocked** cell | Marks it **Priority** (amber P) — 2× score |
| Click a **priority** cell | Resets to empty |
| **Generate** | Creates a fresh grid of the chosen size |
| **Solve** | Runs the solver and animates the result |
| **Clear** | Resets all cells to empty |

---

## 🧠 How the Solver Works

Uses **recursive backtracking** to find the highest-scoring valid placement:

- A station cannot share a **row**, **column**, or **diagonal** with another station
- **Normal cells** contribute `+1` to the score
- **Priority cells** contribute `+2` to the score
- The solver explores all valid combinations and keeps the best

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3, Flask |
| Frontend | HTML5, CSS3, Vanilla JS |
| Rendering | CSS Grid + HTML5 Canvas |
| Fonts | Orbitron, Space Mono (Google Fonts) |

---

## 📸 Screenshots

> _Add screenshots here after first run_

---

## 📄 License

MIT — free to use, modify, and distribute.