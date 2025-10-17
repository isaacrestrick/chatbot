import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import type { Dispatch, SetStateAction } from "react";
import type { ThreadSummary } from "~/components/assistant-ui/thread-list";
import type { UseChatHelpers } from "@ai-sdk/react";
import { useAssistantApi } from "@assistant-ui/react";

const waitForChatIdle = async (
  chatHook?: Pick<UseChatHelpers<any>, "status">
) => {
  if (!chatHook) return;
  if (!chatHook.status || (chatHook.status !== "streaming" && chatHook.status !== "submitted")) {
    return;
  }

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(resolve, 2000);
    const tick = () => {
      if (!chatHook.status || (chatHook.status !== "streaming" && chatHook.status !== "submitted")) {
        clearTimeout(timeout);
        resolve();
        return;
      }
      setTimeout(tick, 16);
    };
    setTimeout(tick, 0);
  });
};

const stopActiveStream = async (
  chatHook?: Pick<UseChatHelpers<any>, "stop" | "status">,
  assistantApi?: ReturnType<typeof useAssistantApi>
) => {
  if (chatHook?.stop) {
    await Promise.resolve(chatHook.stop());
  }

  if (!assistantApi) return;

  try {
    const threadApi = assistantApi.thread?.();
    await threadApi?.cancelRun?.();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.debug("cancelRun failed", error);
    }
  }

  await waitForChatIdle(chatHook);
};

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
