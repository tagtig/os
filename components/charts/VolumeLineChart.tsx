'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function VolumeLineChart({
  data,
  xKey,
}: {
  data: Array<Record<string, string | number>>;
  xKey: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#E8EAF0" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fill: '#6B7280', fontSize: 11 }}
          axisLine={{ stroke: '#E8EAF0' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#6B7280', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={32}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: 'white',
            border: '1px solid #E8EAF0',
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#D45BA8"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#D45BA8' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
