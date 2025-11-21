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
import { DatePickerComponent } from "@/components/ui/date-picker";

const INITIAL_STATE = {
  date: undefined,
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
          date: new Date(attendanceData.date),
        });
      } else {
        setFormData(INITIAL_STATE);
      }
    } else {
      // Reset when dialog closes
      setFormData(INITIAL_STATE);
    }
  }, [open, attendanceData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, date }));
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

    // Format date for API
    const formatDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    };

    const submissionData = {
      ...formData,
      date: formatDate(formData.date),
    };

    onSubmit(submissionData);
  };

  const showCheckIn = formData.type === "check_in_correction" || formData.type === "full_day";
  const showCheckOut = formData.type === "check_out_correction" || formData.type === "full_day";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Regularize Attendance</DialogTitle>
          <DialogDescription>
            Submit a request to correct your attendance record.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <DatePickerComponent
                selected={formData.date}
                onChange={handleDateChange}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select date"
                className="col-span-3"
                disabled={!!attendanceData}
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
