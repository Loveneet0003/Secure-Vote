
import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MapPin, Phone } from 'lucide-react';

const Contact = () => {
  return <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center gradient-text">Contact Us</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <Card className="p-6 glass-card hover-glow">
              <h2 className="text-xl font-semibold mb-4 gradient-text">Get In Touch</h2>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1 text-voting-blue-light">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-muted-foreground">NIT Hamirpur, Hamirpur, Himachal Pradesh 177005</p>
                  </div>
                </li>
                
                <li className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1 text-voting-blue-light">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-muted-foreground">+911234567890</p>
                  </div>
                </li>
                
                <li className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1 text-voting-blue-light">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">info@securevote.com</p>
                  </div>
                </li>
              </ul>
            </Card>
            
            <Card className="p-6 glass-card hover-glow">
              <h2 className="text-xl font-semibold mb-4 gradient-text">Office Hours</h2>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="font-medium">Monday - Friday</span>
                  <span className="text-muted-foreground">9:00 AM - 6:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">Saturday</span>
                  <span className="text-muted-foreground">10:00 AM - 4:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">Sunday</span>
                  <span className="text-muted-foreground">Closed</span>
                </li>
              </ul>
              
              <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-2 gradient-text">Technical Support</h2>
                <p className="text-muted-foreground mb-2">Having issues with the voting system?</p>
                <p className="text-muted-foreground">Email: support@securevote.com</p>
              </div>
            </Card>
          </div>
          
          <Card className="p-6 glass-card hover-glow">
            <h2 className="text-2xl font-semibold mb-6 text-center gradient-text">Send us a Message</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" placeholder="Enter your name" className="bg-background/50" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Your Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" className="bg-background/50" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Enter message subject" className="bg-background/50" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Type your message here" className="h-36 bg-background/50" />
              </div>
              
              <Button type="submit" className="w-full md:w-auto bg-voting-blue hover:bg-voting-blue-dark text-white">
                Send Message
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </Layout>;
};
export default Contact;
