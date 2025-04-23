"use client";
import React, { useState } from 'react';

// Simple tutorial/instructions component
function Tutorial() {
  return (
    <div className="tutorial">
      <h2>Tutorial</h2>
      <p>
        1. Click or drag on the <strong>Main Grid</strong> to add/remove blocks.<br />
        2. Below, design each <em>Piece</em> by clicking or dragging its 5×5 grid.<br />
        3. Tap <strong>Solve</strong> to send your current setup to the solver AI.
      </p>
    </div>
  );
}

export default function Page() {
  // Track mouse dragging state and paint value
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [paintValue, setPaintValue] = useState<number | null>(null);

  // 8×8 main grid state
  const [grid, setGrid] = useState<number[][]>(
    Array.from({ length: 8 }, () => Array(8).fill(0))
  );

  // Three 5×5 shape pickers
  const [shapes, setShapes] = useState<number[][][]>(
    [0, 1, 2].map(() => Array.from({ length: 5 }, () => Array(5).fill(0)))
  );

  // Utility to set a single grid cell to a given value
  const setGridValue = (row: number, col: number, value: number) => {
    setGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = value;
      return next;
    });
  };

  // Utility to set a single shape cell to a given value
  const setShapeValue = (shapeIndex: number, row: number, col: number, value: number) => {
    setShapes(prev => {
      const next = prev.map(shape => shape.map(r => [...r]));
      next[shapeIndex][row][col] = value;
      return next;
    });
  };

  // Handlers for grid paint
  const handleGridMouseDown = (r: number, c: number) => {
    const newVal = grid[r][c] ? 0 : 1;
    setIsMouseDown(true);
    setPaintValue(newVal);
    setGridValue(r, c, newVal);
  };
  const handleGridMouseEnter = (r: number, c: number) => {
    if (isMouseDown && paintValue !== null) {
      setGridValue(r, c, paintValue);
    }
  };

  // Handlers for shape paint
  const handleShapeMouseDown = (si: number, r: number, c: number) => {
    const newVal = shapes[si][r][c] ? 0 : 1;
    setIsMouseDown(true);
    setPaintValue(newVal);
    setShapeValue(si, r, c, newVal);
  };
  const handleShapeMouseEnter = (si: number, r: number, c: number) => {
    if (isMouseDown && paintValue !== null) {
      setShapeValue(si, r, c, paintValue);
    }
  };

  // End paint on mouse up/leave
  const endPaint = () => {
    setIsMouseDown(false);
    setPaintValue(null);
  };

  // Send POST to /api/solve
  const handleSolve = async () => {
    const payload = { grid, shapes, score: [0.0], combo: [0] };
    try {
      const res = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log('Solver response:', data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="wrapper"
      onMouseUp={endPaint}
      onMouseLeave={endPaint}
    >
      <h1 className="title">BlockBlast Solver</h1>
      <Tutorial />

      <section className="main-grid">
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`cell ${cell ? 'on' : ''}`}
              onMouseDown={() => handleGridMouseDown(r, c)}
              onMouseEnter={() => handleGridMouseEnter(r, c)}
            />
          ))
        )}
      </section>

      <div className="shapes-section">
        {shapes.map((shape, si) => (
          <div key={si} className="shape-wrapper">
            <h3 className="shape-title">Piece {si + 1}</h3>
            <div className="shape-grid">
              {shape.map((row, r) =>
                row.map((cell, c) => (
                  <div
                    key={`${si}-${r}-${c}`}
                    className={`cell ${cell ? 'on' : ''}`}
                    onMouseDown={() => handleShapeMouseDown(si, r, c)}
                    onMouseEnter={() => handleShapeMouseEnter(si, r, c)}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="solve-button" onClick={handleSolve}>
        Solve
      </button>

      <footer className="footer">
        <p>
          Website source:&nbsp;
          <a href="https://github.com/RisticDjordje/BlockBlast-Solver-Website" target="_blank" rel="noopener noreferrer">
            GitHub Repo
          </a>
        </p>
        <p>
          Solver AI source:&nbsp;
          <a href="https://github.com/RisticDjordje/BlockBlast-Game-AI-Agent" target="_blank" rel="noopener noreferrer">
            RL Agent Repo
          </a>
        </p>
        <p>
          This solver is powered by a trained AI agent using reinforcement learning. Clicking <strong>Solve</strong> sends your current grid &amp; pieces to the agent for analysis.
        </p>
      </footer>

      <style jsx>{`
        .wrapper {
          max-width: 800px;
          margin: 0 auto;
          padding: 1rem;
          text-align: center;
          user-select: none;
        }
        .title {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
        .tutorial {
          text-align: left;
          background: #f7fafc;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }
        .tutorial h2 {
          margin-top: 0;
        }
        .main-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 4px;
          width: 100%;
          max-width: 400px;
          aspect-ratio: 1;
          margin: 0 auto 2rem;
        }
        .shapes-section {
          display: flex;
          justify-content: space-around;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .shape-wrapper {
          text-align: center;
        }
        .shape-title {
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }
        .shape-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 3px;
          width: 120px;
          aspect-ratio: 1;
        }
        .cell {
          background: #eee;
          border: 1px solid #ccc;
          aspect-ratio: 1;
        }
        .cell.on {
          background: #2f855a;
        }
        .solve-button {
          padding: 0.75rem 1.5rem;
          background: #2b6cb0;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          margin-bottom: 2rem;
        }
        .footer {
          font-size: 0.875rem;
          color: #4a5568;
          text-align: center;
          line-height: 1.4;
        }
        .footer a {
          color: #2b6cb0;
          text-decoration: underline;
        }
        @media (max-width: 600px) {
          .shapes-section {
            flex-direction: column;
            align-items: center;
          }
          .shape-grid {
            width: 70vw;
            max-width: 200px;
          }
        }
      `}</style>
    </div>
  );
}
