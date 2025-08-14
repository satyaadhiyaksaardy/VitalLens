"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Utensils, Calendar, TrendingUp, Clock, Plus } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"

interface Meal {
  id: string
  eatenAt: string
  description: string | null
  mealType: string | null
  foodItems: string[]
  totalCalories: number | null
  macros: {
    protein: number
    carbohydrates: number
    fat: number
    fiber: number
  } | null
  analysis: string | null
  confidence: number | null
  imageUrl: string
}

export default function MealHistory() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [totalCalories, setTotalCalories] = useState(0)

  useEffect(() => {
    fetchMeals()
  }, [filter])

  const fetchMeals = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== "all") {
        params.append("mealType", filter)
      }
      // Get today's meals by default
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      params.append("startDate", today.toISOString())
      
      const response = await fetch(`/api/meals?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMeals(data)
        
        // Calculate total calories for today
        const total = data.reduce((sum: number, meal: Meal) => 
          sum + (meal.totalCalories || 0), 0
        )
        setTotalCalories(total)
      }
    } catch (error) {
      console.error("Error fetching meals:", error)
    } finally {
      setLoading(false)
    }
  }

  const getMealTypeColor = (mealType: string | null) => {
    switch (mealType) {
      case "breakfast": return "bg-yellow-100 text-yellow-800"
      case "lunch": return "bg-blue-100 text-blue-800"
      case "dinner": return "bg-purple-100 text-purple-800"
      case "snack": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Utensils className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Meal History</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => window.location.href = "/meals"}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Meal
          </Button>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Meals</SelectItem>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
              <SelectItem value="snack">Snacks</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Daily Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Today's Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{totalCalories}</div>
              <div className="text-sm text-muted-foreground">Total Calories</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{meals.length}</div>
              <div className="text-sm text-muted-foreground">Meals Logged</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {meals.length > 0 ? Math.round(totalCalories / meals.length) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Avg per Meal</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {meals.length > 0 
                  ? Math.round(meals.reduce((sum, meal) => 
                      sum + (meal.confidence || 0), 0) / meals.length) 
                  : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meals List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading meals...</p>
          </div>
        ) : meals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No meals found</h3>
              <p className="text-muted-foreground mb-4">
                {filter === "all" 
                  ? "You haven't logged any meals today." 
                  : `No ${filter} meals found for today.`}
              </p>
              <Button onClick={() => window.location.href = "/meals"}>
                Log Your First Meal
              </Button>
            </CardContent>
          </Card>
        ) : (
          meals.map((meal) => (
            <Card key={meal.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Meal Image */}
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={`/api/meals/images/${meal.imageUrl.split('/').pop()}`}
                      alt="Meal photo"
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Meal Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getMealTypeColor(meal.mealType)}>
                          {meal.mealType || "snack"}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {format(new Date(meal.eatenAt), "h:mm a")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {meal.totalCalories || 0} cal
                        </div>
                        {meal.confidence && (
                          <div className="text-xs text-muted-foreground">
                            {meal.confidence}% confidence
                          </div>
                        )}
                      </div>
                    </div>

                    {meal.description && (
                      <p className="text-sm text-muted-foreground italic">
                        "{meal.description}"
                      </p>
                    )}

                    {meal.foodItems && meal.foodItems.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Identified foods:</p>
                        <p className="text-sm text-muted-foreground">
                          {meal.foodItems.join(", ")}
                        </p>
                      </div>
                    )}

                    {meal.macros && (
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="font-semibold">{meal.macros.protein}g</div>
                          <div className="text-muted-foreground">Protein</div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="font-semibold">{meal.macros.carbohydrates}g</div>
                          <div className="text-muted-foreground">Carbs</div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="font-semibold">{meal.macros.fat}g</div>
                          <div className="text-muted-foreground">Fat</div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="font-semibold">{meal.macros.fiber}g</div>
                          <div className="text-muted-foreground">Fiber</div>
                        </div>
                      </div>
                    )}

                    {meal.analysis && (
                      <details className="text-sm">
                        <summary className="cursor-pointer font-medium text-primary">
                          AI Analysis & Suggestions
                        </summary>
                        <p className="mt-2 text-muted-foreground leading-relaxed">
                          {meal.analysis}
                        </p>
                      </details>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}