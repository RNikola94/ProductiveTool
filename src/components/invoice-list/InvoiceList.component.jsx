import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../../utils/firebase.utils';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './invoice-list.styles.css';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortCriteria, setSortCriteria] = useState('date');
  const [loading, setLoading] = useState(false);

  const fetchInvoices = (isPaginated = false) => {
    setLoading(true);
    let q = collection(db, 'invoices');

    if (statusFilter !== 'All') {
      q = query(q, where('status', '==', statusFilter));
    }

    if (sortCriteria === 'date') {
      q = query(q, orderBy('createdAt', 'desc'));
    } else if (sortCriteria === 'amount') {
      q = query(q, orderBy('amount', 'desc'));
    } else if (sortCriteria === 'status') {
      q = query(q, orderBy('status'));
    }

    q = query(q, limit(10));

    if (isPaginated && lastVisible) {
      q = query(q, startAfter(lastVisible));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const newInvoices = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setInvoices((prevInvoices) => (isPaginated ? [...prevInvoices, ...newInvoices] : newInvoices));
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  };

  useEffect(() => {
    fetchInvoices();
  }, [searchTerm, statusFilter, sortCriteria]);

  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
      if (lastVisible) {
        fetchInvoices(true);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastVisible]);

  return (
    <div className="invoice-list-container">
      <h2>Invoices</h2>

      {/* Search and Filters */}
      <input
        type="text"
        placeholder="Search by client name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-dropdown">
        <option value="All">All</option>
        <option value="Paid">Paid</option>
        <option value="Unpaid">Unpaid</option>
      </select>

      <select value={sortCriteria} onChange={(e) => setSortCriteria(e.target.value)} className="filter-dropdown">
        <option value="date">Sort by Date</option>
        <option value="amount">Sort by Amount</option>
        <option value="status">Sort by Status</option>
      </select>

      {/* Invoices Table */}
      <motion.table
        className="invoice-table"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <thead>
          <tr>
            <th>Client Name</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length > 0 ? (
            invoices.map((invoice) => (
              <motion.tr
                key={invoice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <td>{invoice.clientName}</td>
                <td>${invoice.amount}</td>
                <td>{invoice.status}</td>
                <td>{new Date(invoice.createdAt.seconds * 1000).toLocaleDateString()}</td>
                <td>
                  <Link to={`/invoice/${invoice.id}`} className="invoice-link">
                    View
                  </Link>
                </td>
              </motion.tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No invoices match your search criteria.</td>
            </tr>
          )}
        </tbody>
      </motion.table>

      {loading && <p>Loading more invoices...</p>}
    </div>
  );
};

export default InvoiceList;
