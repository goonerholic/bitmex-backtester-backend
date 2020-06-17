import mongoose, { Model } from 'mongoose';
import { CandleSchema, CandleModel } from '../types';

const candleSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true, unique: true },
  symbol: { type: String, required: true },
  open: { type: Number, required: true },
  high: { type: Number, required: true },
  low: { type: Number, required: true },
  close: { type: Number, required: true },
});

candleSchema.statics.findBySymbol = function ({
  symbol,
  dataOnly,
  start,
  end,
}: {
  symbol: string;
  dataOnly: boolean;
  start: string;
  end: string;
}) {
  if (!dataOnly)
    return this.find({
      symbol,
      timestamp: { $gte: new Date(start), $lte: new Date(end) },
    }).sort({ timestamp: 1 });
  return this.find({
    symbol,
    timestamp: { $gte: new Date(start), $lte: new Date(end) },
  })
    .select('-_id -__v')
    .sort({ timestamp: 1 })
    .lean();
};

const CandleModel = mongoose.model<CandleSchema, CandleModel>(
  'Candle',
  candleSchema,
);

export default CandleModel;
