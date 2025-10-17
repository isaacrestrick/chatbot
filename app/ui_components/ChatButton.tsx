import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import type { Dispatch, SetStateAction } from "react";
import type { ThreadSummary } from "~/components/assistant-ui/thread-list";
import type { UseChatHelpers } from "@ai-sdk/react";
import { useAssistantApi } from "@assistant-ui/react";
import { stopActiveStream } from "~/lib/chat-stream-control";

type ChatButtonProps = {
  updateChats: Dispatch<SetStateAction<ThreadSummary[]>>;
  chatHook?: Pick<UseChatHelpers<any>, "stop" | "status">;
  revalidator?: { revalidate: () => void };
};

export default function ChatButton({ updateChats, chatHook, revalidator }: ChatButtonProps) {
  const navigate = useNavigate();
  const assistantApi = useAssistantApi();

  const goChat = async () => {
    await stopActiveStream(chatHook, assistantApi);

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
