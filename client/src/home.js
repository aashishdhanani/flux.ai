import React from 'react';
import { Clock, Eye, Brain } from 'lucide-react';
import TransitionOverlay from './transistionOverlay';
import DashboardCard from './DashboardCard';
import './styles/Home.css';

const COLORS = {
  temporal: '#2D9CCE',
  future: '#B50D13',
  flux: '#D85116',
  timeline: '#E4801D',
  popular: '#F0A81A',
  savings: '#F7DC11'
};

const Header = () => (
  <div className="dashboard-header">
    <div className="header-content">
      <div>
        <h1 className="header-title">FLUX</h1>
        <p className="header-subtitle">"Shopping at 88mph"</p>
      </div>
    </div>
  </div>
);

const DashboardGrid = () => (
  <div className="dashboard-grid">
    <DashboardCard 
      title="Browsing Habits" 
      icon={Brain} 
      color={COLORS.future} 
      to="/categories"
    >
      <p className="card-description" style={{ color: COLORS.future }}>
        Categories of the products<br/>you have been searching for
      </p>
    </DashboardCard>

    <DashboardCard 
      title="Spending Analysis" 
      icon={Clock} 
      color={COLORS.timeline} 
      to="/spending"
    >
      <p className="card-description" style={{ color: COLORS.timeline }}>
        Your shopping patterns<br/>across time
      </p>
    </DashboardCard>

    <DashboardCard 
      title="Popular Dimensions" 
      icon={Eye} 
      color={COLORS.popular} 
      to="/patterns"
    >
      <p className="card-description" style={{ color: COLORS.popular }}>
        Most viewed<br/>categories
      </p>
    </DashboardCard>
  </div>
);

const Home = () => (
  <div className="dashboard-container">
    <Header />
    <DashboardGrid />
  </div>
);

export default Home;