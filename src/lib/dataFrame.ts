import { CandleDataFrame, Candle, StrategyIndicator } from '../types';
import { Indicators } from './indicators';

// [DataFrame Class]
// Create DataFrame object
// Convert Candle[] type to CandleDataFrame

export class DataFrame {
  _data: CandleDataFrame;
  indicators: Indicators;
  constructor(data: Candle[]) {
    this._data = {
      timestamp: [],
      open: [],
      high: [],
      low: [],
      close: [],
    };

    const df = this._data;
    for (const d of data) {
      df.timestamp.push(d.timestamp);
      df.open.push(d.open);
      df.high.push(d.high);
      df.low.push(d.low);
      df.close.push(d.close);
    }
    this.indicators = new Indicators(this);
  }

  /**
   * add series to dataFrame.
   * requires a column name and the series(Number[])
   * @param columnName String
   * @param inputSeries (Number | undefined)[]
   */
  public addColumn(columnName: string, inputSeries: (number | undefined)[]) {
    this._data[columnName] = inputSeries;
  }

  /**
   * get an array out of dataFrame column
   * @param columnName String
   */
  public toArray(columnName: string) {
    if (!this._data[columnName]) {
      throw new Error('Invalid column name.');
    }
    return this._data[columnName];
  }

  /**
   * remove a column from dataFrame object
   * @param columnName
   */
  public drop(columnName: string) {
    if (!this._data[columnName]) {
      throw new Error('Invalid column name.');
    }
    delete this._data[columnName];
  }

  /**
   * print given amount of first rows from dataFrame
   * @param rows
   */
  public head(rows: number) {
    const data = [...this].slice(0, rows);
    console.table(data);
  }

  /**
   * print given amount of last rows from dataFrame
   * @param rows
   */
  public tail(rows: number) {
    const data = [...this].slice(-rows);
    console.table(data);
  }

  /**
   * calculate technical indicator and add to dataFrame object as a column
   * sma, ema, rsi, macd, bollinger bands, atr supported
   * @param option
   */
  public addIndicator(option: StrategyIndicator) {
    //console.log(option)
    if (option.indicator === 'macd') {
      const macd = this.indicators.macd(option.input);
      this.addColumn(option.name + ':MACD', macd.macd);
      this.addColumn(option.name + ':signal', macd.signal);
      this.addColumn(option.name + ':histogram', macd.histogram);
    } else if (option.indicator === 'bb') {
      const bb = this.indicators.bb(option.input);
      this.addColumn(option.name + ':upper', bb.upper);
      this.addColumn(option.name + ':middle', bb.middle);
      this.addColumn(option.name + ':lower', bb.lower);
      this.addColumn(option.name + ':pb', bb.pb);
    } else {
      this.addColumn(
        option.name,
        this.indicators[option.indicator](option.input),
      );
    }
  }

  /**
   * Truncate rows which is containing null or undefined value from dataFrame
   */
  public trunc() {
    let index = 0;
    let target = 0;

    for (const data of this) {
      for (const column in data) {
        if (!data[column]) {
          target = index;
          break;
        }
      }
      index++;
    }
    for (const columnName in this._data) {
      this._data[columnName].splice(0, target + 1);
    }
  }

  // Iterator
  // Every iteration, convert each dataFrame row to Candle type object and return it
  *[Symbol.iterator]() {
    const data = this._data;
    let index = 0;
    while (index < data.timestamp.length) {
      const current: any = {};
      for (const key in data) {
        current[key] = data[key][index];
      }

      // method to get historical data from that moment
      // ie, can access data of 10 pervious candle, just call the method like this
      // for (let candle of dataFrame) {
      //   const previousClose = candle.history({columnName: 'close', count: 2)[1]
      // }
      current.history = ({
        columnName,
        count,
      }: {
        columnName: string;
        count: number;
      }) => {
        if (!data[columnName]) {
          throw new Error(
            `Cannot get historical data. No column named ${columnName} in dataFrame instance.`,
          );
        }
        return data[columnName]
          .slice(index - count < 0 ? 0 : index - count, index + 1)
          .reverse();
      };
      yield current;
      index++;
    }
  }
}
