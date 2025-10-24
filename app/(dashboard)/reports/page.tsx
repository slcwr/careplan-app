// レポート一覧ページ

export default function ReportsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">居宅サービス計画書</h1>
        <a
          href="/reports/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          新規作成
        </a>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">レポート一覧がここに表示されます</p>
      </div>
    </div>
  )
}
