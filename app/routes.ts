import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    layout("routes/chats/layout.tsx", [
        index("routes/chats/home.tsx"), 
        route("chat/:id", "routes/chats/chat.tsx")
    ]),
    route("api/auth/*", "routes/api.auth.$.ts"),
    route("ai", "routes/ai.ts"),
    route("login", "routes/login.tsx"),
    route("signup", "routes/signup.tsx")

] satisfies RouteConfig;