import { db } from "./db.server"; // drizzle(hting)
import { chat } from "./chat-schema.server";
import { project } from "./project-schema.server";
import { user } from "./auth-schema.server"
import { supabase } from "./supabase-client.server" // supabase client



// Upload Chat given id and content (fs-like)
export async function uploadChat(chatId, fileContent) {
    const { data, error } = await supabase.storage.from('chats').upload(`${chatId}.json`, fileContent, {upsert: true})
    if (error) {
        console.log("ruhroh")
    } else {
        console.log("wahoo")
    }
}

