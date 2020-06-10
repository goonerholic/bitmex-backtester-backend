import { Router } from 'express';
import { run } from './controller';

const backtest = Router();

backtest.post('/', run);

export default backtest;
