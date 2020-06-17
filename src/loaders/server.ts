import bodyParser from 'body-parser';
import api from '../api';
import { Application } from 'express';
import { config } from '../config';

const { port } = config;

export default function serverLoader(app: Application) {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/api', api);

  app.listen(port, () => {
    console.log('Server initialized.');
  });
  return app;
}
