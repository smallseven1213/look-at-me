/**
 * Defines the valid search keys for appointment searches
 */
export type AppointmentSearchKey =
  | 'OwnerName'      // 寵物主人名
  | 'OwnerPhoneNo'   // 寵物主人電話
  | 'OwnerEmail'     // 寵物主人Email
  | 'HospitalId'     // 先忽略
  | 'DoctorId'       // 醫生ID
  | 'DoctorName'     // 醫生名稱
  | 'StartTime'      // 開始日期
  | 'EndTime';       // 結束日期

export enum AppointmentSearchKeyString {
  HospitalId = "HospitalId",
  StartTime = "StartTime",
  EndTime = "EndTime",
  OwnerName = "OwnerName",
  OwnerPhoneNo = "OwnerPhoneNo",
  OwnerEmail = "OwnerEmail",
  DoctorName = "DoctorName",
  }

/**
 * Defines the valid column names for sorting
 */
export type AppointmentOrderColumn = 'Id' | 'StartTime' | 'EndTime' | 'DoctorName';

/**
 * Defines the sort direction
 */
export enum SortDirection {
  ASC = 0,
  DESC = 1
}

/**
 * Defines the structure for sorting appointments
 */
export interface AppointmentSearchOrder {
  columnName: AppointmentOrderColumn;
  direction: SortDirection;
}

/**
 * Defines the structure for search conditions
 * @example
 * {
 *   searchKey: 'OwnerName',    // 包含搜尋
 *   searchValue: '飼主A'
 * }
 * {
 *   searchKey: 'StartTime',    // 大於
 *   searchValue: '2024-12-01 10:00:00'
 * }
 */
export interface AppointmentSearchCondition {
  searchKey: AppointmentSearchKey;
  searchValue: string;
}

/**
 * Defines the structure for appointment search request
 * @property skip - Number of records to skip for pagination
 * @property take - Number of records to take per page
 * @property orders - Optional array of sort conditions
 * @property searches - Optional array of search conditions
 */
export interface AppointmentSearchRequest {
  skip: number;
  take: number;
  orders?: AppointmentSearchOrder[];
  searches?: AppointmentSearchCondition[];
}

/**
 * S3 檔案資訊
 */
export interface AppointmentS3File {
  id: string;
  contentType: string;
  createTime: string;
  fileName: string;
  presignedUrl: string;
  s3Bucket: string;
  s3Folder: string;
  s3Key: string;
  s3Region: string;
  size: number;
}

/**
 * 預約資料詳細內容
 * @example
 * {
 *   "id": "02316bea-d3d3-4e0f-b354-e526e127bd84",
 *   "ownerName": "飼主A",
 *   "ownerPhoneNo": "0987654321",
 *   "ownerEmail": "abc@gamil.com",
 *   "petName": "寵物A",
 *   "date": "2024-12-01",
 *   "appointmentStartTime": "12:00:00",
 *   "appointmentEndTime": "18:00:00",
 *   "sectionStartTime": "13:00:00",
 *   "sectionEndTime": "13:30:00",
 *   "hospitalId": "08dce2d2-1e84-44f8-7db2-e1943c06e5b0",
 *   "hospitalName": "寵博健康動物醫院",
 *   "workId": "c3b8e00a-1e5c-46ce-ac3a-a98f7d930eff",
 *   "workName": "一般門診",
 *   "doctorId": "08dce2d1-7174-b5ff-7db2-e1943c06e500",
 *   "doctorName": "D01",
 *   "remark": "",
 *   "forms": [],
 *   "files": []
 * }
 */
export interface AppointmentDetail {
  id: string;               // 預約編號
  ownerName: string;        // 飼主姓名
  ownerPhoneNo: string;     // 飼主電話
  ownerEmail: string;       // 飼主Email
  petName: string;          // 寵物名稱
  date: string;             // 預約日期 (YYYY-MM-DD)
  appointmentStartTime: string;  // 預約時段開始時間 (HH:mm:ss)
  appointmentEndTime: string;    // 預約時段結束時間 (HH:mm:ss)
  appointmentType: string;       // 預約類型
  sectionStartTime: string;      // 看診時段開始時間 (HH:mm:ss)
  sectionEndTime: string;        // 看診時段結束時間 (HH:mm:ss)
  hospitalId: string;       // 醫院ID
  hospitalName: string;     // 醫院名稱
  workId: string;          // 門診類型ID
  workName: string;        // 門診類型名稱
  doctorId: string;        // 醫師ID
  doctorName: string;      // 醫師名稱
  remark: string;          // 備註
  forms: {
    id: string;
    formName: string;
    formValues: null | any;
    file: AppointmentS3File;
  }[];            // 表單列表
  files: AppointmentS3File[];            // 檔案列表
  updateTime?: string | null;      // 更新時間
  createTime: string;      // 建立時間
}

/**
 * API 回應格式
 * @example
 * {
 *   "isSuccess": true,
 *   "message": "",
 *   "data": [AppointmentDetail]
 * }
 */
export interface ApiResponse<T> {
  isSuccess: boolean;      // API是否成功
  message: string;         // 訊息
  data: T;                 // 回應資料
}

/**
 * 預約查詢回應
 * @example
 * {
 *   "isSuccess": true,
 *   "message": "",
 *   "data": [
 *     {
 *       "id": "02316bea-d3d3-4e0f-b354-e526e127bd84",
 *       "ownerName": "飼主A",
 *       ...
 *     }
 *   ]
 * }
 */
export interface AppointmentSearchResponse extends ApiResponse<AppointmentDetail[]> {}
