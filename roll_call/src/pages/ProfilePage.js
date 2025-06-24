import React, { useContext, useEffect, useState } from 'react';
import { Typography, Card, Avatar, Descriptions, Tag, Spin, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { AuthContext } from '../App';

const { Title } = Typography;
const API_BASE_URL = process.env.REACT_APP_API_URL;

const ProfilePage = () => {
    const { currentUser } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const role = profile?.role || currentUser?.role || 'student';

    useEffect(() => {
        const fetchProfile = async () => {
            if (!currentUser?.uid) return;
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/profile/${currentUser.uid}`);
                const data = await res.json();
                if (data.success) setProfile(data.profile);
                else message.error(data.error || "Failed to load profile");
            } catch (err) {
                message.error("Network error");
            }
            setLoading(false);
        };
        fetchProfile();
    }, [currentUser]);

    if (loading || !profile) {
        return (
            <div className="flex justify-center items-center" style={{ minHeight: 300 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <Title level={3}>My Profile</Title>
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="flex flex-col items-center">
                        <Avatar
                            src={profile.photoURL}
                            icon={<UserOutlined />}
                            size={120}
                        />
                        <Title level={4} className="mt-4 mb-0">
                            {profile.displayName}
                        </Title>
                        <Tag color="blue" className="mt-2">
                            {role === 'teacher' ? 'Teacher' : 'Student'}
                        </Tag>
                    </div>
                    <div className="flex-1">
                        <Descriptions
                            title="User Information"
                            bordered
                            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                        >
                            <Descriptions.Item label="User ID">{profile.user_id}</Descriptions.Item>
                            <Descriptions.Item label="Email">{profile.email}</Descriptions.Item>
                            <Descriptions.Item label="Role">{role === 'teacher' ? 'Teacher' : 'Student'}</Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color="green">{profile.status}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Last Login">{profile.lastLogin}</Descriptions.Item>
                            <Descriptions.Item label="Department">{profile.department}</Descriptions.Item>
                        </Descriptions>
                        {role === 'teacher' ? (
                            <div className="mt-6">
                                <Title level={5}>Classes Teaching</Title>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {(profile.classes || []).map(cls => (
                                        <Tag color="blue" key={cls.code}>{cls.name} ({cls.code})</Tag>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6">
                                <Title level={5}>Enrolled Classes</Title>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {(profile.classes || []).map(cls => (
                                        <Tag color="blue" key={cls.code}>{cls.name} ({cls.code})</Tag>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="mt-6">
                            <Title level={5}>Attendance Stats</Title>
                            <div className="flex flex-wrap gap-4 mt-2">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="text-xl font-semibold">{profile.attendanceStats?.overall ?? 0}%</div>
                                    <div className="text-gray-500">Overall Attendance</div>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <div className="text-xl font-semibold">{profile.attendanceStats?.present ?? 0}</div>
                                    <div className="text-gray-500">Present Days</div>
                                </div>
                                <div className="bg-red-50 p-3 rounded-lg">
                                    <div className="text-xl font-semibold">{profile.attendanceStats?.absent ?? 0}</div>
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