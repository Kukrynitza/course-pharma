from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import requests
import cv2
import numpy as np
from crop import detect_face_and_crop
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Coordination Microservice")

FACE_ANALYSIS_URL = "http://face-analysis:80/analyze"
DISEASE_ANALYSIS_URL = "http://disease-analysis:8000/analyze"

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    logger.info(f"Received file: {file.filename}, size: {file.size}")
    
    file_content = await file.read()
    filename = file.filename
    image = cv2.imdecode(np.frombuffer(file_content, np.uint8), cv2.IMREAD_COLOR)
    
    if image is None:
        return JSONResponse(status_code=400, content={"error": "Invalid image file"})
    
    try:
        logger.info("Starting face detection and cropping...")
        face_bytes = await detect_face_and_crop(image, region='face')
        left_eye_bytes = await detect_face_and_crop(image, region='left_eye')
        right_eye_bytes = await detect_face_and_crop(image, region='right_eye')
        logger.info("Face cropping completed successfully")
    except Exception as e:
        logger.error(f"Cropping failed: {str(e)}")
        return JSONResponse(status_code=500, content={"error": f"Cropping failed: {str(e)}"})
    
    # Подготовка файлов для анализа
    face_files = {
        "face": ("face.jpg", face_bytes, "image/jpeg"),
        "left_eye": ("left_eye.jpg", left_eye_bytes, "image/jpeg"),
        "right_eye": ("right_eye.jpg", right_eye_bytes, "image/jpeg"),
    }
    disease_files = {"file": (filename, file_content, file.content_type or "image/jpeg")}

    # Анализ лица
    try:
        logger.info("Sending request to face-analysis service...")
        face_response = requests.post(FACE_ANALYSIS_URL, files=face_files, timeout=30)
        face_response.raise_for_status()
        face_data = face_response.json()
        logger.info("Face analysis completed successfully")
    except requests.RequestException as e:
        logger.error(f"Face analysis failed: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            logger.error(f"Response content: {e.response.text}")
        return JSONResponse(status_code=500, content={"error": f"Face analysis failed: {str(e)}"})
    
    # Анализ заболеваний
    try:
        logger.info("Sending request to disease-analysis service...")
        disease_response = requests.post(DISEASE_ANALYSIS_URL, files=disease_files, timeout=30)
        logger.info(f"Disease analysis response status: {disease_response.status_code}")
        
        disease_response.raise_for_status()
        disease_data = disease_response.json()
        logger.info("Disease analysis completed successfully")
    except requests.RequestException as e:
        logger.error(f"Disease analysis failed: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            logger.error(f"Response content: {e.response.text}")
            error_detail = e.response.text
        else:
            error_detail = str(e)
        return JSONResponse(status_code=500, content={"error": f"Disease analysis failed: {error_detail}"})
    
    # Объединение результатов
    merged_data = {**face_data, **disease_data}
    logger.info("Analysis completed successfully")
    
    return JSONResponse(content=merged_data)