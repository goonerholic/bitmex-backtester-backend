import * as TA from 'technicalindicators';
import { DataFrame } from './dataFrame';
import { SimpleIndicatorInput, MACDInput, BBInput } from '../types';

export class Indicators {
  _data: DataFrame;
  constructor(data: DataFrame) {
    this._data = data;
    TA.setConfig('precision', 6);
  }

  sma({ period }: SimpleIndicatorInput) {
    const SMA = new TA.SMA({ period, values: [] });
    const result = [];
    for (const data of this._data) {
      result.push(SMA.nextValue(data.close));
    }
    return result;
  }

  ema({ period }: SimpleIndicatorInput) {
    const EMA = new TA.EMA({ period, values: [] });
    const result = [];
    for (const data of this._data) {
      result.push(EMA.nextValue(data.close));
    }
    return result;
  }

  macd({
    fastPeriod,
    slowPeriod,
    signalPeriod,
    SimpleMAOscillator = false,
    SimpleMASignal = false,
  }: MACDInput) {
    const MACD = new TA.MACD({
      fastPeriod,
      slowPeriod,
      signalPeriod,
      SimpleMAOscillator,
      SimpleMASignal,
      values: [],
    });
    const macd = [];
    const signal = [];
    const histogram = [];
    for (const data of this._data) {
      const current = MACD.nextValue(data.close);
      macd.push(current?.MACD);
      signal.push(current?.signal);
      histogram.push(current?.histogram);
    }
    return {
      macd,
      signal,
      histogram,
    };
  }

  rsi({ period }: SimpleIndicatorInput) {
    const RSI = new TA.RSI({ period, values: [] });
    const result = [];
    for (const data of this._data) {
      result.push(RSI.nextValue(data.close));
    }
    return result;
  }

  bb({ period, stdDev }: BBInput) {
    const BB = new TA.BollingerBands({
      period,
      stdDev,
      values: [],
    });
    const middle = [];
    const upper = [];
    const lower = [];
    const pb = [];
    for (const data of this._data) {
      const current = BB.nextValue(data.close);
      middle.push(current?.middle);
      upper.push(current?.upper);
      lower.push(current?.lower);
      pb.push(current?.pb);
    }
    return {
      middle,
      upper,
      lower,
      pb,
    };
  }

  atr({ period }: SimpleIndicatorInput) {
    const ATR = new TA.ATR({
      period,
      high: [],
      low: [],
      close: [],
    });
    const result = [];
    for (const data of this._data) {
      result.push(
        ATR.nextValue({
          high: data.high,
          low: data.low,
          close: data.close,
        }),
      );
    }
    return result;
  }
}
