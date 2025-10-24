// 基本情報セクション

interface BasicInfoProps {
  clientName: string
  clientAge: number | null
  careLevel: string | null
}

export default function BasicInfo({ clientName, clientAge, careLevel }: BasicInfoProps) {
  return (
    <section className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-blue-600">基本情報</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-500">氏名</label>
          <p className="font-medium">{clientName}</p>
        </div>
        {clientAge && (
          <div>
            <label className="text-sm text-gray-500">年齢</label>
            <p className="font-medium">{clientAge}歳</p>
          </div>
        )}
        {careLevel && (
          <div>
            <label className="text-sm text-gray-500">要介護度</label>
            <p className="font-medium">{careLevel}</p>
          </div>
        )}
      </div>
    </section>
  )
}
