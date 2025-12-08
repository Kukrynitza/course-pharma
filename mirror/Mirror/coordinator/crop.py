import cv2
import numpy as np
import mediapipe as mp


mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, refine_landmarks=True)
padding = 5

async def detect_face_and_crop(image: np.ndarray, region: str = 'face') -> np.ndarray:
    
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb_image)
    
    landmarks = results.multi_face_landmarks[0]
    h, w, _ = image.shape
    
    if region == 'face':
        x_min = min([lm.x for lm in landmarks.landmark]) * w
        y_min = min([lm.y for lm in landmarks.landmark]) * h
        x_max = max([lm.x for lm in landmarks.landmark]) * w
        y_max = max([lm.y for lm in landmarks.landmark]) * h
    
    elif region == 'left_eye':
        left_eye_indices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
        left_eye_points = [landmarks.landmark[i] for i in left_eye_indices]
        
        x_min = min([lm.x for lm in left_eye_points]) * w - padding  
        y_min = min([lm.y for lm in left_eye_points]) * h - padding
        x_max = max([lm.x for lm in left_eye_points]) * w + padding
        y_max = max([lm.y for lm in left_eye_points]) * h + padding

    elif region == 'right_eye':
        right_eye_indices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
        right_eye_points = [landmarks.landmark[i] for i in right_eye_indices]
        
        x_min = min([lm.x for lm in right_eye_points]) * w - padding
        y_min = min([lm.y for lm in right_eye_points]) * h - padding
        x_max = max([lm.x for lm in right_eye_points]) * w + padding
        y_max = max([lm.y for lm in right_eye_points]) * h + padding
    
    crop = image[int(y_min):int(y_max), int(x_min):int(x_max)]
    _, buffer = cv2.imencode('.jpg', image)
    return buffer.tobytes()
