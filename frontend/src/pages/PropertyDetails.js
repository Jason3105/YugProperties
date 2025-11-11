import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Home, Eye, ArrowLeft, Phone, Mail, Share2, Heart, FileText, Download } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

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

  // Handle contact agent (phone call)
  const handleContactAgent = () => {
    if (property.contact_phone) {
      // Ensure phone number has country code for mobile compatibility
      const phoneNumber = property.contact_phone.startsWith('+') 
        ? property.contact_phone 
        : `+91${property.contact_phone.replace(/\D/g, '')}`;
      window.location.href = `tel:${phoneNumber}`;
    } else {
      alert('Contact phone number not available');
    }
  };

  // Handle email inquiry
  const handleEmailInquiry = () => {
    if (property.contact_email) {
      const subject = encodeURIComponent(`Inquiry about ${property.title}`);
      const body = encodeURIComponent(
        `Hi,\n\nI am interested in the property "${property.title}" located at ${property.address}, ${property.city}.\n\nProperty Details:\n- Price: ${formatPrice(property.price)}\n- Type: ${property.property_type}\n- Bedrooms: ${property.bedrooms || 'N/A'}\n\nPlease provide more information.\n\nThank you!`
      );
      window.location.href = `mailto:${property.contact_email}?subject=${subject}&body=${body}`;
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

  return (
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
            {/* Image Gallery */}
            <Card className="overflow-hidden mb-6">
              {images.length > 0 ? (
                <>
                  <div className="relative bg-black aspect-video md:aspect-[16/10]">
                    <img
                      src={images[selectedImage]}
                      alt={property.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/800x600?text=Property+Image';
                      }}
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className={
                        property.status === 'available' ? 'bg-green-500' :
                        property.status === 'sold' ? 'bg-red-500' : 'bg-yellow-500'
                      }>
                        {property.status}
                      </Badge>
                    </div>

                    {/* Navigation Arrows for Mobile */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImage(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors md:hidden"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setSelectedImage(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors md:hidden"
                        >
                          <ArrowLeft className="w-5 h-5 rotate-180" />
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImage + 1} / {images.length}
                    </div>
                  </div>
                  
                  {/* Thumbnail Gallery - Desktop */}
                  {images.length > 1 && (
                    <div className="hidden md:grid grid-cols-6 gap-2 p-4">
                      {images.map((img, index) => (
                        <div
                          key={index}
                          className={`relative aspect-video rounded overflow-hidden cursor-pointer border-2 transition-all ${
                            selectedImage === index ? 'border-orange-600 ring-2 ring-orange-300' : 'border-transparent hover:border-gray-300'
                          }`}
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
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Thumbnail Slider - Mobile */}
                  {images.length > 1 && (
                    <div className="md:hidden p-4">
                      <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
                        {images.map((img, index) => (
                          <div
                            key={index}
                            className={`relative flex-shrink-0 w-20 aspect-video rounded overflow-hidden cursor-pointer border-2 snap-start transition-all ${
                              selectedImage === index ? 'border-orange-600 ring-2 ring-orange-300' : 'border-transparent'
                            }`}
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
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-video md:aspect-[16/10] flex items-center justify-center bg-gray-100">
                  <Home className="w-24 h-24 text-gray-300" />
                </div>
              )}
            </Card>

            {/* Property Description */}
            <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-foreground">{property.title}</h1>
              
              <div className="flex items-start text-muted-foreground mb-3 sm:mb-4">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base">{property.address}, {property.city}, {property.state} - {property.pincode}</span>
              </div>

              <div className="text-3xl sm:text-4xl font-bold text-orange-600 mb-4 sm:mb-6">
                {formatPrice(property.price)}
                {property.listing_type === 'rent' && <span className="text-base sm:text-lg text-muted-foreground">/month</span>}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-border">
                <div className="flex items-start">
                  <Bed className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Bedrooms</div>
                    <div className="font-semibold text-sm sm:text-base text-foreground">{property.bedrooms || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Bath className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Bathrooms</div>
                    <div className="font-semibold text-sm sm:text-base text-foreground">{property.bathrooms || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Square className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Area</div>
                    <div className="font-semibold text-sm sm:text-base text-foreground">{property.area_sqft || 'N/A'} sqft</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Type</div>
                    <div className="font-semibold text-sm sm:text-base text-foreground">{property.property_type}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-foreground">Description</h3>
                <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-line leading-relaxed">
                  {property.description || 'No description available.'}
                </p>
              </div>
            </Card>

            {/* Property Details */}
            <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-foreground">Property Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="py-2 border-b sm:border-b-0 border-border">
                  <span className="text-xs sm:text-sm text-muted-foreground block mb-1">Listing Type:</span>
                  <span className="font-semibold text-sm sm:text-base text-foreground capitalize">{property.listing_type}</span>
                </div>
                <div className="py-2 border-b sm:border-b-0 border-border">
                  <span className="text-xs sm:text-sm text-muted-foreground block mb-1">Furnishing:</span>
                  <span className="font-semibold text-sm sm:text-base text-foreground">{property.furnishing || 'N/A'}</span>
                </div>
                <div className="py-2 border-b sm:border-b-0 border-border">
                  <span className="text-xs sm:text-sm text-muted-foreground block mb-1">Floor:</span>
                  <span className="font-semibold text-sm sm:text-base text-foreground">{property.floor_number || 'N/A'} of {property.total_floors || 'N/A'}</span>
                </div>
                <div className="py-2 border-b sm:border-b-0 border-border">
                  <span className="text-xs sm:text-sm text-muted-foreground block mb-1">Balconies:</span>
                  <span className="font-semibold text-sm sm:text-base text-foreground">{property.balconies || 'N/A'}</span>
                </div>
                <div className="py-2 border-b sm:border-b-0 border-border">
                  <span className="text-xs sm:text-sm text-muted-foreground block mb-1">Age:</span>
                  <span className="font-semibold text-sm sm:text-base text-foreground">{property.age_of_property || 'N/A'} years</span>
                </div>
                <div className="py-2 border-b sm:border-b-0 border-border">
                  <span className="text-xs sm:text-sm text-muted-foreground block mb-1">Facing:</span>
                  <span className="font-semibold text-sm sm:text-base text-foreground">{property.facing_direction || 'N/A'}</span>
                </div>
                <div className="py-2 border-b sm:border-b-0 border-border">
                  <span className="text-xs sm:text-sm text-muted-foreground block mb-1">Ownership:</span>
                  <span className="font-semibold text-sm sm:text-base text-foreground">{property.ownership_type || 'N/A'}</span>
                </div>
                <div className="py-2">
                  <span className="text-xs sm:text-sm text-muted-foreground block mb-1">Available From:</span>
                  <span className="font-semibold text-sm sm:text-base text-foreground">
                    {property.available_from ? new Date(property.available_from).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-foreground">Amenities</h3>
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center py-1">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="text-sm sm:text-base text-foreground">{amenity}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Google Maps */}
            {(mapEmbedUrl || property.google_maps_link) && (
              <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center text-foreground">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-600" />
                  Location on Map
                </h3>
                {mapEmbedUrl ? (
                  <div className="relative w-full pb-[75%] sm:pb-[56.25%] md:pb-[400px] rounded-lg overflow-hidden bg-muted">
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
                  <div className="relative w-full pb-[75%] sm:pb-[56.25%] md:pb-[400px] rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground text-sm sm:text-base">Loading map...</p>
                  </div>
                )}
                {property.google_maps_link && (
                  <Button
                    variant="outline"
                    className="w-full mt-3 sm:mt-4 text-sm sm:text-base h-9 sm:h-10"
                    onClick={() => window.open(property.google_maps_link, '_blank')}
                  >
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                    Open in Google Maps
                  </Button>
                )}
              </Card>
            )}

            {/* Video Tour */}
            {property.video_tour_url && (
              <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-foreground">Video Tour</h3>
                <div className="relative w-full pb-[56.25%] rounded-lg overflow-hidden bg-gray-900">
                  <iframe
                    src={(() => {
                      const url = property.video_tour_url;
                      // Handle YouTube URLs
                      if (url.includes('youtube.com/watch')) {
                        const videoId = url.split('v=')[1]?.split('&')[0];
                        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
                      } else if (url.includes('youtu.be/')) {
                        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
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

          {/* Right Column - Contact Card */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-foreground">Interested in this property?</h3>
              
              {property.contact_name && (
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  Contact: <span className="font-medium text-foreground">{property.contact_name}</span>
                </p>
              )}
              
              <Button 
                onClick={handleContactAgent}
                className="w-full bg-orange-600 hover:bg-orange-700 mb-2 sm:mb-3 h-10 sm:h-auto text-sm sm:text-base"
                disabled={!property.contact_phone}
              >
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                <span className="truncate">{property.contact_phone ? `Call ${property.contact_phone}` : 'Contact Agent'}</span>
              </Button>
              
              <Button 
                onClick={handleEmailInquiry}
                variant="outline" 
                className="w-full mb-3 sm:mb-4 h-10 sm:h-auto text-sm sm:text-base"
                disabled={!property.contact_email}
              >
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                {property.contact_email ? 'Email Inquiry' : 'Email Not Available'}
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleShare} 
                  variant="outline" 
                  className="text-sm h-10 px-3 sm:px-4"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  <span>Share</span>
                </Button>
                <Button 
                  onClick={handleSaveProperty} 
                  variant={isSaved ? "default" : "outline"} 
                  disabled={savingProperty}
                  className={`text-sm h-10 px-3 sm:px-4 ${isSaved ? "bg-red-500 hover:bg-red-600 text-white" : ""}`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{savingProperty ? 'Saving...' : isSaved ? 'Saved' : 'Save'}</span>
                </Button>
              </div>

              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
                <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base text-foreground">Property Views</h4>
                <div className="flex items-center text-muted-foreground">
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  <span className="text-sm sm:text-base">{property.views || 0} views</span>
                </div>
              </div>
            </Card>

            {/* Property Brochure Card */}
            {property.brochure_url && (
              <Card className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Property Brochure
                </h3>
                
                <div className="space-y-3">
                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      onClick={() => window.open(property.brochure_url, '_blank')}
                      className="w-full bg-orange-600 hover:bg-orange-700 h-10 text-sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
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
                      className="w-full h-10 text-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>

                  {/* PDF Embed Preview */}
                  <div className="mt-4 rounded-lg overflow-hidden border border-border bg-muted">
                    <iframe
                      src={`${property.brochure_url}#toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-white"
                      title="Property Brochure Preview"
                      style={{ display: 'block' }}
                    />
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Click "View Brochure" for full-screen experience
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
