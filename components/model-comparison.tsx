"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Target, TestTube } from "lucide-react"

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

interface ModelComparisonProps {
  selectedModelIds: string[]
  models: ModelInfo[]
  trainingHistory: TrainingSession[]
  onTestModel: (modelId: string) => Promise<number | null>
}

interface ComparisonMetrics {
  modelId: string
  modelName: string
  maxAccuracy: number
  avgAccuracy: number
  minLoss: number
  avgLoss: number
  totalSessions: number
  totalEpochs: number
  totalDuration: number
  lastTrained: string
  testAccuracy?: number
  isImported: boolean
}

interface ModelPerformanceScore {
  modelId: string
  modelName: string
  overallScore: number
  accuracyScore: number
  consistencyScore: number
  reliabilityScore: number
  experienceScore: number
  recommendation: "excellent" | "good" | "average" | "poor"
  strengths: string[]
  weaknesses: string[]
}

export function ModelComparison({ selectedModelIds, models, trainingHistory, onTestModel }: ModelComparisonProps) {
  const [comparisonData, setComparisonData] = useState<ComparisonMetrics[]>([])
  const [isTestingModels, setIsTestingModels] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, number>>({})
  const [performanceScores, setPerformanceScores] = useState<ModelPerformanceScore[]>([])

  useEffect(() => {
    calculateComparisonMetrics()
  }, [selectedModelIds, models, trainingHistory])

  const calculateComparisonMetrics = () => {
    const metrics: ComparisonMetrics[] = selectedModelIds.map((modelId) => {
      const model = models.find((m) => m.id === modelId)
      if (!model) {
        return {
          modelId,
          modelName: "Modèle inconnu",
          maxAccuracy: 0,
          avgAccuracy: 0,
          minLoss: 0,
          avgLoss: 0,
          totalSessions: 0,
          totalEpochs: 0,
          totalDuration: 0,
          lastTrained: "N/A",
          isImported: false,
        }
      }

      const sessions = trainingHistory.filter((s) => s.modelName === model.name)

      if (sessions.length === 0) {
        return {
          modelId,
          modelName: model.name,
          maxAccuracy: model.accuracy || 0,
          avgAccuracy: model.accuracy || 0,
          minLoss: 0,
          avgLoss: 0,
          totalSessions: 0,
          totalEpochs: 0,
          totalDuration: 0,
          lastTrained: model.imported ? "Modèle importé" : "N/A",
          isImported: model.imported || false,
        }
      }

      const accuracies = sessions.map((s) => s.finalAccuracy * 100)
      const losses = sessions.map((s) => s.finalLoss)
      const lastSession = sessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

      return {
        modelId,
        modelName: model.name,
        maxAccuracy: Math.max(...accuracies),
        avgAccuracy: accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length,
        minLoss: Math.min(...losses),
        avgLoss: losses.reduce((sum, loss) => sum + loss, 0) / losses.length,
        totalSessions: sessions.length,
        totalEpochs: sessions.reduce((sum, s) => sum + s.epochs, 0),
        totalDuration: sessions.reduce((sum, s) => sum + s.duration, 0),
        lastTrained: new Date(lastSession.timestamp).toLocaleDateString("fr-FR"),
        isImported: model.imported || false,
      }
    })

    setComparisonData(metrics)
  }

  const calculatePerformanceScores = (): ModelPerformanceScore[] => {
    return comparisonData.map((metrics) => {
      // Score de précision (40% du score total)
      const accuracyScore = Math.min(metrics.maxAccuracy / 100, 1) * 40

      // Score de consistance (25% du score total)
      const accuracyVariance =
        metrics.totalSessions > 1 ? Math.abs(metrics.maxAccuracy - metrics.avgAccuracy) / metrics.maxAccuracy : 0
      const consistencyScore = Math.max(0, 1 - accuracyVariance) * 25

      // Score de fiabilité basé sur la perte (20% du score total)
      const reliabilityScore = metrics.minLoss > 0 ? Math.max(0, 1 - Math.min(metrics.minLoss, 1)) * 20 : 0

      // Score d'expérience (15% du score total)
      const experienceScore = Math.min(metrics.totalSessions / 10, 1) * 15

      const overallScore = accuracyScore + consistencyScore + reliabilityScore + experienceScore

      // Déterminer la recommandation
      let recommendation: "excellent" | "good" | "average" | "poor"
      if (overallScore >= 80) recommendation = "excellent"
      else if (overallScore >= 65) recommendation = "good"
      else if (overallScore >= 45) recommendation = "average"
      else recommendation = "poor"

      // Analyser les forces et faiblesses
      const strengths: string[] = []
      const weaknesses: string[] = []

      if (metrics.maxAccuracy >= 90) strengths.push("Très haute précision")
      else if (metrics.maxAccuracy < 70) weaknesses.push("Précision faible")

      if (accuracyVariance < 0.05) strengths.push("Très consistant")
      else if (accuracyVariance > 0.15) weaknesses.push("Résultats variables")

      if (metrics.minLoss < 0.1) strengths.push("Faible perte")
      else if (metrics.minLoss > 0.5) weaknesses.push("Perte élevée")

      if (metrics.totalSessions >= 5) strengths.push("Bien testé")
      else if (metrics.totalSessions < 2) weaknesses.push("Peu d'expérience")

      if (metrics.isImported) weaknesses.push("Pas d'historique local")

      return {
        modelId: metrics.modelId,
        modelName: metrics.modelName,
        overallScore,
        accuracyScore,
        consistencyScore,
        reliabilityScore,
        experienceScore,
        recommendation,
        strengths,
        weaknesses,
      }
    })
  }

  useEffect(() => {
    calculateComparisonMetrics()
    const scores = calculatePerformanceScores()
    setPerformanceScores(scores)
  }, [selectedModelIds, models, trainingHistory])

  const testAllModels = async () => {
    setIsTestingModels(true)
    const results: Record<string, number> = {}

    for (const modelId of selectedModelIds) {
      try {
        const accuracy = await onTestModel(modelId)
        if (accuracy !== null) {
          results[modelId] = accuracy * 100
        }
      } catch (error) {
        console.error(`Erreur lors du test du modèle ${modelId}:`, error)
      }
    }

    setTestResults(results)
    setIsTestingModels(false)
  }

  const getBestModel = (metric: keyof ComparisonMetrics) => {
    if (comparisonData.length === 0) return null

    return comparisonData.reduce((best, current) => {
      const currentValue = current[metric] as number
      const bestValue = best[metric] as number

      if (metric === "minLoss" || metric === "avgLoss") {
        return currentValue < bestValue ? current : best
      }
      return currentValue > bestValue ? current : best
    })
  }

  const getWorstModel = (metric: keyof ComparisonMetrics) => {
    if (comparisonData.length === 0) return null

    return comparisonData.reduce((worst, current) => {
      const currentValue = current[metric] as number
      const worstValue = worst[metric] as number

      if (metric === "minLoss" || metric === "avgLoss") {
        return currentValue > worstValue ? current : worst
      }
      return currentValue < worstValue ? current : worst
    })
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  const getPerformanceColor = (value: number, metric: string) => {
    if (metric.includes("accuracy")) {
      if (value >= 90) return "text-green-600"
      if (value >= 70) return "text-yellow-600"
      return "text-red-600"
    }
    if (metric.includes("loss")) {
      if (value <= 0.1) return "text-green-600"
      if (value <= 0.5) return "text-yellow-600"
      return "text-red-600"
    }
    return "text-gray-600"
  }

  const bestAccuracy = getBestModel("maxAccuracy")
  const worstAccuracy = getWorstModel("maxAccuracy")
  const bestLoss = getBestModel("minLoss")

  return (
    <div className="space-y-6">
      {/* Résumé de la comparaison */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Meilleure Précision</span>
            </div>
            {bestAccuracy && (
              <div className="mt-2">
                <div className="text-2xl font-bold text-green-600">{bestAccuracy.maxAccuracy.toFixed(1)}%</div>
                <div className="text-sm text-green-700">{bestAccuracy.modelName}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Meilleure Perte</span>
            </div>
            {bestLoss && (
              <div className="mt-2">
                <div className="text-2xl font-bold text-blue-600">{bestLoss.minLoss.toFixed(4)}</div>
                <div className="text-sm text-blue-700">{bestLoss.modelName}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Total Sessions</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-purple-600">
                {comparisonData.reduce((sum, m) => sum + m.totalSessions, 0)}
              </div>
              <div className="text-sm text-purple-700">Toutes les sessions</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommandations de performance */}
      {performanceScores.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Analyse de Performance et Recommandations</span>
            </CardTitle>
            <CardDescription>
              Évaluation complète basée sur précision, consistance, fiabilité et expérience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceScores
                .sort((a, b) => b.overallScore - a.overallScore)
                .map((score, index) => {
                  const isRecommended = index === 0
                  const getRecommendationColor = (rec: string) => {
                    switch (rec) {
                      case "excellent":
                        return "bg-green-100 text-green-800 border-green-200"
                      case "good":
                        return "bg-blue-100 text-blue-800 border-blue-200"
                      case "average":
                        return "bg-yellow-100 text-yellow-800 border-yellow-200"
                      case "poor":
                        return "bg-red-100 text-red-800 border-red-200"
                      default:
                        return "bg-gray-100 text-gray-800 border-gray-200"
                    }
                  }

                  return (
                    <div
                      key={score.modelId}
                      className={`border rounded-lg p-4 ${isRecommended ? "ring-2 ring-green-500 bg-green-50" : "bg-white"}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {isRecommended && <Badge className="bg-green-500 text-white">🏆 RECOMMANDÉ</Badge>}
                          <h4 className="font-semibold text-lg">{score.modelName}</h4>
                          <Badge className={getRecommendationColor(score.recommendation)}>
                            {score.recommendation.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{score.overallScore.toFixed(1)}/100</div>
                          <div className="text-sm text-gray-600">Score Global</div>
                        </div>
                      </div>

                      {/* Barres de score détaillées */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Précision</span>
                            <span>{score.accuracyScore.toFixed(1)}/40</span>
                          </div>
                          <Progress value={(score.accuracyScore / 40) * 100} className="h-2" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Consistance</span>
                            <span>{score.consistencyScore.toFixed(1)}/25</span>
                          </div>
                          <Progress value={(score.consistencyScore / 25) * 100} className="h-2" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Fiabilité</span>
                            <span>{score.reliabilityScore.toFixed(1)}/20</span>
                          </div>
                          <Progress value={(score.reliabilityScore / 20) * 100} className="h-2" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Expérience</span>
                            <span>{score.experienceScore.toFixed(1)}/15</span>
                          </div>
                          <Progress value={(score.experienceScore / 15) * 100} className="h-2" />
                        </div>
                      </div>

                      {/* Forces et faiblesses */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {score.strengths.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-green-700 mb-2">✅ Forces</h5>
                            <ul className="text-sm space-y-1">
                              {score.strengths.map((strength, idx) => (
                                <li key={idx} className="text-green-600">
                                  • {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {score.weaknesses.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-red-700 mb-2">⚠️ Points d'amélioration</h5>
                            <ul className="text-sm space-y-1">
                              {score.weaknesses.map((weakness, idx) => (
                                <li key={idx} className="text-red-600">
                                  • {weakness}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test des modèles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="h-5 w-5" />
            <span>Test de Performance</span>
          </CardTitle>
          <CardDescription>Testez tous les modèles sélectionnés avec des données simulées</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={testAllModels} disabled={isTestingModels} className="w-full">
              <TestTube className="h-4 w-4 mr-2" />
              {isTestingModels ? "Test en cours..." : "Tester tous les modèles"}
            </Button>

            {Object.keys(testResults).length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">Résultats des tests :</h4>
                {selectedModelIds.map((modelId) => {
                  const model = models.find((m) => m.id === modelId)
                  const testAccuracy = testResults[modelId]

                  return (
                    <div key={modelId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{model?.name}</span>
                      {testAccuracy ? (
                        <div className="flex items-center space-x-2">
                          <Progress value={testAccuracy} className="w-24" />
                          <span className={`font-semibold ${getPerformanceColor(testAccuracy, "accuracy")}`}>
                            {testAccuracy.toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">Test échoué</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tableau de comparaison détaillé */}
      <Card>
        <CardHeader>
          <CardTitle>Comparaison Détaillée</CardTitle>
          <CardDescription>Métriques complètes pour tous les modèles sélectionnés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Modèle</th>
                  <th className="text-left p-3">Précision Max</th>
                  <th className="text-left p-3">Précision Moy</th>
                  <th className="text-left p-3">Perte Min</th>
                  <th className="text-left p-3">Sessions</th>
                  <th className="text-left p-3">Époques Total</th>
                  <th className="text-left p-3">Temps Total</th>
                  <th className="text-left p-3">Dernier Entraînement</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((metrics) => (
                  <tr key={metrics.modelId} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{metrics.modelName}</span>
                        {metrics.isImported && (
                          <Badge variant="outline" className="text-xs">
                            Importé
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className={`p-3 font-semibold ${getPerformanceColor(metrics.maxAccuracy, "accuracy")}`}>
                      {metrics.maxAccuracy.toFixed(1)}%
                      {metrics.modelId === bestAccuracy?.modelId && (
                        <Badge className="ml-2 bg-green-100 text-green-800 text-xs">Meilleur</Badge>
                      )}
                    </td>
                    <td className={`p-3 ${getPerformanceColor(metrics.avgAccuracy, "accuracy")}`}>
                      {metrics.avgAccuracy.toFixed(1)}%
                    </td>
                    <td className={`p-3 ${getPerformanceColor(metrics.minLoss, "loss")}`}>
                      {metrics.minLoss.toFixed(4)}
                      {metrics.modelId === bestLoss?.modelId && (
                        <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">Meilleur</Badge>
                      )}
                    </td>
                    <td className="p-3">{metrics.totalSessions}</td>
                    <td className="p-3">{metrics.totalEpochs}</td>
                    <td className="p-3">{formatDuration(metrics.totalDuration)}</td>
                    <td className="p-3">{metrics.lastTrained}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Graphique de performance visuel */}
      <Card>
        <CardHeader>
          <CardTitle>Visualisation des Performances</CardTitle>
          <CardDescription>Comparaison visuelle des précisions maximales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisonData.map((metrics) => (
              <div key={metrics.modelId} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{metrics.modelName}</span>
                  <span className={`font-semibold ${getPerformanceColor(metrics.maxAccuracy, "accuracy")}`}>
                    {metrics.maxAccuracy.toFixed(1)}%
                  </span>
                </div>
                <Progress value={metrics.maxAccuracy} className="h-3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommandations */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Recommandations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-blue-800">
            {bestAccuracy && worstAccuracy && bestAccuracy.modelId !== worstAccuracy.modelId && (
              <div className="p-3 bg-blue-100 rounded-lg">
                <h4 className="font-semibold mb-1">🏆 Modèle Recommandé</h4>
                <p className="text-sm">
                  <strong>{bestAccuracy.modelName}</strong> présente la meilleure précision (
                  {bestAccuracy.maxAccuracy.toFixed(1)}%) et devrait être utilisé pour les prédictions.
                </p>
              </div>
            )}

            {comparisonData.some((m) => m.totalSessions === 0) && (
              <div className="p-3 bg-yellow-100 rounded-lg">
                <h4 className="font-semibold mb-1 text-yellow-900">⚠️ Modèles Importés</h4>
                <p className="text-sm text-yellow-800">
                  Certains modèles sont importés et n'ont pas d'historique d'entraînement. Considérez les entraîner
                  davantage pour améliorer leurs performances.
                </p>
              </div>
            )}

            <div className="p-3 bg-green-100 rounded-lg">
              <h4 className="font-semibold mb-1 text-green-900">💡 Conseils d'Amélioration</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Augmentez le nombre d'époques pour les modèles avec une précision faible</li>
                <li>• Collectez plus de données d'entraînement pour améliorer la généralisation</li>
                <li>• Testez différentes architectures de réseau pour de meilleures performances</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
