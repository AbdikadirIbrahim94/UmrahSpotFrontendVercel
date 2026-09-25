"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CustomCalendarProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  className?: string
}

export function CustomCalendar({ selected, onSelect, disabled, className = "" }: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    selected ? new Date(selected.getFullYear(), selected.getMonth(), 1) : new Date(),
  )

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()

  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)

    if (disabled && disabled(date)) {
      return
    }

    onSelect?.(date)
  }

  const isSelected = (day: number) => {
    if (!selected) return false
    return (
      selected.getDate() === day &&
      selected.getMonth() === currentMonth.getMonth() &&
      selected.getFullYear() === currentMonth.getFullYear()
    )
  }

  const isDisabled = (day: number) => {
    if (!disabled) return false
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return disabled(date)
  }

  // Generate array of days including empty slots for alignment
  const days = []

  // Add empty slots for days before the first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }

  // Add actual days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  return (
    <div className={`p-3 ${className}`}>
      {/* Month/Year Header with Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent" onClick={previousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <Button variant="outline" size="icon" className="h-7 w-7 bg-transparent" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="w-full">
        {/* Day Names Header */}
        <div className="grid grid-cols-7 gap-0 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="h-9 w-9 flex items-center justify-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Dates Grid */}
        <div className="grid grid-cols-7 gap-0">
          {days.map((day, index) => (
            <div key={index} className="h-9 w-9 flex items-center justify-center">
              {day ? (
                <button
                  onClick={() => handleDateClick(day)}
                  disabled={isDisabled(day)}
                  className={`
                    h-9 w-9 rounded-md text-sm
                    ${isSelected(day) ? "bg-[#ffd700] text-black font-semibold" : "hover:bg-gray-100"}
                    ${isDisabled(day) ? "text-gray-300 cursor-not-allowed hover:bg-transparent" : "cursor-pointer"}
                  `}
                >
                  {day}
                </button>
              ) : (
                <div className="h-9 w-9" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
