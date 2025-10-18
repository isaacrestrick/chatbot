import { LoginForm } from "~/components/login-form"

export default function LoggingIn() {
  return (
    <div>
      <h1 className="text-center pt-8 text-4xl">Welcome to the Researcher 🧠!</h1>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
