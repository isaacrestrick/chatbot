import { type Dispatch, type FC, type SetStateAction } from "react";
import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
} from "@assistant-ui/react";
import { ArchiveIcon, PlusIcon } from "lucide-react";
import { useNavigate, useFetcher, useParams } from "react-router";
import { Button } from "~/components/ui/button";
import { TooltipIconButton } from "~/components/assistant-ui/tooltip-icon-button";

type ThreadSummary = {
  chatId: string;
  title: string;
};

type ThreadListRevalidator = {
  revalidate: () => void | Promise<void>;
};

type ThreadListProps = {
  chats: ThreadSummary[];
  onChatsChange: Dispatch<SetStateAction<ThreadSummary[]>>;
  revalidator: ThreadListRevalidator;
  isStreaming?: boolean;
  onBeforeSwitch?: () => void;
};

type ThreadListNewProps = {
  revalidator: ThreadListRevalidator;
  optimisticUpdate: Dispatch<SetStateAction<ThreadSummary[]>>;
  isStreaming?: boolean;
};

type ThreadListItemProps = ThreadListNewProps & {
  chat: ThreadSummary;
  onBeforeSwitch?: () => void;
};

export const ThreadList: FC<ThreadListProps> = (props) => {
  return (
    <ThreadListPrimitive.Root className="aui-root aui-thread-list-root flex flex-col items-stretch gap-1.5">
      <ThreadListNew
        revalidator={props.revalidator}
        optimisticUpdate={props.onChatsChange}
        isStreaming={props.isStreaming}
      />
      {props.chats.map((chat) => (
        <ThreadListItem
          chat={chat}
          key={chat.chatId}
          revalidator={props.revalidator}
          optimisticUpdate={props.onChatsChange}
          isStreaming={props.isStreaming}
          onBeforeSwitch={props.onBeforeSwitch}
        />
      ))}
    </ThreadListPrimitive.Root>
  );
};

const ThreadListNew: FC<ThreadListNewProps> = (props) => {
  const navigate = useNavigate();
  return (
    <ThreadListPrimitive.New asChild>
      <Button
        className="aui-thread-list-new flex items-center justify-start gap-1 rounded-lg px-2.5 py-2 text-start hover:bg-muted data-active:bg-muted"
        variant="ghost"
        onClick={() => {
          const newId = crypto.randomUUID();
          navigate(`/chat/${newId}`);
          props.revalidator.revalidate();
          props.optimisticUpdate((prev) => [
            { title: "Chat: " + newId, chatId: newId },
            ...prev,
          ]);
        }}
      >
        <PlusIcon />
        New Thread
      </Button>
    </ThreadListPrimitive.New>
  );
};

const ThreadListItem: FC<ThreadListItemProps> = (props) => {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const { id } = useParams();

  const handleTriggerClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    props.onBeforeSwitch?.();

    if (props.isStreaming) {
      console.warn("Cannot switch chats while streaming. Stopped the stream.");
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    navigate(`/chat/${props.chat.chatId}`);
    props.revalidator.revalidate();
  };

  return (
    <ThreadListItemPrimitive.Root
      className={`aui-thread-list-item flex items-center gap-2 rounded-lg transition-all hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-active:bg-muted ${
        props.isStreaming ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      <ThreadListItemPrimitive.Trigger
        className="aui-thread-list-item-trigger flex-grow px-3 py-2 text-start"
        onClick={handleTriggerClick}
      >
        <ThreadListItemTitle title={props.chat.title} />
      </ThreadListItemPrimitive.Trigger>
      <div
        onClick={() => {
          props.optimisticUpdate((prev) =>
            prev.filter((chat) => chat.chatId !== props.chat.chatId),
          );
          const formData = new FormData();
          formData.append("test", "data");
          fetcher.submit(formData, {
            method: "POST",
            action: `/api/chat/delete/${props.chat.chatId}`,
          });
          if (props.chat.chatId === id) {
            navigate("/");
          }
        }}
      >
        <ThreadListItemArchive />
      </div>
    </ThreadListItemPrimitive.Root>
  );
};

const ThreadListItemTitle: FC<{ title: string }> = (props) => {
  return (
    <span className="aui-thread-list-item-title text-sm">
      {<ThreadListItemPrimitive.Title fallback={props.title} />}
    </span>
  );
};

const ThreadListItemArchive: FC = (props) => {
  //console.log(props.id, props.optimisticUpdate)
  const fetcher = useFetcher()
  return (
    <ThreadListItemPrimitive.Archive asChild>
      <TooltipIconButton
        className="aui-thread-list-item-archive mr-3 ml-auto size-4 p-0 text-foreground hover:text-primary"
        variant="ghost"
        tooltip="Delete (not archive) thread"
      >
        <ArchiveIcon />
      </TooltipIconButton>
    </ThreadListItemPrimitive.Archive>
  );
};
