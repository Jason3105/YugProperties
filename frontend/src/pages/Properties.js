import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, Bed, Bath, Square, Filter, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import LoadingScreen from '../components/LoadingScreen';

const Properties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    propertyType: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    status: 'available'
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.propertyType) queryParams.append('propertyType', filters.propertyType);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.bedrooms) queryParams.append('bedrooms', filters.bedrooms);
      if (filters.status) queryParams.append('status', filters.status);

      const response = await fetch(`https://api.yugproperties.co.in/api/properties?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setProperties(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    fetchProperties();
  };

  const clearFilters = () => {
    setFilters({
      propertyType: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      status: 'available'
    });
    setSearchTerm('');
  };

  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    } else {
      return `₹${price.toLocaleString('en-IN')}`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8 sm:py-12 md:py-16 pt-16 sm:pt-20">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 text-center">
            Find Your Dream Property
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-center mb-6 sm:mb-8 opacity-90">
            Explore our curated collection of premium properties
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                  type="text"
                  placeholder="Search by location, property name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 h-12 sm:h-14 text-base sm:text-lg bg-white text-gray-900"
                />
              </div>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 sm:h-14 px-4 sm:px-6 bg-white text-orange-600 hover:bg-gray-100 w-full sm:w-auto text-sm sm:text-base"
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-card dark:bg-card border-b dark:border-border shadow-sm">
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {/* Property Type */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-foreground">Property Type</label>
                <select
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:border-border dark:bg-background dark:text-foreground"
                >
                  <option value="">All Types</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="House">House</option>
                  <option value="Plot">Plot</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-foreground">City</label>
                <Input
                  type="text"
                  placeholder="Enter city"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="h-9 sm:h-10 text-sm sm:text-base bg-background text-foreground"
                />
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-foreground">Min Price</label>
                <Input
                  type="number"
                  placeholder="₹ Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="h-9 sm:h-10 text-sm sm:text-base bg-background text-foreground"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-foreground">Max Price</label>
                <Input
                  type="number"
                  placeholder="₹ Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="h-9 sm:h-10 text-sm sm:text-base bg-background text-foreground"
                />
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-foreground">Bedrooms</label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:border-border dark:bg-background dark:text-foreground"
                >
                  <option value="">Any</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4+ BHK</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-foreground">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:border-border dark:bg-background dark:text-foreground"
                >
                  <option value="">All</option>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
              <Button 
                onClick={handleSearch} 
                className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto h-10 sm:h-auto text-sm sm:text-base"
              >
                Apply Filters
              </Button>
              <Button 
                onClick={clearFilters} 
                variant="outline"
                className="w-full sm:w-auto h-10 sm:h-auto text-sm sm:text-base"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'} Found
          </h2>
        </div>

        {loading ? (
          <LoadingScreen message="Loading properties..." />
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <Home className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground opacity-50 mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">No Properties Found</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Try adjusting your filters or search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {filteredProperties.map((property) => (
              <Card 
                key={property.id} 
                className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group" 
                onClick={() => navigate(`/properties/${property.id}`)}
              >
                {/* Property Image */}
                <div className="relative h-44 sm:h-48 md:h-52 bg-muted overflow-hidden">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/600x400?text=Property+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Home className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground opacity-30" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold shadow-md ${
                      property.status === 'available' ? 'bg-green-500 text-white' :
                      property.status === 'sold' ? 'bg-red-500 text-white' :
                      'bg-yellow-500 text-white'
                    }`}>
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </span>
                  </div>

                  {/* Listing Type Badge */}
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-orange-600 text-white shadow-md">
                      {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
                    </span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-3 sm:p-4 md:p-5 bg-card">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1.5 sm:mb-2 line-clamp-1 text-foreground">{property.title}</h3>
                  
                  <div className="flex items-center text-muted-foreground mb-2 sm:mb-3">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                    <span className="text-xs sm:text-sm line-clamp-1">{property.city}, {property.state}</span>
                  </div>

                  <div className="text-lg sm:text-xl font-bold text-orange-600 mb-3 sm:mb-4">
                    {formatPrice(property.price)}
                    {property.listing_type === 'rent' && <span className="text-xs sm:text-sm text-muted-foreground">/month</span>}
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4 text-xs sm:text-sm text-foreground">
                    <div className="flex items-center">
                      <Bed className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{property.bedrooms} Beds</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{property.bathrooms} Baths</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{property.area_sqft} sqft</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-orange-600 hover:bg-orange-700 h-9 sm:h-10 text-xs sm:text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/properties/${property.id}`);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
