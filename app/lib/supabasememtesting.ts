import { SupabaseMemoryTool, exists } from '~/lib/supabase-memory.server'


const supamemory = await SupabaseMemoryTool.init("test_project")
console.log(supamemory.project_id, supamemory.memoryRoot)

const supamemorytwo = await SupabaseMemoryTool.init("test_project2")
console.log(supamemorytwo.project_id, supamemorytwo.memoryRoot)

//console.log(supamemory.validatePath("/memories/cheese/tacos.txt"))
/*const exists = await supamemory.exists("test_project/memories")
console.log(exists)
const doesntexist = await supamemory.exists("test_prrr")
console.log(doesntexist)
const keeper = await supamemory.exists("test_project/memories/keep.txt")
console.log(keeper)

const viewed = await supamemory.view({path: "/memories"})
console.log(viewed)

const viewedFile = await supamemory.view({path: "/memories/tacotuesday.md"})
console.log(viewedFile)

const viewedFiletentotwetny = await supamemory.view({path: "/memories/tacotuesday.md", view_range:[10, 20]})
console.log(viewedFiletentotwetny)
*/
//const viewedMadeup = await supamemory.view({path: "/memmies/gru"})
//console.log(viewedMadeup)
/*
const newFile = await supamemory.create({path: "/memories/isaacfolder/isaac.md", file_text: "Hi I am isaac"})

const viewedNewFile = await supamemory.view({path: "/memories/isaacfolder/isaac.md"})
console.log(viewedNewFile)

const viewed = await supamemory.view({path: "/memories"})
console.log(viewed)

const bsfile = await supamemory.view({path: "/memoriesa/isaacfolder/isaac.md"})
console.log(bsfile)
*/
//const newBs = await supamemory.create({path: "/hahahaha/isaacfolder/isaac.md", file_text: "Hi I am isaac"})


//const bsfile = await supamemory.view({path: "/hahaha/isaacfolder/isaac.md"})
//console.log(bsfile)
/*
const initialFile = await supamemory.view({path: "/memories/keep.txt"})
console.log(initialFile)

const replacedFile = await supamemory.str_replace({
    "command": "str_replace",
    "path": "/memories/ksep.txt", //change me
    "old_str": "a",
    "new_str": "b"
})
console.log(replacedFile)

const viewedFile = await supamemory.view({path: "/memories/keep.txt"})
console.log(viewedFile)


const initialFile = await supamemory.view({path: "/memories/keep.txt"})
console.log(initialFile)

const updatedFile = await supamemory.insert({
    "command": "insert",
    "path": "/memories/keep.txt", //change me
    "insert_line": 5, //change me
    "insert_text": "knock knock, who's there? the supabase police."
})
console.log(updatedFile)

const viewedFile = await supamemory.view({path: "/memories/keep.txt"})
console.log(viewedFile)
*/
/*
const initialFile = await supamemory.view({path: "/memories/test_file.txt"})
console.log(initialFile)

const deletedFile = await supamemory.delete({
    "command": "delete",
    "path": "/memories/test_file.txt",
})
console.log(deletedFile)

const viewedFile = await supamemory.view({path: "/memories/test_file.txt"})
console.log(viewedFile)

const deletedFile = await supamemory.delete({
    "command": "delete",
    "path": "/memories",
})
console.log(deletedFile)*/
/*
const viewedFile = await supamemory.view({path: "/memories/tacotuesday.md"})
console.log(viewedFile)

const renamedFile = await supamemory.rename({old_path: "/memories/tacotuesday.md", new_path: "/memories/tacosaturday.md"})
console.log(renamedFile)

const viewRenamedFile = await supamemory.view({path: "/memories/tacosaturday.md"})
console.log(viewRenamedFile)

const viewOrig = await supamemory.view({path: "/memories/tacotuesday.md"})
console.log(viewOrig)
*/