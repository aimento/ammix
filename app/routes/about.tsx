import { LoaderFunction } from "@remix-run/react";

export let loader: LoaderFunction = async () => {
  return {};
};

export default function About() {
  return <div>about 페이지 입니다</div>;
}
