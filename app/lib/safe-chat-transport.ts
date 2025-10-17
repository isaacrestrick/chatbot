import { DefaultChatTransport, parseJsonEventStream, uiMessageChunkSchema, type UIMessage, type UIMessageChunk } from "ai";

function isClosedStreamError(error: unknown): boolean {
  if (!(error instanceof TypeError)) {
    return false;
  }

  const message = typeof error.message === "string" ? error.message : "";
  return (
    message.includes("ReadableStream") &&
    (message.includes("closed") || message.includes("already finished"))
  );
}

export class SafeChatTransport<UI_MESSAGE extends UIMessage> extends DefaultChatTransport<UI_MESSAGE> {
  protected processResponseStream(stream: ReadableStream<Uint8Array<ArrayBufferLike>>): ReadableStream<UIMessageChunk> {
    const parsedStream = parseJsonEventStream({
      stream,
      schema: uiMessageChunkSchema,
    });

    return parsedStream.pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          if (!chunk.success) {
            throw chunk.error;
          }

          try {
            controller.enqueue(chunk.value);
          } catch (error) {
            if (isClosedStreamError(error)) {
              void parsedStream.cancel().catch(() => undefined);
              controller.terminate?.();
              return;
            }

            throw error;
          }
        },
      }),
    );
  }
}
