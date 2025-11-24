import { useEffect, useState } from "react"
import type { RequestItem } from "@/components/staff/overwie/services/staffService"
import { createStaffService } from "@/components/staff/overwie/services/staffService"
import api from "@/lib/api"

const defaultService = createStaffService()

type PartialStaffSvc = {
  fetchRequest?: (id: number | string, token?: string) => Promise<RequestItem | null>
  fetchAllRequests?: (token?: string) => Promise<RequestItem[]>
  fetchRecent?: (token?: string) => Promise<unknown>
}

/**
 * useRequestDetails
 * - robustly tries multiple ways to load a single request by id:
 *   1) svc.fetchRequest(id)
 *   2) svc.fetchAllRequests() and find by id
 *   3) svc.fetchRecent() (handles approvals endpoints that return {approved_requests})
 *   4) direct API call to /purchases/requests/{id}/
 */
export default function useRequestDetails(
  id?: string | null,
  svc: PartialStaffSvc = defaultService
) {
  const [request, setRequest] = useState<RequestItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setRequest(null)
      setError(null)
      return
    }

    let mounted = true
    setError(null)

    ;(async () => {
      await Promise.resolve() // yield
      if (!mounted) return
      setLoading(true)

      try {
        const wantId = String(id)

        // 1) preferred: fetchRequest
        if (typeof svc.fetchRequest === "function") {
          try {
            const res = await svc.fetchRequest(wantId)
            if (res && mounted) {
              setRequest(res)
              return
            }
          } catch {
            // continue to fallbacks
          }
        }

        // 2) try fetchAllRequests and find by id
        if (typeof svc.fetchAllRequests === "function") {
          try {
            const all = await svc.fetchAllRequests()
            const found = all.find((r) => String((r as RequestItem).id) === wantId)
            if (found && mounted) {
              setRequest(found)
              return
            }
          } catch {
            // continue
          }
        }

        // 3) try fetchRecent (approvals/mine endpoint may return nested objects)
        if (typeof svc.fetchRecent === "function") {
          try {
            const recent = await svc.fetchRecent()
            const candidates: unknown[] = []

            if (Array.isArray(recent)) {
              candidates.push(...recent)
            } else if (recent && typeof recent === "object") {
              const o = recent as Record<string, unknown>
              // common keys that hold arrays
              for (const k of ["approved_requests", "pending_requests", "results", "data", "approvals"]) {
                if (Array.isArray(o[k])) candidates.push(...(o[k] as unknown[]))
              }
            }

            for (const entry of candidates) {
              const src = (entry && typeof entry === "object"
                ? (entry as Record<string, unknown>).purchase_request ?? (entry as Record<string, unknown>).request ?? entry
                : entry) as unknown

              if (src && typeof src === "object") {
                const srcObj = src as Record<string, unknown>
                if (String(srcObj.id) === wantId) {
                  if (mounted) {
                    setRequest(srcObj as RequestItem)
                    return
                  }
                }
              }
            }
          } catch {
            // continue
          }
        }

        // 4) fallback: direct API call
        try {
          const res = await api.get(`/purchases/requests/${wantId}/`)
          const data = res.data ?? null
          if (data && mounted) {
            setRequest(data as RequestItem)
            return
          }
        } catch {
          // final failure
        }

        if (mounted) setError("Request not found")
      } catch {
        if (mounted) setError("Failed to load request")
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [id, svc])

  return { request, loading, error, setRequest }
}