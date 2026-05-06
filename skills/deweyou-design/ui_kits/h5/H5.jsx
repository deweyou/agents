/* H5 — Mobile Ledger catalog (375px viewport).
 * Mirrors Website V2 Ledger language: architectural grid, §NN numbering,
 * mono meta. All token-driven so light/dark swap by data-theme wrapper.
 */
/* eslint-disable */

const H5_ICONS = [
  'plus', 'x', 'check', 'search', 'edit', 'trash', 'settings', 'bell',
  'home', 'user', 'download', 'upload', 'refresh', 'filter', 'copy', 'eye',
  'eye-off', 'arrow-left', 'arrow-right', 'external-link',
];

const H5 = () => {
  const [tab, setTab] = React.useState('btn');
  const [sw, setSw] = React.useState(true);
  const [ck, setCk] = React.useState(true);

  return (
    <div className="h5-root">
      <style>{`
        .h5-root {
          font-family: var(--ui-font-body);
          background: var(--ui-color-canvas);
          color: var(--ui-color-text);
          width: 375px;
          min-height: 100%;
          --h5-line: color-mix(in srgb, var(--ui-color-text) 14%, transparent);
          --h5-line-strong: var(--ui-color-text);
        }

        /* ── Top bar (replaces V2 rail for mobile) ─────────────────── */
        .h5-topbar {
          position: sticky; top: 0; z-index: 10;
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px;
          background: var(--ui-color-canvas);
          border-bottom: 1px solid var(--h5-line-strong);
        }
        .h5-mark { font-family: var(--ui-font-display); font-weight: 700; font-size: 13px; letter-spacing: -0.01em; line-height: 1; }
        .h5-mark small { font: 400 9px/1 var(--ui-font-mono); color: var(--ui-color-text-muted); letter-spacing: 0.08em; margin-left: 6px; }
        .h5-menu-btn {
          background: transparent; border: 1px solid var(--ui-color-text); color: var(--ui-color-text);
          font: 500 9px/1 var(--ui-font-mono); letter-spacing: 0.14em; text-transform: uppercase;
          padding: 6px 10px; cursor: pointer;
        }

        /* ── Section cell ─────────────────────────────────────────── */
        .h5-cell { border-bottom: 1px solid var(--h5-line-strong); }
        .h5-cell-head {
          padding: 18px 16px 14px;
          display: flex; align-items: baseline; justify-content: space-between;
          border-bottom: 1px solid var(--h5-line);
        }
        .h5-head-left { display: flex; align-items: baseline; gap: 12px; }
        .h5-num { font: 400 10px/1 var(--ui-font-mono); letter-spacing: 0.12em; color: var(--ui-color-text-muted); }
        .h5-head-title { font: 600 1.05rem/1 var(--ui-font-display); letter-spacing: -0.005em; }
        .h5-head-meta { font: 400 9px/1.4 var(--ui-font-mono); color: var(--ui-color-text-muted); text-align: right; }

        /* ── Hero (00) ────────────────────────────────────────────── */
        .h5-hero { padding: 36px 16px 28px; position: relative; border-bottom: 1px solid var(--h5-line-strong); }
        .h5-hero-grid-bg {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(to right, var(--h5-line) 1px, transparent 1px),
            linear-gradient(to bottom, var(--h5-line) 1px, transparent 1px);
          background-size: 48px 48px;
          opacity: 0.55;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0.15));
        }
        .h5-hero-inner { position: relative; }
        .h5-hero-kicker {
          display: inline-flex; align-items: center;
          font: 500 9px/1 var(--ui-font-mono); letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--ui-color-text); padding-bottom: 4px;
          border-bottom: 1px solid var(--ui-color-text);
        }
        .h5-hero-title {
          font-family: var(--ui-font-display);
          font-size: 2.4rem;
          line-height: 1;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 22px 0 18px;
        }
        .h5-hero-title span { color: var(--ui-color-brand-text); font-weight: 500; font-style: italic; }
        .h5-hero-desc {
          font-family: var(--ui-font-display);
          font-size: 0.95rem; line-height: 1.55;
          margin: 0 0 22px;
        }
        .h5-hero-row { display: flex; flex-direction: column; gap: 10px; }
        .h5-hero-cmd {
          font: 400 11px/1 var(--ui-font-mono);
          padding: 11px 12px; border: 1px solid var(--ui-color-text);
          background: color-mix(in srgb, var(--ui-color-text) 4%, transparent);
          text-align: center;
        }
        .h5-btn-solid {
          font: 500 0.875rem/1 var(--ui-font-display);
          padding: 12px 14px;
          background: var(--ui-color-text); color: var(--ui-color-canvas);
          border: 1px solid var(--ui-color-text); cursor: pointer;
          text-align: center;
        }

        .h5-stats {
          margin-top: 28px;
          display: grid; grid-template-columns: repeat(2, 1fr);
          border-top: 1px solid var(--h5-line);
        }
        .h5-stat {
          padding: 14px 12px 10px;
          border-right: 1px solid var(--h5-line);
          border-bottom: 1px solid var(--h5-line);
        }
        .h5-stat:nth-child(2n) { border-right: none; }
        .h5-stat:nth-last-child(-n+2) { border-bottom: none; }
        .h5-stat-n { font-family: var(--ui-font-display); font-weight: 700; font-size: 1.85rem; line-height: 1; letter-spacing: -0.02em; }
        .h5-stat-l { font: 400 9px/1 var(--ui-font-mono); letter-spacing: 0.1em; color: var(--ui-color-text-muted); margin-top: 6px; text-transform: uppercase; }

        /* ── Palette tile wall (02) ───────────────────────────────── */
        .h5-palette { display: grid; grid-template-columns: repeat(5, 1fr); }
        .h5-swatch {
          aspect-ratio: 1 / 1;
          padding: 6px 7px;
          display: flex; flex-direction: column; justify-content: flex-end;
          font: 400 8px/1.2 var(--ui-font-mono);
          border-right: 1px solid var(--h5-line);
          border-bottom: 1px solid var(--h5-line);
        }
        .h5-swatch:nth-child(5n) { border-right: none; }
        .h5-row-last { border-bottom: none; }
        .h5-swatch-fam { font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2px; }

        /* ── Type rows (03) ───────────────────────────────────────── */
        .h5-type-row {
          display: grid; grid-template-columns: 56px 1fr;
          align-items: baseline;
          padding: 12px 16px;
          border-bottom: 1px solid var(--h5-line);
        }
        .h5-type-row.last { border-bottom: none; }
        .h5-type-row .lbl { font: 400 10px/1 var(--ui-font-mono); color: var(--ui-color-text-muted); letter-spacing: 0.06em; }
        .h5-type-row .meta { font: 400 9px/1.4 var(--ui-font-mono); color: var(--ui-color-text-muted); margin-top: 4px; grid-column: 2; }
        .h5-type-row .sample { font-family: var(--ui-font-display); }
        .h5-type-row.h1 .sample { font-size: 1.85rem; line-height: 1.04; font-weight: 700; letter-spacing: -0.02em; }
        .h5-type-row.h2 .sample { font-size: 1.35rem; line-height: 1.1; font-weight: 600; }
        .h5-type-row.h3 .sample { font-size: 1.1rem; line-height: 1.2; font-weight: 600; }
        .h5-type-row.body .sample { font-size: 0.95rem; line-height: 1.55; }
        .h5-type-row.caption .sample { font-size: 0.8125rem; color: var(--ui-color-text-muted); }

        /* ── Component tabs (04) ──────────────────────────────────── */
        .h5-tabs {
          display: grid; grid-template-columns: repeat(3, 1fr);
          border-bottom: 1px solid var(--h5-line);
        }
        .h5-tab {
          font: 500 0.8125rem/1 var(--ui-font-display);
          padding: 0; height: 40px;
          background: transparent; border: 0; cursor: pointer;
          color: var(--ui-color-text-muted);
          border-right: 1px solid var(--h5-line);
          transition: background 140ms ease, color 140ms ease;
        }
        .h5-tab:last-child { border-right: none; }
        .h5-tab.on { color: var(--ui-color-text); background: color-mix(in srgb, var(--ui-color-text) 5%, transparent); }
        .h5-comp-panel { padding: 20px 16px 24px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; min-height: 100px; }

        /* Buttons */
        .h5-btn {
          font: 500 0.875rem/1 var(--ui-font-display);
          padding: 10px 14px;
          border: 1px solid var(--ui-color-text); background: transparent; color: var(--ui-color-text);
          cursor: pointer; transition: background 140ms ease, color 140ms ease;
          min-height: 44px;
        }
        .h5-btn.primary { background: var(--ui-color-brand-bg); border-color: var(--ui-color-brand-bg); color: var(--ui-color-text-on-brand, var(--ui-color-canvas)); }
        .h5-btn.danger { background: transparent; border-color: var(--ui-color-danger-bg); color: var(--ui-color-danger-text); }
        .h5-btn.ghost { border-color: transparent; padding-left: 4px; padding-right: 4px; }
        .h5-btn:active { background: var(--ui-color-text); color: var(--ui-color-canvas); }
        .h5-btn.primary:active { background: var(--ui-color-brand-bg-hover); border-color: var(--ui-color-brand-bg-hover); }
        .h5-btn.danger:active { background: var(--ui-color-danger-bg); color: var(--ui-color-canvas); }
        .h5-btn.full { flex-basis: 100%; text-align: center; }

        /* Form */
        .h5-input { padding: 10px 12px; border: 1px solid var(--ui-color-text); background: transparent; color: var(--ui-color-text); font: 400 0.9rem/1.4 var(--ui-font-display); outline: none; flex: 1 1 100%; min-height: 44px; }
        .h5-input:focus { border-color: var(--ui-color-brand-bg); }
        .h5-input::placeholder { color: var(--ui-color-text-muted); }

        /* Badge */
        .h5-badge { display: inline-flex; align-items: center; padding: 4px 10px; font: 500 11px/1.3 var(--ui-font-display); border: 1px solid var(--ui-color-text); }
        .h5-badge.primary { border-color: var(--ui-color-brand-bg); color: var(--ui-color-brand-text); }
        .h5-badge.danger { border-color: var(--ui-color-danger-bg); color: var(--ui-color-danger-text); }
        .h5-badge.soft { border-color: transparent; background: color-mix(in srgb, var(--ui-color-text) 7%, transparent); }

        /* Switch */
        .h5-sw-row { display: flex; align-items: center; gap: 10px; font: 400 0.875rem/1 var(--ui-font-display); }
        .h5-sw { width: 36px; height: 18px; border: 1px solid var(--ui-color-text); position: relative; cursor: pointer; flex-shrink: 0; }
        .h5-sw::after { content: ''; position: absolute; top: 2px; left: 2px; width: 12px; height: 12px; background: var(--ui-color-text); transition: left 140ms ease; }
        .h5-sw.on { background: var(--ui-color-brand-bg); border-color: var(--ui-color-brand-bg); }
        .h5-sw.on::after { background: var(--ui-color-text-on-brand, var(--ui-color-canvas)); left: 20px; }

        /* Checkbox */
        .h5-chk { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font: 400 0.875rem/1 var(--ui-font-display); min-height: 44px; }
        .h5-chk .b { width: 16px; height: 16px; border: 1px solid var(--ui-color-text); display: inline-flex; align-items: center; justify-content: center; }
        .h5-chk.on .b { background: var(--ui-color-text); color: var(--ui-color-canvas); }
        .h5-chk svg { width: 11px; height: 11px; display: none; }
        .h5-chk.on svg { display: block; }

        /* List card (mobile-native pattern, kept ledger-flat) */
        .h5-list { display: flex; flex-direction: column; }
        .h5-list-row {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px;
          border-bottom: 1px solid var(--h5-line);
          min-height: 56px;
        }
        .h5-list-row:last-child { border-bottom: none; }
        .h5-list-icon { width: 32px; height: 32px; border: 1px solid var(--ui-color-text); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .h5-list-body { flex: 1; min-width: 0; }
        .h5-list-title { font: 500 0.9375rem/1.2 var(--ui-font-display); }
        .h5-list-meta { font: 400 11px/1.3 var(--ui-font-mono); color: var(--ui-color-text-muted); margin-top: 3px; letter-spacing: 0.04em; }
        .h5-list-arrow { font: 400 14px/1 var(--ui-font-mono); color: var(--ui-color-text-muted); }

        /* Icons grid (05) */
        .h5-icon-grid { display: grid; grid-template-columns: repeat(5, 1fr); }
        .h5-icon-cell {
          aspect-ratio: 1;
          display: flex; align-items: center; justify-content: center;
          border-right: 1px solid var(--h5-line);
          border-bottom: 1px solid var(--h5-line);
          color: var(--ui-color-text); font-size: 18px;
        }
        .h5-icon-cell:nth-child(5n) { border-right: none; }
        .h5-icon-cell:nth-last-child(-n+5) { border-bottom: none; }
        .h5-icon-cell i { stroke-linecap: square; stroke-linejoin: miter; }

        /* Footer */
        .h5-foot {
          padding: 16px;
          display: flex; justify-content: space-between;
          font: 400 10px/1 var(--ui-font-mono); color: var(--ui-color-text-muted); letter-spacing: 0.1em;
        }

        /* Bottom tab bar — mobile-native pattern in ledger language */
        .h5-bottom-bar {
          position: sticky; bottom: 0; z-index: 10;
          display: grid; grid-template-columns: repeat(4, 1fr);
          background: var(--ui-color-canvas);
          border-top: 1px solid var(--h5-line-strong);
        }
        .h5-bottom-tab {
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          padding: 10px 0 12px;
          background: transparent; border: 0; cursor: pointer;
          color: var(--ui-color-text-muted);
          border-right: 1px solid var(--h5-line);
          font: 400 9px/1 var(--ui-font-mono); letter-spacing: 0.1em; text-transform: uppercase;
        }
        .h5-bottom-tab:last-child { border-right: none; }
        .h5-bottom-tab.on { color: var(--ui-color-text); }
        .h5-bottom-tab i { font-size: 18px; stroke-linecap: square; stroke-linejoin: miter; }
      `}</style>

      {/* Top bar */}
      <header className="h5-topbar">
        <div className="h5-mark">Deweyou<small>v1.0</small></div>
        <button className="h5-menu-btn">§ Index</button>
      </header>

      {/* Hero — 00 */}
      <section className="h5-hero">
        <div className="h5-hero-grid-bg" />
        <div className="h5-hero-inner">
          <span className="h5-hero-kicker">Mobile Library · 00</span>
          <h1 className="h5-hero-title">Architecture for <span>serif</span> screens.</h1>
          <p className="h5-hero-desc">为移动端构建：宋体节奏、温暖色系、深浅双主题，44px 触控热区。</p>
          <div className="h5-hero-row">
            <code className="h5-hero-cmd">$ npm i @deweyou-design/h5</code>
            <button className="h5-btn-solid">查看 Storybook →</button>
          </div>
          <div className="h5-stats">
            <div className="h5-stat"><div className="h5-stat-n">27</div><div className="h5-stat-l">Components</div></div>
            <div className="h5-stat"><div className="h5-stat-n">30</div><div className="h5-stat-l">Icons</div></div>
            <div className="h5-stat"><div className="h5-stat-n">26</div><div className="h5-stat-l">Color Families</div></div>
            <div className="h5-stat"><div className="h5-stat-n">02</div><div className="h5-stat-l">Themes</div></div>
          </div>
        </div>
      </section>

      {/* 02 · Palette */}
      <section className="h5-cell">
        <div className="h5-cell-head">
          <div className="h5-head-left">
            <span className="h5-num">§ 02</span>
            <span className="h5-head-title">Palette</span>
          </div>
          <span className="h5-head-meta">3 roles<br />9 steps</span>
        </div>
        <div className="h5-palette">
          {['emerald', 'red', 'stone'].map((fam, rowIdx) => (
            [950, 800, 700, 500, 300].map((step, i) => {
              const last = rowIdx === 2;
              return (
                <div
                  key={`${fam}-${step}`}
                  className={`h5-swatch ${last ? 'h5-row-last' : ''}`}
                  style={{
                    background: `var(--ui-color-palette-${fam}-${step})`,
                    color: step <= 400 ? 'var(--ui-color-text)' : 'var(--ui-color-canvas)',
                  }}
                >
                  {i === 0 && <div className="h5-swatch-fam">{fam}</div>}
                  <div>{step}</div>
                </div>
              );
            })
          ))}
        </div>
      </section>

      {/* 03 · Type */}
      <section className="h5-cell">
        <div className="h5-cell-head">
          <div className="h5-head-left">
            <span className="h5-num">§ 03</span>
            <span className="h5-head-title">Type</span>
          </div>
          <span className="h5-head-meta">Source Han<br />Serif CN</span>
        </div>
        <div>
          {[
            { cls: 'h1', label: 'H1', sample: 'Design 设计', meta: '1.85rem · 700' },
            { cls: 'h2', label: 'H2', sample: '组件库 · 双主题', meta: '1.35rem · 600' },
            { cls: 'h3', label: 'H3', sample: '简约 · 中文优先', meta: '1.1rem · 600' },
            { cls: 'body', label: 'Body', sample: '基于宋体字形与温暖色系构建。', meta: '0.95rem · 400' },
            { cls: 'caption', label: 'Caption', sample: '辅助信息层级', meta: '0.8125rem · 400', last: true },
          ].map((r) => (
            <div key={r.cls} className={`h5-type-row ${r.cls} ${r.last ? 'last' : ''}`}>
              <div className="lbl">{r.label}</div>
              <div className="sample">{r.sample}</div>
              <div className="meta">{r.meta}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 04 · Components */}
      <section className="h5-cell">
        <div className="h5-cell-head">
          <div className="h5-head-left">
            <span className="h5-num">§ 04</span>
            <span className="h5-head-title">Components</span>
          </div>
          <span className="h5-head-meta">44px<br />touch min</span>
        </div>
        <div className="h5-tabs">
          {[
            { v: 'btn', l: 'Buttons' },
            { v: 'form', l: 'Form' },
            { v: 'badge', l: 'Badges' },
          ].map((t) => (
            <button key={t.v} className={`h5-tab ${tab === t.v ? 'on' : ''}`} onClick={() => setTab(t.v)}>{t.l}</button>
          ))}
        </div>
        <div className="h5-comp-panel">
          {tab === 'btn' && <>
            <button className="h5-btn primary full">主要操作</button>
            <button className="h5-btn">中性</button>
            <button className="h5-btn danger">危险</button>
            <button className="h5-btn ghost">了解更多 →</button>
          </>}
          {tab === 'form' && <>
            <input className="h5-input" placeholder="普通输入框" />
            <div className="h5-sw-row">
              <span className={`h5-sw ${sw ? 'on' : ''}`} onClick={() => setSw(!sw)} />
              <span>消息推送</span>
            </div>
            <label className={`h5-chk ${ck ? 'on' : ''}`} onClick={() => setCk(!ck)}>
              <span className="b"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><path d="M5 12l5 5L20 7" /></svg></span>
              已阅读条款
            </label>
          </>}
          {tab === 'badge' && <>
            <span className="h5-badge soft">中性</span>
            <span className="h5-badge primary">主要</span>
            <span className="h5-badge danger">危险</span>
            <span className="h5-badge">outline</span>
          </>}
        </div>
      </section>

      {/* 05 · List patterns */}
      <section className="h5-cell">
        <div className="h5-cell-head">
          <div className="h5-head-left">
            <span className="h5-num">§ 05</span>
            <span className="h5-head-title">List</span>
          </div>
          <span className="h5-head-meta">mobile-native<br />pattern</span>
        </div>
        <div className="h5-list">
          {[
            { ic: 'user', t: '账户与安全', m: 'ACCOUNT · 已认证' },
            { ic: 'bell', t: '通知设置', m: 'PUSH · 8 项已开启' },
            { ic: 'download', t: '离线下载', m: 'STORAGE · 占用 124 MB' },
            { ic: 'settings', t: '通用', m: 'GENERAL · 语言 · 主题' },
          ].map((row) => (
            <div key={row.ic} className="h5-list-row">
              <div className="h5-list-icon"><i className={`ti ti-${row.ic}`} /></div>
              <div className="h5-list-body">
                <div className="h5-list-title">{row.t}</div>
                <div className="h5-list-meta">{row.m}</div>
              </div>
              <div className="h5-list-arrow">→</div>
            </div>
          ))}
        </div>
      </section>

      {/* 06 · Icons */}
      <section className="h5-cell">
        <div className="h5-cell-head">
          <div className="h5-head-left">
            <span className="h5-num">§ 06</span>
            <span className="h5-head-title">Icons</span>
          </div>
          <span className="h5-head-meta">Tabler<br />stroke 1.5</span>
        </div>
        <div className="h5-icon-grid">
          {H5_ICONS.map((n) => (
            <div key={n} className="h5-icon-cell"><i className={`ti ti-${n}`} /></div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="h5-foot">
        <span>MIT · 2026</span>
        <span>§ FIN</span>
      </div>

      {/* Bottom nav — mobile-native */}
      <nav className="h5-bottom-bar">
        {[
          { i: 'home', l: 'Home', on: true },
          { i: 'search', l: 'Browse' },
          { i: 'bell', l: 'Inbox' },
          { i: 'user', l: 'Me' },
        ].map((t) => (
          <button key={t.i} className={`h5-bottom-tab ${t.on ? 'on' : ''}`}>
            <i className={`ti ti-${t.i}`} />
            <span>{t.l}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

window.H5 = H5;
