import React from "react";
import { useNavigate } from "react-router-dom";
import {Flex,Typography, Layout, Row, Card, Tabs, Col,Button, Dropdown, message, Space, Divider, Tooltip} from 'antd';
import { DownloadOutlined, UserOutlined } from '@ant-design/icons';
import { Bar, Pie, Column} from '@ant-design/plots';
const { Content } = Layout;

import './css/selection.css';
import logo from '../assets/importedlogotest.svg';

export default function SchedulePage() {
    const nav = useNavigate();
    return (
        <div className="background"
            style={{
                minHeight: "100vh",
                display: "grid",
                placeItems: "center",
                background: "#feeaeaff",
            }}
        >
              <img src={logo} className="bgLogo"/>
            
            <Card style={{background:"#ffffffd6", width: 600,borderRadius: 20,}} variant={false}>
                <Flex vertical gap="small" align="center" justify="center" style={{ width: '100%' }}>
                    <Button block onClick={() => nav("/home")}  color="pink" variant="filled" type="primary" style={{boxShadow: "0 0px 8px rgba(0, 0, 0, 0.2)", fontSize: "20px",marginTop: 50,marginBottom:80, width:500,height:100}}>
                        MAKE A NEW SCHEDULE
                    </Button>
                    <Button onClick={() => nav("/home")} type="primary" block color="danger" variant="filled" style={{boxShadow: "0 0px 8px rgba(0, 0, 0, 0.2)",fontSize: "20px",marginBottom:50,width:500,height:100}}>
                        ACCESS CURRENT SCHEDULES
                    </Button>
                </Flex>
            </Card>
        </div>

    );
}