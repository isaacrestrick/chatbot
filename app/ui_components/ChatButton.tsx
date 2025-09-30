import { useNavigate } from "react-router"

export default function BackButton() {
  const navigate = useNavigate()

  const goChat = async () => {
    navigate("/chat")
  }

  return (
    <button type="button" onClick={goChat} className="border border-white rounded-[4px] p-1"><h2>Chat</h2></button>
  )
}