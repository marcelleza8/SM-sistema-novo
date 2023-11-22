export default function usePhoneNumber() {
  const valid = (phoneNumber) => {
    const phone_number = phoneNumber.replace(/[^0-9]/gi, "");

    if (phone_number.length >= 10 && phone_number.length <= 13) {
      const regexCountryCode = /^55.+/gi;
      if (regexCountryCode.test(phone_number)) {
        return phone_number.substr(2);
      }

      if (phone_number.length == 10) {
        return phone_number.substr(0, 2) + "9" + phone_number.substr(2);
      }
      return phone_number;
    }
    return false;
  };

  return { valid };
}
