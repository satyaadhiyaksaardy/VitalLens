"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Upload, Loader2, Utensils } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

export default function MealTracker() {
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [mealType, setMealType] = useState("")
  const [eatenAt, setEatenAt] = useState(new Date().toISOString().slice(0, 16))
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setAnalysis(null)
      setError("")
    }
  }

  const analyzeImage = async () => {
    if (!image) return

    setAnalyzing(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("image", image)
      formData.append("description", description)

      const response = await fetch("/api/meals/analyze", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setAnalysis(result.analysis)
      } else {
        setError(result.error || "Failed to analyze image")
      }
    } catch (error) {
      setError("Error analyzing image. Please try again.")
    } finally {
      setAnalyzing(false)
    }
  }

  const saveMeal = async () => {
    if (!image || !analysis) return

    setSaving(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("image", image)
      formData.append("data", JSON.stringify({
        eatenAt,
        description,
        mealType: mealType || "snack",
        foodItems: analysis.foodItems,
        totalCalories: analysis.totalCalories,
        macros: analysis.macros,
        analysis: analysis.analysis,
        confidence: analysis.confidence,
      }))

      const response = await fetch("/api/meals", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        router.push("/meals/history")
      } else {
        const result = await response.json()
        setError(result.error || "Failed to save meal")
      }
    } catch (error) {
      setError("Error saving meal. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Utensils className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Meal Tracker</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Upload Meal Photo
            </CardTitle>
            <CardDescription>
              Take or upload a photo of your meal for AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="image">Meal Photo</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
            </div>

            {imagePreview && (
              <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                <Image
                  src={imagePreview}
                  alt="Meal preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your meal... (e.g., 'Grilled chicken with rice')"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mealType">Meal Type</Label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="eatenAt">Eaten At</Label>
                <Input
                  id="eatenAt"
                  type="datetime-local"
                  value={eatenAt}
                  onChange={(e) => setEatenAt(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={analyzeImage}
              disabled={!image || analyzing}
              className="w-full"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Analyze Meal
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis Results</CardTitle>
            <CardDescription>
              Nutritional breakdown and calorie estimation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {analysis ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {analysis.totalCalories} Calories
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Confidence: {analysis.confidence}%
                  </p>
                </div>

                <div>
                  <h4 className="font-medium">Food Items:</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {analysis.foodItems.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                {analysis.macros && (
                  <div>
                    <h4 className="font-medium mb-2">Macronutrients:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Protein: {analysis.macros.protein}g</div>
                      <div>Carbs: {analysis.macros.carbohydrates}g</div>
                      <div>Fat: {analysis.macros.fat}g</div>
                      <div>Fiber: {analysis.macros.fiber}g</div>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium">Analysis & Suggestions:</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {analysis.analysis}
                  </p>
                  {analysis.suggestions && (
                    <p className="text-sm text-blue-600 mt-2">
                      💡 {analysis.suggestions}
                    </p>
                  )}
                </div>

                <Button
                  onClick={saveMeal}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Meal"
                  )}
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Upload a meal photo and click "Analyze Meal" to get started.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}