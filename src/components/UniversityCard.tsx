import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { CheckCircle, ExternalLink } from "lucide-react";

interface UniversityCardProps {
  id: string;
  name: string;
  logoSrc: string;
}

const UniversityCard = ({ id, name, logoSrc }: UniversityCardProps) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Card className="university-card group transform transition-all duration-300 hover:-translate-y-1">
          <CardContent className="flex flex-col items-center p-6 relative">
            <div className="w-28 h-28 rounded-full flex items-center justify-center p-2 mb-4 shadow-inner group-hover:scale-105 transition-transform duration-300">
              <div className="bg-white/90 dark:bg-white/70 w-full h-full rounded-full flex items-center justify-center overflow-hidden">
                <img 
                  src={logoSrc} 
                  alt={`${name} Logo`} 
                  className="w-20 h-20 object-contain" 
                />
              </div>
            </div>
            <h3 className="text-lg font-medium text-center mb-2 dark:text-white light:text-gray-800">{name}</h3>
            <div className="h-px w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-white/30 light:via-gray-400/50 my-2"></div>
            <Link to={`/vote/${id}`} className="mt-4 w-full">
              <button className="btn-vote w-full py-2 rounded-md ripple-effect group-hover:bg-voting-blue-light flex items-center justify-center">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  VOTE
                  <CheckCircle className="w-4 h-4 transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0" />
                </span>
              </button>
            </Link>
          </CardContent>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4 border text-white">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold gradient-text">{name}</h4>
            <ExternalLink className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-sm dark:text-gray-200 light:text-gray-700">
            Click to vote for your representatives at {name}. Your vote is secured by blockchain technology.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default UniversityCard;
