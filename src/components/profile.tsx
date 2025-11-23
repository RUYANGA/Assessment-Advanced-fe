"use client"
import React from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Mail,
  User,
  ArrowLeft,
  LogOut,
  Clipboard
} from "lucide-react"

type Role = "staff" | "finance" | "approver1" | "approver2"
type CurrentUser = {
  id: number
  email: string
  first_name: string
  last_name: string
  role: Role
}

const user: CurrentUser = {
  id: 2,
  email: "ruyangamerci30@gmail.com",
  first_name: "Merci",
  last_name: "KAGABO",
  role: "finance",
}

export default function ProfilePage() {
  const router = useRouter()
  const displayName = `${user.first_name} ${user.last_name}`
  const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()

  function dashboardPath(role: Role): string {
    switch (role) {
      case "staff":
        return "/dashboards/staff"
      case "finance":
        return "/dashboards/finance"
      case "approver1":
      case "approver2":
        return "/dashboards/approval"
      default:
        // ensure exhaustiveness at compile time
        const _exhaustiveCheck: never = role
        throw new Error(`Unhandled role: ${_exhaustiveCheck}`)
    }
  }

  function goBack() {
    router.push(dashboardPath(user.role))
  }



  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(user.email)
    } catch {}
  }

  function handleLogout() {
    if (typeof window !== "undefined") localStorage.removeItem("token")
    router.push("/login")
  }

  return (
    <div className={cn("w-full max-w-6xl mx-auto p-4 md:p-6")}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            aria-label="Back to dashboard"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 border"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{displayName}</h1>
            <p className="text-sm text-slate-500">{user.role.toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          
          <button onClick={copyEmail} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-50 border hover:bg-slate-100 text-sm">
            <Clipboard className="w-4 h-4" /> Copy email
          </button>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: profile card */}
        <section className="col-span-1 bg-white border rounded-lg p-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-semibold text-slate-700 overflow-hidden">
              <span>{initials}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900">{displayName}</h2>
              <p className="text-sm text-slate-500">{user.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-800 mb-2">About</h4>
            <p className="text-sm text-slate-600">No bio provided.</p>
          </div>
        </section>
        {/* Right: details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <section className="bg-white border rounded-lg p-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-slate-500 mt-1" />
                <div>
                  <div className="text-xs text-slate-500">Email</div>
                  <div className="text-sm font-medium text-slate-900">{user.email}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-slate-500 mt-1" />
                <div>
                  <div className="text-xs text-slate-500">Role</div>
                  <div className="text-sm font-medium text-slate-900">{user.role.toUpperCase()}</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}