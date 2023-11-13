const request = require('supertest');
const chai = require('chai');
const app = require('../app');

const expect = chai.expect;

describe('Shorten URL API', () => {
  it('should return 400 for invalid URL', (done) => {
    request(app)
      .post('/shorten')
      .send({ longUrl: 'invalidurl' })
      .expect(400)
      .end((err, res) => {
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.have.property('message', 'Invalid url');
        done();
      });
  });

  it('should shorten a valid URL', (done) => {
    const validUrl = 'https://example.com';

    request(app)
      .post('/shorten')
      .send({ longUrl: validUrl })
      .expect(200)
      .end((err, res) => {
        expect(res.body).to.have.property('shortUrl').that.is.a('string');
        done();
      });
  });

  it('should redirect to the original URL', (done) => {
    const shortUrl = 'validshorturl';

    request(app)
      .get(`/${shortUrl}`)
      .expect(302) // 302 is the HTTP status code for redirection
      .end((err, res) => {
        done();
      });
  });

  it('should return 404 for an expired short URL', (done) => {
    const expiredShortUrl = 'expiredshorturl';

    request(app)
      .get(`/${expiredShortUrl}`)
      .expect(404)
      .end((err, res) => {
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.have.property('message', 'Not Found');
        done();
      });
  });
});
