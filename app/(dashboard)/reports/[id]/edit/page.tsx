// レポート編集ページ

export default function ReportEditPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">計画書を編集</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">レポートID: {params.id}</p>
        <p className="text-gray-500">編集フォームがここに表示されます</p>
      </div>
    </div>
  )
}
