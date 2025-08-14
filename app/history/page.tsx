"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Download, 
  Trash2, 
  Eye, 
  Calendar,
  Filter
} from "lucide-react";
import { formatShortDate, formatRelativeDate, exportToCSV } from "@/lib/utils";
import Image from "next/image";

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedReading, setSelectedReading] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fetch readings
  const { data: readings = [], isLoading, refetch } = useQuery({
    queryKey: ["readings", "history", startDate, endDate],
    queryFn: async () => {
      let url = "/api/readings?";
      if (startDate) url += `startDate=${startDate}&`;
      if (endDate) url += `endDate=${endDate}&`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch readings");
      return res.json();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/readings/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete reading");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["readings"] });
      toast({
        title: "Reading deleted",
        description: "The reading has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Unable to delete the reading. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleExport = () => {
    const exportData = readings.map((r: any) => ({
      Date: formatShortDate(r.measuredAt),
      "Height (cm)": r.heightCm || "",
      "Weight (kg)": r.weightKg || "",
      BMI: r.bmi || "",
      "Systolic (mmHg)": r.systolic || "",
      "Diastolic (mmHg)": r.diastolic || "",
      "Pulse (bpm)": r.pulse || "",
      Notes: r.notes || "",
    }));
    
    exportToCSV(exportData, `vitals-export-${new Date().toISOString().split('T')[0]}.csv`);
    toast({
      title: "Export successful",
      description: `Exported ${readings.length} readings to CSV.`,
    });
  };

  const handleViewDetails = (reading: any) => {
    setSelectedReading(reading);
    setDetailsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this reading?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">History</h1>
          <p className="text-muted-foreground">
            View and manage all your health readings
          </p>
        </div>
        {readings.length > 0 && (
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Clear
              </Button>
              <Button onClick={() => refetch()}>Apply</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>BMI</TableHead>
                  <TableHead>Blood Pressure</TableHead>
                  <TableHead>Pulse</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {readings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-muted-foreground">
                        No readings found for the selected date range
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  readings.map((reading: any) => (
                    <TableRow key={reading.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatShortDate(reading.measuredAt)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatRelativeDate(reading.measuredAt)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {reading.weightKg ? `${reading.weightKg} kg` : "--"}
                      </TableCell>
                      <TableCell>{reading.bmi || "--"}</TableCell>
                      <TableCell>
                        {reading.systolic && reading.diastolic
                          ? `${reading.systolic}/${reading.diastolic} mmHg`
                          : "--"}
                      </TableCell>
                      <TableCell>
                        {reading.pulse ? `${reading.pulse} bpm` : "--"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetails(reading)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(reading.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reading Details</DialogTitle>
            <DialogDescription>
              {selectedReading && formatShortDate(selectedReading.measuredAt)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReading && (
            <div className="space-y-4">
              {/* Measurements */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Body Measurements</h3>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Height:</dt>
                      <dd>{selectedReading.heightCm ? `${selectedReading.heightCm} cm` : "--"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Weight:</dt>
                      <dd>{selectedReading.weightKg ? `${selectedReading.weightKg} kg` : "--"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">BMI:</dt>
                      <dd>{selectedReading.bmi || "--"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Standard Weight:</dt>
                      <dd>{selectedReading.standardWeightKg ? `${selectedReading.standardWeightKg} kg` : "--"}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Vital Signs</h3>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Systolic:</dt>
                      <dd>{selectedReading.systolic ? `${selectedReading.systolic} mmHg` : "--"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Diastolic:</dt>
                      <dd>{selectedReading.diastolic ? `${selectedReading.diastolic} mmHg` : "--"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Pulse:</dt>
                      <dd>{selectedReading.pulse ? `${selectedReading.pulse} bpm` : "--"}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              {/* Notes */}
              {selectedReading.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground">{selectedReading.notes}</p>
                </div>
              )}
              
              {/* Source Images */}
              {selectedReading.sourceImages && selectedReading.sourceImages.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Source Images</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedReading.sourceImages.map((img: string, index: number) => (
                      <div key={index} className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                        <img
                          src={`/api/images/${img}`}
                          alt={`Source ${index + 1}`}
                          className="object-contain w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}