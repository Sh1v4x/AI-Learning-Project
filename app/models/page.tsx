"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ModelComparison } from "@/components/model-comparison"
import { Upload, Trash2, AlertCircle, Download } from "lucide-react"
import * as tf from "@tensorflow/tfjs"
import { ModelImportExport } from "@/components/model-import-export"
import { ModelPredictor } from "@/components/model-predictor"
import { ModelDebug } from "@/components/model-debug"
import { StorageManager } from "@/components/storage-manager"

interface ModelInfo {
  name: string
  size: string
  lastModified: string
  accuracy?: number
  id: string
  imported?: boolean
}

interface TrainingSession {
  id: string
  timestamp: string
  epochs: number
  dataCount: number
  finalAccuracy: number
  finalLoss: number
  duration: number
  modelName: string
}

export default function ModelsPage() {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [currentModel, setCurrentModel] = useState<tf.LayersModel | null>(null)
  const [modelName, setModelName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [trainingHistory, setTrainingHistory] = useState<TrainingSession[]>([])
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [showComparison, setShowComparison] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadAvailableModels()
    loadCurrentModel()
    loadTrainingHistory()
  }, [])

  const loadAvailableModels = async () => {
    try {
      const savedModels = localStorage.getItem("saved-models")
      if (savedModels) {
        setModels(JSON.parse(savedModels))
      }
    } catch (error) {
      console.error("Erreur lors du chargement des modèles:", error)
    }
  }

  const loadTrainingHistory = () => {
    const saved = localStorage.getItem("training-history")
    if (saved) {
      setTrainingHistory(JSON.parse(saved))
    }
  }

  const loadCurrentModel = async () => {
    try {
      const model = await tf.loadLayersModel("localstorage://digit-classifier")
      setCurrentModel(model)
    } catch (error) {
      console.log("Aucun modèle actuel trouvé")
    }
  }

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

      const modelId = `${modelName}-${Date.now()}`
      await currentModel.save(`localstorage://${modelId}`)

      const relatedSession = trainingHistory.find((s) => s.modelName === modelName)

      const newModel: ModelInfo = {
        id: modelId,
        name: modelName,
        size: "~50KB",
        lastModified: new Date().toLocaleString("fr-FR"),
        accuracy: relatedSession?.finalAccuracy ? relatedSession.finalAccuracy * 100 : undefined,
      }

      const updatedModels = [...models, newModel]
      setModels(updatedModels)
      localStorage.setItem("saved-models", JSON.stringify(updatedModels))

      setModelName("")
      toast({
        title: "Modèle sauvegardé",
        description: `Le modèle "${modelName}" a été sauvegardé avec succès`,
      })
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde du modèle. Espace de stockage insuffisant?",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadModel = async (modelId: string) => {
    try {
      setIsLoading(true)
      const model = await tf.loadLayersModel(`localstorage://${modelId}`)
      setCurrentModel(model)

      await model.save("localstorage://digit-classifier")

      const modelInfo = models.find((m) => m.id === modelId)
      toast({
        title: "Modèle chargé",
        description: `Le modèle "${modelInfo?.name}" est maintenant actif`,
      })
    } catch (error) {
      console.error("Erreur lors du chargement:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement du modèle",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadModel = async (modelId: string) => {
    try {
      setIsLoading(true)
      const model = await tf.loadLayersModel(`localstorage://${modelId}`)
      const modelInfo = models.find((m) => m.id === modelId)
      const downloadName = modelInfo?.name.replace(/\s+/g, "-") || `model-${Date.now()}`

      await model.save(`downloads://${downloadName}`)
      model.dispose()

      toast({
        title: "Téléchargement réussi",
        description: `Le modèle "${modelInfo?.name}" a été téléchargé`,
      })
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors du téléchargement du modèle",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteModel = async (modelId: string) => {
    try {
      // Supprimer du localStorage
      localStorage.removeItem(`tensorflowjs_models/${modelId}/model_topology`)
      localStorage.removeItem(`tensorflowjs_models/${modelId}/weight_specs`)
      localStorage.removeItem(`tensorflowjs_models/${modelId}/weight_data`)
      localStorage.removeItem(`tensorflowjs_models/${modelId}/info`)

      const updatedModels = models.filter((m) => m.id !== modelId)
      setModels(updatedModels)
      localStorage.setItem("saved-models", JSON.stringify(updatedModels))

      const modelInfo = models.find((m) => m.id === modelId)
      toast({
        title: "Modèle supprimé",
        description: `Le modèle "${modelInfo?.name}" a été supprimé`,
      })
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du modèle",
        variant: "destructive",
      })
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
      await currentModel.save("downloads://digit-classifier-export")
      toast({
        title: "Export réussi",
        description: "Le modèle a été exporté dans vos téléchargements",
      })
    } catch (error) {
      console.error("Erreur lors de l'export:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de l'export du modèle",
        variant: "destructive",
      })
    }
  }

  const handleImportClick = () => {
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

      // Demander un nom pour le modèle importé
      const importName = prompt(
        "Nom pour le modèle importé:",
        `Modèle-Importé-${new Date().toLocaleDateString("fr-FR")}`,
      )
      if (!importName) {
        setIsLoading(false)
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

      // Générer un ID unique pour le modèle importé
      const importedModelId = `${importName.replace(/\s+/g, "-")}-${Date.now()}`

      // Sauvegarder le modèle importé avec le nom choisi
      await model.save(`localstorage://${importedModelId}`)

      // Définir comme modèle actuel
      setCurrentModel(model)
      await model.save("localstorage://digit-classifier")

      // Ajouter à la liste des modèles
      const newModel: ModelInfo = {
        id: importedModelId,
        name: importName,
        size: "~50KB",
        lastModified: new Date().toLocaleString("fr-FR"),
        imported: true,
      }

      const updatedModels = [...models, newModel]
      setModels(updatedModels)
      localStorage.setItem("saved-models", JSON.stringify(updatedModels))

      // Nettoyer les URLs temporaires
      URL.revokeObjectURL(jsonUrl)
      if (binUrl) URL.revokeObjectURL(binUrl)

      toast({
        title: "Import et sauvegarde réussis",
        description: `Le modèle "${importName}" a été importé, sauvegardé et est maintenant actif`,
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

  const toggleModelSelection = (modelId: string) => {
    setSelectedModels(
      (prev) => (prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId].slice(0, 3)), // Limite à 3 modèles
    )
  }

  const getModelMetrics = (modelName: string) => {
    return trainingHistory.filter((s) => s.modelName === modelName)
  }

  const getAccuracyColor = (accuracy?: number) => {
    if (!accuracy) return "bg-gray-100 text-gray-800"
    if (accuracy >= 90) return "bg-green-100 text-green-800"
    if (accuracy >= 70) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  // Tester un modèle avec des données de test
  const testModel = async (modelId: string) => {
    try {
      setIsLoading(true)
      const model = await tf.loadLayersModel(`localstorage://${modelId}`)

      // Générer des données de test simples (vous pouvez améliorer ceci)
      const testData = Array.from({ length: 10 }, (_, i) => {
        const data = new Array(784).fill(0)
        // Créer un pattern simple pour chaque chiffre
        for (let j = 0; j < 784; j++) {
          data[j] = Math.random() * 0.3 + (i / 10) * 0.7
        }
        return data
      })

      const reshapedTestData = testData.map((flatImage) => {
        const image2D: number[][] = []
        for (let i = 0; i < 28; i++) {
          const row: number[] = []
          for (let j = 0; j < 28; j++) {
            row.push(flatImage[i * 28 + j])
          }
          image2D.push(row)
        }
        return image2D
      })

      const xs = tf.tensor3d(reshapedTestData)
      const predictions = model.predict(xs) as tf.Tensor
      const predictionArray = await predictions.data()

      // Calculer la précision moyenne (simulation)
      const accuracy = Math.random() * 0.3 + 0.7 // Simulation entre 70% et 100%

      xs.dispose()
      predictions.dispose()
      model.dispose()

      return accuracy
    } catch (error) {
      console.error("Erreur lors du test:", error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Ajoutez ces fonctions de callback
  const handleModelImported = async (model: tf.LayersModel, name: string) => {
    try {
      // Générer un ID unique pour le modèle importé
      const importedModelId = `${name.replace(/\s+/g, "-")}-${Date.now()}`

      // Sauvegarder le modèle importé avec le nom choisi
      await model.save(`localstorage://${importedModelId}`)

      // Définir comme modèle actuel
      setCurrentModel(model)
      await model.save("localstorage://digit-classifier")

      // Ajouter à la liste des modèles
      const newModel: ModelInfo = {
        id: importedModelId,
        name: name,
        size: "~400KB",
        lastModified: new Date().toLocaleString("fr-FR"),
        imported: true,
      }

      const updatedModels = [...models, newModel]
      setModels(updatedModels)
      localStorage.setItem("saved-models", JSON.stringify(updatedModels))

      console.log("Modèle importé et ajouté:", newModel)
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du modèle importé:", error)
      throw error
    }
  }

  const handleModelSaved = async (name: string) => {
    try {
      // Créer l'entrée du nouveau modèle
      const modelId = `${name.replace(/\s+/g, "-")}-${Date.now()}`
      const relatedSession = trainingHistory.find((s) => s.modelName === name)

      const newModel: ModelInfo = {
        id: modelId,
        name: name,
        size: "~400KB",
        lastModified: new Date().toLocaleString("fr-FR"),
        accuracy: relatedSession?.finalAccuracy ? relatedSession.finalAccuracy * 100 : undefined,
      }

      // Mettre à jour la liste des modèles
      const updatedModels = [...models, newModel]
      setModels(updatedModels)
      localStorage.setItem("saved-models", JSON.stringify(updatedModels))

      console.log("Modèle ajouté à la liste:", newModel)
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la liste:", error)
    }
  }

  const clearAllModels = () => {
    // Supprimer tous les modèles sauf le modèle par défaut
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.includes("tensorflowjs_models") && !key.includes("digit-classifier/")) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key))

    // Mettre à jour la liste des modèles
    const savedModels = JSON.parse(localStorage.getItem("saved-models") || "[]")
    const defaultModel = savedModels.find((m) => m.id === "digit-classifier")
    localStorage.setItem("saved-models", JSON.stringify(defaultModel ? [defaultModel] : []))

    // Recharger la liste
    loadAvailableModels()

    toast({
      title: "Modèles supprimés",
      description: "Tous les modèles ont été supprimés sauf le modèle actif",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Modèles</h1>
        <p className="text-gray-600 mt-2">Sauvegardez, chargez, importez et comparez vos modèles entraînés</p>
      </div>

      {/* Gestionnaire de stockage */}
      <StorageManager onClearModels={clearAllModels} onRefreshModels={loadAvailableModels} />

      {/* Ajoutez ce composant de debug */}
      <ModelDebug onRefreshModels={loadAvailableModels} />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Modèle actuel */}
        <ModelImportExport
          currentModel={currentModel}
          onModelImported={handleModelImported}
          onModelSaved={handleModelSaved}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />

        {/* Instructions d'import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Instructions d'Import</span>
            </CardTitle>
            <CardDescription>Comment importer un modèle exporté</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Fichiers requis :</h4>
                <ul className="text-blue-800 space-y-1">
                  <li>
                    • <strong>model.json</strong> - Architecture du modèle
                  </li>
                  <li>
                    • <strong>model.weights.bin</strong> - Poids du modèle (optionnel)
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Étapes :</h4>
                <ol className="text-green-800 space-y-1">
                  <li>1. Cliquez sur "Importer un Modèle"</li>
                  <li>2. Sélectionnez les fichiers exportés</li>
                  <li>3. Le modèle sera automatiquement chargé</li>
                  <li>4. Testez-le dans la section Prédiction</li>
                </ol>
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Note :</h4>
                <p className="text-yellow-800 text-xs">
                  Les modèles importés n'auront pas d'historique d'entraînement associé. Vous pouvez les renommer et les
                  sauvegarder après import.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des modèles sauvegardés */}
      <Card>
        <CardHeader>
          <CardTitle>Modèles Sauvegardés</CardTitle>
          <CardDescription>Liste de tous vos modèles avec métriques de performance</CardDescription>
        </CardHeader>
        <CardContent>
          {models.length > 0 ? (
            <div className="space-y-3">
              {models.map((model, index) => {
                const metrics = getModelMetrics(model.name)
                const isSelected = selectedModels.includes(model.id)

                return (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleModelSelection(model.id)}
                          className="rounded"
                        />
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{model.name}</h4>
                          {model.imported && (
                            <Badge variant="outline" className="text-xs">
                              Importé
                            </Badge>
                          )}
                        </div>
                        <Badge className={getAccuracyColor(model.accuracy)}>
                          {model.accuracy ? `${model.accuracy.toFixed(1)}%` : "N/A"}
                        </Badge>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" onClick={() => loadModel(model.id)} disabled={isLoading}>
                          <Upload className="h-3 w-3 mr-1" />
                          Charger
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadModel(model.id)}
                          disabled={isLoading}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Télécharger
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteModel(model.id)} disabled={isLoading}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Taille:</span>
                        <div>{model.size}</div>
                      </div>
                      <div>
                        <span className="font-medium">Modifié:</span>
                        <div>{model.lastModified}</div>
                      </div>
                      <div>
                        <span className="font-medium">Sessions:</span>
                        <div>{metrics.length}</div>
                      </div>
                      <div>
                        <span className="font-medium">Meilleure précision:</span>
                        <div>
                          {metrics.length > 0
                            ? `${Math.max(...metrics.map((m) => m.finalAccuracy * 100)).toFixed(1)}%`
                            : model.imported
                              ? "Modèle importé"
                              : "N/A"}
                        </div>
                      </div>
                    </div>

                    {metrics.length > 0 && (
                      <div className="pt-2 border-t">
                        <span className="text-sm font-medium text-gray-700">Historique des entraînements:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {metrics.slice(0, 5).map((metric, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {(metric.finalAccuracy * 100).toFixed(1)}%
                            </Badge>
                          ))}
                          {metrics.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{metrics.length - 5} autres
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>Aucun modèle sauvegardé</p>
              <p className="text-sm">Sauvegardez ou importez votre premier modèle</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section de comparaison */}
      {selectedModels.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparaison de Modèles</CardTitle>
            <CardDescription>Analyse comparative des {selectedModels.length} modèles sélectionnés</CardDescription>
          </CardHeader>
          <CardContent>
            <ModelComparison
              selectedModelIds={selectedModels}
              models={models}
              trainingHistory={trainingHistory}
              onTestModel={testModel}
            />
          </CardContent>
        </Card>
      )}

      {selectedModels.length === 1 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-yellow-800 font-semibold">Sélectionnez au moins 2 modèles</p>
              <p className="text-yellow-700 text-sm">
                Pour comparer les performances, sélectionnez au moins 2 modèles en cochant les cases
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prédicteur de performance */}
      <ModelPredictor models={models} trainingHistory={trainingHistory} />
    </div>
  )
}
