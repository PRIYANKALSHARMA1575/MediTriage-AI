from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from .triage_model import TriageAI
from .utils import map_symptoms_to_category
import uvicorn

app = FastAPI(title="Triage AI ML Engine")
triage_engine = TriageAI()

class PatientData(BaseModel):
    age: int
    gender: str
    symptoms: str
    systolic_bp: Optional[int] = 120
    heart_rate: Optional[int] = 80
    temperature: Optional[float] = 98.6
    spo2: Optional[int] = 98
    has_pre_existing: Optional[int] = 0

@app.post("/predict")
async def predict_triage(data: PatientData):
    try:
        # Convert symptoms to category
        symptom_cat = map_symptoms_to_category(data.symptoms)
        
        # Prepare data for model
        model_input = data.dict()
        model_input['symptom_category'] = symptom_cat
        del model_input['symptoms'] # Model expects category, not raw text
        
        # Get prediction
        result = triage_engine.predict(model_input)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
