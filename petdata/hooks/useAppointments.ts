import { usePost } from './useFetch';
import { 
  AppointmentDetail,
  AppointmentSearchRequest,
  AppointmentSearchResponse
} from '../types/appointment';
import dayjs from 'dayjs';
import { ApiResponse } from '../types';

interface UseAppointmentsParams {
  skip?: number;
  take?: number;
  orders?: AppointmentSearchRequest['orders'];
  searches?: AppointmentSearchRequest['searches'];
}

interface UseAppointmentsReturn {
  appointments: AppointmentDetail[];
  isLoading: boolean;
  error: any;
  errorMessage?: string;
  refresh: () => Promise<void>;
}

export function useAppointments({
  skip = 0,
  take = 10,
  orders = [],
  searches = []
}: UseAppointmentsParams = {}): UseAppointmentsReturn {
  const { data, isLoading, error, mutate } = usePost<AppointmentDetail[]>(
    `${process.env.REACT_APP_API_URL}/api/appointment/search`,
    // Pass the request body as the data parameter
    {
      skip,
      take,
      orders,
      searches
    },
    undefined,
    // {
    //   // 使用 SWR 的缓存配置
    //   revalidateIfStale: false,  // 当缓存过期时不自动重新验证
    //   revalidateOnFocus: false,  // 窗口重新获得焦点时不重新验证
    //   revalidateOnReconnect: false,  // 重新连接时不重新验证
    //   dedupingInterval: 5000,  // 5秒内相同的请求只发送一次
    // }
  );

  console.log(data, error);

  const refresh = async () => {
    await mutate();
  };

  return {
    appointments: data || [],
    isLoading,
    error,
    refresh
  };
};
