import React from 'react';
import { BrowserRouter as Router, Routes, Route, HashRouter } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Workshops from './pages/Workshops';
import WorkshopDetail from './pages/WorkshopDetail';
import Instructors from './pages/Instructors';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminCourses from './pages/AdminCourses';
import AdminUsers from './pages/AdminUsers';
import AdminEnrollments from './pages/AdminEnrollments';
import AdminPayments from './pages/AdminPayments';
import AdminWorkshops from './pages/AdminWorkshops';
import AdminInstructors from './pages/AdminInstructors';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import QuestionMaker from "./pages/QuestionMaker";
import AdminCertificationCreator from "./pages/AdminCertificationCreator";
import BulkEmailSender from './pages/BulkEmailSender';
function App() {
  return (
    <UserProvider>
      <HashRouter>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/workshops" element={<Workshops />} />
              <Route path="/workshops/:id" element={<WorkshopDetail />} />
              <Route path="/instructors" element={<Instructors />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
             <Route path="/admin/enrollments/bulk-mail" element={
  <AdminRoute>
    <BulkEmailSender />
  </AdminRoute>
} />


              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/admin/question-maker" element={
                <AdminRoute>
                  <QuestionMaker />
                </AdminRoute>
              } />
               <Route path="/admin/certifications" element={
                <AdminRoute>
                  <AdminCertificationCreator />
                </AdminRoute>
              } />
              <Route path="/admin/courses" element={
                <AdminRoute>
                  <AdminCourses />
                </AdminRoute>
              } />
              <Route path="/admin/users" element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              } />
              <Route path="/admin/payments" element={
                <AdminRoute>
                  <AdminPayments />
                </AdminRoute>
              } />
              <Route path="/admin/enrollments" element={
                <AdminRoute>
                  <AdminEnrollments />
                </AdminRoute>
              } />
              <Route path="/admin/workshops" element={
                <AdminRoute>
                  <AdminWorkshops />
                </AdminRoute>
              } />
              <Route path="/admin/instructors" element={
                <AdminRoute>
                  <AdminInstructors />
                </AdminRoute>
              } />
            </Routes>
          </main>
          <Footer />
          
        </div>
      </HashRouter>
    </UserProvider>
  );
}
export default App;