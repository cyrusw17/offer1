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
  var tab = "todo";
  var calls = {};
  var STORE = "gw_call_board_v1";

  function loadBoard() {
    try {
      calls = JSON.parse(localStorage.getItem(STORE) || "{}") || {};
    } catch (error) {
      calls = {};
    }
  }

  function saveBoard() {
    try {
      localStorage.setItem(STORE, JSON.stringify(calls));
    } catch (error) {}
  }

  function shopId(shop) {
    var digits = String(shop.phone || "").replace(/\D/g, "");
    return digits || shop.biz;
  }

  function record(shop) {
    var id = shopId(shop);
    if (!calls[id]) calls[id] = { status: "todo", notes: "" };
    if (!calls[id].status) calls[id].status = "todo";
    if (calls[id].notes == null) calls[id].notes = "";
    return calls[id];
  }

  function setStatus(id, status) {
    if (!calls[id]) calls[id] = { status: status, notes: "" };
    calls[id].status = status;
    saveBoard();
    render();
  }

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
    if ((record(shop).status || "todo") !== tab) return false;
    var area = areaEl.value;
    var web = webEl.value;
    var query = searchEl.value.trim().toLowerCase();
    if (area !== "all" && shop.area !== area) return false;
    if (web === "No website" && shop.web !== "No website") return false;
    if (web === "social" && shop.web === "No website") return false;
    if (!query) return true;
    var hay = [shop.biz, shop.ask, shop.city, shop.phone, shop.quote, record(shop).notes].join(" ").toLowerCase();
    return hay.indexOf(query) !== -1;
  }

  function fillAreas() {
    var seen = {};
    shops.forEach(function (shop) {
      if (shop.area) seen[shop.area] = true;
    });
    var current = areaEl.value || "all";
    var names = Object.keys(seen).sort(function (a, b) {
      function rank(name) {
        if (name === "Houston area") return 0;
        if (name === "Other Texas") return 1;
        return 2;
      }
      return rank(a) - rank(b) || a.localeCompare(b);
    });
    areaEl.innerHTML = '<option value="all">All</option>' + names.map(function (name) {
      return '<option value="' + esc(name) + '">' + esc(name) + "</option>";
    }).join("");
    if ([].some.call(areaEl.options, function (option) { return option.value === current; })) {
      areaEl.value = current;
    }
  }

  function refreshTabs() {
    var counts = { todo: 0, done: 0, priority: 0, recall: 0 };
    var labels = {
      todo: "To call",
      done: "Already called",
      priority: "Priority recall",
      recall: "Call again",
    };
    shops.forEach(function (shop) {
      var status = record(shop).status || "todo";
      if (counts[status] != null) counts[status] += 1;
    });
    document.querySelectorAll("[data-tab]").forEach(function (button) {
      var key = button.getAttribute("data-tab");
      button.textContent = labels[key] + " (" + (counts[key] || 0) + ")";
      button.setAttribute("aria-selected", key === tab ? "true" : "false");
    });
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

  function statusButtons(id, status) {
    var buttons = [];
    if (status !== "done") buttons.push(['<button class="btn btn-accent btn-sm" type="button" data-set="done" data-id="' + esc(id) + '">Completed</button>']);
    if (status !== "priority") buttons.push(['<button class="btn btn-secondary btn-sm" type="button" data-set="priority" data-id="' + esc(id) + '">Priority call again</button>']);
    if (status !== "recall") buttons.push(['<button class="btn btn-secondary btn-sm" type="button" data-set="recall" data-id="' + esc(id) + '">Call again</button>']);
    if (status !== "todo") buttons.push(['<button class="btn btn-secondary btn-sm" type="button" data-set="todo" data-id="' + esc(id) + '">Back to to call</button>']);
    return buttons.join("");
  }

  function render() {
    var shown = shops.filter(matches);
    var emptyText = {
      todo: "No shops left on the to-call list.",
      done: "No completed calls yet.",
      priority: "No priority call-agains yet.",
      recall: "No regular call-agains yet.",
    };
    var filteredOut = shops.some(function (shop) { return (record(shop).status || "todo") === tab; }) && !shown.length;
    emptyEl.hidden = shown.length !== 0;
    emptyEl.textContent = filteredOut ? "Nothing matches that filter." : (emptyText[tab] || "Nothing here.");
    countEl.textContent = shown.length + " on this list.";
    refreshTabs();
    leadsEl.innerHTML = shown.map(function (shop) {
      var who = shop.ask ? "Ask for " + shop.ask : "Ask for the owner";
      var id = shopId(shop);
      var item = record(shop);
      return (
        '<article class="shop">' +
          '<div><h2>' + esc(shop.biz) + '</h2><p class="who">' + esc(who) + '</p></div>' +
          '<p class="meta"><span>' + esc(shop.phone) + '</span><span>' + esc(shop.city) + '</span><span>' +
            esc(Number(shop.rating).toFixed(1)) + ' (' + esc(shop.n) + ')</span><span>' + esc(shop.web) + '</span></p>' +
          '<div class="actions">' +
            '<a class="btn btn-accent btn-sm" href="tel:' + esc(String(shop.phone).replace(/[^\d+]/g, "")) + '">Call</a>' +
          '</div>' +
          '<label class="notes">Notes<textarea data-notes="' + esc(id) + '" placeholder="Type notes while you talk. Optional.">' + esc(item.notes) + '</textarea></label>' +
          '<div class="actions">' + statusButtons(id, item.status) + '</div>' +
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
        loadBoard();
        fillAreas();
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
    var statusButton = event.target.closest("[data-set]");
    if (statusButton) {
      setStatus(statusButton.getAttribute("data-id"), statusButton.getAttribute("data-set"));
      return;
    }
    var button = event.target.closest("[data-copy]");
    if (!button) return;
    var label = button.textContent;
    navigator.clipboard.writeText(button.getAttribute("data-copy")).then(function () {
      button.textContent = "Copied";
      setTimeout(function () { button.textContent = label; }, 1500);
    });
  });

  leadsEl.addEventListener("input", function (event) {
    var box = event.target.closest("[data-notes]");
    if (!box) return;
    var id = box.getAttribute("data-notes");
    if (!calls[id]) calls[id] = { status: "todo", notes: "" };
    calls[id].notes = box.value;
    saveBoard();
  });

  document.querySelectorAll("[data-tab]").forEach(function (button) {
    button.addEventListener("click", function () {
      tab = button.getAttribute("data-tab");
      render();
    });
  });

  [searchEl, areaEl, webEl].forEach(function (el) {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });
})();
