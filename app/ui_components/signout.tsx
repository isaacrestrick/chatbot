import { authClient } from "../lib/auth-client"

export default function SignOut() {

  const signOut = async () => {
    await authClient.signOut()
  }

  return (
    <div onClick={signOut}>
      <h2>Sign out</h2>
    </div>
  )
}