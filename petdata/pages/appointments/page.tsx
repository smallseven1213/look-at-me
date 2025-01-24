import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Outlet } from "react-router-dom";
import HospitalCheck from "../../components/HospitalCheck";
import PageHeader from "../../components/PageHeader";
import PageHeaderTitle from "../../components/PageHeaderTitle";
import PagePadding from "../../components/PagePadding";
import Tabs from "../../components/Tabs";
import { useHospital } from "../../hooks/useHospital";
import { useHospitalStore } from "../../stores/hospitalStore";

const AppointmentsPage: React.FC = () => {
  const hospitalId = useHospitalStore((state) => state.hospitalId);

  const { hospital, isLoading, error, getFullAddress } = useHospital(
    hospitalId || ""
  );

  const navigate = useNavigate();
  const location = useLocation();
  const activeKey = location.pathname.endsWith("calendar")
    ? "calendar"
    : location.pathname.endsWith("unconfirmed")
    ? "unconfirmed"
    : "calendar"; // 預設顯示 calendar

  const items = [
    {
      key: "calendar",
      label: "行事曆",
      children: null,
    },
    {
      key: "unconfirmed",
      label: "待確認清單",
      children: null,
    },
  ];

  const handleTabChange = (key: string) => {
    navigate(key);
  };

  return (
    <div className="flex flex-col h-full">
      <HospitalCheck>
        <PageHeader>
          <PageHeaderTitle title="預約管理" />
          <Tabs
            defaultActiveKey={activeKey}
            items={items}
            onChange={handleTabChange}
            tabPosition="bottom"
            paddingX={20}
          />
        </PageHeader>
        <div className="flex-1 overflow-y-scroll">
          <Outlet context={{ hospital }} />
        </div>
      </HospitalCheck>
    </div>
  );
};

export default AppointmentsPage;
