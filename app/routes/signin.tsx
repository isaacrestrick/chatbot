import type { Route } from "./+types/home";
import SignIn from '../ui_components/signin'
import SignUp from '../ui_components/signup'

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
    return <div>
      <SignIn />
      <SignUp />
    </div>
 }