import React, { useContext, useEffect, useState } from 'react';
import { Typography, Card, Row, Col, Statistic, Table, Badge, Button, Progress, Tabs, Spin, message } from 'antd';
import {
    TeamOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ArrowUpOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { AuthContext } from '../App';

const { Title } = Typography;

const Dashboard = () => {
    const { currentUser } = useContext(AuthContext);
    const isTeacher = currentUser?.role === 'teacher';

    console.log("currentUser:", currentUser);
    console.log("isTeacher:", isTeacher);

    // State cho dữ liệu dashboard
    const [loading, setLoading] = useState(true);
    const [teacherData, setTeacherData] = useState(null);
    const [studentData, setStudentData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const endpoint = isTeacher
                    ? '/api/dashboard/teacher'
                    : '/api/dashboard/student?uid=' + currentUser.uid;
                const res = await fetch(process.env.REACT_APP_API_URL + endpoint, {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-Id': currentUser.uid
                    }
                });
                if (!res.ok) throw new Error('Fetch failed');
                const data = await res.json();
                console.log("API data:", data);
                if (isTeacher) setTeacherData(data);
                else setStudentData(data);
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isTeacher, currentUser.uid]);

    // Table columns for recent attendance
    const attendanceColumns = [
        {
            title: 'Student',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Class',
            dataIndex: 'class',
            key: 'class',
        },
        {
            title: 'Time',
            dataIndex: 'time',
            key: 'time',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                if (status === 'present') {
                    return <Badge status="success" text="Present" />;
                } else if (status === 'absent') {
                    return <Badge status="error" text="Absent" />;
                } else {
                    return <Badge status="warning" text="Late" />;
                }
            },
        },
    ];

    // Table columns for student's attendance history
    const studentAttendanceColumns = [
        {
            title: 'Class',
            dataIndex: 'className',
            key: 'className',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                if (status === 'present') {
                    return <Badge status="success" text="Present" />;
                } else if (status === 'absent') {
                    return <Badge status="error" text="Absent" />;
                } else {
                    return <Badge status="warning" text="Late" />;
                }
            },
        },
    ];

    // Table columns for classes
    const classesColumns = [
        {
            title: 'Class Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: 'Attendance',
            key: 'attendance',
            render: (_, record) => (
                <span>
                    {record.presentToday}/{record.totalStudents}
                    <Progress
                        percent={Math.round((record.presentToday / record.totalStudents) * 100)}
                        size="small"
                        status="active"
                        style={{ marginLeft: 10, width: 100 }}
                    />
                </span>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: () => (
                <Button type="primary" size="small">
                    Details
                </Button>
            ),
        },
    ];

    // Thay thế MOCK_* bằng dữ liệu từ API
    return (
        <div>
            <Title level={3}>Dashboard</Title>
            {loading ? (
                <Spin size="large" />
            ) : isTeacher ? (
                teacherData && (
                    <>
                        {/* Stats Row */}
                        <Row gutter={16} className="mb-6">
                            <Col xs={24} sm={12} lg={6}>
                                <Card>
                                    <Statistic
                                        title="Total Students"
                                        value={teacherData.total_students}
                                        prefix={<TeamOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <Card>
                                    <Statistic
                                        title="Present Today"
                                        value={teacherData.present_today}
                                        prefix={<CheckCircleOutlined />}
                                        valueStyle={{ color: '#3f8600' }}
                                        suffix={<span className="text-sm">
                                            ({Math.round((teacherData.present_today / teacherData.total_students) * 100)}%)
                                        </span>}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <Card>
                                    <Statistic
                                        title="Absent Today"
                                        value={teacherData.absent_today}
                                        prefix={<ExclamationCircleOutlined />}
                                        valueStyle={{ color: '#cf1322' }}
                                        suffix={<span className="text-sm">
                                            ({Math.round((teacherData.absent_today / teacherData.total_students) * 100)}%)
                                        </span>}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <Card>
                                    <Statistic
                                        title="Attendance Rate"
                                        value={teacherData.attendance_rate}
                                        prefix={<ArrowUpOutlined />}
                                        valueStyle={{ color: '#3f8600' }}
                                        suffix="%"
                                    />
                                </Card>
                            </Col>
                        </Row>
                        {/* Classes and Recent Attendance */}
                        <Row gutter={16}>
                            <Col xs={24} lg={14}>
                                <Card
                                    title="Today's Classes"
                                    extra={<Button type="link">View All</Button>}
                                    className="mb-6"
                                >
                                    <Table
                                        dataSource={teacherData.classes}
                                        columns={classesColumns}
                                        rowKey="id"
                                        size="middle"
                                        pagination={false}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} lg={10}>
                                <Card
                                    title="Recent Attendance"
                                    extra={<Button type="link">View All</Button>}
                                    className="mb-6"
                                >
                                    <Table
                                        dataSource={teacherData.recent_attendance}
                                        columns={attendanceColumns}
                                        rowKey="id"
                                        size="small"
                                        pagination={false}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </>
                )
            ) : (
                studentData && (
                    <>
                        {/* Student Stats */}
                        <Row gutter={16} className="mb-6">
                            <Col xs={24} sm={8}>
                                <Card>
                                    <Statistic
                                        title="Total Classes"
                                        value={studentData.total_classes}
                                        prefix={<CalendarOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card>
                                    <Statistic
                                        title="Attendance Rate"
                                        value={studentData.attendance_rate}
                                        prefix={<CheckCircleOutlined />}
                                        valueStyle={{ color: '#3f8600' }}
                                        suffix="%"
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card>
                                    <Statistic
                                        title="Next Class"
                                        value={studentData.next_class?.name}
                                        prefix={<ClockCircleOutlined />}
                                        suffix={`(${studentData.next_class?.time})`}
                                    />
                                </Card>
                            </Col>
                        </Row>
                        {/* Student Attendance History */}
                        <Card
                            title="My Attendance History"
                            className="mb-6"
                        >
                            <Tabs defaultActiveKey="1">
                                <Tabs.TabPane tab="Recent" key="1">
                                    <Table
                                        dataSource={studentData.attendance_history}
                                        columns={studentAttendanceColumns}
                                        rowKey="id"
                                        pagination={false}
                                    />
                                </Tabs.TabPane>
                                <Tabs.TabPane tab="By Class" key="2">
                                    <div className="py-4">
                                        <Row gutter={16}>
                                            {studentData.by_class.map((cls, idx) => (
                                                <Col span={12} key={idx}>
                                                    <Card title={cls.className} bordered={false}>
                                                        <Statistic
                                                            title="Attendance Rate"
                                                            value={cls.attendance_rate}
                                                            suffix="%"
                                                            valueStyle={{ color: cls.attendance_rate >= 85 ? '#3f8600' : '#faad14' }}
                                                        />
                                                        <div className="mt-2">
                                                            <span>Present: {cls.present}</span>
                                                            <span className="ml-4">Absent: {cls.absent}</span>
                                                        </div>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>
                                </Tabs.TabPane>
                            </Tabs>
                        </Card>
                    </>
                )
            )}
        </div>
    );
};

export default Dashboard;
