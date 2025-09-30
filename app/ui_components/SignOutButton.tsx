import { authClient } from "../lib/auth-client"
import { useNavigate } from "react-router"

export default function SignOutButton() {
  const navigate = useNavigate()

  const signOut = async () => {
    await authClient.signOut()
    navigate("/signin")
  }

  return (
    <button type="button" onClick={signOut} className="border border-white rounded-[4px] p-1"><h2>Sign Out</h2></button>
  )
}