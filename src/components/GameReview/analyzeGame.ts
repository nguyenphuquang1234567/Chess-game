// analyzeGame.ts
import { Chess } from 'chess.js';
import { StockfishEngine, StockfishEval } from './StockfishEngine';
import { AnnotatedMove, ReviewSummary, MoveClassification } from './types';

const CLASSIFICATION_TABLE: { min: number; max: number; label: MoveClassification; symbol: string }[] = [
  { min: 0, max: 0, label: 'best', symbol: '' },
  { min: 1, max: 19, label: 'excellent', symbol: '!' },
  { min: 20, max: 49, label: 'good', symbol: '' },
  { min: 50, max: 99, label: 'inaccuracy', symbol: '?!' },
  { min: 100, max: 299, label: 'mistake', symbol: '?' },
  { min: 300, max: Infinity, label: 'blunder', symbol: '??' },
];

function classifyMove(cpl: number, isBrilliant: boolean, isMiss: boolean): { label: MoveClassification; symbol: string } {
  if (isBrilliant) return { label: 'brilliant', symbol: '!!' };
  if (isMiss) return { label: 'miss', symbol: '' };
  for (const row of CLASSIFICATION_TABLE) {
    if (cpl >= row.min && cpl <= row.max) {
      return { label: row.label, symbol: row.symbol };
    }
  }
  return { label: 'best', symbol: '' };
}

function calculateAccuracy(cplList: number[]): number {
  if (cplList.length === 0) return 100;
  const avgCPL = cplList.reduce((a, b) => a + b, 0) / cplList.length;
  let acc = 100 - 0.06 * Math.pow(avgCPL, 1.5);
  acc = Math.max(0, Math.min(100, acc));
  return Math.round(acc * 10) / 10;
}

export async function analyzeGame(
  moves: string[] | string,
  stockfishPath = '/stockfish.js',
  multiPV = 3,
  depth = 12
): Promise<ReviewSummary & { moveCountsWhite: Record<MoveClassification, number>, moveCountsBlack: Record<MoveClassification, number> }> {
  // Parse moves
  let moveList: string[];
  if (typeof moves === 'string') {
    // PGN string
    const chess = new Chess();
    chess.loadPgn(moves);
    moveList = chess.history();
  } else {
    moveList = moves;
  }

  if (moveList.length === 0) {
    return {
      accuracyWhite: 100,
      accuracyBlack: 100,
      moveCounts: { brilliant: 0, best: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, miss: 0 },
      moveCountsWhite: { brilliant: 0, best: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, miss: 0 },
      moveCountsBlack: { brilliant: 0, best: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, miss: 0 },
      worstMoveIndex: -1,
      annotatedMoves: []
    };
  }

  const chess = new Chess();
  const engine = new StockfishEngine(stockfishPath);
  const annotatedMoves: AnnotatedMove[] = [];
  let worstMoveIndex = -1;
  let worstCPL = -1;
  const cplWhite: number[] = [];
  const cplBlack: number[] = [];
  const moveCounts: Record<MoveClassification, number> = {
    brilliant: 0, best: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, miss: 0
  };
  const moveCountsWhite: Record<MoveClassification, number> = {
    brilliant: 0, best: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, miss: 0
  };
  const moveCountsBlack: Record<MoveClassification, number> = {
    brilliant: 0, best: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, miss: 0
  };

  try {
    for (let i = 0; i < moveList.length; i++) {
      const fenBefore = chess.fen();
      // Evaluate before move
      let evalsBefore: StockfishEval[] = [];
      try {
        evalsBefore = await Promise.race([
          engine.evaluatePosition(fenBefore, multiPV, depth),
          new Promise<StockfishEval[]>((_, reject) => 
            setTimeout(() => reject(new Error('Evaluation timeout')), 10000)
          )
        ]);
      } catch (e) {
        // fallback dummy
        evalsBefore = [{ depth, multipv: 1, score: 0, pv: [] }];
      }
      // Always use White's perspective for evaluation
      const isWhiteMove = i % 2 === 0;
      let bestEval = evalsBefore[0]?.score ?? 0;
      if (!isWhiteMove) bestEval = -bestEval;
      // Force the first move to always start at 0
      if (i === 0) bestEval = 0;
      const bestMove = evalsBefore[0]?.pv[0] || '';
      // Play actual move
      const move = moveList[i];
      const moveResult = chess.move(move);
      const fenAfter = chess.fen();
      
      // Check if this move resulted in checkmate
      const isCheckmate = chess.isCheckmate();
      
      // Evaluate after move
      let evalsAfter: StockfishEval[] = [];
      try {
        evalsAfter = await Promise.race([
          engine.evaluatePosition(fenAfter, multiPV, depth),
          new Promise<StockfishEval[]>((_, reject) => 
            setTimeout(() => reject(new Error('Evaluation timeout')), 10000)
          )
        ]);
      } catch (e) {
        evalsAfter = [{ depth, multipv: 1, score: 0, pv: [] }];
      }
      let actualEval = evalsAfter[0]?.score ?? 0;
      if (isWhiteMove) {
        // After White's move, it's Black's turn, so invert
        actualEval = -actualEval;
      }
      
      // If checkmate, set evaluation to mate score
      if (isCheckmate) {
        actualEval = isWhiteMove ? 10000 : -10000; // White mates or Black mates
      }
      
      // Calculate CPL
      const cpl = Math.abs(bestEval - actualEval);
      // Determine if the move is bad for the player
      const isMistakeForPlayer = isWhiteMove ? actualEval < bestEval : actualEval > bestEval;
      // Heuristics for brilliant/miss
      let isBrilliant = false;
      let isMiss = false;
      // Brilliant: not best move, sacrifices material, eval improves
      if (move !== bestMove && actualEval >= bestEval && sacrificesMaterial(chess, move)) {
        isBrilliant = true;
      }
      // Miss: missed mate or decisive win
      if (evalsBefore.some(e => e.mate && Math.abs(e.mate) === 1) && move !== bestMove) {
        isMiss = true;
      }
      // Only classify as mistake/inaccuracy/blunder if it's bad for the player
      let label: MoveClassification;
      let symbol: string;
      if (isCheckmate) {
        // Checkmate moves are always best
        label = 'best';
        symbol = '';
      } else if (isMistakeForPlayer) {
        ({ label, symbol } = classifyMove(cpl, isBrilliant, isMiss));
      } else {
        // If not a mistake for the player, treat as best/good/excellent
        if (cpl === 0) {
          label = 'best'; symbol = '';
        } else if (cpl < 20) {
          label = 'excellent'; symbol = '👍🏻';
        } else {
          label = 'good'; symbol = '';
        }
      }
      moveCounts[label]++;
      if (isWhiteMove) {
        moveCountsWhite[label]++;
      } else {
        moveCountsBlack[label]++;
      }
      annotatedMoves.push({
        move,
        fenBefore,
        fenAfter,
        evalBefore: bestEval,
        evalAfter: actualEval,
        cpl,
        classification: label,
        symbol,
        ...(label === 'brilliant' && { explanation: 'A brilliant move! Sacrifice with deep purpose.' }),
        ...(label === 'miss' && { explanation: 'Missed a forced mate or decisive win.' })
      });
      // Track worst move
      if (cpl > worstCPL) {
        worstCPL = cpl;
        worstMoveIndex = i;
      }
      // Track accuracy
      if (chess.turn() === 'b') {
        cplWhite.push(cpl);
      } else {
        cplBlack.push(cpl);
      }
      
      // Stop analysis after processing the checkmate move
      if (isCheckmate) {
        break;
      }
    }
  } finally {
    engine.terminate();
  }
  
  // Mark worst move
  if (worstMoveIndex >= 0) {
    annotatedMoves[worstMoveIndex].isWorst = true;
  }
  // Compute accuracy
  const accuracyWhite = calculateAccuracy(cplWhite);
  const accuracyBlack = calculateAccuracy(cplBlack);
  
  return {
    accuracyWhite,
    accuracyBlack,
    moveCounts,
    moveCountsWhite,
    moveCountsBlack,
    worstMoveIndex,
    annotatedMoves
  };
}

// Heuristic: check if move is a sacrifice (very basic)
function sacrificesMaterial(chess: Chess, move: string): boolean {
  // TODO: Implement a more robust check
  // For now, just check if previous move captured a piece
  const history = chess.history({ verbose: true });
  if (history.length < 1) return false;
  const last = history[history.length - 1];
  return !!last.captured;
} 