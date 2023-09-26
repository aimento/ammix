const validateEmail = (email) => {
    const validator = new RegExp(
      /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/
    );
  
    if (!validator.test(email)) {
      const err = new Error("Invalid email");
      err.statusCode = 400;
      throw err;
    }
  };
  
  module.exports = {
    validateEmail,
  };