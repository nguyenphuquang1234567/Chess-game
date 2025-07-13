import React from 'react'
import { motion } from 'framer-motion'
import ChessPiece from './ChessPiece'
import { useChess } from '../context/ChessContext'

interface CapturedPiecesProps {
  pieces: string[]
  title: string
  color: 'white' | 'black'
}

const CapturedPieces: React.FC<CapturedPiecesProps> = ({ pieces, title, color }) => {
  const pieceCounts: { [key: string]: number } = {}
  
  pieces.forEach(piece => {
    pieceCounts[piece] = (pieceCounts[piece] || 0) + 1
  })

  return (
    <div className="glass-panel rounded-2xl p-4 shadow-lg">
      <h4 className="text-sm font-semibold text-white mb-3">{title}</h4>
      
      {pieces.length === 0 ? (
        <motion.p 
          className="text-gray-400 text-xs text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          No pieces captured
        </motion.p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {Object.entries(pieceCounts).map(([piece, count], index) => (
            <motion.div 
              key={piece} 
              className="flex items-center gap-1 p-1 rounded-lg hover:bg-white/5 transition-colors duration-200"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.1 }}
            >
              <ChessPiece type={piece.toLowerCase()} color={color === 'white' ? 'b' : 'w'} className="w-6 h-6" />
              {count > 1 && (
                <motion.span 
                  className="text-xs text-gray-300 font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {count}
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

const CapturedPiecesContainer: React.FC = () => {
  const { state } = useChess()
  const { capturedPieces } = state

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Captured Pieces</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <CapturedPieces
          pieces={capturedPieces.white}
          title="White Captured"
          color="white"
        />
        <CapturedPieces
          pieces={capturedPieces.black}
          title="Black Captured"
          color="black"
        />
      </div>
    </div>
  )
}

export default CapturedPiecesContainer 