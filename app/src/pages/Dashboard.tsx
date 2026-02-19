import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { bookingAPI, matchAPI } from '../services/api';
import type { Booking, FriendProfile } from '../types';
import {
  Calendar,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
  Plus,
  ArrowRight,
  MapPin
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [recommendedFriends, setRecommendedFriends] = useState<FriendProfile[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    totalSpent: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch bookings
      const bookingsRes = await bookingAPI.getBookings({ limit: 5 });
      setUpcomingBookings(bookingsRes.data.data.filter((b: Booking) => 
        ['pending', 'confirmed', 'in-progress'].includes(b.status)
      ));
      
      // Calculate stats
      const allBookings = bookingsRes.data.data;
      setStats({
        totalBookings: allBookings.length,
        completedBookings: allBookings.filter((b: Booking) => b.status === 'completed').length,
        totalSpent: allBookings
          .filter((b: Booking) => b.status === 'completed')
          .reduce((sum: number, b: Booking) => sum + b.pricing.totalAmount, 0)
      });

      // Fetch recommendations
      const recRes = await matchAPI.getRecommendations();
      setRecommendedFriends(recRes.data.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground">
            {user?.isFriend 
              ? 'Manage your companion profile and bookings' 
              : 'Find the perfect companion for your next event'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/new-situation">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">New Situation</h3>
                  <p className="text-sm text-muted-foreground">Find a companion</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/bookings">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">My Bookings</h3>
                  <p className="text-sm text-muted-foreground">View all bookings</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/messages">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Messages</h3>
                  <p className="text-sm text-muted-foreground">Chat with companions</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedBookings}</p>
                </div>
                <CheckIcon className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">₹{stats.totalSpent.toFixed(0)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold">{user?.rating || 'N/A'}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Bookings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Upcoming Bookings</CardTitle>
                    <CardDescription>Your scheduled companionships</CardDescription>
                  </div>
                  <Link to="/bookings">
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No upcoming bookings</p>
                    <Link to="/new-situation">
                      <Button className="mt-4">Find a Companion</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <Link key={booking._id} to={`/booking/${booking._id}`}>
                        <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium capitalize">
                                {booking.situation.category} Companion
                              </h4>
                              <Badge variant={
                                booking.status === 'confirmed' ? 'default' :
                                booking.status === 'in-progress' ? 'secondary' :
                                'outline'
                              }>
                                {booking.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(booking.startTime)}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {booking.location.address}
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommended Friends */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recommended</CardTitle>
                <CardDescription>Top-rated companions</CardDescription>
              </CardHeader>
              <CardContent>
                {recommendedFriends.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recommendations yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendedFriends.map((friend) => (
                      <Link key={friend._id} to={`/friends/${friend._id}`}>
                        <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            {typeof friend.userId === 'object' && friend.userId.avatar ? (
                              <img 
                                src={friend.userId.avatar} 
                                alt="" 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <Users className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {typeof friend.userId === 'object' 
                                ? `${friend.userId.firstName} ${friend.userId.lastName}`
                                : 'Companion'}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span>{friend.averageRating?.toFixed(1) || 'New'}</span>
                              <span>•</span>
                              <span>{friend.location.city}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                <Link to="/matches">
                  <Button variant="outline" className="w-full mt-4">
                    Find More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple check icon component
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default Dashboard;
