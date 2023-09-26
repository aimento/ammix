const { User } = require("../models/users.schema");
const { validateEmail } = require("../utils/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSignUp = async (email, password, username) => {
  validateEmail(email);

  const [user] = await User.find({ "auths.id": `${email}` });
  console.log(user);

  if (user) {
    const err = new Error("duplicated email");
    err.statusCode = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const findUser = User.find({ "auths.id": `${email}` }, { email: `${email}` });
  const loginToken = jwt.sign(`${findUser}`, process.env.JWT_SECRET);

  await User.create({
    username: `${username}`,
    auths: {
      channel: "EMAIL",
      id: `${email}`,
      secret: {
        bcrypt: `${hashedPassword}`,
      },
    },
    emails: [
      {
        address: `${email}`,
      },
    ],
    loginToken: `${loginToken}`,
  });

  const signIn = await User.findOne({}, { loginToken: `${loginToken}` });

  console.log(signIn);

  //   const { loginToken } = signIn;

  return signIn;
};

module.exports = { userSignUp };
