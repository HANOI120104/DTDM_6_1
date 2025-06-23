import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Select,
    Alert,
    Divider,
    Space
} from 'antd';
import {
    UserOutlined,
    LockOutlined,
    MailOutlined,
    IdcardOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { createUserWithEmailAndPassword, updateProfile, getAuth } from "firebase/auth";
import { auth } from "../../firebase";

const { Title, Text } = Typography;
const { Option } = Select;

const Register = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isTeacher, setIsTeacher] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(process.env.REACT_APP_API_URL + '/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: values.fullName,
                    email: values.email,
                    studentId: values.role === 'student' ? values.studentId : undefined,
                    teacherId: values.role === 'teacher' ? values.studentId : undefined,
                    role: values.role,
                    password: values.password
                })
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.error || 'Registration failed');
                setLoading(false);
                return;
            }
            // Sau khi đăng ký thành công, có thể tự động đăng nhập ở đây nếu muốn
            navigate('/login');
        } catch (error) {
            setLoading(false);
            setError(error.message);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const auth = getAuth();
                const user = auth.currentUser;
                if (!user) throw new Error("Not logged in");
                const token = await user.getIdToken();

                const endpoint = isTeacher ? '/dashboard/teacher' : '/dashboard/student';
                const res = await fetch(process.env.REACT_APP_API_URL + endpoint, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                });
                if (!res.ok) throw new Error('Fetch failed');
                const data = await res.json();
                // ...set state như bình thường...
            } catch (err) {
                // ...handle error...
            }
            setLoading(false);
        };
        fetchData();
    }, [isTeacher]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card
                className="w-full max-w-md shadow-lg rounded-lg"
                bordered={false}
            >
                <div className="text-center mb-6">
                    <div className="flex justify-center items-center mb-4">
                        <CalendarOutlined className="text-4xl text-blue-600" />
                    </div>
                    <Title level={2} className="m-0">Create an Account</Title>
                    <Text type="secondary">Sign up for Roll Call App</Text>
                </div>

                {error && (
                    <Alert
                        message="Registration Error"
                        description={error}
                        type="error"
                        showIcon
                        className="mb-4"
                    />
                )}

                <Form
                    name="register"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="fullName"
                        rules={[{ required: true, message: 'Please input your full name!' }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Full Name"
                            className="rounded-md"
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your Email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="Email"
                            className="rounded-md"
                        />
                    </Form.Item>

                    <Form.Item
                        name="studentId"
                        rules={[{ required: true, message: 'Please input your ID!' }]}
                    >
                        <Input
                            prefix={<IdcardOutlined />}
                            placeholder="Student/Teacher ID"
                            className="rounded-md"
                        />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        rules={[{ required: true, message: 'Please select your role!' }]}
                    >
                        <Select placeholder="Select your role" onChange={(value) => setIsTeacher(value === 'teacher')}>
                            <Option value="student">Student</Option>
                            <Option value="teacher">Teacher</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Please input your Password!' },
                            { min: 6, message: 'Password must be at least 6 characters!' }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Password"
                            className="rounded-md"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Please confirm your password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Confirm Password"
                            className="rounded-md"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="w-full"
                            loading={loading}
                        >
                            Register
                        </Button>
                    </Form.Item>

                    <Divider />

                    <Space direction="vertical" className="w-full">
                        <div className="text-center">
                            <Text type="secondary">
                                Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-800">Sign in</Link>
                            </Text>
                        </div>

                        <div className="text-center mt-2 text-xs text-gray-500">
                            <div>Demo accounts:</div>
                            <div>Teacher: teacher@example.com / password</div>
                            <div>Student: student@example.com / password</div>
                        </div>
                    </Space>
                </Form>
            </Card>
        </div>
    );
};

export default Register;