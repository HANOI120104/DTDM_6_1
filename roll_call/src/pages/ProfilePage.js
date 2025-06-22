import React, { useContext } from 'react';
import { Typography, Card, Avatar, Descriptions, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { AuthContext } from '../App';

const { Title } = Typography;

const ProfilePage = () => {
    const { currentUser } = useContext(AuthContext);

    return (
        <div>
            <Title level={3}>My Profile</Title>

            <Card className="mb-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="flex flex-col items-center">
                        <Avatar
                            src={currentUser?.photoURL}
                            icon={<UserOutlined />}
                            size={120}
                        />
                        <Title level={4} className="mt-4 mb-0">
                            {currentUser?.displayName}
                        </Title>
                        <Tag color="blue" className="mt-2">
                            {currentUser?.role === 'teacher' ? 'Teacher' : 'Student'}
                        </Tag>
                    </div>

                    <div className="flex-1">
                        <Descriptions
                            title="User Information"
                            bordered
                            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                        >
                            <Descriptions.Item label="User ID">{currentUser?.uid}</Descriptions.Item>
                            <Descriptions.Item label="Email">{currentUser?.email}</Descriptions.Item>
                            <Descriptions.Item label="Role">{currentUser?.role === 'teacher' ? 'Teacher' : 'Student'}</Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color="green">Active</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Last Login">2023-07-15 10:30:45</Descriptions.Item>
                            <Descriptions.Item label="Department">Computer Science</Descriptions.Item>
                        </Descriptions>

                        {currentUser?.role === 'teacher' ? (
                            <div className="mt-6">
                                <Title level={5}>Classes Teaching</Title>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <Tag color="blue">Web Development (CS101)</Tag>
                                    <Tag color="blue">Database Systems (CS202)</Tag>
                                    <Tag color="blue">Machine Learning (CS301)</Tag>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6">
                                <Title level={5}>Enrolled Classes</Title>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <Tag color="blue">Web Development (CS101)</Tag>
                                    <Tag color="blue">Database Systems (CS202)</Tag>
                                    <Tag color="blue">Machine Learning (CS301)</Tag>
                                    <Tag color="blue">Computer Networks (CS401)</Tag>
                                </div>
                            </div>
                        )}

                        <div className="mt-6">
                            <Title level={5}>Attendance Stats</Title>
                            <div className="flex flex-wrap gap-4 mt-2">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="text-xl font-semibold">92%</div>
                                    <div className="text-gray-500">Overall Attendance</div>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <div className="text-xl font-semibold">45</div>
                                    <div className="text-gray-500">Present Days</div>
                                </div>
                                <div className="bg-red-50 p-3 rounded-lg">
                                    <div className="text-xl font-semibold">4</div>
                                    <div className="text-gray-500">Absent Days</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ProfilePage; 