"use client"
import React, { useState, useMemo } from "react"
import RequestHeader from "./components/RequestHeader"
import MetaGrid from "./components/MetaGrid"
import ItemsList from "./components/ItemsList"
import ApprovalsList from "./components/ApprovalsList"
import useRequestDetails from "./hooks/useRequestDetails"
import useRequestsList from "./hooks/useRequestsList"
import RequestsList from "./components/RequestsList"
import { createStaffService } from "@/components/staff/overwie/services/staffService"

export default function ViewRequest({ service }: { service?: ReturnType<typeof createStaffService> }) {
  const svc = useMemo(() => service ?? createStaffService(), [service])

  const [id] = useState<string | null>(() => {
    if (typeof window === "undefined") return null
    const parts = window.location.pathname.split("/").filter(Boolean)
    const last = parts[parts.length - 1] ?? null
    if (last && !isNaN(Number(last))) {
      return last
    }
    const params = new URLSearchParams(window.location.search)
    return params.get("id")
  })

  // Call hooks unconditionally to satisfy Rules of Hooks
  const { request, loading: requestLoading, error: requestError } = useRequestDetails(id, svc)
  const { items, loading: listLoading, error: listError, refresh, deleteRequest } = useRequestsList(svc)

  // when id is present show single request
  if (id) {
    // show full-page skeleton while fetching single request
    if (requestLoading) {
      return (
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-100 rounded w-1/3" />
            <div className="bg-white border rounded shadow-sm p-6 space-y-4">
              <div className="h-6 bg-slate-100 rounded w-2/3" />
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-36 bg-slate-100 rounded" />
              <div className="flex gap-3">
                <div className="h-4 bg-slate-100 rounded w-24" />
                <div className="h-4 bg-slate-100 rounded w-24" />
                <div className="h-4 bg-slate-100 rounded w-24" />
              </div>
              <div className="h-8 bg-slate-100 rounded w-40 mt-2" />
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="max-w-4xl mx-auto p-6">
        <RequestHeader/>
        {/* requestLoading handled above with full-page skeleton */}
        {requestError && <div className="text-sm text-rose-600">{requestError}</div>}
        {!requestLoading && !request && !requestError && <div className="text-sm text-slate-500">No request selected.</div>}
        {request && (
          <div className="bg-white border rounded shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-slate-800">{request.title ?? "Untitled request"}</h2>
              <p className="text-sm text-slate-500 mt-1">
                {request.description ? (
                  <span
                    title={String(request.description)}
                    className="block max-w-full overflow-hidden whitespace-nowrap text-ellipsis"
                  >
                    {String(request.description).length > 80
                      ? String(request.description).slice(0, 80) + "…"
                      : String(request.description)}
                  </span>
                ) : (
                  "No description"
                )}
              </p>
            </div>

            <MetaGrid request={request} />

            <ItemsList items={request.items} />

            <ApprovalsList approvals={request.approvals} />

            <div className="text-sm text-slate-500">
              <div>Request ID: <span className="text-slate-700 font-medium">{request.id}</span></div>
              {request.approved_by_user && (
                <div>
                  Approved by: <span className="text-slate-700 font-medium">{request.approved_by_user.full_name ?? request.approved_by_user.name}</span>
                </div>
              )}
              <div>
                Approval progress: <span className="text-slate-700 font-medium">{(request.current_approval_level ?? 0)} / {(request.required_approval_levels ?? "—")}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // no id -> return all requests
  if (listLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="space-y-3">
          <div className="h-8 bg-slate-100 rounded w-1/4" />
          <div className="space-y-2">
            <div className="h-8 bg-slate-100 rounded" />
            <div className="h-8 bg-slate-100 rounded" />
            <div className="h-8 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">All Requests</h1>
        <div className="flex items-center gap-2">
          <button onClick={refresh} className="text-sm px-3 py-2 rounded border hover:bg-slate-50">Refresh</button>
        </div>
      </div>

      {(listError) && <div className="text-sm text-rose-600 mb-4">{listError}</div>}

      <RequestsList
        items={items}
        loading={listLoading}
        onDelete={async (id) => {
          // find the item and guard against deleting APPROVED requests
          const rec = items.find((it) => {
            const maybeId = String((it as Record<string, unknown>)?.id ?? (it as Record<string, unknown>)?.request_id ?? (it as Record<string, unknown>)?.purchase_request_id ?? "")
            return maybeId === String(id)
          })

          if (!rec) {
            alert("Request not found. Aborting delete.")
            return
          }

          const recObj = rec as Record<string, unknown>
          const statusRaw = String(recObj.status ?? recObj.state ?? recObj.approval_status ?? "").trim().toUpperCase()
          const isApprovedByStatus = statusRaw.includes("APPROV")
          const hasApprovedFlag = Boolean(recObj.approved_by_user || recObj.approved_at || recObj.is_approved)
          const cur = Number(recObj.current_approval_level ?? NaN)
          const req = Number(recObj.required_approval_levels ?? recObj.required_approval_level ?? NaN)
          const isApprovedByLevels = Number.isFinite(cur) && Number.isFinite(req) && cur >= req

          if (isApprovedByStatus || hasApprovedFlag || isApprovedByLevels) {
            alert("Cannot delete an approved request.")
            return
          }

          if (!confirm("Delete this request? This action cannot be undone.")) return
          await deleteRequest(id)
        }}
        onOpen={() => {}}
      />
    </div>
  )
}