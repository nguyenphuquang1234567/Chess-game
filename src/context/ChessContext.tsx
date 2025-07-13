import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { Chess } from 'chess.js'

export interface ChessState {
  game: Chess
  selectedSquare: string | null
  validMoves: string[]
  moveHistory: string[]
  capturedPieces: { white: string[], black: string[] }
  gameStatus: 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw'
  turn: 'w' | 'b'
  isFlipped: boolean
  lastMoveSquares?: { from: string, to: string } | null
}

type ChessAction =
  | { type: 'SELECT_SQUARE'; payload: string | null }
  | { type: 'MAKE_MOVE'; payload: { san: string } }
  | { type: 'RESET_GAME' }
  | { type: 'FLIP_BOARD' }
  | { type: 'UPDATE_GAME_STATE' }
  | { type: 'UNDO_MOVE' }

const initialState: ChessState = {
  game: new Chess(),
  selectedSquare: null,
  validMoves: [],
  moveHistory: [],
  capturedPieces: { white: [], black: [] },
  gameStatus: 'playing',
  turn: 'w',
  isFlipped: false,
}

function chessReducer(state: ChessState, action: ChessAction): ChessState {
  switch (action.type) {
    case 'SELECT_SQUARE':
      const validMoves = action.payload 
        ? state.game.moves({ square: action.payload, verbose: true }).map(move => move.to)
        : []
      
      return {
        ...state,
        selectedSquare: action.payload,
        validMoves,
      }

    case 'MAKE_MOVE': {
      const { san } = action.payload;
      // Rebuild the game from move history and apply the new move
      const newGame = new Chess();
      for (const move of state.moveHistory) {
        newGame.move(move);
      }
      let moveResult = null;
      try {
        moveResult = newGame.move(san);
      } catch (err) {
        // Invalid move, ignore and do not update state
        console.warn('Invalid move attempted (caught):', san, err);
        return state;
      }
      if (!moveResult) {
        // Invalid move, ignore and do not update state
        console.warn('Invalid move attempted:', san);
        return state;
      }
      let lastMoveSquares = null;
      if (moveResult && moveResult.from && moveResult.to) {
        lastMoveSquares = { from: moveResult.from, to: moveResult.to };
      }
      const moveHistory = [...state.moveHistory, san];
      const capturedPieces = getCapturedPieces(newGame);
      const gameStatus = getGameStatus(newGame);
      return {
        ...state,
        game: newGame,
        selectedSquare: null,
        validMoves: [],
        moveHistory,
        capturedPieces,
        gameStatus,
        turn: newGame.turn(),
        lastMoveSquares,
      };
    }

    case 'RESET_GAME':
      const resetGame = new Chess()
      return {
        ...initialState,
        game: resetGame,
        isFlipped: state.isFlipped,
        lastMoveSquares: null,
      }

    case 'FLIP_BOARD':
      return {
        ...state,
        isFlipped: !state.isFlipped,
      }

    case 'UPDATE_GAME_STATE':
      return {
        ...state,
        gameStatus: getGameStatus(state.game),
        turn: state.game.turn(),
      }

    case 'UNDO_MOVE': {
      if (state.moveHistory.length === 0) return state;
      // Rebuild the game from scratch, omitting the last move
      const newGame = new Chess();
      const newHistory = state.moveHistory.slice(0, -1);
      for (const move of newHistory) {
        newGame.move(move);
      }
      // Get last move squares if any
      let lastMoveSquares = null;
      if (newHistory.length > 0) {
        const tempGame = new Chess();
        for (const move of newHistory) tempGame.move(move);
        const historyVerbose = tempGame.history({ verbose: true });
        const last = historyVerbose[historyVerbose.length - 1];
        if (last && last.from && last.to) {
          lastMoveSquares = { from: last.from, to: last.to };
        }
      }
      const capturedPieces = getCapturedPieces(newGame);
      const gameStatus = getGameStatus(newGame);
      return {
        ...state,
        game: newGame,
        selectedSquare: null,
        validMoves: [],
        moveHistory: newHistory,
        capturedPieces,
        gameStatus,
        turn: newGame.turn(),
        lastMoveSquares,
      };
    }

    default:
      return state
  }
}

function getCapturedPieces(game: Chess): { white: string[], black: string[] } {
  const history = game.history({ verbose: true })
  const captured: { white: string[], black: string[] } = { white: [], black: [] }
  
  history.forEach(move => {
    if (move.captured) {
      const piece = move.captured.toUpperCase()
      if (move.color === 'w') {
        captured.white.push(piece)
      } else {
        captured.black.push(piece)
      }
    }
  })
  
  return captured
}

function getGameStatus(game: Chess): 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw' {
  if (game.isCheckmate()) return 'checkmate'
  if (game.isDraw()) return 'draw'
  if (game.isStalemate()) return 'stalemate'
  if (game.isCheck()) return 'check'
  return 'playing'
}

interface ChessContextType {
  state: ChessState
  dispatch: React.Dispatch<ChessAction>
}

const ChessContext = createContext<ChessContextType | undefined>(undefined)

export function ChessProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chessReducer, initialState)

  return (
    <ChessContext.Provider value={{ state, dispatch }}>
      {children}
    </ChessContext.Provider>
  )
}

export function useChess() {
  const context = useContext(ChessContext)
  if (context === undefined) {
    throw new Error('useChess must be used within a ChessProvider')
  }
  return context
} 