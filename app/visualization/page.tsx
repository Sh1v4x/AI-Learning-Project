"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Brain, Activity, Zap, Play, Pause, RotateCcw, Eye, Target } from "lucide-react"
import { DrawingCanvas } from "@/components/drawing-canvas"
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

interface NeuronState {
  id: string
  x: number
  y: number
  layer: number
  activation: number
  isActive: boolean
  prediction?: number
  label?: string
}

interface ConnectionState {
  from: string
  to: string
  weight: number
  isActive: boolean
  strength: number
}

interface PredictionResult {
  predictions: number[]
  predictedDigit: number
  confidence: number
  activations: {
    input: number[]
    hidden: number[]
    output: number[]
  }
}

export default function VisualizationPage() {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [currentModel, setCurrentModel] = useState<tf.LayersModel | null>(null)
  const [trainingHistory, setTrainingHistory] = useState<TrainingSession[]>([])
  const [neurons, setNeurons] = useState<NeuronState[]>([])
  const [connections, setConnections] = useState<ConnectionState[]>([])
  const [isAnimating, setIsAnimating] = useState(true)
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null)
  const [isRealTimeMode, setIsRealTimeMode] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    loadModels()
    loadTrainingHistory()
    initializeNetwork()
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (selectedModel) {
      loadSelectedModel()
    }
  }, [selectedModel])

  useEffect(() => {
    if (isAnimating) {
      startAnimation()
    } else {
      stopAnimation()
    }
    return () => stopAnimation()
  }, [isAnimating, predictionResult])

  const loadModels = () => {
    const saved = localStorage.getItem("saved-models")
    if (saved) {
      const modelList = JSON.parse(saved)
      setModels(modelList)
      if (modelList.length > 0) {
        setSelectedModel(modelList[0].id)
      }
    }
  }

  const loadTrainingHistory = () => {
    const saved = localStorage.getItem("training-history")
    if (saved) {
      setTrainingHistory(JSON.parse(saved))
    }
  }

  const loadSelectedModel = async () => {
    if (!selectedModel) return

    try {
      const model = await tf.loadLayersModel(`localstorage://${selectedModel}`)
      setCurrentModel(model)
    } catch (error) {
      console.error("Erreur lors du chargement du modèle:", error)
      try {
        // Fallback vers le modèle par défaut
        const defaultModel = await tf.loadLayersModel("localstorage://digit-classifier")
        setCurrentModel(defaultModel)
      } catch (fallbackError) {
        console.error("Aucun modèle disponible:", fallbackError)
      }
    }
  }

  const initializeNetwork = () => {
    const newNeurons: NeuronState[] = []
    const newConnections: ConnectionState[] = []

    // Couche d'entrée (grille 4x4 pour représenter 28x28)
    const inputCount = 16
    for (let i = 0; i < inputCount; i++) {
      const row = Math.floor(i / 4)
      const col = i % 4
      newNeurons.push({
        id: `input-${i}`,
        x: 100 + col * 40,
        y: 150 + row * 40,
        layer: 0,
        activation: 0,
        isActive: false,
      })
    }

    // Couche cachée (disposition verticale)
    const hiddenCount = 8
    for (let i = 0; i < hiddenCount; i++) {
      newNeurons.push({
        id: `hidden-${i}`,
        x: 400,
        y: 100 + i * 50,
        layer: 1,
        activation: 0,
        isActive: false,
      })
    }

    // Couche de sortie (chiffres 0-9)
    for (let i = 0; i < 10; i++) {
      newNeurons.push({
        id: `output-${i}`,
        x: 700,
        y: 80 + i * 40,
        layer: 2,
        activation: 0,
        isActive: false,
        prediction: i,
        label: i.toString(),
      })
    }

    // Créer les connexions (échantillon pour la lisibilité)
    newNeurons
      .filter((n) => n.layer === 0)
      .forEach((inputNeuron, inputIndex) => {
        newNeurons
          .filter((n) => n.layer === 1)
          .forEach((hiddenNeuron, hiddenIndex) => {
            if ((inputIndex + hiddenIndex) % 3 === 0) {
              // Connexions partielles
              newConnections.push({
                from: inputNeuron.id,
                to: hiddenNeuron.id,
                weight: Math.random() * 2 - 1,
                isActive: false,
                strength: 0,
              })
            }
          })
      })

    newNeurons
      .filter((n) => n.layer === 1)
      .forEach((hiddenNeuron) => {
        newNeurons
          .filter((n) => n.layer === 2)
          .forEach((outputNeuron) => {
            newConnections.push({
              from: hiddenNeuron.id,
              to: outputNeuron.id,
              weight: Math.random() * 2 - 1,
              isActive: false,
              strength: 0,
            })
          })
      })

    setNeurons(newNeurons)
    setConnections(newConnections)
  }

  const startAnimation = () => {
    const animate = () => {
      if (predictionResult) {
        updateNetworkWithPrediction()
      } else {
        updateNetworkRandom()
      }
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()
  }

  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  const updateNetworkWithPrediction = () => {
    if (!predictionResult) return

    setNeurons((prev) =>
      prev.map((neuron) => {
        let activation = 0
        let isActive = false

        if (neuron.layer === 0) {
          // Couche d'entrée - utiliser les activations réelles (simulées)
          const index = Number.parseInt(neuron.id.split("-")[1])
          activation = predictionResult.activations.input[index] || Math.random() * 0.3
          isActive = activation > 0.2
        } else if (neuron.layer === 1) {
          // Couche cachée
          const index = Number.parseInt(neuron.id.split("-")[1])
          activation = predictionResult.activations.hidden[index] || Math.random() * 0.8
          isActive = activation > 0.4
        } else if (neuron.layer === 2) {
          // Couche de sortie - utiliser les vraies prédictions
          const index = Number.parseInt(neuron.id.split("-")[1])
          activation = predictionResult.predictions[index]
          isActive = index === predictionResult.predictedDigit
        }

        return {
          ...neuron,
          activation: Math.max(0, Math.min(1, activation)),
          isActive,
        }
      }),
    )

    setConnections((prev) =>
      prev.map((conn) => ({
        ...conn,
        isActive: Math.random() > 0.4,
        strength: Math.random(),
      })),
    )
  }

  const updateNetworkRandom = () => {
    setNeurons((prev) =>
      prev.map((neuron) => ({
        ...neuron,
        activation: Math.max(0, Math.min(1, neuron.activation + (Math.random() - 0.5) * 0.1)),
        isActive: Math.random() > (neuron.layer === 0 ? 0.6 : neuron.layer === 1 ? 0.4 : 0.8),
      })),
    )

    setConnections((prev) =>
      prev.map((conn) => ({
        ...conn,
        isActive: Math.random() > 0.6,
        strength: Math.random(),
      })),
    )
  }

  const handleImageData = async (imageData: number[]) => {
    if (!currentModel) return

    try {
      // Préparer les données pour la prédiction
      const image2D: number[][] = []
      for (let i = 0; i < 28; i++) {
        const row: number[] = []
        for (let j = 0; j < 28; j++) {
          row.push(imageData[i * 28 + j])
        }
        image2D.push(row)
      }

      const inputTensor = tf.tensor3d([image2D])
      const predictions = currentModel.predict(inputTensor) as tf.Tensor
      const predictionArray = await predictions.data()

      const maxIndex = predictionArray.indexOf(Math.max(...predictionArray))
      const confidence = predictionArray[maxIndex] * 100

      // Simuler les activations des couches intermédiaires
      const inputActivations = imageData.slice(0, 16).map((val) => val * 0.8 + Math.random() * 0.2)
      const hiddenActivations = Array.from({ length: 8 }, () => Math.random() * 0.9 + 0.1)

      setPredictionResult({
        predictions: Array.from(predictionArray),
        predictedDigit: maxIndex,
        confidence,
        activations: {
          input: inputActivations,
          hidden: hiddenActivations,
          output: Array.from(predictionArray),
        },
      })

      inputTensor.dispose()
      predictions.dispose()
    } catch (error) {
      console.error("Erreur lors de la prédiction:", error)
    }
  }

  const generateRandomPrediction = () => {
    const randomPredictions = Array.from({ length: 10 }, () => Math.random())
    const sum = randomPredictions.reduce((a, b) => a + b, 0)
    const normalizedPredictions = randomPredictions.map((p) => p / sum)

    const maxIndex = normalizedPredictions.indexOf(Math.max(...normalizedPredictions))

    setPredictionResult({
      predictions: normalizedPredictions,
      predictedDigit: maxIndex,
      confidence: normalizedPredictions[maxIndex] * 100,
      activations: {
        input: Array.from({ length: 16 }, () => Math.random()),
        hidden: Array.from({ length: 8 }, () => Math.random()),
        output: normalizedPredictions,
      },
    })
  }

  const getSelectedModelData = () => {
    if (!selectedModel) return null
    const model = models.find((m) => m.id === selectedModel)
    const sessions = trainingHistory.filter((s) => s.modelName === model?.name)
    return { model, sessions }
  }

  const selectedModelData = getSelectedModelData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Visualisation Interactive du Réseau</h1>
        <p className="text-gray-600 mt-2">Observez votre modèle en action avec des prédictions en temps réel</p>
      </div>

      {/* Contrôles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Contrôles de Visualisation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 flex-wrap gap-4">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Choisir un modèle" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => setIsAnimating(!isAnimating)}
              variant={isAnimating ? "destructive" : "default"}
              className="flex items-center space-x-2"
            >
              {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isAnimating ? "Pause" : "Lecture"}</span>
            </Button>

            <Button onClick={generateRandomPrediction} variant="outline" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Prédiction Aléatoire</span>
            </Button>

            <Button onClick={() => setPredictionResult(null)} variant="outline" className="flex items-center space-x-2">
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </Button>
          </div>

          {selectedModelData?.model && (
            <div className="flex items-center space-x-4 flex-wrap">
              <Badge variant="outline" className="bg-blue-50">
                {selectedModelData.model.name}
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                {selectedModelData.model.accuracy?.toFixed(1) || "N/A"}% précision
              </Badge>
              <Badge variant="outline">{selectedModelData.sessions.length} sessions</Badge>
              {currentModel && <Badge className="bg-purple-100 text-purple-800">Modèle chargé</Badge>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Zone de dessin et réseau */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Canvas de dessin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Dessiner pour Prédire</span>
            </CardTitle>
            <CardDescription>Dessinez un chiffre pour voir le réseau en action</CardDescription>
          </CardHeader>
          <CardContent>
            <DrawingCanvas onImageData={handleImageData} />
            {predictionResult && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{predictionResult.predictedDigit}</div>
                  <div className="text-sm text-gray-600">Confiance: {predictionResult.confidence.toFixed(1)}%</div>
                  <Progress value={predictionResult.confidence} className="mt-2" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visualisation du réseau */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Réseau de Neurones en Temps Réel</span>
            </CardTitle>
            <CardDescription>
              {predictionResult ? "Prédiction active" : "Mode simulation"} - {neurons.filter((n) => n.isActive).length}{" "}
              neurones actifs
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full h-[500px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
              <svg width="100%" height="100%" className="absolute inset-0">
                {/* Définitions pour les effets */}
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
                  </linearGradient>

                  <radialGradient id="neuronGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#1e40af" stopOpacity="0.5" />
                  </radialGradient>
                </defs>

                {/* Connexions avec animations */}
                {connections.map((connection, index) => {
                  const fromNeuron = neurons.find((n) => n.id === connection.from)
                  const toNeuron = neurons.find((n) => n.id === connection.to)
                  if (!fromNeuron || !toNeuron) return null

                  const opacity = connection.isActive ? 0.8 : 0.2
                  const strokeWidth = Math.abs(connection.weight) * 2 + 0.5
                  const color = connection.weight > 0 ? "#10b981" : "#ef4444"

                  return (
                    <g key={index}>
                      <line
                        x1={fromNeuron.x}
                        y1={fromNeuron.y}
                        x2={toNeuron.x}
                        y2={toNeuron.y}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        opacity={opacity}
                        className="transition-all duration-300"
                        filter={connection.isActive ? "url(#glow)" : "none"}
                      />

                      {/* Particules de flux de données */}
                      {connection.isActive && isAnimating && (
                        <circle r="3" fill="#ffffff" opacity="0.9" filter="url(#glow)">
                          <animateMotion
                            dur="2s"
                            repeatCount="indefinite"
                            path={`M ${fromNeuron.x} ${fromNeuron.y} L ${toNeuron.x} ${toNeuron.y}`}
                          />
                        </circle>
                      )}
                    </g>
                  )
                })}

                {/* Neurones avec effets avancés */}
                {neurons.map((neuron) => {
                  const radius = 8 + neuron.activation * 12
                  const opacity = neuron.isActive ? 1 : 0.4
                  let color = "#6366f1"

                  if (neuron.layer === 0) color = "#10b981" // Vert pour l'entrée
                  if (neuron.layer === 1) color = "#f59e0b" // Orange pour caché
                  if (neuron.layer === 2) color = "#ef4444" // Rouge pour sortie

                  return (
                    <g key={neuron.id}>
                      {/* Halo externe */}
                      {neuron.isActive && (
                        <circle
                          cx={neuron.x}
                          cy={neuron.y}
                          r={radius + 8}
                          fill={color}
                          opacity="0.2"
                          className="animate-pulse"
                        />
                      )}

                      {/* Neurone principal */}
                      <circle
                        cx={neuron.x}
                        cy={neuron.y}
                        r={radius}
                        fill="url(#neuronGradient)"
                        stroke={color}
                        strokeWidth="2"
                        opacity={opacity}
                        className="transition-all duration-300"
                        filter={neuron.isActive ? "url(#glow)" : "none"}
                      />

                      {/* Indicateur d'activation */}
                      {neuron.activation > 0.1 && (
                        <circle
                          cx={neuron.x}
                          cy={neuron.y}
                          r={neuron.activation * 8}
                          fill={color}
                          opacity="0.6"
                          className="animate-ping"
                        />
                      )}

                      {/* Labels pour la couche de sortie */}
                      {neuron.layer === 2 && neuron.label && (
                        <text
                          x={neuron.x + 25}
                          y={neuron.y + 5}
                          fill="white"
                          fontSize="14"
                          fontWeight="bold"
                          className="font-mono"
                        >
                          {neuron.label}
                          {predictionResult && (
                            <tspan x={neuron.x + 45} dy="0" fontSize="12" opacity="0.8">
                              {(predictionResult.predictions[Number.parseInt(neuron.label)] * 100).toFixed(1)}%
                            </tspan>
                          )}
                        </text>
                      )}
                    </g>
                  )
                })}

                {/* Labels des couches */}
                <text x="180" y="50" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">
                  ENTRÉE (784)
                </text>
                <text x="400" y="50" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">
                  CACHÉE (128)
                </text>
                <text x="700" y="50" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">
                  SORTIE (10)
                </text>

                {/* Indicateurs de flux */}
                {isAnimating && (
                  <g>
                    <circle cx="50" cy="450" r="5" fill="#10b981" opacity="0.8">
                      <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <text x="65" y="455" fill="white" fontSize="12">
                      Flux de données actif
                    </text>
                  </g>
                )}
              </svg>

              {/* Overlay d'informations */}
              <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg backdrop-blur-sm">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Entrée: {neurons.filter((n) => n.layer === 0 && n.isActive).length}/16</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Cachée: {neurons.filter((n) => n.layer === 1 && n.isActive).length}/8</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Sortie: {neurons.filter((n) => n.layer === 2 && n.isActive).length}/10</span>
                  </div>
                  {predictionResult && (
                    <div className="pt-2 border-t border-gray-600">
                      <div className="font-bold">Prédiction: {predictionResult.predictedDigit}</div>
                      <div>Confiance: {predictionResult.confidence.toFixed(1)}%</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Résultats détaillés */}
      {predictionResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Analyse Détaillée de la Prédiction</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Distribution des probabilités */}
              <div>
                <h4 className="font-semibold mb-3">Distribution des Probabilités</h4>
                <div className="space-y-2">
                  {predictionResult.predictions.map((prob, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="w-6 text-sm font-mono font-bold">{index}</span>
                      <div className="flex-1 relative">
                        <Progress value={prob * 100} className="h-3" />
                        {index === predictionResult.predictedDigit && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30 animate-pulse"></div>
                        )}
                      </div>
                      <span className="text-sm text-gray-600 w-12">{(prob * 100).toFixed(1)}%</span>
                      {index === predictionResult.predictedDigit && (
                        <Badge className="bg-green-100 text-green-800 text-xs">MAX</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Activations des couches */}
              <div>
                <h4 className="font-semibold mb-3">Activations des Couches</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Couche d'Entrée</span>
                      <span>{predictionResult.activations.input.filter((a) => a > 0.3).length}/16 actifs</span>
                    </div>
                    <div className="grid grid-cols-8 gap-1">
                      {predictionResult.activations.input.map((activation, i) => (
                        <div
                          key={i}
                          className="h-4 rounded"
                          style={{
                            backgroundColor: `rgba(16, 185, 129, ${activation})`,
                            border: activation > 0.3 ? "1px solid #10b981" : "1px solid #e5e7eb",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Couche Cachée</span>
                      <span>{predictionResult.activations.hidden.filter((a) => a > 0.4).length}/8 actifs</span>
                    </div>
                    <div className="grid grid-cols-8 gap-1">
                      {predictionResult.activations.hidden.map((activation, i) => (
                        <div
                          key={i}
                          className="h-4 rounded"
                          style={{
                            backgroundColor: `rgba(245, 158, 11, ${activation})`,
                            border: activation > 0.4 ? "1px solid #f59e0b" : "1px solid #e5e7eb",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métriques du modèle */}
      {selectedModelData?.model && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedModelData.model.accuracy?.toFixed(1) || "N/A"}%
                  </div>
                  <div className="text-sm text-blue-800">Précision</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{selectedModelData.sessions.length}</div>
                  <div className="text-sm text-green-800">Sessions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">922</div>
                  <div className="text-sm text-purple-800">Paramètres</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Zap className="h-8 w-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">{neurons.filter((n) => n.isActive).length}</div>
                  <div className="text-sm text-orange-800">Neurones Actifs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Instructions */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">🎨 Guide de Visualisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">Fonctionnalités :</h4>
              <ul className="text-sm space-y-1">
                <li>
                  • <strong>Prédiction en temps réel :</strong> Dessinez pour voir le réseau s'activer
                </li>
                <li>
                  • <strong>Animations fluides :</strong> Flux de données et activations visuelles
                </li>
                <li>
                  • <strong>Connexion au modèle :</strong> Utilise votre modèle TensorFlow.js réel
                </li>
                <li>
                  • <strong>Analyse détaillée :</strong> Probabilités et activations par couche
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Éléments visuels :</h4>
              <ul className="text-sm space-y-1">
                <li>
                  • <strong>Neurones pulsants :</strong> Taille proportionnelle à l'activation
                </li>
                <li>
                  • <strong>Connexions colorées :</strong> Vert (positif), Rouge (négatif)
                </li>
                <li>
                  • <strong>Particules de flux :</strong> Données voyageant entre les couches
                </li>
                <li>
                  • <strong>Effets de glow :</strong> Mise en évidence des éléments actifs
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
