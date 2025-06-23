import React, { useContext, useEffect, useState } from 'react';
import { Typography, Card, Row, Col, Statistic, Table, Tabs, message } from 'antd';
import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { AuthContext } from '../App';

const { Title } = Typography;

const Dashboard = () => {
    const { currentUser } = useContext(AuthContext);
    const [studentData, setStudentData] = useState(null);
    const [teacherData, setTeacherData] = useState(null);
    const isTeacher = currentUser?.role === "teacher";

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                if (isTeacher) {
                    const res = await fetch("http://localhost:5002/api/dashboard/teacher?teacher=" + currentUser.id);
                    const data = await res.json();
                    if (data.success) setTeacherData(data);
                } else {
                    const res = await fetch("http://localhost:5002/api/dashboard/student?student=" + (currentUser.studentId || currentUser.student_id));
                    const data = await res.json();
                    if (data.success) setStudentData(data);
                }
            } catch {
                message.error("Failed to load dashboard data");
            }
        };
        if (currentUser) fetchDashboard();
    }, [currentUser, isTeacher]);

    // Cột cho bảng lịch sử điểm danh của student
    const studentAttendanceColumns = [
        { title: "Date", dataIndex: "date", key: "date" },
        { title: "Class", dataIndex: "className", key: "className" },
        { title: "Status", dataIndex: "status", key: "status" },
    ];

    return (
        <div>
            <Title level={3}>Dashboard</Title>
            {/* TEACHER DASHBOARD */}
            {isTeacher && teacherData && (
                <Row gutter={16} className="mb-6">
                    <Col xs={24} sm={8}>
                        <Card>
                            <Statistic
                                title="Total Classes"
                                value={teacherData.total_classes}
                                prefix={<CalendarOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card>
                            <Statistic
                                title="Total Students"
                                value={teacherData.total_students}
                                prefix={<CheckCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card>
                            <Statistic
                                title="Total Attendance Sessions"
                                value={teacherData.total_attendance}
                                prefix={<ClockCircleOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* STUDENT DASHBOARD */}
            {!isTeacher && studentData && (
                <>
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
                                    suffix={studentData.next_class?.time ? `(${studentData.next_class.time})` : ""}
                                />
                            </Card>
                        </Col>
                    </Row>
                    <Card title="My Attendance History" className="mb-6">
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
                                        {studentData.by_class?.map((cls, idx) => (
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
            )}
        </div>
    );
};

export default Dashboard;
