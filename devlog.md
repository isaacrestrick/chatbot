Here is the question, do i make without projects, and refactor to include projects
or just build in projects off the jump

Remember:
chat/* may be a simplifcation idk... can add validation to that later.
weird auth issue

With this new understanding:
- what i need is some api routes that beep and bop around my "db" and "supabase" clients
- and i need to hookup useChat and my buttons to such api routes
- and i need to manage the thread sidebar

Understandings:

right now, chat button navigates to /chat (and back button goes back home to /)
signup.tsx wraps signup-form which is supposedly ui... same w login... If time, make more React Routery
Auth works. API is hit through client
/ai is hit by useChat in layout. its basically the api\\

Layout has useChat => useChatRuntimeAIDSK, feeds into chat.tsx (home too but doesnt matter) with sidebar and runtime

Simplifications:
- if the guide just says duuururr put an id in useChat maybe i just do that, and then associate it intelligently outside of the route.


New Chat Button First Time flow:
- 

Top Down:
Click ChatButton -> If no new project, create new project with name

Have a db client to drizzle through the db. Have a supabase client to work with my buckets.
Have a file which will have shit to use those.

What are my routes?

/

/:user_id/chats -> get [(chat_id, project_id, chat_name)]
/:user_id/projects -> get [(project_id, project_name)]
/projects/:projectId/chats/:chatId -> get [()]

What do I need to understand better to complete this task?
My own codebase. A little bit more of react router loader and action.

NEED:

I need functions that access and mofidy the project bucket

I need functions that access and modify the chat bucket

I need functions that access and modify the project, chat tables

Which do I need?

I need to GET a list of chat titles, ids, their projects for a user. This is done by querying chat table by user id maybe join on project and name too and LOADING it into the sidebar state.
 - this will also require getting their project
 - the result of this operation is that the chats are LOADED into the sidebar's state, grouped by project and sorted by updated time too. The projects will also be sorted by updated time

When the user creates a new chat, 
- If a user has no projects, they should be prompted to either create a project (name). THIS SHOULD BE ENTERED INTO THE MODEL PROMPT FOR THAT CHAT!!! or accept the option to be given a default project

          - This flow is triggered on the new chat button next to sign out.          - This flow is triggered on the new chat button next to sign out.
          - This flow is triggered on the new chat button next to sign out.
          - This flow is triggered on the new chat button next to sign out.

when a new chat is created i need to update the chat list. This is an ACTION

I need to create a new chat for a user. In the database

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

What is a good way to style this?
You are accessing the DB through drizzle, and the files through supabase.

I propose two raw files should suffice, for the critical building blocks...

better auth request handler and client though...

Unified file of needed functions? NO. that will go in each loader and action...

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

auth client is analagous to axios, auth server is analagous to express




Click Chat Button => Create new chat. How does it interact with which project is selected?

Same thing with new thread.


What does UI need to do?

What does server need to do?


Fix later:
- env... in client

The Researcher
- Researches stuff with you and builds up knowledge base together! And you can edit it
- Plate to edit knowledge bases

Data representation:

userid/projectid/memories/???

userid/chatid


First, what am I making?
Calendar MCP Server
Github MCP Server
Supabase MCP Server ?
Discord MCP Server ?

Perhaps a specific collection of MCP servers would be valuable

Maybe admit I am uninspired and maximize the experience from there. Claude Sonnet 4.5, GPT-5, Web Search tool


As functional a Claude Sonnet 4.5 with memory implementation as I can get. I'll add web search, maybe some related bells and whistles too.
But the novel thing is going to be the memories. But the file-based memory, on supabase, which the user will be able to observe.

Then next can (CONSIDER) MCP but there is no point because if it was good people would actually use it...

DIAGRAMS!!!!!!!!!!!!!!!!!!!!!!
Web Browser

Brainrot

Bad Advice

ChartBot


Coding Bundle
But the problem is they are bad

Browser use

Code

Definite Too doo:
A sidebar with a list of chats and a "new chat" button
Different chats accessible by ID, e.g. /chat/{id}
Users don't see each other's chats
Chats are saved between sessions