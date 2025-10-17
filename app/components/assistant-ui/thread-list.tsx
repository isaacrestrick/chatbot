import { type FC, useState, useEffect } from "react";
import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
} from "@assistant-ui/react";
import { ArchiveIcon, PlusIcon } from "lucide-react";
import { useNavigate, useFetcher, useParams } from "react-router"
import { Button } from "~/components/ui/button";
import { TooltipIconButton } from "~/components/assistant-ui/tooltip-icon-button";

export const ThreadList: FC = (props) => {
  //console.log("down to threadlist", props.chats)
  //console.log("revalidator", props.revalidator)
  return (
    <ThreadListPrimitive.Root className="aui-root aui-thread-list-root flex flex-col items-stretch gap-1.5">
      <ThreadListNew revalidator={props.revalidator} onChatsUpdate={props.onChatsUpdate}/>
      {/*<ThreadListItems chats={props.chats}/>*/}
      {props.chats.map(chat => <ThreadListItem chat={chat} key={chat.chatId} revalidator={props.revalidator} onChatsUpdate={props.onChatsUpdate}/>)}
    </ThreadListPrimitive.Root>
  );
};

const ThreadListNew: FC = (props) => {
  const navigate = useNavigate()
  //console.log("I also ahve the revalidator", props.revalidator)
  return (
    <ThreadListPrimitive.New asChild>
      <Button
        className="aui-thread-list-new flex items-center justify-start gap-1 rounded-lg px-2.5 py-2 text-start hover:bg-muted data-active:bg-muted"
        variant="ghost"
        onClick = {() => {
          const newId = crypto.randomUUID()
          navigate(`/chat/` + newId)
          const huh = props.revalidator.revalidate()
          props.onChatsUpdate(prev => [{title: "Chat: " + newId, chatId: newId}, ...prev])
          console.log("i updated")
          console.log("i revalidated", huh)
        }}
      >
        <PlusIcon />
        New Thread
      </Button>
    </ThreadListPrimitive.New>
  );
};

const ThreadListItems: FC = () => {
  return <ThreadListPrimitive.Items components={{ ThreadListItem }} />;
};

const ThreadListItem: FC = (props) => {
  const navigate = useNavigate()
  const fetcher = useFetcher()
  const {id} = useParams()
  //console.log("i have the revalidator", props.revalidator)
  return (
    <ThreadListItemPrimitive.Root className="aui-thread-list-item flex items-center gap-2 rounded-lg transition-all hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-active:bg-muted">
      <div onClick= {() => {
      navigate("chat/" + props.chat.chatId)
      props.revalidator.revalidate()
      console.log("hi im navigating in the div i made hehe")
    }}>
      <ThreadListItemPrimitive.Trigger className="aui-thread-list-item-trigger flex-grow px-3 py-2 text-start">
        <ThreadListItemTitle title={props.chat.title} id={props.chat.chatId}/>
      </ThreadListItemPrimitive.Trigger>
      </div>
      <div onClick={() => {
          props.onChatsUpdate(prev => prev.filter(chat => chat.chatId !== props.chat.chatId))
          const formData = new FormData();
          formData.append('test','data')
          fetcher.submit(
            formData,
            {
              method: 'POST',
              action: `/api/chat/delete/${props.chat.chatId}`
            }
          )
          console.log(props.chat.chatId, id, props.chat.chatId === id)
          if (props.chat.chatId === id) {
            navigate('/')
          }
          console.log('third')
        }}>
      <ThreadListItemArchive/> {/*GREEDY DELETE NEXT!*/}
      </div>
    </ThreadListItemPrimitive.Root>
  );
};

const ThreadListItemTitle: FC = (props) => {
  const navigate = useNavigate()
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
