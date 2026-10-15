import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import './TransactionModal.css';

const DEFAULT_CATEGORIES = {
  expense: [
    'Groceries',
    'Housing / Rent',
    'Utilities',
    'Food & Dining',
    'Transportation',
    'Education',
    'Health & Medical',
    'Entertainment',
    'Shopping',
    'Other'
  ],
  income: [
    'Salary',
    'Freelance',
    'Business',
    'Investments',
    'Allowance / Gift',
    'Other'
  ]
};

const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Net Banking',
  'Other'
];

/**
 * Helper to format a Date object into YYYY-MM-DD for HTML date input
 */
function getFormattedDate(date) {
  const d = date ? new Date(date) : new Date();
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
  return d.toISOString().split('T')[0];
}

/**
 * TransactionModal Component
 * 
 * Supports both creating new transactions and editing existing ones.
 * Features controlled inputs, field-level validations, and loading states.
 */
function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null
}) {
  const isEditing = Boolean(initialData && initialData._id);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Groceries',
    date: getFormattedDate(new Date()),
    paymentMethod: 'Cash',
    note: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Reset or populate form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          amount: initialData.amount !== undefined ? String(initialData.amount) : '',
          type: initialData.type || 'expense',
          category: initialData.category || (initialData.type === 'income' ? 'Salary' : 'Groceries'),
          date: getFormattedDate(initialData.date),
          paymentMethod: initialData.paymentMethod || 'Cash',
          note: initialData.note || ''
        });
      } else {
        setFormData({
          title: '',
          amount: '',
          type: 'expense',
          category: 'Groceries',
          date: getFormattedDate(new Date()),
          paymentMethod: 'Cash',
          note: ''
        });
      }
      setErrors({});
      setSubmitError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // Handle type change and update default category accordingly
  const handleTypeChange = (newType) => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: DEFAULT_CATEGORIES[newType][0]
    }));
    // Clear type error if any
    if (errors.type) {
      setErrors((prev) => ({ ...prev, type: null }));
    }
  };

  // Field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Client-side validation
  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Please enter a transaction title.';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be 100 characters or fewer.';
    }

    const numAmount = Number(formData.amount);
    if (!formData.amount || isNaN(numAmount)) {
      newErrors.amount = 'Please enter a valid numeric amount.';
    } else if (numAmount <= 0) {
      newErrors.amount = 'Amount must be greater than 0.';
    }

    if (!formData.type || !['income', 'expense'].includes(formData.type)) {
      newErrors.type = 'Please select a valid type (Income or Expense).';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Please select or enter a category.';
    }

    if (!formData.date) {
      newErrors.date = 'Transaction date is required.';
    } else if (isNaN(new Date(formData.date).getTime())) {
      newErrors.date = 'Please enter a valid date.';
    }

    if (formData.note && formData.note.length > 500) {
      newErrors.note = 'Note cannot exceed 500 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        amount: Number(formData.amount),
        type: formData.type,
        category: formData.category.trim(),
        date: formData.date,
        paymentMethod: formData.paymentMethod.trim() || 'Cash',
        note: formData.note.trim()
      };

      await onSubmit(payload, initialData?._id);
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Failed to save transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = DEFAULT_CATEGORIES[formData.type] || DEFAULT_CATEGORIES.expense;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
            </h2>
            <p className="modal-subtitle">
              {isEditing
                ? 'Update transaction details in your MoneyWise database'
                : 'Record a new income or expense entry'}
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Global Error Notice */}
        {submitError && (
          <div className="modal-error-banner" role="alert">
            <AlertCircle size={16} />
            <span>{submitError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          {/* Type Selector Toggle */}
          <div className="form-group">
            <label className="form-label">Transaction Type</label>
            <div className="type-toggle-group">
              <button
                type="button"
                className={`type-toggle-btn btn-type-expense ${
                  formData.type === 'expense' ? 'active' : ''
                }`}
                onClick={() => handleTypeChange('expense')}
              >
                Expense
              </button>
              <button
                type="button"
                className={`type-toggle-btn btn-type-income ${
                  formData.type === 'income' ? 'active' : ''
                }`}
                onClick={() => handleTypeChange('income')}
              >
                Income
              </button>
            </div>
            {errors.type && <span className="field-error">{errors.type}</span>}
          </div>

          {/* Title */}
          <div className="form-group">
            <label htmlFor="tx-title" className="form-label">
              Title <span className="required-star">*</span>
            </label>
            <input
              id="tx-title"
              name="title"
              type="text"
              className={`form-input ${errors.title ? 'input-error' : ''}`}
              placeholder="e.g. Grocery shopping, Salary bonus"
              value={formData.title}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          {/* Amount & Date in a 2-column row */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="tx-amount" className="form-label">
                Amount (₹) <span className="required-star">*</span>
              </label>
              <input
                id="tx-amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                className={`form-input ${errors.amount ? 'input-error' : ''}`}
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.amount && <span className="field-error">{errors.amount}</span>}
            </div>

            <div className="form-group flex-1">
              <label htmlFor="tx-date" className="form-label">
                Date <span className="required-star">*</span>
              </label>
              <input
                id="tx-date"
                name="date"
                type="date"
                className={`form-input ${errors.date ? 'input-error' : ''}`}
                value={formData.date}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.date && <span className="field-error">{errors.date}</span>}
            </div>
          </div>

          {/* Category & Payment Method in a 2-column row */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="tx-category" className="form-label">
                Category <span className="required-star">*</span>
              </label>
              <select
                id="tx-category"
                name="category"
                className={`form-select ${errors.category ? 'input-error' : ''}`}
                value={formData.category}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <span className="field-error">{errors.category}</span>}
            </div>

            <div className="form-group flex-1">
              <label htmlFor="tx-paymentMethod" className="form-label">
                Payment Method
              </label>
              <select
                id="tx-paymentMethod"
                name="paymentMethod"
                className="form-select"
                value={formData.paymentMethod}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Note */}
          <div className="form-group">
            <label htmlFor="tx-note" className="form-label">
              Note (Optional)
            </label>
            <textarea
              id="tx-note"
              name="note"
              rows="2"
              className={`form-textarea ${errors.note ? 'input-error' : ''}`}
              placeholder="Add optional context or reference"
              value={formData.note}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.note && <span className="field-error">{errors.note}</span>}
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary modal-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Saving...'
                : isEditing
                ? 'Update Transaction'
                : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionModal;
