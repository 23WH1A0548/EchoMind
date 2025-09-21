"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Clock, BookOpen, Heart } from "lucide-react"
import FaceRecognition from "@/components/face-recognition"
import RemindersSystem from "@/components/reminders-system"
import DailyJournal from "@/components/daily-journal"

export default function EchoMindDashboard() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [outputContent, setOutputContent] = useState<string>("")

  const handleFeatureClick = (feature: string) => {
    setActiveFeature(feature)

    // Clear output when switching features
    if (feature !== activeFeature) {
      setOutputContent("")
    }

    // Set initial messages for each feature
    switch (feature) {
      case "face-recognition":
        setOutputContent("Use the interface below to upload or take a photo.")
        break
      case "reminders":
        setOutputContent("Loading your reminders interface...")
        break
      case "daily-journal":
        setOutputContent("Loading your daily journal...")
        break
    }
  }

  const handleFaceRecognitionResult = (result: string) => {
    setOutputContent(result)
  }

  const handleRemindersUpdate = (message: string) => {
    setOutputContent(message)
  }

  const handleJournalUpdate = (message: string) => {
    setOutputContent(message)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <Heart className="h-8 w-8 text-primary" />
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground">EchoMind</h1>
              <p className="text-lg text-muted-foreground">A Companion for Memory and Care</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Helping you remember what matters most.</h2>
        </div>

        {/* Feature Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card
            className={`hover:shadow-lg transition-shadow cursor-pointer ${activeFeature === "face-recognition" ? "ring-2 ring-primary" : ""}`}
            onClick={() => handleFeatureClick("face-recognition")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Face Recognition</CardTitle>
              <CardDescription className="text-base">
                Upload or take a photo to identify family and friends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full text-lg py-6"
                size="lg"
                variant={activeFeature === "face-recognition" ? "default" : "outline"}
                onClick={(e) => {
                  e.stopPropagation()
                  handleFeatureClick("face-recognition")
                }}
              >
                Identify People
              </Button>
            </CardContent>
          </Card>

          <Card
            className={`hover:shadow-lg transition-shadow cursor-pointer ${activeFeature === "reminders" ? "ring-2 ring-primary" : ""}`}
            onClick={() => handleFeatureClick("reminders")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Reminders</CardTitle>
              <CardDescription className="text-base">View today's medicines, meals, and appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full text-lg py-6"
                size="lg"
                variant={activeFeature === "reminders" ? "default" : "outline"}
                onClick={(e) => {
                  e.stopPropagation()
                  handleFeatureClick("reminders")
                }}
              >
                View Reminders
              </Button>
            </CardContent>
          </Card>

          <Card
            className={`hover:shadow-lg transition-shadow cursor-pointer ${activeFeature === "daily-journal" ? "ring-2 ring-primary" : ""}`}
            onClick={() => handleFeatureClick("daily-journal")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Daily Journal</CardTitle>
              <CardDescription className="text-base">Review your logged activities and interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full text-lg py-6"
                size="lg"
                variant={activeFeature === "daily-journal" ? "default" : "outline"}
                onClick={(e) => {
                  e.stopPropagation()
                  handleFeatureClick("daily-journal")
                }}
              >
                View Journal
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Feature-Specific Content */}
        {activeFeature === "face-recognition" && (
          <div className="mb-8">
            <FaceRecognition onResult={handleFaceRecognitionResult} />
          </div>
        )}

        {activeFeature === "reminders" && (
          <div className="mb-8">
            <RemindersSystem onUpdate={handleRemindersUpdate} />
          </div>
        )}

        {activeFeature === "daily-journal" && (
          <div className="mb-8">
            <DailyJournal onUpdate={handleJournalUpdate} />
          </div>
        )}

        {/* Dynamic Output Area */}
        {outputContent && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">
                {activeFeature === "face-recognition" && "Recognition Result"}
                {activeFeature === "reminders" && "Reminders Update"}
                {activeFeature === "daily-journal" && "Journal Update"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-6 rounded-lg">
                <pre className="text-base leading-relaxed whitespace-pre-wrap font-sans">{outputContent}</pre>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            Built with <Heart className="h-4 w-4 text-primary" /> for elderly care
          </p>
        </div>
      </footer>
    </div>
  )
}
