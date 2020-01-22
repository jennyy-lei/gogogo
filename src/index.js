import React from 'react';
import ReactDOM from 'react-dom';
import Board from './board';
import {getPatch, surround, tileColor, closedTer} from './helpers.js';
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
                error: 0,
            },
            editMode: countingMode.none,
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

        squares[i][j] = this.changeTile(this.state.gameData.turn);

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

    changeTile(turn) {
        if (turn === WHITE)
            return tileState.white;
        else if (turn === BLACK)
            return tileState.black;
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
                squares[i][j] = tileState.pWhite;
                
                this.setState({squares: squares});
                break;
            }
            case countingMode.addB: {
                let squares = this.copyBoard(this.state.squares);
                squares[i][j] = tileState.pBlack;
                
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
            case countingMode.fillW: {
                let patch = [];
                let squares = this.copyBoard(this.state.squares);

                getPatch(i, j, this.copyBoard(squares), patch);

                this.fillPatch(patch, squares, tileState.pWhite);

                this.setState({squares: squares});
                break;
            }
            case countingMode.fillB: {
                let patch = [];
                let squares = this.copyBoard(this.state.squares);

                getPatch(i, j, this.copyBoard(squares), patch);

                this.fillPatch(patch, squares, tileState.pBlack);

                this.setState({squares: squares});
                break;
            }
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

    fillPatch(patch, squares, color) {
        patch.forEach((n) => {    
            squares[n.x][n.y] = color;
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

    changeGameState(i) {
        this.setState({
            gameData: {
                state: i,
            },
        })
    }

    autoComplete() {
        let squares = this.copyBoard(this.state.squares);
        let patch = [];
        let edge = false;

        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (squares[i][j] === tileState.empty) {
                    edge = false;
                    patch = [];

                    getPatch(i, j, this.copyBoard(squares), patch);
                    
                    edge = closedTer(squares, patch);

                    if (edge !== -1)
                        this.fillPatch(patch, squares, edge);
                }
            }
        }

        this.setState({squares:squares});
    }

    countScore() {
        this.changeGameState(gameState.complete);

        let w = this.state.scoreData.white,
            b = this.state.scoreData.black,
            e = this.state.scoreData.error;
        
        let squares = this.copyBoard(this.state.squares);

        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (squares[i][j] !== this.state.empty) {
                    if (squares[i][j] === tileState.black || squares[i][j] === tileState.pBlack)
                        b++;
                    else if (squares[i][j] === tileState.white || squares[i][j] === tileState.pWhite)
                        w++;
                    else {
                        squares[i][j] = tileState.error;
                        e++;
                    }
                }
            }
        }

        this.setState({
            squares: squares,
            scoreData: {
                white: w,
                black: b,
                error: e,
            }
        })
    }

    reset() {
        let history = [];
        let squares = Array(boardSize).fill(tileState.empty).map(() => new Array(boardSize).fill(tileState.empty));
        let gameData = {
            turn: WHITE,
            state: gameState.playing,
        };
        let scoreData = {
            white: 0,
            black: 0,
            error: 0,
        };
        let editMode = countingMode.none;
        let swapPos = {
            x: -1, 
            y: -1,
        }

        this.setState({
            history: history,
            squares: squares,
            gameData: gameData,
            scoreData: scoreData,
            editMode: editMode,
            swapPos: swapPos,
        });
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

                    {/* <p className="turnlog">Turn Log:</p> */}
                    {/* <div> */}
                        {/* <p className="info-line"> {this.state.history.length} </p> */}
                    {/* </div> */}
                </div>
            );
        } else if (this.state.gameData.state === gameState.counting) {
            return (
                <div className="game-info">
                    <p>MODE: {this.state.editMode}</p>
                    <button className="editBtn" onClick={() => this.changeEditState(countingMode.swap)}>0: Swap stones</button>
                    <button className="editBtn" onClick={() => this.changeEditState(countingMode.addW)}>1: Add White</button>
                    <button className="editBtn" onClick={() => this.changeEditState(countingMode.addB)}>2: Add Black</button>
                    <button className="editBtn" onClick={() => this.changeEditState(countingMode.del)}>3: Remove Stone</button>
                    <button className="editBtn" onClick={() => this.changeEditState(countingMode.patchDel)}>4: Patch delete</button>
                    <button className="editBtn" onClick={() => this.changeEditState(countingMode.fillW)}>5: Fill White Territory</button>
                    <button className="editBtn" onClick={() => this.changeEditState(countingMode.fillB)}>6: Fill Black Territory</button>
                    <button className="editBtn" onClick={() => this.autoComplete()}>7: Auto-complete</button>
                    <button className="editBtn done" onClick={() => this.countScore()}>DONE</button>
                </div>
            );
        }
    }

    overlay() {
        let open = false;

        if (this.state.gameData.state === gameState.gameOver || this.state.gameData.state === gameState.complete)
            open = true;

        if (this.state.gameData.state === gameState.gameOver) {
            return (
                <div className="overlay" style={{opacity: open ? 1 : 0, zIndex: open ? 1000 : -1}}>
                    <h1>Game Over!</h1>
                    <button onClick={() => this.postGame()}>Start Territory Counting?</button>
                </div>
            );
        } else if (this.state.gameData.state === gameState.complete) {
            let w = this.state.scoreData.white,
                b = this.state.scoreData.black,
                e = this.state.scoreData.error;

            let text = w !== b ? (w > b ? 'White Wins!' : 'Black Wins!') : 'Tie!';

            return (
                <div className="overlay" style={{opacity: open ? 1 : 0, zIndex: open ? 1000 : -1}}>
                    <h1>Complete!</h1>
                    <p>{text}</p>
                    <p>White: {w} | Black: {b}</p>
                    <p>Missing information on : {e} {e === 1 ? 'stone' : 'stones'}</p>
                    <button onClick={() => this.reset()}>New Game?</button>
                    <button onClick={() => this.changeGameState(gameState.counting)}>Back to Board</button>
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
                {this.overlay()}

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
