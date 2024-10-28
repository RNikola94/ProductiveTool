import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase.utils';
import './invoice-details.styles.css';

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchInvoice = async () => {
      const docRef = doc(db, 'invoices', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const invoiceData = docSnap.data();
        setInvoice(invoiceData);
        setStatus(invoiceData.status);
      } else {
        console.log('No such document!');
      }
    };

    fetchInvoice();
  }, [id]);

  const handleStatusChange = async () => {
    const invoiceRef = doc(db, 'invoices', id);
    await updateDoc(invoiceRef, { status });
    setInvoice((prev) => ({ ...prev, status }));
    setIsEditing(false);
  };

  if (!invoice) return <p>Loading...</p>;

  return (
    <div className="invoice-details-container">
      <h2>Invoice Details</h2>

      {/* Client Details */}
      <div className="client-details">
        <p><strong>Client Name:</strong> {invoice.clientName}</p>
        <p><strong>Client Email:</strong> {invoice.clientEmail}</p>
        <p><strong>Client Address:</strong> {invoice.clientAddress}</p>
      </div>

      {/* Invoice Items */}
      <h3>Invoice Items</h3>
      {invoice.items && invoice.items.length > 0 ? (
        <table className="invoice-items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                {/* <td>${item.price.toFixed(2)}</td> */}
                <td><strong>Price:</strong> {typeof item.price === 'number' ? item.price.toFixed(2) : 'N/A'}</td>

                <td>${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No items available.</p>
      )}

      {/* Amount Breakdown */}
      <div className="amount-breakdown">
        <p><strong>Subtotal:</strong> ${invoice.subtotal?.toFixed(2)}</p>
        <p><strong>Tax:</strong> ${invoice.tax?.toFixed(2)}</p>
        <p><strong>Total:</strong> ${invoice.total?.toFixed(2)}</p>
      </div>

      {/* Payment History */}
      <h3>Payment History</h3>
      {invoice.paymentHistory && invoice.paymentHistory.length > 0 ? (
        <ul>
          {invoice.paymentHistory.map((payment, index) => (
            <li key={index}>
              {new Date(payment.date.seconds * 1000).toLocaleDateString()} - ${payment.amount} - {payment.method}
            </li>
          ))}
        </ul>
      ) : (
        <p>No payment history available.</p>
      )}

      {/* Status Editing */}
      <div className="invoice-status">
        <p><strong>Status:</strong> {isEditing ? (
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Pending">Pending</option>
          </select>
        ) : (
          <span>{invoice.status}</span>
        )}</p>

        {isEditing ? (
          <button onClick={handleStatusChange} className="save-button">Save</button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="edit-button">Edit Status</button>
        )}
      </div>

      <button onClick={() => navigate(-1)} className="back-button">Back to Invoice List</button>
    </div>
  );
};

export default InvoiceDetails;
