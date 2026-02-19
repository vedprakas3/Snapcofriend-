import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { bookingAPI } from '../services/api';
import type { Booking } from '../types';
import { format } from 'date-fns';
import { Calendar, MapPin, Clock, ArrowRight, Plus } from 'lucide-react';

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getBookings();
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterBookings = (status: string) => {
    if (status === 'all') return bookings;
    if (status === 'upcoming') {
      return bookings.filter(b => ['pending', 'confirmed', 'in-progress'].includes(b.status));
    }
    if (status === 'completed') {
      return bookings.filter(b => ['completed', 'cancelled', 'disputed'].includes(b.status));
    }
    return bookings.filter(b => b.status === status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'in-progress': return 'default';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
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
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-muted-foreground">Manage your companion bookings</p>
          </div>
          <Link to="/new-situation">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Booking
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList className="w-full">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="completed">Past</TabsTrigger>
          </TabsList>

          {['upcoming', 'all', 'completed'].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="space-y-4">
                {filterBookings(tab).length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No bookings found</p>
                      <Link to="/new-situation">
                        <Button className="mt-4">Find a Companion</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  filterBookings(tab).map((booking) => {
                    const friend = typeof booking.friendId === 'object' ? booking.friendId : null;
                    
                    return (
                      <Link key={booking._id} to={`/booking/${booking._id}`}>
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                                  {friend?.avatar ? (
                                    <img 
                                      src={friend.avatar} 
                                      alt="" 
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="text-lg font-bold text-primary">
                                      {friend?.firstName?.[0]}{friend?.lastName?.[0]}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold capitalize">
                                      {booking.situation.category} Companion
                                    </h3>
                                    <Badge variant={getStatusColor(booking.status)}>
                                      {booking.status}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    with {friend?.firstName} {friend?.lastName}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {format(new Date(booking.startTime), 'MMM d, yyyy')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {format(new Date(booking.startTime), 'h:mm a')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {booking.location.address}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="font-bold">${booking.pricing.totalAmount.toFixed(2)}</p>
                                  <p className="text-sm text-muted-foreground capitalize">
                                    {booking.payment.status}
                                  </p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Bookings;
