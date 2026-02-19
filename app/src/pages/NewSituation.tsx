import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { matchAPI } from '../services/api';
import { Mic, MapPin, Calendar, Clock, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';

const categories = [
  { value: 'wedding', label: 'Wedding +1', icon: '💒' },
  { value: 'fitness', label: 'Fitness Buddy', icon: '💪' },
  { value: 'travel', label: 'Travel Guide', icon: '✈️' },
  { value: 'cultural', label: 'Cultural Event', icon: '🎭' },
  { value: 'social', label: 'Social Companion', icon: '🎉' },
  { value: 'professional', label: 'Professional', icon: '💼' },
  { value: 'other', label: 'Other', icon: '🎯' }
];

const NewSituation: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    situation: '',
    category: '',
    date: '',
    time: '',
    duration: 2,
    address: '',
    urgency: 'flexible' as 'flexible' | 'soon' | 'urgent',
    budget: [1500],
    genderPreference: 'any' as 'any' | 'male' | 'female',
    verifiedOnly: true
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep = () => {
    if (step === 1 && !formData.situation.trim()) {
      setError('Please describe your situation');
      return false;
    }
    if (step === 2 && !formData.category) {
      setError('Please select a category');
      return false;
    }
    if (step === 3) {
      if (!formData.date || !formData.time) {
        setError('Please select date and time');
        return false;
      }
      if (!formData.address.trim()) {
        setError('Please enter the location');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsLoading(true);
    setError('');

    try {
      const startTime = new Date(`${formData.date}T${formData.time}`);

      await matchAPI.findMatches({
        situation: formData.situation,
        category: formData.category,
        date: startTime.toISOString(),
        duration: formData.duration,
        location: {
          address: formData.address
        },
        budget: {
          min: 20,
          max: formData.budget[0]
        },
        urgency: formData.urgency,
        verifiedOnly: formData.verifiedOnly
      });

      // Navigate to matches page with results
      // Note: In a real implementation, you'd get matches from the response
      // navigate('/matches', { state: { matches: response.data.data, formData } });
      navigate('/matches');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to find matches');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>New Situation</CardTitle>
            <CardDescription>
              Describe what you need and we'll find the perfect companion
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3, 4].map((s) => (
                <React.Fragment key={s}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {s}
                  </div>
                  {s < 4 && <div className={`flex-1 h-1 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
                </React.Fragment>
              ))}
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <Label htmlFor="situation">Describe Your Situation</Label>
                <div className="relative">
                  <Textarea
                    id="situation"
                    placeholder="Meri cousin ki shaadi hai next Saturday aur mera ex wahan apni nayi girlfriend ke saath aa raha hai. Mujhe koi confident companion chahiye jo awkward situations handle kar sake..."
                    value={formData.situation}
                    onChange={(e) => handleChange('situation', e.target.value)}
                    className="min-h-[150px] resize-none"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-2 right-2"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  The more details you provide, the better we can match you
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Label>Select Category</Label>
                <RadioGroup
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                  className="grid grid-cols-2 gap-4"
                >
                  {categories.map((cat) => (
                    <div key={cat.value}>
                      <RadioGroupItem
                        value={cat.value}
                        id={cat.value}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={cat.value}
                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <span className="text-2xl mb-2">{cat.icon}</span>
                        <span className="text-sm font-medium">{cat.label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                        className="pl-10"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => handleChange('time', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Duration: {formData.duration} hours</Label>
                  <Slider
                    value={[formData.duration]}
                    onValueChange={(value) => handleChange('duration', value[0])}
                    min={1}
                    max={8}
                    step={0.5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Location Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      placeholder="e.g., Bandra West, Mumbai"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Urgency</Label>
                  <RadioGroup
                    value={formData.urgency}
                    onValueChange={(value) => handleChange('urgency', value)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="flexible" id="flexible" />
                      <Label htmlFor="flexible">Flexible</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="soon" id="soon" />
                      <Label htmlFor="soon">Soon</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="urgent" id="urgent" />
                      <Label htmlFor="urgent">Urgent</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Budget: Up to ₹{formData.budget[0]}/hr</Label>
                  <Slider
                    value={formData.budget}
                    onValueChange={(value) => handleChange('budget', value)}
                    min={500}
                    max={5000}
                    step={100}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>₹500/hr</span>
                    <span>₹5000/hr</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Gender Preference</Label>
                  <Select
                    value={formData.genderPreference}
                    onValueChange={(value) => handleChange('genderPreference', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">No Preference</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={formData.verifiedOnly}
                    onChange={(e) => handleChange('verifiedOnly', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="verified" className="text-sm font-normal">
                    Show only verified companions
                  </Label>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <Button type="button" variant="outline" className="flex-1" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              {step < 4 ? (
                <Button type="button" className="flex-1" onClick={handleNext}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="button" 
                  className="flex-1" 
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Finding Matches...
                    </div>
                  ) : (
                    <>
                      Find Matches
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewSituation;
