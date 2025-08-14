"use client";

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface TrendsChartProps {
  title: string;
  data: any[];
  dataKeys: { key: string; color: string; label?: string }[];
  xAxisKey?: string;
  yAxisLabel?: string;
  height?: number;
}

export function TrendsChart({
  title,
  data,
  dataKeys,
  xAxisKey = 'date',
  yAxisLabel,
  height = 300,
}: TrendsChartProps) {
  const formatXAxis = (tickItem: string) => {
    try {
      return format(new Date(tickItem), 'MMM d');
    } catch {
      return tickItem;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium">
            {format(new Date(label), 'PPp')}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey={xAxisKey}
                tickFormatter={formatXAxis}
                className="text-xs"
              />
              <YAxis
                label={
                  yAxisLabel
                    ? {
                        value: yAxisLabel,
                        angle: -90,
                        position: 'insideLeft',
                        className: 'text-xs',
                      }
                    : undefined
                }
                className="text-xs"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend className="text-sm" />
              {dataKeys.map((dk) => (
                <Line
                  key={dk.key}
                  type="monotone"
                  dataKey={dk.key}
                  stroke={dk.color}
                  name={dk.label || dk.key}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}