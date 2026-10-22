'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  MapPin, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Check, 
  Building2, 
  DollarSign, 
  Layers,
  Video,
  UserCheck,
  Compass,
  FileCheck2,
  Calendar,
  Ruler,
  Calculator
} from 'lucide-react';
import { Property, PropertyType, PropertyPurpose, PropertyStatus, Currency, PaymentMethod, PropertyCondition } from '@/types';
import { Language, translations } from '@/lib/i18n';
import { formatArea, donumToSqm, sqmToDonum } from '@/lib/utils';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: Property) => void;
  editingProperty?: Property | null;
  existingCount: number;
  lang?: Language;
}

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProperty,
  existingCount,
  lang = 'ckb',
}) => {
  const t = translations[lang] as any;

  const [formData, setFormData] = useState<Partial<Property>>({
    property_code: '',
    title: '',
    property_type: 'house',
    purpose: 'sale',
    status: 'available',
    payment_method: 'cash',
    condition: 'brand_new',
    price: 0,
    currency: 'USD',
    down_payment: 0,
    installment_cycle: 'monthly',
    installment_amount: 0,
    installment_count: 12,
    rental_period: 'monthly',
    project_name: '',
    floor_number: '',
    construction_start_date: '',
    completion_date: '',
    area_sqm: 100,
    city: 'هەولێر',
    neighborhood: '',
    address: '',
    lat: 36.195,
    lng: 44.01,
    bedrooms: 3,
    bathrooms: 2,
    floors: 1,
    year_built: new Date().getFullYear(),
    features: ['ئاو', 'کارەبای ٢٤ کاتژمێری', 'تاپۆی تەواو'],
    land_details: {
      frontage_meter: 10,
      street_width: 15,
      is_corner: false,
      zoning_type: 'تاپۆی سڕف',
      area_donum: 0,
      area_olk: 0,
    },
    images: [],
    video_url: '',
    notes: '',
    owner_contact: {
      name: '',
      phone: '',
      notes: '',
    },
    agency_name: 'Rasel Real Estate',
    freelancer_name: '',
    commission_amount: 0,
    net_to_owner: 0,
  });

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');

  // Measurement calculation state
  const [measurementMode, setMeasurementMode] = useState<'sqm' | 'dimensions' | 'donum'>('sqm');
  const [frontageInput, setFrontageInput] = useState<number | ''>('');
  const [depthInput, setDepthInput] = useState<number | ''>('');
  const [donumInput, setDonumInput] = useState<number | ''>('');
  const [olkInput, setOlkInput] = useState<number | ''>('');

  const handleDimensionsChange = (f: number | '', d: number | '') => {
    setFrontageInput(f);
    setDepthInput(d);
    if (f !== '' && d !== '' && Number(f) > 0 && Number(d) > 0) {
      const calculatedArea = Number(f) * Number(d);
      setFormData((prev) => ({
        ...prev,
        area_sqm: calculatedArea,
        land_details: {
          ...prev.land_details,
          frontage_meter: Number(f),
          depth_meter: Number(d),
        },
      }));
    }
  };

  const handleDonumChange = (don: number | '', ol: number | '') => {
    setDonumInput(don);
    setOlkInput(ol);
    const calculatedSqm = donumToSqm(Number(don || 0), Number(ol || 0));
    if (calculatedSqm > 0) {
      setFormData((prev) => ({
        ...prev,
        area_sqm: calculatedSqm,
        land_details: {
          ...prev.land_details,
          area_donum: Number(don || 0),
          area_olk: Number(ol || 0),
        },
      }));
    }
  };

  const handleSqmChange = (val: number) => {
    const { donum, olk } = sqmToDonum(val);
    setFormData((prev) => ({
      ...prev,
      area_sqm: val,
      land_details: {
        ...prev.land_details,
        area_donum: donum,
        area_olk: olk,
      },
    }));
    setDonumInput(donum || '');
    setOlkInput(olk || '');
  };

  // Pre-fill if editing or auto-generate code if creating
  useEffect(() => {
    if (editingProperty) {
      setFormData(editingProperty);
      if (editingProperty.land_details?.frontage_meter) setFrontageInput(editingProperty.land_details.frontage_meter);
      if (editingProperty.land_details?.depth_meter) setDepthInput(editingProperty.land_details.depth_meter);
      if (editingProperty.area_sqm >= 2500 || editingProperty.land_details?.area_donum) {
        const { donum, olk } = sqmToDonum(editingProperty.area_sqm);
        setDonumInput(donum || '');
        setOlkInput(olk || '');
      }
    } else {
      const nextCode = `RSL-${100 + existingCount + 1}`;
      setFormData({
        id: `prop-${Date.now()}`,
        property_code: nextCode,
        title: '',
        property_type: 'house',
        purpose: 'sale',
        status: 'available',
        payment_method: 'cash',
        condition: 'brand_new',
        price: 150000,
        currency: 'USD',
        down_payment: 30000,
        installment_cycle: 'monthly',
        installment_amount: 1000,
        installment_count: 24,
        rental_period: 'monthly',
        project_name: '',
        floor_number: '',
        construction_start_date: '',
        completion_date: '',
        area_sqm: 200,
        city: 'هەولێر',
        neighborhood: '',
        address: '',
        lat: 36.195,
        lng: 44.005,
        bedrooms: 3,
        bathrooms: 2,
        floors: 1,
        year_built: 2024,
        features: ['ئاو', 'کارەبا', 'تاپۆ'],
        land_details: {
          frontage_meter: 10,
          street_width: 15,
          is_corner: false,
          zoning_type: 'تاپۆی سڕف',
          area_donum: 0,
          area_olk: 0,
        },
        images: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
        ],
        video_url: '',
        notes: '',
        owner_contact: {
          name: '',
          phone: '',
          notes: '',
        },
        agency_name: 'Rasel Real Estate',
        freelancer_name: '',
        commission_amount: 0,
        net_to_owner: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }, [editingProperty, existingCount, isOpen]);

  if (!isOpen) return null;

  const handleAddImage = () => {
    if (imageUrlInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), imageUrlInput.trim()],
      }));
      setImageUrlInput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setFormData((prev) => ({
            ...prev,
            images: [...(prev.images || []), base64],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...(prev.features || []), featureInput.trim()],
      }));
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: (prev.features || []).filter((f) => f !== feature),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.city) {
      alert('تکایە ناوی موڵک، نرخ و شار پڕبکەرەوە!');
      return;
    }

    const finalProperty: Property = {
      id: formData.id || `prop-${Date.now()}`,
      property_code: formData.property_code || `RSL-${Date.now().toString().slice(-3)}`,
      title: formData.title || '',
      property_type: (formData.property_type as PropertyType) || 'house',
      purpose: (formData.purpose as PropertyPurpose) || 'sale',
      status: (formData.status as PropertyStatus) || 'available',
      payment_method: (formData.payment_method as PaymentMethod) || 'cash',
      condition: (formData.condition as PropertyCondition) || 'brand_new',
      price: Number(formData.price) || 0,
      currency: (formData.currency as Currency) || 'USD',
      down_payment: Number(formData.down_payment) || 0,
      installment_cycle: formData.installment_cycle || 'monthly',
      installment_amount: Number(formData.installment_amount) || 0,
      installment_count: Number(formData.installment_count) || 12,
      rental_period: formData.purpose === 'rent' ? (formData.rental_period || 'monthly') : null,
      project_name: formData.project_name || '',
      floor_number: formData.floor_number || '',
      construction_start_date: formData.construction_start_date || '',
      completion_date: formData.completion_date || '',
      area_sqm: Number(formData.area_sqm) || 0,
      city: formData.city || 'هەولێر',
      neighborhood: formData.neighborhood || '',
      address: formData.address || '',
      lat: formData.lat ? Number(formData.lat) : null,
      lng: formData.lng ? Number(formData.lng) : null,
      bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
      floors: formData.floors ? Number(formData.floors) : null,
      year_built: formData.year_built ? Number(formData.year_built) : null,
      features: formData.features || [],
      land_details: formData.land_details || {},
      images: formData.images && formData.images.length > 0 ? formData.images : [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
      ],
      video_url: formData.video_url || '',
      notes: formData.notes || '',
      owner_contact: formData.owner_contact || { name: '', phone: '', notes: '' },
      agency_name: formData.agency_name || 'Rasel Real Estate',
      freelancer_name: formData.freelancer_name || '',
      commission_amount: Number(formData.commission_amount) || 0,
      net_to_owner: Number(formData.net_to_owner) || (Number(formData.price) - (Number(formData.commission_amount) || 0)),
      created_at: formData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSave(finalProperty);
    onClose();
  };

  const isLand = formData.property_type === 'commercial_land' || formData.property_type === 'agriculture_land';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl glass-panel border border-slate-700 shadow-2xl bg-slate-900 text-right">
        
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-black text-white">
              {editingProperty ? t.edit : t.new_property}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          
          {/* SECTION 1: خستنەڕوو و شێوازی پارەدان */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>١. خستنەڕوو، نرخ و شێوازی پارەدان (نەقد، قیست، پێشەکی)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Purpose: فرۆشتن، کرێ، گۆڕینەوە، وەبەرهێنان */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.purpose} *</label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value as PropertyPurpose })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs outline-none"
                >
                  <option value="sale">{t.for_sale}</option>
                  <option value="rent">{t.for_rent}</option>
                  <option value="exchange">{t.for_exchange}</option>
                  <option value="investment">{t.for_investment}</option>
                </select>
              </div>

              {/* Payment Method: نەقد، قیست، هەردووکی */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.payment_method}</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as PaymentMethod })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs outline-none"
                >
                  <option value="cash">{t.cash}</option>
                  <option value="installments">{t.installments}</option>
                  <option value="both">{t.cash_installments}</option>
                </select>
              </div>

              {/* Price & Currency */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">کۆی نرخ *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 font-mono text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">دراو</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs outline-none"
                >
                  <option value="USD">دۆلاری ئەمریکی ($ USD)</option>
                  <option value="IQD">دیناری عێراقی (IQD)</option>
                </select>
              </div>
            </div>

            {/* Installment details (if installments or both) */}
            {(formData.payment_method === 'installments' || formData.payment_method === 'both') && (
              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">{t.down_payment}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.down_payment || ''}
                    onChange={(e) => setFormData({ ...formData, down_payment: Number(e.target.value) })}
                    placeholder="بڕی پێشەکی"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/40 font-mono text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">{t.installment_type}</label>
                  <select
                    value={formData.installment_cycle}
                    onChange={(e) => setFormData({ ...formData, installment_cycle: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/40 text-white text-xs outline-none"
                  >
                    <option value="monthly">{t.monthly}</option>
                    <option value="quarterly">{t.quarterly}</option>
                    <option value="yearly">{t.yearly}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">{t.installment_amount}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.installment_amount || ''}
                    onChange={(e) => setFormData({ ...formData, installment_amount: Number(e.target.value) })}
                    placeholder="نموونە: 500"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/40 font-mono text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">ژمارەی قیستەکان</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.installment_count || ''}
                    onChange={(e) => setFormData({ ...formData, installment_count: Number(e.target.value) })}
                    placeholder="نموونە: 24"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/40 font-mono text-white text-xs outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: زانیاری پڕۆژە، نهۆم، و بەرواری تەواوبوون */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>٢. پڕۆژە، نهۆم، دۆخی بەکارهێنان و کاتی تەواوبوون</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.project}</label>
                <input
                  type="text"
                  value={formData.project_name || ''}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  placeholder="ئیمپایەر وۆڕڵد، دریم سیتی..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.floor_num}</label>
                <input
                  type="text"
                  value={formData.floor_number || ''}
                  onChange={(e) => setFormData({ ...formData, floor_number: e.target.value })}
                  placeholder="نهۆمی ٥، ئەپارتمانی ١٢"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.condition}</label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value as PropertyCondition })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs outline-none"
                >
                  <option value="brand_new">{t.brand_new}</option>
                  <option value="used">{t.used}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.status}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as PropertyStatus })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs outline-none"
                >
                  <option value="available">{t.available}</option>
                  <option value="rented">{t.rented}</option>
                  <option value="sold">{t.sold}</option>
                  <option value="reserved">{t.reserved}</option>
                  <option value="under_maintenance">{t.under_maintenance}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.start_date}</label>
                <input
                  type="date"
                  value={formData.construction_start_date || ''}
                  onChange={(e) => setFormData({ ...formData, construction_start_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-white text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.completion_date}</label>
                <input
                  type="date"
                  value={formData.completion_date || ''}
                  onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-white text-xs outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: ناونیشان، جۆری موڵک و ڕووبەر */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>٣. ناونیشان، جۆری موڵک و ڕووبەر</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">ناوی موڵک *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="نموونە: ڤیلای مۆدێرن لە گوندی ئیتاڵی ٢"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.property_type}</label>
                <select
                  value={formData.property_type}
                  onChange={(e) => setFormData({ ...formData, property_type: e.target.value as PropertyType })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs outline-none"
                >
                  <option value="house">{t.house}</option>
                  <option value="apartment">{t.apartment}</option>
                  <option value="villa">{t.villa}</option>
                  <option value="shop">{t.shop}</option>
                  <option value="office">{t.office}</option>
                  <option value="commercial_land">{t.commercial_land}</option>
                  <option value="agriculture_land">{t.agriculture_land}</option>
                  <option value="building">{t.building}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">کۆدی موڵک</label>
                <input
                  type="text"
                  value={formData.property_code}
                  onChange={(e) => setFormData({ ...formData, property_code: e.target.value })}
                  placeholder="RSL-101"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-amber-400 text-xs outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.city} *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="هەولێر، سلێمانی، دهۆک..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">گەڕەک</label>
                <input
                  type="text"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  placeholder="گوندی ئیتاڵی، بەختیاری..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none"
                />
              </div>
              
              {/* Interactive Measurement Calculator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    {t.area} *
                  </label>
                  
                  {/* Mode Switcher */}
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setMeasurementMode('sqm')}
                      className={`px-2 py-0.5 rounded font-bold transition-all ${
                        measurementMode === 'sqm' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      م²
                    </button>
                    <button
                      type="button"
                      onClick={() => setMeasurementMode('dimensions')}
                      className={`px-2 py-0.5 rounded font-bold transition-all ${
                        measurementMode === 'dimensions' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      بەرە × قووڵی
                    </button>
                    <button
                      type="button"
                      onClick={() => setMeasurementMode('donum')}
                      className={`px-2 py-0.5 rounded font-bold transition-all ${
                        measurementMode === 'donum' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      دۆنم / ئۆڵک
                    </button>
                  </div>
                </div>

                {measurementMode === 'sqm' && (
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.area_sqm || ''}
                    onChange={(e) => handleSqmChange(Number(e.target.value))}
                    placeholder="ڕووبەر بە مەتر دووجا (م²)"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-white text-xs outline-none focus:border-amber-500"
                  />
                )}

                {measurementMode === 'dimensions' && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="1"
                      value={frontageInput}
                      onChange={(e) => handleDimensionsChange(e.target.value === '' ? '' : Number(e.target.value), depthInput)}
                      placeholder="پانی/بەرە (م)"
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-amber-500/40 font-mono text-white text-xs outline-none"
                    />
                    <input
                      type="number"
                      min="1"
                      value={depthInput}
                      onChange={(e) => handleDimensionsChange(frontageInput, e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="قووڵی/درێژی (م)"
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-amber-500/40 font-mono text-white text-xs outline-none"
                    />
                  </div>
                )}

                {measurementMode === 'donum' && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={donumInput}
                      onChange={(e) => handleDonumChange(e.target.value === '' ? '' : Number(e.target.value), olkInput)}
                      placeholder="دۆنم (٢٥٠٠م²)"
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-amber-500/40 font-mono text-white text-xs outline-none"
                    />
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={olkInput}
                      onChange={(e) => handleDonumChange(donumInput, e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="ئۆڵک (١٠٠م²)"
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-amber-500/40 font-mono text-white text-xs outline-none"
                    />
                  </div>
                )}

                <div className="text-[11px] text-amber-400 font-semibold px-1">
                  {formatArea(formData.area_sqm || 0, formData.land_details, lang).fullDescription}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">ناونیشانی تەواو</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="شەقام، کۆڵان، نزیک شوێنێکی ناسراو..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none"
              />
            </div>

            {/* GPS coordinates */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">هێڵی پانی (Latitude / Lat)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.lat || ''}
                  onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                  placeholder="36.19"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">هێڵی درێژی (Longitude / Lng)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.lng || ''}
                  onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                  placeholder="44.01"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: وردەکاری زەوی بە ورد و درشتەوە (Land Details) */}
          {isLand && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4" />
                <span>٤. وردەکاری فرۆشتنی زەوی بە ورد و درشتەوە</span>
              </h3>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t.frontage} (م)</label>
                  <input
                    type="number"
                    value={formData.land_details?.frontage_meter || ''}
                    onChange={(e) => {
                      const f = Number(e.target.value);
                      const d = formData.land_details?.depth_meter;
                      setFormData({
                        ...formData,
                        area_sqm: f && d ? f * d : formData.area_sqm,
                        land_details: { ...formData.land_details, frontage_meter: f }
                      });
                      setFrontageInput(f || '');
                    }}
                    placeholder="نموونە: 12"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-white text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t.depth || 'قووڵی'} (م)</label>
                  <input
                    type="number"
                    value={formData.land_details?.depth_meter || ''}
                    onChange={(e) => {
                      const d = Number(e.target.value);
                      const f = formData.land_details?.frontage_meter;
                      setFormData({
                        ...formData,
                        area_sqm: f && d ? f * d : formData.area_sqm,
                        land_details: { ...formData.land_details, depth_meter: d }
                      });
                      setDepthInput(d || '');
                    }}
                    placeholder="نموونە: 25"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-white text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t.street_width} (م)</label>
                  <input
                    type="number"
                    value={formData.land_details?.street_width || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      land_details: { ...formData.land_details, street_width: Number(e.target.value) }
                    })}
                    placeholder="نموونە: 20"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-white text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t.zoning}</label>
                  <input
                    type="text"
                    value={formData.land_details?.zoning_type || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      land_details: { ...formData.land_details, zoning_type: e.target.value }
                    })}
                    placeholder="تاپۆی سڕف، زراعی..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs outline-none"
                  />
                </div>

                <div className="col-span-2 sm:col-span-4 flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-white">
                    <input
                      type="checkbox"
                      checked={formData.land_details?.is_corner || false}
                      onChange={(e) => setFormData({
                        ...formData,
                        land_details: { ...formData.land_details, is_corner: e.target.checked }
                      })}
                      className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>{t.corner} (لەسەر دوو شەقام / رووکن)</span>
                  </label>

                  {formData.land_details?.frontage_meter && formData.land_details?.depth_meter ? (
                    <span className="text-xs text-amber-400 font-mono font-bold">
                      {formData.land_details.frontage_meter} × {formData.land_details.depth_meter} = {formData.land_details.frontage_meter * formData.land_details.depth_meter} م²
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: وێنە و ڤیدیۆ (Images & Video Tour) */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span>٥. وێنەکانی موڵک و بەستەری ڤیدیۆ</span>
            </h3>

            {/* Video Tour URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">بەستەری ڤیدیۆ (YouTube / Shorts / MP4 Link)</label>
              <input
                type="url"
                value={formData.video_url || ''}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=... یان هەر لینکێکی ڤیدیۆ"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs outline-none"
              />
            </div>

            {/* URL input */}
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="بەستەری وێنە بنووسە (Image URL)..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                زیادکردن
              </button>
            </div>

            {/* Direct file upload from device */}
            <div className="flex items-center justify-center p-4 border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-2xl bg-slate-950/40 text-center cursor-pointer transition-all">
              <label className="cursor-pointer flex flex-col items-center">
                <Upload className="w-7 h-7 text-amber-400 mb-2" />
                <span className="text-xs font-bold text-white mb-0.5">وێنە لە کۆمپیوتەر یان مۆبایلەکەت باربکە</span>
                <span className="text-[11px] text-slate-500">پشتگیری JPG, PNG, WEBP</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image Previews */}
            {formData.images && formData.images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden group border border-slate-800">
                    <img src={img} alt={`Property ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-md bg-rose-600 text-white opacity-90 hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-amber-300 font-bold">
                        وێنەی سەرەکی
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 6: لایەنەکان، کۆمیسیۆن و پارەی گەڕاوە بۆ خاوەن */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              <span>٦. ناوی خاوەن، نوسینگە، فریلانسەر و کۆمیسیۆن</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.owner_name}</label>
                <input
                  type="text"
                  value={formData.owner_contact?.name || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    owner_contact: { ...(formData.owner_contact || { phone: '', notes: '' }), name: e.target.value }
                  })}
                  placeholder="ناوی خاوەنی ڕاستەقینە"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ژمارەی تەلەفۆنی خاوەن</label>
                <input
                  type="tel"
                  value={formData.owner_contact?.phone || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    owner_contact: { ...(formData.owner_contact || { name: '', notes: '' }), phone: e.target.value }
                  })}
                  placeholder="0750xxxxxxx"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.agency_name}</label>
                <input
                  type="text"
                  value={formData.agency_name || ''}
                  onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })}
                  placeholder="کۆمپانیای عەقارات"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.freelancer_name}</label>
                <input
                  type="text"
                  value={formData.freelancer_name || ''}
                  onChange={(e) => setFormData({ ...formData, freelancer_name: e.target.value })}
                  placeholder="ناوی دەڵاڵ یان برۆکەر"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.commission}</label>
                <input
                  type="number"
                  min="0"
                  value={formData.commission_amount || ''}
                  onChange={(e) => {
                    const comm = Number(e.target.value);
                    setFormData({
                      ...formData,
                      commission_amount: comm,
                      net_to_owner: (Number(formData.price) || 0) - comm
                    });
                  }}
                  placeholder="بڕی عەمولە"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t.net_to_owner}</label>
                <input
                  type="number"
                  value={formData.net_to_owner || ''}
                  onChange={(e) => setFormData({ ...formData, net_to_owner: Number(e.target.value) })}
                  placeholder="پارەی ماوە بۆ خاوەن"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-emerald-400 text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">تێبینی و ڕوونکردنەوەی زیاتر</label>
              <textarea
                rows={2}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="تێبینی تایبەت لەسەر موڵک، مەرجی مامەڵە، دۆخی تاپۆ..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{t.save}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              {t.cancel}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
