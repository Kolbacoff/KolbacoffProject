import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uohtkwtmmdmudhceelzg.supabase.co'
const supabaseAnonKey = 'sb_publishable_BSs4h9Iip84JrYDaRXJxqg_sGLK2dHs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)