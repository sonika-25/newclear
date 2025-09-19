import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {AreaChartOutlined, ScheduleOutlined, EditOutlined, SettingOutlined, QuestionCircleOutlined} from '@ant-design/icons';
import {Typography} from 'antd';
import './navbar.css';
import logo from '../assets/importedlogotest.svg';
import profile from '../assets/profile-circle-svgrepo-com.svg';

const {Sider} = Layout;

const Navbar = () => {
  return (
    <Sider width={120} style={{background: '#fff7f7',}}>

        <div>
            <img src={logo} className="navLogo" />
        </div>

         <div>
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
                key: '/home',
                label: (
                <div>    
                <Link to="/home" className="navItem">
                    <EditOutlined className="navIcon" />
                </Link>
                  <Typography.Title level={5} style={{margin:0}} className="navTitle">Management</Typography.Title>
                 </div>
                ),
            },
            ]}
        
       
        style={{ background: 'transparent',  marginTop:'150px' }}
        />
        
         <Menu mode="inline"
         className="menuCSSBottom" items = {[
                {
                key: '/home',
                label: (
                <div>
                    <Link to="/home" className="navItemBottom">
                    <SettingOutlined className="navIconBottom" />
                </Link>
                </div> ),
                
            },
            {
                key: '/home',
                label: (
                <div> <Link to="/home" className="navItemBottom">
                    <QuestionCircleOutlined className="navIconBottom" />
                </Link>
                </div>
                ),
            }
            ]}
              style={{ background: 'transparent',  marginTop:'180px' }}
            />

    </Sider>
  );
};

export default Navbar;