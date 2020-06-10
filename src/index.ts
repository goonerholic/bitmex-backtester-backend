import loaderInit from './loaders';
import express from 'express';
(async function main() {
  const app = express();
  await loaderInit(app);
})();
