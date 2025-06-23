import React, { useContext, useEffect, useState } from 'react';
import {
    Typography,
    Card,
    DatePicker,
    Select,
    Button,
    Table,
    Space,
    Row,
    Col,
    Statistic,
    Divider,
    Progress,
    Tag,
    Radio
} from 'antd';
import {
    DownloadOutlined,
    BarChartOutlined,
    PieChartOutlined,
    LineChartOutlined,
    FilePdfOutlined,
    FileExcelOutlined
} from '@ant-design/icons';
import { AuthContext } from '../App';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const API_BASE = "http://localhost:5002/api/reports"; // Đổi nếu backend chạy port khác

const ReportsPage = () => {
    const { currentUser } = useContext(AuthContext);
    const isTeacher = currentUser?.role === 'teacher';

    const [selectedClass, setSelectedClass] = useState('all');
    const [dateRange, setDateRange] = useState(null);
    const [reportType, setReportType] = useState('attendance');
    const [chartType, setChartType] = useState('bar');
    const [attendanceData, setAttendanceData] = useState([]);
    const [classAttendance, setClassAttendance] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch attendance data
    const fetchAttendanceData = async () => {
        setLoading(true);
        try {
            let url = `${API_BASE}/attendance`;
            const params = [];
            if (selectedClass && selectedClass !== "all") params.push(`class=${selectedClass}`);
            // Nếu muốn truyền dateRange, thêm vào params ở đây
            if (params.length) url += "?" + params.join("&");
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) setAttendanceData(data.data);
            else setAttendanceData([]);
        } catch (err) {
            setAttendanceData([]);
        }
        setLoading(false);
    };

    // Fetch class attendance summary
    const fetchClassAttendance = async () => {
        try {
            const res = await fetch(`${API_BASE}/class`);
            const data = await res.json();
            if (data.success) setClassAttendance(data.data);
            else setClassAttendance([]);
        } catch (err) {
            setClassAttendance([]);
        }
    };

    useEffect(() => {
        fetchAttendanceData();
        // eslint-disable-next-line
    }, [selectedClass, dateRange, reportType]);

    useEffect(() => {
        fetchClassAttendance();
    }, []);

    // Table columns for attendance report
    const attendanceColumns = [
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
            title: 'Present',
            dataIndex: 'present',
            key: 'present',
            sorter: (a, b) => a.present - b.present,
        },
        {
            title: 'Absent',
            dataIndex: 'absent',
            key: 'absent',
            sorter: (a, b) => a.absent - b.absent,
        },
        {
            title: 'Late',
            dataIndex: 'late',
            key: 'late',
            sorter: (a, b) => a.late - b.late,
        },
        {
            title: 'Attendance Rate',
            key: 'attendanceRate',
            dataIndex: 'attendanceRate',
            sorter: (a, b) => a.attendanceRate - b.attendanceRate,
            render: (rate) => {
                let color = 'green';
                if (rate < 70) {
                    color = 'red';
                } else if (rate < 85) {
                    color = 'orange';
                }
                return (
                    <div>
                        <Progress
                            percent={rate}
                            size="small"
                            status={rate < 70 ? 'exception' : 'active'}
                            style={{ width: 120 }}
                        />
                        <Tag color={color}>{rate}%</Tag>
                    </div>
                );
            },
        },
    ];

    // Export handlers
    const handleExport = async (type) => {
        try {
            const res = await fetch(`${API_BASE}/export`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type }),
            });
            const data = await res.json();
            if (data.success && data.url) {
                window.open(data.url, "_blank");
            }
        } catch (err) {
            // handle error
        }
    };

    return (
        <div>
            <Title level={3}>Attendance Reports</Title>
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                    <div>
                        <Text strong>Class:</Text>
                        <Select
                            value={selectedClass}
                            onChange={setSelectedClass}
                            style={{ width: 200, marginLeft: 8 }}
                        >
                            <Option value="all">All Classes</Option>
                            <Option value="web">Web Development</Option>
                            <Option value="db">Database Systems</Option>
                            <Option value="ml">Machine Learning</Option>
                            <Option value="net">Computer Networks</Option>
                        </Select>
                    </div>
                    <div>
                        <Text strong>Date Range:</Text>
                        <RangePicker
                            style={{ marginLeft: 8 }}
                            onChange={setDateRange}
                        />
                    </div>
                    <div>
                        <Text strong>Report Type:</Text>
                        <Select
                            value={reportType}
                            onChange={setReportType}
                            style={{ width: 150, marginLeft: 8 }}
                        >
                            <Option value="attendance">Attendance</Option>
                            <Option value="summary">Summary</Option>
                        </Select>
                    </div>
                    <Space style={{ marginLeft: 'auto' }}>
                        <Button
                            icon={<FilePdfOutlined />}
                            onClick={() => handleExport("pdf")}
                        >
                            Export PDF
                        </Button>
                        <Button
                            icon={<FileExcelOutlined />}
                            onClick={() => handleExport("excel")}
                        >
                            Export Excel
                        </Button>
                    </Space>
                </div>
                {/* Statistics Summary */}
                <Row gutter={16} className="mb-6">
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Average Attendance"
                                value={
                                    attendanceData.length
                                        ? (
                                            attendanceData.reduce((sum, s) => sum + s.attendanceRate, 0) /
                                            attendanceData.length
                                        ).toFixed(0)
                                        : 0
                                }
                                suffix="%"
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Students"
                                value={attendanceData.length}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Classes"
                                value={classAttendance.length}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Date Range"
                                value="Last 30 Days"
                                valueStyle={{ fontSize: '16px' }}
                            />
                        </Card>
                    </Col>
                </Row>
                <Divider />
                {/* Chart Display Options */}
                <div className="flex justify-between mb-4">
                    <Title level={4}>Attendance Report</Title>
                    <Radio.Group
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        buttonStyle="solid"
                    >
                        <Radio.Button value="bar"><BarChartOutlined /> Bar</Radio.Button>
                        <Radio.Button value="line"><LineChartOutlined /> Line</Radio.Button>
                        <Radio.Button value="pie"><PieChartOutlined /> Pie</Radio.Button>
                    </Radio.Group>
                </div>
                {/* Chart Placeholder */}
                <div
                    className="bg-gray-100 rounded-lg mb-6 flex items-center justify-center"
                    style={{ height: 300 }}
                >
                    {/* Chart rendering logic here */}
                </div>
                {/* Class Attendance Comparison */}
                <Title level={4}>Class Attendance Comparison</Title>
                <div className="mb-6">
                    {classAttendance.map(cls => (
                        <div key={cls.class} className="mb-4">
                            <div className="flex justify-between mb-1">
                                <Text>{cls.class}</Text>
                                <Text>{cls.attendanceRate}% ({cls.studentCount} students)</Text>
                            </div>
                            <Progress
                                percent={cls.attendanceRate}
                                status={cls.attendanceRate < 75 ? 'exception' : 'active'}
                            />
                        </div>
                    ))}
                </div>
                <Divider />
                {/* Data Table */}
                <Title level={4}>Student Attendance Details</Title>
                <Table
                    dataSource={attendanceData}
                    columns={attendanceColumns}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                    }}
                />
            </Card>
        </div>
    );
};

export default ReportsPage;