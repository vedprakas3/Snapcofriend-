import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Match } from '../types';
import { Star, MapPin, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';

const Matches: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const matches: Match[] = location.state?.matches || [];
  const formData = location.state?.formData;

  if (!matches.length) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">No Matches Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find any companions matching your criteria. Try adjusting your preferences.
          </p>
          <Button onClick={() => navigate('/new-situation')}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Top Matches</h1>
            <p className="text-muted-foreground">
              We found {matches.length} companions perfect for your situation
            </p>
          </div>

          <div className="space-y-6">
            {matches.map((match, index) => {
              const friend = match.friend;
              const user = typeof friend.userId === 'object' ? friend.userId : null;
              
              return (
                <Card key={friend._id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Rank Badge */}
                      <div className="bg-primary text-primary-foreground w-full md:w-16 flex items-center justify-center py-4 md:py-0">
                        <div className="text-center">
                          <div className="text-2xl font-bold">#{index + 1}</div>
                          <div className="text-xs opacity-80">Match</div>
                        </div>
                      </div>

                      {/* Profile Info */}
                      <div className="flex-1 p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                              {user?.avatar ? (
                                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-3xl font-bold text-primary">
                                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-semibold">
                                  {user?.firstName} {user?.lastName}
                                </h3>
                                <p className="text-muted-foreground">{friend.headline || 'Professional Companion'}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary">
                                  {match.compatibility}%
                                </div>
                                <div className="text-xs text-muted-foreground">Match</div>
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-4 mb-4">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="font-medium">{user?.rating || 'New'}</span>
                                <span className="text-muted-foreground">({user?.reviewCount || 0})</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{friend.location.city}</span>
                              </div>
                              {friend.verificationStatus.idVerified && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="text-sm">Verified</span>
                                </div>
                              )}
                            </div>

                            {/* Why This Match */}
                            <div className="mb-4">
                              <p className="text-sm font-medium mb-2">Why this match:</p>
                              <div className="flex flex-wrap gap-2">
                                {match.reasons.map((reason, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {reason}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Package */}
                            {match.recommendedPackage && (
                              <div className="bg-muted rounded-lg p-4 mb-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{match.recommendedPackage.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {match.recommendedPackage.description}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-lg">
                                      ₹{match.recommendedPackage.hourlyRate}/hr
                                    </p>
                                    {match.estimatedTotal && (
                                      <p className="text-sm text-muted-foreground">
                                        ~₹{match.estimatedTotal} total
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                              <Link 
                                to={`/friends/${friend._id}`} 
                                className="flex-1"
                              >
                                <Button variant="outline" className="w-full">
                                  View Profile
                                </Button>
                              </Link>
                              <Link 
                                to={`/booking/new`}
                                state={{ 
                                  friendId: friend._id,
                                  packageId: match.recommendedPackage?._id,
                                  formData 
                                }}
                                className="flex-1"
                              >
                                <Button className="w-full gap-2">
                                  Book Now
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Back Button */}
          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => navigate('/new-situation')}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refine Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Matches;
