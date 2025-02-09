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
    // let's return the helper functions so the game can use them
    return { getCell, setCell, reset };
})();
    
// now the tictactoegame will just in charge of the game logic and players
const TicTacToeGame = (() => {
    // player X (no need to define Gameboard since it's an immediately invoked module)
    // we're gonna put this into an outer function later (we'll set playerX and O with an outer function
    // so we can have custom names)
    let playerX = Player('X');
    let playerO = Player('O');

    // a flag to see if the game is over, since we just started, it's not
    let gameOver = false;

    // store whose turn it is (starts at X)
    let currentPlayer = playerX;
    // store whose turn it's not :)
    let notCurrentPlayer = playerO;
    // store how many turns it has been
    let numberOfTurns = 0;


    // call this function when we can update the player names based on user input
    const setPlayers = (newPlayerX, newPlayerO) => {
        // if we set playerX to a new playerX, we gotta make sure that the 
        // currentPlayer takes note of that
        currentPlayer = (currentPlayer === playerX) ? newPlayerX : newPlayerO;
        // same with notCurrentPlayer
        notCurrentPlayer = (notCurrentPlayer === playerX) ? newPlayerX : newPlayerO;
        // now set playerX and playerO to the new players
        playerX = newPlayerX;
        playerO = newPlayerO;
    }

    // just makes the player switch look cleaner later on
    const switchPlayer = () => {
        currentPlayer = (currentPlayer === playerX) ? playerO : playerX;
        notCurrentPlayer = (notCurrentPlayer === playerX) ? playerO : playerX;
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
            console.log("Please provide a valid input (a number between 0-8)");
            return null;
        }

        // check if the game message still says "let the game begin"
        DisplayController.checkGameMessage();

        // if the spot is free
        if (Gameboard.getCell(index) === "") {
            // give it to the current player by adding their marker to the gameboard
            Gameboard.setCell(index, currentPlayer.marker);
            // RENDER: render the marker to the DOM board
            DisplayController.turn_render(index, currentPlayer.marker);
            // if this move was a game winner
            if (checkWin(currentPlayer, index)) {
                // notify the users who won
                DisplayController.displayMessage(`${currentPlayer.name} wins. ${notCurrentPlayer.name}, you suck.`);
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
                DisplayController.displayMessage("It's a tie. You both suck.");
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
            // return false since no one won yet
            return false;
        // here the spot is already taken
        } else {
            // notify the user
            DisplayController.displayMessage(`${currentPlayer.name}, are you blind or dumb? This spot is already taken. Try again.`);
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
        // set the notCurrentPlayer to O
        notCurrentPlayer = playerO;
        // display the current player's turn
        DisplayController.updateTurnIndicator(currentPlayer);
        // reset the number of turns
        numberOfTurns = 0;
        // reset the gameOver flag so users can play again
        gameOver = false;
        // activate the cells to play with
        DisplayController.activateCells();
        // let the user know that the game has begun
        DisplayController.displayMessage("Let the tictactoe game begin.");
    }

    return {
        makeMove,
        startGame,
        setPlayers,
    }

})();

const DisplayController = (() => {
    // grab the gameboard element
    const gameboardElement = document.querySelector("#gameboard");
    // grab the reset button element
    const resetButton = document.querySelector('#reset-button');
    // grab the game state message board
    const gameStateMessage = document.querySelector('#game-message');
    // grab the game's turn indicator
    const turnIndicator = document.querySelector('#whose-turn');
    // grab the game's player list
    const playerList = document.querySelector('#player-list');
    // grab the change name button
    const changeNameButton = document.querySelector('#change-name-button');

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
        turnIndicator.innerHTML = `<strong>Current Turn -</strong> ${currentPlayer.name}`;
    };

    // helper function to update the player-list element to show current players
    const updatePlayerList = (playerXName, playerOName) => {
        playerList.innerHTML = `<strong>Player X -</strong> ${playerXName}<br><strong>Player O -</strong> ${playerOName}`;
    };


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

    // we need to start a new game everytime the reset button is clicked
    resetButton.addEventListener('click', () => {
        TicTacToeGame.startGame();
    });

    // add text inside the message board at certain times of the game
    function displayMessage(text) {
        gameStateMessage.textContent = text;
    }

    // call this function after a move is made
    const checkGameMessage = () => {
        if (gameStateMessage.textContent !== "Bad move honestly") {
            gameStateMessage.textContent = "Bad move honestly";
        }
    };

    // everytime the user clicks the change name button
    changeNameButton.addEventListener('click', () => {
        OnGameRestart.restartGame();
    });

    return {
        turn_render,
        full_render,
        updateTurnIndicator,
        disableCells,
        activateCells,
        displayMessage,
        updatePlayerList,
        checkGameMessage,
    }
})();

const OnGameStart = (() => {
    // write up the setupPlayers function that will grab names and make player
    // objects out of them
    // grab the player form
    const form = document.querySelector('#player-setup-form');
    // grab player X's name
    const playerXInput = document.querySelector('#player-x-name');
    // grab player O's name
    const playerOInput = document.querySelector('#player-o-name');

    const setupPlayers = (event) => {
        // prevent the form from refreshing the page
        event.preventDefault();
        
        // get the values from the input fields (use default values if left empty)
        let playerXName = playerXInput.value.trim() || "Player X";
        let playerOName = playerOInput.value.trim() || "Player O";

        if (playerXName.length > 18) {
            playerXName = playerXName.substring(0, 18) + "...";
        }
        if (playerOName.length > 18) {
            playerOName = playerOName.substring(0, 18) + "...";
        }

        // create new player objects with the custom names
        const newPlayerX = Player('X', playerXName);
        const newPlayerO = Player('O', playerOName);

        // now make the game state update the players accordingly
        // update the players in the game
        TicTacToeGame.setPlayers(newPlayerX, newPlayerO);

        // we need to hide the player form since the user is done with it
        SetUpFeaturesHandler.hideSetUpFeatures();

        // now that the game has started, show the game features
        GameFeaturesHandler.showGameFeatures();
        
        // start the game
        TicTacToeGame.startGame();

        // we should put the player names on the player list DOM element
        DisplayController.updatePlayerList(playerXName, playerOName);

    }
    
    // then, set the form listen for the submit event and call the function
    form.addEventListener('submit', setupPlayers);

    // repo library is a GREAT source for styling input elements
})();

const GameFeaturesHandler = (() => {
    const gameboardElement = document.querySelector('#gameboard');
    const gameStateMessage = document.querySelector('#game-message');
    const playerSection = document.querySelector('#player-section');
    // holds BOTH the change name button AND reset button
    const gameSettings = document.querySelector('#game-settings');

    // we need a helper function to hide all game features while the user is
    // setting their game
    const hideGameFeatures = () => {
        // hide the gameboard
        gameboardElement.style.display = 'none';
        // hide the game settings
        gameSettings.style.display = 'none';
        // hide the game messages
        gameStateMessage.style.display = 'none';
        // hide the section that shows current player information
        playerSection.style.display = 'none';
    };

    // this function will run once the player has clicked start game
    const showGameFeatures = () => {
        // show the gameboard
        gameboardElement.style.display = 'grid';
        // show the game settings
        gameSettings.style.display = 'flex';
        // show the game messages
        gameStateMessage.style.display = 'flex';
        // show the section that shows current player information
        playerSection.style.display = 'block';
    };

    return {
        hideGameFeatures,
        showGameFeatures,
    }
})();

const SetUpFeaturesHandler = (() => {
    // the player set up form is the only feature needed for SetUpMode
    const playerSetUpForm = document.querySelector('#player-setup-form');

    // this function will run once the user clicks start game after completing
    // the player form
    const hideSetUpFeatures = () => {
        playerSetUpForm.style.display = 'none';
    }

    // this function will run once the website starts OR the user clicks the 
    // change players button
    const showSetUpFeatures = () => {
        playerSetUpForm.style.display = 'flex';
    }

    return {
        hideSetUpFeatures,
        showSetUpFeatures,
    }
})();

const OnStartUp = (() => {
    // start up is when the DOM content has loaded
    document.addEventListener('DOMContentLoaded', function() {
        // we need the game cells disabled until the game actually starts
        DisplayController.disableCells();
        // we need to hide the game features
        GameFeaturesHandler.hideGameFeatures();
        // we need to show the set up features
        SetUpFeaturesHandler.showSetUpFeatures();
    });
})();

const OnGameRestart = (() => {
    // this function will run when the player clicks the change name button
    const restartGame = () => {
        // we need to hide the game features once more
        GameFeaturesHandler.hideGameFeatures();
        // we need to show the player form again
        SetUpFeaturesHandler.showSetUpFeatures();
    }

    return {
        restartGame,
    }
})();
/* TASKS FOR FUTURE ME
The game should have two modes: SetUpMode and GameMode.
SetUpMode is what happens when the website starts up and when the user wants
to change players.
GameMode is when the game starts and before it ends.
Here is what should happen the website starts up
- The user should only see the tic tac toe title and the player forms
- so hide everything besides those two elements
Once the user submits the form
- hide the form
- show the gameboard, reset game button, change names button, game message, player information section
Switch the change names button to a person icon instead of text (make text show 
up on hover that says change name
style the player form using library as a reference
setUpPlayers is perfect for calling a function that shows everything once the
form is done. 
Also, in makeMove, if gameStateMessage still says 'let's begin', turn it into
something else or empty it.
Once you're done with everything, test it and possibly move on to 2 additional 
features: (OPTIONAL)
1. highlight the markers that score a 3 in a row. To do this, just add a 
displayController method inside each checkWin condition in checkWin's definition
2. Add a win counter for both players
*/