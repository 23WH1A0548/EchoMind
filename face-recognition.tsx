"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Upload, X, User, AlertCircle, Plus, Users, Search } from "lucide-react"
import Image from "next/image"
import { recognizeFace } from "@/lib/api"

interface FaceRecognitionProps {
  onResult: (result: string) => void
}

interface SavedFace {
  id: string
  name: string
  relation: string
  imageUrl: string
  lastSeen: string
  notes?: string
}

export default function FaceRecognition({ onResult }: FaceRecognitionProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<"none" | "recognize" | "add">("none") // Added mode state to track current operation
  const [savedFaces, setSavedFaces] = useState<SavedFace[]>([])
  const [showSavedFaces, setShowSavedFaces] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state for adding new faces
  const [newFace, setNewFace] = useState({
    name: "",
    relation: "",
    notes: "",
  })

  // Load saved faces on component mount
  useEffect(() => {
    loadSavedFaces()
  }, [])

  const loadSavedFaces = async () => {
    try {
      const response = await fetch("/api/face-recognition")
      const data = await response.json()
      if (data.success) {
        setSavedFaces(data.faces)
      }
    } catch (error) {
      console.error("Error loading saved faces:", error)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file.")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file is too large. Please select a file smaller than 5MB.")
        return
      }

      setError(null)
      setSelectedFile(file)

      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleCameraCapture = () => {
    // In a real implementation, this would access the camera
    onResult("Camera feature would be available in the full implementation. Please use the upload option for now.")
  }

  const startRecognizeMode = () => {
    setMode("recognize")
    setError(null)
    setSuccessMessage(null)
    onResult("Please upload a photo to recognize the person.")
  }

  const startAddMode = () => {
    setMode("add")
    setError(null)
    setSuccessMessage(null)
    onResult("Please upload a photo and fill in the details to add a new person.")
  }

  const handleRecognize = async () => {
    if (!selectedFile) {
      setError("Please select an image first.")
      return
    }

    setIsProcessing(true)
    setError(null)
    onResult("Processing image...")

    try {
      const result = await recognizeFace(selectedFile)

      if (result.success && result.person) {
        const { person, confidence } = result
        let resultMessage = `This is ${person.name}`

        if (person.relation) {
          resultMessage += `, your ${person.relation}`
        }

        if (person.lastSeen) {
          resultMessage += `.\nLast seen: ${person.lastSeen}`
        }

        if (person.notes) {
          resultMessage += `.\nNotes: ${person.notes}`
        }

        if (confidence) {
          resultMessage += `\n\nConfidence: ${Math.round(confidence * 100)}%`
        }

        onResult(resultMessage)
      } else {
        onResult(
          result.message ||
            "Person not recognized. You can use the 'Add New Face' option to add them to your memory database.",
        )
      }
    } catch (error) {
      console.error("Face recognition error:", error)
      setError("An error occurred while processing the image. Please try again.")
      onResult("Sorry, there was an error processing your image. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAddFace = async () => {
    if (!selectedFile || !newFace.name || !newFace.relation) {
      setError("Please fill in all required fields and select an image.")
      return
    }

    setIsProcessing(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const formData = new FormData()
      formData.append("image", selectedFile)
      formData.append("action", "add-face")
      formData.append("name", newFace.name)
      formData.append("relation", newFace.relation)
      if (newFace.notes) {
        formData.append("notes", newFace.notes)
      }

      const response = await fetch("/api/face-recognition", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        const successMsg = `✅ ${newFace.name} has been successfully added to your memory database as your ${newFace.relation}!`
        setSuccessMessage(successMsg)
        onResult(successMsg)
        setNewFace({ name: "", relation: "", notes: "" })
        handleClear()
        loadSavedFaces() // Refresh the saved faces list
        setShowSavedFaces(true)
      } else {
        setError(result.message || "Failed to add face")
      }
    } catch (error) {
      console.error("Add face error:", error)
      setError("An error occurred while adding the face. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClear = () => {
    setSelectedImage(null)
    setSelectedFile(null)
    setError(null)
    setMode("none") // Reset mode when clearing
    setSuccessMessage(null)
    onResult("")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <User className="h-6 w-6 text-primary" />
          Face Recognition
        </CardTitle>
        <CardDescription className="text-base">
          Recognize people you know or add new faces to your memory database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {successMessage && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {mode === "none" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              size="lg"
              className="text-lg py-8 bg-blue-50 hover:bg-blue-100 border-blue-200"
              onClick={startRecognizeMode}
            >
              <Search className="h-6 w-6 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Recognize Face</div>
                <div className="text-sm text-muted-foreground">Identify someone you know</div>
              </div>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="text-lg py-8 bg-green-50 hover:bg-green-100 border-green-200"
              onClick={startAddMode}
            >
              <Plus className="h-6 w-6 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Add New Face</div>
                <div className="text-sm text-muted-foreground">Add someone to your memory</div>
              </div>
            </Button>
          </div>
        )}

        {mode !== "none" && (
          <>
            <div className="border-2 border-dashed border-border rounded-lg p-8">
              {selectedImage ? (
                <div className="relative">
                  <div className="relative w-full max-w-md mx-auto">
                    <Image
                      src={selectedImage || "/placeholder.svg"}
                      alt="Selected photo"
                      width={400}
                      height={300}
                      className="rounded-lg object-cover w-full h-64"
                    />
                    <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={handleClear}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mx-auto mb-4 p-4 bg-muted rounded-full w-fit">
                    <Camera className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-lg text-muted-foreground mb-4">No photo selected</p>
                  <p className="text-sm text-muted-foreground">
                    {mode === "recognize"
                      ? "Upload a photo to recognize the person"
                      : "Upload a photo to add this person to your memory"}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" size="lg" className="text-lg py-6 bg-transparent" onClick={handleUploadClick}>
                <Upload className="h-5 w-5 mr-2" />
                Upload Photo
              </Button>

              <Button variant="outline" size="lg" className="text-lg py-6 bg-transparent" onClick={handleCameraCapture}>
                <Camera className="h-5 w-5 mr-2" />
                Take Photo
              </Button>
            </div>
          </>
        )}

        {mode === "recognize" && selectedImage && (
          <Button className="w-full text-lg py-6" size="lg" onClick={handleRecognize} disabled={isProcessing}>
            {isProcessing ? "Recognizing..." : "Recognize Person"}
          </Button>
        )}

        {mode === "add" && selectedImage && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Add New Person</CardTitle>
              <CardDescription>
                Add this person to your memory database so you can recognize them next time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={newFace.name}
                  onChange={(e) => setNewFace({ ...newFace, name: e.target.value })}
                  placeholder="Enter person's name"
                  className="text-lg py-3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relation" className="text-base">
                  Relationship *
                </Label>
                <Input
                  id="relation"
                  value={newFace.relation}
                  onChange={(e) => setNewFace({ ...newFace, relation: e.target.value })}
                  placeholder="e.g., daughter, friend, doctor, neighbor"
                  className="text-lg py-3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base">
                  Notes (optional)
                </Label>
                <Textarea
                  id="notes"
                  value={newFace.notes}
                  onChange={(e) => setNewFace({ ...newFace, notes: e.target.value })}
                  placeholder="Any additional information about this person (e.g., lives nearby, visits on weekends)"
                  className="text-base"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddFace}
                  disabled={isProcessing || !newFace.name || !newFace.relation}
                  className="flex-1 text-lg py-3"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isProcessing ? "Adding..." : "Add to Memory"}
                </Button>
                <Button variant="outline" onClick={handleClear} className="text-lg py-3 bg-transparent">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowSavedFaces(!showSavedFaces)} className="flex-1 text-lg py-3">
            <Users className="h-4 w-4 mr-2" />
            {showSavedFaces ? "Hide" : "View"} My Memory Database ({savedFaces.length} people)
          </Button>
        </div>

        {showSavedFaces && (
          <Card className="border-muted">
            <CardHeader>
              <CardTitle className="text-lg">Your Memory Database</CardTitle>
              <CardDescription>People you've added to help you remember</CardDescription>
            </CardHeader>
            <CardContent>
              {savedFaces.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 p-4 bg-muted rounded-full w-fit">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-2">No faces saved yet</p>
                  <p className="text-sm text-muted-foreground">Use the "Add New Face" option to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedFaces.map((face) => (
                    <div
                      key={face.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Image
                        src={face.imageUrl || "/placeholder.svg"}
                        alt={face.name}
                        width={60}
                        height={60}
                        className="rounded-full object-cover border-2 border-primary/20"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-base">{face.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">Your {face.relation}</p>
                        <p className="text-xs text-muted-foreground">Added: {face.lastSeen}</p>
                        {face.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{face.notes}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </CardContent>
    </Card>
  )
}
