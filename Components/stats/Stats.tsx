
'use client'

import React, { useState } from 'react'
import  StatsCard  from './StatsCard'
import  TimePeriodDropdown  from './ TimePeriodDropdown'
import  StatsCharts  from './StatsCharts'

import {
  UsersRound,
  CalendarDays,
  ReceiptText,
  IndianRupee,
} from 'lucide-react'

type TimePeriod = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'

const StatsCardData = [
  {
    title: 'Patients',
    value: 120,
    icon: UsersRound,
    color: 'text-blue-500',
    chartKey: 'patients',
  },
  {
    title: 'Appointments',
    value: 100,
    icon: CalendarDays,
    color: 'text-purple-500',
    chartKey: 'appointments',
  },
  {
    title: 'Revenue',
    value: 90000,
    icon: IndianRupee,
    color: 'text-green-500',
    chartKey: 'revenue',
  },
  {
    title: 'Pending Bills',
    value: 10,
    icon: ReceiptText,
    color: 'text-orange-500',
    chartKey: 'bills',
  },
]

const chartData = {
  Daily: {
    patients: [
      { type: 'New', count: 8 },
      { type: 'Returning', count: 12 },
    ],
   appointments: {
  types: [
    { type: 'Consultation', count: 30 },
    { type: 'Surgery', count: 10 },
    { type: 'Follow-up', count: 20 }
  ],
  diseases: [
    { type: 'Flu', count: 12 },
    { type: 'Diabetes', count: 8 },
    { type: 'COVID-19', count: 5 }
  ]
},
    revenue: [
      { date: '10/10', value: 2000 },
      { date: '10/11', value: 2500 },
      { date: '10/12', value: 1800 },
    ],
    bills: [
      { name: 'Paid', value: 8 },
      { name: 'Pending', value: 2 },
    ],
  },
  Weekly: {
    patients: [
      { type: 'New', count: 50 },
      { type: 'Returning', count: 70 },
    ],
   appointments: {
  types: [
    { type: 'Consultation', count: 100 },
    { type: 'Surgery', count: 50 },
    { type: 'Follow-up', count: 70 }
  ],
  diseases: [
    { type: 'Flu', count: 50 },
    { type: 'Diabetes', count: 80 },
    { type: 'COVID-19', count: 60 }
  ]
},
    revenue: [
      { date: 'Week 1', value: 12000 },
      { date: 'Week 2', value: 15000 },
      { date: 'Week 3', value: 14000 },
    ],
    bills: [
      { name: 'Paid', value: 70 },
      { name: 'Pending', value: 30 },
    ],
  },
  Monthly: {
    patients: [
      { type: 'New', count: 200 },
      { type: 'Returning', count: 300 },
    ],
    appointments: {
  types: [
    { type: 'Consultation', count: 100 },
    { type: 'Surgery', count: 100 },
    { type: 'Follow-up', count: 100 }
  ],
  diseases: [
    { type: 'Flu', count: 100 },
    { type: 'Diabetes', count: 100 },
    { type: 'COVID-19', count: 100 }
  ]
},
    revenue: [
      { date: 'Jan', value: 50000 },
      { date: 'Feb', value: 52000 },
      { date: 'Mar', value: 48000 },
    ],
    bills: [
      { name: 'Paid', value: 350 },
      { name: 'Pending', value: 50 },
    ],
  },
  Yearly: {
    patients: [
      { type: 'New', count: 2000 },
      { type: 'Returning', count: 3000 },
    ],
    appointments: {
  types: [
    { type: 'Consultation', count: 30 },
    { type: 'Surgery', count: 10 },
    { type: 'Follow-up', count: 20 }
  ],
  diseases: [
    { type: 'Flu', count: 12 },
    { type: 'Diabetes', count: 8 },
    { type: 'COVID-19', count: 5 }
  ]
},
    revenue: [
      { date: '2023', value: 450000 },
      { date: '2024', value: 500000 },
      { date: '2025', value: 520000 },
    ],
    bills: [
      { name: 'Paid', value: 2000 },
      { name: 'Pending', value: 500 },
    ],
  },
}

export default function Stats() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('Daily')
  const [selectedCard, setSelectedCard] = useState<string>('Patients')

  const data = chartData[timePeriod]

  return (
    <div className="space-y-6 p-4">
      <TimePeriodDropdown timePeriod={timePeriod} onChange={setTimePeriod} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {StatsCardData.map((card) => (
          <StatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            selected={selectedCard === card.title}
            onClick={() => setSelectedCard(card.title)}
          />
        ))}
      </div>

      <StatsCharts
        selectedCard={selectedCard}
        timePeriod={timePeriod}
        data={data}
      />
    </div>
  )
}
