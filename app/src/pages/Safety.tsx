import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { bookingAPI, safetyAPI } from '../services/api';
import type { Booking } from '../types';
import { format } from 'date-fns';
import { 
  Shield, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  CheckCircle, 
  ArrowLeft,
  Phone,
  Siren
} from 'lucide-react';

const SafetyPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [safetyStatus, setSafetyStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sosTriggered, setSosTriggered] = useState(false);

  useEffect(() => {
    fetchSafetyData();
    const interval = setInterval(fetchSafetyData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [bookingId]);

  const fetchSafetyData = async () => {
    try {
      const [bookingRes, statusRes] = await Promise.all([
        bookingAPI.getBookingById(bookingId!),
        safetyAPI.getSafetyStatus(bookingId!)
      ]);
      setBooking(bookingRes.data.data);
      setSafetyStatus(statusRes.data.data);
    } catch (error) {
      console.error('Error fetching safety data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerSOS = async () => {
    if (!confirm('Are you sure you want to trigger an SOS alert? This will notify your emergency contact and our safety team.')) {
      return;
    }

    try {
      setSosTriggered(true);
      await safetyAPI.triggerSOS(bookingId!, undefined, 'User triggered SOS');
      alert('SOS alert triggered. Help is on the way.');
    } catch (error) {
      console.error('Error triggering SOS:', error);
      alert('Failed to trigger SOS. Please call emergency services directly.');
    }
  };

  const checkIn = async () => {
    try {
      await bookingAPI.addCheckIn(bookingId!, {
        type: 'manual',
        notes: 'Manual check-in via safety dashboard'
      });
      fetchSafetyData();
    } catch (error) {
      console.error('Error checking in:', error);
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
            <Button>View Bookings</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOverdue = safetyStatus?.isOverdue;
  const lastCheckIn = safetyStatus?.lastCheckIn;

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link to={`/booking/${bookingId}`} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Booking
        </Link>

        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Safety Dashboard</h1>
          <p className="text-muted-foreground">Stay safe during your meetup</p>
        </div>

        {/* SOS Alert */}
        <Card className="mb-6 border-red-500">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-600 mb-2">Emergency SOS</h2>
              <p className="text-muted-foreground mb-4">
                Only use in case of emergency. This will alert your emergency contact and our 24/7 safety team.
              </p>
              <Button 
                variant="destructive" 
                size="lg"
                onClick={triggerSOS}
                disabled={sosTriggered}
                className="w-full gap-2"
              >
                <Siren className="h-5 w-5" />
                {sosTriggered ? 'SOS Triggered' : 'Trigger SOS'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Safety Code */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Safety Code
            </CardTitle>
            <CardDescription>
              Share this code with your emergency contact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-primary/10 rounded-lg p-6 text-center">
              <p className="text-4xl font-bold tracking-[0.5em] text-primary">
                {booking.safetyCode}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Check-in Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Check-in Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isOverdue ? (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Check-in Overdue</AlertTitle>
                <AlertDescription>
                  Please check in now to confirm you're safe.
                </AlertDescription>
              </Alert>
            ) : lastCheckIn ? (
              <div className="flex items-center gap-2 text-green-600 mb-4">
                <CheckCircle className="h-5 w-5" />
                <span>Last check-in: {format(new Date(lastCheckIn.timestamp), 'h:mm a')}</span>
              </div>
            ) : (
              <p className="text-muted-foreground mb-4">No check-ins yet</p>
            )}
            
            <Button onClick={checkIn} className="w-full gap-2">
              <CheckCircle className="h-4 w-4" />
              Check In Now
            </Button>
            
            <p className="text-sm text-muted-foreground text-center mt-2">
              Next check-in due in 30 minutes
            </p>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        {safetyStatus?.emergencyContact && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{safetyStatus.emergencyContact.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {safetyStatus.emergencyContact.relationship}
                  </p>
                </div>
                <a href={`tel:${safetyStatus.emergencyContact.phone}`}>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Check-in History */}
        <Card>
          <CardHeader>
            <CardTitle>Check-in History</CardTitle>
          </CardHeader>
          <CardContent>
            {booking.checkIns.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No check-ins yet</p>
            ) : (
              <div className="space-y-3">
                {booking.checkIns.map((checkIn, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      checkIn.isEmergency ? 'bg-red-50' : 'bg-muted'
                    }`}
                  >
                    {checkIn.isEmergency ? (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium capitalize">{checkIn.type} Check-in</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(checkIn.timestamp), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    {checkIn.location && (
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SafetyPage;
