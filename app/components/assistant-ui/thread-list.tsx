import {
  type FC,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { UseChatHelpers } from "@ai-sdk/react";
import {
  useNavigate,
  useFetcher,
  useParams,
  type NavigateFunction,
} from "react-router";
import { ArchiveIcon, PlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { TooltipIconButton } from "~/components/assistant-ui/tooltip-icon-button";

export type ThreadSummary = {
  chatId: string;
  title: string;
};

const waitForChatIdle = async (
  chatHook?: Pick<UseChatHelpers<any>, "status">
) => {
  if (!chatHook?.status) return;
  if (
    chatHook.status !== "streaming" &&
    chatHook.status !== "submitted"
  ) {
    return;
  }

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(resolve, 2000);

    const tick = () => {
      if (
        !chatHook.status ||
        (chatHook.status !== "streaming" &&
          chatHook.status !== "submitted")
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

const stopActiveStream = async (
  chatHook?: Pick<UseChatHelpers<any>, "stop" | "status">
) => {
  if (chatHook?.stop) {
    await Promise.resolve(chatHook.stop());
  }

  await waitForChatIdle(chatHook);
};

type ThreadListProps = {
  chatHook: Pick<UseChatHelpers<any>, "stop" | "status">;
  chats: ThreadSummary[];
  updateChats: Dispatch<SetStateAction<ThreadSummary[]>>;
  revalidator: { revalidate: () => void };
};

export const ThreadList: FC<ThreadListProps> = ({
  chatHook,
  chats,
  updateChats,
  revalidator,
}) => {
  const navigate = useNavigate();

  return (
    <div className="aui-root aui-thread-list-root flex flex-col items-stretch gap-1.5">
      <ThreadListNew
        chatHook={chatHook}
        updateChats={updateChats}
        revalidator={revalidator}
        navigate={navigate}
      />

      {chats.map((chat) => (
        <ThreadListRow
          key={chat.chatId}
          chat={chat}
          chatHook={chatHook}
          updateChats={updateChats}
          revalidator={revalidator}
          navigate={navigate}
        />
      ))}
    </div>
  );
};

type ThreadListNewProps = {
  chatHook: Pick<UseChatHelpers<any>, "stop" | "status">;
  updateChats: Dispatch<SetStateAction<ThreadSummary[]>>;
  revalidator: { revalidate: () => void };
  navigate: NavigateFunction;
};

const ThreadListNew: FC<ThreadListNewProps> = ({
  chatHook,
  updateChats,
  revalidator,
  navigate,
}) => {
  const handleCreate = async () => {
    await stopActiveStream(chatHook);

    const newId = crypto.randomUUID();

    updateChats((prev) => [
      { title: `Chat: ${newId}`, chatId: newId },
      ...prev,
    ]);

    navigate(`/chat/${newId}`);
    revalidator.revalidate();
  };

  return (
    <Button
      className="aui-thread-list-new flex items-center justify-start gap-1 rounded-lg px-2.5 py-2 text-start hover:bg-muted data-active:bg-muted"
      variant="ghost"
      onClick={handleCreate}
    >
      <PlusIcon />
      New Thread
    </Button>
  );
};

type ThreadListRowProps = {
  chat: ThreadSummary;
  chatHook: Pick<UseChatHelpers<any>, "stop" | "status">;
  updateChats: Dispatch<SetStateAction<ThreadSummary[]>>;
  revalidator: { revalidate: () => void };
  navigate: NavigateFunction;
};

const ThreadListRow: FC<ThreadListRowProps> = ({
  chat,
  chatHook,
  updateChats,
  revalidator,
  navigate,
}) => {
  const fetcher = useFetcher();
  const { id } = useParams();

  const isActive = chat.chatId === id;

  const handleSelect = async () => {
    await stopActiveStream(chatHook);
    navigate(`/chat/${chat.chatId}`);
    revalidator.revalidate();
  };

  const handleDelete = async () => {
    if (isActive) {
      await stopActiveStream(chatHook);
    }

    updateChats((prev) =>
      prev.filter((entry) => entry.chatId !== chat.chatId),
    );

    const formData = new FormData();
    formData.append("test", "data");

    fetcher.submit(formData, {
      method: "POST",
      action: `/api/chat/delete/${chat.chatId}`,
    });

    if (isActive) {
      navigate("/");
    }
  };

  return (
    <div
      className="aui-thread-list-item flex items-center gap-2 rounded-lg transition-all hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-active:bg-muted"
      data-active={isActive ? "true" : undefined}
      aria-current={isActive ? "true" : undefined}
    >
      <button
        type="button"
        className="aui-thread-list-item-trigger flex-grow px-3 py-2 text-start"
        onClick={handleSelect}
      >
        <ThreadListItemTitle title={chat.title} />
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

const ThreadListItemTitle: FC<{ title: string }> = ({ title }) => {
  return (
    <span className="aui-thread-list-item-title text-sm">
      {title}
    </span>
  );
};
