/*
 * stockists-map.js — renders the Dutch Oil stockist map on Selling Points.
 *
 *  ┌────────────────────────────────────────────────────────────────────────┐
 *  │  HOW THE CLIENT EDITS THE LIST                                         │
 *  ├────────────────────────────────────────────────────────────────────────┤
 *  │  The data comes from a Google Sheet, published to the web as CSV.      │
 *  │  Columns: Type | Name | City | Address (Address is optional).          │
 *  │  Type values: Bar, Slijterij, Groothandel, HQ.                         │
 *  │  Within 1-2 minutes of an edit, the map and the right-hand list pick   │
 *  │  up the change on the next page load.                                  │
 *  │                                                                        │
 *  │  Setting up the sheet (once):                                          │
 *  │   1. Create a Google Sheet, copy the columns from /stockists.csv.      │
 *  │   2. File → Share → Publish to web → Comma-separated values (.csv).    │
 *  │   3. Copy that URL.                                                    │
 *  │   4. Paste it as SHEET_CSV_URL below and ship.                         │
 *  │                                                                        │
 *  │  Adding a new city? Add an entry in CITY_COORDS below — the client     │
 *  │  only needs to type the city name in the sheet; we map name → coords.  │
 *  └────────────────────────────────────────────────────────────────────────┘
 */

(() => {
  if (!window.L) return;
  const el = document.getElementById('stockist-map');
  if (!el) return;

  // ── 1. CONFIG ──
  // Replace with your "Publish to web → CSV" URL once the sheet is live.
  // Leave the placeholder in place to use the baked-in FALLBACK data.
  const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTxyqnek94tAVcWyW8AK-lmalNR1qZwj3NBMwEL_B_QPFmzlUZYrkdTeeJhoLGbLuVz99ihnpk1APJp/pub?gid=1302405112&single=true&output=csv';

  // ── 2. CITY → COORDINATES ──
  // The client just types a city name; we look up its lat/lon here.
  // Keys are lowercased. Add a city → ship. ~40 of the largest Dutch cities seeded.
  const CITY_COORDS = {
    'amsterdam':            [52.3676, 4.9041],
    'rotterdam':            [51.9244, 4.4777],
    'den haag':             [52.0705, 4.3007],
    "'s-gravenhage":        [52.0705, 4.3007],
    'utrecht':              [52.0907, 5.1214],
    'eindhoven':            [51.4416, 5.4697],
    'groningen':            [53.2194, 6.5665],
    'tilburg':              [51.5719, 5.0672],
    'almere':               [52.3508, 5.2647],
    'breda':                [51.5719, 4.7683],
    'nijmegen':             [51.8126, 5.8372],
    'apeldoorn':            [52.2112, 5.9699],
    'haarlem':              [52.3874, 4.6462],
    'arnhem':               [51.9851, 5.8987],
    'enschede':             [52.2215, 6.8937],
    'amersfoort':           [52.1561, 5.3878],
    'zaanstad':             [52.4389, 4.8260],
    'haarlemmermeer':       [52.3026, 4.6906],
    "'s-hertogenbosch":     [51.6978, 5.3037],
    'den bosch':            [51.6978, 5.3037],
    'zwolle':               [52.5168, 6.0830],
    'leiden':               [52.1601, 4.4970],
    'maastricht':           [50.8514, 5.6909],
    'dordrecht':            [51.8133, 4.6901],
    'zoetermeer':           [52.0575, 4.4938],
    'delft':                [52.0116, 4.3571],
    'venlo':                [51.3704, 6.1724],
    'alkmaar':              [52.6324, 4.7534],
    'leeuwarden':           [53.2017, 5.7993],
    'roermond':             [51.1942, 5.9874],
    'middelburg':           [51.4988, 3.6109],
    'sittard':              [50.9994, 5.8693],
    'helmond':              [51.4816, 5.6611],
    'oss':                  [51.7651, 5.5189],
    'gouda':                [52.0115, 4.7105],
    'lelystad':             [52.5185, 5.4714],
    'assen':                [52.9967, 6.5625],
    'emmen':                [52.7858, 6.8975],
    'hoorn':                [52.6425, 5.0597],
    'spijkenisse':          [51.8453, 4.3294],
    'capelle aan den ijssel': [51.9290, 4.5750],
    'hilversum':            [52.2241, 5.1719],
    'bedum':                [53.3022, 6.6019],
    'sneek':                [53.0317, 5.6586],
    'bolsward':             [53.0667, 5.5333],
    'harlingen':            [53.1740, 5.4250],
    'haren':                [53.1710, 6.6061],
  };

  // ── 3. BAKED-IN FALLBACK ──
  // Used if the Google Sheet is missing/unreachable. Keeps the page useful in that case.
  const FALLBACK = [
    { type: 'HQ',          name: 'Dutch Oil HQ',                 city: 'Groningen', address: 'Hiddemaheerd 168, 9737 JK' },
    { type: 'Bar',         name: 'Café De Doos',                 city: 'Groningen', address: 'Poelestraat 23, 9711 PL' },
    { type: 'Bar',         name: 'Café De Weijerbar',            city: 'Groningen', address: 'Vismarkt 9, 9712 CT' },
    { type: 'Bar',         name: 'Geikingo II',                  city: 'Groningen', address: 'Folkingestraat 47, 9711 JV' },
    { type: 'Bar',         name: 'Café De Toren',                city: 'Groningen', address: 'Grote Markt 18, 9712 HR' },
    { type: 'Bar',         name: 'Bar Pitchers',                 city: 'Groningen', address: 'Gelkingestraat 12, 9711 ND' },
    { type: 'Slijterij',   name: 'Slijterij Groningen De Beren', city: 'Groningen', address: 'Westerhaven 8, 9718 AT' },
    { type: 'Slijterij',   name: 'Slijterij Groningen Vismarkt', city: 'Groningen', address: 'Vismarkt 22, 9712 CT' },
    { type: 'Slijterij',   name: 'Slijterij De Kabouter',        city: 'Groningen', address: 'Brugstraat 5, 9711 HV' },
    { type: 'Slijterij',   name: 'Slijterij Bedum',              city: 'Bedum',     address: 'Stationsstraat 14, 9781 BA' },
    { type: 'Groothandel', name: 'Fa. A. Robertus en Zn.',       city: 'Groningen', address: 'Hoendiep 142, 9744 BD' },
    { type: 'Groothandel', name: 'Horecagrondhandel',            city: 'Groningen', address: 'Industrieweg 47, 9744 TR' },
    { type: 'Bar',         name: 'Veronica Bar',                 city: 'Groningen', address: 'Ulgersmaweg 25, 9731 BJ' },
    { type: 'Bar',         name: 'Proeflokaal aan de Amstel',    city: 'Amsterdam', address: 'Amstelveld 7, 1017 JD' },
    { type: 'Bar',         name: 'Café De Kleine Cooseepoort',   city: 'Utrecht',   address: 'Oudegracht 53, 3511 AC' },
  ];

  // ── 4. CSV PARSER ── (handles quoted fields with commas, no extra deps)
  function parseCSV(text) {
    const rows = [];
    let row = [], field = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (c === '"') quoted = false;
        else field += c;
      } else {
        if (c === '"') quoted = true;
        else if (c === ',') { row.push(field); field = ''; }
        else if (c === '\n' || c === '\r') {
          if (field.length || row.length) { row.push(field); rows.push(row); row = []; field = ''; }
          if (c === '\r' && text[i + 1] === '\n') i++;
        } else field += c;
      }
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  function csvToStockists(csvText) {
    const rows = parseCSV(csvText);
    if (!rows.length) return [];
    // Detect whether row 0 is a header. If column A starts with a known type
    // value (HQ/Bar/Slijterij/Groothandel), treat the sheet as headerless and
    // use positional column mapping. Lets the client delete the header row
    // without breaking the page.
    const TYPES = ['hq', 'bar', 'slijterij', 'groothandel'];
    const firstCell = (rows[0][0] || '').trim().toLowerCase();
    const headerless = TYPES.some(t => firstCell === t || firstCell.startsWith(t + ' '));
    let iType, iName, iCity, iAddress, dataRows;
    if (headerless) {
      iType = 0; iName = 1; iCity = 2; iAddress = 3;
      dataRows = rows;
    } else {
      if (rows.length < 2) return [];
      const header = rows[0].map(h => h.trim().toLowerCase());
      iType    = header.indexOf('type');
      iName    = header.indexOf('name');
      iCity    = header.indexOf('city');
      iAddress = header.indexOf('address');
      dataRows = rows.slice(1);
    }
    return dataRows.map(r => ({
      type:    iType    >= 0 ? (r[iType]    || '').trim() : '',
      name:    iName    >= 0 ? (r[iName]    || '').trim() : '',
      city:    iCity    >= 0 ? (r[iCity]    || '').trim() : '',
      address: iAddress >= 0 ? (r[iAddress] || '').trim() : '',
    })).filter(s => s.name && s.city);
  }

  // ── 5. MAP + RENDERING ──
  const map = L.map(el, {
    center: [52.6, 5.7], zoom: 7, minZoom: 6, maxZoom: 17,
    scrollWheelZoom: false, zoomControl: true, attributionControl: true,
  });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd', maxZoom: 19,
  }).addTo(map);

  const baseStyle  = { radius: 7,  color: '#0a0a0a', weight: 2, opacity: 1, fillColor: '#1fa9ff', fillOpacity: 1 };
  const hoverStyle = { radius: 10, color: '#ffffff', weight: 3, fillColor: '#1fa9ff', fillOpacity: 1 };

  // Multiple stockists in the same city get a small offset so the pins don't stack.
  function jitter([lat, lon], idx) {
    if (!idx) return [lat, lon];
    const angle = (idx * 137.508) * (Math.PI / 180); // golden-angle spiral
    const r = 0.006;
    return [lat + Math.cos(angle) * r, lon + Math.sin(angle) * r];
  }

  function groupKeyFor(type) {
    const t = (type || '').toLowerCase();
    if (t.includes('hq')) return 'bars';
    if (t.includes('slijter')) return 'slijterijen';
    if (t.includes('groothandel') || t.includes('whole')) return 'groothandel';
    return 'bars';
  }

  function render(stockists) {
    const groupContainers = {
      bars:        document.querySelector('ul[data-group="bars"]'),
      slijterijen: document.querySelector('ul[data-group="slijterijen"]'),
      groothandel: document.querySelector('ul[data-group="groothandel"]'),
    };
    Object.values(groupContainers).forEach(ul => { if (ul) ul.innerHTML = ''; });

    const markers = new Map();
    const seenInCity = {};

    stockists.forEach(s => {
      const cityKey = (s.city || '').toLowerCase().trim();
      const coords = CITY_COORDS[cityKey];
      if (!coords) console.warn('[stockists] Unknown city — add it to CITY_COORDS:', s.city, '·', s.name);

      const idx = seenInCity[cityKey] || 0;
      seenInCity[cityKey] = idx + 1;

      const isHq = (s.type || '').toLowerCase().includes('hq');
      const ul = groupContainers[groupKeyFor(s.type)];
      if (ul) {
        const li = document.createElement('li');
        li.dataset.stockist = s.name;
        li.tabIndex = 0;
        li.setAttribute('role', 'button');
        li.setAttribute('aria-label', `${s.name} — ${s.address ? s.address + ', ' : ''}${s.city}`);
        li.textContent = isHq ? `${s.name} (HQ)` : s.name;
        ul.appendChild(li);
      }

      if (coords) {
        const latlon = jitter(coords, idx);
        if (isHq) {
          L.circleMarker(latlon, { radius: 14, fillOpacity: 0, color: '#1fa9ff', weight: 1, dashArray: '3 4' }).addTo(map);
        }
        const marker = L.circleMarker(latlon, { ...baseStyle, radius: isHq ? 9 : 7 }).addTo(map);
        const addressLine = s.address ? `<div>${s.address}</div>` : '';
        const meta = isHq ? `⚠ Headquarters · ${s.type}` : s.type;
        marker.bindPopup(
          `<strong>${s.name}</strong>${addressLine}<div>${s.city}</div><div class="meta">${meta}</div>`,
          { autoPan: true, autoPanPadding: [20, 20] }
        );
        markers.set(s.name, marker);
      }
    });

    // Hover/focus/click wiring on the right-hand list
    let hoverMarker = null;
    const setHover = (m) => {
      if (hoverMarker && hoverMarker !== m) {
        hoverMarker.setStyle({ ...baseStyle, radius: 7 });
        hoverMarker.closePopup();
      }
      hoverMarker = m;
      if (m) { m.setStyle(hoverStyle); m.openPopup(); }
    };
    document.querySelectorAll('[data-stockist]').forEach(li => {
      const name = li.dataset.stockist;
      const m = markers.get(name);
      if (!m) { li.style.opacity = 0.5; li.title = 'Unknown city — pin not placed'; return; }
      li.addEventListener('mouseenter', () => setHover(m));
      li.addEventListener('focus',      () => setHover(m));
      li.addEventListener('mouseleave', () => setHover(null));
      li.addEventListener('blur',       () => setHover(null));
      const flyTo = () => { map.flyTo(m.getLatLng(), Math.max(map.getZoom(), 13), { duration: 0.8 }); m.openPopup(); };
      li.addEventListener('click', flyTo);
      li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flyTo(); } });
    });

    // Auto-fit the view to the markers so the map is always zoomed in to the
    // actual pins, no matter how many or where they are. invalidateSize first
    // so Leaflet picks up the current container height (which depends on the
    // list length).
    map.invalidateSize();
    const points = [...markers.values()].map(m => m.getLatLng());
    if (points.length) {
      map.fitBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 14, animate: false });
    }
    // If the surrounding column resizes later (responsive, font load, etc.),
    // refit so the markers stay in view.
    if (window.ResizeObserver) {
      const container = el;
      let pending = null;
      new ResizeObserver(() => {
        clearTimeout(pending);
        pending = setTimeout(() => {
          map.invalidateSize();
          const pts = [...markers.values()].map(m => m.getLatLng());
          if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [50, 50], maxZoom: 14, animate: false });
        }, 120);
      }).observe(container);
    }

    return markers;
  }

  // ── 6. AUTO-GEOCODE UNKNOWN CITIES ──
  // Cities not in CITY_COORDS get looked up via OpenStreetMap's free Nominatim
  // service and cached in localStorage. So the client can add any Dutch city
  // to the sheet without anyone touching the code.
  async function resolveMissingCities(stockists) {
    const unknown = [...new Set(
      stockists.map(s => (s.city || '').toLowerCase().trim())
               .filter(c => c && !CITY_COORDS[c])
    )];
    if (!unknown.length) return;
    for (const city of unknown) {
      const cacheKey = 'stockist-geo:' + city;
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
        if (Array.isArray(cached) && cached.length === 2 && isFinite(cached[0]) && isFinite(cached[1])) {
          CITY_COORDS[city] = cached;
          continue;
        }
      } catch (e) {}
      try {
        const url = 'https://nominatim.openstreetmap.org/search?' + new URLSearchParams({
          q: city, format: 'json', limit: '1', countrycodes: 'nl'
        });
        const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const data = await r.json();
        if (data && data[0] && data[0].lat && data[0].lon) {
          const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          CITY_COORDS[city] = coords;
          try { localStorage.setItem(cacheKey, JSON.stringify(coords)); } catch (e) {}
          console.log(`[stockists] Auto-geocoded "${city}" → ${coords[0]}, ${coords[1]}`);
        } else {
          console.warn(`[stockists] Nominatim returned no result for "${city}"`);
        }
      } catch (err) {
        console.warn(`[stockists] Could not geocode "${city}":`, err.message);
      }
      // Nominatim asks for ≤1 req/sec from a given host. Be polite.
      await new Promise(r => setTimeout(r, 1100));
    }
  }

  // ── 7. LOAD: try Sheet → CSV → geocode unknowns → render; fall back if anything fails ──
  async function load() {
    if (!SHEET_CSV_URL || SHEET_CSV_URL.includes('PASTE_')) {
      console.info('[stockists] No Sheet URL configured — using baked-in fallback. See top of file.');
      return render(FALLBACK);
    }
    try {
      const r = await fetch(SHEET_CSV_URL, { cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const list = csvToStockists(await r.text());
      if (!list.length) throw new Error('Sheet returned no rows');
      console.log(`[stockists] Loaded ${list.length} entries from Google Sheet`);
      await resolveMissingCities(list);
      render(list);
    } catch (err) {
      console.warn('[stockists] Falling back to baked-in data:', err.message);
      render(FALLBACK);
    }
  }
  load();

  // Scroll-wheel zoom enables on click, disables on mouse-out (so page scroll isn't hijacked)
  map.on('click', () => { if (!map.scrollWheelZoom.enabled()) map.scrollWheelZoom.enable(); });
  el.addEventListener('mouseleave', () => map.scrollWheelZoom.disable());
})();
