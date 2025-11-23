import Link from "next/link"

export default function RequestHeader() {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold">Request details</h1>
      <div className="flex items-center gap-2">
        <Link href="/dashboards/staff" className="text-sm px-3 py-2 rounded border hover:bg-slate-50">
          Back
        </Link>
        
      </div>
    </div>
  )
}