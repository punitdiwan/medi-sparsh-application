'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatCardProps {
  title: string
  value: number
  icon: React.ElementType
  color: string
  selected: boolean
  onClick: () => void
}

export const StatsCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  selected,
  onClick,
}) => {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        selected ? 'border-2 border-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`w-5 h-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
export default StatsCard