import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useChess } from '../context/ChessContext'

interface EvaluationBarProps {
  className?: string
}

const EvaluationBar: React.FC<EvaluationBarProps> = ({ className = '' }) => {
  const { state } = useChess()
  const [evaluation, setEvaluation] = useState<number>(0)
  const [mateMoves, setMateMoves] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const stockfishRef = useRef<Worker | null>(null)
  const evaluationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const readyRef = useRef(false)

  // Create Stockfish worker
  const createStockfishWorker = () => {
    if (!window.stockfishScript) {
      console.warn('Stockfish script not loaded')
      return null
    }
    return new Worker(URL.createObjectURL(new Blob([window.stockfishScript], { type: 'application/javascript' })))
  }

  // Calculate evaluation using Stockfish
  useEffect(() => {
    if (!state.game) return

    setIsCalculating(true)
    setMateMoves(null)
    
    // Clear previous timeout
    if (evaluationTimeoutRef.current) {
      clearTimeout(evaluationTimeoutRef.current)
    }

    // Debounce evaluation requests
    evaluationTimeoutRef.current = setTimeout(() => {
      if (!window.stockfishScript) {
        // Fallback to simple evaluation if Stockfish not available
        calculateSimpleEvaluation()
        return
      }

      // Create new Stockfish worker
      if (stockfishRef.current) {
        stockfishRef.current.terminate()
      }
      
      stockfishRef.current = createStockfishWorker()
      if (!stockfishRef.current) {
        calculateSimpleEvaluation()
        return
      }
      readyRef.current = false

      stockfishRef.current.onmessage = (event: any) => {
        const message = event.data
        console.log('Stockfish message:', message)

        if (message === 'readyok') {
          readyRef.current = true
          stockfishRef.current?.postMessage('ucinewgame')
          stockfishRef.current?.postMessage('position fen ' + state.game.fen())
          stockfishRef.current?.postMessage('go depth 12')
        }
        // Parse evaluation
        if (message.includes('score cp')) {
          const match = message.match(/score cp (-?\d+)/)
          if (match) {
            let centipawns = parseInt(match[1])
            // Invert sign if it's Black's turn
            if (state.game.turn() === 'b') centipawns = -centipawns
            setEvaluation(centipawns)
            setMateMoves(null)
            setIsCalculating(false)
          }
        } else if (message.includes('score mate')) {
          const match = message.match(/score mate (-?\d+)/)
          if (match) {
            let mate = parseInt(match[1])
            // Invert sign if it's Black's turn
            if (state.game.turn() === 'b') mate = -mate
            setMateMoves(mate)
            setIsCalculating(false)
          }
        }
      }

      stockfishRef.current.onerror = (error) => {
        console.error('Stockfish error:', error)
        calculateSimpleEvaluation()
      }

      // Initialize Stockfish
      stockfishRef.current.postMessage('uci')
      stockfishRef.current.postMessage('isready')
    }, 300) // 300ms debounce

    return () => {
      if (evaluationTimeoutRef.current) {
        clearTimeout(evaluationTimeoutRef.current)
      }
      if (stockfishRef.current) {
        stockfishRef.current.terminate()
      }
    }
  }, [state.game.fen()])

  // Fallback simple evaluation
  const calculateSimpleEvaluation = () => {
    const fen = state.game.fen()
    const pieces = fen.split(' ')[0]
    
    let whiteScore = 0
    let blackScore = 0
    
    // Material values (in centipawns)
    const pieceValues: { [key: string]: number } = {
      'P': 100,   // Pawn
      'N': 320,   // Knight
      'B': 330,   // Bishop
      'R': 500,   // Rook
      'Q': 900,   // Queen
      'K': 0,     // King (not counted in material evaluation)
    }
    
    // Parse FEN and calculate material
    for (let i = 0; i < pieces.length; i++) {
      const char = pieces[i]
      if (char === '/') continue
      
      if (char >= '1' && char <= '8') {
        i += parseInt(char) - 1
        continue
      }
      
      const isWhite = char === char.toUpperCase()
      const pieceType = char.toUpperCase()
      
      if (pieceValues[pieceType] !== undefined) {
        if (isWhite) {
          whiteScore += pieceValues[pieceType]
        } else {
          blackScore += pieceValues[pieceType]
        }
      }
    }
    
    const materialAdvantage = whiteScore - blackScore
    setEvaluation(materialAdvantage)
    setMateMoves(null)
    setIsCalculating(false)
  }

  // Convert evaluation to percentage for bar display
  const getEvaluationPercentage = () => {
    // If mate, show full bar for the winning side
    if (mateMoves !== null) {
      if (mateMoves > 0) return 100
      if (mateMoves < 0) return 0
      return 50
    }
    // Convert centipawns to percentage (0-100)
    // 0 = equal, 50 = white winning, 100 = white winning by a lot
    // Handle mate scores and extreme evaluations
    const maxEvaluation = Math.abs(evaluation) > 5000 ? 5000 : 2000
    const normalized = (evaluation + maxEvaluation) / (2 * maxEvaluation)
    return Math.max(0, Math.min(100, normalized * 100))
  }

  // Format evaluation for display
  const formatEvaluation = () => {
    if (isCalculating) return '...'
    if (mateMoves !== null) {
      return mateMoves > 0 ? `M${mateMoves}` : `M${mateMoves}`
    }
    if (Math.abs(evaluation) < 50) {
      return '0.0'
    }
    const pawns = evaluation / 100
    return pawns > 0 ? `+${pawns.toFixed(1)}` : `${pawns.toFixed(1)}`
  }

  // Get evaluation color
  const getEvaluationColor = () => {
    if (isCalculating) return 'text-gray-400'
    if (mateMoves !== null) return 'text-yellow-400' // Mate scores
    if (Math.abs(evaluation) < 50) return 'text-gray-400'
    return evaluation > 0 ? 'text-green-400' : 'text-red-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center space-y-2 ${className}`}
    >
      {/* Evaluation Bar */}
      <div className="relative w-10 h-40 bg-gray-800 rounded-lg overflow-hidden border border-gray-600 shadow-lg">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-700 via-gray-800 to-gray-700" />
        
        {/* Evaluation bar with better gradient */}
        <motion.div
          className="absolute left-0 right-0 bg-gradient-to-b from-green-500 via-blue-500 to-red-500"
          style={{
            top: `${100 - getEvaluationPercentage()}%`,
            height: `${getEvaluationPercentage()}%`,
          }}
          animate={{
            top: `${100 - getEvaluationPercentage()}%`,
            height: `${getEvaluationPercentage()}%`,
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
        
        {/* Center line */}
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-400 transform -translate-y-px" />
        
        {/* Evaluation markers */}
        <div className="absolute left-1/2 top-1/4 w-1.5 h-1.5 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-70 shadow-sm" />
        <div className="absolute left-1/2 top-3/4 w-1.5 h-1.5 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-70 shadow-sm" />
        
        {/* Additional markers for better readability */}
        <div className="absolute left-1/2 top-1/8 w-1 h-1 bg-gray-300 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-50" />
        <div className="absolute left-1/2 top-7/8 w-1 h-1 bg-gray-300 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-50" />
      </div>

      {/* Evaluation Text */}
      <div className="text-center space-y-1">
        <div className={`text-lg font-mono font-bold ${getEvaluationColor()}`}>
          {formatEvaluation()}
        </div>
        <div className="text-xs text-gray-400">
          {mateMoves !== null
            ? mateMoves > 0
              ? 'White mates' : 'Black mates'
            : evaluation > 0
              ? 'White advantage' : evaluation < 0
                ? 'Black advantage' : 'Equal position'}
        </div>
        <div className="text-xs text-gray-500">
          {mateMoves !== null ? 'Mate' : Math.abs(evaluation) > 500 ? 'Decisive' : Math.abs(evaluation) > 200 ? 'Advantage' : 'Equal'}
        </div>
      </div>

      {/* Position strength indicator */}
      <div className="flex items-center space-x-1">
        <div className={`w-2 h-2 rounded-full ${mateMoves !== null ? (mateMoves > 0 ? 'bg-green-400' : 'bg-red-400') : evaluation > 0 ? 'bg-green-400' : evaluation < 0 ? 'bg-red-400' : 'bg-gray-400'}`} />
        <span className="text-xs text-gray-400">
          {mateMoves !== null ? 'Mate' : Math.abs(evaluation) > 1000 ? 'Strong' : Math.abs(evaluation) > 300 ? 'Moderate' : 'Slight'}
        </span>
      </div>
    </motion.div>
  )
}

export default EvaluationBar 