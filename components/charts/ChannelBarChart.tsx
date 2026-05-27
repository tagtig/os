'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Row = { label: string; total: number; replyRate: number; meetingRate: number };

export function ChannelBarChart({ data, mode }: { data: Row[]; mode: 'reply' | 'meeting' }) {
  const chartData = data.map((d) => ({
    label: d.label,
    rate: Math.round((mode === 'reply' ? d.replyRate : d.meetingRate) * 100),
    total: d.total,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#E8EAF0" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: '#6B7280', fontSize: 12 }}
          axisLine={{ stroke: '#E8EAF0' }}
          tickLine={false}
        />
        <YAxis
          unit="%"
          tick={{ fill: '#6B7280', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          cursor={{ fill: 'rgba(212,91,168,0.08)' }}
          contentStyle={{
            background: 'white',
            border: '1px solid #E8EAF0',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value: number, _name, ctx) => [
            `${value}% (n=${ctx.payload.total})`,
            mode === 'reply' ? 'Reply-Rate' : 'Meeting-Rate',
          ]}
        />
        <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
          {chartData.map((_d, i) => (
            <Cell key={i} fill="#D45BA8" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
