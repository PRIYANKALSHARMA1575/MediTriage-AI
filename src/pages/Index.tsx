import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const rolePaths: Record<string, string> = {
  triage_nurse: '/nurse',
  paramedic: '/paramedic',
  doctor: '/doctor',
  admin: '/admin',
};

const Index = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
    } else if (profile?.role) {
      navigate(rolePaths[profile.role] || '/nurse');
    } else {
      // User is logged in but profile couldn't be fetched — go to nurse as fallback
      navigate('/nurse');
    }
  }, [user, profile, loading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center animate-pulse-slow">
        <div className="w-12 h-12 rounded-xl gradient-primary mx-auto mb-4 flex items-center justify-center">
          <svg className="w-6 h-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <p className="text-muted-foreground">Loading MediTriage AI...</p>
      </div>
    </div>
  );
};

export default Index;
