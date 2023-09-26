import { type IPagination } from "my-types";

export const APP_VERSION = "0.2.0";

// 인덱스 경로
export const INDEX_ROUTE = "/dashboard";

// 인증 관련 상수 선언 모음
export const SESSION_KEY = "AIMENTO_REMIX_SESSION";

export const ACCESS_TOKEN = "AIMENTO_REMIX_ACCESS_TOKEN";

export const REFRESH_TOKEN = "AIMENTO_REMIX_REFRESH_TOKEN";

export const ACCESS_TOKEN_DURATION = {
  unit: "minutes",
  value: 15,
};

export const REFRESH_TOKEN_DURATION = {
  unit: "days",
  value: 30,
};

export const ACCOUNT_TOKEN_DURATION = {
  unit: "hours",
  value: 2,
};

export const ACCOUNT_BCRYPT_SALT = 10;

export const LOCAL_STORAGE_KEY_LOCALE = "AIMENTO_REMIX_LOCAL_STORAGE_LOCALE";
export const LOCAL_STORAGE_KEY_ROWS_PER_PAGE =
  "AIMENTO_REMIX_LOCAL_STORAGE_ROWS_PER_PAGE";

/**
 * Session의 유효기간을 초단위로 설정한다.
 * - 본 시스템은 접속할 때마다 Session을 갱신한다.
 * - 7일간 접속이 없으면 Session이 만료된다.
 */
export const SESSION_DURATION = 60 * 60 * 24 * 7;

export const JWT_SECRET = "aimento-remix-jwt-secret";

export const AI_SERVER_URL = "https://ai.aimento.com";
// export const AI_SERVER_URL = "http://192.168.10.39:5001";

export const PAGINATION_DEFAULT: IPagination = {
  count: 0,
  page: 1,
  rowsPerPage: 10,
  rowsPerPageOptions: [10, 25, 50, 100],
};
