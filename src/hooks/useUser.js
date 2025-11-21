import api from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// api functions
export const getDashboardOverview = () =>
  api.get("/dashboard/overview").then((res) => res.data);

export const getUserProfile = () =>
  api.get("/user/profile").then((res) => res.data);

export const getUserPayrolls = () =>
  api.get("/user/payrolls").then((res) => res.data);

export const getUserPayrollById = (payrollId) =>
  api.get(`/user/payrolls/${payrollId}`).then((res) => res.data);

export const getUserReportees = () =>
  api.get("/user/my-reportees").then((res) => res.data);

export const getUserTeam = () =>
  api.get("/user/my-team").then((res) => res.data);

export const postCheckIn = (payload) =>
  api.post("/user/check-in", payload).then((res) => res.data);

export const postCheckOut = (payload) =>
  api.post("/user/check-out", payload).then((res) => res.data);

export const updateProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append("profile_image", file);
  const res = await api.post("/user/profile-picture", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return await res.data;
};

export const getAttendances = ({ page = 1, limit = 10 }) =>
  api
    .get("/attendances", {
      params: { page, limit },
    })
    .then((res) => res.data);

export const fetchUserLeaveRequests = ({ page = 1, limit = 10 }) =>
  api
    .get("/leave-requests", {
      params: { page, limit },
    })
    .then((res) => res.data);

export const createUserLeaveRequest = (data) =>
  api.post("/leave-requests", data).then((res) => res.data);

export const updateUserLeaveRequest = ({ id, ...data }) =>
  api.put(`/leave-requests/${id}`, data).then((res) => res.data);

export const deleteUserLeaveRequest = (requestId) =>
  api.delete(`/leave-requests/${requestId}`).then((res) => res.data);

export const fetchUserAttendanceRequests = () =>
  api.get("/attendance-requests").then((res) => res.data);

export const createUserAttendanceRequest = (data) =>
  api.post("/attendance-requests", data).then((res) => res.data);

export const updateUserAttendanceRequest = ({ requestId, data }) =>
  api.put(`/attendance-requests/${requestId}`, data).then((res) => res.data);

export const deleteUserAttendanceRequest = (requestId) =>
  api.delete(`/attendance-requests/${requestId}`).then((res) => res.data);

// hooks
export const useDashboardOverview = () =>
  useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: getDashboardOverview,
  });

export const useUserProfile = () =>
  useQuery({ queryKey: ["user", "profile"], queryFn: getUserProfile });

export const useUserPayrolls = ({ page = 1, limit = 10 }) =>
  useQuery({
    queryKey: ["user", "payrolls", page, limit],
    queryFn: () => getUserPayrolls({ page, limit }),
    keepPreviousData: true,
  });

export const useUserPayrollById = (payrollId) =>
  useQuery({
    queryKey: ["user", "payrolls", payrollId],
    queryFn: () => {
      if (!payrollId) throw new Error("payrollId is required");
      return getUserPayrollById(payrollId);
    },
    enabled: !!payrollId,
  });

export const useUserReportees = () =>
  useQuery({ queryKey: ["user", "reportees"], queryFn: getUserReportees });

export const useUserTeam = () =>
  useQuery({ queryKey: ["user", "team"], queryFn: getUserTeam });

export const useCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postCheckIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });
};

export const useCheckOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postCheckOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });
};

export const useUpdateProfilePicture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfilePicture,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
};

export const useGetAttendances = ({ page = 1, limit = 10 }) =>
  useQuery({
    queryKey: ["attendances"],
    queryFn: () => getAttendances({ page, limit }),
  });

export const useUserLeaveRequests = ({ page = 1, limit = 10 }) =>
  useQuery({
    queryKey: ["leaveRequests", page, limit],
    queryFn: () => fetchUserLeaveRequests({ page, limit }),
    keepPreviousData: true,
  });

export const useCreateUserLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });
};

export const useUpdateUserLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });
};

export const useDeleteUserLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });
};

export const useUserAttendanceRequests = () =>
  useQuery({
    queryKey: ["userattendanceRequests"],
    queryFn: fetchUserAttendanceRequests,
  });

export const useCreateUserAttendanceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserAttendanceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userattendanceRequests"] });
    },
  });
};

export const useUpdateUserAttendanceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserAttendanceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userattendanceRequests"] });
    },
  });
};

export const useDeleteUserAttendanceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserAttendanceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userattendanceRequests"] });
    },
  });
};
