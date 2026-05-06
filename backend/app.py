from flask import Flask, render_template, request, jsonify
import itertools

app = Flask(__name__)


def solve_grid(grid):
    N = len(grid)

    # Find all valid (non-blocked) cells
    valid = [(i, j) for i in range(N) for j in range(N) if grid[i][j] != 'X']

    # Score a cell: priority cells worth 2, normal worth 1
    def cell_score(i, j):
        return 2 if grid[i][j] == 'P' else 1

    # Check if two stations interfere (same row, col, or diagonal)
    def interferes(a, b):
        return (a[0] == b[0] or a[1] == b[1] or
                abs(a[0] - b[0]) == abs(a[1] - b[1]))

    best_solution = None
    best_score = -1

    # Backtracking solver
    def backtrack(placed, remaining, score):
        nonlocal best_solution, best_score

        if score > best_score:
            best_score = score
            best_solution = list(placed)

        for idx, cell in enumerate(remaining):
            i, j = cell
            # Check no interference with already placed stations
            if any(interferes(cell, p) for p in placed):
                continue
            new_remaining = [c for k, c in enumerate(remaining) if k > idx and not interferes(cell, c)]
            backtrack(placed + [cell], new_remaining, score + cell_score(i, j))

    backtrack([], valid, 0)

    # Build solution matrix
    sol = [[0] * N for _ in range(N)]
    if best_solution:
        for (i, j) in best_solution:
            sol[i][j] = 1

    return sol, best_score


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/solve', methods=['POST'])
def solve():
    data = request.get_json()
    grid = data.get('grid', [])
    if not grid:
        return jsonify({'error': 'No grid provided'}), 400

    solution, score = solve_grid(grid)
    return jsonify({'solution': solution, 'score': score})


if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5001)