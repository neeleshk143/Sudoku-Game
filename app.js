const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Sudoku board representation
let sudokuBoard = [...Array(9)].map(() => Array(9).fill(0));

function isValidMove(row, col, num) {
  // Check row and column constraints
  for (let i = 0; i < 9; i++) {
    if (sudokuBoard[row][i] === num || sudokuBoard[i][col] === num) {
      return false;
    }
  }

  // Check 3x3 square constraints
  const squareRow = Math.floor(row / 3) * 3;
  const squareCol = Math.floor(col / 3) * 3;
  for (let i = squareRow; i < squareRow + 3; i++) {
    for (let j = squareCol; j < squareCol + 3; j++) {
      if (sudokuBoard[i][j] === num) {
        return false;
      }
    }
  }

  return true;
}

function resetBoard() {
  sudokuBoard = [...Array(9)].map(() => Array(9).fill(0));
}

app.post('/reset', (req, res) => {
  resetBoard();
  res.json({ result: 'READY' });
});

app.get('/move/:row/:col', (req, res) => {
  const { row, col } = req.params;

  if (row < 0 || row > 8 || col < 0 || col > 8) {
    return res.status(400).json({ error: 'Invalid row or column.' });
  }

  const num = sudokuBoard[row][col];
  if (num !== 0) {
    return res.json({ result: 'Invalid' });
  }

  res.json({ result: 'Valid' });
});

app.post('/move', (req, res) => {
  const { row, col, num } = req.body;

  if (row === undefined || col === undefined || num === undefined) {
    return res.status(400).json({ error: 'Missing row, col, or num in the request body.' });
  }

  if (row < 0 || row > 8 || col < 0 || col > 8 || num < 1 || num > 9) {
    return res.status(400).json({ error: 'Invalid row, col, or num value.' });
  }

  if (!isValidMove(row, col, num)) {
    return res.json({ result: 'Invalid' });
  }

  sudokuBoard[row][col] = num;
  res.json({ result: 'Valid' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
