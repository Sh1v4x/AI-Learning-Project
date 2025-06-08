"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Target, TrendingUp, Award, AlertTriangle, CheckCircle, Brain } from "lucide-react"
import * as tf from "@tensorflow/tfjs"

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

interface PredictionResult {
  modelId: string
  modelName: string
  predictions: number[]
  confidence: number
  predictedDigit: number
  processingTime: number
}

interface ModelPredictorProps {
  models: ModelInfo[]
  trainingHistory: TrainingSession[]
  testImageData?: number[]
}

export function ModelPredictor({ models, trainingHistory, testImageData }: ModelPredictorProps) {
  const [isTestingAll, setIsTestingAll] = useState(false)
  const [predictionResults, setPredictionResults] = useState<PredictionResult[]>([])
  const [bestModel, setBestModel] = useState<string | null>(null)
  const [consensusPrediction, setConsensusPrediction] = useState<number | null>(null)
  const { toast } = useToast()

  // Générer des données de test par défaut si aucune n'est fournie
  const generateTestData = (): number[] => {
    // Créer un pattern plus réaliste pour le chiffre "5"
    const data = new Array(784).fill(0)

    // Dessiner un "5" plus détaillé
    for (let i = 0; i < 28; i++) {
      for (let j = 0; j < 28; j++) {
        const idx = i * 28 + j

        // Ligne horizontale du haut (plus épaisse)
        if (i >= 6 && i <= 8 && j >= 6 && j <= 20) data[idx] = 0.9

        // Ligne verticale gauche (partie haute)
        if (i >= 6 && i <= 14 && j >= 6 && j <= 8) data[idx] = 0.9

        // Ligne horizontale du milieu
        if (i >= 13 && i <= 15 && j >= 6 && j <= 18) data[idx] = 0.9

        // Ligne verticale droite (partie basse)
        if (i >= 13 && i <= 21 && j >= 18 && j <= 20) data[idx] = 0.9

        // Ligne horizontale du bas
        if (i >= 19 && i <= 21 && j >= 6 && j <= 20) data[idx] = 0.9

        // Ajouter un peu de bruit pour rendre plus réaliste
        if (data[idx] === 0 && Math.random() < 0.05) {
          data[idx] = Math.random() * 0.2
        }
      }
    }

    return data
  }

  const testAllModels = async () => {
    if (models.length === 0) {
      toast({
        title: "Aucun modèle",
        description: "Aucun modèle disponible pour le test",
        variant: "destructive",
      })
      return
    }

    setIsTestingAll(true)
    setPredictionResults([])

    const imageData = testImageData || generateTestData()
    const results: PredictionResult[] = []

    for (const model of models) {
      try {
        const startTime = performance.now()

        // Charger le modèle
        const loadedModel = await tf.loadLayersModel(`localstorage://${model.id}`)

        // Préparer les données au bon format
        const image2D: number[][] = []
        for (let i = 0; i < 28; i++) {
          const row: number[] = []
          for (let j = 0; j < 28; j++) {
            row.push(imageData[i * 28 + j])
          }
          image2D.push(row)
        }

        // Créer le tenseur avec la bonne forme [1, 28, 28]
        const inputTensor = tf.tensor3d([image2D])

        console.log(`Test du modèle ${model.name}, forme d'entrée:`, inputTensor.shape)

        // Faire la prédiction
        const predictions = loadedModel.predict(inputTensor) as tf.Tensor
        const predictionArray = await predictions.data()

        // Trouver la prédiction et la confiance
        const maxIndex = predictionArray.indexOf(Math.max(...predictionArray))
        const confidence = predictionArray[maxIndex] * 100

        const endTime = performance.now()
        const processingTime = endTime - startTime

        results.push({
          modelId: model.id,
          modelName: model.name,
          predictions: Array.from(predictionArray),
          confidence,
          predictedDigit: maxIndex,
          processingTime,
        })

        console.log(`Résultat pour ${model.name}:`, {
          prédiction: maxIndex,
          confiance: confidence.toFixed(1) + "%",
        })

        // Nettoyer les tenseurs
        inputTensor.dispose()
        predictions.dispose()
        loadedModel.dispose()
      } catch (error) {
        console.error(`Erreur lors du test du modèle ${model.name}:`, error)
        toast({
          title: "Erreur de test",
          description: `Impossible de tester le modèle "${model.name}": ${error.message}`,
          variant: "destructive",
        })
      }
    }

    setPredictionResults(results)

    // Déterminer le meilleur modèle et le consensus
    if (results.length > 0) {
      const bestResult = results.reduce((best, current) => (current.confidence > best.confidence ? current : best))
      setBestModel(bestResult.modelId)

      // Calculer le consensus (prédiction la plus fréquente)
      const predictions = results.map((r) => r.predictedDigit)
      const consensus = predictions.reduce((a, b, i, arr) =>
        arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length ? a : b,
      )
      setConsensusPrediction(consensus)

      console.log("Meilleur modèle:", bestResult.modelName)
      console.log("Consensus:", consensus)
    }

    setIsTestingAll(false)

    toast({
      title: "Test terminé",
      description: `${results.length} modèles testés avec succès`,
    })
  }

  const getModelScore = (modelId: string): number => {
    const model = models.find((m) => m.id === modelId)
    if (!model) return 0

    const sessions = trainingHistory.filter((s) => s.modelName === model.name)
    const result = predictionResults.find((r) => r.modelId === modelId)

    if (!result) return 0

    // Score basé sur la confiance (50%), précision historique (30%), et vitesse (20%)
    const confidenceScore = result.confidence * 0.5
    const accuracyScore = sessions.length > 0 ? Math.max(...sessions.map((s) => s.finalAccuracy)) * 100 * 0.3 : 0
    const speedScore = Math.max(0, 100 - result.processingTime / 10) * 0.2

    return confidenceScore + accuracyScore + speedScore
  }

  const getRecommendationLevel = (score: number): { level: string; color: string; icon: any } => {
    if (score >= 80) return { level: "Excellent", color: "text-green-600", icon: Award }
    if (score >= 65) return { level: "Très bon", color: "text-blue-600", icon: CheckCircle }
    if (score >= 50) return { level: "Bon", color: "text-yellow-600", icon: TrendingUp }
    return { level: "À améliorer", color: "text-red-600", icon: AlertTriangle }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Prédicteur de Performance</span>
          </CardTitle>
          <CardDescription>Testez tous vos modèles simultanément pour identifier le plus performant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{models.length} modèles disponibles pour le test</p>
                {testImageData ? (
                  <p className="text-xs text-blue-600">Utilisation de votre image personnalisée</p>
                ) : (
                  <p className="text-xs text-gray-500">Utilisation d'une image de test par défaut (chiffre 5)</p>
                )}
              </div>
              <Button onClick={testAllModels} disabled={isTestingAll || models.length === 0} className="min-w-[120px]">
                {isTestingAll ? "Test en cours..." : "Tester Tous"}
              </Button>
            </div>

            {isTestingAll && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression du test</span>
                  <span>En cours...</span>
                </div>
                <Progress value={undefined} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Résultats du consensus */}
      {predictionResults.length > 0 && consensusPrediction !== null && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <span>Consensus et Recommandation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">{consensusPrediction}</div>
                <div className="text-sm text-green-800">Prédiction Consensus</div>
                <div className="text-xs text-gray-600 mt-1">Prédiction la plus fréquente parmi tous les modèles</div>
              </div>

              {bestModel && (
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600 mb-2">
                    {models.find((m) => m.id === bestModel)?.name}
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">🏆 Modèle Recommandé</Badge>
                  <div className="text-xs text-gray-600 mt-1">
                    Plus haute confiance :{" "}
                    {predictionResults.find((r) => r.modelId === bestModel)?.confidence.toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats détaillés */}
      {predictionResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats Détaillés par Modèle</CardTitle>
            <CardDescription>Performance de chaque modèle classée par score global</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictionResults
                .map((result) => ({
                  ...result,
                  score: getModelScore(result.modelId),
                }))
                .sort((a, b) => b.score - a.score)
                .map((result, index) => {
                  const isRecommended = result.modelId === bestModel
                  const recommendation = getRecommendationLevel(result.score)
                  const Icon = recommendation.icon

                  return (
                    <div
                      key={result.modelId}
                      className={`border rounded-lg p-4 ${isRecommended ? "ring-2 ring-green-500 bg-green-50" : "bg-white"}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {isRecommended && <Badge className="bg-green-500 text-white">🏆 MEILLEUR</Badge>}
                          <h4 className="font-semibold">{result.modelName}</h4>
                          <Badge className={`${recommendation.color} bg-opacity-10`}>
                            <Icon className="h-3 w-3 mr-1" />
                            {recommendation.level}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-blue-600">{result.score.toFixed(1)}/100</div>
                          <div className="text-xs text-gray-600">Score Global</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="text-lg font-bold text-purple-600">{result.predictedDigit}</div>
                          <div className="text-xs text-gray-600">Prédiction</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="text-lg font-bold text-blue-600">{result.confidence.toFixed(1)}%</div>
                          <div className="text-xs text-gray-600">Confiance</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="text-lg font-bold text-green-600">{result.processingTime.toFixed(1)}ms</div>
                          <div className="text-xs text-gray-600">Vitesse</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="text-lg font-bold text-orange-600">#{index + 1}</div>
                          <div className="text-xs text-gray-600">Classement</div>
                        </div>
                      </div>

                      {/* Distribution des probabilités (top 3) */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-gray-700">Top 3 des probabilités :</h5>
                        {result.predictions
                          .map((prob, digit) => ({ digit, prob }))
                          .sort((a, b) => b.prob - a.prob)
                          .slice(0, 3)
                          .map(({ digit, prob }) => (
                            <div key={digit} className="flex items-center space-x-3">
                              <span className="w-4 text-sm font-mono">{digit}</span>
                              <Progress value={prob * 100} className="flex-1 h-2" />
                              <span className="text-sm text-gray-600 w-12">{(prob * 100).toFixed(1)}%</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conseils d'amélioration */}
      {predictionResults.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">💡 Conseils d'Optimisation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-blue-800">
              <div className="p-3 bg-blue-100 rounded-lg">
                <h4 className="font-semibold mb-1">🎯 Pour améliorer la précision :</h4>
                <ul className="text-sm space-y-1">
                  <li>• Entraînez avec plus de données variées</li>
                  <li>• Augmentez le nombre d'époques pour les modèles peu performants</li>
                  <li>• Utilisez des techniques d'augmentation de données</li>
                </ul>
              </div>

              <div className="p-3 bg-green-100 rounded-lg">
                <h4 className="font-semibold mb-1 text-green-900">⚡ Pour optimiser la vitesse :</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Réduisez la complexité du modèle si la précision le permet</li>
                  <li>• Utilisez des techniques de quantification</li>
                  <li>• Optimisez l'architecture du réseau</li>
                </ul>
              </div>

              <div className="p-3 bg-yellow-100 rounded-lg">
                <h4 className="font-semibold mb-1 text-yellow-900">🔄 Pour la consistance :</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Entraînez plusieurs fois le même modèle</li>
                  <li>• Utilisez des techniques d'ensemble (moyenne des prédictions)</li>
                  <li>• Validez sur des données de test séparées</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
