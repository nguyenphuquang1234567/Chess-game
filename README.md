# Chess Game

A modern, beautiful chess game built with React, TypeScript, and Tailwind CSS. Features a clean interface similar to chess.com and lichess with full chess game logic.

## Features

- 🎮 **Full Chess Game Logic** - Complete chess rules implementation using chess.js
- 🎨 **Beautiful UI** - Modern, responsive design with smooth animations
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- 🎯 **Move Validation** - Automatic validation of all chess moves
- 📊 **Game State Tracking** - Move history, captured pieces, and game status
- 🔄 **Board Controls** - Flip board, reset game, and more
- ✨ **Smooth Animations** - Framer Motion powered animations
- 🎨 **Visual Feedback** - Highlighted moves, captures, and selections

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **chess.js** - Chess game logic and validation
- **Lucide React** - Beautiful icons
- **Vite** - Fast build tool

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chessgame
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## How to Play

1. **Select a Piece**: Click on any piece of your color to select it
2. **Make a Move**: Click on a highlighted square to move your piece
3. **Valid Moves**: Green squares show valid moves, red squares show captures
4. **Game Controls**: Use the buttons to reset the game or flip the board
5. **Track Progress**: View move history and captured pieces in the side panel


## Game Features

### Core Gameplay
- ✅ Complete chess rules implementation
- ✅ Move validation and legal move highlighting
- ✅ Check and checkmate detection
- ✅ Stalemate and draw detection
- ✅ Pawn promotion (auto-promotes to queen)

### User Interface
- ✅ Responsive chess board
- ✅ Piece selection and move highlighting
- ✅ Game status display
- ✅ Move history panel
- ✅ Captured pieces display
- ✅ Board flip functionality
- ✅ New game button

### Visual Design
- ✅ Modern, clean interface
- ✅ Smooth animations and transitions
- ✅ Hover effects and visual feedback
- ✅ Dark theme with chess-inspired colors
- ✅ Responsive layout for all screen sizes



## Project Structure

```
src/
├── components/
│   ├── ChessBoard.tsx      # Main chess board component
│   ├── ChessPiece.tsx      # Individual chess piece component
│   ├── GameControls.tsx    # Game control buttons
│   ├── MoveHistory.tsx     # Move history display
│   ├── CapturedPieces.tsx  # Captured pieces display
│   └── ChessGame.tsx       # Main game container
├── context/
│   └── ChessContext.tsx    # Game state management
├── App.tsx                 # Main app component
├── main.tsx               # React entry point
└── index.css              # Global styles
```

## Customization

### Colors
The chess board colors can be customized in `tailwind.config.js`:

```javascript
colors: {
  'chess-dark': '#312e2b',
  'chess-light': '#eeeed2',
  'chess-highlight': '#f7f769',
  'chess-move': '#baca44',
  'chess-capture': '#f56565',
  'chess-check': '#ff6b6b',
}
```

### Styling
All components use Tailwind CSS classes and can be easily customized by modifying the className props.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [chess.js](https://github.com/jhlywa/chess.js) for chess game logic
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for icons 