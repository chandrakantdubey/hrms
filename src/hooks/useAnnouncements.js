// src/hooks/useAnnouncements.js

import api from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// --- API Functions ---

// 1. Get all announcements with pagination
export const getAnnouncements = ({ page = 1, limit = 10 }) =>
  api
    .get("/announcements", { params: { page, limit } })
    .then((res) => res.data);

// 2. Create a new announcement
export const createAnnouncement = (newAnnouncement) =>
  api.post("/announcements", newAnnouncement).then((res) => res.data);

// 3. Update an existing announcement
export const updateAnnouncement = ({ id, ...updatedData }) =>
  api.put(`/announcements/${id}`, updatedData).then((res) => res.data);

// 4. Get a single announcement by its ID
export const getAnnouncementById = (announcementId) =>
  api.get(`/announcements/${announcementId}`).then((res) => res.data);

// 5. Delete an announcement by its ID
export const deleteAnnouncement = (announcementId) =>
  api.delete(`/announcements/${announcementId}`).then((res) => res.data);

// --- React Query Hooks ---

/**
 * Hook to fetch a paginated list of announcements.
 */
export const useAnnouncements = ({ page = 1, limit = 10 }) =>
  useQuery({
    // The query key includes pagination params to ensure data is refetched on change
    queryKey: ["announcements", { page, limit }],
    queryFn: () => getAnnouncements({ page, limit }),
    keepPreviousData: true, // Provides a smoother UX during pagination
  });

/**
 * Hook to fetch a single announcement by its ID.
 * @param {string|number} announcementId The ID of the announcement.
 */
export const useAnnouncementById = (announcementId) =>
  useQuery({
    queryKey: ["announcements", announcementId],
    queryFn: () => getAnnouncementById(announcementId),
    // This query will only run if an announcementId is provided.
    enabled: !!announcementId,
  });

/**
 * Hook to create a new announcement.
 * Invalidates the main announcements list on success to show the new entry.
 */
export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
};

/**
 * Hook to update an existing announcement.
 * Invalidates the main announcements list and the specific announcement query on success.
 */
export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAnnouncement,
    onSuccess: (data, variables) => {
      // Invalidate the list of all announcements
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      // Also invalidate the specific query for this single announcement
      queryClient.invalidateQueries({
        queryKey: ["announcements", variables.id],
      });
    },
  });
};

/**
 * Hook to delete an announcement.
 * Invalidates the main announcements list on success to remove the entry.
 */
export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
};
