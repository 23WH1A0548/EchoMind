"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BookOpen,
  Phone,
  Utensils,
  Tv,
  Users,
  MapPin,
  Heart,
  Clock,
  AlertCircle,
  RefreshCw,
  Plus,
  X,
} from "lucide-react"
import { getJournalEntries, createJournalEntry, type JournalEntry } from "@/lib/api"

interface DailyJournalProps {
  onUpdate: (message: string) => void
}

export default function DailyJournal({ onUpdate }: DailyJournalProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEntry, setNewEntry] = useState({
    activity: "",
    description: "",
    time: "",
    type: "social" as JournalEntry["type"],
    mood: "neutral" as JournalEntry["mood"],
    location: "",
  })
  const [creating, setCreating] = useState(false)

  const loadJournalEntries = async (date: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = await getJournalEntries(date)

      if (result.success) {
        setEntries(result.entries)
        onUpdate(`Loaded ${result.entries.length} activities for ${new Date(date).toLocaleDateString()}`)
      } else {
        setError(result.message)
        onUpdate(result.message)
      }
    } catch (error) {
      console.error("Error loading journal entries:", error)
      setError("Failed to load journal entries. Please try again.")
      onUpdate("Failed to load journal entries. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJournalEntries(selectedDate)
  }, [selectedDate])

  const getIcon = (type: JournalEntry["type"]) => {
    switch (type) {
      case "social":
        return <Users className="h-5 w-5" />
      case "health":
        return <Heart className="h-5 w-5" />
      case "entertainment":
        return <Tv className="h-5 w-5" />
      case "meal":
        return <Utensils className="h-5 w-5" />
      case "exercise":
        return <MapPin className="h-5 w-5" />
      case "call":
        return <Phone className="h-5 w-5" />
      case "visit":
        return <Users className="h-5 w-5" />
      default:
        return <BookOpen className="h-5 w-5" />
    }
  }

  const getMoodColor = (mood?: JournalEntry["mood"]) => {
    switch (mood) {
      case "happy":
        return "bg-green-100 text-green-800 border-green-200"
      case "sad":
        return "bg-red-100 text-red-800 border-red-200"
      case "neutral":
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getMoodEmoji = (mood?: JournalEntry["mood"]) => {
    switch (mood) {
      case "happy":
        return "😊"
      case "sad":
        return "😔"
      case "neutral":
      default:
        return "😐"
    }
  }

  const getTypeColor = (type: JournalEntry["type"]) => {
    switch (type) {
      case "social":
        return "bg-blue-100 text-blue-800"
      case "health":
        return "bg-red-100 text-red-800"
      case "entertainment":
        return "bg-purple-100 text-purple-800"
      case "meal":
        return "bg-orange-100 text-orange-800"
      case "exercise":
        return "bg-green-100 text-green-800"
      case "call":
        return "bg-indigo-100 text-indigo-800"
      case "visit":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCreateEntry = async () => {
    if (!newEntry.activity.trim() || !newEntry.time.trim()) {
      onUpdate("Please fill in the activity and time fields")
      return
    }

    setCreating(true)
    try {
      const result = await createJournalEntry({
        ...newEntry,
        date: selectedDate,
      })

      if (result.success) {
        setEntries((prev) => [...prev, result.entry].sort((a, b) => a.time.localeCompare(b.time)))
        setNewEntry({
          activity: "",
          description: "",
          time: "",
          type: "social",
          mood: "neutral",
          location: "",
        })
        setShowAddForm(false)
        onUpdate(`Added new journal entry: "${result.entry.activity}"`)
      } else {
        onUpdate(result.message)
      }
    } catch (error) {
      console.error("Error creating journal entry:", error)
      onUpdate("Failed to create journal entry. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-6 w-6 text-primary" />
            Daily Journal
          </CardTitle>
          <CardDescription className="text-base">Loading your activities...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <BookOpen className="h-6 w-6 text-primary" />
          Daily Journal
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)} className="text-sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Entry
            </Button>
            <Button variant="ghost" size="sm" onClick={() => loadJournalEntries(selectedDate)}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription className="text-base">
          Your activities and memories for {new Date(selectedDate).toLocaleDateString()}
        </CardDescription>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="text-sm">
            <Clock className="h-3 w-3 mr-1" />
            {entries.length} Activities
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Heart className="h-3 w-3 mr-1" />
            {entries.filter((e) => e.mood === "happy").length} Happy Moments
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Add New Journal Entry</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Activity *</label>
                  <Input
                    placeholder="e.g., Had lunch with family"
                    value={newEntry.activity}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, activity: e.target.value }))}
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time *</label>
                  <Input
                    type="time"
                    value={newEntry.time}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, time: e.target.value }))}
                    className="text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={newEntry.type}
                    onValueChange={(value: JournalEntry["type"]) => setNewEntry((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="meal">Meal</SelectItem>
                      <SelectItem value="exercise">Exercise</SelectItem>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="visit">Visit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mood</label>
                  <Select
                    value={newEntry.mood}
                    onValueChange={(value: JournalEntry["mood"]) => setNewEntry((prev) => ({ ...prev, mood: value }))}
                  >
                    <SelectTrigger className="text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="happy">😊 Happy</SelectItem>
                      <SelectItem value="neutral">😐 Neutral</SelectItem>
                      <SelectItem value="sad">😔 Sad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    placeholder="e.g., Home, Park, Restaurant"
                    value={newEntry.location}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, location: e.target.value }))}
                    className="text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  placeholder="Describe what happened during this activity..."
                  value={newEntry.description}
                  onChange={(e) => setNewEntry((prev) => ({ ...prev, description: e.target.value }))}
                  className="text-base"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleCreateEntry}
                  disabled={creating || !newEntry.activity.trim() || !newEntry.time.trim()}
                  className="text-base"
                >
                  {creating ? "Adding..." : "Add Entry"}
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)} className="text-base">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
            <Button variant="ghost" size="sm" onClick={() => loadJournalEntries(selectedDate)} className="ml-auto">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Date Selector */}
        <div className="flex items-center gap-4 mb-6">
          <label htmlFor="date-select" className="text-sm font-medium">
            Select Date:
          </label>
          <input
            id="date-select"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Journal Entries */}
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-muted/20 transition-colors"
            >
              <div className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className="p-2 rounded-full bg-primary/10 text-primary">{getIcon(entry.type)}</div>
                <span className="text-sm font-medium text-muted-foreground">{entry.time}</span>
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold text-lg text-foreground">{entry.activity}</h3>
                  <div className="flex gap-2">
                    <Badge className={`text-xs ${getTypeColor(entry.type)}`}>{entry.type}</Badge>
                    {entry.mood && (
                      <Badge variant="outline" className={`text-xs ${getMoodColor(entry.mood)}`}>
                        {getMoodEmoji(entry.mood)} {entry.mood}
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-base text-foreground leading-relaxed">{entry.description}</p>

                {entry.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {entry.location}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {entries.length === 0 && !error && (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">No activities recorded for this date</p>
            <p className="text-sm text-muted-foreground">
              Activities will be automatically logged as you go about your day
            </p>
          </div>
        )}

        {/* Summary */}
        {entries.length > 0 && (
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-semibold text-lg mb-2 text-primary">Daily Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-lg">{entries.length}</div>
                <div className="text-muted-foreground">Activities</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">
                  {entries.filter((e) => e.type === "social" || e.type === "call" || e.type === "visit").length}
                </div>
                <div className="text-muted-foreground">Social</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{entries.filter((e) => e.type === "meal").length}</div>
                <div className="text-muted-foreground">Meals</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{entries.filter((e) => e.mood === "happy").length}</div>
                <div className="text-muted-foreground">Happy</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
