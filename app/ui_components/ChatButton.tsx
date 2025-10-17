import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import type { Dispatch, SetStateAction } from "react";
import type { ThreadSummary } from "~/components/assistant-ui/thread-list";

type ChatButtonProps = {
  updateChats: Dispatch<SetStateAction<ThreadSummary[]>>;
};

export default function ChatButton({ updateChats }: ChatButtonProps) {
  const navigate = useNavigate()

  const goChat = async () => {
    const uuid = crypto.randomUUID();
    navigate(`/chat/` + uuid)
    updateChats(prev => [{title: "Chat: " + uuid, chatId: uuid}, ...prev])
  }

  return (
    <Button type="button" onClick={goChat} className="mx-5">Chat</Button>
  )
}
