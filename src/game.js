const clear = require('clear');
const readlineSync = require('readline-sync');
const c = require('./connectmoji.js');

function game() {
    let board, moveString, winner;
    let playerValue = "😎";
    let computerValue = "💻";
    let rows = 6;
    let columns = 7;
    let numConsecutive = 4;
    if (process.argv[2]) {
        const optionsArr = process.argv[2].split(',');
        playerValue = optionsArr[0];
        moveString = optionsArr[1];
        rows = optionsArr[2];
        columns = optionsArr[3];
        numConsecutive = optionsArr[4];

        //automatically go through moves according to string
        board = c.generateBoard(rows, columns);
        readlineSync.question('press ENTER to start game: ');
        const resultObj = c.autoplay(board, moveString, numConsecutive);

        board = resultObj.board;
        console.log(c.boardToString(board));

        computerValue = resultObj.pieces[1];
        winner = resultObj.winner;

        if (!winner) {
            //if no winner and user was last to play on moveString. let computer play
            if (resultObj.lastPieceMoved === playerValue) {
                const compMove = c.computerMove(board, computerValue);
                board = compMove.board;
                readlineSync.question("Press ENTER to see computer move");
                clear();
                console.log(c.boardToString(board));
            }
            readlineSync.question('press ENTER to continue game: ');
        }

    } else {
        //prompt user to enter things
        const ans = readlineSync.question("Enter the number of rows, columns, and consecutive \"pieces\" for win \n (all separated by commas... for example: 6,7,4) \n >");
        if (ans) {
            const ansArr = ans.split(',');
            rows = ansArr[0];
            columns = ansArr[1];
            board = c.generateBoard(rows, columns);
            numConsecutive = ansArr[2];
        }
        console.log("Using row, col and consecutive: " + rows + " " + columns + " " + numConsecutive);
        const pieces = readlineSync.question("Enter two characters that represent the player and computer \n (separated by a comma... for example: P,C) \n >");
        if (pieces) {
            const piecesArr = pieces.split(',');
            playerValue = piecesArr[0];
            computerValue = piecesArr[1];
        }
        console.log("Using player and computer characters: " + playerValue + " " + computerValue);
        const first = readlineSync.question("Who goes first, (P)layer or (C)omputer? \n >");
        if (first === "C") {
            //if computer goes first let computer make first move
            clear();
            console.log("Computer goes first");
            const compMove = c.computerMove(board, computerValue);
            board = compMove.board;
            if (c.hasConsecutiveValues(board, compMove.row, compMove.col, numConsecutive) && !winner) {
                //check if computer won
                winner = computerValue;
            }
            readlineSync.question("Press ENTER to see computer move");
            clear();
        } else {
            console.log("Player goes first");
            board = c.generateBoard(rows, columns);
        }
        console.log(c.boardToString(board));
    }

    while (!winner) {
        let possibleCol = false;
        let availColumns = c.getAvailableColumns(board);
        console.log();
        let col;

        while (!possibleCol && availColumns.length !== 0) {
            col = readlineSync.question('Choose a column letter to drop your piece in: ');
            if (availColumns.indexOf(col) > -1) { //input validation
                possibleCol = true;
                clear();
                console.log("...dropping in column " + col);
            } else {
                console.log("Oops, that is not a valid move, try again!");
            }

        }

        if (!winner && availColumns.length!==0) {
            const uMove = c.userMove(board, col, playerValue);
            board = uMove.board;
            console.log(c.boardToString(board));
            console.log();
            if (c.hasConsecutiveValues(board, uMove.row, uMove.col, numConsecutive) && !winner) {
                //check if player won
                winner = playerValue;
            }
        }

        //check if any columns available
        availColumns = c.getAvailableColumns(board);
        if (!winner && availColumns.length!==0) {
            readlineSync.question("Press ENTER to see computer move");
            clear();
            const compMove = c.computerMove(board, computerValue);
            board = compMove.board;
            if (c.hasConsecutiveValues(board, compMove.row, compMove.col, numConsecutive)) {
                //check if computer won
                winner = computerValue;
            }
            console.log(c.boardToString(board));
        }

        if (availColumns.length === 0) {
            winner = "tie";
        }
    }

    if (winner === "tie") {
        console.log("No winner.");
    } else {
        console.log("The winner is " + winner);
    }
}

game();
