/* V2 — Ledger: architectural grid rework.
 * Literal drawn grid lines, left rail nav, modular tile wall, mono meta.
 */
/* eslint-disable */

const V2_ICONS = [
  'plus', 'x', 'check', 'search', 'edit', 'trash', 'settings', 'bell',
  'home', 'user', 'download', 'upload', 'refresh', 'filter', 'copy', 'eye',
  'eye-off', 'arrow-left', 'arrow-right', 'external-link',
];

const V2 = () => {
  const [tab, setTab] = React.useState('btn');
  const [sw, setSw] = React.useState(true);
  const [ck, setCk] = React.useState(true);

  return (
    <div className="v2-root">
      <style>{`
        .v2-root {
          font-family: var(--ui-font-body);
          background: var(--ui-color-canvas);
          color: var(--ui-color-text);
          min-height: 100%;
          display: grid;
          grid-template-columns: 200px 1fr;
          --v2-line: color-mix(in srgb, var(--ui-color-text) 14%, transparent);
          --v2-line-strong: var(--ui-color-text);
        }

        /* ── Rail ──────────────────────── */
        .v2-rail {
          border-right: 1px solid var(--v2-line-strong);
          padding: 28px 24px;
          position: sticky; top: 0; align-self: start;
          display: flex; flex-direction: column; gap: 28px;
          min-height: 100vh;
        }
        .v2-mark { font-family: var(--ui-font-display); font-weight: 700; font-size: 15px; letter-spacing: -0.01em; line-height: 1.2; }
        .v2-mark small { display: block; font: 400 10px/1.4 var(--ui-font-mono); color: var(--ui-color-text-muted); letter-spacing: 0.08em; margin-top: 4px; }
        .v2-rail-group { display: flex; flex-direction: column; gap: 2px; }
        .v2-rail-label { font: 500 9px/1 var(--ui-font-mono); letter-spacing: 0.14em; text-transform: uppercase; color: var(--ui-color-text-muted); margin-bottom: 8px; }
        .v2-rail a { font: 400 12px/1.9 var(--ui-font-display); color: var(--ui-color-text-muted); text-decoration: none; cursor: pointer; display: flex; justify-content: space-between; }
        .v2-rail a.on { color: var(--ui-color-text); }
        .v2-rail a.on::before { content: '▸'; margin-right: 4px; color: var(--ui-color-brand-text); }
        .v2-rail a span { font: 400 10px/1 var(--ui-font-mono); color: var(--ui-color-text-muted); }

        /* ── Canvas ────────────────────── */
        .v2-main { padding: 0; }

        /* Cell — every section sits in a bordered cell */
        .v2-cell {
          border-bottom: 1px solid var(--v2-line-strong);
          display: grid;
          grid-template-columns: 140px 1fr;
        }
        .v2-cell-head {
          border-right: 1px solid var(--v2-line);
          padding: 24px 20px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .v2-num { font: 400 10px/1 var(--ui-font-mono); letter-spacing: 0.12em; color: var(--ui-color-text-muted); }
        .v2-head-title { font: 600 1.05rem/1.15 var(--ui-font-display); letter-spacing: -0.005em; }
        .v2-head-meta { font: 400 10px/1.5 var(--ui-font-mono); color: var(--ui-color-text-muted); margin-top: auto; }
        .v2-cell-body { padding: 28px 32px; }

        /* Hero cell */
        .v2-hero { padding: 56px 48px 64px; position: relative; }
        .v2-hero-grid-bg {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(to right, var(--v2-line) 1px, transparent 1px),
            linear-gradient(to bottom, var(--v2-line) 1px, transparent 1px);
          background-size: 72px 72px;
          opacity: 0.55;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0.2));
        }
        .v2-hero-inner { position: relative; }
        .v2-hero-kicker {
          display: inline-flex; align-items: center; gap: 10px;
          font: 500 10px/1 var(--ui-font-mono); letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--ui-color-text); padding-bottom: 4px;
          border-bottom: 1px solid var(--ui-color-text);
        }
        .v2-hero-title {
          font-family: var(--ui-font-display);
          font-size: clamp(3.4rem, 7.2vw, 5.8rem);
          line-height: 0.98;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 28px 0 26px;
          max-width: 820px;
        }
        .v2-hero-title span { color: var(--ui-color-brand-text); font-weight: 500; font-style: italic; }
        .v2-hero-desc {
          font-family: var(--ui-font-display);
          font-size: 1.15rem; line-height: 1.55;
          max-width: 520px; margin: 0 0 28px;
        }
        .v2-hero-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .v2-hero-cmd {
          font: 400 12px/1 var(--ui-font-mono);
          padding: 10px 14px; border: 1px solid var(--ui-color-text);
          background: color-mix(in srgb, var(--ui-color-text) 4%, transparent);
        }
        .v2-btn-solid {
          font: 500 0.875rem/1 var(--ui-font-display);
          padding: 10px 16px;
          background: var(--ui-color-text); color: var(--ui-color-canvas);
          border: 1px solid var(--ui-color-text); cursor: pointer;
        }
        .v2-btn-solid:hover { background: var(--ui-color-palette-stone-800); }

        .v2-stats {
          margin-top: 44px;
          display: grid; grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid var(--v2-line);
        }
        .v2-stat {
          padding: 18px 20px 6px 20px;
          border-right: 1px solid var(--v2-line);
        }
        .v2-stat:first-child { padding-left: 0; }
        .v2-stat:last-child { border-right: none; }
        .v2-stat-n { font-family: var(--ui-font-display); font-weight: 700; font-size: 2.3rem; line-height: 1; letter-spacing: -0.02em; }
        .v2-stat-l { font: 400 10px/1 var(--ui-font-mono); letter-spacing: 0.1em; color: var(--ui-color-text-muted); margin-top: 8px; text-transform: uppercase; }

        /* Palette — tile wall, each step its own tile w/ label */
        .v2-palette { display: grid; grid-template-columns: repeat(9, 1fr); }
        .v2-swatch {
          aspect-ratio: 1.1 / 1;
          padding: 10px;
          display: flex; flex-direction: column; justify-content: flex-end;
          font: 400 9px/1.2 var(--ui-font-mono);
          border-right: 1px solid var(--v2-line);
          border-bottom: 1px solid var(--v2-line);
        }
        .v2-swatch:nth-child(9n) { border-right: none; }
        .v2-palette .v2-row-last { border-bottom: none; }

        /* Type rows as a grid */
        .v2-type { display: grid; grid-template-columns: 80px 1fr auto; }
        .v2-type-row { display: contents; }
        .v2-type-row > * {
          border-bottom: 1px solid var(--v2-line);
          padding: 14px 12px;
        }
        .v2-type-row.last > * { border-bottom: none; }
        .v2-type-row .lbl { font: 400 10px/1.4 var(--ui-font-mono); color: var(--ui-color-text-muted); letter-spacing: 0.06em; }
        .v2-type-row .meta { font: 400 10px/1.4 var(--ui-font-mono); color: var(--ui-color-text-muted); text-align: right; }
        .v2-type-row .sample { font-family: var(--ui-font-display); }
        .v2-type-row.h1 .sample { font-size: 2.3rem; line-height: 1.04; font-weight: 700; letter-spacing: -0.02em; }
        .v2-type-row.h2 .sample { font-size: 1.65rem; line-height: 1.1; font-weight: 600; }
        .v2-type-row.h3 .sample { font-size: 1.25rem; line-height: 1.2; font-weight: 600; }
        .v2-type-row.body .sample { font-size: 1rem; line-height: 1.6; }
        .v2-type-row.caption .sample { font-size: 0.875rem; color: var(--ui-color-text-muted); }

        /* Component tabs */
        .v2-tabs { display: flex; border-bottom: 1px solid var(--v2-line); margin-bottom: 0; }
        .v2-tab {
          font: 500 0.8125rem/1 var(--ui-font-display);
          padding: 0 18px; height: 40px;
          background: transparent; border: 0; cursor: pointer;
          color: var(--ui-color-text-muted);
          border-right: 1px solid var(--v2-line);
          transition: background 140ms ease, color 140ms ease;
        }
        .v2-tab.on { color: var(--ui-color-text); background: color-mix(in srgb, var(--ui-color-text) 5%, transparent); }
        .v2-comp-panel { padding: 28px 32px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; min-height: 100px; }

        .v2-btn {
          font: 500 0.875rem/1 var(--ui-font-display);
          padding: 8px 14px;
          border: 1px solid var(--ui-color-text); background: transparent; color: var(--ui-color-text);
          cursor: pointer; transition: background 140ms ease, color 140ms ease;
        }
        .v2-btn.primary { background: var(--ui-color-brand-bg); border-color: var(--ui-color-brand-bg); color: var(--ui-color-text-on-brand, var(--ui-color-canvas)); }
        .v2-btn.danger { background: transparent; border-color: var(--ui-color-danger-bg); color: var(--ui-color-danger-text); }
        .v2-btn.ghost { border-color: transparent; padding-left: 4px; padding-right: 4px; }
        .v2-btn:hover { background: var(--ui-color-text); color: var(--ui-color-canvas); }
        .v2-btn.primary:hover { background: var(--ui-color-brand-bg-hover); border-color: var(--ui-color-brand-bg-hover); }
        .v2-btn.danger:hover { background: var(--ui-color-danger-bg); color: var(--ui-color-canvas); }

        .v2-input { padding: 8px 10px; border: 1px solid var(--ui-color-text); background: transparent; color: var(--ui-color-text); font: 400 0.875rem/1.4 var(--ui-font-display); outline: none; width: 160px; }
        .v2-input:focus { border-color: var(--ui-color-brand-bg); }
        .v2-input::placeholder { color: var(--ui-color-text-muted); }

        .v2-badge { display: inline-flex; align-items: center; padding: 3px 10px; font: 500 11px/1.3 var(--ui-font-display); border: 1px solid var(--ui-color-text); }
        .v2-badge.primary { border-color: var(--ui-color-brand-bg); color: var(--ui-color-brand-text); }
        .v2-badge.danger { border-color: var(--ui-color-danger-bg); color: var(--ui-color-danger-text); }
        .v2-badge.soft { border-color: transparent; background: color-mix(in srgb, var(--ui-color-text) 7%, transparent); }

        .v2-sw { width: 32px; height: 16px; border: 1px solid var(--ui-color-text); position: relative; cursor: pointer; }
        .v2-sw::after { content: ''; position: absolute; top: 2px; left: 2px; width: 10px; height: 10px; background: var(--ui-color-text); transition: left 140ms ease; }
        .v2-sw.on { background: var(--ui-color-brand-bg); border-color: var(--ui-color-brand-bg); }
        .v2-sw.on::after { background: var(--ui-color-text-on-brand, var(--ui-color-canvas)); left: 18px; }

        .v2-chk { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font: 400 0.875rem/1 var(--ui-font-display); }
        .v2-chk .b { width: 14px; height: 14px; border: 1px solid var(--ui-color-text); display: inline-flex; align-items: center; justify-content: center; }
        .v2-chk.on .b { background: var(--ui-color-text); color: var(--ui-color-canvas); }
        .v2-chk svg { width: 10px; height: 10px; display: none; }
        .v2-chk.on svg { display: block; }

        /* Icons */
        .v2-icon-grid { display: grid; grid-template-columns: repeat(10, 1fr); }
        .v2-icon-cell {
          aspect-ratio: 1;
          display: flex; align-items: center; justify-content: center;
          border-right: 1px solid var(--v2-line);
          border-bottom: 1px solid var(--v2-line);
          color: var(--ui-color-text); font-size: 18px;
        }
        .v2-icon-cell:nth-child(10n) { border-right: none; }
        .v2-icon-cell i { stroke-linecap: square; stroke-linejoin: miter; }

        /* Footer */
        .v2-foot { padding: 20px 32px; display: flex; justify-content: space-between; font: 400 10px/1 var(--ui-font-mono); color: var(--ui-color-text-muted); letter-spacing: 0.1em; }
      `}</style>

      <aside className="v2-rail">
        <div className="v2-mark">Deweyou<br/>Design<small>v1.0 · MMXXVI</small></div>
        <div className="v2-rail-group">
          <div className="v2-rail-label">§ Index</div>
          <a className="on">Overview<span>00</span></a>
          <a>Foundations<span>01</span></a>
          <a>Palette<span>02</span></a>
          <a>Type<span>03</span></a>
          <a>Components<span>04</span></a>
          <a>Icons<span>05</span></a>
        </div>
        <div className="v2-rail-group">
          <div className="v2-rail-label">§ External</div>
          <a>Storybook ↗</a>
          <a>GitHub ↗</a>
          <a>NPM ↗</a>
        </div>
        <div style={{ marginTop: 'auto', font: '400 9px/1.5 var(--ui-font-mono)', color: 'var(--ui-color-text-muted)', letterSpacing: '0.06em' }}>
          MIT · 2026<br/>design.deweyou.me
        </div>
      </aside>

      <main className="v2-main">
        {/* Hero cell */}
        <div className="v2-cell" style={{ gridTemplateColumns: '1fr' }}>
          <div className="v2-hero">
            <div className="v2-hero-grid-bg" />
            <div className="v2-hero-inner">
              <span className="v2-hero-kicker">Component Library · 00</span>
              <h1 className="v2-hero-title">Architecture for <span>serif</span> interfaces.</h1>
              <p className="v2-hero-desc">二十七个组件，以宋体字形节奏与温暖色系构建，深浅双主题，开箱即用。专为中文优先的产品而设计。</p>
              <div className="v2-hero-row">
                <code className="v2-hero-cmd">$ npm i @deweyou-design/react</code>
                <button className="v2-btn-solid">查看 Storybook →</button>
              </div>
              <div className="v2-stats">
                <div className="v2-stat"><div className="v2-stat-n">27</div><div className="v2-stat-l">Components</div></div>
                <div className="v2-stat"><div className="v2-stat-n">30</div><div className="v2-stat-l">Icons</div></div>
                <div className="v2-stat"><div className="v2-stat-n">26</div><div className="v2-stat-l">Color Families</div></div>
                <div className="v2-stat"><div className="v2-stat-n">02</div><div className="v2-stat-l">Themes</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* 02 · Palette */}
        <div className="v2-cell">
          <div className="v2-cell-head">
            <span className="v2-num">§ 02</span>
            <span className="v2-head-title">Palette</span>
            <span className="v2-head-meta">3 semantic roles<br/>9 tonal steps each</span>
          </div>
          <div className="v2-cell-body" style={{ padding: 0 }}>
            <div className="v2-palette">
              {['emerald', 'red', 'stone'].map((fam, rowIdx) => (
                [950, 900, 800, 700, 600, 500, 400, 300, 200].map((step, i) => {
                  const last = rowIdx === 2;
                  return (
                    <div
                      key={`${fam}-${step}`}
                      className={`v2-swatch ${last ? 'v2-row-last' : ''}`}
                      style={{ background: `var(--ui-color-palette-${fam}-${step})`, color: step <= 400 ? 'var(--ui-color-text)' : 'var(--ui-color-canvas)' }}
                    >
                      {i === 0 && <div style={{ fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>{fam}</div>}
                      <div>{step}</div>
                    </div>
                  );
                })
              ))}
            </div>
          </div>
        </div>

        {/* 03 · Type */}
        <div className="v2-cell">
          <div className="v2-cell-head">
            <span className="v2-num">§ 03</span>
            <span className="v2-head-title">Type</span>
            <span className="v2-head-meta">Source Han Serif CN<br/>5 levels · 4 weights</span>
          </div>
          <div className="v2-cell-body" style={{ padding: 0 }}>
            <div className="v2-type">
              {[
                { cls: 'h1', label: 'H1', sample: 'Design 设计', meta: 'clamp · 700' },
                { cls: 'h2', label: 'H2', sample: '组件库 · 双主题', meta: '2.3rem · 600' },
                { cls: 'h3', label: 'H3', sample: '简约 · 中文优先', meta: '1.85rem · 600' },
                { cls: 'body', label: 'Body', sample: '基于宋体字形节奏与温暖色系构建，覆盖完整 UI 场景。', meta: '1rem · 400' },
                { cls: 'caption', label: 'Caption', sample: '辅助信息层级', meta: '0.875rem · 400', last: true },
              ].map((r) => (
                <div key={r.cls} className={`v2-type-row ${r.cls} ${r.last ? 'last' : ''}`}>
                  <div className="lbl">{r.label}</div>
                  <div className="sample">{r.sample}</div>
                  <div className="meta">{r.meta}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 04 · Components */}
        <div className="v2-cell">
          <div className="v2-cell-head">
            <span className="v2-num">§ 04</span>
            <span className="v2-head-title">Components</span>
            <span className="v2-head-meta">27 primitives<br/>stable</span>
          </div>
          <div className="v2-cell-body" style={{ padding: 0 }}>
            <div className="v2-tabs">
              {[
                { v: 'btn', l: 'Buttons' },
                { v: 'form', l: 'Form' },
                { v: 'badge', l: 'Badges' },
              ].map((t) => (
                <button key={t.v} className={`v2-tab ${tab === t.v ? 'on' : ''}`} onClick={() => setTab(t.v)}>{t.l}</button>
              ))}
            </div>
            <div className="v2-comp-panel">
              {tab === 'btn' && <>
                <button className="v2-btn primary">主要</button>
                <button className="v2-btn">中性</button>
                <button className="v2-btn danger">危险</button>
                <button className="v2-btn ghost">了解更多 →</button>
              </>}
              {tab === 'form' && <>
                <input className="v2-input" placeholder="普通输入框" />
                <span className={`v2-sw ${sw ? 'on' : ''}`} onClick={() => setSw(!sw)} />
                <label className={`v2-chk ${ck ? 'on' : ''}`} onClick={() => setCk(!ck)}>
                  <span className="b"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><path d="M5 12l5 5L20 7"/></svg></span>
                  勾选项
                </label>
              </>}
              {tab === 'badge' && <>
                <span className="v2-badge soft">中性</span>
                <span className="v2-badge primary">主要</span>
                <span className="v2-badge danger">危险</span>
                <span className="v2-badge">outline</span>
              </>}
            </div>
          </div>
        </div>

        {/* 05 · Icons */}
        <div className="v2-cell">
          <div className="v2-cell-head">
            <span className="v2-num">§ 05</span>
            <span className="v2-head-title">Icons</span>
            <span className="v2-head-meta">Tabler · stroke 1.5<br/>square / miter</span>
          </div>
          <div className="v2-cell-body" style={{ padding: 0 }}>
            <div className="v2-icon-grid">
              {V2_ICONS.map((n) => (
                <div key={n} className="v2-icon-cell"><i className={`ti ti-${n}`} /></div>
              ))}
            </div>
          </div>
        </div>

        <div className="v2-foot">
          <span>MIT · 2026</span>
          <span>§ FIN</span>
        </div>
      </main>
    </div>
  );
};

window.V2 = V2;
