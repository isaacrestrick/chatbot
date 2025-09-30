import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"), 
    route("signin", "routes/signin.tsx"),
    route("api/auth/*", "routes/api.auth.$.ts"),
    route("chat", "routes/chat.tsx"),
    route("ai", "routes/ai.ts")

] satisfies RouteConfig;