-- Script de création des tables pour Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- Table pour stocker les données d'entraînement
CREATE TABLE IF NOT EXISTS training_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_data JSONB NOT NULL, -- Array de 784 nombres (28x28 pixels)
    label INTEGER NOT NULL CHECK (label >= 0 AND label <= 9),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour stocker les modèles sauvegardés
CREATE TABLE IF NOT EXISTS saved_models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    model_metadata JSONB NOT NULL, -- Informations sur l'architecture
    accuracy DECIMAL(5,4), -- Précision du modèle (ex: 0.9234)
    epochs INTEGER NOT NULL,
    training_samples INTEGER,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour l'historique des entraînements
CREATE TABLE IF NOT EXISTS training_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model_id UUID REFERENCES saved_models(id) ON DELETE CASCADE,
    epoch INTEGER NOT NULL,
    loss DECIMAL(10,8),
    accuracy DECIMAL(5,4),
    val_loss DECIMAL(10,8),
    val_accuracy DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_training_data_user_id ON training_data(user_id);
CREATE INDEX IF NOT EXISTS idx_training_data_label ON training_data(label);
CREATE INDEX IF NOT EXISTS idx_saved_models_user_id ON saved_models(user_id);
CREATE INDEX IF NOT EXISTS idx_training_history_model_id ON training_history(model_id);

-- Politiques de sécurité RLS (Row Level Security)
ALTER TABLE training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_history ENABLE ROW LEVEL SECURITY;

-- Politique pour training_data
CREATE POLICY "Users can view their own training data" ON training_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training data" ON training_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training data" ON training_data
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training data" ON training_data
    FOR DELETE USING (auth.uid() = user_id);

-- Politique pour saved_models
CREATE POLICY "Users can view their own models" ON saved_models
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own models" ON saved_models
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own models" ON saved_models
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own models" ON saved_models
    FOR DELETE USING (auth.uid() = user_id);

-- Politique pour training_history
CREATE POLICY "Users can view training history of their models" ON training_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM saved_models 
            WHERE saved_models.id = training_history.model_id 
            AND saved_models.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert training history for their models" ON training_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM saved_models 
            WHERE saved_models.id = training_history.model_id 
            AND saved_models.user_id = auth.uid()
        )
    );
