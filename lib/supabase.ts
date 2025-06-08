import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour TypeScript
export interface TrainingData {
  id: string
  image_data: number[]
  label: number
  user_id?: string
  created_at: string
}

export interface SavedModel {
  id: string
  name: string
  model_metadata: {
    architecture: string
    layers: number
    parameters: number
  }
  accuracy?: number
  epochs: number
  training_samples?: number
  user_id?: string
  created_at: string
  updated_at: string
}

export interface TrainingHistory {
  id: string
  model_id: string
  epoch: number
  loss?: number
  accuracy?: number
  val_loss?: number
  val_accuracy?: number
  created_at: string
}
