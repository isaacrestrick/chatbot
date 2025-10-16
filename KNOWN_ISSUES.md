# Known Issues

## Old Chats Loading Bug

**Status**: Unresolved
**Severity**: Medium
**Reported**: October 2025

### Description
There is a bug affecting the loading of existing/old chat histories. When attempting to load chats that were created previously, the application may fail to properly render the chat messages or encounter errors during the loading process.

### Impact
- Old chat sessions may not load correctly
- Users may experience errors when trying to access historical conversations
- New chats continue to work normally

### Current Workaround
Create new chat sessions. New chats function properly without issues.

### Technical Notes
This bug appears to be related to the chat history loading mechanism. The issue may involve:
- Message history format compatibility
- State management during chat hydration
- Potential ReadableStream errors on navigation

### Related Files
- `app/routes/chats/layout.tsx` - Chat initialization and message loading
- `app/routes/chats/chat.tsx` - Individual chat loading logic

### Next Steps
- [ ] Investigate message format changes that may affect old chats
- [ ] Review chat loading sequence and error handling
- [ ] Consider migration script for old chat data if format has changed
- [ ] Add better error messages for users when old chats fail to load
