'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Building2, 
  Compass, 
  UtensilsCrossed, 
  PlusCircle, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Upload, 
  X, 
  Check, 
  Calendar, 
  Tag, 
  Users, 
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BusinessListing, ServiceOfferingDto } from '@/lib/types';
import { formatRwf } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Text } from '@/components/ui/Text';
import { Modal } from '@/components/ui/Modal';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

type ListingCategory = 'STAYS' | 'EXPERIENCES' | 'DINING' | 'CUSTOM';

const AMENITY_OPTIONS = [
  'Free High-Speed Wi-Fi',
  'Private Heated Plunge Pool',
  'Dedicated Butler Service',
  'Panoramic Mountain View',
  'Volcano View Terrace',
  'Air Conditioning',
  'Spa & Massage Center',
  'Airport Shuttle Service',
  'Complimentary Breakfast',
];

export default function PartnerListingsPage() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<BusinessListing | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingOfferingId, setEditingOfferingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [category, setCategory] = useState<ListingCategory>('STAYS');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [title, setTitle] = useState('');
  const [subType, setSubType] = useState('Suite');
  const [price, setPrice] = useState('250000');
  const [unit, setUnit] = useState('per_night');
  const [capacity, setCapacity] = useState('2');
  const [minCapacity, setMinCapacity] = useState('1');
  const [duration, setDuration] = useState('Full Day (6 Hours)');
  const [cuisineType, setCuisineType] = useState('Rwandan & International Fusion');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['Free High-Speed Wi-Fi']);
  const [inclusions, setInclusions] = useState('Breakfast included, Private butler');
  const [description, setDescription] = useState('');
  
  // Gallery & File Upload
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string>('');

  const fetchPartnerListings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/businesses', { cache: 'no-store' });
      const data = await res.json();
      const owned = (data.businesses ?? []).filter((b: BusinessListing) => b.ownerId === user.id);
      const active = owned[0] ?? null;

      if (active) {
        const fullRes = await fetch(`/api/businesses/${active.id}`, { cache: 'no-store' });
        const fullData = await fullRes.json();
        setBusiness(fullData.business ?? active);
      } else {
        setBusiness(null);
      }
    } catch (e) {
      console.error('Failed to load listings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const openCreateModal = () => {
    setEditingOfferingId(null);
    setCategory('STAYS');
    setCustomCategoryName('');
    setTitle('');
    setSubType('Suite');
    setPrice('250000');
    setUnit('per_night');
    setCapacity('2');
    setMinCapacity('1');
    setDuration('Full Day');
    setCuisineType('Rwandan Fusion');
    setSelectedAmenities(['Free High-Speed Wi-Fi']);
    setInclusions('Breakfast included, Private butler');
    setDescription('');
    setGalleryImages([
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    ]);
    setCoverImage('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80');
    setShowModal(true);
  };

  const openEditModal = (off: ServiceOfferingDto) => {
    setEditingOfferingId(off.id);
    const catUpper = (off.category || 'STAYS').toUpperCase();
    const isStd = ['STAYS', 'EXPERIENCES', 'DINING'].includes(catUpper);
    setCategory(isStd ? (catUpper as ListingCategory) : 'CUSTOM');
    if (!isStd) setCustomCategoryName(off.category || 'Custom');

    setTitle(off.title);
    setSubType(off.subType || 'Suite');
    setPrice(String(off.price));
    setUnit(off.unit);
    setCapacity(String(off.capacity));
    setDescription(off.description);
    setInclusions((off.inclusions || []).join(', '));
    setGalleryImages(off.images.length > 0 ? off.images : []);
    setCoverImage(off.coverImage || off.images[0] || '');
    if (off.attributes?.amenities) setSelectedAmenities(off.attributes.amenities);
    if (off.attributes?.duration) setDuration(off.attributes.duration);
    if (off.attributes?.cuisineType) setCuisineType(off.attributes.cuisineType);
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImage(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.url) {
          setGalleryImages((prev) => {
            const updated = [...prev, data.url];
            if (!coverImage) setCoverImage(data.url);
            return updated;
          });
        } else {
          alert(data.error || 'Failed to upload image file');
        }
      }
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAddUrlImage = () => {
    if (!imageUrlInput.trim()) return;
    const url = imageUrlInput.trim();
    setGalleryImages((prev) => {
      const updated = [...prev, url];
      if (!coverImage) setCoverImage(url);
      return updated;
    });
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    const removed = galleryImages[index];
    const updated = galleryImages.filter((_, i) => i !== index);
    setGalleryImages(updated);
    if (coverImage === removed) {
      setCoverImage(updated[0] || '');
    }
  };

  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !title) return;
    if (galleryImages.length === 0) {
      alert('Please add or upload at least one image for your listing gallery.');
      return;
    }
    setSubmitting(true);

    try {
      const parsedInclusions = inclusions
        ? inclusions.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const attributesPayload: Record<string, any> = {};
      if (category === 'STAYS') {
        attributesPayload.amenities = selectedAmenities;
        attributesPayload.roomType = subType;
        attributesPayload.maxOccupancy = parseInt(capacity, 10);
      } else if (category === 'EXPERIENCES') {
        attributesPayload.experienceType = subType;
        attributesPayload.duration = duration;
      } else if (category === 'DINING') {
        attributesPayload.serviceType = subType;
        attributesPayload.cuisineType = cuisineType;
      }

      const payload = {
        category: category === 'CUSTOM' ? (customCategoryName || 'Custom') : category,
        subType,
        title,
        description,
        price: parseInt(price, 10) || 150000,
        capacity: parseInt(capacity, 10) || 2,
        unit,
        duration: category === 'EXPERIENCES' ? duration : undefined,
        coverImage: coverImage || galleryImages[0],
        images: galleryImages,
        inclusions: parsedInclusions,
        attributes: attributesPayload,
      };

      const endpoint = editingOfferingId
        ? `/api/businesses/${business.id}/offerings/${editingOfferingId}`
        : `/api/businesses/${business.id}/offerings`;

      const method = editingOfferingId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        fetchPartnerListings();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save listing');
      }
    } catch (e) {
      console.error('Save listing failed:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteListing = async (offeringId: string) => {
    if (!business || !confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`/api/businesses/${business.id}/offerings/${offeringId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchPartnerListings();
      }
    } catch (e) {
      console.error('Delete listing failed:', e);
    }
  };

  const offerings: ServiceOfferingDto[] = business?.offerings ?? [];

  const filteredOfferings = offerings.filter((off) => {
    const matchesSearch =
      !searchQuery ||
      off.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      off.description.toLowerCase().includes(searchQuery.toLowerCase());

    const offCat = (off.category || 'STAYS').toUpperCase();
    const matchesCategory =
      categoryFilter === 'ALL' ||
      (categoryFilter === 'CUSTOM'
        ? !['STAYS', 'EXPERIENCES', 'DINING'].includes(offCat)
        : offCat === categoryFilter);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' ? off.isAvailable !== false : off.isAvailable === false);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="h-20 rounded-3xl bg-slate-200/70 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-200/70 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <Building2 className="w-12 h-12 mx-auto text-sky-600" />
        <h1 className="text-2xl font-bold text-slate-900">No Business Linked</h1>
        <p className="text-sm text-slate-600">Register your business establishment to manage listings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <DashboardHeader
        title="Listings & Offerings"
        subtitle={`Manage suites, tours, dining menus & custom packages for ${business.name}`}
        logoUrl={business.logoUrl}
        actions={
          <Button
            onClick={openCreateModal}
            variant="primary"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            className="!rounded-xl shadow-lg shadow-sky-600/25 bg-sky-600 hover:bg-sky-500 text-white font-extrabold"
          >
            + Add New Listing
          </Button>
        }
      />

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search listings by title..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="STAYS">Stays</option>
              <option value="EXPERIENCES">Experiences</option>
              <option value="DINING">Dining</option>
              <option value="CUSTOM">Custom Categories</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive / Draft</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      {filteredOfferings.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">No listings found</h3>
            <p className="text-xs text-slate-500">No active listings match your selected search or filter criteria.</p>
          </div>
          <Button onClick={openCreateModal} variant="primary" size="sm" className="!rounded-xl">
            + Create First Listing
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOfferings.map((off) => {
            const cover = off.coverImage || off.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
            return (
              <div
                key={off.id}
                className="rounded-3xl bg-white border border-slate-200 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col group"
              >
                {/* Cover Image */}
                <div className="relative w-full h-48 bg-slate-900 overflow-hidden">
                  <Image src={cover} alt={off.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider border border-white/20">
                    {off.category || 'STAYS'}
                  </span>
                  <span
                    className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm ${
                      off.isAvailable !== false
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {off.isAvailable !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Listing Info */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-extrabold text-slate-900 line-clamp-1">{off.title}</h3>
                      <span className="text-sm font-mono font-extrabold text-sky-700 shrink-0">
                        {formatRwf(off.price)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                      {off.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-semibold gap-2">
                      <span>Unit: {off.unit}</span>
                      <span>Capacity: {off.capacity} guests</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        onClick={() => openEditModal(off)}
                        variant="ghost"
                        size="sm"
                        leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                        className="flex-1 !rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold border border-slate-200 !text-xs"
                      >
                        Edit Listing
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleDeleteListing(off.id)}
                        className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors border border-rose-200"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Listing Category-Aware Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingOfferingId ? 'Edit Listing' : 'Add New Listing'}
        size="lg"
      >
        <form onSubmit={handleSaveListing} className="p-6 space-y-5">
          {/* Category Tabs */}
          <div>
            <label className="block text-[11px] uppercase font-extrabold tracking-wider text-slate-500 mb-2">
              Select Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setCategory('STAYS')}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all ${
                  category === 'STAYS' ? 'bg-sky-600 border-sky-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Stays</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('EXPERIENCES')}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all ${
                  category === 'EXPERIENCES' ? 'bg-sky-600 border-sky-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Experiences</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('DINING')}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all ${
                  category === 'DINING' ? 'bg-sky-600 border-sky-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Dining</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('CUSTOM')}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all ${
                  category === 'CUSTOM' ? 'bg-sky-600 border-sky-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Custom</span>
              </button>
            </div>
          </div>

          {category === 'CUSTOM' && (
            <Input
              label="Custom Category Name"
              type="text"
              value={customCategoryName}
              onChange={(e) => setCustomCategoryName(e.target.value)}
              placeholder="e.g. Spa Package, Car Rental"
              required
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Listing Name"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Forest Villa with Private Plunge Pool"
              required
            />

            <Input
              label="Price (RWF)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Billing Unit</label>
              {category === 'CUSTOM' ? (
                <Input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. Per Package, Per Hour"
                  required
                />
              ) : (
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none"
                >
                  <option value="per_night">Per Night</option>
                  <option value="per_person">Per Person</option>
                  <option value="per_table">Per Table</option>
                  <option value="per_tour">Per Tour</option>
                </select>
              )}
            </div>

            <Input
              label="Max Capacity (Guests)"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Listing Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the suite or experience..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Functional Image Upload & Gallery */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900">Listing Image Gallery & Cover Photo</span>
              <span className="text-[10px] font-bold text-slate-500">{galleryImages.length} images</span>
            </div>

            {/* File Upload Input & URL input */}
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="cursor-pointer px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm shrink-0">
                <Upload className="w-4 h-4" />
                <span>{uploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>

              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Or paste image URL..."
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none"
                />
                <Button
                  type="button"
                  onClick={handleAddUrlImage}
                  variant="ghost"
                  size="sm"
                  className="!rounded-xl bg-white border border-slate-200 text-slate-800 font-bold"
                >
                  + Add URL
                </Button>
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {galleryImages.map((imgUrl, idx) => {
                const isCover = coverImage === imgUrl;
                return (
                  <div
                    key={idx}
                    className={`relative rounded-xl overflow-hidden border-2 h-24 group transition-all ${
                      isCover ? 'border-sky-600 ring-2 ring-sky-600/30' : 'border-slate-200'
                    }`}
                  >
                    <Image src={imgUrl} alt={`Gallery ${idx}`} fill className="object-cover" />
                    
                    <button
                      type="button"
                      onClick={() => setCoverImage(imgUrl)}
                      className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                        isCover ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-900/80 text-white'
                      }`}
                    >
                      {isCover ? 'Primary Cover' : 'Make Cover'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              onClick={() => setShowModal(false)}
              variant="ghost"
              size="sm"
              className="bg-transparent border-none text-slate-500"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={submitting}
              variant="primary"
              size="sm"
              className="!rounded-xl font-extrabold !px-6"
            >
              {submitting ? 'Saving...' : 'Save Listing'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
