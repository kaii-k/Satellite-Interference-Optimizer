from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import copy

app = Flask(__name__)
CORS(app)

DIRECTIONS = [
    (1,0),(-1,0),(0,1),(0,-1),
    (1,1),(1,-1),(-1,1),(-1,-1)
]

@app.route("/")
def home():
    return render_template("index.html")

def is_safe(board, grid, row, col, N):
    for dx, dy in DIRECTIONS:
        x, y = row + dx, col + dy
        while 0 <= x < N and 0 <= y < N:
            if board[x][y] == 1:
                return False
            if grid[x][y] == 'X':
                break
            x += dx
            y += dy
    return True

def count_coverage(board, grid, N):
    covered = set()

    for i in range(N):
        for j in range(N):
            if board[i][j] == 1:
                for dx, dy in DIRECTIONS:
                    x, y = i + dx, j + dy
                    while 0 <= x < N and 0 <= y < N:
                        if grid[x][y] == 'P':
                            covered.add((x, y))
                        if grid[x][y] == 'X':
                            break
                        x += dx
                        y += dy

    return len(covered)

def solve(grid):
    N = len(grid)
    board = [[0]*N for _ in range(N)]

    best_solution = None
    best_score = -1

    def backtrack(row):
        nonlocal best_solution, best_score

        if row == N:
            score = count_coverage(board, grid, N)
            if score > best_score:
                best_score = score
                best_solution = copy.deepcopy(board)
            return

        for col in range(N):
            if grid[row][col] == 'X':
                continue

            if is_safe(board, grid, row, col, N):
                board[row][col] = 1
                backtrack(row + 1)
                board[row][col] = 0

        backtrack(row + 1)

    backtrack(0)

    return best_solution, best_score


@app.route("/solve", methods=["POST"])
def solve_api():
    data = request.json
    grid = data["grid"]

    solution, score = solve(grid)

    return jsonify({
        "solution": solution,
        "score": score
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)