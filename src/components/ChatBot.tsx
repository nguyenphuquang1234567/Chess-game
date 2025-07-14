import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChess } from '../context/ChessContext'

interface ChatMessage {
  id: string
  text: string
  type: 'player' | 'computer' | 'system'
  timestamp: Date
}

interface ChatBotProps {
  vsComputer: boolean
  playerColor: 'w' | 'b'
  skillLevel: number
}

const ChatBot: React.FC<ChatBotProps> = ({ vsComputer, playerColor, skillLevel }) => {
  const { state } = useChess()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [voiceVolume, setVoiceVolume] = useState(0.7)
  const [voiceRate, setVoiceRate] = useState(1.0)
  const [voicePitch, setVoicePitch] = useState(1.0)
  const [showVoiceSettings, setShowVoiceSettings] = useState(false)
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null)
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis
    }
  }, [])

  // Function to speak text
  const speakText = (text: string) => {
    if (!speechSynthesisRef.current || !voiceEnabled) return

    // Cancel any current speech
    if (currentUtteranceRef.current) {
      speechSynthesisRef.current.cancel()
    }

    // Clean text for speech (remove emojis and special characters)
    const cleanText = text.replace(/[^\w\s.,!?-]/g, '').trim()
    if (!cleanText) return

    const utterance = new SpeechSynthesisUtterance(cleanText)
    
    // Get available voices and set a good one
    const voices = speechSynthesisRef.current.getVoices()
    const preferredVoice = voices.find(voice => 
      voice.lang.includes('en') && (voice.name.includes('Google') || voice.name.includes('Samantha'))
    ) || voices.find(voice => voice.lang.includes('en')) || voices[0]
    
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    utterance.volume = voiceVolume
    utterance.rate = voiceRate
    utterance.pitch = voicePitch

    currentUtteranceRef.current = utterance
    speechSynthesisRef.current.speak(utterance)
  }

  // Function to stop speech
  const stopSpeech = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel()
      currentUtteranceRef.current = null
    }
  }

  // Generate comments for moves
  const generateMoveComment = (move: string, isPlayerMove: boolean) => {
    const moveText = move
    const isCapture = move.includes('x')
    const isCheck = move.includes('+')
    const isCheckmate = move.includes('#')
    const isCastle = move.includes('O-O')
    const isEnPassant = move.includes('e.p.')
    const isPromotion = move.includes('=')
    
    let comment = ''
    
    if (isCheckmate) {
      const comments = isPlayerMove 
        ? [
            `You fluked ${moveText}. Even a toddler could do better.`,
            `Checkmate? Ugh. You must be so proud.`,
            `Congrats, you tripped over the finish line with ${moveText}.`
          ]
        : [
            `I move ${moveText}. Utter annihilation.`,
            `I move ${moveText}. You never stood a chance.`,
            `I move ${moveText}. Pathetic resistance.`
          ]
      comment = comments[Math.floor(Math.random() * comments.length)]
    } else if (isCheck) {
      const comments = isPlayerMove
        ? [
            `Check with ${moveText}? Yawn.`,
            `Wow, ${moveText}. Try harder.`,
            `Threatening my king? Cute.`
          ]
        : [
            `I move ${moveText}. Tremble, worm.`,
            `I move ${moveText}. Try not to cry.`,
            `I move ${moveText}. You call that defense?`
          ]
      comment = comments[Math.floor(Math.random() * comments.length)]
    } else if (isCastle) {
      const comments = isPlayerMove
        ? [
            `Castling? How original.`,
            `Wow, ${moveText}. You read the rules.`,
            `Castled. Still doomed.`
          ]
        : [
            `I move ${moveText}. Textbook brilliance.`,
            `I move ${moveText}. You wish you could.`,
            `I move ${moveText}. Try to keep up.`
          ]
      comment = comments[Math.floor(Math.random() * comments.length)]
    } else if (isEnPassant) {
      const comments = isPlayerMove
        ? [
            `En passant? Accident or miracle?`,
            `You actually know en passant? Shocking.`,
            `En passant. Even you get lucky.`
          ]
        : [
            `I move ${moveText}. You didn't see that coming.`,
            `I move ${moveText}. Too advanced for you.`,
            `I move ${moveText}. Outclassed again.`
          ]
      comment = comments[Math.floor(Math.random() * comments.length)]
    } else if (isPromotion) {
      const comments = isPlayerMove
        ? [
            `Promotion? Don't get cocky.`,
            `Queen? Like it'll help.`,
            `Congrats, you found the promote button.`
          ]
        : [
            `I move ${moveText}. Another queen. You're finished.`,
            `I move ${moveText}. Watch and weep.`,
            `I move ${moveText}. Too easy.`
          ]
      comment = comments[Math.floor(Math.random() * comments.length)]
    } else if (isCapture) {
      const comments = isPlayerMove
        ? [
            `You captured? Blind luck.`,
            `Wow, ${moveText}. Even a monkey could.`,
            `Congrats, you found a free piece.`
          ]
        : [
            `I move ${moveText}. Another piece gone.`,
            `I move ${moveText}. You make this too easy.`,
            `I move ${moveText}. You call that defense?`
          ]
      comment = comments[Math.floor(Math.random() * comments.length)]
    } else {
      // Regular moves
      const piece = move.charAt(0)
      const isPawnMove = piece === piece.toLowerCase()
      
      if (isPawnMove) {
        const comments = isPlayerMove
          ? [
              `Pawn move. Riveting.`,
              `You moved a pawn. Groundbreaking.`,
              `Wow, ${moveText}. Inspiring stuff.`
            ]
          : [
              `I move ${moveText}. Effortless.`,
              `I move ${moveText}. Try to keep up.`,
              `I move ${moveText}. You can't stop me.`
            ]
        comment = comments[Math.floor(Math.random() * comments.length)]
      } else {
        const pieceNames = {
          'N': 'knight', 'B': 'bishop', 'R': 'rook', 'Q': 'queen', 'K': 'king'
        }
        const pieceName = pieceNames[piece as keyof typeof pieceNames] || 'piece'
        
        const comments = isPlayerMove
          ? [
              `Moved your ${pieceName}? Still hopeless.`,
              `Wow, ${moveText}. Try again.`,
              `Developing pieces? Too little, too late.`
            ]
          : [
              `I move ${moveText}. Learn from greatness.`,
              `I move ${moveText}. You wish you could.`,
              `I move ${moveText}. Bow down.`
            ]
        comment = comments[Math.floor(Math.random() * comments.length)]
      }
    }

    // Add difficulty-specific comments
    if (skillLevel <= 5) {
      const easyComments = isPlayerMove 
        ? [' (Even you can manage this.)', ' (Beginner luck.)', ' (Try not to mess up.)']
        : [' (I could beat you blindfolded.)', ' (Barely trying.)', ' (This is child\'s play.)']
      comment += easyComments[Math.floor(Math.random() * easyComments.length)]
    } else if (skillLevel >= 15) {
      const expertComments = isPlayerMove 
        ? [' (You\'re still trash.)', ' (I\'m not even sweating.)', ' (You\'ll never win.)']
        : [' (Witness perfection.)', ' (You\'re hopeless.)', ' (I\'m untouchable.)']
      comment += expertComments[Math.floor(Math.random() * expertComments.length)]
    }

    return comment
  }

  // Generate game status comments
  const generateStatusComment = (status: string) => {
    switch (status) {
      case 'checkmate':
        const checkmateComments = [
          '🏆 Game Over! Someone actually won!',
          '💫 The game ends in checkmate! (Surprising, I know)',
          '🎯 Checkmate! A decisive victory! (For once)'
        ]
        return checkmateComments[Math.floor(Math.random() * checkmateComments.length)]
      case 'stalemate':
        const stalemateComments = [
          '🤝 Game drawn by stalemate. A tactical deadlock! (How boring)',
          '⚖️ Stalemate! Neither player can win! (Typical)',
          '🔒 The game ends in stalemate - a draw! (Yawn)'
        ]
        return stalemateComments[Math.floor(Math.random() * stalemateComments.length)]
      case 'draw':
        const drawComments = [
          '🤝 Game drawn. Neither player can win! (How predictable)',
          '⚖️ It\'s a draw! Equal play from both sides. (Boring)',
          '🤝 The game ends in a draw! (At least it\'s over)'
        ]
        return drawComments[Math.floor(Math.random() * drawComments.length)]
      case 'check':
        const checkComments = [
          '⚡ Check! The king is under attack! (Duh)',
          '🔥 Check! The king is in danger! (Obviously)',
          '⚔️ Check! Defend your king! (If you can)'
        ]
        return checkComments[Math.floor(Math.random() * checkComments.length)]
      default:
        return null
    }
  }

  // Watch for new moves and generate comments
  React.useEffect(() => {
    if (!vsComputer) return

    const currentMoveCount = state.moveHistory.length
    const previousMoveCount = messages.filter(m => m.type === 'player' || m.type === 'computer').length

    if (currentMoveCount > previousMoveCount) {
      const newMove = state.moveHistory[currentMoveCount - 1]
      const isPlayerMove = (currentMoveCount % 2 === 1 && playerColor === 'w') || 
                          (currentMoveCount % 2 === 0 && playerColor === 'b')
      
      const comment = generateMoveComment(newMove, isPlayerMove)
      const messageType = isPlayerMove ? 'player' : 'computer'
      
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text: comment,
        type: messageType,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, newMessage])
      
      // Speak all messages
      if (voiceEnabled) {
        speakText(comment)
      }
    }
  }, [state.moveHistory, vsComputer, playerColor, voiceEnabled])

  // Watch for game status changes
  React.useEffect(() => {
    if (!vsComputer) return

    const statusComment = generateStatusComment(state.gameStatus)
    if (statusComment) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text: statusComment,
        type: 'system',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, newMessage])
      
      // Speak system messages
      if (voiceEnabled) {
        speakText(statusComment)
      }
    }
  }, [state.gameStatus, vsComputer, voiceEnabled])

  // Clear messages when game resets and add welcome message
  React.useEffect(() => {
    if (state.moveHistory.length === 0) {
      setMessages([])
      // Add welcome message when game starts
      if (vsComputer) {
        const welcomeMessages = [
          `🎮 Oh great, another human to crush. Let's see what you've got...`,
          `🤖 Hello meatbag! I'm your sarcastic chess commentator. Try not to embarrass yourself.`,
          `♟️ Ready to lose? I'll be here to comment on your... interesting... moves.`
        ]
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          text: welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)],
          type: 'system',
          timestamp: new Date()
        }
        setMessages([welcomeMessage])
        
        // Speak welcome message
        if (voiceEnabled) {
          speakText(welcomeMessage.text)
        }
      }
    }
  }, [state.moveHistory, vsComputer, voiceEnabled])

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stopSpeech()
    }
  }, [])

  if (!vsComputer) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="notification-panel rounded-xl p-4 shadow-2xl border border-gray-600/30 backdrop-blur-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          🤖 Chess Assistant
          <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">Level {skillLevel}</span>
        </h3>
        <div className="flex items-center gap-2">
          {/* Voice Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-full transition-all duration-200 ${
                voiceEnabled 
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
              }`}
              title={voiceEnabled ? 'Disable Voice' : 'Enable Voice'}
            >
              {voiceEnabled ? '🔊' : '🔇'}
            </button>
            {voiceEnabled && (
              <>
                <button
                  onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                  className="p-2 rounded-full bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 transition-all duration-200"
                  title="Voice Settings"
                >
                  ⚙️
                </button>
                <button
                  onClick={stopSpeech}
                  className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200"
                  title="Stop Speech"
                >
                  ⏹️
                </button>
              </>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors duration-200 bg-gray-700/50 rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-600/50"
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
      </div>

      {/* Voice Settings Panel */}
      <AnimatePresence>
        {showVoiceSettings && voiceEnabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-4 p-4 bg-gray-800/50 rounded-lg border border-gray-600/30"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Volume</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={voiceVolume}
                  onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                  className="w-24 h-2 voice-slider"
                />
                <span className="text-xs text-gray-400 w-8">{Math.round(voiceVolume * 100)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Speed</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceRate}
                  onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                  className="w-24 h-2 voice-slider"
                />
                <span className="text-xs text-gray-400 w-8">{voiceRate}x</span>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Pitch</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voicePitch}
                  onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                  className="w-24 h-2 voice-slider"
                />
                <span className="text-xs text-gray-400 w-8">{voicePitch}x</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className={`mb-3 p-4 rounded-lg border-l-4 shadow-lg ${
                      message.type === 'player'
                        ? 'bg-blue-500/10 border-blue-400/60 shadow-blue-500/20'
                        : message.type === 'computer'
                        ? 'bg-red-500/10 border-red-400/60 shadow-red-500/20'
                        : 'bg-yellow-500/10 border-yellow-400/60 shadow-yellow-500/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">
                        {message.type === 'player' ? '👤' : message.type === 'computer' ? '🤖' : '📢'}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-100 font-medium leading-relaxed">{message.text}</p>
                        <p className="text-xs text-gray-400 mt-2 opacity-75">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {voiceEnabled && (
                        <button
                          onClick={() => speakText(message.text)}
                          className="text-gray-400 hover:text-white transition-colors duration-200 p-1"
                          title="Replay message"
                        >
                          🔊
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-gray-400 text-sm">Make a move to see comments!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always show the latest message if not expanded */}
      {!isExpanded && messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-lg bg-gray-700/30 border border-gray-600/30 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">
              {messages[messages.length - 1].type === 'player' ? '👤' : 
               messages[messages.length - 1].type === 'computer' ? '🤖' : '📢'}
            </span>
            <p className="text-sm text-gray-100 font-medium truncate">
              {messages[messages.length - 1].text}
            </p>
            {voiceEnabled && (
              <button
                onClick={() => speakText(messages[messages.length - 1].text)}
                className="text-gray-400 hover:text-white transition-colors duration-200 p-1 ml-auto"
                title="Replay message"
              >
                🔊
              </button>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default ChatBot 