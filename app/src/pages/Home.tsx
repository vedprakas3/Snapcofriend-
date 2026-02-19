import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Heart,
  Shield,
  Users,
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      icon: <Heart className="h-6 w-6" />,
      title: 'Contextual Matching',
      description: 'Describe your situation in natural language and get matched with companions who specialize in exactly what you need.'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Safety First',
      description: 'Every companion is verified with ID checks, background screening, and video introductions. Safety features included.'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Presence Packages',
      description: 'Book situation-specific packages like Wedding +1, Fitness Buddy, or Travel Guide - not just generic hourly rates.'
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: 'Rated & Reviewed',
      description: 'Every companion has verified reviews from real bookings. See ratings for punctuality, communication, and professionalism.'
    }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Describe Your Situation',
      description: 'Tell us what you need - a wedding date, gym buddy, travel companion, or someone for a social event.'
    },
    {
      step: '02',
      title: 'Get Matched',
      description: 'Our AI analyzes your situation and finds the top 3 companions with the right skills and experience.'
    },
    {
      step: '03',
      title: 'Book & Connect',
      description: 'Choose your match, book instantly, and connect through our secure messaging and safety features.'
    }
  ];

  const categories = [
    { name: 'Wedding +1', icon: '💒', description: 'Formal events, ex encounters, family gatherings' },
    { name: 'Fitness Buddy', icon: '💪', description: 'Gym sessions, running partners, workout motivation' },
    { name: 'Travel Guide', icon: '✈️', description: 'Local exploration, photography, navigation' },
    { name: 'Cultural Events', icon: '🎭', description: 'Museums, galleries, theater, concerts' },
    { name: 'Social Companion', icon: '🎉', description: 'Parties, dinners, confidence boosting' },
    { name: 'Professional', icon: '💼', description: 'Networking events, conferences, corporate functions' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/20 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              The Right Presence for
              <span className="text-primary block">Every Moment</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              SnapCofriend connects you with verified companions for any situation. 
              From weddings to workouts, find the perfect +1 matched by AI and backed by safety.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>ID Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Background Checked</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>$5M Insurance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Find Companions For</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                  <p className="text-muted-foreground">{category.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold text-primary/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose SnapCofriend</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Safety is Our Priority</h2>
            <p className="text-muted-foreground mb-8">
              Every booking includes comprehensive safety features: ID verification, 
              background checks, live location sharing, automatic check-ins, and 24/7 support.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">100%</div>
                <div className="text-sm text-muted-foreground">ID Verified</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">$5M</div>
                <div className="text-sm text-muted-foreground">Insurance Coverage</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">Support Team</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">4.8★</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-2xl p-8 md:p-12 text-primary-foreground text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Match?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Join thousands of users who have found the right companion for their special moments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="gap-2">
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
