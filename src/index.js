import React from 'react';
import ReactDOM from 'react-dom';
import Board from './board';
import {getPatch, surround} from './scores.js';
import {boardSize, gridSize, WHITE, BLACK, tileState, gameState, countingMode} from './globals';
import './index.css';

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
            editMode: countingMode.none,
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
            case gameState.postGame:
                this.terCount(i, j);
        }
    }

    copyBoard() {
        let board = [];

        for (let i = 0; i < boardSize; i++) {
            board.push(this.state.squares[i].slice());
        }

        return board;
    }

    normalMove(i, j) {
        if (this.state.gameData.state === gameState.gameOver)
            return;

        // TODO: clone without reference to state
        const squares = this.copyBoard();

        if (squares[i][j] !== tileState.empty)
            return;

        squares[i][j] = this.state.gameData.turn;

        let patch = [];
        let captured = true;
        let eye = true;
        let neighbors = this.getNeighbors(i, j, squares);

        neighbors.forEach((n) => {
            patch = [];
            getPatch(n.x, n.y, squares.map(function (arr) { return arr.slice(); }), patch);

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

    terCount(i, j) {
        switch(this.state.editMode) {
            case countingMode.none: 
                break;
            case countingMode.swap:
                break;
            case countingMode.add: 
                break;
            case countingMode.del:
                break;
            case countingMode.patchDel: {
                // let patch = getPatch()
            }
            case countingMode.fill:
                break;
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
