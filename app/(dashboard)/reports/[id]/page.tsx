// 個別レポート表示ページ

export default function ReportDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">居宅サービス計画書</h1>
        <div className="flex gap-2">
          <a
            href={`/reports/${params.id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            編集
          </a>
          <a
            href="/reports"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            一覧に戻る
          </a>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">レポートID: {params.id}</p>
        <p className="text-gray-500">レポート詳細がここに表示されます</p>
      </div>
    </div>
  )
}
