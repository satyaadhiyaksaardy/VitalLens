import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistance, formatRelative, parseISO } from "date-fns";
import Papa from "papaparse";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'PPp');
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'PP');
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(d, new Date(), { addSuffix: true });
}

export function getBPCategory(systolic?: number | null, diastolic?: number | null): {
  category: string;
  color: string;
} {
  if (!systolic || !diastolic) return { category: 'Unknown', color: 'text-gray-500' };
  
  if (systolic < 120 && diastolic < 80) {
    return { category: 'Normal', color: 'text-green-600' };
  } else if (systolic < 130 && diastolic < 80) {
    return { category: 'Elevated', color: 'text-yellow-600' };
  } else if (systolic < 140 || diastolic < 90) {
    return { category: 'Stage 1 Hypertension', color: 'text-orange-600' };
  } else {
    return { category: 'Stage 2 Hypertension', color: 'text-red-600' };
  }
}

export function getBMICategory(bmi?: number | null): {
  category: string;
  color: string;
} {
  if (!bmi) return { category: 'Unknown', color: 'text-gray-500' };
  
  if (bmi < 18.5) {
    return { category: 'Underweight', color: 'text-blue-600' };
  } else if (bmi < 25) {
    return { category: 'Normal', color: 'text-green-600' };
  } else if (bmi < 30) {
    return { category: 'Overweight', color: 'text-yellow-600' };
  } else {
    return { category: 'Obese', color: 'text-red-600' };
  }
}

export function exportToCSV(data: any[], filename: string = 'export.csv') {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function calculateDelta(current?: number | null, previous?: number | null): number | null {
  if (current === null || current === undefined || previous === null || previous === undefined) {
    return null;
  }
  return roundTo(current - previous, 2);
}