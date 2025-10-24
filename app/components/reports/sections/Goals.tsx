// 目標セクション

interface GoalsProps {
  longTermGoal: string | null
  shortTermGoals: string[]
}

export default function Goals({ longTermGoal, shortTermGoals }: GoalsProps) {
  return (
    <section className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-blue-600">目標</h3>
      <div className="space-y-4">
        {longTermGoal && (
          <div>
            <label className="text-sm text-gray-500">長期目標</label>
            <p className="font-medium">{longTermGoal}</p>
          </div>
        )}
        {shortTermGoals.length > 0 && (
          <div>
            <label className="text-sm text-gray-500">短期目標</label>
            <ul className="list-disc list-inside space-y-1">
              {shortTermGoals.map((goal, index) => (
                <li key={index} className="font-medium">{goal}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
