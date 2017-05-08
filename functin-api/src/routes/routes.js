import Router from 'koa-router';

export default () => {
  const router = new Router({
    prefix: '/'
  });

  /*
    Returns a 200 response so CodeShip will know it deployed properly.
  */
  router.get('/', function * homePage () {
    this.status = 200;
  });

  return router.routes();
};
