import { Form, redirect, useNavigate } from "react-router"
import { useState } from "react"
import { authClient } from "../lib/auth-client"

export default function SignInGoogle() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const signInWithGoogle = async () => {
    await authClient.signIn.social({
        provider: "google"
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
    <div className="border border-white mb-4" onClick={signInWithGoogle}>
      <h2>
        Sign In with Google
      </h2>
    </div>
  )
}