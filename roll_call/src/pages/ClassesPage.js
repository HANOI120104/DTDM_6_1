import React, { useState, useEffect, useContext } from 'react';
import {
    Typography,
    Card,
    Table,
    Button,
    Input,
    Space,
    Tag,
    Modal,
    Form,
    Select,
    message,
    Tooltip,
    Popconfirm,
    Tabs,
    Badge
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    TeamOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { AuthContext } from '../App';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const API_URL = "http://localhost:5002/api/classes"; // Đổi đúng port backend

// Thêm state cho danh sách giáo viên và lịch học mẫu
const SCHEDULE_OPTIONS = [
    'Mon, Wed 10:00 AM - 11:30 AM',
    'Tue, Thu 1:00 PM - 2:30 PM',
    'Mon, Fri 3:00 PM - 4:30 PM',
    'Wed, Fri 9:00 AM - 10:30 AM',
];

const ClassesPage = () => {
    const { currentUser } = useContext(AuthContext);
    const role = currentUser?.role || 'student';

    const [searchText, setSearchText] = useState('');
    const [classes, setClasses] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState([]);

    // Fetch all classes (for teacher)
    const fetchClasses = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            if (data.success) setClasses(data.classes);
            else message.error("Failed to fetch classes");
        } catch (err) {
            message.error("Network error");
        }
    };

    // Fetch only my classes (for student)
    const fetchMyClasses = async () => {
        if (!currentUser?.studentId && !currentUser?.student_id) return;
        const sid = currentUser.studentId || currentUser.student_id;
        try {
            const res = await fetch(`${API_URL}/student/${sid}`);
            const data = await res.json();
            if (data.success) setClasses(data.classes);
            else setClasses([]);
        } catch {
            setClasses([]);
        }
    };

    // Gọi fetch đúng API theo role
    useEffect(() => {
        if (role === 'student') {
            fetchMyClasses();
        } else {
            fetchClasses();
        }
        // eslint-disable-next-line
    }, [role, currentUser]);

    // Lấy danh sách giáo viên từ backend (giả sử API: /api/teachers)
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const res = await fetch('http://localhost:5002/api/teachers');
                const data = await res.json();
                if (data.success) {
                    // Nếu thiếu displayName, fetch từng teacher bổ sung displayName
                    const teachersWithDisplayName = await Promise.all(
                        data.teachers.map(async (t) => {
                            if (!t.displayName) {
                                try {
                                    const res2 = await fetch(`http://localhost:5002/api/teachers/${t.id}/displayName`);
                                    const data2 = await res2.json();
                                    return { ...t, displayName: data2.displayName || t.name || t.id };
                                } catch {
                                    return { ...t, displayName: t.name || t.id };
                                }
                            }
                            return { ...t, displayName: t.displayName || t.name || t.id };
                        })
                    );
                    setTeachers(teachersWithDisplayName);
                }
            } catch (err) {
                setTeachers([]);
            }
        };
        fetchTeachers();
    }, []);

    // Filter classes based on search
    const filteredClasses = classes.filter(
        classItem =>
            classItem.name.toLowerCase().includes(searchText.toLowerCase()) ||
            classItem.code.toLowerCase().includes(searchText.toLowerCase()) ||
            (classItem.instructorName && classItem.instructorName.toLowerCase().includes(searchText.toLowerCase()))
    );

    // Lọc lớp theo teacher (chỉ các lớp do teacher hiện tại tạo)
    const myClasses = role === 'teacher'
        ? classes.filter(c => c.instructor && currentUser && c.instructor === currentUser.id)
        : classes; // với sinh viên, classes đã là danh sách lớp của mình

    // Show modal for adding/editing class
    const showModal = (classItem = null) => {
        setEditingClass(classItem);
        if (classItem) {
            form.setFieldsValue({
                name: classItem.name,
                code: classItem.code,
                room: classItem.room,
                schedule: classItem.schedule,
                instructor: typeof classItem.instructor === 'object' ? classItem.instructor.id : classItem.instructor,
                numberStudent: classItem.numberStudent,
                students: classItem.students,
            });
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    // Handle form submission for add/edit class
    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const payload = {
                name: values.name,
                code: values.code,
                room: values.room,
                schedule: values.schedule,
                instructor: values.instructor, // instructor là uid
                numberStudent: values.numberStudent,
                students: values.students || [],
            };
            let res, data;
            if (editingClass) {
                res = await fetch(`${API_URL}/${editingClass.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            data = await res.json();
            if (data.success) {
                message.success(editingClass ? 'Class updated' : 'Class added');
                fetchClasses();
                setIsModalVisible(false);
                form.resetFields();
            } else {
                message.error(data.error || 'Operation failed');
            }
        } catch (err) {
            message.error('Network error');
        }
        setLoading(false);
    };

    // Delete class
    const handleDelete = async (classId) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/${classId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                message.success("Class deleted successfully!");
                fetchClasses();
            } else {
                message.error(data.error || "Delete failed!");
            }
        } catch (err) {
            message.error("Network error");
        }
        setLoading(false);
    };

    // Table columns: hiển thị instructorName nếu có, nếu không thì instructor
    const columns = [
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
            title: 'Schedule',
            dataIndex: 'schedule',
            key: 'schedule',
        },
        {
            title: 'Room',
            dataIndex: 'room',
            key: 'room',
        },
        {
            title: 'Instructor',
            dataIndex: 'instructorName',
            key: 'instructorName',
            render: (text, record) => {
                if (text && text !== record.instructor) return text;
                // Nếu instructor là userId, tìm displayName từ teachers
                const teacher = teachers.find(t => t.id === record.instructor);
                return teacher ? teacher.displayName : (record.instructor || '');
            },
        },
        {
            title: 'Students',
            dataIndex: 'totalStudents',
            key: 'totalStudents',
            render: (totalStudents) => <Badge count={totalStudents} showZero style={{ backgroundColor: '#52c41a' }} />,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status === 'active' ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        // Ẩn cột Actions nếu role là student
        ...(role === 'teacher' ? [{
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Students">
                        <Button
                            type="text"
                            icon={<TeamOutlined />}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => showModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Popconfirm
                            title="Are you sure you want to delete this class?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        }] : []),
    ];

    return (
        <div>
            <Title level={3}>Classes Management</Title>

            <Tabs defaultActiveKey={role === 'student' ? '2' : '1'}>
                {role === 'teacher' && (
                    <TabPane
                        tab={
                            <span>
                                <CalendarOutlined /> All Classes
                            </span>
                        }
                        key="1"
                    >
                        <Card className="mb-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                {role === 'teacher' && (
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => showModal()}
                                        className="mb-4 md:mb-0"
                                    >
                                        Add Class
                                    </Button>
                                )}

                                <Input
                                    placeholder="Search classes..."
                                    prefix={<SearchOutlined />}
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    style={{ width: 250 }}
                                />
                            </div>

                            <Table
                                dataSource={filteredClasses}
                                columns={columns}
                                rowKey="id"
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    pageSizeOptions: ['10', '20', '50'],
                                }}
                            />
                        </Card>
                    </TabPane>
                )}

                <TabPane
                    tab={
                        <span>
                            <TeamOutlined /> My Classes
                        </span>
                    }
                    key="2"
                >
                    <Card title="My Classes" className="mb-6">
                        <Table
                            dataSource={myClasses}
                            columns={[
                                { title: 'Class Name', dataIndex: 'name', key: 'name' },
                                { title: 'Code', dataIndex: 'code', key: 'code' },
                                { title: 'Room', dataIndex: 'room', key: 'room' },
                                { title: 'Schedule', dataIndex: 'schedule', key: 'schedule' }
                            ]}
                            rowKey="id"
                            pagination={false}
                        />
                    </Card>
                </TabPane>
            </Tabs>

            {/* Add/Edit Class Modal */}
            {role === 'teacher' && (
                <Modal
                    title={editingClass ? 'Edit Class' : 'Add New Class'}
                    open={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        <Form.Item
                            name="name"
                            label="Class Name"
                            rules={[{ required: true, message: 'Please enter class name' }]}
                        >
                            <Input placeholder="Enter class name" />
                        </Form.Item>

                        <Form.Item
                            name="code"
                            label="Class Code"
                            rules={[{ required: true, message: 'Please enter class code' }]}
                        >
                            <Input placeholder="Enter class code" />
                        </Form.Item>

                        <Form.Item
                            name="schedule"
                            label="Schedule"
                            rules={[{ required: true, message: 'Please select schedule' }]}
                        >
                            <Select placeholder="Select schedule">
                                {SCHEDULE_OPTIONS.map(opt => (
                                    <Option key={opt} value={opt}>{opt}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="room"
                            label="Room"
                            rules={[{ required: true, message: 'Please enter room' }]}
                        >
                            <Input placeholder="Enter room" />
                        </Form.Item>

                        <Form.Item
                            name="instructor"
                            label="Instructor"
                            rules={[{ required: true, message: 'Please select instructor' }]}
                        >
                            <Select placeholder="Select instructor">
                                {teachers.map(t => (
                                    <Option key={t.id} value={t.id}>{t.displayName}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="status"
                            label="Status"
                            initialValue="active"
                        >
                            <Select>
                                <Option value="active">Active</Option>
                                <Option value="inactive">Inactive</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item className="mb-0">
                            <div className="flex justify-end space-x-2">
                                <Button onClick={() => setIsModalVisible(false)}>
                                    Cancel
                                </Button>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    {editingClass ? 'Update' : 'Add'} Class
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
                </Modal>
            )}
        </div>
    );
};

export default ClassesPage;