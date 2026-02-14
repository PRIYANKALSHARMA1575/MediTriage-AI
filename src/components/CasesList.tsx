import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TriageCase } from '@/lib/types';
import { RiskBadge } from './RiskBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Brain, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface CasesListProps {
  onRunTriage?: (caseItem: TriageCase) => void;
  onSelectCase?: (caseItem: TriageCase) => void;
  filterDepartment?: string;
  allowedDepartments?: string[];
  showRunTriage?: boolean;
}

export function CasesList({ onRunTriage, onSelectCase, filterDepartment, allowedDepartments, showRunTriage = true }: CasesListProps) {
  const [cases, setCases] = useState<TriageCase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    setLoading(true);
    let query = supabase
      .from('triage_cases')
      .select('*, patients(*)')
      .neq('status', 'discharged')
      .order('created_at', { ascending: false });

    if (filterDepartment) {
      query = query.eq('assigned_department', filterDepartment);
    } else if (allowedDepartments && allowedDepartments.length > 0) {
      // Filter cases where assigned_department OR recommended_department is in the allowed list
      const depString = allowedDepartments.map(d => `assigned_department.eq."${d}",recommended_department.eq."${d}"`).join(',');
      query = query.or(depString);
    }

    const { data, error } = await query;
    if (error) {
      toast.error('Error fetching cases');
    } else {
      setCases((data || []) as unknown as TriageCase[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCases();
    // Realtime subscription
    const channel = supabase
      .channel('triage-cases-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'triage_cases' }, () => {
        fetchCases();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [filterDepartment]);

  const statusColors: Record<string, string> = {
    pending: 'bg-muted text-muted-foreground',
    triaged: 'bg-accent text-accent-foreground',
    routed: 'bg-primary/10 text-primary',
    in_treatment: 'bg-risk-medium-bg text-amber-700',
    completed: 'bg-risk-low-bg text-green-700',
    discharged: 'bg-secondary text-secondary-foreground',
  };

  const riskOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedCases = [...cases].sort((a, b) => {
    const ra = riskOrder[a.risk_level || 'low'] ?? 4;
    const rb = riskOrder[b.risk_level || 'low'] ?? 4;
    return ra - rb;
  });

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Patient Queue
          <Badge variant="secondary">{cases.length}</Badge>
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={fetchCases}><RefreshCw className="w-4 h-4" /></Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading cases...</div>
        ) : cases.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No cases found</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Symptoms</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Wait</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCases.map(c => (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onSelectCase?.(c)}>
                    <TableCell className="font-medium">
                      {(c as any).patients?.full_name || 'Unknown'}
                      <br /><span className="text-xs text-muted-foreground">{(c as any).patients?.patient_id}</span>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">{c.symptoms}</TableCell>
                    <TableCell>{c.risk_level ? <RiskBadge level={c.risk_level} size="sm" showPulse /> : <span className="text-muted-foreground text-xs">Pending</span>}</TableCell>
                    <TableCell className="text-sm">{c.assigned_department || c.recommended_department || '—'}</TableCell>
                    <TableCell><Badge className={statusColors[c.status] || ''}>{c.status}</Badge></TableCell>
                    <TableCell className="text-sm">{c.estimated_wait_time ? `~${c.estimated_wait_time}m` : '—'}</TableCell>
                    <TableCell>
                      {showRunTriage && c.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onRunTriage?.(c); }}>
                          <Brain className="w-3 h-3 mr-1" /> Triage
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
