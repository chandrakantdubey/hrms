import api from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const uploadAttachment = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api
    .post("/attachments", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
};

export const getAttachmentById = (attachmentId) =>
  api.get(`/attachments/${attachmentId}`).then((res) => res.data);

export const useUploadAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadAttachment,
    onSuccess: () => {
      // Optional: Invalidate a related query if you have one
      // queryClient.invalidateQueries({ queryKey: ['some', 'related', 'data'] });
    },
  });
};

export const useAttachmentById = (attachmentId) =>
  useQuery({
    queryKey: ["attachments", attachmentId],
    queryFn: () => {
      if (!attachmentId) throw new Error("attachmentId is required");
      return getAttachmentById(attachmentId);
    },
    enabled: !!attachmentId,
  });
