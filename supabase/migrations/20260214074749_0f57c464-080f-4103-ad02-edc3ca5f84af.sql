
-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('triage_nurse', 'paramedic', 'doctor', 'admin');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role app_role NOT NULL DEFAULT 'triage_nurse',
  full_name TEXT NOT NULL DEFAULT '',
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  age INT NOT NULL,
  gender TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  blood_pressure TEXT,
  heart_rate INT,
  temperature NUMERIC(4,1),
  spo2 INT,
  pre_existing_conditions TEXT[],
  allergies TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Triage cases table
CREATE TABLE public.triage_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  symptoms TEXT NOT NULL,
  symptom_source TEXT DEFAULT 'text',
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  recommended_department TEXT,
  ai_explanation TEXT,
  ai_confidence NUMERIC(3,2),
  ai_contributing_factors JSONB,
  assigned_department TEXT,
  assigned_doctor TEXT,
  assigned_floor TEXT,
  estimated_wait_time INT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'triaged', 'routed', 'in_treatment', 'completed', 'discharged')),
  treatment_notes TEXT,
  medications JSONB,
  follow_up_date DATE,
  follow_up_notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  paramedic_location TEXT,
  ambulance_id TEXT,
  eta_minutes INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.triage_cases ENABLE ROW LEVEL SECURITY;

-- EHR documents storage
CREATE TABLE public.patient_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  document_type TEXT DEFAULT 'ehr',
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = _user_id LIMIT 1;
$$;

-- Helper: check if user is healthcare provider
CREATE OR REPLACE FUNCTION public.is_healthcare_provider(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id
    AND role IN ('triage_nurse', 'paramedic', 'doctor', 'admin')
  );
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_triage_cases_updated_at BEFORE UPDATE ON public.triage_cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS Policies for profiles
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Doctors and admins can read all profiles" ON public.profiles FOR SELECT USING (public.get_user_role(auth.uid()) IN ('doctor', 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for patients
CREATE POLICY "Healthcare providers can read patients" ON public.patients FOR SELECT USING (public.is_healthcare_provider(auth.uid()));
CREATE POLICY "Healthcare providers can create patients" ON public.patients FOR INSERT WITH CHECK (public.is_healthcare_provider(auth.uid()));
CREATE POLICY "Healthcare providers can update patients" ON public.patients FOR UPDATE USING (public.is_healthcare_provider(auth.uid()));

-- RLS Policies for triage_cases
CREATE POLICY "Healthcare providers can read cases" ON public.triage_cases FOR SELECT USING (public.is_healthcare_provider(auth.uid()));
CREATE POLICY "Nurses and paramedics can create cases" ON public.triage_cases FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('triage_nurse', 'paramedic'));
CREATE POLICY "Healthcare providers can update cases" ON public.triage_cases FOR UPDATE USING (public.is_healthcare_provider(auth.uid()));
CREATE POLICY "Admins can delete cases" ON public.triage_cases FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for patient_documents
CREATE POLICY "Healthcare providers can read documents" ON public.patient_documents FOR SELECT USING (public.is_healthcare_provider(auth.uid()));
CREATE POLICY "Healthcare providers can upload documents" ON public.patient_documents FOR INSERT WITH CHECK (public.is_healthcare_provider(auth.uid()));

-- Storage bucket for patient documents
INSERT INTO storage.buckets (id, name, public) VALUES ('patient-documents', 'patient-documents', false);
CREATE POLICY "Healthcare providers can upload docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'patient-documents' AND auth.role() = 'authenticated');
CREATE POLICY "Healthcare providers can read docs" ON storage.objects FOR SELECT USING (bucket_id = 'patient-documents' AND auth.role() = 'authenticated');

-- Enable realtime for triage_cases (for live queue updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.triage_cases;
