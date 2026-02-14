import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PatientForm } from '@/components/PatientForm';
import { CasesList } from '@/components/CasesList';
import { StatsCards } from '@/components/StatsCards';
import { TriageResultCard } from '@/components/TriageResultCard';
import { TriageCase, TriageResult } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, List, MessageSquare } from 'lucide-react';
import { AIChatbot } from '@/components/AIChatbot';

export default function ParamedicDashboard() {
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);

  const runTriage = async (caseItem: TriageCase) => {
    toast.info('Running AI triage...');
    try {
      const patient = (caseItem as any).patients;
      const { data, error } = await supabase.functions.invoke('triage-ai', {
        body: {
          symptoms: caseItem.symptoms,
          age: patient?.age,
          gender: patient?.gender,
          blood_pressure: patient?.blood_pressure,
          heart_rate: patient?.heart_rate,
          temperature: patient?.temperature,
          spo2: patient?.spo2,
          pre_existing_conditions: patient?.pre_existing_conditions,
          allergies: patient?.allergies,
          paramedic_location: caseItem.paramedic_location,
          ambulance_id: caseItem.ambulance_id,
          eta_minutes: caseItem.eta_minutes,
        },
      });
      if (error) throw error;
      const result: TriageResult = data;
      setTriageResult(result);
      await supabase.from('triage_cases').update({
        risk_level: result.risk_level,
        recommended_department: result.recommended_department,
        ai_explanation: result.explanation,
        ai_confidence: result.confidence,
        ai_contributing_factors: result.contributing_factors,
        status: 'triaged',
        assigned_department: result.recommended_department,
        estimated_wait_time: (caseItem.eta_minutes || 0) + (result.risk_level === 'critical' ? 0 : 10),
      }).eq('id', caseItem.id);
      toast.success('Triage complete! Department pre-allocated.');
    } catch (e: any) {
      toast.error(e.message || 'Triage failed');
    }
  };

  return (
    <DashboardLayout title="Paramedic Dashboard" subtitle="Pre-hospital triage with location tracking">
      <StatsCards />
      <Tabs defaultValue="register" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="register"><UserPlus className="w-4 h-4 mr-1" /> Patient / Case</TabsTrigger>
          <TabsTrigger value="queue"><List className="w-4 h-4 mr-1" /> Cases</TabsTrigger>
          <TabsTrigger value="chat"><MessageSquare className="w-4 h-4 mr-1" /> AI Chatbot</TabsTrigger>
        </TabsList>
        <TabsContent value="register" className="space-y-4">
          <PatientForm isParamedic />
          {triageResult && <TriageResultCard result={triageResult} />}
        </TabsContent>
        <TabsContent value="queue"><CasesList onRunTriage={runTriage} /></TabsContent>
        <TabsContent value="chat"><AIChatbot /></TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
