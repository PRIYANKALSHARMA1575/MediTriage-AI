import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskBadge } from './RiskBadge';
import { TriageResult } from '@/lib/types';
import { Brain, Building2, TrendingUp, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface TriageResultCardProps {
  result: TriageResult;
}

export function TriageResultCard({ result }: TriageResultCardProps) {
  return (
    <Card className="glass-elevated animate-slide-in border-l-4" style={{
      borderLeftColor: result.risk_level === 'critical' ? 'hsl(var(--risk-critical))' :
        result.risk_level === 'high' ? 'hsl(var(--risk-high))' :
        result.risk_level === 'medium' ? 'hsl(var(--risk-medium))' : 'hsl(var(--risk-low))'
    }}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between font-display">
          <span className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Triage Assessment
          </span>
          <RiskBadge level={result.risk_level} size="lg" showPulse />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
          <Building2 className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Recommended Department</p>
            <p className="font-semibold text-foreground">{result.recommended_department}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Confidence Score</span>
              <span className="font-semibold text-foreground">{Math.round(result.confidence * 100)}%</span>
            </div>
            <Progress value={result.confidence * 100} className="h-2" />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">AI Explanation</p>
              <p className="text-sm text-muted-foreground">{result.explanation}</p>
            </div>
          </div>
        </div>

        {result.contributing_factors?.length > 0 && (
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Contributing Factors</p>
            <div className="space-y-2">
              {result.contributing_factors.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-secondary text-sm">
                  <span className="text-foreground">{f.factor}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{f.impact}</span>
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${f.weight * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
