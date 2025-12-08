from fastapi import FastAPI, UploadFile, File, HTTPException
import os
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.efficientnet_v2 import preprocess_input
from tensorflow.keras.utils import img_to_array
from PIL import Image
import numpy as np
import io
import traceback

app = FastAPI()

MODEL_DIR = "./skin-model"
MODEL_FILE = os.path.join(MODEL_DIR, "skin_model.keras")
CLASSES = ['Acne', 'Carcinoma', 'Eczema', 'Keratosis', 'Milia', 'Rosacea']
model = None

def load_skin_model():
    global model
    try:
        # Пытаемся загрузить существующую модель
        if os.path.exists(MODEL_FILE):
            model = load_model(MODEL_FILE)
            print("✅ Model loaded successfully from cache")
        else:
            print("⚠️ Model not found locally. Please download manually.")
            # Временно возвращаем заглушку
            model = None
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        model = None

# Загружаем модель при запуске (не блокируем запуск при ошибке)
load_skin_model()

@app.get("/health")
async def health_check():
    status = "healthy" if model is not None else "degraded (model not loaded)"
    return {"status": status, "service": "disease-analysis"}

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    try:
        # Если модель не загружена, возвращаем заглушку
        if model is None:
            return {
                "condition": "Model not loaded",
                "confidence": 0.0,
                "probabilities": {
                    'Acne': 0.0, 'Carcinoma': 0.0, 'Eczema': 0.0, 
                    'Keratosis': 0.0, 'Milia': 0.0, 'Rosacea': 0.0
                },
                "note": "Disease analysis service is temporarily unavailable"
            }

        file_content = await file.read()
        if not file_content:
            raise ValueError("Empty file received")

        img = Image.open(io.BytesIO(file_content)).convert('RGB')
        img = img.resize((224, 224))
        img_array = img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)

        predictions = model.predict(img_array, verbose=0)
        max_prob = np.max(predictions)
        predicted_class = CLASSES[np.argmax(predictions)]
        confidence = max_prob * 100
        probabilities = {cls: float(prob * 100) for cls, prob in zip(CLASSES, predictions[0])}

        # Если ни одно заболевание не превышает 50% уверенности — считаем кожу здоровой
        if max_prob < 0.5:
            return {
                "condition": "Healthy skin",
                "confidence": float((1 - max_prob) * 100),
                "probabilities": probabilities
            }
        else:
            return {
                "condition": predicted_class,
                "confidence": float(confidence),
                "probabilities": probabilities
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")