import { createOpenAI } from '@ai-sdk/openai';
import { anthropic, createAnthropic } from '@ai-sdk/anthropic';
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router"
import type { UIMessage } from 'ai';
import { streamText, convertToModelMessages, tool, stepCountIs, dynamicTool, jsonSchema } from 'ai';
import { z } from 'zod';
import { betaMemoryTool, type MemoryToolHandlers } from '@anthropic-ai/sdk/helpers/beta/memory';

import { LocalFilesystemMemoryTool } from '~/lib/tool_helpers_memory.server'
import type {BetaMemoryTool20250818Command} from '@anthropic-ai/sdk/resources/beta';


const fs = await LocalFilesystemMemoryTool.init('./spaghetti/memory');

const MemoryArgs = z.discriminatedUnion("command", [
  z.object({
    command: z.literal("view"),
    path: z.string().min(1),
    view_range: z.tuple([z.number().int().min(1), z.number().int().min(1)]).optional(),
  }),
  z.object({
    command: z.literal("create"),
    path: z.string().min(1),
    file_text: z.string().default(""),
    overwrite: z.boolean().default(true),
  }),
  z.object({
    command: z.literal("str_replace"),
    path: z.string().min(1),
    old_str: z.string(),
    new_str: z.string(),
  }),
  z.object({
    command: z.literal("insert"),
    path: z.string().min(1),
    insert_line: z.number().int().min(1),
    insert_text: z.string(),
  }),
  z.object({
    command: z.literal("delete"),
    path: z.string().min(1),
  }),
  z.object({
    command: z.literal("rename"),
    old_path: z.string().min(1),
    new_path: z.string().min(1),
  }),
]);

const MemoryInput = z.object({
  command: z.enum(['view','create','str_replace','insert','delete','rename']),
  path: z.string().optional(),
  view_range: z.tuple([z.number().int().min(1), z.number().int().min(1)]).optional(),
  file_text: z.string().optional(),
  overwrite: z.boolean().optional(),
  old_str: z.string().optional(),
  new_str: z.string().optional(),
  insert_line: z.number().int().min(1).optional(),
  insert_text: z.string().optional(),
  old_path: z.string().optional(),
  new_path: z.string().optional(),
});

const memory = tool({
  description: `Memory file operations (atomic). ALWAYS send a COMPLETE JSON object in one chunk.

Commands:
- create: { "command":"create", "file_text":string, "path":string, "overwrite"?:boolean }
- delete: { "command":"delete", "path":string }
- insert: { "command":"insert", "path":string, "insert_line":number, "insert_text":string }
- rename: { "command":"rename", "old_path":string, "new_path":string }
- str_replace: { "command":"str_replace", "path":string, "old_str":string, "new_str":string }
- view:   { "command":"view", "path":string, "view_range"?: [number, number] }

Examples:
{"command":"create","file_text":"Line A\\nLine B\\n","path":"/memories/notes.txt"}
{"command":"view","path":"/memories","view_range":[1,30]}`,
  inputSchema: MemoryInput,
  execute: async (input) => {
    const parsed = MemoryArgs.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.message };
    }
    const args = parsed.data;

    try {
      switch (args.command) {
        case "view":
          return { ok: true, result: await fs.view(args) };
        case "create":
          return { ok: true, result: await fs.create(args) };
        case "str_replace":
          return { ok: true, result: await fs.str_replace(args) };
        case "insert":
          return { ok: true, result: await fs.insert(args) };
        case "delete":
          return { ok: true, result: await fs.delete(args) };
        case "rename":
          return { ok: true, result: await fs.rename(args) };
      }
    } catch (err: any) {
      return { ok: false, error: String(err?.message ?? err) };
    }
  },
});


// Allow streaming responses up to 30 seconds
export const maxDuration = 300;

const createdAnthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY);
// console.log("ANTHROPIC_API_KEY:", process.env.ANTHROPIC_API_KEY);


export async function loader({ request }: LoaderFunctionArgs) {
    return {}
}

export async function action({ request }: ActionFunctionArgs) {
    //console.log("request: ", request, request.id!)
    //const { messages }: { messages: UIMessage[] } = await request.json();  
    const { messages, id }: { messages: UIMessage[]; chatId: string } = await request.json();
    console.log("chatidheehee", id)

    // LOAD IT IN
    


    const webSearchTool = anthropic.tools.webSearch_20250305({
      maxUses: 20,
    });

    const webFetchTool = anthropic.tools.webFetch_20250910({ maxUses: 1 })

    const result = streamText({
        model: createdAnthropic('claude-sonnet-4-5'),
        stopWhen: stepCountIs(100),
        headers: {"anthropic-beta": "context-management-2025-06-27,web-fetch-2025-09-10"},
        tools: {
            web_fetch: webFetchTool,
            web_search: webSearchTool,
            memory
          },
        messages: [    { role: 'system', content: 
          `
          IMPORTANT: ALWAYS VIEW YOUR MEMORY DIRECTORY BEFORE DOING ANYTHING ELSE.
MEMORY PROTOCOL:
1. Use the \`view\` command of your \`memory\` tool to check for earlier progress.
2. ... (work on the task) ...
     - As you make progress, record status / progress / thoughts etc in your memory.
ASSUME INTERRUPTION: Your context window might be reset at any moment, so you risk losing any progress that is not recorded in your memory directory.
          ` },
          ...convertToModelMessages(messages)],
    });

  // SAVE IT

    return result.toUIMessageStreamResponse();
}