import React from 'react'
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip } from '../chart'

const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name: label
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central">
      {label} ({`${(percent * 100).toFixed(1)}%`})
    </text>
  )
}

export default ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart data={data} isAnimationActive={false}>
        <Pie
          isAnimationActive={false}
          data={data}
          dataKey="value"
          nameKey="label"
          labelLine={false}
          label={renderCustomizedLabel}
          cx="50%"
          cy="50%">
          {data.map(item => (
            <Cell key={item.label} fill={item.fill || 'white'} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name, props) => `${value}`} />
      </PieChart>
    </ResponsiveContainer>
  )
}
