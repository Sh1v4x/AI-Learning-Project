"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Bug, Database, RefreshCw, Trash2 } from "lucide-react"

interface ModelDebugProps {
  onRefreshModels: () => void
}

export function ModelDebug({ onRefreshModels }: ModelDebugProps) {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isDebugging, setIsDebugging] = useState(false)
  const { toast } = useToast()

  const debugLocalStorage = () => {
    setIsDebugging(true)

    try {
      // Analyser le localStorage
      const savedModels = localStorage.getItem("saved-models")
      const trainingHistory = localStorage.getItem("training-history")
      const savedDrawings = localStorage.getItem("saved-drawings")

      // Lister tous les modèles TensorFlow.js
      const tfModels = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes("tensorflowjs_models")) {
          tfModels.push(key)
        }
      }

      const info = {
        savedModels: savedModels ? JSON.parse(savedModels) : null,
        trainingHistory: trainingHistory ? JSON.parse(trainingHistory) : null,
        savedDrawings: savedDrawings ? JSON.parse(savedDrawings) : null,
        tfModelsKeys: tfModels,
        localStorageSize: new Blob([JSON.stringify(localStorage)]).size,
        timestamp: new Date().toISOString(),
      }

      setDebugInfo(info)
      console.log("Debug Info:", info)

      toast({
        title: "Debug terminé",
        description: "Informations affichées dans la console et ci-dessous",
      })
    } catch (error) {
      console.error("Erreur de debug:", error)
      toast({
        title: "Erreur de debug",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsDebugging(false)
    }
  }

  const clearAllData = () => {
    if (confirm("Êtes-vous sûr de vouloir effacer toutes les données ? Cette action est irréversible.")) {
      try {
        // Supprimer toutes les données
        localStorage.removeItem("saved-models")
        localStorage.removeItem("training-history")
        localStorage.removeItem("saved-drawings")

        // Supprimer tous les modèles TensorFlow.js
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.includes("tensorflowjs_models")) {
            keysToRemove.push(key)
          }
        }

        keysToRemove.forEach((key) => localStorage.removeItem(key))

        setDebugInfo(null)
        onRefreshModels()

        toast({
          title: "Données effacées",
          description: "Toutes les données ont été supprimées",
        })
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Erreur lors de la suppression des données",
          variant: "destructive",
        })
      }
    }
  }

  const fixModelsList = () => {
    try {
      // Reconstruire la liste des modèles basée sur ce qui existe vraiment
      const realModels = []
      const modelKeys = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes("tensorflowjs_models") && key.includes("info")) {
          const modelId = key.split("/")[1]
          modelKeys.push(modelId)
        }
      }

      // Créer des entrées pour les modèles trouvés
      modelKeys.forEach((modelId) => {
        realModels.push({
          id: modelId,
          name: modelId.replace(/-\d+$/, "").replace(/-/g, " "),
          size: "~50KB",
          lastModified: new Date().toLocaleString("fr-FR"),
          imported: true,
        })
      })

      localStorage.setItem("saved-models", JSON.stringify(realModels))
      onRefreshModels()

      toast({
        title: "Liste réparée",
        description: `${realModels.length} modèles détectés et ajoutés à la liste`,
      })
    } catch (error) {
      toast({
        title: "Erreur de réparation",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bug className="h-5 w-5 text-orange-600" />
          <span>Outils de Debug</span>
        </CardTitle>
        <CardDescription>Diagnostiquer et réparer les problèmes de sauvegarde</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button size="sm" variant="outline" onClick={debugLocalStorage} disabled={isDebugging}>
            <Database className="h-3 w-3 mr-1" />
            Analyser
          </Button>

          <Button size="sm" variant="outline" onClick={onRefreshModels}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Actualiser
          </Button>

          <Button size="sm" variant="outline" onClick={fixModelsList}>
            <Bug className="h-3 w-3 mr-1" />
            Réparer
          </Button>

          <Button size="sm" variant="destructive" onClick={clearAllData}>
            <Trash2 className="h-3 w-3 mr-1" />
            Tout Effacer
          </Button>
        </div>

        {debugInfo && (
          <div className="mt-4 p-3 bg-white rounded border text-xs">
            <h4 className="font-semibold mb-2">Informations de Debug :</h4>
            <div className="space-y-2">
              <div>
                <strong>Modèles sauvegardés :</strong>
                <Badge variant="outline" className="ml-2">
                  {debugInfo.savedModels ? debugInfo.savedModels.length : 0}
                </Badge>
              </div>
              <div>
                <strong>Historique d'entraînement :</strong>
                <Badge variant="outline" className="ml-2">
                  {debugInfo.trainingHistory ? debugInfo.trainingHistory.length : 0}
                </Badge>
              </div>
              <div>
                <strong>Dessins sauvegardés :</strong>
                <Badge variant="outline" className="ml-2">
                  {debugInfo.savedDrawings ? debugInfo.savedDrawings.length : 0}
                </Badge>
              </div>
              <div>
                <strong>Modèles TensorFlow.js :</strong>
                <Badge variant="outline" className="ml-2">
                  {debugInfo.tfModelsKeys.length}
                </Badge>
              </div>
              <div>
                <strong>Taille localStorage :</strong>
                <Badge variant="outline" className="ml-2">
                  {(debugInfo.localStorageSize / 1024).toFixed(1)} KB
                </Badge>
              </div>
            </div>

            {debugInfo.tfModelsKeys.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer font-semibold">Clés TensorFlow.js détectées :</summary>
                <ul className="mt-1 ml-4 text-xs">
                  {debugInfo.tfModelsKeys.map((key, idx) => (
                    <li key={idx} className="text-gray-600">
                      {key}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
