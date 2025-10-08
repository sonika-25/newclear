import React from "react";
import {Typography, Layout, Row, Tabs, Col,Button, Dropdown, message, Space, Divider, Tooltip} from 'antd';
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { Bar, Pie, Column} from '@ant-design/plots';
const { Content } = Layout;

/*Chart code reference: https://ant-design-charts.antgroup.com/en*/

const tempCatData = [{ labelName: "Cat1",  value: 210, budget: 200 },
{ labelName: "Cat5",  value: 110, budget: 150 },
  { labelName: "Cat10", value: 110, budget: 1000 },
  { labelName: "Cat20", value: 110, budget: 2000 },
  { labelName: "Cat2",  value: 220, budget: 300 },
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
  {catId: "Cat1", name: "te12312sw12tt", budget: 150, actuals: 125}]

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
                    <Col xs={24} md={16}>
                     <Typography.Title level={4} style={{marginRight:"80px", textAlign:"center"}}>Category Budgets</Typography.Title>
                      <BudgetBar data={tempCatData}/>
                    </Col>
                    <Col>
                    <Typography.Title level={4} style={{textAlign:"center"}}>Total Budget Summary</Typography.Title>
                      <CatPie data={tempCatData} />
                    </Col>
                  </Row> 
                   <Col>
                   <Typography.Title level={4} style={{marginBottom:"10px",marginLeft:"275px", textAlign:"left"}}>View Sub Element Budgets</Typography.Title>
                     <Tabs
                      tabPosition="left"
                      style={{ height: 400 }}
                      items={tempCatData.map(cat => ({
                        key: cat.labelName,
                        label: `${cat.labelName}`,
                        children: <TaskBudgetBar data={cat} />,
                      }))}  
                      />
                      </Col>
                      <Col>
        

                      </Col>
                    
                      
                  <Row>
                  
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
    paddingRight: 80,
    autoFit: false,
    height: 400,
    width: 1000,
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
        dx: 90,
        style: {fill: "#595959ff", fillOpacity: 1, fontSize: 14 },
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
    autoFit: false,
      style: { maxWidth: 50 },
    width: 700,
    height: 400,

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
          const { actuals, budget, used } = originData;
          const pct = Math.round(used * 100);
          return ``;
        },
        position: "bottom",
        dy: 40,
        style: {fill: "#595959ff", fillOpacity: 1, fontSize: 14 },
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

  return <Column {...config} />;
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



