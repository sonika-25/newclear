import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {Flex,Typography,Input, Layout,Modal, Form, Row, Card, Tabs, Col,Button, Dropdown, message, Space, Divider, Tooltip} from 'antd';
import { DownloadOutlined, UserOutlined } from '@ant-design/icons';
import { Bar, Pie, Column} from '@ant-design/plots';
const { Content } = Layout;

import './css/selection.css';
import logo from '../assets/importedlogotest.svg';

export default function SchedulePage() {
    const nav = useNavigate();
    const [isSelectionModalOpen, setSelectionModalOpen] = useState(false);
    const [selectionForm] = Form.useForm();

     const [newSchedule, setNewSchedule] = useState([
        {name: '1'},
        {name: '2'},
        ]);

     const showNewScheduleModal = ()=> {
      selectionForm.resetFields();
      setSelectionModalOpen(true);
    };
    
    const addNewScheduleData = (values) => {
    const name = values;
    setNewSchedule((prev) => [...prev, { name }]);
    setSelectionModalOpen(false);
    selectionForm.resetFields();
    nav("/home");
  }; 


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
                    <Button block  onClick={showNewScheduleModal}  color="pink" variant="filled" type="primary"
                     style={{boxShadow: "0 0px 8px rgba(0, 0, 0, 0.2)", fontSize: "20px",marginTop: 50,marginBottom:80, width:500,height:100}}>
                        MAKE A NEW SCHEDULE
                    </Button>
                    <Button onClick={() => nav("/home")} type="primary" block color="danger" variant="filled" style={{boxShadow: "0 0px 8px rgba(0, 0, 0, 0.2)",fontSize: "20px",marginBottom:50,width:500,height:100}}>
                        ACCESS CURRENT SCHEDULES
                    </Button>
                </Flex>
            </Card>
            <Modal
                    title="Add a New Schedule"
                    open={isSelectionModalOpen}
                    onOk={() => selectionForm.submit()}
                    onCancel={() => {setSelectionModalOpen(false); }}
                  >
                    <Form
                      form={selectionForm}
                      layout="vertical"
                      onFinish={addNewScheduleData}
                    >
                      <Form.Item
                        label="PWSN Name"
                        name="name"
                        rules={[{ required: true, message: "Please enter a Name for the person you are making a scehdule for" }]}
                      >
                         <Input/>
                      </Form.Item>

                    </Form>
                  </Modal> 
        </div>

    );
}