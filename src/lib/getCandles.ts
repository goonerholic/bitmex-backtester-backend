import axios from 'axios';
import qs from 'qs';
import moment, { Moment } from 'moment-timezone';
import CandleModel from '../models/candles';

export default async function getHistoricalData(
  symbol: string,
  timeframe: string,
  start: Date,
) {
  const [prevCandle] = await CandleModel.find({ symbol })
    .sort({ timestamp: -1 })
    .limit(1);
  const startTime = prevCandle
    ? moment(prevCandle.timestamp).add(binSizeToMin(timeframe))
    : moment(start);
  const endTime = moment();
  const totalCandlesCount = Math.floor(
    endTime.diff(startTime, 'minutes') / binSizeToMin(timeframe),
  );

  console.log(`Candles to get: ${totalCandlesCount}`);

  const candles = [];

  const iterates = Math.ceil(totalCandlesCount / 750);
  const lastCount = totalCandlesCount % 750;

  for (let i = 0; i < iterates; i++) {
    await new Promise((res) => {
      setTimeout(() => {
        res('intentional delay to avoid request limit.');
      }, 1000);
    });

    const count = i < iterates - 1 ? 750 : lastCount;
    if (i > 0) endTime.subtract(binSizeToMin(timeframe) * 750, 'minute');

    try {
      const innerCandles = await getCandles({
        symbol,
        binSize: timeframe,
        endTime,
        count,
      });
      if (!innerCandles)
        return console.log('Failed to get candle data via API.');
      candles.push(...innerCandles);
      console.log(
        `[${innerCandles[innerCandles.length - 1].timestamp}] ~ [${
          innerCandles[0].timestamp
        }] data retrieved.`,
      );
    } catch (e) {
      console.error(e);
    }
  }
  try {
    await CandleModel.insertMany(candles);
    console.log('Data saved to database.');
    return;
  } catch (e) {
    console.error(e);
  }
}

async function getCandles({
  symbol,
  binSize,
  endTime,
  count,
}: {
  symbol: string;
  binSize: string;
  endTime: Moment;
  count: number;
}) {
  const baseUrl = 'https://www.bitmex.com/api/v1/trade/bucketed';

  const data = {
    symbol,
    binSize,
    endTime: endTime.toISOString(),
    reverse: true,
    columns: ['symbol', 'timestamp', 'open', 'high', 'low', 'close'],
    count,
  };
  const query = '?' + qs.stringify(data);
  const url = baseUrl + query;
  try {
    const result = await axios.get(url, {
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
    });
    return result.data;
  } catch (e) {
    console.log('Request Failed', e.response);
  }
}

function binSizeToMin(binSize: string): number {
  switch (binSize) {
    case '1m':
      return 1;
    case '5m':
      return 5;
    case '1h':
      return 60;
    case '1d':
      return 1440;
    default:
      throw new Error('Invalid bin size.');
  }
}
