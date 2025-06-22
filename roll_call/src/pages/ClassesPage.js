import React, { useState } from 'react';
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

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Mock data for classes
const MOCK_CLASSES = [
    {
        id: 1,
        name: 'Web Development',
        code: 'CS101',
        schedule: 'Mon, Wed 10:00 AM - 11:30 AM',
        room: 'Room 301',
        instructor: 'Dr. John Smith',
        totalStudents: 35,
        status: 'active'
    },
    {
        id: 2,
        name: 'Database Systems',
        code: 'CS202',
        schedule: 'Tue, Thu 1:00 PM - 2:30 PM',
        room: 'Room 210',
        instructor: 'Prof. Emily Johnson',
        totalStudents: 42,
        status: 'active'
    },
    {
        id: 3,
        name: 'Machine Learning',
        code: 'CS301',
        schedule: 'Mon, Fri 3:00 PM - 4:30 PM',
        room: 'Room 105',
        instructor: 'Dr. Robert Chen',
        totalStudents: 30,
        status: 'inactive'
    },
    {
        id: 4,
        name: 'Computer Networks',
        code: 'CS401',
        schedule: 'Wed, Fri 9:00 AM - 10:30 AM',
        room: 'Room 215',
        instructor: 'Prof. Sarah Lee',
        totalStudents: 38,
        status: 'active'
    },
];

const ClassesPage = () => {
    const [searchText, setSearchText] = useState('');
    const [classes, setClasses] = useState(MOCK_CLASSES);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Filter classes based on search
    const filteredClasses = classes.filter(
        classItem =>
            classItem.name.toLowerCase().includes(searchText.toLowerCase()) ||
            classItem.code.toLowerCase().includes(searchText.toLowerCase()) ||
            classItem.instructor.toLowerCase().includes(searchText.toLowerCase())
    );

    // Show modal for adding/editing class
    const showModal = (classItem = null) => {
        setEditingClass(classItem);
        if (classItem) {
            form.setFieldsValue({
                name: classItem.name,
                code: classItem.code,
                schedule: classItem.schedule,
                room: classItem.room,
                instructor: classItem.instructor,
                status: classItem.status,
            });
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    // Handle form submission for add/edit class
    const handleSubmit = (values) => {
        setLoading(true);

        setTimeout(() => {
            if (editingClass) {
                // Update existing class
                const updatedClasses = classes.map(classItem =>
                    classItem.id === editingClass.id
                        ? { ...classItem, ...values }
                        : classItem
                );
                setClasses(updatedClasses);
                message.success('Class updated successfully!');
            } else {
                // Add new class
                const newClass = {
                    id: classes.length + 1,
                    ...values,
                    totalStudents: 0,
                };
                setClasses([...classes, newClass]);
                message.success('Class added successfully!');
            }

            setLoading(false);
            setIsModalVisible(false);
        }, 1000);
    };

    // Delete class
    const handleDelete = (classId) => {
        const updatedClasses = classes.filter(classItem => classItem.id !== classId);
        setClasses(updatedClasses);
        message.success('Class deleted successfully!');
    };

    // Table columns
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
            dataIndex: 'instructor',
            key: 'instructor',
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
        {
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
        },
    ];

    return (
        <div>
            <Title level={3}>Classes Management</Title>

            <Tabs defaultActiveKey="1">
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
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => showModal()}
                                className="mb-4 md:mb-0"
                            >
                                Add Class
                            </Button>

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

                <TabPane
                    tab={
                        <span>
                            <TeamOutlined /> My Classes
                        </span>
                    }
                    key="2"
                >
                    <Card>
                        <div className="text-center p-8">
                            <Text type="secondary">This is a placeholder for the My Classes tab.</Text>
                        </div>
                    </Card>
                </TabPane>
            </Tabs>

            {/* Add/Edit Class Modal */}
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
                        rules={[{ required: true, message: 'Please enter schedule' }]}
                    >
                        <Input placeholder="e.g. Mon, Wed 10:00 AM - 11:30 AM" />
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
                        rules={[{ required: true, message: 'Please enter instructor name' }]}
                    >
                        <Input placeholder="Enter instructor name" />
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
        </div>
    );
};

export default ClassesPage; 