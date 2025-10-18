import type { LoaderFunctionArgs } from "react-router"
import { redirect } from 'react-router'

export async function loader({ request }: LoaderFunctionArgs) {
    const { auth } = await import("../lib/auth.server");
    const { supabase } = await import("../lib/supabase-client.server");

    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
        throw redirect("/login")
    }

    const userId = session.user.id;
    const memoryRoot = `${userId}/memories`;

    try {
        // Recursively build file tree
        const tree = await buildFileTree(memoryRoot, '');

        return Response.json({ tree, userId });
    } catch (error: any) {
        console.error("Error fetching file tree:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'folder';
    children?: FileNode[];
}

async function buildFileTree(rootPath: string, relativePath: string): Promise<FileNode[]> {
    const { supabase } = await import("../lib/supabase-client.server");
    const fullPath = relativePath ? `${rootPath}/${relativePath}` : rootPath;

    const { data: items, error } = await supabase
        .storage
        .from("projects")
        .list(fullPath, {
            limit: 1000,
            sortBy: { column: 'name', order: 'asc' }
        });

    if (error) {
        console.error(`Error listing ${fullPath}:`, error);
        return [];
    }

    const nodes: FileNode[] = [];

    for (const item of items ?? []) {
        // Skip hidden files
        if (item.name.startsWith('.')) {
            continue;
        }

        const itemPath = relativePath ? `${relativePath}/${item.name}` : item.name;
        const isFolder = item.metadata === null;

        if (isFolder) {
            const children = await buildFileTree(rootPath, itemPath);
            nodes.push({
                name: item.name,
                path: itemPath,
                type: 'folder',
                children
            });
        } else {
            nodes.push({
                name: item.name,
                path: itemPath,
                type: 'file'
            });
        }
    }

    return nodes;
}
