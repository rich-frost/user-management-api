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

describe('/DELETE user', () => {
    beforeEach((done) => { // Before each test we empty the database
        User.deleteMany({}, (err) => {
            done();
        });
    });

    it('should DELETE an existing user', (done) => {
        createUser((err, user) => {
            chai.request(serverUrl)
                .delete(`/api/v1/users/${user.id}`)
                .set('x-api-key', 'secretkey')
                .end((err, res) => {
                    res.should.have.status(200);
                    const body = res.body;
                    body.should.have.property('message').eql(`Deleted user ${user.id}`);
                    done();
                });
        });
    });

    const apiKeyDeleteRequest = (key, value, done) => {
        chai.request(serverUrl)
            .delete('/api/v1/users/123')
            .set(key, value)
            .end((err, res) => {
                checkErrorRequestResponse(res, 401, 'You are not authorized to delete a user');
                done();
            });
    };

    it('should reject if incorrect API key sent', (done) => {
        apiKeyDeleteRequest('x-api-key', 'not-the-correct-key', done);
    });

    it('should reject if no API key sent', (done) => {
        apiKeyDeleteRequest('no-key', '', done);
    });

    it('should reject with a 400 error if user ID is not valid UUID', (done) => {
        chai.request(serverUrl)
            .delete('/api/v1/users/123')
            .set('x-api-key', 'secretkey')
            .end((err, res) => {
                checkBadRequestResponse(res, 'User ID is not valid format');
                done();
            });
    });

    it('should return a 404 error if user ID not found', (done) => {
        const id = '5b9fbdd2e99a954ac404b123';

        chai.request(serverUrl)
            .delete(`/api/v1/users/${id}`)
            .set('x-api-key', 'secretkey')
            .end((err, res) => {
                checkNotFoundRequestResponse(res, `User ID ${id} not found`);
                done();
            });
    });

    /*
    * Test the /DELETE All route
    */
    describe('/DELETE all users', () => {
        it('should DELETE all users', (done) => {
            chai.request(serverUrl)
                .delete('/api/v1/remove-all-users')
                .set('x-api-key', 'supersecretkey')
                .end((err, res) => {
                    res.should.have.status(200);
                    const body = res.body;
                    body.should.have.property('message').eql('Deleted all users');
                    done();
                });
        });

        const apiKeyDeleteAllRequest = (key, value, done) => {
            chai.request(serverUrl)
                .delete('/api/v1/remove-all-users')
                .set(key, value)
                .end((err, res) => {
                    checkErrorRequestResponse(res, 401, 'You are not authorized to delete users');
                    done();
                });
        };

        it('should reject if incorrect API key sent', (done) => {
            apiKeyDeleteAllRequest('x-api-key', 'not-the-correct-key', done);
        });

        it('should reject if no API key sent', (done) => {
            apiKeyDeleteAllRequest('no-key', '', done);
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
});
