import mongoose, { Model } from 'mongoose';

export type Candle = {
  [key: string]: string | number | Date | History;
  symbol: string;
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  history: History;
};

// types for mongoose schema
export type CandleSchema = mongoose.Document & Candle;

export type CandleModel = Model<CandleSchema> & {
  findBySymbol(input: {
    symbol: string;
    dataOnly: boolean;
    start: string;
    end: string;
  }): Promise<Candle[]>;
};

// types for Backtester class
export type Symbol = 'XBTUSD' | 'ETHUSD';
export type TestConfig = {
  initialCap: number;
  leverage: number;
  amountType: 'fixed' | 'percent';
  amount: number;
  slippage?: number;
  fee?: boolean;
  orderLimit: number;
  [key: string]: number | string | boolean | undefined;
};

export type EntryCondition = 'Long Entry' | 'Short Entry';
export type ExitCondition = 'Long Exit' | 'Short Exit';
export type SafetyCondition = 'Target' | 'Stop';

export type Strategy = {
  longEntry: (candle: Candle, or?: boolean) => boolean;
  shortEntry: (candle: Candle, or?: boolean) => boolean;
  longExit: (candle: Candle, or?: boolean) => boolean;
  shortExit: (candle: Candle, or?: boolean) => boolean;
  target:
    | ((entryPx: number, side: 1 | -1, candle: Candle) => number | undefined)
    | undefined;
  stop:
    | ((entryPx: number, side: 1 | -1, candle: Candle) => number | undefined)
    | undefined;
};

export type Position =
  | {
      timestamp: Date;
      isOpen: true;
      currentQty: number;
      avgEntryPx: number;
      targetPx: number | undefined;
      stopPx: number | undefined;
      highs: number[];
      lows: number[];
    }
  | {
      timestamp: null;
      isOpen: false;
      currentQty: 0;
      avgEntryPx: null;
      targetPx: null;
      stopPx: null;
    };

export type Trade = {
  entryTime: string;
  exitTime: string;
  type: ExitCondition | SafetyCondition;
  orderQty: number;
  entryPx: number;
  exitPx: number;
  pnl: number;
  result: 'Won' | 'Lost';
  balance: number;
  drawdown: number;
  [key: string]: number | string | Date | History;
};

// types for DataFrame class
export type History = ({
  count,
  columnName,
}: {
  count: number;
  columnName: string;
}) => number[];

export type CandleDataFrame = {
  timestamp: Date[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  [key: string]: (Date | number | undefined)[];
};

// types for indicators
export type SimpleIndicatorInput = {
  period: number;
};

export type BBInput = {
  period: number;
  stdDev: number;
};

export type MACDInput = {
  fastPeriod: number;
  slowPeriod: number;
  signalPeriod: number;
  SimpleMAOscillator?: boolean;
  SimpleMASignal?: boolean;
};

// types for strategy query
export type StrategyIndicator = Indicator | IndicatorMACD | IndicatorBB;

type Indicator = {
  name: string;
  indicator: 'sma' | 'ema' | 'rsi' | 'atr';
  input: SimpleIndicatorInput;
};

type IndicatorMACD = {
  name: string;
  indicator: 'macd';
  input: MACDInput;
};

type IndicatorBB = {
  name: string;
  indicator: 'bb';
  input: BBInput;
};

export type Query = {
  columnName: string;
  index: number;
  target: number | string;
};

type SafetyQuery = {
  columnName?: string;
  value: number;
};

export type Condition = {
  or?: Condition[];
  crossover?: Query;
  crossunder?: Query;
  gt?: Query;
  gte?: Query;
  lt?: Query;
  lte?: Query;
  [key: string]: Query | undefined | Condition[];
};

export type Safety = {
  fixed?: SafetyQuery;
  percent?: SafetyQuery;
};

export type StrategyQuery = {
  name: string;
  indicators: StrategyIndicator[];
  longEntry: Condition[];
  shortEntry: Condition[];
  longExit: Condition[];
  shortExit: Condition[];
  target: Safety;
  stop: Safety;
};
