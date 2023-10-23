/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  routes(defineRoutes) {
    return defineRoutes((route) => {
      // postId를 동적 파라미터로 사용하여 라우팅 설정
      route(":postId", "routes/_p.[postId]/route.tsx");
      // route("_auth.sign-up", "routes/_auth.sign-up/route.tsx");
      // route(
      //   "_auth.sign-up/agreement",
      //   "routes/_auth.sign-up/agreement/route.tsx"
      // );
      // route(
      //   "_auth.sign-up/basic-info",
      //   "routes/_auth.sign-up/basic-info/route.tsx"
      // );
      // route(
      //   "_auth.sign-up/extra-info",
      //   "routes/_auth.sign-up/extra-info/route.tsx"
      // );
      // route("sign-up/agreement", "routes/_auth.sign-up/agreement/route.tsx");
    });
  },
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
