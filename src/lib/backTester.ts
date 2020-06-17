import { DataFrame } from './dataFrame';
import {
  TestConfig,
  Trade,
  Strategy,
  Position,
  ExitCondition,
  SafetyCondition,
  Symbol,
} from '../types';
import { Indicators } from './indicators';

export class Backtester {
  _data: DataFrame;
  _config: TestConfig;
  _position: Position;
  _trades: Trade[];
  _balance: number;
  _strategy: Strategy;
  _symbol: Symbol;
  indicators!: Indicators;
  constructor({
    symbol,
    data,
    strategy,
  }: {
    symbol: Symbol;
    data: DataFrame;
    strategy: Strategy;
  }) {
    this._data = data;
    this._strategy = strategy;
    this._symbol = symbol;

    this._config = {
      initialCap: 1,
      leverage: 10,
      amountType: 'fixed',
      amount: 5000,
      slippage: 0,
      fee: false,
      orderLimit: 1000000,
    };

    this._position = {
      timestamp: null,
      currentQty: 0,
      isOpen: false,
      avgEntryPx: null,
      targetPx: null,
      stopPx: null,
    };
    this._trades = [];
    this._balance = this._config.initialCap;
  }

  /**
   * Set backtester config
   * @param configInput
   */
  public setConfig(configInput: TestConfig): void {
    this._config = { ...this._config, ...configInput };
    this._balance = this._config.initialCap;
  }

  /**
   * Exit position and add trade result
   * @param timestamp
   * @param exitPx
   * @param type
   */
  private _exitPosition(
    timestamp: Date,
    exitPx: number,
    type: ExitCondition | SafetyCondition,
  ): void {
    if (!this._position.isOpen) return; //exit when no open position
    const {
      timestamp: entryTime,
      currentQty,
      avgEntryPx,
      targetPx,
      stopPx,
    } = this._position; //get current position informations
    const slippage = this._config.slippage || 0;

    const coeff = currentQty > 0 ? 1 : -1;
    // entry, exit price after slippage applied
    const entryPxAfterSlippage =
      avgEntryPx + (Math.random() > 0.8 ? -coeff : coeff) * slippage;
    const exitPxAfterSlippage =
      exitPx - (type !== 'Target' ? coeff * slippage : 0);

    // calculate trade commission
    // assume entry, exit, stop order are market, target order is limit order
    let fee = 0;
    if (this._config.fee) {
      switch (this._symbol) {
        case 'XBTUSD':
          fee =
            (Math.abs(currentQty) / avgEntryPx) * 0.00075 +
            (type !== 'Target'
              ? (Math.abs(currentQty) / exitPxAfterSlippage) * 0.00075
              : (-Math.abs(currentQty) / exitPxAfterSlippage) * 0.00025);
          break;
        case 'ETHUSD':
          fee =
            Math.abs((currentQty * avgEntryPx) / 1000000) * 0.00075 +
            (type !== 'Target'
              ? Math.abs((currentQty * exitPxAfterSlippage) / 1000000) * 0.00075
              : -Math.abs((currentQty * exitPxAfterSlippage) / 1000000) *
                0.00025);
          break;
      }
    }

    // get pnl of current trade
    const pnl =
      this._getPnl(
        this._symbol,
        currentQty,
        entryPxAfterSlippage,
        exitPxAfterSlippage,
      ) - fee;

    this._balance += pnl;
    const trade: Trade = {
      entryTime: entryTime.toISOString(),
      exitTime: timestamp.toISOString(),
      type,
      orderQty: currentQty,
      entryPx: entryPxAfterSlippage,
      exitPx: exitPxAfterSlippage,
      pnl,
      result: pnl > 0 ? 'Won' : 'Lost',
      balance: this._balance,
      drawdown:
        (this._balance /
          Math.max(
            ...this._trades.map((trade) => trade.balance),
            this._balance,
          ) -
          1) *
        100,
      fee,
    };
    if (targetPx) trade.targetPx = targetPx;
    if (stopPx) trade.stopPx = stopPx;
    this._trades.push(trade);

    // empty position
    this._position = {
      timestamp: null,
      isOpen: false,
      currentQty: 0,
      avgEntryPx: null,
      targetPx: null,
      stopPx: null,
    };
  }

  /**
   * position entry when entry condition is true
   * @param timestamp timestamp when position entry
   * @param currentQty
   * @param avgEntryPx
   * @param targetPx
   * @param stopPx
   */
  private _enterPosition(
    timestamp: Date,
    currentQty: number,
    avgEntryPx: number,
    targetPx: number | undefined,
    stopPx: number | undefined,
  ): void {
    this._position = {
      timestamp,
      isOpen: true,
      currentQty,
      avgEntryPx,
      targetPx,
      stopPx,
      highs: [],
      lows: [],
    };
  }

  private _getPnl(
    symbol: 'XBTUSD' | 'ETHUSD',
    qty: number,
    entryPx: number,
    exitPx: number,
  ): number {
    switch (symbol) {
      case 'XBTUSD':
        return qty * (1 / entryPx - 1 / exitPx);
      case 'ETHUSD':
        return (exitPx - entryPx) * 0.000001 * qty;
    }
  }

  /**
   * check if target or stop order filled
   * @param high high price of current candle
   * @param low low price of current candle
   */
  private _checkSafety(
    high: number,
    low: number,
  ): 'Target' | 'Stop' | undefined {
    if (!this._position.isOpen) return;
    const { currentQty, targetPx, stopPx } = this._position;
    if (
      stopPx &&
      ((currentQty > 0 && low <= stopPx) || (currentQty < 0 && high >= stopPx))
    ) {
      return 'Stop';
    }
    if (
      targetPx &&
      ((currentQty > 0 && high >= targetPx) ||
        (currentQty < 0 && low <= targetPx))
    ) {
      return 'Target';
    }
    return;
  }

  private _getQuantity(symbol: Symbol, entryPx: number) {
    const { amountType, amount, leverage } = this._config;
    if (amountType === 'fixed') return amount;
    switch (symbol) {
      case 'XBTUSD':
        return Math.floor(entryPx * this._balance * amount * leverage);
      case 'ETHUSD':
        return (this._balance * amount * leverage * 1000000) / entryPx;
    }
  }

  /**
   * run test
   */
  public run(): Trade[] {
    const {
      longEntry,
      shortEntry,
      longExit,
      shortExit,
      target,
      stop,
    } = this._strategy;
    for (const candle of this._data) {
      const { timestamp, high, low, close } = candle;
      if (this._position.isOpen) {
        const { currentQty, targetPx, stopPx } = this._position;
        const safetyCondition =
          target || stop ? this._checkSafety(high, low) : undefined;
        let exitCondition: ExitCondition | SafetyCondition | undefined;
        let exitPx;
        if (safetyCondition) {
          exitCondition = safetyCondition;
          exitPx = exitCondition === 'Target' ? targetPx : stopPx;
        } else if (longExit(candle) && currentQty > 0) {
          exitCondition = 'Long Exit';
          exitPx = close;
        } else if (shortExit(candle) && currentQty < 0) {
          exitCondition = 'Short Exit';
          exitPx = close;
        }
        if (exitCondition && exitPx) {
          this._exitPosition(timestamp, exitPx, exitCondition);
        }
      }

      if (!this._position.isOpen) {
        const entryCondition = longEntry(candle)
          ? 'Long Entry'
          : shortEntry(candle)
          ? 'Short Entry'
          : undefined;
        if (!entryCondition) continue;
        const coeff = entryCondition === 'Long Entry' ? 1 : -1;
        const entryPx = close;
        const qty =
          Math.min(
            this._getQuantity(this._symbol, entryPx),
            this._config.orderLimit,
          ) * coeff;
        const targetPx = target ? target(entryPx, coeff, candle) : undefined;
        const stopPx = stop ? stop(entryPx, coeff, candle) : undefined;
        this._enterPosition(timestamp, qty, entryPx, targetPx, stopPx);
      }
    }

    return this._trades;
  }

  public report(): {
    total: number;
    won: number;
    lost: number;
    winPercent: number;
    netPnl: string;
  } {
    let total = 0,
      won = 0,
      lost = 0,
      netPnl = 0;
    for (const trade of this._trades) {
      total++;
      if (trade.result === 'Won') {
        won++;
      } else {
        lost++;
      }
      netPnl += trade.pnl;
    }
    console.table({
      total,
      won,
      lost,
      winPercent: ((won / total) * 100).toFixed(2) + '%',
      netPnl,
    });
    return {
      total,
      won,
      lost,
      winPercent: won / total,
      netPnl: netPnl.toFixed(5),
    };
  }
}
