const userService = require("../services/user.service");
const { catchAsync } = require("../utils/error");

const signUp = catchAsync(async (req, res) => {
  const { email, password, username } = req.body;
  const accessToken = await userService.userSignUp(email, password, username);

  res.status(200).json({ accessToken: accessToken });
});

module.exports = { signUp };
