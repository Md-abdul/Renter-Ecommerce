// Create a new file: ReturnRequestModal.jsx
import React, { useState } from 'react';
import { FiX, FiImage, FiAlertCircle } from 'react-icons/fi';

const ReturnRequestModal = ({ 
  isOpen, 
  onClose, 
  item, 
  onSubmit 
}) => {
  const [type, setType] = useState('return');
  const [reason, setReason] = useState('');
  const [exchangeSize, setExchangeSize] = useState('');
  const [images, setImages] = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [errors, setErrors] = useState({});

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) {
      alert('You can upload maximum 3 images');
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!reason) newErrors.reason = 'Reason is required';
    if (type === 'exchange' && !exchangeSize) newErrors.exchangeSize = 'Exchange size is required';
    if (images.length === 0) newErrors.images = 'At least one image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append('type', type);
    formData.append('reason', reason);
    formData.append('additionalInfo', additionalInfo);
    formData.append('itemId', item._id);
    
    if (type === 'exchange') {
      formData.append('exchangeSize', exchangeSize);
    }
    
    images.forEach((image, index) => {
      formData.append(`images`, image);
    });

    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Request {type === 'return' ? 'Return' : 'Exchange'}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FiX size={24} />
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-center mb-2">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-16 h-16 object-cover rounded mr-3"
              />
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-gray-600">Size: {item.size || 'N/A'}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Request Type</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={type === 'return'}
                    onChange={() => setType('return')}
                    className="mr-2"
                  />
                  Return
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={type === 'exchange'}
                    onChange={() => setType('exchange')}
                    className="mr-2"
                  />
                  Exchange
                </label>
              </div>
            </div>

            {type === 'exchange' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">New Size</label>
                <input
                  type="text"
                  value={exchangeSize}
                  onChange={(e) => setExchangeSize(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter new size"
                />
                {errors.exchangeSize && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <FiAlertCircle className="mr-1" /> {errors.exchangeSize}
                  </p>
                )}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Reason *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select a reason</option>
                <option value="Wrong Item">Wrong Item</option>
                <option value="Damaged Product">Damaged Product</option>
                <option value="Size Issue">Size Issue</option>
                <option value="Quality Issue">Quality Issue</option>
                <option value="Other">Other</option>
              </select>
              {errors.reason && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.reason}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Additional Information</label>
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="w-full p-2 border rounded"
                rows="3"
                placeholder="Provide more details about the issue..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Upload Images (Max 3) *
              </label>
              <div className="border-2 border-dashed rounded p-4 text-center">
                <label className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <FiImage className="text-gray-400 text-2xl mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {errors.images && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.images}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Proof ${index + 1}`}
                      className="w-16 h-16 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReturnRequestModal;