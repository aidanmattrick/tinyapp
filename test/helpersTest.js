const { assert } = require('chai');
const findUserByEmail = require('../helpers');

//const { getUserByEmail } = require('../helpers.js');

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", users);
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  });
  it('should return null given a non-existent email', function() {
    const user = findUserByEmail("NOTHERE@example.com", users);
    const expectedOutput = null;
    console.log(user);
    assert.equal(user, expectedOutput);
  });
});
