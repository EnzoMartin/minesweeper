# Minesweeper

Implementation of Minesweeper with React & MobX

## Rules

- Grid can be any size as long as it's a 1:1 square ratio and at least 10x10
- Should be 1 mine per 7.5 squares
- Can right click a square to place a flag which prevents accidental reveal clicks, has to be unflagged to reveal
- Game ends when all squares have been uncovered or flagged
- Game ends in WIN when user has no more clickable squares left, for every mine highlighted by a flag the user gets 10 points, for every square without a mine that is highlighted by a flag the user loses 15 points
    - If user has negative or 0 points, they get a LOSS instead
- User loses 40 points per mine clicked
    - If user clicks on more than 35% of the mines on the board, the game ends in a LOSS
- Mines are revealed when game ends
- Timer begins after user clicks first square, timer should show hh:mm:ss:ms
- Simple local highscore list based on grid size -> score, displays time next to score
- Can use any mine placing algorithm
- First click is *always* safe
- Uncovered squares should have a number displaying how many adjacent mines to it there are if more than 0
- Clicking a square that has no mines near it should uncover all adjacent squares, but should stop at each square that has a number
