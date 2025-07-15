// StockfishEngine.ts
// Handles async communication with stockfish.js for chess analysis

export interface StockfishEval {
  depth: number;
  multipv: number;
  score: number; // in centipawns
  mate?: number; // mate in N if present
  pv: string[]; // principal variation
}

export class StockfishEngine {
  private engine: Worker | null = null;
  private isReady: boolean = false;
  private onMessage: ((msg: string) => void) | null = null;
  private resolveEval: ((evals: StockfishEval[]) => void) | null = null;
  private evals: StockfishEval[] = [];
  private multiPV: number = 1;

  constructor(stockfishPath: string = '/stockfish.js') {
    if (typeof window !== 'undefined') {
      this.engine = new Worker(stockfishPath);
      this.engine.onmessage = (event) => this.handleMessage(event.data);
      this.send('uci');
      this.send('isready');
    }
  }

  private send(cmd: string) {
    if (this.engine) {
      this.engine.postMessage(cmd);
    }
  }

  private handleMessage(msg: string) {
    if (msg === 'readyok') {
      this.isReady = true;
      if (this.onMessage) this.onMessage(msg);
      return;
    }
    if (msg.startsWith('info')) {
      const evalObj = this.parseInfo(msg);
      if (evalObj) {
        // Only keep the best N lines
        if (evalObj.multipv <= this.multiPV) {
          this.evals[evalObj.multipv - 1] = evalObj;
        }
      }
    }
    if (msg.startsWith('bestmove')) {
      if (this.resolveEval) {
        this.resolveEval(this.evals);
        this.resolveEval = null;
        this.evals = [];
      }
    }
  }

  private parseInfo(msg: string): StockfishEval | null {
    // Example: info depth 20 seldepth 32 multipv 1 score cp 13 pv e2e4 e7e5 ...
    const depthMatch = msg.match(/depth (\d+)/);
    const multipvMatch = msg.match(/multipv (\d+)/);
    const scoreMatch = msg.match(/score (cp|mate) (-?\d+)/);
    const pvMatch = msg.match(/pv ([a-h1-8 ]+)/);
    if (!depthMatch || !multipvMatch || !scoreMatch || !pvMatch) return null;
    const depth = parseInt(depthMatch[1], 10);
    const multipv = parseInt(multipvMatch[1], 10);
    const scoreType = scoreMatch[1];
    const scoreVal = parseInt(scoreMatch[2], 10);
    const score = scoreType === 'cp' ? scoreVal : (scoreType === 'mate' ? (scoreVal > 0 ? 10000 - scoreVal : -10000 - scoreVal) : 0);
    const mate = scoreType === 'mate' ? scoreVal : undefined;
    const pv = pvMatch[1].trim().split(' ');
    return { depth, multipv, score, mate, pv };
  }

  async waitReady(): Promise<void> {
    if (this.isReady) return;
    await new Promise<void>((resolve) => {
      this.onMessage = () => resolve();
    });
  }

  async evaluatePosition(fen: string, multiPV = 3, depth = 18): Promise<StockfishEval[]> {
    this.multiPV = multiPV;
    await this.waitReady();
    this.send('ucinewgame');
    this.send(`setoption name MultiPV value ${multiPV}`);
    this.send(`position fen ${fen}`);
    this.send(`go depth ${depth}`);
    return new Promise<StockfishEval[]>((resolve) => {
      this.resolveEval = resolve;
    });
  }

  terminate() {
    if (this.engine) {
      this.engine.terminate();
      this.engine = null;
    }
  }
} 