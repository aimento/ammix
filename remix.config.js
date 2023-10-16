/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  // serverBuildPath: "build/index.js",
  browserNodeBuiltinsPolyfill: {
    modules: { crypto: true, fs: true, path: true },
    server: {
      // 업로드 파일 크기 제한을 늘리는 설정
      upload: {
        diskSize: 1024 * 1024 * 10, // 예: 10MB 크기로 설정
      },
    },
  },
};
