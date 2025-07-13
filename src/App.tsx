import ChessGame from './components/ChessGame'
import { ChessProvider } from './context/ChessContext'
import { motion } from 'framer-motion'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-chess-dark to-gray-900">
      <ChessProvider>
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <motion.h1 
              className="text-5xl font-bold text-white mb-4 main-title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Chess Game
            </motion.h1>
            <motion.p 
              className="text-gray-300 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Play chess like the pros
            </motion.p>
          </header>
          <ChessGame />
        </div>
      </ChessProvider>
    </div>
  )
}

export default App 