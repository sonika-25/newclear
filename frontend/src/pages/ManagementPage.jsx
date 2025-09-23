import './css/management.css';
import {Modal, Layout, List, Splitter, Button, Form, Input, Switch, message, Space, Typography } from 'antd';
const { Content } = Layout;

  export default function ManagementPage() {

  const [form] = Form.useForm();

  const onFinish = (values) => {
    
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

                <Splitter.Panel defaultSize="35%">
                  <Form
                    form={form}
                    onFinish={onFinish}
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
                    <Form.Item>
                      <Space>
                        <Button type="primary" htmlType="submit" block>
                          Add
                        </Button>
                      </Space>
                    </Form.Item>
                </Form>
                </Splitter.Panel>

                <Splitter.Panel>
                </Splitter.Panel>

            </Splitter>
           
          </div>
        </Content>
      </Layout>

    );
}