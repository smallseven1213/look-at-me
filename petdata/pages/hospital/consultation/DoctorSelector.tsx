import { useEffect, useState } from "react";
import Dropdown from "../../../components/Dropdown";
import Input from "../../../components/Input";
import { useDoctors } from "../../../hooks/useDoctors";
import { useHospitalStore } from "../../../stores/hospitalStore";
import { ScheduleDoctor } from "../../../types/schedule";

interface DoctorSelectorProps {
  doctor: ScheduleDoctor | null;
  onChange: (doctor: ScheduleDoctor) => void;
}

const DoctorSelector: React.FC<DoctorSelectorProps> = ({
  doctor,
  onChange,
}) => {
  const hospitalId = useHospitalStore((state) => state.hospitalId);
  const { doctors } = useDoctors(hospitalId);
  const [isCustomDoctor, setIsCustomDoctor] = useState(false);
  const [customDoctorName, setCustomDoctorName] = useState("");

  const doctorOptions = [
    { value: "custom", label: "自訂醫生" },
    ...doctors
      .filter((d) => d.status !== -1)
      .map((d) => ({ value: d.id || "", label: d.name })),
  ];

  useEffect(() => {
    if (doctor) {
      if (!doctor.id) {
        setIsCustomDoctor(true);
        setCustomDoctorName(doctor.name || "");
      } else {
        setIsCustomDoctor(false);
        setCustomDoctorName("");
      }
    }
  }, [doctor]);

  const handleDoctorChange = (value: string) => {
    if (value === "custom") {
      setIsCustomDoctor(true);
      onChange({
        id: undefined,
        name: customDoctorName,
        specialties: [],
      });
    } else {
      setIsCustomDoctor(false);
      const selectedDoctor = doctors.find((d) => d.id === value);
      if (selectedDoctor) {
        onChange({
          id: selectedDoctor.id,
          name: selectedDoctor.name,
          specialties: selectedDoctor.specialties,
        });
      }
    }
  };

  const handleCustomNameChange = (name: string) => {
    setCustomDoctorName(name);
    onChange({
      id: undefined,
      name,
      specialties: [],
    });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-64">
        <Dropdown
          label="執班醫生"
          variant="button"
          value={isCustomDoctor ? "custom" : doctor?.id ?? ""}
          onChange={handleDoctorChange}
          options={doctorOptions}
        />
      </div>
      {isCustomDoctor && (
        <div className="mr-2">
          <Input
            label="醫生名稱"
            placeholder="輸入醫生名稱"
            value={customDoctorName}
            onChange={(e) => handleCustomNameChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default DoctorSelector;
