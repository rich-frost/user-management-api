// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const User = require('../src/models/user');
const server = require('../src/index');

const should = chai.should();
const serverUrl = 'http://localhost:4010';

chai.use(chaiHttp);

const baseUser = {
    username: 'John Smith',
    email: 'john.smith@gmail.com',
    password: '123',
};

describe('/PATCH users', () => {

    beforeEach((done) => { // Before each test we empty the database
        User.deleteMany({}, (err) => {
            done();
        });
    });

    it('should PATCH an existing user', (done) => {
        createUser((err, user) => {
            const updatedUserInfo = {
                username: 'John B Smith',
                email: 'john.b.smith@gmail.com',
            };
            chai.request(serverUrl)
                .patch(`/api/v1/users/${user.id}`)
                .send(updatedUserInfo)
                .set('x-api-key', 'secretkey')
                .end((err, res) => {
                    res.should.have.status(200);
                    const body = res.body;
                    checkUserDetails(body, updatedUserInfo);
                    body.should.have.property('_id').eql(user.id);
                    body.should.have.property('updated_at').not.eql(user.updated_at);
                    done();
                });
        });
    });

    it('should PATCH just the email of an existing user', (done) => {
        createUser((err, user) => {
            const updatedUserInfo = {
                email: 'john.b.smith@gmail.com',
            };
            chai.request(serverUrl)
                .patch(`/api/v1/users/${user.id}`)
                .send(updatedUserInfo)
                .set('x-api-key', 'secretkey')
                .end((err, res) => {
                    res.should.have.status(200);
                    const body = res.body;

                    updatedUserInfo.username = 'John Smith';
                    checkUserDetails(body, updatedUserInfo);
                    body.should.have.property('_id').eql(user.id);
                    body.should.have.property('updated_at').not.eql(user.updated_at);
                    done();
                });
        });
    });

    it('should reject if email not valid', (done) => {
        createUser((err, user) => {
            const updatedUserInfo = {
                email: 'john.b.smith$wrong.com',
            };
            chai.request(serverUrl)
                .patch(`/api/v1/users/${user.id}`)
                .send(updatedUserInfo)
                .set('x-api-key', 'secretkey')
                .end((err, res) => {
                    checkBadRequestResponse(res, 'Email is not valid format');
                    done();
                });
        });
    });

    const apiKeyPatchRequest = (key, value, done) => {
        const { username } = baseUser;
        chai.request(serverUrl)
            .patch('/api/v1/users/123')
            .set(key, value)
            .send({ username })
            .end((err, res) => {
                checkErrorRequestResponse(res, 401, 'You are not authorized to patch user details');
                done();
            });
    };

    it('should reject if incorrect API key sent', (done) => {
        apiKeyPatchRequest('x-api-key', 'not-the-correct-key', done);
    });

    it('should reject if no API key sent', (done) => {
        apiKeyPatchRequest('no-key', 'no-value', done);
    });

    it('should reject if user ID is not valid UUID', (done) => {
        const { username } = baseUser;
        chai.request(serverUrl)
            .patch('/api/v1/users/123')
            .set('x-api-key', 'secretkey')
            .send({ username })
            .end((err, res) => {
                checkBadRequestResponse(res, 'User ID is not valid format');
                done();
            });
    });

    it('should error if user ID not found', (done) => {
        const id = '5b9fbdd2e99a954ac404b123';
        const { username } = baseUser;
        chai.request(serverUrl)
            .patch(`/api/v1/users/${id}`)
            .send({ username })
            .set('x-api-key', 'secretkey')
            .end((err, res) => {
                checkNotFoundRequestResponse(res, `User not found with ID: ${id}`);
                done();
            });
    });

    const createUser = (callback) => {
        const user = new User(baseUser);

        user.save(callback);
    };

    const checkNotFoundRequestResponse = (res, message) => {
        checkErrorRequestResponse(res, 404, message);
    };

    const checkBadRequestResponse = (res, message) => {
        checkErrorRequestResponse(res, 400, message);
    };

    const checkErrorRequestResponse = (res, statusCode, message) => {
        res.should.have.status(statusCode);
        const body = res.body;
        body.should.have.property('error');
        body.should.have.property('message');
        body.message.should.equal(message);
    };

    const checkUserDetails = (resp, user) => {
        resp.should.be.a('object');
        resp.should.have.property('username').eql(user.username);
        resp.should.have.property('email').eql(user.email);
        resp.should.not.have.property('password');
        resp.should.have.property('created_at');
        resp.should.have.property('updated_at');
    };
});
