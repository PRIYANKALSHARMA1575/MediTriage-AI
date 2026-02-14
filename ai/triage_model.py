import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import json
import os

def generate_synthetic_data(num_samples=1000):
    """Generates synthetic patient data for triage risk classification."""
    np.random.seed(42)
    
    data = {
        'age': np.random.randint(1, 95, num_samples),
        'gender': np.random.choice([0, 1], num_samples), # 0: Female, 1: Male
        'systolic_bp': np.random.randint(80, 190, num_samples),
        'heart_rate': np.random.randint(40, 150, num_samples),
        'temperature': np.random.uniform(96.0, 105.0, num_samples),
        'spo2': np.random.randint(85, 100, num_samples),
        'has_pre_existing': np.random.choice([0, 1], num_samples),
        'symptom_category': np.random.choice([0, 1, 2, 3, 4], num_samples) # 0: General, 1: Cardiac, 2: Neurology, 3: Ortho, 4: Pulmonary
    }
    
    df = pd.DataFrame(data)
    
    # Simple rule-based logic to assign risk levels
    def assign_risk(row):
        score = 0
        if row['systolic_bp'] > 160 or row['systolic_bp'] < 90: score += 3
        if row['heart_rate'] > 120 or row['heart_rate'] < 50: score += 3
        if row['temperature'] > 103 or row['temperature'] < 95: score += 2
        if row['spo2'] < 92: score += 4
        if row['symptom_category'] in [1, 2]: score += 1 # Cardiac/Neuro higher baseline
        if row['age'] > 75 or row['age'] < 5: score += 1
        
        if score >= 6 or row['spo2'] < 88: return 'critical'
        elif score >= 4: return 'high'
        elif score >= 2: return 'medium'
        else: return 'low'

    df['risk_level'] = df.apply(assign_risk, axis=1)
    return df

def train_model():
    """Trains a Random Forest model on synthetic data."""
    df = generate_synthetic_data()
    
    X = df.drop('risk_level', axis=1)
    y = df['risk_level']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Feature importance for explainability
    importances = model.feature_importances_
    feature_names = X.columns
    feature_importance_map = dict(zip(feature_names, importances))
    
    return model, feature_importance_map

class TriageAI:
    def __init__(self):
        self.model, self.feature_importances = train_model()
        self.dept_mapping = {
            0: 'General Medicine',
            1: 'Cardiology',
            2: 'Neurology',
            3: 'Orthopedic Ward',
            4: 'Pulmonology'
        }

    def predict(self, patient_data):
        """
        Predicts risk level and provides explanation.
        patient_data: dict with keys matching synthetic data columns
        """
        # Encode gender if string
        if isinstance(patient_data.get('gender'), str):
            patient_data['gender'] = 1 if patient_data['gender'].lower() in ['male', 'm'] else 0
            
        df = pd.DataFrame([patient_data])
        risk_level = self.model.predict(df)[0]
        confidence = np.max(self.model.predict_proba(df))
        
        # Determine department based on symptom category
        symptom_cat = patient_data.get('symptom_category', 0)
        recommended_dept = self.dept_mapping.get(symptom_cat, 'General Medicine')
        if risk_level == 'critical':
            recommended_dept = f"Emergency - {recommended_dept}"
        
        explanation = f"Patient classified as {risk_level} risk primarily based on "
        top_features = sorted(self.feature_importances.items(), key=lambda x: x[1], reverse=True)[:3]
        explanation += ", ".join([f"{f[0]} (weight: {f[1]:.2f})" for f in top_features])
        
        return {
            "risk_level": risk_level,
            "recommended_department": recommended_dept,
            "explanation": explanation,
            "confidence": float(confidence),
            "contributing_factors": [
                {"factor": f, "weight": float(w)} for f, w in self.feature_importances.items()
            ]
        }

if __name__ == "__main__":
    ai = TriageAI()
    sample = {
        'age': 65,
        'systolic_bp': 175,
        'heart_rate': 110,
        'temperature': 99.5,
        'spo2': 91,
        'has_pre_existing': 1,
        'symptom_severity': 2
    }
    print(json.dumps(ai.predict(sample), indent=2))
