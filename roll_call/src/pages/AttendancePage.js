import React, { useState, useRef, useContext } from 'react';
import {
    Typography,
    Card,
    Button,
    message,
    Upload,
    Space,
    Divider,
    Select,
    Table,
    Tag,
    Steps,
    Spin,
    Result,
    Modal,
    Form,
    Input
} from 'antd';
import {
    CameraOutlined,
    UploadOutlined,
    UserOutlined,
    CheckCircleOutlined,
    LoadingOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { AuthContext } from '../App';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Mock data for classes
const MOCK_CLASSES = [
    { id: 1, name: 'Web Development', code: 'CS101' },
    { id: 2, name: 'Database Systems', code: 'CS202' },
    { id: 3, name: 'Machine Learning', code: 'CS301' },
    { id: 4, name: 'Computer Networks', code: 'CS401' },
];

// Mock recognized students data
const MOCK_RECOGNIZED_STUDENTS = [
    { id: 1, name: 'John Doe', studentId: 'ST1001', confidence: 0.95, status: 'success' },
    { id: 2, name: 'Jane Smith', studentId: 'ST1002', confidence: 0.98, status: 'success' },
    { id: 3, name: 'Bob Johnson', studentId: 'ST1003', confidence: 0.72, status: 'warning' },
    { id: 4, name: 'Alice Brown', studentId: 'ST1004', confidence: 0.45, status: 'error' },
    { id: 5, name: 'Charlie Wilson', studentId: 'ST1005', confidence: 0.88, status: 'success' },
];

const AttendancePage = () => {
    const { currentUser } = useContext(AuthContext);
    const isTeacher = currentUser?.role === 'teacher';
    const videoRef = useRef(null);
    const photoRef = useRef(null);
    const streamRef = useRef(null);

    const [cameraActive, setCameraActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [recognitionComplete, setRecognitionComplete] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [recognizedStudents, setRecognizedStudents] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [showManualModal, setShowManualModal] = useState(false);

    // Start camera stream
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user'
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setCameraActive(true);
            }
        } catch (err) {
            message.error('Unable to access camera: ' + err.message);
        }
    };

    // Stop camera stream
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            setCameraActive(false);
        }
    };

    // Capture photo from camera
    const capturePhoto = () => {
        if (!videoRef.current || !photoRef.current) return;

        const video = videoRef.current;
        const photo = photoRef.current;
        const ctx = photo.getContext('2d');

        // Set canvas dimensions to match video
        photo.width = video.videoWidth;
        photo.height = video.videoHeight;

        // Draw the video frame to the canvas
        ctx.drawImage(video, 0, 0, photo.width, photo.height);

        // Convert to data URL
        const imageUrl = photo.toDataURL('image/jpeg');
        setCapturedImage(imageUrl);

        // Stop the camera after capturing
        stopCamera();
        setCurrentStep(1);
    };

    // Retry capturing photo
    const retryCapture = () => {
        setCapturedImage(null);
        startCamera();
        setCurrentStep(0);
    };

    // Handle file upload
    const handleFileUpload = (info) => {
        if (info.file.status === 'uploading') {
            setUploading(true);
            return;
        }

        if (info.file.status === 'done') {
            // Get the uploaded file and convert to data URL
            getBase64(info.file.originFileObj, (imageUrl) => {
                setCapturedImage(imageUrl);
                setUploading(false);
                setCurrentStep(1);
            });
        }
    };

    // Convert file to base64
    const getBase64 = (file, callback) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(file);
    };

    // Process the captured image for face recognition
    const processImage = () => {
        if (!capturedImage || !selectedClass) {
            message.error('Please capture an image and select a class');
            return;
        }

        setProcessing(true);

        // Simulate AI processing
        setTimeout(() => {
            setProcessing(false);
            setRecognitionComplete(true);
            setRecognizedStudents(MOCK_RECOGNIZED_STUDENTS);
            setCurrentStep(2);
        }, 3000);
    };

    // Reset the whole process
    const resetProcess = () => {
        setCapturedImage(null);
        setSelectedClass(null);
        setRecognitionComplete(false);
        setRecognizedStudents([]);
        setCurrentStep(0);
    };

    // Submit attendance records
    const submitAttendance = () => {
        message.success('Attendance records have been submitted successfully!');
        resetProcess();
    };

    // For manual attendance entry
    const handleManualAttendance = (values) => {
        message.success(`Manual attendance recorded for ID: ${values.studentId}`);
        setShowManualModal(false);
    };

    // Table columns for recognized students
    const studentsColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Student ID',
            dataIndex: 'studentId',
            key: 'studentId',
        },
        {
            title: 'Confidence',
            dataIndex: 'confidence',
            key: 'confidence',
            render: (confidence) => `${(confidence * 100).toFixed(1)}%`,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                if (status === 'success') {
                    return <Tag color="success">Recognized</Tag>;
                } else if (status === 'warning') {
                    return <Tag color="warning">Low Confidence</Tag>;
                } else {
                    return <Tag color="error">Not Recognized</Tag>;
                }
            },
        },
    ];

    // Steps for attendance process
    const steps = [
        {
            title: 'Capture',
            description: 'Take a photo or upload an image',
            icon: <CameraOutlined />,
        },
        {
            title: 'Verify',
            description: 'Verify image and select class',
            icon: <UserOutlined />,
        },
        {
            title: 'Results',
            description: 'View recognition results',
            icon: <TeamOutlined />,
        },
    ];

    // Student view - simpler attendance check-in
    if (!isTeacher) {
        return (
            <div>
                <Title level={3}>Attendance Check-in</Title>

                <Card className="mb-6">
                    <div className="text-center mb-4">
                        <Title level={4}>Check In to Your Class</Title>
                        <Text type="secondary">Use your camera to record attendance</Text>
                    </div>

                    {!recognitionComplete ? (
                        <div>
                            {!capturedImage ? (
                                <div className="flex flex-col items-center">
                                    {cameraActive ? (
                                        <div className="mb-4 relative">
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                className="rounded-lg shadow-md"
                                                style={{ maxWidth: '100%', maxHeight: '400px' }}
                                            />
                                            <canvas ref={photoRef} style={{ display: 'none' }} />
                                        </div>
                                    ) : (
                                        <div className="flex justify-center mb-4">
                                            <div
                                                className="bg-gray-200 rounded-lg flex items-center justify-center"
                                                style={{ width: '320px', height: '240px' }}
                                            >
                                                <CameraOutlined style={{ fontSize: '3rem', color: '#aaa' }} />
                                            </div>
                                        </div>
                                    )}

                                    <Space direction="vertical" className="w-full">
                                        {cameraActive ? (
                                            <Button
                                                type="primary"
                                                size="large"
                                                icon={<CameraOutlined />}
                                                onClick={capturePhoto}
                                            >
                                                Take Photo
                                            </Button>
                                        ) : (
                                            <Button
                                                type="primary"
                                                size="large"
                                                icon={<CameraOutlined />}
                                                onClick={startCamera}
                                            >
                                                Start Camera
                                            </Button>
                                        )}

                                        <Divider>Or</Divider>

                                        <Upload
                                            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                            listType="picture"
                                            maxCount={1}
                                            onChange={handleFileUpload}
                                            showUploadList={false}
                                        >
                                            <Button
                                                icon={<UploadOutlined />}
                                                size="large"
                                                loading={uploading}
                                            >
                                                Upload Photo
                                            </Button>
                                        </Upload>
                                    </Space>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="mb-4">
                                        <img
                                            src={capturedImage}
                                            alt="Captured"
                                            className="rounded-lg shadow-md"
                                            style={{ maxWidth: '100%', maxHeight: '400px' }}
                                        />
                                    </div>

                                    <Form layout="vertical" className="w-full max-w-md">
                                        <Form.Item
                                            label="Select Your Class"
                                            required
                                        >
                                            <Select
                                                placeholder="Select a class"
                                                onChange={(value) => setSelectedClass(value)}
                                                className="w-full"
                                            >
                                                {MOCK_CLASSES.map(cls => (
                                                    <Option key={cls.id} value={cls.id}>
                                                        {cls.name} ({cls.code})
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Form>

                                    <Space>
                                        <Button onClick={retryCapture}>Retake Photo</Button>
                                        <Button
                                            type="primary"
                                            loading={processing}
                                            onClick={processImage}
                                            disabled={!selectedClass}
                                        >
                                            Submit Attendance
                                        </Button>
                                    </Space>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Result
                            status="success"
                            title="Attendance Recorded!"
                            subTitle="Your attendance has been successfully recorded."
                            extra={[
                                <Button type="primary" key="done" onClick={resetProcess}>
                                    Done
                                </Button>,
                            ]}
                        />
                    )}
                </Card>
            </div>
        );
    }

    // Teacher view - more comprehensive attendance management
    return (
        <div>
            <Title level={3}>Attendance Management</Title>

            <Steps
                current={currentStep}
                items={steps}
                className="mb-6"
            />

            <Card className="mb-6">
                {currentStep === 0 && (
                    <div className="text-center">
                        <Title level={4}>Capture Class Photo</Title>
                        <Paragraph type="secondary" className="mb-6">
                            Take a photo of your class or upload an existing image to record attendance
                        </Paragraph>

                        {!capturedImage ? (
                            <div className="flex flex-col items-center">
                                {cameraActive ? (
                                    <div className="mb-4 relative">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            className="rounded-lg shadow-md"
                                            style={{ maxWidth: '100%', maxHeight: '400px' }}
                                        />
                                        <canvas ref={photoRef} style={{ display: 'none' }} />
                                    </div>
                                ) : (
                                    <div className="flex justify-center mb-4">
                                        <div
                                            className="bg-gray-200 rounded-lg flex items-center justify-center"
                                            style={{ width: '640px', height: '480px' }}
                                        >
                                            <CameraOutlined style={{ fontSize: '4rem', color: '#aaa' }} />
                                        </div>
                                    </div>
                                )}

                                <Space direction="vertical" size="large" className="w-full">
                                    {cameraActive ? (
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<CameraOutlined />}
                                            onClick={capturePhoto}
                                        >
                                            Take Photo
                                        </Button>
                                    ) : (
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<CameraOutlined />}
                                            onClick={startCamera}
                                        >
                                            Start Camera
                                        </Button>
                                    )}

                                    <Divider>Or</Divider>

                                    <Space>
                                        <Upload
                                            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                            listType="picture"
                                            maxCount={1}
                                            onChange={handleFileUpload}
                                            showUploadList={false}
                                        >
                                            <Button
                                                icon={<UploadOutlined />}
                                                size="large"
                                                loading={uploading}
                                            >
                                                Upload Class Photo
                                            </Button>
                                        </Upload>

                                        <Button
                                            onClick={() => setShowManualModal(true)}
                                        >
                                            Enter Manually
                                        </Button>
                                    </Space>
                                </Space>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="mb-4">
                                    <img
                                        src={capturedImage}
                                        alt="Captured"
                                        className="rounded-lg shadow-md"
                                        style={{ maxWidth: '100%', maxHeight: '400px' }}
                                    />
                                </div>

                                <Space>
                                    <Button onClick={retryCapture}>Retake Photo</Button>
                                    <Button
                                        type="primary"
                                        onClick={() => setCurrentStep(1)}
                                    >
                                        Continue
                                    </Button>
                                </Space>
                            </div>
                        )}
                    </div>
                )}

                {currentStep === 1 && (
                    <div>
                        <Title level={4}>Verify and Process</Title>
                        <Paragraph type="secondary" className="mb-6">
                            Select the class and process the image for attendance
                        </Paragraph>

                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="md:w-1/2">
                                <div className="mb-4">
                                    <img
                                        src={capturedImage}
                                        alt="Captured"
                                        className="rounded-lg shadow-md"
                                        style={{ maxWidth: '100%', maxHeight: '300px' }}
                                    />
                                </div>
                                <Button onClick={retryCapture}>Retake Photo</Button>
                            </div>

                            <div className="md:w-1/2">
                                <Form layout="vertical">
                                    <Form.Item
                                        label="Select Class"
                                        required
                                    >
                                        <Select
                                            placeholder="Select a class"
                                            onChange={(value) => setSelectedClass(value)}
                                            className="w-full"
                                        >
                                            {MOCK_CLASSES.map(cls => (
                                                <Option key={cls.id} value={cls.id}>
                                                    {cls.name} ({cls.code})
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            loading={processing}
                                            onClick={processImage}
                                            disabled={!selectedClass}
                                            block
                                        >
                                            Process Attendance
                                        </Button>
                                    </Form.Item>
                                </Form>

                                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                                    <Title level={5}>Processing Information</Title>
                                    <ul className="list-disc pl-5">
                                        <li>The system will detect all faces in the image</li>
                                        <li>Each face will be matched against student database</li>
                                        <li>Attendance will be marked for recognized students</li>
                                        <li>You can manually adjust any incorrect matches</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div>
                        <Title level={4}>Recognition Results</Title>
                        <Paragraph type="secondary" className="mb-6">
                            Review the recognized students and submit the attendance record
                        </Paragraph>

                        <div className="mb-4">
                            <Table
                                dataSource={recognizedStudents}
                                columns={studentsColumns}
                                rowKey="id"
                                pagination={false}
                            />
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button onClick={resetProcess}>
                                Start Over
                            </Button>
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={submitAttendance}
                            >
                                Submit Attendance
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Manual Attendance Modal */}
            <Modal
                title="Manual Attendance Entry"
                open={showManualModal}
                onCancel={() => setShowManualModal(false)}
                footer={null}
            >
                <Form
                    layout="vertical"
                    onFinish={handleManualAttendance}
                >
                    <Form.Item
                        name="studentId"
                        label="Student ID"
                        rules={[{ required: true, message: 'Please enter student ID' }]}
                    >
                        <Input placeholder="Enter student ID" />
                    </Form.Item>

                    <Form.Item
                        name="classId"
                        label="Class"
                        rules={[{ required: true, message: 'Please select a class' }]}
                    >
                        <Select placeholder="Select class">
                            {MOCK_CLASSES.map(cls => (
                                <Option key={cls.id} value={cls.id}>
                                    {cls.name} ({cls.code})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <div className="flex justify-end space-x-2">
                            <Button onClick={() => setShowManualModal(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AttendancePage;