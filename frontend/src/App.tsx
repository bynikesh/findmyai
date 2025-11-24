import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import ToolList from './pages/ToolList'
import ToolDetail from './pages/ToolDetail'
import Submit from './pages/Submit'
import Login from './pages/Login'
import ChatWidget from './components/ChatWidget'
import AdminGuard from './components/AdminGuard'
import SubmissionsList from './pages/admin/SubmissionsList'
import SubmissionReview from './pages/admin/SubmissionReview'
import AdminDashboard from './pages/admin/AdminDashboard'
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard'

function App() {
    return (
        <Router>
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/tools" element={<ToolList />} />
                        <Route path="/tools/:slug" element={<ToolDetail />} />
                        <Route path="/submit" element={<Submit />} />
                        <Route path="/login" element={<Login />} />
                        {/* Admin Routes */}
                        <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
                        <Route path="/admin/analytics" element={<AdminGuard><AnalyticsDashboard /></AdminGuard>} />
                        <Route path="/admin/submissions" element={<AdminGuard><SubmissionsList /></AdminGuard>} />
                        <Route path="/admin/submissions/:id" element={<AdminGuard><SubmissionReview /></AdminGuard>} />
                    </Routes>
                </main>
                <Footer />
                <ChatWidget />
            </div>
        </Router>
    )
}

export default App
