import EntityTable from '../../components/EntityTable'

export default function DonationHistory() {
  return <EntityTable title="Donation History" rows={[]} columns={[{ key: 'donated_on', label: 'Date' }, { key: 'hospital', label: 'Hospital' }, { key: 'status', label: 'Status' }, { key: 'certificate_url', label: 'Certificate' }]} />
}
