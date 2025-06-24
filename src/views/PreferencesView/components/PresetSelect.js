import React from 'react';
import Select, { components, ValueContainerProps } from 'react-select';
import "../../../styles/PresetSelect.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBagShopping } from '@fortawesome/free-solid-svg-icons';
import { ValueContainer } from 'react-select/animated';

const CustomValue = (props) => {
  const { data } = props;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: '5px 10px',
        backgroundColor: data.backgroundColor,
        borderRadius: '5px',
      }}
    >
      <FontAwesomeIcon icon={data.icon} style={{ width: '30px', height: '30px', marginRight: '10px', color: '#2c3e50' }} />
      <div style={{ flex: 1 }}>
        <div className="option-title">{data.label}</div>
        {/* <div className="option-description">{data.description}</div> */}
      </div>
    </div>
  );
};

// Custom Option component
const CustomOption = (props) => {
  const { innerProps, innerRef, data } = props;
  return (
    <div
      ref={innerRef}
      {...innerProps}
      className="custom-option"
      style={{ display: 'flex', alignItems: 'center', padding: '10px', backgroundColor: data.backgroundColor }}
    >
      <FontAwesomeIcon icon={data.icon} style={{ width: '40px', height: '40px', marginRight: '10px', color: '#2c3e50' }} />
      <div>
        <div className="option-title">{data.label}</div>
        <div className="option-description">{data.description}</div>
      </div>
    </div>
  );
};

// Custom ValueContainer component
const CustomValueContainer = ({ children, ...props }) => {
  const { getValue } = props;
  const selectedValue = getValue();
  return (
    <components.ValueContainer {...props}>
      {selectedValue.length > 0 ? <CustomValue {...props} data={selectedValue[0]} /> : children}
    </components.ValueContainer>
  );
};

const PresetSelect = ({ label, value, onChange, className }) => {

    const options = [
    {
      value: 'personalized',
      label: 'Personalized Mode',
      description: 'What suits me best',
      icon: faBagShopping,
      backgroundColor: '#D1D2FB',
    },
    {
      value: 'explorer',
      label: 'Explorer Mode',
      description: 'Take me somewhere unexpected',
      icon: faBagShopping,
      backgroundColor: '#FEF0B9',
    },
    {
      value: 'classic',
      label: 'Classic Mode',
      description: 'Show me the favourites',
      icon: faBagShopping,
      backgroundColor: '#C0F3EC',
    },
  ];

  console.log(value);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderRadius: '5px',
      backgroundColor: value ? options.find(option => option.value === value).backgroundColor : 'transparent',
      boxShadow: 'none',
      '&:hover': { borderColor: '#2980b9' },
      minHeight: '30px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? state.data.backgroundColor : 'transparent',
      color: state.isSelected ? '#ffffff' : '#2c3e50',
      '&:hover': { backgroundColor: '#e0f7fa' },
      padding: '5px 10px',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#2c3e50',
      padding: 0,
      width: '100%',
    }),
    valueContainer: (provided) => ({
      ...provided,
      // padding: '5px 10px',
      width: '100%',
    }),

    indicatorSeparator: () => ({ display: 'none' }),
    indicatorsContainer: (provided) => ({
      ...provided,
      padding: '5px',
    }),
  };

  return (
    <div className={"select-react-select"}>
      {label && <label className="form-label">{label}</label>}
      <Select
        options={options}
        value={options.find((option) => option.value === value)}
        onChange={(selected) => onChange(selected ? selected.value : '')}
        styles={customStyles}
        components={{ Option: CustomOption, SingleValue: CustomValue, ValueContainer: CustomValueContainer }}
        placeholder="Select a journey style"
        isSearchable={false}
      />
    </div>
  );
};


export default PresetSelect;