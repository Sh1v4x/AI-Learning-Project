"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Database, HardDrive, Trash2, AlertTriangle } from "lucide-react"

interface StorageManagerProps {
  onClearModels: () => void
  onRefreshModels: () => void
}

export function StorageManager({ onClearModels, onRefreshModels }: StorageManagerProps) {
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    total: 5 * 1024 * 1024, // Estimation par défaut: 5MB
    percentage: 0,
    modelCount: 0,
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    analyzeStorage()
  }, [])

  const analyzeStorage = async () => {
    setIsAnalyzing(true)

    try {
      // Calculer la taille utilisée
      let totalSize = 0
      let modelCount = 0

      // Parcourir tout le localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!key) continue

        const value = localStorage.getItem(key) || ""
        totalSize += key.length + value.length

        // Compter les modèles TensorFlow.js
        if (key.includes("tensorflowjs_models") && key.includes("model_topology")) {
          modelCount++
        }
      }

      // Convertir en octets (approximatif)
      const usedBytes = totalSize * 2 // Chaque caractère = 2 octets en UTF-16

      // Estimer la limite totale (varie selon les navigateurs)
      const estimatedTotal = 5 * 1024 * 1024 // 5MB par défaut

      setStorageInfo({
        used: usedBytes,
        total: estimatedTotal,
        percentage: (usedBytes / estimatedTotal) * 100,
        modelCount,
      })

      // Avertir si l'espace est presque plein
      if (usedBytes / estimatedTotal > 0.8) {
        toast({
          title: "Espace de stockage limité",
          description: "Vous avez utilisé plus de 80% de l'espace disponible. Pensez à supprimer d'anciens modèles.",
          variant: "warning",
        })
      }
    } catch (error) {
      console.error("Erreur lors de l'analyse du stockage:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearOldestModel = async () => {
    try {
      // Trouver tous les modèles
      const modelKeys = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes("tensorflowjs_models") && key.includes("model_topology")) {
          const modelId = key.split("/")[1]
          modelKeys.push(modelId)
        }
      }

      if (modelKeys.length === 0) {
        toast({
          title: "Aucun modèle à supprimer",
          description: "Il n'y a pas de modèles sauvegardés à supprimer.",
        })
        return
      }

      // Supprimer le premier modèle (le plus ancien si la liste est triée)
      const modelToDelete = modelKeys[0]

      // Supprimer toutes les clés associées à ce modèle
      localStorage.removeItem(`tensorflowjs_models/${modelToDelete}/model_topology`)
      localStorage.removeItem(`tensorflowjs_models/${modelToDelete}/weight_specs`)
      localStorage.removeItem(`tensorflowjs_models/${modelToDelete}/weight_data`)
      localStorage.removeItem(`tensorflowjs_models/${modelToDelete}/info`)

      // Mettre à jour la liste des modèles sauvegardés
      const savedModels = JSON.parse(localStorage.getItem("saved-models") || "[]")
      const updatedModels = savedModels.filter((m) => m.id !== modelToDelete)
      localStorage.setItem("saved-models", JSON.stringify(updatedModels))

      // Rafraîchir l'analyse et la liste des modèles
      analyzeStorage()
      onRefreshModels()

      toast({
        title: "Modèle supprimé",
        description: `Un ancien modèle a été supprimé pour libérer de l'espace.`,
      })
    } catch (error) {
      console.error("Erreur lors de la suppression du modèle:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le modèle.",
        variant: "destructive",
      })
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getStorageStatusColor = () => {
    if (storageInfo.percentage > 90) return "bg-red-500"
    if (storageInfo.percentage > 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <HardDrive className="h-5 w-5" />
          <span>Gestion du Stockage</span>
        </CardTitle>
        <CardDescription>Surveillez et optimisez l'espace de stockage disponible</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Espace utilisé</span>
            <span>
              {formatSize(storageInfo.used)} / ~{formatSize(storageInfo.total)}
            </span>
          </div>
          <Progress value={storageInfo.percentage} className={getStorageStatusColor()} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-700">{storageInfo.modelCount}</div>
            <div className="text-sm text-gray-600">Modèles sauvegardés</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-700">{formatSize(storageInfo.used)}</div>
            <div className="text-sm text-gray-600">Espace utilisé</div>
          </div>
        </div>

        {storageInfo.percentage > 80 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Espace de stockage limité</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Votre espace de stockage est presque plein. Supprimez d'anciens modèles pour pouvoir en sauvegarder de
              nouveaux.
            </p>
          </div>
        )}

        <div className="flex space-x-2">
          <Button onClick={clearOldestModel} variant="outline" className="flex-1">
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer le plus ancien modèle
          </Button>
          <Button onClick={analyzeStorage} variant="outline" disabled={isAnalyzing}>
            <Database className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Le stockage local est limité à environ 5-10MB selon les navigateurs</p>
          <p>• Chaque modèle TensorFlow.js occupe environ 400KB d'espace</p>
          <p>• Exportez vos modèles importants avant de les supprimer</p>
        </div>
      </CardContent>
    </Card>
  )
}
