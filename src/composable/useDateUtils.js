import {
  format as dateFnsFormat,
  parseISO,
  formatDistanceToNow,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export function useDateUtils() {
  // Função para formatar a data em um idioma específico
  const formatDate = (dateString, formatString = "dd/MM/yyyy") => {
    if (!dateString.length) {
      return "";
    }
    const date = parseISO(dateString);
    return dateFnsFormat(date, formatString, { locale: ptBR });
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
