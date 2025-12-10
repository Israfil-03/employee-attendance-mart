/**
 * Admin Dashboard Page
 */
import { useState } from 'react';
import AdminLayout from '../components/Layout/AdminLayout';
import AdminDashboard from '../components/dashboard/AdminDashboard';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('employees');

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <AdminDashboard activeTab={activeTab} />
    </AdminLayout>
  );
};

export default AdminDashboardPage;
