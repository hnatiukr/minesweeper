# Minesweeper

Minesweeper is a computer game where players clear a grid of hidden mines without detonating any. They use numeric clues to deduce the locations of mines and clear all non-mine squares to win.

## Side notes

- bombs are seeded randomly across the grid. each tile has a chance of containing a bomb, with the exception of the 1st tile clicked by the player

- when a tile is clicked, if it doesn't contain a bomb, it reveals either a number indicating the count of adjacent bombs or recursively reveals neighboring tiles until reaching tiles adjacent to bombs. this process continues until all tiles adjacent to bombs are revealed

- players can flag tiles they suspect contain bombs to avoid accidental clicks or to mark potential bomb locations. flagging is typically done by right-clicking on the tile

- the game is won when all non-bomb tiles are revealed and correctly flagged. this means all safe tiles are uncovered, and all bombs are flagged

## Must have

- [x] ~~generate map~~
- [x] ~~create button cells~~
- [x] ~~set button context menu for toggle flag~~
- [x] ~~generate and seed bombs~~
- [x] ~~add game restart~~
- [x] ~~process cell revealing~~
- [x] ~~process game winnings~~
- [ ] stop the timer when you win, when you lose, reset the timer when you restart

## Nice to have

- [ ] refactor this mess of code
- [ ] add some tests
- [x] ~~stylize the map and cells~~
- [x] ~~show timer~~
- [ ] in case of winning, save the score to table based on spent time
- [ ] add difficulty levels
- - [ ] beginner 9x9, 10 bombs
- - [ ] intermediate 16x16, 40 bombs
- - [ ] expert 16x30, 99 bombs
- [ ] calculate score based on time spent and level of difficulty
