# 객체 구성

## 회원 계정 정보

```
id                  ObjectId            PK
username            String              아이디
auths               Array of Object     인증 정보 배열
  channel             String              로그인 채널: 'EMAIL'
  id                  String              채널키: 이메일주소
  secret              Object              비밀번호
    bcrypt              String              암호화된 비밀번호
    token               String              비밀번호 찾기에 사용되는 토큰
    expireAt            Date                토큰 유효기간
emails              Array of Object     이메일주소 객체 배열
  address             String              이메일주소
  verified            Boolean             인증 여부
  token               String              인증 토큰
  expireAt            Date                인증 토큰 유효기간
createdAt           Date                회원가입 일시
updatedAt           Date                최근 수정일시
```
