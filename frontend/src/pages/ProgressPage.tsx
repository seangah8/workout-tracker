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
import { useWorkouts } from '../hooks/useWorkouts';

const CHART_COLORS = ['#f97316', '#fb923c', '#fdba74', '#94a3b8', '#6b7280', '#e2e8f0'];

function formatXLabel(dateStr: string) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fillDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(start + 'T12:00:00');
  const last = new Date(end + 'T12:00:00');
  while (cur <= last) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export function ProgressPage() {
  const { getSeriesForChart } = useWorkouts();
  const series = getSeriesForChart();

  if (series.length === 0) {
    return (
      <div className="page">
        <h1>Progress</h1>
        <p className="empty-state">
          No data yet. Log some reps on the Calendar page to see your progress here.
        </p>
      </div>
    );
  }

  const dataDates = Array.from(new Set(series.flatMap((s) => s.data.map((d) => d.date)))).sort();
  const allDates = fillDateRange(dataDates[0], dataDates[dataDates.length - 1]);

  const chartData = allDates.map((date) => {
    const point: Record<string, string | number> = { date };
    series.forEach((s) => {
      const entry = s.data.find((d) => d.date === date);
      if (entry) point[s.name] = entry.reps;
    });
    return point;
  });

  return (
    <div className="page">
      <h1>Progress</h1>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3e" />
            <XAxis
              dataKey="date"
              ticks={dataDates}
              tickFormatter={formatXLabel}
              tick={{ fill: '#9a9a9f', fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#9a9a9f', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Reps', angle: -90, position: 'insideLeft', fill: '#9a9a9f', fontSize: 12, dy: 20 }}
            />
            <Tooltip
              contentStyle={{
                background: '#2a2a2d',
                border: '1px solid #3a3a3e',
                borderRadius: '8px',
                color: '#f1f1f1',
                fontSize: '0.875rem',
              }}
              labelFormatter={(label) => formatXLabel(String(label))}
            />
            <Legend
              wrapperStyle={{ color: '#9a9a9f', fontSize: '0.875rem', paddingTop: '16px' }}
            />
            {series.map((s, i) => (
              <Line
                key={s.id}
                type="monotone"
                dataKey={s.name}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS[i % CHART_COLORS.length], r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls={true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
