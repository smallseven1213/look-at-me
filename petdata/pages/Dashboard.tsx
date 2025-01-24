import React from "react";
import PageHeader from "../components/PageHeader";
import PageHeaderTitle from "../components/PageHeaderTitle";
import PagePadding from "../components/PagePadding";
import AppointmentList from "./dashboard/AppointmentList";

const Dashboard: React.FC = () => {
  return (
    <>
      <PageHeader>
        <PageHeaderTitle title="儀表板" />
      </PageHeader>
      <PagePadding>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AppointmentList />
        </div>
      </PagePadding>
    </>
  );
};

export default Dashboard;
