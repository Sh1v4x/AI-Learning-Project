"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Brain, Home, Zap, Database, FileText, Eye } from "lucide-react"

const navigation = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Entraînement", href: "/training", icon: Zap },
  { name: "Prédiction", href: "/prediction", icon: Brain },
  { name: "Modèles", href: "/models", icon: Database },
  { name: "Visualisation", href: "/visualization", icon: Eye },
  { name: "Documentation", href: "/documentation", icon: FileText },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">AI Learning</span>
          </div>

          <div className="flex space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
