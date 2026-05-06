let grid = [];
let N = 8;

function generateGrid() {
    N = parseInt(document.getElementById("size").value);
    grid = Array.from({length: N}, () => Array(N).fill('.'));

    const gridDiv = document.getElementById("grid");
    gridDiv.innerHTML = "";
    gridDiv.style.gridTemplateColumns = `repeat(${N}, 40px)`;

    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            let cell = document.createElement("div");
            cell.className = "cell fade-in";
            cell.dataset.row = i;
            cell.dataset.col = j;

            cell.onclick = () => toggleCell(i, j);

            gridDiv.appendChild(cell);
        }
    }

    updateUI();
}

function toggleCell(i, j) {
    if (grid[i][j] === '.') grid[i][j] = 'X';
    else if (grid[i][j] === 'X') grid[i][j] = 'P';
    else grid[i][j] = '.';

    updateUI();
}

function updateUI(solution = null) {
    const cells = document.querySelectorAll(".cell");

    cells.forEach(cell => {
        let i = cell.dataset.row;
        let j = cell.dataset.col;

        cell.className = "cell";
        cell.innerText = "";

        if (grid[i][j] === 'X') cell.classList.add("blocked");

        if (grid[i][j] === 'P') {
            cell.classList.add("priority");
            cell.innerText = "P";
        }

        if (solution && solution[i][j] === 1) {
            cell.classList.add("station");
            cell.innerText = "S";
        }
    });
}

async function solve() {
    try {
        const response = await fetch("/solve", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ grid: grid })
        });

        const data = await response.json();

        console.log("Response:", data); // debug

        if (data.solution) {
            updateUI(data.solution);
            document.getElementById("result").innerText =
                "Coverage Score: " + data.score;
        } else {
            document.getElementById("result").innerText =
                "No solution found";
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

generateGrid();