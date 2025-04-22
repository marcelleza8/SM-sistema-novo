export default function usePhoneNumber() {
  const valid = (phoneNumber, defaultDDI = "55") => {
    const phone = phoneNumber.replace(/\D/g, "");
    const len = phone.length;

    if (len < 10 || len > defaultDDI.length + 11) return false;

    // já tem DDI (DDI + DDD + subscriber = >11 dígitos)
    if (len > 11) {
      if (phone.startsWith(defaultDDI)) return phone;
      return defaultDDI + phone;
    }

    // sem DDI (<=11 dígitos)
    // 10 dígitos = DDD(2) + 8 dígitos → inserir "9"
    if (len === 10) {
      const withNine = phone.slice(0, 2) + "9" + phone.slice(2);
      return defaultDDI + withNine;
    }

    // 11 dígitos = DDD(2) + 9 dígitos
    if (len === 11) {
      return defaultDDI + phone;
    }

    return false;
  };

  return { valid };
}
