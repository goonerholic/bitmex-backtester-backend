import { Application } from 'express';
import StrategyModel from './../../models/strategy';
import express from 'express';

export async function saveStrategy(
  req: express.Request,
  res: express.Response,
) {
  try {
    const { name } = req.body;
    const exist = await StrategyModel.findOne({ name });
    if (exist) {
      res.status(409).send('Strategy name already exists.');
    }
    const result = await StrategyModel.create(req.body);
    res.status(200).send(result);
  } catch (e) {
    res.status(500).send('Server Error.');
    console.error(e);
  }
}

export async function listStrategy(
  req: express.Request,
  res: express.Response,
) {
  try {
    const strategies = await StrategyModel.find({});
    res.status(200).send(strategies);
  } catch (e) {
    res.status(500).send(e);
  }
}

export async function findStrategy(
  req: express.Request,
  res: express.Response,
) {
  const { name } = req.params;
  try {
    const strategy = await StrategyModel.findOne({ name });
    res.status(200).send(strategy);
  } catch (e) {
    res.status(500).send(e);
  }
}

export async function updateStrategy(
  req: express.Request,
  res: express.Response,
) {
  const { name } = req.params;
  console.log(req.body);
  try {
    const strategy = await StrategyModel.findOneAndUpdate({ name }, req.body, {
      new: true,
    });
    console.log(strategy);
    res.status(200).send(strategy);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
}
