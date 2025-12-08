from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import cv2
import numpy as np
import mediapipe as mp
from PIL import Image

app = FastAPI()


mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, refine_landmarks=True, min_detection_confidence=0.5)

def analyze_emotions(img: np.ndarray) -> dict:
    """
    Analyze emotions from the face image using facial landmarks (mouth and eyebrow shape).
    Heuristic-based approach to detect neutral, happy, or sad expressions.
    """
    try:
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(img_rgb)

        if not results.multi_face_landmarks:
            return {"error": "No face detected"}

        landmarks = results.multi_face_landmarks[0].landmark
        h, w, _ = img.shape

        mouth_left = (int(landmarks[61].x * w), int(landmarks[61].y * h))
        mouth_right = (int(landmarks[291].x * w), int(landmarks[291].y * h)) 
        mouth_center = (int(landmarks[0].x * w), int(landmarks[0].y * h)) 

        mouth_curvature = (mouth_left[1] + mouth_right[1]) / 2 - mouth_center[1]

        left_eyebrow = (int(landmarks[55].x * w), int(landmarks[55].y * h))
        right_eyebrow = (int(landmarks[285].x * w), int(landmarks[285].y * h))  
        left_eye = (int(landmarks[33].x * w), int(landmarks[33].y * h))  
        right_eye = (int(landmarks[263].x * w), int(landmarks[263].y * h))  

        eyebrow_angle_left = np.arctan2(left_eyebrow[1] - left_eye[1], left_eyebrow[0] - left_eye[0])
        eyebrow_angle_right = np.arctan2(right_eyebrow[1] - right_eye[1], right_eyebrow[0] - right_eye[0])
        avg_eyebrow_angle = (eyebrow_angle_left + eyebrow_angle_right) / 2

        
        if mouth_curvature < -10 and avg_eyebrow_angle > 0.1:
            emotion = "sad"
        elif mouth_curvature > 10 and avg_eyebrow_angle < -0.1:
            emotion = "happy"
        else:
            emotion = "neutral"

        return {
            "dominant_emotion": emotion,
            "emotion_probabilities": {
                "happy": 0.7 if emotion == "happy" else 0.15,
                "sad": 0.7 if emotion == "sad" else 0.15,
                "neutral": 0.7 if emotion == "neutral" else 0.7
            }
        }
    except Exception as e:
        return {"error": str(e)}

def analyze_eyes(img: np.ndarray) -> dict:
    """
    Analyze eye state (open/closed), redness, yellowness, dark circles, and puffiness.
    Uses MediaPipe landmarks for eye state and color analysis for other indicators.
    """
    try:
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(img_rgb)

        if not results.multi_face_landmarks:
            return {"error": "No face detected in eye image"}

        landmarks = results.multi_face_landmarks[0].landmark
        h, w, _ = img.shape

        
        left_eye_top = (int(landmarks[159].x * w), int(landmarks[159].y * h))  
        left_eye_bottom = (int(landmarks[145].x * w), int(landmarks[145].y * h))  
        right_eye_top = (int(landmarks[386].x * w), int(landmarks[386].y * h))  
        right_eye_bottom = (int(landmarks[374].x * w), int(landmarks[374].y * h))  

        left_eye_height = abs(left_eye_top[1] - left_eye_bottom[1])
        right_eye_height = abs(right_eye_top[1] - right_eye_bottom[1])
        avg_eye_height = (left_eye_height + right_eye_height) / 2

        state = "open" if avg_eye_height > 5 else "closed"  

        if state == "closed":
            return {"state": "closed", "indicators": "unable to analyze colors further"}

        
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        
        lower_red1 = np.array([0, 70, 70])
        upper_red1 = np.array([10, 255, 255])
        mask_red1 = cv2.inRange(hsv, lower_red1, upper_red1)
        lower_red2 = np.array([170, 70, 70])
        upper_red2 = np.array([180, 255, 255])
        mask_red2 = cv2.inRange(hsv, lower_red2, upper_red2)
        mask_red = mask_red1 + mask_red2
        red_ratio = np.sum(mask_red > 0) / (img.shape[0] * img.shape[1])
        
        
        lower_yellow = np.array([20, 100, 100])
        upper_yellow = np.array([30, 255, 255])
        mask_yellow = cv2.inRange(hsv, lower_yellow, upper_yellow)
        yellow_ratio = np.sum(mask_yellow > 0) / (img.shape[0] * img.shape[1])
        
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        lower_region = gray[int(h * 0.6):, :]  
        lower_mean = np.mean(lower_region)
        dark_circles = "low"
        if lower_mean < 80:
            dark_circles = "high"
        elif lower_mean < 120:
            dark_circles = "medium"
        
        
        lower_variance = cv2.Laplacian(lower_region, cv2.CV_64F).var()
        puffiness = "low" if lower_variance < 50 else "high"

        redness_level = "high" if red_ratio > 0.05 else "low"
        yellowness_level = "high" if yellow_ratio > 0.05 else "low"

        return {
            "state": state,
            "redness": redness_level,
            "yellowness": yellowness_level,
            "dark_circles": dark_circles,
            "puffiness": puffiness,
            "notes": "High levels may indicate fatigue or strain"
        }
    except Exception as e:
        return {"error": str(e)}

def analyze_skin(img: np.ndarray) -> dict:
    """
    Analyze skin texture and tone using image processing techniques.
    Classifies skin as dry, oily, or normal based on texture and brightness.
    """
    try:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        texture_variance = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        brightness = np.mean(hsv[:, :, 2])  

        
        if texture_variance > 150:  
            skin_type = "oily"
        elif texture_variance < 50:  
            skin_type = "dry"
        else:
            skin_type = "normal"

        texture = "smooth" if texture_variance < 100 else "rough"

        return {
            "skin_type": skin_type,
            "type_probabilities": {
                "oily": 0.7 if skin_type == "oily" else 0.15,
                "dry": 0.7 if skin_type == "dry" else 0.15,
                "normal": 0.7 if skin_type == "normal" else 0.7
            },
            "texture": texture,
            "brightness": float(brightness)
        }
    except Exception as e:
        return {"error": str(e)}
@app.get("/health")
def health():
    return {"status": "ok", "service": "face-analysis"}
@app.post("/analyze")
async def analyze_face(
    face: UploadFile = File(...),
    left_eye: UploadFile = File(...),
    right_eye: UploadFile = File(...)
):
    
    face_bytes = await face.read()
    left_eye_bytes = await left_eye.read()
    right_eye_bytes = await right_eye.read()

    
    face_img = cv2.imdecode(np.frombuffer(face_bytes, np.uint8), cv2.IMREAD_COLOR)
    left_eye_img = cv2.imdecode(np.frombuffer(left_eye_bytes, np.uint8), cv2.IMREAD_COLOR)
    right_eye_img = cv2.imdecode(np.frombuffer(right_eye_bytes, np.uint8), cv2.IMREAD_COLOR)

    face_result = analyze_emotions(face_img)
    skin_result = analyze_skin(face_img)
    left_result = analyze_eyes(left_eye_img)
    right_result = analyze_eyes(right_eye_img)

    return JSONResponse({
        "face_analysis": face_result,
        "skin_analysis": skin_result,
        "left_eye_analysis": left_result,
        "right_eye_analysis": right_result,
    })