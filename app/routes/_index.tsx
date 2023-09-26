import { LoaderFunction } from "@remix-run/react";
import { redirect } from "@remix-run/node";

export let loader: LoaderFunction = async () => {
  return redirect("/home");
};

export default function Index() {
  return null;
}
