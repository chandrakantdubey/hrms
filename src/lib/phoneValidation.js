/**
 * Validates if a phone number is a valid Indian mobile number
 * @param {string} phoneNumber - The phone number to validate
 * @returns {boolean} - True if valid Indian mobile number
 */
export const isValidIndianPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return false;

  // Handle different input formats from react-phone-input-2
  let cleanNumber = '';

  // If phoneNumber is an object (some versions return objects), extract the value
  if (typeof phoneNumber === 'object' && phoneNumber.value) {
    cleanNumber = phoneNumber.value;
  } else if (typeof phoneNumber === 'string') {
    cleanNumber = phoneNumber;
  } else {
    return false;
  }

  // Remove all non-digit characters except +
  cleanNumber = cleanNumber.replace(/[^\d+]/g, '');

  // Check for international format with +91
  if (cleanNumber.startsWith('+91')) {
    const numberWithoutCountry = cleanNumber.substring(3);
    return isValidIndianMobile(numberWithoutCountry);
  }

  // Check for 91 prefix without +
  if (cleanNumber.startsWith('91') && cleanNumber.length === 12) {
    const numberWithoutCountry = cleanNumber.substring(2);
    return isValidIndianMobile(numberWithoutCountry);
  }

  // Check for 0 prefix (landline format)
  if (cleanNumber.startsWith('0')) {
    return isValidIndianLandline(cleanNumber);
  }

  // Check for 10-digit mobile number without prefix
  return isValidIndianMobile(cleanNumber);
};

/**
 * Validates Indian mobile numbers (10 digits)
 * Valid prefixes: 6,7,8,9 followed by 9 digits
 */
const isValidIndianMobile = (number) => {
  // Remove any non-digit characters that might remain
  const cleanNumber = number.replace(/\D/g, '');

  // Must be exactly 10 digits
  if (cleanNumber.length !== 10) {
    return false;
  }

  // Must start with 6, 7, 8, or 9
  const mobileRegex = /^[6-9]/;
  return mobileRegex.test(cleanNumber);
};

/**
 * Validates Indian landline numbers with 0 prefix
 * Format: 0[2-9]XXXXXXX (7-8 digits after 0)
 */
const isValidIndianLandline = (number) => {
  // Remove any non-digit characters
  const cleanNumber = number.replace(/\D/g, '');

  // STD codes are 2-4 digits, followed by 6-8 digit numbers
  const landlineRegex = /^0[2-9]\d{1,3}\d{6,8}$/;
  return landlineRegex.test(cleanNumber);
};

/**
 * Formats phone number for display
 * @param {string} phoneNumber - Raw phone number
 * @returns {string} - Formatted phone number
 */
export const formatIndianPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';

  const cleanNumber = phoneNumber.replace(/[^\d]/g, '');

  // If it starts with 91, format as +91 XXXXX XXXXX
  if (cleanNumber.startsWith('91') && cleanNumber.length === 12) {
    return `+91 ${cleanNumber.substring(2, 7)} ${cleanNumber.substring(7)}`;
  }

  // If it's a 10-digit mobile number, format as XXXXX XXXXX
  if (cleanNumber.length === 10 && /^[6-9]/.test(cleanNumber)) {
    return `${cleanNumber.substring(0, 5)} ${cleanNumber.substring(5)}`;
  }

  // Return as is for landlines or other formats
  return phoneNumber;
};
