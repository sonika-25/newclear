import './css/management.css';
import {Modal, Table, Popconfirm, Radio, Layout, List, Splitter, Button, Form, Input, Switch, message, Space, Typography } from 'antd';
import React, { useState, useRef} from 'react';
import {CloseOutlined} from '@ant-design/icons';

const { Content } = Layout;


  export default function ManagementPage() {
  const [userData, setUserData] = useState([]);
  const [userForm] = Form.useForm();

  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [taskForm] = Form.useForm();
  const nextKey = useRef(2);


  const [dataSource, setTaskData] = useState([
    { key: '0', task: 'New Toothpaste', budget: '$100', frequency: 'Every 20 Days', description: 'Uses protective enamel paste only',
    dateRange: ['01-01-2025', '01-01-2050'],},
    { key: '1', task: 'New Toothbrush', budget: '$100', frequency: 'Every 30 Days', description: 'Requires a soft bristle brush due to sensitivity',
    dateRange: ['01-01-2025', '01-01-2050'], },
  ]);

  const columns = [
    { title: 'Task', dataIndex: 'task', key: 'task' },
    { title: 'Task Budget', dataIndex: 'budget', key: 'budget' },
    { title: 'Schedule Frequency', dataIndex: 'frequency', key: 'frequency' },
    {
      title: 'Remove/Edit Task',
      key: 'operation',
      render: (_, record) => (
        <Popconfirm
          title="Are you sure you want to delete this task?"
          okText="Delete"
          cancelText="Cancel"
          onConfirm={() => handleTaskDelete(record.key)}
        >
          <a>Delete Task</a>
        </Popconfirm>
      ),
    },
  ];

  const formComplete = (values) => {
      const user = `${values.firstName} ${values.lastName} · ${values.userType} · Admin Status: ${values.admin}`;

      setUserData(prevData => [...prevData, user]);
      userForm.resetFields();
  };

   const remove = (idx) => {
    setUserData(prev => prev.filter((_, i) => i !== idx));
  };
  
  const handleTaskDelete = (key) => {
    setTaskData(prev => prev.filter(item => item.key !== key));
  };

    const showModal = ()=> {
      setTaskModalOpen(true);
    };
    const handleOk = (values) => {

        setTaskData(prev => [...prev,
        {
          key: String(nextKey.current++),
          task: values.task,
          budget: values.budget,
          frequency: values.frequency,
          description: values.description,
          dateRange: values.dateRange,
        },
      ]);
      taskForm.resetFields()
      setTaskModalOpen(false);

    };
    const handleCancel = () => {
      
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
                   <Typography.Title level={4} style={{marginBottom:"20px", textAlign:"center"}}>Add People to the Schedule</Typography.Title>
                  <Form
                    form={userForm}
                    onFinish={formComplete}
                    layout="vertical"
                    autoComplete="off"
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
                      dataSource={userData}
                      rowKey={(_, itemId) => itemId}
                      renderItem={(item, itemId  ) => (
                      <List.Item  actions={[
                          <Button
                            key="remove"
                            shape="circle"
                            icon={<CloseOutlined />}
                            onClick={() => remove(itemId)}
                          />
                        ]}>
                        {item}
                      </List.Item>
                    )}
                    />
                    </div>
       
                </Splitter.Panel>

                <Splitter.Panel>
                  <Typography.Title level={4} style={{marginBottom:"20px", textAlign:"center"}}>Add a Task or Category to Schedule</Typography.Title>
                  <Button type="primary" onClick={showModal} style={{marginLeft:"20px", marginBottom:"20px"}}>
                          Add a new Task +
                  </Button>
                    <Table
                    style={{marginLeft:"20px"}}
                      columns={columns}
                      
                      pagination={true}
                      expandable={{
                        expandedRowRender: record => <div><p>Task Notes: {record.description}</p><p>Schedule Range: {record.dateRange?.join(' → ')}</p></div>,
                      }}
                      dataSource={dataSource}
                        footer={() =>''}
                    />              
                       
                        <Modal
                          title="Title"
                          open={isTaskModalOpen}
                          onOk={() => taskForm.submit()}
                          onCancel={handleCancel}
                        >
                          <Form
                            form={taskForm}
                            layout="vertical"
                            onFinish={handleOk}
                            initialValues={{ frequency: "Every 30 Days" }}
                          >
                            <Form.Item
                              label="Task"
                              name="task"
                              rules={[{ required: true, message: "Please enter a task name" }]}
                            >
                              <Input placeholder="e.g., New Toothbrush" />
                            </Form.Item>

                          </Form>
                        </Modal> 

                </Splitter.Panel>

            </Splitter>
           
          </div>
        </Content>
      </Layout>

    );
}