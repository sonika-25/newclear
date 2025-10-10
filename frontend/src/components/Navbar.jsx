import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import {AreaChartOutlined, LogoutOutlined, RollbackOutlined, ScheduleOutlined, EditOutlined, SettingOutlined, QuestionCircleOutlined, LoginOutlined} from '@ant-design/icons';
import {Typography} from 'antd';
import './navbar.css';
import logo from '../assets/importedlogotest.svg';
import profile from '../assets/profile-circle-svgrepo-com.svg';

const {Sider} = Layout;
const Navbar = () => {
  return (
    <Sider width={120} className='siderDisplay' style={{background: '#fff7f7', overflow: "auto"}}>
        <div>
            <img src={logo} className="navLogo" />
        </div>

         <div style={{ marginBottom: 150 }}>
            <Link to="/home">
             <img src={profile} className="navProfile" />
            </Link>
            
        </div>

        <Menu mode="inline"
         className="menuCSS" items = {[
                {
                key: '/home',
                label: (
                <div>
                    <Link to="/home" className="navItem">
                    <AreaChartOutlined className="navIcon" />
                </Link>
                <Typography.Title level={5} style={{margin:0}} className="navTitle">Dashboard</Typography.Title>
                </div> ),
                
            },
            {
                key: '/schedule',
                label: (
                <div> <Link to="/schedule" className="navItem">
                    <ScheduleOutlined className="navIcon" />
                </Link>
                  <Typography.Title level={5} style={{margin:0}} className="navTitle">Schedule</Typography.Title>
                </div>
                ),
            },
            ,
            {
                key: '/management',
                label: (
                <div>    
                <Link to="/management" className="navItem">
                    <EditOutlined className="navIcon" />
                </Link>
                  <Typography.Title level={5} style={{margin:0}} className="navTitle">Management</Typography.Title>
                 </div>
                ),
            },
            ]}
            
        style={{ background: 'transparent' }}
        />
             <div style={{ flex: 1}} />
         <Menu mode="inline"
         className="menuCSSBottom" items = {[
         
            {
                key: '/select',
                label: (
                <div> <Link to="/select" className="navItemBottom">
                    <RollbackOutlined className="navIconBottom" />
                </Link>
                <Typography.Title level={5} style={{margin:0}} className="navTitle">Schedule Select</Typography.Title>
                </div>
                ),
            },
                   {
                key: '/login',
                label: (
                <div>
                    <Link to="/login" className="navItemBottom">
                    <LoginOutlined className="navIconBottom" />
                </Link>
                <Typography.Title level={5} style={{margin:0}} className="navTitle">Logout</Typography.Title>
                </div> ),
                
            },
            ]}
            
            style={{ background: 'transparent' }}/>

    </Sider>
  );
};

export default Navbar;