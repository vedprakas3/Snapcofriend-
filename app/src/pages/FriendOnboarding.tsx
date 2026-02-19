import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { friendAPI } from '../services/api';
import { Plus, Trash2, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const categories = [
  { value: 'wedding', label: 'Wedding +1' },
  { value: 'fitness', label: 'Fitness Buddy' },
  { value: 'travel', label: 'Travel Guide' },
  { value: 'cultural', label: 'Cultural Event' },
  { value: 'social', label: 'Social Companion' },
  { value: 'professional', label: 'Professional' },
  { value: 'other', label: 'Other' }
];

const FriendOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [newPackage, setNewPackage] = useState({
    title: '',
    category: '',
    description: '',
    hourlyRate: 50,
    minHours: 1,
    maxHours: 8,
    whatsIncluded: [''],
    requirements: ['']
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await friendAPI.getMyProfile();
      setProfile(response.data.data);
      setPackages(response.data.data.presencePackages || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleAddPackage = async () => {
    try {
      await friendAPI.addPackage({
        ...newPackage,
        whatsIncluded: newPackage.whatsIncluded.filter(Boolean),
        requirements: newPackage.requirements.filter(Boolean)
      });
      fetchProfile();
      setNewPackage({
        title: '',
        category: '',
        description: '',
        hourlyRate: 50,
        minHours: 1,
        maxHours: 8,
        whatsIncluded: [''],
        requirements: ['']
      });
    } catch (error) {
      console.error('Error adding package:', error);
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    try {
      await friendAPI.deletePackage(packageId);
      fetchProfile();
    } catch (error) {
      console.error('Error deleting package:', error);
    }
  };

  const updateArrayField = (field: 'whatsIncluded' | 'requirements', index: number, value: string) => {
    setNewPackage(prev => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => 
        i === index ? value : item
      )
    }));
  };

  const addArrayField = (field: string) => {
    setNewPackage(prev => ({
      ...prev,
      [field]: [...prev[field as keyof typeof prev] as string[], '']
    }));
  };

  const removeArrayField = (field: string, index: number) => {
    setNewPackage(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Friend Profile Setup</h1>
          <p className="text-muted-foreground">Complete your companion profile to start accepting bookings</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`flex-1 h-1 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell us about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Headline</Label>
                <Input 
                  placeholder="e.g., Professional Wedding Date & Social Companion"
                  value={profile?.headline || ''}
                />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea 
                  placeholder="Tell potential clients about yourself..."
                  value={profile?.bio || ''}
                  className="min-h-[150px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Experience</Label>
                <Textarea 
                  placeholder="Describe your relevant experience..."
                  value={profile?.experience || ''}
                />
              </div>
              <Button onClick={() => setStep(2)} className="w-full">
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Presence Packages</CardTitle>
              <CardDescription>Create packages for different situations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Packages */}
              {packages.length > 0 && (
                <div className="space-y-3">
                  <Label>Your Packages</Label>
                  {packages.map((pkg) => (
                    <div key={pkg._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{pkg.title}</p>
                        <p className="text-sm text-muted-foreground">${pkg.hourlyRate}/hr • {pkg.category}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeletePackage(pkg._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Package */}
              <div className="border-t pt-6">
                <Label>Add New Package</Label>
                <div className="space-y-4 mt-4">
                  <Input
                    placeholder="Package Title"
                    value={newPackage.title}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newPackage.category}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  <Textarea
                    placeholder="Description"
                    value={newPackage.description}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">Hourly Rate ($)</Label>
                      <Input
                        type="number"
                        value={newPackage.hourlyRate}
                        onChange={(e) => setNewPackage(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Min Hours</Label>
                      <Input
                        type="number"
                        value={newPackage.minHours}
                        onChange={(e) => setNewPackage(prev => ({ ...prev, minHours: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Max Hours</Label>
                      <Input
                        type="number"
                        value={newPackage.maxHours}
                        onChange={(e) => setNewPackage(prev => ({ ...prev, maxHours: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  {/* What's Included */}
                  <div>
                    <Label>What's Included</Label>
                    {newPackage.whatsIncluded.map((item, i) => (
                      <div key={i} className="flex gap-2 mt-2">
                        <Input
                          value={item}
                          onChange={(e) => updateArrayField('whatsIncluded', i, e.target.value)}
                          placeholder={`Item ${i + 1}`}
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeArrayField('whatsIncluded', i)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => addArrayField('whatsIncluded')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>

                  <Button onClick={handleAddPackage} className="w-full">
                    Add Package
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button className="flex-1" onClick={() => setStep(3)}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Verification</CardTitle>
              <CardDescription>Complete verification to become a verified companion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">ID Verification</p>
                    <p className="text-sm text-muted-foreground">Upload government-issued ID</p>
                  </div>
                  <Button variant="outline" size="sm">Upload</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Background Check</p>
                    <p className="text-sm text-muted-foreground">Complete background screening</p>
                  </div>
                  <Button variant="outline" size="sm">Start</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Video Introduction</p>
                    <p className="text-sm text-muted-foreground">Record a 30-second intro video</p>
                  </div>
                  <Button variant="outline" size="sm">Record</Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={() => navigate('/dashboard')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FriendOnboarding;
