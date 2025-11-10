import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import LoadingScreen from '../components/LoadingScreen';
import { 
  Users, 
  Download,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ArrowLeft,
  Filter
} from 'lucide-react';

const AllUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setFilteredUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm)) ||
        (user.location && user.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Location', 'Role', 'Created At'];
    const csvData = filteredUsers.map(user => [
      user.name,
      user.email,
      user.phone || 'N/A',
      user.location || 'N/A',
      user.role,
      new Date(user.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingScreen message="Loading users..." />;
  }

  return (
    <div className="min-h-screen bg-muted/30 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">All Users</h1>
                <p className="text-muted-foreground">{filteredUsers.length} of {users.length} users</p>
              </div>
            </div>
            
            <Button onClick={exportToCSV} className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export to CSV</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, phone, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Users</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Directory</CardTitle>
            <CardDescription>Complete list of registered users</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Name</th>
                      <th className="text-left py-3 px-4 font-semibold">Contact</th>
                      <th className="text-left py-3 px-4 font-semibold">Location</th>
                      <th className="text-left py-3 px-4 font-semibold">Role</th>
                      <th className="text-left py-3 px-4 font-semibold">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {user.phone ? (
                            <p className="text-sm flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {user.phone}
                            </p>
                          ) : (
                            <span className="text-sm text-muted-foreground">N/A</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {user.location ? (
                            <p className="text-sm flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {user.location}
                            </p>
                          ) : (
                            <span className="text-sm text-muted-foreground">N/A</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <Badge 
                            className={user.role === 'admin' ? 'bg-orange-500' : 'bg-blue-500'}
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(user.created_at)}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AllUsers;
