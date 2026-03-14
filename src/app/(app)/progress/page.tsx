'use client';

import { BarChart, LineChart, TrendingDown, TrendingUp, Medal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, CartesianGrid, XAxis, YAxis, Line, ComposedChart, TooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';


const weeklyAnxietyData = [
  { day: 'Mon', anxiety: 7 }, { day: 'Tue', anxiety: 6 }, { day: 'Wed', anxiety: 8 },
  { day: 'Thu', anxiety: 5 }, { day: 'Fri', anxiety: 4 }, { day: 'Sat', anxiety: 6 }, { day: 'Sun', anxiety: 3 },
];

const compulsionData = [
  { month: 'Jan', resisted: 20, performed: 35 },
  { month: 'Feb', resisted: 25, performed: 30 },
  { month: 'Mar', resisted: 35, performed: 22 },
  { month: 'Apr', resisted: 45, performed: 15 },
];

const chartConfig = {
  anxiety: { label: 'Anxiety Level', color: 'hsl(var(--destructive))' },
  resisted: { label: 'Resisted', color: 'hsl(var(--chart-2))' },
  performed: { label: 'Performed', color: 'hsl(var(--chart-1))' },
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background border rounded-lg shadow-lg">
          <p className="label font-bold">{label}</p>
          {payload.map((pld, index) => (
            <p key={index} style={{ color: pld.color }}>
              {`${pld.name}: ${pld.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

export default function ProgressPage() {

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Your Progress</h1>
      </div>
      <p className="text-muted-foreground">
        Visualize your journey. Track your stats to see how far you've come.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mental Fortitude</CardTitle>
            <Medal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">62%</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Anxiety</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">↓18%</div>
            <p className="text-xs text-muted-foreground">Compared to last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compulsions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Resisted: +32%</div>
            <p className="text-xs text-muted-foreground">More compulsions resisted this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LineChart className="h-5 w-5" />Weekly Anxiety Trend</CardTitle>
            <CardDescription>Your average anxiety level over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ComposedChart data={weeklyAnxietyData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis width={20} domain={[0, 10]} tickLine={false} axisLine={false} />
                <ChartTooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="anxiety" stroke={chartConfig.anxiety.color} strokeWidth={2} dot={true} />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5" />Compulsion Tracker</CardTitle>
            <CardDescription>Compulsions resisted vs. performed over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ComposedChart data={compulsionData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis width={20} />
                <ChartTooltip content={<CustomTooltip />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="performed" stackId="a" fill={chartConfig.performed.color} radius={[4, 4, 0, 0]} />
                <Bar dataKey="resisted" stackId="a" fill={chartConfig.resisted.color} radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
