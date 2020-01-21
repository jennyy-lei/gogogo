import React from 'react';
import ReactDOM from 'react-dom';
import Board from './board';
import {getPatch, surround} from './scores.js';
import {boardSize, gridSize, WHITE, BLACK, tileState, gameState, countingMode} from './globals';
import './index.css';
// import { remove } from 'jest-util/build/preRunMessage';

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [],
            squares: Array(boardSize).fill(tileState.empty).map(() => new Array(boardSize).fill(tileState.empty)),
            gameData: {
                turn: WHITE,
                state: gameState.playing,
            },
            scoreData: {
                white: 0,
                black: 0,
            },
            editMode: countingMode.patchDel,
            swapPos: {
                x: -1,
                y: -1,
            },
        };
    }

    move(x, y) {
        this.state.history.push({
            move: `${String.fromCharCode(97 + x).toUpperCase()}-${y}`,
            player: this.state.gameData.turn
        });
    }

    handleClick(i, j) {
        switch (this.state.gameData.state) {
            case gameState.playing:
                this.normalMove(i, j);
                break;
            case gameState.gameOver:
                break;
            case gameState.counting:
                this.terCount(i, j);
        }
    }

    copyBoard(squares) {
        return squares.map(function (arr) { return arr.slice(); });
    }

    normalMove(i, j) {
        let squares = this.copyBoard(this.state.squares);

        if (squares[i][j] !== tileState.empty)
            return;

        squares[i][j] = this.state.gameData.turn;

        let patch = [];
        let captured = true;
        let eye = true;
        let neighbors = this.getNeighbors(i, j, squares);

        neighbors.forEach((n) => {
            patch = [];
            getPatch(n.x, n.y, this.copyBoard(squares), patch);

            captured = surround(squares, patch);

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

    terCount(i, j, color) {
        switch(this.state.editMode) {
            case countingMode.none:
                break;
            case countingMode.swap: {
                let squares = this.copyBoard(this.state.squares);
                let pos = {...this.state.swapPos};
                console.log(pos);

                if (pos.x === -1 && pos.y === -1) {
                    pos = {x: i, y: j};
                } else if (pos.x === i && pos.y === j) {
                    pos = {x:-1, y:-1};
                } else if (squares[pos.x][pos.y] !== squares[i][j]) {
                    let temp = squares[i][j];

                    squares[i][j] = squares[pos.x][pos.y];
                    squares[pos.x][pos.y] = temp;

                    pos = {x: -1, y: -1};

                    this.setState({
                        squares: squares,
                    });
                }

                this.setState({
                    swapPos: pos,
                })
                break;
            }
            case countingMode.addW: {
                let squares = this.copyBoard(this.state.squares);
                squares[i][j] = WHITE;
                
                this.setState({squares: squares});
                break;
            }
            case countingMode.addB: {
                let squares = this.copyBoard(this.state.squares);
                squares[i][j] = BLACK;
                
                this.setState({squares: squares});
                break;
            }
            case countingMode.del:{
                let squares = this.copyBoard(this.state.squares);
                squares[i][j] = tileState.empty;
                
                this.setState({squares: squares});
                break;
            }
            case countingMode.patchDel: {
                let patch = [];
                let squares = this.copyBoard(this.state.squares);

                getPatch(i, j, this.copyBoard(squares), patch);

                this.removePatch(patch, squares);

                this.setState({squares: squares});
                break;
            }
            case countingMode.fill:
                break;
            default: break;
        }
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

    removePatch(patch, squares) {
        patch.forEach((n) => {    
            squares[n.x][n.y] = tileState.empty;
        });
    }

    switchPlayer() {
        this.setState({
            gameData: {
                turn: this.state.gameData.turn === WHITE ? BLACK : WHITE,
                state: gameState.playing,
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

    postGame() {
        this.setState({
            gameData: {
                state: gameState.counting,
            }
        })
    }

    changeEditState(i) {
        this.setState({
            editMode: i,
        })
    }

    tab() {
        if (this.state.gameData.state === gameState.playing) {
            return (
                <div className="game-info">
                    <div className="h-20%">
                        <p>Turn Count: {this.state.history.length}</p>
                        <p>Player Turn: <div className="block" style={{backgroundColor: this.state.gameData.turn === WHITE ? 'beige' : 'black'}}></div></p>
                        <button className="concedeBtn" onClick={() => this.concede()}>Concede</button>
                    </div>

                    <hr width="100%" size="0px" color="white" style={{borderTop: 'none'}}/>

                    <p className="turnlog">Turn Log:</p>
                    <div>
                        <p className="info-line"> {this.state.history.length} </p>
                        <p className="startOfGame">- Start of Game -</p>
                    </div>
                </div>
            );
        } else if (this.state.gameData.state === gameState.counting) {
            return (
                <div className="game-info">
                    <p>MODE: {this.state.editMode}</p>
                    <button onClick={() => this.changeEditState(countingMode.swap)}>Swap stones</button>
                    <button onClick={() => this.changeEditState(countingMode.addW)}>Add White</button>
                    <button onClick={() => this.changeEditState(countingMode.addB)}>Add Black</button>
                    <button onClick={() => this.changeEditState(countingMode.del)}>Remove Stone</button>
                    <button onClick={() => this.changeEditState(countingMode.patchDel)}>Patch delete</button>
                </div>
            );
        }
    }

    render() {
        let style = {
            display: 'grid',
            gridTemplateRows: `repeat( ${boardSize}, ${gridSize}px )`,
            gridTemplateColumns: `repeat( ${boardSize}, ${gridSize}px )`,
        }

        return (
            <div className="game">
                <div className="overlay" style={{opacity: this.state.gameData.state === gameState.gameOver ? 1 : 0, zIndex: this.state.gameData.state === gameState.gameOver ? 1000 : -1}}>
                    <h1>Game Over!</h1>
                    <button onClick={() => this.postGame()}>Start Territory Counting?</button>
                </div>

                <h1>GO<br/>GO<br/>GO<br/>!</h1>
                <div className="game-board" style={style}>
                    <Board
                        squares={this.state.squares}
                        move={() => this.move()}
                        onClick={(i, j) => this.handleClick(i, j)}
                        gameData={this.state.gameData}                        
                    />
                </div>
                
                {this.tab()}
            </div>
        );
    }
}

// =========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
