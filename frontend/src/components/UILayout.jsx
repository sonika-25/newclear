import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { Layout } from "antd";

const UILayout = () => {
   return( 
   <Layout>
        <Navbar />
        <Layout style={{ minHeight: "100vh" }}>
            <Outlet />
        </Layout>
    </Layout>
    );
};

export default UILayout;
