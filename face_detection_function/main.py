import os
from google.cloud import storage, vision, firestore

def process_image(event, context):
    bucket_name = event['face-attendance-images']
    file_name = event['name']

    print(f"New image uploaded: {file_name} in bucket {bucket_name}")

    # Init Cloud Vision client
    vision_client = vision.ImageAnnotatorClient()

    # Init Cloud Storage client
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(file_name)

    image_uri = f"gs://{bucket_name}/{file_name}"
    image = vision.Image(source=vision.ImageSource(image_uri=image_uri))

    # Call face detection
    response = vision_client.face_detection(image=image)
    faces = response.face_annotations

    print(f"Detected {len(faces)} face(s) in {file_name}")

    # Init Firestore client
    db = firestore.Client()

    # Save attendance log (sample)
    attendance_ref = db.collection('attendance_logs').document()
    attendance_ref.set({
        'file': file_name,
        'bucket': bucket_name,
        'face_count': len(faces),
        'timestamp': context.timestamp,
    })

    print("Attendance logged.")

    if response.error.message:
        raise Exception(f"Vision API Error: {response.error.message}")
