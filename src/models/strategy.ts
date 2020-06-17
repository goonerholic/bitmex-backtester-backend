import mongoose from 'mongoose';
import { StrategyQuery } from '../types';

const indicatorInputSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    indicator: { type: String, required: true },
    input: {
      period: { type: Number },
      fastPeriod: { type: Number },
      slowPeriod: { type: Number },
      signalPeriod: { type: Number },
      stdDev: { type: Number },
    },
  },
  {
    _id: false,
  },
);

const queryInput = new mongoose.Schema(
  {
    columnName: { type: String, required: true },
    index: Number,
    target: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    _id: false,
  },
);

const safetyQueryInput = new mongoose.Schema(
  {
    columnName: String,
    value: { type: Number, required: true },
  },
  {
    _id: false,
  },
);

const pureQueries = new mongoose.Schema(
  {
    crossover: queryInput,
    crossunder: queryInput,
    gt: queryInput,
    gte: queryInput,
    lt: queryInput,
    lte: queryInput,
  },
  {
    _id: false,
  },
);

const querySchema = new mongoose.Schema(pureQueries, { _id: false });
querySchema.add({
  or: { type: mongoose.Schema.Types.Mixed, default: undefined },
  and: { type: mongoose.Schema.Types.Mixed, default: undefined },
});

const safetyQuerySchema = new mongoose.Schema(
  {
    fixed: safetyQueryInput,
    percent: safetyQueryInput,
  },
  {
    _id: false,
  },
);

const strategySchema = new mongoose.Schema({
  name: { type: String, required: true },
  indicators: { type: [indicatorInputSchema], required: true },
  longEntry: { type: [querySchema], required: true },
  shortEntry: { type: [querySchema], required: true },
  longExit: { type: [querySchema], required: true },
  shortExit: { type: [querySchema], required: true },
  target: safetyQuerySchema,
  stop: safetyQuerySchema,
});

type StrategySchema = StrategyQuery & mongoose.Document;

const StrategyModel = mongoose.model<StrategySchema>(
  'Strategy',
  strategySchema,
);

export default StrategyModel;
