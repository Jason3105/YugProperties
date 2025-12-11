import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Home, Eye, ArrowLeft, Phone, Mail, Share2, Heart, FileText, Download } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import SEO from '../components/SEO';
import config from '../config';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [mapEmbedUrl, setMapEmbedUrl] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savingProperty, setSavingProperty] = useState(false);
  const viewCountedRef = useRef(false);

  // Generate or retrieve session ID
  const getSessionId = () => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  };

  useEffect(() => {
    // Reset ref when property ID changes
    viewCountedRef.current = false;
  }, [id]);

  useEffect(() => {
    // Only fetch once, even in StrictMode
    if (!viewCountedRef.current) {
      viewCountedRef.current = true;
      fetchPropertyDetails();
      recordPropertyView();
      
      // Check if property is saved (only for logged-in non-admin users)
      if (isAuthenticated && user?.role !== 'admin') {
        checkWishlistStatus();
      }
    }
  }, [id, isAuthenticated, user]);

  const recordPropertyView = async () => {
    try {
      const sessionId = getSessionId();
      const token = localStorage.getItem('token');
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`https://api.yugproperties.co.in/api/properties/${id}/view`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sessionId })
      });
    } catch (error) {
      console.error('Error recording view:', error);
      // Don't show error to user, just log it
    }
  };

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.yugproperties.co.in/api/properties/${id}`);
      const data = await response.json();

      if (response.ok) {
        setProperty(data.property);
        // Fetch map embed URL
        fetchMapEmbedUrl(data.property.google_maps_link, data.property.latitude, data.property.longitude);
      } else {
        console.error('Failed to fetch property:', data.message);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMapEmbedUrl = async (googleMapsLink, latitude, longitude) => {
    try {
      const params = new URLSearchParams();
      if (googleMapsLink) params.append('googleMapsLink', googleMapsLink);
      if (latitude) params.append('latitude', latitude);
      if (longitude) params.append('longitude', longitude);

      const response = await fetch(`https://api.yugproperties.co.in/api/properties/map-embed-url?${params}`);
      const data = await response.json();

      if (response.ok && data.embedUrl) {
        setMapEmbedUrl(data.embedUrl);
      }
    } catch (error) {
      console.error('Error fetching map embed URL:', error);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://api.yugproperties.co.in/api/wishlist/check/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setIsSaved(data.isSaved);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleSaveProperty = async () => {
    // If not authenticated, redirect to signup
    if (!isAuthenticated) {
      navigate('/signup', { state: { from: `/properties/${id}` } });
      return;
    }

    // If admin, show message
    if (user?.role === 'admin') {
      alert('Admins cannot save properties to wishlist');
      return;
    }

    setSavingProperty(true);
    try {
      const token = localStorage.getItem('token');
      
      if (isSaved) {
        // Remove from wishlist
        const response = await fetch(`https://api.yugproperties.co.in/api/wishlist/remove/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setIsSaved(false);
        }
      } else {
        // Add to wishlist
        const response = await fetch(`https://api.yugproperties.co.in/api/wishlist/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ propertyId: id })
        });
        
        if (response.ok) {
          setIsSaved(true);
        }
      }
    } catch (error) {
      console.error('Error saving property:', error);
    } finally {
      setSavingProperty(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    } else {
      return `₹${price.toLocaleString('en-IN')}`;
    }
  };

  // Handle contact agent (phone call) - Touch-friendly implementation
  const handleContactAgent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (property.contact_phone) {
      // Ensure phone number has country code for mobile compatibility
      const phoneNumber = property.contact_phone.startsWith('+') 
        ? property.contact_phone 
        : `+91${property.contact_phone.replace(/\D/g, '')}`;
      
      // Use setTimeout to ensure single execution on mobile
      setTimeout(() => {
        window.location.href = `tel:${phoneNumber}`;
      }, 100);
    } else {
      alert('Contact phone number not available');
    }
  };

  // Handle email inquiry - Touch-friendly implementation
  const handleEmailInquiry = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (property.contact_email) {
      const subject = encodeURIComponent(`Inquiry about ${property.title}`);
      const body = encodeURIComponent(
        `Hi,\n\nI am interested in the property "${property.title}" located at ${property.address}, ${property.city}.\n\nProperty Details:\n- Price: ${formatPrice(property.price)}\n- Type: ${property.property_type}\n- Bedrooms: ${property.bedrooms || 'N/A'}\n\nPlease provide more information.\n\nThank you!`
      );
      
      // Use setTimeout to ensure single execution on mobile
      setTimeout(() => {
        window.location.href = `mailto:${property.contact_email}?subject=${subject}&body=${body}`;
      }, 100);
    } else {
      alert('Contact email not available');
    }
  };

  // Handle share property
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Check out this property: ${property.title} - ${formatPrice(property.price)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Property link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy link');
    });
  };

  if (loading) {
    return <LoadingScreen message="Loading property details..." />;
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Home className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
          <Button onClick={() => navigate('/properties')}>
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  const images = property.images && Array.isArray(property.images) ? property.images : [];

  // Generate SEO-optimized data
  const formatPriceForSEO = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const propertySchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title,
    "description": property.description,
    "url": `${config.SITE_URL}/properties/${property.id}`,
    "image": images.length > 0 ? images : [`${config.SITE_URL}/og-image.png`],
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": "INR",
      "availability": property.status === 'active' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "priceValidUntil": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": property.address || '',
      "addressLocality": property.city,
      "addressRegion": "Maharashtra",
      "postalCode": property.zip_code || '',
      "addressCountry": "IN"
    },
    "numberOfRooms": property.bedrooms,
    "numberOfBathroomsTotal": property.bathrooms,
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": property.area_sqft,
      "unitCode": "FTK"
    },
    ...(property.latitude && property.longitude && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": property.latitude,
        "longitude": property.longitude
      }
    })
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": config.SITE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Properties",
        "item": `${config.SITE_URL}/properties`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": property.title
      }
    ]
  };

  return (
    <>
      <SEO
        title={`${property.title} | ${property.bedrooms}BHK ${property.property_type} in ${property.city} | Yug Properties`}
        description={`${property.bedrooms}BHK ${property.property_type} for ${property.listing_type} in ${property.city}, ${property.area_sqft} sqft at ${formatPriceForSEO(property.price)}. ${property.description?.slice(0, 150) || ''}`}
        keywords={`${property.bedrooms}BHK ${property.city}, ${property.property_type} ${property.city}, property for ${property.listing_type} ${property.city}, ${property.listing_type} flat ${property.city}, real estate ${property.city}`}
        canonical={`${config.SITE_URL}/properties/${property.id}`}
        image={images.length > 0 ? images[0] : undefined}
        type="product"
        schema={[propertySchema, breadcrumbSchema]}
      />
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/properties')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Properties
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery - Modern Pixel-Inspired Design */}
            <Card className="overflow-hidden mb-6 border-2 border-border shadow-2xl">
              {images.length > 0 ? (
                <>
                  {/* Main Image Display */}
                  <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
                    {/* Desktop: Large preview with arrows */}
                    <div className="hidden md:block relative aspect-video">
                      <img
                        src={images[selectedImage]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/800x600?text=Property+Image';
                        }}
                      />
                      
                      {/* Navigation Arrows - Desktop */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={() => setSelectedImage(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-900 dark:text-white p-3 rounded-xl shadow-xl transition-all hover:scale-110 backdrop-blur-sm border border-slate-200 dark:border-slate-700"
                          >
                            <ArrowLeft className="w-6 h-6" />
                          </button>
                          <button
                            onClick={() => setSelectedImage(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-900 dark:text-white p-3 rounded-xl shadow-xl transition-all hover:scale-110 backdrop-blur-sm border border-slate-200 dark:border-slate-700"
                          >
                            <ArrowLeft className="w-6 h-6 rotate-180" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Mobile: Horizontal Scrollable Gallery */}
                    <div className="md:hidden relative">
                      <div 
                        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
                        onScroll={(e) => {
                          const scrollLeft = e.target.scrollLeft;
                          const itemWidth = e.target.offsetWidth;
                          const index = Math.round(scrollLeft / itemWidth);
                          setSelectedImage(index);
                        }}
                      >
                        {images.map((img, index) => (
                          <div
                            key={index}
                            className="flex-shrink-0 w-full aspect-[4/3] snap-center relative"
                          >
                            <img
                              src={img}
                              alt={`${property.title} - Image ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://placehold.co/800x600?text=Property+Image';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* Scroll Indicator Dots - Mobile */}
                      {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 dark:bg-white/10 px-3 py-2 rounded-full backdrop-blur-md">
                          {images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedImage(index)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                selectedImage === index 
                                  ? 'bg-white w-6' 
                                  : 'bg-white/50 hover:bg-white/75'
                              }`}
                              aria-label={`View image ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Status Badge - Pixel Style */}
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                      <Badge className={`
                        px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg border-2
                        ${property.status === 'available' 
                          ? 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600' 
                          : property.status === 'sold' 
                          ? 'bg-rose-500 border-rose-600 text-white hover:bg-rose-600' 
                          : 'bg-amber-500 border-amber-600 text-white hover:bg-amber-600'
                        }
                      `}>
                        {property.status}
                      </Badge>
                    </div>

                    {/* Image Counter - Pixel Style */}
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 bg-black/80 dark:bg-white/20 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold backdrop-blur-md border border-white/20">
                      {selectedImage + 1} / {images.length}
                    </div>
                  </div>
                  
                  {/* Thumbnail Grid - Desktop Only */}
                  {images.length > 1 && (
                    <div className="hidden md:block p-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
                      <div className="grid grid-cols-4 lg:grid-cols-6 gap-3">
                        {images.map((img, index) => (
                          <button
                            key={index}
                            className={`
                              relative aspect-video rounded-lg overflow-hidden cursor-pointer
                              transition-all duration-300 transform hover:scale-105
                              border-3 shadow-md hover:shadow-xl
                              ${selectedImage === index 
                                ? 'border-orange-500 ring-4 ring-orange-300 dark:ring-orange-600 scale-105' 
                                : 'border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700'
                              }
                            `}
                            onClick={() => setSelectedImage(index)}
                          >
                            <img
                              src={img}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://placehold.co/100x100?text=Image';
                              }}
                            />
                            {selectedImage === index && (
                              <div className="absolute inset-0 bg-orange-500/20 dark:bg-orange-400/30" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                  <div className="text-center">
                    <Home className="w-20 h-20 sm:w-24 sm:h-24 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No images available</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Property Title & Info - Pixel Inspired */}
            <Card className="p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-border shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent leading-tight">
                {property.title}
              </h1>
              
              {/* Location */}
              <div className="flex items-start mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                  {property.address}, {property.city}, {property.state} - {property.pincode}
                </span>
              </div>

              {/* Price - Pixel Style */}
              <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 border-2 sm:border-4 border-orange-600 dark:border-orange-500 shadow-xl sm:shadow-2xl">
                <div className="text-xs sm:text-sm font-bold text-orange-100 uppercase tracking-wider mb-1 sm:mb-2">Price</div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white flex items-baseline gap-2">
                  {formatPrice(property.price)}
                  {property.listing_type === 'rent' && (
                    <span className="text-base sm:text-lg lg:text-xl text-orange-100 font-semibold">/month</span>
                  )}
                </div>
              </div>

              {/* Property Features Grid - Pixel Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                  <div className="flex items-center mb-2 sm:mb-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <Bed className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold mb-1">Bedrooms</div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{property.bedrooms || 'N/A'}</div>
                </div>

                <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                  <div className="flex items-center mb-2 sm:mb-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Bath className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold mb-1">Bathrooms</div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{property.bathrooms || 'N/A'}</div>
                </div>

                <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                  <div className="flex items-center mb-2 sm:mb-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <Square className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold mb-1">Area</div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{property.area_sqft || 'N/A'} <span className="text-xs sm:text-sm font-normal">sqft</span></div>
                </div>

                <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                  <div className="flex items-center mb-2 sm:mb-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Home className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold mb-1">Type</div>
                  <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white capitalize">{property.property_type}</div>
                </div>
              </div>

              {/* Description Section */}
              <div className="pt-4 sm:pt-6 border-t-2 border-slate-200 dark:border-slate-700">
                <h3 className="text-xl sm:text-2xl font-black mb-3 sm:mb-4 text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3">
                  <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
                  Description
                </h3>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {property.description || 'No description available.'}
                </p>
              </div>
            </Card>

            {/* Property Details - Pixel Style */}
            <Card className="p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-border shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
              <h3 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3">
                <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
                Property Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 block mb-2 font-bold uppercase tracking-wide">Listing Type:</span>
                  <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white capitalize">{property.listing_type}</span>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 block mb-2 font-bold uppercase tracking-wide">Furnishing:</span>
                  <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white">{property.furnishing || 'N/A'}</span>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 block mb-2 font-bold uppercase tracking-wide">Floor:</span>
                  <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white">{property.floor_number || 'N/A'} of {property.total_floors || 'N/A'}</span>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 block mb-2 font-bold uppercase tracking-wide">Balconies:</span>
                  <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white">{property.balconies || 'N/A'}</span>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 block mb-2 font-bold uppercase tracking-wide">Age:</span>
                  <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white">{property.age_of_property || 'N/A'} years</span>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 block mb-2 font-bold uppercase tracking-wide">Facing:</span>
                  <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white">{property.facing_direction || 'N/A'}</span>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 block mb-2 font-bold uppercase tracking-wide">Ownership:</span>
                  <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white">{property.ownership_type || 'N/A'}</span>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 block mb-2 font-bold uppercase tracking-wide">Available From:</span>
                  <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                    {property.available_from ? new Date(property.available_from).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Amenities - Pixel Style */}
            {property.amenities && property.amenities.length > 0 && (
              <Card className="p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-border shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
                <h3 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3">
                  <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
                  Amenities
                </h3>
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-400 hover:shadow-lg transition-all">
                      <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mr-3 flex-shrink-0 shadow-lg shadow-orange-500/50"></div>
                      <span className="text-sm sm:text-base text-slate-900 dark:text-white font-semibold">{amenity}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Google Maps - Pixel Style */}
            {(mapEmbedUrl || property.google_maps_link) && (
              <Card className="p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-border shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
                <h3 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 flex items-center text-slate-900 dark:text-white gap-2 sm:gap-3">
                  <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                  Location on Map
                </h3>
                {mapEmbedUrl ? (
                  <div className="relative w-full pb-[75%] sm:pb-[56.25%] md:pb-[400px] rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-lg bg-muted">
                    <iframe
                      src={mapEmbedUrl}
                      className="absolute top-0 left-0 w-full h-full"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      title="Property Location"
                    />
                  </div>
                ) : (
                  <div className="relative w-full pb-[75%] sm:pb-[56.25%] md:pb-[400px] rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-lg bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground text-sm sm:text-base font-semibold">Loading map...</p>
                  </div>
                )}
                {property.google_maps_link && (
                  <Button
                    className="w-full mt-4 text-sm sm:text-base h-10 sm:h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-2 border-orange-600 dark:border-orange-500 font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    onClick={() => window.open(property.google_maps_link, '_blank')}
                  >
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Open in Google Maps
                  </Button>
                )}
              </Card>
            )}

            {/* Video Tour - Pixel Style */}
            {property.video_tour_url && (
              <Card className="p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-border shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
                <h3 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3">
                  <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
                  Video Tour
                </h3>
                <div className="relative w-full pb-[56.25%] rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-lg bg-gray-900">
                  <iframe
                    src={(() => {
                      const url = property.video_tour_url;
                      // Handle YouTube URLs (including Shorts)
                      if (url.includes('youtube.com/watch')) {
                        const videoId = url.split('v=')[1]?.split('&')[0];
                        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
                      } else if (url.includes('youtu.be/')) {
                        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
                        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
                      } else if (url.includes('youtube.com/shorts/')) {
                        // Handle YouTube Shorts - convert to regular embed
                        const videoId = url.split('shorts/')[1]?.split('?')[0];
                        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
                      } else if (url.includes('youtube.com/embed/')) {
                        return url;
                      }
                      return url;
                    })()}
                    className="absolute top-0 left-0 w-full h-full"
                    style={{ border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Property Video Tour"
                  />
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Contact Card - Pixel Inspired */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 sm:p-8 border-2 border-border shadow-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 sticky top-24">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-200 dark:border-orange-800 mb-4">
                  <div className="w-2 h-2 bg-orange-600 dark:bg-orange-400 rounded-full animate-pulse" />
                  <span className="text-sm font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wide">Available Now</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
                  Interested in this property?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Get in touch with our expert team
                </p>
              </div>
              
              {property.contact_name && (
                <div className="mb-6 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold mb-1">
                    Contact Person
                  </p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{property.contact_name}</p>
                </div>
              )}
              
              <div className="space-y-3">
                <Button 
                  onClick={handleContactAgent}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 dark:from-orange-600 dark:to-orange-700 text-white font-bold py-6 text-base shadow-xl hover:shadow-2xl border-2 border-orange-600 dark:border-orange-500 transition-all hover:scale-105"
                  disabled={!property.contact_phone}
                >
                  <Phone className="w-5 h-5 mr-3" />
                  <span className="truncate">{property.contact_phone ? `Call ${property.contact_phone}` : 'Contact Agent'}</span>
                </Button>
                
                <Button 
                  onClick={handleEmailInquiry}
                  variant="outline" 
                  className="w-full py-6 text-base font-bold border-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-105"
                  disabled={!property.contact_email}
                >
                  <Mail className="w-5 h-5 mr-3" />
                  {property.contact_email ? 'Email Inquiry' : 'Email Not Available'}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t-2 border-slate-200 dark:border-slate-700">
                <Button 
                  onClick={handleShare} 
                  variant="outline" 
                  className="text-sm font-bold py-5 border-2 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 transition-all"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  <span>Share</span>
                </Button>
                <Button 
                  onClick={handleSaveProperty} 
                  variant={isSaved ? "default" : "outline"} 
                  disabled={savingProperty}
                  className={`text-sm font-bold py-5 border-2 transition-all hover:scale-105 ${
                    isSaved 
                      ? "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white border-rose-600" 
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{savingProperty ? 'Saving...' : isSaved ? 'Saved' : 'Save'}</span>
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t-2 border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold mb-1">Property Views</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{property.views || 0}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700">
                    <Eye className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Property Brochure Card - Pixel Style */}
            {property.brochure_url && (
              <Card className="p-6 border-2 border-border shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
                <h3 className="text-xl font-black mb-4 text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Property Brochure
                </h3>
                
                <div className="space-y-3">
                  <Button
                    onClick={() => window.open(property.brochure_url, '_blank')}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-5 border-2 border-blue-600 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    View Brochure
                  </Button>
                  <Button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = property.brochure_url;
                      link.download = `${property.title.replace(/\s+/g, '_')}_Brochure.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      variant="outline"
                      className="w-full py-5 font-bold border-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-105"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download PDF
                    </Button>
                </div>

                {/* PDF Embed Preview */}
                <div className="mt-4 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-lg">
                  <iframe
                    src={`${property.brochure_url}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-[300px] sm:h-[400px] bg-white dark:bg-slate-800"
                    title="Property Brochure Preview"
                    style={{ display: 'block' }}
                  />
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-3">
                  Click "View Brochure" for full-screen experience
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default PropertyDetails;
