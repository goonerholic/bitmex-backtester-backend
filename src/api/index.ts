import { Router } from 'express';
import backtest from './backtest';
import strategy from './strategy';

const api = Router();

api.use('/backtest', backtest);
api.use('/strategy', strategy);

export default api;
