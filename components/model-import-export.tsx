"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Download, FileUp, Save, Upload, AlertCircle, CheckCircle } from "lucide-react"
import * as tf from "@tensorflow/tfjs"

interface ModelImportExportProps {
  currentModel: tf.LayersModel | null
  onModelImported: (model: tf.LayersModel, name: string) => void
  onModelSaved: (name: string) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function ModelImportExport({
  currentModel,
  onModelImported,
  onModelSaved,
  isLoading,
  setIsLoading,
}: ModelImportExportProps) {
  const [modelName, setModelName] = useState("")
  const [importName, setImportName] = useState("")
  const [showImportForm, setShowImportForm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const saveModel = async () => {
    if (!currentModel || !modelName.trim()) {
      toast({
        title: "Erreur",
        description: "Nom de modèle requis et modèle doit être chargé",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Générer un ID unique pour le modèle
      const modelId = `${modelName.replace(/\s+/g, "-")}-${Date.now()}`

      // Sauvegarder le modèle dans localStorage
      await currentModel.save(`localstorage://${modelId}`)

      // Appeler le callback pour mettre à jour la liste des modèles
      onModelSaved(modelName)
      setModelName("")

      toast({
        title: "Modèle sauvegardé",
        description: `Le modèle "${modelName}" a été sauvegardé avec succès`,
      })
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde du modèle",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportModel = async () => {
    if (!currentModel) {
      toast({
        title: "Erreur",
        description: "Aucun modèle à exporter",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const exportName = modelName.trim() || `digit-classifier-${Date.now()}`
      await currentModel.save(`downloads://${exportName}`)

      toast({
        title: "Export réussi",
        description: `Le modèle "${exportName}" a été exporté dans vos téléchargements`,
      })
    } catch (error) {
      console.error("Erreur lors de l'export:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de l'export du modèle",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportClick = () => {
    setShowImportForm(true)
  }

  const handleFileSelect = () => {
    if (!importName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un nom pour le modèle importé",
        variant: "destructive",
      })
      return
    }
    fileInputRef.current?.click()
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    try {
      setIsLoading(true)

      // Vérifier qu'on a les bons fichiers
      const fileArray = Array.from(files)
      const jsonFile = fileArray.find((f) => f.name.endsWith(".json"))
      const binFile = fileArray.find((f) => f.name.endsWith(".bin"))

      if (!jsonFile) {
        toast({
          title: "Erreur",
          description: "Fichier model.json manquant",
          variant: "destructive",
        })
        return
      }

      // Créer des URLs temporaires pour les fichiers
      const jsonUrl = URL.createObjectURL(jsonFile)
      let binUrl: string | undefined

      if (binFile) {
        binUrl = URL.createObjectURL(binFile)
      }

      // Charger le modèle depuis les fichiers
      const model = await tf.loadLayersModel(jsonUrl)

      // Appeler le callback pour gérer le modèle importé
      onModelImported(model, importName.trim())

      // Nettoyer les URLs temporaires
      URL.revokeObjectURL(jsonUrl)
      if (binUrl) URL.revokeObjectURL(binUrl)

      // Réinitialiser le formulaire
      setImportName("")
      setShowImportForm(false)

      toast({
        title: "Import réussi",
        description: `Le modèle "${importName}" a été importé et sauvegardé avec succès`,
      })
    } catch (error) {
      console.error("Erreur lors de l'import:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de l'import du modèle. Vérifiez que les fichiers sont valides.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Sauvegarde et Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Save className="h-5 w-5" />
            <span>Sauvegarder et Exporter</span>
          </CardTitle>
          <CardDescription>Sauvegardez votre modèle localement ou exportez-le</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentModel ? (
            <>
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Modèle chargé et prêt</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="save-name">Nom du modèle</Label>
                <Input
                  id="save-name"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="ex: mon-super-modele-v1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button onClick={saveModel} disabled={isLoading || !modelName.trim()} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
                <Button variant="outline" onClick={exportModel} disabled={isLoading} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>• Sauvegarder : Stocke le modèle dans votre navigateur</p>
                <p>• Exporter : Télécharge les fichiers pour partage/backup</p>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-4">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>Aucun modèle chargé</p>
              <p className="text-sm">Entraînez ou importez un modèle d'abord</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileUp className="h-5 w-5" />
            <span>Importer un Modèle</span>
          </CardTitle>
          <CardDescription>Importez et sauvegardez un modèle depuis des fichiers exportés</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showImportForm ? (
            <Button onClick={handleImportClick} disabled={isLoading} className="w-full">
              <FileUp className="h-4 w-4 mr-2" />
              Commencer l'Import
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="import-name">Nom pour le modèle importé</Label>
                <Input
                  id="import-name"
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                  placeholder="ex: modele-externe-v1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleFileSelect} disabled={isLoading || !importName.trim()} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Sélectionner Fichiers
                </Button>
                <Button variant="outline" onClick={() => setShowImportForm(false)} disabled={isLoading}>
                  Annuler
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".json,.bin"
                onChange={handleFileImport}
                style={{ display: "none" }}
              />
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Instructions :</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>1. Donnez un nom au modèle importé</li>
              <li>2. Sélectionnez les fichiers model.json (+ model.weights.bin si présent)</li>
              <li>3. Le modèle sera automatiquement importé et sauvegardé</li>
              <li>4. Il deviendra le modèle actif pour les prédictions</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Informations */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">Formats Supportés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Sauvegarde locale :</span>
            <span className="font-mono">localStorage</span>
          </div>
          <div className="flex justify-between">
            <span>Export/Import :</span>
            <span className="font-mono">.json + .bin</span>
          </div>
          <div className="flex justify-between">
            <span>Compatibilité :</span>
            <span>TensorFlow.js</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
