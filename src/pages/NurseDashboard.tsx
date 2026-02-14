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
import { UserPlus, List, MessageSquare, Trash2, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AIChatbot } from '@/components/AIChatbot';

export default function NurseDashboard() {
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);

  const runTriage = async (caseItem: TriageCase) => {
    toast.info('Running AI triage analysis...');
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
        },
      });

      if (error) throw error;

      const result: TriageResult = data;
      setTriageResult(result);

      // Update case with AI results
      await supabase.from('triage_cases').update({
        risk_level: result.risk_level,
        recommended_department: result.recommended_department,
        ai_explanation: result.explanation,
        ai_confidence: result.confidence,
        ai_contributing_factors: result.contributing_factors,
        status: 'triaged',
        assigned_department: result.recommended_department,
        estimated_wait_time: result.risk_level === 'critical' ? 0 : result.risk_level === 'high' ? 5 : result.risk_level === 'medium' ? 15 : 30,
      }).eq('id', caseItem.id);

      toast.success('Triage complete!');
    } catch (e: any) {
      toast.error(e.message || 'AI triage failed');
    }
  };

  const seedQueue = async () => {
    toast.info('Seeding demo data...');
    try {
      const demoPatients = [
        {
          patient_id: 'PT-0001',
          full_name: 'Rajesh Kumar',
          age: 35,
          gender: 'male',
          phone: '+91 99887 76655',
          email: 'rajesh.k@demo.in',
          pre_existing_conditions: [],
          allergies: ['Penicillin'],
          blood_pressure: '128/84',
          heart_rate: 82,
          temperature: 98.6,
          spo2: 99,
          triage: {
            symptoms: 'Severe pain in right knee following fall. Notable swelling and restricted range of motion. Patient unable to bear weight.',
            risk_level: 'medium',
            recommended_department: 'Orthopedic Ward',
            ai_explanation: 'Moderate Risk – Knee injury with significant mechanical limitation. High probability of ligamentous or meniscal injury.',
            ai_confidence: 0.94,
            assigned_doctor: 'Orthopedic Resident',
            assigned_floor: 'Floor 2',
            estimated_wait_time: 25,
          }
        },
        {
          patient_id: 'PT-0002',
          full_name: 'Vikram Shah',
          age: 42,
          gender: 'male',
          phone: '+91 99776 65544',
          email: 'vikram.s@demo.in',
          pre_existing_conditions: ['Hypertension'],
          allergies: [],
          blood_pressure: '135/88',
          heart_rate: 78,
          temperature: 98.2,
          spo2: 98,
          triage: {
            symptoms: 'Suspected shoulder dislocation. Intense pain after slipping on ice. Visible deformity at joint.',
            risk_level: 'medium',
            recommended_department: 'Orthopedic Ward',
            ai_explanation: 'Moderate Risk – Acute shoulder deformity and pain. High suspicion of anterior dislocation.',
            ai_confidence: 0.94,
            assigned_doctor: 'Orthopedic Resident',
            assigned_floor: 'Floor 2',
            estimated_wait_time: 25,
          }
        },
        {
          patient_id: 'PT-SM-99',
          full_name: 'Sanjay Malhotra',
          age: 28,
          gender: 'male',
          phone: '+91 91234 56789',
          email: 'sanjay.m@demo.in',
          pre_existing_conditions: [],
          allergies: [],
          blood_pressure: '115/75',
          heart_rate: 88,
          temperature: 98.4,
          spo2: 98,
          triage: {
            symptoms: 'Motorcycle accident. Skidded on wet road. Abrasion on left arm and leg. Severe pain in right ankle, possible fracture. Vitals stable.',
            risk_level: 'medium',
            recommended_department: 'Orthopedic Ward',
            ai_explanation: 'Moderate Risk – Right ankle injury following motorcycle accident. Vitals are stable, but severe pain and swelling suggest a potential fracture.',
            ai_confidence: 0.94,
            assigned_doctor: 'Orthopedic Resident',
            assigned_floor: 'Floor 2',
            estimated_wait_time: 25,
            paramedic_location: 'KANINI SOFTWARE SOLUTION SHOLINGANALLUR',
            ambulance_id: 'AMB-998'
          }
        },
        {
          patient_id: 'PT-0003',
          full_name: 'Arjun Mehra',
          age: 29,
          gender: 'male',
          phone: '+91 99665 54433',
          email: 'arjun.m@demo.in',
          pre_existing_conditions: [],
          allergies: [],
          blood_pressure: '122/80',
          heart_rate: 75,
          temperature: 98.4,
          spo2: 99,
          triage: {
            symptoms: 'Minor wrist sprain while playing badminton. Slight swelling, no deformity. Able to move fingers freely.',
            risk_level: 'low',
            recommended_department: 'Orthopedic Ward',
            ai_explanation: 'Low Risk – Minor musculoskeletal injury. No signs of fracture or neurovascular compromise. Symptoms consistent with a simple sprain.',
            ai_confidence: 0.91,
            assigned_doctor: 'Orthopedic Resident',
            assigned_floor: 'Floor 2',
            estimated_wait_time: 45,
          }
        },
        {
          patient_id: 'PT-0004',
          full_name: 'Meera Nair',
          age: 68,
          gender: 'female',
          phone: '+91 98877 66554',
          email: 'meera.n@demo.in',
          pre_existing_conditions: [],
          allergies: [],
          blood_pressure: '145/90',
          heart_rate: 88,
          temperature: 98.8,
          spo2: 97,
          triage: {
            symptoms: 'Suspected hip fracture after fall in bathroom. Severe pain in groin area, unable to move right leg. Leg appears shortened and externally rotated.',
            risk_level: 'high',
            recommended_department: 'Orthopedic Ward',
            ai_explanation: 'High Risk – Clinical presentation highly suggestive of a femoral neck or intertrochanteric fracture. Requires immediate stabilization and surgical consultation.',
            ai_confidence: 0.96,
            assigned_doctor: 'Orthopedic Surgeon on Call',
            assigned_floor: 'Floor 2',
            estimated_wait_time: 15,
          }
        },
        {
          patient_id: 'PT-0005',
          full_name: 'Rahul Varma',
          age: 34,
          gender: 'male',
          phone: '+91 97766 55443',
          email: 'rahul.v@demo.in',
          pre_existing_conditions: [],
          allergies: ['NSAIDs'],
          blood_pressure: '122/80',
          heart_rate: 76,
          temperature: 98.4,
          spo2: 99,
          triage: {
            symptoms: 'Sudden "pop" heard while playing football. Immediate swelling and instability in left knee. Positive Lachman test suspected.',
            risk_level: 'medium',
            recommended_department: 'Orthopedic Ward',
            ai_explanation: 'Moderate Risk – Mechanism of injury and physical signs point to an acute ACL tear. Requires MRI and specialist orthopedic evaluation for reconstruction planning.',
            ai_confidence: 0.93,
            assigned_doctor: 'Sports Medicine Specialist',
            assigned_floor: 'Floor 2',
            estimated_wait_time: 30,
          }
        },
        {
          patient_id: 'PT-0006',
          full_name: 'Priya Sharma',
          age: 23,
          gender: 'female',
          phone: '+91 96655 44332',
          email: 'priya.s@demo.in',
          pre_existing_conditions: [],
          allergies: ['Dust'],
          blood_pressure: '118/76',
          heart_rate: 72,
          temperature: 98.6,
          spo2: 99,
          triage: {
            symptoms: 'Twisted right ankle while walking downstairs. Mild swelling and pain over lateral malleolus. Able to bear some weight but with discomfort.',
            risk_level: 'low',
            recommended_department: 'Orthopedic Ward',
            ai_explanation: 'Low Risk – Likely Grade I or II ankle sprain. No obvious signs of fracture. Management includes RICE protocol and follow-up if pain persists.',
            ai_confidence: 0.91,
            assigned_doctor: 'Orthopedic Consultant',
            assigned_floor: 'Floor 2',
            estimated_wait_time: 50,
          }
        }
      ];

      for (const p of demoPatients) {
        const { triage, ...patientData } = p;

        // Upsert patient
        const { data: patient, error: pError } = await supabase
          .from('patients')
          .upsert(patientData, { onConflict: 'patient_id' })
          .select()
          .single();

        if (pError) throw pError;

        // Insert triage case
        const { error: cError } = await supabase.from('triage_cases').insert({
          patient_id: patient.id,
          symptoms: triage.symptoms,
          risk_level: triage.risk_level,
          recommended_department: triage.recommended_department,
          assigned_department: triage.recommended_department,
          ai_explanation: triage.ai_explanation,
          ai_confidence: triage.ai_confidence,
          assigned_doctor: triage.assigned_doctor,
          assigned_floor: triage.assigned_floor,
          estimated_wait_time: triage.estimated_wait_time,
          paramedic_location: (triage as any).paramedic_location,
          ambulance_id: (triage as any).ambulance_id,
          status: 'triaged'
        });

        if (cError) throw cError;
      }

      toast.success('Demo queue seeded successfully!');
    } catch (e: any) {
      toast.error('Failed to seed queue: ' + e.message);
    }
  };

  const clearQueue = async () => {
    if (!confirm('Are you sure you want to clear the entire patient queue? This cannot be undone.')) return;

    try {
      const { error } = await supabase.from('triage_cases').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) {
        console.warn('Delete policy might be missing, attempting soft clear...');
        const { error: updateError } = await supabase.from('triage_cases').update({ status: 'discharged' }).neq('id', '00000000-0000-0000-0000-000000000000');
        if (updateError) throw updateError;
        toast.info('Queue cleared (all patients archived)');
      } else {
        toast.success('Patient queue cleared successfully');
      }
    } catch (e: any) {
      toast.error('Failed to clear queue: ' + e.message);
    }
  };

  return (
    <DashboardLayout title="Triage Nurse Dashboard" subtitle="Register patients, assess symptoms, and route to departments">
      <StatsCards />

      <Tabs defaultValue="register" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="register"><UserPlus className="w-4 h-4 mr-1" /> Register / Case</TabsTrigger>
          <TabsTrigger value="queue"><List className="w-4 h-4 mr-1" /> Patient Queue</TabsTrigger>
          <TabsTrigger value="chat"><MessageSquare className="w-4 h-4 mr-1" /> AI Chatbot</TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="space-y-4">
          <PatientForm />
          {triageResult && <TriageResultCard result={triageResult} />}
        </TabsContent>

        <TabsContent value="queue">
          <div className="flex justify-end mb-4 gap-2">
            <Button variant="outline" size="sm" onClick={seedQueue} className="flex items-center gap-2">
              <Database className="w-4 h-4" /> Seed Demo Queue
            </Button>
            <Button variant="destructive" size="sm" onClick={clearQueue} className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Clear Queue
            </Button>
          </div>
          <CasesList onRunTriage={runTriage} />
        </TabsContent>

        <TabsContent value="chat">
          <AIChatbot />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
