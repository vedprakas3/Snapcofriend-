import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'About Us', to: '/about' },
      { label: 'Careers', to: '/careers' },
      { label: 'Press', to: '/press' },
      { label: 'Blog', to: '/blog' }
    ],
    support: [
      { label: 'Help Center', to: '/help' },
      { label: 'Safety', to: '/safety' },
      { label: 'Contact Us', to: '/contact' },
      { label: 'FAQ', to: '/faq' }
    ],
    legal: [
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Cookie Policy', to: '/cookies' },
      { label: 'Community Guidelines', to: '/guidelines' }
    ],
    social: [
      { label: 'Twitter', to: 'https://twitter.com' },
      { label: 'Instagram', to: 'https://instagram.com' },
      { label: 'LinkedIn', to: 'https://linkedin.com' },
      { label: 'Facebook', to: 'https://facebook.com' }
    ]
  };

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl">SnapCofriend</span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-sm">
              The contextual companionship marketplace. Find the right presence 
              for every moment, matched by AI and backed by safety.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>ID Verified • Background Checked • $5M Insurance</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact */}
        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-muted-foreground">
              <a href="mailto:support@snapcofriend.com" className="flex items-center gap-2 hover:text-foreground">
                <Mail className="h-4 w-4" />
                support@snapcofriend.com
              </a>
              <a href="tel:+1-800-SNAPCO" className="flex items-center gap-2 hover:text-foreground">
                <Phone className="h-4 w-4" />
                1-800-SNAPCO
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                New York, NY
              </span>
            </div>
            
            <div className="flex gap-4">
              {footerLinks.social.map((link) => (
                <a
                  key={link.label}
                  href={link.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            © {currentYear} SnapCofriend. Made with <Heart className="h-4 w-4 text-red-500" /> for meaningful connections.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
