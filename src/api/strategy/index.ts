import { Router } from 'express';
import {
  saveStrategy,
  listStrategy,
  findStrategy,
  updateStrategy,
} from './controller';

const strategy = Router();

strategy.post('/', saveStrategy);
strategy.get('/', listStrategy);
strategy.get('/:name', findStrategy);
strategy.put('/:name', updateStrategy);

export default strategy;
