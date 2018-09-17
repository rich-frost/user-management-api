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

describe('/GET users', () => {

    beforeEach((done) => { // Before each test we empty the database
        User.deleteMany({}, (err) => {
            done();
        });
    });

    it('should GET all the users', (done) => {
        chai.request(serverUrl)
            .get('/api/v1/users')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(0);
                done();
            });
    });

    /*
    * Test the /GET/:id route
    */
    describe('/GET/:id user', () => {
        it('should GET a user by the given id', (done) => {
            const user = new User(baseUser);

            user.save((err, user) => {
                chai.request(serverUrl)
                    .get(`/api/v1/users/${user.id}`)
                    .end((err, res) => {
                        res.should.have.status(200);
                        const body = res.body;
                        checkUserDetails(body, user);
                        body.should.have.property('_id').eql(user.id);
                        done();
                    });
            });
        });

        it('should error if user ID not valid UUID', (done) => {
            chai.request(serverUrl)
                .get('/api/v1/users/123456789')
                .end((err, res) => {
                    checkBadRequestResponse(res, 'User ID is not valid format');
                    done();
                });
        });

        it('should error if user ID not found', (done) => {
            chai.request(serverUrl)
                .get('/api/v1/users/5b9fbdd2e99a954ac404b123')
                .end((err, res) => {
                    checkNotFoundRequestResponse(res, 'User not found');
                    done();
                });
        });
    });

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
