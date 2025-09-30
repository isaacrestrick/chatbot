import { createOpenAI } from '@ai-sdk/openai';
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router"
import type { UIMessage } from 'ai';
import { streamText, convertToModelMessages, tool, stepCountIs } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function loader({ request }: LoaderFunctionArgs) {
    return {}
}

export async function action({ request }: ActionFunctionArgs) {
    const { messages }: { messages: UIMessage[] } = await request.json();  
    const result = streamText({
        model: openai('gpt-4o'),
        stopWhen: stepCountIs(5),
        tools: {
            weather: tool({
              description: 'Get the weather in a location',
              inputSchema: z.object({
                location: z.string().describe('The location to get the weather for'),
              }),
              execute: async ({ location }) => ({
                location,
                temperature: 72 + Math.floor(Math.random() * 21) - 10,
              }),
            }),
          },
        messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
}