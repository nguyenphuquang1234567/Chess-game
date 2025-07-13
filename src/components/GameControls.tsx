import React from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, RotateCw, RefreshCw, Undo2 } from 'lucide-react'
import { useChess } from '../context/ChessContext'

interface GameControlsProps {
  onNewGame?: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ onNewGame }) => {
  const { state, dispatch } = useChess()
  const { gameStatus, turn, isFlipped } = state

  const getStatusMessage = () => {
    switch (gameStatus) {
      case 'checkmate':
        return `${turn === 'w' ? 'Black' : 'White'} wins by checkmate!`
      case 'stalemate':
        return 'Draw by stalemate!'
      case 'draw':
        return 'Draw!'
      case 'check':
        return `${turn === 'w' ? 'White' : 'Black'} is in check!`
      default:
        return `${turn === 'w' ? 'White' : 'Black'}'s turn`
    }
  }

  const getStatusColor = () => {
    switch (gameStatus) {
      case 'checkmate':
        return 'text-red-500'
      case 'stalemate':
      case 'draw':
        return 'text-yellow-500'
      case 'check':
        return 'text-orange-500'
      default:
        return 'text-green-500'
    }
  }

  const getStatusClass = () => {
    switch (gameStatus) {
      case 'checkmate':
        return 'status-pulse-mate'
      case 'check':
        return 'status-pulse-check'
      default:
        return ''
    }
  }

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Game Status */}
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-semibold text-white mb-2">Game Status</h3>
          <p className={`text-lg font-medium ${getStatusColor()} ${getStatusClass()}`}>
            {getStatusMessage()}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          <motion.button
            onClick={() => dispatch({ type: 'UNDO_MOVE' })}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 active:from-yellow-500 active:to-yellow-600 text-gray-900 rounded-full font-semibold text-base shadow-lg shadow-yellow-200/30 backdrop-blur-md border border-yellow-200/30 transition-all duration-200 min-w-[90px] justify-center focus:outline-none focus:ring-2 focus:ring-yellow-300 hover:shadow-xl hover:shadow-yellow-200/40"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <Undo2 size={18} />
            Undo
          </motion.button>
          <motion.button
            onClick={onNewGame ? onNewGame : () => dispatch({ type: 'RESET_GAME' })}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 active:from-red-600 active:to-red-700 text-white rounded-full font-semibold text-base shadow-lg shadow-red-200/30 backdrop-blur-md border border-red-200/30 transition-all duration-200 min-w-[90px] justify-center focus:outline-none focus:ring-2 focus:ring-red-300 hover:shadow-xl hover:shadow-red-200/40"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <RefreshCw size={18} />
            Reset
          </motion.button>
          <motion.button
            onClick={() => dispatch({ type: 'FLIP_BOARD' })}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 active:from-blue-600 active:to-blue-700 text-white rounded-full font-semibold text-base shadow-lg shadow-blue-200/30 backdrop-blur-md border border-blue-200/30 transition-all duration-200 min-w-[90px] justify-center focus:outline-none focus:ring-2 focus:ring-blue-300 hover:shadow-xl hover:shadow-blue-200/40"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            {isFlipped ? <RotateCw size={18} /> : <RotateCcw size={18} />}
            Flip Board
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default GameControls 