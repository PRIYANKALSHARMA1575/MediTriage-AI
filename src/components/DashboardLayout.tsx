import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ROLE_LABELS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { LogOut, Activity, User, Bell } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-elevated border-b">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg gradient-primary">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-foreground">MediTriage AI</h1>
              <p className="text-xs text-muted-foreground">Smart Patient Triage System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-destructive" />
            </Button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
              <User className="w-4 h-4 text-muted-foreground" />
              <div className="text-sm">
                <span className="font-medium text-foreground">{profile?.full_name || 'User'}</span>
                <span className="text-muted-foreground ml-1.5 text-xs">
                  {profile?.role ? ROLE_LABELS[profile.role] : ''}
                </span>
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}
