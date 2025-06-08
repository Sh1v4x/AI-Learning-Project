"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { DrawingCanvas } from "@/components/drawing-canvas"
import { TrainingStats } from "@/components/training-stats"
import { TrainingHistory } from "@/components/training-history"
import { StorageManager } from "@/components/storage-manager"
import * as tf from "@tensorflow/tfjs"

interface TrainingDataPoint {
  image: number[]
  label: number
  timestamp: string
  id: string
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

interface EpochMetrics {
  epoch: number
  loss: number
  accuracy: number
  valLoss?: number
  valAccuracy?: number
}

export default function TrainingPage() {
  const [model, setModel] = useState<tf.Sequential | null>(null)
  const [isTraining, setIsTraining] = useState(false)
  const [trainingData, setTrainingData] = useState<TrainingDataPoint[]>([])
  const [currentLabel, setCurrentLabel] = useState<string>("")
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [epochs, setEpochs] = useState(10)
  const [trainingHistory, setTrainingHistory] = useState<TrainingSession[]>([])
  const [currentMetrics, setCurrentMetrics] = useState<EpochMetrics[]>([])
  const [modelName, setModelName] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    tf.ready().then(() => {
      console.log("TensorFlow.js est prêt")
      initializeModel()
      loadTrainingHistory()
      loadSavedDrawings()
    })
  }, [])

  const initializeModel = () => {
    const newModel = tf.sequential({
      layers: [
        tf.layers.flatten({ inputShape: [28, 28] }),
        tf.layers.dense({ units: 128, activation: "relu" }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 10, activation: "softmax" }),
      ],
    })

    newModel.compile({
      optimizer: "adam",
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"],
    })

    setModel(newModel)
  }

  const loadTrainingHistory = () => {
    const saved = localStorage.getItem("training-history")
    if (saved) {
      setTrainingHistory(JSON.parse(saved))
    }
  }

  const loadSavedDrawings = () => {
    const saved = localStorage.getItem("saved-drawings")
    if (saved) {
      setTrainingData(JSON.parse(saved))
    }
  }

  const saveDrawings = (newData: TrainingDataPoint[]) => {
    localStorage.setItem("saved-drawings", JSON.stringify(newData))
  }

  const saveTrainingSession = (session: TrainingSession) => {
    const updated = [...trainingHistory, session]
    setTrainingHistory(updated)
    localStorage.setItem("training-history", JSON.stringify(updated))
  }

  const handleCanvasData = (imageData: number[]) => {
    if (!currentLabel || isNaN(Number.parseInt(currentLabel))) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un chiffre valide (0-9)",
        variant: "destructive",
      })
      return
    }

    const label = Number.parseInt(currentLabel)
    if (label < 0 || label > 9) {
      toast({
        title: "Erreur",
        description: "Le chiffre doit être entre 0 et 9",
        variant: "destructive",
      })
      return
    }

    const newDataPoint: TrainingDataPoint = {
      image: imageData,
      label,
      timestamp: new Date().toISOString(),
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    const updatedData = [...trainingData, newDataPoint]
    setTrainingData(updatedData)
    saveDrawings(updatedData)

    toast({
      title: "Données ajoutées",
      description: `Chiffre ${label} ajouté aux données d'entraînement`,
    })
  }

  const trainModel = async () => {
    if (!model || trainingData.length === 0) {
      toast({
        title: "Erreur",
        description: "Pas de modèle ou de données d'entraînement",
        variant: "destructive",
      })
      return
    }

    if (!modelName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un nom pour ce modèle",
        variant: "destructive",
      })
      return
    }

    setIsTraining(true)
    setTrainingProgress(0)
    setCurrentMetrics([])

    const startTime = Date.now()

    try {
      const imageData = trainingData.map((d) => d.image)
      const labels = trainingData.map((d) => d.label)

      const reshapedData: number[][][] = imageData.map((flatImage) => {
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

      const xs = tf.tensor3d(reshapedData)
      const ys = tf.oneHot(tf.tensor1d(labels, "int32"), 10)

      const epochMetrics: EpochMetrics[] = []

      await model.fit(xs, ys, {
        epochs: epochs,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            const progress = ((epoch + 1) / epochs) * 100
            setTrainingProgress(progress)

            const metrics: EpochMetrics = {
              epoch: epoch + 1,
              loss: logs?.loss || 0,
              accuracy: logs?.acc || 0,
              valLoss: logs?.val_loss,
              valAccuracy: logs?.val_acc,
            }

            epochMetrics.push(metrics)
            setCurrentMetrics([...epochMetrics])

            console.log(`Époque ${epoch + 1}: perte = ${logs?.loss?.toFixed(4)}, précision = ${logs?.acc?.toFixed(4)}`)
          },
        },
      })

      const endTime = Date.now()
      const duration = endTime - startTime

      const finalMetrics = epochMetrics[epochMetrics.length - 1]

      try {
        // Vérifier l'espace disponible avant de sauvegarder
        const storageEstimate = JSON.stringify(localStorage).length * 2 // Approximation en octets
        const modelEstimate = 500000 // ~500KB estimation pour un modèle TensorFlow.js
        const totalEstimate = storageEstimate + modelEstimate

        // Si l'espace est insuffisant, supprimer d'anciens modèles
        if (totalEstimate > 4.5 * 1024 * 1024) {
          // Si on approche 4.5MB
          // Trouver et supprimer le plus ancien modèle
          const modelKeys = []
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.includes("tensorflowjs_models") && key.includes("model_topology")) {
              const modelId = key.split("/")[1]
              if (modelId !== "digit-classifier") {
                // Ne pas supprimer le modèle par défaut
                modelKeys.push(modelId)
              }
            }
          }

          if (modelKeys.length > 0) {
            // Supprimer le premier modèle trouvé
            const oldModelId = modelKeys[0]
            localStorage.removeItem(`tensorflowjs_models/${oldModelId}/model_topology`)
            localStorage.removeItem(`tensorflowjs_models/${oldModelId}/weight_specs`)
            localStorage.removeItem(`tensorflowjs_models/${oldModelId}/weight_data`)
            localStorage.removeItem(`tensorflowjs_models/${oldModelId}/info`)

            // Mettre à jour la liste des modèles
            const savedModels = JSON.parse(localStorage.getItem("saved-models") || "[]")
            const updatedModels = savedModels.filter((m) => m.id !== oldModelId)
            localStorage.setItem("saved-models", JSON.stringify(updatedModels))

            toast({
              title: "Espace libéré",
              description: "Un ancien modèle a été supprimé pour faire de la place",
            })
          }
        }

        // Sauvegarder le modèle avec un nom unique
        const modelKey = `digit-classifier-${modelName}-${Date.now()}`
        await model.save(`localstorage://${modelKey}`)

        // Sauvegarder aussi comme modèle par défaut
        await model.save("localstorage://digit-classifier")

        // Mettre à jour la liste des modèles sauvegardés
        const savedModels = JSON.parse(localStorage.getItem("saved-models") || "[]")
        const existingModel = savedModels.find((m) => m.name === modelName)

        if (!existingModel) {
          const newModel = {
            id: modelKey,
            name: modelName,
            size: "~400KB",
            lastModified: new Date().toLocaleString("fr-FR"),
            accuracy: finalMetrics.accuracy * 100,
          }

          savedModels.push(newModel)
          localStorage.setItem("saved-models", JSON.stringify(savedModels))
          console.log("Modèle ajouté à la liste depuis l'entraînement:", newModel)
        }

        // Enregistrer la session d'entraînement
        const session: TrainingSession = {
          id: modelKey,
          timestamp: new Date().toISOString(),
          epochs,
          dataCount: trainingData.length,
          finalAccuracy: finalMetrics.accuracy,
          finalLoss: finalMetrics.loss,
          duration,
          modelName,
        }

        saveTrainingSession(session)

        // Sauvegarder les métriques détaillées
        localStorage.setItem(`metrics-${modelKey}`, JSON.stringify(epochMetrics))

        toast({
          title: "Entraînement terminé",
          description: `Modèle "${modelName}" entraîné avec ${(finalMetrics.accuracy * 100).toFixed(1)}% de précision`,
        })
      } catch (saveError) {
        console.error("Erreur lors de la sauvegarde:", saveError)

        // Essayer de sauvegarder uniquement le modèle par défaut
        try {
          await model.save("localstorage://digit-classifier")
          toast({
            title: "Sauvegarde partielle",
            description:
              "Le modèle a été entraîné mais n'a pu être sauvegardé que comme modèle par défaut. Espace insuffisant.",
            variant: "warning",
          })
        } catch (defaultSaveError) {
          toast({
            title: "Erreur de sauvegarde",
            description: "Espace de stockage insuffisant. Supprimez d'anciens modèles et réessayez.",
            variant: "destructive",
          })
        }
      }

      xs.dispose()
      ys.dispose()
    } catch (error) {
      console.error("Erreur lors de l'entraînement:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de l'entraînement du modèle",
        variant: "destructive",
      })
    } finally {
      setIsTraining(false)
    }
  }

  const clearTrainingData = () => {
    setTrainingData([])
    localStorage.removeItem("saved-drawings")
    toast({
      title: "Données effacées",
      description: "Toutes les données d'entraînement ont été supprimées",
    })
  }

  const deleteDrawing = (id: string) => {
    const updated = trainingData.filter((d) => d.id !== id)
    setTrainingData(updated)
    saveDrawings(updated)
    toast({
      title: "Dessin supprimé",
      description: "Le dessin a été retiré des données d'entraînement",
    })
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

    toast({
      title: "Modèles supprimés",
      description: "Tous les modèles ont été supprimés sauf le modèle actif",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Entraînement du Modèle</h1>
        <p className="text-gray-600 mt-2">Dessinez des chiffres et entraînez votre réseau de neurones</p>
      </div>

      {/* Gestionnaire de stockage */}
      <StorageManager onClearModels={clearAllModels} onRefreshModels={() => {}} />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Zone de dessin */}
        <Card>
          <CardHeader>
            <CardTitle>Dessiner un Chiffre</CardTitle>
            <CardDescription>Dessinez un chiffre dans le canvas ci-dessous</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Chiffre dessiné (0-9)</Label>
              <Input
                id="label"
                type="number"
                min="0"
                max="9"
                value={currentLabel}
                onChange={(e) => setCurrentLabel(e.target.value)}
                placeholder="Entrez le chiffre que vous dessinez"
              />
            </div>
            <DrawingCanvas onImageData={handleCanvasData} />
          </CardContent>
        </Card>

        {/* Contrôles d'entraînement */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres d'Entraînement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model-name">Nom du modèle</Label>
              <Input
                id="model-name"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="ex: modele-v1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="epochs">Nombre d'époques</Label>
              <Input
                id="epochs"
                type="number"
                min="1"
                max="100"
                value={epochs}
                onChange={(e) => setEpochs(Number.parseInt(e.target.value))}
              />
            </div>

            {isTraining && (
              <div className="space-y-2">
                <Label>Progression de l'entraînement</Label>
                <Progress value={trainingProgress} />
                <p className="text-sm text-gray-600">{trainingProgress.toFixed(1)}%</p>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                onClick={trainModel}
                disabled={isTraining || trainingData.length === 0 || !modelName.trim()}
                className="flex-1"
              >
                {isTraining ? "Entraînement..." : "Entraîner le Modèle"}
              </Button>
              <Button variant="outline" onClick={clearTrainingData} disabled={isTraining}>
                Effacer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <TrainingStats
          dataCount={trainingData.length}
          modelStatus={model ? "Initialisé" : "Non initialisé"}
          trainingData={trainingData}
          onDeleteDrawing={deleteDrawing}
        />
      </div>

      {/* Historique et métriques */}
      <div className="grid lg:grid-cols-2 gap-6">
        <TrainingHistory history={trainingHistory} currentMetrics={currentMetrics} isTraining={isTraining} />

        {/* Métriques en temps réel */}
        {currentMetrics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Métriques d'Entraînement</CardTitle>
              <CardDescription>Évolution de la précision et de la perte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentMetrics.slice(-5).map((metric, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Époque {metric.epoch}</span>
                    <div className="text-sm space-x-4">
                      <span>Précision: {(metric.accuracy * 100).toFixed(1)}%</span>
                      <span>Perte: {metric.loss.toFixed(4)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
