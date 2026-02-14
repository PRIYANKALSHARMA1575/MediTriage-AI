import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { CasesList } from '@/components/CasesList';
import { StatsCards } from '@/components/StatsCards';
import { TriageCase } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RiskBadge } from '@/components/RiskBadge';
import { toast } from 'sonner';
import { User, Brain, FileText, Pill, CalendarDays, MessageSquare, X } from 'lucide-react';
import { AIChatbot } from '@/components/AIChatbot';
import { useAuth } from '@/hooks/useAuth';

// ── Doctor Email → Department Mapping ──────────────────────────
// Each doctor only sees patients routed to their specialization.
const DOCTOR_DEPARTMENTS: Record<string, { name: string; departments: string[]; title: string }> = {
  'akhilv@gmail.com': { name: 'Dr. Akhil V', departments: ['Orthopedic Ward', 'Emergency - Orthopedic Ward'], title: 'Orthopedics' },
  'ramav@gmail.com': { name: 'Dr. Rama V', departments: ['General Medicine', 'Emergency - General Medicine'], title: 'General Medicine' },
  'riyav@gmail.com': { name: 'Dr. riya V', departments: ['Cardiology', 'Emergency - Cardiology'], title: 'Cardiology' },
  'josenav@gmail.com': { name: 'Dr. Josena V', departments: ['Neurology', 'Emergency - Neurology'], title: 'Neurology' },
  'angelv@gmail.com': { name: 'Dr. Angel V', departments: ['Pulmonology', 'Emergency - Pulmonology'], title: 'Pulmonology' },
  'ashv@gmail.com': { name: 'Dr. Ash V', departments: ['Emergency', 'Emergency - Emergency'], title: 'Emergency' },
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [selectedCase, setSelectedCase] = useState<TriageCase | null>(null);
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [medications, setMedications] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Resolve the current doctor's department scope
  const email = user?.email?.toLowerCase() || '';
  const doctorInfo = DOCTOR_DEPARTMENTS[email];
  const allowedDepartments = doctorInfo?.departments;
  const dashboardTitle = doctorInfo
    ? `${doctorInfo.name} — ${doctorInfo.title}`
    : 'Doctor Dashboard';
  const dashboardSubtitle = doctorInfo
    ? `Viewing ${doctorInfo.title} patient queue`
    : 'View prioritized queue, diagnose and treat patients';

  const handleSelectCase = (c: TriageCase) => {
    setSelectedCase(c);
    setTreatmentNotes(c.treatment_notes || '');
    setMedications(c.medications ? JSON.stringify(c.medications) : '');
    setFollowUpDate(c.follow_up_date || '');
    setFollowUpNotes(c.follow_up_notes || '');
  };

  const saveTreatment = async () => {
    if (!selectedCase) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('triage_cases').update({
        treatment_notes: treatmentNotes,
        medications: medications ? medications.split(',').map(m => m.trim()) : null,
        follow_up_date: followUpDate || null,
        follow_up_notes: followUpNotes || null,
        status: 'in_treatment',
      }).eq('id', selectedCase.id);

      if (error) throw error;
      toast.success('Treatment updated!');
      setSelectedCase(null);
    } catch (e: any) {
      toast.error(e.message || 'Error saving treatment');
    }
    setSaving(false);
  };

  const dischargePatient = async () => {
    if (!selectedCase) return;
    setSaving(true);
    try {
      await supabase.from('triage_cases').update({ status: 'discharged' }).eq('id', selectedCase.id);
      toast.success('Patient discharged');
      setSelectedCase(null);
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  };

  return (
    <DashboardLayout title={dashboardTitle} subtitle={dashboardSubtitle}>
      <StatsCards allowedDepartments={allowedDepartments} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <CasesList onSelectCase={handleSelectCase} showRunTriage={false} allowedDepartments={allowedDepartments} />

        <div className="space-y-4">
          {selectedCase ? (
            <>
              <Card className="glass-elevated animate-slide-in">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-display flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Patient Details
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedCase(null)}><X className="w-4 h-4" /></Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{(selectedCase as any).patients?.full_name}</span></div>
                    <div><span className="text-muted-foreground">Age:</span> <span className="font-medium">{(selectedCase as any).patients?.age}</span></div>
                    <div><span className="text-muted-foreground">Gender:</span> <span className="font-medium">{(selectedCase as any).patients?.gender}</span></div>
                    <div><span className="text-muted-foreground">BP:</span> <span className="font-medium">{(selectedCase as any).patients?.blood_pressure || '—'}</span></div>
                    <div><span className="text-muted-foreground">HR:</span> <span className="font-medium">{(selectedCase as any).patients?.heart_rate || '—'} bpm</span></div>
                    <div><span className="text-muted-foreground">SpO2:</span> <span className="font-medium">{(selectedCase as any).patients?.spo2 || '—'}%</span></div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Symptoms</p>
                    <p className="text-sm text-foreground">{selectedCase.symptoms}</p>
                  </div>

                  {selectedCase.risk_level && (
                    <div className="flex flex-col gap-2 pt-2 border-t text-sm">
                      <div className="flex items-center justify-between">
                        <RiskBadge level={selectedCase.risk_level} size="lg" showPulse />
                        <span className="font-semibold">{selectedCase.assigned_floor || 'Floor 1'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>→ {selectedCase.assigned_department || selectedCase.recommended_department}</span>
                        <span>•</span>
                        <span>Est. Wait: {selectedCase.estimated_wait_time || '—'}m</span>
                      </div>
                      <div className="text-xs font-semibold py-1 px-2 bg-muted rounded mt-1">
                        Doctor: {(selectedCase as any).assigned_doctor || 'On-call Physician'}
                      </div>
                    </div>
                  )}

                  {selectedCase.ai_confidence && (
                    <div className="pt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground uppercase tracking-wider">AI Confidence</span>
                        <span className="font-bold">{(selectedCase.ai_confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${selectedCase.ai_confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {selectedCase.ai_explanation && (
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="flex items-start gap-2">
                        <Brain className="w-4 h-4 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">AI Assessment</p>
                          <p className="text-sm text-muted-foreground">{selectedCase.ai_explanation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Treatment & Medication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Treatment Notes</Label>
                    <Textarea value={treatmentNotes} onChange={e => setTreatmentNotes(e.target.value)} placeholder="Enter diagnosis and treatment plan..." className="min-h-[80px]" />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1"><Pill className="w-3 h-3" /> Medications (comma-separated)</Label>
                    <Input value={medications} onChange={e => setMedications(e.target.value)} placeholder="Aspirin 75mg, Metoprolol 50mg" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Follow-up Date</Label><Input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} /></div>
                    <div><Label>Follow-up Notes</Label><Input value={followUpNotes} onChange={e => setFollowUpNotes(e.target.value)} placeholder="Review in 2 weeks" /></div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={saveTreatment} disabled={saving}>Save Treatment</Button>
                    <Button variant="outline" onClick={dischargePatient} disabled={saving}>Discharge</Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="glass-card">
              <CardContent className="py-16 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Select a patient from the queue to view details</p>
              </CardContent>
            </Card>
          )}

          <AIChatbot contextCase={selectedCase} />
        </div>
      </div>
    </DashboardLayout>
  );
}
