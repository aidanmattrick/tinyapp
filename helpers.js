

const findUserByEmail = function(email, users) {
  for (let userID in users) {
    if (users[userID].email === email) return users[userID];
  }
  return null;
};

module.exports = findUserByEmail;