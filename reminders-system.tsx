"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Pill, Utensils, Calendar, Droplets, CheckCircle, AlertCircle, RefreshCw, Plus, X } from "lucide-react"
import { getReminders, updateReminderStatus, createReminder, type Reminder } from "@/lib/api"

interface RemindersSystemProps {
  onUpdate: (message: string) => void
}

export default function RemindersSystem({ onUpdate }: RemindersSystemProps) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newReminder, setNewReminder] = useState({
    title: "",
    description: "",
    time: "",
    type: "medication" as Reminder["type"],
    priority: "medium" as Reminder["priority"],
  })
  const [creating, setCreating] = useState(false)

  const loadReminders = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getReminders()

      if (result.success) {
        setReminders(result.reminders)
        onUpdate(`Loaded ${result.reminders.length} reminders for today`)
      } else {
        setError(result.message)
        onUpdate(result.message)
      }
    } catch (error) {
      console.error("Error loading reminders:", error)
      setError("Failed to load reminders. Please try again.")
      onUpdate("Failed to load reminders. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReminders()
  }, [])

  const getIcon = (type: Reminder["type"]) => {
    switch (type) {
      case "medication":
        return <Pill className="h-5 w-5" />
      case "meal":
        return <Utensils className="h-5 w-5" />
      case "appointment":
        return <Calendar className="h-5 w-5" />
      case "hydration":
        return <Droplets className="h-5 w-5" />
      case "activity":
        return <Clock className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const getPriorityColor = (priority: Reminder["priority"]) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  const handleToggleComplete = async (id: string) => {
    const reminder = reminders.find((r) => r.id === id)
    if (!reminder) return

    const newCompletedStatus = !reminder.completed

    // Optimistically update UI
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, completed: newCompletedStatus } : r)))

    try {
      const result = await updateReminderStatus(id, newCompletedStatus)

      if (result.success) {
        const action = newCompletedStatus ? "completed" : "unmarked"
        onUpdate(`${action.charAt(0).toUpperCase() + action.slice(1)} "${reminder.title}"`)
      } else {
        // Revert optimistic update on failure
        setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, completed: !newCompletedStatus } : r)))
        onUpdate(result.message)
      }
    } catch (error) {
      // Revert optimistic update on error
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, completed: !newCompletedStatus } : r)))
      console.error("Error updating reminder:", error)
      onUpdate("Failed to update reminder. Please try again.")
    }
  }

  const handleCreateReminder = async () => {
    if (!newReminder.title.trim() || !newReminder.time.trim()) {
      onUpdate("Please fill in the title and time fields")
      return
    }

    setCreating(true)
    try {
      const result = await createReminder(newReminder)

      if (result.success) {
        setReminders((prev) => [...prev, result.reminder])
        setNewReminder({
          title: "",
          description: "",
          time: "",
          type: "medication",
          priority: "medium",
        })
        setShowAddForm(false)
        onUpdate(`Added new reminder: "${result.reminder.title}"`)
      } else {
        onUpdate(result.message)
      }
    } catch (error) {
      console.error("Error creating reminder:", error)
      onUpdate("Failed to create reminder. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  const completedCount = reminders.filter((r) => r.completed).length
  const totalCount = reminders.length

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Clock className="h-6 w-6 text-primary" />
            Daily Reminders
          </CardTitle>
          <CardDescription className="text-base">Loading your reminders for today...</CardDescription>
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
          <Clock className="h-6 w-6 text-primary" />
          Daily Reminders
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)} className="text-sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Reminder
            </Button>
            <Button variant="ghost" size="sm" onClick={loadReminders}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription className="text-base">
          Your schedule for today - {completedCount} of {totalCount} completed
        </CardDescription>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="text-sm">
            <CheckCircle className="h-3 w-3 mr-1" />
            {completedCount} Done
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Clock className="h-3 w-3 mr-1" />
            {totalCount - completedCount} Remaining
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Add New Reminder</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    placeholder="e.g., Take morning medication"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder((prev) => ({ ...prev, title: e.target.value }))}
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time *</label>
                  <Input
                    type="time"
                    value={newReminder.time}
                    onChange={(e) => setNewReminder((prev) => ({ ...prev, time: e.target.value }))}
                    className="text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={newReminder.type}
                    onValueChange={(value: Reminder["type"]) => setNewReminder((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="meal">Meal</SelectItem>
                      <SelectItem value="appointment">Appointment</SelectItem>
                      <SelectItem value="hydration">Hydration</SelectItem>
                      <SelectItem value="activity">Activity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={newReminder.priority}
                    onValueChange={(value: Reminder["priority"]) =>
                      setNewReminder((prev) => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger className="text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea
                  placeholder="Additional details about this reminder..."
                  value={newReminder.description}
                  onChange={(e) => setNewReminder((prev) => ({ ...prev, description: e.target.value }))}
                  className="text-base"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleCreateReminder}
                  disabled={creating || !newReminder.title.trim() || !newReminder.time.trim()}
                  className="text-base"
                >
                  {creating ? "Adding..." : "Add Reminder"}
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)} className="text-base">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
            <Button variant="ghost" size="sm" onClick={loadReminders} className="ml-auto">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        )}

        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
              reminder.completed ? "bg-muted/50 opacity-75" : "bg-card hover:bg-muted/20"
            }`}
          >
            <Checkbox
              checked={reminder.completed}
              onCheckedChange={() => handleToggleComplete(reminder.id)}
              className="mt-1"
            />

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${reminder.completed ? "text-muted-foreground" : "text-primary"}`}>
                  {getIcon(reminder.type)}
                </div>
                <h3
                  className={`font-semibold text-lg ${reminder.completed ? "line-through text-muted-foreground" : ""}`}
                >
                  {reminder.title}
                </h3>
                <Badge variant={getPriorityColor(reminder.priority)} className="text-xs">
                  {reminder.priority}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {reminder.time}
                </span>
              </div>

              {reminder.description && (
                <p className={`text-sm ${reminder.completed ? "text-muted-foreground" : "text-foreground"}`}>
                  {reminder.description}
                </p>
              )}
            </div>
          </div>
        ))}

        {reminders.length === 0 && !error && (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">No reminders for today</p>
            <p className="text-sm text-muted-foreground">Enjoy your free day!</p>
          </div>
        )}

        {completedCount === totalCount && totalCount > 0 && (
          <div className="text-center py-4 bg-primary/10 rounded-lg">
            <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-lg font-semibold text-primary">All reminders completed!</p>
            <p className="text-sm text-muted-foreground">Great job staying on track today</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
