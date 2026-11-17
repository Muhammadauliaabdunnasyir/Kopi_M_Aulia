document.addEventListener("DOMContentLoaded", function () {
  var $ = function (i) {
    return document.getElementById(i);
  };
  // Navigasi mobile
  var tg = $("aulia_toggle"),
    mn = $("aulia_menu");
  if (tg && mn) {
    tg.addEventListener("click", function () {
      mn.classList.toggle("aulia_open");
    });
  }
  // Tombol kembali ke atas
  var top = $("aulia_top");
  if (top) {
    window.addEventListener("scroll", function () {
      top.classList.toggle("aulia_show", window.scrollY > 300);
    });
    top.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  // Pencarian & filter menu
  var search = $("aulia_search"),
    list = $("aulia_menu_list");
  if (search && list) {
    var items = list.querySelectorAll(".aulia_item"),
      btns = document.querySelectorAll(".aulia_filter"),
      empty = $("aulia_empty"),
      cat = "all";
    var apply = function () {
      var q = search.value.trim().toLowerCase(),
        n = 0;
      items.forEach(function (it) {
        var ok =
          it.dataset.name.toLowerCase().indexOf(q) > -1 &&
          (cat === "all" || it.dataset.category === cat);
        it.style.display = ok ? "" : "none";
        if (ok) n++;
      });
      empty.hidden = n > 0;
    };
    search.addEventListener("input", apply);
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) {
          x.classList.remove("aulia_active");
        });
        b.classList.add("aulia_active");
        cat = b.dataset.filter;
        apply();
      });
    });
  }
  // Lightbox galeri
  var lb = $("aulia_lightbox");
  if (lb) {
    var li = $("aulia_lightbox_img"),
      lc = $("aulia_lightbox_cap");
    document.querySelectorAll(".aulia_gallery img").forEach(function (im) {
      im.addEventListener("click", function () {
        li.src = im.src;
        li.alt = im.alt;
        lc.textContent = im.dataset.caption;
        lb.hidden = false;
      });
    });
    var close = function () {
      lb.hidden = true;
    };
    $("aulia_close").addEventListener("click", close);
    lb.addEventListener("click", function (e) {
      if (e.target === lb) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }
  // Validasi form kontak
  var f = $("aulia_form");
  if (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true,
        succ = $("aulia_success");
      succ.hidden = true;
      var rules = [
        [
          "aulia_nama",
          function (v) {
            return v.length >= 3;
          },
          "Nama lengkap wajib diisi (minimal 3 karakter).",
        ],
        [
          "aulia_email",
          function (v) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
          },
          "Format email tidak valid.",
        ],
        [
          "aulia_telp",
          function (v) {
            return /^(\+62|0)[0-9]{8,13}$/.test(v.replace(/[\s-]/g, ""));
          },
          "Nomor telepon tidak valid (contoh: 081234567890).",
        ],
        [
          "aulia_subjek",
          function (v) {
            return v.length >= 3;
          },
          "Subjek wajib diisi.",
        ],
        [
          "aulia_pesan",
          function (v) {
            return v.length >= 10;
          },
          "Isi pesan wajib diisi (minimal 10 karakter).",
        ],
      ];
      rules.forEach(function (r) {
        var el = $(r[0]),
          err = el.nextElementSibling,
          good = r[1](el.value.trim());
        err.textContent = good ? "" : r[2];
        el.classList.toggle("aulia_invalid", !good);
        if (!good) ok = false;
      });
      if (ok) {
        succ.hidden = false;
        f.reset();
      }
    });
  }

  /* ================================================================
   FITUR PEMESANAN & TRANSAKSI — SIMULASI DI BROWSER (tanpa backend)
   Semua class/ID buatan sendiri diawali "aulia_".
   ================================================================ */
  var CART_KEY = "aulia_kopi_cart";
  var MAX_QTY = 20;
  var SIMULATION_NOTE =
    "Ini simulasi untuk tugas kuliah. Pesanan dan pembayaran tidak benar-benar diproses.";
  var money = function (n) {
    return "Rp" + Number(n || 0).toLocaleString("id-ID");
  };
  var esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };
  var makeLineId = function (id, note) {
    return (
      String(id || "") +
      "||" +
      String(note || "")
        .trim()
        .toLowerCase()
    );
  };

  function loadCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      var data = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(data)) return [];
      return data
        .filter(function (x) {
          return (
            x &&
            typeof x.name === "string" &&
            typeof x.price === "number" &&
            isFinite(x.price) &&
            typeof x.qty === "number" &&
            x.qty > 0
          );
        })
        .map(function (x) {
          x.id = String(x.id || "");
          x.image = String(x.image || "");
          x.note = String(x.note || "");
          x.qty = Math.min(MAX_QTY, Math.floor(x.qty));
          x.key = makeLineId(x.id, x.note);
          return x;
        });
    } catch (e) {
      return [];
    }
  }
  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {}
  }
  var cart = loadCart();
  function cartCount() {
    return cart.reduce(function (s, x) {
      return s + x.qty;
    }, 0);
  }
  function cartTotal() {
    return cart.reduce(function (s, x) {
      return s + x.qty * x.price;
    }, 0);
  }

  /* ---------- Suntikan UI ke body ---------- */
  function injectUI() {
    var host = document.createElement("div");
    host.innerHTML =
      `
<button id="aulia_fab_cart" class="aulia_fab_cart" type="button" aria-label="Buka keranjang pesanan">🛒<span id="aulia_cart_badge" class="aulia_cart_badge" hidden>0</span></button>

<div id="aulia_cart_layer" class="aulia_drawer_layer" hidden>
<div class="aulia_drawer_scrim" data-aulia-close="cart"></div>
<aside id="aulia_cart_panel" class="aulia_drawer" role="dialog" aria-modal="true" aria-labelledby="aulia_cart_title">
<div class="aulia_drawer_header"><h2 id="aulia_cart_title">Keranjang Pesanan</h2><button id="aulia_cart_close" class="aulia_cart_close" type="button" aria-label="Tutup keranjang">✕</button></div>
<div class="aulia_drawer_body">
<div id="aulia_cart_items" class="aulia_cart_items"></div>
<div id="aulia_cart_empty" class="aulia_cart_empty_state" hidden><p>Keranjang kamu masih kosong. Yuk pilih menu favoritmu dulu!</p><a href="menu.html" class="aulia_button">Lihat Menu</a></div>
</div>
<div class="aulia_drawer_footer"><div class="aulia_cart_total_row"><span>Total</span><span id="aulia_cart_total">Rp0</span></div><button id="aulia_cart_checkout" class="aulia_button" type="button" disabled>Lanjut ke Pembayaran</button></div>
</aside>
</div>

<div id="aulia_detail_modal" class="aulia_modal" hidden>
<div class="aulia_modal_backdrop" data-aulia-close="detail"></div>
<div class="aulia_dialog" role="dialog" aria-modal="true" aria-labelledby="aulia_detail_title">
<button id="aulia_detail_close" class="aulia_modal_close" type="button" aria-label="Tutup detail produk">✕</button>
<h2 id="aulia_detail_title"></h2><p class="aulia_dialog_sub">Detail menu KopiKita</p>
<div class="aulia_detail_grid">
<img id="aulia_detail_image" class="aulia_detail_image" src="" alt="">
<div>
<p id="aulia_detail_desc" class="aulia_detail_desc"></p>
<p id="aulia_detail_price" class="aulia_detail_price"></p>
<div class="aulia_qty"><button id="aulia_detail_minus" type="button" aria-label="Kurangi jumlah">−</button><span id="aulia_detail_qty">1</span><button id="aulia_detail_plus" type="button" aria-label="Tambah jumlah">+</button></div>
<div class="aulia_field"><label for="aulia_detail_note">Catatan (opsional, contoh: less sugar)</label><input id="aulia_detail_note" class="aulia_input" type="text" maxlength="80" placeholder="Contoh: less sugar"></div>
</div>
</div>
<div class="aulia_detail_actions"><span class="aulia_detail_subtotal" id="aulia_detail_subtotal">Rp0</span><button id="aulia_detail_add" class="aulia_button" type="button">Tambah ke Keranjang</button></div>
<p class="aulia_simulation_note">` +
      SIMULATION_NOTE +
      `</p>
</div>
</div>

<div id="aulia_checkout_modal" class="aulia_modal" hidden>
<div class="aulia_modal_backdrop" data-aulia-close="checkout"></div>
<div class="aulia_dialog aulia_dialog_wide" role="dialog" aria-modal="true" aria-labelledby="aulia_checkout_title">
<button id="aulia_co_close" class="aulia_modal_close" type="button" aria-label="Tutup checkout">✕</button>
<h2 id="aulia_checkout_title">Checkout Pesanan</h2><p class="aulia_dialog_sub">Lengkapi data pemesan dan pilih pembayaran.</p>
<p class="aulia_simulation_note">` +
      SIMULATION_NOTE +
      `</p>
<form id="aulia_checkout_form" novalidate>
<div class="aulia_co_fields">
<div class="aulia_field"><label for="aulia_co_name">Nama Pemesan *</label><input id="aulia_co_name" class="aulia_input" type="text" placeholder="Nama lengkap"><small id="aulia_co_name_error" class="aulia_error"></small></div>
<div class="aulia_field"><label for="aulia_co_phone">Nomor HP / WhatsApp *</label><input id="aulia_co_phone" class="aulia_input" type="tel" placeholder="081234567890"><small id="aulia_co_phone_error" class="aulia_error"></small></div>
</div>
<div class="aulia_field"><label>Tipe Pesanan *</label><div class="aulia_radio_group">
<label class="aulia_radio_label"><input id="aulia_co_dinein" type="radio" name="aulia_co_type" value="dinein"> Makan di tempat</label>
<label class="aulia_radio_label"><input id="aulia_co_takeaway" type="radio" name="aulia_co_type" value="takeaway"> Bawa pulang</label>
</div><small id="aulia_co_type_error" class="aulia_error"></small></div>
<div class="aulia_field" id="aulia_co_table_wrap" hidden><label for="aulia_co_table">Nomor Meja *</label><input id="aulia_co_table" class="aulia_input" type="text" placeholder="Contoh: 7" maxlength="6"><small id="aulia_co_table_error" class="aulia_error"></small></div>
<div class="aulia_field"><label for="aulia_co_note">Catatan tambahan (opsional)</label><textarea id="aulia_co_note" class="aulia_input" rows="2" placeholder="Contoh: tanpa es"></textarea></div>
<div class="aulia_field"><label>Metode Pembayaran *</label><div class="aulia_radio_group">
<label class="aulia_radio_label"><input id="aulia_co_cash" type="radio" name="aulia_co_pay" value="cash"> Tunai (Cash)</label>
<label class="aulia_radio_label"><input id="aulia_co_transfer" type="radio" name="aulia_co_pay" value="transfer"> Transfer</label>
</div><small id="aulia_co_pay_error" class="aulia_error"></small></div>
<div id="aulia_co_cash_wrap" hidden><div class="aulia_field"><label for="aulia_co_cash_amount">Uang yang dibayarkan *</label><input id="aulia_co_cash_amount" class="aulia_input" type="number" min="0" step="1000" placeholder="Masukkan nominal uang"><small id="aulia_co_cash_error" class="aulia_error"></small><p id="aulia_co_cash_change">Bayar langsung di kasir.</p></div></div>
<div id="aulia_co_transfer_wrap" hidden><div class="aulia_transfer_box">
<p><strong>Pilih Bank / E-Wallet / QRIS:</strong></p>
<select id="aulia_co_bank" class="aulia_input"><option value="bank">Bank Contoh</option><option value="ewallet">E-Wallet Contoh</option><option value="qris">QRIS Contoh</option></select>
<p id="aulia_co_account">0000-0000-0000 a.n. KopiKita (contoh)</p>
<p>Total yang harus dibayar: <strong id="aulia_co_transfer_total">Rp0</strong></p>
<div id="aulia_co_qris" class="aulia_qris_placeholder" hidden>QRIS Demonstrasi</div>
<button id="aulia_co_transfer_done" class="aulia_button aulia_button_secondary" type="button">Saya Sudah Transfer</button>
<small id="aulia_co_transfer_note" class="aulia_error"></small>
<p class="aulia_simulation_note">Nomor rekening dan QRIS di atas FIKTIF hanya untuk demonstrasi.</p>
</div></div>
<div id="aulia_co_summary" class="aulia_co_summary"></div>
<div class="aulia_co_action_row"><button id="aulia_co_submit" class="aulia_button" type="submit">Konfirmasi Pesanan</button></div>
</form>
</div>
</div>

<div id="aulia_receipt_modal" class="aulia_modal" hidden>
<div class="aulia_modal_backdrop" data-aulia-close="receipt"></div>
<div class="aulia_dialog" role="dialog" aria-modal="true" aria-labelledby="aulia_receipt_title">
<button id="aulia_receipt_close" class="aulia_modal_close" type="button" aria-label="Tutup struk">✕</button>
<h2 id="aulia_receipt_title">Struk Pesanan</h2><p class="aulia_dialog_sub">Bukti simulasi pesanan KopiKita.</p>
<div id="aulia_receipt_content"></div>
<div class="aulia_receipt_actions"><button id="aulia_receipt_print" class="aulia_button aulia_button_secondary" type="button">Cetak Struk</button><button id="aulia_receipt_done" class="aulia_button" type="button">Selesai</button></div>
</div>
</div>

<div id="aulia_toast" class="aulia_toast" role="status" aria-live="polite"></div>`;
    while (host.firstChild) {
      document.body.appendChild(host.firstChild);
    }
  }

  /* ---------- Utilitas tampilan / scroll lock ---------- */
  function isVisible(el) {
    return !!(el && !el.hidden);
  }
  function syncScrollLock() {
    var any =
      isVisible($("aulia_detail_modal")) ||
      isVisible($("aulia_cart_layer")) ||
      isVisible($("aulia_checkout_modal")) ||
      isVisible($("aulia_receipt_modal"));
    document.body.classList.toggle("aulia_no_scroll", any);
  }
  function show(el) {
    if (el) el.hidden = false;
    syncScrollLock();
  }
  function hide(el) {
    if (el) el.hidden = true;
    syncScrollLock();
  }
  var toastTimer = null;
  function toast(msg) {
    var el = $("aulia_toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("aulia_show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove("aulia_show");
    }, 2600);
  }

  /* ---------- Keranjang ---------- */
  function updateBadge() {
    var b = $("aulia_cart_badge");
    if (!b) return;
    var n = cartCount();
    b.textContent = n > 99 ? "99+" : String(n);
    b.hidden = n === 0;
  }
  function renderCart() {
    var box = $("aulia_cart_items");
    if (!box) return;
    var html = "";
    cart.forEach(function (it, i) {
      html += `<div class="aulia_cart_item">
<img class="aulia_cart_item_img" src="${esc(it.image)}" alt="Foto ${esc(it.name)}">
<div class="aulia_cart_item_main">
<div class="aulia_cart_item_top"><strong>${esc(it.name)}</strong><button class="aulia_cart_remove" type="button" data-cart-action="remove" data-index="${i}" aria-label="Hapus ${esc(it.name)} dari keranjang">✕</button></div>
<div class="aulia_cart_note">${it.note ? "Catatan: " + esc(it.note) : "Tanpa catatan"}</div>
<div class="aulia_cart_unit">${money(it.price)} / porsi</div>
<div class="aulia_cart_item_bottom">
<div class="aulia_qty aulia_qty_small"><button type="button" data-cart-action="minus" data-index="${i}" aria-label="Kurangi jumlah ${esc(it.name)}">−</button><span>${it.qty}</span><button type="button" data-cart-action="plus" data-index="${i}" aria-label="Tambah jumlah ${esc(it.name)}">+</button></div>
<strong class="aulia_cart_item_subtotal">${money(it.price * it.qty)}</strong>
</div></div></div>`;
    });
    box.innerHTML = html;
    box.hidden = cart.length === 0;
    var empty = $("aulia_cart_empty");
    if (empty) empty.hidden = cart.length > 0;
    var total = $("aulia_cart_total");
    if (total) total.textContent = money(cartTotal());
    var btn = $("aulia_cart_checkout");
    if (btn) btn.disabled = cart.length === 0;
    updateBadge();
  }
  function openCart() {
    renderCart();
    show($("aulia_cart_layer"));
    var c = $("aulia_cart_close");
    if (c) c.focus();
  }
  function closeCart() {
    hide($("aulia_cart_layer"));
    var fab = $("aulia_fab_cart");
    if (fab) fab.focus();
  }

  /* ---------- Modal detail produk ---------- */
  var detailProduct = null,
    detailQty = 1;
  function productFromCard(card) {
    var h = card.querySelector("h3"),
      p = card.querySelector("p"),
      im = card.querySelector("img");
    return {
      id: card.dataset.id || "",
      name: card.dataset.name || (h ? h.textContent : "Menu"),
      price: parseInt(card.dataset.price, 10) || 0,
      image: card.dataset.image || (im ? im.src : ""),
      desc: card.dataset.desc || (p ? p.textContent : ""),
    };
  }
  function updateDetailQty() {
    var q = $("aulia_detail_qty");
    if (q) q.textContent = detailQty;
    var mn = $("aulia_detail_minus");
    if (mn) mn.disabled = detailQty <= 1;
    var pl = $("aulia_detail_plus");
    if (pl) pl.disabled = detailQty >= MAX_QTY;
    var sb = $("aulia_detail_subtotal");
    if (sb && detailProduct)
      sb.textContent = money(detailProduct.price * detailQty);
  }
  function openDetail(card) {
    detailProduct = productFromCard(card);
    detailQty = 1;
    var im = $("aulia_detail_image");
    if (im) {
      im.src = detailProduct.image;
      im.alt = "Foto " + detailProduct.name;
    }
    var t = $("aulia_detail_title");
    if (t) t.textContent = detailProduct.name;
    var d = $("aulia_detail_desc");
    if (d) d.textContent = detailProduct.desc;
    var pr = $("aulia_detail_price");
    if (pr) pr.textContent = money(detailProduct.price) + " / porsi";
    var nt = $("aulia_detail_note");
    if (nt) nt.value = "";
    updateDetailQty();
    show($("aulia_detail_modal"));
    var c = $("aulia_detail_close");
    if (c) c.focus();
  }
  function addToCart() {
    if (!detailProduct) return;
    var noteEl = $("aulia_detail_note"),
      note = noteEl ? noteEl.value.trim() : "";
    var key = makeLineId(detailProduct.id, note),
      found = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].key === key) {
        found = cart[i];
        break;
      }
    }
    if (found) {
      if (found.qty + detailQty > MAX_QTY) {
        toast("Maksimal " + MAX_QTY + " porsi untuk varian catatan yang sama.");
        return;
      }
      found.qty += detailQty;
    } else {
      cart.push({
        key: key,
        id: detailProduct.id,
        name: detailProduct.name,
        price: detailProduct.price,
        image: detailProduct.image,
        desc: detailProduct.desc,
        note: note,
        qty: detailQty,
      });
    }
    saveCart();
    renderCart();
    hide($("aulia_detail_modal"));
    toast(
      detailProduct.name +
        " (" +
        detailQty +
        " porsi) ditambahkan ke keranjang",
    );
    detailProduct = null;
  }

  /* ---------- Checkout ---------- */
  var transferConfirmed = false,
    receiptData = null;
  function setErr(id, msg) {
    var el = $(id);
    if (el) el.textContent = msg;
  }
  function markInvalid(el, bad) {
    if (el) el.classList.toggle("aulia_invalid", !!bad);
  }
  function clearCheckoutErrors() {
    var form = $("aulia_checkout_form");
    if (!form) return;
    form.querySelectorAll(".aulia_error").forEach(function (el) {
      el.textContent = "";
    });
    form.querySelectorAll(".aulia_input").forEach(function (el) {
      el.classList.remove("aulia_invalid");
    });
  }
  function updateCashInfo() {
    var info = $("aulia_co_cash_change");
    if (!info) return;
    var paid = parseFloat($("aulia_co_cash_amount").value),
      total = cartTotal();
    if (!isFinite(paid) || paid <= 0) {
      info.textContent = "Bayar langsung di kasir.";
      info.classList.remove("aulia_ok");
      return;
    }
    if (paid < total) {
      info.textContent = "Uang kurang: " + money(total - paid);
      info.classList.remove("aulia_ok");
    } else {
      info.textContent = "Kembalian: " + money(paid - total);
      info.classList.add("aulia_ok");
    }
  }
  function updateTransferInfo() {
    var bank = $("aulia_co_bank");
    if (bank) {
      var v = bank.value;
      var acc = $("aulia_co_account");
      if (acc) acc.textContent = "0000-0000-0000 a.n. KopiKita (contoh)";
      var qris = $("aulia_co_qris");
      if (qris) qris.hidden = v !== "qris";
    }
    var tt = $("aulia_co_transfer_total");
    if (tt) tt.textContent = money(cartTotal());
  }
  function renderCheckoutSummary() {
    var box = $("aulia_co_summary");
    if (!box) return;
    var html = '<h3>Ringkasan Pesanan</h3><ul class="aulia_co_summary_list">';
    cart.forEach(function (it) {
      html +=
        "<li><span>" +
        esc(it.name) +
        " × " +
        it.qty +
        "</span><span>" +
        money(it.price * it.qty) +
        "</span></li>";
    });
    html +=
      '</ul><div class="aulia_co_summary_total"><span>Total</span><span>' +
      money(cartTotal()) +
      "</span></div>";
    box.innerHTML = html;
    updateCashInfo();
    updateTransferInfo();
  }
  function updateTypeUI() {
    var t = document.querySelector('input[name="aulia_co_type"]:checked');
    var w = $("aulia_co_table_wrap");
    if (w) w.hidden = !(t && t.value === "dinein");
    if (!t || t.value !== "dinein") {
      setErr("aulia_co_table_error", "");
      markInvalid($("aulia_co_table"), false);
    }
  }
  function updatePayUI() {
    var p = document.querySelector('input[name="aulia_co_pay"]:checked');
    var cw = $("aulia_co_cash_wrap"),
      tw = $("aulia_co_transfer_wrap");
    if (cw) cw.hidden = !(p && p.value === "cash");
    if (tw) tw.hidden = !(p && p.value === "transfer");
    if (!p || p.value !== "cash") {
      setErr("aulia_co_cash_error", "");
      markInvalid($("aulia_co_cash_amount"), false);
    }
    if (!p || p.value !== "transfer") {
      setErr("aulia_co_transfer_note", "");
      transferConfirmed = false;
    }
    updateCashInfo();
  }
  function openCheckout() {
    if (!cart.length) {
      toast("Keranjang masih kosong.");
      return;
    }
    var form = $("aulia_checkout_form");
    if (form) form.reset();
    clearCheckoutErrors();
    transferConfirmed = false;
    var tw = $("aulia_co_transfer_wrap");
    if (tw) tw.hidden = true;
    var cw = $("aulia_co_cash_wrap");
    if (cw) cw.hidden = true;
    updateTypeUI();
    renderCheckoutSummary();
    hide($("aulia_cart_layer"));
    show($("aulia_checkout_modal"));
    var n = $("aulia_co_name");
    if (n) n.focus();
  }
  function validateCheckout() {
    var ok = true,
      name = $("aulia_co_name"),
      phone = $("aulia_co_phone"),
      good = true;
    if (name) {
      good = name.value.trim().length >= 3;
      setErr(
        "aulia_co_name_error",
        good ? "" : "Nama wajib diisi (minimal 3 karakter).",
      );
      markInvalid(name, !good);
      if (!good) ok = false;
    }
    if (phone) {
      good = /^(\+62|0)[0-9]{8,13}$/.test(phone.value.replace(/[\s-]/g, ""));
      setErr(
        "aulia_co_phone_error",
        good ? "" : "Nomor HP/WhatsApp tidak valid (contoh: 081234567890).",
      );
      markInvalid(phone, !good);
      if (!good) ok = false;
    }
    var type = document.querySelector('input[name="aulia_co_type"]:checked');
    setErr(
      "aulia_co_type_error",
      type ? "" : "Pilih tipe pesanan terlebih dahulu.",
    );
    if (!type) ok = false;
    var table = $("aulia_co_table");
    if (type && type.value === "dinein" && table) {
      good =
        /^[0-9]+$/.test(table.value.trim()) && Number(table.value.trim()) > 0;
      setErr(
        "aulia_co_table_error",
        good ? "" : "Nomor meja wajib diisi dengan angka.",
      );
      markInvalid(table, !good);
      if (!good) ok = false;
    } else {
      setErr("aulia_co_table_error", "");
      markInvalid(table, false);
    }
    var pay = document.querySelector('input[name="aulia_co_pay"]:checked');
    setErr(
      "aulia_co_pay_error",
      pay ? "" : "Pilih metode pembayaran terlebih dahulu.",
    );
    if (!pay) ok = false;
    var amount = $("aulia_co_cash_amount");
    if (pay && pay.value === "cash" && amount) {
      var paid = parseFloat(amount.value);
      good = isFinite(paid) && paid > 0 && paid >= cartTotal();
      var msg = "";
      if (!good) {
        msg =
          isFinite(paid) && paid > 0
            ? "Uang kurang " + money(cartTotal() - paid) + "."
            : "Masukkan jumlah uang yang dibayarkan.";
      }
      setErr("aulia_co_cash_error", msg);
      markInvalid(amount, !good);
      if (!good) ok = false;
    } else {
      setErr("aulia_co_cash_error", "");
      markInvalid(amount, false);
    }
    return ok;
  }
  function orderCode() {
    var d = new Date();
    return (
      "KK-" +
      d.getFullYear() +
      ("0" + (d.getMonth() + 1)).slice(-2) +
      ("0" + d.getDate()).slice(-2) +
      "-" +
      Math.floor(1000 + Math.random() * 9000)
    );
  }
  function bankLabel(v) {
    return v === "qris"
      ? "QRIS Contoh"
      : v === "ewallet"
        ? "E-Wallet Contoh"
        : "Bank Contoh";
  }
  function submitCheckout() {
    if (!validateCheckout()) return;
    var type = document.querySelector(
      'input[name="aulia_co_type"]:checked',
    ).value;
    var pay = document.querySelector(
      'input[name="aulia_co_pay"]:checked',
    ).value;
    var paid = pay === "cash" ? parseFloat($("aulia_co_cash_amount").value) : 0;
    var d = new Date();
    receiptData = {
      code: orderCode(),
      time: d.toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      name: $("aulia_co_name").value.trim(),
      phone: $("aulia_co_phone").value.trim(),
      type: type,
      table: type === "dinein" ? $("aulia_co_table").value.trim() : "",
      note: $("aulia_co_note").value.trim(),
      items: cart.map(function (x) {
        return {
          name: x.name,
          qty: x.qty,
          subtotal: x.price * x.qty,
          note: x.note,
        };
      }),
      total: cartTotal(),
      pay: pay,
      bank: $("aulia_co_bank").value,
      transferConfirmed: transferConfirmed,
      paid: paid,
      change: pay === "cash" ? paid - cartTotal() : 0,
    };
    hide($("aulia_checkout_modal"));
    showReceipt();
  }

  /* ---------- Struk / bukti pesanan ---------- */
  function showReceipt() {
    var d = receiptData;
    if (!d) return;
    var typeLabel = d.type === "dinein" ? "Makan di tempat" : "Bawa pulang";
    var payLabel =
      d.pay === "cash" ? "Tunai (Cash)" : "Transfer – " + bankLabel(d.bank);
    var status =
      d.pay === "cash"
        ? "Menunggu pembayaran di kasir"
        : "Menunggu konfirmasi pembayaran";
    var html = '<div class="aulia_receipt_paper">';
    html +=
      '<h2>KopiKita</h2><p class="aulia_receipt_sub">BUKTI PESANAN — SIMULASI</p>';
    html += '<div class="aulia_receipt_meta">';
    html += "<p><strong>Kode Pesanan:</strong> " + esc(d.code) + "</p>";
    html += "<p><strong>Tanggal &amp; Jam:</strong> " + esc(d.time) + "</p>";
    html += "<p><strong>Nama Pemesan:</strong> " + esc(d.name) + "</p>";
    html += "<p><strong>No. HP/WA:</strong> " + esc(d.phone) + "</p>";
    html += "<p><strong>Tipe Pesanan:</strong> " + esc(typeLabel) + "</p>";
    if (d.type === "dinein")
      html += "<p><strong>Nomor Meja:</strong> " + esc(d.table) + "</p>";
    if (d.note) html += "<p><strong>Catatan:</strong> " + esc(d.note) + "</p>";
    html += "</div>";
    html +=
      '<table class="aulia_receipt_table"><thead><tr><th>Item</th><th>Jml</th><th>Subtotal</th></tr></thead><tbody>';
    d.items.forEach(function (it) {
      html +=
        "<tr><td>" +
        esc(it.name) +
        (it.note ? "<br><small>Catatan: " + esc(it.note) + "</small>" : "") +
        "</td><td>" +
        it.qty +
        "</td><td>" +
        money(it.subtotal) +
        "</td></tr>";
    });
    html += "</tbody></table>";
    html +=
      '<div class="aulia_receipt_total"><span>Total</span><span>' +
      money(d.total) +
      "</span></div>";
    html += '<div class="aulia_receipt_meta" style="margin-top:10px">';
    html += "<p><strong>Metode Pembayaran:</strong> " + esc(payLabel) + "</p>";
    if (d.pay === "cash") {
      html +=
        "<p>Uang dibayarkan: " +
        money(d.paid) +
        " &nbsp;|&nbsp; Kembalian: " +
        money(d.change) +
        "</p>";
    } else {
      html +=
        "<p>Rekening/QRIS contoh: 0000-0000-0000 a.n. KopiKita (contoh)</p>";
      html +=
        '<p>Tombol "Saya Sudah Transfer" ditekan: ' +
        (d.transferConfirmed ? "Ya (simulasi, tidak diverifikasi)" : "Tidak") +
        "</p>";
    }
    html +=
      '<p class="aulia_receipt_status"><strong>Status:</strong> ' +
      esc(status) +
      "</p>";
    html += '<p class="aulia_simulation_note">' + esc(SIMULATION_NOTE) + "</p>";
    html += "</div></div>";
    var box = $("aulia_receipt_content");
    if (box) box.innerHTML = html;
    show($("aulia_receipt_modal"));
    var pr = $("aulia_receipt_print");
    if (pr) pr.focus();
  }
  function finishOrder() {
    cart = [];
    saveCart();
    renderCart();
    hide($("aulia_receipt_modal"));
    receiptData = null;
    toast("Simulasi selesai. Keranjang dikosongkan.");
  }

  /* ---------- Inisialisasi listener ---------- */
  injectUI();
  renderCart();
  syncScrollLock();

  document.querySelectorAll(".aulia_item").forEach(function (card) {
    card.addEventListener("click", function () {
      openDetail(card);
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openDetail(card);
      }
    });
    var btn = card.querySelector(".aulia_order_button");
    if (btn)
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        openDetail(card);
      });
  });

  var fab = $("aulia_fab_cart");
  if (fab) fab.addEventListener("click", openCart);
  var cartClose = $("aulia_cart_close");
  if (cartClose) cartClose.addEventListener("click", closeCart);
  var itemsBox = $("aulia_cart_items");
  if (itemsBox)
    itemsBox.addEventListener("click", function (e) {
      var t = e.target,
        btn = t.closest ? t.closest("[data-cart-action]") : null;
      if (!btn) return;
      var i = parseInt(btn.getAttribute("data-index"), 10);
      if (isNaN(i) || !cart[i]) return;
      var act = btn.getAttribute("data-cart-action");
      if (act === "plus") {
        if (cart[i].qty >= MAX_QTY) {
          toast("Maksimal " + MAX_QTY + " porsi per item.");
          return;
        }
        cart[i].qty++;
      } else if (act === "minus") {
        cart[i].qty--;
        if (cart[i].qty < 1) {
          cart.splice(i, 1);
          toast("Item dihapus dari keranjang");
        }
      } else if (act === "remove") {
        cart.splice(i, 1);
        toast("Item dihapus dari keranjang");
      } else return;
      saveCart();
      renderCart();
    });
  var coBtn = $("aulia_cart_checkout");
  if (coBtn) coBtn.addEventListener("click", openCheckout);

  var dMinus = $("aulia_detail_minus");
  if (dMinus)
    dMinus.addEventListener("click", function () {
      if (detailQty > 1) {
        detailQty--;
        updateDetailQty();
      }
    });
  var dPlus = $("aulia_detail_plus");
  if (dPlus)
    dPlus.addEventListener("click", function () {
      if (detailQty < MAX_QTY) {
        detailQty++;
        updateDetailQty();
      }
    });
  var dClose = $("aulia_detail_close");
  if (dClose)
    dClose.addEventListener("click", function () {
      hide($("aulia_detail_modal"));
      detailProduct = null;
    });
  var dAdd = $("aulia_detail_add");
  if (dAdd) dAdd.addEventListener("click", addToCart);
  var dNote = $("aulia_detail_note");
  if (dNote)
    dNote.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        addToCart();
      }
    });

  var coClose = $("aulia_co_close");
  if (coClose)
    coClose.addEventListener("click", function () {
      hide($("aulia_checkout_modal"));
    });
  var coForm = $("aulia_checkout_form");
  if (coForm)
    coForm.addEventListener("submit", function (e) {
      e.preventDefault();
      submitCheckout();
    });
  document
    .querySelectorAll('input[name="aulia_co_type"]')
    .forEach(function (r) {
      r.addEventListener("change", updateTypeUI);
    });
  document.querySelectorAll('input[name="aulia_co_pay"]').forEach(function (r) {
    r.addEventListener("change", updatePayUI);
  });
  var cashAmount = $("aulia_co_cash_amount");
  if (cashAmount) cashAmount.addEventListener("input", updateCashInfo);
  var bankSel = $("aulia_co_bank");
  if (bankSel) bankSel.addEventListener("change", updateTransferInfo);
  var transferBtn = $("aulia_co_transfer_done");
  if (transferBtn)
    transferBtn.addEventListener("click", function () {
      transferConfirmed = true;
      var note = $("aulia_co_transfer_note");
      if (note)
        note.textContent =
          "Simulasi: transfer ditandai sudah dilakukan (tidak benar-benar diverifikasi).";
      toast("Simulasi: status transfer ditandai.");
    });

  var receiptClose = $("aulia_receipt_close");
  if (receiptClose)
    receiptClose.addEventListener("click", function () {
      hide($("aulia_receipt_modal"));
    });
  var receiptPrint = $("aulia_receipt_print");
  if (receiptPrint)
    receiptPrint.addEventListener("click", function () {
      window.print();
    });
  var receiptDone = $("aulia_receipt_done");
  if (receiptDone) receiptDone.addEventListener("click", finishOrder);

  // Klik area luar (backdrop) menutup lapisan yang sesuai
  document.addEventListener("click", function (e) {
    var t = e.target,
      el = t.closest ? t.closest("[data-aulia-close]") : null;
    if (!el) return;
    var which = el.getAttribute("data-aulia-close");
    if (which === "detail") {
      hide($("aulia_detail_modal"));
      detailProduct = null;
    } else if (which === "cart") closeCart();
    else if (which === "checkout") hide($("aulia_checkout_modal"));
    else if (which === "receipt") hide($("aulia_receipt_modal"));
  });

  // Tutup lapisan paling atas dengan tombol Esc
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (isVisible($("aulia_receipt_modal"))) {
      hide($("aulia_receipt_modal"));
      return;
    }
    if (isVisible($("aulia_checkout_modal"))) {
      hide($("aulia_checkout_modal"));
      return;
    }
    if (isVisible($("aulia_cart_layer"))) {
      closeCart();
      return;
    }
    if (isVisible($("aulia_detail_modal"))) {
      hide($("aulia_detail_modal"));
      detailProduct = null;
    }
  });
});
