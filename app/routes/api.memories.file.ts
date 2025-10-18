import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router"
import { redirect } from 'react-router'

export async function loader({ request }: LoaderFunctionArgs) {
    const { auth } = await import("../lib/auth.server");
    const { supabase } = await import("../lib/supabase-client.server");

    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
        throw redirect("/login")
    }

    const url = new URL(request.url);
    const path = url.searchParams.get('path');

    if (!path) {
        return Response.json({ error: 'Path parameter required' }, { status: 400 });
    }

    const userId = session.user.id;
    const fullPath = `${userId}/memories/${path}`;

    try {
        const { data, error } = await supabase
            .storage
            .from("projects")
            .download(fullPath);

        if (error) {
            return Response.json({ error: error.message }, { status: 404 });
        }

        const content = await data.text();
        return Response.json({ content, path });
    } catch (error: any) {
        console.error("Error reading file:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function action({ request }: ActionFunctionArgs) {
    const { auth } = await import("../lib/auth.server");
    const { supabase } = await import("../lib/supabase-client.server");

    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
        throw redirect("/login")
    }

    const userId = session.user.id;
    const body = await request.json();
    const method = request.method;

    try {
        if (method === 'POST' || method === 'PUT') {
            // Create or update file
            const { path, content } = body;
            if (!path) {
                return Response.json({ error: 'Path required' }, { status: 400 });
            }

            const fullPath = `${userId}/memories/${path}`;
            const { error } = await supabase
                .storage
                .from('projects')
                .upload(fullPath, content || '', {
                    contentType: 'text/plain; charset=utf-8',
                    upsert: true
                });

            if (error) {
                return Response.json({ error: error.message }, { status: 500 });
            }

            return Response.json({ success: true, path });
        } else if (method === 'DELETE') {
            // Delete file
            const { path } = body;
            if (!path) {
                return Response.json({ error: 'Path required' }, { status: 400 });
            }

            const fullPath = `${userId}/memories/${path}`;
            const { error } = await supabase
                .storage
                .from('projects')
                .remove([fullPath]);

            if (error) {
                return Response.json({ error: error.message }, { status: 500 });
            }

            return Response.json({ success: true });
        } else if (method === 'PATCH') {
            // Rename file
            const { oldPath, newPath } = body;
            if (!oldPath || !newPath) {
                return Response.json({ error: 'oldPath and newPath required' }, { status: 400 });
            }

            const oldFullPath = `${userId}/memories/${oldPath}`;
            const newFullPath = `${userId}/memories/${newPath}`;

            // Copy to new location
            const { error: copyError } = await supabase
                .storage
                .from('projects')
                .copy(oldFullPath, newFullPath);

            if (copyError) {
                return Response.json({ error: copyError.message }, { status: 500 });
            }

            // Remove old file
            const { error: removeError } = await supabase
                .storage
                .from('projects')
                .remove([oldFullPath]);

            if (removeError) {
                return Response.json({ error: removeError.message }, { status: 500 });
            }

            return Response.json({ success: true, newPath });
        }

        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    } catch (error: any) {
        console.error("Error in file operation:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
