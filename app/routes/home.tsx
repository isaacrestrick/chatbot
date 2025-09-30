import type { Route } from "./+types/home";
import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import SignOut from '../ui_components/SignOut'
export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { auth } = await import("../lib/auth.server");
  const session = await auth.api.getSession({ headers: request.headers })
  if (session?.user) {
    return { user: session.user }
  } else {
    throw redirect("/signin")
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const { auth } = await import("../lib/auth.server");
  const session = await auth.api.getSession({ headers: request.headers })
  if (session?.user) {
    return auth.handler(request)
  } else {
    throw redirect("/signin")
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
    return <div><h1>Hello, {loaderData.user.email}!</h1><SignOut/></div>
 }