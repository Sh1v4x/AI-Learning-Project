"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface DrawingCanvasProps {
  onImageData: (imageData: number[]) => void
}

export function DrawingCanvas({ onImageData }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Initialiser le canvas
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = "black"
    ctx.lineWidth = 8
    ctx.lineCap = "round"
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const saveImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Redimensionner à 28x28 pour le modèle
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = 28
    tempCanvas.height = 28
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return

    tempCtx.drawImage(canvas, 0, 0, 28, 28)

    // Convertir en niveaux de gris et normaliser
    const imageData = tempCtx.getImageData(0, 0, 28, 28)
    const data = imageData.data
    const grayscale = []

    for (let i = 0; i < data.length; i += 4) {
      // Convertir RGBA en niveaux de gris et inverser (noir = 1, blanc = 0)
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const gray = (255 - (r + g + b) / 3) / 255
      grayscale.push(Math.max(0, Math.min(1, gray))) // S'assurer que les valeurs sont entre 0 et 1
    }

    onImageData(grayscale)
  }

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        width={280}
        height={280}
        className="border border-gray-300 rounded-lg cursor-crosshair bg-white"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      <div className="flex space-x-2">
        <Button onClick={saveImage} className="flex-1">
          Ajouter aux Données
        </Button>
        <Button variant="outline" onClick={clearCanvas}>
          Effacer
        </Button>
      </div>
    </div>
  )
}
