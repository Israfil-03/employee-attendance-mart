/**
 * Employee Dashboard Page
 */
import EmployeeLayout from '../components/Layout/EmployeeLayout';
import EmployeeDashboard from '../components/dashboard/EmployeeDashboard';

const EmployeeDashboardPage = () => {
  return (
    <EmployeeLayout>
      <EmployeeDashboard />
    </EmployeeLayout>
  );
};

export default EmployeeDashboardPage;
