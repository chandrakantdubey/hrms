import api from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// --- API Functions ---

// 1. Get all employees with pagination
export const getEmployees = ({ page = 1, limit = 10, search, department_id }) =>
  api
    .get("/employees", {
      // Axios will automatically ignore undefined/null params, which is perfect for us
      params: { page, limit, search, department_id },
    })
    .then((res) => res.data);

// 2. Get a single employee by ID
export const getEmployeeById = (employeeId) =>
  api.get(`/employees/${employeeId}`).then((res) => res.data);

// 2. Delete an employee by ID
export const deleteEmployee = (employeeId) =>
  api.delete(`/employees/${employeeId}`).then((res) => res.data);

// 3. Save a document for an employee
export const saveEmployeeDocument = ({
  employeeId,
  documentTypeId,
  document_id,
}) => {
  return api
    .post(`/employees/${employeeId}/documents/${documentTypeId}`, {
      document_id: document_id,
    })
    .then((res) => res.data);
};

// 4. Get all employee payrolls with filters and pagination
export const getEmployeePayrolls = ({ month, year, page = 1, limit = 10 }) =>
  api
    .get("/employees/payrolls", { params: { month, year, page, limit } })
    .then((res) => res.data);

// 5. Upload a payroll Excel sheet
export const uploadPayrollFile = ({ month, year, file }) => {
  const formData = new FormData();
  formData.append("month", month);
  formData.append("year", year);
  formData.append("file", file);
  return api
    .post("/employees/payrolls/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};

// 6. Import employees from Excel sheet
export const importEmployees = ({ file }) => {
  const formData = new FormData();
  formData.append("file", file);
  return api
    .post("/employees/employees/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};

// 7. Get a single payroll slip (e.g., for downloading)
export const getPayrollById = (payrollId) =>
  api
    .get(`/employees/payrolls/${payrollId}`, { responseType: "blob" }) // Assuming this is for download
    .then((res) => res.data);

// 7. Get all employee leave requests with pagination
export const getLeaveRequests = ({ page = 1, limit = 10 }) =>
  api
    .get("/employees/leave-requests", { params: { page, limit } })
    .then((res) => res.data);

// 8. Approve a leave request
export const approveLeaveRequest = ({ employeeId, requestId }) =>
  api
    .post(`/employees/${employeeId}/leave-requests/${requestId}/approve`)
    .then((res) => res.data);

// 9. Reject a leave request
export const rejectLeaveRequest = ({ employeeId, requestId, reason }) =>
  api
    .post(`/employees/${employeeId}/leave-requests/${requestId}/reject`, {
      reason,
    })
    .then((res) => res.data);

// 10. Get all employee attendance requests with pagination
export const getAttendanceRequests = ({ page = 1, limit = 10 }) =>
  api
    .get("/employees/attendance-requests", { params: { page, limit } })
    .then((res) => res.data);

// 11. Approve an attendance request
export const approveAttendanceRequest = ({ employeeId, requestId }) =>
  api
    .post(`/employees/${employeeId}/attendance-requests/${requestId}/approve`)
    .then((res) => res.data);

// 12. Reject an attendance request
export const rejectAttendanceRequest = ({ employeeId, requestId, reason }) =>
  api
    .post(`/employees/${employeeId}/attendance-requests/${requestId}/reject`, {
      reason,
    })
    .then((res) => res.data);

// 13. Get all employee on leave
export const getEmployeesOnLeave = async ({ department_id, page, limit }) => {
  const params = {
    page,
    limit,
    ...(department_id && { department_id }),
  };

  const response = await api.get("/employees/on-leave", { params });
  return response.data;
};

// --- React Query Hooks ---

export const useEmployees = ({ page = 1, limit = 10, search, department_id }) =>
  useQuery({
    // IMPORTANT: Add search and department_id to the queryKey.
    // This ensures React Query refetches data when they change.
    queryKey: ["employees", { page, limit, search, department_id }],
    queryFn: () => getEmployees({ page, limit, search, department_id }),
    keepPreviousData: true,
  });

export const useEmployeeById = (employeeId) =>
  useQuery({
    queryKey: ["employees", employeeId],
    queryFn: () => getEmployeeById(employeeId),
    enabled: !!employeeId, // Only run query if employeeId is provided
  });

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

export const useSaveEmployeeDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveEmployeeDocument,
    onSuccess: (data, variables) => {
      // Invalidate the specific employee's profile to refetch their documents
      queryClient.invalidateQueries({
        queryKey: ["employees", variables.employeeId],
      });
    },
  });
};

export const useEmployeePayrolls = ({ month, year, page, limit }) =>
  useQuery({
    queryKey: ["payrolls", { month, year, page, limit }],
    queryFn: () => getEmployeePayrolls({ month, year, page, limit }),
    enabled: !!(month && year), // Only run if month and year are selected
  });

export const useUploadPayrollFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadPayrollFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
    },
  });
};

export const useImportEmployees = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importEmployees,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

// Use a mutation for downloading as it's a one-off action
export const useDownloadPayroll = () => {
  return useMutation({ mutationFn: getPayrollById });
};

export const useLeaveRequests = ({ page = 1, limit = 10 }) =>
  useQuery({
    queryKey: ["leaveRequests", { page, limit }],
    queryFn: () => getLeaveRequests({ page, limit }),
    keepPreviousData: true,
  });

export const useApproveLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
    },
  });
};

export const useRejectLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
    },
  });
};

export const useAttendanceRequests = ({ page = 1, limit = 10 }) =>
  useQuery({
    queryKey: ["attendanceRequests", { page, limit }],
    queryFn: () => getAttendanceRequests({ page, limit }),
    keepPreviousData: true,
  });

export const useApproveAttendanceRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveAttendanceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendanceRequests"] });
    },
  });
};

export const useRejectAttendanceRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectAttendanceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendanceRequests"] });
    },
  });
};

// src/hooks/useEmployees.js (Add this code to your existing file)

// --- Step-by-Step Employee Creation API Functions ---

// 1. Create Personal Info (Returns UUID)
export const createEmployeePersonalInfo = (personalInfo) =>
  api.post("/employees/personal-info", personalInfo).then((res) => res.data);

// 2. Add Job Details
export const createEmployeeJobDetails = (jobDetails) =>
  api.post("/employees/job-details", jobDetails).then((res) => res.data);

// 3. Add Contact Info
export const createEmployeeContactInfo = (contactInfo) =>
  api.post("/employees/contact-info", contactInfo).then((res) => res.data);

// 4. Add Bank Info
export const createEmployeeBankInfo = (bankInfo) =>
  api.post("/employees/bank-info", bankInfo).then((res) => res.data);

// 5. Complete Onboarding with Documents
export const completeEmployeeOnboarding = (completionData) =>
  api.post("/employees/complete", completionData).then((res) => res.data);

// --- Employee Profile Update API Functions ---

export const updateEmployeePersonalInfo = ({ employeeId, data }) =>
  api
    .patch(`/employees/${employeeId}/personal-info`, data)
    .then((res) => res.data);

export const updateEmployeeJobDetails = ({ employeeId, data }) =>
  api
    .patch(`/employees/${employeeId}/job-details`, data)
    .then((res) => res.data);

export const updateEmployeeContactInfo = ({ employeeId, data }) =>
  api
    .patch(`/employees/${employeeId}/contact-info`, data)
    .then((res) => res.data);

export const updateEmployeeBankInfo = ({ employeeId, data }) =>
  api.patch(`/employees/${employeeId}/bank-info`, data).then((res) => res.data);

// --- React Query Hooks for Employee Creation ---

/**
 * Hook for step 1 of employee creation.
 * This is the only step that doesn't need to invalidate anything on its own.
 */
export const useCreateEmployeePersonalInfo = () => {
  return useMutation({
    mutationFn: createEmployeePersonalInfo,
  });
};

/**
 * Hook for step 2 of employee creation (Job Details).
 */
export const useCreateEmployeeJobDetails = () => {
  return useMutation({
    mutationFn: createEmployeeJobDetails,
  });
};

/**
 * Hook for step 3 of employee creation (Contact Info).
 */
export const useCreateEmployeeContactInfo = () => {
  return useMutation({
    mutationFn: createEmployeeContactInfo,
  });
};

/**
 * Hook for step 4 of employee creation (Bank Info).
 */
export const useCreateEmployeeBankInfo = () => {
  return useMutation({
    mutationFn: createEmployeeBankInfo,
  });
};

/**
 * Hook for the final step of employee creation.
 * On success, it invalidates the main employee list to show the new employee.
 */
export const useCompleteEmployeeOnboarding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeEmployeeOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

// --- React Query Hooks for Employee Profile Updates ---

/**
 * Hook to update an employee's personal information.
 */
export const useUpdateEmployeePersonalInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEmployeePersonalInfo,
    onSuccess: (data, variables) => {
      // Invalidate the specific employee's data to refetch the updated info.
      queryClient.invalidateQueries({
        queryKey: ["employees", variables.employeeId],
      });
      // Also invalidate the main list in case the name/email changed.
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

/**
 * Hook to update an employee's job details.
 */
export const useUpdateEmployeeJobDetails = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEmployeeJobDetails,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["employees", variables.employeeId],
      });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

/**
 * Hook to update an employee's contact information.
 */
export const useUpdateEmployeeContactInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEmployeeContactInfo,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["employees", variables.employeeId],
      });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

/**
 * Hook to update an employee's bank information.
 */
export const useUpdateEmployeeBankInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEmployeeBankInfo,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["employees", variables.employeeId],
      });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

// employees on leave
export const useEmployeesOnLeave = ({ department_id, page = 1, limit = 10 }) =>
  useQuery({
    queryKey: ["employees-on-leave", { department_id, page, limit }],
    queryFn: () => getEmployeesOnLeave({ department_id, page, limit }),
    enabled: true, // always run, even if department_id is undefined
  });
