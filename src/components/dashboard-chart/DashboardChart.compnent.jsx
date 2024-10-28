import { useEffect, useState, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../utils/firebase.utils';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion } from 'framer-motion';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardChart = () => {
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [months, setMonths] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchClients = async () => {
      const unsubscribe = onSnapshot(collection(db, 'invoices'), (snapshot) => {
        const clientSet = new Set();
        snapshot.forEach((doc) => {
          const invoice = doc.data();
          clientSet.add(invoice.clientName);
        });
        setClients(Array.from(clientSet));
      });

      return () => unsubscribe();
    };

    fetchClients();
  }, []);

  useEffect(() => {
    const fetchInvoiceData = () => {
      let q = collection(db, 'invoices');

      if (selectedClient) {
        q = query(q, where('clientName', '==', selectedClient));
      }

      if (startDate && endDate) {
        q = query(q, where('createdAt', '>=', startDate), where('createdAt', '<=', endDate));
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const revenueByMonth = new Map();

        snapshot.forEach((doc) => {
          const invoice = doc.data();
          const invoiceDate = invoice.createdAt ? new Date(invoice.createdAt.seconds * 1000) : new Date();
          const monthYear = format(invoiceDate, 'MMM yyyy');

          if (revenueByMonth.has(monthYear)) {
            revenueByMonth.set(monthYear, revenueByMonth.get(monthYear) + Number(invoice.amount));
          } else {
            revenueByMonth.set(monthYear, Number(invoice.amount));
          }
        });

        const sortedMonths = Array.from(revenueByMonth.keys()).slice(-6);
        const sortedRevenue = sortedMonths.map((month) => revenueByMonth.get(month));

        setMonths(sortedMonths);
        setMonthlyRevenue(sortedRevenue);
      });

      return () => unsubscribe();
    };

    fetchInvoiceData();
  }, [selectedClient, startDate, endDate]);

  const data = {
    labels: months,
    datasets: [
      {
        label: 'Revenue in USD',
        data: monthlyRevenue,
        backgroundColor: '#36A2EB',
        hoverBackgroundColor: '#36A2EB',
      },
    ],
  };

  return (
    <div>
      {/* Filters */}
      <div className="filters">
        <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
          <option value="">All Clients</option>
          {clients.map((client, idx) => (
            <option key={idx} value={client}>{client}</option>
          ))}
        </select>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Start Date"
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          placeholderText="End Date"
        />
      </div>

      {/* Chart */}
      <motion.div>
        <Bar ref={chartRef} data={data} />
      </motion.div>
    </div>
  );
};

export default DashboardChart;
