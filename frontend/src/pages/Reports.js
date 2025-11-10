import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import LoadingScreen from '../components/LoadingScreen';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Home, 
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  PieChartIcon,
  Eye,
  HardDrive
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const Reports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStorageStats, setCurrentStorageStats] = useState(null);
  const [reports, setReports] = useState({
    userGrowth: [],
    propertyGrowth: [],
    statusDistribution: [],
    roleDistribution: [],
    viewsGrowth: [],
    storageGrowth: []
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchReportsData();
  }, [user, navigate]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch current storage stats for accurate file count
      const storageResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/properties/storage-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (storageResponse.ok) {
        const storageData = await storageResponse.json();
        setCurrentStorageStats(storageData.stats);
      }
      
      // Then fetch reports
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/admin/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports data');
      }
      
      const data = await response.json();
      setReports(data.reports);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Colors for charts
  const COLORS = {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#8b5cf6',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4'
  };

  const STATUS_COLORS = {
    available: '#10b981',
    pending: '#f59e0b',
    sold: '#6b7280',
    rented: '#8b5cf6'
  };

  const ROLE_COLORS = {
    admin: '#ef4444',
    user: '#3b82f6'
  };

  // Calculate summary statistics
  const totalUserGrowth = reports.userGrowth.reduce((sum, item) => sum + parseInt(item.count), 0);
  const totalPropertyGrowth = reports.propertyGrowth.reduce((sum, item) => sum + parseInt(item.count), 0);
  const totalViewsGrowth = reports.viewsGrowth.reduce((sum, item) => sum + parseInt(item.count), 0);
  const avgMonthlyUsers = totalUserGrowth / Math.max(reports.userGrowth.length, 1);
  const avgMonthlyProperties = totalPropertyGrowth / Math.max(reports.propertyGrowth.length, 1);
  const avgMonthlyViews = totalViewsGrowth / Math.max(reports.viewsGrowth.length, 1);
  
  // Get latest storage data and merge with current stats
  const latestStorage = reports.storageGrowth.length > 0 
    ? reports.storageGrowth[reports.storageGrowth.length - 1] 
    : { size_bytes: 0, size_mb: 0, size_gb: 0, files: 0 };
  
  // Create dynamic storage growth data with current month
  const currentMonth = new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' });
  const storageGrowthWithCurrent = currentStorageStats 
    ? [
        ...reports.storageGrowth.filter(item => item.month !== currentMonth),
        {
          month: currentMonth,
          size_bytes: currentStorageStats.totalSizeBytes || 0,
          size_mb: currentStorageStats.totalSizeMB || 0,
          size_gb: currentStorageStats.totalSizeGB || 0,
          files: currentStorageStats.totalFiles || 0
        }
      ].sort((a, b) => new Date(a.month) - new Date(b.month))
    : reports.storageGrowth;
  
  // Format storage size accurately
  const formatStorageSize = (sizeGb, sizeMb, sizeBytes) => {
    const gb = parseFloat(sizeGb || 0);
    const mb = parseFloat(sizeMb || 0);
    const bytes = parseFloat(sizeBytes || 0);
    
    if (gb >= 1) {
      return `${gb.toFixed(2)} GB`;
    } else if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    } else if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
      return `${bytes.toFixed(0)} Bytes`;
    }
  };

  // Prepare data for combined growth chart - merge both arrays to include all months
  const allMonths = new Set([
    ...reports.userGrowth.map(item => item.month),
    ...reports.propertyGrowth.map(item => item.month)
  ]);
  
  const combinedGrowthData = Array.from(allMonths).map(month => {
    const userItem = reports.userGrowth.find(u => u.month === month);
    const propertyItem = reports.propertyGrowth.find(p => p.month === month);
    return {
      month: month,
      users: userItem ? parseInt(userItem.count || 0) : 0,
      properties: propertyItem ? parseInt(propertyItem.count || 0) : 0
    };
  }).sort((a, b) => {
    // Sort by date
    const dateA = new Date(a.month);
    const dateB = new Date(b.month);
    return dateA - dateB;
  });

  if (loading) {
    return <LoadingScreen message="Loading reports..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 pt-16 sm:pt-20 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 p-4 sm:p-6">
            <div className="flex items-center space-x-2 text-destructive mb-4">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <h3 className="font-semibold text-sm sm:text-base">Error Loading Reports</h3>
            </div>
            <p className="text-muted-foreground mb-4 text-xs sm:text-sm">{error}</p>
            <Button onClick={fetchReportsData} className="w-full sm:w-auto text-sm">Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pt-16 sm:pt-20">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-[1600px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 md:mb-8 space-y-3 sm:space-y-0">
          <div className="flex-1 min-w-0">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg">
                <BarChart3 className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Growth Reports</h1>
                <p className="text-muted-foreground">Analyze your business growth and trends</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:ml-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fetchReportsData()}
              className="flex items-center space-x-1.5 sm:space-x-2 h-8 sm:h-9 text-xs sm:text-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4 sm:pt-6 sm:px-6">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Total New Users</p>
                  <p className="text-xl sm:text-2xl font-bold truncate">{totalUserGrowth}</p>
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Last 12 months</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4 sm:pt-6 sm:px-6">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                  <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Total New Properties</p>
                  <p className="text-xl sm:text-2xl font-bold truncate">{totalPropertyGrowth}</p>
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Last 12 months</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4 sm:pt-6 sm:px-6">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Total Property Views</p>
                  <p className="text-xl sm:text-2xl font-bold truncate">{totalViewsGrowth}</p>
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Avg {avgMonthlyViews.toFixed(0)}/month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4 sm:pt-6 sm:px-6">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                  <HardDrive className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Storage Used</p>
                  <p className="text-xl sm:text-2xl font-bold truncate">
                    {currentStorageStats 
                      ? `${currentStorageStats.totalSizeMB.toFixed(2)} MB`
                      : `${parseFloat(latestStorage.size_mb || 0).toFixed(2)} MB`}
                  </p>
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                {currentStorageStats 
                  ? `${currentStorageStats.totalFiles.toLocaleString()} files`
                  : `${parseInt(latestStorage.files || 0).toLocaleString()} files`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Combined Growth Chart */}
        <Card className="mb-4 sm:mb-6 md:mb-8 shadow-lg">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 gap-2">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base sm:text-lg md:text-xl truncate">Combined Growth Trend</CardTitle>
                <CardDescription className="text-xs sm:text-sm truncate">Users and properties growth over time</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(combinedGrowthData, 'combined_growth')}
                className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span>Export</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="w-full h-[250px] xs:h-[280px] sm:h-[320px] md:h-[380px] lg:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedGrowthData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProperties" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    fontSize={9}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    fontSize={9}
                    width={35}
                  />
                  <Tooltip 
                    contentStyle={{ fontSize: '12px' }}
                    labelStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    iconSize={10}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    name="Users"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="properties" 
                    stroke={COLORS.secondary}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorProperties)"
                    name="Properties"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-6 md:mb-8">
          {/* User Growth Chart */}
          <Card className="shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 gap-2">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg md:text-xl truncate">User Registrations</CardTitle>
                  <CardDescription className="text-xs sm:text-sm truncate">Monthly user registration trend</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV(reports.userGrowth, 'user_growth')}
                  className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                >
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  <span>Export</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="w-full h-[250px] xs:h-[280px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reports.userGrowth} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="month" 
                      fontSize={9}
                      angle={-45}
                      textAnchor="end"
                      height={55}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      fontSize={9}
                      width={35}
                    />
                    <Tooltip 
                      contentStyle={{ fontSize: '12px' }}
                      labelStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      iconSize={10}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      name="Users"
                      dot={{ fill: COLORS.primary, r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Property Growth Chart */}
          <Card className="shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 gap-2">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg md:text-xl truncate">Property Additions</CardTitle>
                  <CardDescription className="text-xs sm:text-sm truncate">Monthly property addition trend</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV(reports.propertyGrowth, 'property_growth')}
                  className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                >
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  <span>Export</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="w-full h-[250px] xs:h-[280px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reports.propertyGrowth} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="month" 
                      fontSize={9}
                      angle={-45}
                      textAnchor="end"
                      height={55}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      fontSize={9}
                      width={35}
                    />
                    <Tooltip 
                      contentStyle={{ fontSize: '12px' }}
                      labelStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      iconSize={10}
                    />
                    <Bar 
                      dataKey="count" 
                      fill={COLORS.secondary}
                      name="Properties"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* Property Views Growth */}
          <Card className="shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 gap-2">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg md:text-xl truncate">Property Views Trend</CardTitle>
                  <CardDescription className="text-xs sm:text-sm truncate">Monthly property view analytics</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV(reports.viewsGrowth, 'property_views')}
                  className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                >
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  <span>Export</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {reports.viewsGrowth.length > 0 ? (
                <div className="w-full h-[250px] xs:h-[280px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reports.viewsGrowth} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="month" 
                        fontSize={9}
                        angle={-45}
                        textAnchor="end"
                        height={55}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        fontSize={9}
                        width={35}
                      />
                      <Tooltip 
                        contentStyle={{ fontSize: '12px' }}
                        labelStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                        iconSize={10}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke={COLORS.accent}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorViews)"
                        name="Views"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 text-muted-foreground">
                  <Eye className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm sm:text-base">No view data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Firebase Storage Growth */}
          <Card className="shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 gap-2">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg md:text-xl truncate">Firebase Storage Growth</CardTitle>
                  <CardDescription className="text-xs sm:text-sm truncate">Storage usage over time</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV(storageGrowthWithCurrent, 'storage_growth')}
                  className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                >
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  <span>Export</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {storageGrowthWithCurrent.length > 0 ? (
                <div className="w-full h-[250px] xs:h-[280px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={storageGrowthWithCurrent} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="month" 
                        fontSize={9}
                        angle={-45}
                        textAnchor="end"
                        height={55}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        fontSize={9}
                        width={35}
                        label={{ value: 'MB', angle: -90, position: 'insideLeft', style: { fontSize: '10px' } }}
                      />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === "Storage (MB)" && value !== null && value !== undefined) {
                            return [parseFloat(value).toFixed(2) + " MB", name];
                          }
                          return [value, name];
                        }}
                        contentStyle={{ fontSize: '12px' }}
                        labelStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                        iconSize={10}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="size_mb" 
                        stroke={COLORS.warning}
                        strokeWidth={2}
                        name="Storage (MB)"
                        dot={{ fill: COLORS.warning, r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 text-muted-foreground">
                  <HardDrive className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm sm:text-base">No storage data available yet</p>
                  <p className="text-xs sm:text-sm mt-2">Data will be recorded when admin views dashboard</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
