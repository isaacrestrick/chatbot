import type { Route } from "./+types/home";
import { redirect, useOutlet, useOutletContext, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import SignOutButton from '~/ui_components/SignOutButton'
import ChatButton from '../../ui_components/ChatButton'
export function meta({}: Route.MetaArgs) {
  return [
    { title: "User Home. Will probably list out chats and include a new chat button later" },
    { name: "description", content: "Welcome to chatbot!" },
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { auth } = await import("../../lib/auth.server");
  const session = await auth.api.getSession({ headers: request.headers })
  if (session?.user) {
    return { user: session.user }
  } else {
    throw redirect("/login")
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const { auth } = await import("../../lib/auth.server");
  const session = await auth.api.getSession({ headers: request.headers })
  if (session?.user) {
    return auth.handler(request)
  } else {
    throw redirect("/login")
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const {chats, setChats} = useOutletContext()
    return <div className="flex justify-center items-center min-h-screen"><div className="flex flex-col justify-center items-center text-3xl"><h1>Hello, {loaderData.user.name ? loaderData.user.name : loaderData.user.email}!</h1><div className="mt-5"><ChatButton setChats={setChats}/> <SignOutButton /></div></div></div>
 }