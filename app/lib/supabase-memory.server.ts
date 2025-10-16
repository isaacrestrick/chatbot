import * as path from 'path';
import { type MemoryToolHandlers } from '@anthropic-ai/sdk/helpers/beta/memory';
import { supabase } from '~/lib/supabase-client.server';
import type { SupabaseClient } from '@supabase/supabase-js';


export class SupabaseMemoryTool implements MemoryToolHandlers {
  private project_id: string;
  private memoryRoot: string;
  private supabase: SupabaseClient;

  constructor(project_id: string) {
    this.project_id = project_id;
    
    this.memoryRoot = path.join(this.project_id, 'memories');
    this.supabase = supabase

  }

  static async init(project_id: string): Promise<SupabaseMemoryTool> {
    const memory = new SupabaseMemoryTool(project_id);
    const keepPath = path.join(memory.memoryRoot, '.keep');
    await memory.supabase
      .storage
      .from('projects')
      .upload(
        keepPath,
        new Blob(['a'], { type: 'text/plain' }),
        { upsert: true }
      );
    return memory;
  }

  public validatePath(memoryPath: string): string {
    if (!memoryPath.startsWith('/memories')) {
      throw new Error(`Path must start with /memories, got: ${memoryPath}`);
    }

    const relativePath = memoryPath.slice('/memories'.length).replace(/^\//, '');
    const fullPath = relativePath ? path.join(this.memoryRoot, relativePath) : this.memoryRoot;

    return fullPath;
  }

  async isDirectory(path: string): Promise<boolean> {
    const { data: folderData, error: folderError } = await supabase
    .storage
    .from('projects')
    .list(path, { limit: 1 });
    const folderExists = !folderError && (folderData?.length ?? 0) > 0;
    return folderExists
  }

  async view(command: { path: string; view_range?: [number, number] }): Promise<string> {
    const fullPath = this.validatePath(command.path);

    if (!(await this.exists(fullPath))) {
      throw new Error(`Path not found: ${command.path}`);
    }

    //const stat = await fs.stat(fullPath);

    if (await this.isDirectory(fullPath)) {


      const items: string[] = [];

      const { data: dirContents, error } = await supabase
        .storage
        .from("projects")
        .list(fullPath, {
          limit: 1000,
          sortBy: { column: 'name', order: 'asc' }
        });

      for (const item of dirContents ?? []) {
        if (item.name.startsWith('.')) {
          continue;
        }
        items.push(item.metadata === null ? `${item.name}/` : item.name);
      }


      return `Directory: ${command.path}\n` + items.map((item) => `- ${item}`).join('\n');


    } else if (await this.exists(fullPath)) {


      const { data, error } = await supabase
        .storage
        .from("projects")
        .download(fullPath)
      if (error) {
        throw error;
      }
      const content = await data.text()
      const lines = content.split('\n');

      let displayLines = lines;
      let startNum = 1;

      if (command.view_range && command.view_range.length === 2) {
        console.log("here!")
        const startLine = Math.max(1, command.view_range[0]!) - 1;
        const endLine = command.view_range[1] === -1 ? lines.length : command.view_range[1];
        displayLines = lines.slice(startLine, endLine);
        startNum = startLine + 1;
      }

      const numberedLines = displayLines.map(
        (line, i) => `${String(i + startNum).padStart(4, ' ')}: ${line}`,
      );

      return numberedLines.join('\n');


    } else {
      throw new Error(`Path not found: ${command.path}`);
    }
  }

  async create(command: { path: string; file_text: string; overwrite?: boolean }): Promise<string> {
    const fullPath = this.validatePath(command.path)

    const { error } = await supabase
      .storage
      .from('projects')
      .upload(fullPath, command.file_text, {
        contentType: 'text/plain; charset=utf-8',
        upsert: true
      })

    if (error) throw error

    return `File created successfully at ${command.path}`;

  }

  async str_replace(command: { path: string; old_str: string; new_str: string }): Promise<string> {
    const fullPath = this.validatePath(command.path);

    if (!(await this.exists(fullPath))) {
      throw new Error(`File not found: ${command.path}`);
    }


    if (await this.isDirectory(fullPath)) {
      throw new Error(`Path is not a file: ${command.path}`);
    }

    const { data, error: downloadErr } = await supabase
      .storage
      .from("projects")
      .download(fullPath)
    if (downloadErr) {
      throw downloadErr;
    }
    const content = await data.text()
    const count = content.split(command.old_str).length - 1;

    if (count === 0) {
      throw new Error(`Text not found in ${command.path}`);
    } else if (count > 1) {
      throw new Error(`Text appears ${count} times in ${command.path}. Must be unique.`);
    }

    const newContent = content.replace(command.old_str, command.new_str);
    const { error } = await supabase
      .storage
      .from('projects')
      .upload(fullPath, newContent, {
        contentType: 'text/plain; charset=utf-8',
        upsert: true
      })

    if (error) throw error

    return `File ${command.path} has been edited`;
  }

  async insert(command: { path: string; insert_line: number; insert_text: string }): Promise<string> {
    const fullPath = this.validatePath(command.path);

    if (!(await this.exists(fullPath))) {
      throw new Error(`File not found: ${command.path}`);
    }

    if (await this.isDirectory(fullPath)) {
      throw new Error(`Path is not a file: ${command.path}`);
    }

    const { data, error: downloadErr } = await supabase
      .storage
      .from("projects")
      .download(fullPath);
    if (downloadErr) {
      throw downloadErr;
    }
    const content = await data.text();
    const lines = content.split('\n');

    if (command.insert_line < 0 || command.insert_line > lines.length) {
      throw new Error(`Invalid insert_line ${command.insert_line}. Must be 0-${lines.length}`);
    }

    lines.splice(command.insert_line, 0, command.insert_text.replace(/\n$/, ''));
    const { error: uploadError } = await supabase
      .storage
      .from('projects')
      .upload(fullPath, lines.join('\n'), {
        contentType: 'text/plain; charset=utf-8',
        upsert: true
      });
    if (uploadError) throw uploadError;
    return `Text inserted at line ${command.insert_line} in ${command.path}`;
  }

  async delete(command: { path: string }): Promise<string> {
    const fullPath = this.validatePath(command.path);

    if (command.path === '/memories') {
      throw new Error('Cannot delete the /memories directory itself');
    }

    if (!(await this.exists(fullPath))) {
      throw new Error(`Path not found: ${command.path}`);
    }
    if (await this.isDirectory(fullPath)) {

      // Not yet a big complicate recursive delete.
      const { error } = await supabase
        .storage
        .from('projects')
        .remove([fullPath])
      if (error) throw new Error('Directory deletion failed');
      return `Directory deleted: ${command.path}`;

    } else {
      const { error } = await supabase
        .storage
        .from('projects')
        .remove([fullPath])
      if (error) throw new Error('Directory deletion failed');
      return `Directory deleted: ${command.path}`;
    }
  }

  async rename(command: { old_path: string; new_path: string }): Promise<string> {
    const oldFullPath = this.validatePath(command.old_path);
    const newFullPath = this.validatePath(command.new_path);

    if (!(await this.exists(oldFullPath))) {
      throw new Error(`Source path not found: ${command.old_path}`);
    }

    if (await this.exists(newFullPath)) {
      throw new Error(`Destination already exists: ${command.new_path}`);
    }

    /*const newDir = path.dirname(newFullPath);
    if (!(await exists(newDir))) {
      await fs.mkdir(newDir, { recursive: true });
    }*/

    const { error: copyError } = await supabase
      .storage
      .from('projects')
      .copy(oldFullPath, newFullPath);
    if (copyError) throw new Error(`Failed to copy file for rename: ${copyError.message}`);

    const { error: removeError } = await supabase
      .storage
      .from('projects')
      .remove([oldFullPath]);
    if (removeError) throw new Error(`Failed to remove old file after rename: ${removeError.message}`);
    return `Renamed ${command.old_path} to ${command.new_path}`;
  }
  
  async exists(path: string) {
    const { data: fileData, error: fileError } = await supabase.storage.from('projects').download(path);
    const fileExists = !fileError && !!fileData;
    if (fileExists) {
      return true
    }
    return this.isDirectory(path)
  }
}