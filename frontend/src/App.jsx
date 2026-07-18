import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import PublicLayout from './layouts/PublicLayout'
import ForgotPassword from './pages/auth/ForgotPassword'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ResetPassword from './pages/auth/ResetPassword'
import AdminAnalytics from './pages/admin/Analytics'
import AdminBloodRequests from './pages/admin/BloodRequests'
import AdminHospitals from './pages/admin/Hospitals'
import AdminSettings from './pages/admin/Settings'
import AdminUsers from './pages/admin/Users'
import Availability from './pages/donor/Availability'
import DonorBloodRequests from './pages/donor/BloodRequests'
import DonationHistory from './pages/donor/DonationHistory'
import DonorDashboard from './pages/donor/DonorDashboard'
import DonorNotifications from './pages/donor/Notifications'
import DonorProfile from './pages/donor/Profile'
import DonorSettings from './pages/donor/Settings'
import HospitalDashboard from './pages/hospital/HospitalDashboard'
import HospitalDonors from './pages/hospital/Donors'
import HospitalReports from './pages/hospital/Reports'
import HospitalRequests from './pages/hospital/Requests'
import HospitalVerification from './pages/hospital/Verification'
import DonorVerificationManager from './pages/hospital/Verification'
import About from './pages/public/About'
import Contact from './pages/public/Contact'
import FAQ from './pages/public/FAQ'
import Home from './pages/public/Home'
import Hospitals from './pages/public/Hospitals'
import SearchBlood from './pages/public/SearchBlood'
import CreateRequest from './pages/recipient/CreateRequest'
import RecipientDashboard from './pages/recipient/RecipientDashboard'
import RecipientNotifications from './pages/recipient/Notifications'
import SearchDonor from './pages/recipient/SearchDonor'
import TrackRequest from './pages/recipient/TrackRequest'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/search-blood" element={<SearchBlood />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route
        path="/donor"
        element={<ProtectedRoute roles={['donor']}><DashboardLayout /></ProtectedRoute>}
      >
        <Route index element={<DonorDashboard />} />
        <Route path="profile" element={<DonorProfile />} />
        <Route path="availability" element={<Availability />} />
        <Route path="requests" element={<DonorBloodRequests />} />
        <Route path="history" element={<DonationHistory />} />
        <Route path="notifications" element={<DonorNotifications />} />
        <Route path="settings" element={<DonorSettings />} />
      </Route>

      <Route
        path="/recipient"
        element={<ProtectedRoute roles={['recipient']}><DashboardLayout /></ProtectedRoute>}
      >
        <Route index element={<RecipientDashboard />} />
        <Route path="search-donor" element={<SearchDonor />} />
        <Route path="create-request" element={<CreateRequest />} />
        <Route path="track-request" element={<TrackRequest />} />
        <Route path="notifications" element={<RecipientNotifications />} />
      </Route>

      <Route
        path="/hospital"
        element={<ProtectedRoute roles={['hospital']}><DashboardLayout /></ProtectedRoute>}
      >
        <Route index element={<HospitalDashboard />} />
        <Route path="donors" element={<HospitalDonors />} />
        <Route path="requests" element={<HospitalRequests />} />
        <Route path="verification" element={<HospitalVerification />} />
        <Route path="reports" element={<HospitalReports />} />
      </Route>

      <Route
        path="/admin"
        element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}
      >
        <Route index element={<AdminAnalytics />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="hospitals" element={<AdminHospitals />} />
        <Route path="blood-requests" element={<AdminBloodRequests />} />
        <Route path="verification" element={<DonorVerificationManager />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
