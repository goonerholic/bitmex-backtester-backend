import { Application } from 'express';
import mongoLoader from './mongodb';
import serverLoader from './server';
import { config } from '../config';
import getHistoricalData from '../lib/getCandles';

const { url } = config.db;

export default async function loaderInit(app: Application) {
  if (!url) return console.log('Invalid Mongo URI');
  await mongoLoader(url);
  serverLoader(app);
  await getHistoricalData('XBTUSD', '5m', new Date('2018-01-01 00:00:00'));
  //await getHistoricalData('ETHUSD', '5m', new Date('2018-09-01'));
}
