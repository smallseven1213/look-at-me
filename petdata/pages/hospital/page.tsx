import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Outlet } from "react-router-dom";
import HospitalCheck from "../../components/HospitalCheck";
import PageHeader from "../../components/PageHeader";
import PageHeaderTitle from "../../components/PageHeaderTitle";
import PagePadding from "../../components/PagePadding";
import Tabs from "../../components/Tabs";
import { useHospital } from "../../hooks/useHospital";
import { useHospitalStore } from "../../stores/hospitalStore";

const HospitalPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hospitalId = useHospitalStore((state) => state.hospitalId);

  const { hospital, isLoading, error, getFullAddress } = useHospital(
    hospitalId || ""
  );

  const handleTabChange = (key: string) => {
    navigate(`/app/hospital/${key}`);
  };

  // Extract the current tab from the URL and default to "info" for root path
  const currentPath = location.pathname.split("/").pop();
  const activeKey =
    currentPath === "" || currentPath === "hospital" || currentPath === "info"
      ? "info"
      : currentPath;

  const items = [
    {
      key: "info",
      label: "資訊",
      children: <Outlet />,
    },
    {
      key: "schedule",
      label: "班表",
      children: <Outlet />,
    },
    {
      key: "consultation",
      label: "每週診間模版",
      children: <Outlet />,
    },
    {
      key: "doctors",
      label: "醫師群",
      children: <Outlet />,
    },
    // {
    //   key: 'clinic-hours',
    //   label: '看診時間',
    //   children: <Outlet />,
    // },
    // {
    //   key: "specialties",
    //   label: "專科管理",
    //   children: <Outlet />,
    // },
    // {
    //   key: "facilities",
    //   label: "院內設備",
    //   children: <Outlet />,
    // },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">Loading</div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">無法載入醫院資料</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-screen">
      <HospitalCheck>
        <PageHeader>
          <PageHeaderTitle
            title="院所管理"
            // subTitle={`${hospital.name} - ${getFullAddress()}`}
          />
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

export default HospitalPage;
