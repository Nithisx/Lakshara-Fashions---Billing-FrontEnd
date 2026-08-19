import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Ruler,
  Settings,
  Calendar,
  CreditCard,
  ShoppingBag,
  Plus,
  Trash2,
  Link,
  Upload,
  Search,
  X,
  Check,
  Eye,
} from "lucide-react";

const CreateOrder = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Load customers
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  // Search & Selector states for Customers
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerPhoneInput, setCustomerPhoneInput] = useState("");
  const [customerCreating, setCustomerCreating] = useState(false);
  const [customerError, setCustomerError] = useState("");

  // Form states
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [inspirationLink, setInspirationLink] = useState("");
  const [clothImages, setClothImages] = useState([]); // List of Base64 image files
  const [deliveryDate, setDeliveryDate] = useState("");
  const [trialDate, setTrialDate] = useState("");
  const [priceBreakup, setPriceBreakup] = useState("");
  const [advancePaid, setAdvancePaid] = useState("");

  // Items list in this order
  const [items, setItems] = useState([]);

  // Current item builder states
  const [itemName, setItemName] = useState("");
  const [itemServiceType, setItemServiceType] = useState("Stitching");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemPrice, setItemPrice] = useState("");

  // Current item measurements builder state
  const [itemMeasurements, setItemMeasurements] = useState([
    { key: "Length", value: "" },
    { key: "Shoulder", value: "" },
    { key: "Sleeve Length", value: "" },
    { key: "Sleeve Round", value: "" },
    { key: "Chest / Bust", value: "" },
    { key: "Waist", value: "" },
    { key: "Hip", value: "" },
    { key: "Neck", value: "" },
    { key: "Armhole", value: "" },
    { key: "Front Neck", value: "" },
    { key: "Back Neck", value: "" },
    { key: "Petticoat Length", value: "" },
    { key: "Petticoat Waist", value: "" },
    { key: "Blouse Back Length", value: "" },
  ]);
  const [customKey, setCustomKey] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [showMeasurementsSection, setShowMeasurementsSection] = useState(false);

  // Measurements viewer state for items already in the list
  const [viewingMeasurementsItemIndex, setViewingMeasurementsItemIndex] =
    useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`${API_URL}/customers`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (response.ok) {
          setCustomers(data.customers || []);
        }
      } catch (err) {
        console.error("Error fetching customers:", err);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, [token]);

  // Filter customers for search
  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone_number?.includes(searchQuery),
  );

  const resetCustomerSelection = () => {
    setSelectedCustomer(null);
    setSearchQuery("");
    setCustomerPhoneInput("");
    setCustomerError("");
    setShowCustomerDropdown(false);
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setSearchQuery(customer.full_name || "");
    setCustomerPhoneInput(customer.phone_number || "");
    setCustomerError("");
    setShowCustomerDropdown(false);
  };

  const handleCreateCustomerInline = async () => {
    const name = searchQuery.trim();
    const phone = customerPhoneInput.trim();

    if (!name) {
      setCustomerError("Customer name is required.");
      return;
    }

    if (!phone) {
      setCustomerError("Customer phone number is required.");
      return;
    }

    const match = customers.find(
      (customer) =>
        customer.full_name?.trim().toLowerCase() === name.toLowerCase() &&
        customer.phone_number === phone,
    );

    if (match) {
      handleCustomerSelect(match);
      return;
    }

    setCustomerCreating(true);
    setCustomerError("");

    try {
      const response = await fetch(`${API_URL}/customers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: name,
          phone_number: phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create customer.");
      }

      setCustomers((prev) => [data.customer, ...prev]);
      handleCustomerSelect(data.customer);
    } catch (err) {
      console.error(err);
      setCustomerError(err.message || "Error creating customer.");
    } finally {
      setCustomerCreating(false);
    }
  };

  // Handle adding custom measurement to item builder
  const handleAddCustomMeasurement = (e) => {
    e.preventDefault();
    if (!customKey.trim()) {
      alert("Enter measurement field name (e.g. Neck)");
      return;
    }
    if (
      itemMeasurements.some(
        (m) => m.key.toLowerCase() === customKey.trim().toLowerCase(),
      )
    ) {
      alert("This parameter already exists.");
      return;
    }
    setItemMeasurements([
      ...itemMeasurements,
      { key: customKey.trim(), value: customValue.trim() },
    ]);
    setCustomKey("");
    setCustomValue("");
  };

  const handleMeasurementValChange = (index, val) => {
    const updated = [...itemMeasurements];
    updated[index].value = val;
    setItemMeasurements(updated);
  };

  const handleRemoveMeasurementField = (keyToRemove) => {
    setItemMeasurements(itemMeasurements.filter((m) => m.key !== keyToRemove));
  };

  // Measurement groups matching the standard measurement chart (two columns)
  const bodyMeasurementKeys = [
    "Length",
    "Shoulder",
    "Sleeve Length",
    "Sleeve Round",
    "Chest / Bust",
    "Waist",
    "Hip",
  ];
  const neckPetticoatMeasurementKeys = [
    "Neck",
    "Armhole",
    "Front Neck",
    "Back Neck",
    "Petticoat Length",
    "Petticoat Waist",
    "Blouse Back Length",
  ];

  const renderMeasurementGroup = (keys, label) => (
    <div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
        {label}
      </span>
      <div className="grid grid-cols-1 gap-3">
        {keys.map((key) => {
          const idx = itemMeasurements.findIndex((m) => m.key === key);
          if (idx === -1) return null;
          const item = itemMeasurements[idx];
          return (
            <div key={item.key} className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {item.key}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveMeasurementField(item.key)}
                  className="text-rose-500 hover:text-rose-600 text-[9px] font-bold"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. 44 cm"
                value={item.value}
                onChange={(e) =>
                  handleMeasurementValChange(idx, e.target.value)
                }
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-1.5 px-3 text-xs text-slate-800 outline-none transition"
              />
            </div>
          );
        })}
      </div>
    </div>
  );

  // Add completed item object to the order items list
  const handleAddItemToOrder = (e) => {
    e.preventDefault();
    if (!itemName.trim()) {
      alert("Please enter an Item Description.");
      return;
    }
    const price = parseFloat(itemPrice);
    if (isNaN(price) || price < 0) {
      alert("Please enter a valid price.");
      return;
    }

    // Convert measurements array to JSON object for storage
    const measurementsObj = {};
    itemMeasurements.forEach((m) => {
      if (m.key.trim() && m.value.trim()) {
        measurementsObj[m.key.trim()] = m.value.trim();
      }
    });

    const newItem = {
      id: Date.now(),
      item_name: itemName.trim(),
      service_type: itemServiceType,
      quantity: parseInt(itemQuantity, 10) || 1,
      price: price,
      measurements: measurementsObj,
    };

    setItems([...items, newItem]);

    // Reset item builder state
    setItemName("");
    setItemServiceType("Stitching");
    setItemQuantity(1);
    setItemPrice("");
    setItemMeasurements([
      { key: "Length", value: "" },
      { key: "Shoulder", value: "" },
      { key: "Sleeve Length", value: "" },
      { key: "Sleeve Round", value: "" },
      { key: "Chest / Bust", value: "" },
      { key: "Waist", value: "" },
      { key: "Hip", value: "" },
      { key: "Neck", value: "" },
      { key: "Armhole", value: "" },
      { key: "Front Neck", value: "" },
      { key: "Back Neck", value: "" },
      { key: "Petticoat Length", value: "" },
      { key: "Petticoat Waist", value: "" },
      { key: "Blouse Back Length", value: "" },
    ]);
    setShowMeasurementsSection(false);
  };

  const handleRemoveItemFromList = (idToRemove) => {
    setItems(items.filter((item) => item.id !== idToRemove));
    if (viewingMeasurementsItemIndex !== null) {
      setViewingMeasurementsItemIndex(null);
    }
  };

  // Base64 file uploader
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClothImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeClothImage = (indexToRemove) => {
    setClothImages(clothImages.filter((_, idx) => idx !== indexToRemove));
  };

  // Calculations
  const totalPieces = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalOrderPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const parsedAdvancePaid = Number(advancePaid || 0);
  const balanceDue = Math.max(totalOrderPrice - parsedAdvancePaid, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedCustomer) {
      setError("Please select a customer.");
      return;
    }

    if (!deliveryDate) {
      setError("Delivery Date is required.");
      return;
    }

    if (parsedAdvancePaid < 0) {
      setError("Advance paid amount cannot be negative.");
      return;
    }

    if (items.length === 0) {
      setError("Please add at least one item to this order.");
      return;
    }

    setLoading(true);

    const payload = {
      customer_id: selectedCustomer.id,
      special_instructions: specialInstructions,
      inspiration_link: inspirationLink,
      cloth_images: clothImages.join("||"),
      delivery_date: deliveryDate,
      trial_date: trialDate || null,
      quantity: totalPieces,
      stitching_price: totalOrderPrice,
      price_breakup: priceBreakup,
      advance_paid: parsedAdvancePaid,
      balance_due: balanceDue,
      items: items,
    };

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit order.");
      }

      setSuccess("Order created successfully!");
      setTimeout(() => {
        navigate("/dashboard/orders");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error saving order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 p-4 md:p-8 w-full bg-slate-50 text-slate-800 font-sans min-h-screen">
      {/* Back Button */}
      <div className="w-full mb-6">
        <button
          onClick={() => navigate("/dashboard/orders")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders List</span>
        </button>
      </div>

      {/* Header */}
      <header className="mb-8 border-b border-slate-200 pb-6 w-full">
        <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase block mb-1">
          Store Operations
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Create New Order
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Configure customization details, stitching parameters, and client
          delivery date details
        </p>
      </header>

      {/* Error alert box */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm w-full">
          {error}
        </div>
      )}

      {/* Success alert box */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-semibold w-full">
          {success}
        </div>
      )}

      {loadingCustomers ? (
        <div className="py-20 flex flex-col items-center justify-center w-full">
          <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400 text-sm font-medium">
            Fetching client profiles...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
          {/* Main Form Fields Column (8 columns wide on desktop) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Customer Search & Selection */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                <span>Customer Selection *</span>
              </h3>

              {selectedCustomer ? (
                <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
                  <div>
                    <div className="font-bold text-slate-800 capitalize text-sm">
                      {selectedCustomer.full_name}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Phone: {selectedCustomer.phone_number}
                    </div>
                    {selectedCustomer.email && (
                      <div className="text-xs text-slate-500">
                        Email: {selectedCustomer.email}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={resetCustomerSelection}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold border border-rose-200 bg-white hover:bg-rose-50 px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    Change Customer
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Customer Name
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by customer name"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setSelectedCustomer(null);
                          setCustomerError("");
                          setShowCustomerDropdown(true);
                        }}
                        onFocus={() => setShowCustomerDropdown(true)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-3 pl-10 pr-4 text-slate-850 placeholder-slate-400 outline-none transition text-sm"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setCustomerPhoneInput("");
                            setShowCustomerDropdown(false);
                          }}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {showCustomerDropdown && searchQuery && (
                      <div className="absolute z-30 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100">
                        {filteredCustomers.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => handleCustomerSelect(c)}
                            className="p-3 hover:bg-slate-55 cursor-pointer text-sm flex justify-between items-center transition"
                          >
                            <div>
                              <span className="font-bold text-slate-805 capitalize">
                                {c.full_name}
                              </span>
                              <span className="text-xs text-slate-500 block mt-0.5">
                                {c.phone_number}
                              </span>
                            </div>
                            <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full">
                              Select
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      value={customerPhoneInput}
                      onChange={(e) => {
                        setCustomerPhoneInput(e.target.value);
                        setCustomerError("");
                      }}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-slate-850 placeholder-slate-400 outline-none transition text-sm"
                    />
                  </div>

                  {customerError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium">
                      {customerError}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCreateCustomerInline}
                      disabled={customerCreating}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition disabled:opacity-60"
                    >
                      {customerCreating ? "Creating Customer..." : "Create Customer"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Itemized Builder Section */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Add Items to this Order
              </h3>

              {/* Add Item Form */}
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4">
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                  Item Builder Configuration
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Item Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Item Description *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Silk Saree Blouse, Designer Kurti"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-slate-850 placeholder-slate-400 outline-none transition text-sm"
                    />
                  </div>

                  {/* Service Mode */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Service Type
                    </label>
                    <div className="flex gap-2">
                      {["Stitching", "Alteration"].map((mode) => (
                        <button
                          type="button"
                          key={mode}
                          onClick={() => setItemServiceType(mode)}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                            itemServiceType === mode
                              ? "bg-indigo-65 text-indigo-600 border-indigo-200"
                              : "bg-white text-slate-650 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-slate-850 outline-none transition text-sm"
                    />
                  </div>

                  {/* Unit price */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Stitching Price (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0.00"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2 pl-7 pr-3 text-slate-855 placeholder-slate-400 outline-none transition text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Toggle measurements configuration */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setShowMeasurementsSection(!showMeasurementsSection)
                    }
                    className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    <Ruler className="w-4 h-4 text-indigo-600" />
                    <span>
                      {showMeasurementsSection
                        ? "Hide Measurements Box"
                        : "Add Measurements for this Item"}
                    </span>
                  </button>
                </div>

                {/* Measurements input workspace */}
                {showMeasurementsSection && (
                  <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-4 animate-fadeIn">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block border-b border-slate-100 pb-1">
                      Measurements Workspace
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {renderMeasurementGroup(bodyMeasurementKeys, "Body")}
                      {renderMeasurementGroup(
                        neckPetticoatMeasurementKeys,
                        "Neck & Petticoat",
                      )}
                    </div>

                    {/* Custom parameter adder */}
                    <div className="bg-slate-50 p-3 rounded-lg flex gap-2 items-end">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Param name (e.g. Neck)"
                          value={customKey}
                          onChange={(e) => setCustomKey(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-1.5 px-3 text-xs outline-none transition"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Value (e.g. 15 inches)"
                          value={customValue}
                          onChange={(e) => setCustomValue(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-1.5 px-3 text-xs outline-none transition"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCustomMeasurement}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Add to order action */}
                <div className="flex justify-end pt-2 border-t border-slate-200/50">
                  <button
                    type="button"
                    onClick={handleAddItemToOrder}
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-sm shadow-indigo-600/10"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item to Order</span>
                  </button>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-650">
                  Items Added to Order List ({items.length})
                </div>
                {items.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs bg-white">
                    No items added yet. Complete the Item Builder configuration
                    above to list pieces.
                  </div>
                ) : (
                  <div className="overflow-x-auto bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase bg-slate-50">
                          <th className="py-2.5 px-4">Item Name</th>
                          <th className="py-2.5 px-4 text-center">Service</th>
                          <th className="py-2.5 px-4 text-center">Qty</th>
                          <th className="py-2.5 px-4 text-right">Price</th>
                          <th className="py-2.5 px-4 text-right">Total</th>
                          <th className="py-2.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((item, idx) => (
                          <React.Fragment key={item.id}>
                            <tr className="hover:bg-slate-50/50">
                              <td className="py-3 px-4 font-bold text-slate-800">
                                {item.item_name}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                    item.service_type === "Stitching"
                                      ? "bg-purple-50 text-purple-700 border-purple-100"
                                      : "bg-orange-50 text-orange-700 border-orange-100"
                                  }`}
                                >
                                  {item.service_type}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center font-semibold text-slate-600">
                                {item.quantity}
                              </td>
                              <td className="py-3 px-4 text-right text-slate-600">
                                ₹{item.price.toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-right space-x-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewingMeasurementsItemIndex(
                                      viewingMeasurementsItemIndex === idx
                                        ? null
                                        : idx,
                                    )
                                  }
                                  className="text-indigo-650 hover:text-indigo-700 font-semibold inline-flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>
                                    {viewingMeasurementsItemIndex === idx
                                      ? "Hide"
                                      : "Measurements"}
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveItemFromList(item.id)
                                  }
                                  className="text-rose-500 hover:text-rose-600 font-bold"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                            {/* Expandable item measurements */}
                            {viewingMeasurementsItemIndex === idx && (
                              <tr>
                                <td
                                  colSpan="6"
                                  className="bg-slate-50/50 p-4 border-t border-slate-100"
                                >
                                  <div className="text-xs space-y-2">
                                    <span className="font-bold text-slate-700 uppercase tracking-wider block">
                                      Measurements Parameters:
                                    </span>
                                    {Object.keys(item.measurements).length ===
                                    0 ? (
                                      <p className="text-slate-400 italic text-[11px]">
                                        No measurements configured for this
                                        item.
                                      </p>
                                    ) : (
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {Object.entries(item.measurements).map(
                                          ([key, val]) => (
                                            <div
                                              key={key}
                                              className="bg-white border border-slate-200 p-2 rounded-lg"
                                            >
                                              <span className="text-[9px] text-slate-400 uppercase font-bold block">
                                                {key}
                                              </span>
                                              <span className="font-bold text-slate-800">
                                                {val}
                                              </span>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Inspiration & Instructions */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Reference Material & Instructions
              </h3>

              {/* Inspiration Link */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Inspiration URL Link
                </label>
                <div className="relative">
                  <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    placeholder="https://pinterest.com/pin/example..."
                    value={inspirationLink}
                    onChange={(e) => setInspirationLink(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-slate-850 placeholder-slate-400 outline-none transition text-sm"
                  />
                </div>
              </div>

              {/* Upload Cloth Images */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Upload Cloth Images
                </label>

                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-55 hover:bg-slate-100/50 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
                      <Upload className="w-8 h-8 mb-2 text-slate-400" />
                      <p className="text-xs font-medium">
                        <span className="font-semibold text-indigo-600">
                          Click to upload cloth references
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        PNG, JPG or JPEG images
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                {/* Thumbnails preview */}
                {clothImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4">
                    {clothImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200"
                      >
                        <img
                          src={img}
                          alt="cloth references"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeClothImage(idx)}
                          className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition shadow"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Special Instructions / Global Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="Embroidery notes, neck specifications or special client requests for this entire order..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-slate-850 placeholder-slate-400 outline-none transition text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar parameters (4 columns wide on desktop) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Scheduling Info */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Scheduling timelines
              </h3>

              {/* Delivery Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Delivery Date *
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-slate-700 outline-none transition text-sm cursor-pointer"
                  required
                />
              </div>

              {/* Trial Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Trial Date
                </label>
                <input
                  type="date"
                  value={trialDate}
                  onChange={(e) => setTrialDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-slate-700 outline-none transition text-sm cursor-pointer"
                />
              </div>
            </div>

            {/* Calculations & Order Trigger */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Summary & Price Details
              </h3>

              {/* Price breakup */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Pricing Breakup / Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="Stitching cost, custom material details, extra accessories cost notes..."
                  value={priceBreakup}
                  onChange={(e) => setPriceBreakup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-slate-800 placeholder-slate-400 outline-none transition text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Advance Paid
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={advancePaid}
                    onChange={(e) => setAdvancePaid(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 pl-7 pr-3 text-slate-800 placeholder-slate-400 outline-none transition text-sm"
                  />
                </div>
              </div>

              {/* Calculations details */}
              <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Items pieces</span>
                  <span className="font-semibold text-slate-800">
                    {totalPieces}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Advance Paid</span>
                  <span className="font-semibold text-emerald-600">
                    ₹{parsedAdvancePaid.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2.5">
                  <span className="font-bold text-slate-900 text-base">
                    Grand Total
                  </span>
                  <span className="text-xl font-black text-indigo-600">
                    ₹{totalOrderPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Balance Due</span>
                  <span className="font-bold text-amber-600">
                    ₹{balanceDue.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit trigger */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold py-3.5 px-4 rounded-xl shadow-sm shadow-indigo-600/25 hover:shadow-indigo-600/35 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {loading ? "Submitting Order..." : "Register Stitching Order"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default CreateOrder;
