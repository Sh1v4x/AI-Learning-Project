"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Code, Brain, Database, Lightbulb, Settings, Eye, Download, Upload, HardDrive } from "lucide-react"

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState("concepts")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Documentation Complète</h1>
        <p className="text-gray-600 mt-2">Guide complet pour maîtriser tous les aspects de ce projet d'IA</p>
      </div>

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="concepts" className="flex items-center space-x-1">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Concepts</span>
          </TabsTrigger>
          <TabsTrigger value="architecture" className="flex items-center space-x-1">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Architecture</span>
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center space-x-1">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Entraînement</span>
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center space-x-1">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Modèles</span>
          </TabsTrigger>
          <TabsTrigger value="visualization" className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Visualisation</span>
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center space-x-1">
            <HardDrive className="h-4 w-4" />
            <span className="hidden sm:inline">Stockage</span>
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center space-x-1">
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">Code</span>
          </TabsTrigger>
          <TabsTrigger value="modifications" className="flex items-center space-x-1">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Modifications</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="concepts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Concepts Fondamentaux de l'IA</CardTitle>
              <CardDescription>
                Comprenez les bases de l'intelligence artificielle et du machine learning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Qu'est-ce qu'un Réseau de Neurones ?</h3>
                <p className="text-gray-700 mb-4">
                  Un réseau de neurones artificiel est un modèle informatique inspiré du cerveau humain. Il est composé
                  de "neurones" (nœuds) connectés entre eux, organisés en couches.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Dans notre projet :</h4>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    <li>
                      • <strong>Couche d'entrée :</strong> 784 neurones (28x28 pixels de l'image)
                    </li>
                    <li>
                      • <strong>Couche cachée :</strong> 128 neurones avec activation ReLU
                    </li>
                    <li>
                      • <strong>Dropout :</strong> 20% des neurones désactivés aléatoirement
                    </li>
                    <li>
                      • <strong>Couche de sortie :</strong> 10 neurones (un pour chaque chiffre 0-9)
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Processus d'Apprentissage</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">1. Propagation Avant</h4>
                    <p className="text-sm text-gray-600">
                      Les données passent de l'entrée vers la sortie à travers les couches, chaque neurone appliquant
                      une fonction mathématique.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">2. Calcul de l'Erreur</h4>
                    <p className="text-sm text-gray-600">
                      On compare la prédiction du réseau avec la vraie réponse pour calculer l'erreur (fonction de
                      perte).
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">3. Rétropropagation</h4>
                    <p className="text-sm text-gray-600">
                      L'erreur est propagée vers l'arrière pour ajuster les poids de chaque connexion entre neurones.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">4. Optimisation</h4>
                    <p className="text-sm text-gray-600">
                      L'algorithme Adam ajuste les poids pour minimiser l'erreur et améliorer les prédictions futures.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Termes Importants</h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold">Époque (Epoch)</h4>
                    <p className="text-sm text-gray-600">
                      Un passage complet à travers toutes les données d'entraînement.
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold">Fonction d'Activation</h4>
                    <p className="text-sm text-gray-600">
                      ReLU (Rectified Linear Unit) : max(0, x) - élimine les valeurs négatives.
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold">Dropout</h4>
                    <p className="text-sm text-gray-600">
                      Technique qui "éteint" aléatoirement certains neurones pour éviter le surapprentissage.
                    </p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold">Validation Split</h4>
                    <p className="text-sm text-gray-600">
                      20% des données réservées pour valider les performances pendant l'entraînement.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="architecture" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Architecture Complète du Projet</CardTitle>
              <CardDescription>Structure détaillée et organisation du code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Structure des Dossiers</h3>
                <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                  <div>📁 app/</div>
                  <div className="ml-4">📄 layout.tsx (Layout principal avec navigation)</div>
                  <div className="ml-4">📄 page.tsx (Page d'accueil avec présentation)</div>
                  <div className="ml-4">📁 training/ (Page d'entraînement)</div>
                  <div className="ml-4">📁 prediction/ (Page de prédiction)</div>
                  <div className="ml-4">📁 models/ (Gestion complète des modèles)</div>
                  <div className="ml-4">📁 visualization/ (Visualisation du réseau)</div>
                  <div className="ml-4">📁 documentation/ (Cette documentation)</div>
                  <div>📁 components/</div>
                  <div className="ml-4">📄 navigation.tsx (Menu de navigation)</div>
                  <div className="ml-4">📄 drawing-canvas.tsx (Canvas de dessin)</div>
                  <div className="ml-4">📄 training-stats.tsx (Statistiques d'entraînement)</div>
                  <div className="ml-4">📄 training-history.tsx (Historique des sessions)</div>
                  <div className="ml-4">📄 model-manager.tsx (Gestionnaire de modèles)</div>
                  <div className="ml-4">📄 model-comparison.tsx (Comparaison de modèles)</div>
                  <div className="ml-4">📄 model-predictor.tsx (Prédicteur de performance)</div>
                  <div className="ml-4">📄 model-import-export.tsx (Import/Export)</div>
                  <div className="ml-4">📄 model-debug.tsx (Outils de debug)</div>
                  <div className="ml-4">📄 storage-manager.tsx (Gestion du stockage)</div>
                  <div className="ml-4">📁 ui/ (Composants d'interface)</div>
                  <div>📁 lib/</div>
                  <div className="ml-4">📄 utils.ts (Utilitaires)</div>
                  <div className="ml-4">📄 supabase.ts (Configuration Supabase)</div>
                  <div>📁 scripts/</div>
                  <div className="ml-4">📄 create-tables.sql (Scripts de base de données)</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Technologies Utilisées</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-blue-600 mb-2">Frontend</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Next.js 14 (App Router)</li>
                      <li>• React 18 avec TypeScript</li>
                      <li>• Tailwind CSS pour le styling</li>
                      <li>• shadcn/ui pour les composants</li>
                      <li>• Lucide React pour les icônes</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-green-600 mb-2">IA & Backend</h4>
                    <ul className="text-sm space-y-1">
                      <li>• TensorFlow.js pour l'IA</li>
                      <li>• LocalStorage pour la persistance</li>
                      <li>• Supabase (configuration prête)</li>
                      <li>• Prisma (schémas définis)</li>
                      <li>• Canvas API pour le dessin</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Flux de Données Complet</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold">Collecte de Données</h4>
                      <p className="text-sm text-gray-600">L'utilisateur dessine des chiffres sur le canvas HTML5</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold">Préprocessing</h4>
                      <p className="text-sm text-gray-600">
                        Redimensionnement à 28x28, conversion en niveaux de gris, normalisation
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold">Entraînement</h4>
                      <p className="text-sm text-gray-600">
                        Le modèle TensorFlow.js s'entraîne avec suivi des métriques
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-orange-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold">Sauvegarde et Gestion</h4>
                      <p className="text-sm text-gray-600">
                        Modèles sauvegardés avec métadonnées et historique complet
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-red-50 rounded-lg">
                    <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      5
                    </div>
                    <div>
                      <h4 className="font-semibold">Visualisation et Analyse</h4>
                      <p className="text-sm text-gray-600">Interface graphique pour explorer et comparer les modèles</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Guide Complet d'Entraînement</CardTitle>
              <CardDescription>Tout ce qu'il faut savoir pour entraîner efficacement vos modèles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Processus d'Entraînement Étape par Étape</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-green-600 mb-2">1. Collecte des Données</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Dessinez des chiffres variés sur le canvas</li>
                      <li>• Spécifiez le label correct (0-9)</li>
                      <li>• Visez au moins 10-20 exemples par chiffre</li>
                      <li>• Variez les styles d'écriture pour la robustesse</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-blue-600 mb-2">2. Configuration du Modèle</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Donnez un nom unique à votre modèle</li>
                      <li>• Choisissez le nombre d'époques (10-50 recommandé)</li>
                      <li>• Le modèle utilise automatiquement l'architecture optimisée</li>
                      <li>• Validation automatique sur 20% des données</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-purple-600 mb-2">3. Suivi de l'Entraînement</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Barre de progression en temps réel</li>
                      <li>• Métriques par époque (précision, perte)</li>
                      <li>• Historique complet sauvegardé</li>
                      <li>• Détection automatique de convergence</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-orange-600 mb-2">4. Sauvegarde Automatique</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Modèle sauvegardé automatiquement après entraînement</li>
                      <li>• Gestion intelligente de l'espace de stockage</li>
                      <li>• Suppression automatique des anciens modèles si nécessaire</li>
                      <li>• Métadonnées complètes enregistrées</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Optimisation des Performances</h3>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">💡 Conseils pour de Meilleurs Résultats</h4>
                  <ul className="text-yellow-800 space-y-1 text-sm">
                    <li>
                      • <strong>Données équilibrées :</strong> Même nombre d'exemples par chiffre
                    </li>
                    <li>
                      • <strong>Variété :</strong> Différentes tailles, orientations, styles d'écriture
                    </li>
                    <li>
                      • <strong>Qualité :</strong> Dessins clairs et bien centrés
                    </li>
                    <li>
                      • <strong>Quantité :</strong> Plus de données = meilleure généralisation
                    </li>
                    <li>
                      • <strong>Époques :</strong> Surveillez la convergence, arrêtez si stagnation
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Gestion des Données d'Entraînement</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Visualisation des Données</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Aperçu de tous vos dessins</li>
                      <li>• Groupement par chiffre</li>
                      <li>• Suppression individuelle possible</li>
                      <li>• Statistiques de distribution</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Nettoyage des Données</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Suppression des dessins incorrects</li>
                      <li>• Rééquilibrage des classes</li>
                      <li>• Effacement complet si nécessaire</li>
                      <li>• Sauvegarde automatique des modifications</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion Complète des Modèles</CardTitle>
              <CardDescription>
                Toutes les fonctionnalités de gestion, comparaison et analyse des modèles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Fonctionnalités de Base</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-blue-600 mb-2">
                      <Upload className="inline h-4 w-4 mr-1" />
                      Sauvegarde et Chargement
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• Sauvegarde locale dans le navigateur</li>
                      <li>• Chargement instantané des modèles</li>
                      <li>• Noms personnalisés pour l'organisation</li>
                      <li>• Métadonnées automatiques (date, précision)</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-green-600 mb-2">
                      <Download className="inline h-4 w-4 mr-1" />
                      Import et Export
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• Export vers fichiers téléchargeables</li>
                      <li>• Import de modèles externes</li>
                      <li>• Format TensorFlow.js standard</li>
                      <li>• Compatibilité inter-plateformes</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Fonctionnalités Avancées</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-purple-600 mb-2">Comparaison de Modèles</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Sélection multiple de modèles (jusqu'à 3)</li>
                      <li>• Analyse comparative des métriques</li>
                      <li>• Recommandations automatiques</li>
                      <li>• Scores de performance globaux</li>
                      <li>• Identification des forces et faiblesses</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-orange-600 mb-2">Prédicteur de Performance</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Test automatique de tous les modèles</li>
                      <li>• Données de test générées automatiquement</li>
                      <li>• Classement par performance</li>
                      <li>• Temps de traitement mesuré</li>
                      <li>• Consensus entre modèles</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-red-600 mb-2">Outils de Debug</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Analyse du localStorage</li>
                      <li>• Détection des modèles orphelins</li>
                      <li>• Réparation automatique des listes</li>
                      <li>• Nettoyage complet des données</li>
                      <li>• Informations de debug détaillées</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Système de Scoring</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Calcul du Score de Performance</h4>
                  <div className="text-blue-800 text-sm space-y-2">
                    <div>
                      • <strong>Précision (40%) :</strong> Basé sur la précision maximale atteinte
                    </div>
                    <div>
                      • <strong>Consistance (25%) :</strong> Variance entre les différents entraînements
                    </div>
                    <div>
                      • <strong>Fiabilité (20%) :</strong> Basé sur la perte minimale
                    </div>
                    <div>
                      • <strong>Expérience (15%) :</strong> Nombre de sessions d'entraînement
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visualisation Interactive du Réseau</CardTitle>
              <CardDescription>
                Explorez visuellement l'architecture et le fonctionnement de vos modèles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Fonctionnalités de Visualisation</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-blue-600 mb-2">Réseau de Neurones Interactif</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Représentation 3D du réseau complet</li>
                      <li>• Animation des activations en temps réel</li>
                      <li>• Connexions colorées selon les poids</li>
                      <li>• Effets visuels et transitions fluides</li>
                      <li>• Labels des couches et neurones</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-green-600 mb-2">Métriques Visuelles</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Cartes de performance colorées</li>
                      <li>• Graphiques d'historique d'entraînement</li>
                      <li>• Barres de progression animées</li>
                      <li>• Comparaison visuelle des sessions</li>
                      <li>• Informations techniques détaillées</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Contrôles Interactifs</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-purple-600 mb-2">Sélection de Modèle</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Menu déroulant pour choisir le modèle à visualiser</li>
                      <li>• Affichage automatique des métriques associées</li>
                      <li>• Mise à jour en temps réel de la visualisation</li>
                      <li>• Badges informatifs (précision, sessions, etc.)</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-orange-600 mb-2">Animation et Effets</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Bouton pour démarrer/arrêter l'animation</li>
                      <li>• Activations aléatoires des neurones</li>
                      <li>• Flux de données simulé à travers les connexions</li>
                      <li>• Halos lumineux autour des neurones actifs</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Interprétation Visuelle</h3>
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Code Couleur du Réseau</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span>Couche d'entrée (784 neurones)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                      <span>Couche cachée (128 neurones)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span>Couche de sortie (10 neurones)</span>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-purple-800">
                    <div>
                      • <strong>Connexions vertes :</strong> Poids positifs (activation)
                    </div>
                    <div>
                      • <strong>Connexions rouges :</strong> Poids négatifs (inhibition)
                    </div>
                    <div>
                      • <strong>Épaisseur :</strong> Proportionnelle à la force du poids
                    </div>
                    <div>
                      • <strong>Opacité :</strong> Indique l'activité de la connexion
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Informations Techniques Affichées</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Architecture</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Nombre de paramètres total</li>
                      <li>• Configuration des couches</li>
                      <li>• Fonctions d'activation utilisées</li>
                      <li>• Taux de dropout appliqué</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Performance</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Précision du modèle sélectionné</li>
                      <li>• Nombre de sessions d'entraînement</li>
                      <li>• Maximum d'époques atteint</li>
                      <li>• Historique des performances</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion Intelligente du Stockage</CardTitle>
              <CardDescription>Optimisation et surveillance de l'espace de stockage local</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Surveillance du Stockage</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-blue-600 mb-2">Analyse en Temps Réel</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Calcul automatique de l'espace utilisé</li>
                      <li>• Estimation de la limite du navigateur (~5MB)</li>
                      <li>• Pourcentage d'utilisation avec barre de progression</li>
                      <li>• Comptage des modèles sauvegardés</li>
                      <li>• Alertes visuelles quand l'espace se remplit</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-green-600 mb-2">Optimisation Automatique</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Suppression automatique des anciens modèles</li>
                      <li>• Vérification avant chaque sauvegarde</li>
                      <li>• Libération d'espace intelligente</li>
                      <li>• Conservation du modèle par défaut</li>
                      <li>• Notifications des actions effectuées</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Outils de Gestion</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-purple-600 mb-2">Actions Manuelles</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Suppression du modèle le plus ancien</li>
                      <li>• Actualisation des statistiques</li>
                      <li>• Nettoyage complet de tous les modèles</li>
                      <li>• Réparation des incohérences</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-orange-600 mb-2">Informations Détaillées</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Taille approximative de chaque modèle (~400KB)</li>
                      <li>• Limite estimée par navigateur</li>
                      <li>• Conseils d'optimisation</li>
                      <li>• Recommandations d'export</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Stratégies de Stockage</h3>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">💡 Bonnes Pratiques</h4>
                  <ul className="text-yellow-800 space-y-1 text-sm">
                    <li>
                      • <strong>Export régulier :</strong> Sauvegardez vos meilleurs modèles localement
                    </li>
                    <li>
                      • <strong>Nettoyage périodique :</strong> Supprimez les modèles expérimentaux
                    </li>
                    <li>
                      • <strong>Nommage cohérent :</strong> Utilisez des noms descriptifs
                    </li>
                    <li>
                      • <strong>Surveillance :</strong> Vérifiez régulièrement l'espace disponible
                    </li>
                    <li>
                      • <strong>Backup :</strong> Exportez avant les gros entraînements
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Limitations et Solutions</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 bg-red-50">
                    <h4 className="font-semibold text-red-600 mb-2">Limitations</h4>
                    <ul className="text-sm space-y-1 text-red-700">
                      <li>• Limite de ~5-10MB selon le navigateur</li>
                      <li>• Données perdues si cache vidé</li>
                      <li>• Pas de synchronisation entre appareils</li>
                      <li>• Performance réduite si stockage plein</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4 bg-green-50">
                    <h4 className="font-semibold text-green-600 mb-2">Solutions</h4>
                    <ul className="text-sm space-y-1 text-green-700">
                      <li>• Export/import pour la persistance</li>
                      <li>• Gestion automatique de l'espace</li>
                      <li>• Migration vers Supabase prévue</li>
                      <li>• Outils de debug intégrés</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Explication Technique du Code</CardTitle>
              <CardDescription>Comprenez l'implémentation technique de chaque fonctionnalité</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Architecture du Modèle TensorFlow.js</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  <pre>{`const model = tf.sequential({
  layers: [
    // Aplatissement de l'image 28x28 en vecteur 784
    tf.layers.flatten({ inputShape: [28, 28] }),
    
    // Couche dense avec 128 neurones et activation ReLU
    tf.layers.dense({ units: 128, activation: 'relu' }),
    
    // Dropout pour éviter le surapprentissage
    tf.layers.dropout({ rate: 0.2 }),
    
    // Couche de sortie avec 10 classes (chiffres 0-9)
    tf.layers.dense({ units: 10, activation: 'softmax' })
  ]
})

// Compilation avec optimiseur Adam
model.compile({
  optimizer: 'adam',
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy']
})`}</pre>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <p>
                    <strong>flatten :</strong> Transforme l'image 28x28 en vecteur de 784 éléments
                  </p>
                  <p>
                    <strong>dense(128, relu) :</strong> Couche cachée avec 128 neurones et activation ReLU
                  </p>
                  <p>
                    <strong>dropout(0.2) :</strong> Éteint 20% des neurones aléatoirement pour la régularisation
                  </p>
                  <p>
                    <strong>dense(10, softmax) :</strong> Couche de sortie avec probabilités pour chaque chiffre
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Préprocessing des Images</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  <pre>{`// Redimensionner le canvas à 28x28
const tempCanvas = document.createElement('canvas')
tempCanvas.width = 28
tempCanvas.height = 28
const tempCtx = tempCanvas.getContext('2d')
tempCtx.drawImage(canvas, 0, 0, 28, 28)

// Convertir en niveaux de gris et normaliser
const imageData = tempCtx.getImageData(0, 0, 28, 28)
const data = imageData.data
const grayscale = []

for (let i = 0; i < data.length; i += 4) {
  // Moyenne RGB et inversion (noir = 1, blanc = 0)
  const r = data[i]
  const g = data[i + 1] 
  const b = data[i + 2]
  const gray = (255 - (r + g + b) / 3) / 255
  grayscale.push(Math.max(0, Math.min(1, gray)))
}`}</pre>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <p>
                    <strong>Redimensionnement :</strong> Uniformisation à 28x28 pixels
                  </p>
                  <p>
                    <strong>Niveaux de gris :</strong> Moyenne des canaux RGB
                  </p>
                  <p>
                    <strong>Normalisation :</strong> Valeurs entre 0 et 1
                  </p>
                  <p>
                    <strong>Inversion :</strong> Convention MNIST (noir = 1, blanc = 0)
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Processus d'Entraînement</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  <pre>{`// Préparation des données
const reshapedData = imageData.map(flatImage => {
  const image2D = []
  for (let i = 0; i < 28; i++) {
    const row = []
    for (let j = 0; j < 28; j++) {
      row.push(flatImage[i * 28 + j])
    }
    image2D.push(row)
  }
  return image2D
})

const xs = tf.tensor3d(reshapedData)
const ys = tf.oneHot(tf.tensor1d(labels, 'int32'), 10)

// Entraînement avec callbacks
await model.fit(xs, ys, {
  epochs: epochs,
  batchSize: 32,
  validationSplit: 0.2,
  callbacks: {
    onEpochEnd: (epoch, logs) => {
      // Mise à jour de la progression
      setTrainingProgress(((epoch + 1) / epochs) * 100)
      
      // Sauvegarde des métriques
      const metrics = {
        epoch: epoch + 1,
        loss: logs?.loss || 0,
        accuracy: logs?.acc || 0,
        valLoss: logs?.val_loss,
        valAccuracy: logs?.val_acc
      }
      setCurrentMetrics(prev => [...prev, metrics])
    }
  }
})`}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Gestion du Stockage</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  <pre>{`// Vérification de l'espace avant sauvegarde
const storageEstimate = JSON.stringify(localStorage).length * 2
const modelEstimate = 500000 // ~500KB pour un modèle
const totalEstimate = storageEstimate + modelEstimate

if (totalEstimate > 4.5 * 1024 * 1024) { // Si > 4.5MB
  // Supprimer automatiquement l'ancien modèle
  const oldModelKeys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.includes('tensorflowjs_models')) {
      oldModelKeys.push(key.split('/')[1])
    }
  }
  
  if (oldModelKeys.length > 0) {
    const oldModelId = oldModelKeys[0]
    // Suppression des clés associées
    localStorage.removeItem(\`tensorflowjs_models/\${oldModelId}/model_topology\`)
    localStorage.removeItem(\`tensorflowjs_models/\${oldModelId}/weight_specs\`)
    localStorage.removeItem(\`tensorflowjs_models/\${oldModelId}/weight_data\`)
    localStorage.removeItem(\`tensorflowjs_models/\${oldModelId}/info\`)
  }
}

// Sauvegarde du nouveau modèle
await model.save(\`localstorage://\${modelId}\`)`}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Visualisation du Réseau</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  <pre>{`// Création des neurones pour la visualisation
const neurons = []

// Couche d'entrée (16 neurones représentatifs)
for (let i = 0; i < 16; i++) {
  neurons.push({
    id: \`input-\${i}\`,
    x: 100,
    y: 50 + (i * 400) / 16,
    layer: 0,
    activation: Math.random(),
    isActive: Math.random() > 0.5
  })
}

// Animation des activations
const animate = () => {
  setNeurons(prev => prev.map(neuron => ({
    ...neuron,
    activation: Math.max(0, Math.min(1, 
      neuron.activation + (Math.random() - 0.5) * 0.1
    )),
    isActive: Math.random() > 0.3
  })))
  
  animationRef.current = requestAnimationFrame(animate)
}`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Guide des Modifications et Extensions</CardTitle>
              <CardDescription>Comment personnaliser et étendre ce projet selon vos besoins</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Modifications Faciles</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-green-600 mb-2">Personnalisation de l'Interface</h4>
                    <ul className="text-sm space-y-1">
                      <li>
                        • <strong>Couleurs :</strong> Modifiez{" "}
                        <code className="bg-gray-100 px-1 rounded">tailwind.config.ts</code>
                      </li>
                      <li>
                        • <strong>Navigation :</strong> Ajoutez des onglets dans{" "}
                        <code className="bg-gray-100 px-1 rounded">components/navigation.tsx</code>
                      </li>
                      <li>
                        • <strong>Textes :</strong> Changez les labels et descriptions
                      </li>
                      <li>
                        • <strong>Icônes :</strong> Remplacez les icônes Lucide React
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-green-600 mb-2">Paramètres du Modèle</h4>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
                      <pre>{`// Modifier l'architecture dans app/training/page.tsx
tf.layers.dense({ units: 256, activation: 'relu' }) // Plus de neurones
tf.layers.dropout({ rate: 0.3 }) // Plus de dropout
tf.layers.dense({ units: 64, activation: 'relu' }) // Couche supplémentaire

// Changer l'optimiseur
model.compile({
  optimizer: tf.train.rmsprop(0.001), // RMSprop au lieu d'Adam
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy']
})`}</pre>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Modifications Intermédiaires</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-blue-600 mb-2">Extension à d'Autres Classes</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Pour reconnaître des lettres (A-Z) au lieu de chiffres :
                    </p>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
                      <pre>{`// 1. Modifier la couche de sortie
tf.layers.dense({ units: 26, activation: 'softmax' }) // 26 lettres

// 2. Adapter la validation des labels
if (label < 0 || label > 25) { // A=0, B=1, ..., Z=25
  toast({ title: "Erreur", description: "La lettre doit être entre A et Z" })
  return
}

// 3. Modifier l'affichage des prédictions
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const predictedLetter = letters[maxIndex]`}</pre>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-blue-600 mb-2">Amélioration de l'Architecture</h4>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
                      <pre>{`// Architecture CNN plus avancée
const model = tf.sequential({
  layers: [
    tf.layers.reshape({ inputShape: [784], targetShape: [28, 28, 1] }),
    tf.layers.conv2d({ filters: 32, kernelSize: 3, activation: 'relu' }),
    tf.layers.maxPooling2d({ poolSize: 2 }),
    tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu' }),
    tf.layers.maxPooling2d({ poolSize: 2 }),
    tf.layers.flatten(),
    tf.layers.dense({ units: 128, activation: 'relu' }),
    tf.layers.dropout({ rate: 0.2 }),
    tf.layers.dense({ units: 10, activation: 'softmax' })
  ]
})`}</pre>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-blue-600 mb-2">Nouvelles Fonctionnalités</h4>
                    <ul className="text-sm space-y-1">
                      <li>
                        • <strong>Augmentation de données :</strong> Rotation, zoom, bruit
                      </li>
                      <li>
                        • <strong>Validation croisée :</strong> K-fold validation
                      </li>
                      <li>
                        • <strong>Métriques avancées :</strong> F1-score, matrice de confusion
                      </li>
                      <li>
                        • <strong>Export de données :</strong> Format CSV, JSON
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Modifications Avancées</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-purple-600 mb-2">Intégration Base de Données</h4>
                    <ol className="text-sm space-y-1 ml-4">
                      <li>
                        1. <strong>Configuration Supabase :</strong> Créer un projet et configurer les variables
                        d'environnement
                      </li>
                      <li>
                        2. <strong>Schémas Prisma :</strong> Utiliser les schémas fournis dans{" "}
                        <code className="bg-gray-100 px-1 rounded">scripts/create-tables.sql</code>
                      </li>
                      <li>
                        3. <strong>Migration du code :</strong> Remplacer localStorage par les appels Supabase
                      </li>
                      <li>
                        4. <strong>Authentification :</strong> Ajouter la gestion des utilisateurs
                      </li>
                    </ol>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-purple-600 mb-2">Fonctionnalités Avancées</h4>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>
                        • <strong>Transfer Learning :</strong> Utiliser des modèles pré-entraînés
                      </li>
                      <li>
                        • <strong>Ensemble Methods :</strong> Combiner plusieurs modèles
                      </li>
                      <li>
                        • <strong>Hyperparameter Tuning :</strong> Optimisation automatique
                      </li>
                      <li>
                        • <strong>Real-time Training :</strong> Entraînement incrémental
                      </li>
                      <li>
                        • <strong>Model Serving :</strong> API REST pour les prédictions
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-purple-600 mb-2">Déploiement et Production</h4>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>
                        • <strong>Vercel :</strong> Déploiement automatique avec GitHub
                      </li>
                      <li>
                        • <strong>Edge Functions :</strong> Prédictions côté serveur
                      </li>
                      <li>
                        • <strong>CDN :</strong> Optimisation des modèles pour le web
                      </li>
                      <li>
                        • <strong>Monitoring :</strong> Suivi des performances en production
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Fichiers Clés à Modifier</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">Interface Utilisateur</h4>
                      <ul className="space-y-1">
                        <li>
                          • <code>components/navigation.tsx</code> - Menu principal
                        </li>
                        <li>
                          • <code>app/page.tsx</code> - Page d'accueil
                        </li>
                        <li>
                          • <code>components/drawing-canvas.tsx</code> - Canvas de dessin
                        </li>
                        <li>
                          • <code>app/visualization/page.tsx</code> - Visualisation
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Logique IA</h4>
                      <ul className="space-y-1">
                        <li>
                          • <code>app/training/page.tsx</code> - Entraînement
                        </li>
                        <li>
                          • <code>app/prediction/page.tsx</code> - Prédiction
                        </li>
                        <li>
                          • <code>app/models/page.tsx</code> - Gestion modèles
                        </li>
                        <li>
                          • <code>components/model-*.tsx</code> - Composants modèles
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Ressources et Références</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-orange-600 mb-2">Documentation Officielle</h4>
                    <ul className="text-sm space-y-1">
                      <li>
                        •{" "}
                        <a href="https://www.tensorflow.org/js" className="text-blue-600 hover:underline">
                          TensorFlow.js
                        </a>
                      </li>
                      <li>
                        •{" "}
                        <a href="https://nextjs.org/docs" className="text-blue-600 hover:underline">
                          Next.js 14
                        </a>
                      </li>
                      <li>
                        •{" "}
                        <a href="https://supabase.com/docs" className="text-blue-600 hover:underline">
                          Supabase
                        </a>
                      </li>
                      <li>
                        •{" "}
                        <a href="https://tailwindcss.com/docs" className="text-blue-600 hover:underline">
                          Tailwind CSS
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-orange-600 mb-2">Communauté et Support</h4>
                    <ul className="text-sm space-y-1">
                      <li>• GitHub Issues pour les bugs</li>
                      <li>• Discord TensorFlow.js</li>
                      <li>• Stack Overflow</li>
                      <li>• Reddit r/MachineLearning</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
