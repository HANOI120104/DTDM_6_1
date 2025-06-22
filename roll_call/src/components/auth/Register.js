import React, { useState } from 'react';
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

const { Title, Text } = Typography;
const { Option } = Select;

const Register = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onFinish = (values) => {
        setLoading(true);
        setError('');

        // Simulate registration process
        setTimeout(() => {
            setLoading(false);
            // Instead of actually registering, just show a message
            setError('Registration is disabled in this demo. Please use the demo accounts.');
        }, 1500);
    };

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
                        <Select placeholder="Select your role">
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