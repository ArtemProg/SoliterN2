// Function to move a card from one tableau column to another
function moveCard(sourceColumn, destinationColumn) {
    // Check if the move is valid
    const cardToMove = sourceColumn[sourceColumn.length - 1];
    const topCardDestination = destinationColumn[destinationColumn.length - 1];
  
    if (!cardToMove) {
      console.log('Source column is empty!');
      return false;
    }
  
    if (!topCardDestination) {
      // If the destination column is empty, move any King there
      if (cardToMove.rank === 'K') {
        destinationColumn.push(sourceColumn.pop());
        return true;
      } else {
        console.log('You can only move a King to an empty column!');
        return false;
      }
    }
  
    // If the destination column is not empty, check if the move is valid
    const rankDifference = Math.abs(getRankValue(cardToMove.rank) - getRankValue(topCardDestination.rank));
    const isSameSuit = cardToMove.suit === topCardDestination.suit;
  
    if (rankDifference === 1 && !isSameSuit) {
      destinationColumn.push(sourceColumn.pop());
      return true;
    } else {
      console.log('Invalid move!');
      return false;
    }
  }
  
  // Function to move a card from the tableau to the foundation
  function moveCardToFoundation(tableauColumn, foundation) {
    const cardToMove = tableauColumn[tableauColumn.length - 1];
    
    if (!cardToMove) {
      console.log('Tableau column is empty!');
      return false;
    }
  
    if (foundation.length === 0) {
      // If the foundation is empty, only an Ace can be moved there
      if (cardToMove.rank === 'A') {
        foundation.push(tableauColumn.pop());
        return true;
      } else {
        console.log('You can only move an Ace to an empty foundation!');
        return false;
      }
    }
  
    // If the foundation is not empty, check if the move is valid
    const topCardFoundation = foundation[foundation.length - 1];
    if (cardToMove.suit === topCardFoundation.suit && getRankValue(cardToMove.rank) === getRankValue(topCardFoundation.rank) + 1) {
      foundation.push(tableauColumn.pop());
      return true;
    } else {
      console.log('Invalid move to foundation!');
      return false;
    }
  }
  
  // Function to get the numerical value of a card rank
  function getRankValue(rank) {
    if (rank === 'A') return 1;
    if (rank === 'J') return 11;
    if (rank === 'Q') return 12;
    if (rank === 'K') return 13;
    return parseInt(rank);
  }
  
  // Function to generate combinations of moves
  function generateMoves(tableau, foundation, stock) {
    const moves = [];
  
    // Move card from tableau to foundation
    for (let i = 0; i < tableau.length; i++) {
      for (let j = 0; j < foundation.length; j++) {
        if (moveCardToFoundation(tableau[i], foundation)) {
          moves.push({ type: 'tableauToFoundation', sourceColumn: i });
          moves.push({ type: 'foundationToTableau', destinationColumn: i });
        }
      }
    }
  
    // Move card from tableau to tableau
    for (let i = 0; i < tableau.length; i++) {
      for (let j = 0; j < tableau.length; j++) {
        if (i !== j && moveCard(tableau[i], tableau[j])) {
          moves.push({ type: 'tableauToTableau', sourceColumn: i, destinationColumn: j });
          moves.push({ type: 'tableauToTableau', sourceColumn: j, destinationColumn: i });
        }
      }
    }
  
    // Move card from stock to tableau
    if (stock.length > 0) {
      for (let i = 0; i < tableau.length; i++) {
        if (moveCard(stock, tableau[i])) {
          moves.push({ type: 'stockToTableau', destinationColumn: i });
        }
      }
    }
  
    return moves;
  }
  
  // Function to check if the game is won
  function isGameWon(tableau, foundation) {
    // Check if all tableau columns are empty
    const isEmptyTableau = tableau.every(column => column.length === 0);
    
    // Check if all foundation piles contain all cards of the same suit and in ascending order
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    return isEmptyTableau && suits.every(suit => {
      const pile = foundation.find(p => p[0] && p[0].suit === suit);
      if (!pile) return false;
      const ranks = pile.map(card => card.rank);
      return ranks.join('') === 'A2345678910JQK'; // All ranks from Ace to King
    });
  }
  
  
  

  // Function to solve the Solitaire game iteratively
function solveSolitaire(tableau, foundation, stock) {
    const stack = [{ tableau, foundation, stock, steps: [] }];
  
    while (stack.length > 0) {
      const { tableau, foundation, stock, steps } = stack.pop();
  
      // Check if the game is already won
      if (isGameWon(tableau, foundation)) {
        return steps;
      }
  
      // Generate possible moves
      const moves = generateMoves(tableau, foundation, stock);
  
      // Try each move
      for (const move of moves) {
        const { type, sourceColumn, destinationColumn } = move;
        const newTableau = tableau.map(column => [...column]); // Deep copy tableau
        const newFoundation = foundation.map(pile => [...pile]); // Deep copy foundation
        const newStock = [...stock];
        const newSteps = [...steps, move];
  
        // Execute the move
        if (type === 'tableauToFoundation') {
          moveCardToFoundation(newTableau[sourceColumn], newFoundation);
        } else if (type === 'foundationToTableau') {
          moveCardFromFoundation(newFoundation, newTableau[destinationColumn]);
        } else if (type === 'tableauToTableau') {
          moveCard(newTableau[sourceColumn], newTableau[destinationColumn]);
        } else if (type === 'stockToTableau') {
          moveCard(newStock, newTableau[destinationColumn]);
        }
  
        // Push new state to the stack
        stack.push({ tableau: newTableau, foundation: newFoundation, stock: newStock, steps: newSteps });
      }
    }
  
    // If no moves lead to a solution, return null
    return null;
  }
  




  ////////////////////////////////////////////////////



// Function to create a deck of cards
function createDeck() {
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
  
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank });
      }
    }
  
    return deck;
  }
  
  // Function to shuffle the deck
  function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }
  
  // Function to deal cards to the tableau
  function dealCards(deck) {
    const tableau = [[], [], [], [], [], [], []];
  
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const card = deck.pop();
        tableau[i].push(card);
      }
      tableau[i][i].facedown = false; // reveal the last card in each column
    }
  
    return tableau;
  }
  
  // Function to initialize the game
  function initializeGame() {
    const deck = createDeck();
    shuffleDeck(deck);
    const tableau = dealCards(deck);
    const stock = deck;
  
    return { tableau, stock };
  }
  
  //////////////////////////////////////////////////




  // Function to play Solitaire from start to finish
  function playSolitaire(tableau, foundation, stock) {
    const movesStack = [];
    let currentTableau = tableau;
    let currentFoundation = foundation;
    let currentStock = stock;
  
    while (!isGameWon(currentTableau, currentFoundation)) {
      // Generate possible moves
      const moves = generateMoves(currentTableau, currentFoundation, currentStock);
  
      if (moves.length === 0) {
        // If no moves are possible, deal a card from the stock
        if (currentStock.length === 0) {
          // If stock is empty, cannot proceed further
          console.log('No more moves possible. Game over.');
          return null;
        }
  
        const topCard = currentStock.pop();
        currentStock = currentStock.reverse(); // Flip the stock pile
        currentTableau = currentTableau.map(column => [...column, topCard]);
        movesStack.push({ type: 'stockToTableau' });
      } else {
        // Make a move
        const move = moves[0]; // For simplicity, select the first move
        const { type, sourceColumn, destinationColumn } = move;
  
        if (type === 'tableauToFoundation') {
          moveCardToFoundation(currentTableau[sourceColumn], currentFoundation);
        } else if (type === 'tableauToTableau') {
          moveCard(currentTableau[sourceColumn], currentTableau[destinationColumn]);
        } else if (type === 'stockToTableau') {
          // Deal a card from the stock
          const topCard = currentStock.pop();
          currentTableau[destinationColumn].push(topCard);
        }
  
        movesStack.push(move);
      }
    }
  
    return movesStack;
  }



  
  ///////////////////////////////////////////////////
  
  // Example usage
  const { tableau, stock } = initializeGame();
  console.log('Tableau:', tableau);
  console.log('Stock:', stock);
  

const startingFoundation = [];

const solution = playSolitaire(tableau, startingFoundation, stock);
if (solution) {
  console.log('Steps to solve:', solution);
} else {
  console.log('Cannot solve this combination.');
}
