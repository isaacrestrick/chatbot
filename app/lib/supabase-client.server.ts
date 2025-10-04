//import { config } from 'dotenv'
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
//import { resolve } from 'path'
// import { readFile } from 'fs/promises'
// console.log(resolve(__dirname))
// console.log(resolve(__dirname, "../../.env"))
// config({ path: resolve(__dirname, '../../.env') })
export const supabase = createClient(process.env.SUPABASE_PROJECT_URL!, process.env.SUPABASE_API_KEY!)

//console.log(process.env.SUPABASE_PROJECT_URL!, process.env.SUPABASE_API_KEY!)


// const fileContent = await readFile(resolve(__dirname, "../testfiles/test_file2.txt"), 'utf-8')
// console.log(fileContent)
// await uploadChat("123456789", fileContent)
// console.log('fionish')