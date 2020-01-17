import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const boardSize = 19;
const gridSize = 40;

const WHITE = 1;
const BLACK = 2;

const tileState = {
    'empty' : 0,
    'white' : WHITE,
    'black' : BLACK
};

const edgeType = {
    'none' : 0,
    'tl_corner' : 1,
    'tr_corner' : 2,
    'br_corner' : 3,
    'bl_corner' : 4,
    'th_edge' : 5,
    'rv_edge' : 6,
    'bh_edge' : 7,
    'lv_edge' : 8,
    'star' : 9,
}

let curTurn = WHITE;

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

class Board extends React.Component {
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
                        j,
                        i,
                        this.edgeType(j, i),
                    )
                );
            }
        }

        return boardTiles;
    }

    render() {
        // console.log(this.state.squares[0][0]);
        // const status = 'Next player: X';

        return (
            this.renderBoard()
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [],
            squares: Array(boardSize).fill(tileState.empty).map(() => new Array(boardSize).fill(tileState.empty))
        };
    }

    move(x, y) {
        this.state.history.push({
            move: `${String.fromCharCode(97 + x).toUpperCase()}-${y}`,
            player: curTurn,
        });
    }

    handleClick(i, j) {
        const squares = this.state.squares.slice();

        if (squares[i][j] !== tileState.empty)
            return;

        squares[i][j] = curTurn;

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
        
        curTurn = curTurn === WHITE ? BLACK : WHITE;

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
                    <Board squares={this.state.squares} move={() => this.move()} onClick={(i, j) => this.handleClick(i, j)}/>
                </div>
                <div className="game-info">
                    <div className="h-20%">
                        <p>Turn Count: {this.state.history.length}</p>
                        <p>Player Turn: <div className="block" style={{backgroundColor: curTurn === WHITE ? 'beige' : 'black'}}></div></p>
                        <button className="concedeBtn">Concede</button>
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
