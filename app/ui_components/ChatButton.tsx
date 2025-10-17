import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ThreadSummary } from "~/components/assistant-ui/thread-list";
import type { UseChatHelpers } from "@ai-sdk/react";
import { useAssistantApi } from "@assistant-ui/react";
import { useLatestRef } from "~/hooks/use-latest-ref";
import { stopActiveStream } from "~/lib/chat-stream-control";

type ChatButtonProps = {
  updateChats: Dispatch<SetStateAction<ThreadSummary[]>>;
  chatHook?: Pick<UseChatHelpers<any>, "stop" | "status">;
  revalidator?: { revalidate: () => void };
  cancelStream?: () => void | Promise<void>;
};

export default function ChatButton({ updateChats, chatHook, revalidator, cancelStream }: ChatButtonProps) {
  const navigate = useNavigate();
  const assistantApi = useAssistantApi();
  const statusRef = useLatestRef(chatHook?.status);
  const getStatus = useCallback(() => statusRef.current, [statusRef]);

  const goChat = async () => {
    await stopActiveStream({
      stop: chatHook?.stop,
      assistantApi,
      getStatus,
      cancelTransport: cancelStream,
    });

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
