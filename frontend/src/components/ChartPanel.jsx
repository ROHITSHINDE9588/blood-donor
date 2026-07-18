import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function ChartPanel({ title = 'Blood group availability', data = [] }) {
  const fallback = [
    { blood_group: 'A+', count: 14 },
    { blood_group: 'B+', count: 18 },
    { blood_group: 'O+', count: 25 },
    { blood_group: 'AB+', count: 7 },
  ]

  return (
    <div className="glass rounded-lg p-5 shadow-soft">
      <h2 className="text-lg font-black text-ink dark:text-white">{title}</h2>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.length ? data : fallback}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="blood_group" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#d90429" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
