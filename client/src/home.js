import React, { useState } from 'react';
import { Clock, Zap, Eye, Brain, PiggyBank } from 'lucide-react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

const DashboardCard = ({ title, icon: Icon, children, color }) => {
    const [isHovered, setIsHovered] = useState(false);
  
    return (
      <Card 
        className={`group relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 transition-all duration-300 w-100 ${
          isHovered ? 'transform scale-[1.02]' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated borders */}
        <div className="absolute inset-0 p-[2px] rounded-lg transition-opacity"
          style={{
            background: `linear-gradient(to right, ${color}, ${color}40)`,
            opacity: isHovered ? 1 : 0.3
          }}
        >
          <div className="h-full w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg" />
        </div>
  
        {/* Card Content */}
        <div className="relative z-10 p-6 h-[300px] flex flex-col">
          <CardContent className="p-0 mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="transition-transform duration-300" 
                style={{ color }}
              >
                <Icon 
                  size={32} 
                  className={`transition-all duration-300 ${isHovered ? 'scale-110' : ''}`} 
                />
              </div>
              <h2 
                className="text-2xl font-semibold font-mono transition-colors duration-300" 
                style={{ color }}
              >
                {title}
              </h2>
            </div>
          </CardContent>
  
          <CardContent className="p-0 flex-1 flex items-center justify-center">
            {children}
          </CardContent>
  
          {/* Hover Effects */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `linear-gradient(to bottom, transparent 0%, ${color}10 50%, transparent 100%)`,
              backgroundSize: '100% 200%',
              animation: 'scan 2s linear infinite'
            }}
          />
        </div>
      </Card>
    );
  };
  
  const Home = () => {
    const colors = {
      temporal: '#2D9CCE',
      future: '#B50D13',
      flux: '#D85116',
      timeline: '#E4801D',
      popular: '#F0A81A',
      savings: '#F7DC11'
    };
  
    return (
      <div className="min-h-screen bg-black">
        <style>
          {`
            @keyframes scan {
              0% { background-position: 0 -200%; }
              100% { background-position: 0 200%; }
            }
          `}
        </style>
  
        <div className="container mx-auto px-4 py-8">
          {/* Header Card */}
          <Card className="mb-8 bg-gradient-to-r from-[#B50D13] to-[#E4801D] border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F7DC11] to-[#B50D13] font-mono">
                    FLUX
                  </h1>
                  <p className="text-[#2D9CCE] font-mono">Your Time-Traveling Shopping Assistant</p>
                </div>
                <div className="text-4xl font-mono text-[#2D9CCE]">
                  88:88
                </div>
              </div>
            </CardContent>
          </Card>
  
          {/* Dashboard Cards Grid */}
          <div className="flex flex-col items-center">
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
              <DashboardCard title="Temporal Log" icon={Eye} color={colors.temporal}>
                <p className="text-[#2D9CCE] font-mono text-lg text-center">
                  Recently viewed items<br/>will appear here
                </p>
              </DashboardCard>
  
              <DashboardCard title="Future Picks" icon={Brain} color={colors.future}>
                <p className="font-mono text-lg text-center" style={{ color: colors.future }}>
                  AI-powered<br/>recommendations
                </p>
              </DashboardCard>
  
              <DashboardCard title="Flux Alerts" icon={Zap} color={colors.flux}>
                <p className="font-mono text-lg text-center" style={{ color: colors.flux }}>
                  Price changes<br/>across timelines
                </p>
              </DashboardCard>
  
              <DashboardCard title="Timeline Analysis" icon={Clock} color={colors.timeline}>
                <p className="font-mono text-lg text-center" style={{ color: colors.timeline }}>
                  Your shopping patterns<br/>across time
                </p>
              </DashboardCard>
  
              <DashboardCard title="Popular Dimensions" icon={Eye} color={colors.popular}>
                <p className="font-mono text-lg text-center" style={{ color: colors.popular }}>
                  Most viewed<br/>categories
                </p>
              </DashboardCard>
  
              <DashboardCard title="Temporal Savings" icon={PiggyBank} color={colors.savings}>
                <p className="font-mono text-lg text-center" style={{ color: colors.savings }}>
                  Cross-timeline<br/>deals
                </p>
              </DashboardCard>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default Home;