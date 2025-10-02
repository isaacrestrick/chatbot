import { authClient } from "../lib/auth-client"
import { useNavigate } from "react-router"
import { Button } from "~/components/ui/button"
export default function SignOutButton() {
  const navigate = useNavigate()

  const signOut = async () => {
    await authClient.signOut()
    navigate("/signin")
  }

  return (
    <Button type="button" onClick={signOut} className="mx-5">Sign Out</Button>
  )
}