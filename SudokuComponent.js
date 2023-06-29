import React, { useState } from 'react';
import './SudokuComponent.css';
import SudokuService from '../SudokuService';

const SudokuComponent = () => {
  const [gameStatus, setGameStatus] = useState('');
  const [gameStarted, setGameStarted] = useState(false); // Track game start status
  const [moveStatus, setMoveStatus] = useState(''); // Track move validation status
  const [grid, setGrid] = useState([]); // Sudoku grid state
  const [invalidMoves, setInvalidMoves] = useState(0); // Track number of invalid moves

  const handleNewGame = () => {
    const generatedGrid = generateSudokuGrid();
    setGrid(generatedGrid);
    setGameStatus('READY');
    setGameStarted(true);
    setInvalidMoves(0); // Reset the number of invalid moves
    setMoveStatus(''); // Reset the move status
  };

  const generateSudokuGrid = () => {
    const grid = [];

    // Initialize an empty 9x9 grid
    for (let i = 0; i < 9; i++) {
      grid[i] = [];
      for (let j = 0; j < 9; j++) {
        grid[i][j] = 0;
      }
    }

    // Fill a random 82% of the grid
    const cellsToFill = Math.floor(0.82 * 9 * 9);
    let filledCells = 0;

    while (filledCells < cellsToFill) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      const num = Math.floor(Math.random() * 9) + 1;

      if (isValidMove(grid, row, col, num)) {
        grid[row][col] = num;
        filledCells++;
      }
    }

    return grid;
  };

  const isValidMove = (grid, row, col, num) => {
    // Check if the number already exists in the row
    for (let i = 0; i < 9; i++) {
      if (grid[row][i] === num) {
        return false;
      }
    }

    // Check if the number already exists in the column
    for (let i = 0; i < 9; i++) {
      if (grid[i][col] === num) {
        return false;
      }
    }

    // Check if the number already exists in the 3x3 square
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = startRow; i < startRow + 3; i++) {
      for (let j = startCol; j < startCol + 3; j++) {
        if (grid[i][j] === num) {
          return false;
        }
      }
    }

    // The move is valid
    return true;
  };

  const handleMoveValidation = (row, col, num) => {
    if (num >= 1 && num <= 9) {
      if (isValidMove(grid, row, col, num)) {
        handleMakeMove(row, col, num);
        setMoveStatus('Valid');
      } else {
        setMoveStatus('Invalid');
        setInvalidMoves((prevInvalidMoves) => prevInvalidMoves + 1); // Increment the number of invalid moves

        if (invalidMoves + 1 >= 3) {
          setGameStatus('Game Over three invalid move');
        }
      }
    } else {
      setMoveStatus('Invalid');
    }
  };

  const handleMakeMove = async (row, col, num) => {
    try {
      const response = await SudokuService.makeMove(row, col, num);
      setGameStatus(response.data.result);
      setMoveStatus('');
    } catch (error) {
      console.error(error);
      setGameStatus('Error making a move.');
    }
  };

  const renderGrid = () => {
    const renderedGrid = [];
  
    // Divide the grid into 3x3 squares
    for (let row = 0; row < 9; row += 3) {
      const rowElements = [];
  
      // Render the squares within each row
      for (let col = 0; col < 9; col += 3) {
        const squareElements = [];
  
        // Render the cells within each square
        let j;
        for (let i = row; i < row + 3; i++) {
          const cellElements = [];
          for (let j = col; j < col + 3; j++) {
            const value = grid[i][j];
  
            const isInvalidMove =
              moveStatus === 'Invalid' && invalidMoves >= 3 && value === 0;
            const inputClassName = isInvalidMove ? 'invalid' : '';
  
            cellElements.push(
              <input
                key={`${i}-${j}`}
                type="text"
                maxLength={1}
                value={value === 0 ? '' : value}
                readOnly={!gameStarted || value !== 0}
                onChange={(event) =>
                  handleMoveValidation(i, j, parseInt(event.target.value))
                }
                onKeyPress={(event) => {
                  if (event.key === 'Enter') {
                    handleMoveValidation(i, j, parseInt(event.target.value));
                  }
                }}
                className={inputClassName}
              />
            );
          }
          squareElements.push(<div key={`cell-${i}-${j}`}>{cellElements}</div>);
        }
  
        rowElements.push(
          <div key={`square-${row}-${col}`} className="sudoku-square">
            {squareElements}
          </div>
        );
      }
  
      renderedGrid.push(
        <div key={`row-${row}`} className="sudoku-row">
          {rowElements}
        </div>
      );
    }
  
    return renderedGrid;
  };
  
  
  
  const isGameOver = moveStatus === 'Invalid' && invalidMoves >= 3;
  return (
    <div className="sudoku-container">
      <h1>Sudoku Game</h1>
      <button onClick={handleNewGame}>Start New Game</button>
      <p className={isGameOver ? 'game-over' : ''}>Game Status: {gameStatus}</p>
      {gameStarted && (
        <>
          <p>Move Status: {moveStatus}</p>
          <div className="sudoku-grid">{renderGrid()}</div>
        </>
      )}
    </div>
  );
};

export default SudokuComponent;
