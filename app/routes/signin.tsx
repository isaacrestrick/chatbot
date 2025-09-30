import type { Route } from "./+types/home";
import SignIn from '../ui_components/SignIn'
import SignUp from '../ui_components/SignUp'
import SignInGoogle from "../ui_components/SignInGoogle";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function SignInPage() {
    return <div>
      <SignIn />
      <SignInGoogle />
      <SignUp />
    </div>
 }