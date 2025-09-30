import { Form, redirect, useNavigate } from "react-router"
import { useState } from "react"
import { authClient } from "../lib/auth-client"

export default function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const signIn = async () => {
    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onRequest: (ctx) => {
          // show loading state
          console.log("hello")
        },
        onSuccess: (ctx) => {
          console.log("hi")
          // redirect to home
          navigate("/")
        },
        onError: (ctx) => {
          console.log("hey")
          alert(ctx.error)
        },
      },
    )
  }

  return (
    <div className="border border-white mb-4">
      <h2>
        Sign In
      </h2>
      <Form onSubmit={signIn}>
        <input
          type="email"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
        >
          Sign In
        </button>
      </Form>
    </div>
  )
}