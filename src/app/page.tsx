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

// Component to display steps received from the backend
interface Step {
  step: number;
  action: string;
  shape_idx: number;
  row: number;
  col: number;
  lines_cleared: number;
  done: boolean;
  board: number[][];
}

function StepsDisplay({ steps }: { steps: Step[] }) {
  return (
    <div className="steps-display">
      <h2>Steps Received</h2>
      <ol>
        {steps.map((step, index) => (
          <li key={index}>
            <p><strong>Step {step.step}:</strong></p>
            <ul>
              <li><strong>Action:</strong> {step.action}</li>
              <li><strong>Shape Index:</strong> {step.shape_idx}</li>
              <li><strong>Row:</strong> {step.row}</li>
              <li><strong>Column:</strong> {step.col}</li>
              <li><strong>Lines Cleared:</strong> {step.lines_cleared}</li>
              <li><strong>Done:</strong> {step.done ? 'Yes' : 'No'}</li>
              <li><strong>Board:</strong></li>
              <div className="board-visualization">
                {step.board.map((row: number[], rowIndex: number) => (
                  <div key={rowIndex} className="board-row">
                    {row.map((cell: number, colIndex: number) => (
                      <div
                        key={colIndex}
                        className={`board-cell ${cell ? 'filled' : ''}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </ul>
          </li>
        ))}
      </ol>
      <style jsx>{`
        .steps-display {
          text-align: left;
          background: #f7fafc;
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1.5rem;
        }
        .steps-display h2 {
          margin-top: 0;
        }
        .steps-display ol {
          padding-left: 1.5rem;
        }
        .board-visualization {
          display: inline-block;
          margin-top: 0.5rem;
          border: 2px solid #cbd5e0;
        }
        .board-row {
          display: flex;
        }
        .board-cell {
          width: 20px;
          height: 20px;
          background: #e2e8f0;
          border: 1px solid #90cdf4;
        }
        .board-cell.filled {
          background: #3182ce;
        }
        .board-cell {
          width: 20px;
          height: 20px;
          background: #e2e8f0; /* Light gray for empty cells */
          border: 1px solid #90cdf4;
        }
        .board-cell.filled {
          background: #3182ce; /* Blue for filled cells */
        }
      `}</style>
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

  // Colors for each piece
  const pieceColors = ['#ed594a', '#f59e0b', '#34d399'];

  // Agent selection state
  const [selectedAgent, setSelectedAgent] = useState<string>('MaskedPPO');

  // Steps received from the backend
  const [steps, setSteps] = useState<Step[]>([]);

  // Utility to reset the main grid
  const clearGrid = () => {
    setGrid(Array.from({ length: 8 }, () => Array(8).fill(0)));
  };

  // Utility to reset a single shape
  const clearShape = (index: number) => {
    setShapes(prev => {
      const next = prev.map((shape, si) =>
        si === index ? Array.from({ length: 5 }, () => Array(5).fill(0)) : shape
      );
      return next;
    });
  };

  // Set value helpers
  const setGridValue = (row: number, col: number, val: number) => {
    setGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = val;
      return next;
    });
  };
  const setShapeValue = (si: number, row: number, col: number, val: number) => {
    setShapes(prev => {
      const next = prev.map(shape => shape.map(r => [...r]));
      next[si][row][col] = val;
      return next;
    });
  };

  // Grid painting handlers
  const onGridMouseDown = (r: number, c: number) => {
    const newVal = grid[r][c] ? 0 : 1;
    setIsMouseDown(true);
    setPaintValue(newVal);
    setGridValue(r, c, newVal);
  };
  const onGridMouseEnter = (r: number, c: number) => {
    if (isMouseDown && paintValue !== null) {
      setGridValue(r, c, paintValue);
    }
  };

  // Shape painting handlers
  const onShapeMouseDown = (si: number, r: number, c: number) => {
    const newVal = shapes[si][r][c] ? 0 : 1;
    setIsMouseDown(true);
    setPaintValue(newVal);
    setShapeValue(si, r, c, newVal);
  };
  const onShapeMouseEnter = (si: number, r: number, c: number) => {
    if (isMouseDown && paintValue !== null) {
      setShapeValue(si, r, c, paintValue);
    }
  };

  // End painting
  const endPaint = () => {
    setIsMouseDown(false);
    setPaintValue(null);
  };

  // POST to solver and handle response
  const handleSolve = async () => {
    const payload = {
      grid,
      shapes,
      score: [0.0],
      combo: [0],
      model: selectedAgent
    };
    console.log('Sending payload to solver:', payload);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_SOLVER_API_URL || 'http://localhost:8000/api/solve'; // Default fallback
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log('Solver response:', data);
      setSteps(data.steps || []); // Assuming the backend returns steps in `data.steps`
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

      <div className="grid-controls">
        <button className="clear-button" onClick={clearGrid}>
          Clear Grid
        </button>
        <select
          className="agent-selector"
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
        >
          <option value="MaskedPPO">MaskedPPO</option>
          <option value="MaskedDQN">MaskedDQN</option>
        </select>
      </div>
      <section className="main-grid">
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`cell ${cell && 'on'}`}
              onMouseDown={() => onGridMouseDown(r, c)}
              onMouseEnter={() => onGridMouseEnter(r, c)}
            />
          ))
        )}
      </section>

      <div className="shapes-section">
        {shapes.map((shape, si) => (
          <div key={si} className="shape-wrapper">
            <div className="shape-header">
              <h3 className="shape-title">Piece {si + 1}</h3>
              <button className="clear-button" onClick={() => clearShape(si)}>
                Clear
              </button>
            </div>
            <div className="shape-grid">
              {shape.map((row, r) =>
                row.map((cell, c) => (
                  <div
                    key={`${si}-${r}-${c}`}
                    className="cell"
                    style={cell ? { background: pieceColors[si] } : undefined}
                    onMouseDown={() => onShapeMouseDown(si, r, c)}
                    onMouseEnter={() => onShapeMouseEnter(si, r, c)}
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

      {/* Render StepsDisplay */}
      {steps.length > 0 && <StepsDisplay steps={steps} />}

      <footer className="footer">
        <p>
          Website source:&nbsp;
          <a href="https://github.com/RisticDjordje/BlockBlast-Solver-Website" target="_blank" rel="noopener noreferrer">
            GitHub Repo
          </a>
        </p>
        <p>
          Reinforcement Learning Solver AI source:&nbsp;
          <a href="https://github.com/RisticDjordje/BlockBlast-Game-AI-Agent" target="_blank" rel="noopener noreferrer">
            GitHub Repo
          </a>
        </p>
        <p>
          Powered by a trained AI agent using reinforcement learning. Clicking <strong>Solve</strong> sends your current grid &amp; pieces to the agent for analysis.
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
        .grid-controls {
          margin-bottom: 0.5rem;
        }
        .clear-button {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
          background: #e2e8f0;
          color: #1a202c;
          border: 1px solid #cbd5e0;
          border-radius: 4px;
          cursor: pointer;
        }
        .agent-selector {
          margin-left: 1rem;
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
          border: 1px solid #cbd5e0;
          border-radius: 4px;
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
        .shape-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .shape-title {
          font-size: 1.1rem;
          margin: 0;
        }
        .shape-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 3px;
          width: 120px;
          aspect-ratio: 1;
        }
        .cell {
          background: #eee; /* light blue default */
          border: 1px solid #90cdf4;
          aspect-ratio: 1;
        }
        .main-grid .cell.on {
          background: #3182ce; /* nice blue on */
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
