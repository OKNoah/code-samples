import koa from 'koa';
import routes from './src/routes/routes';
import apiRoutes from './src/routes/api';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';

const app = koa();

const options = {
  origin: true,
  headers: ['Content-Type', 'Authorization', 'Accept-Language'],
  methods: ['POST', 'PUT', 'GET', 'DELETE']
};

app.proxy = true;
app.use(cors(options));
app.use(bodyParser());
app.use(routes());
app.use(apiRoutes());

app.listen(process.env.PORT, () => {
  console.log('Running on port ' + process.env.PORT);
});
