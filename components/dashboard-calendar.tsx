"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export function DashboardCalendar() {
  const [currentMonth] = useState(new Date())

  // Calendar generation
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)
  const currentDay = new Date().getDate()
  const currentMonthNow = new Date().getMonth()
  const currentYearNow = new Date().getFullYear()
  const isCurrentMonth = month === currentMonthNow && year === currentYearNow

  // Events for the calendar (dummy data)
  const events = [2, 6, 13, 26, 28]
  const scheduledEvents = [4, 10, 19]
  const cancelledEvents = [13]

  // Generate calendar days
  const calendarDays = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ day: 31 - firstDayOfMonth + i + 1, isCurrentMonth: false })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      isToday: isCurrentMonth && day === currentDay,
      hasEvent: events.includes(day),
      isScheduled: scheduledEvents.includes(day),
      isCancelled: cancelledEvents.includes(day),
    })
  }

  // Fill remaining cells to complete the grid
  const nextMonthDays = 35 - calendarDays.length
  for (let day = 1; day <= nextMonthDays; day++) {
    calendarDays.push({ day, isCurrentMonth: false })
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Calendar</CardTitle>
        <div className="text-xs text-muted-foreground">Lorem ipsum dolor sit amet.</div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 text-center">
          <div className="text-xs font-medium text-muted-foreground">Sun</div>
          <div className="text-xs font-medium text-muted-foreground">Mon</div>
          <div className="text-xs font-medium text-muted-foreground">Tue</div>
          <div className="text-xs font-medium text-muted-foreground">Wed</div>
          <div className="text-xs font-medium text-muted-foreground">Thu</div>
          <div className="text-xs font-medium text-muted-foreground">Fri</div>
          <div className="text-xs font-medium text-muted-foreground">Sat</div>

          {calendarDays.map((day, i) => {
            const className = `
              h-10 flex items-center justify-center rounded-md text-sm cursor-pointer
              ${!day.isCurrentMonth ? "text-muted-foreground" : ""}
              ${day.isToday ? "bg-primary/20 font-bold" : ""}
              ${day.hasEvent ? "bg-green-100" : ""}
              ${day.isScheduled ? "bg-blue-100" : ""}
              ${day.isCancelled ? "bg-red-100" : ""}
            `

            return (
              <div
                key={i}
                className={className}
                onClick={() => {
                  if (day.isCurrentMonth) {
                    toast.info(`Selected date: March ${day.day}, 2025`)
                  }
                }}
              >
                {day.day}
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Successful Visit</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Cancelled Visit</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Pending Visit</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Confirmed Visit</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
