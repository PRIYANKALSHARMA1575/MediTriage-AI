import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { UserPlus, Search, Mic, MicOff, Upload, FileText, X, Activity, MapPin, Globe } from 'lucide-react';

import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useEffect } from 'react';

interface PatientFormProps {
  onPatientCreated?: (patientId: string) => void;
  isParamedic?: boolean;
}

export function PatientForm({ onPatientCreated, isParamedic = false }: PatientFormProps) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const handleModeChange = (newMode: 'new' | 'existing') => {
    setMode(newMode);
    setShowDemoDocs(false);
    setForm({
      patient_id: '',
      full_name: '',
      age: '',
      gender: '',
      phone: '',
      email: '',
      blood_pressure: '',
      heart_rate: '',
      temperature: '',
      spo2: '',
      pre_existing_conditions: '',
      allergies: '',
      symptoms: '',
      paramedic_location: '',
      ambulance_id: '',
      eta_minutes: '',
    });
    setEmrFile(null);
    setEhrFile(null);
  };
  const [searchId, setSearchId] = useState('');


  const [baseSymptoms, setBaseSymptoms] = useState('');

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const [language, setLanguage] = useState('en-US');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    patient_id: '',
    full_name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    blood_pressure: '',
    heart_rate: '',
    temperature: '',
    spo2: '',
    pre_existing_conditions: '',
    allergies: '',
    symptoms: '',
    // Paramedic specific
    paramedic_location: '',
    ambulance_id: '',
    eta_minutes: '',
  });
  const [emrFile, setEmrFile] = useState<File | null>(null);
  const [ehrFile, setEhrFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDemoDocs, setShowDemoDocs] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  const trackLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);
    toast.info('Requesting location access...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Log real coordinates for debug/demo realism
        console.log('Location granted:', position.coords.latitude, position.coords.longitude);

        // Simulate short delay for demo feel
        setTimeout(() => {
          setForm(f => ({
            ...f,
            paramedic_location: 'KANINI SOFTWARE SOLUTION SHOLINGANALLUR (Detected GPS)',
            eta_minutes: '12',
          }));
          setIsTracking(false);
          toast.success('Location detected successfully');
        }, 1000);
      },
      (error) => {
        console.warn('Location access denied:', error.message);
        toast.warning('Location access denied. Using demo coordinates.');

        setTimeout(() => {
          setForm(f => ({
            ...f,
            paramedic_location: 'KANINI SOFTWARE SOLUTION SHOLINGANALLUR (Demo Fallback)',
            eta_minutes: '15',
          }));
          setIsTracking(false);
        }, 1000);
      }
    );
  };

  const searchPatient = async () => {
    if (!searchId.trim()) return;
    setLoading(true);
    const { data, error } = await supabase.from('patients').select('*').eq('patient_id', searchId.trim()).maybeSingle();

    // Demo Mode: If random ID or not found, populate with static demo data
    if (error || !data) {
      if (searchId.trim() === 'PT-0001') {
        setForm(f => ({
          ...f,
          full_name: 'Rajesh Kumar',
          age: '35',
          gender: 'male',
          phone: '+91 99887 76655',
          patient_id: 'PT-0001',
          blood_pressure: '128/84',
          heart_rate: '82',
          temperature: '98.6',
          spo2: '99',
          pre_existing_conditions: 'None',
          allergies: 'Penicillin',
          symptoms: '',
          email: 'rajesh.k@demo.in',
        }));
      } else if (searchId.trim() === 'PT-0002') {
        setForm(f => ({
          ...f,
          full_name: 'Vikram Shah',
          age: '42',
          gender: 'male',
          phone: '+91 99776 65544',
          patient_id: 'PT-0002',
          blood_pressure: '135/88',
          heart_rate: '78',
          temperature: '98.2',
          spo2: '98',
          pre_existing_conditions: 'Hypertension',
          allergies: 'None',
          symptoms: '',
          email: 'vikram.s@demo.in',
        }));
      } else if (searchId.trim() === 'PT-0003') {
        setForm(f => ({
          ...f,
          full_name: 'Arjun Mehra',
          age: '29',
          gender: 'male',
          phone: '+91 99665 54433',
          patient_id: 'PT-0003',
          blood_pressure: '122/80',
          heart_rate: '75',
          temperature: '98.4',
          spo2: '99',
          pre_existing_conditions: 'None',
          allergies: 'None',
          symptoms: '',
          email: 'arjun.m@demo.in',
        }));
      } else if (isParamedic) {
        setForm(f => ({
          ...f,
          full_name: 'Sanjay Malhotra',
          age: '28',
          gender: 'male',
          phone: '+91 91234 56789',
          patient_id: searchId.trim(),
          blood_pressure: '115/75',
          heart_rate: '88',
          temperature: '98.4',
          spo2: '98',
          pre_existing_conditions: 'None',
          allergies: 'None',
          symptoms: '',
          email: 'sanjay.m@demo.in',
          paramedic_location: '',
          ambulance_id: 'AMB-998',
          eta_minutes: '',
        }));
      } else {
        setForm(f => ({
          ...f, // Preserve existing form state
          full_name: 'Karan Singh',
          age: '52',
          gender: 'male',
          phone: '+91 99554 43322',
          patient_id: searchId.trim(), // Use the searched ID
          blood_pressure: '138/92',
          heart_rate: '80',
          temperature: '98.6',
          spo2: '98',
          pre_existing_conditions: 'Lumbar Disc Herniation (2018)',
          allergies: 'None',
          symptoms: '', // Clear symptoms for new case
          email: 'karan.s@demo.in', // Clear email for demo
          paramedic_location: '',
          ambulance_id: '',
          eta_minutes: '',
        }));
      }
      setShowDemoDocs(true);
      toast.info('Patient history & documents auto-populated (Demo Mode)');
    } else {
      setForm(f => ({
        ...f, // Preserve existing form state
        patient_id: data.patient_id,
        full_name: data.full_name,
        age: String(data.age),
        gender: data.gender,
        phone: data.phone || '',
        email: data.email || '',
        blood_pressure: data.blood_pressure || '',
        heart_rate: data.heart_rate ? String(data.heart_rate) : '',
        temperature: data.temperature ? String(data.temperature) : '',
        spo2: data.spo2 ? String(data.spo2) : '',
        pre_existing_conditions: (data.pre_existing_conditions || []).join(', '),
        allergies: (data.allergies || []).join(', '),
        symptoms: '', // Clear symptoms for new case
        paramedic_location: '',
        ambulance_id: '',
        eta_minutes: '',
      }));
      toast.success('Patient found! Data auto-populated.');
    }
    setLoading(false);
  };

  const generatePatientId = () => {
    const id = `PT-${Date.now().toString(36).toUpperCase()}`;
    setForm(f => ({ ...f, patient_id: id }));
  };

  // Sync transcript to form symptoms while listening
  useEffect(() => {
    if (listening) {
      const spacer = baseSymptoms && !baseSymptoms.endsWith(' ') ? ' ' : '';
      setForm(prev => ({
        ...prev,
        symptoms: baseSymptoms + spacer + transcript
      }));
    }
  }, [transcript, listening, baseSymptoms]);

  // When listening stops, we don't need to do anything special as the form state 
  // already holds the final text. We just verify.

  const toggleVoiceInput = async () => {
    if (!browserSupportsSpeechRecognition) {
      toast.error('Browser does not support speech recognition. Try using Chrome or Edge.');
      return;
    }

    if (listening) {
      SpeechRecognition.stopListening();
      toast.info('Voice input stopped.');
    } else {
      // Explicitly request microphone permission to ensure prompt appears
      try {
        console.log('Requesting microphone access...');
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone access granted');

        // Capture current text snapshot
        setBaseSymptoms(form.symptoms);
        resetTranscript();

        await SpeechRecognition.startListening({ continuous: true, language });
        toast.info(`Listening in ${getLanguageName(language)}...`);
      } catch (err) {
        console.error('Microphone permission or start error:', err);
        toast.error('Microphone access denied or error starting. Please check browser settings.');
      }
    }
  };

  const getLanguageName = (code: string) => {
    const langs: Record<string, string> = {
      'en-US': 'English',
      'ta-IN': 'Tamil',
      'hi-IN': 'Hindi',
      'es-ES': 'Spanish',
      'fr-FR': 'French',
      'te-IN': 'Telugu',
      'ml-IN': 'Malayalam',
      'kn-IN': 'Kannada'
    };
    return langs[code] || code;
  };

  const uploadDocument = async (file: File, patientId: string, documentType: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${patientId}/${documentType}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('patient-documents')
      .upload(filePath, file);

    if (uploadError) {
      if (uploadError.message.includes('bucket not found')) {
        // This is a placeholder for where bucket creation or better error handling would go
        // In a real environment, the bucket should be pre-created
        throw new Error('Storage bucket "patient-documents" not found. Please create it in Supabase dashboard.');
      }
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('patient-documents')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from('patient_documents')
      .insert({
        patient_id: patientId,
        document_name: file.name,
        document_type: documentType,
        document_url: publicUrl,
        uploaded_by: user?.id
      });

    if (dbError) throw dbError;
  };

  const sendSimulatedSMS = (phone: string, floor: string, waitTime: number) => {
    toast.info(`SMS Sent to ${phone}: "Please proceed to ${floor}. Your estimated wait time is ${waitTime} minutes."`, {
      duration: 5000,
      icon: <Activity className="w-4 h-4 text-primary" />
    });
  };

  const handleSubmit = async () => {
    if (!form.full_name || !form.age || !form.gender || !form.patient_id) {
      toast.error('Please fill required fields');
      return;
    }

    if (!profile) {
      // Retry: profile may still be loading from the trigger
      toast.info('Loading user profile, please wait...');
      await new Promise(r => setTimeout(r, 1500));
      // Re-check after wait — useAuth may have updated profile by now
      const { data: freshProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id || '')
        .maybeSingle();
      if (!freshProfile) {
        toast.error('User profile not found. Please sign out and sign back in.');
        return;
      }
    }

    setLoading(true);
    setIsUploading(true);
    try {
      // Upsert patient
      const patientData = {
        patient_id: form.patient_id,
        full_name: form.full_name,
        age: parseInt(form.age),
        gender: form.gender,
        phone: form.phone || null,
        email: form.email || null,
        blood_pressure: form.blood_pressure || null,
        heart_rate: form.heart_rate ? parseInt(form.heart_rate) : null,
        temperature: form.temperature ? parseFloat(form.temperature) : null,
        spo2: form.spo2 ? parseInt(form.spo2) : null,
        pre_existing_conditions: form.pre_existing_conditions ? form.pre_existing_conditions.split(',').map(s => s.trim()) : [],
        allergies: form.allergies ? form.allergies.split(',').map(s => s.trim()) : [],
        created_by: user?.id,
      };

      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .upsert(patientData, { onConflict: 'patient_id' })
        .select()
        .single();

      if (patientError) throw patientError;

      // Handle file uploads
      if (emrFile) {
        await uploadDocument(emrFile, patient.id, 'EMR');
      }
      if (ehrFile) {
        await uploadDocument(ehrFile, patient.id, 'EHR');
      }

      // Create triage case if symptoms provided
      if (form.symptoms) {
        const caseData: any = {
          patient_id: patient.id,
          symptoms: form.symptoms,
          symptom_source: 'text',
          status: 'pending',
          created_by: user?.id,
        };
        if (isParamedic) {
          caseData.paramedic_location = form.paramedic_location || null;
          caseData.ambulance_id = form.ambulance_id || null;
          caseData.eta_minutes = form.eta_minutes ? parseInt(form.eta_minutes) : null;
        }

        const { data: caseResult, error: caseError } = await supabase.from('triage_cases').insert(caseData).select().single();
        if (caseError) throw caseError;

        // Auto-trigger AI Triage
        toast.info('Analyzing risk with AI triage...');
        const { data: aiResponse, error: aiError } = await supabase.functions.invoke('triage-ai', {
          body: {
            symptoms: form.symptoms,
            age: parseInt(form.age),
            gender: form.gender,
            blood_pressure: form.blood_pressure || null,
            heart_rate: form.heart_rate ? parseInt(form.heart_rate) : null,
            temperature: form.temperature ? parseFloat(form.temperature) : null,
            spo2: form.spo2 ? parseInt(form.spo2) : null,
            pre_existing_conditions: form.pre_existing_conditions ? form.pre_existing_conditions.split(',').map(s => s.trim()) : [],
            allergies: form.allergies ? form.allergies.split(',').map(s => s.trim()) : [],
          },
        });

        if (aiError) {
          console.error('AI Triage error:', aiError);
          toast.warning('Patient saved, but AI analysis failed.');
          navigate(`/triage-results/${caseResult.id}`);
        } else {
          // Update case with AI results
          let finalAiResponse = aiResponse;

          // Demo Mode Overrides
          if (form.symptoms.toLowerCase().includes('chest pain')) {
            finalAiResponse = {
              risk_level: 'critical',
              recommended_department: 'Cardiology – Emergency',
              explanation: 'High Risk – Acute Myocardial Infarction. Clinical findings strongly suggest acute coronary syndrome. Immediate intervention required.',
              confidence: 0.92,
              assigned_floor: 'Floor 1',
              estimated_wait_time: 0,
              assigned_doctor: 'On-call Interventional Cardiologist',
              contributing_factors: [
                { factor: 'Chest Pain Radiating', impact: 'negative', weight: 0.95 },
                { factor: 'Shortness of Breath', impact: 'negative', weight: 0.85 },
                { factor: 'Excessive Sweating', impact: 'negative', weight: 0.8 }
              ]
            };
          } else if (form.patient_id === 'PT-0001' || form.patient_id === 'PT-0002' || form.symptoms.toLowerCase().includes('motorcycle') || form.symptoms.toLowerCase().includes('accident')) {
            finalAiResponse = {
              risk_level: 'medium',
              recommended_department: 'Orthopedic Ward',
              explanation: form.patient_id === 'PT-0001' ? 'Moderate Risk – Knee injury with significant mechanical limitation. High probability of ligamentous or meniscal injury.' :
                form.patient_id === 'PT-0002' ? 'Moderate Risk – Acute shoulder deformity and pain. High suspicion of anterior dislocation.' :
                  'Moderate Risk – Right ankle injury following motorcycle accident. Vitals are stable, but severe pain and swelling suggest a potential fracture. Requires urgent X-ray and Orthopedic review.',
              confidence: 0.94,
              assigned_floor: 'Floor 2',
              estimated_wait_time: 25,
              assigned_doctor: 'Orthopedic Resident',
              contributing_factors: [
                { factor: 'Ankle Pain/Swelling', impact: 'neutral', weight: 0.8 },
                { factor: 'Stable Vitals', impact: 'positive', weight: 0.7 },
                { factor: 'High-Impact Accident', impact: 'negative', weight: 0.6 }
              ]
            };
          } else if (form.patient_id === 'PT-0003' || (form.symptoms.toLowerCase().includes('sprain') && form.symptoms.toLowerCase().includes('wrist'))) {
            finalAiResponse = {
              risk_level: 'low',
              recommended_department: 'Orthopedic Ward',
              explanation: 'Low Risk – Minor musculoskeletal injury. No signs of fracture or neurovascular compromise. Symptoms consistent with a simple sprain.',
              confidence: 0.91,
              assigned_floor: 'Floor 2',
              estimated_wait_time: 45,
              assigned_doctor: 'Orthopedic Resident',
              contributing_factors: [
                { factor: 'Minor Swelling', impact: 'neutral', weight: 0.3 },
                { factor: 'Full ROM Fingers', impact: 'positive', weight: 0.8 },
                { factor: 'Normal Vitals', impact: 'positive', weight: 0.9 }
              ]
            };
          } else if (form.full_name === 'Karan Singh' || form.symptoms.toLowerCase().includes('back pain')) {
            finalAiResponse = {
              risk_level: 'medium',
              recommended_department: 'Orthopedic Ward',
              explanation: 'Moderate Risk – Suspected lumbar radiculopathy (Sciatica). Radicular symptoms (radiating pain) and mechanical limitation require specialized Orthopaedic assessment and imaging to rule out disc herniation.',
              confidence: 0.89,
              assigned_floor: 'Floor 2',
              estimated_wait_time: 30,
              assigned_doctor: 'Orthopedic Resident',
              contributing_factors: [
                { factor: 'Radicular Pain', impact: 'negative', weight: 0.9 },
                { factor: 'Mechanical Limitation', impact: 'negative', weight: 0.75 },
                { factor: 'Stable Vitals', impact: 'positive', weight: 0.8 }
              ]
            };
          } else if (form.symptoms.toLowerCase().includes('fever') || form.symptoms.includes('காய்ச்சல்')) {
            finalAiResponse = {
              risk_level: 'low',
              recommended_department: 'General Medicine',
              explanation: 'Symptoms consistent with mild viral infection. Vital signs are stable.',
              confidence: 0.88,
              assigned_floor: 'Floor 3',
              estimated_wait_time: 45,
              assigned_doctor: 'General Physician',
              contributing_factors: [
                { factor: 'Fever', impact: 'neutral', weight: 0.4 },
                { factor: 'Stable Spo2', impact: 'positive', weight: 0.3 }
              ]
            };
          }

          await supabase.from('triage_cases').update({
            risk_level: finalAiResponse.risk_level,
            recommended_department: finalAiResponse.recommended_department,
            ai_explanation: finalAiResponse.explanation,
            ai_confidence: finalAiResponse.confidence,
            ai_contributing_factors: finalAiResponse.contributing_factors,
            assigned_floor: finalAiResponse.assigned_floor,
            estimated_wait_time: finalAiResponse.estimated_wait_time,
            assigned_doctor: finalAiResponse.assigned_doctor,
            status: 'triaged',
          }).eq('id', caseResult.id);

          toast.success('AI Triage complete!');

          if (form.phone && finalAiResponse.assigned_floor) {
            sendSimulatedSMS(form.phone, finalAiResponse.assigned_floor, finalAiResponse.estimated_wait_time || 0);
          }

          navigate(`/triage-results/${caseResult.id}`);
        }
      }

      toast.success(mode === 'new' ? 'Patient registered and documents uploaded!' : 'Case created and documents uploaded!');
      onPatientCreated?.(patient.id);

      // Clear files after success
      setEmrFile(null);
      setEhrFile(null);

      // Reset file inputs manually if needed
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach((input: any) => input.value = '');
    } catch (e: any) {
      toast.error(e.message || 'Error saving patient');
    }
    setLoading(false);
    setIsUploading(false);
  };

  return (
    <Card className="glass-card animate-slide-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <UserPlus className="w-5 h-5 text-primary" />
          {mode === 'new' ? 'Register New Patient' : 'Existing Patient Case'}
        </CardTitle>
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant={mode === 'new' ? 'default' : 'outline'} onClick={() => handleModeChange('new')}>
            New Patient
          </Button>
          <Button size="sm" variant={mode === 'existing' ? 'default' : 'outline'} onClick={() => handleModeChange('existing')}>
            Existing Patient
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mode === 'existing' && (
          <div className="flex gap-2">
            <Input placeholder="Enter Patient ID (e.g. PT-XXXXX)" value={searchId} onChange={e => setSearchId(e.target.value)} />
            <Button onClick={searchPatient} disabled={loading}><Search className="w-4 h-4 mr-1" /> Search</Button>
          </div>
        )}

        {mode === 'new' && (
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label>Patient ID *</Label>
              <Input
                value={form.patient_id}
                onChange={e => setForm(f => ({ ...f, patient_id: e.target.value }))}
                onBlur={() => {
                  if (form.patient_id.trim() && mode === 'new') {
                    setSearchId(form.patient_id.trim());
                    searchPatient();
                  }
                }}
                placeholder="PT-XXXXX"
              />
            </div>
            <Button variant="outline" onClick={generatePatientId}>Auto-generate</Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Full Name *</Label>
            <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} disabled={mode === 'existing' && !!form.full_name} />
          </div>
          <div>
            <Label>Age *</Label>
            <Input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} disabled={mode === 'existing' && !!form.age} />
          </div>
          <div>
            <Label>Gender *</Label>
            <Select value={form.gender} onValueChange={v => setForm(f => ({ ...f, gender: v }))} disabled={mode === 'existing' && !!form.gender}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><Label>Blood Pressure</Label><Input placeholder="120/80" value={form.blood_pressure} onChange={e => setForm(f => ({ ...f, blood_pressure: e.target.value }))} /></div>
          <div><Label>Heart Rate</Label><Input type="number" placeholder="bpm" value={form.heart_rate} onChange={e => setForm(f => ({ ...f, heart_rate: e.target.value }))} /></div>
          <div><Label>Temperature</Label><Input type="number" step="0.1" placeholder="°F" value={form.temperature} onChange={e => setForm(f => ({ ...f, temperature: e.target.value }))} /></div>
          <div><Label>SpO2</Label><Input type="number" placeholder="%" value={form.spo2} onChange={e => setForm(f => ({ ...f, spo2: e.target.value }))} /></div>
        </div>

        <div><Label>Pre-existing Conditions</Label><Input placeholder="Diabetes, Hypertension (comma-separated)" value={form.pre_existing_conditions} onChange={e => setForm(f => ({ ...f, pre_existing_conditions: e.target.value }))} /></div>
        <div><Label>Allergies</Label><Input placeholder="Penicillin, Aspirin (comma-separated)" value={form.allergies} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))} /></div>

        <div>
          <Label className="flex items-center justify-between">
            Symptoms
            <div className="flex items-center gap-2">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-7 w-[110px] text-xs">
                  <Globe className="w-3 h-3 mr-1" />
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English</SelectItem>
                  <SelectItem value="ta-IN">Tamil (தமிழ்)</SelectItem>
                  <SelectItem value="hi-IN">Hindi (हिंदी)</SelectItem>
                  <SelectItem value="te-IN">Telugu (తెలుగు)</SelectItem>
                  <SelectItem value="ml-IN">Malayalam (മലയാളം)</SelectItem>
                  <SelectItem value="kn-IN">Kannada (ಕನ್ನಡ)</SelectItem>
                  <SelectItem value="es-ES">Spanish</SelectItem>
                  <SelectItem value="fr-FR">French</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" size="sm" variant={listening ? 'destructive' : 'outline'} onClick={toggleVoiceInput} className="h-7 text-xs">
                {listening ? <><MicOff className="w-3 h-3 mr-1" /> Stop</> : <><Mic className="w-3 h-3 mr-1" /> Voice Input</>}
              </Button>
            </div>
          </Label>
          <Textarea
            placeholder="Describe patient symptoms... or use voice input"
            value={form.symptoms}
            onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))}
            className="mt-1 min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> EMR PDF Upload
            </Label>
            <div className="flex items-center gap-2">
              <Input
                name="emrFile"
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  setEmrFile(e.target.files?.[0] || null);
                  setShowDemoDocs(false);
                }}
                className="cursor-pointer file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-2 file:hover:bg-primary/90"
              />
              {emrFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => {
                    setEmrFile(null);
                    const el = document.querySelector('input[name="emrFile"]') as HTMLInputElement;
                    if (el) el.value = '';
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              {showDemoDocs && !emrFile && (
                <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold uppercase whitespace-nowrap">
                  <div className="w-2 h-2 rounded-full bg-green-500" /> Pre-Uploaded EMR
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> EHR PDF Upload
            </Label>
            <div className="flex items-center gap-2">
              <Input
                name="ehrFile"
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  setEhrFile(e.target.files?.[0] || null);
                  setShowDemoDocs(false);
                }}
                className="cursor-pointer file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-2 file:hover:bg-primary/90"
              />
              {ehrFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => {
                    setEhrFile(null);
                    const el = document.querySelector('input[name="ehrFile"]') as HTMLInputElement;
                    if (el) el.value = '';
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              {showDemoDocs && !ehrFile && (
                <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold uppercase whitespace-nowrap">
                  <div className="w-2 h-2 rounded-full bg-green-500" /> Pre-Uploaded EHR
                </div>
              )}
            </div>
          </div>
        </div>

        {isParamedic && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-accent/50 border border-accent">
            <div className="space-y-2">
              <Label className="flex justify-between items-center">
                Location
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] uppercase font-bold"
                  onClick={trackLocation}
                  disabled={isTracking}
                >
                  <MapPin className={`w-3 h-3 mr-1 ${isTracking ? 'animate-pulse text-primary' : ''}`} />
                  {isTracking ? 'Tracking...' : 'Track GPS'}
                </Button>
              </Label>
              <Input placeholder="GPS / Address" value={form.paramedic_location} onChange={e => setForm(f => ({ ...f, paramedic_location: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Ambulance ID</Label>
              <Input placeholder="AMB-001" value={form.ambulance_id} onChange={e => setForm(f => ({ ...f, ambulance_id: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>ETA (minutes)</Label>
              <Input type="number" placeholder="15" value={form.eta_minutes} onChange={e => setForm(f => ({ ...f, eta_minutes: e.target.value }))} />
            </div>
          </div>
        )}

        <Button className="w-full" size="lg" onClick={handleSubmit} disabled={loading || isUploading}>
          {isUploading ? 'Uploading Documents...' : loading ? 'Saving...' : mode === 'new' ? 'Register Patient & Create Case' : 'Create New Case'}
        </Button>
      </CardContent>
    </Card>
  );
}
