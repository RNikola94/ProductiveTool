import { useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { addNotification, db } from '../../utils/firebase.utils';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './invoice-form.styles.css';

const InvoiceForm = () => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [items, setItems] = useState([{ description: '', quantity: 1, price: 0 }]);
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [dueDate, setDueDate] = useState(null);
  const [status, setStatus] = useState('Unpaid');
  const [error, setError] = useState('');

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0 }]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    const subtotal = items.reduce((total, item) => total + item.quantity * item.price, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    try {
      await addDoc(collection(db, 'invoices'), {
        clientName,
        clientEmail,
        items,
        subtotal,
        tax,
        total,
        paymentTerms,
        dueDate: dueDate ? Timestamp.fromDate(dueDate) : null,
        status,
        createdAt: Timestamp.now(),
      });

      addNotification('Invoice added successfully!');

      resetForm();
      alert('Invoice added successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const validateForm = () => {
    if (!clientName || !clientEmail) {
      setError('Please provide client details.');
      return false;
    }

    if (items.length === 0 || items.some(item => !item.description || item.quantity <= 0 || item.price <= 0)) {
      setError('Please provide valid item details.');
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setClientName('');
    setClientEmail('');
    setItems([{ description: '', quantity: 1, price: 0 }]);
    setPaymentTerms('Net 30');
    setDueDate(null);
    setStatus('Unpaid');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="invoice-form">
      <h2>Add New Invoice</h2>
      
      {/* Client Information */}
      <input
        type="text"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        placeholder="Client Name"
        required
      />
      <input
        type="email"
        value={clientEmail}
        onChange={(e) => setClientEmail(e.target.value)}
        placeholder="Client Email"
        required
      />

      {/* Invoice Items */}
      <h3>Invoice Items</h3>
      {items.map((item, index) => (
        <div key={index} className="invoice-item">
          <input
            type="text"
            placeholder="Description"
            value={item.description}
            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Quantity"
            value={item.quantity}
            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={item.price}
            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
            required
          />
          <button type="button" onClick={() => handleRemoveItem(index)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={handleAddItem}>Add Item</button>

      {/* Payment Terms and Due Date */}
      <div className="invoice-payment">
        <select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)}>
          <option value="Net 30">Net 30</option>
          <option value="Net 60">Net 60</option>
          <option value="Net 90">Net 90</option>
        </select>
        <DatePicker
          selected={dueDate}
          onChange={setDueDate}
          placeholderText="Due Date"
          className="date-picker"
        />
      </div>

      {/* Status */}
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="Unpaid">Unpaid</option>
        <option value="Paid">Paid</option>
      </select>

      {/* Error Handling */}
      {error && <p className="error-message">{error}</p>}

      {/* Submit Button */}
      <button type="submit">Add Invoice</button>
    </form>
  );
};

export default InvoiceForm;
