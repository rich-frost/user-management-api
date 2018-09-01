const expect = require("chai").expect;
const prepare = require("mocha-prepare");
const mongoUnit = require("mongo-unit");
const UserController = require("../src/controllers/user-controller");
const testMongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/Test4";

describe("UserController", () => {
  const testData = require("./fixtures/users.json");

  before(() => mongoUnit.start()
    .then(()=>mongoUnit.load(testData)))

  after(() => mongoUnit.drop())

  it("should find all users", () => {
    return UserController.find().then(users => {
      expect(users.length).to.equal(2);
      expect(users[0].username).to.equal("rich");
    });
  });
/*
  it("should create new user", () => {
    return UserController
      .addTask({ name: "next", completed: false })
      .then(user => {
        expect(user.name).to.equal("next");
        expect(user.completed).to.equal(false);
      })
      .then(() => UserController.getTasks())
      .then(users => {
        expect(users.length).to.equal(2);
        expect(users[1].name).to.equal("next");
      });
  });

  it("should remove user", () => {
    return UserController
      .getTasks()
      .then(users => users[0]._id)
      .then(userId => UserController.deleteTask(userId))
      .then(() => UserController.getTasks())
      .then(users => {
        expect(users.length).to.equal(0);
      });
  });*/
});
