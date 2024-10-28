import InvoiceList from '../invoice-list/InvoiceList.component';
import InvoiceForm from '../invoice-form/InvoiceForm.component';
import DashboardChart from '../dashboard-chart/DashboardChart.compnent';
import PaidUnpaidChart from '../paid-unpaid-chart/PaidUnpaidChart.component';

const InvoiceDashboard = () => {
  return (
    <div>
      <h1>Invoice Dashboard</h1>
      <DashboardChart />
      <InvoiceForm />
      <InvoiceList />
      <PaidUnpaidChart />
    </div>
  );
};

export default InvoiceDashboard;
