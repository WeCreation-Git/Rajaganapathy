// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lsojkcawjulibuldotig.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzb2prY2F3anVsaWJ1bGRvdGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MjkyMjgsImV4cCI6MjA2OTAwNTIyOH0.zedu3tHtBSIz76MjwczYTVSsYJ_jA7anfc6P5uXD8Xg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
