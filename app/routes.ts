import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    layout("routes/chats/layout.tsx", [
        index("routes/chats/home.tsx"), 
        route("chat/:id", "routes/chats/chat.tsx", { id: "chat" })
    ], {id: "chatLayout"}),
    route("api/auth/*", "routes/api.auth.$.ts"),
    route("api/chat/delete/:id", "routes/api.deletechat.ts"),
    route("ai", "routes/ai.ts"),
    route("login", "routes/login.tsx"),
    route("signup", "routes/signup.tsx")

] satisfies RouteConfig;