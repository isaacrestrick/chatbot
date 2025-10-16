# Fractal Chatbot - Codebase Documentation

## Overview

A full-stack AI chatbot application built with React Router 7, featuring Claude AI integration with memory persistence, web search capabilities, and Supabase storage. The application provides an interactive chat interface with conversation history and AI-powered memory management.

## Tech Stack

### Frontend
- **Framework**: React 19.1.1 with React Router 7.9.2 (full-stack SSR)
- **UI Components**: Shadcn UI + Radix UI primitives
- **Styling**: Tailwind CSS 4.1.13 with custom OKLCH color theme (green/red)
- **Animations**: Motion (Framer Motion alternative) 12.23.22
- **AI Integration**:
  - `@assistant-ui/react` (0.11.25) - Chat UI components
  - `@ai-sdk/react` (2.0.59) - Vercel AI SDK for React
  - `ai` (5.0.59) - Core AI SDK

### Backend
- **Runtime**: Bun (package manager and runtime)
- **Server**: React Router SSR with `@react-router/node`
- **Database**: PostgreSQL with Drizzle ORM 0.44.5
- **Authentication**: better-auth 1.3.23 with Google OAuth
- **Storage**: Supabase Storage (for chat history and AI memory files)
- **AI Provider**: Claude (Anthropic) via `@anthropic-ai/sdk` 0.65.0
- **Validation**: Zod 4.1.11

## Project Structure

```
chatbot/
├── app/
│   ├── routes/                      # Route handlers (loaders, actions, components)
│   │   ├── ai.ts                    # AI streaming endpoint with tool definitions
│   │   ├── api.auth.$.ts            # Authentication handler
│   │   ├── api.deletechat.ts        # Chat deletion endpoint
│   │   ├── login.tsx                # Login page
│   │   ├── signup.tsx               # Signup page
│   │   └── chats/
│   │       ├── layout.tsx           # Main chat layout with sidebar & runtime
│   │       ├── home.tsx             # Chat home/welcome page
│   │       └── chat.tsx             # Individual chat page
│   │
│   ├── components/
│   │   ├── ui/                      # Shadcn UI primitives
│   │   ├── assistant-ui/            # Chat-specific components
│   │   │   ├── thread.tsx           # Main chat thread component (415 lines)
│   │   │   ├── thread-list.tsx      # Chat history list
│   │   │   ├── threadlist-sidebar.tsx # Sidebar wrapper
│   │   │   ├── markdown-text.tsx    # Markdown renderer
│   │   │   ├── attachment.tsx       # File attachment handling
│   │   │   └── tool-fallback.tsx    # Tool execution fallback UI
│   │   ├── login-form.tsx           # Login form with OAuth
│   │   └── signup-form.tsx          # Signup form with validation
│   │
│   ├── ui_components/               # Custom UI components
│   │   ├── ChatButton.tsx           # New chat button
│   │   ├── SignOutButton.tsx        # Logout button
│   │   └── BackButton.tsx           # Navigation back button
│   │
│   ├── lib/
│   │   ├── db.server.ts             # Drizzle database connection
│   │   ├── auth.server.ts           # better-auth configuration
│   │   ├── auth-client.ts           # Client-side auth API
│   │   ├── supabase-client.server.ts # Supabase storage client
│   │   ├── supabase-memory.server.ts # AI memory tool (290 lines)
│   │   ├── utils.ts                 # Utility functions (cn)
│   │   └── schemas/
│   │       ├── auth-schema.server.ts    # User/session tables
│   │       ├── chat-schema.server.ts    # Chats table
│   │       └── project-schema.server.ts # Projects table (future use)
│   │
│   ├── hooks/
│   │   └── use-mobile.ts            # Mobile responsive detection
│   │
│   ├── routes.ts                    # Route configuration
│   ├── root.tsx                     # Root layout & error boundary
│   └── app.css                      # Global styles & CSS variables
│
├── drizzle/                         # Database migrations
├── .env                             # Environment variables (DO NOT COMMIT)
├── .gitignore                       # Git ignore rules
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite build configuration
├── drizzle.config.ts                # Drizzle ORM configuration
└── react-router.config.ts           # React Router SSR config
```

## Key Features

### 1. AI Chat with Memory
- **Claude Sonnet 4.5** integration for intelligent conversations
- **Memory Tool**: AI can persist information across conversations using Supabase storage
  - File operations: create, view, edit, delete, rename
  - Structured storage in `/memories` directory per user/project
  - Atomic operations with validation

### 2. Web Search & Fetch
- **Web Search Tool**: AI can search the web for current information
- **Web Fetch Tool**: AI can fetch and analyze web pages

### 3. Authentication
- Email/password authentication
- Google OAuth integration
- Session management with better-auth

### 4. Chat Management
- Create multiple chat sessions
- Persistent chat history (stored in Supabase)
- Chat deletion
- Sidebar with chat list

### 5. UI/UX
- Real-time streaming AI responses
- Markdown rendering with syntax highlighting
- File attachments support
- Mobile-responsive design
- Dark mode support (via CSS variables)
- Animated message transitions

## Architecture Highlights

### Server-Side Rendering (SSR)
React Router 7 provides full-stack capabilities:
- **Loaders**: Server-side data fetching (runs before page render)
- **Actions**: Server-side mutations (form submissions, API calls)
- **Client Loaders**: Hydration and client-side navigation

### Database Schema
**Users & Auth** (better-auth tables):
- `user`, `session`, `account`, `verification`

**Chat Tables**:
- `chats`: chatId, userId, projectId, title, messagesFilePath, timestamps
- `projects`: id, userId, storagePath, timestamps (future feature)

**Storage**:
- Supabase Storage bucket `chats`: Chat message history (JSON files)
- Supabase Storage bucket `projects`: AI memory files per user

### AI Streaming Flow
1. User sends message → POST `/ai`
2. Server loads chat history from Supabase
3. Initializes AI memory tool for user's project
4. Streams response using Vercel AI SDK
5. AI can use tools (memory, web search, web fetch)
6. On completion, saves updated chat history to Supabase

### Memory Tool Architecture
The `SupabaseMemoryTool` class implements `MemoryToolHandlers` interface:
- **Path validation**: Enforces `/memories` prefix
- **Commands**: view, create, str_replace, insert, delete, rename
- **Storage**: Files stored at `{userId}/memories/{filename}`
- **Directory operations**: List, check existence, recursive operations

## Environment Setup

### Prerequisites
- **Bun** (latest version)
- **PostgreSQL** database (already configured)
- **Supabase** account with storage buckets configured
- **Anthropic API** key for Claude
- **Google OAuth** credentials (optional, for OAuth login)

### Environment Variables

You need to create a `.env` file in the root directory. **DO NOT commit this file to git.**

**Important**: There is a local credentials file (separate from `.env`) in the repository that contains the actual values. Contact the repository owner for access to this file, then copy those values into your own `.env` file.

```bash
# Database (PostgreSQL - already set up)
DATABASE_URL="postgresql://user:password@host:port/database"

# Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Authentication
BETTER_AUTH_SECRET="your-random-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:5173"

# AI APIs
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."  # Optional, not actively used

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### Installation & Setup

1. **Install dependencies**:
```bash
bun install
```

2. **Set up environment variables**:
```bash
# Create your .env file
touch .env

# Copy credentials from the local credentials file (ask repo owner)
# Edit .env and paste the credentials
```

3. **Verify database connection**:
The database is already set up and running. The connection will be validated when you start the dev server.

4. **Run development server**:
```bash
bun run dev
```

The app will be available at `http://localhost:5173`

## Testing in Browser

### 1. First Time Setup
1. Navigate to `http://localhost:5173`
2. Click "Sign Up" and create an account (or use Google OAuth if configured)
3. After signup, you'll be redirected to the login page
4. Login with your credentials

### 2. Creating a Chat
1. Once logged in, you'll see the chat home page
2. Click the "New Chat" button
3. A new chat will be created with a unique UUID and opened automatically

### 3. Chatting with AI
1. Type a message in the composer at the bottom
2. Press Enter or click the send arrow button
3. Watch the AI response stream in real-time
4. The AI has access to memory, web search, and web fetch tools

### 4. Testing Memory Feature
The AI can remember information across chat sessions. Try these prompts:

```
"Create a memory file called preferences.txt and remember that my favorite color is blue and I prefer TypeScript over JavaScript"

"What are my preferences?" (test in same or new chat)

"View all my memory files"

"Show me the contents of preferences.txt"
```

The AI will use the memory tool to create, read, and manage files in your personal `/memories` directory stored in Supabase.

### 5. Testing Web Search
Try prompts that require current information:

```
"What's the current weather in San Francisco?"

"Search for recent AI news from this week"

"What are the latest developments in React 19?"
```

### 6. Testing Web Fetch
Ask the AI to fetch and analyze specific web pages:

```
"Fetch the React Router documentation and summarize the key features"

"Go to example.com and tell me what you see"
```

### 7. Testing Chat Management
1. **Create multiple chats**: Click "New Chat" several times
2. **Switch between chats**: Use the sidebar on the left to navigate
3. **Delete a chat**: Click the delete/trash icon next to a chat in the sidebar
4. **Chat persistence**: Refresh the page - your chats and messages should remain

### 8. Testing Authentication
1. Click "Sign Out" button
2. Try logging in with email/password
3. Try logging in with Google OAuth (if configured)
4. Try creating a new account from the signup page

### 9. Testing Responsive Design
1. Resize your browser window to mobile size
2. The sidebar should become collapsible
3. Test the mobile chat experience

## Development Commands

```bash
# Development server (with hot reload)
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Type checking
bun run typecheck
```

## Database Management (If Needed)

**Note**: The database is already set up and running. You typically don't need to run these commands unless you're modifying the schema or setting up a new database instance.

If you need to work with the database schema:

```bash
# View database schema in GUI (Drizzle Studio)
bunx drizzle-kit studio

# Generate new migrations (after modifying schema files)
bunx drizzle-kit generate

# Push schema changes to database (use with caution!)
bunx drizzle-kit push

# Drop all tables and reset (DESTRUCTIVE - use with extreme caution!)
bunx drizzle-kit drop
```

**Schema files are located in**: `app/lib/schemas/`
- `auth-schema.server.ts` - User authentication tables
- `chat-schema.server.ts` - Chat storage table
- `project-schema.server.ts` - Projects table (future feature)

## Known Issues & Limitations

1. **Projects Feature**: Database schema exists but UI/logic is incomplete
   - Currently using `userId` as default project ID
   - Project selection not implemented in UI
   - Multi-project support planned for future

2. **Type Errors**: Some pre-existing TypeScript errors in component prop types
   - Located in `thread-list.tsx`, `threadlist-sidebar.tsx`, `login-form.tsx`, `signup-form.tsx`
   - Functional but need proper type definitions
   - Does not affect runtime behavior

3. **Error Handling**: Basic error handling present, needs improvement
   - Some errors silently logged to console
   - Missing user-facing error messages in certain edge cases
   - Could benefit from toast notifications

4. **OpenAI Support**: Dependency included but not actively used
   - Only Claude (Anthropic) is configured and tested
   - Can be activated by uncommenting code in `ai.ts` and configuring

5. **Memory Tool**: Basic path validation present
   - Enforces `/memories` prefix for all operations
   - Recursive directory deletion not fully implemented
   - Could benefit from more robust file size limits

## Code Quality Notes

Recent refactoring (see git history):
- ✅ Removed 900+ lines of dead code and test files
- ✅ Eliminated all `any` types in favor of proper TypeScript interfaces
- ✅ Removed unused imports and debug console.logs
- ✅ Cleaned up commented code blocks
- ✅ Fixed type mismatches and placeholder logic

Still TODO:
- [ ] Fix remaining TypeScript errors in component props
- [ ] Add proper error boundaries and user notifications
- [ ] Extract AI tool definitions to separate module
- [ ] Add unit and integration tests
- [ ] Configure ESLint and Prettier

## Future Enhancements

- [ ] Complete projects feature (multi-project support per user)
- [ ] Implement proper logging (replace console.log with structured logging)
- [ ] Add real-time chat updates (WebSocket/Server-Sent Events)
- [ ] Add file upload support for chat attachments
- [ ] Add chat export functionality (JSON, Markdown, PDF)
- [ ] Add user settings page (preferences, API keys management)
- [ ] Implement rate limiting and usage tracking
- [ ] Add proper caching strategy for messages
- [ ] Add chat search functionality
- [ ] Add message editing and regeneration
- [ ] Add conversation forking/branching
- [ ] Add collaborative chat rooms

## Troubleshooting

### "Database connection failed"
- Verify your `DATABASE_URL` in `.env` is correct
- Ensure PostgreSQL server is running
- Check network connectivity to database host

### "Supabase error" or "Storage error"
- Verify `SUPABASE_URL` and `SUPABASE_*_KEY` in `.env`
- Ensure storage buckets `chats` and `projects` exist
- Check bucket permissions (should be private with service role access)

### "Anthropic API error"
- Verify `ANTHROPIC_API_KEY` is valid
- Check API quota/billing status at console.anthropic.com
- Ensure you have access to Claude Sonnet 4.5 model

### "Google OAuth not working"
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Check OAuth redirect URIs in Google Console
- Ensure `BETTER_AUTH_URL` matches your local URL

### Build errors or type errors
```bash
# Clean install
rm -rf node_modules bun.lockb
bun install

# Regenerate React Router types
bun run typecheck
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run `bun run typecheck` to verify types (note: some pre-existing errors are expected)
4. Test thoroughly in browser
5. Create a pull request with a clear description

## Performance Notes

- **Chat loading**: Chats are loaded on-demand from Supabase
- **AI streaming**: Responses stream in real-time, not buffered
- **Memory operations**: File operations are atomic and validated
- **Database queries**: Using Drizzle ORM with connection pooling

## Security Considerations

- **Never commit `.env`** to version control
- **API keys**: Stored server-side only, never exposed to client
- **Authentication**: Session-based with better-auth
- **Database**: All queries use parameterized statements (Drizzle ORM)
- **Storage**: Supabase storage uses row-level security policies
- **CORS**: Configured for local development only

## License

[Add your license here]

## Support

For questions or issues:
1. Check this documentation first
2. Review the git commit history for recent changes
3. Open an issue on GitHub
4. Contact the repository owner

---

**Last Updated**: January 2025
**React Router Version**: 7.9.2
**Claude Model**: Sonnet 4.5
