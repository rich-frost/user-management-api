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

describe('/POST Users', () => {

    beforeEach((done) => {
        User.deleteMany({}, (err) => {
            done();
        });
    });

    it('should POST a new user', (done) => {
        chai.request(serverUrl)
            .post('/api/v1/users')
            .send(baseUser)
            .end((err, res) => {
                res.should.have.status(200);
                const body = res.body;
                checkUserDetails(body, baseUser);
                done();
            });
    });

    it('should fail to save if no username provided', (done) => {
        const { email, password } = baseUser;
        const user = {
            email,
            password,
        };
        chai.request(serverUrl)
            .post('/api/v1/users')
            .send(user)
            .end((err, res) => {
                checkBadRequestResponse(res, 'User validation failed: username: Path `username` is required.');
                done();
            });
    });

    it('should fail to save if no email provided', (done) => {
        const { username, password } = baseUser;
        const user = {
            username,
            password,
        };
        chai.request(serverUrl)
            .post('/api/v1/users')
            .send(user)
            .end((err, res) => {
                checkBadRequestResponse(res, 'User validation failed: email: Path `email` is required.');
                done();
            });
    });

    it('should fail to save if email is not in correct format', (done) => {
        const { username, password } = baseUser;
        const user = {
            username,
            email: 'john.smith$wrong.com',
            password,
        };
        chai.request(serverUrl)
            .post('/api/v1/users')
            .send(user)
            .end((err, res) => {
                checkBadRequestResponse(res, 'Email is not valid format');
                done();
            });
    });

    it('should fail to save if no password provided', (done) => {
        const { email, username } = baseUser;
        const user = {
            email,
            username,
        };
        chai.request(serverUrl)
            .post('/api/v1/users')
            .send(user)
            .end((err, res) => {
                checkBadRequestResponse(res, 'User validation failed: password: Path `password` is required.');
                done();
            });
    });

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
