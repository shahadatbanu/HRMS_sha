import React, { useEffect, useState } from "react";
import Select from "react-select";

export type Option = {
  value: string;
  label: string;
};

export interface SelectProps {
  options: Option[];
  defaultValue?: Option;
  value?: Option; // allow controlled value
  className?: string;
  styles?: any;
  onChange?: (option: Option | null) => void;
}

const CommonSelect: React.FC<SelectProps> = ({ options, defaultValue, value, className, onChange }) => {
  const [selectedOption, setSelectedOption] = useState<Option | undefined>(defaultValue);

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      minHeight: '38px',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      boxShadow: 'none',
      '&:hover': {
        border: '1px solid #9ca3af'
      }
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f3f4f6' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected ? '#3b82f6' : '#f3f4f6'
      }
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999
    })
  };

  const handleChange = (option: Option | null) => {
    setSelectedOption(option || undefined);
    if (onChange) onChange(option);
  };
  useEffect(() => {
    setSelectedOption(defaultValue || undefined);
  }, [defaultValue])
  
  return (
    <Select
     classNamePrefix="react-select"
      className={className}
      styles={customStyles}
      options={options}
      value={value !== undefined ? value : selectedOption}
      onChange={handleChange}
      placeholder="Select"
    />
  );
};

export default CommonSelect;
