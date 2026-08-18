import React, { useState } from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, MapPin, Save } from 'lucide-react';

const CreateCustomer = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [countryCode, setCountryCode] = useState('+65'); // Default: Singapore
  const [phoneNum, setPhoneNum] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [gender, setGender] = useState('Female'); // Default standard gender preference

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const countryOptions = [
    { name: 'Singapore', code: '+65' },
    { name: 'India', code: '+91' },
    { name: 'Malaysia', code: '+60' },
    { name: 'Indonesia', code: '+62' },
    { name: 'United Kingdom', code: '+44' },
    { name: 'United States', code: '+1' },
    { name: 'Australia', code: '+61' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim()) {
      setError('Full Name is required.');
      return;
    }

    if (!phoneNum.trim()) {
      setError('Phone Number is required.');
      return;
    }

    // Format phone number with country code
    const cleanPhoneNum = phoneNum.replace(/\s+/g, '');
    const fullPhoneNumber = `${countryCode}${cleanPhoneNum}`;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          address: address.trim(),
          phone_number: fullPhoneNumber,
          email: email.trim(),
          city: city.trim(),
          state: state.trim(),
          postal_code: postalCode.trim(),
          gender
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register customer.');
      }

      setSuccess('Customer added successfully!');
      setTimeout(() => {
        navigate('/dashboard/customers');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred while saving customer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 p-4 md:p-8 w-full bg-slate-50 text-slate-800 font-sans min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/customers')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition text-sm mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Customer Directory</span>
      </button>

      {/* Header */}
      <header className="mb-8 border-b border-slate-200 pb-6">
        <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase block mb-1">
          Client Registry
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Add New Customer
        </h2>
        <p className="text-slate-500 text-sm mt-1">Register customer demographics and contact details for stitching measurements and invoices</p>
      </header>

      {/* Error Alert Box */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
          {error}
        </div>
      )}

      {/* Success Alert Box */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-semibold">
          {success}
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">Customer Details</h3>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. Priyanjali Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 placeholder-slate-400 outline-none transition text-sm"
              required
            />
          </div>
        </div>

        {/* Contact Grid: Country code dropdown + Phone input & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phone Number with country selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Phone Number *
            </label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-slate-800 outline-none transition text-sm appearance-none cursor-pointer"
              >
                {countryOptions.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.code} ({opt.name})
                  </option>
                ))}
              </select>
              <div className="relative flex-1">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  placeholder="8123 4567"
                  value={phoneNum}
                  onChange={(e) => setPhoneNum(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 placeholder-slate-400 outline-none transition text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 placeholder-slate-400 outline-none transition text-sm"
              />
            </div>
          </div>
        </div>

        {/* Gender Choice */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Gender
          </label>
          <div className="flex gap-4">
            {['Female', 'Male', 'Other'].map((g) => (
              <label key={g} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={gender === g}
                  onChange={() => setGender(g)}
                  className="text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span>{g}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-50 pb-1 mt-4">Address Information</h4>
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Street Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <textarea
                rows="2"
                placeholder="Suite, building, street address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 placeholder-slate-400 outline-none transition text-sm resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                City
              </label>
              <input
                type="text"
                placeholder="Singapore"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-slate-800 placeholder-slate-400 outline-none transition text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                State / Region
              </label>
              <input
                type="text"
                placeholder="Central Area"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-slate-800 placeholder-slate-400 outline-none transition text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Postal Code
              </label>
              <input
                type="text"
                placeholder="098654"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-slate-800 placeholder-slate-400 outline-none transition text-sm"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold py-3 px-6 rounded-xl shadow-sm shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50 text-sm"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Registering...' : 'Save Customer Record'}</span>
          </button>
        </div>
      </form>
    </main>
  );
};

export default CreateCustomer;
