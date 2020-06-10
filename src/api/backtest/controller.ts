import express from 'express';
import { runTest, reportResult } from '../../services/backtest';
import StrategyModel from '../../models/strategy';
import { jsonToCsv } from './../../lib/json2csv';

export async function run(req: express.Request, res: express.Response) {
  const { symbol, start, end, strategyName, config } = req.body;
  console.log(symbol, start, end, strategyName);
  try {
    const [strategy] = await StrategyModel.find({ name: strategyName }).lean();
    if (!strategy) {
      res.status(400).send(`Strategy name ${strategyName} not found.`);
      return;
    }
    const trades = await runTest(symbol, start, end, strategy, config);
    jsonToCsv(trades);
    const testResult = reportResult(trades);
    res.status(200).send([testResult, trades]);
  } catch (e) {
    res.status(500).send(e);
    console.log(e);
  }
}
