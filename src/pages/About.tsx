import React from 'react';
import Layout from '@/components/Layout';
const About = () => {
  return <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">About SecureVote</h1>
          
          <div className="prose prose-lg bg-neutral-600">
            <p className="mb-4">
              SecureVote is an online voting system designed to provide secure, transparent, and 
              efficient elections for universities, organizations, and institutions.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
            <p className="mb-4">
              Our mission is to revolutionize traditional voting processes by leveraging modern 
              technology to make voting more accessible, secure, and transparent. We aim to increase voter 
              participation and ensure the integrity of every election conducted through our platform.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Key Features</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Secure voter authentication with multi-factor verification</li>
              <li>Encrypted ballot submission to ensure vote privacy</li>
              <li>Real-time monitoring of election progress</li>
              <li>Transparent vote counting and result declaration</li>
              <li>User-friendly interface designed for accessibility</li>
              <li>Mobile-responsive design for voting on any device</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">How It Works</h2>
            <ol className="list-decimal pl-6 mb-6 space-y-2">
              <li><strong>Registration:</strong> Users register with their valid institution ID and personal information.</li>
              <li><strong>Verification:</strong> Admin verifies the eligibility of registered users.</li>
              <li><strong>Authentication:</strong> Verified users receive credentials to login.</li>
              <li><strong>Voting:</strong> Users cast their votes securely during the election period.</li>
              <li><strong>Results:</strong> Votes are counted automatically and results are published.</li>
            </ol>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Security Measures</h2>
            <p className="mb-4">
              We employ industry-standard security measures to protect your vote and personal information:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>End-to-end encryption for all data transmission</li>
              <li>Secure authentication protocols to prevent unauthorized access</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Protection against common web security threats</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>;
};
export default About;