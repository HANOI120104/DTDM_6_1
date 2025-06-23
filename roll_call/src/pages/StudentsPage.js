import React, { useState, useContext, useEffect } from 'react';
import {
    Typography,
    Card,
    Table,
    Button,
    Input,
    Space,
    Tag,
    Avatar,
    Modal,
    Form,
    Select,
    Upload,
    message,
    Tooltip,
    Popconfirm
} from 'antd';
import {
    UserAddOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    UploadOutlined,
    UserOutlined,
    FileExcelOutlined,
    ExportOutlined
} from '@ant-design/icons';
import { AuthContext } from '../App';

const { Title } = Typography;
const { Option } = Select;

const API_URL = "http://localhost:5002/api/students"; // Đổi nếu backend chạy port khác
const CLASSES_API_URL = "http://localhost:5002/api/classes"; // Thêm dòng này

const StudentsPage = () => {
    const { currentUser } = useContext(AuthContext);
    const role = currentUser?.role || 'student';
    const [searchText, setSearchText] = useState('');
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]); // Thêm state cho danh sách lớp
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [form] = Form.useForm();
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch students from backend
    const fetchStudents = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            if (data.success) setStudents(data.students);
            else message.error("Failed to fetch students");
        } catch (err) {
            message.error("Network error");
        }
    };

    // Fetch classes from backend
    const fetchClasses = async () => {
        try {
            const res = await fetch(CLASSES_API_URL);
            const data = await res.json();
            if (data.success) setClasses(data.classes);
            else message.error("Failed to fetch classes");
        } catch (err) {
            message.error("Network error");
        }
    };

    useEffect(() => {
        fetchStudents();
        fetchClasses(); // Gọi luôn khi mount
    }, []);

    // Filter students based on search
    const filteredStudents = students.filter(
        student =>
            student.name.toLowerCase().includes(searchText.toLowerCase()) ||
            student.studentId.toLowerCase().includes(searchText.toLowerCase()) ||
            student.email.toLowerCase().includes(searchText.toLowerCase()) ||
            student.class.toLowerCase().includes(searchText.toLowerCase())
    );

    // Show modal for adding/editing student
    const showModal = (student = null) => {
        setEditingStudent(student);
        if (student) {
            form.setFieldsValue({
                name: student.name,
                studentId: student.studentId,
                email: student.email,
                classId: student.classId,
                status: student.status,
            });
            setImageUrl(student.avatar_url);
        } else {
            form.resetFields();
            setImageUrl('');
        }
        setIsModalVisible(true);
    };

    // Handle form submission for add/edit student
    const handleSubmit = async (values) => {
        setLoading(true);
        const payload = {
            student_id: values.studentId,
            name: values.name,
            email: values.email,
            class_id: values.classId,
            avatar_url: imageUrl,
            status: values.status || 'active',
        };
        try {
            let res, data;
            if (editingStudent) {
                // Update student
                res = await fetch(`${API_URL}/${editingStudent.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                // Add new student
                res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            data = await res.json();
            if (data.success) {
                message.success(editingStudent ? 'Student updated' : 'Student added');
                fetchStudents();
                setIsModalVisible(false);
                form.resetFields();
                setImageUrl('');
            } else {
                message.error(data.error || 'Operation failed');
            }
        } catch (err) {
            message.error('Network error');
        }
        setLoading(false);
    };

    // Delete student
    const handleDelete = async (studentId) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/${studentId}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                message.success('Student deleted');
                fetchStudents();
            } else {
                message.error(data.error || 'Delete failed');
            }
        } catch (err) {
            message.error('Network error');
        }
        setLoading(false);
    };

    // Handle image upload
    const handleImageUpload = (info) => {
        // Sử dụng beforeUpload để lấy base64 trực tiếp, không upload lên server
        if (info.file) {
            getBase64(info.file, (imageUrl) => {
                setImageUrl(imageUrl);
                setLoading(false);
            });
        }
    };

    // Convert file to base64
    const getBase64 = (file, callback) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(file);
    };

    // Handle bulk import
    const handleBulkImport = () => {
        message.info('Bulk import functionality would be implemented here.');
    };

    // Handle export
    const handleExport = () => {
        message.info('Export functionality would be implemented here.');
    };

    // Table columns
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div className="flex items-center">
                    <Avatar src={record.photoUrl} icon={<UserOutlined />} />
                    <span className="ml-2">{text}</span>
                </div>
            ),
        },
        {
            title: 'Student ID',
            dataIndex: 'studentId',
            key: 'studentId',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Class',
            dataIndex: 'class',
            key: 'class',
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
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => showModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Popconfirm
                            title="Are you sure you want to delete this student?"
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
        },
    ];

    return (
        <div>
            <Title level={3}>Students Management</Title>

            <Card className="mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <Space className="mb-4 md:mb-0">
                        {role === 'teacher' && (
                            <Button
                                type="primary"
                                icon={<UserAddOutlined />}
                                onClick={() => showModal()}
                            >
                                Add Student
                            </Button>
                        )}
                        <Button
                            icon={<FileExcelOutlined />}
                            onClick={handleBulkImport}
                        >
                            Bulk Import
                        </Button>
                        <Button
                            icon={<ExportOutlined />}
                            onClick={handleExport}
                        >
                            Export
                        </Button>
                    </Space>

                    <Input
                        placeholder="Search students..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                    />
                </div>

                <Table
                    dataSource={filteredStudents}
                    columns={columns}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                    }}
                />
            </Card>

            {/* Add/Edit Student Modal */}
            <Modal
                title={editingStudent ? 'Edit Student' : 'Add New Student'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <div className="mb-4 flex justify-center">
                        <Upload
                            name="avatar"
                            listType="picture-card"
                            className="avatar-uploader"
                            showUploadList={false}
                            beforeUpload={file => {
                                setLoading(true);
                                getBase64(file, (imageUrl) => {
                                    setImageUrl(imageUrl);
                                    setLoading(false);
                                });
                                return false; // Ngăn không upload lên server
                            }}
                        >
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt="avatar"
                                    style={{ width: '100%', borderRadius: '4px' }}
                                />
                            ) : (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Upload Photo</div>
                                </div>
                            )}
                        </Upload>
                    </div>

                    <Form.Item
                        name="name"
                        label="Full Name"
                        rules={[{ required: true, message: 'Please enter student name' }]}
                    >
                        <Input placeholder="Enter full name" />
                    </Form.Item>

                    <Form.Item
                        name="studentId"
                        label="Student ID"
                        rules={[{ required: true, message: 'Please enter student ID' }]}
                    >
                        <Input placeholder="Enter student ID" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input placeholder="Enter email address" />
                    </Form.Item>

                    <Form.Item
                        name="classId"
                        label="Class"
                        rules={[{ required: true, message: 'Please select class' }]}
                    >
                        <Select placeholder="Select class">
                            {classes.map(cls => (
                                <Option key={cls.id} value={cls.id}>
                                    {cls.name} ({cls.code})
                                </Option>
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
                                {editingStudent ? 'Update' : 'Add'} Student
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default StudentsPage;
