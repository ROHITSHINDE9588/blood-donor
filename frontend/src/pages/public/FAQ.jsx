const faqs = [
  ['How is donor priority calculated?', 'The backend scores compatible donors using distance, availability, last donation date, previous donations, health status, age, and travel time.'],
  ['Can hospitals verify requests?', 'Hospital and admin users can review donor documents, verify requests, and approve donation records.'],
  ['Does the app support live maps?', 'Yes. The UI uses React Leaflet with OpenStreetMap and the backend stores donor and hospital coordinates.'],
]

export default function FAQ() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-black text-ink dark:text-white">FAQ</h1>
      <div className="mt-6 grid gap-3">
        {faqs.map(([question, answer]) => (
          <details key={question} className="glass rounded-lg p-4 shadow-soft">
            <summary className="cursor-pointer font-black">{question}</summary>
            <p className="mt-3 text-slate-600 dark:text-slate-200">{answer}</p>
          </details>
        ))}
      </div>
    </main>
  )
}
