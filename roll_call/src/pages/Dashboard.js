import React, { useContext } from 'react';
import { Typography, Card, Row, Col, Statistic, Table, Badge, Button, Progress, Tabs } from 'antd';
import {
    UserOutlined,
    TeamOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { AuthContext } from '../App';

const { Title } = Typography;

// Mock data for dashboard
const MOCK_CLASSES = [
    { id: 1, name: 'Web Development', code: 'CS101', totalStudents: 35, presentToday: 28 },
    { id: 2, name: 'Database Systems', code: 'CS202', totalStudents: 42, presentToday: 36 },
    { id: 3, name: 'Machine Learning', code: 'CS301', totalStudents: 30, presentToday: 25 },
    { id: 4, name: 'Computer Networks', code: 'CS401', totalStudents: 38, presentToday: 30 },
];

const MOCK_RECENT_ATTENDANCE = [
    { id: 1, name: 'John Doe', class: 'Web Development', time: '08:45 AM', status: 'present' },
    { id: 2, name: 'Jane Smith', class: 'Database Systems', time: '09:15 AM', status: 'present' },
    { id: 3, name: 'Bob Johnson', class: 'Machine Learning', time: '10:00 AM', status: 'late' },
    { id: 4, name: 'Alice Brown', class: 'Computer Networks', time: '11:30 AM', status: 'absent' },
    { id: 5, name: 'Charlie Wilson', class: 'Web Development', time: '01:15 PM', status: 'present' },
];

// Mock attendance history for student
const MOCK_STUDENT_ATTENDANCE = [
    { id: 1, className: 'Web Development', date: '2023-06-10', status: 'present' },
    { id: 2, className: 'Database Systems', date: '2023-06-09', status: 'present' },
    { id: 3, className: 'Machine Learning', date: '2023-06-08', status: 'absent' },
    { id: 4, className: 'Computer Networks', date: '2023-06-07', status: 'late' },
    { id: 5, className: 'Web Development', date: '2023-06-06', status: 'present' },
];

const Dashboard = () => {
    const { currentUser } = useContext(AuthContext);
    const isTeacher = currentUser?.role === 'teacher';

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

    return (
        <div>
            <Title level={3}>Dashboard</Title>

            {isTeacher ? (
                // Teacher Dashboard
                <>
                    {/* Stats Row */}
                    <Row gutter={16} className="mb-6">
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Total Students"
                                    value={145}
                                    prefix={<TeamOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Present Today"
                                    value={119}
                                    prefix={<CheckCircleOutlined />}
                                    valueStyle={{ color: '#3f8600' }}
                                    suffix={<span className="text-sm">(82%)</span>}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Absent Today"
                                    value={26}
                                    prefix={<ExclamationCircleOutlined />}
                                    valueStyle={{ color: '#cf1322' }}
                                    suffix={<span className="text-sm">(18%)</span>}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Attendance Rate"
                                    value={82}
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
                                    dataSource={MOCK_CLASSES}
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
                                    dataSource={MOCK_RECENT_ATTENDANCE}
                                    columns={attendanceColumns}
                                    rowKey="id"
                                    size="small"
                                    pagination={false}
                                />
                            </Card>
                        </Col>
                    </Row>
                </>
            ) : (
                // Student Dashboard
                <>
                    {/* Student Stats */}
                    <Row gutter={16} className="mb-6">
                        <Col xs={24} sm={8}>
                            <Card>
                                <Statistic
                                    title="Total Classes"
                                    value={4}
                                    prefix={<CalendarOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card>
                                <Statistic
                                    title="Attendance Rate"
                                    value={85}
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
                                    value="Web Dev"
                                    prefix={<ClockCircleOutlined />}
                                    suffix="(1:30 PM)"
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
                                    dataSource={MOCK_STUDENT_ATTENDANCE}
                                    columns={studentAttendanceColumns}
                                    rowKey="id"
                                    pagination={false}
                                />
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="By Class" key="2">
                                <div className="py-4">
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Card title="Web Development" bordered={false}>
                                                <Statistic
                                                    title="Attendance Rate"
                                                    value={90}
                                                    suffix="%"
                                                    valueStyle={{ color: '#3f8600' }}
                                                />
                                                <div className="mt-2">
                                                    <span>Present: 18</span>
                                                    <span className="ml-4">Absent: 2</span>
                                                </div>
                                            </Card>
                                        </Col>
                                        <Col span={12}>
                                            <Card title="Database Systems" bordered={false}>
                                                <Statistic
                                                    title="Attendance Rate"
                                                    value={75}
                                                    suffix="%"
                                                    valueStyle={{ color: '#faad14' }}
                                                />
                                                <div className="mt-2">
                                                    <span>Present: 15</span>
                                                    <span className="ml-4">Absent: 5</span>
                                                </div>
                                            </Card>
                                        </Col>
                                    </Row>
                                </div>
                            </Tabs.TabPane>
                        </Tabs>
                    </Card>
                </>
            )}
        </div>
    );
};

export default Dashboard;
