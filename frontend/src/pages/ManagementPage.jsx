import './css/management.css';
import {Radio, Layout, List, Splitter, Button, Form, Input, Switch, message, Space, Typography } from 'antd';
import React, { useState, useEffect, useRef } from 'react';

const { Content } = Layout;


  export default function ManagementPage() {
  const [data, setData] = useState([
    'John Doe · Carer · Admin Status: false',
    'Mary Doe · Family · Admin Status: false',
    'Liam Doe · Manager · Admin Status: true',
    'Charles Doe · POA · Admin Status: true',
    'Lewis Doe · Family · Admin Status: false',
    'Max Doe · Family · Admin Status: false',
    'Oscar Doe · Carer · Admin Status: false',
    'Piastri Doe · Carer · Admin Status: false',
    'Yuki Doe · Carer · Admin Status: false',
    'Michael Doe · Carer · Admin Status: false',
  ]);
  const [userForm] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [taskForm] = Form.useForm();

  const formComplete = (values) => {
  const user = `${values.firstName} ${values.lastName} · ${values.userType} · Admin Status: ${values.admin}`;
  setData(prevData => [...prevData, user]);
  form.resetFields();
  };

      return (
      
        <Layout>
        <Content className='manageContent' style={{padding: '10px 15px' }}>
          <div
            style={{
              background: "#FFFFFF",
              padding: 20,
              minHeight: "100%",
              borderRadius: 20,
            }}
          >
              <Splitter style={{ height: "890px"}}>

                <Splitter.Panel defaultSize="25%">
                   <Typography.Title level={4} style={{marginBottom:"20px", textAlign:"center"}}>Add a User to the Schedule</Typography.Title>
                  <Form
                    form={userForm}
                    onFinish={formComplete}
                    layout="vertical"
                    autoComplete="off"
                    initialValues={{ userType: 'family' }}
                  > 
                    <Form.Item style={{marginRight: 20}}
                      name="email"
                      label="Enter User Email"
                      rules={[{ required: true }, { type: 'email', warningOnly: true }]}
                    >
                      
                      <Input placeholder="Enter user email" />
                    </Form.Item>
                    <Form.Item style={{marginRight: 20}}
                      name="firstName"
                      label="Enter User First Name"
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="Enter user first name" />
                    </Form.Item>
                     <Form.Item style={{marginRight: 20}}
                      name="lastName"
                      label="Enter User Last Name"
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="Enter user last name" />
                    </Form.Item>
                    <Form.Item name="admin" label="Enable Admin" valuePropName="checked" initialValue={false}>
                    <Switch />
                  </Form.Item>

                   <Form.Item label="User Type" name="userType">
                    <Radio.Group>
                      <Radio.Button value="Family">Family</Radio.Button>
                      <Radio.Button value="Carer">Carer</Radio.Button>
                      <Radio.Button value="Manager">Manager</Radio.Button>
                      <Radio.Button value="POA">Power of Attorney</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                  
                    <Form.Item style={{marginRight: 20}}>
                      
                        <Button type="primary" htmlType="submit" block>
                          Add User
                        </Button>
                
                    </Form.Item>
                </Form>
              <div className="scrollList">
              <List style={{marginRight: 20}}
                header={<Typography.Title level={5}>USERS</Typography.Title>}
                bordered
                dataSource={data}
                renderItem={item => (
                <List.Item>
                  {item}
                </List.Item>
                )}
                />
                </div>
       
                </Splitter.Panel>

                <Splitter.Panel>
                  <Typography.Title level={4} style={{marginBottom:"20px", textAlign:"center"}}>Add a Task or Category to Scehdule</Typography.Title>
                </Splitter.Panel>

            </Splitter>
           
          </div>
        </Content>
      </Layout>

    );
}