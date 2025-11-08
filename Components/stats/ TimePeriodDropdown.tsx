'use client'

import React from 'react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

type TimePeriod = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'

interface TimePeriodDropdownProps {
  timePeriod: TimePeriod
  onChange: (period: TimePeriod) => void
}

 const TimePeriodDropdown: React.FC<TimePeriodDropdownProps> = ({
  timePeriod,
  onChange,
}) => {
  const periods: TimePeriod[] = ['Daily', 'Weekly', 'Monthly', 'Yearly']

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">{timePeriod}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Time Period</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {periods.map((period) => (
            <DropdownMenuItem
              key={period}
              onSelect={() => onChange(period)}
              className={timePeriod === period ? 'font-semibold text-primary' : ''}
            >
              {period}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default TimePeriodDropdown