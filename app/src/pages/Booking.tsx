import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { bookingAPI, paymentAPI } from '../services/api';
import type { Booking as BookingType } from '../types';
import { format } from 'date-fns';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Shield, 
  MessageSquare, 
  AlertCircle,
  ArrowLeft,
  CreditCard,
  CheckCircle
} from 'lucide-react';

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const response = await bookingAPI.getBookingById(id!);
      setBooking(response.data.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');
    try {
      await paymentAPI.createPaymentIntent(id!);
      // In a real app, you'd use Stripe Elements to handle the payment
      // For now, we'll simulate a successful payment
      await paymentAPI.confirmPayment(id!, 'pi_simulated');
      await fetchBooking();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await bookingAPI.cancelBooking(id!, 'Cancelled by user');
      await fetchBooking();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
          <Link to="/bookings">
            <Button>View All Bookings</Button>
          </Link>
        </div>
      </div>
    );
  }

  const friend = typeof booking.friendId === 'object' ? booking.friendId : null;

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/bookings" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bookings
        </Link>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl capitalize">
                      {booking.situation.category} Booking
                    </CardTitle>
                    <CardDescription>
                      Booking #{booking._id.slice(-8)}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Companion Info */}
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    {friend?.avatar ? (
                      <img src={friend.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="text-xl font-bold text-primary">
                        {friend?.firstName?.[0]}{friend?.lastName?.[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{friend?.firstName} {friend?.lastName}</p>
                    <p className="text-sm text-muted-foreground">Your Companion</p>
                  </div>
                  <Link to={`/messages/${booking._id}`} className="ml-auto">
                    <Button variant="outline" size="sm" className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Button>
                  </Link>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date & Time</p>
                      <p className="font-medium">
                        {format(new Date(booking.startTime), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{booking.duration} hours</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:col-span-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{booking.location.address}</p>
                    </div>
                  </div>
                </div>

                {/* Situation */}
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Your Situation:</p>
                  <p className="text-sm">{booking.situation.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Safety */}
            {['confirmed', 'in-progress'].includes(booking.status) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Safety Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Safety Code</p>
                      <p className="text-sm text-muted-foreground">
                        Share this code with your emergency contact
                      </p>
                    </div>
                    <div className="text-3xl font-bold tracking-wider">
                      {booking.safetyCode}
                    </div>
                  </div>
                  <Link to={`/safety/${booking._id}`}>
                    <Button variant="outline" className="w-full gap-2">
                      <Shield className="h-4 w-4" />
                      View Safety Dashboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    ${booking.pricing.hourlyRate} x {booking.pricing.totalHours} hrs
                  </span>
                  <span>${booking.pricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span>${booking.pricing.platformFee.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${booking.pricing.totalAmount.toFixed(2)}</span>
                </div>

                {booking.payment.status === 'pending' && booking.status === 'pending' && (
                  <Button 
                    className="w-full gap-2 mt-4" 
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    <CreditCard className="h-4 w-4" />
                    {isProcessing ? 'Processing...' : 'Pay Now'}
                  </Button>
                )}

                {booking.payment.status === 'held' && (
                  <div className="flex items-center gap-2 text-green-600 mt-4">
                    <CheckCircle className="h-5 w-5" />
                    <span>Paid</span>
                  </div>
                )}

                {['pending', 'confirmed'].includes(booking.status) && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-2 text-red-600 hover:text-red-700"
                    onClick={handleCancel}
                  >
                    Cancel Booking
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    booking.payment.status === 'released' ? 'bg-green-500' :
                    booking.payment.status === 'held' ? 'bg-blue-500' :
                    booking.payment.status === 'refunded' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`} />
                  <span className="text-sm capitalize">{booking.payment.status}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
