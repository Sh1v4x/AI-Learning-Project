"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { DrawingCanvas } from "@/components/drawing-canvas"
import * as tf from "@tensorflow/tfjs"

export default function PredictionPage() {
  const [model, setModel] = useState<tf.LayersModel | null>(null)
  const [prediction, setPrediction] = useState<number[]>([])
  const [predictedDigit, setPredictedDigit] = useState<number | null>(null)
  const [confidence, setConfidence] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadModel()
  }, [])

  const loadModel = async () => {
    try {
      setIsLoading(true)
      const loadedModel = await tf.loadLayersModel("localstorage://digit-classifier")
      setModel(loadedModel)
      toast({
        title: "Modèle chargé",
        description: "Le modèle a été chargé avec succès",
      })
    } catch (error) {
      console.error("Erreur lors du chargement du modèle:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger le modèle. Entraînez d'abord un modèle.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrediction = async (imageData: number[]) => {
    if (!model) {
      toast({
        title: "Erreur",
        description: "Aucun modèle chargé",
        variant: "destructive",
      })
      return
    }

    try {
      // Convertir les données plates en format 3D [1, 28, 28]
      const image2D: number[][] = []
      for (let i = 0; i < 28; i++) {
        const row: number[] = []
        for (let j = 0; j < 28; j++) {
          row.push(imageData[i * 28 + j])
        }
        image2D.push(row)
      }

      // Préparer les données d'entrée avec les bonnes dimensions
      const inputTensor = tf.tensor3d([image2D])

      console.log("Forme des données de prédiction:", inputTensor.shape)

      // Faire la prédiction
      const predictions = model.predict(inputTensor) as tf.Tensor
      const predictionArray = await predictions.data()

      // Trouver la classe prédite et la confiance
      const maxIndex = predictionArray.indexOf(Math.max(...predictionArray))
      const maxConfidence = predictionArray[maxIndex]

      setPrediction(Array.from(predictionArray))
      setPredictedDigit(maxIndex)
      setConfidence(maxConfidence * 100)

      // Nettoyer les tenseurs
      inputTensor.dispose()
      predictions.dispose()
    } catch (error) {
      console.error("Erreur lors de la prédiction:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la prédiction",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Chargement du modèle...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Prédiction</h1>
        <p className="text-gray-600 mt-2">Testez votre modèle entraîné avec de nouveaux chiffres</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Zone de dessin */}
        <Card>
          <CardHeader>
            <CardTitle>Dessiner pour Prédire</CardTitle>
            <CardDescription>Dessinez un chiffre pour voir la prédiction du modèle</CardDescription>
          </CardHeader>
          <CardContent>
            <DrawingCanvas onImageData={handlePrediction} />
          </CardContent>
        </Card>

        {/* Résultats */}
        <div className="space-y-6">
          {/* Prédiction principale */}
          <Card>
            <CardHeader>
              <CardTitle>Résultat de la Prédiction</CardTitle>
            </CardHeader>
            <CardContent>
              {predictedDigit !== null ? (
                <div className="text-center space-y-4">
                  <div className="text-6xl font-bold text-blue-600">{predictedDigit}</div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">Confiance: {confidence.toFixed(1)}%</p>
                    <Progress value={confidence} className="w-full" />
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">Dessinez un chiffre pour voir la prédiction</div>
              )}
            </CardContent>
          </Card>

          {/* Détails des probabilités */}
          {prediction.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Probabilités par Chiffre</CardTitle>
                <CardDescription>Distribution des probabilités pour chaque chiffre</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {prediction.map((prob, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="w-4 text-sm font-mono">{index}</span>
                      <Progress value={prob * 100} className="flex-1" />
                      <span className="text-sm text-gray-600 w-12">{(prob * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {!model && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-orange-800 font-semibold">Aucun modèle disponible</p>
              <p className="text-orange-700 text-sm">
                Vous devez d'abord entraîner un modèle dans la section Entraînement
              </p>
              <Button variant="outline" onClick={loadModel} className="mt-4">
                Réessayer de charger
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
