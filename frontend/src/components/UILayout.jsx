import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { Layout } from "antd";

const UILayout = () => {
   return( 
   <Layout>
        <Navbar />
        <Layout>
            <Outlet />
        </Layout>
    </Layout>
    );
};

export default UILayout;
