(function setupBookTestImposibleCanonical(global) {
  const PAGE_009_CANONICAL_SAY_LINES = [
    "ESTE ES EL RELATO DE ALGO QUE SUCEDIÓ HACE MUCHO TIEMPO,",
    "CUANDO TU ABUELO ERA UN NIÑO. ES UNA HIS-TORIA;",
    "HIS-TORIA MUY IMPORTANTE PORQUE MUESTRA COMO:",
    "EMPEZARON TODAS LAS IDAS Y VENIDAS ENTRE NUESTRO",
    "MUNDO Y EL DE NARNIA.",
    "EN AQUELLOS TIEMPOS SHERLOCK HOLMES VIVÍA",
    "AUN EN LA CALLE BAKER Y LOS BASTABLE BUSCABAN",
    "TESOROS EN LEWISHAM ROAD. EN AQUELLOS TIEM-POS",
    "TIEM-POS, LOS NIÑOS TENÍAN QUE LLEVAR UN RÍGIDO CUELLO",
    "ALMIDONADO A DIARIO, Y LAS ESCUELAS ERAN POR",
    "LO GENERAL MAS DESAGRADABLES QUE HOY EN DÍA.",
    "AUNQUE LAS COMIDAS ERAN MEJORES; Y EN CUANTO",
    "A LOS DULCES, ¡NO QUIERO NI CONTARLE LO BARATOS",
    "Y DELICIOSOS QUE ERAN, PORQUE SOLO CONSEGUIRÍA",
    "QUE SE TE HICIERA LA BOCA AGUA EN VANO! Y EN ESA",
    "ÉPOCA VIVÍA EN LONDRES UNA NIÑA LLAMADA POLLY",
    "PLUMMER.",
  ];

  function normalizeForHash(text) {
    return String(text ?? "")
      .replace(/\r\n/g, "\n")
      .trim();
  }

  function hashStringFNV1a(str) {
    const input = String(str ?? "");
    let hash = 0x811c9dc5;

    for (let i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }

    return (hash >>> 0).toString(16).toUpperCase().padStart(8, "0");
  }

  function buildPageHash(sayLines) {
    const joined = Array.isArray(sayLines) ? sayLines.join("\n") : "";
    return hashStringFNV1a(normalizeForHash(joined));
  }

  function buildWindowHash(windowLines) {
    const joined = Array.isArray(windowLines) ? windowLines.join("\n") : "";
    return hashStringFNV1a(normalizeForHash(joined));
  }

  function buildLineHash(line) {
    return hashStringFNV1a(normalizeForHash(line));
  }

  function resolveSayWindow(sayLines, selectedLine) {
    const safeSelectedLine = Number.isInteger(selectedLine) ? selectedLine : 1;
    const startIndex = Math.max(0, safeSelectedLine - 1);
    return (Array.isArray(sayLines) ? sayLines : []).slice(startIndex, startIndex + 4);
  }

  function getTpCanonicalPage009SayLines() {
    return PAGE_009_CANONICAL_SAY_LINES.slice();
  }

  global.BookTestImposibleCanonical = {
    normalizeForHash,
    hashStringFNV1a,
    buildPageHash,
    buildWindowHash,
    buildLineHash,
    resolveSayWindow,
    getTpCanonicalPage009SayLines,
  };
})(window);