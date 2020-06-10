import { Isymbol, StrategyInput, Trade, ConfigInput } from '../../types';
import CandleModel from '../../models/candles';
import { DataFrame } from '../../lib/dataFrame';
import { Backtester } from '../../lib/backTester';
import { conditionParser, safetyParser } from '../../lib/strategy';

export async function runTest(
  symbol: Isymbol,
  start: string,
  end: string,
  strategy: StrategyInput,
  config: ConfigInput,
) {
  const {
    indicators,
    longEntry,
    shortEntry,
    longExit,
    shortExit,
    target,
    stop,
  } = strategy;
  const candles = await CandleModel.findBySymbol({
    symbol,
    dataOnly: true,
    start,
    end,
  });
  const df = new DataFrame(candles);
  indicators.forEach((indicator) => df.addIndicator(indicator));
  df.trunc();
  df.head(10);
  df.tail(10);
  //console.log(target, stop)

  // converter.json2csv([...df].map(candle => ({...candle, timestamp: new Date(candle.timestamp).toISOString(), history: 0})), (err, csv) => {
  //   if (err) throw err
  //   fs.writeFileSync('./ohlc.csv', csv)
  // })
  const tick = symbol === 'XBTUSD' ? 0.5 : 0.05;

  const parsedStrategy = {
    longEntry: conditionParser(longEntry),
    shortEntry: conditionParser(shortEntry),
    longExit: conditionParser(longExit),
    shortExit: conditionParser(shortExit),
    target: target ? safetyParser(target, 'target', tick) : undefined,
    stop: target ? safetyParser(stop, 'stop', tick) : undefined,
  };

  const backTester = new Backtester({
    symbol,
    data: df,
    strategy: parsedStrategy,
  });
  backTester.setConfig(config);
  return backTester.run();
}

export function reportResult(trades: Trade[]) {
  let totalTrades = 0;
  let won = 0;
  let lost = 0;
  let grossWonPnl = 0;
  let grossLostPnl = 0;
  let MDD = 0;

  trades.forEach((trade) => {
    totalTrades++;
    if (trade.pnl > 0) {
      won++;
      grossWonPnl += trade.pnl;
    } else {
      lost++;
      grossLostPnl += trade.pnl;
    }
    MDD = trade.drawdown < MDD ? trade.drawdown : MDD;
  });
  return {
    totalTrades,
    won,
    lost,
    netPnl: grossWonPnl + grossLostPnl,
    grossWonPnl,
    grossLostPnl,
    avgWonPnl: grossWonPnl / won,
    avgLostPnl: grossLostPnl / lost,
    MDD,
    balance: trades[trades.length - 1].balance,
  };
}
