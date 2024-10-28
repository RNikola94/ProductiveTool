import { useState } from 'react';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase.utils';
import { useNavigate } from 'react-router-dom';

const InvoiceCard = ({ invoice }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedClientName, setEditedClientName] = useState(invoice.clientName);
  const [editedAmount, setEditedAmount] = useState(invoice.amount);
  const [editedStatus, setEditedStatus] = useState(invoice.status);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Function to handle deletion
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteDoc(doc(db, 'invoices', invoice.id));
        setSuccess('Invoice deleted successfully');
      } catch (error) {
        setError('Failed to delete invoice');
      }
    }
  };

  // Function to handle editing
  const handleEdit = async () => {
    if (!editedClientName || !editedAmount) {
      setError('Client name and amount are required.');
      return;
    }

    if (window.confirm('Are you sure you want to save the changes?')) {
      const invoiceRef = doc(db, 'invoices', invoice.id);
      try {
        await updateDoc(invoiceRef, {
          clientName: editedClientName,
          amount: editedAmount,
          status: editedStatus,
        });
        setSuccess('Invoice updated successfully');
        setIsEditing(false);
      } catch (error) {
        setError('Failed to update invoice');
      }
    }
  };

  const handleNavigateToDetails = () => {
    navigate(`/invoice/${invoice.id}`);
  };

  return (
    <div className="invoice-card">
      {isEditing ? (
        <div>
          <h3>Edit Invoice</h3>
          <input
            type="text"
            value={editedClientName}
            onChange={(e) => setEditedClientName(e.target.value)}
            placeholder="Client Name"
          />
          <input
            type="number"
            value={editedAmount}
            onChange={(e) => setEditedAmount(e.target.value)}
            placeholder="Amount"
          />
          <select
            value={editedStatus}
            onChange={(e) => setEditedStatus(e.target.value)}
          >
            <option value="Unpaid">Unpaid</option>
            <option value="Paid">Paid</option>
          </select>
          <button onClick={handleEdit}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}
        </div>
      ) : (
        <div onClick={handleNavigateToDetails}>
          <h3>{invoice.clientName}</h3>
          <p>Amount: ${invoice.amount}</p>
          <p>Status: {invoice.status}</p>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(); }}>Delete</button>
          <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}>Edit</button>
        </div>
      )}
    </div>
  );
};

export default InvoiceCard;
