import React from 'react';
import ReactDOM from 'react-dom';
import Board from './board';
import {boardSize, gridSize, WHITE, BLACK, tileState, gameState} from './globals';
import './index.css';

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [],
            squares: Array(boardSize).fill(tileState.empty).map(() => new Array(boardSize).fill(tileState.empty)),
            gameData: {
                turn: WHITE,
                state: gameState.ready,
            }
        };
    }

    move(x, y) {
        this.state.history.push({
            move: `${String.fromCharCode(97 + x).toUpperCase()}-${y}`,
            player: this.state.gameData.turn
        });
    }

    handleClick(i, j) {
        if (this.state.gameData.state === gameState.gameOver)
            return;

        const squares = this.state.squares.slice();

        if (squares[i][j] !== tileState.empty)
            return;

        squares[i][j] = this.state.gameData.turn;

        let patch = [];
        let captured = false;
        let eye = true;
        let neighbors = this.getNeighbors(i, j, squares);

        neighbors.forEach((n) => {
            patch = [];
            captured = false;

            captured = this.breadthSearch(n.x, n.y, n.x, n.y, patch);

            if (captured) {
                eye = false;
                this.removePatch(patch, squares);
            }
        });

        if (this.eye(i, j, squares) && eye) {
            squares[i][j] = tileState.empty;
            return;
        }

        this.move(i, j);
        
        this.switchPlayer();

        this.setState({squares: squares});
    }

    // returns empty tileState if not an eye and color corresponding to which eye
    eye(x, y, board) {
        let color = [];

        if (x > 0)
            color.push(board[x - 1][y]);
        if (x < boardSize - 1)
            color.push(board[x + 1][y]);
        if (y > 0)
            color.push(board[x][y - 1]);
        if (y < boardSize -1)
            color.push(board[x][y + 1]);

        for (let i = 0; i < color.length - 1; i++) {
            if (color[i] !== color[i + 1] || color[i] === tileState.empty)
                return false;
        }

        return board[x][y] !== color[0];
    }

    getNeighbors(i, j, squares) {
        let neighbors = [];
        
        if (i > 0 && squares[i][j] !== squares[i - 1][j] && squares[i - 1][j] !== tileState.empty)
            neighbors.push({x: i - 1, y: j});
        if (j < boardSize - 1 && squares[i][j] !== squares[i][j + 1]  && squares[i][j + 1] !== tileState.empty)
            neighbors.push({x: i, y: j + 1});
        if (i < boardSize - 1 && squares[i][j] !== squares[i + 1][j]  && squares[i + 1][j] !== tileState.empty)
            neighbors.push({x: i + 1, y: j});
        if (j > 0 && squares[i][j] !== squares[i][j - 1]  && squares[i][j - 1] !== tileState.empty)
            neighbors.push({x: i, y: j - 1});

        return neighbors
    }

    breadthSearch(i0, j0, i , j, patch) {
        patch.push({x: i, y: j});

        let flag = true;
        // left
        if (i > 0 && (i - 1 !== i0 || j !== j0)) {
            flag = flag && this.checkTile(i, j, i - 1, j, patch);
        }
        // down
        if (j < boardSize - 1 && (i !== i0 || j + 1 !== j0)) {
            flag = flag && this.checkTile(i, j, i, j + 1, patch);
        }
        // right
        if (i < boardSize - 1 && (i + 1 !== i0 || j !== j0)) {
            flag = flag && this.checkTile(i, j, i + 1, j, patch);
        }
        // up
        if (j > 0 && (i !== i0 || j - 1 !== j0)) {
            flag = flag && this.checkTile(i, j, i, j - 1, patch);
        }

        return flag;
    };

    checkTile(i1, j1, i2, j2, patch) {
        switch(this.state.squares[i2][j2]) {
            case tileState.empty: 
                return false;
            case this.state.squares[i1][j1]: // same color
                return this.breadthSearch(i1, j1, i2, j2, patch);
            default: // different color
                return true;

        }
    }

    removePatch(patch, squares) {
        patch.forEach((n) => {    
            squares[n.x][n.y] = tileState.empty;
        });
    }

    switchPlayer() {
        this.setState({
            gameData: {
                turn: this.state.gameData.turn === WHITE ? BLACK : WHITE,
            }
        })
    }

    concede() {
        this.setState({
            gameData: {
                state: gameState.gameOver,
            },
        });
    }

    render() {
        const moves = this.state.history.map((step) => {
            return (
                <p
                    className="info-line"
                    style={{
                    // color: ste p.player === 1 ? 'beige' : 'black',
                    }}
                >
                    {step.move}
                </p>
            );
        });

        let style = {
            display: 'grid',
            gridTemplateRows: `repeat( ${boardSize}, ${gridSize}px )`,
            gridTemplateColumns: `repeat( ${boardSize}, ${gridSize}px )`,
        }

        return (
            <div className="game">
                <h1>GO<br/>GO<br/>GO<br/>!</h1>
                <div className="game-board" style={style}>
                    <Board
                        squares={this.state.squares}
                        move={() => this.move()}
                        onClick={(i, j) => this.handleClick(i, j)}
                        gameData={this.state.gameData}                        
                    />
                </div>
                <div className="game-info">
                    <div className="h-20%">
                        <p>Turn Count: {this.state.history.length}</p>
                        <p>Player Turn: <div className="block" style={{backgroundColor: this.state.gameData.turn === WHITE ? 'beige' : 'black'}}></div></p>
                        <button className="concedeBtn" onClick={() => this.concede()}>Concede</button>
                    </div>

                    <hr width="100%" size="0px" color="white" style={{borderTop: 'none'}}/>

                    <p className="turnlog">Turn Log:</p>
                    <div>
                        {moves}
                        <p className="startOfGame">- Start of Game -</p>
                    </div>
                </div>
            </div>
        );
    }
}

// =========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
