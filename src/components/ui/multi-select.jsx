// A basic placeholder for a multi-select component.
// In a real app, you would use a library like 'react-select' or a custom component.
export const MultiSelect = ({ options, selected, onChange }) => {
  const handleSelect = (optionValue) => {
    const newSelected = selected?.includes(optionValue)
      ? selected.filter((item) => item !== optionValue)
      : [...(selected || []), optionValue];
    onChange(newSelected);
  };

  return (
    <div className="p-2 border rounded-md flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => handleSelect(option.value)}
          className={`px-3 py-1 rounded-full text-sm ${
            selected?.includes(option.value)
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
