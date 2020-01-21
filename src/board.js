import React from 'react';
import ReactDOM from 'react-dom';
import {boardSize, gridSize, edgeType} from './globals';
import './index.css';

class Square extends React.Component {
    render() {
      let name = `square edge-${this.props.edge}`;
      let color = this.props.value === 1 ? 'beige' : this.props.value === 2 ? 'black' : 'transparent';
  
      return (
          <button 
              className={name}
              style={{
                  height: `${gridSize}px`,
                  width: `${gridSize}px`,
              }}
              onClick={() => this.props.onClick()}
          >
              {/* TODO */}
              <span className='dot'></span>
  
              <span className='stone' style={{backgroundColor : color}}></span>
          </button>
      );
    }
  }
  
export default class Board extends React.Component {
    renderSquare(i, j, edge) {
        return <Square 
            x={i}
            y={j}
            edge={edge}
            value={this.props.squares[i][j]}
            onClick={() => this.props.onClick(i, j)}
        />;
    }

    edgeType(x, y) {
        if (x === 0 && y === 0)
            return edgeType.tl_corner;
        else if (x === boardSize - 1 && y === 0)
            return edgeType.tr_corner;
        else if (x === boardSize - 1 && y === boardSize - 1)
            return edgeType.br_corner;
        else if (x === 0 && y === boardSize - 1)
            return edgeType.bl_corner;
        else if (x === 0)
            return edgeType.lv_edge;
        else if (x === boardSize - 1)
            return edgeType.rv_edge;
        else if (y === 0)
            return edgeType.th_edge;
        else if (y === boardSize - 1)
            return edgeType.bh_edge;
        else if ((x - 3) % 6 === 0 && (y - 3) % 6 === 0)
            return edgeType.star;
        else
            return edgeType.none;
    }

    renderBoard() {
        let boardTiles = [];

        for(let i = 0; i < boardSize; i++) {
            for(let j = 0; j < boardSize; j++) {
                boardTiles.push(
                    this.renderSquare(
                        i,
                        j,
                        this.edgeType(j, i),
                    )
                );
            }
        }

        return boardTiles;
    }

    render() {
        return (
            this.renderBoard()
        );
    }
}