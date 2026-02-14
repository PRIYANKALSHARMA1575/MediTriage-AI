def map_symptoms_to_category(symptoms: str) -> int:
    """
    Maps raw symptom text to a numerical category.
    0: General, 1: Cardiac, 2: Neurology, 3: Ortho, 4: Pulmonary
    """
    symptoms = symptoms.lower()
    
    # 1. Cardiac
    if any(word in symptoms for word in ['chest pain', 'heart', 'palpitation', 'cardiac']):
        return 1
    
    # 2. Neurology
    if any(word in symptoms for word in ['headache', 'stroke', 'seizure', 'vision', 'numbness']):
        return 2
    
    # 3. Ortho
    if any(word in symptoms for word in ['fracture', 'bone', 'joint', 'knee', 'back pain', 'ankle', 'sprain']):
        return 3
    
    # 4. Pulmonary
    if any(word in symptoms for word in ['breath', 'cough', 'lung', 'pulmonary', 'wheezing']):
        return 4
        
    return 0 # General
