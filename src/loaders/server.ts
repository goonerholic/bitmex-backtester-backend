import bodyParser from 'body-parser';
import api from '../api';
import { Application } from 'express';

export default function serverLoader(app: Application) {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/api', api);

  app.listen(3000, () => {
    console.log('Server initialized.');
  });
  return app;
}
