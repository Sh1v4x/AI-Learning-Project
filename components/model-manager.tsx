"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Upload, Trash2, Download, Share } from "lucide-react"
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

interface ModelManagerProps {
  models: ModelInfo[]
  trainingHistory: TrainingSession[]
  onLoadModel: (modelId: string) => Promise<void>
  onDeleteModel: (modelId: string) => Promise<void>
  onExportModel: (modelId: string) => Promise<void>
  isLoading: boolean
  selectedModels: string[]
  onToggleSelection: (modelId: string) => void
}

export function ModelManager({
  models,
  trainingHistory,
  onLoadModel,
  onDeleteModel,
  onExportModel,
  isLoading,
  selectedModels,
  onToggleSelection,
}: ModelManagerProps) {
  const { toast } = useToast()

  const getModelMetrics = (modelName: string) => {
    return trainingHistory.filter((s) => s.modelName === modelName)
  }

  const getAccuracyColor = (accuracy?: number) => {
    if (!accuracy) return "bg-gray-100 text-gray-800"
    if (accuracy >= 90) return "bg-green-100 text-green-800"
    if (accuracy >= 70) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const exportSpecificModel = async (modelId: string) => {
    try {
      const model = await tf.loadLayersModel(`localstorage://${modelId}`)
      const modelInfo = models.find((m) => m.id === modelId)
      const exportName = modelInfo?.name.replace(/\s+/g, "-") || `model-${Date.now()}`

      await model.save(`downloads://${exportName}`)
      model.dispose()

      toast({
        title: "Export réussi",
        description: `Le modèle "${modelInfo?.name}" a été exporté`,
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

  const duplicateModel = async (modelId: string) => {
    try {
      const model = await tf.loadLayersModel(`localstorage://${modelId}`)
      const originalModel = models.find((m) => m.id === modelId)
      const newName = `${originalModel?.name} (Copie)`
      const newId = `${newName.replace(/\s+/g, "-")}-${Date.now()}`

      await model.save(`localstorage://${newId}`)
      model.dispose()

      toast({
        title: "Modèle dupliqué",
        description: `Copie créée : "${newName}"`,
      })

      // Recharger la liste (vous devrez implémenter cette fonction)
      window.location.reload()
    } catch (error) {
      console.error("Erreur lors de la duplication:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la duplication du modèle",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionnaire de Modèles</CardTitle>
        <CardDescription>Gérez tous vos modèles : chargement, export, suppression et duplication</CardDescription>
      </CardHeader>
      <CardContent>
        {models.length > 0 ? (
          <div className="space-y-4">
            {models.map((model) => {
              const metrics = getModelMetrics(model.name)
              const isSelected = selectedModels.includes(model.id)

              return (
                <div key={model.id} className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors">
                  {/* En-tête du modèle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelection(model.id)}
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

                    {/* Actions principales */}
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline" onClick={() => onLoadModel(model.id)} disabled={isLoading}>
                        <Upload className="h-3 w-3 mr-1" />
                        Charger
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => exportSpecificModel(model.id)}
                        disabled={isLoading}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => duplicateModel(model.id)} disabled={isLoading}>
                        <Share className="h-3 w-3 mr-1" />
                        Dupliquer
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onDeleteModel(model.id)} disabled={isLoading}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Informations détaillées */}
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

                  {/* Historique des entraînements */}
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

                  {/* Actions secondaires */}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="text-xs text-gray-500">ID: {model.id.slice(-8)}...</div>
                    <div className="flex space-x-2">
                      {model.imported && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          Peut être ré-exporté
                        </Badge>
                      )}
                      {metrics.length > 0 && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                          Avec historique
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Actions groupées */}
            {selectedModels.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Actions groupées ({selectedModels.length} modèles sélectionnés)
                </h4>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      selectedModels.forEach((id) => exportSpecificModel(id))
                    }}
                    disabled={isLoading}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Exporter Tous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm(`Supprimer ${selectedModels.length} modèles ?`)) {
                        selectedModels.forEach((id) => onDeleteModel(id))
                      }
                    }}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Supprimer Tous
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Aucun modèle sauvegardé</p>
            <p className="text-sm">Sauvegardez ou importez votre premier modèle</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
