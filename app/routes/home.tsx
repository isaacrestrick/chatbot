import type { Route } from "./+types/home";
import SignIn from '../ui_components/signin'
import SignUp from '../ui_components/signup'
import SignOut from '../ui_components/signout'
import { authClient } from '../lib/auth-client'

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const { data, isPending, error } = authClient.useSession()
  if (data) {
    return <div><h1>Hello, {data.user.email}!</h1><SignOut/></div>
  } else {
    return <div>
      <SignIn />
      <SignUp />
    </div>
  }
 }