(function setupBookTestImposibleV2OfflineApp(global) {
  const defaultRuntimeApi = global.BookTestImposibleV2RuntimeManifest
    || (typeof require === "function" ? require("./bookTestImposibleV2RuntimeManifest.js") : null);
  const defaultPreparationApi = global.BookTestImposibleV2OfflinePreparation
    || (typeof require === "function" ? require("./bookTestImposibleV2OfflinePreparation.js") : null);

  function isPreparableBook(book) {
    return Boolean(book && typeof book.runtimeManifest === "string" && book.runtimeManifest.trim());
  }

  function createOfflineApp(options = {}) {
    const fetchJson = options.fetchJson || (async url => {
      const response = await global.fetch(url);
      if (!response.ok) throw new Error(`No se pudo cargar ${url}.`);
      return response.json();
    });
    const runtimeApi = options.runtimeApi || defaultRuntimeApi;
    const preparationService = options.preparationService
      || (options.preparationApi || defaultPreparationApi)?.createOfflinePreparationService();
    const booksIndexUrl = options.booksIndexUrl || "../books/index.json";

    async function listPreparableBooks() {
      const index = await fetchJson(booksIndexUrl);
      return Array.isArray(index?.books) ? index.books.filter(isPreparableBook) : [];
    }

    async function prepareBook(book) {
      if (!isPreparableBook(book)) throw new Error("El libro no tiene runtime manifest disponible.");
      if (!runtimeApi || typeof runtimeApi.loadRuntimeManifest !== "function") {
        throw new Error("No está disponible el cargador del runtime manifest.");
      }
      if (!preparationService || typeof preparationService.prepare !== "function") {
        throw new Error("No está disponible la preparación offline.");
      }
      const manifest = await runtimeApi.loadRuntimeManifest(book, fetchJson);
      return preparationService.prepare(book, manifest);
    }

    return { listPreparableBooks, prepareBook };
  }

  const app = createOfflineApp();

  async function openPreparationModal() {
    const popupBody = global.document?.getElementById("popupBody");
    const popupModal = global.document?.getElementById("popupModal");
    if (!popupBody || !popupModal) return;

    popupBody.classList.remove("routine-help-flow", "update-flow");
    popupBody.classList.add("offline-preparation-flow");
    popupBody.innerHTML = '<h3>Preparación offline</h3><p id="offlinePreparationStatus">Cargando libros…</p>';
    popupModal.classList.remove("hidden");

    try {
      const books = await app.listPreparableBooks();
      popupBody.innerHTML = `
        <h3>Preparación offline</h3>
        <div class="offline-preparation-form">
          <label>Libro: <select id="offlinePreparationBook"></select></label>
          <button type="button" id="offlinePreparationSubmit" class="button-primary">Preparar libro</button>
          <p id="offlinePreparationStatus" role="status">Seleccioná un libro para preparar.</p>
        </div>`;
      const select = popupBody.querySelector("#offlinePreparationBook");
      const button = popupBody.querySelector("#offlinePreparationSubmit");
      const status = popupBody.querySelector("#offlinePreparationStatus");
      books.forEach(book => {
        const option = global.document.createElement("option");
        option.value = book.bookId;
        option.textContent = book.title || book.bookId;
        select.appendChild(option);
      });
      button.disabled = books.length === 0;
      if (!books.length) status.textContent = "No hay libros disponibles para preparación offline.";

      button.addEventListener("click", async () => {
        const book = books.find(candidate => candidate.bookId === select.value);
        if (!book) return;
        button.disabled = true;
        status.textContent = "Preparando libro…";
        try {
          const result = await app.prepareBook(book);
          status.textContent = result.ready === true
            ? `Libro listo para uso offline (${result.verifiedCount} assets verificados)`
            : "La preparación offline no pudo completarse.";
        } catch (error) {
          console.error("Error preparando el libro para uso offline:", error);
          status.textContent = `No se pudo preparar el libro: ${error.message}`;
        } finally {
          button.disabled = false;
        }
      });
    } catch (error) {
      console.error("Error cargando los libros para preparación offline:", error);
      popupBody.innerHTML = "<h3>Preparación offline</h3><p></p>";
      popupBody.querySelector("p").textContent = `No se pudieron cargar los libros: ${error.message}`;
    }
  }

  const api = { isPreparableBook, createOfflineApp, openPreparationModal };
  global.BookTestImposibleV2OfflineApp = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
