import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { CasesList } from '@/components/CasesList';
import { StatsCards } from '@/components/StatsCards';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Clock, Trash2, Database, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AdminDashboard() {
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [deptStats, setDeptStats] = useState<Record<string, { total: number; waiting: number; avgWait: number }>>({});
  const [demographics, setDemographics] = useState<{
    ageGroups: { name: string; value: number }[];
    genderDist: { name: string; value: number }[];
    totalPatients: number
  }>({
    ageGroups: [],
    genderDist: [],
    totalPatients: 0
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const fetchDemographics = async () => {
    const { data: patients } = await supabase.from('patients').select('age, gender');
    if (patients) {
      const ageCount = { '0-18': 0, '19-40': 0, '41-60': 0, '60+': 0 };
      const genderCount: Record<string, number> = {};

      patients.forEach(p => {
        // Gender
        const gender = p.gender.charAt(0).toUpperCase() + p.gender.slice(1).toLowerCase();
        genderCount[gender] = (genderCount[gender] || 0) + 1;

        // Age
        if (p.age <= 18) ageCount['0-18']++;
        else if (p.age <= 40) ageCount['19-40']++;
        else if (p.age <= 60) ageCount['41-60']++;
        else ageCount['60+']++;
      });

      setDemographics({
        ageGroups: Object.entries(ageCount).map(([name, value]) => ({ name, value })),
        genderDist: Object.entries(genderCount).map(([name, value]) => ({ name, value })),
        totalPatients: patients.length
      });
    }
  };

  const fetchDeptStats = async () => {
    const { data } = await supabase.from('triage_cases').select('assigned_department, status, estimated_wait_time');
    if (data) {
      const stats: Record<string, { total: number; waiting: number; avgWait: number }> = {};
      data.forEach(c => {
        const dept = c.assigned_department || 'Unassigned';
        if (!stats[dept]) stats[dept] = { total: 0, waiting: 0, avgWait: 0 };
        stats[dept].total++;
        if (['pending', 'triaged', 'routed'].includes(c.status)) {
          stats[dept].waiting++;
          stats[dept].avgWait += c.estimated_wait_time || 0;
        }
      });
      Object.keys(stats).forEach(k => {
        if (stats[k].waiting > 0) stats[k].avgWait = Math.round(stats[k].avgWait / stats[k].waiting);
      });
      setDeptStats(stats);
    } else {
      setDeptStats({});
    }
  };

  useEffect(() => {
    fetchDeptStats();
    fetchDemographics();

    // Listen for changes
    const casesChannel = supabase.channel('admin-stats-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'triage_cases' }, () => {
        fetchDeptStats();
      })
      .subscribe();

    const patientsChannel = supabase.channel('admin-patients-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, () => {
        fetchDemographics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(casesChannel);
      supabase.removeChannel(patientsChannel);
    };
  }, []);

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
          pre_existing_conditions: ['Osteoporosis'],
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
          pre_existing_conditions: ['None'],
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
          pre_existing_conditions: ['None'],
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
      fetchDeptStats();
    } catch (e: any) {
      toast.error('Failed to seed queue: ' + e.message);
    }
  };

  const clearQueue = async () => {
    if (!confirm('Are you sure you want to clear the entire patient queue? This cannot be undone.')) return;

    try {
      // Deleting with a condition that always matches everything if we have the schema permissions
      const { error } = await supabase.from('triage_cases').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) {
        console.warn('Delete policy might be missing, attempting soft clear...');
        const { error: updateError } = await supabase.from('triage_cases').update({ status: 'discharged' }).neq('id', '00000000-0000-0000-0000-000000000000');
        if (updateError) throw updateError;
        toast.info('Queue cleared (all patients archived)');
      } else {
        toast.success('Patient queue cleared successfully');
      }
      fetchDeptStats();
      setSelectedDept('');
    } catch (e: any) {
      toast.error('Failed to clear queue: ' + e.message);
    }
  };

  return (
    <DashboardLayout title="Department Admin" subtitle="Real-time queue management and department insights">
      <div className="flex justify-end mb-4 gap-2">
        <Button variant="outline" size="sm" onClick={seedQueue} className="flex items-center gap-2">
          <Database className="w-4 h-4" /> Seed Demo Queue
        </Button>
        <Button variant="destructive" size="sm" onClick={clearQueue} className="flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Clear All Data
        </Button>
      </div>

      <StatsCards />

      <Card className="glass-card mt-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Hybrid ML-LLM Triage Active</p>
              <p className="text-xs text-muted-foreground">Random Forest + Gemini 2.0 Flash</p>
            </div>
          </div>
          <div className="flex gap-4 text-xs font-medium">
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground">ML Logic</span>
              <span className="text-primary text-[10px]">Deterministic/ML-First</span>
            </div>
            <div className="flex flex-col items-end border-l pl-4 border-border/50">
              <span className="text-muted-foreground">Explainability</span>
              <span className="text-green-600 text-[10px]">SHAP/Feature Weights</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="glass-card">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Patient Demographics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[250px]">
              <div className="flex flex-col items-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Gender Distribution</p>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={demographics.genderDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {demographics.genderDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: 'none', fontSize: '10px' }}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Age Groups</p>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demographics.ageGroups}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: 'none', fontSize: '10px' }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Department Analytics
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(deptStats).map(([name, stats]) => ({ name, total: stats.total, avgWait: stats.avgWait }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: 'none', fontSize: '10px' }}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="total" name="Patient Volume" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="avgWait" name="Avg Wait (min)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
              {Object.entries(deptStats).map(([dept, stats]) => (
                <Badge
                  key={dept}
                  variant={selectedDept === dept ? 'default' : 'secondary'}
                  className="cursor-pointer text-[10px]"
                  onClick={() => setSelectedDept(dept === selectedDept ? '' : dept)}
                >
                  {dept}: {stats.total}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <CasesList filterDepartment={selectedDept || undefined} showRunTriage={false} />
      </div>
    </DashboardLayout>
  );
}
