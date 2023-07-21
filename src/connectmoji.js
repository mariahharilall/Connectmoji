const wcwidth = require("wcwidth");

/** Creates a single dimensional array representation of the board
 * @param {number} rows - the number of rows in the board.
 * @param {number} cols - the number of columns in the board.
 * @param {string} fill - the initial value contained in each cell default value should be empty string.
 * @returns {Object} An object containing data, rows, and cols.
 */
function generateBoard(rows, cols, fill=null) {
    return {
        data: new Array(rows*cols).fill(fill),
        rows: rows,
        cols: cols
    };
}

/** Translates a row and a column into an index.
 * @param {Object} board - the board object where the row and col come from.
 * @param {number} row - the row number to be converted to an index in a one dimensional Array representation.
 * @param {number} col - the column number to be converted to an index in a one dimensional aArray representation.
 * @returns {number} the corresponding index number
 */
function rowColToIndex(board, row, col) {
    return board.cols * row + col;
}

/** Translates a single index in the data Array of the board to the cell's row and column number.
 * @param {Object} board - the board object where the row and col come from.
 * @param {number} i - the index to be converted into a row and column.
 * @returns {Object} an object containing the corresponding row and column.
 */
 function indexToRowCol(board, i) {
    return {
        row: Math.floor(i / board.cols),
        col: i % board.cols
    };
}

/** Sets the value of the cell at the specified row and column numbers on the board
 *  object's data Array to the value, letter.
 * @param {Object} board - the board where a cell will be set to letter.
 * @param {number} row - the row number of the cell to be set.
 * @param {number} col - the column number of the cell to be set.
 * @param {string} value - the value to set the cell to.
 * @returns {Object} a new board 
 */
 function setCell(board, row, col, value) {
    const newBoard = {
        rows: board.rows,
        cols: board.cols,
        data: board.data.slice()
    };
    newBoard.data[rowColToIndex(board, row, col)] = value;
    return newBoard;
}

/** Sets the value of the cell at the specified row and column numbers on the board
 *  object's data Array to the value, letter.
 * @param {Object} board - the board object.
 * @returns {Object} a new board.
 */
 function setCells(board, ...moveObjects) {
    let newBoard = board;
    for (const move of moveObjects) {
        newBoard = setCell(newBoard, move.row, move.col, move.val);
    }
    
    return newBoard;
}

/** Creates a text drawing representation of the Connectmoji board passed in.
 * @param {Object} board - the board to be converted to a String.
 * @returns {string} a String representation of the board.
 */
 function boardToString(board) {
    //preprocess data array to find out what width should be
    let width = 0;
    for (const cell in board['data']) {
        width = (wcwidth(board['data'][cell]) > width) ? wcwidth(board['data'][cell]) : width;
    }

    //set up board
    let boardString = "";
    for (let row = 0; row < board['rows']; row++) {
        for (let col = 0; col < board['cols']; col++) {
            const cell = board['data'][rowColToIndex(board, row, col)];
            boardString += "| ";

            if (!cell) { //need to add spaces if cell is null
                const space = " ";
                boardString += space.repeat(width);
            } else if (wcwidth(cell) === width) {
                boardString += cell;
            } else { //need to add spaces if width of cell is less than width of other cells
                const spaces = " ".repeat(width - wcwidth(cell));

                boardString += cell + spaces;
            }

            boardString += " "; //padding
        }
        boardString += "|\n";
    }

    //then add separator and label rows at the bottom
    const separator = "-".repeat(width + 2) + "+";
    const separatorString = "|" + separator.repeat(board['cols'] - 1) + "-".repeat(width + 2) + "|\n";
    let labelString = "";
    for (let col = 0; col < board['cols']; col++) {
        // add spaces for padding to make up the width, not counting the width the column label takes up
        labelString += "| " + String.fromCharCode(65 + col) + " ".repeat(width-wcwidth(String.fromCharCode(65 + col)) + 1);
    }

    boardString += separatorString + labelString + "|";
    return boardString;
}

/** Translates a column letter to a column number.
 * @param {string} letter - the uppercase letter to be translated to a numeric value.
 * @returns {number} the column number associated with the letter or null if not valid column.
 */
 function letterToCol(letter) {
    const colNum = letter.charCodeAt(0) - 65;
    if(letter.length !== 1 || colNum < 0 || colNum > 25){
        return null;
    }
    return colNum;
}

/** Finds the next empty cell in the column identified by letter in the board object.
 * @param {Object} board - the board to examine for an empty cell.
 * @param {string} letter - the name of the column to check for an empty cell.
 * @param {string} empty - the value contained in the data Array of board that represents an empty cell.
 * @returns {Object} an object with two properties: row and col… specifying the row and column numbers of an empty cell.
 */
 // eslint-disable-next-line no-unused-vars
 function getEmptyRowCol(board, letter, empty = null) {
    // get the corresponding col for letter
    const col = letterToCol(letter);
    let i = 0;

    // check that col letter/num isn't null or full
    if (col === null){
        return null;
    }
    else if (board.cols < col + 1) {
        return null;
    }

    // iterate through each row in given column
    for(i = 0; i < board.rows; i++){
        if (board.data[rowColToIndex(board, i, col)] !== null) {
            break;
        }
    }

    //return row/col or null if no empty rows
    if (i === 0){
        return null;
    } else {
        return {row: i - 1, col: col};
    }
}

/** Translates a column letter to a column number.
 * @param {Object} board - the board to examine to examine for a winner.
 * @returns {Array} gives back all columns that have an empty cell as an Array of uppercase letters.
 */
 function getAvailableColumns(board) {
    const availCols = new Array();
    for (let i = 0; i < board.cols; i++) {
        if(getEmptyRowCol(board, String.fromCodePoint(65 + i)) !== null) {
            availCols.push(String.fromCodePoint(65 + i));
        }
    }

    return availCols;
}

/** Given a row and col number, determine if the value in that cell is repeated consecutively vertically.
 * @param {Object} board - the board to examine to examine for a winner.
 * @param {number} row - the row number of the cell to examine for consecutive values.
 * @param {number} col - the column number of the cell to examine for consecutive values.
 * @param {number} n - the number of consecutive values for a win.
 * @returns {boolean} true if there are n consecutive values.
 */
 function consecutiveVertical (board, row, col, n) {
    let emptyCellFound = false;
    let count = 0;
    let currentRow = row;
    const currentCellVal = board['data'][rowColToIndex(board, row, col)];

    //first check above initial cell
    while (!emptyCellFound) {
        if (board['data'][rowColToIndex(board, currentRow, col)] === currentCellVal && currentRow >= 0) {
            //if cell has the right value and we are still on the board
            count++;
            currentRow--;
        } else {
            emptyCellFound = true;
        }
    }

    //then check below initial cell
    emptyCellFound = false;
    currentRow = row + 1; //start below initial cell so we don't double count it
    while (!emptyCellFound) {
        if (board['data'][rowColToIndex(board, currentRow, col)] === currentCellVal && currentRow < board['rows']) {
                count++;
                currentRow++;
        } else {
            emptyCellFound = true;
        }
    }

    return count >= n;
}

/** Given a row and col number, determine if the value in that cell is repeated consecutively horizontally.
 * @param {Object} board - the board to examine to examine for a winner.
 * @param {number} row - the row number of the cell to examine for consecutive values.
 * @param {number} col - the column number of the cell to examine for consecutive values.
 * @param {number} n - the number of consecutive values for a win.
 * @returns {boolean} true if there are n consecutive values.
 */
function consecutiveHorizontal(board, row, col, n) {
    let emptyCellFound = false;
    let count = 0;
    let currentCol = col;
    const currentCellVal = board['data'][rowColToIndex(board, row, col)];

    //first check to the right of initial cell
    while (!emptyCellFound) {
        if (board['data'][rowColToIndex(board, row, currentCol)] === currentCellVal && currentCol < board['cols']) {
            count++;
            currentCol++;
        } else {
            emptyCellFound = true;
        }
    }

    //then check to the left of the initial cell
    emptyCellFound = false;
    currentCol = col - 1;
    while (!emptyCellFound) {
        if (board['data'][rowColToIndex(board, row, currentCol)] === currentCellVal && currentCol >= 0) {
            count++;
            currentCol--;
        } else {
            emptyCellFound = true;
        }
    }

    return count >= n;
}

/** Given a row and col number, determine if the value in that cell is repeated consecutively diagonally
 *  from bottom left to upper right.
 * @param {Object} board - the board to examine to examine for a winner.
 * @param {number} row - the row number of the cell to examine for consecutive values.
 * @param {number} col - the column number of the cell to examine for consecutive values.
 * @param {number} n - the number of consecutive values for a win.
 * @returns {boolean} true if there are n consecutive values.
 */
function consecutiveDiagonal1(board, row, col, n) {
    let emptyCellFound = false;
    let count = 0;
    let currentRow = row;
    let currentCol = col;
    const currentCellVal = board['data'][rowColToIndex(board, row, col)];

    //first check upper right of initial cell
    while (!emptyCellFound) {
        if (board['data'][rowColToIndex(board, currentRow, currentCol)] === currentCellVal && currentCol < board['cols'] && currentRow >= 0) {
            count++;
            currentRow++;
            currentCol++;
        } else {
            emptyCellFound = true;
        }
    }

    //then check lower left of initial cell
    emptyCellFound = false;
    currentCol = col - 1;
    currentRow = row - 1;
    while (!emptyCellFound) {
        if (board['data'][rowColToIndex(board, currentRow, currentCol)] === currentCellVal && currentCol >= 0 && currentRow < board['rows']) {
            count++;
            currentRow--;
            currentCol--;
        } else {
            emptyCellFound = true;
        }
    }

    return count >= n;
}

/** Given a row and col number, determine if the value in that cell is repeated consecutively diagonally
 *  from the upper left to bottom right.
 * @param {Object} board - the board to examine to examine for a winner.
 * @param {number} row - the row number of the cell to examine for consecutive values.
 * @param {number} col - the column number of the cell to examine for consecutive values.
 * @param {number} n - the number of consecutive values for a win.
 * @returns {boolean} true if there are n consecutive values.
 */
function consecutiveDiagonal2(board, row, col, n) {
    let emptyCellFound = false;
    let count = 0;
    let currentRow = row;
    let currentCol = col;
    const currentCellVal = board['data'][rowColToIndex(board, row, col)];

    //first check upper left of initial cell
    while (!emptyCellFound) {
        if (board['data'][rowColToIndex(board, currentRow, currentCol)] === currentCellVal && currentCol >= 0 && currentRow >= 0) {
            count++;
            currentRow++;
            currentCol--;
        } else {
            emptyCellFound = true;
        }
    }

    //then check lower left of initial cell
    emptyCellFound = false;
    currentCol = col - 1;
    currentRow = row - 1;
    while (!emptyCellFound) {
        if (board['data'][rowColToIndex(board, currentRow, currentCol)] === currentCellVal && currentCol < board['cols'] && currentRow < board['rows']) {
            count++;
            currentRow--;
            currentCol++;
        } else {
            emptyCellFound = true;
        }
    }

    return count >= n;

}

/** Given a row and col number, determine if the value in that cell is repeated consecutively.
 * @param {Object} board - the board to examine to examine for a winner.
 * @param {number} row - the row number of the cell to examine for consecutive values.
 * @param {number} col - the column number of the cell to examine for consecutive values.
 * @param {number} n - the number of consecutive values for a win.
 * @returns {boolean} true if there are n consecutive values horizontally, vertically or diagonally; otherwise, returns false.
 */
function hasConsecutiveValues(board, row, col, n) {
    //have functions that check the diagonals/verticals/horizontals and call them all
    return consecutiveVertical(board, row, col, n) || consecutiveHorizontal(board, row, col, n) || consecutiveDiagonal1(board, row, col, n) || consecutiveDiagonal2(board, row, col, n);
}

/** Using the board object, board, and a string of moves, s, plays out a series of moves automatically.
 * @param {Object} board - the board object that will be used for autoplay.
 * @param {string} s - string containing the values (pieces) for each player, along with their moves.
 * @param {number} numConsecutive - the number of consecutive values necessary for a win.
 * @return {Object} contains board data and metadata about the game played on the board.
 */
function autoplay(board, s, numConsecutive) {
    // create two subarrays, one with the value pieces and another array that contains the moves
    const moves = [...s];
    const piece = moves.slice(0, 2);
    moves.splice(0, 2);

    // get the first move to start
    const move = moves.shift();

    // check that the move is not undefined
    // eslint-disable-next-line eqeqeq
    if (move != null) {

        // if not undefined, get the empty cell within the column
        const cell = getEmptyRowCol(board, move);

        // if invalid cell placement
        // eslint-disable-next-line eqeqeq
        if (cell == null) {
            return {
                board: null,
                pieces: piece,
                lastPieceMoved: piece[0],
                error: {num: 1, val: piece[0], col: move}};
        } else {
            // if valid cell placement, set cell
            board = setCell(board, cell.row, cell.col, piece[0]);
        }

        // check to see if there is a winner yet
        const consecutiveVals = hasConsecutiveValues(board, cell.row, cell.col, numConsecutive);
        if (consecutiveVals) {
            // there are still more moves after win so this is an error
            if (moves.length > 0) {
                return {
                    board: null, 
                    pieces: piece, 
                    lastPieceMoved: piece[1], 
                    error: {num: 2, val: piece[1], col: move}};
            } else { //this was a valid last move and thus, is the winner
                return {
                    board: board,
                    pieces: piece, 
                    lastPieceMoved: piece[0],
                    winner: piece[0]};
            }
        }
    }

    //repeat the steps above for each move
    while (moves.length > 0) {
        // call the function continously to iterate over the next moves and
        // pass the same parameters but put back together the pieces array and moves array
        // in order to pass it back together again as one string
        const gameResult = autoplay(board, `${piece[1]}${piece[0]}${moves.join('')}`, numConsecutive);
        gameResult.pieces = piece;
        // eslint-disable-next-line eqeqeq
        if (gameResult.error != null) {
            gameResult.error.num += 1;
        }
        return gameResult;
    }

    // if after the auto play there is no winner and also no error, then we just return the board,
    // pieces, and last piece moved.
    return {
        board: board, 
        pieces: piece, 
        lastPieceMoved: piece[0]};
}

/** Sets the given cell based on the users chosen column and symbol.
 * @param {Object} board - the board object.
 * @param {string} colLetter - the corresponding letter of the given column.
 * @param {string} symbol - the value/emoji to set the cell to.
 * @return {Object} returns board object containing row/col where move was made.
 */
function userMove(board, colLetter, symbol) {
    // for manual user move
    const emptyRowCol = getEmptyRowCol(board, colLetter);
    board = setCell(board, emptyRowCol.row, emptyRowCol.col, symbol);
    return {
        board,
        row: emptyRowCol.row,
        col: emptyRowCol.col};
}

/** Generates a computer move to set a randomly selected cell.
 * @param {Object} board - the board object.
 * @param {string} symbol - the value/emoji to set the cell to.
 * @return {Object} returns board object containing row/col where move was made.
 */
function computerMove(board, symbol) {
    // randomly select column for computer move
    const availColumns = getAvailableColumns(board);
    const index = Math.floor(Math.random() * (availColumns.length - 1));
    const colLetter = availColumns[index];
    const emptyRowCol = getEmptyRowCol(board, colLetter);
    board = setCell(board, emptyRowCol.row, emptyRowCol.col, symbol);
    return {
        board,
        row: emptyRowCol.row,
        col: emptyRowCol.col};
}


module.exports = {
    generateBoard: generateBoard,
    rowColToIndex: rowColToIndex,
    indexToRowCol: indexToRowCol,
    setCell: setCell,
    setCells: setCells,
    boardToString: boardToString,
    letterToCol: letterToCol,
    getEmptyRowCol: getEmptyRowCol,
    getAvailableColumns: getAvailableColumns,
    hasConsecutiveValues: hasConsecutiveValues,
    autoplay: autoplay,
    userMove: userMove,
    computerMove: computerMove
};