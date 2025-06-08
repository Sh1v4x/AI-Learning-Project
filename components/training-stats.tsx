"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Brain, CheckCircle, Trash2, Eye } from "lucide-react"
import { useState } from "react"

interface TrainingDataPoint {
  image: number[]
  label: number
  timestamp: string
  id: string
}

interface TrainingStatsProps {
  dataCount: number
  modelStatus: string
  trainingData: TrainingDataPoint[]
  onDeleteDrawing: (id: string) => void
}

export function TrainingStats({ dataCount, modelStatus, trainingData, onDeleteDrawing }: TrainingStatsProps) {
  const [showDrawings, setShowDrawings] = useState(false)

  // Calculer les statistiques par chiffre
  const digitStats = Array.from({ length: 10 }, (_, i) => ({
    digit: i,
    count: trainingData.filter((d) => d.label === i).length,
  }))

  const renderMiniCanvas = (imageData: number[], id: string) => {
    return (
      <div key={id} className="relative group">
        <canvas
          ref={(canvas) => {
            if (canvas) {
              const ctx = canvas.getContext("2d")
              if (ctx) {
                const imageDataObj = ctx.createImageData(28, 28)
                for (let i = 0; i < imageData.length; i++) {
                  const pixelIndex = i * 4
                  const value = Math.floor((1 - imageData[i]) * 255)
                  imageDataObj.data[pixelIndex] = value // R
                  imageDataObj.data[pixelIndex + 1] = value // G
                  imageDataObj.data[pixelIndex + 2] = value // B
                  imageDataObj.data[pixelIndex + 3] = 255 // A
                }
                ctx.putImageData(imageDataObj, 0, 0)
              }
            }
          }}
          width={28}
          height={28}
          className="w-12 h-12 border border-gray-200 rounded"
          style={{ imageRendering: "pixelated" }}
        />
        <Button
          size="sm"
          variant="destructive"
          className="absolute -top-1 -right-1 w-5 h-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onDeleteDrawing(id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Statistiques des Données</span>
        </CardTitle>
        <CardDescription>État actuel de l'entraînement et des données</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Données d'entraînement</span>
          <span className="font-semibold">{dataCount} échantillons</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">État du modèle</span>
          <div className="flex items-center space-x-1">
            {modelStatus === "Initialisé" && <CheckCircle className="h-4 w-4 text-green-500" />}
            <span className="font-semibold text-sm">{modelStatus}</span>
          </div>
        </div>

        {/* Distribution par chiffre */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-700">Distribution par chiffre:</span>
          <div className="grid grid-cols-5 gap-2 text-xs">
            {digitStats.map((stat) => (
              <div key={stat.digit} className="text-center p-1 bg-gray-50 rounded">
                <div className="font-semibold">{stat.digit}</div>
                <div className="text-gray-600">{stat.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bouton pour voir les dessins */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDrawings(!showDrawings)}
          className="w-full"
          disabled={dataCount === 0}
        >
          <Eye className="h-4 w-4 mr-2" />
          {showDrawings ? "Masquer" : "Voir"} les dessins ({dataCount})
        </Button>

        {/* Affichage des dessins */}
        {showDrawings && (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {Array.from({ length: 10 }, (_, digit) => {
              const drawings = trainingData.filter((d) => d.label === digit)
              if (drawings.length === 0) return null

              return (
                <div key={digit} className="space-y-2">
                  <h4 className="text-sm font-semibold">
                    Chiffre {digit} ({drawings.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {drawings.map((drawing) => renderMiniCanvas(drawing.image, drawing.id))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Brain className="h-4 w-4" />
            <span>Architecture: Dense (128) → Dropout → Dense (10)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
