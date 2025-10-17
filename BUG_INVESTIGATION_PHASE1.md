# Thread Switching ReadableStream Bug - Phase 1 Investigation Report

**Date:** 2025-10-17
**Status:** Investigation Complete (Phase 1 - Root Cause Identified)
**Severity:** HIGH - Breaks thread navigation after sending messages

---

## Executive Summary

A **critical bug** occurs when users switch between chat threads. After sending a message in one thread and then clicking into another thread, the application crashes with a `ReadableStreamDefaultController` error. The root cause is **uncancelled streaming requests from the previous thread continuing to attempt writing data after navigation**.

---

## Bug Reproduction

### Steps to Reproduce
1. Log into the application
2. Click into an existing thread
3. Send a message (message sends successfully)
4. Wait for the AI response to start streaming
5. Click into a **different** existing thread
6. **Expected:** Clean navigation to new thread
7. **Actual:** Error boundary triggers with "Oops!" page

### Error Message
```
Failed to execute 'enqueue' on 'ReadableStreamDefaultController':
Cannot enqueue a chunk into a readable stream that is closed or has been requested to be closed

TypeError: Cannot enqueue a chunk into a readable stream that is closed or has been requested to be closed
    at TextStreamControllerImpl.append (chunk-4IJJAP5A.js:1062:22)
    at chunk-4IJJAP5A.js:5701:47
    at Array.forEach (<anonymous>)
    at chunk-4IJJAP5A.js:5671:25
    at Array.forEach (<anonymous>)
    at processMessages (chunk-4IJJAP5A.js:5670:16)
    at chunk-4IJJAP5A.js:5734:5
    at Object.react_stack_bottom_frame (react-dom_client.js:17486:20)
    at runWithFiberInDEV (react-dom_client.js:1485:72)
    at commitHookEffectListMount (react-dom_client.js:8460:122)
```

---

## Root Cause Analysis

### Primary Issue: No Stream Cleanup on Route Change

**File:** `/app/routes/chats/layout.tsx` (lines 42-87)

```typescript
export default function ChatLayout() {
  const {id} = useParams()
  const chatListsObj = useLoaderData()
  const chatContentObj = useRouteLoaderData("chat")
  const revalidator = useRevalidator()

  const [chats, setChats] = useState(chatListsObj.chats)

  // ❌ PROBLEM: useChat hook with no cleanup on ID change
  const chat = useChat({
    id: id,
    messages: chatContentObj?.chatContent?.length > 0
    ? chatContentObj.chatContent.filter((msg: any) => msg.id && msg.id !== "")
    : undefined,
    transport: new DefaultChatTransport({
        api: '/ai'
    })
  })
  // ❌ NO useEffect cleanup
  // ❌ NO AbortController setup
  // ❌ NO handling for when id changes
}
```

**Critical Gaps:**
1. **No `useEffect` cleanup function** - When `id` changes, the previous chat's stream is never aborted
2. **No `AbortController`** - The fetch request to `/ai` has no way to be cancelled
3. **No dependency array handling** - The `useChat` hook doesn't properly handle `id` changes

### Secondary Issue: Streaming Response Without Abort Support

**File:** `/app/routes/ai.ts` (lines 155-200)

```typescript
const result = streamText({
    model: createdAnthropic('claude-sonnet-4-5'),
    stopWhen: stepCountIs(100),
    headers: {"anthropic-beta": "context-management-2025-06-27,web-fetch-2025-09-10"},
    tools: {
        web_fetch: webFetchTool,
        web_search: webSearchTool,
        memory
    },
    messages: [
      { role: 'system', content: `...` },
      ...convertToModelMessages(messages)
    ],
});

return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: idGenerator,
    onFinish: async ({ messages }) => {
        // Database save logic...
    }
});
```

**Critical Gaps:**
1. **No AbortController passed to `streamText()`** - Server doesn't know when to stop streaming
2. **No signal handling** - Even if client could send abort, server wouldn't listen
3. **No cleanup in `onFinish`** - Stream continues even after logical completion

### Tertiary Issue: Unsafe Thread Switching

**File:** `/app/components/assistant-ui/thread-list.tsx` (lines 58-61)

```typescript
<div onClick={() => {
  navigate("chat/" + props.chat.chatId)  // ❌ Immediate navigation
  props.revalidator.revalidate()
}}>
```

**Problem:**
- Navigation happens immediately with no cleanup of current chat resources
- No check if a stream is currently active
- No mechanism to abort previous thread's requests before switching

---

## The Error Chain (Race Condition)

```
Timeline of events:
─────────────────────────────────────────────────────────────

User in Thread A (streaming response active)
    │
    ├─→ User clicks Thread B button
    │
    ├─→ [INSTANT] Client-side navigation to Thread B
    │   (No cleanup happens)
    │
    ├─→ Thread B's ChatLayout component mounts
    │   (New useChat hook created)
    │
    └─→ [DELAYED] Old Thread A stream tries to write data
        └─→ "Cannot enqueue chunk into closed stream"
        └─→ Error boundary catches
        └─→ "Oops!" page rendered
```

The issue is a **race condition** where:
- Client-side React Router navigation is synchronous and instant
- Server-side streaming continues asynchronously
- The old stream's `ReadableStreamDefaultController` is closed when navigation begins
- But the server still tries to send data from Thread A

---

## Affected Components

| Component | File | Issue | Impact |
|-----------|------|-------|--------|
| **ChatLayout** | `/app/routes/chats/layout.tsx` | No cleanup on ID change | Streams not cancelled |
| **Thread Navigation** | `/app/components/assistant-ui/thread-list.tsx` | Immediate nav without abort | Orphaned streams |
| **AI Route Handler** | `/app/routes/ai.ts` | No abort signal support | Can't stop server streaming |
| **DefaultChatTransport** | (external - `@ai-sdk/react`) | No native abort handling | Streams pile up on race |

---

## Why This is "Really Tricky"

### Complexity Factors

1. **Async/Sync Mismatch**
   - Navigation (sync) happens faster than stream cleanup (async)
   - By the time old stream tries to write, controller is already closed

2. **Multiple Layers**
   - React Router (navigation)
   - React Component (ChatLayout)
   - AI SDK Transport (`DefaultChatTransport`)
   - Server Stream Handler (`streamText`)
   - Browser Fetch API
   - Each layer needs proper cleanup coordination

3. **Hidden State**
   - Old thread's stream continues in background
   - User sees new thread, but old stream still active
   - Creates silent failures that only surface when data arrives

4. **Third-Party Transport**
   - Using `DefaultChatTransport` from `@ai-sdk/react`
   - Not designed to handle route-based cancellation
   - No hook into React Router navigation lifecycle

5. **Bidirectional Streaming**
   - Server sending (streaming response)
   - Client receiving (ReadableStreamDefaultController)
   - Both must coordinate shutdown, but don't

---

## Known Related Issues

**File:** `/KNOWN_ISSUES.md`

Already documented:
```markdown
## Old Chats Loading Bug
**Status**: Unresolved
**Severity**: Medium

### Technical Notes
Potential ReadableStream errors on navigation
```

This bug report directly confirms and explains that issue.

---

## Current Application Architecture (Relevant Parts)

```
User clicks thread
    ↓
ThreadListItem.onClick
    ↓
React Router navigate()
    ↓
ChatLayout component mounts/updates
    ↓
useChat() hook initializes
    ↓
DefaultChatTransport creates fetch to /ai
    ↓
/ai route handler calls streamText()
    ↓
Response sent as ReadableStream
    ↓
Browser's ReadableStreamDefaultController receives chunks
    ↓
If user navigates BEFORE stream ends:
    Controller is closed
    Old stream still trying to send
    ERROR: Cannot enqueue to closed stream
```

---

## Impact Assessment

### What's Broken
- ✗ Cannot switch threads while AI is responding
- ✗ Cannot navigate away from active streams
- ✗ Application crashes on thread switch during streaming
- ✗ User must refresh page to recover

### What Works
- ✓ Sending messages in a single thread (works if no navigation)
- ✓ Viewing completed conversations
- ✓ Switching threads if no active stream

### User Experience
**Severity: HIGH**
- Blocks primary workflow (thread switching)
- Requires page refresh to recover
- No graceful degradation
- Error message is cryptic to users

---

## Solution Considerations (For Phase 2)

### Potential Approaches

1. **Client-Side Abort Controller**
   - Add `AbortController` to `useChat` configuration
   - Cancel fetch on route change via `useEffect`
   - Most viable for immediate fix

2. **Server-Side Signal Support**
   - Accept abort signal in `/ai` route
   - Pass to `streamText()` handler
   - More robust but requires server changes

3. **Transport Layer Enhancement**
   - Wrap `DefaultChatTransport` with custom abort handling
   - Intercept navigation events
   - Complex but contained to one component

4. **Navigation Guards**
   - Prevent navigation while stream active
   - Or wait for stream to complete before allowing nav
   - Poor UX but safest short-term

5. **Error Recovery**
   - Better error boundaries with auto-retry
   - Won't solve root cause but improves recovery

---

## Files to Review for Phase 2 Implementation

1. `/app/routes/chats/layout.tsx` - Add cleanup logic
2. `/app/routes/ai.ts` - Add signal handling
3. `/app/components/assistant-ui/thread.tsx` - Cancel button behavior
4. `/app/components/assistant-ui/thread-list.tsx` - Navigation handling
5. `package.json` - Check `@ai-sdk/react` version and capabilities

---

## Testing Notes

- **Consistent reproduction:** Every time, 100% reproducible
- **Timing sensitive:** Only occurs if switching thread while stream active
- **Error appears immediately:** On navigation, before new thread loads
- **Error caught by boundary:** Shows "Oops!" error page
- **Recovery:** Page refresh required

---

## Conclusion

This is a **well-defined, reproducible bug** with a clear architectural root cause. The issue is that streaming requests from previous threads are not being cancelled when users navigate to new threads, causing the `ReadableStreamDefaultController` to receive data on a closed stream.

The fix will require coordinating stream cancellation across React's component lifecycle, React Router's navigation, and the AI SDK's transport layer.

**Next Phase:** Implementation and testing of abort controller solution.
