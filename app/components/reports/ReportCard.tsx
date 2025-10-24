// レポートカード（一覧用）

import { CarePlanReport } from '@/app/lib/types'

interface ReportCardProps {
  report: CarePlanReport
}

export default function ReportCard({ report }: ReportCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">{report.client_name}</h3>
          <p className="text-gray-500 text-sm">
            {report.care_level && `${report.care_level} | `}
            {report.client_age && `${report.client_age}歳`}
          </p>
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {new Date(report.created_at).toLocaleDateString('ja-JP')}
        </span>
      </div>

      {report.long_term_goal && (
        <p className="text-gray-700 mb-4 line-clamp-2">
          目標: {report.long_term_goal}
        </p>
      )}

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          サービス数: {report.services.length}
        </span>
        <a
          href={`/reports/${report.id}`}
          className="text-blue-600 hover:text-blue-800"
        >
          詳細を見る →
        </a>
      </div>
    </div>
  )
}
