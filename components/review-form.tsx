"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, X } from 'lucide-react';
import { ValidatedReadingSchema } from '@/lib/ai';

const FormSchema = ValidatedReadingSchema.extend({
  measuredAt: z.string(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof FormSchema>;

interface ReviewFormProps {
  initialData: any;
  onSave: (data: FormData) => Promise<void>;
  onDiscard: () => void;
  isSaving?: boolean;
}

export function ReviewForm({ initialData, onSave, onDiscard, isSaving = false }: ReviewFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      ...initialData,
      measuredAt: initialData.measuredAt || new Date().toISOString().slice(0, 16),
      notes: initialData.notes || '',
    },
  });

  const heightCm = watch('heightCm');
  const weightKg = watch('weightKg');

  // Auto-compute BMI when height and weight change
  React.useEffect(() => {
    if (heightCm && weightKg) {
      const heightM = heightCm / 100;
      const bmi = Math.round((weightKg / (heightM * heightM)) * 100) / 100;
      setValue('bmi', bmi);
    }
  }, [heightCm, weightKg, setValue]);

  const onSubmit = async (data: FormData) => {
    await onSave(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Extracted Readings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Height/Weight/BMI Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Body Measurements</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="heightCm">Height (cm)</Label>
                <Input
                  id="heightCm"
                  type="number"
                  step="0.1"
                  {...register('heightCm', { valueAsNumber: true })}
                  placeholder="e.g., 164.6"
                />
                {errors.heightCm && (
                  <p className="text-xs text-destructive mt-1">{errors.heightCm.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="weightKg">Weight (kg)</Label>
                <Input
                  id="weightKg"
                  type="number"
                  step="0.1"
                  {...register('weightKg', { valueAsNumber: true })}
                  placeholder="e.g., 63.2"
                />
                {errors.weightKg && (
                  <p className="text-xs text-destructive mt-1">{errors.weightKg.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="bmi">BMI</Label>
                <Input
                  id="bmi"
                  type="number"
                  step="0.01"
                  {...register('bmi', { valueAsNumber: true })}
                  placeholder="Auto-computed"
                />
                {errors.bmi && (
                  <p className="text-xs text-destructive mt-1">{errors.bmi.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="standardWeightKg">Standard Weight (kg)</Label>
                <Input
                  id="standardWeightKg"
                  type="number"
                  step="0.1"
                  {...register('standardWeightKg', { valueAsNumber: true })}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Blood Pressure Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Blood Pressure</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="systolic">Systolic (mmHg)</Label>
                <Input
                  id="systolic"
                  type="number"
                  {...register('systolic', { valueAsNumber: true })}
                  placeholder="e.g., 120"
                />
                {errors.systolic && (
                  <p className="text-xs text-destructive mt-1">{errors.systolic.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="diastolic">Diastolic (mmHg)</Label>
                <Input
                  id="diastolic"
                  type="number"
                  {...register('diastolic', { valueAsNumber: true })}
                  placeholder="e.g., 80"
                />
                {errors.diastolic && (
                  <p className="text-xs text-destructive mt-1">{errors.diastolic.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="pulse">Pulse (bpm)</Label>
                <Input
                  id="pulse"
                  type="number"
                  {...register('pulse', { valueAsNumber: true })}
                  placeholder="e.g., 72"
                />
                {errors.pulse && (
                  <p className="text-xs text-destructive mt-1">{errors.pulse.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="measuredAt">Measurement Date & Time</Label>
                <Input
                  id="measuredAt"
                  type="datetime-local"
                  {...register('measuredAt')}
                />
                {errors.measuredAt && (
                  <p className="text-xs text-destructive mt-1">{errors.measuredAt.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  type="text"
                  {...register('notes')}
                  placeholder="Any additional notes"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onDiscard}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Discard
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Reading
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}