import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { friendAPI } from '../services/api';
import type { FriendProfile as FriendProfileType } from '../types';
import { Star, MapPin, CheckCircle, MessageSquare, ArrowLeft } from 'lucide-react';

const FriendProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<FriendProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await friendAPI.getFriendById(id!);
      setProfile(response.data.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <Link to="/matches">
            <Button>Back to Matches</Button>
          </Link>
        </div>
      </div>
    );
  }

  const user = typeof profile.userId === 'object' ? profile.userId : null;

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/matches" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Matches
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-32 h-32 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-4xl font-bold text-primary">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-bold mb-1">{user?.firstName} {user?.lastName}</h1>
                <p className="text-muted-foreground mb-4">{profile.headline}</p>
                
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="font-bold">{user?.rating || 'New'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{profile.location.city}</span>
                  </div>
                </div>

                {profile.verificationStatus.idVerified && (
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                    <CheckCircle className="h-5 w-5" />
                    <span>Verified Companion</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Link to={`/booking/new`} state={{ friendId: profile._id }}>
                    <Button className="w-full">Book Now</Button>
                  </Link>
                  <Button variant="outline" className="w-full gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="mt-4">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{profile.totalBookings}</div>
                    <div className="text-sm text-muted-foreground">Bookings</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{profile.completionRate}%</div>
                    <div className="text-sm text-muted-foreground">Completion</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{profile.responseRate}%</div>
                    <div className="text-sm text-muted-foreground">Response</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{profile.responseTime}m</div>
                    <div className="text-sm text-muted-foreground">Avg Response</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about">
              <TabsList className="w-full">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="packages">Packages</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Bio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{profile.bio}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{profile.experience}</p>
                  </CardContent>
                </Card>

                {profile.specialties.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Specialties</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.specialties.map((specialty, i) => (
                          <Badge key={i} variant="secondary">{specialty}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {profile.languages.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Languages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.languages.map((lang, i) => (
                          <Badge key={i} variant="outline">{lang}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="packages">
                <div className="space-y-4">
                  {profile.presencePackages.filter(p => p.isActive).map((pkg) => (
                    <Card key={pkg._id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{pkg.title}</h3>
                            <p className="text-sm text-muted-foreground">{pkg.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">₹{pkg.hourlyRate}/hr</div>
                          </div>
                        </div>
                        
                        {pkg.whatsIncluded.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">What's Included:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {pkg.whatsIncluded.map((item, i) => (
                                <li key={i}>• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <Link to={`/booking/new`} state={{ friendId: profile._id, packageId: pkg._id }}>
                          <Button className="w-full mt-4">Select Package</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Reviews will appear here</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendProfilePage;
