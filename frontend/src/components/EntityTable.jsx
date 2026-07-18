export default function EntityTable({ title, columns = [], rows = [] }) {
  return (
    <section className="glass overflow-hidden rounded-lg shadow-soft">
      <div className="p-5">
        <h2 className="text-xl font-black">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-300">
            <tr>{columns.map((column) => <th key={column.key} className="px-5 py-3">{column.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((row, index) => (
              <tr key={row.id || index} className="border-t border-slate-100 dark:border-slate-800">
                {columns.map((column) => <td key={column.key} className="px-5 py-4 font-semibold">{column.render ? column.render(row) : row[column.key]}</td>)}
              </tr>
            )) : (
              <tr className="border-t border-slate-100 dark:border-slate-800">
                <td colSpan={columns.length} className="px-5 py-10 text-center font-semibold text-slate-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
