import UploadVerifier from '../../components/UploadVerifier'

export default function Settings() {
  return <UploadVerifier title="Donor ID Card Verification" endpoint="/ai/verify-id" />
}
