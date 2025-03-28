import {
  format as dateFnsFormat,
  parseISO,
  formatDistanceToNow,
  addMinutes,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export function useDateUtils() {
  // Função para formatar a data em um idioma específico
  const formatDate = (dateString = null, formatString = "dd/MM/yyyy") => {
    if (!dateString?.length) {
      return "";
    }

    const date = parseISO(dateString.replace(/(.)$/, ""));
    const adjustedDate = addMinutes(date, -180);

    return dateFnsFormat(adjustedDate, formatString, { locale: ptBR });
  };

  // Função para exibir "time ago" em português
  const timeAgo = (dateString) => {
    if (!dateString) {
      return "";
    }
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  };

  return {
    formatDate,
    timeAgo,
  };
}
