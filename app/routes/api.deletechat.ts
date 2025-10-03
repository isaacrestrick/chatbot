import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router"

export async function loader({ request }: LoaderFunctionArgs) {
    return {}
}

export async function action({ request, params }: ActionFunctionArgs) {
    console.log("running the delete loader")
    if (true) {
      return {}
    }
    const { auth } = await import("../lib/auth.server");
      const { db } = await import("../lib/db.server");
      const { supabase } = await import("../lib/supabase-client.server");
      const { chat } = await import("../lib/schemas/chat-schema.server");
      const { eq, and } = await import("drizzle-orm");

      const { id } = params
      //console.log(id)
      const session = await auth.api.getSession({ headers: request.headers })
      if (!session?.user || !id) {
        return {}
      }
      // delete the chats for the current user
      const { error: storageError } = await supabase.storage
      .from("chats")
      .remove([`${id}.json`]);
  
      if (storageError) {
          console.error("Error deleting from storage:", storageError);
      }
      
      // Delete from database
      await db
          .delete(chat)
          .where(and(
              eq(chat.chatId, id),
              eq(chat.userId, session.user.id)
          ));

      return {};
      return {};
}
