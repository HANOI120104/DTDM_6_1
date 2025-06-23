import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
    Form,
    Input,
    Button,
    Checkbox,
    Card,
    Typography,
    Divider,
    Alert,
    Space
} from 'antd';
import {
    UserOutlined,
    LockOutlined,
    GoogleOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { AuthContext } from '../../App';

const { Title, Text } = Typography;

const Login = () => {
    const { login, loading } = useContext(AuthContext);
    const [error, setError] = useState('');

    const onFinish = async (values) => {
        setError('');
        try {
            await login(values.email, values.password);
        } catch (err) {
            // Xử lý lỗi Firebase Auth
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Tài khoản hoặc mật khẩu không đúng. Vui lòng kiểm tra lại!');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau!');
            } else {
                setError(err.message || 'Đăng nhập thất bại.');
            }
        }
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
                    <Title level={2} className="m-0">Roll Call App</Title>
                    <Text type="secondary">Sign in to your account</Text>
                </div>

                {error && (
                    <Alert
                        message="Login Error"
                        description={error}
                        type="error"
                        showIcon
                        className="mb-4"
                    />
                )}

                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[{ required: true, message: 'Please input your Email!' }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Email"
                            className="rounded-md"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Password"
                            className="rounded-md"
                        />
                    </Form.Item>

                    <Form.Item>
                        <div className="flex justify-between">
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800">
                                Forgot password?
                            </Link>
                        </div>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="w-full"
                            loading={loading}
                        >
                            Sign In
                        </Button>
                    </Form.Item>

                    <Divider plain>Or</Divider>

                    <Space direction="vertical" className="w-full">
                        <Button
                            icon={<GoogleOutlined />}
                            className="w-full"
                            onClick={() => setError('Google sign-in is not implemented in this demo')}
                        >
                            Sign in with Google
                        </Button>

                        <div className="text-center mt-4">
                            <Text type="secondary">
                                Don't have an account? <Link to="/register" className="text-blue-600 hover:text-blue-800">Sign up</Link>
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

export default Login;