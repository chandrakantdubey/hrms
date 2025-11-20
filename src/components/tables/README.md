# Generic Table Components

This directory contains reusable table components for displaying data with pagination across the HRMS application.

## Components

### GenericTable

A flexible, reusable table component that can display any type of data with pagination support.

#### Props

- `columns` (Array): Array of column definitions
- `data` (Array): Array of data to display
- `pagination` (Object): Pagination information from API
- `onPageChange` (Function): Callback for page changes
- `loading` (Boolean): Loading state
- `emptyMessage` (String): Message to show when no data
- `className` (String): Additional CSS classes
- `pageSize` (Number): Items per page (default: 10)
- `showPagination` (Boolean): Whether to show pagination (default: true)

#### Column Definition

Each column object should have:

```javascript
{
  key: "field_name",           // Field name from data object
  header: "Display Name",      // Header text
  render: (value, row, index) => <Component />, // Optional custom renderer
  width: "100px",              // Optional column width
  headerClassName: "class",    // Optional header CSS classes
  cellClassName: "class"       // Optional cell CSS classes
}
```

#### Pagination Object

Expected pagination format from API:

```javascript
{
  current_page: 1,
  last_page: 5,
  total_record: 50,
  filtered_total_record: 45  // Optional, for filtered results
}
```

### Usage Example

```javascript
import { GenericTable } from "@/components/ui/generic-table";

const columns = [
  {
    key: "name",
    header: "Name",
    render: (value, row) => (
      <div className="font-medium">{value}</div>
    )
  },
  {
    key: "email",
    header: "Email",
    width: "200px"
  },
  {
    key: "status",
    header: "Status",
    render: (value) => (
      <Badge variant={getStatusVariant(value)}>
        {value}
      </Badge>
    )
  }
];

function MyTable() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const { data, isLoading } = useMyData({ page: currentPage, limit: 10 });

  return (
    <GenericTable
      columns={columns}
      data={data?.data?.items || []}
      pagination={data?.data}
      onPageChange={setCurrentPage}
      loading={isLoading}
      emptyMessage="No items found"
    />
  );
}
```

## Specific Table Components

### LeavesTable

Displays leave requests with columns for:
- Leave type (name and code)
- Start/End dates with half-day information
- Reason
- Status badge
- Requestor information
- Approved by information

### AttendanceTable

Displays attendance records with columns for:
- Date
- Check in/out times
- Duration calculation
- Status badge
- Location
- Notes

## Creating New Table Components

1. Create a new file in `src/components/tables/`
2. Import the `GenericTable` component
3. Define your columns array with appropriate renderers
4. Use the appropriate data hook
5. Handle pagination state
6. Export your component

```javascript
import * as React from "react";
import { GenericTable } from "@/components/ui/generic-table";
import { useMyDataHook } from "@/hooks/useMyData";

function MyTable() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const { data, isLoading, error } = useMyDataHook({
    page: currentPage,
    limit: 10,
  });

  const columns = [
    // Define your columns here
  ];

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading data</p>
      </div>
    );
  }

  return (
    <GenericTable
      columns={columns}
      data={data?.data?.items || []}
      pagination={data?.data}
      onPageChange={setCurrentPage}
      loading={isLoading}
      emptyMessage="No data found"
    />
  );
}

export { MyTable };
```

## Styling

The tables use Tailwind CSS classes and follow the existing design system. Key styling features:

- Responsive design with horizontal scrolling on mobile
- Hover effects on table rows
- Loading spinner with animation
- Consistent badge styling for status indicators
- Proper spacing and typography

## Best Practices

1. **Column Width**: Set explicit widths for columns that should be fixed size
2. **Data Formatting**: Use render functions for dates, times, and formatted values
3. **Status Badges**: Use consistent badge variants for similar statuses
4. **Truncation**: Truncate long text with tooltip showing full content
5. **Loading States**: Always handle loading and error states
6. **Empty States**: Provide meaningful empty state messages
7. **Accessibility**: Ensure proper ARIA labels and keyboard navigation

## Performance Considerations

- Use React.memo for table components if they re-render frequently
- Implement virtual scrolling for very large datasets
- Consider pagination limits based on performance requirements
- Use proper query key management for React Query cache optimization