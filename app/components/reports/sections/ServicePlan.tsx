// サービス内容セクション

import { ServiceItem } from '@/app/lib/types'

interface ServicePlanProps {
  services: ServiceItem[]
}

export default function ServicePlan({ services }: ServicePlanProps) {
  return (
    <section className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-blue-600">サービス内容</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                サービス種類
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                頻度
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                詳細
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((service, index) => (
              <tr key={index}>
                <td className="px-4 py-2">{service.type}</td>
                <td className="px-4 py-2">{service.frequency}</td>
                <td className="px-4 py-2">{service.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
