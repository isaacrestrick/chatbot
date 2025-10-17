import type { UseChatHelpers } from "@ai-sdk/react";
import type { useAssistantApi } from "@assistant-ui/react";

type ChatStatusRef = Pick<UseChatHelpers<any>, "status">;

const IDLE_STATUSES = new Set(["initial", "ready", "aborted", "error"]);

const isChatIdle = (chatHook?: ChatStatusRef) => {
  if (!chatHook) return true;
  const { status } = chatHook;

  if (!status) return true;

  return IDLE_STATUSES.has(status as string);
};

/**
 * Polls the chat helper status until the transport has fully stopped streaming.
 */
export const waitForChatIdle = async (
  chatHook?: ChatStatusRef,
  timeoutMs = 2000
) => {
  if (isChatIdle(chatHook)) return;

  const start = Date.now();

  await new Promise<void>((resolve) => {
    const tick = () => {
      if (isChatIdle(chatHook) || Date.now() - start > timeoutMs) {
        resolve();
        return;
      }

      setTimeout(tick, 16);
    };

    tick();
  });
};

type AssistantApi = ReturnType<typeof useAssistantApi> | undefined;

/**
 * Stops the client chat transport and attempts to cancel the active assistant run.
 */
export const stopActiveStream = async (
  chatHook?: Pick<UseChatHelpers<any>, "stop" | "status">,
  assistantApi?: AssistantApi
) => {
  try {
    await chatHook?.stop?.();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.debug("chat.stop() failed", error);
    }
  }

  if (assistantApi) {
    try {
      const threadApi = assistantApi.thread?.();
      await threadApi?.cancelRun?.();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.debug("assistantApi cancelRun failed", error);
      }
    }
  }

  await waitForChatIdle(chatHook);
};

