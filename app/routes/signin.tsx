import type { Route } from "./+types/home";
import SignInForm from '../ui_components/SignInForm'
import SignUpForm from '../ui_components/SignUpForm'
import SignInGoogleButton from "../ui_components/SignInGoogleButton";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function SignInPage() {
    return <div>
      <SignInForm />
      <SignInGoogleButton />
      <SignUpForm />
    </div>
 }