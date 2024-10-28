import { useEffect, useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../utils/firebase.utils';
import { format } from 'date-fns';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PaidUnpaidChart = () => {
  const [paidCounts, setPaidCounts] = useState([]);
  const [unpaidCounts, setUnpaidCounts] = useState([]);
  const [months, setMonths] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchInvoiceData = () => {
      const unsubscribe = onSnapshot(collection(db, 'invoices'), (snapshot) => {
        const paidByMonth = new Map();
        const unpaidByMonth = new Map();

        snapshot.forEach((doc) => {
          const invoice = doc.data();
          const invoiceDate = invoice.createdAt ? new Date(invoice.createdAt.seconds * 1000) : new Date();
          const monthYear = format(invoiceDate, 'MMM yyyy');

          if (invoice.status === 'Paid') {
            if (paidByMonth.has(monthYear)) {
              paidByMonth.set(monthYear, paidByMonth.get(monthYear) + 1);
            } else {
              paidByMonth.set(monthYear, 1);
            }
          } else {
            if (unpaidByMonth.has(monthYear)) {
              unpaidByMonth.set(monthYear, unpaidByMonth.get(monthYear) + 1);
            } else {
              unpaidByMonth.set(monthYear, 1);
            }
          }
        });

        const sortedMonths = Array.from(paidByMonth.keys()).slice(-6);
        const sortedPaid = sortedMonths.map((month) => paidByMonth.get(month) || 0);
        const sortedUnpaid = sortedMonths.map((month) => unpaidByMonth.get(month) || 0);

        setMonths(sortedMonths);
        setPaidCounts(sortedPaid);
        setUnpaidCounts(sortedUnpaid);
      });

      return () => unsubscribe();
    };

    fetchInvoiceData();
  }, []);

  const data = {
    labels: months,
    datasets: [
      {
        label: 'Paid Invoices',
        data: paidCounts,
        borderColor: '#4CAF50',
        backgroundColor: '#4CAF50',
        fill: false,
      },
      {
        label: 'Unpaid Invoices',
        data: unpaidCounts,
        borderColor: '#FF7043',
        backgroundColor: '#FF7043',
        fill: false,
      },
    ],
  };

  return <Line ref={chartRef} data={data} />;
};

export default PaidUnpaidChart;
