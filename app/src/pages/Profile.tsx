import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { Camera, Shield, Edit } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    languages: user?.languages?.join(', ') || ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await userAPI.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        bio: formData.bio,
        languages: formData.languages.split(',').map(l => l.trim()).filter(Boolean)
      });
      updateUser(response.data.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-4xl font-bold text-primary">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </div>
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                
                <h2 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
                
                {user?.isVerified && (
                  <div className="flex items-center justify-center gap-2 text-green-600 mt-2">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">Verified</span>
                  </div>
                )}

                {user?.isFriend && (
                  <Link to="/friend-onboarding">
                    <Button variant="outline" className="w-full mt-4">
                      Edit Friend Profile
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="mt-4">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{user?.rating || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">Rating</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{user?.reviewCount || 0}</div>
                    <div className="text-sm text-muted-foreground">Reviews</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile">
              <TabsList className="w-full">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Personal Information</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : isEditing ? 'Save' : <Edit className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => handleChange('firstName', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => handleChange('lastName', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Bio</Label>
                      <Textarea
                        value={formData.bio}
                        onChange={(e) => handleChange('bio', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Languages (comma separated)</Label>
                      <Input
                        value={formData.languages}
                        onChange={(e) => handleChange('languages', e.target.value)}
                        disabled={!isEditing}
                        placeholder="English, Spanish, French"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="emergency">
                <EmergencyContactForm />
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Link to="/profile/change-password">
                      <Button variant="outline" className="w-full">
                        Change Password
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full text-red-600">
                      Delete Account
                    </Button>
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

const EmergencyContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await userAPI.updateEmergencyContact(formData);
      alert('Emergency contact updated');
    } catch (error) {
      console.error('Error saving emergency contact:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emergency Contact</CardTitle>
        <CardDescription>
          This person will be notified in case of an emergency during your bookings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Emergency contact name"
          />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+1 (555) 000-0000"
          />
        </div>
        <div className="space-y-2">
          <Label>Relationship</Label>
          <Input
            value={formData.relationship}
            onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
            placeholder="e.g., Parent, Sibling, Friend"
          />
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? 'Saving...' : 'Save Emergency Contact'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default Profile;
