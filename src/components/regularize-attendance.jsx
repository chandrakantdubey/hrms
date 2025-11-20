import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "./ui/loader"; // Or a spinner icon

const INITIAL_STATE = {
  date: "",
  type: "check_in_correction",
  new_check_in: null,
  new_check_out: null,
  reason: "",
};

export function RegularizeAttendance({
  open,
  onOpenChange,
  attendanceData,
  onSubmit,
  isSubmitting,
}) {
  const [formData, setFormData] = useState(INITIAL_STATE);

  // When the dialog opens, pre-fill the form based on the provided data
  useEffect(() => {
    if (open) {
      if (attendanceData) {
        // Pre-fill if a specific attendance record was clicked
        setFormData({
          ...INITIAL_STATE,
          date: new Date(attendanceData.date).toISOString().split("T")[0], // Format to YYYY-MM-DD
        });
      } else {
        // Reset for the generic "Regularize" button
        setFormData(INITIAL_STATE);
      }
    }
  }, [open, attendanceData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      type: value,
      new_check_in: null,
      new_check_out: null,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.date || !formData.reason) {
      toast.error("Please fill in the date and reason.");
      return;
    }
    // Clean up null values before submitting
    const payload = Object.fromEntries(
      Object.entries(formData).filter(
        ([, value]) => value != null && value !== ""
      )
    );
    onSubmit(payload);
  };

  const showCheckIn = ["check_in_correction", "full_day"].includes(
    formData.type
  );
  const showCheckOut = ["check_out_correction", "full_day"].includes(
    formData.type
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Regularize Attendance</DialogTitle>
            <DialogDescription>
              Submit a request to correct your attendance record.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                disabled={!!attendanceData} // Disable if a specific record was selected
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                onValueChange={handleSelectChange}
                defaultValue={formData.type}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="check_in_correction">
                    Check-in Correction
                  </SelectItem>
                  <SelectItem value="check_out_correction">
                    Check-out Correction
                  </SelectItem>
                  <SelectItem value="full_day">Full Day (Absent)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {showCheckIn && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new_check_in" className="text-right">
                  Check In
                </Label>
                <Input
                  id="new_check_in"
                  name="new_check_in"
                  type="time"
                  onChange={handleChange}
                  className="col-span-3"
                />
              </div>
            )}
            {showCheckOut && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new_check_out" className="text-right">
                  Check Out
                </Label>
                <Input
                  id="new_check_out"
                  name="new_check_out"
                  type="time"
                  onChange={handleChange}
                  className="col-span-3"
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <Textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
