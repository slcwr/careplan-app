// レポート入力フォーム

'use client'

import { useState } from 'react'
import { CarePlanReport } from '@/app/lib/types'

interface ReportFormProps {
  initialData?: Partial<CarePlanReport>
  onSubmit: (data: Partial<CarePlanReport>) => void
  isLoading?: boolean
}

export default function ReportForm({ initialData, onSubmit, isLoading }: ReportFormProps) {
  const [formData, setFormData] = useState({
    client_name: initialData?.client_name || '',
    client_age: initialData?.client_age || '',
    care_level: initialData?.care_level || '',
    life_issues: initialData?.life_issues || '',
    long_term_goal: initialData?.long_term_goal || '',
    remarks: initialData?.remarks || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* 基本情報 */}
      <section>
        <h3 className="text-lg font-semibold mb-4 text-blue-600">基本情報</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              氏名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              年齢
            </label>
            <input
              type="number"
              value={formData.client_age}
              onChange={(e) => setFormData({ ...formData, client_age: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              要介護度
            </label>
            <select
              value={formData.care_level}
              onChange={(e) => setFormData({ ...formData, care_level: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択してください</option>
              <option value="要支援1">要支援1</option>
              <option value="要支援2">要支援2</option>
              <option value="要介護1">要介護1</option>
              <option value="要介護2">要介護2</option>
              <option value="要介護3">要介護3</option>
              <option value="要介護4">要介護4</option>
              <option value="要介護5">要介護5</option>
            </select>
          </div>
        </div>
      </section>

      {/* 生活課題・目標 */}
      <section>
        <h3 className="text-lg font-semibold mb-4 text-blue-600">生活課題・目標</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              生活課題
            </label>
            <textarea
              value={formData.life_issues}
              onChange={(e) => setFormData({ ...formData, life_issues: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              長期目標
            </label>
            <textarea
              value={formData.long_term_goal}
              onChange={(e) => setFormData({ ...formData, long_term_goal: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* 備考 */}
      <section>
        <h3 className="text-lg font-semibold mb-4 text-blue-600">備考</h3>
        <textarea
          value={formData.remarks}
          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </section>

      {/* 送信ボタン */}
      <div className="flex justify-end gap-3">
        <a
          href="/reports"
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          キャンセル
        </a>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  )
}
