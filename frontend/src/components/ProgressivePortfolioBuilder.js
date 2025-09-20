import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl, getPortfolioUrl } from '../utils/domain';
import ImageUpload from './ImageUpload';
import './ProgressivePortfolioBuilder.css';

const ProgressivePortfolioBuilder = ({ onComplete, onCancel, existingData = null, isEditing = false }) => {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Form data for all steps
    const [formData, setFormData] = useState({
        // Step 1: Business Information
        business: {
            legalName: '',
            publicName: '',
            tagline: '',
            about: '',
            email: user?.email || '',
            phone: '',
            website: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            region: '',
            postalCode: '',
            country: 'US',
            yearsInBusiness: '',
            licensed: true,
            insured: true,
            subdomain: ''
        },
        // Step 2: Services
        services: [],
        // Step 3: Service Areas
        serviceAreas: [],
        // Step 4: Testimonials
        testimonials: [],
        // Step 5: Licenses
        licenses: []
    });

    const [availableServices, setAvailableServices] = useState([]);

    // Load existing data when editing
    useEffect(() => {
        if (isEditing && existingData) {
            console.log('Loading existing data for editing:', existingData);

            // Transform existing data to match form structure
            const transformedData = {
                business: {
                    legalName: existingData.business?.legalName || '',
                    publicName: existingData.business?.publicName || '',
                    tagline: existingData.business?.tagline || '',
                    about: existingData.business?.about || '',
                    email: existingData.business?.email || user?.email || '',
                    phone: existingData.business?.phone || '',
                    website: existingData.business?.website || '',
                    addressLine1: existingData.business?.addressLine1 || '',
                    addressLine2: existingData.business?.addressLine2 || '',
                    city: existingData.business?.city || '',
                    region: existingData.business?.region || '',
                    postalCode: existingData.business?.postalCode || '',
                    country: existingData.business?.country || 'US',
                    yearsInBusiness: existingData.business?.yearsInBusiness || '',
                    licensed: existingData.business?.licensed ?? true,
                    insured: existingData.business?.insured ?? true,
                    subdomain: existingData.websiteProfile?.subdomain || ''
                },
                services: (existingData.services || []).map(service => ({
                    servicePk: service.pk,
                    name: service.name,
                    description: service.description,
                    category: service.category,
                    customDescription: service.BusinessService?.customDescription || service.customDescription || ''
                })),
                serviceAreas: (existingData.serviceAreas || []).map(area => ({
                    label: area.label,
                    value: area.value,
                    coverageType: area.coverageType
                })),
                testimonials: (existingData.testimonials || []).map(testimonial => ({
                    authorName: testimonial.authorName,
                    quote: testimonial.quote,
                    rating: testimonial.rating,
                    sortOrder: testimonial.sortOrder
                })),
                licenses: (existingData.licenses || []).map(license => ({
                    licenseNo: license.licenseNo,
                    authority: license.authority,
                    state: license.state,
                    expiresOn: license.expiresOn ? new Date(license.expiresOn).toISOString().split('T')[0] : ''
                }))
            };

            setFormData(transformedData);
        }
    }, [isEditing, existingData, user?.email]);

    // Load available services on component mount
    // useEffect(() => {
    //     loadAvailableServices();
    // }, []);

    const loadAvailableServices = async () => {
        try {
            const apiBaseUrl = getApiBaseUrl();
            const response = await fetch(`${apiBaseUrl}/api/portfolio/services`);
            const data = await response.json();
            if (data.success) {
                setAvailableServices(data.data);
            }
        } catch (error) {
            console.error('Error loading services:', error);
        }
    };

    // Generate subdomain from business name
    const generateSubdomain = (businessName) => {
        return businessName
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    };

    // Handle business name change and auto-generate subdomain
    const handleBusinessNameChange = (value) => {
        const subdomain = generateSubdomain(value);
        setFormData(prev => ({
            ...prev,
            business: {
                ...prev.business,
                publicName: value,
                // Only auto-generate subdomain if not editing or if subdomain is empty
                subdomain: (isEditing && prev.business.subdomain) ? prev.business.subdomain : subdomain
            }
        }));
    };

    // Generic form update handler
    const updateFormData = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    // Array field handlers
    const addArrayItem = (section, item) => {
        setFormData(prev => ({
            ...prev,
            [section]: [...prev[section], item]
        }));
    };

    const removeArrayItem = (section, index) => {
        setFormData(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
    };

    const updateArrayItem = (section, index, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: prev[section].map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    // Navigation handlers
    const nextStep = () => {
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const skipStep = () => {
        nextStep();
    };

    // Save and finish
    const handleComplete = async () => {
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const apiBaseUrl = getApiBaseUrl();
            const response = await fetch(`${apiBaseUrl}/api/portfolio/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userPk: user?.pk,
                    ...formData
                })
            });

            const data = await response.json();

            if (data.success) {
                const successMessage = isEditing
                    ? 'Portfolio updated successfully! Redirecting to your website...'
                    : 'Portfolio created successfully! Redirecting to your website...';

                setMessage({ text: successMessage, type: 'success' });

                setTimeout(() => {
                    // Get the subdomain from the form data
                    const subdomain = formData.business.subdomain;
                    if (subdomain) {
                        // Redirect to the subdomain URL
                        const portfolioUrl = getPortfolioUrl(subdomain);
                        window.location.href = portfolioUrl;
                    } else {
                        // Fallback to calling onComplete
                        onComplete(data.data);
                    }
                }, 2000);
            } else {
                const errorMessage = isEditing
                    ? data.error || 'Failed to update portfolio'
                    : data.error || 'Failed to create portfolio';

                setMessage({ text: errorMessage, type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Network error. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { number: 1, title: 'Business Info', description: 'Basic business information' },
        { number: 2, title: 'Services', description: 'What services do you offer?' },
        { number: 3, title: 'Service Areas', description: 'Where do you serve?' },
        { number: 4, title: 'Testimonials', description: 'Customer reviews' },
        { number: 5, title: 'Licenses', description: 'Professional credentials' }
    ];

    return (
        <div className="progressive-portfolio-builder">
            <div className="builder-container">
                {/* Header with progress */}
                <div className="builder-header">
                    <h1>{isEditing ? 'Edit Your Portfolio' : 'Create Your Portfolio'}</h1>
                    <p>{isEditing ? 'Update your professional portfolio information' : 'Build your professional portfolio step by step'}</p>

                    {/* Progress indicator */}
                    <div className="progress-steps">
                        {steps.map((step) => (
                            <div
                                key={step.number}
                                className={`progress-step ${currentStep >= step.number ? 'active' : ''} ${currentStep === step.number ? 'current' : ''}`}
                            >
                                <div className="step-number">{step.number}</div>
                                <div className="step-info">
                                    <div className="step-title">{step.title}</div>
                                    <div className="step-description">{step.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step content */}
                <div className="step-content">
                    {currentStep === 1 && (
                        <BusinessInfoStep
                            data={formData.business}
                            onUpdate={(field, value) => updateFormData('business', field, value)}
                            onBusinessNameChange={handleBusinessNameChange}
                        />
                    )}

                    {currentStep === 2 && (
                        <ServicesStep
                            data={formData.services}
                            availableServices={availableServices}
                            onAdd={(service) => addArrayItem('services', service)}
                            onRemove={(index) => removeArrayItem('services', index)}
                            onUpdate={(index, field, value) => updateArrayItem('services', index, field, value)}
                        />
                    )}

                    {currentStep === 3 && (
                        <ServiceAreasStep
                            data={formData.serviceAreas}
                            onAdd={(area) => addArrayItem('serviceAreas', area)}
                            onRemove={(index) => removeArrayItem('serviceAreas', index)}
                            onUpdate={(index, field, value) => updateArrayItem('serviceAreas', index, field, value)}
                        />
                    )}

                    {currentStep === 4 && (
                        <TestimonialsStep
                            data={formData.testimonials}
                            onAdd={(testimonial) => addArrayItem('testimonials', testimonial)}
                            onRemove={(index) => removeArrayItem('testimonials', index)}
                            onUpdate={(index, field, value) => updateArrayItem('testimonials', index, field, value)}
                        />
                    )}

                    {currentStep === 5 && (
                        <LicensesStep
                            data={formData.licenses}
                            onAdd={(license) => addArrayItem('licenses', license)}
                            onRemove={(index) => removeArrayItem('licenses', index)}
                            onUpdate={(index, field, value) => updateArrayItem('licenses', index, field, value)}
                        />
                    )}
                </div>

                {/* Navigation */}
                <div className="step-navigation">
                    <div className="nav-left">
                        {currentStep > 1 && (
                            <button className="btn btn-secondary" onClick={prevStep}>
                                ← Previous
                            </button>
                        )}
                        <button className="btn btn-ghost" onClick={onCancel}>
                            Cancel
                        </button>
                    </div>

                    <div className="nav-right">
                        <button className="btn btn-ghost" onClick={skipStep}>
                            Skip This Step
                        </button>

                        {currentStep < 5 ? (
                            <button className="btn btn-primary" onClick={nextStep}>
                                Next →
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={handleComplete}
                                disabled={loading}
                            >
                                {loading
                                    ? (isEditing ? 'Updating Portfolio...' : 'Creating Portfolio...')
                                    : (isEditing ? 'Update Portfolio' : 'Complete Portfolio')
                                }
                            </button>
                        )}
                    </div>
                </div>

                {/* Message display */}
                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
};

// Step 1: Business Information
const BusinessInfoStep = ({ data, onUpdate, onBusinessNameChange }) => (
    <div className="step-form">
        <h2>Tell us about your business</h2>
        <p>This information will be used to create your portfolio website.</p>

        <div className="form-grid">
            <div className="form-group">
                <label>Business Name *</label>
                <input
                    type="text"
                    value={data.publicName}
                    onChange={(e) => onBusinessNameChange(e.target.value)}
                    placeholder="e.g., Mike's Plumbing Service"
                    required
                />
            </div>

            <div className="form-group">
                <label>Legal Name</label>
                <input
                    type="text"
                    value={data.legalName}
                    onChange={(e) => onUpdate('legalName', e.target.value)}
                    placeholder="e.g., Mike's Plumbing LLC"
                />
            </div>

            <div className="form-group full-width">
                <label>Tagline</label>
                <input
                    type="text"
                    value={data.tagline}
                    onChange={(e) => onUpdate('tagline', e.target.value)}
                    placeholder="e.g., Reliable plumbing services since 1995"
                />
            </div>

            <div className="form-group full-width">
                <label>About Your Business</label>
                <textarea
                    value={data.about}
                    onChange={(e) => onUpdate('about', e.target.value)}
                    placeholder="Tell customers about your business, experience, and what makes you unique..."
                    rows="4"
                />
            </div>

            <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    value={data.email}
                    onChange={(e) => onUpdate('email', e.target.value)}
                    placeholder="contact@business.com"
                />
            </div>

            <div className="form-group">
                <label>Phone Number</label>
                <input
                    type="tel"
                    value={data.phone}
                    onChange={(e) => onUpdate('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                />
            </div>

            <div className="form-group">
                <label>Website</label>
                <input
                    type="url"
                    value={data.website}
                    onChange={(e) => onUpdate('website', e.target.value)}
                    placeholder="https://www.yourbusiness.com"
                />
            </div>

            <div className="form-group">
                <label>Years in Business</label>
                <input
                    type="number"
                    value={data.yearsInBusiness}
                    onChange={(e) => onUpdate('yearsInBusiness', parseInt(e.target.value) || '')}
                    placeholder="5"
                    min="0"
                />
            </div>

            <div className="form-group full-width">
                <label>Address Line 1</label>
                <input
                    type="text"
                    value={data.addressLine1}
                    onChange={(e) => onUpdate('addressLine1', e.target.value)}
                    placeholder="123 Main Street"
                />
            </div>

            <div className="form-group">
                <label>Address Line 2</label>
                <input
                    type="text"
                    value={data.addressLine2}
                    onChange={(e) => onUpdate('addressLine2', e.target.value)}
                    placeholder="Suite 100"
                />
            </div>

            <div className="form-group">
                <label>City</label>
                <input
                    type="text"
                    value={data.city}
                    onChange={(e) => onUpdate('city', e.target.value)}
                    placeholder="Kansas City"
                />
            </div>

            <div className="form-group">
                <label>State/Region</label>
                <input
                    type="text"
                    value={data.region}
                    onChange={(e) => onUpdate('region', e.target.value)}
                    placeholder="MO"
                />
            </div>

            <div className="form-group">
                <label>Postal Code</label>
                <input
                    type="text"
                    value={data.postalCode}
                    onChange={(e) => onUpdate('postalCode', e.target.value)}
                    placeholder="64111"
                />
            </div>

            <div className="form-group">
                <label>Country</label>
                <select
                    value={data.country}
                    onChange={(e) => onUpdate('country', e.target.value)}
                >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                </select>
            </div>

            <div className="form-group">
                <label>Your Portfolio URL</label>
                <div className="subdomain-preview">
                    <span className="subdomain-text">
                        {data.subdomain || 'your-business'}.localhost:3000
                    </span>
                    <small>This will be generated from your business name</small>
                </div>
            </div>

            <div className="form-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={data.licensed}
                        onChange={(e) => onUpdate('licensed', e.target.checked)}
                    />
                    Licensed Business
                </label>
            </div>

            <div className="form-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={data.insured}
                        onChange={(e) => onUpdate('insured', e.target.checked)}
                    />
                    Insured Business
                </label>
            </div>
        </div>
    </div>
);

// Step 2: Services
const ServicesStep = ({ data, availableServices, onAdd, onRemove, onUpdate }) => {
    const [selectedServiceId, setSelectedServiceId] = useState('');

    const addSelectedService = () => {
        const service = availableServices.find(s => s.pk === selectedServiceId);
        if (service && !data.some(s => s.servicePk === service.pk)) {
            onAdd({
                servicePk: service.pk,
                name: service.name,
                description: service.description,
                category: service.category,
                customDescription: ''
            });
            setSelectedServiceId('');
        }
    };

    const addCustomService = () => {
        onAdd({
            servicePk: null,
            name: '',
            description: '',
            category: '',
            customDescription: ''
        });
    };

    return (
        <div className="step-form">
            <h2>What services do you offer?</h2>
            <p>Select from our list or add your own custom services.</p>

            {/* Add service section */}
            <div className="add-service-section">
                {/* <div className="service-selector">
                    <select
                        value={selectedServiceId}
                        onChange={(e) => setSelectedServiceId(e.target.value)}
                    >
                        <option value="">Select a service...</option>
                        {availableServices.map(service => (
                            <option key={service.pk} value={service.pk}>
                                {service.name} - {service.category}
                            </option>
                        ))}
                    </select>
                    <button
                        className="btn btn-secondary"
                        onClick={addSelectedService}
                        disabled={!selectedServiceId}
                    >
                        Add Service
                    </button>
                </div>

                <div className="or-divider">
                    <span>or</span>
                </div> */}

                <button className="btn btn-outline" onClick={addCustomService}>
                    Add a Service
                </button>
            </div>

            {/* Selected services */}
            <div className="selected-services">
                {data.map((service, index) => (
                    <div key={index} className="service-card">
                        <div className="service-header">
                            <h4>Service {index + 1}</h4>
                            <button
                                className="btn-remove"
                                onClick={() => onRemove(index)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Service Name</label>
                                <input
                                    type="text"
                                    value={service.name}
                                    onChange={(e) => onUpdate(index, 'name', e.target.value)}
                                    placeholder="e.g., Drain Cleaning"
                                />
                            </div>

                            <div className="form-group">
                                <label>Category</label>
                                <input
                                    type="text"
                                    value={service.category}
                                    onChange={(e) => onUpdate(index, 'category', e.target.value)}
                                    placeholder="e.g., Plumbing"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Description</label>
                                <textarea
                                    value={service.customDescription || service.description}
                                    onChange={(e) => onUpdate(index, 'customDescription', e.target.value)}
                                    placeholder="Describe this service in detail..."
                                    rows="3"
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="empty-state">
                        <p>No services added yet. Add your first service above.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Step 3: Service Areas
const ServiceAreasStep = ({ data, onAdd, onRemove, onUpdate }) => {
    const addServiceArea = () => {
        onAdd({
            label: '',
            coverageType: 'city',
            value: ''
        });
    };

    return (
        <div className="step-form">
            <h2>Where do you provide services?</h2>
            <p>Add the cities, counties, or ZIP codes you serve.</p>

            <button className="btn btn-primary mb-4" onClick={addServiceArea}>
                Add Service Area
            </button>

            <div className="service-areas">
                {data.map((area, index) => (
                    <div key={index} className="area-card">
                        <div className="area-header">
                            <h4>Service Area {index + 1}</h4>
                            <button
                                className="btn-remove"
                                onClick={() => onRemove(index)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Area Label</label>
                                <input
                                    type="text"
                                    value={area.label}
                                    onChange={(e) => onUpdate(index, 'label', e.target.value)}
                                    placeholder="e.g., Kansas City Metro"
                                />
                            </div>

                            <div className="form-group">
                                <label>Coverage Type</label>
                                <select
                                    value={area.coverageType}
                                    onChange={(e) => onUpdate(index, 'coverageType', e.target.value)}
                                >
                                    <option value="city">City</option>
                                    <option value="county">County</option>
                                    <option value="zip">ZIP Code</option>
                                    <option value="custom">Custom Area</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Value</label>
                                <input
                                    type="text"
                                    value={area.value}
                                    onChange={(e) => onUpdate(index, 'value', e.target.value)}
                                    placeholder={
                                        area.coverageType === 'city' ? 'Kansas City, MO' :
                                            area.coverageType === 'county' ? 'Jackson County' :
                                                area.coverageType === 'zip' ? '64111' :
                                                    'Custom area description'
                                    }
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="empty-state">
                        <p>No service areas added yet. Click "Add Service Area" to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Step 4: Testimonials
const TestimonialsStep = ({ data, onAdd, onRemove, onUpdate }) => {
    const addTestimonial = () => {
        onAdd({
            authorName: '',
            quote: '',
            rating: 5,
            sortOrder: 100
        });
    };

    return (
        <div className="step-form">
            <h2>Customer testimonials</h2>
            <p>Add reviews and testimonials from your satisfied customers.</p>

            <button className="btn btn-primary mb-4" onClick={addTestimonial}>
                Add Testimonial
            </button>

            <div className="testimonials">
                {data.map((testimonial, index) => (
                    <div key={index} className="testimonial-card">
                        <div className="testimonial-header">
                            <h4>Testimonial {index + 1}</h4>
                            <button
                                className="btn-remove"
                                onClick={() => onRemove(index)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Customer Name</label>
                                <input
                                    type="text"
                                    value={testimonial.authorName}
                                    onChange={(e) => onUpdate(index, 'authorName', e.target.value)}
                                    placeholder="John Smith"
                                />
                            </div>

                            <div className="form-group">
                                <label>Rating</label>
                                <select
                                    value={testimonial.rating}
                                    onChange={(e) => onUpdate(index, 'rating', parseInt(e.target.value))}
                                >
                                    <option value={5}>5 Stars</option>
                                    <option value={4}>4 Stars</option>
                                    <option value={3}>3 Stars</option>
                                    <option value={2}>2 Stars</option>
                                    <option value={1}>1 Star</option>
                                </select>
                            </div>

                            <div className="form-group full-width">
                                <label>Review/Quote</label>
                                <textarea
                                    value={testimonial.quote}
                                    onChange={(e) => onUpdate(index, 'quote', e.target.value)}
                                    placeholder="What did the customer say about your service?"
                                    rows="4"
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="empty-state">
                        <p>No testimonials added yet. Click "Add Testimonial" to showcase your customer reviews.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Step 5: Licenses
const LicensesStep = ({ data, onAdd, onRemove, onUpdate }) => {
    const addLicense = () => {
        onAdd({
            licenseNo: '',
            authority: '',
            state: '',
            expiresOn: ''
        });
    };

    return (
        <div className="step-form">
            <h2>Professional licenses</h2>
            <p>Add your professional licenses and certifications.</p>

            <button className="btn btn-primary mb-4" onClick={addLicense}>
                Add License
            </button>

            <div className="licenses">
                {data.map((license, index) => (
                    <div key={index} className="license-card">
                        <div className="license-header">
                            <h4>License {index + 1}</h4>
                            <button
                                className="btn-remove"
                                onClick={() => onRemove(index)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="form-grid text-black">
                            <div className="form-group">
                                <label>License Number</label>
                                <input
                                    type="text"
                                    value={license.licenseNo}
                                    onChange={(e) => onUpdate(index, 'licenseNo', e.target.value)}
                                    placeholder="e.g., PL-12345"
                                />
                            </div>

                            <div className="form-group">
                                <label>Issuing Authority</label>
                                <input
                                    type="text"
                                    value={license.authority}
                                    onChange={(e) => onUpdate(index, 'authority', e.target.value)}
                                    placeholder="e.g., State Plumbing Board"
                                />
                            </div>

                            <div className="form-group">
                                <label>State</label>
                                <input
                                    type="text"
                                    value={license.state}
                                    onChange={(e) => onUpdate(index, 'state', e.target.value)}
                                    placeholder="e.g., MO"
                                />
                            </div>

                            <div className="form-group">
                                <label>Expiration Date</label>
                                <input
                                    type="date"
                                    value={license.expiresOn}
                                    onChange={(e) => onUpdate(index, 'expiresOn', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="empty-state">
                        <p>No licenses added yet. Click "Add License" to add your professional credentials.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgressivePortfolioBuilder;
