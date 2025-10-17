import { useNavigate } from "react-router"
import { Button } from "~/components/ui/button"
export default function ChatButton(props) {
  const navigate = useNavigate()

  const goChat = async () => {
    const uuid = crypto.randomUUID();
    navigate(`/chat/` + uuid)
    props.onChatsUpdate( prev => [{title: "Chat: " + uuid, chatId: uuid}, ...prev])
  }

  return (
    <Button type="button" onClick={goChat} className="mx-5">Chat</Button>
  )
}