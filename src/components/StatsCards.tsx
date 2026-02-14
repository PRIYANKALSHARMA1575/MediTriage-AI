import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, AlertTriangle, Clock, Activity } from 'lucide-react';

interface StatsCardsProps {
  allowedDepartments?: string[];
}

export function StatsCards({ allowedDepartments }: StatsCardsProps) {
  const [stats, setStats] = useState({ total: 0, critical: 0, pending: 0, inTreatment: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      let query = supabase.from('triage_cases').select('risk_level, status, assigned_department, recommended_department');

      const { data: cases } = await query;

      if (cases) {
        const filteredCases = allowedDepartments
          ? cases.filter(c => allowedDepartments.includes(c.assigned_department || c.recommended_department || ''))
          : cases;

        setStats({
          total: filteredCases.length,
          critical: filteredCases.filter(c => c.risk_level === 'critical' || c.risk_level === 'high').length,
          pending: filteredCases.filter(c => c.status === 'pending').length,
          inTreatment: filteredCases.filter(c => c.status === 'in_treatment').length,
        });
      }
    };
    fetchStats();
  }, [allowedDepartments]);

  const cards = [
    { label: 'Total Cases', value: stats.total, icon: Users, color: 'text-primary' },
    { label: 'Critical/High', value: stats.critical, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Pending Triage', value: stats.pending, icon: Clock, color: 'text-risk-medium' },
    { label: 'In Treatment', value: stats.inTreatment, icon: Activity, color: 'text-risk-low' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.label} className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <c.icon className={`w-5 h-5 ${c.color}`} />
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{c.value}</p>
          <p className="text-sm text-muted-foreground">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
