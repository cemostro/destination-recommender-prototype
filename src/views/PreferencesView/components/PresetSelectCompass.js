import React, { useState } from 'react';
import Select, { components } from 'react-select';
import "../../../styles/PresetSelect.css";

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
      <img
        src={data.image}
        alt={data.label}
        style={{ width: '30px', height: '30px', marginRight: '10px', flexShrink: 0, objectFit: 'contain' }}
      />
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
      <img
        src={data.image}
        alt={data.label}
        style={{ width: '40px', height: '40px', marginRight: '10px', flexShrink: 0, objectFit: 'contain' }}
      />
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div className="option-title" style={{ margin: 0 }}>{data.label}</div>
        <div className="option-description">{data.description}</div>
      </div>
    </div>
  );
};

// Custom ValueContainer component
const CustomValueContainer = ({ children, ...props }) => {
  const {handleOpenChange} = props.selectProps;
  const { getValue } = props;
  const selectedValue = getValue();
  return (
    <components.ValueContainer {...props}>
      <div onClick={handleOpenChange}>
        {selectedValue.length > 0 ? <CustomValue {...props} data={selectedValue[0]} /> : children}
      </div>
    </components.ValueContainer>
  );
};

const PresetSelectCompass = ({ label, value, onChange, onSurprise }) => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCloseMenu = () => setIsMenuOpen(false)
  const handleOpenMenu = () => setIsMenuOpen(true)

  const handleOpenChange = (e) => {
    setIsMenuOpen(!isMenuOpen);
  }

  const options = [
    {
      value: 'custom',
      label: 'Custom Mode',
      description: 'Create my own journey',
      image: process.env.PUBLIC_URL + 'images/user.png',
      backgroundColor: '#F8D7DA',
    },
    {
      value: 'personalized',
      label: 'Personalized Mode',
      description: 'What suits me best',
      image: process.env.PUBLIC_URL + 'images/user.png',
      backgroundColor: '#D1D2FB',
    },
    {
      value: 'adventurous-hidden',
      label: 'Adventurous & Hidden',
      description: 'Offbeat thrills',
      image: process.env.PUBLIC_URL + 'images/user.png',
      backgroundColor: '#D1D2FB',
    },
    {
      value: 'relaxing-popular',
      label: 'Relaxing & Popular',
      description: 'Iconic hiking or extreme travel',
      image: process.env.PUBLIC_URL + 'images/landmark.png',
      backgroundColor: '#C0F3EC',
    },
    {
      value: 'adventurous-popular',
      label: 'Adventurous & Popular',
       description: 'Easy mainstream travel',
      image: process.env.PUBLIC_URL + 'images/compass.png',
      backgroundColor: '#FEF0B9',
    },
    {
      value: 'relaxing-hidden',
      label: 'Hidden & Relaxing',
      description: 'Remote and calm',
      image: process.env.PUBLIC_URL + 'images/landmark.png',
      backgroundColor: '#C0F3EC',
    },
  ];

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderRadius: '5px',
      backgroundColor: value ? options.find(option => option.value === value)?.backgroundColor : 'transparent',
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
        options={options.filter(option => option.value !== 'custom')}
        value={options.find((option) => option.value === value)}
        onChange={(selected) => onChange(selected ? selected.value : '')}
        styles={customStyles}
        components={{ Option: CustomOption, SingleValue: CustomValue, ValueContainer: CustomValueContainer }}
        placeholder="Select a journey style"
        isSearchable={false}
        onMenuClose={handleCloseMenu}
        onMenuOpen={handleOpenMenu}
        menuIsOpen={isMenuOpen}
        openMenuOnClick={false}
        handleOpenChange={handleOpenChange}
      />
      <button className="surprise-button" onClick={onSurprise}>
        🎲 Surprise Me
      </button>
    </div>
  );
};


export default PresetSelectCompass;