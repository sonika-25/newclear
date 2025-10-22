import React, {useState} from "react"
import {Layout, Card, Empty, Typography, Button, Upload} from 'antd';
import { ConsoleSqlOutlined, UploadOutlined } from "@ant-design/icons";

/*Sections of this code utilises the ant design template structured provided on their website
They are intended to used as a foundational starting point and are entirely open source
Link to reference: https://ant.design/components/upload*/
const { Content } = Layout;
const {Dragger} = Upload;

export default function EvidencePage() {
  const [evidence, setEvidence] = useState([
 
]);
  const isEmpty = evidence.length == 0;
    const showEvidence = ({ fileList }) => setEvidence(fileList);
    return (
        <Layout>
                <Content className='manageContent' style={{padding: '10px 15px' }} >
                  <div
                    style={{
                      background: "#FFFFFF",
                      padding: 20,
                      minHeight: "100%",
                      borderRadius: 20,
                    }}
                  >
                      <Card style={{ background:"#6262620a",height: 890, display: "flex", flexDirection: "column" }}styles={{ body: { flex: 1, overflowY: "auto"} }}>
                              {isEmpty ? (
                              <Empty>
                                <Upload action="" defaultFileList={evidence} showUploadList={false} onChange={showEvidence}>
                                  <Button style={{height: 80, width: 130, marginBottom: 50, fontWeight: 500}}  color="primary" variant="dashed" type="primary" icon={<UploadOutlined />}>
                                    Upload
                                  </Button>
                                </Upload>
                                </Empty>
                              ):(
                              <Upload
                                action="" //post to db inside action. just pass it a function
                                listType="picture"
                                onRemove={console.log("change this to a db fetch function (remove db)")}
                                defaultFileList={evidence}
                              >
                                <Button style={{height: 80, width: 130, marginBottom: 50, fontWeight: 500}}  color="primary" variant="dashed" type="primary" icon={<UploadOutlined />}>
                                  Upload
                                </Button>
                              </Upload>   )}
                                </Card>
                     
                    </div>

                   

                </Content>
        </Layout>
    );
}