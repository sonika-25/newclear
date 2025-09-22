
import {Layout, theme } from 'antd';
const { Content } = Layout;
export default function ManagementPage() {
    const {
    token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout>
        <Content style={{ padding: '20px 20px' }}>
          <div
            style={{
              background: "#FFFFFF",
              padding: 50,
              minHeight: "100%",
              borderRadius: borderRadiusLG,
            }}
          >
            Content
          </div>
        </Content>
      </Layout>
    );
}