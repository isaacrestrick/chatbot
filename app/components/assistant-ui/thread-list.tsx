import { useCallback, type FC, type Dispatch, type SetStateAction } from "react";
import type { UseChatHelpers } from "@ai-sdk/react";
import { ArchiveIcon, PlusIcon } from "lucide-react";
import {
  useNavigate,
  useFetcher,
  useParams,
  type NavigateFunction,
} from "react-router";
import { Button } from "~/components/ui/button";
import { TooltipIconButton } from "~/components/assistant-ui/tooltip-icon-button";
import { useLatestRef } from "~/hooks/use-latest-ref";
import {
  stopActiveStream,
  type ChatStatusGetter,
} from "~/lib/chat-stream-control";
import type { useAssistantApi } from "@assistant-ui/react";

export type ThreadSummary = {
  chatId: string;
  title: string;
};

type ThreadListProps = {
  chatHook: Pick<UseChatHelpers<any>, "stop" | "status">;
  chats: ThreadSummary[];
  updateChats: Dispatch<SetStateAction<ThreadSummary[]>>;
  revalidator: { revalidate: () => void };
  assistantApi?: ReturnType<typeof useAssistantApi>;
  cancelStream?: () => void | Promise<void>;
  getStatus?: ChatStatusGetter;
};

export const ThreadList: FC<ThreadListProps> = ({
  chats,
  updateChats,
  revalidator,
  chatHook,
  assistantApi,
  cancelStream,
  getStatus,
}) => {
  const navigate = useNavigate();
  const statusRef = useLatestRef(chatHook.status);
  const resolveStatus = useCallback<ChatStatusGetter>(() => getStatus?.() ?? statusRef.current, [getStatus, statusRef]);

  const handleCreateThread = async () => {
    await stopActiveStream({
      stop: chatHook.stop,
      assistantApi,
      getStatus: resolveStatus,
      cancelTransport: cancelStream,
    });
    const newId = crypto.randomUUID();

    updateChats((prev) => [{ title: `Chat: ${newId}`, chatId: newId }, ...prev]);
    navigate(`/chat/${newId}`);
    revalidator.revalidate();
  };

  return (
    <div className="aui-root aui-thread-list-root flex flex-col items-stretch gap-1.5">
      <Button
        className="aui-thread-list-new flex items-center justify-start gap-1 rounded-lg px-2.5 py-2 text-start hover:bg-muted data-active:bg-muted"
        variant="ghost"
        onClick={handleCreateThread}
      >
        <PlusIcon />
        New Thread
      </Button>

      <div className="flex flex-col gap-1.5">
        {chats.map((chat) => (
          <ThreadListRow
            key={chat.chatId}
            chat={chat}
            updateChats={updateChats}
            revalidator={revalidator}
            onNavigate={navigate}
            chatHook={chatHook}
            assistantApi={assistantApi}
            cancelStream={cancelStream}
            getStatus={resolveStatus}
          />
        ))}
      </div>
    </div>
  );
};

type ThreadListRowProps = {
  chat: ThreadSummary;
  chatHook: Pick<UseChatHelpers<any>, "stop" | "status">;
  updateChats: Dispatch<SetStateAction<ThreadSummary[]>>;
  revalidator: { revalidate: () => void };
  onNavigate: NavigateFunction;
  assistantApi?: ReturnType<typeof useAssistantApi>;
  cancelStream?: () => void | Promise<void>;
  getStatus: ChatStatusGetter;
};

const ThreadListRow: FC<ThreadListRowProps> = ({
  chat,
  chatHook,
  updateChats,
  revalidator,
  onNavigate,
  assistantApi,
  cancelStream,
  getStatus,
}) => {
  const fetcher = useFetcher();
  const { id } = useParams();

  const isActive = chat.chatId === id;

  const handleSelect = async () => {
    await stopActiveStream({
      stop: chatHook.stop,
      assistantApi,
      getStatus,
      cancelTransport: cancelStream,
    });
    onNavigate(`/chat/${chat.chatId}`);
    revalidator.revalidate();
  };

  const handleDelete = async () => {
    if (isActive) {
      await stopActiveStream({
        stop: chatHook.stop,
        assistantApi,
        getStatus,
        cancelTransport: cancelStream,
      });
    }
    updateChats((prev) => prev.filter((entry) => entry.chatId !== chat.chatId));

    const formData = new FormData();
    formData.append("test", "data");
    fetcher.submit(formData, {
      method: "POST",
      action: `/api/chat/delete/${chat.chatId}`,
    });

    if (isActive) {
      onNavigate("/");
    }
  };

  return (
    <div
      className="aui-thread-list-item flex items-center gap-2 rounded-lg transition-all hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-active:bg-muted"
      {...(isActive ? { "data-active": "true", "aria-current": "true" } : null)}
    >
      <button
        type="button"
        className="aui-thread-list-item-trigger flex-grow px-3 py-2 text-start"
        onClick={handleSelect}
      >
        <span className="aui-thread-list-item-title text-sm">{chat.title}</span>
      </button>

      <TooltipIconButton
        className="aui-thread-list-item-archive mr-3 ml-auto size-4 p-0 text-foreground hover:text-primary"
        variant="ghost"
        tooltip="Delete (not archive) thread"
        onClick={handleDelete}
      >
        <ArchiveIcon />
      </TooltipIconButton>
    </div>
  );
};
