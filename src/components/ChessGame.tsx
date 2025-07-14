import React, { useState } from 'react'
import { motion } from 'framer-motion'
import ChessBoard from './ChessBoard'
import GameControls from './GameControls'
import MoveHistory from './MoveHistory'
import CapturedPiecesContainer from './CapturedPieces'
import ChatBot from './ChatBot'
import EvaluationBar from './EvaluationBar'
import { useChess } from '../context/ChessContext'

const ChessGame: React.FC = () => {
  const [vsComputer, setVsComputer] = useState(false)
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w')
  const [skillLevel, setSkillLevel] = useState(10) // Default to medium difficulty
  const [gameStarted, setGameStarted] = useState(false)
  const [triggerStockfishFirstMove, setTriggerStockfishFirstMove] = useState(false);
  const { dispatch } = useChess();

  const handleStartGame = () => {
    dispatch({ type: 'RESET_GAME' });
    if (vsComputer && playerColor === 'b') {
      setTriggerStockfishFirstMove(true);
    }
    setGameStarted(true)
  }

  const handleResetGame = () => {
    setGameStarted(false)
    setVsComputer(false)
    setPlayerColor('w')
    setSkillLevel(10)
    setTriggerStockfishFirstMove(false);
  }

  return (
    <div className="max-w-7xl mx-auto">
      {!gameStarted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-8 gap-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4 main-title">Chess Game Setup</h2>
            <p className="text-gray-300 mb-6 text-lg">Choose your game mode and settings</p>
          </div>

          {/* Game Mode Selection */}
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Game Mode</h3>
            <div className="flex gap-4 mb-6">
              <button
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 border-2 ${
                  !vsComputer 
                    ? 'btn-primary text-white border-blue-400' 
                    : 'bg-gray-700/60 text-gray-300 border-gray-600 hover:bg-blue-400/80 hover:text-white hover:border-blue-400'
                }`}
                onClick={() => setVsComputer(false)}
              >
                Player vs Player
              </button>
              <button
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 border-2 ${
                  vsComputer 
                    ? 'btn-primary text-white border-blue-400' 
                    : 'bg-gray-700/60 text-gray-300 border-gray-600 hover:bg-blue-400/80 hover:text-white hover:border-blue-400'
                }`}
                onClick={() => setVsComputer(true)}
              >
                Player vs Computer
              </button>
            </div>

            {/* Computer Settings */}
            {vsComputer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-white font-medium mb-3">Play as:</h4>
                  <div className="flex gap-3">
                    <button
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 border-2 ${
                        playerColor === 'w' 
                          ? 'bg-white text-black border-white' 
                          : 'bg-gray-700 text-white border-gray-600 hover:bg-white hover:text-black hover:border-white'
                      }`}
                      onClick={() => setPlayerColor('w')}
                    >
                      White
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 border-2 ${
                        playerColor === 'b' 
                          ? 'bg-black text-white border-black' 
                          : 'bg-gray-700 text-white border-gray-600 hover:bg-black hover:text-white hover:border-black'
                      }`}
                      onClick={() => setPlayerColor('b')}
                    >
                      Black
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-3">Computer Difficulty:</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Skill Level: {skillLevel}</span>
                      <span className="text-gray-400 text-xs">
                        {skillLevel <= 5 ? 'Easy' : skillLevel <= 10 ? 'Medium' : skillLevel <= 15 ? 'Hard' : 'Expert'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(skillLevel / 20) * 100}%, #374151 ${(skillLevel / 20) * 100}%, #374151 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>0 (Easiest)</span>
                      <span>20 (Hardest)</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Start Game Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <button
                onClick={handleStartGame}
                className="w-full px-8 py-4 btn-success text-white font-bold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Start Game
              </button>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Game Controls */}
          <div className="flex flex-col items-center mb-4 gap-2">
            <div className="flex items-center gap-4">
              <span className="text-white font-medium">
                {vsComputer ? `Playing vs Computer (Level ${skillLevel})` : 'Player vs Player'}
              </span>
              {vsComputer && (
                <span className="text-gray-300">
                  Playing as: {playerColor === 'w' ? 'White' : 'Black'}
                </span>
              )}
            </div>
            <button
              onClick={handleResetGame}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 btn-primary"
            >
              New Game
            </button>
          </div>

          {/* ChatBot - Top Left Corner */}
          <motion.div
            initial={{ opacity: 0, x: -20, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="absolute top-4 left-4 z-50"
          >
            <ChatBot 
              vsComputer={vsComputer}
              playerColor={playerColor}
              skillLevel={skillLevel}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row gap-8 items-start justify-center"
          >
            {/* Chess Board with Evaluation Bar */}
            <div className="flex items-start gap-4">
              {/* Main Chess Board */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <ChessBoard 
                  vsComputer={vsComputer} 
                  playerColor={playerColor} 
                  skillLevel={skillLevel}
                  triggerStockfishFirstMove={triggerStockfishFirstMove}
                  setTriggerStockfishFirstMove={setTriggerStockfishFirstMove}
                />
              </motion.div>

              {/* Evaluation Bar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="hidden lg:block"
              >
                <EvaluationBar />
              </motion.div>
            </div>

            {/* Mobile Evaluation Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:hidden flex justify-center"
            >
              <EvaluationBar />
            </motion.div>

            {/* Side Panel */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <GameControls />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <CapturedPiecesContainer />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <MoveHistory />
              </motion.div>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 glass-panel rounded-lg p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-white mb-4">How to Play</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <h4 className="font-medium text-white mb-2">Basic Controls</h4>
                <ul className="space-y-1">
                  <li>• Click on a piece to select it</li>
                  <li>• Click on a highlighted square to move</li>
                  <li>• Green squares show valid moves</li>
                  <li>• Red squares show capture moves</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Game Features</h4>
                <ul className="space-y-1">
                  <li>• Automatic move validation</li>
                  <li>• Move history tracking</li>
                  <li>• Captured pieces display</li>
                  <li>• Board flip option</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}

export default ChessGame 