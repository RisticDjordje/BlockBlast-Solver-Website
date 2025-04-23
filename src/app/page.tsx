"use client";
import React, { useState } from 'react';

// Simple tutorial/instructions component
function Tutorial() {
  return (
    <div className="tutorial">
      <h2>Tutorial</h2>
      <p>
        1. Click cells in the <strong>Main Grid</strong> to add/remove blocks.<br />
        2. Below, design each <em>Piece</em> by toggling cells in its 5×5 grid.<br />
        3. Tap <strong>Solve</strong> to send your current setup to the solver.
      </p>
    </div>
  );
}

export default function Page() {
  // 8×8 main grid state
  const [grid, setGrid] = useState<number[][]>(
    Array.from({ length: 8 }, () => Array(8).fill(0))
  );

  // Three 5×5 shape pickers
  const [shapes, setShapes] = useState<number[][][]>(
    [0, 1, 2].map(() => Array.from({ length: 5 }, () => Array(5).fill(0)))
  );

  // Toggle a cell in the main grid
  const toggleGridCell = (row: number, col: number) => {
    setGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = next[row][col] ? 0 : 1;
      return next;
    });
  };

  // Toggle a cell in a shape
  const toggleShapeCell = (shapeIndex: number, row: number, col: number) => {
    setShapes(prev => {
      const next = prev.map(shape => shape.map(r => [...r]));
      next[shapeIndex][row][col] = next[shapeIndex][row][col] ? 0 : 1;
      return next;
    });
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
    <div className="wrapper">
      <h1 className="title">BlockBlast Solver</h1>
      <Tutorial />

      <section className="main-grid">
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`cell ${cell ? 'on' : ''}`}
              onClick={() => toggleGridCell(r, c)}
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
                    onClick={() => toggleShapeCell(si, r, c)}
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

      <style jsx>{`
        .wrapper {
          max-width: 800px;
          margin: 0 auto;
          padding: 1rem;
          text-align: center;
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
        }
        @media (max-width: 600px) {
          .shape-section, .shapes-section {
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
