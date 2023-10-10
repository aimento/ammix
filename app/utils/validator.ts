import { json } from "@remix-run/node";

export const validateEmail = (email) => {

  if(!email) {
    const status = { status: "email is empty"}
    return status;
  }

  const validator = new RegExp(
    /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/
  ); // 대문자 및 소문자, 특수기호, 숫자 등으로 *****@**.** 의 양식이 맞는 지에 대한 검증

  if (!validator.test(email)) {
    const status = { status: "Invalid email", email: email }
    return status;
  }
};
