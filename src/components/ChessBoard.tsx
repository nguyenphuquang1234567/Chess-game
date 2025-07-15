import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ChessPiece from './ChessPiece'
import { useChess } from '../context/ChessContext'
import { Chess as ChessJs, Square } from 'chess.js'

const promotionPieces = ['q', 'r', 'b', 'n']

interface ChessBoardProps {
  vsComputer?: boolean;
  playerColor?: 'w' | 'b';
  skillLevel?: number;
  triggerStockfishFirstMove?: boolean;
  setTriggerStockfishFirstMove?: (v: boolean) => void;
}

const moveSound = new Audio('/move.mp3')
const captureSound = new Audio('/capture.mp3')

declare global { interface Window { stockfishScript?: string } }

function createStockfishWorker() {
  if (!window.stockfishScript) throw new Error('Stockfish script not loaded');
  return new window.Worker(URL.createObjectURL(new Blob([window.stockfishScript!], { type: 'application/javascript' })));
}

// On app load, fetch Stockfish.js and store in window.stockfishScript
if (!window.stockfishScript) {
  fetch('/stockfish.js')
    .then(res => res.text())
    .then(text => { window.stockfishScript = text })
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  vsComputer = false,
  playerColor = 'w',
  skillLevel = 10,
  triggerStockfishFirstMove,
  setTriggerStockfishFirstMove
}) => {
  const { state, dispatch } = useChess()
  const { game, selectedSquare, validMoves, isFlipped, lastMoveSquares } = state

  const [promotion, setPromotion] = useState<null | { from: string; to: string }>(null)

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']

  const getSquareColor = (file: string, rank: string) => {
    const fileIndex = files.indexOf(file)
    const rankIndex = ranks.indexOf(rank)
    const isLight = (fileIndex + rankIndex) % 2 === 0
    return isLight ? 'chess-square-light' : 'chess-square-dark'
  }

  const getSquareHighlight = (square: string) => {
    if (selectedSquare === square) return 'chess-square-highlight'
    if (lastMoveSquares && (square === lastMoveSquares.from || square === lastMoveSquares.to)) return 'chess-square-lastmove'
    if (validMoves.includes(square)) {
      const piece = game.get(square as Square)
      return piece ? 'chess-square-capture' : 'chess-square-move'
    }
    return ''
  }

  const playMoveSound = (isCapture: boolean) => {
    if (isCapture) {
      captureSound.currentTime = 0; captureSound.play();
    } else {
      moveSound.currentTime = 0; moveSound.play();
    }
  }

  const handleSquareClick = (square: string) => {
    // Block moves if the game is over or drawn
    if (
      game.isGameOver() ||
      game.isDraw() ||
      game.isStalemate() ||
      game.isThreefoldRepetition() ||
      game.isInsufficientMaterial()
    ) {
      return;
    }
    // If playing vs computer, only allow user to move as their color
    if (vsComputer && game.turn() !== playerColor) return;
    const piece = game.get(square as Square)
    // If no piece is selected and clicked square has a piece of current player's color
    if (!selectedSquare && piece && piece.color === game.turn()) {
      dispatch({ type: 'SELECT_SQUARE', payload: square })
    }
    // If a piece is selected and clicked square is a valid move
    else if (selectedSquare && validMoves.includes(square)) {
      const movingPiece = game.get(selectedSquare as Square)
      // Check for pawn promotion
      if (
        movingPiece &&
        movingPiece.type === 'p' &&
        ((movingPiece.color === 'w' && square[1] === '8') || (movingPiece.color === 'b' && square[1] === '1'))
      ) {
        setPromotion({ from: selectedSquare, to: square })
        return
      }
      // Get SAN for the move
      const moveObj = { from: selectedSquare, to: square }
      const move = game.move(moveObj)
      if (move) {
        playMoveSound(!!move.captured)
        dispatch({
          type: 'MAKE_MOVE',
          payload: { san: move.san }
        })
      }
    }
    // If clicking on the same square, deselect it
    else if (selectedSquare === square) {
      dispatch({ type: 'SELECT_SQUARE', payload: null })
    }
    // If clicking on a different piece of the same color, select that piece instead
    else if (piece && piece.color === game.turn()) {
      dispatch({ type: 'SELECT_SQUARE', payload: square })
    }
  }

  const handlePromotion = (piece: string) => {
    if (promotion) {
      // Get SAN for the promotion move
      const moveObj = { from: promotion.from, to: promotion.to, promotion: piece }
      const move = game.move(moveObj)
      if (move) {
        playMoveSound(!!move.captured)
        dispatch({
          type: 'MAKE_MOVE',
          payload: { san: move.san }
        })
      }
      setPromotion(null)
    }
  }

  const getDisplayFiles = () => isFlipped ? [...files].reverse() : files
  const getDisplayRanks = () => isFlipped ? [...ranks].reverse() : ranks

  // Stockfish engine setup
  useEffect(() => {
    if (!vsComputer) return;
    // If user is black and it's the first move, trigger Stockfish as white
    if (
      playerColor === 'b' &&
      triggerStockfishFirstMove &&
      game.turn() === 'w' &&
      game.history().length === 0 &&
      game.fen() === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    ) {
      setTimeout(() => {
        if (!window.stockfishScript) {
          const interval = setInterval(() => {
            if (window.stockfishScript) {
              clearInterval(interval);
              triggerStockfish();
              setTriggerStockfishFirstMove && setTriggerStockfishFirstMove(false);
            }
          }, 50);
          return;
        }
        triggerStockfish();
        setTriggerStockfishFirstMove && setTriggerStockfishFirstMove(false);
      }, 700);
      return;
    }
    // If it's Stockfish's turn, trigger Stockfish (normal flow)
    const stockfishTurn = (playerColor === 'w' ? 'b' : 'w');
    if (game.turn() === stockfishTurn && !game.isGameOver()) {
      setTimeout(() => {
        if (!window.stockfishScript) {
          const interval = setInterval(() => {
            if (window.stockfishScript) {
              clearInterval(interval)
              triggerStockfish()
            }
          }, 50)
          return
        }
        triggerStockfish()
      }, 700)
    }
    function triggerStockfish() {
      const stockfish = createStockfishWorker();
      stockfish.onmessage = (event: any) => {
        const line = typeof event.data === 'string' ? event.data : event;
        if (line.startsWith('bestmove')) {
          const move = line.split(' ')[1];
          if (move && move.length >= 4) {
            const tempGame = new ChessJs(game.fen());
            const moveObj: any = { from: move.substring(0, 2), to: move.substring(2, 4) };
            if (move.length > 4) moveObj.promotion = move[4];
            const moveResult = tempGame.move(moveObj);
            if (moveResult) {
              dispatch({ type: 'MAKE_MOVE', payload: { san: moveResult.san } })
            }
          }
          stockfish.terminate();
        }
      };
      stockfish.postMessage('uci');
      stockfish.postMessage('ucinewgame');
      stockfish.postMessage('setoption name Skill Level value ' + skillLevel);
      stockfish.postMessage('position fen ' + game.fen());
      stockfish.postMessage('go depth 15');
    }
    // eslint-disable-next-line
  }, [game.fen(), vsComputer, playerColor, triggerStockfishFirstMove])

  // Play move/capture sound only when a new move is made
  const prevMoveHistoryRef = React.useRef<string[]>([]);
  useEffect(() => {
    if (state.moveHistory.length > prevMoveHistoryRef.current.length) {
      // A new move was made
      const lastMove = state.moveHistory[state.moveHistory.length - 1];
      // Check if it was a capture by looking at the SAN (contains 'x')
      if (lastMove && lastMove.includes('x')) {
        captureSound.currentTime = 0; captureSound.play();
      } else {
        moveSound.currentTime = 0; moveSound.play();
      }
    }
    prevMoveHistoryRef.current = state.moveHistory;
  }, [state.moveHistory]);

  return (
    <div className="relative">
      {/* Promotion Modal */}
      {promotion && (
        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="modal-content p-6 rounded-lg flex flex-col items-center gap-4 shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22, duration: 0.3 }}
          >
            <h3 className="text-white text-lg font-semibold mb-2">Choose promotion</h3>
            <div className="flex gap-4">
              {promotionPieces.map((p) => (
                <button
                  key={p}
                  onClick={() => handlePromotion(p)}
                  className="focus:outline-none hover:scale-110 transition-transform duration-200"
                >
                  <ChessPiece type={p} color={game.turn()} className="w-12 h-12" />
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
      {/* Board coordinates */}
      <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400">
        {getDisplayRanks().map((rank) => (
          <div key={rank} className="h-12 sm:h-16 flex items-center">
            {rank}
          </div>
        ))}
      </div>
      
      <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-400">
        {getDisplayFiles().map((file) => (
          <div key={file} className="w-12 sm:w-16 text-center">
            {file}
          </div>
        ))}
      </div>

      {/* Chess Board */}
      <div className="border-2 border-gray-600 rounded-2xl overflow-hidden board-glow bg-black/10 backdrop-blur-sm transition-all duration-300">
        <div className="grid grid-cols-8">
          {getDisplayRanks().map((rank) =>
            getDisplayFiles().map((file) => {
              const square = `${file}${rank}`
              const piece = game.get(square as Square)
              const squareColor = getSquareColor(file, rank)
              const highlight = getSquareHighlight(square)
              
              return (
                <motion.div
                  key={square}
                  className={`chess-square ${squareColor} ${highlight}`}
                  onClick={() => handleSquareClick(square)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                >
                  {piece && (
                    <motion.div
                      layout
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30, duration: 0.25 }}
                    >
                      <ChessPiece type={piece.type} color={piece.color} />
                    </motion.div>
                  )}
                  
                  {/* Move indicator dots */}
                  {validMoves.includes(square) && !piece && (
                    <motion.div
                      className="absolute w-3 h-3 sm:w-4 sm:h-4 bg-chess-move rounded-full opacity-70"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default ChessBoard 