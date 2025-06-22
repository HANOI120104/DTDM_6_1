import React, { useState, useContext } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Layout,
    Menu,
    Button,
    Avatar,
    Dropdown,
    theme,
    Badge,
    Breadcrumb
} from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    UserOutlined,
    TeamOutlined,
    BookOutlined,
    BarChartOutlined,
    CalendarOutlined,
    LogoutOutlined,
    BellOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { AuthContext } from '../../App';

const { Header, Sider, Content } = Layout;

const AppLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { currentUser, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const { token } = theme.useToken();

    // Menu items for sidebar
    const menuItems = [
        {
            key: '/',
            icon: <DashboardOutlined />,
            label: <Link to="/">Dashboard</Link>,
        },
        {
            key: '/attendance',
            icon: <CalendarOutlined />,
            label: <Link to="/attendance">Attendance</Link>,
        },
        {
            key: '/students',
            icon: <TeamOutlined />,
            label: <Link to="/students">Students</Link>,
            // Only show to teachers
            style: currentUser?.role === 'student' ? { display: 'none' } : {},
        },
        {
            key: '/classes',
            icon: <BookOutlined />,
            label: <Link to="/classes">Classes</Link>,
        },
        {
            key: '/reports',
            icon: <BarChartOutlined />,
            label: <Link to="/reports">Reports</Link>,
            // Only show to teachers
            style: currentUser?.role === 'student' ? { display: 'none' } : {},
        },
    ];

    // User dropdown menu
    const userMenu = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Profile',
            onClick: () => navigate('/profile'),
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Settings',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: logout,
        },
    ];

    // Get the current page name for breadcrumb
    const getPageName = () => {
        const path = location.pathname;
        if (path === '/') return 'Dashboard';
        return path.charAt(1).toUpperCase() + path.slice(2);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    backgroundColor: token.colorBgContainer,
                    boxShadow: token.boxShadowTertiary,
                }}
            >
                <div className="p-4 flex justify-center items-center">
                    <h1 className={`text-xl font-bold text-blue-600 transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                        Roll Call
                    </h1>
                    {collapsed && <CalendarOutlined className="text-xl text-blue-600" />}
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    style={{ borderRight: 0 }}
                />
            </Sider>
            <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
                <Header
                    style={{
                        padding: '0 16px',
                        background: token.colorBgContainer,
                        boxShadow: token.boxShadowTertiary,
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <div className="flex items-center">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ fontSize: '16px', width: 64, height: 64 }}
                        />
                        <Breadcrumb
                            items={[
                                { title: 'Home' },
                                { title: getPageName() }
                            ]}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge count={5} size="small">
                            <Button type="text" icon={<BellOutlined />} shape="circle" />
                        </Badge>
                        <Dropdown menu={{ items: userMenu }} placement="bottomRight">
                            <div className="cursor-pointer flex items-center gap-2">
                                <Avatar src={currentUser?.photoURL} icon={<UserOutlined />} />
                                <span className="hidden md:inline">{currentUser?.displayName}</span>
                            </div>
                        </Dropdown>
                    </div>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        background: token.colorBgContainer,
                        borderRadius: token.borderRadiusLG,
                        minHeight: 280,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AppLayout; 