// ダッシュボード - 文字起こし一覧

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">ダッシュボード</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">最近の文字起こし</h2>
        <p className="text-gray-500">文字起こし履歴がここに表示されます</p>
      </div>
    </div>
  )
}
