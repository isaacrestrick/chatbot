import type { Route } from "./+types/home";
import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import SignOutButton from '../ui_components/SignOutButton'
import ChatButton from '../ui_components/ChatButton'
export function meta({}: Route.MetaArgs) {
  return [
    { title: "User Home. Will probably list out chats and include a new chat button later" },
    { name: "description", content: "Welcome to chatbot!" },
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
    return <div><h1>Hello, {loaderData.user.email}!</h1><ChatButton /> <SignOutButton /></div>
 }