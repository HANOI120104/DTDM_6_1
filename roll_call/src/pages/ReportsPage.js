import React, { useState } from 'react';
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

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Mock data for attendance reports
const MOCK_ATTENDANCE_DATA = [
    { id: 1, name: 'John Doe', studentId: 'ST1001', present: 18, absent: 2, late: 0, attendanceRate: 90 },
    { id: 2, name: 'Jane Smith', studentId: 'ST1002', present: 15, absent: 4, late: 1, attendanceRate: 75 },
    { id: 3, name: 'Bob Johnson', studentId: 'ST1003', present: 20, absent: 0, late: 0, attendanceRate: 100 },
    { id: 4, name: 'Alice Brown', studentId: 'ST1004', present: 16, absent: 3, late: 1, attendanceRate: 80 },
    { id: 5, name: 'Charlie Wilson', studentId: 'ST1005', present: 17, absent: 2, late: 1, attendanceRate: 85 },
    { id: 6, name: 'Diana Prince', studentId: 'ST1006', present: 14, absent: 5, late: 1, attendanceRate: 70 },
    { id: 7, name: 'Bruce Wayne', studentId: 'ST1007', present: 19, absent: 1, late: 0, attendanceRate: 95 },
    { id: 8, name: 'Clark Kent', studentId: 'ST1008', present: 10, absent: 8, late: 2, attendanceRate: 50 },
];

// Mock data for class attendance rates
const MOCK_CLASS_ATTENDANCE = [
    { class: 'Web Development', attendanceRate: 87, studentCount: 35 },
    { class: 'Database Systems', attendanceRate: 78, studentCount: 42 },
    { class: 'Machine Learning', attendanceRate: 92, studentCount: 30 },
    { class: 'Computer Networks', attendanceRate: 81, studentCount: 38 },
];

const ReportsPage = () => {
    const [selectedClass, setSelectedClass] = useState('all');
    const [dateRange, setDateRange] = useState(null);
    const [reportType, setReportType] = useState('attendance');
    const [chartType, setChartType] = useState('bar');

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

    // Handle export to PDF
    const handleExportPDF = () => {
        console.log('Export to PDF');
    };

    // Handle export to Excel
    const handleExportExcel = () => {
        console.log('Export to Excel');
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
                            onClick={handleExportPDF}
                        >
                            Export PDF
                        </Button>
                        <Button
                            icon={<FileExcelOutlined />}
                            onClick={handleExportExcel}
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
                                value={83}
                                suffix="%"
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Students"
                                value={145}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Classes"
                                value={4}
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
                    {chartType === 'bar' && (
                        <div className="text-center">
                            <BarChartOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                            <p>Bar Chart Visualization Would Appear Here</p>
                            <p className="text-gray-500 text-sm">
                                Shows attendance data for each student/class
                            </p>
                        </div>
                    )}

                    {chartType === 'line' && (
                        <div className="text-center">
                            <LineChartOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                            <p>Line Chart Visualization Would Appear Here</p>
                            <p className="text-gray-500 text-sm">
                                Shows attendance trends over time
                            </p>
                        </div>
                    )}

                    {chartType === 'pie' && (
                        <div className="text-center">
                            <PieChartOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                            <p>Pie Chart Visualization Would Appear Here</p>
                            <p className="text-gray-500 text-sm">
                                Shows proportion of present/absent/late
                            </p>
                        </div>
                    )}
                </div>

                {/* Class Attendance Comparison */}
                <Title level={4}>Class Attendance Comparison</Title>
                <div className="mb-6">
                    {MOCK_CLASS_ATTENDANCE.map(cls => (
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
                    dataSource={MOCK_ATTENDANCE_DATA}
                    columns={attendanceColumns}
                    rowKey="id"
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