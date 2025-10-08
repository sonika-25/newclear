import React from "react";
import {Typography, Layout, Row, Card, Tabs, Col,Button, Dropdown, message, Space, Divider, Tooltip} from 'antd';
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { Bar, Pie, Column} from '@ant-design/plots';
const { Content } = Layout;

/*Chart code reference: https://ant-design-charts.antgroup.com/en*/

const tempCatData = [{ labelName: "Cat1",  value: 210, budget: 200 },
{ labelName: "Cat5",  value: 110, budget: 150 },
  { labelName: "Cat10", value: 110, budget: 1000 },
  { labelName: "Cat20", value: 110, budget: 2000 },
  { labelName: "Cat21",  value: 220, budget: 300 },
  { labelName: "Cat3",  value: 330, budget: 600 },
  { labelName: "Cat4",  value: 440, budget: 900 },
];
const tempTaskData = [{catId: "Cat1", name: "test", budget: 100, actuals: 80},
  {catId: "Cat1", name: "zz", budget: 200, actuals: 80},
  {catId: "Cat1", name: "teswtt", budget: 50, actuals: 20},
  {catId: "Cat1", name: "tdst", budget: 30, actuals: 80},
  {catId: "Cat1", name: "zz2", budget: 200, actuals: 100},
  {catId: "Cat1", name: "tesw12tt", budget: 150, actuals: 125},
{catId: "Cat1", name: "z23z", budget: 200, actuals: 80},
  {catId: "Cat1", name: "tes321312wtt", budget: 50, actuals: 20},
  {catId: "Cat1", name: "td3121st", budget: 30, actuals: 80},
  {catId: "Cat1", name: "zz312312", budget: 200, actuals: 100},
  {catId: "Cat1", name: "te1231as2tt", budget: 150, actuals: 125}]

export default function HomePage() {
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
                     <Row>
                    <Col md={16}>
                     
                      <Card style={{ background:"#6262620a",height: 455, display: "flex", flexDirection: "column" }}styles={{ body: { flex: 1, overflowY: "auto", overflowX:"auto"} }}
                      type="inner" title= {<Typography.Title level={4} style={{textAlign:"center"}}>Category Budgets</Typography.Title>}>
                       
                        <BudgetBar data={tempCatData} />
                      </Card>
                    </Col>
                    <Col md={8}>
                    
                    <Card   style={{  background:"#6262620a", height: 455, display: "flex", flexDirection: "column" }} styles={{ body: { flex: 1, overflow: "hidden"} }}
                    type="inner" title={<Typography.Title level={4} style={{textAlign:"center"}}>Total Budget Summary</Typography.Title>}>
                       <CatPie data={tempCatData} />
                    </Card>
                     
                    </Col>
                  </Row> 
                  <Row>
                     <Col md={15}> 
                 
                     <Card   style={{ background:"#6262620a", height: 420, display: "flex", flexDirection: "column" }}
                      styles={{ body: { flex: 1, overflowY: "auto", padding: 12 } }}   
                      type= "inner" title={ <Typography.Title level={4} style={{textAlign:"center"}}>View Sub Element Budgets</Typography.Title>}>
                       
                     <Tabs
                      tabPosition="left"
                      style={{ height: 300 }}
                      items={tempCatData.map(cat => ({
                        //this should be changed to id when fetching from db
                        key: cat.labelName,
                        label: `${cat.labelName}`,
                        children:<div style={{ height: 320, overflowY: "auto" }}><TaskBudgetBar data={cat} chartHeight={520} /></div>,
                      }))}  
                      />
                      </Card>
                      </Col>
                      <Col md={9}>
                      <Card   style={{  background:"#6262620a", height: 420, display: "flex", flexDirection: "column" }} styles={{ body: { flex: 1, overflow: "hidden"} }}
                    type="inner" title={<Typography.Title level={4} style={{textAlign:"center"}}>Upcoming Tasks</Typography.Title>}>
                      
                    </Card>
                    </Col>
                  </Row>
                
                 </div>
                </Content>
        </Layout>
    );
}


/*This code references ant design charts demonstration bar and has been customised from the template*/

/*This code references ant design charts demonstration bar and has been customised from the template*/
const BudgetBar = ({data}) => {

   const rows = data.map(d => {
    const used = d.value / d.budget;
      const overflow = Math.min(1, used);
    const ranges = used > 1   ? "over budget" :
        used >= 0.8 ? "80%-100% Used" :
      used >= 0.5 ? "50%-80% Used"  : "<50% Used";
    return { ...d, used, overflow, ranges };
  });

  const config = {
    data: rows,
    xField: "labelName",
    yField: "overflow",
    height:400,
    style: { maxWidth: 25 },

    colorField: "ranges",
    scale: {
      y: { domain: [0, 1] },
      color: {
        domain: ["<50% Used" , "50%-80% Used","80%-100% Used", "over budget"],
        range:  ["#fcadadff","#fc9768ff","#ff6565ff", "#ff0015ff"],
      },
    },

    markBackground: {
      label: {
        text: ({ originData }) => {
          const { value, budget, used } = originData;
          const pct = Math.round(used * 100);
          return `${pct}% of \$${budget}`;
        },
        position: "right",
        dx: -20,
        style: {fill: "#040404ff", fillOpacity: 1, fontSize: 12 },
      },
      style: { fill: "#eeeeee89" },
    },

    axis: {
      x: { 
        tick: false,
        title: false },
      y: {
        grid: false,
        tick: false,
        label: false,
        title: false,
      },
    },
  };

  return <Bar {...config} />;
};

const TaskBudgetBar = ({data}) => {
  //Get task data here?
   const subElements = tempTaskData.filter(task => task.catId == data.labelName);
   if(subElements.length == 0){return;}
   //
   const rows = subElements.map(d => {
    const used = d.actuals / d.budget;
    const overflow = Math.min(1, used);
    const ranges = used > 1   ? "over budget" :
        used >= 0.8 ? "80%-100% Used" :
      used >= 0.5 ? "50%-80% Used"  : "<50% Used";
    return { ...d, used, overflow, ranges };
  });

  const config = {
    data: rows,
    xField: "name",
    yField: "overflow",
    paddingRight: 80,
      style: { maxWidth: 50 },
    height: 330,
    appendPadding: [8, 12, 20, 8],

    legend: {
      color:{
          position:'top',
          layout: 'horizontal',
          offsetY: 100,
      },
     
    },

    colorField: "ranges",
    scale: {
      y: { domain: [0, 1] },
      color: {
        domain: ["<50% Used" , "50%-80% Used","80%-100% Used", "over budget"],
        range:  ["#fcadadff","#fc9768ff","#ff6565ff", "#ff0015ff"],
      },
    },

    markBackground: {
      label: {
        text: ({ originData }) => {
          const {budget} = originData;
          return `\$${budget}`;
        },
        position: "right",
        dy: 0,
        style: {fill: "#040404ff", fillOpacity: 1, fontSize: 12 },
      },
      style: { fill: "#eeeeee89" },

    },
    
    axis: {
      x: { 
        tick: false,
        title: false },
      y: {
        grid: false,
        tick: false,
        label: false,
        title: false,
      },
    },
  };

  return <Bar {...config} />;
};


/*This code references ant design charts demonstration pie chart and has been customised from the template*/

const CatPie = ({data}) => {
  if(data.length == 0){return null;}
  let inUse = 0;
  let budget = 0;
  for (const d of data) {
    inUse+=d.value;
    budget+=d.budget;
  }
  let remaining = budget-inUse;
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
        fontSize: "20",
      },
    },
    scale: {
      color: overBudget
        ? { domain: ['Over Budget By'], range: ['#ff4d4f'] }
        : { domain: ['Used', 'Remaining'], range: ['rgba(255, 159, 142, 1)', '#ff7171ff'] },
    },
  };
  return  <div style={{ width: 400, height: 350, margin: 'auto'}}><Pie {...config} /></div>
};



