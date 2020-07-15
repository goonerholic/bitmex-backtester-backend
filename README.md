# bitmex-backtester-backend
bitmex backtester backend

## Before start
1. Install mongodb.
2. Using environment variable, pass mongo connection string.

## DataFrame
- DataFrame object to store series of candle data, technical indicators
- Import candle data from Json: Instanciate DataFrame with candle data

```
interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number
}

const candle: Candle[] = [{...}, ...];

const dataFrame = new DataFrame(Candle[]);
```
- To add indicator to data frame, use `addIndicator` method.
```
const indicatorOption = {
  name: 'sma20', //user-defined name for an indicator
  indicator: 'sma',
  input: {
    period: 20
  }
}

dataFrame.addIndicator(indicatorOption)
```
- strategy query should look like this
```
const myStrategy  = {
  name: 'my-strategy'
  indicators: [
    {
      name: 'sma20',
      indicator: 'sma',
      input: {
        period: 20
      }
    },
    {
      ...
    }
  ],
  longEntry: [
    {
      crossover: {
        columnName: 'sma20',
        target: 'close' // target can be fixed value or columnName of dataFrame
      },
    },
    {
      lt: {
        columnName: 'close',
        index: 0 // if you need a previous value of 'close' array, set index greater than 0
        target: 8000
      }
    },
  ],
  shortEntry: [
    /// short entry conditions
  ],
  longExit: [ long exit conditions],
  shortExit: [ short exit conditions],
  target: [ target conditions ],
  stop: [ stop conditions ]  
}
```
- Each entry condition is an array of condition query object
  - key of each condition query is one of these: 'crossover', 'crossunder', 'lg', 'lge', 'gt', 'gte'


## Supported Technical Indicators
- SMA, EMA
- RSI
- MACD
- Bollinger Bands
- ATR
