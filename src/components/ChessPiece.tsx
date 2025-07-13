import React from 'react'

interface ChessPieceProps {
  type: string
  color: 'w' | 'b'
  className?: string
}

// Correct Lichess CDN base URL for 'cburnett' set
const LICHESS_BASE = 'https://lichess1.org/assets/piece/cburnett/'

const pieceMap: Record<string, string> = {
  k: 'K',
  q: 'Q',
  r: 'R',
  b: 'B',
  n: 'N',
  p: 'P',
}

const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, className = '' }) => {
  const pieceLetter = pieceMap[type]
  const colorLetter = color === 'w' ? 'w' : 'b'
  const src = `${LICHESS_BASE}${colorLetter}${pieceLetter}.svg`
  return (
    <img
      src={src}
      alt={`${color === 'w' ? 'White' : 'Black'} ${type}`}
      className={`chess-piece w-10 h-10 sm:w-14 sm:h-14 select-none ${className}`}
      draggable={false}
    />
  )
}

export default ChessPiece 