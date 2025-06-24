from flask import Blueprint, request, jsonify
import os
import base64
import boto3
from google.cloud import storage, firestore
from datetime import datetime
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

attendance_api = Blueprint('attendance_api', __name__)

# AWS Rekognition config
rekognition = boto3.client(
    'rekognition',
    region_name=os.environ.get('AWS_REGION'),
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY')
)

# Google Cloud config
storage_client = storage.Client()
# Đường dẫn mới tới file service account key
SERVICE_ACCOUNT_KEY_PATH = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
FIREBASE_PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID")
# Khi khởi tạo Firestore client:
db = firestore.Client.from_service_account_json(SERVICE_ACCOUNT_KEY_PATH, project=FIREBASE_PROJECT_ID)

def save_attendance_image(student_id, image_base64):
    bucket_name = os.environ.get('GCS_BUCKET_NAME')
    file_name = f'attendance_photos/{student_id}_{int(datetime.utcnow().timestamp())}.jpg'
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(file_name)
    image_bytes = base64.b64decode(image_base64.split(',')[-1])
    blob.upload_from_string(image_bytes, content_type='image/jpeg')
    return file_name

def compare_faces_with_rekognition(student_id, attendance_file_name):
    bucket_name = os.environ.get('GCS_BUCKET_NAME')
    # Ảnh gốc
    source_blob = storage_client.bucket(bucket_name).blob(f'students/{student_id}.jpg')
    source_bytes = source_blob.download_as_bytes()
    # Ảnh điểm danh
    target_blob = storage_client.bucket(bucket_name).blob(attendance_file_name)
    target_bytes = target_blob.download_as_bytes()
    response = rekognition.compare_faces(
        SourceImage={'Bytes': source_bytes},
        TargetImage={'Bytes': target_bytes},
        SimilarityThreshold=80
    )
    recognized = False
    similarity = 0
    if response['FaceMatches']:
        recognized = True
        similarity = response['FaceMatches'][0]['Similarity']
    return recognized, similarity

@attendance_api.route('/attendance', methods=['POST'])
def attendance():
    try:
        data = request.get_json()
        print(f"[INFO] API /attendance payload: {data}")
        image_base64 = data.get('imageBase64')
        student_id = data.get('studentId')
        class_id = data.get('ClassId') or data.get('classId')
        if not image_base64 or not student_id or not class_id:
            print(f"[ERROR] Missing data: imageBase64={bool(image_base64)}, studentId={student_id}, classId={class_id}")
            return jsonify({'error': 'Missing data'}), 400

        # Lưu ảnh điểm danh vào GCS
        try:
            attendance_file_name = save_attendance_image(student_id, image_base64)
        except Exception as e:
            print(f"[ERROR] Lỗi lưu ảnh điểm danh: {e}")
            return jsonify({'error': 'Save image error', 'details': str(e)}), 500

        # So sánh bằng Rekognition
        try:
            recognized, similarity = compare_faces_with_rekognition(student_id, attendance_file_name)
        except Exception as e:
            print(f"[ERROR] Rekognition error: {e}")
            return jsonify({'error': 'Rekognition error', 'details': str(e)}), 500

        # Lưu kết quả vào collection 'attendance' với schema mới
        try:
            attendance_doc = {
                'classId': class_id,
                'studentId': student_id,
                'image_url': f'https://storage.googleapis.com/{os.environ.get("GCS_BUCKET_NAME")}/{attendance_file_name}',
                'similarity': similarity,
                'status': 'present' if recognized else 'absent',
                'createdAt': datetime.utcnow(),
                'verifiedBy': 'rekognition'
            }
            doc_ref = db.collection('attendance').add(attendance_doc)[1]
            print(f"[INFO] Firestore log success: doc_ref={doc_ref}")
        except Exception as e:
            print(f"[ERROR] Firestore log error: {e}")
            return jsonify({'error': 'Firestore log error', 'details': str(e)}), 500

        print(f"[INFO] Attendance success: studentId={student_id}, classId={class_id}, recognized={recognized}, similarity={similarity}")
        print(f"[INFO] Attendance API response: recognized={recognized}, similarity={similarity}, doc_ref={doc_ref}")
        return jsonify({'recognized': recognized, 'similarity': similarity, 'doc_ref': str(doc_ref)})
    except Exception as e:
        import traceback
        print(f"[FATAL] Unknown error: {e}\nTraceback: {traceback.format_exc()}")
        return jsonify({'error': 'Unknown error', 'details': str(e), 'trace': traceback.format_exc()}), 500
