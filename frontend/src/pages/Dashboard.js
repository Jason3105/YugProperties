import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  Home, 
  Heart, 
  MapPin, 
  IndianRupee, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  TrendingUp,
  Eye,
  MessageSquare,
  Settings
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [propertiesRes, favoritesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/properties'),
        axios.get('http://localhost:5000/api/favorites', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);
      setProperties(propertiesRes.data.slice(0, 6));
      setFavorites(favoritesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      icon: Eye, 
      label: 'Properties Viewed', 
      value: '24', 
      change: '+12%',
      trend: 'up',
      color: 'bg-blue-500'
    },
    { 
      icon: Heart, 
      label: 'Saved Favorites', 
      value: favorites.length.toString(), 
      change: '+3',
      trend: 'up',
      color: 'bg-pink-500'
    },
    { 
      icon: MessageSquare, 
      label: 'Messages', 
      value: '8', 
      change: '2 new',
      trend: 'up',
      color: 'bg-green-500'
    },
    { 
      icon: TrendingUp, 
      label: 'Market Alerts', 
      value: '5', 
      change: 'Active',
      trend: 'neutral',
      color: 'bg-orange-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening with your property search
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-2xl font-bold">{stat.value}</h3>
                      <Badge variant={stat.trend === 'up' ? 'default' : 'secondary'} className="text-xs">
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Recently Viewed Properties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {properties.map((property, index) => (
                    <div key={property.id} className="group border rounded-lg overflow-hidden hover:shadow-md transition-all">
                      <div className="relative h-48 bg-muted overflow-hidden">
                        <img
                          src={`https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300`}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <Badge className="absolute top-2 right-2">{property.type || 'For Sale'}</Badge>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-1">{property.title}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{property.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 font-bold text-primary">
                            <IndianRupee className="w-4 h-4" />
                            <span>{parseInt(property.price).toLocaleString('en-IN')}</span>
                          </div>
                          <Button size="sm" variant="ghost"><Heart className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {properties.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Home className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No properties viewed yet. Start exploring!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Home, label: 'Browse Properties', color: 'bg-blue-500' },
                    { icon: Heart, label: 'My Favorites', color: 'bg-pink-500' },
                    { icon: MessageSquare, label: 'Messages', color: 'bg-green-500' },
                    { icon: Settings, label: 'Settings', color: 'bg-gray-500' }
                  ].map((action, index) => (
                    <button key={index} className="flex flex-col items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors group">
                      <div className={`${action.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="h-20 bg-gradient-to-r from-primary to-primary/60"></div>
              <CardContent className="pt-0 -mt-10">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-background border-4 border-background shadow-lg flex items-center justify-center">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold text-lg">{user?.name || 'User'}</h3>
                  <p className="text-sm text-muted-foreground">Premium Member</p>
                  
                  <div className="w-full mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{user?.email || 'user@example.com'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">+91 98765 43210</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Member since Jan 2024</span>
                    </div>
                  </div>

                  <Button className="w-full mt-6" variant="outline">Edit Profile</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { area: 'Koregaon Park', trend: '+5.2%', status: 'up' },
                    { area: 'Viman Nagar', trend: '+3.8%', status: 'up' },
                    { area: 'Baner', trend: '-1.2%', status: 'down' }
                  ].map((insight, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{insight.area}</span>
                      </div>
                      <Badge variant={insight.status === 'up' ? 'default' : 'secondary'} className="text-xs">
                        {insight.trend}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
