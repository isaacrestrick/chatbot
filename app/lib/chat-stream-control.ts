import type { UseChatHelpers } from "@ai-sdk/react";

export type AssistantApi = {
  thread?: () => {
    cancelRun?: () => Promise<void> | void;
  } | undefined;
};

type ChatStatusOnly = Pick<UseChatHelpers<any>, "status">;
type ChatStopControls = Pick<UseChatHelpers<any>, "stop" | "status">;

export const waitForChatIdle = async (chatHook?: ChatStatusOnly) => {
  if (!chatHook) return;
  if (
    !chatHook.status ||
    (chatHook.status !== "streaming" && chatHook.status !== "submitted")
  ) {
    return;
  }

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(resolve, 2000);
    const tick = () => {
      if (
        !chatHook.status ||
        (chatHook.status !== "streaming" && chatHook.status !== "submitted")
      ) {
        clearTimeout(timeout);
        resolve();
        return;
      }
      setTimeout(tick, 16);
    };

    setTimeout(tick, 0);
  });
};

export const stopActiveStream = async (
  chatHook?: ChatStopControls,
  assistantApi?: AssistantApi,
) => {
  if (chatHook?.stop) {
    await Promise.resolve(chatHook.stop());
  }

  if (assistantApi) {
    try {
      const threadApi = assistantApi.thread?.();
      await threadApi?.cancelRun?.();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.debug("cancelRun failed", error);
      }
    }
  }

  await waitForChatIdle(chatHook);
};
