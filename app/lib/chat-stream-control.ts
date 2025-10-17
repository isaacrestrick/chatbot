import type { UseChatHelpers } from "@ai-sdk/react";
import type { useAssistantApi } from "@assistant-ui/react";

export type ChatStatusGetter = () => UseChatHelpers<any>["status"] | undefined;

const isIdleStatus = (status: UseChatHelpers<any>["status"] | undefined) => {
  return !status || (status !== "streaming" && status !== "submitted");
};

export async function waitForChatIdle(getStatus: ChatStatusGetter) {
  if (isIdleStatus(getStatus())) {
    return;
  }

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(resolve, 2000);

    const tick = () => {
      if (isIdleStatus(getStatus())) {
        clearTimeout(timeout);
        resolve();
        return;
      }

      setTimeout(tick, 16);
    };

    setTimeout(tick, 0);
  });
}

type StopActiveStreamOptions = {
  stop?: (() => unknown) | (() => Promise<unknown>);
  getStatus: ChatStatusGetter;
  assistantApi?: ReturnType<typeof useAssistantApi>;
  cancelTransport?: (() => unknown) | (() => Promise<unknown>);
};

export async function stopActiveStream({
  stop,
  getStatus,
  assistantApi,
  cancelTransport,
}: StopActiveStreamOptions) {
  if (cancelTransport) {
    await Promise.resolve(cancelTransport());
  }

  if (stop) {
    await Promise.resolve(stop());
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

  await waitForChatIdle(getStatus);
}
