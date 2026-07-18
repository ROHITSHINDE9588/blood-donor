import ChartPanel from '../../components/ChartPanel'
import EntityTable from '../../components/EntityTable'

export default function Reports() {
  return (
    <div className="grid gap-5">
      <ChartPanel title="Hospital Reports" />
      <EntityTable title="Approved Donations" rows={[]} columns={[{ key: 'donor', label: 'Donor' }, { key: 'date', label: 'Date' }, { key: 'certificate', label: 'Certificate' }]} />
    </div>
  )
}
