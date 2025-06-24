import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from google.cloud import firestore

def send_email(to_email, subject, body):
    smtp_server = os.environ.get('SMTP_SERVER')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    from_email = os.environ.get('FROM_EMAIL', smtp_user)

    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(from_email, to_email, msg.as_string())

# Cloud Function entry point
# Trigger: Firestore document create/update in 'attendance' collection
def firestore_trigger(event, context):
    # event['value']['fields'] contains the new document fields
    value = event.get('value', {})
    fields = value.get('fields', {})
    status = fields.get('status', {}).get('stringValue', '')
    student_id = fields.get('student_id', {}).get('stringValue', '')
    class_id = fields.get('class_id', {}).get('stringValue', '')

    if status == 'absent' and student_id:
        # Lấy email sinh viên từ Firestore
        db = firestore.Client()
        user_ref = db.collection('users').document(student_id)
        user_doc = user_ref.get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            to_email = user_data.get('email')
            student_name = user_data.get('name', student_id)
            if to_email:
                subject = 'Thông báo vắng mặt'
                body = f'Chào {student_name},\nBạn đã bị điểm danh vắng ở lớp {class_id}. Nếu có thắc mắc, vui lòng liên hệ giáo viên.'
                send_email(to_email, subject, body)
                print(f"Đã gửi email vắng mặt tới {to_email}")
            else:
                print(f"Không tìm thấy email cho sinh viên {student_id}")
        else:
            print(f"Không tìm thấy user {student_id}")
    else:
        print("Không phải trường hợp vắng mặt hoặc thiếu student_id")
