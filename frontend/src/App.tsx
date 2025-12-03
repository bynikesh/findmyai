import { Routes, Route, useLocation } from 'react-router-dom'
import CategoryList from './pages/CategoryList'
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
import ImportTools from './pages/admin/ImportTools'
import NotFound from './pages/NotFound'
import ServerError from './pages/ServerError'
import { ToastProvider } from './contexts/ToastContext'

function App() {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <ToastProvider>
            <div className="flex flex-col min-h-screen">
                {!isAdminRoute && <Header />}
                <main className={isAdminRoute ? '' : 'flex-grow'}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/tools" element={<ToolList />} />
                        <Route path="/categories" element={<CategoryList />} />
                        <Route path="/tools/:slug" element={<ToolDetail />} />
                        <Route path="/submit" element={<Submit />} />
                        <Route path="/login" element={<Login />} />

                        {/* Error Routes */}
                        <Route path="/500" element={<ServerError />} />
                        <Route path="/503" element={<ServerError />} />

                        {/* Admin Routes */}
                        <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
                        <Route path="/admin/tools" element={<AdminGuard><ToolsManagement /></AdminGuard>} />
                        <Route path="/admin/import-tools" element={<AdminGuard><ImportTools /></AdminGuard>} />
                        <Route path="/admin/categories" element={<AdminGuard><CategoriesManagement /></AdminGuard>} />
                        <Route path="/admin/analytics" element={<AdminGuard><AnalyticsDashboard /></AdminGuard>} />
                        <Route path="/admin/submissions" element={<AdminGuard><SubmissionsList /></AdminGuard>} />
                        <Route path="/admin/submissions/:id" element={<AdminGuard><SubmissionReview /></AdminGuard>} />

                        {/* 404 - Must be last */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
                {!isAdminRoute && <Footer />}
                {!isAdminRoute && <ChatWidget />}
            </div>
        </ToastProvider>
    )
}

export default App

