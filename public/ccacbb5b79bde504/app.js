(function () {
  var gate = document.getElementById("gate");
  var board = document.getElementById("board");
  var form = document.getElementById("gate-form");
  var keyInput = document.getElementById("key");
  var openButton = document.getElementById("open");
  var gateError = document.getElementById("gate-error");
  var leadsEl = document.getElementById("leads");
  var emptyEl = document.getElementById("empty");
  var countEl = document.getElementById("board-count");
  var searchEl = document.getElementById("q");
  var areaEl = document.getElementById("area");
  var webEl = document.getElementById("web");
  var shops = [];

  function showError(message) {
    gateError.hidden = !message;
    gateError.textContent = message || "";
    keyInput.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function bytes(value) {
    var bin = atob(value);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function normalize(value) {
    return value.normalize("NFC").trim();
  }

  function openVault(password, packed) {
    var iterations = packed.iter;
    if (packed.v !== 1 || packed.kdf !== "PBKDF2-SHA256" || iterations < 100000 || iterations > 1000000) {
      return Promise.reject(new Error("This list file is not a vault."));
    }
    var keyBytes = new TextEncoder().encode(password);
    return crypto.subtle.importKey("raw", keyBytes, "PBKDF2", false, ["deriveKey"]).then(function (material) {
      return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: bytes(packed.salt), iterations: iterations, hash: "SHA-256" },
        material,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );
    }).then(function (key) {
      return crypto.subtle.decrypt(
        { name: "AES-GCM", iv: bytes(packed.iv) },
        key,
        bytes(packed.ct)
      );
    }).then(function (plain) {
      return JSON.parse(new TextDecoder().decode(plain));
    });
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function matches(shop) {
    var area = areaEl.value;
    var web = webEl.value;
    var query = searchEl.value.trim().toLowerCase();
    if (area !== "all" && shop.area !== area) return false;
    if (web === "No website" && shop.web !== "No website") return false;
    if (web === "social" && shop.web === "No website") return false;
    if (!query) return true;
    var hay = [shop.biz, shop.ask, shop.city, shop.phone, shop.quote].join(" ").toLowerCase();
    return hay.indexOf(query) !== -1;
  }

  var START_LINK = "https://groundwork-web.com/start/";
  var BOOK_LINK = "https://groundwork-web.com/audit/";

  function scriptBlock(shop) {
    var parts = shop.script || [];
    var body = parts.map(function (part) {
      return '<p class="script-line"><span>' + esc(part.label) + '</span>' + esc(part.text) + '</p>';
    }).join("");
    return (
      '<div class="script">' + body +
        '<div class="actions">' +
          '<button class="btn btn-accent btn-sm" type="button" data-copy="' + esc(START_LINK) + '">Copy start link</button>' +
          '<button class="btn btn-secondary btn-sm" type="button" data-copy="' + esc(BOOK_LINK) + '">Copy booking link</button>' +
        '</div>' +
      '</div>'
    );
  }

  function render() {
    var shown = shops.filter(matches);
    emptyEl.hidden = shown.length !== 0;
    countEl.textContent = shown.length + " of " + shops.length + " shops. Houston area is first.";
    leadsEl.innerHTML = shown.map(function (shop) {
      var who = shop.ask ? "Ask for " + shop.ask : "Ask for the owner";
      return (
        '<article class="shop">' +
          '<div><h2>' + esc(shop.biz) + '</h2><p class="who">' + esc(who) + '</p></div>' +
          '<p class="meta"><span>' + esc(shop.phone) + '</span><span>' + esc(shop.city) + '</span><span>' +
            esc(Number(shop.rating).toFixed(1)) + ' (' + esc(shop.n) + ')</span><span>' + esc(shop.web) + '</span></p>' +
          '<div class="actions">' +
            '<a class="btn btn-accent btn-sm" href="tel:' + esc(String(shop.phone).replace(/[^\d+]/g, "")) + '">Call</a>' +
          '</div>' +
          scriptBlock(shop) +
        '</article>'
      );
    }).join("");
  }

  function reveal() {
    gate.hidden = true;
    board.hidden = false;
    document.title = "Detailer call list";
    render();
    searchEl.focus();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var password = normalize(keyInput.value);
    if (password.length < 12) {
      showError("The access key is at least 12 characters.");
      return;
    }
    showError("");
    openButton.disabled = true;
    openButton.textContent = "Opening…";
    fetch("vault.json", { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("load");
        return response.json();
      })
      .then(function (packed) { return openVault(password, packed); })
      .then(function (rows) {
        if (!Array.isArray(rows)) throw new Error("shape");
        shops = rows;
        reveal();
      })
      .catch(function (error) {
        openButton.disabled = false;
        openButton.textContent = "Open";
        if (error && error.name === "OperationError") {
          showError("That key does not open this list.");
        } else if (error && error.message === "load") {
          showError("The list file did not load.");
        } else {
          showError("That key does not open this list.");
        }
      });
  });

  leadsEl.addEventListener("click", function (event) {
    var button = event.target.closest("[data-copy]");
    if (!button) return;
    var label = button.textContent;
    navigator.clipboard.writeText(button.getAttribute("data-copy")).then(function () {
      button.textContent = "Copied";
      setTimeout(function () { button.textContent = label; }, 1500);
    });
  });

  [searchEl, areaEl, webEl].forEach(function (el) {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });
})();
