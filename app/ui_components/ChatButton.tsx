import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import type { Dispatch, SetStateAction } from "react";
import type { ThreadSummary } from "~/components/assistant-ui/thread-list";

type ChatButtonProps = {
  updateChats: Dispatch<SetStateAction<ThreadSummary[]>>;
  chatHook?: { stop?: () => Promise<void> };
  revalidator?: { revalidate: () => void };
};

export default function ChatButton({ updateChats, chatHook, revalidator }: ChatButtonProps) {
  const navigate = useNavigate();

  const goChat = async () => {
    if (chatHook?.stop) {
      await chatHook.stop();
    }

    const uuid = crypto.randomUUID();
    updateChats((prev) => [{ title: `Chat: ${uuid}`, chatId: uuid }, ...prev]);
    navigate(`/chat/${uuid}`);
    revalidator?.revalidate();
  };

  return (
    <Button type="button" onClick={goChat} className="mx-5">
      Chat
    </Button>
  );
}
