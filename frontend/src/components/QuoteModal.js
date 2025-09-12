import React, { useState } from 'react';
import './QuoteModal.css';

const QuoteModal = ({ isOpen, onClose, serviceName }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        state: '',
        zipCode: '',
        phoneNumber: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            // Here you would typically send the quote request to your backend
            // For now, we'll just simulate a successful submission
            await new Promise(resolve => setTimeout(resolve, 1000));

            setMessage({
                text: 'Quote request submitted successfully! We\'ll contact you soon.',
                type: 'success'
            });

            // Reset form after successful submission
            setTimeout(() => {
                setFormData({
                    firstName: '',
                    lastName: '',
                    address: '',
                    state: '',
                    zipCode: '',
                    phoneNumber: ''
                });
                setMessage({ text: '', type: '' });
                onClose();
            }, 2000);

        } catch (error) {
            setMessage({
                text: 'Failed to submit quote request. Please try again.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            firstName: '',
            lastName: '',
            address: '',
            state: '',
            zipCode: '',
            phoneNumber: ''
        });
        setMessage({ text: '', type: '' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="quote-modal-overlay" onClick={onClose}>
            <div className="quote-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="quote-modal-header">
                    <h2>Get Your Free Quote</h2>
                    <button className="quote-modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                {serviceName && (
                    <div className="quote-service-info">
                        <p>Service: <strong>{serviceName}</strong></p>
                    </div>
                )}

                {message.text && (
                    <div className={`quote-message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="quote-form">
                    <div className="quote-form-row">
                        <div className="quote-form-group">
                            <label htmlFor="firstName">First Name *</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="quote-form-group">
                            <label htmlFor="lastName">Last Name *</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="quote-form-group full-width">
                        <label htmlFor="address">Address *</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="quote-form-row">
                        <div className="quote-form-group">
                            <label htmlFor="state">State *</label>
                            <input
                                type="text"
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="quote-form-group">
                            <label htmlFor="zipCode">ZIP Code *</label>
                            <input
                                type="text"
                                id="zipCode"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="quote-form-group full-width">
                        <label htmlFor="phoneNumber">Phone Number *</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="quote-form-actions">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="quote-cancel-btn"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="quote-submit-btn"
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Submit Quote Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuoteModal;
