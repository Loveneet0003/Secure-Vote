import React from 'react';
import Layout from '@/components/Layout';
import UniversityCard from '@/components/UniversityCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Vote, Shield, Key } from 'lucide-react';

// Sample university data with real university logos
const universities = [
  {
    id: 'uod',
    name: 'University of Delhi',
    logoSrc: '/logos/uod.png',
  },
  {
    id: 'nith',
    name: 'National Institute Of Technology Hamirpur',
    logoSrc: '/logos/nith.png',
  },
  {
    id: 'bhu',
    name: 'Banaras Hindu University',
    logoSrc: '/logos/bhu.png',
  },
  {
    id: 'iit',
    name: 'Indian Institute of Technology',
    logoSrc: '/logos/iitd.png',
  },
  {
    id: 'iis',
    name: 'Indian Institute of Science',
    logoSrc: '/logos/iis.png',
  },
  {
    id: 'uoh',
    name: 'University of Hyderabad',
    logoSrc: '/logos/uoh.png',
  },
  {
    id: 'ju',
    name: 'Jadavpur University',
    logoSrc: '/logos/ju.png',
  },
  {
    id: 'uoc',
    name: 'University of Calcutta',
    logoSrc: '/logos/uoc.png',
  },
  {
    id: 'uom',
    name: 'University of Mumbai',
    logoSrc: '/logos/uom.png',
  },
];

const Index = () => {
  return (
    <Layout>
      <div className="relative min-h-screen geometric-pattern">
        {/* Background overlay */}
        <div 
          className="absolute inset-0 z-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 backdrop-blur-sm"
        />
        
        <div className="container relative z-10 mx-auto px-4 py-12">
          <section className="text-center mb-16 glass-card p-8 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              VOTING <span className="gradient-text">PORTAL</span>
            </h1>
            <p className="text-lg max-w-2xl mx-auto text-gray-200 mb-8">
              A secure and transparent online voting system for universities and organizations. 
              Select your institution below to participate in the current election.
            </p>
            
            <div className="flex flex-wrap justify-center gap-8 mt-10">
              <div className="flex flex-col items-center text-white/80 px-4">
                <div className="rounded-full bg-voting-blue/20 p-4 mb-3">
                  <Vote className="h-6 w-6 text-voting-blue-light" />
                </div>
                <p className="text-sm">Secure Voting</p>
              </div>
              
              <div className="flex flex-col items-center text-white/80 px-4">
                <div className="rounded-full bg-voting-teal/20 p-4 mb-3">
                  <Shield className="h-6 w-6 text-voting-teal-light" />
                </div>
                <p className="text-sm">Blockchain Protected</p>
              </div>
              
              <div className="flex flex-col items-center text-white/80 px-4">
                <div className="rounded-full bg-voting-gold/20 p-4 mb-3">
                  <Key className="h-6 w-6 text-voting-gold-light" />
                </div>
                <p className="text-sm">Tamper Proof</p>
              </div>
            </div>
          </section>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {universities.map((university, index) => (
              <div key={university.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <UniversityCard 
                  id={university.id}
                  name={university.name}
                  logoSrc={university.logoSrc}
                />
              </div>
            ))}
          </div>
          
          <div className="mt-16 glass-card p-8 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <h2 className="text-2xl font-bold mb-4 text-white">Not a Registered Voter?</h2>
            <p className="mb-6 text-gray-200">
              Register now to participate in your institution's elections
            </p>
            <Link to="/register">
              <Button className="bg-gradient-blockchain hover:bg-voting-teal text-white px-8 py-6 text-lg hover-glow ripple-effect">
                Register as Voter
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
