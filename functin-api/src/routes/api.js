import Router from 'koa-router';
import { postUser, getMe, authorize, login, sendPwReset, reset, getCheckUnique, changePassword, getAvatarSignedUrl } from '../User-Controller';
import { postDoc, getDoc, getDocs, getSearchDoc, postCategory, getCategories, getCategory } from '../Doc-Controller';
import { postDocset, getDocsets, getDocset } from '../Docset-Controller';
import { postVersion, getVersions, getVersionById, getRecentRevisions } from '../Version-Controller';
import { postLanguage, getLanguages } from '../Language-Controller';
import { postExample, getExamples, getExampleById } from '../Example-Controller';
import { postThread, getThreads } from '../Thread-Controller';
import { postReply } from '../Reply-Controller';

export default () => {
  const router = new Router({
    prefix: '/v1'
  });

  /* User */
  router.post('/user/', postUser);
  router.post('/session', login);
  router.get('/user/me', authorize, getMe);
  router.post('/user/reset/:resetToken', reset);
  router.post('/user/reset', sendPwReset);
  router.get('/unique', getCheckUnique);
  router.post('/user/password', authorize, changePassword);
  router.get('/avatar', authorize, getAvatarSignedUrl);

  /* Category */
  router.post('/docset/:docset/category', authorize, postCategory);
  router.get('/docset/:docset/category', getCategories);
  router.get('/docset/:docset/category/:category', getCategory);
  router.get('/docset/:docset/category/:category/version', getVersions);
  router.post('/docset/:docset/category/:category/thread', authorize, postThread);
  router.get('/docset/:docset/category/:category/thread', getThreads);

  /* Doc */
  router.post('/docset/:docset/category/:category/doc', authorize, postDoc);
  router.get('/docset/:docset/category/:category/doc/:slug', getDoc);
  router.get('/docset/:docset/category/:category/doc', getDocs);

  /* Version */
  router.post('/docset/:docset/category/:category/doc/:doc/version', authorize, postVersion);
  router.post('/docset/:docset/category/:category/version', authorize, postVersion);
  router.get('/docset/:docset/category/:category/doc/:slug/version', getVersions);
  router.get('/docset/:docset/version/latest', getRecentRevisions);
  router.get('/version/:id', getVersionById);

  /* Docset */
  router.post('/docset/', authorize, postDocset);
  router.get('/docset', getDocsets);
  router.get('/docset/:docset', getDocset);

  /* Language */
  router.post('/language', authorize, postLanguage);
  router.get('/language', getLanguages);

  /* Example */
  router.post('/docset/:docset/category/:category/doc/:doc/example', authorize, postExample);
  router.get('/docset/:docset/category/:category/doc/:doc/example', getExamples);
  router.get('/example/:id', getExampleById);

  /* Comments */
  router.get('/docset/:docset/category/:category/doc/:doc/thread', getThreads);
  router.post('/docset/:docset/category/:category/doc/:doc/thread', authorize, postThread);
  router.post('/example/:example/thread', authorize, postThread);
  router.post('/version/:version/thread', authorize, postThread);
  router.get('/example/:example/thread', getThreads);
  router.get('/version/:version/thread', getThreads);
  router.post('/thread/:thread/reply', authorize, postReply);

  /* Search */
  router.get('/docset/:docset/search/:search', getSearchDoc);

  return router.routes();
};
