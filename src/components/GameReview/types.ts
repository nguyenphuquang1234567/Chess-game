// types.ts

export type MoveClassification =
  | 'brilliant'
  | 'best'
  | 'excellent'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'
  | 'miss';

export interface AnnotatedMove {
  move: string; // SAN
  fenBefore: string;
  fenAfter: string;
  evalBefore: number; // centipawns
  evalAfter: number; // centipawns
  cpl: number; // centipawn loss
  classification: MoveClassification;
  symbol: string;
  explanation?: string;
  isWorst?: boolean;
}

export interface ReviewSummary {
  accuracyWhite: number;
  accuracyBlack: number;
  moveCounts: Record<MoveClassification, number>;
  worstMoveIndex: number;
  annotatedMoves: AnnotatedMove[];
  moveCountsWhite?: Record<MoveClassification, number>;
  moveCountsBlack?: Record<MoveClassification, number>;
} 