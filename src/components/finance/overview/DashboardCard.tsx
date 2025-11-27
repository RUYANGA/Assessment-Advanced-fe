import React from "react"

type DashboardCardProps = {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}

export function DashboardCard({ icon, label, value }: DashboardCardProps) {
  return (
    <div className="p-3 sm:p-4 md:p-5 bg-white rounded-lg shadow-sm flex items-center gap-3 sm:gap-3">
      <div className="p-2 rounded-lg bg-slate-100">{icon}</div>
      <div className="flex-1">
        <div className="text-xs sm:text-xs md:text-sm text-slate-500">{label}</div>
        <div className="text-lg sm:text-xl md:text-2xl font-semibold">{value}</div>
      </div>
    </div>
  )
}