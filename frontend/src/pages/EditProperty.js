import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Badge } from '../components/ui/Badge';
import LoadingScreen from '../components/LoadingScreen';
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
  AlertCircle,
  CheckCircle,
  ArrowLeft
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

const EditProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.yugproperties.co.in/api/properties/${id}`);
      const data = await response.json();

      if (response.ok && data.property) {
        const property = data.property;
        setFormData({
          title: property.title || '',
          description: property.description || '',
          propertyType: property.property_type || 'Apartment',
          listingType: property.listing_type || 'Sale',
          status: property.status || 'available',
          price: property.price || '',
          availableFrom: property.available_from ? property.available_from.split('T')[0] : '',
          address: property.address || '',
          city: property.city || '',
          state: property.state || '',
          pincode: property.pincode || '',
          latitude: property.latitude || '',
          longitude: property.longitude || '',
          googleMapsLink: property.google_maps_link || '',
          areaSqft: property.area_sqft || '',
          bedrooms: property.bedrooms || '',
          bathrooms: property.bathrooms || '',
          balconies: property.balconies || '',
          floorNumber: property.floor_number || '',
          totalFloors: property.total_floors || '',
          furnishing: property.furnishing || 'Unfurnished',
          ageOfProperty: property.age_of_property || '',
          facingDirection: property.facing_direction || '',
          ownershipType: property.ownership_type || 'Freehold',
          amenities: Array.isArray(property.amenities) ? property.amenities : [],
          images: Array.isArray(property.images) ? property.images : [],
          videoTourUrl: property.video_tour_url || '',
          brochureUrl: property.brochure_url || '',
          contactName: property.contact_name || '',
          contactPhone: property.contact_phone || '',
          contactEmail: property.contact_email || '',
          isFeatured: property.is_featured || false
        });
      } else {
        setError('Failed to load property details');
      }
    } catch (err) {
      console.error('Error fetching property:', err);
      setError('Error loading property details');
    } finally {
      setLoading(false);
    }
  };

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
      const response = await fetch('https://api.yugproperties.co.in/api/properties/upload-images', {
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
      } else {
        setError(data.message || 'Failed to upload images');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Error uploading images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleBrochureSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed for brochures');
        e.target.value = '';
        return;
      }
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
      const response = await fetch('https://api.yugproperties.co.in/api/properties/upload-brochure', {
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
      
      const response = await fetch('https://api.yugproperties.co.in/api/properties/delete-brochure', {
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
    setError('');
    setSuccess(false);
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://api.yugproperties.co.in/api/properties/${id}`, {
        method: 'PUT',
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
        }, 1500);
      } else {
        setError(data.message || 'Failed to update property');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Error updating property. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading property details..." />;
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
              <h1 className="text-3xl font-bold">Edit Property</h1>
              <p className="text-muted-foreground">Update property details</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-green-800 font-medium">Property updated successfully!</p>
              <p className="text-sm text-green-700">Redirecting to dashboard...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="w-5 h-5 text-orange-600" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Spacious 3BHK Apartment in Bandra"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe the property, its features, location advantages, etc."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="propertyType">Property Type *</Label>
                  <select
                    id="propertyType"
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Plot">Plot</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Office Space">Office Space</option>
                    <option value="Shop">Shop</option>
                    <option value="Warehouse">Warehouse</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="listingType">Listing Type *</Label>
                  <select
                    id="listingType"
                    name="listingType"
                    value={formData.listingType}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    <option value="Sale">For Sale</option>
                    <option value="Rent">For Rent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="e.g., 5000000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented</option>
                    <option value="pending">Pending</option>
                  </select>
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

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isFeatured" className="font-normal cursor-pointer">
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
                <span>Location Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g., Flat 502, Sea View Apartments, Carter Road"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div>
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g., 400050"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="googleMapsLink">Google Maps Link (Optional)</Label>
                <Input
                  id="googleMapsLink"
                  name="googleMapsLink"
                  value={formData.googleMapsLink}
                  onChange={handleChange}
                  placeholder="https://maps.app.goo.gl/xxxxx"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Coordinates will be automatically extracted if provided
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude (Optional)</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="e.g., 19.0760"
                  />
                </div>

                <div>
                  <Label htmlFor="longitude">Longitude (Optional)</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="e.g., 72.8777"
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
                <span>Property Specifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="areaSqft">Area (sq ft) *</Label>
                  <div className="relative">
                    <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="areaSqft"
                      name="areaSqft"
                      type="number"
                      value={formData.areaSqft}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="e.g., 1200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bedrooms">Bedrooms *</Label>
                  <div className="relative">
                    <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                    <Bath className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                    placeholder="e.g., 12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="furnishing">Furnishing Status</Label>
                  <select
                    id="furnishing"
                    name="furnishing"
                    value={formData.furnishing}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="Unfurnished">Unfurnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Fully-Furnished">Fully-Furnished</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="ageOfProperty">Age of Property</Label>
                  <Input
                    id="ageOfProperty"
                    name="ageOfProperty"
                    value={formData.ageOfProperty}
                    onChange={handleChange}
                    placeholder="e.g., 5 years or New Construction"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facingDirection">Facing Direction</Label>
                  <select
                    id="facingDirection"
                    name="facingDirection"
                    value={formData.facingDirection}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select Direction</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="North-East">North-East</option>
                    <option value="North-West">North-West</option>
                    <option value="South-East">South-East</option>
                    <option value="South-West">South-West</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="ownershipType">Ownership Type</Label>
                  <select
                    id="ownershipType"
                    name="ownershipType"
                    value={formData.ownershipType}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="Freehold">Freehold</option>
                    <option value="Leasehold">Leasehold</option>
                    <option value="Co-operative Society">Co-operative Society</option>
                    <option value="Power of Attorney">Power of Attorney</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-orange-600" />
                <span>Amenities</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AMENITIES_LIST.map((amenity) => (
                  <div
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.amenities.includes(amenity)
                        ? 'border-orange-500 bg-orange-500/10 dark:bg-orange-500/20'
                        : 'border-border hover:border-orange-300 dark:hover:border-orange-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border-2 ${
                        formData.amenities.includes(amenity)
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {formData.amenities.includes(amenity) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm text-foreground">{amenity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                <span>Contact Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="md:col-span-2">
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

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-orange-600" />
                <span>Property Images</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload */}
              <div>
                <Label htmlFor="fileUpload">Upload Images</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-orange-400 transition-colors cursor-pointer">
                  <label htmlFor="fileUpload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium text-foreground mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
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
                  </label>
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

              {/* Image Gallery */}
              {formData.images.length > 0 && (
                <div>
                  <Label>Current Images ({formData.images.length})</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
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
                        {index === 0 && (
                          <Badge className="absolute bottom-2 left-2 bg-orange-600 text-white">
                            Main Image
                          </Badge>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="truncate">Image {index + 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Video Tour */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-orange-600" />
                <span>Media</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="videoTourUrl">Video Tour URL (Optional)</Label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/dashboard')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {submitting ? 'Updating...' : 'Update Property'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;
