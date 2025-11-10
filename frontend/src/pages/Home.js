import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import SEO from '../components/SEO';
import { 
  Search, 
  MapPin, 
  ArrowRight,
  Star,
  Shield, 
  TrendingUp, 
  Users,
  Award,
  Building2,
  Home as HomeIcon,
  Heart,
  CheckCircle2,
  Sparkles,
  Phone,
  Mail,
  ChevronRight,
  Bed,
  Bath,
  Square
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: <Search className="w-7 h-7" />,
      title: "Smart Search",
      description: "AI-powered property search tailored to your unique preferences and budget."
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "100% Verified",
      description: "Every property verified for authenticity and legal compliance."
    },
    {
      icon: <TrendingUp className="w-7 h-7" />,
      title: "Market Insights",
      description: "Real-time analytics and predictions for informed investment decisions."
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: "Expert Support",
      description: "Dedicated professionals guiding you at every step of your journey."
    }
  ];

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      setLoadingProperties(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/properties/featured?limit=6`);
      const data = await response.json();
      
      if (response.ok) {
        setFeaturedProperties(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching featured properties:', error);
    } finally {
      setLoadingProperties(false);
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

  const stats = [
    { number: "500+", label: "Premium Properties", icon: <Building2 className="w-10 h-10" /> },
    { number: "1200+", label: "Happy Families", icon: <Heart className="w-10 h-10" /> },
    { number: "15+", label: "Years Excellence", icon: <Award className="w-10 h-10" /> },
    { number: "98%", label: "Satisfaction Rate", icon: <Star className="w-10 h-10" /> }
  ];

  // Structured data for home page
  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Yug Properties",
    "url": "https://yugproperties.co.in",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://yugproperties.co.in/properties?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Yug Properties - Premium Real Estate in Mumbai | Buy, Sell & Rent Properties in Virar, Vasai, Nallasopara"
        description="Discover premium residential and commercial properties across Mumbai. Expert real estate services in Virar, Vasai, Nallasopara. Find 1BHK, 2BHK, 3BHK flats, villas, plots. ✓ Verified Listings ✓ Best Prices ✓ Trusted Consultants. Call +91-8805117788"
        keywords="real estate Mumbai, properties in Virar, flats in Mumbai, villas in Vasai, property for sale Mumbai, property for rent Mumbai, 1BHK Mumbai, 2BHK Mumbai, 3BHK Mumbai, real estate Nallasopara, property dealers Mumbai, buy property Mumbai, commercial property Mumbai, residential flats Mumbai, luxury villas Mumbai, affordable flats Mumbai, property consultants Mumbai, Yug Properties Virar"
        image="/og-image.jpg"
        schema={homeSchema}
      />
      
      {/* Hero Section - Premium & Modern */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background with Gradient Overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop"
            alt="Luxury Property"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-primary/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-20">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-md px-6 py-2 text-sm">
                <Sparkles className="w-4 h-4 inline mr-2" />
                Premium Real Estate in Virar
              </Badge>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
            >
              Your Dream Home
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                Awaits You
              </span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto font-light"
            >
              Discover exceptional properties curated for discerning tastes.
              Where luxury meets comfort, and dreams become addresses.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-full shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105">
                  Explore Properties
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="tel:8805117788">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-foreground px-8 py-6 text-lg rounded-full backdrop-blur-sm bg-white/10 transition-all duration-300"
                >
                  <Phone className="mr-2 w-5 h-5" />
                  Schedule a Tour
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-2">
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-white/70 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section - Elegant Design */}
      <section className="py-20 -mt-32 relative z-20">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center hover:shadow-2xl transition-all duration-300 border-0 bg-card/95 backdrop-blur-sm hover:scale-105">
                  <CardContent className="pt-8 pb-6">
                    <div className="flex justify-center mb-4 text-primary">
                      {stat.icon}
                    </div>
                    <h3 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {stat.number}
                    </h3>
                    <p className="text-muted-foreground font-medium">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section - Modern Grid */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Why Choose Yug Properties
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Excellence in Every Detail
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience real estate redefined with our commitment to quality, transparency, and your satisfaction
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-border hover:border-primary/50 bg-card h-full">
                  <CardHeader>
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-2xl mb-3">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Properties - Premium Showcase */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              Handpicked for You
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Featured Properties
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Recently added premium properties that blend luxury, comfort, and exceptional value
            </p>
          </motion.div>

          {loadingProperties ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading featured properties...</p>
            </div>
          ) : featuredProperties.length === 0 ? (
            <div className="text-center py-12">
              <HomeIcon className="w-16 h-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <p className="text-xl text-muted-foreground">No featured properties available at the moment</p>
              <p className="text-sm text-muted-foreground mt-2">Check back soon for new listings!</p>
            </div>
          ) : (
            <>
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {featuredProperties.map((property) => (
                  <motion.div key={property.id} variants={fadeInUp}>
                    <Card 
                      className="overflow-hidden hover:shadow-2xl transition-all duration-500 group border-0 bg-card cursor-pointer"
                      onClick={() => navigate(`/properties/${property.id}`)}
                    >
                      <div className="relative overflow-hidden aspect-[4/3]">
                        {property.images && property.images.length > 0 ? (
                          <img 
                            src={property.images[0]} 
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/600x400?text=Property+Image';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <HomeIcon className="w-16 h-16 text-muted-foreground opacity-30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Badge className="absolute top-4 left-4 bg-primary text-white border-0 shadow-lg">
                          Featured
                        </Badge>
                        <Badge className={`absolute top-4 right-4 border-0 shadow-lg ${
                          property.status === 'available' ? 'bg-green-500 text-white' :
                          property.status === 'sold' ? 'bg-red-500 text-white' :
                          'bg-yellow-500 text-white'
                        }`}>
                          {property.status}
                        </Badge>
                      </div>
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                            {property.title}
                          </CardTitle>
                        </div>
                        <div className="flex items-center text-muted-foreground mb-4">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <CardDescription className="line-clamp-1">
                            {property.city}, {property.state}
                          </CardDescription>
                        </div>
                        <div className="text-3xl font-bold text-primary">
                          {formatPrice(property.price)}
                          {property.listing_type === 'rent' && <span className="text-sm text-muted-foreground">/month</span>}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-4 mb-4">
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            <span>{property.bedrooms || 'N/A'} Beds</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            <span>{property.bathrooms || 'N/A'} Baths</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Square className="w-4 h-4" />
                            <span>{property.area_sqft || 'N/A'} sqft</span>
                          </div>
                        </div>
                        <Button className="w-full group/btn rounded-full" variant="outline">
                          View Details 
                          <ChevronRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="text-center mt-12"
              >
                <Link to="/properties">
                  <Button size="lg" className="rounded-full px-8">
                    View All Properties 
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section - Premium Call-to-Action */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary">
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1920&h=1080&fit=crop")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 inline mr-2" />
              Start Your Journey Today
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Ready to Find Your
              <br />Perfect Home?
            </h2>
            <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
              Join thousands of satisfied families who transformed their dreams into reality with Yug Properties
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-2xl px-8 py-6 text-lg font-semibold rounded-full hover:scale-105 transition-all">
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="tel:8805117788">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm px-8 py-6 text-lg font-semibold rounded-full hover:scale-105 transition-all"
                >
                  <Phone className="mr-2 w-5 h-5" />
                  Talk to an Expert
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Premium & Organized */}
      <footer className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center space-x-3 mb-6 group">
                {/* Logo Image */}
                <img 
                  src="/logo.png" 
                  alt="Yug Properties Logo" 
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-[#FFA500] to-[#FF8C00] bg-clip-text text-transparent block">
                    Yug Properties
                  </span>
                </div>
              </Link>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Your trusted partner in discovering exceptional properties across Virar and beyond. Where dreams meet reality.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-6 text-foreground">Explore</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" />About Us</Link></li>
                <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" />Properties</Link></li>
                <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" />Services</Link></li>
                <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" />Blog</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-bold text-lg mb-6 text-foreground">Resources</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" />Help Center</Link></li>
                <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" />FAQs</Link></li>
                <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" />Privacy Policy</Link></li>
                <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" />Terms of Service</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold text-lg mb-6 text-foreground">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-muted-foreground">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span>Virar West, Mumbai<br />Maharashtra 401303</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <a href="mailto:subhash@yugproperties.co.in">subhash@yugproperties.co.in</a>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                  <a href="tel:8805117788">+91 88051 17788</a>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                  <a href="tel:7875117788">+91 78751 17788</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-muted-foreground text-sm text-center md:text-left">
                © 2025 Yug Properties. All rights reserved. Crafted with <Heart className="w-4 h-4 inline text-red-500 fill-red-500" /> by{' '}
                <a 
                  href="https://www.linkedin.com/company/the-xdevs/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  The xDEVS Co
                </a>.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Terms</Link>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Sitemap</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
