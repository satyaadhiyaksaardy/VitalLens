"use client";

import { useQuery } from "@tanstack/react-query";
import { KPICard, DeltaBadge } from "@/components/kpi-card";
import { TrendsChart } from "@/components/trends-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Heart, 
  Weight, 
  Ruler, 
  TrendingUp,
  AlertCircle,
  Plus
} from "lucide-react";
import Link from "next/link";
import { getBPCategory, getBMICategory, calculateDelta } from "@/lib/utils";

export default function DashboardPage() {
  // Fetch latest readings
  const { data: readings = [], isLoading } = useQuery({
    queryKey: ["readings", "dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/readings?limit=30");
      if (!res.ok) throw new Error("Failed to fetch readings");
      return res.json();
    },
  });

  // Get latest and previous readings
  const latestReading = readings[0];
  const previousReading = readings[1];

  // Calculate deltas
  const weightDelta = calculateDelta(latestReading?.weightKg, previousReading?.weightKg);
  const bmiDelta = calculateDelta(latestReading?.bmi, previousReading?.bmi);
  const systolicDelta = calculateDelta(latestReading?.systolic, previousReading?.systolic);
  const diastolicDelta = calculateDelta(latestReading?.diastolic, previousReading?.diastolic);
  const pulseDelta = calculateDelta(latestReading?.pulse, previousReading?.pulse);

  // Get BP and BMI categories
  const bpCategory = getBPCategory(latestReading?.systolic, latestReading?.diastolic);
  const bmiCategory = getBMICategory(latestReading?.bmi);

  // Prepare chart data
  const chartData = readings
    .slice()
    .reverse()
    .map((r: any) => ({
      date: r.measuredAt,
      weight: r.weightKg,
      bmi: r.bmi,
      systolic: r.systolic,
      diastolic: r.diastolic,
      pulse: r.pulse,
    }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your health vitals at a glance
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/upload">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Reading
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Weight"
          value={latestReading?.weightKg}
          unit="kg"
          delta={weightDelta}
          deltaLabel="vs previous"
          icon={<Weight className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="BMI"
          value={latestReading?.bmi}
          delta={bmiDelta}
          deltaLabel="vs previous"
          subtitle={bmiCategory.category}
          color={bmiCategory.color === "text-green-600" ? "green" : "default"}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Blood Pressure"
          value={
            latestReading?.systolic && latestReading?.diastolic
              ? `${latestReading.systolic}/${latestReading.diastolic}`
              : null
          }
          unit="mmHg"
          subtitle={bpCategory.category}
          color={bpCategory.color === "text-green-600" ? "green" : bpCategory.color === "text-red-600" ? "red" : "yellow"}
          icon={<Heart className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Pulse"
          value={latestReading?.pulse}
          unit="bpm"
          delta={pulseDelta}
          deltaLabel="vs previous"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Insights Panel */}
      {latestReading && (
        <Card>
          <CardHeader>
            <CardTitle>Insights & Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* BP Category */}
              <div className="flex items-start gap-2">
                <Heart className={`h-5 w-5 mt-0.5 ${bpCategory.color}`} />
                <div>
                  <p className="font-medium">Blood Pressure Status</p>
                  <p className="text-sm text-muted-foreground">
                    Your blood pressure is classified as{" "}
                    <span className={`font-semibold ${bpCategory.color}`}>
                      {bpCategory.category}
                    </span>
                  </p>
                </div>
              </div>

              {/* Low Diastolic Warning */}
              {latestReading.diastolic && latestReading.diastolic < 60 && (
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 mt-0.5 text-yellow-600" />
                  <div>
                    <p className="font-medium">Low Diastolic Pressure</p>
                    <p className="text-sm text-muted-foreground">
                      Your diastolic pressure ({latestReading.diastolic} mmHg) is below 60. 
                      Consider consulting with a healthcare provider.
                    </p>
                  </div>
                </div>
              )}

              {/* High Pulse Warning */}
              {latestReading.pulse && latestReading.pulse > 90 && (
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 mt-0.5 text-yellow-600" />
                  <div>
                    <p className="font-medium">Elevated Resting Pulse</p>
                    <p className="text-sm text-muted-foreground">
                      Your resting pulse ({latestReading.pulse} bpm) is above 90. 
                      Consider factors like stress, caffeine, or physical activity.
                    </p>
                  </div>
                </div>
              )}

              {/* Comparison with Previous */}
              {previousReading && (
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-5 w-5 mt-0.5 text-blue-600" />
                  <div>
                    <p className="font-medium">Changes from Previous Reading</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {weightDelta !== null && (
                        <DeltaBadge value={weightDelta} unit="kg" label="weight" />
                      )}
                      {bmiDelta !== null && (
                        <DeltaBadge value={bmiDelta} label="BMI" />
                      )}
                      {systolicDelta !== null && (
                        <DeltaBadge value={systolicDelta} unit="mmHg" label="systolic" />
                      )}
                      {diastolicDelta !== null && (
                        <DeltaBadge value={diastolicDelta} unit="mmHg" label="diastolic" />
                      )}
                      {pulseDelta !== null && (
                        <DeltaBadge value={pulseDelta} unit="bpm" label="pulse" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <TrendsChart
          title="Weight Over Time"
          data={chartData.filter((d: any) => d.weight)}
          dataKeys={[{ key: "weight", color: "#3b82f6", label: "Weight (kg)" }]}
          xAxisKey="date"
          yAxisLabel="Weight (kg)"
        />
        <TrendsChart
          title="BMI Over Time"
          data={chartData.filter((d: any) => d.bmi)}
          dataKeys={[{ key: "bmi", color: "#10b981", label: "BMI" }]}
          xAxisKey="date"
          yAxisLabel="BMI"
        />
        <TrendsChart
          title="Blood Pressure Over Time"
          data={chartData.filter((d: any) => d.systolic && d.diastolic)}
          dataKeys={[
            { key: "systolic", color: "#ef4444", label: "Systolic" },
            { key: "diastolic", color: "#f97316", label: "Diastolic" },
          ]}
          xAxisKey="date"
          yAxisLabel="Pressure (mmHg)"
        />
        <TrendsChart
          title="Pulse Over Time"
          data={chartData.filter((d: any) => d.pulse)}
          dataKeys={[{ key: "pulse", color: "#8b5cf6", label: "Pulse (bpm)" }]}
          xAxisKey="date"
          yAxisLabel="Pulse (bpm)"
        />
      </div>

      {/* No Data State */}
      {readings.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No readings yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by uploading a photo of your health kiosk readings
            </p>
            <Link href="/upload">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload First Reading
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}