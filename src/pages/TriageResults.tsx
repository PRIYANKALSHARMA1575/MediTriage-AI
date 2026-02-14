import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RiskBadge } from '@/components/RiskBadge';
import { Brain, ArrowLeft, Activity, Info, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function TriageResults() {
    const { caseId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchResults = async () => {
            if (!caseId) return;

            const { data: caseData, error } = await supabase
                .from('triage_cases')
                .select(`
          *,
          patients (
            full_name,
            age,
            gender,
            blood_pressure,
            heart_rate,
            temperature,
            spo2,
            pre_existing_conditions
          )
        `)
                .eq('id', caseId)
                .single();

            if (error) {
                console.error('Error fetching triage results:', error);
            } else {
                setData(caseData);
            }
            setLoading(false);
        };

        fetchResults();
    }, [caseId]);

    if (loading) {
        return (
            <DashboardLayout title="Processing Triage..." subtitle="Our AI is analyzing the patient data">
                <div className="flex flex-col items-center justify-center py-20">
                    <Brain className="w-16 h-16 text-primary animate-pulse mb-4" />
                    <p className="text-muted-foreground">Calculating risk levels and extracting insights...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!data) {
        return (
            <DashboardLayout title="Error" subtitle="Could not find triage results">
                <div className="text-center py-20">
                    <p className="mb-4">The requested triage case was not found.</p>
                    <Button onClick={() => navigate('/nurse')}><ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button>
                </div>
            </DashboardLayout>
        );
    }

    const riskLevel = data.risk_level || 'low';
    const confidence = (data.ai_confidence || 0) * 100;
    const factors = data.ai_contributing_factors || [];

    return (
        <DashboardLayout title="AI Triage Assessment" subtitle={`Results for ${data.patients?.full_name}`}>
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <Button variant="outline" onClick={() => navigate('/nurse')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Button>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Case ID: {data.id.substring(0, 8)}...
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Risk Card */}
                    <Card className={`md:col-span-2 border-2 ${riskLevel === 'critical' || riskLevel === 'high' ? 'border-destructive/50' : 'border-primary/20'
                        }`}>
                        <CardHeader className="text-center pb-2 border-b">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Clinical Risk Assessment Report</CardTitle>
                        </CardHeader>
                        <div className="flex flex-col items-center text-center space-y-4 mb-8 w-full p-6">
                            <div className="space-y-1">
                                <h2 className={`text-4xl font-black uppercase ${riskLevel === 'critical' ? 'text-red-600' :
                                    riskLevel === 'high' ? 'text-orange-600' :
                                        riskLevel === 'medium' ? 'text-amber-600' : 'text-green-600'
                                    }`}>
                                    {riskLevel}
                                </h2>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Patient Risk Classification</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 w-full py-8 text-left border-t border-border mt-6">
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Primary Diagnosis</p>
                                    <p className="font-bold text-lg leading-tight uppercase">{data.ai_explanation?.split('.')[0] || 'Pending Diagnosis'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Allocation</p>
                                    <p className="font-bold text-lg leading-tight uppercase">{data.recommended_department || 'General'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Attending Physician</p>
                                    <p className="font-bold text-lg leading-tight uppercase">{(data as any).assigned_doctor || 'On-Call'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Facility Level</p>
                                    <p className="font-bold text-lg leading-tight uppercase">{data.assigned_floor || 'Level 1'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Model Confidence</p>
                                    <p className="font-bold text-lg leading-tight uppercase">{confidence.toFixed(1)}%</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Wait Estimation</p>
                                    <p className="font-bold text-lg leading-tight uppercase text-primary">{data.estimated_wait_time ?? 0} MINS</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Vitals Summary */}
                    <Card className="border-border/60">
                        <CardHeader className="bg-muted/30 border-b py-3">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Patient Vitals
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-end border-b pb-1">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">BP</span>
                                    <span className="text-sm font-black">{data.patients?.blood_pressure || '--'}</span>
                                </div>
                                <div className="flex justify-between items-end border-b pb-1">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">HR</span>
                                    <span className="text-sm font-black">{data.patients?.heart_rate || '--'} <small>BPM</small></span>
                                </div>
                                <div className="flex justify-between items-end border-b pb-1">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">SPO2</span>
                                    <span className="text-sm font-black">{data.patients?.spo2 || '--'} <small>%</small></span>
                                </div>
                                <div className="flex justify-between items-end border-b pb-1">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">TEMP</span>
                                    <span className="text-sm font-black">{data.patients?.temperature || '--'} <small>°F</small></span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">AGE/SEX</span>
                                    <span className="text-sm font-black uppercase">{data.patients?.age} / {data.patients?.gender}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Explainability Section */}
                <Card className="border-border/60">
                    <CardHeader className="bg-muted/30 border-b py-3">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Clinical Rationale & ML Interpretability
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="p-4 rounded border bg-muted/10">
                            <p className="text-sm leading-relaxed font-medium">
                                {data.ai_explanation || 'No clinical rationale provided.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Contributing Factors</h4>
                                <div className="space-y-3">
                                    {Array.isArray(factors) && factors.map((factor: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-2 rounded bg-background border border-border/50">
                                            <div className="flex items-center gap-3">
                                                {factor.impact === 'negative' ? (
                                                    <AlertTriangle className="w-4 h-4 text-destructive" />
                                                ) : (
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                )}
                                                <span className="text-sm">{factor.factor}</span>
                                            </div>
                                            <span className={`text-xs font-bold ${factor.weight > 0.7 ? 'text-destructive' : factor.weight > 0.4 ? 'text-orange-500' : 'text-green-500'
                                                }`}>
                                                {(factor.weight * 100).toFixed(0)}% Impact
                                            </span>
                                        </div>
                                    ))}
                                    {(!factors || factors.length === 0) && (
                                        <p className="text-sm text-muted-foreground">No specific factors identified.</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">AI Medical Context</h4>
                                <div className="p-4 rounded-lg border border-dashed text-sm space-y-3">
                                    <p>
                                        <strong>Extracted Symptoms:</strong> {data.symptoms}
                                    </p>
                                    <p>
                                        <strong>Pre-existing Conditions:</strong> {(data.patients?.pre_existing_conditions || []).join(', ') || 'None reported'}
                                    </p>
                                    <div className="pt-2 border-t text-xs text-muted-foreground">
                                        This analysis was generated by an ML model trained on synthetic medical datasets and verified medical rules.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-4">
                    <Button className="flex-1 shadow-lg" size="lg" onClick={() => window.print()}>
                        Print Triage Report
                    </Button>
                    <Button variant="outline" className="flex-1" size="lg" onClick={() => navigate('/nurse')}>
                        Acknowledge & Continue
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
