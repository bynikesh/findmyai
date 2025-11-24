import { Routes, Route, useLocation } from 'react-router-dom'
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
import ToolsManagement from './pages/admin/ToolsManagement'
import CategoriesManagement from './pages/admin/CategoriesManagement'

function App() {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <div className="flex flex-col min-h-screen">
            {!isAdminRoute && <Header />}
            <main className={isAdminRoute ? '' : 'flex-grow'}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/tools" element={<ToolList />} />
                    <Route path="/tools/:slug" element={<ToolDetail />} />
                    <Route path="/submit" element={<Submit />} />
                    <Route path="/login" element={<Login />} />
                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
                    <Route path="/admin/tools" element={<AdminGuard><ToolsManagement /></AdminGuard>} />
                    <Route path="/admin/categories" element={<AdminGuard><CategoriesManagement /></AdminGuard>} />
                    <Route path="/admin/analytics" element={<AdminGuard><AnalyticsDashboard /></AdminGuard>} />
                    <Route path="/admin/submissions" element={<AdminGuard><SubmissionsList /></AdminGuard>} />
                    <Route path="/admin/submissions/:id" element={<AdminGuard><SubmissionReview /></AdminGuard>} />
                </Routes>
            </main>
            {!isAdminRoute && <Footer />}
            {!isAdminRoute && <ChatWidget />}
        </div>
    )
}

export default App
