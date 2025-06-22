import React, { useState, useContext } from 'react';
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

// Mock data for students
const MOCK_STUDENTS = [
    {
        id: 1,
        name: 'John Doe',
        studentId: 'ST1001',
        email: 'john.doe@example.com',
        class: 'Web Development',
        photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
        status: 'active'
    },
    {
        id: 2,
        name: 'Jane Smith',
        studentId: 'ST1002',
        email: 'jane.smith@example.com',
        class: 'Database Systems',
        photoUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
        status: 'active'
    },
    {
        id: 3,
        name: 'Bob Johnson',
        studentId: 'ST1003',
        email: 'bob.johnson@example.com',
        class: 'Machine Learning',
        photoUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
        status: 'inactive'
    },
    {
        id: 4,
        name: 'Alice Brown',
        studentId: 'ST1004',
        email: 'alice.brown@example.com',
        class: 'Computer Networks',
        photoUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
        status: 'active'
    },
    {
        id: 5,
        name: 'Charlie Wilson',
        studentId: 'ST1005',
        email: 'charlie.wilson@example.com',
        class: 'Web Development',
        photoUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
        status: 'active'
    },
];

// Mock data for classes
const MOCK_CLASSES = [
    { id: 1, name: 'Web Development', code: 'CS101' },
    { id: 2, name: 'Database Systems', code: 'CS202' },
    { id: 3, name: 'Machine Learning', code: 'CS301' },
    { id: 4, name: 'Computer Networks', code: 'CS401' },
];

const StudentsPage = () => {
    const { currentUser } = useContext(AuthContext);
    const [searchText, setSearchText] = useState('');
    const [students, setStudents] = useState(MOCK_STUDENTS);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [form] = Form.useForm();
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);

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
                class: student.class,
                status: student.status,
            });
            setImageUrl(student.photoUrl);
        } else {
            form.resetFields();
            setImageUrl('');
        }
        setIsModalVisible(true);
    };

    // Handle form submission for add/edit student
    const handleSubmit = (values) => {
        setLoading(true);

        setTimeout(() => {
            if (editingStudent) {
                // Update existing student
                const updatedStudents = students.map(student =>
                    student.id === editingStudent.id
                        ? { ...student, ...values, photoUrl: imageUrl || student.photoUrl }
                        : student
                );
                setStudents(updatedStudents);
                message.success('Student updated successfully!');
            } else {
                // Add new student
                const newStudent = {
                    id: students.length + 1,
                    ...values,
                    photoUrl: imageUrl || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 10)}.jpg`,
                };
                setStudents([...students, newStudent]);
                message.success('Student added successfully!');
            }

            setLoading(false);
            setIsModalVisible(false);
        }, 1000);
    };

    // Delete student
    const handleDelete = (studentId) => {
        const updatedStudents = students.filter(student => student.id !== studentId);
        setStudents(updatedStudents);
        message.success('Student deleted successfully!');
    };

    // Handle image upload
    const handleImageUpload = (info) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }

        if (info.file.status === 'done') {
            // Get image URL from response
            getBase64(info.file.originFileObj, imageUrl => {
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
                        <Button
                            type="primary"
                            icon={<UserAddOutlined />}
                            onClick={() => showModal()}
                        >
                            Add Student
                        </Button>
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
                            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                            onChange={handleImageUpload}
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
                        name="class"
                        label="Class"
                        rules={[{ required: true, message: 'Please select class' }]}
                    >
                        <Select placeholder="Select class">
                            {MOCK_CLASSES.map(cls => (
                                <Option key={cls.id} value={cls.name}>
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
