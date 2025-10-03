import { useNavigate } from "react-router"
import { Button } from "~/components/ui/button"
export default function ChatButton() {
  const navigate = useNavigate()

  const goChat = async () => {
    const uuid = crypto.randomUUID();
    navigate(`/chat/` + uuid)
  }

  return (
    <Button type="button" onClick={goChat} className="mx-5">Chat</Button>
  )
}