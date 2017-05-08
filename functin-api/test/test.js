require('dotenv').load();

import { expect } from 'chai';
import request from 'superagent';
import { isArray } from 'lodash';
// import Markov from 'markovchain-generate';
import marklar from 'marklar';
import crypto from 'crypto';

const { TEST_URL } = process.env;

marklar.nameList.buzzwords = ['dropbox', 'microsoft', 'apple', 'cloud', 'synergy', 'disruption', 'python', 'django', 'storify', 'angel', 'coinbase', 'paypal'];

const name = 'apitester' + crypto.randomBytes(4).toString('hex');
const email = name + '@funct.in';
const password = crypto.randomBytes(4).toString('hex');
const newPassword = password + 'new';
const docsetName = marklar.getName('buzzwords');

let authToken;
let newVersionId;
let newThreadId;

describe('User', () => {
  describe('POST /user', () => {
    it('should return 201', (done) => {
      request
        .post(TEST_URL + '/user')
        .send({
          email,
          username: name,
          password
        })
        .set('Content-Type', 'application/json; charset=utf-8')
        .redirects(0)
        .end((err, res) => {
          if (err) console.log(err);
          expect(res.status).to.equal(201);
          authToken = res.body.data.authToken;
          done();
        });
    });
  });

  describe('GET /user/me', () => {
    it('should return user credentials', (done) => {
      request
        .get(TEST_URL + '/user/me')
        .set('Authorization', authToken)
        .redirects(0)
        .end((err, res) => {
          expect(res.body.username).to.equal(name);
          done();
        });
    });
  });

  describe('POST /user/password', () => {
    it('should change the password', (done) => {
      request
        .post(TEST_URL + '/user/password')
        .send({
          oldPassword: password,
          newPassword
        })
        .set('Authorization', authToken)
        .set('Content-Type', 'application/json; charset=utf-8')
        .redirects(0)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          done();
        });
    });
  });

  describe('POST /session', () => {
    it('should sign the user in', (done) => {
      request
      .post(TEST_URL + '/session')
      .send({
        email,
        password
      })
      .set('Content-Type', 'application/json; charset=utf-8')
      .redirects(0)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
    });
  });
});

describe('Docsets', () => {
  describe('POST /docset', () => {
    it('should return 200', (done) => {
      request
      .post(TEST_URL + '/docset/')
      .send({
        name: docsetName,
        slug: docsetName,
        logo: '/assets/python2-logo.png'
      })
      .set('Authorization', authToken)
      .set('Content-Type', 'application/json; charset=utf-8')
      .redirects(0)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
    });
  });

  describe('GET /docset', () => {
    it('should return an array', (done) => {
      request
      .get(TEST_URL + '/docset')
      .redirects(0)
      .end((err, res) => {
        expect(isArray(res.body.data)).to.equal(true);
        done();
      });
    });
  });

  describe(`GET /docset/${docsetName}`, () => {
    it('should return status of 200', (done) => {
      request
      .get(`${TEST_URL}/docset/${docsetName}`)
      .redirects(0)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
    });
  });
});

describe('Category', () => {
  describe(`POST /docset/${docsetName}/category`, () => {
    it('should return a status of 200', (done) => {
      request
        .post(TEST_URL + `/docset/${docsetName}/category`)
        .send({
          slug: 'Test'
        })
        .set('Accept-Language', 'en')
        .set('Authorization', authToken)
        .set('Content-Type', 'application/json; charset=utf-8')
        .redirects(0)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          done();
        });
    });
  });

  describe(`GET /docset/${docsetName}/category`, () => {
    it('should return status of 200', (done) => {
      request
      .get(TEST_URL + `/docset/${docsetName}/category`)
      .set('Accept-Language', 'en')
      .redirects(0)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
    });
  });
});

describe('Doc', () => {
  describe(`POST /docset/${docsetName}/category/Test/doc` , () => {
    it('should return a status of 200', (done) => {
      request
      .post(TEST_URL + `/docset/${docsetName}/category/Test/doc`)
      .send({
        slug: 'TestFunction',
        description: 'delete this',
        body: {
          arguments: [
            {
              name: 'fd',
              optional: false,
              type: []
            },
            {
              optional: true,
              type: []
            }
          ]
        }
      })
      .set('Accept-Language', 'EN')
      .set('Authorization', authToken)
      .set('Content-Type', 'application/json; charset=utf-8')
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
    });
  });

describe(`POST /docset/${docsetName}/category/Test/doc (with parent)` , () => {
    it('should return a status of 200', (done) => {
      request
      .post(TEST_URL + `/docset/${docsetName}/category/Test/doc`)
      .send({
        slug: 'TestFunction.Instance.prototype',
        description: 'delete this',
        body: {
          arguments: [
            {
              name: 'fd',
              optional: false,
              type: []
            },
            {
              optional: true,
              type: []
            }
          ]
        }
      })
      .set('Accept-Language', 'EN')
      .set('Authorization', authToken)
      .set('Content-Type', 'application/json; charset=utf-8')
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
    });
  });

  describe(`GET /docset/${docsetName}/category/Test/doc/TestFunction`, () => {
    it('should return a status of 200', (done) => {
      request
      .get(TEST_URL + `/docset/${docsetName}/category/Test/doc/TestFunction`)
      .set('Accept-Language', 'En')
      .redirects(0)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
    });
  });

  describe(`GET /docset/${docsetName}/category/Test/doc`, () => {
    it('should return a status of 200', (done) => {
      request
      .get(TEST_URL + `/docset/${docsetName}/category/Test/doc`)
      .set('Accept-Language', 'EN')
      .redirects(0)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
    });
  });

  describe(`GET /docset/${docsetName}/search/test`, () => {
    it('should return a status of 200', (done) => {
      request
      .get(TEST_URL + `/docset/${docsetName}/search/My`)
      .redirects(0)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
    });
  });
});

describe('Versions', () => {
  describe(`POST /docset/${docsetName}/category/Test/doc/TestFunction/version`, () => {
    it('should return status of 200', (done) => {
      request
      .post(TEST_URL + `/docset/${docsetName}/category/Test/doc/TestFunction/version`)
      .send({
        body: {
          name: 'Ellipsis',
          arguments: [{
            name: 'x',
            optional: false,
            type: []
          }],
          description: 'Return the absolute value of a number. The argument may be a plain or long integer or a floating point number. If the argument is a complex number, its magnitude is returned. 100 jiggaawtts.'
        }
      })
      .set('Accept-Language', 'en')
      .set('Authorization', authToken)
      .set('Content-Type', 'application/json; charset=utf-8')
      .end((err, res) => {
        expect(res.status).to.equal(200);
        newVersionId = res.body.data.id;
        done();
      });
    });
  });

  describe(`GET /docset/${docsetName}/category/Test/doc/TestFunction/version`, () => {
    it('should return a status of 200', (done) => {
      request
      .get(TEST_URL + `/docset/${docsetName}/category/Test/doc/MyExceptions/version`)
      .set('Accept-Language', 'EN')
      .query({ entries: 10 })
      .query({ page: 1 })
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
    });
  });

  describe(`GET /version/${newVersionId}`, () => {
    it('should return a status of 200', (done) => {
      request
      .get(`${TEST_URL}/version/${newVersionId}`)
      .redirects(0)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
    });
  });

  describe(`GET /docset/${docsetName}/version/latest`, () => {
    it('should return a status of 200', (done) => {
      request
      .get(TEST_URL + `/docset/${docsetName}/version/latest`)
      .set('Accept-Language', 'EN')
      .redirects(0)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
    });
  });
});

describe('Examples', () => {
  let newExampleId;

  describe(`POST /docset/${docsetName}/category/Test/doc/TestFunction/example`, () => {
    it('should return the status of 200', (done) => {
      request
      .post(TEST_URL + `/docset/${docsetName}/category/Test/doc/TestFunction/example`)
      .send({
        title: 'Compare arm and leg',
        body: 'Compare strings arm and leg.\\n\\n    cmp( \"arm\", \"leg\" )'
      })
      .set('Accept-Language', 'EN')
      .set('Authorization', authToken)
      .set('Content-Type', 'application/json; charset=utf-8')
      .redirects(0)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
    });
  });

  describe(`GET /docset/${docsetName}/category/Test/doc/TestFunction/example`, () => {
    it('should return a status of 200', (done) => {
      request
      .get(TEST_URL + `/docset/${docsetName}/category/Test/doc/TestFunction/example`)
      .set('Accept-Language', 'en')
      .end((err, res) => {
        expect(res.status).to.equal(200);
        newExampleId = res.body.data[0].id;
        done();
      });
    });
  });

  describe(`GET /example/${newExampleId}`, () => {
    it('should return status of 200', (done) => {
      request
      .get(TEST_URL + `/example/${newExampleId}`)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
    });
  });
});

describe('Comments', () => {
  describe(`POST /docset/${docsetName}/category/Test/doc/TestFunction/thread`, () => {
    it('should return a status of 200', (done) => {
      request
      .post(`${TEST_URL}/docset/${docsetName}/category/Test/doc/TestFunction/thread`)
      .send({
        body: 'What a nice thread!'
      })
      .set('Accept-Language', 'en')
      .set('Authorization', authToken)
      .set('Content-Type', 'application/json; charset=utf-8')
      .end((err, res) => {
        expect(res.status).to.equal(200);
        newThreadId = res.body.data.id;
        done();
      });
    });
  });

  describe(`GET /docset/${docsetName}/category/Test/doc/TestFunction/thread`, () => {
    it('should return a status of 200', (done) => {
      request
      .get(`${TEST_URL}/docset/${docsetName}/category/Test/doc/MyExceptions/thread`)
      .set('Accept-Language', 'en')
      .redirects(0)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
    });
  });

  describe(`POST /thread/${newThreadId}`, () => {
    it('should return status of 200', (done) => {
      request
      .post(`${TEST_URL}/thread/${newThreadId}/reply`)
      .send({
        parent: "4",
        body: "This is the best reply i got!"
      })
      .set('Authorization', authToken)
      .set('Content-Type', 'application/json; charset=utf-8')
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
    });
  });
});
