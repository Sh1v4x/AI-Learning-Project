import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Brain, Zap, Database, BookOpen, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Apprenez l'Intelligence Artificielle</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Projet éducatif complet pour comprendre et implémenter un réseau de neurones avec TensorFlow.js -
          Reconnaissance de chiffres manuscrits
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Zap className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle className="text-lg">Entraînement</CardTitle>
            <CardDescription>Dessinez des chiffres et entraînez votre modèle en temps réel</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/training">
              <Button className="w-full">
                Commencer <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Brain className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle className="text-lg">Prédiction</CardTitle>
            <CardDescription>Testez votre modèle avec de nouveaux chiffres dessinés</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/prediction">
              <Button variant="outline" className="w-full">
                Tester <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Database className="h-8 w-8 text-purple-600 mb-2" />
            <CardTitle className="text-lg">Modèles</CardTitle>
            <CardDescription>Gérez, sauvegardez et chargez vos modèles entraînés</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/models">
              <Button variant="outline" className="w-full">
                Gérer <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <BookOpen className="h-8 w-8 text-orange-600 mb-2" />
            <CardTitle className="text-lg">Documentation</CardTitle>
            <CardDescription>Apprenez les concepts et comprenez le code</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/documentation">
              <Button variant="outline" className="w-full">
                Apprendre <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* About Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-2xl">À propos de ce projet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Ce projet éducatif vous permet d'apprendre l'intelligence artificielle de manière pratique en implémentant
            un classificateur de chiffres manuscrits avec TensorFlow.js.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Technologies utilisées :</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Next.js 14 (App Router)</li>
                <li>• TensorFlow.js</li>
                <li>• Supabase + Prisma</li>
                <li>• Tailwind CSS</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Fonctionnalités :</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Entraînement interactif</li>
                <li>• Sauvegarde de modèles</li>
                <li>• Visualisation des données</li>
                <li>• Documentation complète</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
