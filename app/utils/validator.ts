export const validateEmail = (email) => {

  if(!email) {
    const status = { status: 0 }
    return status;
  }

  const validator = new RegExp(
    /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/
  ); // 대문자 및 소문자, 특수기호, 숫자 등으로 *****@**.** 의 양식이 맞는 지에 대한 검증

  if (!validator.test(email)) {
    const status = { status: 1, email: email }
    return status;
  }

  return true;
};

export const validateUserName = (username) => {
  if(!username){
    const status = { status: 1 }
    return status;
  }
  return true;
}

export const validateValue = (value1, value2) => {
  if(!value1){
    const status = { status: `${value2} is empty`}
    return status;
  }
  return true;
}

export const validatePassword = (password) => {
  if(!password){
    const status = { status: 2 }
    return status;
  }

  return true;
}