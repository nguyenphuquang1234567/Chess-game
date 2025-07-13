import React from 'react'
import { motion } from 'framer-motion'
import { useChess } from '../context/ChessContext'

const MoveHistory: React.FC = () => {
  const { state } = useChess()
  const { moveHistory } = state

  const formatMove = (move: string, index: number) => {
    const moveNumber = Math.floor(index / 2) + 1
    const isWhiteMove = index % 2 === 0
    
    if (isWhiteMove) {
      return (
        <motion.div 
          key={index} 
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors duration-200"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <span className="text-gray-400 text-sm w-8 font-mono">{moveNumber}.</span>
          <span className="text-white font-medium">{move}</span>
        </motion.div>
      )
    } else {
      return (
        <motion.span 
          key={index} 
          className="text-white ml-10 p-2 rounded-lg hover:bg-white/5 transition-colors duration-200 font-medium"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          {move}
        </motion.span>
      )
    }
  }

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Move History</h3>
      
      {moveHistory.length === 0 ? (
        <motion.p 
          className="text-gray-400 text-center py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          No moves yet
        </motion.p>
      ) : (
        <div className="max-h-64 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 gap-1">
            {moveHistory.map((move, index) => formatMove(move, index))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MoveHistory 