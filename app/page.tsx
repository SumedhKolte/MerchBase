import { redirect } from "next/navigation";

/** The dashboard is the app's home; `proxy.ts` sends signed-out users to /login. */
export default function Home() {
  redirect("/products");
}
