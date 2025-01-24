import { useFetch } from './useFetch';
import { AppointmentDetail } from '../types/appointment';

interface UseAppointmentReturn {
  appointment: AppointmentDetail | null;
  isLoading: boolean;
  error?: Error;
  refresh: () => Promise<void>;
}

export const useAppointment = (appointmentId: string | null): UseAppointmentReturn => {
  const { 
    data,
    isLoading,
    error,
    mutate 
  } = useFetch<AppointmentDetail>(
    appointmentId ? `${process.env.REACT_APP_API_URL}/api/appointment/${appointmentId}` : null
  );

  const refresh = async () => {
    await mutate();
  };

  return {
    appointment: data ?? null,
    isLoading,
    error,
    refresh
  };
};
