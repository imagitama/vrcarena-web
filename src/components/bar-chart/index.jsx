import React from 'react'
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from '../chart'

export default ({ data, width }) => {
  const total = data.reduce((tally, item) => tally + item.value, 0)
  return (
    <ResponsiveContainer width={width || '100%'} height={300}>
      <BarChart data={data} margin={{ bottom: 150 }}>
        <Bar
          isAnimationActive={false}
          dataKey="value"
          fill={'white'}
        />
        <XAxis dataKey="name" angle={-90} textAnchor="end" interval={0} />
        <YAxis />
        <Tooltip formatter={(value) => `${value} (${(value / total * 100).toFixed(1)}%)`} itemStyle={{ color: 'black' }} />
      </BarChart>
    </ResponsiveContainer>
  )
}
