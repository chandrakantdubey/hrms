import api from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Roles Hooks
export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => api.get("/masters/roles").then((res) => res.data),
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newRole) => api.post("/masters/roles", newRole),
    onSuccess: () => queryClient.invalidateQueries(["roles"]),
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedRole) =>
      api.put(`/masters/roles/${updatedRole.id}`, updatedRole),
    onSuccess: () => queryClient.invalidateQueries(["roles"]),
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/masters/roles/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["roles"]),
  });
};

// Permissions Hooks
export const usePermissions = (page, pageSize) => {
  return useQuery({
    queryKey: ["permissions", page, pageSize],
    queryFn: () =>
      api
        .get(`/masters/permissions?page=${page}&limit=${pageSize}`)
        .then((res) => res.data),
  });
};

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newPermission) =>
      api.post("/masters/permissions", newPermission),
    onSuccess: () => queryClient.invalidateQueries(["permissions"]),
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedPermission) =>
      api.put(
        `/masters/permissions/${updatedPermission.id}`,
        updatedPermission
      ),
    onSuccess: () => queryClient.invalidateQueries(["permissions"]),
  });
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/masters/permissions/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["permissions"]),
  });
};

// Companies Hooks
export const useCompanies = (page, pageSize) => {
  return useQuery({
    queryKey: ["companies", page, pageSize],
    queryFn: () =>
      api
        .get(`/masters/companies?page=${page}&limit=${pageSize}`)
        .then((res) => res.data),
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newCompany) => api.post("/masters/companies", newCompany),
    onSuccess: () => queryClient.invalidateQueries(["companies"]),
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedCompany) =>
      api.put(`/masters/companies/${updatedCompany.id}`, updatedCompany),
    onSuccess: () => queryClient.invalidateQueries(["companies"]),
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/masters/companies/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["companies"]),
  });
};

// Departments Hooks
export const useDepartments = (page, pageSize) => {
  return useQuery({
    queryKey: ["departments", page, pageSize],
    queryFn: () =>
      api
        .get(`/masters/departments?page=${page}&limit=${pageSize}`)
        .then((res) => res.data),
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newDepartment) =>
      api.post("/masters/departments", newDepartment),
    onSuccess: () => queryClient.invalidateQueries(["departments"]),
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedDepartment) =>
      api.put(
        `/masters/departments/${updatedDepartment.id}`,
        updatedDepartment
      ),
    onSuccess: () => queryClient.invalidateQueries(["departments"]),
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/masters/departments/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["departments"]),
  });
};

// Designations Hooks
export const useDesignations = (page, pageSize) => {
  return useQuery({
    queryKey: ["designations", page, pageSize],
    queryFn: () =>
      api
        .get(`/masters/designations?page=${page}&limit=${pageSize}`)
        .then((res) => res.data),
  });
};

export const useCreateDesignation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newDesignation) =>
      api.post("/masters/designations", newDesignation),
    onSuccess: () => queryClient.invalidateQueries(["designations"]),
  });
};

export const useUpdateDesignation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedDesignation) =>
      api.put(
        `/masters/designations/${updatedDesignation.id}`,
        updatedDesignation
      ),
    onSuccess: () => queryClient.invalidateQueries(["designations"]),
  });
};

export const useDeleteDesignation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/masters/designations/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["designations"]),
  });
};

// Leave Types Hooks
export const useLeaveTypes = () => {
  return useQuery({
    queryKey: ["leaveTypes"],
    queryFn: () => api.get(`/masters/leave-types`).then((res) => res.data),
  });
};

export const useCreateLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newLeaveType) =>
      api.post("/masters/leave-types", newLeaveType),
    onSuccess: () => queryClient.invalidateQueries(["leaveTypes"]),
  });
};

export const useUpdateLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedLeaveType) =>
      api.put(`/masters/leave-types/${updatedLeaveType.id}`, updatedLeaveType),
    onSuccess: () => queryClient.invalidateQueries(["leaveTypes"]),
  });
};

export const useDeleteLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/masters/leave-types/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["leaveTypes"]),
  });
};

// Holidays Hooks
export const useHolidays = (page, pageSize) => {
  return useQuery({
    queryKey: ["holidays", page, pageSize],
    queryFn: () =>
      api
        .get(`/masters/holidays?page=${page}&limit=${pageSize}`)
        .then((res) => res.data),
  });
};

export const useCreateHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newHoliday) => api.post("/masters/holidays", newHoliday),
    onSuccess: () => queryClient.invalidateQueries(["holidays"]),
  });
};

export const useUpdateHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedHoliday) =>
      api.put(`/masters/holidays/${updatedHoliday.id}`, updatedHoliday),
    onSuccess: () => queryClient.invalidateQueries(["holidays"]),
  });
};

export const useDeleteHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/masters/holidays/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["holidays"]),
  });
};

// Document Types Hooks
export const useDocumentTypes = (page, pageSize) => {
  return useQuery({
    queryKey: ["documentTypes", page, pageSize],
    queryFn: () =>
      api
        .get(`/masters/document-types?page=${page}&limit=${pageSize}`)
        .then((res) => res.data),
  });
};

export const useCreateDocumentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newDocumentType) =>
      api.post("/masters/document-types", newDocumentType),
    onSuccess: () => queryClient.invalidateQueries(["documentTypes"]),
  });
};

export const useUpdateDocumentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedDocumentType) =>
      api.put(
        `/masters/document-types/${updatedDocumentType.id}`,
        updatedDocumentType
      ),
    onSuccess: () => queryClient.invalidateQueries(["documentTypes"]),
  });
};

export const useDeleteDocumentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/masters/document-types/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["documentTypes"]),
  });
};

// Leave Policies Hooks
export const useLeavePolicies = (page, pageSize) => {
  return useQuery({
    queryKey: ["leavePolicies", page, pageSize],
    queryFn: () =>
      api
        .get(`/masters/leave-policies?page=${page}&limit=${pageSize}`)
        .then((res) => res.data),
  });
};

export const useCreateLeavePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newLeavePolicy) =>
      api.post("/masters/leave-policies", newLeavePolicy),
    onSuccess: () => queryClient.invalidateQueries(["leavePolicies"]),
  });
};

export const useUpdateLeavePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedLeavePolicy) =>
      api.put(
        `/masters/leave-policies/${updatedLeavePolicy.id}`,
        updatedLeavePolicy
      ),
    onSuccess: () => queryClient.invalidateQueries(["leavePolicies"]),
  });
};

export const useDeleteLeavePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/masters/leave-policies/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["leavePolicies"]),
  });
};

// Shifts Hooks
export const useShifts = (page, pageSize) => {
  return useQuery({
    queryKey: ["shifts", page, pageSize],
    queryFn: () =>
      api
        .get(`/masters/shifts?page=${page}&limit=${pageSize}`)
        .then((res) => res.data),
  });
};

export const useCreateShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newShift) => api.post("/masters/shifts", newShift),
    onSuccess: () => queryClient.invalidateQueries(["shifts"]),
  });
};

export const useUpdateShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedShift) =>
      api.put(`/masters/shifts/${updatedShift.id}`, updatedShift),
    onSuccess: () => queryClient.invalidateQueries(["shifts"]),
  });
};

export const useDeleteShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/masters/shifts/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["shifts"]),
  });
};

// Permission Groups Hooks
export const usePermissionGroups = (page, pageSize) => {
  return useQuery({
    queryKey: ["permissionGroups", page, pageSize],
    queryFn: () =>
      api
        .get(`/masters/permission-groups?page=${page}&limit=${pageSize}`)
        .then((res) => res.data),
  });
};

export const useCreatePermissionGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newPermissionGroup) =>
      api.post("/masters/permission-groups", newPermissionGroup),
    onSuccess: () => queryClient.invalidateQueries(["permissionGroups"]),
  });
};

export const useUpdatePermissionGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedPermissionGroup) =>
      api.put(
        `/masters/permission-groups/${updatedPermissionGroup.id}`,
        updatedPermissionGroup
      ),
    onSuccess: () => queryClient.invalidateQueries(["permissionGroups"]),
  });
};

export const useDeletePermissionGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/masters/permission-groups/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["permissionGroups"]),
  });
};

// Managers Hooks
export const useManagers = (companyId, departmentId) => {
  return useQuery({
    queryKey: ["managers", { companyId, departmentId }],
    queryFn: () =>
      api
        .get(`/employees`, {
          params: { company_id: companyId, department_id: departmentId },
        })
        .then((res) => res.data),
    enabled: !!companyId && !!departmentId,
  });
};
