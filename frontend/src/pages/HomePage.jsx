import React, { useState, useMemo } from "react";
import {Typography, Layout, Row, Card, Tabs, Col,Table,Tag, Button, Dropdown, message, Space, Divider, Tooltip} from 'antd';
import {
  DownOutlined, UserOutlined,
  CheckCircleTwoTone, ExclamationCircleTwoTone, ClockCircleTwoTone
} from "@ant-design/icons";
import dayjs from 'dayjs';
import { Bar, Pie, Column} from '@ant-design/plots';
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);
const { Content } = Layout;
const DATE_OPTIONS = { day: "numeric",  month: "long", year: "numeric" };
const TODAY = () => new Date();

/*Chart code reference: https://ant-design-charts.antgroup.com/en*/

const tempCatData = [{ labelName: "Cat1",  value: 210, budget: 200 },
{ labelName: "Cat5",  value: 110, budget: 150 },
  { labelName: "Cat10", value: 110, budget: 1000 },
  { labelName: "Cdw", value: 110, budget: 2000 },
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

  function isISO(s) {
    return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
  }

  function toLocalDate(iso) {
      if (!isISO(iso)) return null;
      const [y, m, d] = iso.split("-").map(Number);
      return new Date(y, m - 1, d);
  }

  function deriveStatus(entry) {
    if (entry.status === "completed") return "completed";
    const due = toLocalDate(entry.dueDate);
    if (!due) return "upcoming";
    const now = TODAY();
    due.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    return due < now ? "overdue" : "upcoming";
}

  function statusTagProps(status) {
      switch (status) {
          case "completed": 
              return { 
                  color: "success",
                  label: "Completed",
                  icon: <CheckCircleTwoTone twoToneColor="#52c41a" />
              };
          case "overdue": 
              return { 
                  color: "error", 
                  label: "Overdue",
                  icon: <ExclamationCircleTwoTone twoToneColor="#ff4d4f" />
              };
          default: 
              return { 
                  color: "processing", 
                  label: "Upcoming",
                  icon: <ClockCircleTwoTone twoToneColor="#1677ff" />
              };
      }
  }

  const MOCK_ITEMS = [
      {
          id: "aaa",
          name: "AAA",
          schedules: [
              { year: 2025, month: 0, status: "completed", completionDate: "2025-01-18", dueDate: "2025-01-20", comments: ""},
              { year: 2025, month: 8, status: "pending", dueDate: "2025-09-10", comments: "" },
          ]
      },
      {
          id: "bbb",
          name: "BBB",
          schedules: [
              { year: 2025, month: 1, status: "pending", dueDate: "2025-02-15", comments: "" },
              { year: 2025, month: 5, status: "pending", dueDate: "2025-06-12", comments: "" },
          ]
      },
      {
          id: "ccc",
          name: "CCC",
          schedules: [
              { year: 2025, month: 8, status: "completed", completionDate: "2025-09-05", dueDate: "2025-09-01", comments: "" },
              { year: 2025, month: 9, status: "pending", dueDate: "2025-10-20", comments: "" },
              { year: 2026, month: 1, status: "pending", dueDate: "2026-02-03", comments: "" },
          ]
      },
        {
          id: "zzz",
          name: "ZZZ",
          schedules: [
              { year: 2025, month: 8, status: "completed", completionDate: "2025-09-05", dueDate: "2025-09-01", comments: "" },
              { year: 2025, month: 9, status: "pending", dueDate: "2025-10-21", comments: "" },
              { year: 2026, month: 1, status: "pending", dueDate: "2026-02-03", comments: "" },
          ]
      },
        {
          id: "ttt",
          name: "TTT",
          schedules: [
              { year: 2025, month: 8, status: "completed", completionDate: "2025-09-05", dueDate: "2025-09-01", comments: "" },
              { year: 2025, month: 9, status: "pending", dueDate: "2025-10-22", comments: "" },
              { year: 2026, month: 1, status: "pending", dueDate: "2026-02-03", comments: "" },
          ]
      },
      
        {
          id: "yyy",
          name: "YYY",
          schedules: [
              { year: 2025, month: 8, status: "completed", completionDate: "2025-09-05", dueDate: "2025-09-01", comments: "" },
              { year: 2025, month: 9, status: "pending", dueDate: "2025-10-21", comments: "" },
              { year: 2026, month: 1, status: "pending", dueDate: "2026-02-03", comments: "" },
          ]
      },
        {
          id: "ooo",
          name: "OOO",
          schedules: [
              { year: 2025, month: 8, status: "completed", completionDate: "2025-09-05", dueDate: "2025-09-01", comments: "" },
              { year: 2025, month: 9, status: "pending", dueDate: "2025-10-22", comments: "" },
              { year: 2026, month: 1, status: "pending", dueDate: "2026-02-03", comments: "" },
          ]
      },
  ];

export default function HomePage() {

    const currentDate = dayjs().startOf("day");
    const endDate = currentDate.add(60, "day");
    const [items, setItems] = useState(MOCK_ITEMS);

  const upcomingTasks = ((items.flatMap(item => item.schedules.map((task, index)=> 
    ({taskId: `${item.id}-${index}`,name: item.name, dueDate:dayjs(task.dueDate, "YYYY-MM-DD"),  dStatus: deriveStatus({status: task.status, dueDate: task.dueDate})}))))
    .filter(task => task.dStatus != "completed"))
    .filter(task=> {return task.dueDate.isBetween(currentDate, endDate) || task.dStatus == "overdue"});


   const cols = [
        {
            title: "Item",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Status",
            key: "derivedStatus",
            width: 140,
            render: (_, record) => {
                const { color, label, icon } = statusTagProps(record.dStatus);
                return <Tag 
                        color={color}
                        icon={icon}
                        style={{ display: "inline-flex", alignItems: "center" }}
                    >
                        {label}
                    </Tag>;
            }
        },
        {
            title: "Due Date",
            key: "dueDate",
            width: 260, 
            render: (_, r) => r.dueDate.format("D MMM YYYY"),
        },
       
    ];

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
                     
                      <Card style={{ background:"#6262620a",height: 455, display: "flex", flexDirection: "column" }}styles={{ body: { flex: 1, overflowY: "auto"} }}
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
                    type="inner" title={<Typography.Title level={4} style={{textAlign:"center"}}>Upcoming Tasks (~ 2 Months)</Typography.Title>}>
                        <Table columns={cols} dataSource={upcomingTasks} pagination={{pageSize: 6,}} size="small"></Table>
                    </Card>
                    </Col>
                  </Row>
                
                 </div>
                </Content>
        </Layout>
    );
}


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
    width:1000,
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



