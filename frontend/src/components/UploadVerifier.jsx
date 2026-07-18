import { useState } from 'react'
import Swal from 'sweetalert2'
import { api } from '../services/api'

export default function UploadVerifier({ endpoint = '/ai/verify-id', title = 'Document Verification' }) {
  const [result, setResult] = useState(null)

  const upload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const data = new FormData()
    data.append('file', file)
    try {
      const response = await api.post(endpoint, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(response.data)
      Swal.fire(response.data.accepted ? 'Accepted' : 'Rejected', response.data.reasons.join(', ') || 'Verification complete.', response.data.accepted ? 'success' : 'warning')
    } catch (error) {
      Swal.fire('Upload failed', error.response?.data?.detail || 'Could not verify this file.', 'error')
    }
  }

  return (
    <section className="glass rounded-lg p-5 shadow-soft">
      <h2 className="text-xl font-black">{title}</h2>
      <input type="file" accept="image/*,.pdf" onChange={upload} className="mt-5 w-full rounded-lg border border-dashed border-slate-300 p-4 dark:border-slate-700" />
      {result ? (
        <div className="mt-4 rounded-lg bg-white p-4 text-sm dark:bg-slate-900">
          <p className="font-black">{result.accepted ? 'Accepted' : 'Rejected'} | Confidence {Math.round(result.confidence * 100)}%</p>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{result.extracted_text}</p>
        </div>
      ) : null}
    </section>
  )
}
