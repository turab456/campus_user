import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Plus, CheckCircle, Info, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { backendApi as api } from '../services/backendApi';
import type { BookCondition } from '../types';
import { CATEGORIES, CONDITIONS, DEPARTMENTS, SEMESTERS } from '../constants';

const EDUCATION_LEVELS = ['School', 'PUC', 'Diploma', 'Undergraduate (UG)', 'Postgraduate (PG)'];

// Simulated default images that the student can choose from
const MOCK_UPLOAD_PRESETS = [
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594897030264-ab7d87efc473?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format&fit=crop&q=80',
];

interface CustomField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

const CATEGORY_FIELDS_CONFIG: Record<string, CustomField[]> = {
  books: [
    { key: 'author', label: 'Author *', type: 'text', placeholder: 'e.g. Adel Sedra, Kenneth C. Smith', required: true },
    { key: 'edition', label: 'Edition', type: 'text', placeholder: 'e.g. 7th Edition' }
  ],
  notes: [
    { key: 'author', label: 'Created By / Teacher *', type: 'text', placeholder: 'e.g. Dr. H.S. Sharma', required: true },
    { key: 'department', label: 'Course Department *', type: 'select', options: DEPARTMENTS, required: true },
    { key: 'semester', label: 'Semester *', type: 'select', options: SEMESTERS.map(s => `Semester ${s}`), required: true }
  ],
  calculators: [
    { key: 'brand', label: 'Brand *', type: 'text', placeholder: 'e.g. Casio, Texas Instruments', required: true },
    { key: 'model', label: 'Model *', type: 'text', placeholder: 'e.g. fx-991ES Plus, TI-84', required: true },
    { key: 'examApproved', label: 'Approved for University Exams *', type: 'select', options: ['Yes', 'No', 'Check with Invigilator'], required: true }
  ],
  cycles: [
    { key: 'brand', label: 'Brand / Manufacturer *', type: 'text', placeholder: 'e.g. Decathlon, Firefox, Hero', required: true },
    { key: 'color', label: 'Color *', type: 'text', placeholder: 'e.g. Matte Black, Red & White', required: true },
    { key: 'age', label: 'Usage Duration / Age *', type: 'select', options: ['Less than 6 months', '6 - 12 months', '1 - 2 years', 'More than 2 years'], required: true },
    { key: 'accessories', label: 'Accessories Included', type: 'checkbox', options: ['Lock', 'Bell', 'Carrier', 'Front/Rear Lights', 'Mudguards', 'Bottle Holder'] }
  ],
  electronics: [
    { key: 'brand', label: 'Brand *', type: 'text', placeholder: 'e.g. Lenovo, HP, Apple, JBL', required: true },
    { key: 'specs', label: 'Key Specifications *', type: 'text', placeholder: 'e.g. Core i5, 8GB RAM, 256GB SSD / 10W Portable Speaker', required: true },
    { key: 'age', label: 'Usage Duration / Age *', type: 'select', options: ['Less than 6 months', '6 - 12 months', '1 - 2 years', 'More than 2 years'], required: true }
  ],
  'lab-equipment': [
    { key: 'equipmentType', label: 'Equipment Type *', type: 'text', placeholder: 'e.g. Engineering Drafter, Lab Coat, Chemistry Kit', required: true },
    { key: 'size', label: 'Size (if applicable)', type: 'select', options: ['Not Applicable', 'S', 'M', 'L', 'XL', 'XXL'] }
  ],
  'project-components': [
    { key: 'componentType', label: 'Component Type *', type: 'text', placeholder: 'e.g. Arduino Uno R3, Raspberry Pi 4, Ultrasonic Sensor', required: true },
    { key: 'specs', label: 'Technical Specifications (Optional)', type: 'text', placeholder: 'e.g. 5V Operating Voltage, 2cm-400cm Range' }
  ],
  'hostel-essentials': [
    { key: 'itemType', label: 'Item Type *', type: 'text', placeholder: 'e.g. Single Bed Mattress, Study Table, Study Chair', required: true },
    { key: 'age', label: 'Usage Duration / Age *', type: 'select', options: ['Less than 6 months', '6 - 12 months', 'More than 1 year'], required: true },
    { key: 'dimensions', label: 'Dimensions (Optional)', type: 'text', placeholder: 'e.g. 3x6 feet for mattress' }
  ],
  stationery: [
    { key: 'stationeryType', label: 'Stationery Item Type *', type: 'text', placeholder: 'e.g. A1 Drawing Board, T-Square, Geometry Box', required: true }
  ]
};

export const EditListingPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    condition: '' as BookCondition,
    description: '',
    images: [] as string[],
    price: '',
    originalPrice: '',
    pickupLocation: '',
    metadata: {} as Record<string, any>
  });

  useEffect(() => {
    if (!id) return;
    const fetchListing = async () => {
      try {
        const listing = await api.getBookById(id);
        if (listing) {
          setFormData({
            category: listing.category || '',
            title: listing.title || '',
            condition: (listing.condition as BookCondition) || 'Good',
            description: listing.description || '',
            images: listing.images || [],
            price: String(listing.price || ''),
            originalPrice: String(listing.originalPrice || ''),
            pickupLocation: listing.pickupLocation || '',
            metadata: listing.metadata || {}
          });
        }
      } catch (err) {
        showToast('Failed to load listing', 'danger');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id, showToast]);

  // Pre-fill education level from user profile if available, when category becomes books
  React.useEffect(() => {
    if (formData.category === 'books' && user && formData.metadata.educationLevel === undefined) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          educationLevel: user.educationLevel || '',
          ...user.academicDetails
        }
      }));
    }
  }, [formData.category, formData.metadata.educationLevel, user]);

  const handleMetadataChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [key]: value
      }
    }));
  };

  const handleCheckboxToggle = (key: string, option: string) => {
    setFormData(prev => {
      const currentVal = Array.isArray(prev.metadata[key]) ? prev.metadata[key] : [];
      const updatedVal = currentVal.includes(option)
        ? currentVal.filter((x: string) => x !== option)
        : [...currentVal, option];
      return {
        ...prev,
        metadata: {
          ...prev.metadata,
          [key]: updatedVal
        }
      };
    });
  };

  const validateStep = (currentStep: number): boolean => {
    const errs: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!formData.category) errs.category = 'Please select a category';
    }
    
    if (currentStep === 2) {
      if (!formData.title.trim()) errs.title = 'Title is required';
      if (!formData.condition) errs.condition = 'Please choose the condition';
      
      const configFields = CATEGORY_FIELDS_CONFIG[formData.category] || [];
      configFields.forEach(field => {
        if (field.required) {
          const val = formData.metadata[field.key];
          if (val === undefined || val === null || (typeof val === 'string' && !val.trim())) {
            errs[field.key] = `${field.label.replace(' *', '')} is required`;
          }
        }
      });
      
      if (formData.category === 'books') {
        if (!formData.metadata.educationLevel) {
          errs.educationLevel = 'Education Level is required';
        }
      }
    }
    
    if (currentStep === 3) {
      if (formData.images.length === 0 && selectedFiles.length === 0) errs.images = 'Please select at least one photo';
    }
    
    if (currentStep === 4) {
      const priceVal = Number(formData.price);
      const origVal = Number(formData.originalPrice);
      
      if (!formData.price || isNaN(priceVal) || priceVal <= 0) {
         errs.price = 'Please enter a valid listing price';
      }
      if (!formData.originalPrice || isNaN(origVal) || origVal <= 0) {
        errs.originalPrice = 'Please enter original price';
      } else if (origVal < priceVal) {
        errs.price = 'Listing price cannot exceed original price';
      }
      if (!formData.pickupLocation.trim()) {
        errs.pickupLocation = 'Specify the meeting or exchange location';
      }
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep(prev => prev - 1);
  };

  const handleImageToggle = (url: string) => {
    setFormData(prev => {
      const exists = prev.images.includes(url);
      const remainingSlots = 3 - selectedFiles.length;
      
      let updated = [...prev.images];
      if (exists) {
        updated = updated.filter(x => x !== url);
      } else if (updated.length < remainingSlots) {
        updated.push(url);
      }
      return { ...prev, images: updated };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const remainingSlots = 3 - formData.images.length;
      const filesToAdd = newFiles.slice(0, remainingSlots);
      
      setSelectedFiles(prev => {
        const updated = [...prev, ...filesToAdd].slice(0, 3 - formData.images.length);
        return updated;
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!user) {
      showToast('You must be signed in to publish.', 'danger');
      return;
    }
    
    try {
      const isBookOrNote = formData.category === 'books' || formData.category === 'notes';
      const authorVal = isBookOrNote ? (formData.metadata.author || '') : '';
      const deptVal = isBookOrNote ? (formData.metadata.department || formData.metadata.branch || '') : '';
      const semVal = isBookOrNote ? Number(String(formData.metadata.semester || '').replace('Semester ', '') || 1) : undefined;

      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('author', authorVal);
      payload.append('category', formData.category);
      payload.append('condition', formData.condition);
      payload.append('price', String(Number(formData.price)));
      payload.append('originalPrice', String(Number(formData.originalPrice)));
      payload.append('description', formData.description || `Listing for ${formData.title} in category ${formData.category}.`);
      payload.append('department', deptVal);
      if (semVal) payload.append('semester', String(semVal));
      payload.append('pickupLocation', formData.pickupLocation);
      payload.append('college', user.institutionName || user.college || '');
      payload.append('metadata', JSON.stringify(formData.metadata));

      // Append any preset URLs picked (Cloudinary backend supports handling them if passed in req.body.images)
      // Since it's a FormData object, backend usually expects them as an array string or multiple fields.
      // We will stringify it or append multiple. The backend in listingController.js checks req.body.images
      formData.images.forEach(url => {
        payload.append('images', url); // Use same field name for string arrays
      });

      // Append real files
      selectedFiles.forEach(file => {
        payload.append('images', file);
      });

      await api.updateListing(id!, payload);
      showToast('Successfully updated listing!', 'success');
      navigate('/my-listings');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to post listing. Please try again.', 'danger');
    }
  };

  const renderProgressBar = () => {
    const stepsCount = 5;
    return (
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-8">
        <div
          className="bg-primary h-full transition-all duration-300 ease-out"
          style={{ width: `${(step / stepsCount) * 100}%` }}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white border border-borderCustom rounded-2xl p-5 md:p-8 shadow-subtle my-2">
      {/* Title */}
      <div className="mb-6 text-center">
        <h1 className="text-xl md:text-2xl font-extrabold text-textDark tracking-tight">Edit Listing</h1>
        <p className="text-xs text-muted mt-1.5">Step {step} of 5: {
          ['Choose Category', 'Fill Book Details', 'Choose Photos', 'Pricing & Location', 'Review & Publish'][step - 1]
        }</p>
      </div>

      {renderProgressBar()}

      {/* STEP 1: CATEGORY */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold text-textDark mb-1">What kind of item are you listing?</h2>
          {errors.category && <p className="text-xs text-danger font-medium">{errors.category}</p>}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2.5 transition-all ${
                  formData.category === cat.id
                    ? 'border-primary bg-primary/2.5 text-primary'
                    : 'border-borderCustom text-textDark hover:bg-slate-50'
                }`}
              >
                <span className="text-xs font-semibold">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: DETAILS */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold text-textDark mb-2">Provide catalog information</h2>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-textDark uppercase tracking-wider">Item Name / Title *</label>
            <input
              type="text"
              placeholder={formData.category === 'books' ? 'e.g. Microelectronic Circuits' : 'e.g. Hero Sprint Cycle, Casio fx-991ES Plus'}
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-[#F5F3EF] border border-borderCustom rounded-[10px] p-2.5 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
            />
            {errors.title && <p className="text-[10px] text-danger font-semibold mt-0.5">{errors.title}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-textDark uppercase tracking-wider">Condition *</label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value as BookCondition }))}
              className="bg-[#F5F3EF] border border-borderCustom rounded-[10px] py-2.5 pl-2.5 pr-8 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
            >
              <option value="">Select Condition</option>
              {CONDITIONS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {errors.condition && <p className="text-[10px] text-danger font-semibold mt-0.5">{errors.condition}</p>}
          </div>

          {/* Dynamic Configuration Fields */}
          {(CATEGORY_FIELDS_CONFIG[formData.category] || []).map((field) => {
            const fieldError = errors[field.key];
            const value = formData.metadata[field.key] || '';

            return (
              <div key={field.key} className="flex flex-col gap-1">
                <label className="text-xs font-bold text-textDark uppercase tracking-wider">
                  {field.label}
                </label>

                {field.type === 'text' && (
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={value}
                    onChange={(e) => handleMetadataChange(field.key, e.target.value)}
                    className="bg-[#F5F3EF] border border-borderCustom rounded-[10px] p-2.5 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
                  />
                )}

                {field.type === 'select' && (
                  <select
                    value={value}
                    onChange={(e) => handleMetadataChange(field.key, e.target.value)}
                    className="bg-[#F5F3EF] border border-borderCustom rounded-[10px] py-2.5 pl-2.5 pr-8 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
                  >
                    <option value="">Select Option</option>
                    {field.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {field.type === 'checkbox' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                    {field.options?.map(opt => {
                      const isChecked = Array.isArray(value) && value.includes(opt);
                      return (
                        <label key={opt} className="flex items-center gap-2 text-xs text-textDark cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCheckboxToggle(field.key, opt)}
                            className="rounded border-borderCustom text-primary focus:ring-primary w-4 h-4"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {fieldError && <p className="text-[10px] text-danger font-semibold mt-0.5">{fieldError}</p>}
              </div>
            );
          })}

          {formData.category === 'books' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-textDark uppercase tracking-wider">Education Level *</label>
                <select
                  value={formData.metadata.educationLevel || ''}
                  onChange={(e) => handleMetadataChange('educationLevel', e.target.value)}
                  className="bg-[#F5F3EF] border border-borderCustom rounded-[10px] py-2.5 pl-2.5 pr-8 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
                >
                  <option value="">Select Level</option>
                  {EDUCATION_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                {errors.educationLevel && <p className="text-[10px] text-danger font-semibold mt-0.5">{errors.educationLevel}</p>}
              </div>

              {formData.metadata.educationLevel === 'School' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-textDark uppercase tracking-wider">Class</label>
                    <input
                      type="text"
                      placeholder="e.g. 10th"
                      value={formData.metadata.class || ''}
                      onChange={(e) => handleMetadataChange('class', e.target.value)}
                      className="bg-[#F5F3EF] border border-borderCustom rounded-[10px] p-2.5 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-textDark uppercase tracking-wider">Board</label>
                    <input
                      type="text"
                      placeholder="e.g. CBSE"
                      value={formData.metadata.board || ''}
                      onChange={(e) => handleMetadataChange('board', e.target.value)}
                      className="bg-[#F5F3EF] border border-borderCustom rounded-[10px] p-2.5 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {formData.metadata.educationLevel === 'PUC' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-textDark uppercase tracking-wider">Stream</label>
                    <input
                      type="text"
                      placeholder="e.g. PCMB"
                      value={formData.metadata.stream || ''}
                      onChange={(e) => handleMetadataChange('stream', e.target.value)}
                      className="bg-[#F5F3EF] border border-borderCustom rounded-[10px] p-2.5 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-textDark uppercase tracking-wider">Year</label>
                    <input
                      type="text"
                      placeholder="e.g. 2nd Year"
                      value={formData.metadata.year || ''}
                      onChange={(e) => handleMetadataChange('year', e.target.value)}
                      className="bg-[#F5F3EF] border border-borderCustom rounded-[10px] p-2.5 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {formData.metadata.educationLevel === 'Diploma' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-textDark uppercase tracking-wider">Course</label>
                    <input
                      type="text"
                      placeholder="e.g. Mechanical"
                      value={formData.metadata.course || ''}
                      onChange={(e) => handleMetadataChange('course', e.target.value)}
                      className="bg-[#F5F3EF] border border-borderCustom rounded-[10px] p-2.5 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-textDark uppercase tracking-wider">Year/Sem</label>
                    <input
                      type="text"
                      placeholder="e.g. 3rd Sem"
                      value={formData.metadata.yearOrSem || ''}
                      onChange={(e) => handleMetadataChange('yearOrSem', e.target.value)}
                      className="bg-[#F5F3EF] border border-borderCustom rounded-[10px] p-2.5 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {formData.metadata.educationLevel === 'Undergraduate (UG)' && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-textDark uppercase tracking-wider">Degree</label>
                    <input
                      type="text"
                      placeholder="e.g. B.Tech"
                      value={formData.metadata.degree || ''}
                      onChange={(e) => handleMetadataChange('degree', e.target.value)}
                      className="bg-[#F5F3EF] border border-borderCustom rounded-[10px] p-2.5 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-textDark uppercase tracking-wider">Branch</label>
                    <input
                      type="text"
                      placeholder="e.g. CSE"
                      value={formData.metadata.branch || ''}
                      onChange={(e) => handleMetadataChange('branch', e.target.value)}
                      className="bg-[#F5F3EF] border border-borderCustom rounded-[10px] p-2.5 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-textDark uppercase tracking-wider">Sem</label>
                    <input
                      type="number"
                      placeholder="e.g. 5"
                      value={formData.metadata.semester || ''}
                      onChange={(e) => handleMetadataChange('semester', e.target.value)}
                      className="bg-[#F5F3EF] border border-borderCustom rounded-[10px] p-2.5 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {formData.metadata.educationLevel === 'Postgraduate (PG)' && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-textDark uppercase tracking-wider">Degree</label>
                    <input
                      type="text"
                      placeholder="e.g. M.Tech"
                      value={formData.metadata.degree || ''}
                      onChange={(e) => handleMetadataChange('degree', e.target.value)}
                      className="bg-[#F5F3EF] border border-borderCustom rounded-[10px] p-2.5 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-textDark uppercase tracking-wider">Specialization</label>
                    <input
                      type="text"
                      placeholder="e.g. AI"
                      value={formData.metadata.specialization || ''}
                      onChange={(e) => handleMetadataChange('specialization', e.target.value)}
                      className="bg-[#F5F3EF] border border-borderCustom rounded-[10px] p-2.5 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-textDark uppercase tracking-wider">Sem</label>
                    <input
                      type="number"
                      placeholder="e.g. 2"
                      value={formData.metadata.semester || ''}
                      onChange={(e) => handleMetadataChange('semester', e.target.value)}
                      className="bg-[#F5F3EF] border border-borderCustom rounded-[10px] p-2.5 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-textDark uppercase tracking-wider">Description (Optional)</label>
            <textarea
              placeholder="Provide a detailed description of the item. State if there are highlights, loose pages, or physical damage."
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-[#F5F3EF] border border-borderCustom rounded-[10px] p-2.5 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none resize-none"
            />
          </div>
        </div>
      )}

      {/* STEP 3: PHOTOS */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <div className="mb-2">
            <h2 className="text-sm font-bold text-textDark">Add Photo References</h2>
            <p className="text-xs text-muted mt-0.5">Select up to 3 photos of your textbook or essential. Real pictures increase sales.</p>
          </div>
          
          {errors.images && <p className="text-xs text-danger font-medium">{errors.images}</p>}

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {/* Show real file previews */}
            {selectedFiles.map((file, idx) => {
              const objUrl = URL.createObjectURL(file);
              return (
                <div key={`file-${idx}`} className="aspect-square rounded-xl overflow-hidden border-2 border-primary relative group">
                  <img src={objUrl} alt={`Selected ${idx}`} className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => removeFile(idx)}
                    className="absolute top-1.5 right-1.5 bg-danger/90 text-white rounded-full p-1.5 shadow-sm hover:bg-danger transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {/* Show previously uploaded real files (Cloudinary URLs) */}
            {formData.images.filter(url => !MOCK_UPLOAD_PRESETS.includes(url)).map((url, idx) => (
              <div key={`existing-${idx}`} className="aspect-square rounded-xl overflow-hidden border-2 border-primary relative group">
                <img src={url} alt={`Existing ${idx}`} className="w-full h-full object-cover bg-white" />
                <button 
                  type="button" 
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      images: prev.images.filter(img => img !== url)
                    }));
                  }}
                  className="absolute top-1.5 right-1.5 bg-danger/90 text-white rounded-full p-1.5 shadow-sm hover:bg-danger transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Show preset mocks if there's room */}
            {MOCK_UPLOAD_PRESETS.map((url, idx) => {
              const selected = formData.images.includes(url);
              if (!selected && (selectedFiles.length + formData.images.length >= 3)) return null;
              
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleImageToggle(url)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 relative focus:outline-none ${
                    selected ? 'border-primary' : 'border-borderCustom opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  {selected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
            
            {/* Actual photo upload input */}
            {(selectedFiles.length + formData.images.length) < 3 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-primary transition-colors flex flex-col items-center justify-center text-center p-2 cursor-pointer bg-slate-50">
                <Plus className="w-5 h-5 text-slate-400" />
                <span className="text-[10px] text-muted font-semibold mt-1">Upload Photo</span>
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          
          {formData.images.length > 0 && (
            <p className="text-xs text-muted font-medium mt-1">Selected {formData.images.length} of 3 photos.</p>
          )}
        </div>
      )}

      {/* STEP 4: PRICING & LOCATION */}
      {step === 4 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold text-textDark mb-2">Set Pricing and Exchange Details</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-textDark uppercase tracking-wider">Your Price (₹) *</label>
              <input
                type="number"
                placeholder="e.g. 450"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="bg-[#F5F3EF] border border-borderCustom rounded-[10px] p-2.5 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
              />
              {errors.price && <p className="text-[10px] text-danger font-semibold mt-0.5">{errors.price}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-textDark uppercase tracking-wider">Original Retail Price (₹) *</label>
              <input
                type="number"
                placeholder="e.g. 1000"
                value={formData.originalPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                className="bg-[#F5F3EF] border border-borderCustom rounded-[10px] p-2.5 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
              />
              {errors.originalPrice && <p className="text-[10px] text-danger font-semibold mt-0.5">{errors.originalPrice}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-textDark uppercase tracking-wider">Pickup / Meeting Location *</label>
            <input
              type="text"
              placeholder="e.g. College library, nearby cafe, or specific metro station"
              value={formData.pickupLocation}
              onChange={(e) => setFormData(prev => ({ ...prev, pickupLocation: e.target.value }))}
              className="bg-[#F5F3EF] border border-borderCustom rounded-[10px] p-2.5 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
            />
            {errors.pickupLocation && <p className="text-[10px] text-danger font-semibold mt-0.5">{errors.pickupLocation}</p>}
          </div>

          <div className="bg-[#F5F3EF] border border-borderCustom p-3.5 rounded-xl flex gap-2.5 mt-2">
            <Info className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-[11px] text-muted leading-tight">
              Your institution (<strong className="text-textDark font-bold">{user?.institutionName?.split(',')[0] || user?.college?.split(',')[0] || 'Unknown'}</strong>) will be displayed on the listing. Other students can search or coordinate trades from anywhere.
            </p>
          </div>
        </div>
      )}

      {/* STEP 5: PREVIEW & PUBLISH */}
      {step === 5 && (
        <div className="flex flex-col gap-5">
          <h2 className="text-sm font-bold text-textDark mb-1">Verify Listing Draft</h2>
          
          <div className="border border-borderCustom rounded-xl overflow-hidden bg-slate-50 p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <img
                src={formData.images[0] || (selectedFiles.length > 0 ? URL.createObjectURL(selectedFiles[0]) : '')}
                alt="Preview"
                className="w-full sm:w-32 aspect-video sm:aspect-square object-cover rounded-lg border border-borderCustom bg-white"
              />
              <div className="flex-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  {CATEGORIES.find(c => c.id === formData.category)?.name || formData.category}
                </span>
                <h3 className="font-bold text-base text-textDark mt-1 leading-snug">{formData.title}</h3>
                {(formData.category === 'books' || formData.category === 'notes') && formData.metadata.author && (
                  <p className="text-xs text-muted">by {formData.metadata.author}</p>
                )}
                <div className="flex items-center gap-1.5 mt-2.5">
                  <span className="text-base font-extrabold text-textDark">₹{formData.price}</span>
                  <span className="text-xs text-muted line-through">₹{formData.originalPrice}</span>
                  <span className="text-[10px] text-success font-semibold px-2 py-0.5 bg-green-50 border border-green-100 rounded-md">
                    {Math.round(((Number(formData.originalPrice) - Number(formData.price)) / Number(formData.originalPrice)) * 100)}% discount
                  </span>
                </div>
              </div>
            </div>
            
            <hr className="border-borderCustom my-4" />

            <div className="grid grid-cols-2 gap-3 text-xs text-muted">
              <div>
                <span className="font-bold text-textDark block">Condition</span>
                <span className="block mt-0.5">{formData.condition}</span>
              </div>
              
              {/* Category specific specs */}
              {(formData.category === 'notes') ? (
                <div>
                  <span className="font-bold text-textDark block">Course Info</span>
                  <span className="block mt-0.5">{formData.metadata.semester || 'N/A'} &middot; {formData.metadata.department || 'N/A'}</span>
                </div>
              ) : formData.category === 'books' ? (
                <div>
                  <span className="font-bold text-textDark block">Academic Info</span>
                  <span className="block mt-0.5">{formData.metadata.educationLevel || 'N/A'}</span>
                </div>
              ) : (
                <div>
                  <span className="font-bold text-textDark block">Specifications</span>
                  <div className="mt-0.5 flex flex-col gap-0.5 max-h-24 overflow-y-auto">
                    {Object.entries(formData.metadata).map(([k, v]) => {
                      const fieldLabel = (CATEGORY_FIELDS_CONFIG[formData.category] || []).find(f => f.key === k)?.label.replace(' *', '') || k;
                      const valStr = Array.isArray(v) ? v.join(', ') : String(v);
                      return (
                        <div key={k} className="text-[10px]">
                          <strong>{fieldLabel}:</strong> {valStr}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="col-span-2 mt-1">
                <span className="font-bold text-textDark block">Pickup / Exchange Spot</span>
                <span className="block mt-0.5 leading-snug">{formData.pickupLocation}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions buttons */}
      <div className="flex justify-between items-center mt-8 pt-4 border-t border-borderCustom">
        {step > 1 ? (
          <button
            type="button"
            onClick={handlePrev}
            className="flex items-center gap-1 text-xs font-bold text-muted hover:text-textDark transition-colors px-3 py-2 focus:outline-none"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
        ) : (
          <div />
        )}
        
        {step < 5 ? (
          <button
            type="button"
            onClick={handleNext}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-5 py-2.5 rounded-full flex items-center gap-1 shadow-subtle hover:shadow-md focus:outline-none"
          >
            <span>Continue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePublish}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-2.5 rounded-full flex items-center gap-1.5 shadow-subtle hover:shadow-md focus:outline-none"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Publish Listing</span>
          </button>
        )}
      </div>
    </div>
  );
};
