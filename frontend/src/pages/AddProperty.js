import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import {
  Home,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Maximize,
  Building,
  Image as ImageIcon,
  Video,
  Check,
  X,
  Upload,
  ArrowLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const AMENITIES_LIST = [
  'Power Backup',
  'Parking (Covered/Open)',
  'Gym',
  'Swimming Pool',
  'Lift',
  'Security / CCTV',
  'Garden / Park',
  'Clubhouse',
  'Kids Play Area',
  'Water Supply 24x7'
];

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    description: '',
    propertyType: 'Apartment',
    listingType: 'Sale',
    status: 'available',
    price: '',
    availableFrom: '',
    
    // Location Details
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    googleMapsLink: '',
    
    // Property Specifications
    areaSqft: '',
    bedrooms: '',
    bathrooms: '',
    balconies: '',
    floorNumber: '',
    totalFloors: '',
    furnishing: 'Unfurnished',
    ageOfProperty: '',
    facingDirection: '',
    ownershipType: 'Freehold',
    
    // Amenities
    amenities: [],
    
    // Media
    images: [],
    videoTourUrl: '',
    brochureUrl: '',
    
    // Contact Details
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    
    isFeatured: false
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedBrochure, setSelectedBrochure] = useState(null);
  const [uploadingBrochure, setUploadingBrochure] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      const formDataToUpload = new FormData();
      selectedFiles.forEach(file => {
        formDataToUpload.append('images', file);
      });

      const token = localStorage.getItem('token');
      const response = await fetch('https://yugproperties.onrender.com/api/properties/upload-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToUpload
      });

      const data = await response.json();

      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...data.imageUrls]
        }));
        setSelectedFiles([]);
        // Reset file input
        const fileInput = document.getElementById('fileUpload');
        if (fileInput) fileInput.value = '';
      } else {
        setError(data.message || 'Failed to upload images');
      }
    } catch (err) {
      setError('Failed to upload images. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleBrochureSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed for brochures');
        e.target.value = '';
        return;
      }
      // Validate file size (20MB)
      if (file.size > 20 * 1024 * 1024) {
        setError('Brochure file size must be less than 20MB');
        e.target.value = '';
        return;
      }
      setSelectedBrochure(file);
      setError('');
    }
  };

  const handleUploadBrochure = async () => {
    if (!selectedBrochure) return;

    setUploadingBrochure(true);
    setError('');

    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append('brochure', selectedBrochure);
      
      // Send old brochure URL if it exists, so backend can delete it
      if (formData.brochureUrl) {
        formDataToUpload.append('oldBrochureUrl', formData.brochureUrl);
      }

      const token = localStorage.getItem('token');
      const response = await fetch('https://yugproperties.onrender.com/api/properties/upload-brochure', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToUpload
      });

      const data = await response.json();

      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          brochureUrl: data.brochureUrl
        }));
        setSelectedBrochure(null);
        // Reset file input
        const fileInput = document.getElementById('brochureUpload');
        if (fileInput) fileInput.value = '';
      } else {
        setError(data.message || 'Failed to upload brochure');
      }
    } catch (err) {
      setError('Failed to upload brochure. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploadingBrochure(false);
    }
  };

  const removeBrochure = async () => {
    if (!formData.brochureUrl) return;

    try {
      // Delete from Firebase Storage
      const token = localStorage.getItem('token');
      
      const response = await fetch('https://yugproperties.onrender.com/api/properties/delete-brochure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ brochureUrl: formData.brochureUrl })
      });

      if (response.ok) {
        console.log('✅ Brochure deleted successfully');
      }
      
      // Update form state
      setFormData(prev => ({
        ...prev,
        brochureUrl: ''
      }));
    } catch (err) {
      console.error('Error removing brochure:', err);
      // Still update UI even if deletion fails
      setFormData(prev => ({
        ...prev,
        brochureUrl: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://yugproperties.onrender.com/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Failed to create property listing');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Property Listed Successfully!</h2>
            <p className="text-muted-foreground mb-4">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Home className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Add New Property</h1>
              <p className="text-muted-foreground">Fill in the details to list a new property</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="w-5 h-5 text-orange-600" />
                <span>1. Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Property Title / Name *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Luxury 3BHK Apartment in Virar"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background"
                  placeholder="Describe the property features, highlights, nearby amenities..."
                />
              </div>

              <div>
                <Label htmlFor="propertyType">Property Type *</Label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  required
                >
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Studio">Studio</option>
                  <option value="Row House">Row House</option>
                  <option value="Plot">Plot</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>

              <div>
                <Label htmlFor="listingType">Listing Type *</Label>
                <select
                  id="listingType"
                  name="listingType"
                  value={formData.listingType}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  required
                >
                  <option value="Sale">For Sale</option>
                  <option value="Rent">For Rent</option>
                  <option value="Lease">For Lease</option>
                </select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <Label htmlFor="price">Price (₹) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="e.g., 7500000"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="availableFrom">Available From</Label>
                <Input
                  id="availableFrom"
                  name="availableFrom"
                  type="date"
                  value={formData.availableFrom}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="rounded border-border"
                />
                <Label htmlFor="isFeatured" className="cursor-pointer">
                  Mark as Featured Property
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                <span>2. Location Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Full Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street, Landmark, Area"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g., Mumbai"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g., Maharashtra"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="e.g., 401303"
                />
              </div>

              <div>
                <Label htmlFor="googleMapsLink">Google Maps Link</Label>
                <Input
                  id="googleMapsLink"
                  name="googleMapsLink"
                  value={formData.googleMapsLink}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="0.00000001"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="19.4568"
                  />
                </div>

                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="0.00000001"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="72.8125"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-orange-600" />
                <span>3. Property Specifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="areaSqft">Area (sq. ft.) *</Label>
                  <div className="relative">
                    <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="areaSqft"
                      name="areaSqft"
                      type="number"
                      value={formData.areaSqft}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="e.g., 1250"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bedrooms">Bedrooms (BHK) *</Label>
                  <div className="relative">
                    <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="e.g., 3"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms *</Label>
                  <div className="relative">
                    <Bath className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="bathrooms"
                      name="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="e.g., 2"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="balconies">Balconies</Label>
                  <Input
                    id="balconies"
                    name="balconies"
                    type="number"
                    value={formData.balconies}
                    onChange={handleChange}
                    placeholder="e.g., 1"
                  />
                </div>

                <div>
                  <Label htmlFor="floorNumber">Floor Number</Label>
                  <Input
                    id="floorNumber"
                    name="floorNumber"
                    type="number"
                    value={formData.floorNumber}
                    onChange={handleChange}
                    placeholder="e.g., 5"
                  />
                </div>

                <div>
                  <Label htmlFor="totalFloors">Total Floors</Label>
                  <Input
                    id="totalFloors"
                    name="totalFloors"
                    type="number"
                    value={formData.totalFloors}
                    onChange={handleChange}
                    placeholder="e.g., 10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="furnishing">Furnishing</Label>
                  <select
                    id="furnishing"
                    name="furnishing"
                    value={formData.furnishing}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="Unfurnished">Unfurnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Fully Furnished">Fully Furnished</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="ageOfProperty">Age of Property</Label>
                  <Input
                    id="ageOfProperty"
                    name="ageOfProperty"
                    value={formData.ageOfProperty}
                    onChange={handleChange}
                    placeholder="e.g., 5 years old"
                  />
                </div>

                <div>
                  <Label htmlFor="facingDirection">Facing Direction</Label>
                  <select
                    id="facingDirection"
                    name="facingDirection"
                    value={formData.facingDirection}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Select...</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="North-East">North-East</option>
                    <option value="North-West">North-West</option>
                    <option value="South-East">South-East</option>
                    <option value="South-West">South-West</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="ownershipType">Ownership Type</Label>
                <select
                  id="ownershipType"
                  name="ownershipType"
                  value={formData.ownershipType}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="Freehold">Freehold</option>
                  <option value="Leasehold">Leasehold</option>
                  <option value="Co-operative">Co-operative</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Amenities & Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-orange-600" />
                <span>4. Amenities & Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                {AMENITIES_LIST.map(amenity => (
                  <label
                    key={amenity}
                    className={`flex items-center gap-2 p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.amenities.includes(amenity)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="rounded border-border flex-shrink-0"
                    />
                    <span className="text-xs sm:text-sm break-words">{amenity}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                <span>5. Contact Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactName">Contact Person Name *</Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    placeholder="e.g., Rajesh Kumar"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Contact Phone *</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="e.g., +91 98765 43210"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="e.g., rajesh@example.com"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Media & Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-orange-600" />
                <span>6. Media & Attachments</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm sm:text-base">Property Images</Label>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                  Upload property images to Firebase Storage
                </p>
                
                {/* Direct File Upload */}
                <div className="border-2 border-dashed border-border rounded-lg p-4 sm:p-6 mb-3 sm:mb-4 hover:border-primary/50 transition-colors">
                  <div className="text-center">
                    <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-2 sm:mb-3" />
                    <Label htmlFor="fileUpload" className="cursor-pointer text-sm sm:text-base">
                      <span className="text-primary hover:underline">Click to upload</span> <span className="hidden sm:inline">or drag and drop</span>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, JPEG up to 20MB each (Max 10 files)
                    </p>
                    <input
                      id="fileUpload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Selected Files Preview */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">
                          {selectedFiles.length} file(s) selected
                        </p>
                        <Button
                          type="button"
                          onClick={handleUploadFiles}
                          disabled={uploading}
                          size="sm"
                        >
                          {uploading ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Uploading...
                            </span>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload to Firebase
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <ImageIcon className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="truncate">{file.name}</span>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSelectedFile(index)}
                              className="text-destructive hover:text-destructive/80 ml-2"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Uploaded Images Gallery */}
                {formData.images.length > 0 && (
                  <div className="mt-4">
                    <Label className="mb-2 block">Uploaded Images ({formData.images.length})</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {formData.images.map((url, index) => (
                        <div key={index} className="relative group aspect-video bg-muted rounded-lg overflow-hidden border-2 border-border">
                          <img
                            src={url}
                            alt={`Property ${index + 1}`}
                            className="w-full h-full object-contain bg-muted"
                            onError={(e) => {
                              console.error('Image failed to load:', url);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div style={{ display: 'none' }} className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs p-2 text-center">
                            <div>
                              <AlertCircle className="w-6 h-6 mx-auto mb-1 opacity-50" />
                              Failed to load
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-destructive text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-destructive/90"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="truncate">Image {index + 1}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="videoTourUrl">Video Tour URL (Optional)</Label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="videoTourUrl"
                    name="videoTourUrl"
                    value={formData.videoTourUrl}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="https://youtu.be/abc123"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm sm:text-base">Property Brochure (Optional)</Label>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  Upload a PDF brochure (max 20MB)
                </p>
                
                <div className="space-y-4">
                  {/* File Input */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      id="brochureUpload"
                      type="file"
                      accept="application/pdf"
                      onChange={handleBrochureSelect}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleUploadBrochure}
                      disabled={!selectedBrochure || uploadingBrochure}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingBrochure ? 'Uploading...' : 'Upload PDF'}
                    </Button>
                  </div>

                  {/* Selected File Preview */}
                  {selectedBrochure && (
                    <div className="bg-accent/50 border border-border rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                          <span className="text-red-600 text-xs font-bold">PDF</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{selectedBrochure.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedBrochure.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedBrochure(null);
                          const fileInput = document.getElementById('brochureUpload');
                          if (fileInput) fileInput.value = '';
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {/* Uploaded Brochure */}
                  {formData.brochureUrl && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900 dark:text-green-100">Brochure Uploaded</p>
                          <a 
                            href={formData.brochureUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-green-700 dark:text-green-400 hover:underline"
                          >
                            View PDF
                          </a>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeBrochure}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 px-3 sm:px-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/dashboard')}
              className="w-full sm:flex-1 h-11 sm:h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 h-11 sm:h-10"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm sm:text-base">Creating Listing...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Create Property Listing</span>
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;
