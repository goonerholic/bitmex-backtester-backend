import mongoose, { Model } from 'mongoose';

export type ICandle = {
  [key: string]: string | number | Date;
  symbol: string;
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
};

// types for mongoose schema
export type ICandleSchema = mongoose.Document & ICandle;

export type ICandleModel = Model<ICandleSchema> & {
  findBySymbol(input: {
    symbol: string;
    dataOnly: boolean;
    start: string;
    end: string;
  }): Promise<ICandle[]>;
};

// types for Backtester class
export type Isymbol = 'XBTUSD' | 'ETHUSD';
export type TestConfig = {
  initialCap: number;
  leverage: number;
  amountType: 'fixed' | 'percent';
  amount: number;
  slippage: number;
  fee: boolean;
  orderLimit: number;
  [key: string]: number | string | boolean | undefined;
};

export type ConfigInput = {
  initialCap?: number;
  leverage?: number;
  amountType?: 'fixed' | 'percent';
  amount?: number;
  slippage?: number;
  fee?: number;
  orderLimit?: number;
  [key: string]: number | string | undefined;
};

export type EntryConditions = 'Long Entry' | 'Short Entry';
export type ExitConditions = 'Long Exit' | 'Short Exit';
export type SafetyConditions = 'Target' | 'Stop';

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
  type: ExitConditions | SafetyConditions;
  orderQty: number;
  entryPx: number;
  exitPx: number;
  pnl: number;
  result: 'Won' | 'Lost';
  balance: number;
  drawdown: number;
  [key: string]: number | string | Date | Ihistory;
};

// types for DataFrame class
export type Ihistory = ({
  count,
  columnName,
}: {
  count: number;
  columnName: string;
}) => number[];

export type Candle = {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  [key: string]: Date | number | Ihistory;
  history: Ihistory;
};

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
export type StrategyIndicator = BasicIndicator | MACDIndicator | BBIndicator;

type BasicIndicator = {
  name: string;
  indicator: 'sma' | 'ema' | 'rsi' | 'atr';
  input: SimpleIndicatorInput;
};

type MACDIndicator = {
  name: string;
  indicator: 'macd';
  input: MACDInput;
};

type BBIndicator = {
  name: string;
  indicator: 'bb';
  input: BBInput;
};

export type QueryInput = {
  columnName: string;
  index: number;
  target: number | string;
};

type SafetyQueryInput = {
  columnName?: string;
  value: number;
};

export type ConditionQuery = {
  or?: ConditionQuery[];
  crossover?: QueryInput;
  crossunder?: QueryInput;
  gt?: QueryInput;
  gte?: QueryInput;
  lt?: QueryInput;
  lte?: QueryInput;
  [key: string]: QueryInput | undefined | ConditionQuery[];
};

export type SafetyQuery = {
  fixed?: SafetyQueryInput;
  percent?: SafetyQueryInput;
};

export type StrategyInput = {
  name: string;
  indicators: StrategyIndicator[];
  longEntry: ConditionQuery[];
  shortEntry: ConditionQuery[];
  longExit: ConditionQuery[];
  shortExit: ConditionQuery[];
  target: SafetyQuery;
  stop: SafetyQuery;
};
