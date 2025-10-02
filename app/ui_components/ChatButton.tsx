import { useNavigate } from "react-router"
import { Button } from "~/components/ui/button"
export default function ChatButton() {
  const navigate = useNavigate()

  const goChat = async () => {
    navigate("/chat")
  }

  return (
    <Button type="button" onClick={goChat} className="mx-5">Chat</Button>
  )
}