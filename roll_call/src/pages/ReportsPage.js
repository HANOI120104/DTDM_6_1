import React, { useEffect, useState } from "react";
import { Table, Select, Card, Typography } from "antd";

const { Option } = Select;
const { Title } = Typography;

const API_BASE_URL = process.env.REACT_APP_API_URL;

const ReportsPage = () => {
    const [classList, setClassList] = useState([]);
    const [selectedClass, setSelectedClass] = useState("all");
    const [report, setReport] = useState([]);
    const [loading, setLoading] = useState(false);

    // Lấy danh sách lớp
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/classes`);
                const data = await res.json();
                if (data.success) setClassList(data.classes);
                else setClassList([]);
            } catch {
                setClassList([]);
            }
        };
        fetchClasses();
    }, []);

    // Lấy báo cáo điểm danh
    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            try {
                let url = `${API_BASE_URL}/api/reports/attendance`;
                if (selectedClass !== "all") url += `?class=${selectedClass}`;
                const res = await fetch(url);
                const data = await res.json();
                if (data.success) setReport(data.data);
                else setReport([]);
            } catch {
                setReport([]);
            }
            setLoading(false);
        };
        fetchReport();
    }, [selectedClass]);

    const columns = [
        { title: "Student ID", dataIndex: "studentId", key: "studentId" },
        { title: "Name", dataIndex: "name", key: "name" },
        { title: "Present", dataIndex: "present", key: "present" },
        { title: "Absent", dataIndex: "absent", key: "absent" },
        { title: "Late", dataIndex: "late", key: "late" },
        { title: "Attendance Rate", dataIndex: "attendanceRate", key: "attendanceRate", render: (rate) => `${rate}%` },
    ];

    return (
        <div>
            <Title level={3}>Attendance Report</Title>
            <Card className="mb-6">
                <div style={{ marginBottom: 16 }}>
                    <span>Class: </span>
                    <Select
                        value={selectedClass}
                        onChange={setSelectedClass}
                        style={{ width: 220, marginLeft: 8 }}
                    >
                        <Option value="all">All Classes</Option>
                        {classList.map(cls => (
                            <Option key={cls.id} value={cls.id}>
                                {cls.name} ({cls.code})
                            </Option>
                        ))}
                    </Select>
                </div>
                <Table
                    dataSource={report}
                    columns={columns}
                    rowKey="studentId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default ReportsPage;