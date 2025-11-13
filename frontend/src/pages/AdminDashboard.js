import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import LoadingScreen from '../components/LoadingScreen';
import { 
  Home, 
  Users, 
  TrendingUp,
  DollarSign,
  Plus,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Settings,
  Shield,
  AlertCircle,
  Database,
  HardDrive,
  Download,
  Phone,
  Mail,
  MapPin,
  StickyNote
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    recentUsers: 0,
    totalProperties: 0,
    activeListings: 0,
    soldProperties: 0,
    pendingProperties: 0,
    totalNotes: 0,
    totalPropertyViews: 0
  });
  const [storageStats, setStorageStats] = useState(null);
  const [recentProperties, setRecentProperties] = useState([]);
  const [recentUsersList, setRecentUsersList] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchStorageStats();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch admin stats
      const statsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch admin stats');
      }
      
      const statsData = await statsResponse.json();
      setStats(statsData.stats);
      setRecentUsersList(statsData.recentUsersList.slice(0, 3)); // Get top 3 recent users

      // Fetch recent properties
      const propertiesResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/properties?limit=5&sort=created_at&order=desc`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!propertiesResponse.ok) {
        throw new Error('Failed to fetch properties');
      }
      
      const propertiesData = await propertiesResponse.json();
      setRecentProperties(propertiesData.data || []);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchStorageStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/properties/storage/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStorageStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching storage stats:', error);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete property');
      }

      // Refresh properties list
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property: ' + error.message);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '₹0';
    
    const crore = 10000000;
    const lakh = 100000;
    
    if (price >= crore) {
      return `₹${(price / crore).toFixed(2)} Cr`;
    } else if (price >= lakh) {
      return `₹${(price / lakh).toFixed(2)} Lakhs`;
    } else {
      return `₹${price.toLocaleString('en-IN')}`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const calculateChange = (current, recent) => {
    if (current === 0) return '+0%';
    const percentage = ((recent / current) * 100).toFixed(0);
    return `+${percentage}%`;
  };

  const dashboardStats = [
    { 
      label: "Total Properties", 
      value: stats.totalProperties.toString(), 
      change: `${stats.activeListings} active`, 
      icon: <Home className="w-6 h-6" />, 
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      lightBg: "bg-blue-50 dark:bg-blue-950"
    },
    { 
      label: "Total Users", 
      value: stats.totalUsers.toString(), 
      change: `+${stats.recentUsers} this week`, 
      icon: <Users className="w-6 h-6" />, 
      color: "bg-gradient-to-br from-green-500 to-green-600",
      lightBg: "bg-green-50 dark:bg-green-950"
    },
    { 
      label: "Property Views", 
      value: stats.totalPropertyViews.toString(), 
      change: `Total engagements`, 
      icon: <Eye className="w-6 h-6" />, 
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      lightBg: "bg-purple-50 dark:bg-purple-950"
    },
    { 
      label: "Total Notes", 
      value: stats.totalNotes.toString(), 
      change: `Client meetings`, 
      icon: <StickyNote className="w-6 h-6" />, 
      color: "bg-gradient-to-br from-pink-500 to-pink-600",
      lightBg: "bg-pink-50 dark:bg-pink-950"
    }
  ];

  if (loading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 pt-20 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-semibold">Error Loading Dashboard</h3>
            </div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 space-y-4 sm:space-y-0">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Admin Dashboard</h1>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          <Button className="flex items-center justify-center space-x-2 w-full sm:w-auto" onClick={() => navigate('/admin/add-property')}>
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span>Add Property</span>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className={`hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 ${stat.lightBg}`}>
              <CardContent className="pt-6 pb-5">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`${stat.color} text-white p-3 rounded-xl shadow-lg`}>
                      {stat.icon}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Firebase Storage Stats */}
        {storageStats && (
          <Card className="mb-8 border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-slate-800 dark:to-slate-900 shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-3 rounded-xl shadow-lg">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-orange-900 dark:text-orange-400 text-lg md:text-xl">Firebase Storage Usage</CardTitle>
                    <CardDescription className="text-orange-700 dark:text-slate-400 text-sm">
                      {storageStats.totalFiles} images • {storageStats.totalSizeGB} GB total
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-orange-200 text-orange-900 dark:bg-orange-600 dark:text-white">
                    {storageStats.totalFiles} Files
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Storage Details Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <div className="bg-white dark:bg-slate-700 p-4 rounded-xl shadow-sm border border-orange-200 dark:border-slate-600">
                    <p className="text-xs text-muted-foreground dark:text-slate-400 mb-1">Total Files</p>
                    <p className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">{storageStats.totalFiles}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-700 p-4 rounded-xl shadow-sm border border-orange-200 dark:border-slate-600">
                    <p className="text-xs text-muted-foreground dark:text-slate-400 mb-1">Size (MB)</p>
                    <p className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">{storageStats.totalSizeMB}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-700 p-4 rounded-xl shadow-sm border border-orange-200 dark:border-slate-600">
                    <p className="text-xs text-muted-foreground dark:text-slate-400 mb-1">Size (GB)</p>
                    <p className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">{storageStats.totalSizeGB}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-700 p-4 rounded-xl shadow-sm border border-orange-200 dark:border-slate-600">
                    <p className="text-xs text-muted-foreground dark:text-slate-400 mb-1">Free Tier</p>
                    <p className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">{storageStats.freeTierLimitGB} GB</p>
                  </div>
                </div>

                {/* Usage Progress - Only show if within free tier */}
                {storageStats.totalSizeGB <= storageStats.freeTierLimitGB && (
                  <div className="bg-white dark:bg-slate-700 p-4 rounded-xl border border-orange-200 dark:border-slate-600">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-orange-700 dark:text-orange-300 font-medium">
                        Free Tier Usage: {storageStats.totalSizeGB} GB / {storageStats.freeTierLimitGB} GB
                      </span>
                      <span className="text-orange-600 dark:text-orange-400 font-semibold">
                        {storageStats.usagePercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-orange-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          storageStats.usagePercentage > 80 
                            ? 'bg-red-500 dark:bg-red-600' 
                            : storageStats.usagePercentage > 50
                            ? 'bg-yellow-500 dark:bg-yellow-600'
                            : 'bg-green-500 dark:bg-green-600'
                        }`}
                        style={{ width: `${Math.min(storageStats.usagePercentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground dark:text-slate-400 mt-2">
                      {storageStats.remainingGB} GB remaining in free tier
                    </p>
                  </div>
                )}

                {/* Exceeded free tier message */}
                {storageStats.totalSizeGB > storageStats.freeTierLimitGB && (
                  <div className="bg-white dark:bg-slate-700 p-4 rounded-xl border-2 border-blue-500 dark:border-blue-600">
                    <div className="flex items-start space-x-2">
                      <Database className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Paid Tier Active</p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          You're using {storageStats.totalSizeGB} GB, which exceeds the free tier limit of {storageStats.freeTierLimitGB} GB.
                          Paid tier charges apply for {(storageStats.totalSizeGB - storageStats.freeTierLimitGB).toFixed(2)} GB.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning Message - only in free tier */}
                {storageStats.usagePercentage > 80 && storageStats.totalSizeGB <= storageStats.freeTierLimitGB && (
                  <div className="flex items-start space-x-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-800 dark:text-red-200">
                      <p className="font-semibold mb-1">Storage Warning</p>
                      <p>You're using {storageStats.usagePercentage}% of your free tier storage. Upgrade to paid tier to continue beyond {storageStats.freeTierLimitGB} GB.</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Properties Management */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div>
                    <CardTitle className="text-lg md:text-xl">Property Management</CardTitle>
                    <CardDescription className="text-sm">Recent property listings</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/properties')}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentProperties.length === 0 ? (
                  <div className="text-center py-8">
                    <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No properties yet</p>
                    <Button className="mt-4" onClick={() => navigate('/admin/add-property')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Property
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2 font-semibold text-sm">Property</th>
                            <th className="text-left py-3 px-2 font-semibold text-sm">Location</th>
                            <th className="text-left py-3 px-2 font-semibold text-sm">Price</th>
                            <th className="text-left py-3 px-2 font-semibold text-sm">Status</th>
                            <th className="text-right py-3 px-2 font-semibold text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentProperties.map((property) => (
                            <tr key={property.id} className="border-b hover:bg-muted/50 transition-colors">
                              <td className="py-4 px-2 font-medium">{property.title}</td>
                              <td className="py-4 px-2 text-sm text-muted-foreground">
                                {property.city}, {property.state}
                              </td>
                              <td className="py-4 px-2 font-semibold text-primary">
                                {formatPrice(property.price)}
                              </td>
                              <td className="py-4 px-2">
                                <Badge 
                                  className={
                                    property.status === 'available' ? 'bg-green-500 hover:bg-green-600 text-white' :
                                    property.status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
                                    property.status === 'sold' || property.status === 'rented' ? 'bg-gray-500 hover:bg-gray-600 text-white' :
                                    ''
                                  }
                                >
                                  {property.status}
                                </Badge>
                              </td>
                              <td className="py-4 px-2">
                                <div className="flex items-center justify-end space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => navigate(`/properties/${property.id}`)}
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => navigate(`/admin/edit-property/${property.id}`)}
                                    title="Edit Property"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteProperty(property.id)}
                                    title="Delete Property"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                      {recentProperties.map((property) => (
                        <div key={property.id} className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm mb-1">{property.title}</h4>
                              <p className="text-xs text-muted-foreground flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {property.city}, {property.state}
                              </p>
                            </div>
                            <Badge 
                              className={
                                property.status === 'available' ? 'bg-green-500 text-white' :
                                property.status === 'pending' ? 'bg-yellow-500 text-white' :
                                property.status === 'sold' || property.status === 'rented' ? 'bg-gray-500 text-white' :
                                ''
                              }
                            >
                              {property.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-primary">{formatPrice(property.price)}</p>
                            <div className="flex items-center space-x-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => navigate(`/properties/${property.id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => navigate(`/admin/edit-property/${property.id}`)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-destructive"
                                onClick={() => handleDeleteProperty(property.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/add-property')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Property
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/properties')}>
                  <Home className="w-4 h-4 mr-2" />
                  View All Properties
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/notes')}>
                  <StickyNote className="w-4 h-4 mr-2" />
                  Notes
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/reports')}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Recent Users</CardTitle>
                <CardDescription className="text-sm">Newest registered users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentUsersList.length === 0 ? (
                  <div className="text-center py-4">
                    <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No users yet</p>
                  </div>
                ) : (
                  <>
                    {recentUsersList.map((recentUser) => (
                      <div key={recentUser.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{recentUser.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{recentUser.email}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <Badge variant="outline" className="text-xs mb-1">{recentUser.role}</Badge>
                          <p className="text-xs text-muted-foreground hidden sm:block">{formatDate(recentUser.created_at)}</p>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      className="w-full mt-2" 
                      size="sm"
                      onClick={() => navigate('/admin/users')}
                    >
                      View All Users
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-950">
                  <span className="text-sm font-medium">Database</span>
                  <Badge className="bg-green-500">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-950">
                  <span className="text-sm font-medium">Server</span>
                  <Badge className="bg-green-500">Online</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <span className="text-sm font-medium">Properties</span>
                  <Badge className="bg-blue-500">{stats.totalProperties} total</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
