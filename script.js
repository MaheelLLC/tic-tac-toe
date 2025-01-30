// create a player object using a factory function
const Player = (marker, name = "Player") => {
    return { marker, name };
}

// since TicTacToeGame got way too big, let's take out the gameboard and turn it
// into a module
const Gameboard = (() => {
    // this initializes the gameboard into an empty board
    let board = new Array(9).fill("");
    // we can see each cell (tic-tac-toe spot) of the board as well
    const getCell = (index) => board[index];
    // if we have a getter, then, we should have a setter to actually play the game
    const setCell = (index, marker) => board[index] = marker;
    // a helper function to reset the board back to empty
    const reset = () => board.fill("");
    // // the display function is now here
    // const display = () => {
    //     // just console log it for now
    //     console.log(`${board[0]} | ${board[1]} | ${board[2]}\n` +
    //         `---------\n` +
    //         `${board[3]} | ${board[4]} | ${board[5]}\n` +
    //         `---------\n` + 
    //         `${board[6]} | ${board[7]} | ${board[8]}`);
    // };
    // let's return the helper functions so the game can use them
    return { getCell, setCell, reset };
})();
    
// now the tictactoegame will just in charge of the game logic and players
const TicTacToeGame = (() => {
    // player X (no need to define Gameboard since it's an immediately invoked module)
    // we're gonna put this into an outer function later (we'll set playerX and O with an outer function
    // so we can have custom names
    const playerX = Player('X');
    const playerO = Player('O');
    // a flag to see if the game is over
    let gameOver = false;
    // store whose turn it is (starts at X)
    let currentPlayer = playerX;
    // store how many turns it has been
    let numberOfTurns = 0;

    // just makes the player switch look cleaner later on
    const switchPlayer = () => {
        currentPlayer = (currentPlayer === playerX) ? playerO : playerX;
    };

    const checkWin = (player, index) => {
        // grab the row number of the newly placed marker
        const row = Math.floor(index / 3);
        // grab the column of the newly placed marker
        const column = index % 3;

        // let's check if the row it's in has the same marker across it
        // a 3-in-a-row
        // initially, let's assume that they got the row win
        let rowWin = true;
        // now let's check through each item in the row to see if that assumption
        // is true
        for (let i = 0; i < 3; i++) {
            // if the row item does not equal the player marker
            if (Gameboard.getCell(row * 3 + i) !== player.marker) {
                // then, the player didn't get the row win
                rowWin = false;
                // we can immediately move on
                break;
            }
        }
        // if our assumption held true for the entire row, we found our win
        if (rowWin) return true;

        // assume it's a column win
        let columnWin = true;
        for (let i = 0; i < 3; i++) {
            // column is the offset where the column starts
            // for example, in column 1-4-7, column = 1. Each index is 3
            // spots away from each other (3 is the number of elements per row)
            if (Gameboard.getCell(i * 3 + column) !== player.marker) {
                columnWin = false;
                break;
            }
        }
        if (columnWin) return true;

        // the downward diagonal only contains indices that are multiples of 4
        // if the index is a multiple of 4
        if ((index % 4 == 0)) {
            // let's assume a downward diagonal victory
            let downDiagWin = true;
            for (let i = 0; i < 3; i++) {
                if (Gameboard.getCell(i * 4) !== player.marker) {
                    downDiagWin = false;
                    break;
                }
            }
            if (downDiagWin) return true;
        }

        // the upward diagonal contains index 2, 4, and 6
        if ((index % 2 == 0) && (index >= 2 && index <= 6)) {
            // let's assume a topward diagonal victory
            let upDiagWin = true;
            for (let i = 0; i < 3; i++) {
                // it starts at 2, so y-intercept is 2. Every increase is by 2, 
                // so slope is 2.
                if (Gameboard.getCell(2 * i + 2) !== player.marker) {
                    upDiagWin = false;
                    break;
                }
            }
            if (upDiagWin) return true;
        }

        // no victory yet
        return false;
    };

    const makeMove = (user_index) => {
        // if the game is over, the user shouldn't be able to place more markers
        // ignore clicks if game is over
        if (gameOver) return;
        // this will convert the user's input to an integer
        // if the user provides something else (letters or something), this will
        // return a NaN
        const index = parseInt(user_index);
        // if the index is a number between 0 and 8
        if ((isNaN(index)) || (index < 0 || index > 8)) {
            console.log("Please provide valid input (a number between 0-8)");
            return null;
        }

        // if the spot is free
        if (Gameboard.getCell(index) === "") {
            // give it to the current player by adding their marker to the gameboard
            Gameboard.setCell(index, currentPlayer.marker);
            // RENDER: we can possibly render the board here
            DisplayController.turn_render(index, currentPlayer.marker);
            // if this move was a game winner
            if (checkWin(currentPlayer, index)) {
                // notify the users who won
                console.log(`Player ${currentPlayer.marker} wins!`);
                // the game is over, so let the flag know
                gameOver = true;
                // disable all cells once the game is over
                DisplayController.disableCells();
                // return true to break the game loop
                return true;
            }
            
            // we should check for a tie here since no one won yet
            // if we check for a tie any earlier, then even if the last move is
            // a game winning move, my code will say it's a tie.
            // if the gameboard is completely filled
            if (numberOfTurns >= 8) {
                // let the users know a tie has occurred
                console.log("It's a tie");
                // the game is over, so let the flag know
                gameOver = true;
                // disable all cells once the game is over
                DisplayController.disableCells();
                // return a gameover
                return true;
            }

            // switch the player to the next guy
            switchPlayer();
            // update the visual indicator of the current player's turn
            DisplayController.updateTurnIndicator(currentPlayer);
            // increment the number of turns
            numberOfTurns++;
            // Gameboard.display();
            // return whether or not the turn was a game winner
            return false;
        // here the spot is already taken
        } else {
            // notify the user
            console.log("Sorry this spot is already taken. Try again.");
            // Gameboard.display();
            // return false since no one won yet
            return false;
        }
    };

    const startGame = () => {
        // reset the board
        Gameboard.reset();
        // do a full render to show an empty gameboard
        DisplayController.full_render();
        // set the currentPlayer to X
        currentPlayer = playerX;
        // display the current player's turn
        DisplayController.updateTurnIndicator(currentPlayer);
        // reset the number of turns
        numberOfTurns = 0;
        // reset the gameOver flag so users can play again
        gameOver = false;
        // activate the cells to play with
        DisplayController.activateCells();
        // let the user know that the game has begun
        console.log("Let the tictactoe game begin.");
        // RENDER: Everywhere Gameboard.display() occurs, we need to render on the screen
        // display the board for X to start
        // Gameboard.display();
    }

    return {
        makeMove,
        startGame,
    }

})();

// sadly a useless function
// function getPlayerInput(user_index) {
//     // this will convert the user's input to an integer
//     // if the user provides something else (letters or something), this will
//     // return a NaN
//     const index = parseInt(user_index);
//     // if the index is a number between 0 and 8
//     if ((!isNaN(index)) && (index >= 0 && index <= 8)) {
//         return index;
//     } else {
//         console.log("Please provide valid input (a number between 0-8)");
//         return null;
//     }
// }

document.addEventListener('DOMContentLoaded', function() {
    // start the game (which displays the board and waits for a player's turn)
    TicTacToeGame.startGame();
    // expose the game to the window so we can call game.makeMove(index) from the console
    window.game = TicTacToeGame;
});

const DisplayController = (() => {
    // grab the gameboard element
    const gameboardElement = document.querySelector("#gameboard");
    // add a click event listener to the gameboard
    gameboardElement.addEventListener("click", (event) => {
        // if the user clicked a cell inside the gameboard
        if (event.target.classList.contains("cell")) {
            // grab the index of the cell that corresponds to the Gameboard array
            const index = event.target.dataset.index;
            // try to play a turn on the cell that was clicked on
            TicTacToeGame.makeMove(index);
        }
    });
    
    /*
    We need two functions. One function will be called turn_render. The other
    function will be called full_render. turn_render will add a marker to 
    the screen where the player's marker will be placed inside the appropriate
    cell. We have to attach the makeMove function to each gameboard cell and
    make makeMove call turn_render. The second function is a full render that
    will iterate through the children of the gameboardElement and place the
    respective marker from the Gameboard array inside every child. */

    // defines a helper function for a single turn to render the marker
    const turn_render = (index, marker) => {
        // grab the cell that should be rendered with a new marker
        const cellElement = document.querySelector(`#cell-${index}`);
        // put the marker inside the cell
        cellElement.textContent = marker;
    }

    // defines a helper function that will render the entire gameboard from
    // the Gameboard array
    const full_render = () => {
        // for every cell in the DOM gameboard
        document.querySelectorAll(".cell").forEach((cell, index) => {
            // set its content equal to th
            cell.textContent = Gameboard.getCell(index);
        });
    };

    // helper function to update the whose-turn element to match the current
    // player's turn
    const updateTurnIndicator = (currentPlayer) => {
        const turnIndicator = document.querySelector('#whose-turn');
        turnIndicator.textContent = `Current Turn: ${currentPlayer.marker}`;
    }

    // once the game is over, disable all cells
    const disableCells = () => {
        // select every cell element
        document.querySelectorAll(".cell").forEach(cell => {
            // add the disabled class, css will handle it from here
            cell.classList.add("disabled-cell");
        });
    };

    // if a new game starts, reactivate the cells
    const activateCells = () => {
        document.querySelectorAll(".cell").forEach(cell => {
            cell.classList.remove("disabled-cell");
        });
    };


    return {
        turn_render,
        full_render,
        updateTurnIndicator,
        disableCells,
        activateCells,
    }
})();