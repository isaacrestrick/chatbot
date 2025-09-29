import { authClient } from "../lib/auth-client"
import { useNavigate } from "react-router"

export default function SignOut() {
  const navigate = useNavigate()

  const signOut = async () => {
    await authClient.signOut()
    navigate("/signin")
  }

  return (
    <div onClick={signOut}>
      <h2>Sign out</h2>
    </div>
  )
}