import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Badge } from '../components/ui/Badge';
import { 
  Building2, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Eye, 
  EyeOff,
  Check,
  X,
  ArrowRight
} from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from || '/profile';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        login(data.token, data.user);
        navigate(from);
      } else {
        setErrors({ submit: data.message || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    const levels = [
      { strength: 1, label: 'Weak', color: 'bg-red-500' },
      { strength: 2, label: 'Fair', color: 'bg-yellow-500' },
      { strength: 3, label: 'Good', color: 'bg-blue-500' },
      { strength: 4, label: 'Strong', color: 'bg-green-500' }
    ];
    return levels[strength - 1] || { strength: 0, label: '', color: '' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="hidden lg:block space-y-8">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Yug Properties Logo" 
                className="w-16 h-16 object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FFA500] to-[#FF8C00] bg-clip-text text-transparent">
                  Yug Properties
                </h1>
                <p className="text-muted-foreground">Your Dream Home Awaits</p>
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-bold leading-tight">
                Start Your Journey to
                <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Finding Your Dream Home
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of satisfied customers who found their perfect property with us.
              </p>
              <div className="space-y-4 mt-8">
                {[
                  { icon: Check, text: 'Access to 10,000+ verified properties' },
                  { icon: Check, text: 'Personalized recommendations' },
                  { icon: Check, text: 'Direct contact with property owners' },
                  { icon: Check, text: 'Expert guidance throughout your journey' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Card className="w-full shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
              <p className="text-muted-foreground">Fill in your details to get started</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="name" name="name" type="text" placeholder="John Doe" value={formData.name} onChange={handleChange} className={`pl-10 ${errors.name ? 'border-red-500' : ''}`} />
                  </div>
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="email" name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} className={`pl-10 ${errors.email ? 'border-red-500' : ''}`} />
                  </div>
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input id="phone" name="phone" type="tel" placeholder="9876543210" value={formData.phone} onChange={handleChange} className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`} />
                    </div>
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input id="location" name="location" type="text" placeholder="Pune" value={formData.location} onChange={handleChange} className={`pl-10 ${errors.location ? 'border-red-500' : ''}`} />
                    </div>
                    {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleChange} className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  {formData.password && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full transition-all ${passwordStrength.color}`} style={{ width: `${(passwordStrength.strength / 4) * 100}%` }} />
                      </div>
                      <Badge variant="secondary" className="text-xs">{passwordStrength.label}</Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                  {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Passwords match
                    </p>
                  )}
                </div>

                {errors.submit && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Creating Account...' : (
                    <span className="flex items-center gap-2">
                      Create Account <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Signup;
