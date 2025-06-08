"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, TrendingUp, Clock, Target } from "lucide-react"
import { useState } from "react"

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

interface TrainingHistoryProps {
  history: TrainingSession[]
  currentMetrics: EpochMetrics[]
  isTraining: boolean
}

export function TrainingHistory({ history, currentMetrics, isTraining }: TrainingHistoryProps) {
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [sessionMetrics, setSessionMetrics] = useState<EpochMetrics[]>([])

  const loadSessionMetrics = (sessionId: string) => {
    const metrics = localStorage.getItem(`metrics-${sessionId}`)
    if (metrics) {
      setSessionMetrics(JSON.parse(metrics))
      setSelectedSession(sessionId)
    }
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.9) return "bg-green-100 text-green-800"
    if (accuracy >= 0.7) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  // Statistiques globales
  const totalSessions = history.length
  const avgAccuracy = history.length > 0 ? history.reduce((sum, s) => sum + s.finalAccuracy, 0) / history.length : 0
  const bestSession = history.reduce(
    (best, current) => (current.finalAccuracy > (best?.finalAccuracy || 0) ? current : best),
    null as TrainingSession | null,
  )

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Statistiques Globales</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalSessions}</div>
              <div className="text-sm text-blue-800">Sessions d'entraînement</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{(avgAccuracy * 100).toFixed(1)}%</div>
              <div className="text-sm text-green-800">Précision moyenne</div>
            </div>
          </div>
          {bestSession && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-yellow-800">Meilleur modèle:</span>
                <Badge className="bg-yellow-200 text-yellow-800">{bestSession.modelName}</Badge>
              </div>
              <div className="text-sm text-yellow-700 mt-1">
                {(bestSession.finalAccuracy * 100).toFixed(1)}% de précision
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique des sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Historique des Entraînements</span>
          </CardTitle>
          <CardDescription>Toutes vos sessions d'entraînement passées</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun entraînement effectué</p>
              <p className="text-sm">Commencez par entraîner votre premier modèle</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {history
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((session) => (
                  <div
                    key={session.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => loadSessionMetrics(session.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{session.modelName}</h4>
                      <Badge className={getAccuracyColor(session.finalAccuracy)}>
                        {(session.finalAccuracy * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(session.timestamp)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="h-3 w-3" />
                        <span>{session.epochs} époques</span>
                      </div>
                      <div>Données: {session.dataCount}</div>
                      <div>Durée: {formatDuration(session.duration)}</div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Métriques détaillées de la session sélectionnée */}
      {selectedSession && sessionMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Métriques Détaillées</CardTitle>
            <CardDescription>
              Évolution époque par époque pour {history.find((h) => h.id === selectedSession)?.modelName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {sessionMetrics.map((metric, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                  <span className="font-medium">Époque {metric.epoch}</span>
                  <div className="space-x-4">
                    <span>Précision: {(metric.accuracy * 100).toFixed(1)}%</span>
                    <span>Perte: {metric.loss.toFixed(4)}</span>
                    {metric.valAccuracy && (
                      <span className="text-blue-600">Val: {(metric.valAccuracy * 100).toFixed(1)}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métriques en temps réel pendant l'entraînement */}
      {isTraining && currentMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Entraînement en Cours</CardTitle>
            <CardDescription>Métriques en temps réel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentMetrics.slice(-3).map((metric, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-blue-50 rounded text-sm">
                  <span className="font-medium">Époque {metric.epoch}</span>
                  <div className="space-x-4">
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
  )
}
