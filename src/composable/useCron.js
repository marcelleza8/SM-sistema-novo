/**
 * Composable para manipulação de expressões CRON.
 * Inclui funções para converter expressões CRON em texto humanizado e vice-versa.
 */
export function useCronHumanizer() {
  /**
   * Converte uma expressão CRON em um texto humanizado.
   *
   * @param {string} cronExpression - A expressão CRON no formato "minuto hora dia-do-mês mês dia-da-semana".
   * Exemplo: "*\/15 8-18 * * 1-5"
   *
   * @returns {string} Texto humanizado descrevendo a expressão CRON.
   * Exemplo: "Minuto: a cada 15 minutos começando de 0, Hora: de 8 até 18, Dia do mês: qualquer dia do mês, Mês: qualquer mês, Dia da semana: de segunda-feira até sexta-feira"
   */
  const humanizeCron = (cronExpression) => {
    const [minute, hour, dayOfMonth, month, dayOfWeek] =
      cronExpression.split(" ");

    const months = [
      "janeiro",
      "fevereiro",
      "março",
      "abril",
      "maio",
      "junho",
      "julho",
      "agosto",
      "setembro",
      "outubro",
      "novembro",
      "dezembro",
    ];
    const daysOfWeek = [
      "domingo",
      "segunda-feira",
      "terça-feira",
      "quarta-feira",
      "quinta-feira",
      "sexta-feira",
      "sábado",
    ];

    /**
     * Descreve um campo da expressão CRON de forma humanizada.
     *
     * @param {string} field - Valor do campo (exemplo: "*", "1-5", "*\/15").
     * @param {string} type - Tipo do campo (exemplo: "minuto", "hora").
     * @returns {string} Texto humanizado para o campo especificado.
     */
    const describeField = (field, type) => {
      if (field === "*") return `qualquer ${type}`;
      if (field.includes(","))
        return field
          .split(",")
          .map((f) => describeField(f, type))
          .join(", ");
      if (field.includes("-")) return `de ${field.replace("-", " até ")}`;
      if (field.includes("/"))
        return `a cada ${field.split("/")[1]} ${type}s começando de ${
          field.split("/")[0]
        }`;
      return type === "mês"
        ? months[parseInt(field) - 1]
        : type === "dia da semana"
        ? daysOfWeek[parseInt(field)]
        : field;
    };

    const humanReadable = [
      `Minuto: ${describeField(minute, "minuto")}`,
      `Hora: ${describeField(hour, "hora")}`,
      `Dia do mês: ${describeField(dayOfMonth, "dia do mês")}`,
      `Mês: ${describeField(month, "mês")}`,
      `Dia da semana: ${describeField(dayOfWeek, "dia da semana")}`,
    ];

    return humanReadable.join(", ");
  };

  /**
   * Converte um texto humanizado em uma expressão CRON.
   *
   * @param {string} humanizedText - Texto humanizado no formato gerado por `humanizeCron`.
   * Exemplo: "Minuto: a cada 15 minutos começando de 0, Hora: de 8 até 18, Dia do mês: qualquer dia do mês, Mês: qualquer mês, Dia da semana: de segunda-feira até sexta-feira"
   *
   * @returns {string} A expressão CRON correspondente.
   * Exemplo: "*\/15 8-18 * * 1-5"
   */
  const parseHumanizedToCron = (humanizedText) => {
    /**
     * Converte uma descrição humanizada de um campo para o formato CRON.
     *
     * @param {string} text - Texto humanizado para o campo.
     * @param {string} type - Tipo do campo (exemplo: "minuto", "mês").
     * @param {string[]} [map] - (Opcional) Mapa de nomes para valores numéricos (exemplo: meses ou dias da semana).
     * @returns {string} Valor do campo no formato CRON.
     */
    const parseField = (text, type, map) => {
      if (text.includes("qualquer")) return "*";
      if (text.includes("a cada")) {
        const [, step, start] =
          text.match(/a cada (\d+) .* começando de (\d+)/) || [];
        return `${start}/${step}`;
      }
      if (text.includes("até")) {
        const [start, end] = text.replace("de ", "").split(" até ");
        return `${start}-${end}`;
      }
      if (text.includes(",")) {
        return text
          .split(", ")
          .map((t) => parseField(t, type, map))
          .join(",");
      }
      return map ? `${map.indexOf(text) + 1}` : text;
    };

    const fields = humanizedText.split(", ");
    const minute = parseField(fields[0].replace("Minuto: ", ""), "minuto");
    const hour = parseField(fields[1].replace("Hora: ", ""), "hora");
    const dayOfMonth = parseField(
      fields[2].replace("Dia do mês: ", ""),
      "dia do mês"
    );
    const month = parseField(fields[3].replace("Mês: ", ""), "mês", [
      "janeiro",
      "fevereiro",
      "março",
      "abril",
      "maio",
      "junho",
      "julho",
      "agosto",
      "setembro",
      "outubro",
      "novembro",
      "dezembro",
    ]);
    const dayOfWeek = parseField(
      fields[4].replace("Dia da semana: ", ""),
      "dia da semana",
      [
        "domingo",
        "segunda-feira",
        "terça-feira",
        "quarta-feira",
        "quinta-feira",
        "sexta-feira",
        "sábado",
      ]
    );

    return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
  };

  return { humanizeCron, parseHumanizedToCron };
}
