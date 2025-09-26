import './css/management.css';
import {Modal, Tabs, Table, Popconfirm, Radio, Layout, List, Cascader, Input, DatePicker, InputNumber, Select,
        Splitter, Button, Form, Switch, message, Space, Typography } from 'antd';
import React, { useState, useRef, useMemo} from 'react';
import {CloseOutlined, PlusOutlined} from '@ant-design/icons';

const { Content } = Layout;
const {RangePicker} = DatePicker;
const{TextArea } = Input;


import { Pie } from '@ant-design/plots';

const CatPie = ({data}) => {
  let inUse = 0;
  let remaining = 0;
  for (const d of data) {
    if (d.type === 'Total In Use') inUse = Number(d.value) || 0;
    else if (d.type === 'Remaining') remaining = Number(d.value) || 0;
  }
  const overBudget = remaining < 0;

  let inputData;

  if(overBudget){
      inputData =  [{ type: 'Over Budget By', value: Math.abs(remaining) }];
  }
  else{
    if(inUse == 0){
      inputData = [{type: "Remaining", value: remaining}];
    }
    else{
      inputData = [{ type: 'Used', value: inUse},{ type: 'Remaining', value: Math.max(remaining, 0) },];
    }
  }
   
  const config = {
    data: inputData,
    angleField: 'value',
    colorField: 'type',
    label: {
      text: 'value',
      style: {
        fontWeight: 'bold',
      },
    },
    scale: {
      color: overBudget
        ? { domain: ['Over Budget By'], range: ['#ff4d4f'] }
        : { domain: ['Used', 'Remaining'], range: ['#7d486fff', '#87114c5c'] },
    },
  };
  return  <div style={{ width: 400, height: 200, margin: 'auto'}}><Pie {...config} /></div>
};



  export default function ManagementPage() {

  const [userData, setUserData] = useState([]);
  const [userForm] = Form.useForm();

  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [taskForm] = Form.useForm();

  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryForm] = Form.useForm();



  const [taskData, setTaskData] = useState([
    { key: '0', task: 'New Toothpaste', categoryId: "1", budget: 100, frequency: 30, description: 'Uses protective enamel paste only',
    dateRange: ['01-01-2025', '01-01-2050'],},
    { key: '1', task: 'New Toothbrush',  categoryId: "1", budget: 100, frequency: 30, description: 'Requires a soft bristle brush due to sensitivity',
    dateRange: ['01-01-2025', '01-01-2050'], },
  ]);

  
  const columns = [
    { title: 'Task', dataIndex: 'task', key: 'task' },
    { title: 'Task Budget $', dataIndex: 'budget', key: 'budget' },
    { title: 'Schedule Frequency', dataIndex: 'frequency', key: 'frequency' },
    {
      title: 'Remove/Edit Task',
      key: 'operation',
      render: (_, record) => (
        <Popconfirm
          title="Are you sure you want to permanently delete this task?"
          okText="Delete"
          cancelText="Cancel"
          onConfirm={() => HandleTaskDelete(record.key)}
        >
          <a style={{color:'#ff0000ff'}}>Delete Task</a>
        </Popconfirm>
      ),
    },
  ];

  const UserFormComplete = (values) => {
      const user = `${values.firstName} ${values.lastName} · ${values.userType} · Admin Status: ${values.admin}`;

      setUserData(prevData => [...prevData, user]);
      userForm.resetFields();
  };

   const RemoveUser = (idx) => {
    setUserData(prev => prev.filter((_, i) => i !== idx));
  };
  
  const HandleTaskDelete = (key) => {
    setTaskData(prev => prev.filter(item => item.key !== key));
  };

    const ShowTaskModal = ()=> {
      setTaskModalOpen(true);
    };
     
    const HandleTaskOk = (values) => {
        setTaskData(prev => [...prev,
        {
          key: crypto.randomUUID(),
          task: values.task.trim(),
          categoryId: activeKey,
          budget: Number(values.budget),
          frequency: Number(values.frequency),
          description: values.description || '',
          dateRange: values.dateRange,
        },
      ]);
      taskForm.resetFields()
      setTaskModalOpen(false);
    };
 /*********************END TAB BOILIER PLATE FROM ANTD WITH SLIGHT EDITS**************************** */   
  
 
  const [categories, setCategories] = useState([
    { id: '1', name: '1', budget: 1000 },
    { id: '2', name: '2', budget: 1000 },
    ]);
  const [activeKey, setActiveKey] = useState(categories[0].id);
  const tabItems = useMemo(() => categories.map(c => ({ label: c.name, key: c.id })),[categories]);

  const addCategoryData = (values) => {
    const id = values.id;
    const budget = Number(values.budget) || 0;
    const name = `Category: ${id}`;
    setCategories(prev => [...prev, {id, name, budget}]);
    setActiveKey(id);
    setCategoryModalOpen(false);
    categoryForm.resetFields();
  };

  const OnCatChange = key => {
    setActiveKey(key);
  };

  const addTab = () => {
    const id = crypto.randomUUID;
    setCategories([...prev, { id, name: id, budget: 0}]);
    setActiveKey(id);

  };
  const removeTab = categoryId => {
     setCategories(prev => prev.filter(c => c.id !== categoryId));
     setTaskData(prev => prev.filter(t => (t.categoryId) !== categoryId));

    const newPanes = categories.filter(c => c.id !== categoryId);
    if (newPanes.length && categoryId === activeKey) {
      setActiveKey(newPanes[0].id);
    }
  };

  const onEdit = (targetKey, action) => {
    if (action === 'add') {
      addTab();
    } else {
      if(window.confirm("you sure? this will permananetly delete all the tasks in this category")){
        removeTab(targetKey);
      }
        
    }
  };

  const showCategoryModal = ()=> {
      setCategoryModalOpen(true);
    };
/*******************END TAB BOILIER PLATE FROM ANTD WITH SLIGHT EDITS***************************************** */
  const displayPie = (key) => {
  var inUse = 0;
  var catBudget;

  for(const t of taskData){
    if(t.categoryId == key){
      inUse += Number(t.budget);
    }
  }
    for(const c of categories){
      if(key == c.id){
        catBudget = Number(c.budget);
        break;
      }
    }
    var remainingBudget = catBudget-inUse;
      var overBudget = false;

    if(inUse > catBudget){
      overBudget = true;
    }
    if(inUse == 0){
      const data =  [{type: "Remaining", value: remainingBudget}];
      return data;
    }
  
    const data = [{type: "Total In Use", value: inUse}, {type: "Remaining", value: remainingBudget}];

    return data;

  }
   
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
                    onFinish={UserFormComplete}
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
                      
                        <Button type="primary" htmlType="submit" block color="pink" variant="filled">
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
                            onClick={() => RemoveUser(itemId)}
                          />
                        ]}>
                        {item}
                      </List.Item>
                    )}
                    />
                    </div>
       
                </Splitter.Panel>

                <Splitter.Panel>
                  <Typography.Title level={4} style={{marginBottom:"10px", textAlign:"center"}}>Add a Task or Category to Schedule</Typography.Title>
                   <div>
                    <div style={{ marginBottom: 16 }}>
                      <Button   icon={<PlusOutlined/>} color="pink" variant="filled" style={{marginLeft:"20px"}} onClick={showCategoryModal} >Add New Category</Button>
                    </div>
                    <Tabs
                      hideAdd
                      onChange={OnCatChange}
                      activeKey={activeKey}
                      type="editable-card"
                      onEdit={onEdit}
                      items={tabItems}
                      style={{marginLeft:"20px"}}
                    />
                  </div>
                  <CatPie data={displayPie(activeKey)}/> 
                  <Button color="pink" variant="filled" type="primary" onClick={ShowTaskModal} icon={<PlusOutlined/>}style={{marginLeft:"20px", marginBottom:"10px"}}>
                          Add New Task 
                  </Button>
                  
                  <Table
                    style={{marginLeft:"20px"}}
                    columns={columns}
                    pagination={{pageSize: 6,}}
                    expandable={{
                      expandedRowRender: record => <div><p>Task Notes: {record.description}</p><p>Schedule Range: {record.dateRange.join(' → ')}</p></div>,
                    }}
                    dataSource={taskData.filter(r => (r.categoryId) === activeKey)}
                    footer={() =>''}
                  />              
                  
                  <Modal
                    title="Title"
                    open={isTaskModalOpen}
                    onOk={() => taskForm.submit()}
                    onCancel={() => setTaskModalOpen(false)}
                  >
                    <Form
                      form={taskForm}
                      layout="vertical"
                      onFinish={HandleTaskOk}
                      initialValues={{ frequency: "Every 30 Days" }}
                    >
                      <Form.Item
                        label="Task"
                        name="task"
                        rules={[{ required: true, message: "Please enter a task name" }]}
                      >
                      <Input placeholder="e.g., New Toothbrush" />
                      </Form.Item>
                       <Form.Item
                        label="Task Budget"
                        name="budget"
                        rules={[{ required: true, message: "Enter a Task Budget" }]}>
                        <InputNumber
                          addonBefore="+"
                          addonAfter={'$'}
                          defaultValue={0}
                          controls
                        />
                      </Form.Item>
                      <Form.Item
                        label="Start and End Date"
                        name="dateRange"
                        rules={[{ required: true, message: "Enter a Task Start and End Date" }]}>
                        <RangePicker
                          format="DD-MM-YYYY"
                        />
                      </Form.Item>

                      <Form.Item
                        label="Task Completion Frequency"
                        name="frequency"
                        rules={[{ required: true, message: "Enter a Interval" }]}>
                        <InputNumber size="large" min={1} max={100000} defaultValue={30}/>
                      </Form.Item>
              
                        <Form.Item
                        label="Add task context or further notes"
                        name="description"
                        rules={[{ required: true, message: "Please give some context" }]}> 

                        <TextArea
                        showCount
                        maxLength={100}
                        placeholder="disable resize"
                        style={{ height: 120, resize: 'none' }}/>
                          
                        </Form.Item>
                     
                    </Form>
                  </Modal> 

                  <Modal
                    title="Title"
                    open={isCategoryModalOpen}
                    onOk={() => categoryForm.submit()}
                    onCancel={() => setCategoryModalOpen(false)}
                  >
                    <Form
                      form={categoryForm}
                      layout="vertical"
                      onFinish={addCategoryData}
                    >
                      <Form.Item
                        label="Category"
                        name="id"
                        rules={[{ required: true, message: "Please enter a Category ID" }]}
                      >
                         <Input/>
                      </Form.Item>
                      <Form.Item
                        label="Category Budget"
                        name="budget"
                        rules={[{ required: true, message: "Please enter a Category Budget" }]}>
                        <InputNumber
                          addonBefore="+"
                          addonAfter={'$'}
                          defaultValue={0}
                          controls
                        />
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