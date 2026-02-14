import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole, ROLE_LABELS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Activity, Stethoscope, Ambulance, UserCog, LayoutDashboard } from 'lucide-react';

const roleIcons: Record<UserRole, any> = {
  triage_nurse: Stethoscope,
  paramedic: Ambulance,
  doctor: Activity,
  admin: LayoutDashboard,
};

const roleDescriptions: Record<UserRole, string> = {
  triage_nurse: 'Register patients, assess symptoms, route to departments',
  paramedic: 'Pre-hospital triage with location & ETA tracking',
  doctor: 'View queue, diagnose, treat & update patient records',
  admin: 'Department oversight, queue management, analytics',
};

const rolePaths: Record<UserRole, string> = {
  triage_nurse: '/nurse',
  paramedic: '/paramedic',
  doctor: '/doctor',
  admin: '/admin',
};

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('triage_nurse');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, fullName, selectedRole);
        toast.success('Account created! Redirecting...');
        navigate(rolePaths[selectedRole]);
      } else {
        await signIn(email, password);
        toast.success('Welcome back!');
        // Navigate to index — useAuth + Index.tsx will handle role-based routing
        navigate('/');
      }
    } catch (e: any) {
      console.error('Auth error:', e);
      toast.error(e.message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/30 blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
            <Activity className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">MediTriage AI</h1>
          <p className="text-muted-foreground mt-1">Smart Patient Triage System</p>
        </div>

        <Card className="glass-elevated">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display">{isSignUp ? 'Create Account' : 'Sign In'}</CardTitle>
            <CardDescription>{isSignUp ? 'Select your role and create an account' : 'Access your dashboard'}</CardDescription>
          </CardHeader>
          <CardContent>
            {isSignUp && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {(Object.keys(ROLE_LABELS) as UserRole[]).map(role => {
                  const Icon = roleIcons[role];
                  return (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${selectedRole === role
                        ? 'border-primary bg-accent shadow-sm'
                        : 'border-border hover:border-primary/30'
                        }`}
                    >
                      <Icon className={`w-5 h-5 mb-1.5 ${selectedRole === role ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className="text-sm font-semibold text-foreground">{ROLE_LABELS[role]}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{roleDescriptions[role]}</p>
                    </button>
                  );
                })}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <Label>Full Name</Label>
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Dr. Jane Smith" required />
                </div>
              )}
              <div>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@hospital.com" required />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button className="text-sm text-primary hover:underline" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
