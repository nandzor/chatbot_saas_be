/**
 * Customer Dashboard - Coming Soon
 * Halaman dashboard untuk customer dengan status coming soon
 */

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button
} from '@/components/ui';
import {
  MessageCircle,
  Clock,
  Bell,
  HelpCircle,
  ArrowLeft,
  Sparkles,
  Users,
  Settings
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Customer Portal</h1>
                <p className="text-sm text-gray-500">Welcome, {user?.name || user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleGoBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Main</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Customer Dashboard
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            We're building something amazing for you!
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Coming Soon</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              We're working hard to bring you the best customer experience
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600">
              Our customer dashboard is currently under development.
              We're excited to show you what we're building!
            </p>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">What to expect:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Real-time chat with our support team</li>
                <li>• Access to your conversation history</li>
                <li>• Quick access to help and resources</li>
                <li>• Personalized recommendations</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => navigate('/inbox')}
                className="flex items-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Try Chat Support</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Explore Platform</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Preview Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Live Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Chat directly with our support team in real-time
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Stay updated with important announcements
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-3">
                <HelpCircle className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Help Center</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Find answers to common questions quickly
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Need immediate assistance? Contact our support team
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate('/inbox')}
              className="flex items-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Start a Chat</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('mailto:support@example.com')}
              className="flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Email Support</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
