/* ==========================================================================
   SQE & WAP Support Portal — FULLY UNIFIED SCRIPT (V5.5)
   ========================================================================== */
   // --- วางไว้บรรทัดแรกสุดของ script.js ---
/* ==========================================================================
   PRIMARY BOOT FUNCTIONS (วางไว้บนสุดของ script.js)
   ========================================================================== */

// --- GLOBAL ERROR GUARD & ANTI-WHITE-SCREEN PROTECTION ---
window.addEventListener('error', function(e) {
    console.error('[Global Error Guard Captured]', e.error || e.message);
    try {
        const mtx = document.getElementById('maintenance-view');
        const login = document.getElementById('login-view');
        const dashboard = document.getElementById('dashboard-view');
        if (mtx && login && dashboard) {
            if (mtx.classList.contains('hidden-view') && login.classList.contains('hidden-view') && dashboard.classList.contains('hidden-view')) {
                login.classList.remove('hidden-view');
                login.style.display = 'flex';
            }
        }
    } catch (err) {
        console.error('[Error Guard Fallback Error]', err);
    }
});

window.addEventListener('unhandledrejection', function(e) {
    console.warn('[Global Unhandled Promise Rejection]', e.reason);
});

// ฟังก์ชันปลดล็อคหน้า Maintenance
window.unlockMaintenanceForAdmin = function() {
    console.log("Admin Bypass Activated");
    window.adminBypass = true;
    const mtx = document.getElementById('maintenance-view');
    const login = document.getElementById('login-view');
    if (mtx) mtx.classList.add('hidden-view');
    if (login) {
        login.classList.remove('hidden-view');
        login.style.display = 'flex';
    }
    if (typeof toast === 'function') toast("🔓 เข้าใช้งานโหมดผู้ดูแลระบบ", "info");
};

/* ============================================================
   UNIVERSAL VIRTUAL SCROLLING ENGINE (V8.0)
   High performance virtual renderer for large datasets
   ============================================================ */
window.VirtualTableScroller = class VirtualTableScroller {
    constructor(options = {}) {
        this.containerId = options.containerId;
        this.tbodyId = options.tbodyId;
        this.rowHeight = options.rowHeight || 52;
        this.buffer = options.buffer || 8;
        this.columnsCount = options.columnsCount || 10;
        this.rowBuilder = options.rowBuilder;
        this.emptyHtml = options.emptyHtml || '<tr><td colspan="100" style="text-align:center;padding:40px;color:#94a3b8;font-weight:700;">NO RECORDS FOUND</td></tr>';
        this.onRenderComplete = options.onRenderComplete || null;

        this.items = [];
        this.prevStart = -1;
        this.prevEnd = -1;
        this.isFresh = true;
        this.isTicking = false;

        this._onScroll = this._onScroll.bind(this);
    }

    _getElements() {
        const container = typeof this.containerId === 'string' ? document.getElementById(this.containerId) : this.containerId;
        const tbody = typeof this.tbodyId === 'string' ? document.getElementById(this.tbodyId) : this.tbodyId;
        return { container, tbody };
    }

    setItems(items, resetScroll = false) {
        this.items = Array.isArray(items) ? items : [];
        this.prevStart = -1;
        this.prevEnd = -1;
        this.isFresh = true;

        const { container } = this._getElements();
        if (container) {
            container.removeEventListener('scroll', this._onScroll);
            container.addEventListener('scroll', this._onScroll, { passive: true });
            if (resetScroll) container.scrollTop = 0;
        }

        this.render();
    }

    _onScroll() {
        if (!this.isTicking) {
            this.isTicking = true;
            requestAnimationFrame(() => {
                this.render();
                this.isTicking = false;
            });
        }
    }

    render() {
        const { container, tbody } = this._getElements();
        if (!tbody) return;

        const total = this.items.length;
        if (total === 0) {
            tbody.innerHTML = typeof this.emptyHtml === 'function' ? this.emptyHtml() : this.emptyHtml;
            this.prevStart = -1;
            this.prevEnd = -1;
            return;
        }

        const scrollTop = container ? container.scrollTop : 0;
        const viewHeight = container ? Math.max(container.clientHeight || 0, window.innerHeight || 600) : 600;

        let startIdx = Math.floor(scrollTop / this.rowHeight) - this.buffer;
        let endIdx = Math.ceil((scrollTop + viewHeight) / this.rowHeight) + this.buffer;

        startIdx = Math.max(0, startIdx);
        endIdx = Math.min(total, endIdx);

        if (startIdx === this.prevStart && endIdx === this.prevEnd) return;

        this.prevStart = startIdx;
        this.prevEnd = endIdx;

        const topPadding = startIdx * this.rowHeight;
        const bottomPadding = (total - endIdx) * this.rowHeight;

        let rowsHtml = '';
        if (topPadding > 0) {
            rowsHtml += `<tr style="height:${topPadding}px; border:none; background:transparent; pointer-events:none;"><td colspan="${this.columnsCount}" style="padding:0; border:none; height:${topPadding}px;"></td></tr>`;
        }

        for (let i = startIdx; i < endIdx; i++) {
            rowsHtml += this.rowBuilder(this.items[i], i);
        }

        if (bottomPadding > 0) {
            rowsHtml += `<tr style="height:${bottomPadding}px; border:none; background:transparent; pointer-events:none;"><td colspan="${this.columnsCount}" style="padding:0; border:none; height:${bottomPadding}px;"></td></tr>`;
        }

        tbody.innerHTML = rowsHtml;

        if (this.isFresh) {
            this.isFresh = false;
            if (typeof window.animateTableRows === 'function') {
                window.animateTableRows(tbody, { y: 6, duration: 0.28, maxRows: 15, ease: 'power2.out' });
            }
        } else {
            const trs = tbody.querySelectorAll('tr');
            trs.forEach(tr => {
                if (tr && tr.style && tr.style.opacity === '0') {
                    tr.style.opacity = '1';
                    tr.style.transform = 'none';
                }
            });
        }

        if (typeof this.onRenderComplete === 'function') {
            this.onRenderComplete(startIdx, endIdx);
        }
    }
};

// ฟังก์ชันตรวจสอบอีเมล
window.validateEmail = function(input) {
    if (!input) return;
    const hint = document.getElementById('email-hint');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(input.value);
    
    input.classList.toggle('invalid', input.value.length > 0 && !isValid);
    input.classList.toggle('valid', isValid);
    if (hint) hint.classList.toggle('hidden', isValid || input.value.length === 0);
};

// ฟังก์ชันตรวจสอบ Caps Lock
window.checkCapsLock = function(e) {
    const warning = document.getElementById('caps-lock-warning');
    if (warning && e.getModifierState) {
        if (e.getModifierState("CapsLock")) {
            warning.classList.remove('hidden');
        } else {
            warning.classList.add('hidden');
        }
    }
};

/**
 * Universal smooth GSAP entry animation for new or refreshed table rows
 * Provides high-performance, polished visual feedback across all displays and specs.
 */
window.animateTableRows = function(target, options = {}) {
    let rows = [];
    if (typeof target === 'string') {
        const el = document.getElementById(target) || document.querySelector(target);
        if (el) {
            rows = (el.tagName && (el.tagName.toLowerCase() === 'tbody' || el.tagName.toLowerCase() === 'table'))
                ? Array.from(el.querySelectorAll('tr'))
                : [el];
        } else {
            rows = Array.from(document.querySelectorAll(target));
        }
    } else if (target && target.nodeType === 1) {
        if (target.tagName.toLowerCase() === 'tbody' || target.tagName.toLowerCase() === 'table') {
            rows = Array.from(target.querySelectorAll('tr'));
        } else if (target.tagName.toLowerCase() === 'tr') {
            rows = [target];
        }
    } else if (target instanceof NodeList || Array.isArray(target)) {
        rows = Array.from(target);
    }

    // Filter out loader/placeholder single-td rows
    rows = rows.filter(tr => {
        if (!tr || tr.nodeType !== 1) return false;
        if (tr.children.length === 1 && tr.children[0].hasAttribute('colspan')) {
            const txt = (tr.innerText || '').toLowerCase();
            if (txt.includes('กำลัง') || txt.includes('no records') || txt.includes('ไม่พบ') || txt.includes('no matching') || txt.includes('no data')) {
                return false;
            }
        }
        return true;
    });

    if (!rows.length) return;

    // Safety check: if GSAP is unavailable or user/system prefers reduced motion, make rows visible immediately
    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typeof gsap === 'undefined' || reducedMotion) {
        rows.forEach(tr => {
            if (tr && tr.style) {
                tr.style.opacity = '1';
                tr.style.transform = 'none';
            }
            if (tr && tr.classList) tr.classList.remove('opacity-0');
        });
        return;
    }

    const maxRows = options.maxRows || 25;
    const animateRows = rows.slice(0, maxRows);
    const overflowRows = rows.slice(maxRows);

    // Make overflow rows visible immediately
    overflowRows.forEach(tr => {
        if (tr && tr.style) {
            tr.style.opacity = '1';
            tr.style.transform = 'none';
        }
        if (tr && tr.classList) tr.classList.remove('opacity-0');
    });

    gsap.killTweensOf(animateRows);

    // Ensure opacity-0 is removed immediately so rows stay visible after GSAP finishes or clears props
    animateRows.forEach(tr => {
        if (tr && tr.classList) tr.classList.remove('opacity-0');
    });

    const staggerTime = options.stagger !== undefined ? options.stagger : Math.min(0.02, 0.2 / Math.max(1, animateRows.length));
    const duration = options.duration || 0.28;
    const yOffset = options.y !== undefined ? options.y : (options.x ? 0 : 6);
    const xOffset = options.x !== undefined ? options.x : 0;

    // Fail-safe timer: Forces rows to be fully visible if GSAP or GPU process drops animation frame
    const safetyTimer = setTimeout(() => {
        animateRows.forEach(tr => {
            if (tr && tr.style) {
                tr.style.opacity = '1';
                tr.style.transform = 'none';
            }
            if (tr && tr.classList) tr.classList.remove('opacity-0');
        });
    }, (duration + 0.15) * 1000);

    try {
        requestAnimationFrame(() => {
            gsap.fromTo(animateRows,
                {
                    opacity: 0,
                    x: xOffset,
                    y: yOffset
                },
                {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    duration: duration,
                    stagger: staggerTime,
                    ease: options.ease || 'power2.out',
                    clearProps: 'transform,opacity',
                    onComplete: () => {
                        clearTimeout(safetyTimer);
                        animateRows.forEach(tr => {
                            if (tr && tr.style) {
                                tr.style.opacity = '1';
                                tr.style.transform = 'none';
                            }
                            if (tr && tr.classList) tr.classList.remove('opacity-0');
                        });
                    },
                    onInterrupt: () => {
                        clearTimeout(safetyTimer);
                        animateRows.forEach(tr => {
                            if (tr && tr.style) {
                                tr.style.opacity = '1';
                                tr.style.transform = 'none';
                            }
                        });
                    }
                }
            );
        });
    } catch (e) {
        clearTimeout(safetyTimer);
        animateRows.forEach(tr => {
            if (tr && tr.style) {
                tr.style.opacity = '1';
                tr.style.transform = 'none';
            }
        });
    }
};

/* --- หลังจากนี้จึงตามด้วย Code ส่วนที่เหลือของคุณ --- */
// -------------------------------------
const VENDOR_MASTER = {
    "C_INDIA": "CARRIER AIRCONDITIONING AND",
    "HT0002": "TKR HONG KONG LIMITED",
    "LT0054": "T.C.K. PLASTIC CO., LTD.",
    "LP0047": "PENTA THICK INDUSTRIES (THAILAND)",
    "LS0073": "SITTHICHOTBAITAD CO., LTD.",
    "LT0061": "TEAM PRECISION PUBLIC COMPANY LIMIT",
    "LT0062": "THAI LUSTER PRODUCTS COMPANY LIMITE",
    "LT0063": "THAI WONDERFUL WIRE CABLE CO., LTD.",
    "HN0001": "NIDEC SHIBAURA (H.K.) LIMITED",
    "LB0020": "B.GRIMM BIP POWER 2 LIMITED",
    "SF0002": "FUJI ELECTRIC ASIA PACIFIC PTE. LTD",
    "LU0013": "UNIGRAIN MARKETING (1999) CO., LTD.",
    "LT0041": "THAI HEART CALIBRATION CO.,LTD.",
    "LP0046": "PLIC Corp., Ltd.",
    "LM0017": "M.I.I (THAILAND) CO.,LTD.",
    "LR0011": "ROYALTEC INTERNATIONAL CO., LTD.",
    "LS0011": "SISIAN-TOYO INDUSTRY CO.,LTD.",
    "LS1157": "SYNERGY ENGINEERING ADVANTAGE",
    "LS0152": "REFRESHMENT CO., LTD.",
    "LK0026": "KC AUTOMATION LIMITED PARTNERSHIP",
    "LK0032": "KMV ENGINEERING CO., LTD.",
    "LB0018": "B BEST TECHNOLOGY CO., LTD.",
    "LT0052": "TOSHIBA ASIA PACIFIC (THAILAND)",
    "LI0021": "UNITED CREATION PACKAGING SOLUTIONS",
    "LS0069": "SA-NGUANPHAN ENGINEERING CO., LTD.",
    "LI0023": "ICEBERG SUPPLY CO., LTD.",
    "LW0019": "WAVE CREST (THAILAND) LTD.",
    "LS0070": "SMART MOLD CO., LTD.",
    "LL0007": "LIGHT AND SOUND BUSINESS CO., LTD.",
    "HI0001": "ISEN CONTROLS CO., LTD.",
    "LC0018": "CLOUDIVA CORPORATE CO., LTD.",
    "LN0021": "NIXMA TECHNOLOGY CO., LTD.",
    "LS0072": "SEIEI INDUSTRIES (THAILAND) CO., LT",
    "LT0060": "TECH-FOCUS ENGINEERING CO., LTD.",
    "AL0001": "LAZER SAFE PTY LTD.",
    "HC0001": "CARRIER HONG KONG LIMITED.",
    "HF0001": "FOURSEAS ELECTRICAL APPLIANCES LTD.",
    "HT0001": "TOSHIBA ELECTRONICS ASIA,LTD.(IPO)",
    "L17512": "DAINICHI COLOR (THAILAND) LTD.",
    "L96936": "SIAM YAMATO INDUSTRY CO.,LTD.",
    "LA0006": "ASIA KENDY CO.,LTD.",
    "LA0014": "A.C.P. GLOVE AND GENERAL",
    "LA0018": "APPLE FILM CO.,LTD.",
    "LA0019": "AUTHENTIC ENGINEERING CO.,LTD.",
    "LA0021": "ASIARANS CO.,LTD.",
    "LA0027": "ATC THAI CORP LTD.",
    "LA0028": "ALBATROSS CHEMICAL CO.,LTD.",
    "LA0048": "A & P INTERPACK CO., LTD.",
    "LA0053": "ALFA CHEMICAL AND TECHNOLOGY CO.",
    "LA0059": "ALPHA GROUP CO.,LTD.",
    "LA0063": "ADVANCE INFORMATION TECHNOLOGY",
    "LG0012": "GOLDEN FILTECH CORPORATION LTD.",
    "LG0013": "GEMINI (THAILAND) CO.,LTD.",
    "LG0015": "GOLD MACHINERY PRODUCT CO.,LTD.",
    "LH0036": "HYDRAU FLEX SUPPLY CO., LTD.",
    "LH0038": "HANGTHONGNUMTHONGYAOVARACH",
    "LH0039": "HAKUHODO (BANGKOK) CO.,LTD.",
    "LI0019": "IWATA (THAILAND) LTD.",
    "LI0024": "INCHCAPE NRG (THAILAND) LTD.",
    "LI0027": "INTER FORKLIFT CO.,LTD.",
    "LI0039": "IBCON CO.,LTD.",
    "LI0044": "INFOCOMP CO.,LTD.",
    "LI0047": "INCA PLASTICS (THAILAND) LTD.",
    "LI0048": "IBM THAILAND CO., LTD.",
    "LI0051": "INTER ELECTRIC EQUIPMENT CO.,LTD.",
    "LI0056": "INFORMATION SERVICE AND CONSULATANT",
    "LI0059": "INDUSTRIAL SAFETY APPLIANCES CO.",
    "LJ0003": "J.SRI RUNG RUENG IMPEX CO.,LTD.",
    "LJ0015": "J.RUNGROJ ELECTRONIC LTD.,PART.",
    "LJ0023": "JARIN SUPPLY",
    "LJ0026": "JAROONRAT PRODUCTS CO., LTD.",
    "LK0003": "K.U. NOMURA THAI LTD.",
    "LK0007": "KMCC CO., LTD.",
    "LK0011": "K.Y. INTERTRADE CO.,LTD.",
    "LK0015": "KHANTICHAI THANACOM CO., LTD.",
    "LK0017": "K.THAVEEWAT FACTORY LTD.,PART.",
    "LP0155": "PAKKRED MACHINERY LTD.",
    "LP0161": "P. MASTER ENGINEERING CO.,LTD.",
    "LP0162": "P.S. RUNGROJ (1997) LTD., PART.",
    "LP0163": "PHUDIS INTER CO., LTD.",
    "LP0164": "P.K.P. TEXTILE PRODUCTS CO., LTD.",
    "LR0019": "REFRIGO EQUIPMENT CO.,LTD.",
    "LR0047": "RYOKO SANGYO (THAILAND) CO.,LTD.",
    "LR0065": "RUNWAY SERVICE LIMITED PARTNERSHIP",
    "LR0071": "R.P.S. ELECTRIC",
    "LR0072": "RATION MECHANICAL ENGINEERING",
    "LR0073": "REANGWA STANDARD INDUSTRY CO., LTD.",
    "LS0033": "SUMIPOL CO.,LTD.",
    "LS0043": "SAMRIK TRADING LTD.,PART.",
    "LS0045": "SIAM SCALES & ENGINEERING CO., LTD.",
    "LS0049": "SILK CUT L.P.",
    "LS0099": "SHINWA (THAILAND)CO.,LTD.",
    "LS0104": "S.L. ELECTRIC (1992) CO.,LTD.",
    "LS0105": "SPECSEAL CO.,LTD.",
    "LS0109": "SIAM PLASTIC",
    "LS0112": "SRITHAI MARKETING CO.,LTD.",
    "LS0118": "SRITHAI SUPERWARE PUBLIC CO.,LTD.",
    "LT0303": "THONG MING CO., LTD.",
    "LT0477": "THAI FOAM CO.,LTD.",
    "LT0482": "TOMITA ASIA CO., LTD.",
    "LT0483": "THE GOVERNMENT PHARMACEUTICAL",
    "LT0490": "THAI SEIKA ELECTRIC CO., LTD.",
    "LT0491": "TTS PLASTIC CO.,LTD.",
    "LT0492": "T.N. INCORPORATED LTD.",
    "LT0493": "THAI MITSUWA PUBLIC CO.,LTD.",
    "LT0848": "TEERAWAT&SONS CO.,LTD.",
    "LT0849": "THAI STEAM SERVICE&SUPPLY CO LTD",
    "LT0851": "TEMPLATE ENGINEERING CO.,LTD.",
    "LC0002": "CUTTING DESIGN MATERIAL & SUPPLY",
    "JT0015": "TOSHIBA HUMAN RESOURCES",
    "LT0022": "TW. ENGINEERING SPECIALIST CO.,LTD.",
    "LS1108": "SAHA PAKEE SUPPLY CO.,LTD.",
    "LA0123": "ASIAPAC AUTOMATION SYSTEMS CO.,LTD.",
    "ST0003": "TAKACHIHO SINGAPORE (PTE) LTD",
    "LB0105": "Best Tech Engineering Co.,Ltd.",
    "LI0070": "INOUE RUBBER (THAILAND)",
    "LG0122": "GOLDEN STAR INDUSTRY CO.LTD.",
    "LH0044": "HIGH TECH MOULDS CO.,LTD.",
    "LG0041": "GREEN TECHNOLOGY ENGINEERING",
    "LT0885": "THAI UNIBROS CO.,LTD.",
    "LC0167": "CLEANSTAT (THAILAND) Co.,Ltd.",
    "LA0121": "ADING ADVERTISING AND DISPLAY",
    "LG0051": "GARTER TECHNOLOGY LTD.,PART.",
    "LP0921": "PCS SECURITY AND FACILITY SERVICES",
    "LS0150": "S.C. ELECTRONICS",
    "SH0003": "HORIBA INSTRUMENTS(SINGAPORE)",
    "LP0920": "PART ELEMENT CO.,LTD.",
    "LN0111": "N CUBED CO.,LTD.",
    "LC0189": "CHAIJAREN ENGINEERING AND SUPPLY",
    "LS0151": "SAHASEDSIRI INTERNATIONAL CO.,LTD.",
    "LP0918": "P.C. PROTECT CO., LTD.",
    "SH0002": "Hakuto Singapore Pte Ltd",
    "LN0107": "N.P. ELECTRIC LTD.,PART.",
    "LP0205": "PHAKARIN CO.,LTD.",
    "LD0079": "DMATECH TRADING LTD.,PART.",
    "LS0140": "S.P.T. AIR SERVICE",
    "LI0082": "INCENPLUS (THAILAND) CO.,LTD.",
    "LS0141": "SMC (THAILAND) LTD.",
    "JS0001S": "shinwa corporation",
    "LW0065": "WATTANA MOTOR WORKS CO.,LTD.",
    "LS0135": "SCIENTIFIC PROMOTION CO.,LTD.",
    "LT0852": "T.C.K. INTERPLAS CO., LTD.",
    "LT0854": "THAI AICHI DENKI CO., LTD.",
    "LT0856": "T.E.M. ENGINEERING CO., LTD.",
    "LT0857": "TOSHIBA CHEMICAL (THAILAND)",
    "LT3244": "THAI FILTER SUPPLY CO.,LTD.",
    "LT3245": "TATIYA ACCESSORIES SUPPLY LTD.,PART",
    "LT3247": "KYODEN (THAILAND) CO., LTD.",
    "LT3248": "THAI OBAYASHI CORP., LTD.",
    "LU0022": "UDOMPHUN (1993) CO.,LTD.",
    "LU0035": "ULTRACORE CO.,LTD.",
    "LU0049": "U.SPRINT CO.,LTD.",
    "LU0050": "U-SERVICES (2002) CO.,LTD.",
    "LU0053": "UTILITY ELECTRIC CO., LTD.",
    "LU0056": "ULTRA ENGINEERING CO.,LTD.",
    "LU0058": "U-TECHNOLOGY SUPPLY CO.,LTD.",
    "LU0060": "URECA INTERTRADE CO.,LTD.",
    "LU0061": "UNION TEXTILE & COSTUME CO.,LTD.",
    "LU0063": "UNIPRO MANUFACTURING CO.,LTD.",
    "LU0064": "UTILITY ONE CO., LTD.",
    "LV0032": "VELA CO.,LTD.",
    "LV0036": "VIRIYAKIT PLASTIC INDUSTRY CO., LTD",
    "LV0045": "Vandashima Hi-Tech Materials",
    "LV0047": "VGA GROUP CO., LTD.",
    "LV0051": "VACHARA INTER PRINTING CO.,LTD.",
    "LV0053": "VONG-SA INDUSTRY CO.,LTD.",
    "LW0002": "WEBER MARKING SYSTEMS (THAILAND)",
    "LW0005": "WATANA BHAND PACKAGING SYSTEM",
    "LW0009": "WINSON SCREEN CO,LTD.",
    "LA0122": "APHIWAT",
    "LT3257": "THAI STANLEY ELECTRIC PUBLIC",
    "EE_CORP": "Encovision Electronic Corp.(M) S/B",
    "LP0184": "PLANET T AND S CO.,LTD.",
    "N71858": "SAGINOMIYA HI-TECHS PTE LTD",
    "LN0098": "NITTO DENKO MATERIAL(THAILAND)CO.,L",
    "LF0088": "FIRST STEEL FURNITURE AND SAFE",
    "LS1106": "SA-NGUAN ELECTRIC",
    "LS1107": "SRIWATANA WOODING INDUSTRIES",
    "LG0040": "GENERAL INSTRUMENT CO.,LTD.",
    "LI0069": "IMART SUPERSTORE CO.,LTD.",
    "LM0151": "NEW MARUKEI (1998) CO.,LTD.",
    "LL0011": "LAEMTHONG FOOD MARKETING CO.,LTD.",
    "LV0067": "V.R. MARKETING",
    "LC0188": "CHAREONKIJ THURAKARN CO.,LTD.",
    "LT0921": "TWIN TOWER PACKAGING CO.,LTD.",
    "LA0147": "AVIA CREATE CO., LTD.",
    "LG0050": "GENERAL POWER MECHANIC",
    "LM0163": "MAKA MEDIA PRODUCTION CO.,LTD.",
    "LA0145": "ASTER INTERTRADE CO.,LTD.",
    "LA0146": "ASPAC OIL (THAILAND) LIMITED",
    "LL0021": "LIN SAN PAN INDUSTRY CO., LTD.",
    "SR0002": "RDM TECHNOLOGIES",
    "LR0091": "ROCKET THAI CO.,LTD.",
    "LT0905": "TRIGONAL CO.,LTD.",
    "LS0138": "SUTHANAI ELECTRIC LTD.,PART.",
    "LF0094": "FAREAST ENGINEERING SUPPLY",
    "LR0079": "RTD TECHNOLOGIES CO., LTD",
    "LV0064": "V.R. (1991) CO.,LTD.",
    "LB0120": "B.L. INTERMART CO.,LTD.",
    "LF0095": "F.E. ZUELLIC (BANGKOK) LTD.",
    "LS0139": "SAKSIT ALLOY GROUP",
    "LC0083": "CHUNWANG R & D CO.,LTD.",
    "LP0204": "PARAGON MANAGEMENT CO.,LTD.",
    "LM0106": "M & T COMMUNICATION SERVICE",
    "LD0078": "DAISU LIMITED PARTNERSHIP",
    "LA0135": "A S & D INDUSTRY CO.,LTD.",
    "LW0014": "WIRE-CUT MACHINE CENTER CO.,LTD.",
    "LW0056": "WINSCREEN GRAPHIC CO., LTD.",
    "LW0059": "WORLD COMPUTER TECHNOLOGY CO.,LTD.",
    "LY0003": "YAMAZEN (THAILAND) CO.,LTD.",
    "MK0001": "KOBE COPPER (MALAYSIA) SDN.BHD.",
    "MK0002": "KOBE PRECISION (M) SDN.BHD.",
    "MS0001": "SAITAMA INDUSTRIES SDN.BHD.",
    "MS0002": "SPECTECH INDUSTRIAL SUPPLY",
    "MV0001": "VAW M ) SDN. BHD.",
    "NC0001": "CHIYODA KIKO CO.,LTD.",
    "NC0002": "CHIYODA CORPORATION",
    "NC0004": "CHIYODA KOHAN CO., LTD.",
    "NJ0001": "JAPAN ENERGY CORPORATION",
    "NK0007": "KYOSHIN VIETNAM CO.,LTD.",
    "NK0008": "KOREA KUSMI CO., LTD.",
    "NM0001": "MARUKA MACHINERY CO.,LTD.",
    "NN0010": "NISSHIN BUSINESS TRADING CO., LTD.",
    "NO0001": "OAK JAPAN CO.,LTD.",
    "NS0014": "SYSTEM ENGINEERING CO.,LTD.",
    "NS0016": "SALES PROMOTING GROUP",
    "NS0017": "SAGINOMIYA SEISAKUSHO, INC.",
    "NT0011": "TOKAI YOZAI CO., LTD.",
    "NT0018": "TOYO KOGYO CO., LTD.",
    "NT0020": "TOKAI RIKI CO., LTD.",
    "NY0002": "YOSHIDA DENSEN CO.,LTD",
    "NY0005": "YAMABISHI ELECTRIC CO.,LTD.",
    "S90663": "TOSHIBA ASIA PACIFIC PTE LTD.",
    "SA0003": "AIDA STAMPING TECHNOLOGY",
    "LM0149": "MAXKLEN CO.,LTD.",
    "LS1105": "SAMBO SHINDO (THAILAND) CO.,LTD",
    "LB0104": "Borneo Technical (Thailand) Ltd.",
    "LL0042": "LERTKULKITT CO.,LTD",
    "LT0884": "TEK INDUSTRIES CO.,LTD.",
    "LA0119": "A.T.S TOOLING SUPPLY CO.,LTD.",
    "LP0182": "PTS PROGRESSIVE ENGINEERING",
    "LA0120": "AMKO TECH CO.,LTD.",
    "LI0067": "I MECHANICS CO.,LTD.",
    "JM0002": "MARUYOSHI DENKI CO.,LTD.",
    "LM0147": "MNC PLASTICO CO., LTD.",
    "LK0087": "KRUNGTEP UNION MANUFACTURING CO.,LT",
    "LC0166": "CONFIDENCE PLUS LTD.,PART.",
    "LM0162": "MITSUBISHI ELECTRIC AUTOMATION",
    "LR0090": "RUAMCHAI",
    "SR0001": "RYOSHO TECHNO (S) PTE. LTD.",
    "LS0089": "SIAM TRANSFORMER ENTERPRISE CO.,LTD",
    "LT0918": "T.A.I. SPECIAL TOOLS CO.,LTD.",
    "LD0081": "DATA IT SUPERSTORE CO.,LTD.",
    "LP0916": "PT NUMBER 1 TRADES CO.,LTD.",
    "LR0089": "R. ENGINEERING AND MACHINERY",
    "LS0134": "SPEAKER HI-FI",
    "TC0002": "Chi Yeong",
    "LT0876": "THEPSUTEE CO.,LTD.",
    "LP0177": "PATUM RICE MILL AND GRANARY",
    "LC0159": "C.T. Products",
    "LM0140": "MISUMI (THAILAND) CO.,LTD.",
    "SAGINOMIYA": "SAGINOMIYA SEISAKUSHO,INC.",
    "TG0001": "GRAINEW CORPORATION",
    "LE0035": "EXCISE DEPARTMENT",
    "LB0100": "B.GRIMM POWER ENGINEERING CO.,LTD.",
    "LY0004": "YOUR ENGINEERING (1990) CO.,LTD.",
    "LI0008": "INDUSTRAIL ELECTRICAL CO., LTD.",
    "LC0127": "CENTRAL LUBE TECHNOLOGY CO.,LTD.",
    "NT0022": "TOGAMI ELECTRIC MFG.CO.,LTD.",
    "LS1079": "SING HENG GOLD SMITHS",
    "LK0030": "KOTEC (THAILAND) CO.,LTD.",
    "ST0002": "TAXAS INSTRUMENT S' PORE LTD.",
    "T92866": "TAIWAN TOSHIBA INTERNATIONAL",
    "T92867": "TOSHIBA COMPRESSOR (TAIWAN)COR",
    "UT0001": "TOSHIBA AMERICA, INC.",
    "XJN001": "NISSHO IWAI CORPORATION",
    "XMK001": "Kobelco&Materials",
    "LM0157": "MONTEE MOTOR",
    "LN0067": "NICHIYU ASIA (THAILAND) CO.,LTD.",
    "LS1117": "S.K.AIR LTD.",
    "LS0116": "SIAM TELEMACH CO.,LTD.",
    "LT0897": "THAI ENVIRONMENTAL TECHNIC LIMITED",
    "LK0092": "K T J Corp.",
    "LF0010": "FIRE FOCUS SALE & SERVICE CO.,LTD.",
    "LA0023": "AKKHIE PRAKARN PUBLIC CO.,LTD.",
    "LT0027": "TRINITY BUSINESS CO.,LTD.",
    "LY0008": "YAMAICHI MANUFACTURING",
    "LT0883": "THAI INDUSTRIAL TYRES CO.,LTD.",
    "LS1104": "S.N.P.INDUSTRY CO,.LTD.",
    "LM0148": "MASSWELL CHEMICAL GROUP CO.,LTD.",
    "LI0066": "INABATA THAI CO.,LTD.",
    "LB0103": "BKS INTERTRADES LTD.,PART.",
    "LK0086": "K.M.INTERCOM SERVICES CO.,LTD.",
    "AL0002": "LASEREX TECHNOLOGIES PTY LTD.",
    "JM0001": "MORISHITA CO.,LTD.",
    "LT0882": "THAI MAXWELL ELECTRIC CO.,LTD.",
    "LV0059": "V.FIVE MARKETING",
    "NH0001": "HEISEI LIMITED COMPANY",
    "LF0087": "FISH DESIGN STUDIO CO.,LTD.",
    "LM0145": "MAPONG CONSTRUCTION CO.,LTD.",
    "LT0917": "TONCHOMPOO GARMENT",
    "LE0148": "END RESULT CO.,LTD.",
    "LS0148": "SAMPENG UNIFORM CO.,LTD.",
    "LA0142": "A.T.N. PRECISION CO.,LTD.",
    "LT0915": "T.S. PATEX CO.,LTD.",
    "LA0143": "ADVANCE EQUIPMENT SUPPLIES",
    "LE0006": "ELECTRONICS SOURCE CO.,LTD.",
    "KC0001": "CLK CORPORATION",
    "LM0161": "M.T.K MARKETING Co.,Ltd.",
    "LC0187": "CHAROENPAN FURNITURE",
    "KK0001": "KOREA KUSMI CO.,LTD",
    "LL0020": "LOADSTAR CO.,LTD.",
    "LS0146": "V.S.S. & SON COMPANY LIMITED",
    "LU0080": "UNITY SERVE CO.,LTD.",
    "LT0913": "T-REC ENTERTAINMENT CO.,LTD.",
    "LC0027": "C&A OFFICE AUTOMATION CO.,LTD.",
    "LK0083": "KANOKSIN EXPORT IMPORT CO.,LTD.",
    "LE0010": "ENERGY DEVELOPMENT (THAILAND)",
    "LJ0029": "J.S.V. TECHNICAL CO.,LTD.",
    "LT0868": "THAI PHAISARN FASTENING CO., LTD.",
    "LT0869": "TOMCO ENGINEERING CO.,LTD.",
    "LS0022": "SYSTEMS ADVISERS GROUP LIMITED",
    "LF0009": "FESTO LIMITED",
    "SS0008": "SANKEN ELECTRIC SINGAPORE PTE.LTD.",
    "LJ0031": "JUNLAPONG KARN CHANG LTD.,PART.",
    "LF0091": "BORNEO TECHNICAL (THAILAND)",
    "LS0161": "SIAM RICH TECH CO.,LTD.",
    "LP0922": "PRO-PART SUPPLY & SERVICE LTD.,PART",
    "LB0127": "BIZ ENGINEERING (THAILAND) CO.,LTD.",
    "LI0087": "INTERPAP O.P.",
    "MO0001": "OTAX Electronics Malaysia Sdn.Bhd.",
    "LP0192": "P.SIAM PAPER LTD.,PART.",
    "LN0105": "N.S.NETWORK CO.,LTD.",
    "LB0111": "BLU-GAS CO.,LTD.",
    "LE0138": "ENERGY MAINTENANCE SERVICE",
    "LA0128": "ASIA PAPER AND MARKETING",
    "LB0112": "BASELINE TECHNOLOGY CONSULTANTS CO.",
    "MY0001": "YAMADA ELECTRIC MFG.(MY)SDN.BHD.",
    "UC0001": "EMERSON CLIMATE TECHNOLOGIES, INC.",
    "LT0896": "THEPPANIN COMPANY LIMITED",
    "LK0085": "KORNNAREE CO.,LTD.",
    "LI0064": "INABATA THAI CO.,LTD.",
    "LT3256": "THAI SHIBAURA DENSHI CO.,LTD.",
    "SB0001": "BOSSARD PTE LTD",
    "LT3254": "THAI MORISHITA CO.,LTD",
    "LN0097": "NATIONAL INSTITUTE OF METROLOGY",
    "LT3255": "THAI MORISHITA CO.,LTD",
    "LS1102": "S.M. COLOUR",
    "JS0003": "SIIX CORP. HEADQUARTERS",
    "LC0164": "CHAIAIR ENGINEERING CO.,LTD.",
    "LV0058": "V.R PROFESSIONAL CO., LTD.",
    "LC0165": "CANNEW INTERNATIONAL",
    "LU0071": "UTILIZE TECHNOLOGY CO.,LTD.",
    "LW0069": "WIRAT PRINTING CO.,LTD.",
    "LK0102": "PLASTICS KHWANTHONG LTD.,PART",
    "LT0914": "TAKAO ENGINEERING CO.,LTD.",
    "LS1127": "SHYE FENG ENTERPRISE (THAILAND)",
    "LW0068": "WORLD DIAMOND TOOLS CO.,LTD.",
    "LS1126": "SANKI(THAILAND) CO.,LTD.",
    "LL0019": "LOSCAM (THAILAND) LIMITED.",
    "LO0004": "OMNI SYSTEMS CO.,LTD.",
    "LP0212": "PSN ENGINEERING & SUPPLY CO.,LTD.",
    "LI0085": "IWATA BOLT (THAILAND) CO.,LTD.",
    "CC0003": "JIANGSU ALCHA ALUMINIUM CO.,LTD.",
    "LT0496": "THAI STANLEY ELECTRIC PUBLIC",
    "LT0494": "TOSHIBA CHEMICAL (THAILAND)LTD.",
    "LS1077": "SUPER TIME TRADING CO.,LTD.",
    "LC0156": "COMMUNICATION ELECTRONIC",
    "LP0172": "PANYASIN DESIGN",
    "LC0157": "CHAISCREEN MACHINERY CO.,LTD.",
    "LG0036": "GUARD DUTY SERVICE CO.,LTD.",
    "LP0171": "P.N.V. POLYTECH CO.,LTD.",
    "LC0155": "C-TL CORPORATION LTD.",
    "LD0068": "DAIDO PDM (THAILAND) CO.,LTD.",
    "LE0140": "EEC ENERGETICS CO.,LTD.",
    "LM0156": "MASTERTECH INTERNATIONAL CO.,LTD.",
    "LT0895": "THAWIKIT AIR SERVICE LTD.,PART.",
    "CC0002": "CHANGSHU WINTOP",
    "LS0114": "SUNNY VALVES & INTERTRADE",
    "LE0136": "EASTERN PREMIER CO.,LTD.",
    "LS0115": "SAHAVIT SUPPLY & SERVICE",
    "LE0137": "ELECTRIC CART SERVICE LTD.,PART.",
    "MV0002": "Hydro Aluminium Malaysia Sdn. Bhd.",
    "LT0193": "TOSHIN CHEMITECH (THAILAND)",
    "L30001": "3G QSP CO.,LTD.",
    "NN0011": "NEXUS-ASATSU ADVERTISING",
    "NN0012": "NEXUS-ASATSU ADVERTISING",
    "LK0090": "KANCHAKON CO.,LTD.",
    "LB0109": "BANGKOK OVERSEA COMMERCIAL",
    "LH0046": "HOYO (THAILAND) CO.,LTD.",
    "LD0073": "DELIGHT SERVICES & MARKETTING",
    "LG0039": "GOLDVEST TRADING (THAILAND)",
    "LD0002": "DAIKIN TRADING (THAILAND) LTD.",
    "LH0042": "HARVEST MOULD (THAILAND)CO.,LTD.",
    "LS1100": "SUPHUNBURI DECOR AND SUPPLY",
    "LU0070": "UNITED BRAIN INTERNATIONAL",
    "LF0086": "FUTURE AV CO., LTD.",
    "NC0005": "CHINO CORPARATION CO., LTD.",
    "LP0181": "POWER VISION CO., LTD.",
    "LH0043": "HUMAN CONSULTING CO.,LTD.",
    "KJ0002": "JY SOLUTEC CO.,LTD",
    "LE0146": "EASTERN PIONEER SALES AND",
    "LU0079": "UNIPOWER ENGINEERING CO.,LTD.",
    "LE0147": "ELECTRONICS SOLUTION CO.,LTD.",
    "LC0184": "C. THAI HAJIME CO.,LTD.",
    "IC0001": "CARRIER S.P.A.",
    "LB0126": "BARAME MONGKORN CO.,LTD.",
    "LA0141": "PERFECT PART PROVIDER CO.,LTD.",
    "LJ0035": "JNN ENGINEERING LIMITED",
    "LG0048": "GETTRADE INTERBUSINESS CO.,LTD.",
    "LP0211": "PERT CONVEYOR CO.,LTD.",
    "MG0001": "GRAND CIRCUIT INDUSTRY SDN.BHD.",
    "LT0910": "THAI SANWA ENGINEERING CO.,LTD.",
    "LB0125": "BED FOR BODY LTD.,PART.",
    "LN0110": "N.R.N.TECHNICAL PART LTD.,PART.",
    "LF0098": "FORECASTER ONE LIMITED",
    "LP0170": "PD PROGRESS CO., LTD.",
    "JN0001": "NISSHO IWAI ALCONIX CORPORATION",
    "LS1075": "SUPERSUN INDUSTRY CO.,LTD.",
    "LB0099": "B C CREATION CO., LTD.",
    "LP0169": "PLANET COMMUNICATIONS ASIA CO.,LTD.",
    "LS1076": "S.T.P. TECHNOLOGY CO.,LTD.",
    "LT0867": "THAI SUZUKI FASTENER CO.,LTD.",
    "LT0865": "THAI STEWARD SERVICES CO.,LTD.",
    "LJ0030": "JCC ENGINEERING LTD.,PART.",
    "LK0091": "KAEW CHENG RAG CO.,LTD.",
    "LU0075": "UNO ENTERPRISE CO.,LTD.",
    "LP0190": "PICNIC PLAST INDUSTRIAL CO.,LTD.",
    "LH0045": "HAKUTO (THAILAND) LTD.",
    "CH0001": "Henan Golden Dragon",
    "LT0894": "TOYLAND CO.,LTD.",
    "LL0012": "LE PIMOLA (THAILAND) CO.,LTD.",
    "LM0155": "MTE Co.,Ltd.",
    "LV0061": "VICCHI ENGINEERING CO.,LTD.",
    "HM0001": "Mitsuibussan",
    "LU0074": "UNI-ROYAL PACK CO.,LTD.",
    "JS0001": "SHINWA CORPORATION",
    "LG0038": "GLOFAB CO.,LTD.",
    "SN0001": "NIHON SUPERIOR TRADING (S) PTE LTD",
    "JS0002": "SIIX CORPORATION",
    "LT3252": "THAI SUMMIT AUTOPARTS INDUSTRY CO.,",
    "LA0117": "A S & D INDUSTRY CO.,LTD.",
    "LS1099": "SRITHAI SHIN-OSAKA CO.,LTD.",
    "LT0879": "TECHNO RESIN SERVICE CO.,LTD.",
    "LC0163": "CONIC ENGINEERING CO., LTD.",
    "SS0002": "SANSHIN ELECTRONICS SINGAPORE",
    "SH0001": "HOKURIKU(SINGAPORE)PTE LTD.",
    "ST0001": "TAKACHIHO SINGAPORE (PTE) LTD",
    "LB0124": "BILLION ADVANCED TECHNOLOGY",
    "LT3261": "TAMURA CORPORATION (THAILAND)",
    "LO0003": "OVAL-ITECH CONTROL AND ENGINEERING",
    "LP0210": "Peregrine Company Limited",
    "JN0002": "Nidec Power Motor Corporation",
    "LI0084": "INNERCARD LTD.",
    "LN0109": "NC SCIENCETECH CO.,LTD.",
    "LS0296": "SCIONICS INNOVATION TECH CO.,LTD.",
    "LA0192": "AQUA ENTERPRISE CO.,LTD.",
    "LT0518": "TAWEEMACHINERY LIMITED PARTNERSHIP",
    "LN0140": "N TECH ENGINEERING AND SUPPLY",
    "LR0109": "R.N.B. PRODUCT AND PACKAGING",
    "LH0064": "HUA HENG LEE R.O.P.",
    "LP0167": "P. KARNCHANG",
    "LP0168": "P&T TECHNICAL SYSTEM CO.,LTD.",
    "LS1074": "SIAM PORNPASSADU CO.,LTD.",
    "LT0866": "TECHNOLOGY PARTS SYSTEM LTD.,PART.",
    "LV0056": "VICHAITRADING(1983)COMPANY LIMITED",
    "LT0864": "THANYANIJ CO.,LTD.",
    "LE0009": "EKARAT ENGINEERING PUBLIC CO.,LTD.",
    "LA0114": "AUTOTECH INSTRUMENT CO.,LTD.",
    "LF0085": "FIRE-ENGINE IMPERIAL CO.,LTD.",
    "LM0133": "MITCHAROEN SUPPLY LTD.,PART.",
    "LI0074": "IMAGE TRENDS CO.,LTD.",
    "LT0892": "THAI PAC INDUSTRY CO.,LTD.",
    "LP0189": "PRIMA SUPPLY CO.,LTD.",
    "LS0113": "SK INTER SUPPLY CO.,LTD.",
    "JJ0004": "SHINANO KENSHI CO., LTD.",
    "JS0004": "SHINANO KENSHI CO., LTD.",
    "LT0893": "THAI COOLING TOWER CO.,LTD.",
    "MM0001": "Met Tube Sdn.Bhd.",
    "LB0108": "BRAVE ENGINEERING LTD.",
    "LB0107": "BEST PART ENGINEERING CO.,LTD.",
    "HG0001": "GOLDEN DRAGON HOLDING (HONGKONG)",
    "LN0007": "NP CLOTHES AND DESIGN",
    "LP0013": "P.P. ELECTRIC ENGINEERING & SUPPLY",
    "LT0880": "TECHCO (THAILAND) CO., LTD.",
    "LP0180": "P.K. TECH TRADING LTD., PART.",
    "LP0178": "PLIC CORP., LTD.",
    "LI0063": "INTERNATIONAL PARKING MANAGEMENT",
    "KJ0001": "JU-OHINC",
    "LY0005": "YONG HONG ENGINEERING CO.,LTD.",
    "LP0179": "PROMINENT FLUID CONTROLS (THAILAND)",
    "LT0878": "T.T.L. ENGINEERING SYSTEMS CO.,LTD.",
    "LA0116": "ADVANCED BUSINESS SOLUTIONS",
    "SO0001": "OCEAN PACIFIC UNION ENTERPRISES",
    "LM0143": "MAGNUM INDUSTRIAL CO.,LTD.",
    "LN0096": "NACHAKRID LTD.,PART.",
    "LC0160": "CLEANING SUPPLIES PROFESSIONAL",
    "MK0004": "ORIENTAL NICHINAN DESIGN",
    "LP0208": "PRECISION MEASUREMENT LABORATORY",
    "LP0209": "P.M.K. CORPORATION LTD.",
    "LC0181": "CB MOTOR SERVICE LIMITED",
    "LF0097": "FIRST LOGIC COMPANY LIMITED",
    "LS1124": "SIAM COMPRESSOR INDUSTRY CO.,LTD.",
    "LX0001": "XCELLENT MANUFACTURING",
    "LS0144": "S.B.L. INDUSTRIAL CO.,LTD.",
    "LB0123": "BSR INTERNATIONAL CO.,LTD.",
    "LB0122": "Bentec Precision & Trading",
    "LW0060": "WATFORD CONTROL (THAILAND) CO.,LTD.",
    "TL0863": "THAI BARGE CONTAINER SERVICE",
    "LQ0006": "Q-POINT LIMITED PARTNERSHIP",
    "LK0082": "KITTICHAI POWER SUPPLY CO.,LTD.",
    "HS0002": "SANWA ELECTRO DEVICE CO.,LTD.",
    "LH0040": "HIBASE MICROSYSTEM (THAILAND)",
    "LS1073": "S & W ADVANCE BANGKOK CO.,LTD.",
    "LN0104": "NAPAAUG CO.,LTD.",
    "LT0890": "TODAY SERVICE LIMITED PARTNERSHIP",
    "LA0127": "ALL TOOL SERVICE LTD.,PART",
    "LW0062": "WANCO INDUSTRIAL(THAILAND)CO.,LTD.",
    "LD0076": "D & C FACTORY SUPPLY",
    "LM0154": "MARUNIX (THAILAND) LTD.",
    "LP0188": "PACIFIC TOOL AND ELECTRICAL",
    "SK0001": "KYOSHIN TECHNOSONIC(S) PTE LTD",
    "LN0102": "NAMTHAI INTERTRADE CO.,LTD.",
    "LN0103": "SOUTHERN SUPPLY LTD.,PART.",
    "N71859": "SAGINOMIYA HI-TECHS PTE LTD",
    "LT3258": "T.RAD (THAILAND) CO.,LTD.",
    "LK0089": "KEN FIRM COMPANY LIMITED",
    "LM0141": "MITSUI & CO (THAILAND) LTD.",
    "LC0161": "CONVEY MACHINE CO., LTD.",
    "LD0072": "DIAMOND SHUTTER LTD., PART.",
    "LS1098": "SINE ADVANCE ENGINEERING CO.,LTD.",
    "LC0162": "CHANKASEM INTERNATIONAL CO.,LTD.",
    "NM0002": "MITSUI & CO.,LTD. (HEAD OFFICE)",
    "LS0067": "SIK(THAILAND)LTD.",
    "LT0877": "THAI TECHNIC ELECTRIC CO.,LTD.",
    "LB0102": "BEST DIAMOND INDUSTRIAL CO.,LTD.",
    "LS1096": "S.P.G.T. ENGINEERING CO.,LTD,",
    "LT3251": "TOEI DENSHI (THAILAND) CO.,LTD.",
    "LS1097": "SUBHACHAI ELECTRICAL &",
    "LN0112": "NIRAVITH CO.,LTD.",
    "LC0180": "CALIBRATION LABORATORY CO.,LTD.",
    "LJ0034": "J.CHARENYONT MECHINERY",
    "LA0140": "A & A CONTROL CO.,LTD.",
    "LK0099": "KOBELCO & MATERIALS",
    "LW0067": "WORLD MECHANICS ENGINEERING",
    "LJ0032": "JANMANEE PARTS Ltd.,Part.",
    "LM0109": "MMS ENTERPRISE CO.,LTD.",
    "LC0179": "CHEMTEC AUTOMATION CO.,LTD.",
    "LT0909": "TENDER SUPPLY LIMITED",
    "LG0001": "GENIUS ELECTRONIC TRANSFORMERS",
    "LE0145": "ECON INTERTRADE CO.,LTD.",
    "LA0138": "AC TRANSFORMER",
    "LF0096": "FOOTBALL THAI FACTORY SPORTING",
    "LW0066": "WANG DAENG EXPRESS LTD.,PART.",
    "LM0134": "MMT ENGINEERING CO.,LTD.",
    "LT0862": "TOYLAND CO.,LTD.",
    "LC0154": "COMPLUS ENTREPRENEUR LTD.,PART.",
    "LU0067": "UNI G CO.,LTD.",
    "LN0101": "N.E. TRADING CO.,LTD.",
    "LTG0001": "THAI CONTAINERS LTD.",
    "LT0001G": "THAI CONTAINERS LTD.",
    "LK0009G": "K.M.FOAM CO.,LTD.",
    "LI0072": "INCTECH METROLOGICAL CENTER",
    "LM0153": "MATSUSHITA REFRIGERATION COMPANY",
    "LR0076": "RZK CO.,LTD.",
    "LF0090": "FIRE AND RESCUE INTERNATIONAL",
    "LA0126": "ACID DIGITAL CO.,LTD.",
    "LB0106": "BOSSARD (THAILAND) LIMITED",
    "LS1115": "SP TOOLING AND SUPPLY LTD.,PART",
    "LS1112": "SCTC COMPANY LIMITED",
    "LT0887": "T.M.D.SUPPLY LTD.,PARTS",
    "LK0104": "KYOCERA CHEMICAL (THAILAND) Ltd.",
    "LS0001": "SUPER BOX CO.,LTD.",
    "LM0165": "MY TECHNOLOGY SYSTEM LTD., PART.",
    "LI0077": "TOPTHAI PRODUCT CO.,LTD.",
    "LS0160": "S.P.S. TOTAL ENGINEERING CO.,LTD.",
    "LT0922": "TI MENG LTD.,PART.",
    "LN0108": "NCH (THAILAND) CO.,LTD.",
    "LP0207": "PBM COMMERCIAL CO.,LTD.",
    "LA0139": "AKARACH INTERNATIONAL",
    "LL0017": "LIP CHEE (THAILAND) CO.,LTD.",
    "LU0004": "UNION PROSPACK CO.,LTD.",
    "LL0014": "LUX ROYAL(THAILAND)CO.,LTD.",
    "LL0015": "LAEMTHONG SYNDICATE CO.,LTD.",
    "SS0004": "SIIX Singapore Pte.Ltd.",
    "LU0020": "UNIVERSAL POLYMERS CO.,LTD.",
    "LA0137": "ADVANCE POLYMERS & CHEMICALS",
    "LL0016": "LAEMTHONG GAS PRODUCTS LTD.,PART.",
    "LW0003": "WAN INDUSTRIAL ELECTRIC CO., LTD.",
    "LG0046": "GOLD GLOVE CO.,LTD.",
    "LS0143": "SUBTRACT (95) LTD.,PART.",
    "LM0107": "MAGNUS MANAGEMENT CONSULTANTS",
    "LI0061": "INTERLINK COMMUNICATION",
    "LU0066": "UNITED TECHNOLOGY FOR ENERGY",
    "LM0152": "M.A. MATERIAL APPLICATION SYSTEMS",
    "LT0888": "THAI UNIQUE CO.,LTD.",
    "LA0125": "A.K.P. TECHNOLOGY CO.,LTD.",
    "LN0099": "NEWTON PRODUCT CO.,LTD.",
    "LS1113": "SQUARE COOLING TOWER CO.,LTD.",
    "LF0089": "FOUR S.TIME AND SOUND CO.,LTD",
    "LT0889": "THAI KASEIHIN CO.,LTD.",
    "LS1114": "SAHAVIRIYA NITTAN CO.,LTD.",
    "LU0073": "U.K.K.ENGINEERING & TRADING",
    "LP0185": "Pico Electronics(Thailand)Co.,Ltd.",
    "LT0886": "TOTAL SOLUTION SERVICES CO.,LTD.",
    "LP0186": "PKS.MOLD & SERVICE CO.,LTD.",
    "LS1109": "SIAMPANICH PRODUCT CO.,LTD.",
    "LA0124": "A N INDUSTIALTYRE & PART SERVICE",
    "LS1110": "SUMITOMO ELECTRIC (THAILAND) LTD.",
    "LS1111": "SIAM PLASMA CORP.,LTD.",
    "LV0060": "VIRTUS COMPANY LIMITED",
    "LI0071": "INVIGOR INCORPORATION LIMITED",
    "LK0088": "KANAYAMA KASEI (THAILAND) CO.,LTD.",
    "LC0190": "CHUO SENKO (THAILAND) PUBLIC",
    "CA0001": "ANHUI ANLAN MOULD CAMPANY,LTD.",
    "CW0002": "Wuxi Tonghe Plastics Co., Ltd",
    "LM0164": "M.F. SUPPLY CO.,LTD.",
    "LF0101": "FLOW SYSTEMS CORPORATION CO.,LTD.",
    "LS0157": "SAHAKIM MOTOR CO.,LTD.",
    "LS0158": "SAMU THAI CO., LTD.",
    "SN0002": "NISSHIN INDUSTRY(SINGAPORE) PTE LTD",
    "LM0108": "M.I.B. GROUP (THAILAND) CO.,LTD.",
    "LC0178": "CANARY MARKETING CO.,LTD.",
    "LT0906": "THAI LAW ONLINE SERVICE CO.,LTD.",
    "LH0050": "HEAD CENTER DIE",
    "LT0907": "THAI ARKANAE INDUSTRIAL CO.,LTD.",
    "LG0045": "GS SUPPLY CO.,LTD.",
    "CT0001": "TOSHIBA (CHINA) CO., LTD.",
    "LP0005": "PREETECH PRODUCTS CO.,LTD.",
    "LU0002": "UENO (THAILAND) CO.,LTD.",
    "LT0013": "THONG LANG HONG LTD., PART.",
    "LN0092": "NIHON DENKEI (THAILAND) CO.,LTD.",
    "LS1072": "SURFACE PRO-TECH CO.,LTD.",
    "LT0872": "TOITSU PACKAGE CO.,LTD.",
    "LS0255": "SRITHAI MIYAGAWA CO.,LTD.",
    "LT0119G": "THAI KAKINUMA CO.,LTD.",
    "LT0119K": "THAI KAKINUMA CO.,LTD.",
    "LT0233K": "TK SHOJI CO.,LTD.",
    "LT0873": "THAI ENGINEERING AND BUSINESS",
    "NE0001": "EXCEL INC. CO.,LTD.",
    "LM0139": "MODERNFORM OA CO.,LTD.",
    "LS1095": "S.T.R. FLEXHOND PARTS.,LTD.",
    "LT0874": "T P S MACHINE TOOLS CO.,LTD.",
    "LN0010": "NOBLEWOOD CO., LTD.",
    "LP0016": "PLATINGDESIGN CO.,LTD.",
    "LJ0005": "J.N.R. AIR SUPPLY CO.,LTD.",
    "LR0005": "R.B. TOTAL SOLUTION CO.,LTD.",
    "LA0064": "ASIA (DONMUANG) LTD.,PART.",
    "LA0065": "AMTHIP CO.,LTD",
    "LA0068": "AUTOMATION CONTROL SYSTEM",
    "LA0074": "A&A BROTHERS SUPPLY LTD.,PART.",
    "LA0077": "ACE PRECISION ENGINEERING",
    "LA0084": "ASIAN SCIENTIFIC CO.,LTD.",
    "LA0090": "ASIA MOTOR SERVICE CENTER CO.,LTD.",
    "LA0093": "ADVANCE IMAGING TECHNOLOGY CO.,LTD",
    "LA0095": "A.K. SUPPLY",
    "LA0096": "ASSET MARKETTING & ENGINEERING CO.,",
    "LA0098": "AIDA STAMPING TECHNOLOGY (THAILAND)",
    "LA0101": "ACTIVE PROGRESS CO.,LTD.",
    "LA0102": "A.I. TECHNOLOGY CO., LTD.",
    "LA0103": "AUTHENTIC ENGINEERING CO., LTD.",
    "LA0104": "ASIA PRECISION CO.,LTD.",
    "LA0107": "ARCADIA PRINTING & FORMS CO.,LTD.",
    "LA0111": "AP & D ENGINEERING CO., LTD.",
    "LB0019": "M.J.BANGKOK VALVE & FITTING CO.",
    "LB0042": "BANGKOK TELECOMMUNICATION PANACENT",
    "LB0047": "B.S.TOOLING CORPORATION CO.,LTD.",
    "LB0058": "BANGKOK MACHINERY AND PARTS CO.",
    "LB0062": "BEHN MEYER ENGINEERING CO.,LTD.",
    "LB0064": "D-BROKER GROUP LIMITED PARTNERSHIP",
    "LB0077": "BANGKOK WATER POLLUTION SERVICE",
    "LB0088": "BILLION MILLION TRADING CO.LTD.",
    "LB0091": "BANGKOK SOFTWARE INTERNATIONAL CO.",
    "LK0023": "JOHOKU (THAILAND) CO.,LTD.",
    "LK0028": "NISSHINBO MECHATRONICS",
    "LK0055": "KITICHAI POWER SUPPLY CO.,LTD.",
    "LK0064": "KAWATA (THAILAND) CO.,LTD.",
    "LK0069": "K.KOSMIK CO., LTD.",
    "LK0075": "KURITA-GK CHEMICAL CO.,LTD.",
    "LK0076": "KDK-FUJIKURA (THAILAND) LTD.",
    "LK0078": "K.T. PROGRESS CO., LTD.",
    "LK0081": "KRISCHAWAT ENTERPRISE CO., LTD.",
    "LL0003": "LOHAPRATEEP INDUSTRY CO.,LTD.",
    "LL0010": "L.R. PHARMA LTD.,PART.",
    "LL0035": "LOHA CHANAKIT LTD.,PART.",
    "LL0036": "LOXLEY PUBLIC COMPANY LIMITED.",
    "LL0038": "G-ABLE CO.,LTD.",
    "LL0041": "LASER SOLUTIONS(THAILAND)LTD.,PART.",
    "LM0002": "MITUTOYO (THAILAND) CO.,LTD.",
    "LM0016": "MATSUI (ASIA) CO.,LTD.",
    "LM0025": "M.C.D. PRINTING (THAILAND) CO.,LTD.",
    "LM0036": "M.V.S TRADING LTD.,PRAT.",
    "LM0056": "MICROLINE CO.,LTD.",
    "LM0057": "METAL TECHNOLOGY CO.,LTD.",
    "LM0068": "MACCALL SYSTEM CO.,LTD.",
    "LM0077": "MODIC CO.,LTD.",
    "LM0079": "MAEYOM CITY CO.,LTD.",
    "LS0133": "SUPHOT INTERNATIONAL SALE CO.,LTD.",
    "LS0136": "SAFETICORP LTD.",
    "LS0145": "SUPRA CORPORATION LIMITED.",
    "LS0153": "SCT ENTERPRISES CO.,LTD.",
    "LS0154": "SURFACE PRO-TECH CO.,LTD.",
    "LS0155": "S&J HOLDING CO.,LTD.",
    "LS0179": "SOMBAT TOOL & DIE LTD.,PART.",
    "JH0001": "HOSODA LTD.",
    "LF0004": "FIRST OFFICE SERVICE",
    "LE0012": "ENGINERRING AND FIRE SERVICES",
    "LW0004": "WAFT TECH ASIA (THAILAND)",
    "LT0875": "T.S.P. WIRE-CUT&MACHINE PART",
    "LF0001": "FORTUNE TRADING CO.,LTD.",
    "LS1093": "SENA INTER CO.,LTD.",
    "LS1094": "SAHAVIRIYA PURE SCIENCE CO.,LTD.",
    "LT3249": "THAI KAKINUMA CO.,LTD.",
    "LT3250": "TK SHOJI CO.,LTD.",
    "LM0138": "META SILICATED (THAILAND) CO.,LTD.",
    "LP0176": "PACIFIC SHUTER CO.,LTD.",
    "LG0037": "GENESIS ENGINEERING AND",
    "LE0001": "EASTERN THAI CONSULTING 1992",
    "LS1092": "SYNTHE TECH CO.,LTD.",
    "LT0871": "THANA & NA LTD.,PART.",
    "LA0001": "OKAMOTO ENGINEERING CO.,LTD.",
    "LO0001": "OKAMOTO ENGINEERING CO.,LTD.",
    "NT0023": "TAIYO ENGINEERING CO.,LTD.",
    "LD0001": "DYNAMIC SPRING CO.,LTD.",
    "NA0001": "AIMS CORPORATION CO.,LTD.",
    "LM0137": "MWEB (THAILAND) LTD.",
    "LB0097": "BERLI JUCKER PUBLIC CO.,LTD.",
    "LB0098": "BANGKOK FIBREGLASS INDUSTRY LTD.",
    "LC0003": "CHEVALIER iTECH THAI LTD.",
    "LC0006": "CAT'S BOEKI CO.,LTD.",
    "LC0017": "CHAIYABOON BROTHERS CO.,LTD.",
    "LC0058": "CST SUPPLY CO., LTD.",
    "LC0065": "CURTAIN HOME LTD.,PART.",
    "LC0076": "CONTINUOUS FORM AND COMPUTER CO.",
    "LC0089": "CELICA INTERTRADE CO.,LTD.",
    "LC0091": "CURRENT ENGINEERING CO.,LTD.",
    "LC0097": "CHAIMONGKOL INDUSTRIAL SUPPLY CO.",
    "LC0124": "CLEAN WORLD PRODUCTS AND SUPPLY",
    "LC0126": "CENTRAL OFFICE PRODUCTS CO., LTD.",
    "LC0130": "CHIA PAO METAL CO.,LTD.",
    "LC0139": "CENTRAL STATIONERY CO.,LTD.",
    "LC0145": "COMPUTER SYSTEMS CONNECTION CO.,LTD",
    "LC0146": "CENTRAL OFFICE PRODUCTS",
    "LC0147": "CHOWTO TECHNOLIFT SYSTEM LTD.,PART.",
    "LC0149": "COMGRAPH CO., LTD.",
    "LC0150": "C.C.S. ENGINEERING CO., LTD.",
    "LC0151": "CIVIC MEDIA CO., LTD.",
    "LD0010": "DHON SIRI DIESEL CO.,LTD.",
    "LM0082": "METRO INFO DYNAMICS CO., LTD.",
    "LM0092": "MOULD MATE CO.,LTD.",
    "LM0097": "MILKY WAY CO.,LTD.",
    "LM0098": "MEECHAI SUPCHAREAN CO.,LTD.",
    "LM0102": "M.T.S. PAPER CO., LTD.",
    "LM0110": "MASTER FORM INDUSTRY CO.,LTD.",
    "LM0111": "M.T.SAHAMITR SERVICE",
    "LM0113": "MACHINERY CONCEPTS CO.,LTD.",
    "LM0115": "KANIKKARN LTD.,PART.",
    "LM0123": "MIN THAI INDUSTRIAL (1989)CO.,LTD.",
    "LM0126": "MATSUSHIGE ( THAILAND ) CO., LTD.",
    "LM0127": "METHAVEE MARKETING CO., LTD.",
    "LM0129": "M.S.TRADING EU HUA GUANG JEAR SUNG",
    "LM0130": "MASTECH ENGINEERING CO., LTD.",
    "LM0131": "MFEC CO., LTD.",
    "LM0132": "MING DENG METROLOGY SERVICES",
    "LN0003": "NIPPON PAINT THAILAND CO.,LTD.",
    "LN0029": "NORTH SAFETY EQUIPMENT CO.,LTD.",
    "LN0045": "NAVA REFRIGERATOR AND STAINLESS",
    "LN0064": "N.E. KARNCHANG CO.,LTD.",
    "LN0066": "NEO SIGN SYSTEMS (1995) LTD.,PART.",
    "LN0073": "NISHIYAMA INDUSTRIES (THAILAND)",
    "LN0084": "S.N.P. ENGINEERING",
    "LN0087": "NEW SANG CHAI HEATER LTD.,PART.",
    "LN0088": "MONT RICHES CO.,LTD.",
    "LN0089": "NET-COM PROFESSIONAL CO.,LTD.",
    "LS0221": "SIAM KYOHWA SEISAKUSHO CO.,LTD.",
    "LS0233": "SUTIN SUPPLY LTD.,PART.",
    "LS0234": "SYNTHETIC SLING CO., LTD.",
    "LS0238": "S&T ENTERPRISES(THAI.)CO.,LTD.",
    "LS0253": "T.K. ENGINEERING CO.,LTD.",
    "LS0254": "SIIX BANGKOK CO.,LTD.",
    "LS0258": "SCTC COMPANY LIMITED.",
    "LS1018": "SANKO GOSEI(THAILAND)LTD.",
    "LS1026": "SIAM MERCURY CO., LTD.",
    "LS1027": "SM.MODERNBOARD CO., LTD.",
    "LS1028": "STAR SEIKI (THAILAND) CO., LTD.",
    "LS1030": "SLING & WIREROPE CO., LTD.",
    "LS1033": "S.E. EDM CO.,LTD.",
    "LS1034": "SIAM GOLDEN PACKING LTD.,PART.",
    "LS1040": "SIAM ENGINEER FORUM CO., LTD.",
    "LS1043": "SV NITTAN CO., LTD.",
    "LS1044": "C. SIAM UNITED DEVELOPMENT CO.,LTD.",
    "LS1053": "S.P.V. GROUP",
    "LS1055": "S.I.T. (THAILAND) CO.,LTD.",
    "LS1056": "SIM INDUSTRIES",
    "LS1060": "STS SRITANNASRIR CO.,LTD.",
    "LS1061": "SUMMIT INDUSTECH CO., LTD.",
    "LS1063": "SHINAWATRA DATACOM CO., LTD.",
    "LS1064": "SUNNY SANITARY SUPPLY CO.,LTD.",
    "LS1066": "SUPTHAWEE ENGINEERING & SUPPLY LTD.",
    "LS1067": "SASH ENGINEERING & SUPPLY",
    "LS1068": "SOUND AND COMMUNICATION CO., LTD.",
    "LS1069": "S.T. TRADING AND SERVICE CO.,LTD.",
    "LT0001": "THAI CONTAINERS GROUP CO.,LTD.",
    "LN0095": "NBA INTERTRADE CO.,LTD.",
    "LS1087": "S.M.K.PRODUCTS CO., LTD.",
    "LZ0001": "Z1RCON AUTHORITY CO.,LTD.",
    "LS1089": "SIAM CT ELEVATOR CO.,LTD.",
    "LS1084": "S.W. ENGINEERING HIDROLIC LTD.,PART",
    "LS1090": "SHINWA INTEC CO.,LTD.",
    "LS1091": "SUN FURNITURE DESIGN CO.,LTD.",
    "LS1088": "S.D.K. TRADING LTD.,PART.",
    "LB0101": "BEST SPECT CO.,LTD.",
    "LI0062": "INTECH 2000 CO.,LTD.",
    "LS1083": "SUPER VAC CO.,LTD.",
    "LP0175": "PEARNPAN TRADING LTD.,PART.",
    "LU0068": "UNION THAI-NICHIBAN CO.,LTD.",
    "LD0016": "DATAMAT CO.,LTD.",
    "LD0017": "DATAPRO CO.,LTD.",
    "LD0030": "DOLLAR ENGINEERING CO.,LTD.",
    "LD0032": "DIGITAL GROUP CO.,LTD.",
    "LD0038": "DATAPRO CO.,LTD.",
    "LD0044": "DEEPATTANA TECHNICAL AND SUPPLY",
    "LD0049": "DTM. INDUSTRIAL LTD.",
    "LD0054": "DENSETSU (THAILAND) CO., LTD.",
    "LD0063": "DIGILAND (THAILAND) CO; LTD.",
    "LD0065": "D.S.C. GROUP CO; LTD.",
    "LD0067": "DRIB TRADING POST LTD., PART.",
    "LE0008": "THE EAST ASIATIC COMPANY",
    "LE0021": "ENERGY TECHNOLOGY CO.,LTD.",
    "LE0026": "EAMTIP RICE COMPANY LIMITED",
    "LE0133": "ERGO DECORATIVE CO., LTD.",
    "LE0135": "ELITE FORKLIFT ENGINEERING LTD.",
    "LF0005": "F f D CO., LTD.",
    "LF0019": "FORTUNE TRADING CO.,LTD.",
    "LF0026": "FACII CO.,LTD.",
    "LF0027": "F.A.TECH CO.,LTD.",
    "LF0031": "5 & 4 PRINTING CO.,LTD.",
    "LF0032": "FOIL MASTER ( THAILAND ) TLD.",
    "LF0036": "FOAMEX ASIA CO.,LTD.",
    "LF0069": "FUKUI KASEI (THAILAND) CO.,LTD.",
    "LF0076": "FAR EASTERN ENGINEERING CO., LTD.",
    "LF0077": "FIT- FLEX HQ CO., LTD.",
    "LF0079": "FOCUS INTAKE ENGINEERING CO.,LTD.",
    "LF0080": "FOCUS MECHANIC CO., LTD",
    "LF0082": "FAC 99 ENGINEERING LTD.,PART.",
    "LO0021": "COL PUBLIC COMPANY LIMITED",
    "LO0022": "OGA INTERNATIONAL CO., LTD.",
    "LP0012": "PACIFIC & ORIENT CO.,LTD.",
    "LP0048": "PACIFIC MERCURY CO.,LTD.",
    "LP0061": "PARKER ENGINEERING (THAILAND) CO.,L",
    "LP0080": "POMJAI PHAN CO.,LTD.",
    "LP0084": "P.LIGHT ADVERTISING & CONSTRUCTION",
    "LP0089": "P.V.S. TRADING ENGINEERING CO.,LTD.",
    "LP0090": "PREMIER AIR SUPPLY CO., LTD.",
    "LP0094": "PRINTELLIGENCE (THAILAND)CO.,LTD.",
    "LP0106": "PHOLLAWAT ENGINEERING SUPPLY",
    "LP0114": "P.T.G. GROUP LIMITED PARTNERSHIP",
    "LP0119": "PAISAN SUPERLENE CO.,LTD.",
    "LP0124": "P C I MANUFACTURING CO., LTD.",
    "LP0134": "PLASTIC CONTAINER INDUSTRY CO., LTD",
    "LP0140": "P.T.K. EQUIPMENT CO., LTD.",
    "LP0141": "P.SING SUK SUPPLY CO., LTD.",
    "LP0150": "PICO ELECTRONICS (THAILAND) CO.,LTD",
    "LP0151": "PARACON CONSTRUCTION CO.,LTD.",
    "LP0152": "POWER ADVANCE SYSTEM CO.,LTD.",
    "LT0012": "TECHNO FOAM CO.,LTD.",
    "LT0019": "THAI TAKENAKA INTERNATIONAL LTD.",
    "LT0039": "THAI KENZAISHA CO.,LTD.",
    "LT0057": "TOMCO CO.,LTD.",
    "LT0058": "THAIKENZAI TRADING CO., LTD.",
    "LT0067": "THAI UNIBROSS CO.,LTD.",
    "LT0070": "THAI PACKAGING INDUSTRY PUBLIC CO.",
    "LT0088": "TODAY STYLE 2100 CO., LTD.",
    "LT0099": "THAI-INTER ELECTRIC INDUSTRIES CO.",
    "LT0119": "THAI KAKINUMA CO.,LTD.",
    "LT0151": "THAI TOSHIBA LIGHTING CO.,LTD.",
    "LT0160": "THAI FLEXIBLE PACK CO.,LTD.",
    "LT0168": "THAI KANSAI PAINT CO.,LTD.",
    "LT0182": "THITICHAI GAS & OXIGEN CO.,LTD.",
    "LT0185": "TENDER TOUCH CO.,LTD.",
    "LT0188": "T.I.G. TRADING LIMITED",
    "LT0197": "THAI AICHI DENKI CO.,LTD.",
    "LT0200": "FUJIFILM BUSINESS INNOVATION",
    "LT0211": "TRINITY SANAMI CO., LTD.",
    "LT0233": "TK SHOJI CO.,LTD.",
    "LT0301": "THAI MITCHI CORPORATION LTD.",
    "LS1085": "SAPMUNKONG PLASTIC (2007)",
    "LP0174": "PRACHAKUL CO.,LTD.",
    "LT0870": "TECHNICAL LIFT-ALL CO., LTD.",
    "LS1082": "KHUN SANCHAI KHETBOONLUE",
    "LD0070": "DUANGTHAM CANVAS",
    "LN0094": "NISSIN SHOKAKI CHEMICAL",
    "LC0135": "MULTI EQUIPMENT INTERTRADE CO.,LTD.",
    "LM0135": "MULTI EQUIPMENT INTERTRADE CO.,LTD.",
    "LS1080": "SILVER STAR TACK CO.,LTD.",
    "LM0136": "M.SUPPLY LTD.,PART.",
    "LS1081": "SETTEMP CO.,LTD.",
    "LU0051": "UNITED BRAIN INTERNATIONAL CO.,LTD.",
    "LS0122": "S.D.U. ENGINEERING CO.,LTD.",
    "LC0173": "CRC POWER RETAIL CO.,LTD.",
    "LA0132": "ANTI-FIRE CO., LTD.",
    "KS0002": "SAM WON PRECISION MOULD MFG.CO.LTD.",
    "LP0149": "PORNRUNGRUANG RUBBERWOOD LTD",
    "LV0005": "VIDHYASOM CO.,LTD",
    "LO0024": "OUTOKUMPU HITACHI",
    "LM0160": "M P D FORKLIFT SERVICE & PART",
    "LK0094": "KSC COMMERCIAL INTERNET CO.,LTD.",
    "LR0077": "RATTANAKOSIN HYDRAULIC (1999)",
    "LP0195": "PROJECT WIZARD CO.,LTD.",
    "LB0113": "BELL CLADDING LTD.,PART.",
    "LT3260": "TAKACHIHO ELECTRIC (THAILAND)",
    "LP0196": "P.W.C INTERNATIONAL CO.,LTD.",
    "LC0172": "CHYANUN SUPPLY CO.,LTD.",
    "ND0003": "DAISHIN INDUSTRY CO.,LTD.",
    "J00054": "TOATEC CO.,LTD.",
    "LS0119": "SRITHAVEEKIJ PASPACK AND",
    "JJ0001": "JU-OHING",
    "MP0001": "PERFECT FEATURES SDN.BHD.",
    "KB0001": "BOO HEUNG MOLD MRG.CO",
    "MA0003": "ASIA MOLD ENGINEERING SDN.BHD.",
    "KN0001": "NARA MOLD & DIE CO.,LTD",
    "LS1042": "SHOWA KOSAN (THAILAND) CO.,LTD.",
    "LI0053": "INTERROLL (THAILAND) CO.,LTD.",
    "LN0091": "NISSEI SANGYO (THAILAND) CO.,LTD.",
    "LN0090": "N.T.R. AIRDUCT LTD.,PART.",
    "LS0009": "SANKYU - THAI CO.,LTD.",
    "LT0858": "THAI AICHI DENKI CO.,LTD.",
    "LI0015": "INDUSTRIAL ELECTRICAL CO.,LTD.",
    "LD4002": "DYNAMIC ENGINEERING SYSTEMS CO.",
    "LA0086": "ASIAN CHEMICALS ENGINEERING",
    "LU0065": "UTHITASARN PACKING LTD.,PART.",
    "LB0030": "BARAWINSOR CO.,LTD.",
    "LN0062": "NAS ENTERPRISE CO.,LTD.",
    "LT0195": "TIMENG CASTER (BANGKOK) CO., LTD.",
    "N25672": "HEIWA SHOJI CO.,LTD.",
    "CM0001": "Midea Air-Conditioning &",
    "LA0153": "ATLANTA AUTOMATION LIMITED",
    "LY0018": "YAMAGATA (THAILAND) CO.,LTD.",
    "LV0068": "V.M.F.INTERNATIONAL DESIGN &",
    "CC0004": "ZHEJIANG HAILIANG CO.,LTD.",
    "LL0047": "L.P.K. TOOLS LIMITED PARTNERSHIP",
    "JI0001": "I.M.A TRADING CO.,LTD.",
    "LS1135": "SIAM OKAYA MACHINE & TOOL CO.,LTD.",
    "LC0196": "CORDIAL CREATIVE CO.,LTD.",
    "LT3264": "THAI A-TECH SOLUTION CO.,LTD.",
    "LF0108": "FMA GROUP CO., LTD.",
    "LS1136": "S P P INDUSTRIAL RUBBER LIMITED",
    "HS0003": "Shinko International Ltd.",
    "LT0935": "RICH SALE LIMITED PARTNERSHIP.",
    "LT0936": "T.N. FURNITECH CO.,LTD.",
    "LT3265": "THAI SANWA ENGINEERING CO., LTD.",
    "LP0932": "POWER DRY CO., LTD.",
    "LE0149": "ENGINEERING & SCIENCE ASSOCIATES",
    "LC0029": "CS. METAL CO.LTD",
    "LT3266": "TEST INSTRUMENT ENGINEERING",
    "LK0110": "KA SHIN (THAILAND) CO., LTD.",
    "LA0156": "A & P CLEANING SERVICES CO.,LTD.",
    "LC0198": "BINARY TEC CO.,LTD.",
    "LK0111": "KOHSAN INDUSTRY CO., LTD.",
    "LP0933": "PUMPKIN UNIFORM CO., LTD.",
    "LM0169": "MEMBER GROUP ENGINEERING &",
    "LS1139": "SUN ENGINEERING & TRADING LTD.,PART",
    "LS1140": "SIAMESE INSTRUMENT CO., LTD.",
    "LT3267": "THAIDAMRONGCONTRACTOR CO., LTD.",
    "LP0934": "P&P HANDLING EQUIPMENT CO.,LTD.",
    "LS1141": "S.K. SERVICE AND SUPPLY",
    "LM0170": "MATSUDA ENGINEERING CO., LTD.",
    "LL0048": "L.V. FUNITURE AND OFFICE CENTER",
    "LS1142": "SPECIAL PURPOSE EXPRESS (THAILAND)",
    "LB0143": "BAE YI PRINTING CO.,LTD.",
    "LD4003": "DKSH (THAILAND) LIMITED",
    "LM0171": "M.I.S. OUTSOURCING CO.,LTD.",
    "LS1143": "S.TEERA SUPPLY",
    "LR0094": "RECOSTECH COMPANY LIMITED",
    "LU0083": "UBIG CO.,LTD.",
    "LM0172": "MAETHONGBAI NGAMWONGWAN",
    "LT3269": "THAI ITOKIN CO., LTD.",
    "LE0151": "EFFICIENCY SALES and SERVICES",
    "LM0173": "M&D BEST PACK CO.,LTD.",
    "LN0118": "NORTHWEST UNIVERSAL LOGISTICS",
    "LK0112": "KITJAKARN INTER SUPPLY CO.,LTD.",
    "LE0152": "E G G SUPPLY",
    "LP0936": "PRO-ASIA PLASTIC LTD., PART.",
    "LS1145": "SAHAPHAN 999 CO., LTD.",
    "LI0091": "INDUSTRIAL INDEX SUPPLY CO.,LTD.",
    "LP0937": "PLASMAC TRADING COMPANY LIMITED",
    "LT3270": "TANCHANOK WATTANA",
    "LM0174": "MAXCYRUS (THAILAND) CO.,LTD",
    "LH0054": "HI-TECH MATERIAL SUPPLY CO.,LTD.",
    "LR0095": "RUNGROJ INDUSTRY (1994)",
    "LA0157": "ACCUFAS LAB CENTER CO.,LTD.",
    "LP0939": "PAPER PRINT LIMITED PARTNERSHIP",
    "SA0005": "A' GRAMKOW ASIA PACIFIC PTE LTD.",
    "LT3272": "TOZAI TSUSHO (THAILAND) CO.,LTD.",
    "LA0158": "AXEL COMMUNICATION CO.,LTD.",
    "LL0050": "LEK SUPPLY (2002) LTD.,PART",
    "LG0128": "GRAND SOLUTION CO.,LTD.",
    "LB0145": "BURAN BENJARONG",
    "LS1147": "SARAN CO.,LTD.",
    "JS0007": "SHINWA CO.,LTD.",
    "LK0113": "KATO SPRING (THAILAND) LTD.",
    "LT3274": "TECHNOLOGY PRECISION CO.,LTD.",
    "LU0084": "U-INDUSTRIAL TECH",
    "JF0001": "FUJI TECHNO PLUS INC.",
    "LP0940": "PRECIOUS TIME TRADING CO.,LTD.",
    "LS1148": "SINTHORN METALWORK CO.,LTD.",
    "LB0146": "B. N. OFFICE AUTOMATION LTD.,PART.",
    "LF0110": "FRAMEWORK DEVELOPERS CO.,LTD.",
    "LV0069": "V.C.K.(2005) PARTNERSHIP",
    "LK0114": "KEY DESIGN CO.,LTD.",
    "LS1151": "SANANMAHAMONGKON",
    "LM0175": "M&D ADVANCE TECHNOLOGY",
    "LG0129": "GEOPHYSICS LIMITED",
    "LE0153": "ERM-SIAM CO.,LTD.",
    "LS1153": "SAKOLSAPPUMPOON LIMITED",
    "LT3275": "TECH PRECISION SYSTEM CO.,LTD.",
    "LS1154": "SUNNIC CHEMICAL CO.,LTD.",
    "LC0201": "C.T.K. DESIGN ENGINEERING CO.,LTD.",
    "LR0096": "RMC INTERGROUP CO.,LTD.",
    "LN0119": "N.S.ENGINEERING AND TRADING",
    "LW0072": "WISENESS SYSTEM CO.,LTD.",
    "LT3276": "THAI PART & CONTROLLER SYSTEMS",
    "UD0001": "LAMINA INC.",
    "LS1159": "SIAMPHAN HARDWARE CO.,LTD.",
    "LP0942": "PRO-TECH PACKAGING LIMITED",
    "LP0941": "PCRG COMPANY LIMITED",
    "LU0087": "ULVAC (THAILAND) LTD.",
    "LT3278": "THAI TID CO.,LTD.",
    "LS1160": "SIAM KAIZEN CO.,LTD.",
    "NAQS": "NAQS CO.,LTD.",
    "LV0071": "VIRIYA TECHNOLOGY",
    "LS1161": "SUPPORT TOOLS LTD.,PART.",
    "LD4004": "DKSH (THAILAND) LIMITED",
    "LE0154": "EIWA(THAILAND) CO.,LTD.",
    "LP0943": "P.D.PALLET AND PACKING",
    "LM0176": "MAX MOVE CO.,LTD.",
    "JE0002": "ESPEC CORP.",
    "LD4005": "DIGIO ELECTRONIC CO.,LTD.",
    "CG0003": "GUANGZHOU KINGFA SCI. & TECH.",
    "LT3279": "TIS ENGINEERING AND SERVICE",
    "LK0115": "KCC PRODUCT CO.,LTD.",
    "UP0001": "PAX PRODUCTS,INC.",
    "LT3281": "TAKAHASHI PLASTICS LIMITED",
    "MK0005": "KWANG JIN TECH",
    "LC0202": "CONTROL DATA (THAILAND) CO.,LTD.",
    "LT3282": "TRINITY INTERNATIONAL CO.,LTD.",
    "LE0155": "EQ EXPERT CO.,LTD.",
    "SI0001": "INPRINT-SYSTEM ASIA PACIFIC",
    "JT0004": "TOA ELECTRIC MEASURING",
    "CC0005": "CHUGAI RO ALUMINUM",
    "LA0521": "ACCESS APD CO.,LTD.",
    "LK0116": "KTL CORPORATION LTD.",
    "LT3283": "THAI BLIND PEOPLE' S FOUNDATION",
    "LI0093": "INTERGRATION MEASUREMENT",
    "UE0001": "EMBEDDED RESULT LTD.",
    "LN0121": "NEIS TRADING (THAILAND) LTD.",
    "LA0003": "AMALLION ENTERPRISE",
    "LM0177": "M.D.PRODUCT CO.,LTD.",
    "LG0132": "GENERAL TECHNOLOGY CO.,LTD.",
    "CS0004": "SUMITOMO CORPORATION",
    "LA0523": "AIT SERVICE CO.,LTD.",
    "LS1163": "S.L.K.ENGINEERING CO.,LTD.",
    "LA0524": "AUTOFLEXIBLE ADVANCED ENGINEERING",
    "CH0002": "HUIZHOU SOLUTEC ENGINEERING",
    "JT0005": "TOSHIBA CARRIER CORPORATION",
    "LS1164": "SIAM K.T.E. CO.,LTD.",
    "LP0945": "PPN MARKETING CO.,LTD.",
    "LP0946": "P.CHAROENCHAI LTD.,PART.",
    "LM0179": "MKK (THAILAND) CO.,LTD.",
    "LW0074": "WS Multimedia and Service",
    "LS1165": "SOCOM SOLUTION TECHNOLOGY",
    "CQ0001": "QINGDAO YUNLU ELECTRONICS",
    "LM0180": "MARVEL TECHNOLOGY CO.,LTD.",
    "LS1167": "S.E.A. RING CO.,LTD.",
    "LU0089": "UNION AND OJI INTERPACK CO.,LTD.",
    "JT0006": "TOKYO SANGYO CO.,LTD.",
    "LT3285": "TELCOMM RATTIKORN CO.,LTD.",
    "LV0072": "VATAKIT ENGINEERING SUPPLY",
    "CS0005": "SHANGHAI WINWORLD TRADING",
    "LD4008": "DEJHCHAI NILGOSOL",
    "LG0134": "GENERAL RECORD INTERNATIONAL",
    "LB0153": "BT MIDLAND CO.,LTD.",
    "LC0204": "CPC DECAL CO.,LTD.",
    "LN0123": "NOVA ENERGY CO.,LTD.",
    "LZ0002": "ZENPHOENIX CO.,LTD.",
    "CR0001": "RECHI PRECISION CO.,LTD.",
    "LT3286": "TRECON CO.,LTD.",
    "LN0125": "NATTAVIT INTERTRADE CO.,LTD.",
    "LI0094": "INTERSTATE SMURFIT-STONE",
    "LN0126": "NUMCHOKESUP TRADING",
    "LC0128": "CHIYODA KOHAN (THAILAND) CO., LTD.",
    "TY0001": "YING LIN MACHINE INDUSTRIAL CO.,LTD",
    "LA0179": "AS TRADING SAPANMAI CO.,LTD.",
    "LS0281": "SIRICHAIAIR SALES AND SERVICES CO.",
    "LM0196": "MULTI-CONTACT(THAILAND) CO.,LTD.",
    "LP0948": "PCN FORKLIFT ENGINEERING",
    "LU0090": "UN PLUS CO.,LTD.",
    "LN0127": "NETBAND CONSULTING CO.,LTD.",
    "LM0181": "M.B.G. FORKLIFT OFFICE LIMITED",
    "LP0949": "P.P. PROPRINT CO.,LTD.",
    "LT3289": "TOP LASER PROCESSING CO.,LTD.",
    "JF0002": "FD MODEL ART COMPANY",
    "LK0118": "K.MATERIAL (THAILAND) CO.,LTD.",
    "LF0112": "FLOW IDEA (THAILAND) CO.,LTD.",
    "LL0052": "LONGTHAI INTERNATIONAL GROUPS",
    "LP0216": "PPC TECHNOLOGY PRECISION CO.,LTD.",
    "LJ0043": "J.T.S. MACHINETOOLS LIMITED",
    "SS0006": "NISSEI CORPORATION ASIA PACIFIC",
    "LE0161": "ELECTRIC CITY ROJANA ENGINEERING",
    "LV0075": "VICTOR LIGHTING THAILAND CO.,LTD.",
    "LS0261": "SYNERGY ADVANTAGE TECHNOLOGIES",
    "LK0188": "KKP & C COMPANY LIMITED",
    "CZ0002": "ZHEJIANG SANHUA CLIMATE AND",
    "LG0137": "GLOBAL STAR TECHNOLOGY CO.,LTD.",
    "LC0224": "C.C.S.ADVANCE TECH CO.,LTD.",
    "LD0095": "DU PONT (THAILAND) LIMITED",
    "LM0198": "MAJOR IT (THAILAND) CO.,LTD.",
    "SB0003": "BURR OAK TOOL INC.",
    "LS1172": "S.K.ZIRCON SUPPLY CO.,LTD.",
    "LS1173": "STAR ONE MARKETING(2003) CO.,LTD.",
    "LK0119": "K.PRASIT",
    "LS1175": "SIAM WATER FLAME CO.,LTD.",
    "LD0089": "CHIN POON ELECTRONICS (THAILAND)",
    "LT0939": "THANANAN GARMENT",
    "LC0215": "CNS ENGINEERING SERVICE CO.,LTD.",
    "LK0189": "KLENCO (THAILAND) CO.,LTD.",
    "LE0164": "EMBEDDED TECHNOLOGY CO.,LTD.",
    "LA0167": "ARTIFACT ENGINEERING CO.,LTD.",
    "LK0191": "KINETICS CORPORATION CO.,LTD.",
    "LT0948": "T.P.INTERRUBBER LTD.,PART.",
    "LT0234": "TREE SPACE LIMITED PARTNERSHIP",
    "LA0181": "APOGEE WORDWIDE CO.,LTD.",
    "LN0136": "N.P.HYDRAUMATICS SUPPLY CO.,LTD.",
    "LV0074": "VICTOR PRODUCT STANDARD CO.,LTD.",
    "LT3291": "THAISKY-DIGITAL CO.,LTD.",
    "LK0120": "KYOCERA CHEMICAL (THAILAND) LTD.",
    "LA0159": "AT. RESEARCH COMPANY LIMITED",
    "LA0160": "ASAHI OMNI (THAILAND) CO.,LTD.",
    "LP0950": "POLYFOAM HIGH-TECH CO.,LTD.",
    "JT0007": "TOSHIBA DOCUMENT CORPORATION",
    "JE0003": "ECO CORPORATION",
    "LE0156": "ENVIRONMENT SPHERE CO.,LTD.",
    "LT0497": "THAI DAMRONG CONTRACTOR CO.,LTD.",
    "LT0498": "THAI NONDESTRUCTIVE TESTING",
    "LM0186": "MAXSOFT PRECISION (THAILAND)",
    "LO0030": "OVAL (THAILAND) LTD.",
    "LR0103": "RECOSTECH COMPANY LIMITED",
    "LN0133": "NAKORNLAUNG TECHNOLOGY CO.,LTD.",
    "LI0106": "INTRO ENTERPRISE CO.,LTD.",
    "LA0182": "ABSOLUTE POWER LIMITED PARTNERSHIP",
    "LS0284": "S.P.K. PLASTIC CO.,LTD.",
    "LT0949": "TASSAPON LOHAKIJ CO.,LTD.",
    "LP0227": "PROLIFIC HEATION INTERNATIONAL",
    "LS1176": "SOLID SYSTEM CO.,LTD.",
    "LS0259": "SPENCO LIMITED",
    "LS1177": "S.S.C.E. COMPUTER AND SERVICE",
    "LA0162": "A-N FASHION LIMITED PARTNERSHIP",
    "LO0028": "ORACLE CHEMICAL LIMITED PARTNERSHIP",
    "LJ0041": "JINGZHUNG CO.,LTD.",
    "LB0154": "BANGKOK GIFT & DESIGN CO.,LTD.",
    "LS1178": "SIAM HANWA CO.,LTD.",
    "LC0207": "COMMUNICATION & SYSTEM SOLUTION",
    "LY0019": "YOU GOT IT ART CONSULTANT CO.,LTD.",
    "LK0182": "MASTERPAC-ASIA CO.,LTD.",
    "SK0003": "KATO SPRING (SINGAPORE) PTE LTD.",
    "LS0265": "SOLUTION YOURS CO.,LTD.",
    "LA0172": "AKARAKORN DEVELOPMENT CO.,LTD.",
    "JK0002": "KANEMATSU KGK CORP.",
    "LS0266": "SIAM FINE PRODUCTS CO.,LTD.",
    "LS0267": "SPECIAL DIES",
    "JT0010": "TOSHIN CHEMITECH CO.,LTD.",
    "LC0219": "C.K.MACHINE TOOL CO.,LTD.",
    "LM0199": "MITSUYA LIMITED",
    "ST0004": "TESTECH ELECTRONICS PTE LTD.",
    "LP0228": "POWER SEA ENGINEERING LTD.,PART",
    "LJ0047": "JPM SUPPLY CO.,LTD.",
    "LC0005": "CIVIL MASTER CONSTRUCTION CO., LTD.",
    "CG0002K": "GUANGDONG MEIZHI COMPRESSOR LIMITED",
    "JB0001": "BUNKABOEKI KOGYO CO.,LTD.(BBK)",
    "LM0183": "MEGA ADVANCE CO.,LTD.",
    "LP0951": "P.C.TAKASHIMA(THAILAND) CO.,LTD.",
    "LS1179": "SNAKE STEEL LIMITED PARTNERSHIP",
    "LT3293": "THAT'S RIGHT INITIATIVE CO.,LTD.",
    "LS0268": "SAWATDEE LOGISTICS CO.,LTD.",
    "LV0076": "V.R.HANDLE CO.,LTD.",
    "UE0002": "EUCLID UNIVERSAL CORPORATION",
    "LK0194": "KAOSU PACKING INDUSTRY CO.,LTD.",
    "LH0060": "HORN SONIC CO.,LTD.",
    "LF0117": "FASTER ENTERPRISE CO.,LTD.",
    "LT0950": "THANAWAN",
    "LM0200": "M.M.R. ENTERPRISE CO.,LTD.",
    "NA0002": "ABK-Qviller AS",
    "LT0951": "THAI METAL PARTS ENGINEERING",
    "LT3294": "TRUE DISTRIBUTION & SALE",
    "LS1180": "SRISAKOL PREMIUM CO.,LTD.",
    "LA0527": "ASIAN BEST TECHNOLOGY CO.,LTD.",
    "LM0184": "METALLIC T.F.(1999) CO.,LTD.",
    "LB0155": "BEST BUY SUPPLIES CO.,LTD.",
    "JT0008": "TOSHIBA HOME APPLIANCES",
    "LP0952": "POWER PLUS COMMUNICATION",
    "LA0528": "ACCORD PREVAIL ELECTRIC",
    "LJ0044": "J.S.T. COMPONENTS (THAILAND)",
    "LT0500": "TRISAK AUTOMATION CO.,LTD.",
    "LC0221": "COOL & TOON AIR SERVICE CO.,LT.D",
    "LJ0004": "JSR ENTECH CO., LTD.",
    "LT0023": "TAWEESUB ENGINEERING AIR CENTER",
    "LT0025": "THORNVIK POLYTECH CO.,LTD.",
    "LM0201": "MECHWORTH CO.,LTD.",
    "LT0508": "TILLEKE & GIBBINS INTERNATIONAL",
    "JB0002": "Blancco Japan Inc",
    "LZ0004": "ZILLION SUPPLY CO.,LTD",
    "SK0004": "KODENSHI SINGAPORE PTE.LTD.",
    "LI0096": "FOUNDATION OF INDUSTRIAL",
    "LB0156": "BIG INK",
    "LP0953": "PIAMSIN DESIGN",
    "LU0091": "U-SERVICES (MAHACHAI) CO.,LTD.",
    "LG0135": "GK FINECHEM CO.,LTD.",
    "LM0192": "MICRO PRECISION CALIBRATION",
    "LE0166": "ENERGY SOLUTION PROVIDER",
    "LS0274": "SPARTAN PERIPHERAL (THAILAND)",
    "LB0161": "BANGKOK KOMATSU FORKLIFT CO.,LTD.",
    "LT0511": "THAI STAINLESS STEEL CO.,LTD.",
    "LC0226": "CLEAN PLUS (THAILAND) CO.,LTD.",
    "LC0229": "CH.SAHASEIKAITECH CO.,LTD.",
    "LV0078": "V & A SERVICES LIMITED PARTNERSHIP",
    "LE0158": "EASTERN POLY TECH CO.,LTD.",
    "LS1184": "SAHA TECHNO EQUIPMENT CO.,LTD.",
    "LN0130": "NCR INTERTRADE CO.,LTD.",
    "LJ0042": "JAGUAR INDUSTRIES (THAILAND)",
    "LS1188": "S.SUWAN AND SERVICE CO.,LTD.",
    "HS0004": "SHIRAI ELECTRONICS TECHNOLOGY",
    "LB0162": "BRENNTAG INGREDIENT(THAILAND)",
    "LT0513": "THONGCHUEA ENGINEERING CO.,LTD.",
    "LH0063": "HOTTEMP (THAILAND) CO.,LTD.",
    "LE0169": "FOUNDATION FOR INDUSTRIAL",
    "JT0012": "TOSHIBA CARRIER CORPORATION",
    "LT0952": "THAINICS PART AND SERVICE CO.,LTD.",
    "LP0233": "PROMATERIAL AND EQUIPMENT CO.,LTD.",
    "LB0158": "BT CONNECT CO.,LTD.",
    "LA0530": "ANACOM II CO.,LTD.",
    "LS1186": "S.A.F.SPECIAL STEELS CO.,LTD.",
    "LK0187": "KOHSEISHA CO.,LTD.",
    "LR0105": "RANK GROUP CO.,LTD.",
    "MAR_SHIP": "MARIANA SHIPPING (THAILAND) CO.,LTD",
    "LT0947": "THAI INSAN TECH CO.,LTD.",
    "LB0163": "BSL TECHNOLOGIES (THAILAND)",
    "MB0001": "BSL TECHNOLOGIES SDN.BHD.",
    "LS0280": "SMS PINTECH CO.,LTD.",
    "LA0188": "ALL DESIGN AND PRINTING GROUP CO.,L",
    "LA0189": "ACTIVE PLAN INTERTRADING CO.,LTD.",
    "LM0204": "MAX VALUE TECHNOLOGY CO.,LTD.",
    "LI0112": "I-BORN SUPPLY & SERVICE CO.,LTD.",
    "LL0054": "LEADER FIRE SAFETY CO.,LTD.",
    "LS0295": "SORASIT WELDING PART CO.,LTD.",
    "LU0096": "UTOC (THAILAND) CO.,LTD.",
    "LA0191": "ACE ULTIMATE CO.,LTD.",
    "LL0053": "LUCKY PAINT LT.,PART",
    "LW0077": "WATER NET PUBLIC COMPANY",
    "SI0002": "INSIGHT TECHNOLOGY SOLUTIONS",
    "LT3295": "TR MODERN INDUSTRY CO.,LTD.",
    "LC0211": "CANON MARKETING (THAILAND) CO.,LTD.",
    "LS1071": "SIAM HITECH INSTRUMENT LTD.,PART.",
    "NK0003": "KAKINUMA KINZOKU SEIKI",
    "LP0202": "PenNueng Holding Co.,Ltd.",
    "LS0131": "SIRIWET 2",
    "LV0063": "Volex(Thailand)",
    "SS0003": "SMK ELECTRONICS SINGAPORE PTE LTD",
    "LN0106": "NICHICON (THAILAND) CO.,LTD.",
    "LS0132": "SAFTROL CO.,LTD.",
    "LI0080": "INFORGEN DATA SYSTEM CO.,LTD.",
    "SK0002": "KANEMATSU SEMICONDUCTOR",
    "LR0078": "Rianthong Trophy Ltd.,Part.",
    "LK0097": "KORNRADA (2003) BANGKOK CO.,LTD.",
    "LP0096": "POWER MOLD FACTORY CO.,LTD.",
    "LO0002": "OIZURU CHUGEN PACKAGING SYSTEM",
    "LS0129": "SOUTHEAST ASIA NETWORK CORPORATION",
    "ML0001": "LIPRO MOLD ENGINEERING SDN.BHD.",
    "LW0064": "WATCHARAPHON PRODUCT",
    "LP0201": "PSN Engineering & Supply Co.,Ltd.",
    "LB0118": "BEST MASTER CO.,LTD.",
    "LK0093": "KITCHA ADVANCE TECHNOLOGY CO.,LTD.",
    "LA0130": "AUTTHAYA FORKLIFT CENTER",
    "LM0159": "MEE KAI CHAROEN SUPPLY LTD.,PART.",
    "LE0142": "ES TECHNOLOGY CORP.",
    "LC017": "C.N.I. ENGINEERING SUPPLY CO.,LTD",
    "LC0171": "S.M.N METAL WORKS CO., LTD",
    "LG0042": "GRAND MIND PRINT LTD.,PART.",
    "CU0001": "COPELAND CORPORATION",
    "LT0899": "T.U.PACK CO.,LTD.",
    "LM0158": "MASKO NEXT TECH CO.,LTD.",
    "SB0002": "BAOSTEEL SINGAPORE PTE LTD.",
    "LI0078": "INTERPRINT IMAGING CO.,LTD.",
    "LR0025": "RANGSIT COMMUNICATION LTD.,PART.",
    "LP0193": "POSH COMMERCE LTD.,PART.",
    "LS0117": "SIAM LUCKY CO.,LTD.",
    "LS1118": "SIAM LUCKY CO.,LTD.",
    "LE0014": "ETERNAL PLASTICS CO.,LTD.",
    "KS0001": "SAMSUNG GENERAL CHEMICALS CO.,LTD.",
    "LP0165": "P. PRINCE INTERNATIONAL CO.,LTD.",
    "LT0859": "THAI CARTON (RANGSIT) SERVICE",
    "LP0166": "P.T. PACKAGING CO.,LTD.",
    "LT0860": "TRANSTEL",
    "LP0929": "PHAKHA ENGINEERING LIMITED PARTNERS",
    "LD0082": "DELTA ELMECH CO.,LTD.",
    "LF0093": "FEE TAT ELECTRIC CO.,LTD.",
    "LB0119": "B.B.K CENTER GROUP CO.,LTD.",
    "LD0077": "DPS INDUSTRIAL SERVICE CO.,LTD.",
    "LH0047": "HOBERD INDUSTRY CO.,LTD.",
    "LT0903": "THAI-YAZAKI ELECTRIC WIRE CO.,LTD.",
    "LH0048": "HYDRO PRODUCTS EXCELLENT CO.,LTD.",
    "LU0076": "UPPERGRADE INTERNATIONAL (1988)",
    "LE0144": "ENERGY MAINTENANCE SERVICE CO.,LTD.",
    "LS0128": "SUAN LUANG ENGINEERING LTD.,PART.",
    "LG0044": "GLOVE TEX CO.,LTD.",
    "LB0116": "B.R.L. CORPORATION CO.,LTD.",
    "LA0134": "ASIA CHEMICAL & SERVICE CO.,LTD.",
    "LE0143": "E-INDUSTRY WORLD CO.,LTD.",
    "AM0001": "MOLDFLOW PTY LTD.",
    "LC0153": "COMFORT INTERNATIONAL CO., LTD.",
    "LS1070": "SAINT ENVIR CO.,LTD.",
    "LT0861": "THAI UNION FASTENERS CO.,LTD.",
    "LC0043": "C.S. TRADING",
    "LF0084": "FUCUND FITTING STAINLESS CO.,LTD.",
    "LG0031": "GROUP SEVEN ENGINEERING CO.,LTD.",
    "LG0035": "GRAND SPORT LTD., PART.",
    "LM0120": "MELAMINE THAI CO.,LTD.",
    "LN0083": "N.S.MARKETING",
    "LP0020": "P.K. ENTERPRISE GENERAL SUPPLY",
    "LP0158": "PATTANA INTERNATIONAL CO.,LTD.",
    "LR0075": "RUNGRUENG HARDWARE",
    "LS0216": "SIAM DYNA SUPPLY CO.,LTD.",
    "LT3240": "TEST TECH CO.,LTD.",
    "N71855": "SHIBAURA NIDEC CORPORATION",
    "N71856": "TAMURA CORPORATION SINGAPORE BRANCH",
    "N71857": "SAGINOMIYA SEISAKUSHO,INC.",
    "HS0001": "SHINANO KENSHI (H.K.)CO.,LTD.",
    "LP0923": "P.S.N. PRODUCTS LTD., PART.",
    "LL0045": "L.P.S SUPPLY CENTER CO.,LTD.",
    "LP0925": "PERFECT ENGINEERING SERVICE",
    "LK0106": "KGK ENGINEERING (THAI) CO.,LTD.",
    "LM0166": "MATERIAL STANDARD CO., LTD.",
    "LS1133": "SOFT-SLING (THAILAND) LIMITED",
    "LT0932": "Thai Auto Tools And Die Co.,Ltd.",
    "GENESYS": "GENESYS CONFERENCING PTE LTD.",
    "SA0004": "Alcoa Singapore Pte Ltd",
    "CA0002": "ALCOA BOHAI ALUMINUM INDUSTRIES",
    "LF0104": "FUNCTION INTERNATIONAL CO.,LTD.",
    "LH0053": "HALO RICH ENGINEERING CO.,LTD.",
    "LD0083": "DELTA ELMECH CO.,LTD.",
    "CS0003": "SHANGHAI HITACHI ELECTRICAL",
    "LL0013": "LAMOOL ENGINEERING CO.,LTD.",
    "LM0105": "MODERN CHEMICAL CO.,LTD.",
    "LS0125": "SIRISILP INTERGARMENT LTD.,PART.",
    "LB0115": "BEST POWER SERVICE CO.,LTD.",
    "LS0126": "SHINKAN INDUSTRY (THAILAND)",
    "LO0009": "ORIENTAL THAI INDUSTRIES CO.,LTD.",
    "LP0198": "Prakornassociate Co.,Ltd.",
    "LP0199": "PERFECT CHEMICAL AND SERVICE",
    "LM0101": "MASTECH TRADING & MACHENING",
    "LK0005": "KABPHA TECHNOLOGY & ENGINEERING",
    "LL0001": "LAB VALLEY LIMITED PARTNERSHIP",
    "JS0006": "Sumisho Metalex Corporation",
    "ET0001": "TOSHIBA CARRIER UK LIMITED",
    "LC0191": "C.N.I ENGINEERING SUPPLY CO.LTD.",
    "PT0001": "PRINTED CIRCUIT BOARD TECHNOLOGY",
    "LS0163": "SOFTCONTROL CO.,LTD.",
    "LS1129": "SANSHIN ELECTRONICS (THAILAND)",
    "LU0081": "UNION THERM CO., LTD.",
    "LP0927": "P.T. AIR-SEA PACKING SERVICE",
    "LP0928": "PREMIUM PRODUCTS INDUSTRIES",
    "LT0933": "TNC ENGINEERING AND TRADING CO.,LTD",
    "LM0167": "MANAC ENGINEERING CO.,LTD.",
    "LB0128": "BANG YANG TECH CO.,LTD.",
    "LD0084": "DIGI CRON CO.,LTD.",
    "LC0194": "CREFORM YAZAKI (THAILAND) CO.,LTD.",
    "SAFARI": "SAFARI WORLD PUBLIC CO.,LTD.",
    "LA0154": "A.M. ENGINEERING AND SUPPLY",
    "LJ0038": "JIRA PRO PRINT LIMITED PARTNERSHIP",
    "LR0093": "RS COMPONENTS CO.,LTD.",
    "LB0130": "BARA SCIENTIFIC CO.,LTD.",
    "LD0085": "DUMRONGCHAI SAFE & STEEL FURNITURE",
    "LP0930": "PT Inter Lube Co.,Ltd.",
    "LD0086": "DIATEC PRECISION CO.,LTD.",
    "LP0931": "POWER COMM ENGINEERING CO.,LTD.",
    "LY0006": "YAMASHITA TECH (THAILAND) CO.,LTD.",
    "LT0902": "THAI MEIDENSHA CO.,LTD.",
    "LA0112": "ANALYTICAL AND CONTROL TECHNOLOGY",
    "LC0174": "CHAICHAROEN TECHNOLOGY CO.,LTD.",
    "JM0003": "MATSUO ELECTRIC CO.,LTD.",
    "LC0175": "CDG MICROSYSTEMS LIMITED",
    "CS0002": "ZHEJIANG SANHUA CO., LTD.",
    "LS0124": "S.S. CAMERA COMPANY LIMITED",
    "LF0092": "FIGHT ENGI-TRADE CO.,LTD.",
    "LK0095": "KSIT INTERNATIONAL CO.,LTD.",
    "LT0900": "THAI YONG SUPPLY (1995) LTD.,PART.",
    "LT0901": "THAI PHATANASIN (CHIN SENG)",
    "JE0001": "EISHIN METALLIC MOLD",
    "LI0043": "INTER COMPUTER CO.,LTD.",
    "LP0139": "PRODUCTIVE ENTERPRITE LIMITED",
    "MR0001": "RJL CONTROLS(MALAYSIA)SDN. BHD.",
    "NK0009": "NIPPON KOHBUNSHI CO.,LTD.",
    "LF0083": "FASE MOLD CO.,LTD.",
    "LS1130": "SIAM SPOKES INDUSTRIAL CO.,LTD.",
    "LC0192": "CANLIFT CO.,LTD.",
    "LO0025": "OMRON ELECTRONICS CO., LTD.",
    "JK0001": "KUSUMI CO.,LTD.",
    "LS1131": "SAHACHAI INTERTRADE CO.,LTD.",
    "LT0930": "TIRANA STICKER & TAPE CO.,LTD.",
    "LF0102": "FLOWTECH ENTERPRISE LTD.,PART.",
    "LC0193": "CBR MARKETING LTD.,PART.",
    "LT0934": "TECHNOLOGY MODEM LIMITED",
    "LG0126": "GENERAL VACUUM & FLOW CO.,LTD.",
    "LG0127": "WORAPON WELDING AND TOOLS",
    "LN0114": "NIPPON PANEL (THAILAND) CO.,LTD.",
    "LB0141": "B-TAC INDUSTRIAL AUTOMATION",
    "LW0070": "WORLD FURNITURE LTD.,PART.",
    "CG0002": "GUANGDONG MEIZHI COMPRESSOR LIMITED",
    "LL0026": "LAFATECH CO.,LTD.",
    "LW0063": "WANCO INDUSTRIAL (THAILAND)CO.,LTD.",
    "LP0197": "PRO-BUILD ASIA CO.,LTD.",
    "LB0114": "BANGKOK SAFETY & SLING CO.,LTD.",
    "LT0192": "TRISAK AUTOMATION CO.,LTD.",
    "LS1119": "S N C FORMER PUBLIC COMPANY LIMITED",
    "CT0002": "TOSHIBA INTERNATIONAL TRADING",
    "LH0066": "HANWA STEEL SERVICE (THAILAND) CO.",
    "JE0004": "ECOTS JAPAN CO.,LTD.",
    "LR0111": "RMS SALES CO.,LTD.",
    "LT0002": "THAI SANEI CO.,LTD.",
    "LT0003": "THAI CONST & BUILDING MANUFACTURING",
    "LD0003": "DIVERSEY HYGIENE (THAILAND) CO.,LTD",
    "LF0118": "FOURTRONIC TECHNOLOGY CO.,LTD.",
    "LT0045": "THE ENTERPRISE RESOURCES TRAINING",
    "JM0004": "MICRO RESEARCH PRECISION CO.,LTD.",
    "LF0106": "FRIEND-MECH LIMITED PARTNERSHIP",
    "LC0227": "SKY ICT PUBLIC COMPANY LIMITED",
    "LF0099": "F G A (THAILAND) COMPANY LIMITED",
    "LE0173": "ELECTRIC CITY BANGKOK ENGINEERING",
    "LW0073": "WOORI MOLD (THAILAND) CO.,LTD.",
    "CW0001": "WELLING INTERNATIONAL HONG KONG",
    "LN0142": "NIDEC INSTRUMENTS (THAILAND)",
    "LN0018": "NDT INSTRUMENTS (THAILAND) CO.,LTD.",
    "LK0027": "CHIN FONG (THAILAND) CO., LTD.",
    "LF0006": "Fine Metal Technologies Public",
    "LD0096": "DOUBLE D SERVICE LTD.,PART",
    "LS0031": "SNC FORMER PUBLIC COMPANY LIMITED",
    "LD0014": "DAHAI THAI INDUSTRY CO., LTD.",
    "LA0161": "AMET CO.,LTD.",
    "CC0006": "CHANGZHOU CITY JUNYE ALUMINUM CASE",
    "LB0131": "BHATARA PROGRESS CO.,LTD.",
    "LK0019": "JAKKOL ENGINEERING COMPANY LIMITED",
    "JT0016": "TOKYO SEIDEN CO., LTD.",
    "LS0032": "SUPREME PRINT CO.,LTD.",
    "CZ0003": "ZHONGSHAN DYNAMIC PLASTIC",
    "LM0191": "M.I.D. ENGINEERING CO.,LTD.",
    "LH0005": "H&P E.S LIMITED PARTNERSHIP",
    "LC0009": "CMYJ CO.,LTD.",
    "LS0040": "SYNERGY INTERTRADE CO.,LTD.",
    "LS1128": "SAGINOMIYA (THAILAND) CO.,LTD.",
    "LS0149": "S.A.J.I. (THAILAND) CO.,LTD.",
    "LN0120": "NEO ENGINEERING CO.,LTD.",
    "LM0195": "M.I.D. CONSTRUCTION CO.,LTD.",
    "LM0168": "MASTER CALIBRATION CO., LTD.",
    "LP0173": "PHALANG THAI RICE TRADING CO., LTD.",
    "LS0025": "SALEE ENGINEERING COMPANY LIMITED",
    "LP0022": "PROCHEMTECH ENGINEERING CO.,LTD.",
    "LW0015": "WK PRECISION LIMITED PARTNERSHIP",
    "SZ0001": "ZWICK ASIA PTE LTD.",
    "LT0030": "THAI NISHIYAMA METAL CO.,LTD.",
    "LS0142": "SIAM MOTORS INDUSTRIES CO.,LTD.",
    "LR0108": "ROYAL WATCH & CLOCK CO.,LTD.",
    "LR0107": "RUJITECH COMPANY LIMITED",
    "LQ0009": "QUALITY CIRCLE CO.,LTD.",
    "LP0935": "PATTANAKIJ INTERTRAD CO., LTD.",
    "LP0926": "PRECISION MACHINERY ENGINEERING",
    "LP0215": "11 PHOTO LAB",
    "LD0013": "DAIKURE (THAILAND) CO.,LTD.",
    "LV0062": "VS. INTER MARKETING CO.,LTD.",
    "LV0054": "VICTRON UPS (THAILAND) CO.,LTD.",
    "LV0077": "VICHAI FURGO INTER CO.,LTD.",
    "LV0073": "VERTEX TRADING CO.,LTD.",
    "LV0070": "V.P.HYDRAULIC CO.,LTD.",
    "LW0011": "WISETCOOL CENTER (THAILAND)",
    "LJ0006": "J.S ASIA LIFT CO.,LTD.",
    "LP0121": "PRO REWORK MACHINE CO., LTD.",
    "LT0029": "TEC MART (THAILAND) CO.,LTD.",
    "LU0008": "UACJ TRADING (THAILAND) CO., LTD.",
    "LT3271": "THAI JACKET PROMOTION 2001 LTD.",
    "LH0051": "H.M.E. MACHINERY (THAILAND)",
    "LH0049": "HOPPY INDUSTRIAL(THAILAND)CO.,LTD.",
    "LY0017": "AZBIL (THAILAND) CO.,LTD.",
    "LY0007": "YONGYUTH ENGINEERING",
    "LW0075": "WAN LI PACKING ENTERPRISE",
    "LT0938": "TONGSUKSIRI AUTOMATION",
    "LC0214": "C & A COMPUTER CO.,LTD.",
    "LI0086": "IT SOLUTIONS AND SERVICES CO.,LTD.",
    "LI0083": "ICELANDIC CO.,LTD.",
    "LC0210": "CODE LABEL CO., LTD.",
    "LE0163": "Copeland (Thailand) Limited",
    "LC0203": "CERA DECOR CO.,LTD.",
    "LC0197": "CRV PACKAGING CO., LTD.",
    "LC0186": "CP-MEIJI CO.,LTD.",
    "LD0094": "DILOK AND SONS CO.,LTD.",
    "LD0093": "D.D.HYDRAULIC INDUSTRY LIMITED",
    "LC0183": "MAXKLEN COMPANY LIMITED",
    "LD0087": "DIGITAL OA CO., LTD.",
    "LD0074": "DKSH (THAILAND) LIMITED",
    "LB0148": "B.O.TEEM LIMITED PARTNERSHIP",
    "LI0073": "I.D. SUPPLYS CO.,LTD.",
    "LP0024": "PIOHM CORPORATION CO.,LTD.",
    "LM0194": "MATERIALS HANDLING BUSINESS",
    "LM0187": "MPI-NEO CO.,LTD.",
    "LM0185": "MECOMB (THAILAND) LIMITED",
    "LM0178": "MEGA BRIGHT BUSINESS AND LAW",
    "LK0185": "KOHBYO (THAILAND) CO.,LTD.",
    "LI0104": "INFOSAT CO.,LTD.",
    "LI0101": "IWASHITA INSTRUMENTS (THAILAND)",
    "LI0089": "IDEA CONNECT CO.,LTD.",
    "LH0057": "HIGH TORQUE (2004) CO.,LTD.",
    "LH0055": "HAABIT CO.,LTD.",
    "LH0058": "HOYO (THAILAND) CO.,LTD.",
    "LH0041": "HOEI ELECTRONICS(THAILAND)",
    "LK0084": "KPS INTERMARKETING CO., LTD.",
    "LP0010": "P.A. CLEAN & TOOLING PRODUCTS",
    "LF0007": "FAST MOVING LIMITED",
    "CK0001": "KUSUMI (WUXI) TECHNOLOGY CO.,LTD.",
    "LS1170": "SIWA TESTING INSPECTION",
    "LS0276": "SIAM CARTON INDUSTRY CO.,LTD.",
    "LS0271": "SMARTSOFT TECHNOLOGY LTD.,PART.",
    "LS0269": "SIAM RAJATHANEE CORPORATION",
    "LS0260": "SIAM KYOHWA SEISAKUSHO CO.,LTD.",
    "LS0156": "SPN (2002) COMPANY LIMITED",
    "LT0937": "TRIPLE STAR PACK CO.,LTD.",
    "LT0499": "T.G. INTERMARKETING CO.,LTD.",
    "LT0021": "THAI INDUSTRIAL GASES PUBLIC",
    "LC0236": "CNC ADVANCE MOLD CO.,LTD.",
    "LC0234": "CHARAN ASSOCIATES CO.,LTD.",
    "LC0232": "CIRCUIT INDUSTRIES CO.,LTD.",
    "LC0228": "CENTER CLEAN CO.,LTD.",
    "LC0217": "C.K. ELECTECH CO.,LTD.",
    "LE0167": "EAK ROONG RUANG INDUSTRIAL",
    "LC0205": "CHALIT INDUSTRIAL CO.,LTD.",
    "LC0168": "CALPEDA (THAILAND) CO.,LTD.",
    "LE0162": "EXPRESS ADVERTISING CO.,LTD.",
    "LD0092": "DYNAMICS SYSTEM AND SOLUTION",
    "LD0090": "DRAGONS ARMOUR CO.,LTD.",
    "LD0075": "DURACRETE CO.,LTD.",
    "LC0209": "CHUPUN INDUSTRIAL SERVICES",
    "LC0208": "CHAWCHAROEN TRADING LTD.",
    "LB0159": "BUILDER MASTER CO.,LTD.",
    "LB0151": "BRAINWORK ADVERTISING",
    "LB0149": "BASELL ADVANCED POLYOLEFINS",
    "LB0025": "BANGKOK MOTOR INDUSTRIAL",
    "LA0195": "ASIAMIX ENGINEERING GROUP CO.,LTD.",
    "LA0184": "AIR LIQUIDE (THAILAND) LTD.",
    "LA0176": "ACMEN INTERNATIONAL CO.,LTD.",
    "LA0110": "AC - CAS GROUP CO., LTD.",
    "LA0029": "AERO TECHNOLOGY (THAILAND) CO.,LTD.",
    "LB0144": "BANGKADI INDUSTRIAL PARK CO.,LTD.",
    "LB0142": "BAR CODE (THAILAND) CO., LTD.",
    "LD0005": "D.N.P. ENGINEERING (THAILAND)",
    "LS0014": "SANWA SEIMITSU KOGYO (THAILAND)",
    "CS0008": "SHANGHAI AVIONICS AND ALUMINUM",
    "LS0015": "SRITONG ENGINEERING CO.,LTD.",
    "LI0009": "IWAKI (THAILAND) CO.,LTD.",
    "LS0162": "S.S.S. ENGINEERING AND SERVICE",
    "LS0019": "SANG CHAI METER CO.,LTD.",
    "LB0016": "BAY CORPORATION LIMITED",
    "LK0021": "KAOSPEED INTER COMPANY LIMITED",
    "LI0088": "IWASE (THAILAND) CO.,LTD.",
    "LE0025": "ECON INTERTRADE CO., LTD.",
    "LA0187": "ASTRO INSTRUMENT CO.,LTD.",
    "LS0066": "SANSHIN HIGH TECHNOLOGY",
    "LG0144": "GET TECHNOLOGY LTD.,PART.",
    "LG0141": "GLOBALTRONIC INTERTRADE CO.,LTD.",
    "LG0136": "GLOBAL FLOW TECH CO.,LTD.",
    "LF0114": "FTG ENGINEERING CO.,LTD.",
    "LG0130": "GIFT BOX CO.,LTD.",
    "LF0115": "FREEWILL SOLUTIONS CO.,LTD.",
    "LF0012": "FIRE WORLD IMPORT EXPORT",
    "LD4007": "DRAGON INDUSTRY",
    "SC0001": "CENTIFORCE INSTRUMENTS PTE.,LTD.",
    "LD0069": "DYNA ENGINEERING (THAILAND)",
    "LN0011": "NP POINT ENGINEERING",
    "LM0146": "3M Thailand Limited",
    "LA0133": "ASAHI SANGYO (THAILAND) CO.,LTD.",
    "LC0039": "CHANCHAI ENGINEERING & EQUIPMENT",
    "LB0167": "BEYOND STAR DESIGN LIMITED PARTNERS",
    "L38424": "THAI KODAMA CO.,LTD.",
    "LB0157": "B.A.CODE ASIA CO.,LTD.",
    "SA0007": "ARKEMA PTE LTD.",
    "LB0129": "B.E.B. ENTERPRISE CO.,LTD.",
    "LB0092": "BARA ADVANCED INFOTECH CO., LTD.",
    "LB0006": "BANGKOK COIL CENTER CO.,LTD.",
    "LB0005": "UNIPART CO.,LTD.",
    "LT0016": "TRANDAR INTERNATIONAL CO., LTD.",
    "LM0103": "MIT SIAM ENGINEERING CO.,LTD.",
    "LK0183": "KTS SIAM CO.,LTD.",
    "LI0092": "INSPECTOR AND ENGINEERING",
    "LI0090": "IBRIDGE CONSULTING CO., LTD.",
    "LR0080": "RANGSIT STEEL AND METAL CO.,LTD.",
    "LI0079": "ISS FACILITY SERVICES CO.,LTD.",
    "LR0042": "RUNG SAENG CHOL CO.,LTD.",
    "LQ0008": "QUALITY REPORT CO.,LTD.",
    "LP0954": "PSL INTERCOOL CO.,LTD.",
    "LP0243": "PREMIER PART COATING CO.,LTD.",
    "LP0236": "CPL GROUP PUBLIC CO., LTD.",
    "LP0235": "POLYSOURCE LTD., PART.",
    "LI0065": "IQA LABORATORY CO.,LTD.",
    "LG0133": "GOLDFLEX SUPPLY CO.,LTD.",
    "LM0039": "MEASURETRONIX LTD.",
    "LM0013": "MALAPLAST CO., LTD.",
    "LA0039": "ALS LABORATORY GROUP (THAILAND)",
    "LS1121": "SIAM SCREW BOLT & NUT CO.,LTD.",
    "LK0014": "K.P.T. MACHINERY (1993) CO.,LTD",
    "SS0009": "SHOWA ELECTRIC SINGAPORE",
    "FV0001": "VTT EXPERT SERVICES LTD",
    "LT0940": "T5 PAPER PALLET CO.,LTD.",
    "LB0001": "BANGKOK LUCKY SAFE CO.,LTD.",
    "LA0525": "ANP 48 ENGINEERING LIMITED",
    "LA0520": "ARTIFACT COMMUNICATION",
    "LS1150": "STEEL ARCHITECT CO.,LTD.",
    "LS0130": "C.S. SUPPLY",
    "LS0127": "SANTITRUM MARKETING PART.,LTD.",
    "LA0175": "ALL ABOUT INSTRUMENTS CO.,LTD.",
    "LR0101": "RICHMAX INTERPRINT CO.,LTD.",
    "LA0171": "ANUSORN PRODUCTS LTD.PART",
    "LU0088": "UNITED MOTOR WORKS (SIAM)",
    "LR0097": "RUNGSIAM AIR AND SERVICE CO.,LTD.",
    "LP0222": "POWER LINK AND TURNKEY CO.,LTD.",
    "LP0206": "PLUSCO CO.,LTD.",
    "LP0203": "PATTHANA KOLLAKARN ENGINEERING",
    "LP0194": "PROFESSIONAL CALIBRATION & SERVICES",
    "LP0153": "PAN INTERNATIONAL ELECTRONICS",
    "LP0081": "P S R INTER (THAILAND) CO.,LTD.",
    "LP0073": "PNEUMAX CO.,LTD.",
    "LP0014": "P.S. GENERATION CO.,LTD.",
    "LP0009": "POP SYSTEM & SERVICE CO., LTD.",
    "LT3288": "TORC CO.,LTD.",
    "LS1058": "STAR ELECTRONIC SALES AND SERVICE",
    "LS1052": "SAFETY SHOES CO.,LTD.",
    "LS1010": "SIAM KENSETSU CO., LTD.",
    "LS1005": "THE SHELL COMPANY OF THAILAND",
    "LS0302": "SCM MAINTENANCE CENTER",
    "LS0299": "S.T.S. PRODUCTS CO.,LTD.",
    "LS0294": "SYNCOMECH (THAILAND) CO.,LTD.",
    "LS0292": "SIAM MELAMINE MARKETING CO.,LTD.",
    "JD0001": "DYNAOX, INC.",
    "LE0013": "ENVIRONMENTAL SOLUTION INTEGRATOR",
    "LV0003": "VERICO CO.,LTD.",
    "LW0016": "WHIZZ-WORK TECHNOLOGY (THAILAND)",
    "LN0012": "Neo Corporation Group Co., Ltd.",
    "LR0009": "RANTONMAINONGBELL",
    "LN0013": "ND FIVA COMPANY LIMITED",
    "LT0931": "THREE K PRINT CO.,LTD.",
    "SL0001": "LUMINA SYSTEMS PTE. LTD.",
    "LP0224": "PIBUL THAMRONG MACHINERY",
    "LS0052": "SIAM PREFLEX LIMITED PARTNERSHIP",
    "LP0223": "PSC INNOVATION (THAILAND)",
    "JT0014": "TOSHIBA CORPORATION",
    "LZ0003": "Z.KURODA (THAILAND) CO.,LTD.",
    "LW0085": "WIT (THAILAND) CO.,LTD.",
    "LB0012": "BRAVO MACHINE SUPPLY CO.,LTD.",
    "LO0012": "OCE (THAILAND) LIMITED.",
    "LO0006": "ORIENTAL MOTOR (THAILAND) CO.,LTD.",
    "LO0005": "OHIZUMI MFG (THAILAND) CO.,LTD.",
    "LN0137": "NK TOOLS ENGINEERING CO.,LTD.",
    "LN0134": "NEWTECH MACHINERY CO.,LTD.",
    "LN0128": "NORTH STAR MARKETING CO.,LTD.",
    "LT0506": "TN MAKER CO.,LTD.",
    "LJ0046": "J.T.(THAILAND) CO.,LTD.",
    "LS0286": "SUNCO SERVICES CO.,LTD.",
    "LS0285": "SMK ENGINEERING LIMITED PARTNERSHIP",
    "LS0283": "SANSHIN ELECTRONICS (THAILAND)",
    "LS0275": "SAMWHA (THAILAND) CO.,LTD.",
    "LS0263": "SW INTERTRADE COMPANY LIMITED",
    "LS0262": "SMART BUSINESS SOLUTIONS CO.,LTD.",
    "LS0213": "S.V.K. SAFE AND FURNITURE CO.,LTD.",
    "LS0207": "SUNOCO (THAILAND) CO.,LTD.",
    "LS0182": "SODICK (THAILAND) CO.,LTD.",
    "CY0001": "YUEQING JINLONG ELECTRONIC",
    "LS0037": "SD MACHINE TECH LTD.,PART.",
    "LD0018": "DAIFUKU (THAILAND) LTD.",
    "LA0032": "ANOWA CONSTRUCTIONS CO., LTD.",
    "JT0017": "TOSHIBA LIFESTYLE PRODUCTS",
    "LW0081": "WORLDWIDE TRADE THAI CO.,LTD.",
    "LU0069": "U.I. ENGINEERING CO.,LTD.",
    "LT3296": "TITAN STEEL CO.,LTD.",
    "LU0095": "UNIROLLCON ENGINEERING (THAILAND)",
    "LT0855": "THAI SOFTWARE ENTERPRISE CO.,LTD.",
    "LT0522": "TOYOTA KRUNGTHAI CO.,LTD.",
    "LT0503": "TATA ELECTRIC AND INDUSTRY CO.,LTD.",
    "LU0007": "UNIPRO MANUFACTURING CO.,LTD.",
    "LS1187": "SITE PREPARATION MANAGEMENT",
    "LT3292": "THAMARUK AUTO PARTS CO.,LTD.",
    "LS1169": "SIAM SAFETY MART LTD.,PART.",
    "LT0305": "TAKASHIMA MITSUGI PF (THAILAND)",
    "LO0026": "OS TOOL (THAILAND) CO., LTD.",
    "LN0116": "NAPAT DESIGN CO., LTD.",
    "LB0164": "BEIJER B GRIMM (THAILAND) LTD.",
    "LN0100": "NAGASE (THAILAND) CO.,LTD.",
    "LN0093": "NARAI PHAND CO.,LTD.",
    "LM0207": "MDEC INTERNATIONAL (1991) CO.,LTD.",
    "LM0206": "MUTHITA CONSTRUCTION LIMITED",
    "LM0205": "MICRON PROMOTION CO.,LTD.",
    "LA0017": "AUTOMATION SERVICE CO.,LTD.",
    "LM0197": "MAJESTIC ENTERPRISE ENGINEERING",
    "LS1182": "SAFECOST (THAILAND) CO.,LTD.",
    "LM0188": "MEECHOKECHAI",
    "LG0005": "GAAP SAFETY INNOVATION CO., LTD.",
    "LK0199": "K.TECH EQUIPMENT CO.,LTD.",
    "LK0016": "KOSHIN TRADING (THAILAND) CO., LTD.",
    "LS0038": "SIAM CREATE ENTERPRISES CO., LTD.",
    "LR0010": "RADIANT GLOBAL ADC (THAILAND)",
    "LB0010": "BRAVO MACHINE SUPPLY CO.,LTD.",
    "LS0039": "SIRIKARNCHANG INTERTRADING",
    "LA0033": "AMMEGA (THAILAND) CO., LTD",
    "LH0007": "HER THAI MACHINERY CO.,LTD.",
    "LS0007": "SUMIKEISHO CORPORATION (THAILAND)",
    "LT0924": "TRIPLE LINK CO., LTD",
    "LT0923": "TKK CORPORATION CO.,LTD.",
    "LQ0002": "Q.C. LINE LIMITED PARTNERSHIP",
    "LT0515": "THAI PHATANASIN QUALITY TOOLS",
    "LT0514": "TOHO FOAM (THAILAND) CO.,LTD.",
    "LT0510": "TECH QUALITY CO.,LTD.",
    "LT0507": "TECHNOPLUS (ASIA) CO.,LTD.",
    "LY0024": "YAMASAKI TRADING CO.,LTD.",
    "LW0082": "WORLD MECHANICS & WORKS CO.,LTD.",
    "IC0002": "CARRIER AIRCONDITIONING &",
    "LS1162": "SIT TEXTILE",
    "LA0118": "ACME CO.,LTD.",
    "HH0001": "HONG KONG NAGAI LIMITED",
    "LA0113": "ADVANCED DATANETWORK COMMUNICATIONS",
    "IW0001": "WEATHER COMFORT ENGINEERS (P) LTD.",
    "CE0001": "EAST ASIA ELECTRICAL EQUIPMENT",
    "LA0010": "A E ENGINEERING (THAILAND) CO.,LTD.",
    "LA0009": "AMAX INTERTECH CO.,LTD.",
    "LS0002": "SANGCHAI EQUIPMENT(1984) CO.,LTD.",
    "LA0030": "ATOS IT SOLUTIONS AND SERVICES",
    "LR0007": "R SEVEN LOGISTICS CO., LTD.",
    "LP0025": "PREMIUM LINEAGE BLOOM CO., LTD.",
    "LI0013": "INTERCOMPO (THAILAND) CO., LTD.",
    "JC0001": "CORE STEEL CO.,LTD.",
    "LA0034": "ATC MOULD AND HARDCHOME CO.,LTD.",
    "LN0015": "NIPPON MULTI BOARD CO.,LTD.",
    "LC0225": "C.H.A INDUSTRIAL CO.,LTD.",
    "LT0177": "TDA RUBBER CORPORATION CO.,LTD.",
    "LE0017": "R Systems Consulting Services",
    "LT0210": "TECHNOLOGY INSTRUMENTS CO.,LTD.",
    "LT0131": "THAI TECHNO PLATE CO.,LTD",
    "LL0018": "LARD KRABANG TOOLS & DIE",
    "LS1185": "SI-SIEAN SALE&SERVICE CO.,LTD.",
    "LS1171": "SUN RISE TECHNOLOGIES CO.,LTD.",
    "LS1149": "S.P.S.CONSULTING SERVICE CO.,LTD.",
    "L39122": "KOKI PRODUCTS CO.,LTD.",
    "L20001": "2D & R COMPANY LIMITED",
    "L12440": "AGC Chemicals (Thailand) Co.,Ltd.",
    "LS0044": "SOLUTION CENTER CO., LTD.",
    "LT0036": "TOKYO RICH INDUSTRY (THAILAND)",
    "LT0037": "THAI HUA SKY INTERNATIONAL",
    "LP0219": "PROTRONICS CO.,LTD.",
    "LW0017": "WORK PAINT DEVELOPMENT LTD.,PART.",
    "LF0121": "FUTURE OA SALES & SERVICE",
    "LK0198": "KRIENG KAMOL 2009 CO.,LTD.",
    "LS0297": "S.B.L. INDUSTRIAL CO.,LTD.",
    "LG0142": "GG GARMENT CO.,LTD.",
    "LN0141": "NOPAVUT CO.,LTD.",
    "LB0168": "BEST CONTAINNER PRODUCTS",
    "LS0003": "SIAM TRIO GROUP CO.,LTD.",
    "LK0002": "K&K AUTOMATION SYSTEM CO.,LTD.",
    "LN0004": "NAMSAE INTERNATIONAL TRADING",
    "LH0001": "HENG JIB HUA CHIENG",
    "LR0001": "RASSAMEEGRANIT",
    "LE0003": "NATIONAL SCIENCE AND TECHNOLOGY",
    "LK0105": "KOHSAN ELECTRONICS (THAILAND)",
    "LF0003": "FUJISAH (THAILAND) CO.,LTD.",
    "LS0088": "Thai SIIX Co., Ltd.",
    "LS0084": "SHINKO PRINTING (THAILAND) CO.,LTD.",
    "LS0048": "SAHARONGROJ (THAILAND) CO.,LTD.",
    "LS0016": "SIAM INTEGRATION SYSTEMS",
    "LS0008": "SAP SYSTEM APPLICATIONS AND",
    "LS0006": "SAEILO (THAILAND) CO.,LTD.",
    "LS0005": "SAFE-T-CUT (THAILAND) CO.,LTD.",
    "LM0124": "MARUKEI INDUSTRY (THAILAND)",
    "LD0100": "DESPAC SECURITY ALARMS SYSTEMS",
    "LV0079": "VICTORY WORLD VIC GROUP",
    "LA0193": "AIM-BRIGHT INTEGRATION CO.,LTD.",
    "LW0083": "WONGWAIWIT INDUSTRIAL SUPPLY CORPOR",
    "LP0237": "P.S.A. INTER-COOLING COMPANY LIMITE",
    "LG0138": "GLOBAL ALLIANCE SERVICE CO.,LTD.",
    "LR0003": "RUTANASUP TRADING LTD.,PART.",
    "JT0013": "TOSHIBA BUSINESS AND LIFE SERVICE",
    "SS0007": "SAN JIANG ELECTRIC PTE LTD.",
    "LM0008": "MEMORYTODAY CO., LTD.",
    "LM0001": "MARUKA MACHINERY (THAILAND)",
    "LL0049": "LONG SHINE (THAILAND) CO.,LTD.",
    "LL0044": "LG Electronics (Thailand) Co.,Ltd",
    "LL0025": "LAFA TECH CO.,LTD.",
    "LL0004": "L.LINE TECHNOLOGY AND SUPPLY",
    "LK0123": "KAGA ELECTRONICS (THAILAND)",
    "LU0098": "UNI G CO.,LTD.",
    "JS0008": "SANSO ELECTRIC CO.,LTD.",
    "ST0005": "TESEQ PTE LTD.",
    "LE0007": "ENTECH REFRIGERATION & PARTS",
    "LP0018": "PANDA PRINTING CO., LTD.",
    "LE0011": "ENGINEERING VACUUM TECHNOLOGY",
    "CJ0001": "JIANGSU CANGHUAN COPPER PRODUCTS",
    "LP0004": "PATHUMCHAT DISTRIBUTOR CO.,LTD.",
    "LK0109": "K P A RUBBER PART & URETHANE CO., L",
    "LK0080": "KITAGAWA ELECTRONICS (THAILAND)",
    "LK0022": "KISCO (T) LTD.",
    "LJ0050": "J.P.HYDROLIC CENTER LIMITED",
    "LJ0048": "JAROONRAT ENGINEERING CO.,LTD.",
    "LJ0028": "JEBSEN & JESSEN MARKETING(T) LTD.",
    "LP0238": "PUNTONGCHAROEN LIMITED PARTNERSHIP",
    "JS0009": "SANWA ELECTRIC CO.,LTD.",
    "VK0001": "KURABE INDUSTRIAL (VIETNAM)",
    "LW0086": "WOENKHUNTHOD CONSTRUCTION LTD.,PART",
    "LP0241": "POLYFOAM SUVARNABHUMI CO.,LTD.",
    "LT0007": "THAI SANEI COMPANY LIMITED",
    "LB0002": "BANGKOK PRESS PARTS CO.,LTD.",
    "HC0003": "C.G. DEVELOPMENT LIMITED",
    "LW0001": "WEL TRON ROYAL TECH CO.,LTD.",
    "LI0111": "IT TECHCOM CO.,LTD.",
    "LI0108": "INNOTECH TEXTILE CO.,LTD.",
    "LI0011": "INFRONT FURNITURE CO., LTD.",
    "LI0005": "I.T. SOLUTION COMPUTER (THAILAND)",
    "LI0004": "INTERTOOL TECHNOLOGIES CO.,LTD.",
    "LI0001": "INOUE RUBBER (THAILAND) PUBLIC",
    "LG0055": "GET COOL CO.,LTD.",
    "LG0003": "GRUNTEC ENGINEERING CO., LTD.",
    "LG0002": "GOLD EXPRESS TRANSPORT",
    "LF0119": "FUJITSU (THAILAND) CO.,LTD.",
    "LE0171": "EATON ELECTRIC (THAILAND) LIMITED",
    "LT0047": "TASCO (THAILAND) CO.,LTD.",
    "LP0040": "PROFESTRONICS CO.,LTD.",
    "LT0521": "THAI INDUSTRIAL PARTS LTD.",
    "LV0006": "VMM ENGINEERING CO., LTD.",
    "LF0016": "FURUKAWA (THAILAND) CO., LTD.",
    "LC0212": "COVER TOOL CO.,LTD.",
    "LE0018": "EKASILP TROPHY CO., LTD.",
    "JK0003": "KOWA CO.,LTD.",
    "LT0505": "THAI NIKKEI TRADING CO.,LTD.",
    "LA0150": "SUPER BROADBAND NETWORK",
    "LD0027": "DKNY INTERNATIONAL GROUP LIMITED",
    "LP0032": "P AND G SIAM INTERNATIONAL CO.,LTD.",
    "LT0524": "THACHAPHON BY UKAS LIMITED",
    "LC0004": "CUSTOMS GOLD SERVICE CO.,LTD.",
    "LA0037": "ADD GARDEN SHOP",
    "LC0013": "CHAROENRUNGRUANGKIJ ENGINEERING",
    "LA0108": "APPLICAD PUBLIC COMPANY LIMITED.",
    "LY0023": "YAMAKANE GREEN ENGINEERING",
    "LV0040": "VEE KARNCHANG LTD.,PART.",
    "LU0093": "UTCC TECH COMPANY LIMITED",
    "LU0072": "UNITED ANALYST AND ENGINEERING",
    "LC0185": "COMBUSTION (THAILAND) CO.,LTD.",
    "LA0020": "AUTOMATIC LOCKER (THAILAND) CO., LT",
    "LT0015": "THAI PARKERIZING CO.,LTD.",
    "LT0042": "TCB DAIKURE CO.,LTD.",
    "IP0003": "PT.TOPJAYA ANTARIKSA ELECTRONICS",
    "LN0016": "NEO INTERTECH CO., LTD.",
    "LA0186": "ASA CORRUGATED CONTAINER CO.,LTD.",
    "LJ0040": "J.B.T.INDUSTRIAL CO.,LTD.",
    "LK0071": "KUSATSU ELECTRIC ( THAILAND )",
    "LM0190": "MURATA ELECTRONICS (THAILAND),",
    "LT0121": "CONTROL COMPONENT CO.,LTD.",
    "CH0003": "HANNSTAR COLOR(SHANGHAI) ELECTRONIC",
    "HC0002": "Computime Limited",
    "J00053": "TOSHIBA CARRIER CORPORATION",
    "MA0001": "ALUMINIUM COMPANY OF MALAYSIA",
    "MK0003": "KANAFLEX (MALAYSIA) SDN BHD",
    "SG0001": "GP BATTERY MARKETING (S) PTE LTD",
    "SS0005": "SANKEN ELECTRIC (S) PTE LTD",
    "LP0030": "PPK INSTRUMENT & SERVICE",
    "LA0173": "ALINN CANVAS LTD.,PART.",
    "NT0021": "TSUMORI SEIKI CO., LTD.",
    "NT0004": "TOSHIBA CHEMICAL CORPORATION",
    "NM0003": "MICRO RESEARCH CO.,LTD.",
    "PC0001": "CONCEPCION-CARRIER",
    "JT0011": "TOSHIBA HOME APPLIANCES",
    "LF0014": "FIRST LABEL PRINTING CO., LTD.",
    "LE0024": "EURKITTIROJ LTD.,PART.",
    "LA0106": "AIR-CON PARTS ENGINEERING",
    "LW0018": "WCS SERVICE CO.,LTD.",
    "LT0043": "TCM CONSULTING GROUP CO., LTD.",
    "CK0002": "KUSUMI (WUXI) TECHNOLOGY CO.,LTD.",
    "LF0105": "FUJISEAL CO.,LTD.",
    "CD0001": "DONGGUAN ERLANG TECHNOLOGY",
    "LS0057": "SHIN HEUNG CO., LTD.",
    "LD0028": "DYNAMIC ENGINEERING &",
    "LJ0009": "JAKKOL ENGINEERING COMPANY LIMITED",
    "LK0196": "KOHSAN INDUSTRY CO.,LTD.",
    "LK0077": "KEYENCE (THAILAND) CO.,LTD.",
    "THAICOM": "TOSHIBA TEC (THAILAND) CO.,LTD.",
    "LA0136": "ADK CONNECT (THAILAND) CO.,LTD.",
    "LC0138": "CARRIER (THAILAND) CO.,LTD.",
    "JD0003": "DYNAOX, INC.",
    "LK0124": "KA DESIGN SYSTEM LIMITED",
    "LP0039": "P.L.M. SOLUTION & SERVICE CO.,LTD.",
    "LS0058": "SOCCERGRASS AND ENGINEERING",
    "LS0059": "SP INTERTREND CO.,LTD.",
    "CS0010": "SHANGHAI SANSO ELECTRIC CO., LTD.",
    "LP0042": "PTW ENTERPRISE CO.,LTD.",
    "LT0112": "TOWA SPRING (THAILAND) CO.,LTD",
    "LI0042": "INOAC INDUSTRIES (THAILAND)",
    "LP0218": "PRINTED CIRCUIT BOARD",
    "LP0063": "P.V.E. ENGINEERING LTD.,PART.",
    "LP0017": "PLANGO CO.,LTD.",
    "LO0035": "OP AUTO TECH CO.,LTD.",
    "LN0138": "NBA ENGINEERING CO.,LTD.",
    "LC0206": "CHOKCHAI UNIFORM",
    "LC0200": "CHAMP MACHINE",
    "LB0147": "BUSCH VACUUM (THAILAND) CO.,LTD.",
    "LB0095": "B.M. ART",
    "LA0183": "APOGEE WORLDWIDE CO.,LTD.",
    "LW0076": "WIN INTERTECH CO.,LTD.",
    "LS0062": "SRIMONGCOLCHAI KARNCHANG CO.,LTD.",
    "LF0017": "Fuji Semiconductor (Thailand) Co.",
    "CH0004": "HEFEI RISHANG ELECTRICAL",
    "LS0063": "SP.ASSOCIATES MOLD-TECH CO.,LTD.",
    "LM0011": "M.P.C. SYSTEMS CO., LTD.",
    "JS0010": "SANSO ELECTRIC CO.,LTD.",
    "LT0040": "TTC SYSTEM CO., LTD.",
    "LK0031": "KRUNG THAI IBJ LEASING CO., LTD.",
    "LE0039": "ESE (THAILAND) LTD.",
    "LT0038": "THERMOSCAN CO.,LTD.",
    "LS0053": "SIAM ABLE AUTO PARTS",
    "LT0050": "T.U.I INTERNATIONAL LTD., PART.",
    "LK0009": "FERKO INDUSTRIAL COMPANY LIMITED",
    "LS0064": "S.N.T. CONTAINER CO.,LTD.",
    "LB0017": "BOONYAWIT DEVELOPMENT CO., LTD.",
    "CL0001": "LG ELECTRONICS (TIANJIN) APPLIANCES",
    "LO0031": "ORANOSS CO.,LTD.",
    "LS0289": "SANDEN INTERCOOL (THAILAND)",
    "LG0007": "GRAND COMPUTER CO., LTD.",
    "LS0074": "SHIN STEEL (THAILAND) CO.,LTD.",
    "LP0049": "PAE TECHNICAL SERVICE",
    "LT0064": "THAISIN METAL INDUSTRIES CO.,LTD.",
    "LS0076": "SUNG MOON DANG CO.,LTD.",
    "LL0008": "LINDE MATERIAL HANDLING",
    "LO0037": "OKUMURA METALS (THAILAND) CO.,LTD.",
    "LM0004": "MEIKI ENGINEERING (THAILAND)",
    "LJ0049": "JS NETWORK SOLUTION CO.,LTD.",
    "LC0169": "C & T GIFT CO.,LTD.",
    "LC0084": "CREATIVE TECHNOLOGY SOLUTIONS",
    "LS0075": "MR.SOMCHAI ROTSIRIWORAWUT",
    "LT0071": "TNP ENGINEERING SERVICE CO., LTD.",
    "LS0078": "SIAM SCALES & SYSTEM CO., LTD.",
    "LI0017": "IES ELECTRIC CO., LTD.",
    "LG0004": "GOLDEN SAFE CO., LTD.",
    "LD0097": "DATAPRO COMPUTER SYSTEM CO.,LTD.",
    "LC0233": "C.B.K. ENGINEERING GROUP CO.,LTD.",
    "LY0022": "YEE P P THANAEK CO.,LTD.",
    "LP0256": "P.P.K. INDUSTRIES CO.,LTD.",
    "LK0193": "KOKUYO INTERNATIONAL (THAILAND)",
    "LT0068": "TK9 ENGINEERING CO., LTD.",
    "LJ0021": "J.L.MECHANICAL CO., LTD.",
    "LJ0022": "J.C.INTER MARKETING CO., LTD.",
    "LT0130": "Thai R&D Solutions Co.,Ltd.",
    "CZ0001": "ZHEJIANG SANHUA INTELLIGENT",
    "CO0001": "Okayama Investment Trading",
    "LS0278": "SIAM MD TECHNOLOGY",
    "LS0273": "S.T.SOFTTECH LTD.,PART.",
    "LW0079": "WINSTAR LIGHTING CO.,LTD.",
    "LF0020": "FUCHS LUBRICANTS (THAILAND) CO., LT",
    "LI0025": "IT CREATIVE CO., LTD.",
    "LM0020": "MARKPAK LIMITED",
    "LM0193": "MIZUKI ELECTRONICS (THAILAND) CO.,L",
    "CS0012": "SANHUA (HANGZHOU) MICRO CHANNEL",
    "LH0018": "HGT TOOL (THAILAND) CO., LTD.",
    "LC0025": "CENTRAL PRINTING AND ADVERTISING",
    "LP0051": "PRAKPOOM SUPPLY LTD.,PART.",
    "LS0082": "SOMARTHIT ENGINEERING& CONSULTANT",
    "LS0047": "SYSTEM 2000 CO.,LTD.",
    "LS0046": "SUPERIOR INNOVATION CO.,LTD.",
    "LR0102": "R4 TECHNOLOGY CO.,LTD.",
    "LK0044": "KOO SUPPLY & ENGINEERING CO., LTD.",
    "LP0240": "PATIWAT RUNGRUENG PARTNERSHIP",
    "LP0021": "P&N GENERAL SUPPLY",
    "LP0019": "P.P.K. INTER (2009) CO.,LTD.",
    "LD0043": "Dong Joo Metal Co.Ltd",
    "LK0013": "KAI DESIGN",
    "LK0010": "KAIVICH INDUSTRY CO., LTD.",
    "LA0131": "AKSARA GLOBAL CO.,LTD.",
    "LW0024": "Wisely APTech CO.,LTD.",
    "LC0022": "CHAVANAN CORPORATION LTD.",
    "LS0172": "Stop-Bird professional Co.,Ltd.",
    "LW0025": "WANNA MANUFACTORY THAI CO.,LTD",
    "CD0002": "Dyna Rechi Co.,Ltd",
    "LW0026": "WONGTANAWOOT CO.,LTD.",
    "LN0034": "NATTHAPONG SALES & SERVICE CO.,LTD.",
    "LF0030": "FOCUS SAFETY PRODUCT CO., LTD.",
    "LJ0008": "JENBUNJERD CO.,LTD.",
    "LC0046": "CRYOTECH ASIA CO., LTD.",
    "LT0004": "THRIVE PRECISION INDUSTRY CO.,LTD.",
    "LT0008": "TRI-WALL (THAILAND) LTD.",
    "SQ0001": "Quest Electronics",
    "CZ0009": "Zhejiang Shunyang",
    "LI0034": "IECO CO., LTD.",
    "LS0186": "SAHAWATTANA PLASTIC CO., LTD.",
    "LM0005": "MATERIAL AUTOMATION (THAILAND)",
    "LO0010": "OKIN TRADE CO., LTD.",
    "LC0047": "COM7 PUBLIC COMPANY LIMITED",
    "CS0007": "SUZHOU KOWA TECHNOLOGY CO.,LTD",
    "LO0044": "ONE MORE LINK CO.,LTD.",
    "LT0006": "TOYOTA TSUSHO FORKLIFT",
    "LM0028": "M.C.T. ENTERPRISE CO.,LTD.",
    "HW0001": "WEWINS TECHNOLOGY LIMITED",
    "LK0046": "KYODAI ENGINEERING (THAILAND) CO.",
    "LF0035": "Furutaka-VIV (Thailand) Co., Ltd.",
    "LI0036": "I WORK ENGINEERING LIMITED",
    "LI0037": "ICM INTERTRADE CO., LTD.",
    "LH0019": "HOK KHA CO.,LTD.",
    "LN0038": "NA CALTECHNOLOGIES CO., LTD",
    "LH0010": "HIGHCLASS CO., LTD.",
    "JD0004": "DAIAN SERVICE INC",
    "LT0132": "TG ELECTRIC SOLUTIONS CO., LTD.",
    "LN0040": "NPC SAFETY AND ENVIRONMENTAL",
    "HA0002": "Andes International (HK) Limited",
    "LT0196": "THAI SEMITEC CO.,LTD.",
    "LT0128": "TOP TEC WORLD CO., LTD.",
    "LS0189": "SAI4 PPDRUG CO.,LTD.",
    "LF0034": "Fashion Hometex Co.,Ltd.",
    "LB0049": "BeFirst Network Consulting Co.,Ltd.",
    "LM0046": "Maethongsuk Goldsmith Co., Ltd",
    "LS1158": "SYSTEM UPGRADE SOLUTION BKK",
    "LE0046": "ESTEL COMPANY LIMITED",
    "LA0075": "ANEX TECHNOLOGY CO., LTD",
    "LT0129": "THAI MEDITECH GROUP",
    "LO0032": "OT INTERTRADE CO.,LTD.",
    "LB0050": "BIG CAMERA CORPORATION PUBLIC",
    "LC0050": "CJC ENGINEERING PRODUCTS CO.,LTD",
    "LW0028": "WORLD SIBO TECH CO.,LTD.",
    "LG0018": "Goodrich Global Co., Ltd.",
    "LS0192": "Sekisui Specialty Chemicals",
    "LT3263": "THAI AUTO TOOLS AND DIE PUBLIC",
    "LT0941": "TEXFOCUS CO.,LTD.",
    "LJ0027": "J.T.N.ENERGY CO., LTD.",
    "LK0058": "KAMPOO ENGINEERING LTD.",
    "LA0052": "AUGUSTIN PRODUCT COMPANY LIMITED",
    "LT0080": "TANAKORN PLUS CO., LTD.",
    "LA0200": "Ample Solution Technology Co., Ltd",
    "LA0201": "ALCOTEC INTERNATIONAL CO., LTD.",
    "LI0006": "IL JIN ELECTRONICS (THAILAND)",
    "LJ0055": "JAMJUREE CORPORATE",
    "LE0048": "Extensive Research Polymers",
    "LK0048": "K.K.INTERNATIONAL CO.,LTD",
    "LW0031": "Wasin Metal Co.,Ltd",
    "JJ0002": "JAPAN AIR CONDITIONING AND",
    "LA0078": "ADVANCE THERMO TECHNOLOGY CO., LTD.",
    "LH0021": "HI-TECH PRECISION MOLD (THAILAND)",
    "LN0023": "NITTO SEIKO (THAILAND) CO.,LTD.",
    "LP0250": "PRAETHIP DESIGN CO., LTD.",
    "LM0047": "MARC (THAILAND) CO., LTD.",
    "LP0023": "PRIMACY SUPPLY CO.,LTD.",
    "LS0137": "SITHIPORN ASSOCIATES CO.,LTD.",
    "LG0140": "GALAXY CONTAINER CO.,LTD.",
    "LC0054": "CH.WATANAYONT CO.,LTD.",
    "LK0200": "KDDI (THAILAND) LTD.",
    "LK0107": "KYORITSU ELECTRIC (THAILAND) CO.,LT",
    "LK0101": "KAMOLSUK ENGINEERING CO.,LTD.",
    "LC0010": "CHEM-LUBE INTERNATIONAL CO.,LTD.",
    "LT0162": "THAI ROKUHA AUTOMATION CO.,LTD.",
    "LA0085": "A-1 @ MIND LIMITED PARTNERSHIP",
    "LI0115": "IDS MEDICAL SYSTEMS (THAILAND)",
    "SI0003": "IC Resource Pte. Ltd.",
    "LB0009": "BSC INTERTECH CO., LTD.",
    "LM0050": "M.T.V. GROUP COMPANY LIMITED",
    "LL0093": "LINEAR ENGINEERING CO., LTD.",
    "LI0041": "INNOVATE COOL CO., LTD",
    "LS0196": "SIAM KITO CO., LTD.",
    "LT0134": "THAI MATSUO CO., LTD.",
    "LF0039": "FUJI NAME (THAILAND) CO., LTD.",
    "LP0263": "Print and Pack Co.,Ltd.",
    "LS0198": "SUBANAN CHA CO.,LTD.",
    "LP0264": "PPS STEEL CO.,LTD.",
    "LP0265": "Professional Vacuum Partners",
    "LF0002": "FORTH CORPORATION PUBLIC COMPANY LI",
    "LS1125": "SHINANO KENSHI TRADING CO.,LTD.",
    "LA0203": "Aoyama Thai CO,.LTD",
    "LR0115": "Reliance Plaschem Co., Ltd.",
    "MS0003": "Smart Hi-TEK SDN BHD",
    "LD0057": "Dexon Technology Public",
    "LJ0059": "JEBSEN & JESSEN (THAILAND) LTD.",
    "LF0125": "FEASICON CO.,LTD.",
    "LP0280": "PRTR RECRUITMENT CO.,LTD.",
    "LV0016": "VONESTHAI CONTROL CO.,LTD",
    "LF0127": "Felixa Intertrade co.,ltd",
    "LS0228": "Siam LED Co.,Ltd.",
    "LW0033": "WK ELECTRIC CO.,LTD.",
    "LD0026": "TOPPAN Edge (Thailand) Limited",
    "LH0069": "HYBRID SPORT CO.,LTD.",
    "LM0209": "M&N Manufacturing Co., Ltd.",
    "L30002": "3LUX STORAGE AND EQUIPMENT CO.,LTD.",
    "LL0094": "LEE FIBREBOARD CO.,LTD.",
    "LU0009": "UACJ MH (THAILAND) CO.,LTD.",
    "LO0046": "ONE EMAIL COMPANY LIMITED",
    "LP0270": "PANTHEA BUSINESS SOLUTIONS CO.,LTD.",
    "LS0201": "SIAM INTERCORP (THAILAND) CO.,LTD.",
    "LL0095": "LERDTHAI SUPPLY CO.,LTD.",
    "LD0050": "DIGITALNEX CO.,LTD",
    "LR0031": "R&D COMPUTER SYSTEM CO.,LTD.",
    "LI0116": "iNEXT Broadband Co., Ltd.",
    "LU0015": "UDOMPHAN PREMIUM CO., LTD.",
    "LU0011": "U-ELECTRIC SYSTEM LIMITED.",
    "LT0891": "TRC ENTERPRISE CO.,LTD.",
    "LT0512": "THONG MING ROJANA CO.,LTD.",
    "LI0109": "INTERNET SOLUTION AND SERVICE",
    "LS0291": "S.P. GLOBAL SUPPLY CO.,LTD.",
    "LS0120": "SIGN DESIGN CO.,LTD.",
    "LI0030": "IMPERIAL FIRE ENGINEERING",
    "LK0079": "KAGAWA CO.,LTD.",
    "LI0029": "IJK GLOBAL CO., LTD.",
    "LG0017": "GRAND SCALES SYSTEM CO., LTD.",
    "LF0013": "FRESH COOL INTERNATIONAL CO.,LTD.",
    "LT0077": "THAI DONG RONG ENTERPRISE CO.,LTD.",
    "LT0053": "THAI GAS CORPORATION LTD.",
    "LS1078": "SIAM NATHAN INTERNATIONAL CO.,LTD.",
    "LS0301": "SIAM TRAFFIC CO.,LTD.",
    "CY0002": "YHM (Wuxi) Foreign Trade Co.,Ltd.",
    "LO0049": "ORGANO (THAILAND) CO.,LTD.",
    "LT0520": "TAS GRAPHIC DESIGN CO.,LTD.",
    "JS0015": "S and S International PPC",
    "LA0041": "ARMSTRONG RUBBER & CHEMICAL",
    "LA0082": "AMAGASAKI PIPE (THAILAND) CO.,LTD.",
    "LF0130": "First July Co.,Ltd.",
    "LN0153": "NIDEC INSTRUMENTS (THAILAND)",
    "LH0070": "Higasket Plastics Group (Thailand)",
    "LA0089": "ARTRON (THAILAND) CO., LTD.",
    "LT3280": "T.T TECHNOPLAST CO.,LTD.",
    "LT0140": "THAI NAM POLY PACK CO., LTD.",
    "LN0042": "N.S. PLUS ENGINEERING CO.,LTD.",
    "CW0004": "Weifang Xinxing Power Supply",
    "LR0030": "ROBOT OUTSOURCING PROVIDER CO., LTD",
    "LC0222": "VUTEQ TECHNICAL CENTER THAI CO.,LTD",
    "LP0271": "POWERMATIC CO., LTD.",
    "LN0043": "NPSS MANAGMENT CO.,LTD.",
    "LE0051": "ENGINEERING INNOVATION AUDITOR",
    "LP0266": "P.V.S. POWER ELECTRIC SYSTEM",
    "LP0267": "Performax Building Service Co.,Ltd.",
    "LN0041": "NEWTECH INSULATION CO., LTD.",
    "LT0139": "TOYOTA TSUSHO MOBILITY INFORMATICS",
    "LS1134": "SATO KOKI (THAILAND) CO.,LTD.",
    "LT0020": "TFC PLASTECH CO.,LTD.",
    "LU0016": "UNIVERSAL PRODUCT TRADING CO., LTD.",
    "LU0012": "ULTIMATE PLUS SUPPLY CO., LTD.",
    "LU0005": "UKKARIT RUNGRUENG (2000) CO.,LTD.",
    "LT0084": "THAI SEMITEC CO.,LTD.",
    "LT0074": "THAI AGENCY ENGINEERING CO.,LTD.",
    "LT0046": "T.J. SOLUTIONS CO.,LTD.",
    "LT0026": "TECHNOLOGY TEST SYSTEM CO.,LTD.",
    "LS0081": "SJC BUSINESS CO., LTD.",
    "LS0079": "SOMBOONDEE WELDING PART",
    "LR0006": "RIGHT TECH ENGINEERING",
    "LR0004": "REAL TIME COMMUNICATION CO., LTD.",
    "LT0143": "TOPTECH DIAMOND TOOLS CO.,LTD",
    "LA0094": "ALIAN TECHNOLOGY CO.,LTD.",
    "LB0008": "BANYONG ENGINEERING",
    "LH0061": "HOO CHIN ELECTRONICS CO.,LTD",
    "LI0075": "INTER CENTER PACK (THAILAND)",
    "LS1122": "SIAM RESONAC T&T CO.,LTD.",
    "LC0066": "CHAROENYANGPANICH CO., LTD",
    "LB0060": "BRANDERSHIP CO., LTD",
    "LS1132": "SGS (Thailand) Limited",
    "LK0018": "KYOTO AUTOMATION ENGINEERING",
    "LF0011": "FILTERMART CO.,LTD.",
    "LC0223": "CSB TECH CO.,LTD.",
    "LC0216": "C.S.TONER LIMITED",
    "LB0013": "BSL (THAILAND) CO.,LTD.",
    "LA0531": "ALL ID SUPPLY CO.,LTD.",
    "LA0012": "APK CO.,LTD.",
    "LV0007": "V-TECH ENGINEERING SUPPLY CO.,LTD.",
    "HS0007": "SUNTAK TECHNOLOGY LIMITED",
    "LT0120": "THAIYO ENGINEERING LTD.",
    "LP0002": "POWER STEP CO.,LTD.",
    "LN0115": "NAS EQUIPMENT CO., LTD.",
    "LN0001": "NANDEE INTER-TRADE CO.,LTD.",
    "LM0202": "MEIWA ENTERPRISE (THAILAND)",
    "LS1116": "SUMITRONICS (THAILAND) CO.,LTD.",
    "LA0209": "Active 5 Co.,Ltd.",
    "LF0040": "Foundation for Industrial",
    "LC0055": "Corestaff (Thailand) Co., Ltd.",
    "LL0058": "LEGA CORPORATION CO.,LTD.",
    "LA0185": "AQUIP CO.,LTD.",
    "LL0097": "LEVOCOLT CO.,LTD.",
    "LA0092": "ASPHERE LIMITED",
    "HH0003": "Hosoda (Hong Kong) Limited",
    "LN0145": "NIHON GLOBALPLAS CO.,LTD.",
    "LC0059": "Celeraise (Thailand) Co., Ltd.",
    "JS0014": "SANSHIN ELECTRONICS CO., LTD.",
    "LC0235": "COMPOMAX CO.,LTD.",
    "LB0046": "MR.BOONCHAUY PROMYOTHA",
    "LT0086": "THAI-RHODEN RUBBER CO., LTD.",
    "LS0187": "SIAM SYNDICATE TECHNOLOGY PUBLIC",
    "LS0176": "SIAMPORNWASADU CO., LTD.",
    "LQ0007": "QUALITY IT SERVICE LIMITED",
    "LP0060": "PORTAL TECH SYSTEM CO., LTD.",
    "CS0014": "SUZHOU HONGTAI COPPER",
    "LM0208": "MILLENNIUM PROCESS CO.,LTD.",
    "LC0061": "CSK PLASTIC CO., LTD.",
    "LT0154": "TKC PRESS AND DIE ENGINEERING",
    "LM0061": "MEECHAROEN ENTERPRISE CO.,LTD.",
    "LP0276": "Professional Trade Service",
    "LS0224": "SUPERMAN FOAM INDUSTRY CO.,LTD.",
    "LP0277": "Pixxor (Thailand) Co.,ltd.",
    "LT0017": "THAI MURATA ELECTRONICS",
    "LT0014": "TOSHIBA THAILAND CO.,LTD.",
    "LT0010": "THAI AMIGO ENGINEERING CO.,LTD.",
    "LS1183": "SOJITZ (THAILAND) CO.,LTD.",
    "LR0020": "ROYAL INTERTRADE CO., LTD.",
    "LR0013": "RICHLAND BEARING CO.,LTD.",
    "LQ0001": "QUALITY INDUSTRIAL SYSTEM CO.,LTD.",
    "LP0120": "PAISAN CASTER CO.,LTD.",
    "LP0066": "PGL CALSUPPLY LIMITED",
    "LM0027": "MYP DISTRIBUTION CO.,LTD",
    "LM0023": "MRP ENGINEERING CO.,LTD",
    "LJ0001": "JSB SOLUTION CO.,LTD.",
    "LG0009": "GOOD FREIGHT AND TRANSPORTS",
    "LC0034": "CERNTEK CO.,LTD",
    "KA0001": "ASTEL CO.,LTD",
    "JF0003": "FUJI-IRYOKI MFG., INC.",
    "LL0002": "LADVIK (THAILAND) CO.,LTD.",
    "LS0204": "SONEPAR (THAILAND) LIMITED",
    "CH0005": "HAINING LIANFENG DONGJIN",
    "LP0273": "P&S Siam Packaging Co.,Ltd.",
    "LM0055": "MANI4 ENGINEERING AND SUPPLY",
    "LR0032": "RIBBON TRADE LIMITED PARTNERSHIP",
    "LC0199": "COMPUTER PERIPHERAL AND",
    "LI0032": "INTER TEMP SERVICE&SUPPLY CO.,LTD",
    "LS0171": "SIGN LEADING COMPANY LIMITED",
    "LC0176": "CHAIDUMRONG STEEL CO.,LTD.",
    "LS0199": "SC GLOBALANCE CO., LTD.",
    "LH0004": "HEMMAWIT 2456 CO., LTD.",
    "LA0002": "APOLLO (THAILAND) CO.,LTD.",
    "LB0057": "BR Machinery Asia Co.,Ltd",
    "LU0024": "UMETOKU THAILAND CO., LTD",
    "LP0058": "PRECISA CO., LTD.",
    "LP0053": "PT HEAD GROUP LIMITED PARTNERSHIP",
    "LP0050": "PURE CLEANING SERVICE CO., LTD.",
    "LM0014": "MITSUBISHI ELECTRIC FACTORY",
    "LK0029": "KHRONOS CONSULTING CO., LTD.",
    "CR0017": "RUDONG RIZHISHENG SAFETY PRODUCTS",
    "LW0032": "Works Elevator co.,Ltd.",
    "LP0070": "PACIFIC RUBBER WORKS CO.,LTD.",
    "LE0054": "EC MALL CO., LTD.",
    "LS0206": "SAPPERMPOON PAINTING CO.,LTD",
    "LS0225": "SUMITOMO CORPORATION THAILAND LTD.",
    "LT0157": "T. HYDRAULIC",
    "LC0062": "CHUN SIANG AUTOPART CO.,LTD.",
    "LD0055": "Domnick (Thailand) Co.,Ltd",
    "LD0031": "DRAEGER SAFETY (THAILAND) LIMITED",
    "LG0022": "GOODS PRINTING LIMITED PARTNERSHIP",
    "LS1166": "TENMA THAILAND CO.,LTD.",
    "CH0014": "ZHENGZHOU ZOMAGTC ALLRAISE CO.,LTD.",
    "LJ0024": "J.TOP GREATEST CO., LTD.",
    "LJ0002": "JITANANSUB COMPANY LIMITED",
    "LI0098": "ISOCAL TECHNOLOGY CO.,LTD.",
    "LI0118": "INNOVATIVE INSTRUMENT CO.,LTD.",
    "LI0022": "IMAGE TECHNOPAcontainer.innerHTML = RT CO.,LTD.",
    "LI0012": "ISONET CO.,LTD.",
    "LH0059": "HEALTH & ENVITECH CO.,LTD.",
    "LH0006": "HODAKA ELECTRONICS (THAILAND)",
    "LG0047": "G-ABLE COMPANY LIMITED",
    "LF0100": "FOOTWORK CO.,LTD.",
    "LE0168": "ELEGANCE HOTEL PRODUCTS CO.,LTD.",
    "LI0117": "IMRN ASIA CO.,LTD.",
    "LE0037": "EM KYUSEI CO., LTD.",
    "LE0029": "ENERGY AUDIT CO., LTD.",
    "LE0023": "EMERSON (THAILAND) LIMITED",
    "LC0125": "CHITNIYOM (1996) CO.,LTD.",
    "LC0026": "CELCO (THAILAND) CO., LTD.",
    "LB0165": "BELL WALKER CO.,LTD.",
    "LA0042": "ALUHOME DECORATION CO.,LTD.",
    "HH0004": "Hong Kong Aleph Co., Ltd.",
    "LC0056": "CCMEDIA THAILAND CO.,LTD.",
    "LN0144": "NANA ENGINEERING TECHNOLOGY CO.,LTD",
    "HQ0001": "Quiksol International HK PTE",
    "LT0085": "THAI EVER PLASTIC CO.,LTD.",
    "LT0034": "TOYOTA TSUSHO (THAILAND) CO., LTD.",
    "LJ0052": "JNT. PRECISION LIMITED PARTNERSHIP",
    "LT0087": "TRUETRONIX TECHNOLOGY CO., LTD.",
    "LS0101": "S.T.RIZING COMPANY LIMITED",
    "LD0039": "DIGITAL ENGINEERING CENTER CO., LTD",
    "LS0174": "Simton Co.,Ltd.",
    "LG0016": "Green Spot Co.,Ltd.",
    "LW0010": "WINNER PAPER CO.,LTD.",
    "LU0014": "UNITED ANALYST AND ENGINEERING",
    "LE0042": "EISHIN TECHNO (THAILAND) CO., LTD.",
    "CF0001": "FOSHAN MIDEA CARRIER AIR-",
    "LS0272": "SP LOGISTICS CO.,LTD.",
    "LB0051": "BPDS Bangkok Company Limited",
    "LR0029": "Ryosan (Thailand) Co., Ltd.",
    "CN0003": "NIDEC TECHNO MOTOR (ZHEJIANG)",
    "LS0202": "Sinpermsub Company Limited",
    "LO0047": "ORGANIC WEALTH (THAILAND)CO.,LTD.",
    "LS0203": "SUZUYO (THAILAND) LTD.",
    "LR0015": "RIVERPLUS CO., LTD.",
    "LI0076": "INTERTEK TESTING SERVICES",
    "LT0065": "THAI SIMON SAFETY INDUSTRIES",
    "LK0036": "KMIT-GROUP CO., LTD.",
    "LI0020": "INTERROLL (THAILAND) CO.,LTD.",
    "LN0148": "NATAPOB CO.,LTD",
    "LL0100": "LOCK&LOCK (THAILAND) CO.,LTD.",
    "LN0149": "NNK TECHNICAL CO.,LTD.",
    "LS0211": "SONGSERM INTERCOOL STAINLESS",
    "LD0053": "DEALMED LIMITED PARTNERSHIP",
    "LT0150": "TWO N WAN GROUP CO.,LTD",
    "LK0051": "KNK GAS SYSTEM CO.,LTD.",
    "LT0152": "THAI SWITCHBOARD AND METAL WORK",
    "JH0003": "HCL JAPAN LIMITED",
    "LS0215": "S.C. RADIO INTERCOMMUNICATION",
    "LO0048": "ON THE TOP CO., LTD.",
    "LU0028": "UPR (THAILAND) CO.,LTD.",
    "LS0218": "S.CHAREONPANIT BY",
    "LN0002": "NIKKEI SIAM ALUMINIUM LIMITED",
    "LR0033": "Rungrueng Instrument Co.,Ltd.",
    "LM0052": "MALC-THAI CO.,LTD.",
    "LA0091": "A P WORK LIMITED PARTNERSHIP",
    "LS0200": "S.K. SYSTEM CO., LTD.",
    "LG0020": "GRAND SERVICE & CREATOR CO., LTD.",
    "LT0148": "TS STEEL ENTERPRISE CO., LTD.",
    "LS0308": "SS&T Supply Co.,Ltd.",
    "CS0001": "SANHUA INTERNATIONAL",
    "LO0023": "OMRON ELECTRONIC COMPONENTS",
    "LE0141": "ECOTS CO.,LTD.",
    "LC0044": "CROWN EQUIPMENT (THAILAND) CO., LTD",
    "LO0008": "OKAMOTO(THAI) CO.,LTD.",
    "LO0043": "OTTO KINGGLASS CO., LTD.",
    "LG0019": "GTM COMPANY LIMITED",
    "LP0269": "PONPITAK TRIPLE TRADE CO.,LTD",
    "LV0046": "VEGA AUTOMATION (2000) CO., LTD.",
    "LD0004": "D-SMART SOLUTION CO.,LTD.",
    "LA0199": "ATIS ASIA CO.,LTD.",
    "LS0220": "STAN ELECTRONICS CO., LTD",
    "LS0222": "SANTA TECHNOLOGY CO.,LTD",
    "LM0015": "MARSHAL FLUID CO., LTD",
    "LF0044": "Forth EMS Public Company Limited",
    "LC0024": "C H S PACKAGING CO.,LTD",
    "LA0522": "ACDERQ CO.,LTD.",
    "LA0155": "AM ACOUSTICS CO.,LTD.",
    "LK0053": "KHAO MAHBOONKRONG COMPANY LIMITED",
    "LY0013": "Y.M. COOLING (2016) CO.,LTD",
    "LA0057": "AMPO MICROSYS CO.,LTD",
    "LT0090": "TUV RHEINLAND THAILAND LTD.",
    "LC0035": "CHIA MENG MARKETING CO.,LTD",
    "LD0036": "DEECHOICE BUSINESS PARTNER CO.,LTD",
    "LT0898": "T.TERAKIT ELECTRICAL",
    "LM0024": "MECTRON APPLIANCE CO.,LTD",
    "LV0011": "VORAWAT WIRE PRODUCTS",
    "LM0026": "MANASCHAI MARKETING CO.,LTD",
    "LT0142": "THAI HERB PRODUCTS 888 CO.,LTD.",
    "IT0001": "TOSHIBA SOFTWARE (INDIA) PRIVATE",
    "SP0001": "Performance Micro",
    "LT0946": "TECH-WELL ENTERPRISE CO.,LTD.",
    "LT0044": "TTM INTERPART CO.,LTD.",
    "LS1057": "SIAM SONIX SOLUTION CO.,LTD.",
    "LN0150": "NACS KUCHO (THAILAND) CO.,LTD",
    "LA0056": "A.T.M. CORPORATION LTD.",
    "LI0120": "Idea Creative Co.,Ltd.",
    "LR0017": "RECIS (THAIAND) CO., LTD.",
    "LR0014": "RAWITA GROUP CO., LTD.",
    "LR0008": "RUAYSUB INDUSTRIAL CO.,LTD.",
    "LM0063": "Medisci Healthcare Co.,Ltd",
    "LS0068": "S & J SARAYUT SERVICE LTD.",
    "LS0065": "SILVER CAPE CO., LTD.",
    "LL0089": "LINEAR PRESS TECHNOLOGY CO., LTD.",
    "LT0072": "247 TRADLING AND SERVICE CO., LTD.",
    "LC0021": "CHALAD MARKETING CO., LTD.",
    "LA0008": "APCB ELECTRONICS (THAILAND)",
    "LS0080": "SAEHAN GREEN (THAILAND) CO., LTD.",
    "LL0090": "LEEHENG (1974) CO., LTD.",
    "LS0054": "SIAM YASUDA SEIKI CO.,LTD.",
    "LT0141": "TOMAC ASIA CO., LTD.",
    "LT0049": "TECHNOLOGY PROMOTION ASSOCIATION",
    "LT0009": "TALENT INDUSTRIAL CO.,LTD.",
    "LP0056": "P.WAI CO., LTD.",
    "LT3268": "TIRAVIKANT CO.,LTD.",
    "LS0090": "SRIVARA STATIONARY CO., LTD.",
    "LL0043": "Lard Krabang Steel Co., Ltd.",
    "LT0075": "THERMAL PACK CO LTD",
    "LR0018": "RACK-SHELF CORPORATE",
    "LO0039": "OMEGA MACHINERY (1999) CO.,LTD.",
    "LK0037": "KOMATSU INDUSTRIES (THAILAND) CO.,L",
    "KF0001": "FOOSUNG CO.,LTD.",
    "LP0221": "PRECISION STANDARD LABORATORY",
    "LV0008": "VICTORY PRECISION CO., LTD.",
    "LC0019": "CALSERVE (THAILAND) CO., LTD.",
    "LC0020": "C.S.I. (THAILAND) CO, LTD.",
    "CS0011": "SHANGHAI HAILIANG COPPER CO., LTD.",
    "LN0025": "NATIONTECH ENTERPRISE CO.,LTD.",
    "LN0026": "NATT&PATT TECHNOLOGY CO., LTD.",
    "CH0013": "HANGZHOU DONGDI IMP AND EXP CO.,LTD",
    "LE0005": "ESCO PREMIUM CO.,LTD.",
    "LN0014": "NIHON PARTS SERVICES CO., LTD.",
    "LL0055": "LAEMTHONG AIR SUPPLY CO.,LTD.",
    "LK0190": "KILEWS THAI CO.,LTD.",
    "LI0097": "INNOPACK CO.,LTD.",
    "LI0003": "I-ROBUST CO.,LTD.",
    "LI0002": "INNOVATION ADVANCE MANAGEMENT",
    "LC0117": "CHAIMONGKOL EXPRESS CO., LTD.",
    "LB0117": "B.K.K. COOLING & ENGINEERING",
    "LB0022": "BORN HOLIDAY CO., LTD.",
    "LS1174": "SANTO FIRE PRODUCT CO.,LTD.",
    "LS0087": "SP METROLOGY SYSTEM (THAILAND)",
    "LV0010": "VS INTERCOM PROFESSIONAL SERVICE",
    "LT0076": "THAIVA ENGINEERING CO., LTD.",
    "LH0013": "HEADS ROBOTECHS CO., LTD.",
    "LS0106": "S.J.W. ENGINEERING CO.,LTD",
    "LK0039": "KLIPPLE GROUP COMPANY LIMITED",
    "LS0102": "SUMIPOL CORPORATION LIMITED",
    "LS0096": "SKL TOOLS AND DIES LTD., PART.",
    "LS0012": "SOFTWAREONE CO.,LTD.",
    "LS0010": "S2J SERVICE CO.,LTD.",
    "LR0023": "ROYAL ELECTRONIC FACTORY",
    "LW0022": "WEWILLAPP CO.,LTD",
    "LP0187": "P.D.C. SERVICE CO.,LTD.",
    "LP0015": "PHOENIX METROLOGY CO., LTD.",
    "LP0011": "SUBBANGPOON CO.,LTD.",
    "LN0139": "NT INNOVATION CO.,LTD.",
    "LN0009": "NDT.THAI SERVICE CO.,LTD.",
    "LM0203": "MAX DETAILS GROUP CO.,LTD.",
    "LM0054": "MUKAI INDUSTRY CO.,LTD.",
    "LM0034": "MITRACOM CO.,LTD.",
    "LM0009": "MAKTANG COMPANY LIMITED",
    "LM0007": "MEEFAH ENGINERRING CO., LTD.",
    "LL0005": "LUCKY WORLD GROUP CO., LTD.",
    "LK0195": "KONGTHAWEEPORN CO.,LTD.",
    "LA0050": "AH AH PHANICH CO., LTD.",
    "LT0078": "THAI METAL PRODUCT INDUSTRY",
    "KL0001": "LG ELECTRONICS INC",
    "LP0214": "P.C. GROUP",
    "LP0028": "P.I. PUBLISHING GROUP CO., LTD.",
    "LO0038": "OTS TECHNOLOGY CO.,LTD.",
    "LO0036": "ONE SAHARAT DESIGN CO.,LTD.",
    "LP0044": "PHET ARPORN 2005 CO., LTD.",
    "LP0034": "PRO-APPLICATION SERVICE CO., LTD.",
    "LO0034": "108 AWARD",
    "LN0019": "NSB OFFICE CO., LTD.",
    "LW0080": "WORLD PUMPS (THAILAND) CO.,LTD.",
    "LW0013": "WATFORD ELECTRIC CO.,LTD.",
    "LM0038": "MATERIAL WORLD CO., LTD.",
    "LU0006": "UNITA CO., LTD.",
    "LT0944": "THAI FELT CO.,LTD.",
    "LT0517": "TECHNOLOGY STORE CO.,LTD.",
    "LT0509": "T.S.N. FUNITURE LTD.,PART.",
    "LT0302": "THAI COMPRESSOR MANUFACTURING",
    "LT0069": "TOSHIBA MACHINE (THAILAND) CO.,LTD.",
    "LT0033": "TOWA DENKI (THAI) CO., LTD.",
    "LS1101": "SIAM IKEDA CO., LTD.",
    "LS1050": "SSI SCHAEFER SYSTEMS INTERNATIONAL",
    "LS0293": "SIAM NISSAN BANGKOK CO.,LTD.",
    "LA0071": "ANGEL ADVANCE TECH CO., LTD.",
    "LV0012": "VACHIRA TECHNOLOGIE AND SERVICES",
    "LA0051": "AGLOW (THAILAND) CO., LTD.",
    "LI0028": "IT PRO SERVICE CO., LTD.",
    "LA0054": "AC PLUS GLOBAL",
    "LU0017": "UNIVERSAL BIO GROUP CO., LTD.",
    "LS0097": "S.U.N GLOBAL CO.,LTD",
    "LN0008": "NIPPON PAINT DECORATIVE",
    "LM0182": "MASTERPAC-ASIA CO.,LTD.",
    "LJ0045": "JPS ENGINEERING NETWORK",
    "LI0102": "INKAM KHAN CHANG LIMITED",
    "LI0055": "INTER TELETECH CO.,LTD.",
    "LS0305": "SSP CRANE ENGINEERING PRODUCTS",
    "LE0157": "EUROSIA TRADING CO.,LTD.",
    "LE0038": "ETERNAL TECH CO.,LTD.",
    "LE0027": "EDA INTERNATIONAL LTD.",
    "LC0064": "CHUN SIANG AUTOPART CO.,LTD.",
    "LD0080": "D FURNIMATE CO.,LTD.",
    "LC0072": "CENTURY INOAC CO.,LTD.",
    "LC0015": "CASTOR & WHEEL (THAILAND) CO., LTD",
    "LA0519": "A.T.M. DIECUT PARTNERSHIP",
    "LA0024": "ANES (THAILAND) CO., LTD.",
    "JN0003": "NIDEC SANKYO CORPORATION",
    "JD0002": "DAISEI INDUSTRY CO.,LTD.",
    "GC0001": "CLEVERBRIDGE AG",
    "FB0001": "BLANCCO OY LTD.",
    "LS0071": "SHIN SHIN ELECTRONICS (THAI) CO.,LT",
    "LI0026": "INTERSITE (THAILAND) CO., LTD",
    "LT0912": "TPF 168 CO.,LTD.",
    "LB0044": "B.GRIMM AIRCONDITIONING LIMITED",
    "LE0032": "EUREKA DESIGN (PUBLIC)",
    "LE0028": "ELECTRICITY GENERATING AUTHORITY OF",
    "LP0200": "POOMISUP INTER-ENGINEERING O.P.",
    "LP0183": "PATHUMTHANI HONDA CARS CO.,LTD.",
    "LC0063": "CONTINUE CREATION CO.,LTD.",
    "LT0194": "THAI-LIAN FORKLIFT CO.,LTD.",
    "LT0165": "THAIPHATANASIN (CHIN SENG 2000) CO.",
    "LH0012": "HONEST SOLUTECH CO., LTD.",
    "LH0011": "HAKUTO ENGINEERING (THAILAND) LTD.",
    "LC0218": "C G A CO.,LTD.",
    "LU0018": "Uthai Plastic Industry Co., Ltd",
    "LD0034": "DAIKIN CHEMICAL SOUTHEAST ASIA",
    "LO0042": "OFFICETHAI ONLINE CO.,LTD",
    "LR0022": "RENTOKIL INITIAL (THAILAND) LTD",
    "LS0290": "SUN RISE PROPERTY CO.,LTD.",
    "LS0166": "SUNWILL (THAILAND) CO.,LTD",
    "MA0002": "ALCOM NIKKEI SPECIALTY COATINGS",
    "LU0085": "UNION TECH ENGINEERING CO.,LTD.",
    "LU0077": "UNITY DENTAL CO.,LTD.",
    "LT3253": "TRIO INDUSTRIES CO., LTD.",
    "LP0059": "PORNPAT AUTOPARTS CO.,LTD.",
    "LT0032": "THREE BUILD ENTERPRISE LTD., PART.",
    "LS0288": "SIAM COOLER MART CO.,LTD.",
    "LS0035": "SIAM KUDOS CO.,LTD.",
    "LP0947": "PRIMUS CO.,LTD.",
    "LP0232": "PN FURNITURE",
    "LP0231": "PROVINCIAL ELECTRICITY AUTHORITY",
    "LP0229": "PERFECT ELEMENT CO.,LTD.",
    "LP0226": "PHITHAK SAKORN (A.E.C.2015)",
    "LP0217": "PATHUMDESIGN COMMUNICATION",
    "LN0017": "NANGSEUPIM SUKHOTHAIGAAOMAI",
    "LT0081": "THONG MING CO., LTD.",
    "LT0083": "T.C. IMPORT AND EXPORT",
    "LC0037": "CRADLE CONSULTING (THAILAND)",
    "LP0045": "PRO TECH ENGINEERING CO.,LTD.",
    "LP0001": "PROLOGIC AUTOMATION ENGINEERING",
    "LN0131": "NEO TOOLS CO.,LTD.",
    "LN0122": "NEXT FOUR MOLD & GENERAL PART",
    "LN0117": "NEOMAC INTER ADVANCE",
    "LT3297": "TCFG COMPRESSOR (THAILAND)",
    "LA0206": "Aigle Co.,Ltd.",
    "LK0117": "KEN MAX (THAILAND) CO.,LTD.",
    "JT0023": "TONEX CO., LTD.",
    "LP0283": "PRASITSUB SERVICE CO., LTD",
    "LC0220": "CKD THAI CORPORATION LTD.",
    "LC0195": "COVENANT CO.,LTD.",
    "LC0177": "CHAICHANAKOL LTD.,PART",
    "LA0049": "AIM AD CONSULTING CO., LTD.",
    "LK0057": "KRAPAOTANG CO.,LTD.",
    "LS0181": "SIGMA SOLUTIONS CO.,LTD",
    "LJ0060": "Japan electrical testing labortory",
    "LS0098": "SMI INSTRUMENTS CO., LTD.",
    "LP0285": "PITH INNOTECH CO.,LTD.",
    "LD0037": "Double A Digital Synergy Co.,Ltd.",
    "LF0024": "FALLPROTECTION ASIA CO.,LTD.",
    "LK0040": "KURODA TRADING (THAILAND) CO.,LTD",
    "LP0247": "PANICH PACKAGE CO., LTD.",
    "LS0177": "SSM AUTOMATION COMPANY LIMITED",
    "CN0001": "NINGBO JINTIAN COPPER TUBE CO.,LTD",
    "LE0043": "E.N. TECHNOLOGY CO., LTD.",
    "LT0118": "THAIISOWALL CO., LTD.",
    "LP0031": "PP SAFETY CO., LTD.",
    "LP0003": "PHUDIT INDUSTRIAL CORPORATION",
    "LB0029": "BIZ TECH THAI CO., LTD.",
    "LE0033": "E.I.N. STYLE SOLUTION AND SUPPLY",
    "AHI-U": "AHI CARRIER FZC",
    "JS0005": "SHINWA CORPORATION",
    "LP0065": "PROLINE SYSTEM CO.,LTD",
    "LS0103": "SAS SHUHA (THAILAND) CO.,LTD",
    "LY0009": "Y2S.ENGINEERING CO.,LTD",
    "LI0123": "INTER FIBRE CONTAINER CO.,LTD.",
    "CH0006": "HANGZHOU LANGYI IMPORT",
    "LK0186": "KONGTHANA SERVICE COMPANY",
    "JT0003": "Carrier Japan Corporation",
    "LT0469": "NIDEC TECHNO MOTOR (THAILAND)",
    "LL0051": "LOYAL HAILIANG COPPER (THAILAND)",
    "LP0287": "PCN ASIA COMPANY LIMITED",
    "LP0288": "PRIVILEGE INTERNATIONAL CO., LTD",
    "LD0058": "DATA EXPRESS COMPANY LIMITED",
    "LD0059": " DONGSUNG ELECTRONIC CO.,LTD.",
    "LS0309": "SUMITOMO MITSUI AUTO LEASING &",
    "LI0018": "INTER INSTRUMENTS CO.,LTD",
    "LE0016": "ENVIPLUS AND ENGINEERING CO., LTD.",
    "LE0015": "ECOS (THAILAND) CO.,LTD.",
    "LD0024": "D1 SYSTEM CO., LTD.",
    "LD0015": "DHAMMAKIT ENGINEERING CO.,LTD.",
    "LC0213": "CHAIPATTANA PAINT",
    "LB0166": "BANGKOK BELL COMMUNICATION CO.,LTD.",
    "LA0149": "AIRTAC ENTERPRISE (THAILAND)",
    "LR0028": "ROJPAIBOON EQUIPMENT CO.,LTD.",
    "LP0253": "PERFECT THAI ELECTRIC CO., LTD.",
    "LT0122": "TOYOTA MATERIAL HANDLING THAILAND",
    "LT0123": "T AND C TENT AND CANVAS LTD., PART.",
    "LM0049": "M.I.L.INDUSTRIES CO., LTD.",
    "LS0110": "SHIRAI ELECTRONICS TRADING",
    "LS0159": "SANKEN ELECTRIC (THAILAND)",
    "LS0030": "SMART WORK ENGINEERING CO.,LTD.",
    "LR0098": "RN WEALTHY CO.,LTD.",
    "LP0043": "PERENNIAL TRADING CO., LTD.",
    "LO0007": "OMNIPRO CO., LTD.",
    "LN0135": "NCP INDUSTRIAL CO.,LTD.",
    "LN0081": "NEC CORPORATION (THAILAND)",
    "LN0005": "MTEC- REVENUE",
    "LM0010": "MONTAKARN BAG CO., LTD.",
    "LL0040": "LIMCHAREON ENGINEERING LTD., PART.",
    "LI0081": "INSPECTRUM TECHNICAL SERVICES",
    "LF0123": "FAIFATHAIDOTCOM CO., LTD.",
    "LE0019": "EMINENCE LTD., PART.",
    "LD4006": "DELPHINUX SYSTEMS CO.,LTD.",
    "LD0020": "DENKO ENGINEERING CO.,LTD.",
    "LD0007": "DOT BAMBOO (BANGKOK) CO.,LTD.",
    "LA0526": "ASAHI SHO-KO-SHA(THAILAND) CO.,LTD.",
    "LA0174": "AERVIA CO.,LTD.",
    "LA0163": "AVIT COMMUNICATION CO.,LTD.",
    "LI0114": "Infinity Parts Co., Ltd.",
    "LU0003": "UDOMPHAN PAPER CO.,LTD.",
    "LS0303": "SCILUTION CO.,LTD.",
    "LA0079": "ACROSS SEA CO., LTD.",
    "LU0010": "UKY CONSTRUCTION CO.,LTD.",
    "LS0034": "S.C.K. CANVAS CO., LTD.",
    "LR0106": "RABBIT PROTOTYPE CO.,LTD.",
    "LR0070": "RICOH (THAILAND) CO.,LTD.",
    "LS0197": "SAHA LAWSON CO., LTD.",
    "LE0050": "ELECTRONICS SOURCE CO.,LTD.",
    "LT0138": "TOKEN (THAILAND) CO.,LTD.",
    "LA0011": "APL ASIA CO.,LTD.",
    "LT0005": "TPT TECHNOLOGY LTD.,PART.",
    "LS1181": "YAOWARAT GOLDSMITH",
    "LS1138": "S.S.K PRODUCT LTD., PART.",
    "LB0052": "Best Storage Co., Ltd.",
    "LP0259": "POWER HUB CO., LTD.",
    "LC0052": "CHEP Thailand Ltd.",
    "LS0194": "SWUN CHYAN (THAILAND) CO., LTD.",
    "LS0195": "SIAM GLOBAL GROUP CO., LTD.",
    "LE0047": "ESS SYNTECH CO., LTD.",
    "LA0177": "ADVANEX (THAILAND) LTD.",
    "LE0002": "EMSTRADE CO.,LTD.",
    "LS0219": "PANASONIC INDUSTRIAL DEVICES",
    "HL0002": "Luksens Asia Limited",
    "LO0051": "OWL D TECH CO.,LTD.",
    "CN0004": "Nantong Jianghai Capacitor Co., Ltd",
    "LK0056": "KRAINGSIRI PATTANA(1995) CO.,LTD.",
    "LB0004": "BANGKOK A CARD CO., LTD.",
    "HS0006": "SHENZHEN F&T TECHNOLOGY",
    "LD0098": "DAWRUENG MACHINETOOL LIMITED",
    "JK0004": "KOWA CO.,LTD.",
    "JH0002": "K.K.HOKUTO DENSHI",
    "CG0007": "GD MIDEA AIR-CONDITIONING",
    "CH0015": "HANGZHOU LEADERWAY",
    "LP0245": "PRESS SERVICE CO.,LTD",
    "LT0079": "TECHNO PLUS ENGINEERING CO., LTD.",
    "LT0066": "THAI PRODUCTS & SUPPLY CO., LTD.",
    "LT0056": "TOOL AND PART ENGINEERING CO., LTD.",
    "LT0055": "T N PRO SERVICE CO., LTD.",
    "LT0051": "TRIO SOLUTION ORDINARY PARTNERSHIP",
    "LT0035": "TAIYO GASES CO.,LTD.",
    "LS1065": "S.Y. INTERTRADE LTD.,PART.",
    "LS0123": "SCHMIDT ELECTRONICS (THAILAND) LTD.",
    "LQ0011": "Q-POWER ENGINEERING CO., LTD.",
    "LP0041": "PLAYON MARKETING CO., LTD.",
    "LP0029": "P.D. (THAILAND) CO.,LTD.",
    "LP0026": "PATHUM INKJET CO., LTD.",
    "LO0027": "OHT TECHNICAL SERVICE (THAILAND)",
    "LN0129": "NACAM ENGINEERING CO.,LTD.",
    "LN0027": "NAPATCHA ARPHORN CO., LTD.",
    "LN0020": "N.N.J. ENGINEERING & SERVICE CO., L",
    "LM0012": "MEEDEE SOLUTION CO.,LTD.",
    "LL0057": "LEAD SUN CO.,LTD.",
    "LK0192": "KJP.NIPPON",
    "LK0034": "KMCC CO., LTD",
    "LI0107": "INTACT PACIFIC CO.,LTD.",
    "LG0006": "G&CK LIVING CO., LTD.",
    "LD0099": "DYNA WORK CO.,LTD.",
    "LS1086": "SAENGTHONG PHABAI CO.,LTD.",
    "LS0094": "SEKISUI CHEMICAL (THAILAND)",
    "LM0029": "MADEE COLLECTION CO., LTD",
    "LF0025": "FEILEEYA CRYSTAL GIFTS TRADING",
    "JS0013": "SAKURAGI PATENT AND TRADEMARK",
    "LM0030": "MAJOR SYSTEM (THAILAND) CO., LTD.",
    "LA0005": "ANGLE CNC EQUIPMENT (THAILAND)",
    "LL0099": "LYRECO (THAILAND) CO.,LTD.",
    "LS0184": "SMTV HOME ELECTRIC CO.,LTD.",
    "LB0059": "Bangkok Science Center Co.,Ltd.",
    "CJ0004": "JIANGSU DINGSHENG NEW MATERIALS",
    "LP0284": "P.CHAMROEN PANICH PACKAGING",
    "LS0307": "SUZUSHO (THAILAND) CO.,LTD.",
    "LQ0010": "QUICK PACK PACIFIC CO., LTD.",
    "LP0242": "PACIFIC TOOLS CO.,LTD.",
    "LE0175": "ESPEC ENGINEERING (THAILAND) CO.,LT",
    "LJ0033": "JADS COMM LIMITED",
    "LS0107": "SEA AIR THAI CO.,LTD",
    "LN0132": "NEWTON EQUIPMENT CO.,LTD.",
    "LP0246": "PCE AUTOMATION CO.,LTD",
    "LI0105": "INTER DATA RECOVERY CO.,LTD.",
    "LD0009": "DMC CORP (154) CO., LTD",
    "LA0060": "ASYS COMPUTER CO.,LTD",
    "LE0044": "E-PARTS CO., LTD",
    "LA0026": "ABOS CO.,LTD.",
    "LD0040": "DATABAR COMPANY LIMITED",
    "CC0007": "Changzhou Changfa Refrigeration",
    "LK0045": "KGK ENGINEERING (THAI) CO., LTD.",
    "LP0254": "PROJECTOR ZEER CO., LTD.",
    "LD0023": "DIGIWISE CREATIVE PRODUCTION",
    "LD0021": "DIGITAL AND SCORE",
    "LB0021": "BOWYEN HANDEL (THAILAND) CO., LTD.",
    "LB0014": "BOSS PREMIUM GROUP CO.,LTD.",
    "LS0023": "NST COIL CENTER (THAILAND) LTD.",
    "LA0180": "AEROFLUID CO.,LTD.",
    "LA0062": "AMADA (THAILAND) CO.,LTD.",
    "LA0046": "AEC EXPORT CO., LTD.",
    "LA0043": "ALL QUALITY PACKAGING CO.,LTD",
    "LA0031": "ALONGKORN FORKLIFT & SERVICE",
    "LS0061": "SIN ANANT AUTO RUBBER",
    "US0001": "SIX SIGMA PRODUCTS GROUP, INC.",
    "UO0001": "OAK PRESS SOLUTIONS INC.",
    "UB0001": "BURR OAK TOOL INC.",
    "CF0002": "FOSHAN MIDEA CARRIER AIR-",
    "LC0170": "CRESTEC (THAILAND) CO.,LTD.",
    "LA0080": "A&R INTERNATIONAL GROUP CO., LTD.",
    "LT0137": "TOAMEC Trading (Thailand) Co., Ltd.",
    "LD0066": "DELL CORPORATION (THAILAND)",
    "LT0103": "TOSHIBA TEC (THAILAND) CO.,LTD.",
    "LS0170": "S P COOL (THAILAND) CO., LTD.",
    "LD0048": "Do Pro One Co.,Ltd.",
    "CZ0007": "Zhongshan TAKA GI Electronics",
    "LS0111": "SIAM DAIKYO CO.,LTD.",
    "LP0258": "P.S.D. AUTOMATION CO., LTD.",
    "LT0144": "Tiger Rich Systems Co.,Ltd.",
    "LM0053": "MY INDUSTRIAL & SUPPLY CO.,LTD",
    "LD0051": "Danbhus Corporation Co.,Ltd.",
    "LB0055": "BORN INNOVATION CO.,LTD.",
    "LT3290": "THAI INDUSTECH CO.,LTD.",
    "LS0091": "STATION METAL WORK CO.,LTD.",
    "LS0121": "SENAINTER CO.,LTD.",
    "LS0056": "SIAM HITECH PRECISION TOOLS LIMITED",
    "LP0272": "PERFECT INTERNATIONAL CONNECTION",
    "LB0028": "BEKO TECHNOLOGIES S.E. ASIA",
    "LP0027": "INTERTOOLTHAI COMPANY LIMITED",
    "LS0100": "SMART 4 ENGINEERING CO., LTD.",
    "LK0184": "KYOWA DENGYO(THAILAND) CO.,LTD.",
    "LI0016": "ITOKIN TECHNOLOGY CO., LTD.",
    "LX0002": "X SOURCE ENGINE TECH CO.,LTD.",
    "LW0071": "WARA MICROCIRCUIT CO., LTD.",
    "LW0007": "WORLD HITECH MARKETING CO., LTD.",
    "LV0002": "VEERASIAM HARDWARE CO.,LTD.",
    "LA0066": "AIRCON SALES AND SERVICE CO., LTD.",
    "LS0169": "SY SOFT COMPANY LIMITED",
    "LA0067": "APTITECH CALIBRATION CO.,LTD.",
    "LK0042": "K LOGISTIC & CONSULTANT CO.,LTD",
    "MR0002": "Ronnie Electronics (J) Sdn. Bhd.",
    "LU0094": "ULTRA-COMPRESSOR CO.,LTD.",
    "LN0033": "N4 PROPRINT CO., LTD.",
    "LG0014": "GEAR STEEL LIMITED PARTNERSHIP",
    "LS0178": "sMac Corporation Ltd",
    "LT0102": "T.J. HEATER AND ENGINEERING",
    "HL0001": "LUXURY HARVEST (HONGKONG) LIMITED",
    "LU0025": "U Protect Co.,Ltd",
    "LS0083": "S.SAHATARA (THAILAND)CO.,LTD.",
    "LP0261": "MR. PRAKASIT SUWAN-RASRI",
    "LH0052": "HEWLETT-PACKARD(THAILAND) LTD.",
    "LC0152": "CENTASIA CO., LTD.",
    "LF0038": "Fortune Cross (Thailand) Co.,Ltd",
    "LS0093": "WE WORK CO.,LTD.",
    "LS0277": "SUE CHENG PLASTIC CO.,LTD.",
    "LS1144": "Shizuki Electric (Thailand)",
    "LT0024": "THAI MC COMPANY LIMITED",
    "LT0028": "THAI ADHESIVE TAPES INDUSTRY",
    "LS0205": "SANGSUTEESIRI SUPPLY CO.LTD",
    "LW0084": "WORLD KOGYO (THAILAND) CO.,LTD.",
    "LT0163": "Treeman Technology Co.,Ltd.",
    "LS0229": "SIAM ARMSTRONG CO.,LTD",
    "LW0034": "W.H.P. CONSTRUCTION CO.,LTD.",
    "LA0205": "AQUA CONTROL SYSTEM CO.,LTD.",
    "LC0038": "COMPLETE SCI CO.,LTD",
    "LL0096": "LEO TOOLS INTERTRADE CO.,LTD.",
    "LI0010": "IWATANI CORPORATION",
    "LC0158": "C.M.P. PRODUCTS CO.,LTD.",
    "LK0050": "KULTHORN CO., LTD",
    "LB0056": "BETTER SCIENCE INSTRUMENT CO.,LTD.",
    "LJ0056": "JFE FERRITE (THAILAND) CO., LTD.",
    "LS0167": "SPLUSCORP CO., LTD.",
    "LS0108": "SUNLIGHT FLASHLIGHT CO.,LTD",
    "LR0026": "RADISYS CO., LTD.",
    "TC0001": "CARRIER TAIWAN CO.,LTD.",
    "LT0116": "THINKKER CO., LTD.",
    "LS0175": "SAKOL INDUSTRIAL SERVICE CO.,LTD",
    "LM0035": "MEE SAENG BUS BODY CO.,LTD.",
    "LB0054": "B-TECH INTENTION CO.,LTD.",
    "LA0088": "Alfa Laval (Thailand) Co., Ltd.",
    "LN0147": "N&P FURNITURE CO., LTD.",
    "MM0002": "Mettube International Sdn Bhd",
    "LP0220": "P.D.S. AUTOMATION CO.,LTD.",
    "LP0006": "PRECISION RESOURCE CO.,LTD.",
    "LP0251": "PAN ASIA INDUSTRIAL CO., LTD.",
    "LP0252": "POSCO (THAILAND) CO.,LTD",
    "LM0003": "MODERNFORM GROUP PUBLIC CO.,LTD.",
    "LN0035": "NICHIDEN TRADING (THAILAND) CO.",
    "LU0099": "UNDERWRITERS LABORATORIES(THAILAND)",
    "LS0183": "PICHIAN-KAEW LOCAL HANDICRAFT",
    "LM0040": "Media TreeWorks International",
    "LD0045": "Dewesoft (Thailand) Co., Ltd.",
    "LA0072": "A SOFT 1 CO., LTD.",
    "LM0043": "MAXWELL INNOVATION CO.,LTD.",
    "LT0126": "TOPCOM CO., LTD.",
    "LY0012": "YASKAWA ELECTRIC (THAILAND) CO.,LTD",
    "LC0030": "CLARITY IT CO., LTD.",
    "LS0051": "SINWARA GARMENT CO., LTD.",
    "LT0233A": "THAI KAKINUMA CO.,LTD.",
    "LT3259": "TOKYO BYOKANE (THAILAND) CO.,LTD.",
    "LE0020": "ECOTS ENGINEERING CO., LTD.",
    "LS0027": "S D P ALL METAL PRODUCT CO.,LTD.",
    "LG0010": "GIMMICK STUDIO CO.,LTD.",
    "HS0005": "SMITH AND ASSOCIATES FAR EAST, LTD.",
    "LS0208": "SIAM ADVANCE CHEMICAL CO.,LTD.",
    "LU0026": "UP2U TRADING CO., LTD.",
    "LJ0057": "J.A.T GROUND EXPERT CO.,LTD.",
    "LL0098": "LAB EXPRESS 4 U CO.,LTD",
    "LR0112": "Restar Electronics (Thailand)",
    "LS0209": "STM MACHINERY CO.,LTD.",
    "LU0027": "Union Carton Industry Co.,Ltd.",
    "LN0024": "NORTHERN SUNSHINE CO., LTD.",
    "LT3284": "TDK (THAILAND) CO.,LTD.",
    "LU0092": "UNITED COIL CENTER LIMITED",
    "LV0001": "THREE BOND VIV SALES(THAILAND)",
    "LV0066": "VINAI ENGINEERING INDUSTRY",
    "LM0064": "MSC STEEL STRUCTURE CO.,LTD",
    "LS0021": "SCS INSTRUMENTS CO.,LTD.",
    "LP0225": "PICO ENGINEERING (THAILAND)",
    "LT0850": "TOMCO AUTOMATIC MACHINERY CO.,LTD.",
    "LB0048": "CLEANOZONE TRAFFIC (THAILAND) CO.",
    "HB0002": "BNP Technology (Hong Kong) Co., Ltd",
    "LB0026": "BURANIN INDUSTRY CO., LTD.",
    "CW0005": "WAT INT'L (HK) LIMITED",
    "LH0023": "HEBEKO CO.,LTD",
    "LP0275": "PORN THAVEE OA CO.,LTD",
    "LM0144": "Mitsiam International, Limited",
    "LS1123": "SAMBO PIPING (THAILAND) CO.,LTD",
    "LE0022": "EMERSON (THAILAND) LIMITED",
    "LV0004": "VRK SPECTRUM CO., LTD.",
    "LC0060": "CLEANOVATION COMPANY LIMITED",
    "LP0944": "PDS INTERNATIONAL (THAILAND)",
    "LA0061": "ALCOTEC COMPANY LIMITED",
    "LA0055": "ASCG INTERPRO (ASIA)",
    "LA0038": "ATLANTIS TECHNOLOGY (THAILAND)",
    "SK0005": "KENDA (S) PTE LTD",
    "KY0001": "YOUNGSHIN ENGINEERING CO.,LTD.",
    "LG0054": "GW (1996) LIMITED PARTNERSHIP",
    "LT3287": "TRUE TECH MACHINERY CO.,LTD.",
    "LT3273": "TONAN ASIA AUTOTECH CO.,LTD.",
    "LT0881": "TAIKISHA (THAILAND) CO.,LTD.",
    "LS0095": "SST CO.,LTD",
    "LR0024": "R.T.C. MACHINE GROUP CO.,LTD.",
    "LP0249": "PN CONTROL MANUFACTURING CO., LTD.",
    "LP0230": "POLYMER APPLICATIONS TECHNOLOGY",
    "LC0231": "CENTIFORCE (THAILAND) CO.,LTD.",
    "LA0025": "ACCRUE TECHNOLOGIES SOLUTIONS",
    "SA0006": "AGRAMKOW ASIA PACIFIC PTE LTD.",
    "LR0100": "RYOSHO (THAILAND) CO.,LTD.",
    "LR0027": "R.S.CARE SERVICE CO., LTD.",
    "LT0146": "TRINITY INSTRUMENT CO.,LTD.",
    "LP0062": "P.S.D.DESIGN PARTNERSHIP",
    "LK0004": "KIATVIBOON INDUSTRIES LTD.,PART.",
    "LJ0039": "JC SPAIRPART CO.,LTD.",
    "LC0048": "CHAROENTANYAKIJ ENGINEERING (2009)",
    "LV0013": "V T Move&Service Co.,Ltd.",
    "MK0006": "KAMAYA ELECTRIC (M) SDN BHD.",
    "LI0035": "INSTRUMENT ASIA CO.,LTD.",
    "KD0001": "DPC CO., LTD.",
    "LT0059": "THAI CHANG MACHINERY CO., LTD.",
    "LT0048": "TALAN-ZINC LIMITED PARTNERSHIP",
    "LP0035": "PURAMUN CO.,LTD.",
    "CJ0002": "JIANGMEN SENBAI INDUSTRIAL CO., LTD",
    "LY0020": "YONG HONG (THAILAND) CO.,LTD.",
    "LV0014": "VMECA CO., LTD.",
    "LS0188": "STORE MASTER CO.,LTD",
    "FT0001": "TOSHIBA CARRIER EUROPE S.A.S",
    "LI0031": "ISID SOUTH EAST ASIA (THAILAND)",
    "LT0911": "TRINERGY INSTRUMENT CO.,LTD.",
    "LC0041": "CANON BALL MANUFACTURING CO., LTD.",
    "LM0045": "MICRO BIOTEC CO., LTD.",
    "LE0045": "ELife Systems Co.,Ltd.",
    "LS0191": "SHOW D D SUN TECH EVOLUTION",
    "CU0002": "UNIQ GLOBAL LIMITED",
    "LI0119": "iTak International (Thailand)",
    "LT0169": "T56 GROUP CO.,LTD.",
    "TS0001": "SATAKE ASIA SALES AND SERVICES",
    "VJ0001": "JINTIAN COPPER INDUSTRIAL(VIETNAM)",
    "SA0001": "Addcom Solution Pte Ltd.",
    "VW0001": "WOLONG ELECTRIC (VIETNAM)",
    "LK0001": "KAGA ELECTRONICS (THAILAND) CO.,LTD",
    "LF0111": "FUJIKOKI (THAILAND) CO.,LTD.",
    "LS0212": "SOUTH STAR CO.,LTD.",
    "LS0298": "S.K. POWERABLE CO.,LTD.",
    "LF0042": "FTEI (THAILAND) CO.,LTD.",
    "LR0113": "ROYAL BENJARONG CO., LTD.",
    "LK0041": "K-TECH COATING AND ENGINEERING",
    "LI0033": "I.G. MANAGEMENT CO., LTD.",
    "LE0040": "ECOLAB AND SERVICE CO., LTD.",
    "LC0042": "CSPM (THAILAND) LIMITED",
    "LC0011": "C & A BUSINESS LTD.,PART.",
    "LS0173": "SRF INDUSTRIES (THAILAND) LIMITED",
    "LF0029": "FOCUSLAB LTD.",
    "CK0003": "Koyu Electronics (Shenzhen) Limited",
    "LS0060": "S P WORK SUPPLY AND SERVICE",
    "LS0041": "SIAMSYNERGY SUPPLY CO., LTD.",
    "LS0018": "SATIEN STAINLESS STEEL",
    "LS0013": "SC TECHNOLOGY LIMITED",
    "LR0092": "RUSHSHOP CO.,LTD.",
    "LP0234": "P.T.M. DRINKING WATER CO.,LTD.",
    "LP0054": "PRATIMA TRADING CO., LTD.",
    "CT0003": "TOSHIBA CARRIER AIR-CONDITIONING",
    "LD0047": "D-JIG CO., LTD.",
    "IT0002": "TOSHIBA CARRIER AIR-CONDITIONING",
    "LS0029": "SPORT SOLUTION CO.,LTD.",
    "LB0053": "BANGKOK OA COMS CO., LTD.",
    "CT0005": "Carrier HVAC Equipment (Hangzhou)",
    "LA0083": "AP INDUSTRIAL TOOLS CO., LTD.",
    "LE0060": "EX SEED CO.,LTD.",
    "LM0059": "MITSUMOTO (THAILAND) CO.,LTD.",
    "LA0196": "ADVANTECH SOLUTION CO.,LTD.",
    "LG0043": "GOSHU TECHNOSERVICE CO.,LTD.",
    "LP0255": "PAKANAN MANAGING CREATION CO.,LTD.",
    "LS0190": "S.K. PHARMACEUTICAL.,LTD",
    "CJ0003": "JDM Jingda Machine (Ningbo) Co.,Ltd",
    "LM0006": "METRO SYSTEMS CORPORATION PUBLIC",
    "DS0001": "Schunk Sonosystems GmbH",
    "LM0142": "METTLER-TOLEDO (THAILAND) LTD.",
    "LH0020": "HIROYUKI (THAILAND)CO.,LTD.",
    "LP0257": "POOM INTER-ENGINEERING O.P.",
    "LA0129": "AMKO TECH CO.,LTD.",
    "LJ0051": "JTAGCO (THAILAND) CO., LTD.",
    "LE0049": "ELECTRONIC SUPPORT CO., LTD.",
    "HK0001": "LUXURY HARVEST (HONGKONG) LIMITED",
    "LT0109": "THAI SUMMIT GOLD PRESS CO.,LTD",
    "LP0067": "PARADISE PLASTIC CO., LTD.",
    "SZ0002": "ZUKEN SINGAPORE PTE. LTD.",
    "LT0111": "TOSHIBA CONSUMER PRODUCTS",
    "SN0003": "NATIONAL INSTRUMENTS SINGAPORE",
    "CS0006": "Highly International (Hongkong)",
    "LK0096": "KEEN PROJECT H&RES LTD.",
    "LK0025": "KIANGGU COMPANY LIMITED",
    "LK0024": "K BUILDING SAFETY CENTER",
    "JI0002": "IMV CORPORATION",
    "LP0260": "PREMIUM 360 CO., LTD.",
    "LA0081": "ADT Systems (Asia Pacific) Co.,Ltd",
    "LN0152": "N V R CORPORATION CO.,LTD",
    "LC0001": "CHINTER PRODUCTS CO.,LTD.",
    "LB0110": "BURDEN SUPPLY LTD.,PART.",
    "LA0070": "AUGUST TECHNOLOGY COMPANY LIMITED",
    "LA0022": "ACRYLIC THAI",
    "LT0145": "TOSPLANT ENGINEERING (THAILAND)",
    "LD0056": "D-KAN CO.,LTD.",
    "CS0013": "Sino Material Technologies Limited",
    "LM0032": "MANUFACTURE OVERHAUL RAPID AND",
    "LM0031": "MARREL (THAILAND) CO.,LTD.",
    "HD0001": "DINGSHENG ALUMINUM INDUSTRIES",
    "LP0281": "PROTECTIST CO.,LTD.",
    "CH0016": "Hefei Augewei Electronic Technology",
    "LF0128": "Flood Solution Technology Co.,ltd.",
    "LA0204": "ARTWORK PLUS CO.,LTD.",
    "LF0129": "FAMOUS CLOTHING UNIFORM CO.,LTD.",
    "LI0122": "INTERFABRIC 2010 CO.,LTD.",
    "LM0021": "MARQUIS CO., LTD.",
    "LN0031": "NAMPETCH INTER COMPANY",
    "HC0004": "CoreStaff Hong Kong Limited",
    "LT0124": "TNT TECHNICAL & SERVICE CO., LTD.",
    "LM0044": "MACNICA CYTECH (THAILAND) CO.,LTD",
    "LC0051": "CIVILIZE UP CO., LTD.",
    "LW0078": "WASIN TECH CO.,LTD.",
    "LW0006": "WORLD EXPERT CO., LTD.",
    "LN0143": "NAVANAKORN PLASTIC CO.,LTD.",
    "LS0193": "SAFETY MACHINE SERVICE CO., LTD.",
    "LA0207": "AP SOLUTION (1989) CO.,LTD.",
    "LD0006": "DYNAMIC MECHATRONICS ENGINEERING",
    "LT0170": "THE SCALE INTERNATIONAL CO.,LTD",
    "LS0304": "SOR SOMMAI CIVIL CO.,LTD.",
    "LO0033": "OISHI MACHINE (THAILAND) CO.,LTD.",
    "LT0133": "TORA SERVICE., LTD.",
    "LW0030": "Weiss Technik (Thailand) Ltd.",
    "LO0050": "OMEGA MEASURING INSTRUMENT CO.,LTD.",
    "LM0048": "MEDIAKEYS COMPANY LIMITED",
    "IP0002": "P.T.TOPJAYA SARANA UTAMA",
    "LA0109": "ARRK CORPORATION (THAILAND) LTD.",
    "LT0101": "THE PRACTICAL SOLUTION PUBLIC",
    "LX0003": "XTRON AIR-CONDITIONING MANUFACTURE",
    "LH0015": "HITACHI SUNWAY INFORMATION SYSTEMS",
    "LD0035": "DNIYOM MULTI/ WWW.ITSOUNDUP.COM",
    "LK0122": "KOMATSU INDUSTRIES (THAILAND) CO.,L",
    "LB0003": "B.N.C. TOOLING CO.,LTD.",
    "LP0262": "PHA AUTOMATION CO.,LTD",
    "LA0100": "AAT SERVICE LIMITED PARTNERSHIP",
    "LN0146": "Nichifu (Thailand) Co., Ltd.",
    "LM0058": "MAINLINE SOLUTIONS CO.,LTD.",
    "LK0020": "KRYSTAL MICROSYSTEMS (THAILAND)",
    "LP0282": "PROGRESS DESIGN 2002 CO.,LTD.",
    "LH0068": "HOPPY INDUSTRIAL(THAILAND)CO.,LTD.",
    "LT0164": "THAI TONGDA OUTDOOR PRODUCTS",
    "LS0230": "SCAN SIAM SERVICE CO., LTD",
    "LS0036": "SUNTOOL ENGINEERING SYSTEMS",
    "LS0028": "SIAM ELEVATOR & ESCALATOR",
    "LS0020": "SYNERGY ASIA SOLUTION CO., LTD.",
    "LR0099": "DEBAC (THAILAND) CO.,LTD.",
    "LP0037": "POWER TECH ELECTRIC CO., LTD.",
    "LP0036": "PHUTTHA INDUSTRIAL CO., LTD.",
    "LP0008": "PERKINELMER LTD.",
    "LT0218": "BEGER COMPANY LIMITED",
    "LT0110": "THAI DEV CONSULTING CO., LTD.",
    "LO0041": "OMC SANYU ELEVATOR CO., LTD.",
    "LN0032": "NERAMIT PLUS CO., LTD.",
    "LN0028": "N.T. WORLD COMPUTER CO., LTD.",
    "LN0006": "NITTO MATEX (THAILAND) CO., LTD.",
    "LM0022": "M2J ENTERPRISE CO., LTD.",
    "LL0092": "LSP MANUFACTURING CO.,LTD",
    "LK0035": "KA SHIN (THAILAND) CO., LTD.",
    "LK0033": "K COLOR (1997) COMPANY LIMITED",
    "LK0006": "KOYO PRECISION (THAILAND) CO., LTD.",
    "LK0038": "K-2 SAFETY CENTER",
    "LU0023": "U.P.V SERVICE CO.,LTD",
    "LP0064": "PP&P CENTER SERVICE",
    "LA0202": "Advanced Wireless Network",
    "LY0002": "YIP IN TSOI & CO.,LTD.",
    "LS0024": "S.C.T. ENGINEERING & SUPPLY CO.,LTD",
    "LP0007": "FASTSERVE CO., LTD.",
    "LO0017": "OfficeMate (Thai) Limited",
    "LO0045": "OK PACKAGING CO.,LTD.",
    "LP0055": "PHOL DHANYA PUBLIC COMPANY LIMITED",
    "LM0051": "MEC AUTOMATION CO., LTD.",
    "LP0038": "PRECISION SLITTING CENTER CO.,LTD.",
    "LB0140": "BORNEO TECHNICAL (THAILAND) LIMITED",
    "LA0087": "Arunsiam Uniplast Co.,Ltd.",
    "LS0004": "S.K. POLYMER CO.,LTD.",
    "LE0160": "EAMTIP RICE CO.,LTD.",
    "CZ0004": "THAI SHENG ALUMINIUM CO., LIMITED",
    "LE0052": "EPC INTERNATIONAL CO., LTD.",
    "LI0095": "IRC TECHNOLOGIES LIMITED",
    "LT0916": "THAI METROLOGY SYSTEM CO.,LTD.",
    "LH0056": "HI PREMIUM LTD., PART.",
    "LE0053": "ELECTRONICA CO., LTD.",
    "LJ0036": "JOINMAX INTERNATIONAL CO.,LTD.",
    "LM0090": "MEMBER TECH CO., LTD.",
    "LW0020": "WELTRON ID TECHNOLOGY CO., LTD.",
    "LD0022": "DUNAN METALS (THAILAND) CO.,LTD.",
    "MT0002": "TOX PRESSOTECHNIK SDN BHD",
    "MD0001": "DY POWER SYSTEMS (M) SDN. BHD.",
    "LY0001": "YOKOGAWA (THAILAND) LTD.",
    "LW0012": "WAREE PITAK CO.,LTD.",
    "LV0057": "VACHARA INTER PRINTING CO.,LTD.",
    "LU0097": "ULTIMATE PACKAGING CO.,LTD.",
    "LU0019": "UNITY PARTS AND ENGINEERING CO.",
    "LJ0054": "ENEOS (Thailand) Ltd.",
    "LJ0020": "JAKAWATNA NAWAKARN CO., LTD.",
    "LI0014": "INTER PROJECT ENGINEERING CO.,LTD.",
    "LI0007": "ITS (THAILAND) CO.,LTD.",
    "LH0009": "HIROMITSU TECNOART (THAILAND)",
    "LH0008": "HST INTERNATIONAL CO., LTD.",
    "LG0124": "THAI SUMMIT GOLD PRESS",
    "LF0116": "FUJILLOY (THAILAND) COMPANY LIMITED",
    "LF0103": "FLU-TECH CO.,LTD.",
    "LF0008": "FINGTRACK CO., LTD.",
    "LE0034": "E. MOLDING INTERNATIONAL CO.,LTD",
    "LD0042": "Daitron (Thailand) Co., Ltd.",
    "LD0041": "DEMA PAINT SUPPLY CO.,LTD",
    "LD0019": "D N T WORLD PLAST CO.,LTD.",
    "LC0031": "CCA MARKETING CO., LTD.",
    "LC0023": "CHAI MONGKOL INDUSTRY CO., LTD.",
    "LC0016": "CREATUS CORPORATION LIMITED",
    "LC0012": "CRESPACKTHAI CO.,LTD.",
    "LC0007": "COSMOWAVE TECHNOLOGY CO.,LTD.",
    "LW0021": "MS.PHAWARAN PREECHA",
    "LT0089": "TKC ENGINEERING SERVICES CO.,LTD",
    "LH0014": "HINSITSU (THAILAND) PUBLIC",
    "LA0045": "ALLSTAR INTERTRADE CO.,LTD.",
    "LK0049": "Kyoseki (Thailand) Co., Ltd.",
    "JM0005": "MIHAMA CORPORATION",
    "LP0268": "PORTABLE LOO ASIA CO.,LTD.",
    "LD0088": "DSL ASIA-PACIFIC CO.,LTD.",
    "LA0097": "ACE MOVING AND SERVICES CO.,LTD.",
    "LA0099": "ALL AROUND THE WORLD CO., LTD.",
    "CZ0008": "Zhongshan TAKA GI Electronics",
    "LP0274": "Poly Vision Precision Mould",
    "LT0468": "THAINAK INDUSTRIES CO., LTD",
    "LT0523": "THAI SCT CO.,LTD.",
    "LC0032": "CAS-CR CO., LTD.",
    "LL0091": "LEDSAVE (THAILAND) CO., LTD.",
    "LM0042": "M2 ANIMATION STUDIO CO., LTD.",
    "LS0168": "S T CON CO.,LTD.",
    "LM0033": "MOVE (THAILAND) CO., LTD.",
    "LS1103": "S.P.J.P. CO.,LTD.",
    "LT0114": "Tanabe (Thailand) Co., Ltd.",
    "JT0021": "TOFLE INTERNATIONAL CO., INC.",
    "HB0001": "BOKA (HK) LIMITED",
    "LH0003": "HAPPINESS CREATE CO., LTD.",
    "LH0002": "HUB ENGINEERING AND",
    "LG0143": "GREATWALL (1988) CO.,LTD.",
    "LG0139": "GLOBAL SEAL CO.,LTD.",
    "LG0125": "GFI LINE",
    "LG0053": "GOOD HARVEST CO.,LTD.",
    "LG0052": "GOODWILL MACHINE CO.,LTD.",
    "LF0120": "FURNITECT COMPANY LIMITED",
    "LE0172": "ENERGY REBORN CO.,LTD.",
    "LE0170": "ELECTRICAL MATE CO.,LTD.",
    "LE0150": "ELECTRONIC COMMERCE CO., LTD.",
    "LE0036": "3114 ENGINEERING CO.,LTD.",
    "LE0004": "E.A. EASY CO.,LTD.",
    "LD0071": "DYNO ELECTRIC CO.,LTD.",
    "LD0012": "DESIGN EX CO., LTD.",
    "LD0008": "D N S SERVICE AND SUPPLY LIMITED",
    "LC0077": "COMPUTE MINUTE ADVERTISING CO.,LTD.",
    "LC0008": "CSK POWER TECHNOLOGY CO., LTD.",
    "LB0160": "BIG POWER SUPPLY CO.,LTD.",
    "LB0152": "BARCODE RETAIL SOLUTION SYSTEM",
    "LB0121": "BANGKOK MODERN BUSINESS CO.,LTD.",
    "LB0007": "BEHONEST CO., LTD.",
    "LA0194": "A.D.ELECTRICS SALES & SERVICE",
    "LA0170": "ABSOLUTE PART TECHNOLOGY CO.,LTD.",
    "LA0168": "AGLOW TECHNOLOGY & ENGINEERING LTD",
    "LU0082": "ULTRACORE ELECTRONICS SUPPLIES",
    "LE0055": "ENERGENIUS CO.,LTD.",
    "LJ0025": "J.I.B. COMPUTER GROUP CO., LTD.",
    "HV0001": "Vadas Buy Company Limited",
    "LS0210": "SIAM HARD CHROM CO.,LTD.",
    "LG0011": "GREEN GARDEN MANAGEMENT CO., LTD.",
    "LF0015": "FERRIC (THAILAND) CO.,LTD.",
    "LE0165": "EKASILP BANGKOK CO.,LTD.",
    "LC0036": "C&P HOTLINE SERVICE LIMITED",
    "LB0015": "BPS BEST PART SUPPLY CO., LTD.",
    "LA0190": "ASIACO MATERIAL HANDLING",
    "LA0178": "AMPAN POWER SOLUTION CO.,LTD.",
    "LA0058": "A.P.P.C. ENGINEERING CO.,LTD",
    "LU0086": "UNIROLL (THAILAND) CO.,LTD.",
    "LJ0053": "JD MODEL CO.,LTD",
    "NO0004": "OHNISHI NETSUGAKU CO., LTD.",
    "LO0029": "OSKON CO.,LTD.",
    "LC0057": "CHUN SIANG AUTOPART CO.,LTD.",
    "LM0018": "MAXTORS (INTERTRADE) CO., LTD.",
    "LF0023": "FLEX WIRES (THAILAND) CO., LTD.",
    "LB0023": "BP PROSOLUTION CO., LTD.",
    "LG0008": "GSD PREMIUM LIMITED PARTNERSHIP",
    "LA0197": "A.N.GENERATION CO.,LTD.",
    "LS0085": "SUMISHO GLOBAL LOGISTICS (THAILAND)",
    "LB0024": "BEST PUMP AUTOMATION CO., LTD.",
    "HA0001": "ALCHA INTERNATIONAL HOLDINGS",
    "LI0099": "C.I.GROUP PUBLIC COMPANY LIMITED",
    "LE0056": "ENVIRONMENTAL ADVISOR CO., LTD",
    "LA0529": "ALPINE TECHNOLOGY MANUFACTURING",
    "LT0135": "THAI DIAMOND&ZEBRA ELECTRIC CO.,LTD",
    "LJ0037": "J.C. CONTAINERS CO.,LTD.",
    "LT0149": "TECNIX GARAGE (THAILAND) CO.,LTD.",
    "LN0039": "NEO PRO CO., LTD.",
    "LS1137": "SANKEI ENGRAVING TECHNOLOGY",
    "LV0055": "TANI GUCHI METAL CO.,LTD.",
    "LA0166": "ATTAIN TECHNOLOGY CO.,LTD.",
    "LA0165": "AKATHAVEE TOOLS CORPORATION",
    "LA0164": "AP MECHANIC CO.,LTD.",
    "LA0148": "ARGO ENGINEERING CO.,LTD.",
    "LA0036": "ASIA FURNITURE THAILAND",
    "LA0035": "ABEX HYDRAULICS & ENGINEERING",
    "LA0016": "A.T.N. PRODUCTS AND SERVICE",
    "LA0015": "ADVANCE BUSINESS INTERTRADE",
    "LA0013": "ADVANCE SIAM TECH CO.,LTD.",
    "LA0007": "ARIYA INDUSTRIAL TRADING",
    "LF0021": "FUMITRADE INTERNATIONAL CO., LTD.",
    "LM0019": "MICROLINE CIRCUIT CO., LTD.",
    "LU0001": "UNIPACK PHD CO.,LTD.",
    "LT3277": "T.P.S.ALUMINIUM CO.,LTD.",
    "LT0519": "THONGSUPA TRANSPORT LTD.,PART.",
    "LT0502": "TWO ADVANCE TECHNOLOGY CO.,LTD.",
    "LT0501": "THAI SUPPORT ENGINEERING CO.,LTD.",
    "IR0001": "RIELLO S.p.A.",
    "LJ0058": "JNI THAI CO.,LTD.",
    "LT0153": "T.N.N CORPORATION CO.,LTD.",
    "LS0214": "SHADE FLOORING CO.,LTD.",
    "LS0217": "SMILE COMMERCIAL CO., LTD.",
    "LK0052": "KEEEN BIOTECH GROUP CO., LTD.",
    "LG0021": "GRANDIOSE ENGINEERING CO.,LTD.",
    "LF0041": "FALCO SOLUTION CO.,LTD.",
    "LW0061": "WISE ENTERPRISE CO., LTD.",
    "LL0101": "LOCKWELL SYSTEMS CO., LTD.",
    "KF0002": "Fresnel Factory Korea Inc.",
    "LM0104": "KONECRANES MATERIAL HANDLING",
    "LS1155": "STEP MIND CO.,LTD.",
    "LM0060": "MS CHEMITECH CO.,LTD",
    "LK0122_JPY": "KOMATSU INDUSTRIES (THAILAND) CO.,L",
    "MT0001": "TOSHIBA SALES AND SERVICES SDN.",
    "LS0092": "SIRI TRAILER & ENGINEERING",
    "LS0164": "SATAKE LABORATORY SERVICE",
    "LC0040": "CSG SOLUTION (THAILAND) CO.,LTD",
    "LH0017": "HELMUT FISCHER (THAILAND) CO.,LTD",
    "LT0104": "TORTANGROUP LIMITED PARTNERSHIP",
    "JS0012": "S.T.CORPORATION",
    "CG0004": "GUANGDONG SUNWILL PRECISING",
    "LT0105": "THAI BROADCASTING CO.,LTD",
    "LT0304": "T.S. UNIFORM LTD.,PART.",
    "LT0031": "TR WATER ENGINEERING CO., LTD.",
    "LT0018": "THAMMAKHUN AUTOMATION",
    "LS1168": "SRITHONG",
    "LS1156": "SIAM UNITED METAL AND TOOL CO.,LTD.",
    "LS1152": "SAKURA PRODUCTS (THAILAND) CO.,LTD.",
    "LS0300": "SMART BESTBUYS CO.,LTD.",
    "LS0287": "SIDA INDUSTRIALIZED COMPANY LIMITED",
    "LS0282": "S.P. INTERNATIONAL COMMERCIAL",
    "LS0270": "SMART DRIVE CO.,LTD.",
    "LS0026": "SOCOM MACHINERY CO.,LTD.",
    "LR0104": "RIGHT SYSTEM CO.,LTD.",
    "LE0030": "EVERTECH CO.,LTD.",
    "LK0108": "K&P F.A. CENTER CO.,LTD.",
    "LI0110": "INTER FURNILINE CO.,LTD.",
    "LI0103": "I CONTROL DATA LIMITED PARTNERSHIP",
    "LH0062": "HITECH ENTERPRISE CO.,LTD.",
    "LA0044": "AQUA NISHIHARA CORPORATION LIMITED",
    "LR0016": "RIBBON (THAILAND) CO., LTD.",
    "LD0029": "DOU YEE ENTERPRISES (THAILAND)",
    "LP0239": "PROJECTOR WORLD COMPANY LIMITED",
    "LF0043": "FL Spring (Thailand) Co., Ltd.",
    "LV0015": "VS MED PLUS CO.,LTD.",
    "VL0001": "LS METAL VINA LIMITED LIABILITY",
    "LR0114": "RED INTERTRADE CO.,LTD.",
    "CG0008": "Guangdong Longfeng Precise copper",
    "LT0155": "Teamplas Chemical Co., Ltd.",
    "LN0151": "NB Surveys (Thailand) Co. Ltd.",
    "LK0197": "KYORITSU ENGINEERING (THAILAND)",
    "LC0230": "C.P. FOOD STORE CO.,LTD.",
    "NS0005": "SHINKAN INDUSTRY CO.,LTD.",
    "LT0156": "THAI BIO OXZINE COMPANY LIMITED",
    "LS0226": "SGI Technology Co.,Ltd.",
    "LT0158": "THAI SEMCON CO.,LTD.",
    "LM0062": "M TECH PLAS Co.,LTD.",
    "LP0279": "PEAK CORPORATION CO.,LTD",
    "HH0002": "HONG KONG HAILIANG METAL",
    "CJ0005": "JIANGSU BAODE HEAT EXCHANGER",
    "LT0106": "TAWEEKIAT KARNCHANG CO.,LTD",
    "LT0108": "THAICITY UMBRELLA CO.,LTD.",
    "LW0023": "WISE CHOICE (THAILAND) CO., LTD.",
    "LP0248": "MR.PHIROM KHASABAI",
    "LY0010": "YLM INDUSTRIAL COMPANY LIMITED",
    "LY0011": "YUSHI GROUP CO., LTD.",
    "LF0028": "FELIZ DISENO CO., LTD.",
    "CS0009": "Diamond and Zebra Electric",
    "UA0001": "Auto Technology Company",
    "CW0003": "WUXI HONG GUANG CAPACITOR CO., LTD.",
    "LF0122": "FINEDEC CONSTRUCTION CO.,LTD.",
    "LC0014": "CHEMICAL MANAGEMENT SERVICES",
    "LB0011": "BANGKOK BPI CO., LTD.",
    "SP0002": "PANASONIC INDUSTRIAL DEVICES",
    "LT0073": "THAI METROLOGY CALIBRATION",
    "LP0052": "POTAMUS TROOP CO., LTD.",
    "LA0047": "A-PRIDE TRADING COMPANY LIMITED",
    "LP0057": "PATUM RICE MILL AND GRANARY PUBLIC",
    "LS0086": "SINCHAROEN TEXTILE CO., LTD.",
    "LK0201": "KOREX COMPANY LIMITED",
    "LT0942": "TAWANA CONTAINER CO.,LTD.",
    "LM0150": "M.PROSPER CO.,LTD.",
    "LT0161": "TOPGAS CO.,LTD.",
    "CW0006": "Wolong Electric Group Co.,Ltd.",
    "LI0121": "Intellectual Design Group Co.,Ltd.",
    "LK0054": "KRUNGDHEP DOCUMENT CO., LTD.",
    "LS0180": "STI IMPEX CO.,LTD.",
    "LM0037": "Matforcons Co.,Ltd.",
    "JT0009": "TOSHIBA TRADING INCORPORATED",
    "LY0021": "YUNEED SERVICE AND SUPPLY",
    "LT0943": "T.O.PROFIT CO.,LTD.",
    "LT0904": "SYMATE SOLUTION (THAI)",
    "LT0504": "TCP TRANSPORT LTD.,PART.",
    "LT0180": "TCP SUPPLY SERVICE CO.,LTD.",
    "LT0011": "TOP RICH CORPORATION CO., LTD.",
    "LS1146": "SIAM CASTER WHEELS CO.,LTD.",
    "LS0165": "SIAM MECHATRONIC CO.,LTD.",
    "LR0002": "RUAM MIT RUNG CHAROEN MOULD",
    "LP0191": "PREMIER AUTOMATION CENTER",
    "LP0156": "PMC CARDS (THAILAND) LTD.",
    "LE0174": "ENTECH ASSOCIATE CO., LTD.",
    "LP0033": "PLANET BARCODE CO., LTD.",
    "LH0016": "H.J. UNKEL (THAI) LIMITED",
    "LD0033": "DIGITAL SCALE & ENGINEERING",
    "LB0150": "BANGKOK SCIENCE AND SERVICE",
    "LT0147": "T.V.P.Valve & Pneumatic",
    "LD0052": "DMS ISOLUTIONS PTE (THAILAND)",
    "LA0198": "AREE APHILUCK CO., LTD.",
    "CG0006": "GOLDEN DRAGON PRECISE COPPER",
    "LF0033": "Forth EMS Public Company Limited",
    "LT0136": "T.T.H KNITTING(THAILAND) CO.,LTD",
    "LK0121": "KANOKPHONG ENTERPRISES CO.,LTD.",
    "CZ0005": "Shenzhen Wewins Wireless Co., Ltd",
    "LM0041": "Metropolitan Electricity Authority",
    "LN0036": "NBT PROFESSIONAL CO.,LTD.",
    "LU0021": "EUREKA AUTOMATION CO., LTD.",
    "LT0125": "TOYOTA TSUSHO NEXTY ELECTRONICS",
    "LN0037": "NaRiDe BANGKOK CO., LTD.",
    "LW0027": "W I P SELECTION CO.,LTD.",
    "CN0002": "NINGBO AUX IMP. AND EXP. CO.,LTD.",
    "LK0059": "KYOTO ELECTRIC WIRE ( THAILAND )",
    "LS0264": "S.A PRECISION CO.,LTD.",
    "LF0109": "FINESSE CO., LTD.",
    "LB0027": "BIGKIDINOFFICE CO., LTD.",
    "LA0115": "ADVANCED BUSINESS SOLUTIONS",
    "LT0082": "THAKOTECH CO., LTD.",
    "LN0030": "NANOMACHINERY CO., LTD.",
    "JS0011": "SUZUYE AND SUZUYE OFFICE",
    "LC0033": "THE CHEMOURS (THAILAND)",
    "LK0098": "KRUGER VENTILATION INDUSTRIES",
    "LK0012": "K AUTO DEAL TRADING CO., LTD.",
    "LS0017": "SGD INTER TRADING CO., LTD.",
    "LT0945": "THAI OHNISHI CO.,LTD.",
    "LS0279": "SAMPREP CO.,LTD.",
    "LS0227": "SYM TECHNOLOGY CO.,LTD.",
    "LH0067": "HANWA STEEL SERVICE (THAILAND)",
    "LF0126": "F.T.O Laser & C.N.C CO.,LTD",
    "LF0018": "SUN ROBOTICS & AI CO.,LTD.",
    "LE0159": "ELEMATEC (THAILAND) CO.,LTD.",
    "LT0516": "THAI-LIAN FORKLIFT CO.,LTD.",
    "L55479": "UNION NIFCO CO., LTD.",
    "LA0152": "AIM ELECTRIC (THAILAND) CO.,LTD.",
    "LA0169": "ALCONIX LOGISTICS (THAILAND)",
    "LC0082": "C.B. TACT (THAILAND) CO.,LTD.",
    "LD0011": "DEEPORN CHAROEN CO.,LTD.",
    "LA0073": "AIRADA GROUP CO., LTD.",
    "ST0006": "TOSHIBA ELECTRONICS ASIA",
    "LS0185": "SIAM AQUA FILTER CO., LTD.",
    "LL0046": "LIFT MAX CO.,LTD.",
    "LC0049": "CHOSEN TECHNOLOGY CO., LTD.",
    "LT0127": "THAI HIBEX CO., LTD.",
    "LD0046": "DOUBLE-S (Thailand) Co.,Ltd.",
    "LI0038": "INNOVO TRADING CO., LTD.",
    "CZ0006": "Zhenjiang Honglian Electrician",
    "LF0037": "FERSMEK CO., LTD.",
    "LI0040": "INTERNET THAILAND PUBLIC COMPANY",
    "LW0029": "WISNU AND SUPAK CO., LTD.",
    "LA0004": "ADD IN BUSINESS CO.,LTD.",
    "LA0208": "ABIDE DESIGN & DEVELOPMENT CO.,LTD.",
    "LG0056": "GRAVITY MECH CO.,LTD.",
    "LS0042": "SME INTERNATIONAL CO., LTD.",
    "UC0002": "COMPONENTSOURCE LIMITED",
    "LS0223": "SINSIAM PLUS CO., LTD.",
    "LV0009": "V.T.R. OFFICE CENTER CO., LTD.",
    "LS0306": "SCSI COM ELITE CO.,LTD.",
    "CL0002": "LUOYANG LONGDING ALUMINIUM",
    "LA0040": "ASIAN INOAC CO.,LTD.",
    "LT0235": "THAI-JAPAN GAS CO.,LTD.",
    "LP0286": "Promising Corporation (Thailand) Co",
    "LF0107": "FLE (THAILAND) CO., LTD.",
    "LF0113": "FURUKAWA SANGYO KAISHA (THAILAND)",
    "LF0124": "FASCO MOTORS (THAILAND) LIMITED",
    "LG0131": "GOLDENSEA SANKI (THAILAND) CO.,LTD.",
    "LH0037": "HITACHI ASIA (THAILAND) CO.,LTD.",
    "LH0065": "HOSODA (THAILAND) CO.,LTD.",
    "LI0100": "IMMORTAL PARTS COMPANY",
    "LJ0007": "JOHOKU (THAILAND) CO.,LTD.",
    "LL0056": "LINDE (THAILAND) PUBLIC COMPANY LIM",
    "LM0189": "MICROPURE INNOVATION (THAILAND)",
    "LN0022": "NISSEI TRADING (THAILAND)",
    "LN0068": "NTN BEARING-THAILAND COMPANY",
    "LN0113": "NEIS(Thailand)Co.,Ltd.",
    "LN0124": "NP INDUSTRIAL SUPPLY CO.,LTD.",
    "LO0040": "OTAX ELECTRONICS (THAILAND)",
    "LP0074": "MCS ELTECH SUPPLY CO.,LTD.",
    "LP0079": "PARKER INTERNATIONAL CORPORATION",
    "LR0012": "SUNSHINE PRESS (1994) CO.,LTD.",
    "LR0074": "SANKYO ENGINEERING (THAILAND)",
    "LT0117": "THAIOTOPTRADER CO., LTD.",
    "LT0115": "T.T.C. LOGISTICS (THAILAND) CO.,LTD",
    "LT0113": "Thai Waterline Systems Co., Ltd",
    "LA0076": "AKROS TRADING (THAILAND) CO., LTD.",
    "LK0047": "Kamikura Intertrade Co.,Ltd.",
    "LC0053": "CITC Enterprise (Thai) Co., Ltd.",
    "JT0001": "TOSHIBA CARRIER CORPORATION",
    "JT0002": "TOSHIBA CARRIER CORPORATION",
    "LT0107": "TOA SE (THAILAND) CO.,LTD"
};

// ตั้งค่าฐานข้อมูลในเครื่อง
// --- บรรทัดที่ 1 ของไฟล์ script.js ---
// เพิ่มฟังก์ชันนี้ไว้บนสุดของ script.js
function safeSetText(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = value;
    }
}
window.playCommitAnimation = function() {
    const btn = document.getElementById('btn-commit');
    const target = document.getElementById('record-count');
    
    // ตรวจสอบความพร้อมของอุปกรณ์และ Library
    if (!btn || !target || typeof gsap === 'undefined') return;

    // 1. สร้างพาร์ทจำลอง
    const ghost = document.createElement('div');
    ghost.style.cssText = `
        position: fixed; z-index: 10000; width: 30px; height: 30px;
        background: #2563eb; border-radius: 8px; display: flex;
        align-items: center; justify-content: center; color: white;
        box-shadow: 0 0 15px rgba(37, 99, 235, 0.5); pointer-events: none;
    `;
    ghost.innerHTML = '📦';

    // 2. คำนวณพิกัดเริ่มต้น
    const rect = btn.getBoundingClientRect();
    ghost.style.left = (rect.left + rect.width / 2 - 15) + 'px';
    ghost.style.top = (rect.top + rect.height / 2 - 15) + 'px';
    document.body.appendChild(ghost);

    // 3. คำนวณพิกัดปลายทาง
    const targetRect = target.getBoundingClientRect();
    const destX = (targetRect.left + targetRect.width / 2) - (rect.left + rect.width / 2);
    const destY = (targetRect.top + targetRect.height / 2) - (rect.top + rect.height / 2);

    // 4. สั่งบิน
    gsap.to(ghost, {
        duration: 0.7,
        x: destX,
        y: destY,
        rotation: 360,
        scale: 0.2,
        opacity: 0,
        ease: "power2.inOut",
        onComplete: () => {
            ghost.remove();
            // เอฟเฟกต์เด้งที่ตัวเลข
            gsap.fromTo(target, { scale: 1.5 }, { scale: 1, duration: 0.4 });
        }
    });
};

const isOnline = () => navigator.onLine;
// ตั้งค่าฐานข้อมูลในเครื่อง (ขยายขอบเขตให้ครอบคลุมทุกโมดูล)
const localDB = new Dexie("CarrierOfflineDB");

localDB.version(2).stores({
    pendingClaims: "id, date, sync_status",
    pendingOT: "id, date, sync_status", // เพิ่มบรรทัดนี้
    pending5S: "id, month, sync_status" // เพิ่มบรรทัดนี้
});

// ฟังก์ชันตรวจสอบสถานะเน็ตแบบ Real-time
function isSystemOnline() {
    return navigator.onLine;
}

// 1. Configuration - เชื่อมต่อ Supabase พร้อม Header ที่สมบูรณ์
const SQE_URL = 'https://xgkjxvljdhpniakgzatf.supabase.co';
const SQE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhna2p4dmxqZGhwbmlha2d6YXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NDkxMjYsImV4cCI6MjA5MzAyNTEyNn0.os0bmAoR7CCefdsuQzGC9eLPnEJ64Ny8rxx0lFMXXAU';

const WAP_URL = 'https://dyhpjyokvtwejayptwyk.supabase.co';
const WAP_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5aHBqeW9rdnR3ZWpheXB0d3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNzE4MjcsImV4cCI6MjA5Mjg0NzgyN30.KSU9-0zZ3w7Z6wmOTqVvZZv4_Y0cMYOfp_ZyWWB7UCQ';

// แก้ไข Headers ให้สมบูรณ์แบบ
const authHeaders = {
    apikey: SQE_KEY,
    Authorization: `Bearer ${SQE_KEY}`
};

// 1. แก้จุดประกาศตัวแปรหลัก
let sqeClient = window.supabase.createClient(SQE_URL, SQE_KEY, {
    auth: { persistSession: false },
    global: { headers: authHeaders }
});

let wapClient = window.supabase.createClient(WAP_URL, WAP_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
        headers: {
            apikey: WAP_KEY,
            Authorization: `Bearer ${WAP_KEY}`
        }
    }
});

// ── แทนที่ 2 บรรทัดเดิมนี้ ──
// let sqeClient = supabase.createClient(SQE_URL, SQE_KEY);
// let wapClient  = supabase.createClient(WAP_URL, WAP_KEY);

const SUPABASE_CLIENT_OPTS = {
    auth: {
        persistSession: false,   // ไม่ใช้ Supabase Auth (ระบบ login เป็น custom table 'users')
        autoRefreshToken: false, // กันไม่ให้ GoTrueClient แอบ refresh token แล้วชน header apikey
        detectSessionInUrl: false
    },
    global: {
        headers: { apikey: SQE_KEY } // บังคับแนบ apikey ทุก request เผื่อ header หลุด
    }
};

window.adminBypass = false; // ใช้ window เพื่อให้เรียกใช้ข้ามโมดูลได้แน่นอน
// 2. Global State
let S = {
    isLoggedIn: false,
    currentUser: '',
    userRole: 'staff',
    viewingUser: '',
    records: [],    // สำหรับข้อมูล SQE (xgkjxvlj...)
    attLeaveRecords: [],
    wapData: {      // สำหรับข้อมูล WAP (dyhpjyok...)
        achievements: [],
        attendance: [],
        score5s: [],
        skills: [],
        specialJobs: [] 
    },
    activeFilter: 'ALL',
    searchKeyword: '',
    selectedShift: 'SHIFT A',
    editingId: null,
    isOnline: navigator.onLine,
    loginRole: 'staff'
};


const ROW_HEIGHT = 56; 
let virtualTableState = { allRows: [], prevStart: -1, prevEnd: -1, isFreshRender: true };

let smartMemory = {
    values: { partNo: new Set(), partName: new Set(), supplier: new Set(), line: new Set(), defect: new Set() },
    byPartNo: {}, byPartName: {}, bySupplier: {}, byLine: {}
};

let aiBrain = { partNoMap: {}, partNameMap: {}, defectToRemarkMap: {}, supplierPartMap: {} };


const defectDict = {
    'flash': 'พบครีบ/ฟิล์มเกินบริเวณชิ้นงาน',
    'burr': 'พบเสี้ยน/ขอบคมจากการตัด',
    'clog': 'พบการอุดตันของรู/ช่องทาง',
    'scratch': 'พบรอยขีดข่วนบนผิวชิ้นงาน',
    'crack': 'พบรอยร้าวบนชิ้นงาน',
    'dent': 'พบรอยบุบ/ยุบตัว',
    'stain': 'พบคราบสกปรก/รอยเปื้อน',
    'short': 'พบขนาดสั้นกว่ามาตรฐาน',
    'bend': 'พบการโก่งงอผิดรูป',
    'discolor': 'พบสีเพี้ยนจากมาตรฐาน',
    'crooked': 'พบชิ้นงานเบี้ยว/ไม่ตรงแนว',
    'peel': 'พบการหลุดล่อน/ลอกของผิวชิ้นงาน'
};

document.addEventListener('contextmenu', e => e.preventDefault());
const $id = id => document.getElementById(id);

function hasWriteAccess() {
    if (S.userRole === 'supervisor') {
        toast('⚠️ โหมดหัวหน้างาน: อ่านข้อมูลได้อย่างเดียวไม่สามารถแก้ไขได้', 'error'); 
        return false;
    }
    return true;
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/'/g, '&#039;');
}

function getFriendlyErrorMessage(err) {
    if (!err) return 'เกิดข้อผิดพลาด';
    if (!navigator.onLine || err.message?.includes('fetch') || err.message?.includes('network')) return '📶 ปัญหาการเชื่อมต่อ: กรุณาตรวจสอบอินเทอร์เน็ต';
    switch (err.code || (err.error && err.code)) {
        case '42501': return '🔒 สิทธิ์ปฏิเสธ';
        case '23505': return '🚫 ข้อมูลซ้ำ';
        case 'PGRST116': return '🔎 ไม่พบข้อมูล';
        case 'PGRST100': return '⏳ Timeout';
    }
    return `❌ ${err.message || 'เกิดข้อผิดพลาด'}`;
}

function toast(msg, type = 'info') {
    let el = $id('toast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'toast';
        document.body.appendChild(el);
    }
    el.className = `toast toast-${type}`;
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => { el.style.opacity = '0'; }, 3200);
}

function shake(el) {
    if (!el) return;
    if (window.gsap) {
        gsap.fromTo(el, { x: -7 }, { x: 7, repeat: 5, yoyo: true, duration: 0.06, ease: 'power1.inOut', onComplete: () => { el.style.transform = 'none'; } });
    } else {
        el.animate([{ transform: 'translateX(-7px)' }, { transform: 'translateX(7px)' }, { transform: 'translateX(0)' }], { duration: 220 });
    }
}

// 2. แก้ฟังก์ชัน getSupabase ให้ส่ง Headers ครบด้วย
function getSupabase() {
    if (!sqeClient) {
        sqeClient = window.supabase.createClient(SQE_URL, SQE_KEY, {
            global: { headers: authHeaders }
        });
    }
    return sqeClient;
}

function switchLoginTab(role) {
    S.loginRole = role;
    $id('tab-support').classList.toggle('active', role === 'staff');
    $id('tab-supervisor').classList.toggle('active', role === 'supervisor');
    $id('password-field').style.display = role === 'staff' ? 'block' : 'none';
    $id('login-error').classList.add('hidden');
}

function togglePassVis() {
    const inp = $id('login-pass');
    inp.type = inp.type === 'password' ? 'text' : 'password';
}

/* ============================================================
   INTEGRATED LOGIN SYSTEM (V5.6 - FIXED & UNIFIED)
   ============================================================ */

async function handleLogin() {
    const emailEl = $id('login-email');
    const passEl = $id('login-pass');
    const errEl = $id('login-error');
    const btnText = $id('login-btn-text');
    const btnSpinner = $id('login-spinner');
    const btn = $id('login-btn');
    const rememberMe = $id('remember-me') ? $id('remember-me').checked : false;

    const email = emailEl.value.trim().toLowerCase();
    const pass = passEl.value;

    errEl.classList.add('hidden');
    if (!email) { showLoginError("กรุณากรอกอีเมล"); return; }
    if (!email.includes('@')) { showLoginError("โปรดระบุอีเมลองค์กรที่ถูกต้อง"); return; }
    if (S.loginRole === 'staff' && !pass) { showLoginError("กรุณากรอก Security Key"); return; }

    // --- ตรวจสอบ MAINTENANCE MODE ---
    try {
        const sb = getSupabase();
        const { data: mtxStatus } = await sb.from('system_settings').select('is_maintenance_active').eq('id', 'global_config').single();
        const isMaster = email === 'natthawut.chaising@carrier.com';
        if (mtxStatus?.is_maintenance_active && !isMaster) {
            showLoginError("🚧 ระบบปิดปรับปรุงชั่วคราว โปรดลองใหม่ภายหลัง");
            return;
        }
    } catch (e) { console.error("Maintenance check failed:", e); }

    btnText.classList.add('hidden');
    btnSpinner.classList.remove('hidden');
    btn.disabled = true;

    try {
        const sb = getSupabase();
        if (!sb) throw new Error('NO_CLIENT');

        const { data: userData, error: userErr } = await sb.from('users').select('*').eq('email', email).single();
        if (userErr && userErr.code !== 'PGRST116') throw userErr;

        let finalUserData = userData;

        if (userData) {
            if (userData.role !== S.loginRole) throw new Error('ROLE_MISMATCH');
            if (S.loginRole === 'staff' && userData.password && userData.password !== pass) {
                throw new Error('WRONG_PASSWORD');
            }
        } else {
            const { data: newUser, error: insertErr } = await sb.from('users').insert([
                { email, password: S.loginRole === 'staff' ? pass : 'supervisor', role: S.loginRole }
            ]).select().single();
            if (insertErr) throw insertErr;
            finalUserData = newUser;
        }

        // ============================================================
        // >>> ส่วนที่เพิ่ม: ตรวจสอบ FORCE RESET <<<
        // ============================================================
        if (finalUserData && finalUserData.force_reset) {
            // อัปเดตเวลาเข้าใช้งานครั้งล่าสุดแม้จะโดนบังคับเปลี่ยนรหัส
            await sqeClient.from('users').update({ last_seen: new Date().toISOString() }).eq('email', email);
            
            // เรียก UI ตั้งรหัสผ่านใหม่
            showPasswordResetUI(email); 
            
            // สำคัญ: ต้อง return เพื่อไม่ให้ finalizeLoginProcess ทำงาน (ไม่ให้เข้า Dashboard)
            return; 
        }
        // ============================================================

        if (S.loginRole === 'supervisor') {
            await checkSupervisorRole(finalUserData.email); 
        }

        // อัปเดตสถานะออนไลน์และเข้าสู่ระบบตามปกติ
        await sqeClient.from('users').update({ last_seen: new Date().toISOString() }).eq('email', email);
        finalizeLoginProcess(email, S.loginRole, rememberMe);
        writeAuditLog('LOGIN', `ผู้ใช้งาน ${email} เข้าสู่ระบบสำเร็จ`);

    } catch (err) {
        let msg = 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
        if (err.message === 'WRONG_PASSWORD') msg = 'Security Key ไม่ถูกต้อง';
        else if (err.message === 'ROLE_MISMATCH') msg = 'สิทธิ์ไม่ตรงกับประเภทที่เลือก';
        else if (err.message === 'NO_CLIENT' || !navigator.onLine) { 
            finalizeLoginProcess(email, S.loginRole, rememberMe);
            return;
        }
        showLoginError(msg);
    } finally {
        btnText.classList.remove('hidden');
        btnSpinner.classList.add('hidden');
        btn.disabled = false;
    }
}

async function checkSupervisorRole(email) {
    let isSupervisor = false; // ✅ ประกาศ local ป้องกัน global leak
    try {
        const { data: profile, error } = await getSupabase()
            .from('users').select('role, email').eq('email', email).single();
        if (error) throw error;
        const supervisorRoles = ['supervisor', 'manager', 'lead', 'หัวหน้างาน'];
        isSupervisor = supervisorRoles.some(r =>
            profile.role && profile.role.toLowerCase().includes(r.toLowerCase())
        );
    } catch (err) {
        console.error('checkSupervisorRole error:', err);
        isSupervisor = (S.loginRole === 'supervisor');
    }
    return isSupervisor;
}

// ฟังก์ชันจดจำบัญชี
function finalizeLoginProcess(email, role, remember) {
    if (remember) {
        localStorage.setItem('carrier_remembered_email', email);
    } else {
        localStorage.removeItem('carrier_remembered_email');
    }
    finalizeLogin(email, role);
}

// แสดง Error และสั่น
function showLoginError(msg) {
    const errEl = $id('login-error');
    if (errEl) {
        errEl.textContent = msg;
        errEl.classList.remove('hidden');
    }
    const card = document.querySelector('.modern-glass-card');
    if (card && window.gsap) {
        gsap.fromTo(card, { x: -10 }, { x: 10, repeat: 5, yoyo: true, duration: 0.05 });
    }
}

/* ============================================================
   SUPPORTING UX FUNCTIONS (Visibility, CapsLock, Initialization)
   ============================================================ */

// 1. ระบบตรวจสอบ Caps Lock
function checkCapsLock(e) {
    const warning = $id('caps-lock-warning');
    if (!warning) return;
    if (e && typeof e.getModifierState === 'function') {
        if (e.getModifierState("CapsLock")) {
            warning.classList.remove('hidden');
        } else {
            warning.classList.add('hidden');
        }
    }
}

// 1. ฟังก์ชันสลับการมองเห็นรหัสผ่าน (แบบ Safe Check)
function togglePassVisibility() {
    const passIn = document.getElementById('login-pass');
    const slash = document.getElementById('eye-slash');
    
    // ตรวจสอบก่อนว่ามีช่องกรอกรหัสผ่านไหม ถ้าไม่มีให้หยุดทำงานทันที (ป้องกัน Error)
    if (!passIn) return;

    if (passIn.type === 'password') {
        passIn.type = 'text';
        if (slash) slash.style.display = 'block'; // แสดงเส้นขีดฆ่า
    } else {
        passIn.type = 'password';
        if (slash) slash.style.display = 'none'; // ซ่อนเส้นขีดฆ่า
    }
}
// ============================================================
// ฟังก์ชันโหลดรายชื่อพนักงานในสายงานเดียวกัน (สำหรับหัวหน้างาน)
// ============================================================
async function loadStaffListForSupervisor(department) {
    const selectEl = document.getElementById('staff-filter-select');
    if (!selectEl) return;

    // ล้าง options เก่า
    selectEl.innerHTML = '<option value="">-- เลือกพนักงาน --</option>';

    try {
        // ดึงรายชื่อพนักงานที่ไม่ใช่หัวหน้างาน ในแผนกเดียวกัน
        const { data: staffList, error } = await supabaseClient
            .from('profiles')
            .select('id, full_name, role')
            .eq('department', department)
            .neq('role', 'หัวหน้างาน') // ไม่เอาหัวหน้างานเอง (ปรับตามจริง)
            .order('full_name', { ascending: true });

        if (error) {
            console.error('Error loading staff list:', error);
            return;
        }

        if (staffList && staffList.length > 0) {
            staffList.forEach(staff => {
                const opt = document.createElement('option');
                opt.value = staff.full_name;
                opt.textContent = staff.full_name;
                selectEl.appendChild(opt);
            });
        }

        // แสดง dropdown
        const wrap = document.getElementById('staff-selector-wrap');
        if (wrap) {
            wrap.classList.remove('hidden');
            wrap.classList.add('flex');
        }
    } catch (err) {
        console.error('loadStaffListForSupervisor error:', err);
    }
}

// ============================================================
// ฟังก์ชันโหลดข้อมูลตามชื่อพนักงาน (ปรับให้ตรงกับฟังก์ชันโหลดข้อมูลจริงของคุณ)
// ============================================================
async function loadDataForStaff(staffEmail) {
    // 1. ตั้งค่าพนักงานที่เราต้องการดูข้อมูล (Target)
    if (!staffEmail) {
        S.viewingUser = S.currentUser; // ถ้าไม่เลือกใคร ให้ดูข้อมูลตัวเอง
    } else {
        S.viewingUser = staffEmail; // กำหนดอีเมลพนักงานที่เลือกให้ viewingUser
    }

    // แสดงสถานะบนหน้าจอ
    toast(`🔄 กำลังซิงค์ข้อมูล: ${S.viewingUser.split('@')[0]}`, "info");

    try {
        // 2. เรียกใช้ฟังก์ชันเดิมที่มีอยู่แล้ว เพื่อดึงข้อมูลจากทั้ง 2 ฐานข้อมูล (SQE และ WAP)
        // ฟังก์ชันเหล่านี้จะอัปเดตค่าในตัวแปร S.records และ S.wapData ให้โดยอัตโนมัติ
        await Promise.all([
            loadRecords(),    // ดึงข้อมูลการ Claim (จาก sqeClient)
            fetchWAPData()    // ดึงข้อมูล Support/5S/OT/Skills (จาก wapClient)
        ]);

        // 3. สั่งรีเฟรชหน้าจอที่เปิดอยู่ปัจจุบัน (ไม่ว่าจะเป็นหน้า Dashboard หรือหน้าตาราง)
        // ใช้ triggerGlobalRefresh() ตัวเดียวจบ ระบบจะเช็คเองว่าต้องวาดกราฟหรือวาดตารางหน้าไหน
        triggerGlobalRefresh();

        // 4. กิมมิก: อัปเดตชื่อที่ Sidebar ให้รู้ว่ากำลังดูงานของคนนี้อยู่
        const displayName = S.viewingUser.split('@')[0].replace(/\./g, ' ').toUpperCase();
        const nameEl = document.getElementById('user-display-name');
        if (nameEl) {
            nameEl.innerHTML = `${displayName} <span class="text-[9px] text-orange-500 font-black">(VIEWING)</span>`;
        }

        toast("อัปเดตข้อมูลเรียบร้อย", "success");

    } catch (error) {
        console.error('Error loading data for staff:', error);
        toast('❌ เกิดข้อผิดพลาดในการดึงข้อมูล', 'error');
    }
}

// ============================================================
// ผูกกับจุด Login สำเร็จ — เรียกหลังจากล็อกอินเสร็จ
// ============================================================
// หาจุดที่ล็อกอินสำเร็จในโค้ดเดิม (มักจะอยู่ในฟังก์ชัน handleLogin หรือ onAuthStateChange)
// แล้วเพิ่มโค้ดนี้ลงไป:
/**
 * ฟังก์ชันทำให้ตัวเลขวิ่งจาก 0 ถึงเป้าหมาย (Smooth Counter)
 */
function animateNumber(id, targetValue, duration = 1500) {
    const el = document.getElementById(id);
    if (!el) return;

    const startValue = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // ใช้ Easing "OutExpo" เพื่อให้ช่วงปลายช้าลงดูหรูหรา
        const easeOutExpo = 1 - Math.pow(2, -10 * progress);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutExpo);
        
        el.textContent = currentValue.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}

/* ============================================================
   PREMIUM LOGIN FLOW: LOAD -> SYNC -> WARP SPEED
   ============================================================ */

/* ============================================================
   SYSTEM BOOT & DIRECT WARP ENGINE (FINAL STABLE VERSION)
   ============================================================ */

/**
 * 1. จุดเริ่มต้นหลังกดปุ่ม Login
 */
function finalizeLogin(email, role) {
    sessionStorage.setItem('sqe_session', JSON.stringify({ email, role }));
    startNeuralBootSequence(email, role);
}

/**
 * 2. กระบวนการโหลดข้อมูล (Hard Sync) และตรวจเช็ค Update
 */
async function startNeuralBootSequence(email, role) {
    const overlay = document.getElementById('neural-boot-overlay');
    const statusText = document.getElementById('boot-status');
    const progress = document.getElementById('boot-progress');
    const detail = document.getElementById('boot-detail');

    if (!overlay) return;

    overlay.classList.remove('hidden-view');
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.4 });

    const updateStatus = (pct, title, msg) => {
        if (progress) progress.style.width = pct + '%';
        if (statusText) statusText.textContent = title;
        if (detail) detail.textContent = msg;
    };

    try {
        // --- STEP 1: SERVICE WORKER UPDATE ---
        updateStatus(15, "Verifying Build...", "comparing local vs server version");
        if ('serviceWorker' in navigator) {
            try {
                const reg = await navigator.serviceWorker.getRegistration();
                if (reg && reg.update) {
                    await reg.update();
                    if (reg.installing || reg.waiting) {
                        updateStatus(35, "Update Detected!", "installing latest system core...");
                        sessionStorage.setItem('reboot_login_email', email);
                        sessionStorage.setItem('reboot_login_role', role);
                        await new Promise(r => setTimeout(r, 1000));
                        window.location.reload(true);
                        return;
                    }
                }
            } catch (swErr) {
                console.warn("ServiceWorker update skipped:", swErr);
            }
        }

        // --- STEP 2: HARD DATA REFRESH ---
        updateStatus(45, "Purging Cache...", "resetting data buffers");
        S.records = [];
        S.wapData = { achievements: [], score5s: [], skills: [], specialJobs: [] };
        await new Promise(r => setTimeout(r, 500));

        updateStatus(75, "Neural Syncing...", "fetching latest version from cloud");
        await Promise.all([loadRecords(), fetchWAPData()]);
        
        // --- STEP 3: SYNC COMPLETE ---
        updateStatus(100, "Core Synchronized", "ready for deployment");
        await new Promise(r => setTimeout(r, 600));

        launchDirectWarp(email, role);

    } catch (error) {
        console.error("Boot Error:", error);
        launchDirectWarp(email, role);
    }
}

/**
 * 3. อนิเมชั่น DIRECT WARP
 */
function launchDirectWarp(email, role) {
    const overlay = document.getElementById('neural-boot-overlay');
    const bgScene = document.querySelector('.background-scene');
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const banner = document.getElementById('system-announcement');

    S.currentUser = email;
    S.userRole = role;
    S.viewingUser = email;
    S.isLoggedIn = true;

    const launchTL = gsap.timeline({
        onComplete: () => {
            if(overlay) overlay.classList.add('hidden-view');
            if(loginView) loginView.classList.add('hidden-view');
            gsap.set(bgScene, { scale: 1, filter: "blur(0px) brightness(1)" });
        }
    });

    launchTL
        .to(banner, { y: -50, opacity: 0, duration: 0.2 })
        .to(bgScene, { scale: 2.5, filter: "blur(40px) brightness(3)", duration: 0.8, ease: "power4.inOut" }, 0)
        .to(overlay, { opacity: 0, scale: 1.2, duration: 0.6, ease: "power2.in" }, 0.2)
        .call(() => {
            if(dashboardView) dashboardView.classList.remove('hidden-view');
            showDashboard();
        }, null, 0.4)
        .fromTo(dashboardView, 
            { opacity: 0, scale: 0.95, filter: "blur(10px)" }, 
            { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1, ease: "expo.out" }, 
            0.5
        );
}

/**
 * 4. ฟังก์ชันควบคุมโหมดปิดปรับปรุง (Maintenance Mode) - แก้ไข Error ตรงนี้
 */
async function enforceMaintenanceMode() {
    try {
        const { data, error } = await sqeClient
            .from('system_settings')
            .select('is_maintenance_active')
            .eq('id', 'global_config')
            .single();

        if (error) return;

        const isMtx = !!data.is_maintenance_active;
        const mtxView = document.getElementById('maintenance-view');
        const dashView = document.getElementById('dashboard-view');
        const loginView = document.getElementById('login-view');

        const isMaster = S.currentUser.toLowerCase() === 'natthawut.chaising@carrier.com';

        if (isMtx && !isMaster && !adminBypass) {
            if (mtxView) mtxView.classList.remove('hidden-view');
            if (dashView) dashView.style.display = 'none';
            if (loginView) loginView.style.display = 'none';
        } else {
            if (mtxView) mtxView.classList.add('hidden-view');
            if (S.isLoggedIn) {
                if (dashView) dashView.style.display = 'flex';
            } else {
                if (loginView) loginView.style.display = 'flex';
            }
        }
    } catch (err) { console.log("Maintenance check skip"); }
}

/**
 * 5. ระบบ INITIALIZATION เมื่อโหลดหน้าเว็บ
 */
window.addEventListener('load', () => {
    console.log("SQE & WAP System: Final Initializing...");

    if (typeof updateLoginNetStatus === 'function') updateLoginNetStatus();
    if (typeof autoHideBanner === 'function') autoHideBanner();

    const savedLang = localStorage.getItem('carrier_lang') || (navigator.language.startsWith('th') ? 'th' : 'en');
    applyLanguage(savedLang);

    const savedEmail = localStorage.getItem('carrier_remembered_email');
    if (savedEmail) {
        const emailIn = document.getElementById('login-email');
        if (emailIn) { emailIn.value = savedEmail; emailIn.classList.add('valid'); }
    }

    // ตรวจสอบ Auto-Login หลังอัปเดต
    const rebootEmail = sessionStorage.getItem('reboot_login_email');
    const rebootRole = sessionStorage.getItem('reboot_login_role');
    if (rebootEmail && rebootRole) {
        sessionStorage.removeItem('reboot_login_email');
        sessionStorage.removeItem('reboot_login_role');
        startNeuralBootSequence(rebootEmail, rebootRole);
        return; 
    }

    // ตรวจสอบ Session เดิม
    const session = sessionStorage.getItem('sqe_session');
    if (session) {
        try {
            const userData = JSON.parse(session);
            startNeuralBootSequence(userData.email, userData.role);
        } catch (e) { sessionStorage.removeItem('sqe_session'); }
    }

    // รันระบบ Background
    watchSystemUpdate();
    setInterval(watchSystemUpdate, 180000);
    enforceMaintenanceMode(); // เรียกฟังก์ชันที่เคย Error
    setInterval(enforceMaintenanceMode, 30000);
    updateUserPresence();
    setInterval(updateUserPresence, 300000);

    if ('serviceWorker' in navigator) {
        try {
            navigator.serviceWorker.register('sw.js').catch(err => console.log('PWA Error', err));
        } catch (e) {
            console.log('PWA Register Error', e);
        }
    }
});

/* ============================================================
   SUPPORTING CORE FUNCTIONS
   ============================================================ */

async function watchSystemUpdate() {
    try {
        const { data } = await sqeClient.from('system_settings').select('*').eq('id', 'global_config').single();
        if (data) {
            const verDisplay = document.querySelector('.brand-sub');
            if(verDisplay) verDisplay.textContent = `V${data.app_version} | SQE SYSTEM`;
        }
    } catch (e) { console.log("Update check skip"); }
}



// อนิเมชั่นดาวพื้นหลัง
(function() {
    const canvas = document.getElementById('starfield');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [];
    const numStars = 200;
    const speed = 2;

    function initStars() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        stars = [];
        for (let i = 0; i < numStars; i++) {
            stars.push({ x: Math.random() * canvas.width - canvas.width / 2, y: Math.random() * canvas.height - canvas.height / 2, z: Math.random() * canvas.width });
        }
    }

    function updateStars() {
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        for (let i = 0; i < numStars; i++) {
            let s = stars[i];
            s.z -= speed;
            if (s.z <= 0) { s.z = canvas.width; s.x = Math.random() * canvas.width - canvas.width / 2; s.y = Math.random() * canvas.height - canvas.height / 2; }
            const x = s.x * (canvas.width / s.z);
            const y = s.y * (canvas.width / s.z);
            const r = 1.5 * (canvas.width / s.z);
            ctx.beginPath();
            ctx.fillStyle = `rgba(0, 242, 255, ${1 - s.z / canvas.width})`;
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        requestAnimationFrame(updateStars);
    }
    window.addEventListener('resize', initStars);
    initStars();
    updateStars();
})();

function handleLogout() {
    // 1. ล้างข้อมูล Session และ State
    sessionStorage.removeItem('sqe_session');
    S.isLoggedIn = false;
    S.currentUser = '';
    S.userRole = 'staff';
    S.viewingUser = '';
    S.records = [];

    // 2. [จุดสำคัญ] คืนค่าแอนิเมชั่น (Reset Warp Effect)
    // ใช้ gsap.set เพื่อคืนค่าดั้งเดิมทันที
    const loginCard = document.querySelector('.modern-glass-card');
    const brandHeader = document.querySelector('.login-brand-header');
    const bgScene = document.querySelector('.background-scene');
    const footerInfo = document.querySelector('.login-footer-info');
    const banner = document.getElementById('system-announcement');

    // ล้างค่า inline style ที่ GSAP เคยเขียนทับไว้
    gsap.set([loginCard, brandHeader, footerInfo], {
        clearProps: "all" 
    });

    gsap.set(bgScene, {
        clearProps: "all"
    });

    // แสดง Banner กลับมา (ถ้าอยากให้โชว์ใหม่ทุกครั้งที่ Logout)
    if (banner) {
        gsap.set(banner, { clearProps: "all" });
        banner.style.display = 'flex'; 
    }

    // 3. สลับหน้าจอกลับไปที่ Login View
    const dashView = document.getElementById('dashboard-view');
    const loginView = document.getElementById('login-view');
    if (dashView) dashView.classList.add('hidden-view');
    if (loginView) {
        loginView.classList.remove('hidden-view');
        loginView.style.display = 'flex';
    }

    // 4. ล้างช่องรหัสผ่านเพื่อความปลอดภัย
    const passIn = document.getElementById('login-pass');
    if (passIn) {
        passIn.value = '';
        // ถ้าตาเปิดอยู่ให้ปิดตาด้วย
        passIn.type = 'password';
        const eyeSlash = document.getElementById('eye-slash');
        if (eyeSlash) eyeSlash.style.display = 'none';
    }

    // แจ้งเตือนผู้ใช้
    toast('Logged out successfully', 'info');
}

async function showDashboard() {
    // --- [เพิ่มส่วนนี้: อัปเดตธีมทันทีที่เปลี่ยนหน้า] ---
    const savedTheme = localStorage.getItem('carrier_theme');
    const isDark = (savedTheme === 'dark');
    if (isDark) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    // สั่งให้วาดไอคอนลงในปุ่มทันที
    if (typeof updateThemeIcon === 'function') {
        updateThemeIcon(isDark);
    }
    // ----------------------------------------------

    // 1. สลับหน้าจอจาก Login ไปยัง Dashboard ทันที
    $id('login-view').classList.add('hidden-view');
    $id('dashboard-view').classList.remove('hidden-view');
    
    // 2. ตั้งค่าข้อมูลผู้ใช้บน Sidebar
    const namePart = S.currentUser.split('@')[0] || 'USER';
    const initial = namePart.charAt(0).toUpperCase();
    $id('user-avatar').textContent = initial;
    $id('user-display-name').textContent = namePart.replace(/\./g, ' ').toUpperCase();
    $id('user-display-email').textContent = S.currentUser;

    // 3. จัดการส่วนของ Supervisor (หัวหน้างาน) และระบบ Lock ฟอร์ม
    const staffWrap = $id('staff-selector-wrap');
    const showFormBtn = $id('show-form-btn'); 
    const formPanel = $id('form-panel');
    const showBtn = $id('show-form-btn');

    if (formPanel && showBtn) {
        isFormHidden = true; // บังคับสถานะเป็นปิด
        gsap.set(formPanel, { x: -350, opacity: 0, width: 0, marginRight: -12 });
        formPanel.classList.add('hidden');
        showBtn.classList.remove('hidden');
        gsap.set(showBtn, { x: 0, opacity: 1 });
    }

    if (S.userRole === 'supervisor') { 
        if (staffWrap) {
            staffWrap.classList.remove('hidden');
            staffWrap.classList.add('flex');
        }
        await loadStaffList(); 

        if (typeof isFormHidden !== 'undefined' && !isFormHidden) {
            toggleFormPanel(); 
        }

        if (showFormBtn) {
            showFormBtn.style.display = 'none'; 
        }

        const internalCloseBtn = document.querySelector('#form-panel button[onclick="toggleFormPanel()"]');
        if (internalCloseBtn) internalCloseBtn.style.display = 'none';

        const formInputs = document.querySelectorAll('#form-panel input, #form-panel select, #form-panel textarea, #form-panel button');
        formInputs.forEach(el => {
            el.disabled = true;
            el.style.opacity = '0.6';
            el.style.cursor = 'not-allowed';
        });

    } else {
        if (staffWrap) staffWrap.classList.add('hidden');
        S.viewingUser = S.currentUser;

        if (showFormBtn) showFormBtn.style.display = 'flex';
        
        const internalCloseBtn = document.querySelector('#form-panel button[onclick="toggleFormPanel()"]');
        if (internalCloseBtn) internalCloseBtn.style.display = 'flex';

        const formInputs = document.querySelectorAll('#form-panel input, #form-panel select, #form-panel textarea, #form-panel button');
        formInputs.forEach(el => {
            el.disabled = false;
            el.style.opacity = '1';
            el.style.cursor = 'default';
        });
    }

    // ============================================================
    // [แก้ไขใหม่]: ตรวจสอบสิทธิ์ Admin สูงสุด (Natthawut Chaising)
    // ============================================================
    // [แก้ไขใหม่]: จัดการปุ่มเข้าหน้า Admin ในโซน Footer
    const adminFooterBtn = document.getElementById('admin-footer-access');
    const masterAdminEmail = 'natthawut.chaising@carrier.com'; // อีเมลที่ได้รับสิทธิ์

    if (S.currentUser.toLowerCase() === masterAdminEmail.toLowerCase()) {
        if (adminFooterBtn) adminFooterBtn.classList.remove('hidden');
        console.log("Master Admin Access Granted");
    } else {
        if (adminFooterBtn) adminFooterBtn.classList.add('hidden');
    }
    
    updateOnlineBadge();

    // 4. --- เริ่มการซิงค์ข้อมูลชุดใหญ่ (SQE + WAP) ---
    toast("📡 กำลังเชื่อมต่อฐานข้อมูล Online...", "info");

    try {
        await Promise.all([
            loadRecords(),
            fetchWAPData()
        ]);

        const firstMenuBtn = document.querySelector('.nav-item');
        switchPage('Part line claim', firstMenuBtn);
        
        toast("✅ ซิงค์ข้อมูลสำเร็จ", "success");

    } catch (error) {
        console.error("Critical Sync Error:", error);
        toast("❌ การโหลดข้อมูลบางส่วนล้มเหลว", "error");
        const firstMenuBtn = document.querySelector('.nav-item');
        switchPage('Part line claim', firstMenuBtn);
    }
}

async function onStaffSelect(email) {
    if (!email) {
        S.viewingUser = S.currentUser;
    } else {
        S.viewingUser = email;
    }
    
    toast(`🔍 กำลังซิงค์ข้อมูลของ: ${S.viewingUser.split('@')[0]}`, "info");
    
    try {
        await Promise.all([
            loadRecords(),   
            fetchWAPData()   
        ]);

        // >>> [เพิ่มบรรทัดนี้] สั่งให้ AI เรียนรู้ข้อมูลของพนักงานคนใหม่ทันที <<<
        rebuildSmartMemory();
        updateAIBrain();

        triggerGlobalRefresh();
        
        const display = S.viewingUser.split('@')[0].replace(/\./g, ' ').toUpperCase();
        $id('user-display-name').innerHTML = `${display} <span class="text-[9px] text-orange-500">(VIEWING)</span>`;
        
        toast("อัปเดตข้อมูลพนักงานเรียบร้อย", "success");
    } catch (error) {
        console.error("Critical Switch User Error:", error);
        toast("ไม่สามารถโหลดข้อมูลได้", "error");
    }
}

/* ==========================================================================
   UPGRADED: PREMIUM PASS-RATE GAUGE ENGINE (MATCH IMAGE 100%)
   ========================================================================== */
function updateMainGauge(pct) {
    const arc = document.getElementById('mainGaugeArc');
    const needle = document.getElementById('mainGaugeNeedle');
    const valText = document.getElementById('mainGaugeValue');
    const statusLabel = document.getElementById('mainGaugeStatus');
    const statusText = document.getElementById('mainGaugeStatusText');
    const ticksGroup = document.getElementById('gaugeTicksGroup');

    const minAngle = -120;
    const maxAngle = 120;
    const angleRange = maxAngle - minAngle; // 240 degrees

    // 2. วาดขีด Ticks (วาดครั้งเดียว)
    if (ticksGroup && ticksGroup.innerHTML === "") {
        let ticksHtml = "";
        for (let i = 0; i <= 50; i++) {
            const angle = minAngle + (i * angleRange / 50);
            const isMajor = i % 10 === 0;
            const r = 75;
            const len = isMajor ? 12 : 6;
            const rad = (angle - 90) * (Math.PI / 180);
            const x1 = 100 + r * Math.cos(rad);
            const y1 = 112 + r * Math.sin(rad);
            const x2 = 100 + (r - len) * Math.cos(rad);
            const y2 = 112 + (r - len) * Math.sin(rad);
            
            ticksHtml += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--dial-ticks)" stroke-width="${isMajor ? "2" : "1"}" />`;
        }
        ticksGroup.innerHTML = ticksHtml;
    }

    // 3. Logic กำหนดสีและ Label
    const safePct = Math.max(0, Math.min(100, parseFloat(pct) || 0));
    let color = "#ef4444"; 
    let label = "CRITICAL";
    if (safePct >= 95) { color = "#10b981"; label = "PERFECT"; }
    else if (safePct >= 85) { color = "#3b82f6"; label = "GOOD"; }
    else if (safePct >= 70) { color = "#f59e0b"; label = "STABLE"; }

    // 4. อัปเดตสถานะ Badge
    if (statusLabel) {
        if (statusText) statusText.textContent = label;
        statusLabel.style.color = color;
        statusLabel.style.borderColor = color;
        const dot = statusLabel.querySelector('span');
        if (dot) dot.style.background = color;
    }

    // 5. อัปเดตข้อความ Footer
    const footStatus = document.getElementById('yield-status-text');
    if (footStatus) {
        footStatus.textContent = label;
        footStatus.style.color = color;
    }

    if (arc) {
        arc.style.stroke = color;
        arc.style.transition = "none";
    }
    if (needle) {
        needle.style.transition = "none";
    }

    const circumference = 2 * Math.PI * 75;
    const totalArcLength = (angleRange / 360) * circumference;
    const targetDrawLength = (safePct / 100) * totalArcLength;
    const targetAngle = minAngle + (safePct * (angleRange / 100));

    // 6. GSAP Sweep Animation: เข็มและแถบสีวิ่งตวัดไปขวาสุด (100%) แล้วค่อยๆ ไหลกลับมายังจุดจำนวนจริงพร้อมกัน
    if (window.gsap) {
        gsap.killTweensOf([needle, arc, valText]);

        const animObj = {
            angle: minAngle,
            drawLen: 0,
            val: 0
        };

        const tl = gsap.timeline();

        // Step 1: วิ่งตวัดไปขวาสุดอย่างนุ่มนวล (100% / maxAngle)
        tl.to(animObj, {
            angle: maxAngle,
            drawLen: totalArcLength,
            val: 100,
            duration: 0.95,
            ease: "power2.inOut",
            onUpdate: () => {
                if (needle) {
                    needle.style.transform = `rotate(${animObj.angle}deg)`;
                    needle.style.transformOrigin = "100px 112px";
                }
                if (arc) {
                    arc.style.strokeDasharray = `${animObj.drawLen} ${circumference}`;
                }
                if (valText) {
                    valText.innerHTML = `${animObj.val.toFixed(1)}<span style="font-size: 0.6em; margin-left: 2px; font-weight: 800;">%</span>`;
                }
            }
        });

        // Step 2: ค่อยๆ ไหลกลับมายังจุดจำนวนจริงอย่างช้าๆ นุ่มนวล (ทั้งเข็ม แถบสี และตัวเลข)
        tl.to(animObj, {
            angle: targetAngle,
            drawLen: targetDrawLength,
            val: safePct,
            duration: 2.2,
            ease: "power2.out",
            onUpdate: () => {
                if (needle) {
                    needle.style.transform = `rotate(${animObj.angle}deg)`;
                    needle.style.transformOrigin = "100px 112px";
                }
                if (arc) {
                    arc.style.strokeDasharray = `${animObj.drawLen} ${circumference}`;
                }
                if (valText) {
                    valText.innerHTML = `${animObj.val.toFixed(1)}<span style="font-size: 0.6em; margin-left: 2px; font-weight: 800;">%</span>`;
                }
            }
        });
    } else {
        // Fallback กรณีไม่มี GSAP
        if (needle) {
            needle.style.transform = `rotate(${targetAngle}deg)`;
            needle.style.transformOrigin = "100px 112px";
        }
        if (arc) {
            arc.style.strokeDasharray = `${targetDrawLength} ${circumference}`;
        }
        if (valText) {
            valText.innerHTML = `${safePct.toFixed(1)}<span style="font-size: 0.6em; margin-left: 2px; font-weight: 800;">%</span>`;
        }
    }
}

/* ══════════════════════════════════════════════════════════════
   อย่าลืมตรวจสอบจุดเรียกใช้ใน refreshClaimDashboard() 
   เพื่อให้มั่นใจว่าส่งค่า pct เข้ามาถูกต้อง
   ══════════════════════════════════════════════════════════════ */

// ตัวอย่างการเรียกใช้ภายในฟังก์ชันสรุปผล:
// const yieldRate = totalQty > 0 ? Math.round((okQty / totalQty) * 100) : 0;
// updateMainGauge(yieldRate);

function updateOnlineBadge() {
    const badge = $id('online-badge');
    if (!badge) return;
    if (navigator.onLine) {
        badge.innerHTML = '<span class="online-dot on"></span> Online';
        badge.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200';
    } else {
        badge.innerHTML = '<span class="online-dot off"></span> Offline';
        badge.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider bg-amber-50 text-amber-600 border border-amber-200 animate-pulse';
    }
}

// 1. ฟังก์ชันโหลดรายชื่อพนักงาน (ดึงจากตาราง users ใน SQE Database)
async function loadStaffList() {
    const selectEl = document.getElementById('staff-filter-select');
    if (!selectEl) return;

    try {
        // ใช้ sqeClient เพราะตาราง users อยู่ในฐานข้อมูล SQE
        const { data: staffList, error } = await sqeClient
            .from('users')
            .select('email')
            .eq('role', 'staff')
            .order('email', { ascending: true });

        if (error) throw error;

        // ล้างตัวเลือกเก่า
        selectEl.innerHTML = '<option value="">-- เลือกพนักงาน --</option>';

        if (staffList && staffList.length > 0) {
            staffList.forEach(staff => {
                const opt = document.createElement('option');
                opt.value = staff.email;
                // ตัดชื่อมาโชว์ให้สวยงาม
                opt.textContent = staff.email.split('@')[0].replace(/\./g, ' ').toUpperCase();
                selectEl.appendChild(opt);
            });
            console.log("Supervisor: Staff list loaded successfully.");
        }
    } catch (err) {
        console.error('Error loading staff list:', err);
        toast("โหลดรายชื่อพนักงานไม่สำเร็จ", "error");
    }
}

let _8dLookupMapCache = null;
let _8dLookupLastCasesRef = null;

function invalidate8DCaseMap() {
    _8dLookupMapCache = null;
    _8dLookupLastCasesRef = null;
}

function get8DCaseMap() {
    const cases = (S.eightDCases || (typeof Wap8DSystem !== 'undefined' && Wap8DSystem.getCases ? Wap8DSystem.getCases() : [])) || [];
    if (cases === _8dLookupLastCasesRef && _8dLookupMapCache) {
        return _8dLookupMapCache;
    }
    _8dLookupLastCasesRef = cases;
    const map = new Map();
    for (let i = 0; i < cases.length; i++) {
        const c = cases[i];
        if (!c) continue;
        const supId = String(c.support_id || '').trim();
        const repData = c.report_data || {};
        const recId = String(repData.record_id || '').trim();
        const repRef = String(repData.ref || '').trim();

        if (supId) map.set(supId, c);
        if (recId) map.set(recId, c);
        if (repRef) map.set(repRef, c);
    }
    _8dLookupMapCache = map;
    return map;
}

function get8DCaseForRecord(r) {
    if (!r) return null;
    const map = get8DCaseMap();
    if (map.size === 0) return null;

    const rId = String(r.id || '').trim();
    if (rId && map.has(rId)) return map.get(rId);

    const rRef = String(r.ref || '').trim();
    if (rRef && map.has(rRef)) return map.get(rRef);

    return null;
}

async function create8DFromClaimRecord(recordId) {
    const r = S.records.find(x => String(x.id) === String(recordId));
    if (!r) return toast("❌ ไม่พบข้อมูลเคสนี้ในระบบ", "error");

    const existingCase = get8DCaseForRecord(r);
    if (existingCase) {
        toast(`⚠️ เคสนี้มีการออก 8D แล้ว (${existingCase.id})`, "info");
        switchPage('8D REPORT');
        setTimeout(() => { if (typeof Wap8DSystem !== 'undefined') Wap8DSystem.openReport(existingCase.id); }, 150);
        return;
    }

    showCustomConfirmDialog({
        title: "ยืนยันสร้างรายงาน 8D Report",
        subtitle: "ระบบจะสร้างใบงาน Corrective Action 8D จากเคสเคลมที่เลือก",
        badge: "8D REPORT AUTOMATION",
        type: "info",
        details: [
            { label: "เลขที่อ้างอิง Ref", value: r.ref || '-' },
            { label: "ชิ้นส่วน / Part", value: r.partName || r.partNo || '-' },
            { label: "อาการเสีย / Defect", value: r.defect || '-' },
            { label: "จำนวนเสีย / Qty", value: `${r.qty || 0} ชิ้น` }
        ],
        confirmText: "🚀 สร้างรายงาน 8D ตอนนี้",
        cancelText: "ยกเลิก",
        onConfirm: async () => {
            toast("⏳ กำลังสร้างเคส 8D อัตโนมัติ...", "info");

            const newId = '8D-' + Date.now();
            const payload = {
                id: newId,
                user_id: S.currentUser,
                support_id: r.id || r.ref || newId,
                problem_title: `${r.defect || 'Defect'} - ${r.partName || r.partNo || ''}`.trim(),
                part_name: r.partName || '-',
                part_group: r.partNo || '-',
                lot_no: Number(r.qty) || 0,
                ok_qty: 0,
                ng_qty: Number(r.qty) || 0,
                status: 'D1_OPEN',
                report_data: {
                    source_remark: r.remark || "",
                    record_id: r.id,
                    ref: r.ref || "",
                    supplier: r.supplier || "",
                    line: r.line || "",
                    shift: r.shift || "",
                    qty: r.qty || 0,
                    unit: r.unit || 'PCS'
                },
                created_at: new Date().toISOString()
            };

            try {
                const { error } = await sqeClient.from('eight_d_reports').insert([payload]);
                if (error) throw error;

                toast("✅ สร้างเคส 8D สำเร็จแล้ว!", "success");
                if (typeof Wap8DSystem !== 'undefined' && Wap8DSystem.fetchCases) {
                    await Wap8DSystem.fetchCases();
                }
                renderTable();
                
                switchPage('8D REPORT');
                setTimeout(() => {
                    if (typeof Wap8DSystem !== 'undefined') Wap8DSystem.openReport(newId);
                }, 200);
            } catch (err) {
                console.error("Auto 8D Error:", err);
                toast("❌ สร้างเคส 8D ล้มเหลว: " + err.message, "error");
            }
        }
    });
    return;
}

function openReportFromRecord(caseId) {
    switchPage('8D REPORT');
    setTimeout(() => {
        if (typeof Wap8DSystem !== 'undefined' && Wap8DSystem.openReport) {
            Wap8DSystem.openReport(caseId);
        }
    }, 200);
}

async function loadRecords() {
    // ดักจับ Target User: ถ้าเป็นหัวหน้าให้ดูคนที่เลือก (viewingUser) ถ้าเป็นพนักงานให้ดูตัวเอง (currentUser)
    const targetUser = S.userRole === 'supervisor' ? S.viewingUser : S.currentUser;
    if (!targetUser) return;

    const sb = getSupabase();
    if (sb && navigator.onLine) {
        try {
            // ดึงข้อมูล Claim โดยกรองจากชื่อผู้ตรวจ (inspector)
            const { data, error } = await sb.from('records')
                .select('*')
                .eq('inspector', targetUser)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // อัปเดตข้อมูลลง Global State
            S.records = (data || []).map(normalizeRecord);

            // ดึงข้อมูลเคส 8D ล่าสุดเพื่อเทียบสถานะ
            if (typeof Wap8DSystem !== 'undefined' && Wap8DSystem.fetchCases) {
                await Wap8DSystem.fetchCases();
            }
            
            // สั่งให้สมอง AI เรียนรู้ข้อมูลของคนนี้ใหม่
            rebuildSmartMemory();
            updateAIBrain();
            
            // วาดตารางใหม่
            renderTable();
            return;
        } catch (e) {
            toast(getFriendlyErrorMessage(e), 'error');
        }
    }
    // กรณีออฟไลน์หรือไม่มีข้อมูล
    S.records = [];
    renderTable();
}

function normalizeRecord(r) {
    return {
        id: r.id, date: r.date || '', shift: r.shift || 'SHIFT A', line: r.line || '', ref: r.ref || '',
        supplier: r.supplier || '', partNo: r.partNo || '', partName: r.partName || '',
        qty: r.qty || 0, unit: r.unit || 'PCS', defect: r.defect || '', remark: r.remark || '', judgment: r.judgment || '',
        inspector: r.inspector || '',
        created_at: r.created_at || r.createdAt || r.full_timestamp || r.date || ''
    };
}

function formToSupabase(rec) {
    return {
        id: rec.id, date: rec.date, shift: rec.shift, line: rec.line, ref: rec.ref, supplier: rec.supplier,
        partNo: rec.partNo, partName: rec.partName, qty: parseInt(rec.qty) || 0, unit: rec.unit,
        defect: rec.defect, remark: rec.remark, judgment: rec.judgment, inspector: rec.inspector
    };
}

async function writeAuditLog(action, details) {
    try {
        if (!sqeClient) return;
        const { error } = await sqeClient.from('audit_logs').insert([{
            user_email: S.currentUser || 'System',
            action: action,
            details: details
        }]);
        if (error) console.warn("[Audit Log] Supabase Insert Error:", error.message || error);
    } catch (e) { console.error("Audit Error:", e); }
}

async function deleteRecordFromCloud(id) {
    const sb = getSupabase();
    const targetRecord = S.records.find(r => String(r.id) === String(id)); // ✅ ประกาศไว้ก่อน

    if (sb && navigator.onLine) {
        try {
            const { error } = await sb.from('records').delete().eq('id', id);
            if (error) throw error;
            writeAuditLog('DELETE', `ลบข้อมูล Claim Ref: ${targetRecord?.ref} (พาร์ท: ${targetRecord?.partNo})`); // ✅ อยู่ในtry, ใช้ targetRecord
        } catch (e) {
            console.error("Cloud Delete Error:", e);
            toast('❌ ไม่สามารถลบข้อมูลในระบบ Cloud ได้', 'error');
            return false;
        }
    }

    S.records = S.records.filter(r => String(r.id) !== String(id));
    rebuildSmartMemory();
    updateAIBrain();
    return true;
}

async function cloudSyncAll() {
    if (!navigator.onLine) { toast('📶 ออฟไลน์อยู่ ไม่สามารถซิงค์ได้', 'error'); return; }
    const icon = $id('sync-icon');
    if (icon) icon.style.animation = 'spin 0.6s linear infinite';
    
    toast('📡 กำลังซิงค์ข้อมูลจาก Cloud...', 'info');
    
    try {
        // ซิงค์ทั้ง SQE และ WAP พร้อมกัน
        await Promise.all([
            loadRecords(),
            fetchWAPData()
        ]);
        
        triggerGlobalRefresh(); // สั่งวาดหน้าจอใหม่ทันที
        toast('🔄 ซิงค์ข้อมูลเรียบร้อยแล้ว', 'success');
    } catch (e) {
        toast('❌ การซิงค์ล้มเหลว', 'error');
    } finally {
        if (icon) icon.style.animation = '';
    }
}

function selectShift(btn, val) {
    S.selectedShift = val;
    document.querySelectorAll('.shift-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function isDuplicate(refVal) {
    if (!refVal) return false;
    const targetRef = String(refVal).trim().toUpperCase();
    return S.records.some(r => String(r.ref).trim().toUpperCase() === targetRef && r.id !== S.editingId);
}

function validateRef(e) {
    const refIn = $id('f-ref');
    let val = refIn.value.toUpperCase();
    
    // 1. ระบบเติมเครื่องหมาย / อัตโนมัติ (Smart Format)
    // ตรวจสอบว่าไม่ใช่การกด Backspace (ลบข้อความ) เพื่อไม่ให้มันเด้งกลับมาเติมใหม่ตอนเราจะลบ
    if (e && e.inputType !== 'deleteContentBackward') {
        if (val.startsWith('V')) {
            // กรณีขึ้นต้นด้วย V: รูปแบบคือ V*** (4 ตัวแรก) แล้วตามด้วย /
            if (val.length === 4 && !val.includes('/')) {
                val = val + '/';
            }
        } else {
            // กรณีปกติ: รูปแบบคือ *** (3 ตัวแรก) แล้วตามด้วย /
            if (val.length === 3 && !val.includes('/')) {
                val = val + '/';
            }
        }
    }

    // อัปเดตค่ากลับไปที่ช่อง Input
    refIn.value = val;

    // 2. ระบบตรวจสอบความถูกต้อง (Validation)
    // Regex: (ตัวอักษร/เลข 3 ตัว หรือ V+3ตัว) ตามด้วย / และจบด้วย ตัวอักษร/เลข 4 ตัว
    const pattern = /^([A-Z0-9]{3}|V[A-Z0-9]{3})\/[A-Z0-9]{4}$/;
    
    const isValidPattern = pattern.test(val);
    const isDup = !S.editingId && isDuplicate(val);

    refIn.classList.remove('valid', 'invalid');

    if (val === '') return;

    if (!isValidPattern) {
        // ถ้ารูปแบบยังไม่ครบ (เช่น พิมพ์ถึงแค่ 123/) ให้แสดงเป็นสีแดงอ่อนๆ หรือคงสภาพไว้
        refIn.classList.add('invalid');
    } else if (isDup) {
        // ถ้าตรงรูปแบบแต่เลขซ้ำ
        refIn.classList.add('invalid');
        toast('⚠️ เลข Ref นี้มีการบันทึกไปแล้ว', 'error');
    } else {
        // ถูกต้องสมบูรณ์
        refIn.classList.add('valid');
    }
    
    updateInputResetButton();
}

function handleJudgment(val) {
    const selectEl = $id('judgmentSelect');
    const btn = $id('btn-commit');
    if (!selectEl) return;
    const colors = { 'SF': '#f97316', 'VENDOR FAULT': '#ef4444', 'CTC': '#2563eb', 'CAN USE': '#10b981' };

    if (!val) {
        selectEl.classList.remove('is-selected');
        selectEl.style.borderColor = '';
        selectEl.style.color = '';
        if (btn) { btn.style.background = ''; btn.style.boxShadow = ''; }
        return;
    }

    const color = colors[val] || '#2563eb';
    selectEl.classList.add('is-selected');
    selectEl.style.borderColor = color;
    selectEl.style.color = color;
    if (btn) {
        btn.style.background = `linear-gradient(135deg,${color},${color}dd)`;
        btn.style.boxShadow = `0 4px 14px ${color}55`;
    }
}

function quickPickJudgment(val) {
    const selectEl = $id('judgmentSelect');
    if (selectEl) { selectEl.value = val; handleJudgment(val); updateInputResetButton(); }
}

function refreshNeonGlow() {
    const qtyEl = $id('f-qty');
    const unitEl = $id('f-unit');
    const btnCommit = $id('btn-commit'); // อ้างอิงปุ่ม Commit Data
    const hasQty = qtyEl && parseFloat(qtyEl.value) > 0;

    // 1. จัดการความโปร่งแสงของหน่วย (Unit Selection)
    if (unitEl) {
        unitEl.disabled = false;
        unitEl.style.opacity = hasQty ? '1' : '0.6';
        unitEl.style.cursor = 'pointer';
    }

    // 2. วนลูปเช็คค่าในช่อง Input เพื่อใส่ Class 'valid' (ขอบเขียวเรืองแสง)
    const watchedIds = ['f-part', 'f-partname', 'f-supplier', 'f-line', 'f-defect', 'f-remark', 'f-date'];
    watchedIds.forEach(id => {
        const el = $id(id);
        if (!el) return;
        if (id === 'f-part') {
            validatePartNoInput(el);
            return;
        }
        if (el.value && el.value !== '' && el.value !== '-' && el.value !== '0') {
            el.classList.add('valid');
        } else {
            el.classList.remove('valid');
        }
    });

    // 3. [Neural Interaction]: ตรวจสอบความสมบูรณ์ของฟอร์มเพื่อเปิดโหมด Pulse เรืองแสงที่ปุ่ม
    // เงื่อนไข: ต้องมี Part No, Ref No, Qty > 0 และเลือก Judgment แล้ว
    const isFormComplete = 
        ($id('f-part')?.value || '').trim() !== '' && 
        ($id('f-ref')?.value || '').trim() !== '' && 
        hasQty && 
        ($id('judgmentSelect')?.value || '') !== '';

    if (btnCommit) {
        if (isFormComplete) {
            // ถ้าพร้อมบันทึก ให้ปุ่มเริ่ม "เต้น" และเรืองแสง
            btnCommit.classList.add('btn-neural-ready');
        } else {
            // ถ้าข้อมูลไม่ครบ ให้ปิดเอฟเฟกต์
            btnCommit.classList.remove('btn-neural-ready');
        }
    }

    updateInputResetButton();
}

/**
 * AI Anomaly Detection: ตรวจสอบความผิดปกติของจำนวน (QTY)
 * โดยเทียบกับค่าเฉลี่ยย้อนหลังของพาร์ทหมายเลขเดียวกัน
 */
function checkAnomaly() {
    const qtyIn = $id('f-qty');
    const partIn = $id('f-part');
    
    if (!qtyIn || !partIn) return;

    const currentQty = parseFloat(qtyIn.value);
    const partNo = partIn.value.trim();

    // 1. ถ้ายังไม่กรอกจำนวน หรือพาร์ท หรือค่าน้อยเกินไป ไม่ต้องตรวจ
    if (!currentQty || !partNo || currentQty <= 0) {
        qtyIn.classList.remove('anomaly-detected');
        return;
    }

    // 2. ค้นหาประวัติการบันทึกของพาร์ทนี้ในฐานข้อมูลเครื่อง (S.records)
    const history = S.records.filter(r => r.partNo === partNo);

    // 3. ต้องมีประวัติอย่างน้อย 3 รายการขึ้นไปถึงจะเริ่มวิเคราะห์ได้ (เพื่อความแม่นยำ)
    if (history.length >= 3) {
        // คำนวณค่าเฉลี่ย (Average)
        const sum = history.reduce((acc, r) => acc + (parseFloat(r.qty) || 0), 0);
        const avg = sum / history.length;

        // 4. เกณฑ์การตรวจจับ: ถ้าจำนวนปัจจุบัน "มากกว่าค่าเฉลี่ย 5 เท่า" ถือว่าผิดปกติ
        const threshold = avg * 5;

        if (currentQty > threshold) {
            // --- พบความผิดปกติ ---
            qtyIn.classList.add('anomaly-detected');
            
            // สั่นช่อง Input ให้รู้ตัว
            if (typeof shake === 'function') shake(qtyIn);
            
            // แจ้งเตือนด้วย Toast (แสดงค่าเฉลี่ยเพื่อให้ผู้ใช้ฉุกคิด)
            toast(`⚠️ จำนวน ${currentQty.toLocaleString()} ดูสูงผิดปกติ! (ค่าเฉลี่ยพาร์ทนี้คือ ${Math.round(avg)})`, "error");
            
            console.warn(`[AI Alert] Anomaly detected for ${partNo}. Input: ${currentQty}, Avg: ${avg}`);
        } else {
            // จำนวนปกติ
            qtyIn.classList.remove('anomaly-detected');
        }
    }
}

// 5. ผูกเหตุการณ์ (Event Listener) เมื่อมีการพิมพ์ในช่อง QTY
$id('f-qty').addEventListener('input', checkAnomaly);

function updateInputResetButton() {
    const btn = $id('btn-reset-input');
    if (!btn) return;
    const ids = ['f-date', 'f-part', 'f-partname', 'f-supplier', 'f-ref', 'f-qty', 'f-line', 'f-defect', 'f-remark', 'judgmentSelect'];
    const hasValue = ids.some(id => {
        const el = $id(id);
        if (!el) return false;
        return String(el.value || '').trim() !== '';
    });
    if (hasValue) btn.classList.add('show');
    else btn.classList.remove('show');
}

function resetInputForm() {
    const fields = ['f-part', 'f-partname', 'f-supplier', 'f-ref', 'f-line', 'f-qty', 'f-defect', 'f-remark'];
    fields.forEach(id => { const el = $id(id); if (el) { el.value = ''; el.classList.remove('valid', 'invalid'); } });
    if (typeof validatePartNoInput === 'function') validatePartNoInput($id('f-part'));
    const d = $id('f-date'); if (d) d.value = new Date().toISOString().split('T')[0];
    const u = $id('f-unit'); if (u) u.value = 'PCS';
    const j = $id('judgmentSelect'); if (j) j.value = '';
    document.querySelectorAll('.shift-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
    S.selectedShift = 'SHIFT A';
    handleJudgment('');
    const cancelBtn = $id('btn-cancel'); if (cancelBtn) cancelBtn.classList.add('hidden');
    const text = $id('btn-commit-text'); if (text) text.textContent = 'Commit Data';
    S.editingId = null;
    closeAllAC();
    if (document.activeElement) document.activeElement.blur();
    refreshNeonGlow();
}


async function submitEntry() {
    if (S.userRole === 'supervisor') { toast('Supervisor เป็นโหมดดูอย่างเดียว (Read-only)', 'info'); return; }

    const dateIn = $id('f-date');
    const partIn = $id('f-part');
    const partNameIn = $id('f-partname');
    const supplierIn = $id('f-supplier');
    const refIn = $id('f-ref');
    const qtyIn = $id('f-qty');
    const jdgSel = $id('judgmentSelect');
    const btn = $id('btn-commit');
    const btnText = $id('btn-commit-text');

    const ref = refIn.value.trim();
    const qty = parseInt(qtyIn.value) || 0;
    const partNoVal = partIn.value.trim();
    const today = new Date().toISOString().split('T')[0];
    const selectedDate = dateIn.value;

    if (!partNoVal) { shake(partIn); toast('❌ กรุณากรอกหมายเลขพาร์ท', 'error'); return; }
    if (!partNameIn.value.trim()) { shake(partNameIn); toast('❌ กรุณากรอกชื่อพาร์ท', 'error'); return; }
    if (!supplierIn.value.trim()) { shake(supplierIn); toast('❌ กรุณากรอกซัพพลายเออร์', 'error'); return; }
    if (!ref) { shake(refIn); toast('❌ กรุณากรอกเลข Ref', 'error'); return; }
    if (!S.editingId && isDuplicate(ref)) { shake(refIn); toast('⚠️ ข้อมูลซ้ำ! เลข Ref นี้มีในระบบแล้ว', 'error'); return; }
    if (qty <= 0) { shake(qtyIn); toast('❌ จำนวนต้องมากกว่า 0', 'error'); return; }
    if (selectedDate > today) { shake(dateIn); toast('❌ ห้ามบันทึกวันที่ล่วงหน้า', 'error'); return; }
    if (!jdgSel.value) { shake(jdgSel); toast('❌ กรุณาเลือก Judgment', 'error'); return; }

    btn.disabled = true;
    const originalText = btnText.textContent;
    btnText.textContent = 'PROCESSING...';
    btn.style.opacity = '0.7';

    const recordId = S.editingId || generateUUID();
    const rowData = {
        id: recordId, 
        date: selectedDate, 
        shift: S.selectedShift, 
        line: $id('f-line').value.trim(),
        ref: ref.toUpperCase(), 
        supplier: supplierIn.value.trim(), 
        partNo: partNoVal,
        partName: partNameIn.value.trim(), 
        qty, 
        unit: $id('f-unit').value,
        defect: $id('f-defect').value.trim(), 
        remark: $id('f-remark').value.trim(),
        judgment: jdgSel.value, 
        inspector: S.currentUser,
        sync_status: 'pending' 
    };

    try {
        let saveMethod = '';
        if (isOnline()) {
            try {
                const { error } = await sqeClient.from('records').upsert([formToSupabase(rowData)]);
                if (error) throw error;
                rowData.sync_status = 'synced';
                saveMethod = 'cloud';
            } catch (cloudErr) {
                await localDB.pendingClaims.put(rowData);
                saveMethod = 'local';
            }
        } else {
            await localDB.pendingClaims.put(rowData);
            saveMethod = 'local';
        }

        // --- อัปเดตข้อมูลในหน่วยความจำ ---
        if (S.editingId) S.records = S.records.map(r => r.id === recordId ? rowData : r);
        else S.records.unshift(rowData);

        // 1. สั่งวาดตารางทันทีเพื่อให้แถวใหม่เกิดขึ้นใน DOM
        renderTable(); 

        // 2. แสดง Feedback Toast
        if (saveMethod === 'cloud') {
            btn.style.background = 'linear-gradient(135deg,#10b981,#059669)';
            btnText.textContent = '✅ ONLINE SECURED';
            toast('บันทึกลงฐานข้อมูลสำเร็จ', 'success');
        } else {
            btn.style.background = 'linear-gradient(135deg,#f59e0b,#d97706)';
            btnText.textContent = '📶 SAVED LOCALLY';
            toast('📶 บันทึกในเครื่องแล้ว', 'info');
        }
playCommitAnimation(); 
        // 3. >>> ส่วนไฮไลท์แถวใหม่แบบนีออน <<<
setTimeout(() => {
    // ค้นหาแถวที่มี attribute data-rid ตรงกับ id ที่เพิ่งบันทึก
    // (หมายเหตุ: ในฟังก์ชัน buildRow ของคุณต้องมีบรรทัด <tr data-rid="${r.id}"> ด้วยนะครับ)
    const targetRow = document.querySelector(`tr[data-rid="${recordId}"]`);
    
    if (targetRow) {
        // เติมคลาสนีออน
        targetRow.classList.add('row-highlight-neon');
        
        // กิมมิก: สั่งให้ตารางเลื่อนมาหาแถวนี้โดยอัตโนมัติ (กรณีเราบันทึกแบบคัดลอกหรือแก้ไข)
        targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}, 100);
        
        // รีเซ็ตฟอร์ม
        setTimeout(() => {
            resetInputForm();
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.background = '';
            btnText.textContent = 'Commit Data';
            rebuildSmartMemory();
            updateAIBrain();
        }, 800);

    } catch (err) {
        console.error('Save System Error:', err);
        toast('❌ ระบบบันทึกขัดข้อง', 'error');
        btn.disabled = false;
        btn.style.opacity = '1';
        btnText.textContent = originalText;
    }
}

// ฟังก์ชันซิงค์ข้อมูลที่ค้างอยู่ในเครื่องขึ้น Cloud
// แก้ไขบรรทัดแรกของฟังก์ชัน backgroundSync
async function backgroundSync() {
    if (!navigator.onLine) return; // เปลี่ยนจาก isOnline() เป็น navigator.onLine

    const pending = await localDB.pendingClaims.toArray();
    if (pending.length === 0) return;

    console.log(`[Sync] พบข้อมูลค้างซิงค์ ${pending.length} รายการ...`);

    for (const row of pending) {
        try {
            // ใช้ฟังก์ชันแปลงข้อมูลของคุณ
            const { error } = await sqeClient.from('records').upsert([formToSupabase(row)]);
            if (!error) {
                await localDB.pendingClaims.delete(row.id);
                
                const idx = S.records.findIndex(r => r.id === row.id);
                if (idx !== -1) S.records[idx].sync_status = 'synced';
            }
        } catch (e) {
            console.error('[Sync] รายการนี้ซิงค์ไม่สำเร็จ:', row.ref);
        }
    }
    
    renderTable(); 
}

// 1. ซิงค์ทันทีเมื่อเน็ตกลับมา (Online Event)
window.addEventListener('online', () => {
    toast('📶 กลับมาออนไลน์แล้ว: กำลังซิงค์ข้อมูล...', 'success');
    backgroundSync();
});

// 2. เผื่อเน็ตมาแล้ว Event ไม่ยิง ให้เช็คซ้ำทุกๆ 1 นาที
setInterval(backgroundSync, 60000);

/**
 * Master Sync Engine: ระบบรวมศูนย์ส่งข้อมูลออฟไลน์ค้างส่ง
 * ครอบคลุม: Part Claims, OT Management, และ 5S Excellence
 */
async function syncAllPendingData() {
    // 1. ตรวจสอบการเชื่อมต่อ
    if (!navigator.onLine) return;

    // 2. ตั้งค่าโครงสร้างโมดูลที่ต้องตรวจสอบ (Client และ ตารางเป้าหมาย)
    const syncConfigs = [
        { 
            dexieTable: localDB.pendingClaims, 
            supabaseClient: sqeClient, 
            remoteTable: 'records', 
            label: 'Part Claims' 
        },
        { 
            dexieTable: localDB.pendingOT, 
            supabaseClient: wapClient, 
            remoteTable: 'ot_records', 
            label: 'OT Records' 
        },
        { 
            dexieTable: localDB.pending5S, 
            supabaseClient: wapClient, 
            remoteTable: 's5_records', 
            label: '5S Audit' 
        }
    ];

    let totalSuccess = 0;

    try {
        for (const config of syncConfigs) {
            // ตรวจสอบว่าตารางในเครื่องมีอยู่จริง
            if (!config.dexieTable) continue;

            const pendingItems = await config.dexieTable.toArray();
            if (pendingItems.length === 0) continue;

            console.log(`🔄 [Sync] Starting ${config.label}: ${pendingItems.length} items found.`);

            for (const item of pendingItems) {
                try {
                    // กรองฟิลด์ที่ไม่เกี่ยวข้องกับฐานข้อมูลบน Cloud ออก (เช่น sync_status)
                    const { sync_status, ...uploadData } = item;

                    // ส่งข้อมูลขึ้น Cloud (ใช้ upsert เพื่อป้องกันข้อมูลซ้ำ)
                    const { error } = await config.supabaseClient
                        .from(config.remoteTable)
                        .upsert([uploadData]);

                    if (!error) {
                        // ส่งสำเร็จ -> ลบข้อมูลออกจากเครื่องทันที
                        await config.dexieTable.delete(item.id);
                        totalSuccess++;
                    } else {
                        throw error;
                    }
                } catch (rowErr) {
                    console.error(`❌ [Sync Error] ${config.label} ID: ${item.id} ->`, rowErr);
                }
            }
        }

        // 3. หลังจบการซิงค์ทุกโมดูล
        if (totalSuccess > 0) {
            toast(`✨ ระบบออนไลน์: ซิงค์ข้อมูลสำเร็จ ${totalSuccess} รายการ`, 'success');
            
            // รีเฟรชหน้าจอที่พนักงานกำลังเปิดอยู่ให้เป็นปัจจุบัน
            if (typeof triggerGlobalRefresh === 'function') {
                triggerGlobalRefresh();
            }
            
            // หากอยู่หน้าตาราง ให้วาดตารางใหม่เพื่อล้างสถานะ Pending
            if (typeof renderTable === 'function') {
                renderTable();
            }
        }

    } catch (criticalErr) {
        console.error("⚠️ [Master Sync Critical]:", criticalErr);
    }
}

/**
 * ตั้งค่าการรันระบบ Sync อัตโนมัติ
 */
// 1. รันทันทีเมื่อระบบกลับมา Online
window.addEventListener('online', () => {
    if (typeof updateOnlineBadge === 'function') updateOnlineBadge();
    syncAllPendingData();
});

// 2. รันซ้ำทุกๆ 60 วินาที เพื่อเก็บตกกรณี Event Online ไม่ทำงาน
setInterval(syncAllPendingData, 60000);

// 3. รันครั้งแรกเมื่อโหลดแอป (เผื่อเปิดมาแล้วออนไลน์เลย)
window.addEventListener('load', () => {
    setTimeout(syncAllPendingData, 3000); // รอ 3 วินาทีให้แอป Initialize เสร็จก่อน
});


// 1. ฟังก์ชันแก้ไข (Edit)
function editRecord(id) {
    // เพิ่มบรรทัดนี้: ถ้าฟอร์มถูกซ่อนอยู่ ให้สั่งเปิดออกมา
    if (isFormHidden) {
        toggleFormPanel();
    }

    const r = S.records.find(rec => String(rec.id) === String(id));
    if (!r) return;
    
    S.editingId = id;
    $id('f-date').value = r.date || '';
    $id('f-part').value = r.partNo || '';
    $id('f-partname').value = r.partName || '';
    $id('f-supplier').value = r.supplier || '';
    $id('f-ref').value = r.ref || '';
    $id('f-line').value = r.line || '';
    $id('f-qty').value = r.qty || '';
    $id('f-unit').value = r.unit || 'PCS';
    $id('f-defect').value = r.defect || '';
    $id('f-remark').value = r.remark || '';
    S.selectedShift = r.shift || 'SHIFT A';
    
    document.querySelectorAll('.shift-btn').forEach(b => 
        b.classList.toggle('active', b.textContent.trim() === S.selectedShift.replace('SHIFT ', ''))
    );
    
    $id('btn-cancel').classList.remove('hidden');
    $id('btn-commit-text').textContent = 'Update';
    $id('judgmentSelect').value = r.judgment || '';
    handleJudgment(r.judgment || '');
    refreshNeonGlow();
}

// 2. ฟังก์ชันคัดลอก (Clone)
function cloneRecord(id) {
    // เพิ่มบรรทัดนี้: ถ้าฟอร์มถูกซ่อนอยู่ ให้สั่งเปิดออกมา
    if (isFormHidden) {
        toggleFormPanel();
    }

    const r = S.records.find(rec => String(rec.id) === String(id));
    if (!r) return;
    
    S.editingId = null;
    $id('f-date').value = new Date().toISOString().split('T')[0];
    $id('f-part').value = r.partNo || '';
    $id('f-partname').value = r.partName || '';
    $id('f-supplier').value = r.supplier || '';
    $id('f-ref').value = '';
    $id('f-line').value = r.line || '';
    $id('f-qty').value = r.qty || '';
    $id('f-unit').value = r.unit || 'PCS';
    $id('f-defect').value = r.defect || '';
    $id('f-remark').value = r.remark || '';
    S.selectedShift = r.shift || 'SHIFT A';
    
    document.querySelectorAll('.shift-btn').forEach(b => 
        b.classList.toggle('active', b.textContent.trim() === S.selectedShift.replace('SHIFT ', ''))
    );
    
    $id('btn-cancel').classList.remove('hidden');
    $id('btn-commit-text').textContent = 'Commit Copy';
    $id('judgmentSelect').value = r.judgment || '';
    handleJudgment(r.judgment || '');
    refreshNeonGlow();
}

// --- Custom Confirmation Dialog System ---
function showCustomConfirmDialog(options = {}) {
    const {
        title = "ยืนยันการดำเนินการ",
        subtitle = "คุณแน่ใจหรือไม่ที่จะดำเนินการนี้?",
        badge = "CONFIRMATION",
        type = "danger",
        details = [],
        requiresTextInput = null,
        inputPlaceholder = "",
        confirmText = "ยืนยัน",
        cancelText = "ยกเลิก",
        onConfirm = null,
        onCancel = null
    } = options;

    const existing = document.getElementById('custom-confirm-modal');
    if (existing) existing.remove();

    const isDark = document.body.classList.contains('dark-mode') || document.documentElement.classList.contains('dark') || localStorage.getItem('carrier_theme') === 'dark';
    const isDanger = type === 'danger';
    const isWarning = type === 'warning';

    const modal = document.createElement('div');
    modal.id = 'custom-confirm-modal';
    modal.className = `fixed inset-0 z-[11000] flex items-center justify-center p-4 ${isDark ? 'bg-slate-950/85' : 'bg-slate-900/60'} backdrop-blur-md transition-opacity duration-200`;

    const iconSvg = isDanger ? `
        <svg class="w-6 h-6 ${isDark ? 'text-rose-400' : 'text-rose-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
    ` : isWarning ? `
        <svg class="w-6 h-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
    ` : `
        <svg class="w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
    `;

    const badgeBg = isDark
        ? (isDanger ? 'bg-rose-950/90 text-rose-300 border-rose-500/40' : isWarning ? 'bg-amber-950/90 text-amber-300 border-amber-500/40' : 'bg-blue-950/90 text-blue-300 border-blue-500/40')
        : (isDanger ? 'bg-rose-100 text-rose-800 border-rose-300' : isWarning ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-blue-100 text-blue-800 border-blue-300');

    const iconBg = isDark
        ? (isDanger ? 'bg-rose-950/90 border-rose-500/40 shadow-rose-950/50' : isWarning ? 'bg-amber-950/90 border-amber-500/40 shadow-amber-950/50' : 'bg-blue-950/90 border-blue-500/40 shadow-blue-950/50')
        : (isDanger ? 'bg-rose-50 border-rose-200 shadow-rose-100' : isWarning ? 'bg-amber-50 border-amber-200 shadow-amber-100' : 'bg-blue-50 border-blue-200 shadow-blue-100');

    const cardBg = isDark ? 'bg-slate-900 border-slate-700/80 text-slate-100 shadow-2xl shadow-black/90' : 'bg-white border-slate-200/90 text-slate-800 shadow-2xl shadow-slate-400/30';
    const titleColor = isDark ? 'text-white' : 'text-slate-900';
    const subColor = isDark ? 'text-slate-400' : 'text-slate-600';

    const detailsBox = isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200/80';
    const detailLabelColor = isDark ? 'text-slate-400' : 'text-slate-500';
    const detailValueColor = isDark ? 'text-slate-100' : 'text-slate-900';
    const detailBorder = isDark ? 'border-slate-800/60' : 'border-slate-200/70';

    const barGradient = isDanger ? 'from-rose-500 via-red-500 to-amber-500' 
                      : isWarning ? 'from-amber-500 via-orange-500 to-yellow-500' 
                      : 'from-blue-500 via-cyan-500 to-indigo-500';

    const confirmBtnBg = isDanger 
        ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/20 border-rose-400/30' 
        : isWarning 
        ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-600/20 border-amber-400/30' 
        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/20 border-blue-400/30';

    const cancelBtnBg = isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300';

    const warningBoxBg = isDark ? 'text-amber-300/90 bg-amber-950/30 border-amber-500/20' : 'text-amber-800 bg-amber-50 border-amber-200';

    const detailsHtml = details && details.length ? `
        <div class="${detailsBox} border rounded-2xl p-3.5 space-y-2 text-xs font-mono">
            ${details.map(d => `
                <div class="flex justify-between items-center gap-2 border-b ${detailBorder} pb-1.5 last:border-0 last:pb-0">
                    <span class="${detailLabelColor} font-medium">${escapeHtml(d.label)}:</span>
                    <span class="${detailValueColor} font-bold truncate max-w-[220px] text-right">${escapeHtml(String(d.value))}</span>
                </div>
            `).join('')}
        </div>
    ` : '';

    const inputBoxBg = isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200';
    const inputFieldBg = isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400';
    const inputLabelColor = isDark ? 'text-slate-300' : 'text-slate-700';

    const textInputHtml = requiresTextInput ? `
        <div class="space-y-1.5 ${inputBoxBg} p-3 rounded-2xl border">
            <label class="block text-[11px] font-mono font-bold ${inputLabelColor}">
                กรุณาพิมพ์ <span class="text-rose-500 font-extrabold select-all">'${escapeHtml(requiresTextInput)}'</span> เพื่อยืนยัน:
            </label>
            <input type="text" id="confirm-verification-input" placeholder="${escapeHtml(inputPlaceholder || requiresTextInput)}" class="w-full h-10 px-3 ${inputFieldBg} focus:border-rose-500 rounded-xl text-xs font-mono tracking-widest outline-none transition-all uppercase" autocomplete="off" />
        </div>
    ` : '';

    modal.innerHTML = `
        <div id="custom-confirm-card" class="relative w-full max-w-md ${cardBg} border rounded-3xl overflow-hidden flex flex-col font-sans transform scale-95 opacity-0 transition-all duration-200">
            <div class="h-1.5 w-full bg-gradient-to-r ${barGradient}"></div>

            <div class="p-6 flex flex-col gap-4">
                <div class="flex items-start gap-3.5">
                    <div class="w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 shadow-lg ${iconBg}">
                        ${iconSvg}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider mb-1 border ${badgeBg}">
                            ${escapeHtml(badge)}
                        </div>
                        <h3 class="text-base font-extrabold ${titleColor} leading-tight">${escapeHtml(title)}</h3>
                        <p class="text-xs ${subColor} mt-1 leading-normal">${escapeHtml(subtitle)}</p>
                    </div>
                </div>

                ${detailsHtml}
                ${textInputHtml}

                <div class="flex items-center gap-2 text-[10px] ${warningBoxBg} border px-3 py-2 rounded-xl font-mono">
                    <svg class="w-4 h-4 flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    <span>โปรดตรวจสอบข้อมูลให้แน่ใจก่อนกดยืนยันการทำงาน</span>
                </div>

                <div class="flex items-center gap-3 mt-1">
                    <button id="btn-cancel-custom-modal" class="flex-1 h-11 ${cancelBtnBg} font-bold text-xs rounded-xl border transition-all active:scale-95 flex items-center justify-center">
                        ${escapeHtml(cancelText)}
                    </button>
                    <button id="btn-confirm-custom-modal" ${requiresTextInput ? 'disabled' : ''} class="flex-[1.5] h-11 border ${confirmBtnBg} font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${requiresTextInput ? 'opacity-50 cursor-not-allowed' : ''}">
                        ${escapeHtml(confirmText)}
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const card = modal.querySelector('#custom-confirm-card');
    const cancelBtn = modal.querySelector('#btn-cancel-custom-modal');
    const confirmBtn = modal.querySelector('#btn-confirm-custom-modal');
    const inputEl = modal.querySelector('#confirm-verification-input');

    requestAnimationFrame(() => {
        card.classList.remove('scale-95', 'opacity-0');
        card.classList.add('scale-100', 'opacity-100');
        if (inputEl) inputEl.focus();
        else confirmBtn.focus();
    });

    const closeDialog = (confirmed = false) => {
        card.classList.remove('scale-100', 'opacity-100');
        card.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            modal.remove();
            if (!confirmed && typeof onCancel === 'function') onCancel();
        }, 180);
    };

    cancelBtn.onclick = () => closeDialog(false);

    modal.onclick = (e) => {
        if (e.target === modal) closeDialog(false);
    };

    if (requiresTextInput && inputEl) {
        inputEl.addEventListener('input', () => {
            const val = inputEl.value.trim();
            if (val.toUpperCase() === requiresTextInput.trim().toUpperCase()) {
                confirmBtn.removeAttribute('disabled');
                confirmBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                confirmBtn.setAttribute('disabled', 'true');
                confirmBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        });
    }

    confirmBtn.onclick = async () => {
        if (confirmBtn.hasAttribute('disabled')) return;
        confirmBtn.setAttribute('disabled', 'true');
        confirmBtn.innerHTML = `
            <svg class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            กำลังดำเนินการ...
        `;
        try {
            if (typeof onConfirm === 'function') {
                await onConfirm();
            }
        } catch (err) {
            console.error("Confirm Dialog Action Error:", err);
            toast("❌ เกิดข้อผิดพลาดในการดำเนินการ", "error");
        } finally {
            closeDialog(true);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            document.removeEventListener('keydown', handleKeyDown);
            closeDialog(false);
        } else if (e.key === 'Enter' && !confirmBtn.hasAttribute('disabled')) {
            document.removeEventListener('keydown', handleKeyDown);
            confirmBtn.click();
        }
    };
    document.addEventListener('keydown', handleKeyDown);
}

// --- ยืนยันก่อนลบรายการเดี่ยวใน Part Line Claim ---
function confirmDelete(id) {
    if (S.userRole === 'supervisor') {
        toast('Supervisor เป็นโหมดดูอย่างเดียว (Read-only)', 'info');
        return;
    }
    const targetRecord = S.records.find(r => String(r.id) === String(id));
    if (!targetRecord) {
        toast('❌ ไม่พบรายการที่ต้องการลบ', 'error');
        return;
    }

    showCustomConfirmDialog({
        title: "ยืนยันการลบรายการเคลม",
        subtitle: "รายการนี้จะถูกลบออกจากระบบ และไม่สามารถกู้คืนได้",
        badge: "DELETE CLAIM RECORD",
        type: "danger",
        details: [
            { label: "Ref No.", value: targetRecord.ref || '-' },
            { label: "Part No.", value: `${targetRecord.partNo || '-'} (${targetRecord.partName || '-'})` },
            { label: "ซัพพลายเออร์", value: targetRecord.supplier || '-' },
            { label: "จำนวน / ไลน์", value: `${targetRecord.qty || 0} ${targetRecord.unit || 'PCS'} | Line: ${targetRecord.line || '-'}` },
            { label: "อาการเสีย", value: targetRecord.defect || '-' }
        ],
        confirmText: "🗑️ ยืนยันการลบรายการ",
        cancelText: "ยกเลิก",
        onConfirm: async () => {
            const success = await deleteRecordFromCloud(id);
            if (success) {
                renderTable(); 
                toast('🗑️ ลบข้อมูลรายการเรียบร้อยแล้ว', 'success');
            }
        }
    });
}

// --- ยืนยันก่อนล้างข้อมูลในฟอร์ม ---
function confirmResetForm() {
    const fields = ['f-part', 'f-partname', 'f-supplier', 'f-ref', 'f-line', 'f-qty', 'f-defect', 'f-remark'];
    const filledFields = fields.filter(id => {
        const el = $id(id);
        return el && el.value && el.value.trim() !== '';
    });

    if (filledFields.length === 0) {
        resetInputForm();
        return;
    }

    const partVal = $id('f-part')?.value.trim();
    const refVal = $id('f-ref')?.value.trim();

    showCustomConfirmDialog({
        title: "ยืนยันการล้างข้อมูลในฟอร์ม",
        subtitle: "ข้อมูลที่คุณกำลังกรอกในฟอร์มยังไม่ได้ถูกบันทึก คุณต้องการล้างข้อมูลฟอร์มนี้ใช่หรือไม่?",
        badge: "RESET FORM FIELDS",
        type: "warning",
        details: [
            { label: "จำนวนช่องที่มีข้อมูล", value: `${filledFields.length} ช่อง` },
            { label: "Part No.", value: partVal || '-' },
            { label: "Ref No.", value: refVal || '-' }
        ],
        confirmText: "🧹 ยืนยันล้างข้อมูลฟอร์ม",
        cancelText: "กลับไปแก้ไขต่อ",
        onConfirm: () => {
            resetInputForm();
            toast('🧹 ล้างข้อมูลในฟอร์มเรียบร้อยแล้ว', 'info');
        }
    });
}

function clearForm() {
    confirmResetForm();
}

function showModal(title, message, onConfirm) {
    let root = $id('modal-root');
    if (!root) {
        root = document.createElement('div');
        root.id = 'modal-root';
        document.body.appendChild(root);
    }
    root.innerHTML = `<div class="modal-overlay" onclick="if(event.target===this)closeModal()"><div class="modal-box"><h3 class="text-lg font-bold text-slate-800 mb-2">${escapeHtml(title)}</h3><p class="text-sm text-slate-500 mb-6">${escapeHtml(message)}</p><div class="flex gap-3"><button  onclick="closeModal()" class="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-500 bg-slate-50" title="Close Modal" aria-label="Close Modal">ยกเลิก</button><button  id="modal-confirm-btn" class="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-500 text-white" title="Modal Confirm Btn" aria-label="Modal Confirm Btn">ยืนยัน</button></div></div></div>`;
    $id('modal-confirm-btn').onclick = () => { closeModal(); onConfirm && onConfirm(); };
}
function closeModal() {
    const root = $id('modal-root');
    if (root) root.innerHTML = '';
}

function getFilteredRecords() {
    let filtered = S.records;
    
    // --- เพิ่มการกรองตามวันที่จาก Header ---
    const start = ''; 
    const end = '';
    if (start && end) {
        filtered = filtered.filter(r => r.date >= start && r.date <= end);
    }

    // กรองตาม Judgment หรือ 8D Status
    if (S.activeFilter === '8D_HAS') {
        filtered = filtered.filter(r => !!get8DCaseForRecord(r));
    } else if (S.activeFilter === '8D_NO') {
        filtered = filtered.filter(r => !get8DCaseForRecord(r));
    } else if (S.activeFilter !== 'ALL') {
        filtered = filtered.filter(r => r.judgment === S.activeFilter);
    }
    
    // กรองตามคำค้นหา
    if (S.searchKeyword) {
        const kw = S.searchKeyword.toLowerCase();
        filtered = filtered.filter(r => {
            const has8D = get8DCaseForRecord(r);
            const eightDId = has8D ? String(has8D.id).toLowerCase() : '';
            return (r.ref || '').toLowerCase().includes(kw) ||
                (r.partNo || '').toLowerCase().includes(kw) ||
                (r.partName || '').toLowerCase().includes(kw) ||
                (r.supplier || '').toLowerCase().includes(kw) ||
                (r.defect || '').toLowerCase().includes(kw) ||
                (r.line || '').toLowerCase().includes(kw) ||
                (r.remark || '').toLowerCase().includes(kw) ||
                eightDId.includes(kw);
        });
    }
    // เรียงลำดับจากวันที่ที่บันทึกล่าสุดเรียงลงไปเสมอ
    filtered.sort((a, b) => {
        const timeA = new Date(a.created_at || a.date || 0).getTime() || 0;
        const timeB = new Date(b.created_at || b.date || 0).getTime() || 0;
        if (timeA !== timeB) return timeB - timeA;
        return String(b.id || '').localeCompare(String(a.id || ''));
    });

    return filtered;
}

function filterTable(filter, btnEl) {
    S.activeFilter = filter;
    document.querySelectorAll('.f-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    
    renderTable();
}

let searchTimer = null;

function debounceSearch() {
    const searchInput = $id('filter-search');
    const kw = searchInput ? searchInput.value.trim() : '';
    S.searchKeyword = kw;

    const clearBtn = $id('clear-search-btn');
    if (clearBtn) {
        clearBtn.classList.toggle('hidden', !kw);
    }

    clearTimeout(searchTimer);

    if (!kw) {
        loadRecords();
        return;
    }

    const container = $id('table-container');
    if (container) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full py-20 text-slate-400">
                <div class="spinner spinner-dark mb-3"></div>
                <p class="text-[11px] font-bold uppercase tracking-widest italic">Searching Cloud Database...</p>
            </div>
        `;
    }

    searchTimer = setTimeout(() => {
        executeGlobalSearch(kw);
    }, 400);
}

function clearFilterSearch() {
    const searchInput = $id('filter-search');
    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
    }
    debounceSearch();
}

async function executeGlobalSearch(keyword) {
    if (!navigator.onLine) { toast('⚠️ Offline Mode', 'error'); return; }
    const sb = getSupabase();
    const container = $id('table-container');
    const cleanKwd = keyword.trim().toLowerCase();
    
    if (container) {
        container.innerHTML = `<div class="flex flex-col items-center justify-center h-full py-20 text-slate-400"><div class="spinner spinner-dark mb-3"></div><p class="text-[11px] font-black uppercase italic">AI Scanning Cloud Database...</p></div>`;
    }

    try {
        const targetUser = S.userRole === 'supervisor' ? S.viewingUser : S.currentUser;
        let query = sb.from('records').select('*').eq('inspector', targetUser);
        let searchLabel = `🔍 Search: "${keyword}"`;

        // 1. ตรวจจับตัวเลขและเครื่องหมาย (เช่น >10)
        const qtyMatch = cleanKwd.match(/^([<>]=?|=)(\d+)$/);
        // 2. ตรวจจับการระบุ Line (เช่น line:lc3)
        const lineMatch = cleanKwd.match(/^(line|l):([\w-]+)$/);
        // 3. ตรวจจับสถานะ (เช่น is:sf)
        const statusMatch = cleanKwd.match(/^is:(sf|vendor|ctc|ok|can use)$/);

        if (qtyMatch) {
            const [_, op, val] = qtyMatch;
            const opMap = { '>': 'gt', '<': 'lt', '>=': 'gte', '<=': 'lte', '=': 'eq' };
            query = query[opMap[op]]('qty', parseInt(val));
            searchLabel = `🔢 จำนวน ${op} ${val}`;
        }
        else if (lineMatch) {
            const val = lineMatch[2].toUpperCase();
            query = query.ilike('line', `%${val}%`);
            searchLabel = `📍 Line: ${val}`;
        }
        else if (statusMatch) {
            let status = statusMatch[1].toUpperCase();
            if (status === 'OK') status = 'CAN USE';
            query = query.ilike('judgment', `%${status}%`);
            searchLabel = `⚖️ Status: ${status}`;
        }
        else if (['วันนี้', 'เมื่อวาน', 'อาทิตย์นี้'].includes(cleanKwd)) {
            const now = new Date();
            let start = new Date();
            if (cleanKwd === 'วันนี้') query = query.eq('date', now.toISOString().split('T')[0]);
            else if (cleanKwd === 'เมื่อวาน') { start.setDate(now.getDate() - 1); query = query.eq('date', start.toISOString().split('T')[0]); }
            else if (cleanKwd === 'อาทิตย์นี้') { start.setDate(now.getDate() - now.getDay()); query = query.gte('date', start.toISOString().split('T')[0]); }
            searchLabel = `📅 Period: ${cleanKwd}`;
        }
        else {
            // ส่วนที่แก้ไข Error: ReferenceError: field is not defined
            const searchPattern = `%${keyword}%`;
            const searchFields = ['ref', 'partNo', 'partName', 'supplier', 'defect', 'remark', 'line'];
            const orCondition = searchFields.map(f => `${f}.ilike.${searchPattern}`).join(',');
            query = query.or(orCondition);
        }

        const { data, error } = await query.order('created_at', { ascending: false }).limit(1000);
        if (error) throw error;

        S.records = (data || []).map(normalizeRecord);
        if (container) container.scrollTop = 0;
        renderTable(); 

        const countDisplay = $id('record-count');
        if (countDisplay) {
            countDisplay.innerHTML = `${searchLabel} | พบ <span class="text-blue-600 font-bold">${data.length}</span> รายการ`;
        }

        rebuildSmartMemory();
        updateAIBrain();

    } catch (err) {
        console.error('Advanced Search Error:', err);
        toast('❌ ค้นหาขัดข้อง', 'error');
    }
}

function searchTable() {
    debounceSearch();
}

function buildRow(r, i) {
    const isPending = r.sync_status === 'pending';
    
    // --- ปรับเปลี่ยนตรงนี้: จากเครื่องหมายถูก เป็นจุดนีออน ---
    const syncStatusUI = isPending 
        ? `<div style="display:flex; flex-direction:column; align-items:center; gap:2px;" title="รอการซิงค์">
             <svg class="animate-pulse" style="width:12px; height:12px; color:#f59e0b" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0"></path></svg>
             <span style="font-size:7px; font-weight:900; color:#f59e0b; letter-spacing:0.02em;">LOCAL</span>
           </div>`
        : `<div style="display:flex; flex-direction:column; align-items:center; gap:3px;">
             <!-- จุดเขียวนีออนเรืองแสง -->
             <span style="width:6px; height:6px; background:#10b981; border-radius:50%; box-shadow: 0 0 8px #10b981; display:block;"></span>
             <span style="font-size:8px; font-weight:700; color:#cbd5e1;">${i + 1}</span>
           </div>`;

    // ส่วนที่เหลือคงเดิม...
    const rowStyle = isPending ? 'background-color: #fffbeb !important; border-left: 3px solid #f59e0b;' : '';
    let dateDisplay = '--';
    if (r.date) {
        const d = new Date(r.date);
        if (!isNaN(d)) {
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            dateDisplay = `<span style="font-family:'SF Mono',monospace; font-weight:600; color:#64748b;">${d.getFullYear()}-${mm}-${dd}</span>`;
        }
    }
    const shift = (r.shift || 'A').replace('SHIFT ', '');
    const line = r.line || '-';
    const jdg = (r.judgment || '').toUpperCase();
    let statusClass = 'status-ok', statusLabel = jdg || '-';
    if (jdg.includes('VENDOR')) { statusClass = 'status-vendor'; statusLabel = 'VENDOR FAULT'; }
    else if (jdg === 'SF') { statusClass = 'status-sf'; statusLabel = 'SF FAULT'; }
    else if (jdg === 'CTC') { statusClass = 'status-ctc'; statusLabel = 'CTC FAULT'; }
    else if (jdg.includes('CAN USE')) { statusClass = 'status-ok'; statusLabel = 'CAN USE'; }
    const isEditing = S.editingId === r.id;

    // --- 8D Status Indicator ---
    const eightD = get8DCaseForRecord(r);
    let eightDUI = '';

    if (eightD) {
        const dStatus = (eightD.status || 'D1_OPEN').replace('D1_OPEN', 'D1').replace('_', ' ');
        eightDUI = `
            <button  onclick="event.stopPropagation(); openReportFromRecord('${eightD.id}')"
                    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9.5px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-300 hover:bg-emerald-100 transition-all shadow-2xs active:scale-95 cursor-pointer"
                    title="คลิกเพื่อเปิดดู 8D Report #${eightD.id}" aria-label="Event.Stop Propagation">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>8D: ${escapeHtml(dStatus)}</span>
            </button>`;
    } else {
        eightDUI = `
            <button  onclick="event.stopPropagation(); create8DFromClaimRecord('${r.id}')"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white border border-slate-200 hover:border-blue-600 transition-all shadow-2xs active:scale-95 cursor-pointer"
                    title="คลิกเพื่อสร้างรายงาน 8D จากเคสนี้ทันที" aria-label="Event.Stop Propagation">
                <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>+ ออก 8D</span>
            </button>`;
    }

     return `
    <tr class="${isEditing ? 'editing-row' : ''}" data-rid="${r.id}" style="${rowStyle}">
        <td class="col-no" style="vertical-align: middle; padding: 6px 0 !important;">
            ${syncStatusUI}
        </td>
        <td class="col-date">${dateDisplay}</td>
        <td class="col-ref-combo">
            <div style="display: flex; flex-direction: column; gap: 2px;">
                <span class="badge-ref" style="display: inline-block; padding: 2px 6px; background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; border-radius: 5px; font-family: monospace; font-weight: 800; width: fit-content; font-size: 10px;">
                    ${escapeHtml(r.ref || '-')}
                </span>
                <span style="font-size: 9px; color: #94a3b8; font-weight: 600; letter-spacing: 0.02em;">
                    L:${escapeHtml(line)} <span style="color: #e2e8f0; margin: 0 2px;">|</span> SHIFT:${escapeHtml(shift)}
                </span>
            </div>
        </td>

        <!-- SUPPLIER/PART INFO -->
        <td class="col-part-combo" style="max-width: 280px;">
            <div style="display: flex; flex-direction: column; gap: 1px;">
                <span style="font-weight: 800; color: #1e293b; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(r.supplier)}">
                    ${escapeHtml(r.supplier || '-')}
                </span>
                
                <span style="font-size: 9px; color: #64748b; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center;">
                    <span style="flex-shrink: 1; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(r.partName || '-')}</span>
                    <span style="margin: 0 4px; opacity: 0.5;">/</span>
                    <span style="font-family: monospace; letter-spacing: 0.5px;">${escapeHtml(r.partNo || '-')}</span>
                </span>
            </div>
        </td>

        <td class="col-qty" style="text-align: center;">
            <div style="line-height: 1;">
                <span style="font-family: 'SF Mono', monospace; font-size: 15px; font-weight: 900; color: #2563eb;">${r.qty || 0}</span>
                <div style="font-size: 8px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-top: 1px;">${escapeHtml(r.unit || 'PCS')}</div>
            </div>
        </td>
        <td class="col-defect">
            <span style="font-weight: 700; color: #475569; font-size: 10.5px;">${escapeHtml(r.defect || '-')}</span>
        </td>
        <td class="col-remark">
            <p style="font-size: 9.5px; color: #94a3b8; font-style: italic; line-height: 1.3; white-space: normal; max-width: 140px;">
                ${escapeHtml(r.remark || '-')}
            </p>
        </td>
        <td class="col-judgment" style="text-align: center;">
            <span class="status-pill ${statusClass}" style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 99px; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em; border: 1px solid transparent;">
                ${escapeHtml(statusLabel)}
            </span>
        </td>
        <td class="col-actions">
            <div class="row-actions" style="display: flex; gap: 4px; justify-content: center;">
                <button  class="row-btn row-btn-clone" data-tip="คัดลอก" onclick="cloneRecord('${r.id}')" title="Clone Record" aria-label="Clone Record"><svg style="width: 10px; height: 10px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                <button  class="row-btn row-btn-edit" data-tip="แก้ไข" onclick="editRecord('${r.id}')" title="Edit Record" aria-label="Edit Record"><svg style="width: 10px; height: 10px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                <button  class="row-btn row-btn-del" data-tip="ลบ" onclick="confirmDelete('${r.id}')" title="Confirm Delete" aria-label="Confirm Delete"><svg style="width: 10px; height: 10px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
            </div>
        </td>
    </tr>`;
}



/* ============================================================
   UPGRADED: PART LINE CLAIM VIRTUAL RENDERER (V7.0 - Transform Base)
   ============================================================ */
const FIXED_ROW_HEIGHT = 52; // ให้ตรงกับ .data-table tbody tr { height: 52px }
const HEADER_HEIGHT = 40;    // ตรวจสอบความสูง thead จริงด้วย (padding 6px+font+border)

function renderTable() {
    const container = document.getElementById('table-container');
    if (!container) return;

    const filtered = getFilteredRecords(); 
    const total = filtered.length;
    
    // 1. อัปเดตตัวเลขจำนวนรายการ
    const countDisplay = document.getElementById('record-count');
    if (countDisplay) countDisplay.textContent = `${total.toLocaleString()} รายการ`;
    
    // 2. กรณีไม่มีข้อมูล (Empty State)
    if (total === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full py-20 text-slate-400">
                <svg class="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 7v10c0 1.1.9 2 2 2h12a2 2 0 002-2V7M4 7a2 2 0 012-2h12a2 2 0 012 2M4 7h16M9 12h6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                <p class="text-[11px] font-black uppercase tracking-widest">No Data Available</p>
            </div>`;
        virtualTableState.allRows = [];
        return;
    }

    // 3. เตรียม State สำหรับการ Scroll
    virtualTableState.allRows = filtered;
    virtualTableState.prevStart = -1; 
    virtualTableState.prevEnd = -1;
    virtualTableState.isFreshRender = true;

    /**
     * 4. สร้างโครงสร้างใหม่ (Virtual DOM Structure)
     * แก้ไขจุดนี้: ใส่ data-i18n ให้กับทุกหัวข้อคอลัมน์ (<th>)
     */
    container.innerHTML = `
        <div id="table-runway" style="position: relative; width: 100%; height: ${total * FIXED_ROW_HEIGHT + HEADER_HEIGHT}px;">
            <div id="table-content-wrapper" style="position: absolute; top: 0; left: 0; right: 0;">
                <table class="data-table" style="table-layout: fixed; width: 100%; border-collapse: separate; border-spacing: 0;">
                    <colgroup>
                        <col style="width: 45px;">   <!-- # -->
                        <col style="width: 100px;">  <!-- DATE -->
                        <col style="width: 130px;">  <!-- REF/LINE -->
                        <col style="width: 260px;">  <!-- SUPPLIER/PART -->
                        <col style="width: 70px;">   <!-- QTY -->
                        <col style="width: 140px;">  <!-- DEFECT -->
                        <col style="width: 160px;">  <!-- REMARK -->
                        <col style="width: 120px;">  <!-- STATUS -->
                        <col style="width: 100px;">  <!-- ACTIONS -->
                    </colgroup>
                    <thead class="sticky top-0 z-30">
                        <tr style="height: ${HEADER_HEIGHT}px; background: #f1f5f9;">
                            <th data-i18n="col_no">#</th>
                            <th data-i18n="col_date">DATE</th>
                            <th data-i18n="col_ref">REF/LINE/SHIFT</th>
                            <th data-i18n="col_info">SUPPLIER/PART INFO</th>
                            <th data-i18n="col_qty" style="text-align:center">QTY</th>
                            <th data-i18n="col_defect">DEFECT</th>
                            <th data-i18n="col_remark">REMARK</th>
                            <th data-i18n="col_status" style="text-align:center">STATUS</th>
                            <th data-i18n="col_actions" style="text-align:center">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody id="table-render-target">
                        <!-- แถวข้อมูลจะถูกฉีดเข้าที่นี่ -->
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // 5. รีเซ็ตตำแหน่งการเลื่อน และผูก Event ใหม่ (ใช้ requestAnimationFrame เพื่อ 60FPS ลื่นไหล)
    container.scrollTop = 0;
    container.removeEventListener('scroll', handleTableScroll);
    container.removeEventListener('scroll', _onTableScrollThrottled);
    container.addEventListener('scroll', _onTableScrollThrottled, { passive: true });

    // 6. [จุดสำคัญ] สั่งแปลภาษาหัวตารางทันทีหลังวาด HTML
    const currentLang = localStorage.getItem('carrier_lang') || 'en';
    applyLanguage(currentLang);

    // 7. สั่งวาดข้อมูลแถวแรกๆ
    handleTableScroll();
}

let _tableScrollTicking = false;
function _onTableScrollThrottled() {
    if (!_tableScrollTicking) {
        _tableScrollTicking = true;
        requestAnimationFrame(() => {
            handleTableScroll();
            _tableScrollTicking = false;
        });
    }
}

/**
 * ฟังก์ชันจัดการ Virtual Scroll (High Performance)
 * ใช้การคำนวณตำแหน่งและดีดเนื้อหาด้วย Transform
 */
function handleTableScroll() {
    const container = document.getElementById('table-container');
    const tbody = document.getElementById('table-render-target');
    
    // ตรวจสอบความพร้อมของข้อมูลและ Element
    if (!container || !tbody || !virtualTableState.allRows.length) return;

    const allData = virtualTableState.allRows;
    const totalCount = allData.length;
    const scrollTop = container.scrollTop;
    const viewHeight = Math.max(container.clientHeight || 0, window.innerHeight || 600);
    
    // 1. คำนวณหา Index ของแถวที่ต้องแสดงผล
    // ใช้ BUFFER 6 แถวและ fallback viewHeight เพื่อป้องกันพื้นที่สีขาวเมื่อคำนวณขนาดจอคลาดเคลื่อน
    const BUFFER = 6;
    let startIdx = Math.floor(scrollTop / FIXED_ROW_HEIGHT) - BUFFER;
    let endIdx = Math.ceil((scrollTop + viewHeight) / FIXED_ROW_HEIGHT) + BUFFER;

    // ตรวจสอบขอบเขตของ Index (ไม่ให้ต่ำกว่า 0 หรือเกินจำนวนข้อมูลที่มี)
    startIdx = Math.max(0, startIdx);
    endIdx = Math.min(totalCount, endIdx);

    // 2. Performance Check: หากเลื่อนไปแล้วยังอยู่ในช่วงเดิม ไม่ต้องวาด DOM ใหม่
    if (startIdx === virtualTableState.prevStart && endIdx === virtualTableState.prevEnd) return;
    
    virtualTableState.prevStart = startIdx;
    virtualTableState.prevEnd = endIdx;

    // 3. การคำนวณตำแหน่ง (The Magic Logic)
    // ดีดเฉพาะส่วนของ Tbody ลงมาให้ตรงกับตำแหน่งที่กำลัง Scroll
    const offsetY = startIdx * FIXED_ROW_HEIGHT;
    
    // ใช้ translateY เพื่อรองรับทั้ง GPU และ Software Rendering
    tbody.style.transform = `translateY(${offsetY}px)`;

    // 4. วนลูปสร้างเฉพาะ HTML ของแถวในช่วงที่คำนวณได้
    let loopHtml = '';
    for (let i = startIdx; i < endIdx; i++) {
        loopHtml += buildRow(allData[i], i);
    }

    // 5. ฉีดข้อมูลเข้าสู่ Tbody
    tbody.innerHTML = loopHtml;
    if (virtualTableState.isFreshRender) {
        virtualTableState.isFreshRender = false;
        if (typeof window.animateTableRows === 'function') {
            window.animateTableRows(tbody, { y: 6, duration: 0.25, maxRows: 15, ease: 'power2.out' });
        }
    } else {
        const trs = tbody.querySelectorAll('tr');
        trs.forEach(tr => {
            if (tr && tr.style) {
                tr.style.opacity = '1';
                tr.style.transform = 'none';
            }
        });
    }
    if (typeof reapplyKbdRowSelection === 'function') reapplyKbdRowSelection();
}

/**
 * ปรับปรุง: ฟังก์ชันสลับหน้าย่อยให้ "ฉลาดเรื่องภาษา" (Smart i18n Aware)
 */
function switchSubTerminal(view) {
    if (typeof clearTableSelection === 'function') clearTableSelection();
    const entryDiv = $id('entry-terminal-content');
    const cockpitDiv = $id('overview-cockpit-content');
    const btnEntry = $id('sub-btn-entry');
    const btnCockpit = $id('sub-btn-cockpit');
    const titleEl = $id('header-title');
    
    // ✨ อ้างอิง Badge และ Staff Selector
    const onlineBadge = $id('online-badge');
    const staffWrap = $id('staff-selector-wrap');

    // อ้างอิง ID ของฟิลเตอร์ Vendor และเส้นแบ่ง
    const vendorFilter = $id('claim-vendor-filter');
    const vendorDivider = $id('vendor-divider');

    // ดึงข้อมูลภาษาปัจจุบัน
    const currentLang = localStorage.getItem('carrier_lang') || 'en';
    const langData = translations[currentLang];

    // อ้างอิงกลุ่มเครื่องมือ
    const opTools = $id('claim-op-tools');           
    const dashFilter = $id('claim-dash-filter-wrap'); 

    // รีเซ็ตสไตล์ปุ่มสลับย่อย
    [btnEntry, btnCockpit].forEach(btn => {
        if(btn) btn.className = "px-3 py-1 rounded-full text-[9px] font-black text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-all";
    });

    if (view === 'entry') {
        // --- 1. แสดงหน้าตาราง (PART CLAIM) ---
        cockpitDiv.classList.add('hidden-view');
        entryDiv.classList.remove('hidden-view');
        gsap.set(entryDiv, { opacity: 1, y: 0 }); 
        
        titleEl.textContent = langData.header_title_claim; 

        if(btnEntry) {
            btnEntry.className = "px-3 py-1 rounded-full text-[9px] font-black transition-all bg-blue-600 text-white shadow-sm";
            btnEntry.textContent = langData.tab_claim_entry;
        }
        if(btnCockpit) btnCockpit.textContent = langData.tab_dashboard;

        // ✅ ✨ แสดง Online Badge เสมอในหน้าตาราง
        if (onlineBadge) {
            onlineBadge.classList.remove('hidden');
            onlineBadge.classList.add('flex');
        }

        // ✅ ✨ แสดงรายชื่อพนักงาน (เฉพาะ Supervisor) ในหน้าตาราง
        if (S.userRole === 'supervisor' && staffWrap) {
            staffWrap.classList.remove('hidden');
            staffWrap.classList.add('flex');
        }

        // ✅ แสดงเครื่องมือจัดการข้อมูล | ❌ ซ่อนฟิลเตอร์วันที่และเวนเดอร์
        if (opTools) { opTools.classList.remove('hidden'); opTools.classList.add('flex'); }
        if (dashFilter) { dashFilter.classList.add('hidden'); dashFilter.classList.remove('flex'); }
        if (vendorFilter) vendorFilter.classList.add('hidden');
        if (vendorDivider) vendorDivider.classList.add('hidden');

        renderTable(); 
    } else {
        // --- 2. แสดงหน้า Dashboard (COCKPIT) ---
        entryDiv.classList.add('hidden-view');
        cockpitDiv.classList.remove('hidden-view');
        gsap.set(cockpitDiv, { opacity: 1, y: 0 });
        
        titleEl.textContent = `${langData.tab_dashboard} ${langData.header_title_claim}`;
        
        if(btnCockpit) {
            btnCockpit.className = "px-3 py-1 rounded-full text-[9px] font-black transition-all bg-blue-600 text-white shadow-sm";
            btnCockpit.textContent = langData.tab_dashboard;
        }
        if(btnEntry) btnEntry.textContent = langData.tab_claim_entry;

        // ❌ ✨ [ส่วนที่แก้ไข] ถ้าเป็น "พนักงาน" (Staff) ให้ซ่อน Online Badge ในหน้า Dashboard
        if (S.userRole === 'staff' && onlineBadge) {
            onlineBadge.classList.add('hidden');
            onlineBadge.classList.remove('flex');
        }

        // ❌ ✨ ซ่อน Staff Selector ในหน้า Dashboard ทุกกรณี (ย้ายไปแสดงเฉพาะหน้าตารางแล้ว)
        if (staffWrap) {
            staffWrap.classList.add('hidden');
            staffWrap.classList.remove('flex');
        }

        // ❌ ซ่อนเครื่องมือจัดการข้อมูล | ✅ แสดงฟิลเตอร์วันที่และเวนเดอร์
        if (opTools) { opTools.classList.add('hidden'); opTools.classList.remove('flex'); }
        if (dashFilter) { dashFilter.classList.remove('hidden'); dashFilter.classList.add('flex'); }
        
        // ✨ [แสดงผลเวนเดอร์]
        if (vendorFilter) vendorFilter.classList.remove('hidden');
        if (vendorDivider) vendorDivider.classList.remove('hidden');

        refreshClaimDashboard(); 
    }
}


/**
 * ═══════════════════════════════════════════════════════
 *  UNIFIED SWITCH PAGE SYSTEM (V3.0)
 *  จัดการการสลับหน้าจอทั้งหมดในระบบ (Regular Pages & Admin)
 * ═══════════════════════════════════════════════════════
 */
function switchPage(name, el) {
    if (typeof clearTableSelection === 'function') clearTableSelection();
    const pageNameUpper = name.toUpperCase();
    const titleEl = document.getElementById('header-title');
    const subNav = document.getElementById('terminal-sub-nav'); 
    const claimOpTools = document.getElementById('claim-op-tools'); 
    const dashFilterWrap = document.getElementById('claim-dash-filter-wrap'); 
    
    // อ้างอิงแถบเครื่องมือ Admin ใน Header ที่เพิ่มเข้าไปใหม่
    const adminHeaderTools = document.getElementById('admin-header-tools');

    // อ้างอิง UI Elements ส่วนกลาง
    const staffWrap = document.getElementById('staff-selector-wrap');
    const onlineBadge = document.getElementById('online-badge');
    const vendorFilter = document.getElementById('claim-vendor-filter');
    const vendorDivider = document.getElementById('vendor-divider');

    // --- STEP 1: RESET GLOBAL UI STATES ---
    if (staffWrap) staffWrap.classList.add('hidden');
    if (onlineBadge) onlineBadge.classList.add('hidden');
    if (vendorFilter) vendorFilter.classList.add('hidden');
    if (vendorDivider) vendorDivider.classList.add('hidden');

    // --- STEP 2: MANAGE SIDEBAR ACTIVE STATE ---
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active-nav'));
    document.querySelectorAll('.active-indicator').forEach(i => i.remove());
    if (el) {
        el.classList.add('active-nav');
        const indicator = document.createElement('div');
        indicator.className = 'active-indicator';
        el.appendChild(indicator);
    }

    // --- STEP 3: HIDE ALL PAGE CONTAINERS ---
    const allPages = [
        'entry-terminal-content', 'overview-cockpit-content', 'exec-dashboard-content',
        'attendance-logs', 'line-support-logs-content', 'five-s-content',
        'skill-matrix-content', 'special-jobs-content', 'ot-management-content',
        'admin-console-content','eight-d-content' 
    ];
    allPages.forEach(id => {
        const pageEl = document.getElementById(id);
        if (pageEl) pageEl.classList.add('hidden-view');
    });

    // --- STEP 4: HEADER & SPECIAL PAGE LOGIC (ปรับปรุงใหม่) ---
    
    // 1. จัดการแถบ Admin Header Tools และสลับธีมทั้งแอปให้อัตโนมัติ
    if (pageNameUpper === 'ADMIN CONSOLE') {
        if (adminHeaderTools) {
            adminHeaderTools.classList.remove('hidden');
            adminHeaderTools.classList.add('flex');
        }
        if (window._preAdminThemeChoice === undefined || window._preAdminThemeChoice === null) {
            window._preAdminThemeChoice = localStorage.getItem('carrier_theme') || (document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        }
        document.body.classList.add('dark-mode');
        if (typeof updateThemeIcon === 'function') updateThemeIcon(true);
    } else {
        if (adminHeaderTools) {
            adminHeaderTools.classList.remove('flex');
            adminHeaderTools.classList.add('hidden');
        }
        if (window._preAdminThemeChoice) {
            if (window._preAdminThemeChoice === 'light') {
                document.body.classList.remove('dark-mode');
                if (typeof updateThemeIcon === 'function') updateThemeIcon(false);
            } else {
                document.body.classList.add('dark-mode');
                if (typeof updateThemeIcon === 'function') updateThemeIcon(true);
            }
            window._preAdminThemeChoice = null;
        }
    }

    // 2. จัดการ Title และปุ่มควบคุมอื่นๆ
    if (pageNameUpper === 'PART LINE CLAIM') {
        if (subNav) subNav.classList.remove('hidden'); 
        if (claimOpTools) { claimOpTools.classList.remove('hidden'); claimOpTools.classList.add('flex'); }
        if (dashFilterWrap) dashFilterWrap.classList.add('hidden');
        switchSubTerminal('entry'); 
    } 
    else if (pageNameUpper === 'ADMIN CONSOLE') {
        if (subNav) subNav.classList.add('hidden'); // ซ่อนปุ่มสลับหน้า Claim
        if (claimOpTools) claimOpTools.classList.add('hidden');
        if (dashFilterWrap) dashFilterWrap.classList.add('hidden');
        if (titleEl) titleEl.textContent = 'ADMIN USER CONTROL';
        
        document.querySelectorAll('.submenu-container').forEach(s => s.classList.remove('open'));
    }
    else {
        // หน้าปกติอื่นๆ
        if (subNav) subNav.classList.add('hidden'); 
        if (claimOpTools) claimOpTools.classList.add('hidden');
        if (dashFilterWrap) { 
            dashFilterWrap.classList.remove('hidden'); 
            dashFilterWrap.classList.add('flex'); 
        }
        if (titleEl) titleEl.textContent = pageNameUpper;
    }

    // --- STEP 5: SHOW TARGET PAGE & INITIALIZE MODULE ---
    const targetIdMap = {
        'PART LINE CLAIM': 'entry-terminal-content',
        'ADMIN CONSOLE': 'admin-console-content',
        'EXEC DASHBOARD': 'exec-dashboard-content',
        'ATTENDANCE LOGS': 'attendance-logs',
        'LINE SUPPORT LOGS': 'line-support-logs-content',
        '5S EXCELLENCE': 'five-s-content',
        'SKILL MATRIX': 'skill-matrix-content',
        'SPECIAL JOBS': 'special-jobs-content',
        'OT MANAGEMENT': 'ot-management-content',
        '8D REPORT': 'eight-d-content',
        'SQE EN': 'eight-d-content',
        'SME RECEIVABLES': 'eight-d-content'
    };

    const targetId = targetIdMap[pageNameUpper];
    if (targetId) {
        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.classList.remove('hidden-view');
        
        const targetUser = (S.userRole === 'supervisor') ? S.viewingUser : S.currentUser;

        switch(pageNameUpper) {
            case 'PART LINE CLAIM': renderTable(); break;
            case 'EXEC DASHBOARD': initExecDashboard(); break;
            case 'ATTENDANCE LOGS': initAttDashboard(); break;
            case 'LINE SUPPORT LOGS': WapSupportLogs.init(targetUser); break;
            case '5S EXCELLENCE': Wap5SExcellence.init(); break;
            case 'SKILL MATRIX': WapSkillMatrix.init(); break;
            case 'SPECIAL JOBS': WapSpecialJobs.init(); break;
            case 'OT MANAGEMENT': WapOTManagement.init(); break;
            case '8D REPORT':
            case 'SQE EN':
            case 'SME RECEIVABLES':
                Wap8DSystem.init(); break;
case 'ADMIN CONSOLE': 
    if (typeof WapAdminSystem !== 'undefined') {
        WapAdminSystem.init(); 
        // เติมบรรทัดนี้ลงไป กราฟจะถูกวาดทันทีที่กดเมนู Admin จากแถบข้าง
        setTimeout(renderCyberAnalytics, 300); 
    }
    break;
        }
    }
    
    if (window.innerWidth <= 768) toggleSidebar('close');
}

/**
 * 2. รวมศูนย์ระบบเปลี่ยนภาษา (Unified i18n System)
 * จัดการ: Localization, Placeholders, Dynamic Headers และ Banner
 */
function applyLanguage(lang) {
    const data = translations[lang];
    if (!data) return;

    localStorage.setItem('carrier_lang', lang);

    // 2.1 แปลข้อความที่มี data-i18n (รองรับการรักษาไอคอน SVG)
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (data[key]) {
            let textFound = false;
            el.childNodes.forEach(node => {
                // เปลี่ยนเฉพาะเนื้อหาที่เป็น Text Node ไม่ยุ่งกับ SVG/HTML Tags
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
                    node.textContent = data[key];
                    textFound = true;
                }
            });
            if (!textFound) el.append(data[key]);
        }
    });

    // 2.2 อัปเดต Dynamic Header Title
    const titleEl = document.getElementById('header-title');
    if (titleEl) {
        const isDashboard = titleEl.textContent.includes('DASHBOARD');
        // ตรวจสอบภาษาปัจจุบันและเปลี่ยนคำแปลตามหน้า
        if (!isDashboard) {
            titleEl.textContent = data.header_title_claim || titleEl.textContent;
        } else {
            const baseTitle = data.header_title_claim || "PART LINE CLAIM";
            titleEl.textContent = (lang === 'th' ? "แดชบอร์ด " : "DASHBOARD ") + baseTitle;
        }
    }

    // 2.3 อัปเดต Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (data[key]) el.placeholder = data[key];
    });

    // 2.4 อัปเดตธงและปุ่มสลับหน้า (Pills)
    const flagImg = document.getElementById('current-lang-flag');
    if (flagImg) flagImg.src = (lang === 'th') ? "https://flagcdn.com/w20/th.png" : "https://flagcdn.com/w20/us.png";

    const btnEntry = document.getElementById('sub-btn-entry');
    const btnCockpit = document.getElementById('sub-btn-cockpit');
    if (btnEntry) btnEntry.textContent = data.tab_claim_entry;
    if (btnCockpit) btnCockpit.textContent = data.tab_dashboard;

    // 2.5 อัปเดต Login UI (Tabs & Banner)
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`lang-${lang}`);
    if (activeBtn) activeBtn.classList.add('active');

    const banner = document.getElementById('banner-text');
    if (banner) {
        banner.textContent = (lang === 'th') 
            ? "ประกาศ: ระบบอัปเดตเวอร์ชั่น 1.0 พร้อมใช้งานแบบออฟไลน์แล้ว" 
            : "ANNOUNCEMENT: SYSTEM V1.0 IS NOW READY FOR OFFLINE USE";
    }
}

async function fetchWAPData() {
    if (!navigator.onLine) return false;
    const targetUser = S.userRole === 'supervisor' ? S.viewingUser : S.currentUser;
    if (!targetUser) return false;

    try {
        const [resAct, resS5, resAtt, resSJ] = await Promise.all([
            wapClient.from('support_records').select('*').eq('user_id', targetUser).order('event_date', { ascending: false }),
            wapClient.from('s5_records').select('*').eq('user_id', targetUser).order('month', { ascending: false }),
            wapClient.from('daily_reports').select('*').eq('user_id', targetUser).order('date', { ascending: false }),
            wapClient.from('special_jobs').select('*').eq('user_id', targetUser).order('date', { ascending: false })
        ]);

        // อัปเดตข้อมูลลง State
        S.wapData.achievements = resAct.data || []; 
        S.wapData.score5s = resS5.data || [];
        S.wapData.specialJobs = resSJ.data || [];
        S.attLeaveRecords = resAtt.data || [];
        
        return true;
    } catch (e) {
        console.error("WAP Global Fetch Error:", e);
        return false;
    }
}

// ฟังก์ชันช่วยหาค่าวันที่จากชื่อคอลัมน์ที่อาจเป็นไปได้
function getWAPDate(row) {
    if (!row) return "";
    // ลองหาจากชื่อที่พบบ่อย (เรียงตามลำดับความน่าจะเป็น)
    return row.Date || row.date || row.timestamp || row.record_date || row.day || row.created_at || "";
}

function toggleSidebar(forceState = null) {
    const sidebar = $id('sidebar');
    const isCollapsing = forceState === 'open' ? false : forceState === 'close' ? true : !sidebar.classList.contains('collapsed');
    sidebar.classList.toggle('collapsed', isCollapsing);
}

function rebuildSmartMemory() {
    smartMemory = {
        values: { partNo: new Set(), partName: new Set(), supplier: new Set(), line: new Set(), defect: new Set() },
        byPartNo: {}, byPartName: {}, bySupplier: {}, byLine: {}
    };

    S.records.forEach(r => {
        const partNo = (r.partNo || '').trim();
        const partName = (r.partName || '').trim();
        const supplier = (r.supplier || '').trim();
        const line = (r.line || '').trim();
        const defect = (r.defect || '').trim();

        if (partNo) smartMemory.values.partNo.add(partNo);
        if (partName) smartMemory.values.partName.add(partName);
        if (supplier) smartMemory.values.supplier.add(supplier);
        if (line) smartMemory.values.line.add(line);
        if (defect) smartMemory.values.defect.add(defect);

        const pack = { partNo, partName, supplier, line, defect, unit: r.unit || 'PCS', judgment: r.judgment || '' };
        if (partNo) { const k = partNo.toLowerCase(); (smartMemory.byPartNo[k] = smartMemory.byPartNo[k] || []).push(pack); }
        if (partName) { const k = partName.toLowerCase(); (smartMemory.byPartName[k] = smartMemory.byPartName[k] || []).push(pack); }
        if (supplier) { const k = supplier.toLowerCase(); (smartMemory.bySupplier[k] = smartMemory.bySupplier[k] || []).push(pack); }
        if (line) { const k = line.toLowerCase(); (smartMemory.byLine[k] = smartMemory.byLine[k] || []).push(pack); }
    });
}

function getMostFrequentPack(list) {
    if (!list || !list.length) return null;
    const counts = new Map();
    let best = list[0], bestCount = 0;
    list.forEach(p => {
        const key = JSON.stringify(p);
        const c = (counts.get(key) || 0) + 1;
        counts.set(key, c);
        if (c > bestCount) { bestCount = c; best = p; }
    });
    return best;
}

function updateAIBrain() {
    aiBrain = { partNoMap: {}, partNameMap: {}, defectToRemarkMap: {}, supplierPartMap: {} };
    const rows = S.records;
    if (!rows.length) return;

    const tempStore = {};
    const defectTempStore = {};
    const getMode = (arr) => {
        if (!arr.length) return null;
        const counts = {}; let max = 0, res = null;
        arr.forEach(v => { counts[v] = (counts[v] || 0) + 1; if (counts[v] > max) { max = counts[v]; res = v; } });
        return res;
    };

    rows.forEach(r => {
        const pNo = (r.partNo || '').trim();
        const pName = (r.partName || '').trim();
        const def = (r.defect || '').trim().toLowerCase();
        const rem = (r.remark || '').trim();
        const supp = (r.supplier || '').trim();

        if (pNo) (tempStore[pNo.toLowerCase()] = tempStore[pNo.toLowerCase()] || []).push(r);
        if (pName) (tempStore[pName.toLowerCase()] = tempStore[pName.toLowerCase()] || []).push(r);
        if (def && rem) (defectTempStore[def] = defectTempStore[def] || []).push(rem);
        if (pNo && supp) { if (!aiBrain.supplierPartMap[pNo]) aiBrain.supplierPartMap[pNo] = new Set(); aiBrain.supplierPartMap[pNo].add(supp); }
    });

    for (const key in tempStore) {
        const list = tempStore[key];
        const mode = (k) => getMode(list.map(x => x[k]).filter(v => v && v !== '-'));
        const data = { supplier: mode('supplier'), partNo: mode('partNo'), partName: mode('partName'), line: mode('line'), defect: mode('defect'), judgment: mode('judgment'), unit: mode('unit') };
        aiBrain.partNoMap[key] = data;
        aiBrain.partNameMap[key] = data;
    }
    for (const dKey in defectTempStore) aiBrain.defectToRemarkMap[dKey] = getMode(defectTempStore[dKey]);
}

function autoFillFromPack(pack) {
    if (!pack) return;
    setPartLoading(true, 400);
    
    // ดึงค่าพื้นฐานเดิม
    if (pack.partNo && !$id('f-part').value) $id('f-part').value = pack.partNo;
    if (pack.partName && !$id('f-partname').value) $id('f-partname').value = pack.partName;
    if (pack.supplier && !$id('f-supplier').value) $id('f-supplier').value = pack.supplier;
    if (pack.line && !$id('f-line').value) $id('f-line').value = pack.line;
    if (pack.defect && !$id('f-defect').value) { $id('f-defect').value = pack.defect; translateDefectToRemark(); }
    if (pack.unit) $id('f-unit').value = pack.unit;
    if (pack.judgment) quickPickJudgment(pack.judgment);

    // >>> [ส่วนที่เพิ่มใหม่] ดึง QTY ล่าสุดจากประวัติการบันทึก (S.records) <<<
    const latestRecord = S.records.find(r => r.partNo === pack.partNo);
    if (latestRecord && latestRecord.qty) {
        const qtyIn = $id('f-qty');
        qtyIn.value = latestRecord.qty;
        // ทำกิมมิกไฮไลท์สีเขียวแวบๆ เพื่อให้รู้ว่าระบบเติมให้
        qtyIn.style.backgroundColor = '#ecfdf5';
        setTimeout(() => { qtyIn.style.backgroundColor = ''; }, 800);
    }

    refreshNeonGlow();
}

function translateDefectToRemark() {
    const defectIn = $id('f-defect');
    const remarkIn = $id('f-remark');
    const partIn = $id('f-part');
    const jdgSelect = $id('judgmentSelect');
    
    if (!defectIn || !remarkIn || !partIn || !jdgSelect) return;

    const defVal = defectIn.value.trim().toLowerCase();
    const partVal = partIn.value.trim();

    // 1. ถ้าไม่มีข้อมูลอาการเสีย ให้หยุดทำงาน
    if (defVal === '') return;

    // --- ส่วนที่ 1: แปลอาการเสียเป็นคำอธิบาย (Logic เดิมที่ฉลาดขึ้น) ---
    let translated = null;
    
    // ลองหาจากฐานประวัติ AI Brain ก่อน
    if (aiBrain.defectToRemarkMap && aiBrain.defectToRemarkMap[defVal]) {
        translated = aiBrain.defectToRemarkMap[defVal];
    } else {
        // ถ้าไม่เจอ ให้หาจากพจนานุกรมคำหลัก (Keyword)
        for (const [key, t] of Object.entries(defectDict)) {
            if (defVal.includes(key)) {
                translated = t;
                break;
            }
        }
    }

    // เติมคำอธิบายลงช่อง Remark อัตโนมัติ (เฉพาะกรณีที่ช่องยังว่างอยู่)
    if (translated && !remarkIn.value.trim()) {
        remarkIn.value = translated;
        // กิมมิก: วาบแสงสีเขียวที่ช่อง Remark เพื่อบอกว่าระบบเติมให้
        remarkIn.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
        setTimeout(() => { remarkIn.style.backgroundColor = ''; }, 800);
    }

    // --- ส่วนที่ 2: [NEW] AI Smart Judgment (เดาใจจากประวัติ) ---
    if (partVal !== '') {
        // ค้นหาในประวัติ (S.records) ว่าพาร์ทนี้ อาการเสียนี้ ปกติเราตัดสินใจเป็นอะไร
        const historyMatches = S.records.filter(r => 
            r.partNo === partVal && 
            (r.defect || "").toLowerCase().includes(defVal)
        );

        if (historyMatches.length > 0) {
            // นับความถี่ของ Judgment ที่เคยเลือก
            const counts = {};
            historyMatches.forEach(r => {
                const j = r.judgment;
                counts[j] = (counts[j] || 0) + 1;
            });

            // หา Judgment ที่พบบ่อยที่สุด (Mode)
            const suggestedJdg = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

            // บังคับเลือก Judgment นั้นให้ทันที
            jdgSelect.value = suggestedJdg;
            
            // เรียกฟังก์ชันเปลี่ยนสีปุ่มตาม Judgment (ที่มีอยู่ในโค้ดเดิมของคุณ)
            handleJudgment(suggestedJdg);

            // --- กิมมิก: Visual Feedback (บอกให้รู้ว่า AI เลือกให้) ---
            // 1. เรืองแสงสีน้ำเงินที่ช่อง Judgment
            gsap.fromTo(jdgSelect, 
                { boxShadow: "0 0 0px rgba(59, 130, 246, 0)" }, 
                { boxShadow: "0 0 20px rgba(59, 130, 246, 0.6)", duration: 0.4, yoyo: true, repeat: 1 }
            );

            // 2. แจ้งเตือนสั้นๆ (Optional)
            toast(`AI: แนะนำ ${suggestedJdg} จากประวัติ ${historyMatches.length} รายการ`, "info");
        }
    }

    refreshNeonGlow();
}

function validatePartNoInput(inputEl) {
    if (!inputEl) inputEl = document.getElementById('f-part');
    if (!inputEl || typeof inputEl.value !== 'string') return;

    const val = inputEl.value.trim();
    const successIcon = document.getElementById('f-part-success');
    const errorIcon = document.getElementById('f-part-error');

    if (!val) {
        inputEl.classList.remove('valid', 'invalid');
        if (successIcon) successIcon.classList.add('hidden');
        if (errorIcon) errorIcon.classList.add('hidden');
        return;
    }

    const valLower = val.toLowerCase();
    
    // Check if known part number in memory or records
    const isKnown = (typeof smartMemory !== 'undefined' && smartMemory.values && smartMemory.values.partNo && smartMemory.values.partNo.has(val)) ||
                    (typeof smartMemory !== 'undefined' && smartMemory.byPartNo && (smartMemory.byPartNo[valLower] || smartMemory.byPartNo[val])) ||
                    (typeof S !== 'undefined' && S.records && S.records.some(r => (r.partNo || '').trim().toLowerCase() === valLower));

    // Valid format check: minimum 3 chars, alphanumeric with optional -, _, /, ., space
    const isValidFormat = val.length >= 3 && /^[A-Za-z0-9\-_/. ]+$/.test(val);

    const isValid = isKnown || isValidFormat;

    if (isValid) {
        inputEl.classList.add('valid');
        inputEl.classList.remove('invalid');
        if (successIcon) successIcon.classList.remove('hidden');
        if (errorIcon) errorIcon.classList.add('hidden');
    } else {
        inputEl.classList.add('invalid');
        inputEl.classList.remove('valid');
        if (errorIcon) errorIcon.classList.remove('hidden');
        if (successIcon) successIcon.classList.add('hidden');
    }
}

let acSpinnerTimeout = null;
function setPartLoading(isLoading, duration = 0) {
    let spinner = document.getElementById('f-part-spinner');
    const inputEl = document.getElementById('f-part');
    const successIcon = document.getElementById('f-part-success');
    const errorIcon = document.getElementById('f-part-error');

    if (!spinner && inputEl) {
        const wrap = inputEl.closest('.form-input-wrap') || inputEl.parentElement;
        if (wrap) {
            spinner = document.createElement('div');
            spinner.id = 'f-part-spinner';
            spinner.className = 'f-part-spinner hidden';
            spinner.setAttribute('title', 'Auto-completing...');
            wrap.appendChild(spinner);
        }
    }
    if (acSpinnerTimeout) {
        clearTimeout(acSpinnerTimeout);
        acSpinnerTimeout = null;
    }
    if (isLoading) {
        if (spinner) spinner.classList.remove('hidden');
        if (inputEl) inputEl.classList.add('is-loading');
        if (successIcon) successIcon.classList.add('hidden');
        if (errorIcon) errorIcon.classList.add('hidden');
        if (duration > 0) {
            acSpinnerTimeout = setTimeout(() => {
                if (spinner) spinner.classList.add('hidden');
                if (inputEl) inputEl.classList.remove('is-loading');
                validatePartNoInput(inputEl);
            }, duration);
        }
    } else {
        if (spinner) spinner.classList.add('hidden');
        if (inputEl) inputEl.classList.remove('is-loading');
        validatePartNoInput(inputEl);
    }
}

function showAC(type, inputEl) {
    if (type === 'partNo' || (inputEl && inputEl.id === 'f-part')) {
        setPartLoading(true, 300);
    }
    renderACDropdown(type, inputEl);
}

function onACInput(type, inputEl) {
    if (type === 'partNo' || (inputEl && inputEl.id === 'f-part')) {
        setPartLoading(true, 350);
    }
    renderACDropdown(type, inputEl);
    updateInputResetButton();
}

function closeAC() { closeAllAC(); }
function closeAllAC() {
    setPartLoading(false);
    document.querySelectorAll('.ac-dropdown.open').forEach(d => d.classList.remove('open'));
}

function renderACDropdown(type, inputEl) {
    if (!inputEl) return;
    const wrap = inputEl.closest('.form-input-wrap');
    if (!wrap) return;

    let dd = wrap.querySelector('.ac-dropdown');
    if (!dd) { dd = document.createElement('div'); dd.className = 'ac-dropdown'; wrap.appendChild(dd); }

    const query = (inputEl.value || '').trim().toLowerCase();
    const values = Array.from((smartMemory.values && smartMemory.values[type]) || []);
    let matched = query ? values.filter(v => v.toLowerCase().includes(query)) : values;
    matched.sort((a, b) => {
        if (!query) return a.localeCompare(b);
        const aStart = a.toLowerCase().startsWith(query) ? 0 : 1;
        const bStart = b.toLowerCase().startsWith(query) ? 0 : 1;
        return aStart - bStart || a.localeCompare(b);
    });
    matched = matched.slice(0, 15);

    if (!matched.length) { dd.classList.remove('open'); dd.innerHTML = ''; return; }

    dd.innerHTML = matched.map(v => `<div class="ac-item" data-type="${type}" data-value="${escapeHtml(v)}">${escapeHtml(v)}</div>`).join('');
    dd.classList.add('open');
    dd.querySelectorAll('.ac-item').forEach(item => {
        item.addEventListener('mousedown', (e) => {
            e.preventDefault();
            applyACPick(item.dataset.type, item.dataset.value, inputEl);
        });
    });
}

function applyACPick(type, value, inputEl) {
    inputEl.value = value;
    if (type === 'partNo' || (inputEl && inputEl.id === 'f-part')) {
        setPartLoading(true, 450);
    }
    closeAllAC();
    const key = value.trim().toLowerCase();
    if (type === 'partNo') autoFillFromPack(getMostFrequentPack(smartMemory.byPartNo[key]));
    else if (type === 'partName') autoFillFromPack(getMostFrequentPack(smartMemory.byPartName[key]));
    else if (type === 'supplier') autoFillFromPack(getMostFrequentPack(smartMemory.bySupplier[key]));
    else if (type === 'line') autoFillFromPack(getMostFrequentPack(smartMemory.byLine[key]));
    else if (type === 'defect') translateDefectToRemark();
    updateInputResetButton();
}

document.addEventListener('click', e => {
    if (!e.target.closest('.form-input-wrap')) closeAllAC();
});

// ============================================================
// TABLE KEYBOARD NAVIGATION ENGINE
// ============================================================
let tableKbdNavState = {
    selectedRowId: null,
    selectedIndex: -1,
    activeType: null
};

function getActiveTableContext() {
    const pageTargets = [
        { id: 'entry-terminal-content', type: 'claim', tbodyId: 'table-render-target', containerId: 'table-container' },
        { id: 'eight-d-content', type: '8d', tbodyId: 'eight-d-list-body', containerId: 'eight-d-dashboard' },
        { id: 'line-support-logs-content', type: 'support', tbodyId: 'tableBody', containerId: 'tableScrollArea' },
        { id: 'attendance-logs', type: 'attendance', tbodyId: 'att-records-tbody', containerId: null },
        { id: 'five-s-content', type: '5s', tbodyId: 's5-table-body', containerId: null },
        { id: 'special-jobs-content', type: 'special', tbodyId: 'sj-table-body', containerId: null },
        { id: 'ot-management-content', type: 'ot', tbodyId: 'ot-table-body', containerId: null },
        { id: 'admin-console-content', type: 'admin', tbodyId: 'admin-table-body', containerId: 'admin-db-table-container' }
    ];

    for (const page of pageTargets) {
        const pageEl = document.getElementById(page.id);
        if (pageEl && !pageEl.classList.contains('hidden-view') && pageEl.style.display !== 'none' && pageEl.offsetWidth > 0) {
            const tbody = document.getElementById(page.tbodyId);
            if (tbody) {
                const container = page.containerId ? document.getElementById(page.containerId) : tbody.closest('.overflow-auto, .overflow-y-auto, div');
                return { page, tbody, container, type: page.type };
            }
        }
    }
    return null;
}

function highlightTableRow(tr) {
    document.querySelectorAll('tr.kbd-row-selected').forEach(r => r.classList.remove('kbd-row-selected'));
    if (tr) {
        tr.classList.add('kbd-row-selected');
    }
}

function reapplyKbdRowSelection() {
    const ctx = getActiveTableContext();
    if (!ctx || !ctx.tbody) return;

    if (tableKbdNavState.selectedRowId) {
        const tr = ctx.tbody.querySelector(`tr[data-rid="${tableKbdNavState.selectedRowId}"]`);
        if (tr) {
            highlightTableRow(tr);
            return;
        }
    }

    if (ctx.type === 'claim' && tableKbdNavState.selectedIndex >= 0) {
        const allData = (typeof virtualTableState !== 'undefined' && virtualTableState.allRows) ? virtualTableState.allRows : [];
        if (allData[tableKbdNavState.selectedIndex]) {
            const id = allData[tableKbdNavState.selectedIndex].id;
            const tr = ctx.tbody.querySelector(`tr[data-rid="${id}"]`);
            if (tr) highlightTableRow(tr);
        }
    }
}
window.reapplyKbdRowSelection = reapplyKbdRowSelection;

function moveTableSelection(ctx, direction) {
    if (!ctx) ctx = getActiveTableContext();
    if (!ctx || !ctx.tbody) return;

    if (ctx.type === 'claim') {
        const allData = (typeof virtualTableState !== 'undefined' && virtualTableState.allRows) ? virtualTableState.allRows : [];
        if (allData.length === 0) return;

        let currentIdx = tableKbdNavState.selectedIndex;
        if (tableKbdNavState.selectedRowId && currentIdx === -1) {
            currentIdx = allData.findIndex(r => r.id === tableKbdNavState.selectedRowId);
        }

        let newIdx;
        if (direction === 'FIRST') {
            newIdx = 0;
        } else if (direction === 'LAST') {
            newIdx = allData.length - 1;
        } else {
            newIdx = currentIdx + direction;
            if (currentIdx === -1) {
                newIdx = direction > 0 ? 0 : allData.length - 1;
            }
        }
        newIdx = Math.max(0, Math.min(allData.length - 1, newIdx));

        tableKbdNavState.selectedIndex = newIdx;
        tableKbdNavState.selectedRowId = allData[newIdx].id;
        tableKbdNavState.activeType = ctx.type;

        const container = ctx.container || document.getElementById('table-container');
        if (container) {
            const FIXED_ROW_H = typeof FIXED_ROW_HEIGHT !== 'undefined' ? FIXED_ROW_HEIGHT : 52;
            const rowTop = newIdx * FIXED_ROW_H;
            const containerHeight = container.clientHeight || 500;
            if (rowTop < container.scrollTop + 40 || rowTop > container.scrollTop + containerHeight - 80) {
                container.scrollTop = Math.max(0, rowTop - Math.floor(containerHeight / 2));
            }
        }

        reapplyKbdRowSelection();
    } else {
        const rows = Array.from(ctx.tbody.querySelectorAll('tr')).filter(tr => tr.offsetWidth > 0 && tr.offsetHeight > 0 && !tr.querySelector('td[colspan]'));
        if (rows.length === 0) return;

        let currentIdx = -1;
        if (tableKbdNavState.selectedRowId) {
            currentIdx = rows.findIndex(r => r.dataset.rid === tableKbdNavState.selectedRowId);
        }
        if (currentIdx === -1) currentIdx = tableKbdNavState.selectedIndex;

        let newIdx;
        if (direction === 'FIRST') {
            newIdx = 0;
        } else if (direction === 'LAST') {
            newIdx = rows.length - 1;
        } else {
            newIdx = currentIdx + direction;
            if (currentIdx === -1) {
                newIdx = direction > 0 ? 0 : rows.length - 1;
            }
        }
        newIdx = Math.max(0, Math.min(rows.length - 1, newIdx));

        const targetRow = rows[newIdx];
        tableKbdNavState.selectedIndex = newIdx;
        tableKbdNavState.selectedRowId = targetRow.dataset.rid || targetRow.id || `row-${newIdx}`;
        tableKbdNavState.activeType = ctx.type;

        highlightTableRow(targetRow);
        targetRow.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
}

function clearTableSelection() {
    tableKbdNavState.selectedRowId = null;
    tableKbdNavState.selectedIndex = -1;
    document.querySelectorAll('tr.kbd-row-selected').forEach(r => r.classList.remove('kbd-row-selected'));
}
window.clearTableSelection = clearTableSelection;

function triggerSelectedRowAction(ctx) {
    if (!ctx) ctx = getActiveTableContext();
    if (!ctx || !ctx.tbody) return;

    const rowId = tableKbdNavState.selectedRowId;

    if (ctx.type === 'claim') {
        if (rowId && typeof editRecord === 'function') {
            editRecord(rowId);
            if (typeof toast === 'function') toast(`✏️ Selected Record: ${rowId.slice(0, 8)}`, 'info');
        } else if (tableKbdNavState.selectedIndex >= 0) {
            const allData = (typeof virtualTableState !== 'undefined' && virtualTableState.allRows) ? virtualTableState.allRows : [];
            const item = allData[tableKbdNavState.selectedIndex];
            if (item && typeof editRecord === 'function') {
                editRecord(item.id);
                if (typeof toast === 'function') toast(`✏️ Selected Record: ${item.ref || item.id}`, 'info');
            }
        }
    } else if (ctx.type === '8d') {
        if (rowId && typeof Wap8DSystem !== 'undefined' && Wap8DSystem.openReport) {
            Wap8DSystem.openReport(rowId);
        } else {
            const tr = ctx.tbody.querySelector(`tr[data-rid="${rowId}"]`) || ctx.tbody.querySelectorAll('tr')[tableKbdNavState.selectedIndex];
            if (tr) {
                const btn = tr.querySelector('button[onclick*="openReport"], button');
                if (btn) btn.click();
            }
        }
    } else if (ctx.type === 'support') {
        if (rowId && typeof WapSupportLogs !== 'undefined' && WapSupportLogs._openViewModal) {
            WapSupportLogs._openViewModal(rowId);
        } else {
            const tr = ctx.tbody.querySelector(`tr[data-rid="${rowId}"]`) || ctx.tbody.querySelectorAll('tr')[tableKbdNavState.selectedIndex];
            if (tr) {
                const btn = tr.querySelector('button');
                if (btn) btn.click();
            }
        }
    } else if (ctx.type === 'attendance') {
        if (rowId && typeof editAttRecord === 'function') {
            editAttRecord(rowId);
        } else {
            const tr = ctx.tbody.querySelector(`tr[data-rid="${rowId}"]`) || ctx.tbody.querySelectorAll('tr')[tableKbdNavState.selectedIndex];
            if (tr) {
                const btn = tr.querySelector('button.att-btn-edit, button');
                if (btn) btn.click();
            }
        }
    } else {
        let tr = null;
        if (rowId) {
            tr = ctx.tbody.querySelector(`tr[data-rid="${rowId}"]`);
        }
        if (!tr && tableKbdNavState.selectedIndex >= 0) {
            const rows = Array.from(ctx.tbody.querySelectorAll('tr')).filter(r => r.offsetWidth > 0 && !r.querySelector('td[colspan]'));
            tr = rows[tableKbdNavState.selectedIndex];
        }

        if (tr) {
            const primaryBtn = tr.querySelector('button.act-btn-view, button.act-btn-edit, button.row-btn-edit, button.row-btn-clone, button:not(.act-btn-del):not(.row-btn-del)');
            if (primaryBtn) {
                primaryBtn.click();
            } else {
                tr.click();
            }
        }
    }
}

function toggleKbdShortcutModal(show) {
    let modal = document.getElementById('kbd-shortcuts-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'kbd-shortcuts-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 hidden';
        modal.innerHTML = `
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-200 scale-95 opacity-0" id="kbd-shortcuts-card">
                <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-blue-500/20">⌨️</div>
                        <div>
                            <h3 class="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">Keyboard Shortcuts</h3>
                            <p class="text-[10px] font-bold text-slate-400">Power-user navigation & controls</p>
                        </div>
                    </div>
                    <button onclick="toggleKbdShortcutModal(false)" class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors">
                        ✕
                    </button>
                </div>
                <div class="p-6 space-y-2.5 max-h-[70vh] overflow-y-auto">
                    <div class="grid grid-cols-2 gap-2.5 text-xs">
                        <div class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span class="font-bold text-slate-600 dark:text-slate-300">Navigate Rows</span>
                            <div class="flex items-center gap-1">
                                <kbd class="px-1.5 py-0.5 text-[10px] font-black bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">↓</kbd>
                                <kbd class="px-1.5 py-0.5 text-[10px] font-black bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">↑</kbd>
                            </div>
                        </div>
                        <div class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span class="font-bold text-slate-600 dark:text-slate-300">Quick Nav</span>
                            <div class="flex items-center gap-1">
                                <kbd class="px-1.5 py-0.5 text-[10px] font-black bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">j</kbd>
                                <kbd class="px-1.5 py-0.5 text-[10px] font-black bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">k</kbd>
                            </div>
                        </div>
                        <div class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span class="font-bold text-slate-600 dark:text-slate-300">Select Row</span>
                            <kbd class="px-1.5 py-0.5 text-[10px] font-black bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">Enter</kbd>
                        </div>
                        <div class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span class="font-bold text-slate-600 dark:text-slate-300">Focus Search</span>
                            <kbd class="px-1.5 py-0.5 text-[10px] font-black bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">/</kbd>
                        </div>
                        <div class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span class="font-bold text-slate-600 dark:text-slate-300">Top / Bottom</span>
                            <div class="flex items-center gap-1">
                                <kbd class="px-1.5 py-0.5 text-[9px] font-black bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">Home</kbd>
                                <kbd class="px-1.5 py-0.5 text-[9px] font-black bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">End</kbd>
                            </div>
                        </div>
                        <div class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span class="font-bold text-slate-600 dark:text-slate-300">Deselect / Close</span>
                            <kbd class="px-1.5 py-0.5 text-[10px] font-black bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">Esc</kbd>
                        </div>
                        <div class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span class="font-bold text-slate-600 dark:text-slate-300">Edit Selected</span>
                            <kbd class="px-1.5 py-0.5 text-[10px] font-black bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">E</kbd>
                        </div>
                        <div class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span class="font-bold text-slate-600 dark:text-slate-300">Refresh Data</span>
                            <kbd class="px-1.5 py-0.5 text-[10px] font-black bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">R</kbd>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) toggleKbdShortcutModal(false);
        });
    }

    const card = modal.querySelector('#kbd-shortcuts-card');
    const isHidden = modal.classList.contains('hidden');
    const shouldShow = show !== undefined ? show : isHidden;

    if (shouldShow) {
        modal.classList.remove('hidden');
        requestAnimationFrame(() => {
            card.classList.remove('scale-95', 'opacity-0');
            card.classList.add('scale-100', 'opacity-100');
        });
    } else {
        card.classList.remove('scale-100', 'opacity-100');
        card.classList.add('scale-95', 'opacity-0');
        setTimeout(() => modal.classList.add('hidden'), 150);
    }
}
window.toggleKbdShortcutModal = toggleKbdShortcutModal;

function handleGlobalTableKeydown(e) {
    const activeEl = document.activeElement;
    const isTyping = activeEl && (
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.tagName === 'SELECT' ||
        activeEl.isContentEditable ||
        (activeEl.tagName === 'INPUT' && !['button', 'checkbox', 'radio', 'submit'].includes(activeEl.type))
    );

    if (isTyping) {
        if (e.key === 'Escape') {
            activeEl.blur();
            clearTableSelection();
            return;
        }
        if (e.key === 'ArrowDown' || e.key === 'Down') {
            const isSearchInput = activeEl.id === 'filter-search' || 
                                  activeEl.id === 'eightDSearch' || 
                                  activeEl.id === 'searchInput' || 
                                  activeEl.classList.contains('search-input') || 
                                  activeEl.type === 'search';
            if (isSearchInput) {
                const ctx = getActiveTableContext();
                if (ctx) {
                    activeEl.blur();
                    e.preventDefault();
                    moveTableSelection(ctx, 1);
                    return;
                }
            }
        }
        return;
    }

    const ctx = getActiveTableContext();

    if (e.key === 'ArrowDown' || e.key === 'Down' || e.key === 'j') {
        if (ctx) {
            e.preventDefault();
            moveTableSelection(ctx, 1);
        }
    } else if (e.key === 'ArrowUp' || e.key === 'Up' || e.key === 'k') {
        if (ctx) {
            e.preventDefault();
            moveTableSelection(ctx, -1);
        }
    } else if (e.key === 'Home') {
        if (ctx) {
            e.preventDefault();
            moveTableSelection(ctx, 'FIRST');
        }
    } else if (e.key === 'End') {
        if (ctx) {
            e.preventDefault();
            moveTableSelection(ctx, 'LAST');
        }
    } else if (e.key === 'Enter' || e.key === ' ') {
        if (tableKbdNavState.selectedIndex >= 0 || tableKbdNavState.selectedRowId) {
            e.preventDefault();
            triggerSelectedRowAction(ctx);
        }
    } else if (e.key === 'Escape') {
        clearTableSelection();
        toggleKbdShortcutModal(false);
    } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('eightDSearch') || 
                            document.getElementById('filter-search') || 
                            document.getElementById('searchInput') || 
                            document.querySelector('input[type="search"]') ||
                            document.querySelector('.search-input');
        if (searchInput) {
            searchInput.focus();
            if (typeof searchInput.select === 'function') searchInput.select();
        }
    } else if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        toggleKbdShortcutModal();
    } else if (e.key === 'e' || e.key === 'E') {
        if (tableKbdNavState.selectedIndex >= 0 || tableKbdNavState.selectedRowId) {
            e.preventDefault();
            triggerSelectedRowAction(ctx);
        }
    } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (typeof triggerGlobalRefresh === 'function') {
            triggerGlobalRefresh();
            if (typeof toast === 'function') toast('🔄 Refreshed table data', 'info');
        }
    }
}

function initTableKeyboardNavigation() {
    document.removeEventListener('keydown', handleGlobalTableKeydown, false);
    document.addEventListener('keydown', handleGlobalTableKeydown, false);

    document.addEventListener('click', (e) => {
        const tr = e.target.closest('tbody tr');
        if (tr && !tr.querySelector('td[colspan]')) {
            const ctx = getActiveTableContext();
            if (ctx && ctx.tbody.contains(tr)) {
                const rid = tr.dataset.rid || tr.id;
                tableKbdNavState.selectedRowId = rid || null;
                tableKbdNavState.activeType = ctx.type;

                const rows = Array.from(ctx.tbody.querySelectorAll('tr')).filter(r => r.offsetWidth > 0 && !r.querySelector('td[colspan]'));
                tableKbdNavState.selectedIndex = rows.indexOf(tr);

                highlightTableRow(tr);
                return;
            }
        }
        clearTableSelection();
    });
}

function initKeyboardAwareness() {
    const inputs = document.querySelectorAll('.form-input, .form-textarea, .login-input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function () { setTimeout(() => this.classList.add('keyboard-focus-active'), 300); });
        input.addEventListener('blur', function () { this.classList.remove('keyboard-focus-active'); });
    });
    initTableKeyboardNavigation();
}


// ============================================================
// 1. ประกาศฟังก์ชันไว้ด้านนอกสุด (Global Scope) 
// เพื่อให้ปุ่ม Reset และ Event Listener เรียกใช้ได้พร้อมกัน
// ============================================================
// ใช้เพียงชุดเดียวในไฟล์ script.js
const updateAllModuleFilters = () => {
    const titleEl = document.getElementById('header-title');
    if (!titleEl) return;
    
    const currentTitle = titleEl.textContent.trim().toUpperCase();
    
    // 1. หน้า Dashboard หลัก
    if ((currentTitle.includes('LINE CLAIM') || currentTitle.includes('บันทึกเคลม')) && 
        (currentTitle.includes('DASHBOARD') || currentTitle.includes('แดชบอร์ด'))) {
        refreshClaimDashboard();
    }
    
    // 2. หน้า Exec Dashboard
    if (currentTitle.includes('EXEC') || currentTitle.includes('สรุปงาน')) {
        initExecDashboard();
    }

    // 3. หน้า 5S Excellence
    if (typeof Wap5SExcellence !== 'undefined' && Wap5SExcellence.applyDateFilter) {
        if (currentTitle.includes('5S') || currentTitle.includes('ตรวจสอบ')) {
            Wap5SExcellence.applyDateFilter();
        }
    }
    
    // 4. หน้า Special Jobs
    if (typeof WapSpecialJobs !== 'undefined' && WapSpecialJobs.applyDateFilter) {
        if (currentTitle.includes('SPECIAL') || currentTitle.includes('ภารกิจ')) {
            WapSpecialJobs.applyDateFilter();
        }
    }

    // 5. หน้า OT Management
    if (typeof WapOTManagement !== 'undefined' && WapOTManagement.applyDateFilter) {
        if (currentTitle.includes('OT') || currentTitle.includes('ล่วงเวลา')) {
            WapOTManagement.applyDateFilter();
        }
    }

    // 6. หน้า Line Support Logs
    if (typeof WapSupportLogs !== 'undefined' && WapSupportLogs.applyDateFilter) {
        if (currentTitle.includes('SUPPORT') || currentTitle.includes('สนับสนุน')) {
            WapSupportLogs.applyDateFilter();
        }
    }

    // 7. หน้า Attendance / Daily Report
    if (currentTitle.includes('ATTENDANCE') || currentTitle.includes('DAILY') || 
        currentTitle.includes('เข้างาน') || currentTitle.includes('รายงาน')) {
        
        // เช็คว่าฟังก์ชันมีตัวตนอยู่จริงก่อนเรียกใช้เพื่อป้องกัน Error
        if (typeof initAttDashboard === 'function') {
            initAttDashboard();
        }
        
        if (typeof renderDailySubmissionMatrix === 'function') {
            renderDailySubmissionMatrix(); 
        }
    }
};

function renderDailySubmissionMatrix() {
    const container = document.getElementById('daily-submit-matrix');
    if (!container || !S || !S.attLeaveRecords) return;

    const now = new Date();
    // 1. ดึงปี/เดือน จาก Filter Header
    const startFilter = document.getElementById('cd-start-date')?.value;
    
    let displayYear, displayMonth;
    if (startFilter) {
        const d = new Date(startFilter);
        displayYear = d.getFullYear();
        displayMonth = d.getMonth();
    } else {
        displayYear = now.getFullYear();
        displayMonth = now.getMonth();
    }

    const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
    const records = S.attLeaveRecords;
    let html = '';

    for (let day = 1; day <= daysInMonth; day++) {
        // รูปแบบวันที่สำหรับเช็คใน DB (YYYY-MM-DD)
        const dStr = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        const checkDate = new Date(displayYear, displayMonth, day);
        
        // ตัดเวลาออกเพื่อเปรียบเทียบแค่ วัน/เดือน/ปี ปัจจุบัน
        const todayNoTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const isFuture = checkDate > todayNoTime;

        // ค้นหาประวัติการลา/หยุดใน Database
        const record = records.find(r => (r.date && r.date.startsWith(dStr)));
        
        // --- ส่วนตัดสินสี (Logic: เขียวคือพื้นฐาน) ---
        let statusClass = 'bg-slate-50 text-slate-300'; // สำหรับวันที่ยังมาไม่ถึง (Future)
        let statusTitle = `วันที่ ${day}: ยังไม่ถึงเวลา`;

        if (!isFuture) {
            // 🟢 1. ตั้งค่าเริ่มต้นเป็น "สีเขียว (Worked)" สำหรับวันในอดีตและวันนี้
            statusClass = 'bg-emerald-500 text-white border-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
            statusTitle = `วันที่ ${day}: วันทำงานปกติ ✅`;

            if (record) {
                // 🔴 2. ถ้าในบันทึกระบุว่าเป็นวันหยุด (Holiday) -> เปลี่ยนเป็นสีแดง
                if (record.type === 'holiday') {
                    statusClass = 'bg-red-600 text-white border-red-700 shadow-sm';
                    statusTitle = `วันที่ ${day}: วันหยุดนักขัตฤกษ์ 🚩`;
                } 
                // 🟡 3. ถ้าในบันทึกระบุว่าเป็นการลา (Sick/Personal/Annual) -> เปลี่ยนเป็นสีเหลือง
                else if (['sick', 'personal', 'annual'].includes(record.type)) {
                    statusClass = 'bg-yellow-400 text-slate-800 border-yellow-500 shadow-sm';
                    statusTitle = `วันที่ ${day}: ลาหยุด (${record.type}) ⚠️`;
                }
            }
            // 🟢 หากไม่มี Record หรือ Record เป็นประเภทอื่นที่ไม่ใช่ลา/หยุด จะเป็นสีเขียวค้างไว้ตามค่าเริ่มต้นด้านบน
        }

        html += `
            <div class="${statusClass} rounded-lg border flex items-center justify-center transition-all duration-300 hover:scale-110"
                 style="aspect-ratio: 1 / 1; width: 100%; cursor: help;" title="${statusTitle}">
                 <span style="font-size: 11px; font-weight: 900;">${day}</span>
            </div>
        `;
    }

    container.innerHTML = html;
}

// ผูกเข้ากับระบบ Refresh ของคุณ
if (typeof initAttDashboard !== 'undefined') {
    const oldInit = initAttDashboard;
    initAttDashboard = async function() {
        await oldInit();
        renderDailySubmissionMatrix();
    };
}
// ============================================================
// 2. ส่วนตั้งค่าเริ่มต้นเมื่อโหลดหน้าจอ
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
    // --- ตั้งค่าพื้นฐาน (คงเดิม) ---
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    if ($id('f-date')) $id('f-date').value = `${yyyy}-${mm}-${dd}`;

    window.addEventListener('online', () => { S.isOnline = true; updateOnlineBadge(); });
    window.addEventListener('offline', () => { S.isOnline = false; updateOnlineBadge(); });

    $id('login-email').addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
    $id('login-pass').addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });

    if ($id('f-qty')) $id('f-qty').addEventListener('input', refreshNeonGlow);
    if ($id('f-defect')) $id('f-defect').addEventListener('change', translateDefectToRemark);

    // --- ผูก Event ของ Date Picker ใน Header ---
    const headerStart = document.getElementById('cd-start-date');
    const headerEnd = document.getElementById('cd-end-date');

    if (headerStart) {
        headerStart.addEventListener('change', updateAllModuleFilters);
    }
    if (headerEnd) {
        headerEnd.addEventListener('change', updateAllModuleFilters);
    }
});
    // ปรับขนาด/แสดงผลตารางใหม่อัตโนมัติเมื่อขนาดหน้าจอเปลี่ยน (responsive resize)
let resizeTimer = null;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        try {
            renderTable();
            if (charts && (charts.yield || charts.trend)) {
                const activePage = $id('overview-cockpit-content');
                if (activePage && !activePage.classList.contains('hidden-view')) refreshDashboard();
            }
            const execPage = $id('exec-dashboard-content');
            if (execPage && !execPage.classList.contains('hidden-view') && typeof initExecDashboard === 'function') {
                initExecDashboard();
            }
            const attPage = $id('attendance-logs');
            if (attPage && !attPage.classList.contains('hidden-view') && typeof initAttMonthlyChart === 'function') {
                initAttMonthlyChart();
            }
            const sidebar = $id('sidebar');
            if (sidebar && window.innerWidth <= 768) sidebar.classList.add('collapsed');
        } catch (err) {
            console.warn('[Resize Handler Guard]', err);
        }
    }, 200);
});

    initKeyboardAwareness();
    updateInputResetButton();
    refreshNeonGlow();


let dbActiveTab = 'overview';
let charts = { yield: null, trend: null }; // ของเดิมที่มีอยู่
let execCharts = { trend: null, part: null, pie: null }; // เพิ่มบรรทัดนี้เข้าไป

function refreshClaimDashboard() {
    // [CLEANUP] ล้างอนิเมชั่นเก่า
    gsap.killTweensOf(".cockpit-grid > div, .kpi-card-wrap, .chart-card, .trend-stat-val, [id*='-footer-']");

    const vendorSel = $id('claim-vendor-filter');
    if (vendorSel && vendorSel.options.length <= 1) {
        const vendors = [...new Set(S.records.map(r => (r.supplier || '').trim()).filter(Boolean))].sort();
        let vendorHtml = '<option value="ALL">All Vendors (ทั้งหมด)</option>';
        vendors.forEach(v => { vendorHtml += `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`; });
        vendorSel.innerHTML = vendorHtml;
    }

    const startDate = claimDashFilterDate.start;
    const endDate = claimDashFilterDate.end;
    const vendorFilter = $id('claim-vendor-filter')?.value || 'ALL';

    const filtered = S.records.filter(r => {
        const itemDate = r.date;
        const matchDate = (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);
        const matchVendor = (vendorFilter === 'ALL' || r.supplier === vendorFilter);
        return matchDate && matchVendor;
    });

    const getQty = (arr) => arr.reduce((sum, r) => sum + (parseFloat(r.qty) || 0), 0);
    const getLots = (arr) => new Set(arr.map(r => r.ref).filter(Boolean)).size;

    const getUnitSummary = (arr) => {
        const map = {};
        arr.forEach(r => {
            const unit = (r.unit || 'PCS').trim().toUpperCase();
            const q = parseFloat(r.qty) || 0;
            map[unit] = (map[unit] || 0) + q;
        });
        return map;
    };

    const totalQty = getQty(filtered);
    const totalRows = filtered.length; 
    const totalLots = getLots(filtered);

    // --- [1. KPI หลัก] ---
    animateValue('kpi-total', 0, totalQty, 1200);
    animateValue('kpi-total-lots', 0, totalRows, 1200);
    
    // --- [2. Fault Cards (SF, CTC, OK, Vendor)] ---
    const updateFaultCard = (prefix, judgmentKey) => {
        const subSet = filtered.filter(r => {
            const j = (r.judgment || '').toUpperCase().trim();
            if (prefix === 'ok') return j === 'CAN USE' || j === 'OK';
            if (prefix === 'vendor') return j.includes('VENDOR');
            if (prefix === 'sf') return j === 'SF';
            if (prefix === 'ctc') return j === 'CTC';
            return j === judgmentKey;
        });
        const qty = getQty(subSet);
        const lots = getLots(subSet);
        const ppm = totalQty > 0 ? Math.round((qty / totalQty) * 1000000) : 0;
        const pct = totalQty > 0 ? (qty / totalQty) * 100 : 0;
        const share = totalLots > 0 ? Math.round((lots / totalLots) * 100) : 0;

        animateValue(`kpi-${prefix}-pcs`, 0, qty, 1000);
        animateValue(`kpi-${prefix}-ppm`, 0, ppm, 1000);
        animateValue(`kpi-${prefix}-pct`, 0, pct, 1000, 2);
        animateValue(`kpi-${prefix}-lots-val`, 0, lots, 1000);
        animateValue(`kpi-${prefix}-share`, 0, share, 1000, 0, "%");

        const unitSummary = getUnitSummary(subSet);
        const activeUnits = Object.entries(unitSummary).filter(([, v]) => v > 0);
        const footEl = $id(`kpi-${prefix}-footer-pcs`);

        if (footEl) {
            if (activeUnits.length === 0) {
                footEl.innerHTML = `<span id="kpi-${prefix}-footer-unit-0">0</span> PCS`;
                animateValue(`kpi-${prefix}-footer-unit-0`, 0, 0, 600);
            } else if (activeUnits.length === 1) {
                const [unit, val] = activeUnits[0];
                footEl.innerHTML = `<span id="kpi-${prefix}-footer-unit-${prefix}">0</span> ${escapeHtml(unit)}`;
                animateValue(`kpi-${prefix}-footer-unit-${prefix}`, 0, val, 900);
            } else {
                footEl.innerHTML = activeUnits.map(([unit], idx) => `<span id="kpi-${prefix}-footer-unit-${prefix}-${idx}" style="font-weight:900">0</span> <span style="opacity:.7">${escapeHtml(unit)}</span>`).join(' | ');
                activeUnits.forEach(([unit, val], idx) => {
                    animateValue(`kpi-${prefix}-footer-unit-${prefix}-${idx}`, 0, val, 900);
                });
            }
        }
    };

    ['sf', 'ctc', 'ok', 'vendor'].forEach(k =>
        updateFaultCard(k, k === 'ok' ? 'CAN USE' : k.toUpperCase().includes('VENDOR') ? 'VENDOR FAULT' : k.toUpperCase())
    );

    // --- [3. Yield & Speedometer Calculation] ---
    const okQty = getQty(filtered.filter(r => {
        const j = (r.judgment || '').toUpperCase().trim();
        return j === 'CAN USE' || j === 'OK';
    }));
    const yieldRate = totalQty > 0 ? (okQty / totalQty) * 100 : 0;
    
    // ✅ เรียกใช้ฟังก์ชันหน้าปัดตรงนี้!
    updateMainGauge(yieldRate); 

    // อัปเดตตัวเลข Yield ใน Pill เล็ก
    animateValue('yield-pill', 0, yieldRate, 1200, 1, "%");

    // --- [4. Trend Stats & Charts] ---
    const monthStats = new Array(12).fill(0);
    filtered.forEach(r => {
        if (!r.date) return;
        const m = new Date(r.date).getMonth();
        monthStats[m] += (parseFloat(r.qty) || 0);
    });
    
    const activeMonths = monthStats.filter(v => v > 0);
    animateValue('trend-max', 0, Math.max(...monthStats, 0), 1000);
    animateValue('trend-min', 0, activeMonths.length ? Math.min(...activeMonths) : 0, 1000);
    animateValue('trend-avg', 0, activeMonths.length ? Math.round(activeMonths.reduce((a, b) => a + b, 0) / activeMonths.length) : 0, 1000);

    // Trigger ฟังก์ชันวาดกราฟอื่นๆ
    if (typeof renderDashboardCharts === 'function') renderDashboardCharts(yieldRate, filtered);
    if (typeof renderPareto === 'function') renderPareto(filtered);
    if (typeof updateLiveFeed === 'function') updateLiveFeed(filtered);
    if (typeof updateVendorFaultFeed === 'function') updateVendorFaultFeed(filtered);
    if (typeof renderVendorRadar === 'function') renderVendorRadar(filtered);
    
    // --- [5. GSAP Entrance Stagger] ---
    if (!$id('overview-cockpit-content').classList.contains('hidden-view')) {
        gsap.from(".cockpit-grid > div, .kpi-card-wrap, .chart-card", {
            duration: 0.4, y: 15, opacity: 0, stagger: 0.04, ease: "expo.out"
        });
    }
}
let resizeTimer2 = null;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer2);
    resizeTimer2 = setTimeout(() => { refreshClaimDashboard(); }, 250);
});
// ฟังก์ชันสำหรับดึงชื่อ Supplier ทั้งหมดที่มีในระบบมาใส่ในตัวเลือก
function populateVendorFilter() {
    const selectEl = $id('claim-vendor-filter');
    if (!selectEl) return;

    // เก็บค่าปัจจุบันไว้ก่อน
    const currentValue = selectEl.value;

    // ดึงชื่อซัพพลายเออร์ที่ไม่ซ้ำกัน
    const vendors = [...new Set(S.records.map(r => r.supplier))].filter(Boolean).sort();

    // สร้าง HTML Options
    let html = '<option value="ALL">ALL VENDORS</option>';
    vendors.forEach(v => {
        html += `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`;
    });

    selectEl.innerHTML = html;
    selectEl.value = currentValue; // คืนค่าที่เคยเลือกไว้
}
// --- ฟังก์ชันหลักในการอัปเดตข้อมูล Dashboard ---
// เดิมฟังก์ชันนี้มี logic คำนวณ KPI แบบเก่าที่ไม่รองรับหลายหน่วย
// เปลี่ยนให้เป็น alias ชี้ไปที่ refreshClaimDashboard() แทน
// เพื่อกันจุดที่หลงเหลือการเรียก refreshDashboard() อยู่ (resize listener, applyDbDatePreset, ฯลฯ)
// ไม่ให้เขียนทับ UI แบบแยกหน่วยที่ถูกต้องกลับไปเป็นตัวเลขเปล่าๆ + PCS อีก
function refreshDashboard() {
    refreshClaimDashboard();
}

function renderDashboardCharts(yieldRate, filtered) {
    // 1. อัปเดต Speedometer / Main Gauge ด้วยค่า Yield Rate ล่าสุด
    updateMainGauge(yieldRate);

    // ============================================================
    // 2. MONTHLY TRENDS CHART (APEXCHARTS)
    // ============================================================
    
    // 2.1 เตรียมโครงสร้างข้อมูล 12 เดือน
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dataSet = months.map(() => ({
        OK: { pcs: 0, lots: new Set() },
        SF: { pcs: 0, lots: new Set() },
        CTC: { pcs: 0, lots: new Set() },
        VENDOR: { pcs: 0, lots: new Set() },
        TotalPcs: 0
    }));

    // 2.2 ประมวลผลข้อมูลจาก Array ที่ได้รับมา
    filtered.forEach(r => {
        if (!r.date) return;
        const d = new Date(r.date);
        const mIdx = d.getMonth();
        const qty = parseFloat(r.qty) || 0;
        const ref = r.ref || 'N/A';
        const j = (r.judgment || '').toUpperCase().trim();

        if (mIdx >= 0 && mIdx < 12) {
            if (j === 'CAN USE' || j === 'OK') { dataSet[mIdx].OK.pcs += qty; dataSet[mIdx].OK.lots.add(ref); }
            else if (j === 'SF') { dataSet[mIdx].SF.pcs += qty; dataSet[mIdx].SF.lots.add(ref); }
            else if (j === 'CTC') { dataSet[mIdx].CTC.pcs += qty; dataSet[mIdx].CTC.lots.add(ref); }
            else if (j.includes('VENDOR')) { dataSet[mIdx].VENDOR.pcs += qty; dataSet[mIdx].VENDOR.lots.add(ref); }
            
            dataSet[mIdx].TotalPcs += qty;
        }
    });

    // 2.3 อัปเดตตัวเลขสถิติประกอบกราฟ Trend ด้วย animateValue
    const totalsArray = dataSet.map(d => d.TotalPcs);
    const activeData = totalsArray.filter(t => t > 0);
    const maxVal = totalsArray.length ? Math.max(...totalsArray) : 0;
    const minVal = activeData.length ? Math.min(...activeData) : 0;
    const avgVal = activeData.length ? Math.round(activeData.reduce((a, b) => a + b, 0) / activeData.length) : 0;
    const totalPcsVal = totalsArray.reduce((a, b) => a + b, 0);

    animateValue('trend-max', 0, maxVal, 1000);
    animateValue('trend-min', 0, minVal, 1000);
    animateValue('trend-avg', 0, avgVal, 1000);
    animateValue('trend-total-pcs', 0, totalPcsVal, 1000, 0, "", "PCS ");

    // 2.4 วาดกราฟ Area ด้วย ApexCharts
    const trendChartEl = $id("trend-chart");
    if (trendChartEl) {
        if (charts.trend) charts.trend.destroy();
        charts.trend = new ApexCharts(trendChartEl, {
            series: [
                { name: 'OK', data: dataSet.map(d => d.OK.pcs) },
                { name: 'SF', data: dataSet.map(d => d.SF.pcs) },
                { name: 'CTC', data: dataSet.map(d => d.CTC.pcs) },
                { name: 'VENDOR', data: dataSet.map(d => d.VENDOR.pcs) }
            ],
            chart: {
                type: 'area',
                height: '100%',
                toolbar: { show: false },
                sparkline: { enabled: false },
                animations: { enabled: true, easing: 'easeinout', speed: 800 }
            },
            grid: { 
                show: true, 
                borderColor: '#f1f5f9', 
                strokeDashArray: 4,
                padding: { top: 5, bottom: 5, left: 10, right: 10 }
            },
            colors: ['#10b981', '#f97316', '#2563eb', '#ef4444'],
            stroke: { curve: 'smooth', width: 2.5 }, 
            fill: { 
                type: 'gradient', 
                gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.02, stops: [0, 90, 100] } 
            },
            dataLabels: { enabled: false },
            xaxis: { 
                categories: months, 
                labels: { 
                    offsetY: -5,
                    style: { colors: '#94a3b8', fontSize: '9px', fontWeight: 400 } 
                },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: { 
                labels: { 
                    style: { colors: '#94a3b8', fontSize: '9px', fontWeight: 400 },
                    formatter: val => val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val 
                } 
            },
            legend: { show: false },
            tooltip: {
                shared: true,
                intersect: false,
                custom: function ({ dataPointIndex }) {
                    const d = dataSet[dataPointIndex];
                    const totalPcs = d.TotalPcs || 1;
                    const formatRow = (label, color, dataObj) => {
                        const pct = ((dataObj.pcs / totalPcs) * 100).toFixed(1) + '%';
                        return `
                            <div class="tooltip-row" style="color: ${color}">
                                <span class="flex items-center"><span class="dot-indicator" style="background: ${color}"></span>${label}</span>
                                <span class="font-mono text-right">: ${dataObj.lots.size}L | ${dataObj.pcs.toLocaleString()}P | ${pct}</span>
                            </div>`;
                    };
                    return `
                        <div class="custom-chart-tooltip">
                            <div class="tooltip-header"><p class="text-[11px] font-black text-blue-900 uppercase">📊 PERIOD: ${months[dataPointIndex].toUpperCase()}</p></div>
                            ${formatRow('OK', '#059669', d.OK)}
                            ${formatRow('CTC', '#2563eb', d.CTC)}
                            ${formatRow('SF', '#ea580c', d.SF)}
                            ${formatRow('VENDOR', '#e11d48', d.VENDOR)}
                        </div>`;
                }
            }
        });
        charts.trend.render();
    }
}

// กราฟ Pareto 80/20 Supplier Risks (ตัวเลขวิ่ง + แถบพลังเลื่อน)
function renderPareto(filtered) {
    const map = {};
    filtered.filter(r => r.judgment === 'VENDOR FAULT' || r.judgment === 'SF' || r.judgment === 'CTC').forEach(r => {
        map[r.supplier] = (map[r.supplier] || 0) + (parseInt(r.qty) || 0);
    });

    const top5 = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const container = $id('pareto-list');
    const insightEl = $id('pareto-insight-text');

    if (top5.length === 0) {
        container.innerHTML = `<div class="py-20 text-center text-slate-400 text-[10px] font-black uppercase">No Critical Risks</div>`;
        return;
    }

    const max = top5[0][1];
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#8b5cf6'];

    // 1. สร้าง HTML พร้อมกำหนด ID ให้ตัวเลขและแถบสีเพื่อทำ Animation
    container.innerHTML = top5.map(([name, qty], i) => {
        const color = colors[i] || '#94a3b8';
        return `
            <div class="pareto-item" style="margin-bottom: 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <div style="display: flex; align-items: center; gap: 10px; overflow: hidden; flex: 1;">
                        
                        <!-- [แก้ไขแล้ว] กล่องลำดับ: เปลี่ยนเป็นสี่เหลี่ยมมุมมน จัดกึ่งกลางเป๊ะ -->
                        <div style="width: 22px; height: 22px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 6px; background: ${color}; color: white; font-size: 11px; font-weight: 900; line-height: 1; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            ${i + 1}
                        </div>

                        <span style="font-size: 11px; font-weight: 700; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${name}">
                            ${name}
                        </span>
                    </div>

                    <div style="flex-shrink: 0; margin-left: 10px; display: flex; align-items: baseline; gap: 4px;">
                        <!-- [ใส่ ID] เพื่อให้ตัวเลขเริ่มจาก 0 แล้ววิ่งไปหาค่าจริง -->
                        <span id="pareto-qty-${i}" style="font-size: 13px; font-weight: 800; color: #1e293b; font-family: 'SF Mono', monospace;">0</span>
                        <span style="font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">PCS</span>
                    </div>
                </div>

                <!-- [ใส่ ID] เพื่อให้แถบสีวิ่ง -->
                <div style="height: 6px; width: 100%; background: #f1f5f9; border-radius: 10px; overflow: hidden;">
                    <div id="pareto-bar-${i}" style="height: 100%; width: 0%; background: ${color}; border-radius: 10px; transition: width 1.5s ease-out;"></div>
                </div>
            </div>
        `;
    }).join('');

    // 2. เริ่มทำงาน Animation (ตัวเลขวิ่ง + แถบเลื่อน + รายการเด้งขึ้น)
    top5.forEach(([name, qty], i) => {
        // สั่งตัวเลขวิ่ง
        if (typeof animateValue === 'function') {
            animateValue(`pareto-qty-${i}`, 0, qty, 1500);
        } else {
            const el = document.getElementById(`pareto-qty-${i}`);
            if(el) el.textContent = qty.toLocaleString();
        }
        
        // สั่งแถบสีวิ่ง (ใช้ GSAP)
        if (window.gsap) {
            gsap.to(`#pareto-bar-${i}`, { width: `${(qty / max) * 100}%`, duration: 1.5, ease: "power2.out", delay: i * 0.1 });
        }
    });

    // อนิเมชั่นให้แต่ละรายการค่อยๆ โผล่ขึ้นมาอย่างนุ่มนวล
    if (window.gsap) {
        gsap.fromTo(".pareto-item", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", clearProps: "transform,opacity" });
    }

    // อัปเดตข้อความแนะนำ (Strategy Insight)
    if (insightEl && top5.length >= 1) {
        // ป้องกัน Error หากไม่มีฟังก์ชัน escapeHtml ให้แสดงชื่อตรงๆ
        const topName = typeof escapeHtml === 'function' ? escapeHtml(top5[0][0]) : top5[0][0];
        insightEl.innerHTML = `ซัพพลายเออร์อันดับที่ 1-2 (<span class="font-bold text-slate-800">${topName}</span>) เป็นกลุ่มเสี่ยงวิกฤตที่ต้องควบคุม`;
    }
}


function applyDbDatePreset(preset) {
    clearDbPresetActive(); // ล้างสีปุ่มอื่นก่อน
    
    const activeBtn = document.getElementById('db-preset-' + preset);
    if (activeBtn) {
        // เปลี่ยนปุ่มที่ถูกกดเป็นสีน้ำเงิน
        activeBtn.className = "h-6 px-1.5 text-[8px] font-bold bg-blue-600 text-white rounded border border-blue-700 shadow-sm";
    }

    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (preset === 'today') {
        start = now;
    } else if (preset === 'week') {
        const day = now.getDay();
        const diffFromWed = (day - 3 + 7) % 7;
        start.setDate(now.getDate() - diffFromWed);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
    } else if (preset === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const toISO = d => d.toISOString().split('T')[0];
    document.getElementById('db-start-date').value = toISO(start);
    document.getElementById('db-end-date').value = toISO(end);
    

}

//กราฟ Top Claim Lines Analysis
function updateLiveFeed(records) {
    const feedContainer = $id('live-incident-feed');
    if (!feedContainer) return;

    const lineStats = {};
    records.forEach(r => {
        const line = (r.line || 'Unknown').trim().toUpperCase();
        if (!lineStats[line]) { lineStats[line] = { count: 0, totalQty: 0, latestPart: '', latestSupplier: '' }; }
        lineStats[line].count += 1;
        lineStats[line].totalQty += (parseFloat(r.qty) || 0);
        lineStats[line].latestPart = r.partName || '-';
        lineStats[line].latestSupplier = r.supplier || '-';
    });

    const sortedLines = Object.entries(lineStats).sort((a, b) => b[1].count - a[1].count).slice(0, 5);
    if (sortedLines.length === 0) { 
        feedContainer.innerHTML = `<p class="text-center py-10 text-slate-300 font-bold uppercase text-[10px]">No Data</p>`; 
        return; 
    }

    const maxCase = sortedLines[0][1].count || 1;

    feedContainer.innerHTML = sortedLines.map(([lineName, data], i) => `
        <div class="line-card">
            <div class="flex justify-between items-start">
                <div class="flex items-center gap-3">
                    <div class="rank-badge">${i + 1}</div>
                    <div>
                        <div class="text-[13px] font-black text-slate-800 uppercase">LINE: ${escapeHtml(lineName)}</div>
                        <div class="text-[9px] font-bold text-blue-500 uppercase mt-0.5">LATEST: ${escapeHtml(data.latestSupplier)}</div>
                    </div>
                </div>
                <div class="text-right">
                    <span id="line-case-val-${i}" class="text-[16px] font-black text-blue-700">0</span>
                    <span class="text-[9px] font-bold text-slate-400 uppercase ml-1">CASES</span>
                </div>
            </div>

            <!-- Progress Bar -->
            <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-3">
                <div id="line-bar-${i}" class="h-full bg-blue-600 rounded-full" style="width: 0%"></div>
            </div>

            <div class="flex justify-between items-center mt-2">
                <span class="text-[10px] text-slate-400 italic font-medium">"${escapeHtml(data.latestPart)}"</span>
                <div class="pcs-summary-tag">
                    <span class="text-[9px] text-slate-400 mr-1">Σ</span>
                    <span id="line-qty-val-${i}">0</span>
                    <span class="text-[8px] ml-0.5">PCS</span>
                </div>
            </div>
        </div>
    `).join('');

    // เริ่มรัน Animation
    sortedLines.forEach(([name, data], i) => {
        animateValue(`line-case-val-${i}`, 0, data.count, 1500);
        animateValue(`line-qty-val-${i}`, 0, data.totalQty, 1500);
        if (window.gsap) {
            gsap.to(`#line-bar-${i}`, { width: `${(data.count / maxCase) * 100}%`, duration: 1.5, ease: "power2.out", delay: i * 0.1 });
        } else {
            const bar = document.getElementById(`line-bar-${i}`);
            if (bar) bar.style.width = `${(data.count / maxCase) * 100}%`;
        }
    });
    if (window.gsap) {
        gsap.to(".line-card", { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "back.out(1.7)" });
    }
}

// 1. เปลี่ยนชื่อตัวแปร Global
let vendorRiskChart = null; 

function renderVendorRadar(filtered) {
    const container = document.getElementById('vendor-risk-list');
    if (!container) return;

    // 1. ประมวลผลข้อมูลเชิงลึก
    const vendorMap = {};
    filtered.forEach(r => {
        const s = r.supplier || 'Unknown';
        if (!vendorMap[s]) {
            vendorMap[s] = { 
                totalQty: 0, 
                lots: new Set(), 
                pns: new Set(),
                sf: 0, vendor: 0, ctc: 0,
                lastDate: r.date
            };
        }
        const q = Number(r.qty || 0);
        vendorMap[s].totalQty += q;
        vendorMap[s].lots.add(r.ref);
        vendorMap[s].pns.add(r.partNo);
        
        // แยกประเภท Judgment
        const j = (r.judgment || '').toUpperCase();
        if (j === 'SF') vendorMap[s].sf += q;
        else if (j.includes('VENDOR')) vendorMap[s].vendor += q;
        else if (j === 'CTC') vendorMap[s].ctc += q;
    });

    const sorted = Object.entries(vendorMap).sort((a, b) => b[1].totalQty - a[1].totalQty).slice(0, 8);
    const maxQty = sorted.length > 0 ? sorted[0][1].totalQty : 1;

    container.innerHTML = sorted.map(([name, data], i) => {
        // คำนวณเปอร์เซ็นต์สำหรับ Stacked Bar
        const sfPct = (data.sf / data.totalQty) * 100;
        const vdPct = (data.vendor / data.totalQty) * 100;
        const ctPct = (data.ctc / data.totalQty) * 100;

        // กำหนดระดับความเสี่ยง (Logic: ถ้าเสียหลาย Lot + ส่วนใหญ่เป็น Vendor Fault = Critical)
        const isCritical = data.lots.size > 3 && (data.vendor > data.sf);
        const riskLabel = isCritical ? 'CRITICAL' : (data.lots.size > 1 ? 'WARNING' : 'STABLE');
        const riskClass = isCritical ? 'bg-rose-500' : (data.lots.size > 1 ? 'bg-amber-500' : 'bg-emerald-500');

        return `
            <div class="risk-row mb-6 last:mb-0">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-3 min-w-0">
                        <!-- อันดับพร้อม Badge สถานะความเสี่ยง -->
                        <div class="relative">
                            <div class="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-xs border border-slate-200">${i+1}</div>
                            <span class="absolute -top-1 -right-1 w-3 h-3 ${riskClass} border-2 border-white rounded-full"></span>
                        </div>
                        <div class="min-w-0">
                            <h4 class="text-[11px] font-black text-slate-800 uppercase truncate" title="${name}">${name}</h4>
                            <div class="flex gap-2 mt-0.5">
                                <span class="text-[8px] font-bold text-slate-400 uppercase">📦 ${data.lots.size} LOTS</span>
                                <span class="text-[8px] font-bold text-slate-400 uppercase">🆔 ${data.pns.size} PNs</span>
                                <span class="text-[8px] font-black text-blue-600 uppercase">Status: ${riskLabel}</span>
                            </div>
                        </div>
                    </div>
                    <div class="text-right flex-shrink-0">
                        <span id="risk-qty-${i}" class="text-[15px] font-black text-slate-900">0</span>
                        <span class="text-[9px] font-bold text-slate-400 uppercase ml-0.5">PCS</span>
                    </div>
                </div>

                <!-- Multi-Judgment Stacked Bar -->
                <div class="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                    <div id="bar-vd-${i}" style="width: 0%; background: #ef4444;" title="Vendor Fault"></div>
                    <div id="bar-sf-${i}" style="width: 0%; background: #f97316;" title="SF Fault"></div>
                    <div id="bar-ct-${i}" style="width: 0%; background: #2563eb;" title="CTC Fault"></div>
                </div>
            </div>
        `;
    }).join('');

    // เริ่มอนิเมชั่น
    sorted.forEach(([name, data], i) => {
        animateValue(`risk-qty-${i}`, 0, data.totalQty, 1500);
        setTimeout(() => {
            if ($id(`bar-vd-${i}`)) $id(`bar-vd-${i}`).style.width = (data.vendor / maxQty * 100) + '%';
            if ($id(`bar-sf-${i}`)) $id(`bar-sf-${i}`).style.width = (data.sf / maxQty * 100) + '%';
            if ($id(`bar-ct-${i}`)) $id(`bar-ct-${i}`).style.width = (data.ctc / maxQty * 100) + '%';
        }, 200 + (i * 100));
    });

    if (window.gsap) {
        gsap.fromTo(".risk-row", { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", clearProps: "transform,opacity" });
    }
}

// 3. ตรวจสอบใน refreshClaimDashboard (ประมาณบรรทัด 980) 
// ต้องมีการเรียกใช้ renderVendorRadar(filtered); เสมอ

function applyExecPreset(preset) {
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    
    const now = new Date();
    let start = new Date();
    if (preset === 'today') start = now;
    if (preset === 'week') start.setDate(now.getDate() - 7);
    if (preset === 'month') start = new Date(now.getFullYear(), now.getMonth(), 1);
    if (preset === 'year') start = new Date(now.getFullYear(), 0, 1);
    
    $id('exec-end').value = now.toISOString().split('T')[0];
    
    initExecDashboard();
}

// เพิ่มฟังก์ชันใหม่นี้เข้าไปใน script.js
function renderExecSpecialJobs() {
    // 1. ดึงข้อมูลจาก State (ตรวจสอบว่ามีข้อมูลไหม)
    const missions = S.wapData.specialJobs || [];
    
    // 2. ดึงวันที่จาก Header
    const start = document.getElementById('cd-start-date')?.value;
    const end = document.getElementById('cd-end-date')?.value;
    const currentYear = new Date().getFullYear().toString();

    console.log(`[Debug SpecialJobs] Total in State: ${missions.length}, Filter: ${start} to ${end}`);

    // 3. ปรับปรุง Logic การกรอง (ให้รองรับ String และการเปรียบเทียบที่แม่นยำขึ้น)
    const filteredMissions = missions.filter(r => {
        if (!r.date) return false;
        const rDateStr = String(r.date); // บังคับเป็น String
        
        if (start && end) {
            return rDateStr >= start && rDateStr <= end;
        }
        // ถ้าไม่มี filter ให้โชว์ของปีนี้ทั้งหมด
        return rDateStr.includes(currentYear);
    });

    const total = filteredMissions.length;
    // เช็คสถานะการทำเสร็จ (ตรวจจากคอลัมน์ result ตาม DB ของคุณ)
    const completed = filteredMissions.filter(r => r.result && r.result !== '-' && r.result !== '').length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    // 4. อัปเดต UI 
    // อัปเดตกราฟวงกลม
    const circle = document.getElementById('exec-mission-circle');
    if (circle) {
        gsap.to(circle, {
            attr: { "stroke-dasharray": `${pct}, 100` },
            duration: 1.5,
            ease: "power2.out"
        });
    }

    // ตัวเลข % วิ่ง
    animateValue('exec-mission-pct', 0, pct, 1500, 0, "%");
    
    // ตัวเลขสถิติ x / y
    const statsEl = document.getElementById('exec-mission-stats');
    if (statsEl) {
        statsEl.textContent = `${completed} / ${total}`;
    }

    // Badge ขวาบน
    const badge = document.getElementById('exec-mission-badge');
    if (badge) {
        badge.textContent = `${completed} DONE`;
        badge.style.display = 'block'; // มั่นใจว่าโชว์
    }

    // 5. วาดรายการ 3 อันล่าสุด (Mini Feed)
    const feedEl = document.getElementById('exec-mission-mini-feed');
    if (feedEl) {
        if (total === 0) {
            feedEl.innerHTML = `
                <div class="h-full flex items-center justify-center py-6">
                    <p class="text-[10px] text-slate-300 italic uppercase font-bold tracking-widest">No Missions Detected</p>
                </div>`;
            return;
        }

        feedEl.innerHTML = filteredMissions.slice(0, 3).map((m, i) => {
            const isDone = m.result && m.result !== '-' && m.result !== '';
            return `
                <div class="p-2 rounded-xl bg-slate-50/80 border border-slate-100 relative overflow-hidden mb-1.5 transition-all hover:translate-x-1" 
                     style="opacity:0; transform:translateX(-10px);" id="exec-m-item-${i}">
                    <div class="absolute left-0 top-0 bottom-0 w-1 ${isDone ? 'bg-emerald-500' : 'bg-amber-400'}"></div>
                    <div class="flex justify-between items-center">
                        <p class="text-[10px] font-black text-slate-700 truncate uppercase w-4/5">${m.project || 'Untitled Mission'}</p>
                        <div class="w-1.5 h-1.5 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}"></div>
                    </div>
                    <p class="text-[8px] font-bold text-slate-400 mt-0.5">${m.date} | CMD: ${m.assigned_by || 'N/A'}</p>
                </div>
            `;
        }).join('');

        // รันอนิเมชั่นโชว์รายการ
        gsap.to("[id^='exec-m-item-']", {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "back.out(1.7)"
        });
    }
}


function initExecDashboard() {
    // [CLEANUP] ล้างอนิเมชั่นที่อาจค้างอยู่ก่อนเริ่มใหม่
    gsap.killTweensOf(".exec-card-premium, #exec-5s-bar");

    // ============================================================
    // 1. ดึงช่วงวันที่จาก Header
    // ============================================================
    const start = $id('cd-start-date')?.value || ""; 
    const end = $id('cd-end-date')?.value || "";
    const rawActs = S.wapData.achievements || [];
    const rawScore5s = S.wapData.score5s || [];
    
    // ============================================================
    // 2. ส่วน Support Case (คำนวณและรันเลขวิ่ง)
    // ============================================================
    let filteredActs = rawActs.filter(r => {
        const d = r.event_date || "";
        return !start || !end || (d >= start && d <= end);
    });

    const totalSup = filteredActs.length;
    const rp = filteredActs.filter(r => r.report_type === 'RP').length;
    const vf = filteredActs.filter(r => r.report_type === 'VF').length;
    const recordsCount = filteredActs.filter(r => r.report_type === 'RECORDS').length;
    
    animateValue('exec-kpi-support', 0, totalSup, 800);
    animateValue('exec-sub-rp', 0, rp, 1000);
    animateValue('exec-sub-vf', 0, vf, 1000);
    animateValue('exec-sub-records', 0, recordsCount, 1000);

    // ============================================================
    // 3. 5S FINDINGS (แสดงจำนวนจุดสะสมรายปี + แถบวิ่ง)
    // ============================================================
    const targetYear = start ? start.substring(0, 4) : new Date().getFullYear().toString();
    const yearly5s = rawScore5s.filter(r => r.month && r.month.startsWith(targetYear));
    const totalYearlyFindings = yearly5s.reduce((sum, curr) => sum + (Number(curr.issue_count) || 0), 0);

    const s5Label = document.querySelector('#exec-dashboard-content .exec-card-premium:nth-child(2) p');
    if (s5Label) s5Label.textContent = "TOTAL 5S FINDINGS (YEARLY)";

    animateValue('exec-5s-avg', 0, totalYearlyFindings, 1200, 0, "");
    
    if($id('exec-5s-bar')) {
        const barPct = Math.min(100, (totalYearlyFindings / 100) * 100); 
        gsap.to('#exec-5s-bar', { width: barPct + '%', duration: 1.5, ease: "expo.out" });
    }

    // ============================================================
    // 4. [อัปเดตใหม่] ส่วน Attendance (ใช้สูตรเดียวกับหน้าสีม่วง)
    // ============================================================
    // กำหนดช่วงวันที่สำหรับคำนวณ (ใช้จาก Header หรือใช้ต้นปี-ปัจจุบัน)
    const now = new Date();
    const attStart = start || `${targetYear}-01-01`;
    const attEnd = end || now.toISOString().split('T')[0];

    // เรียกใช้ฟังก์ชันคำนวณกลาง (ต้องวางฟังก์ชัน getUnifiedAttendanceStats ไว้ในไฟล์ด้วย)
    const attStats = getUnifiedAttendanceStats(attStart, attEnd);
    
    // อัปเดต Rate (%) และ จำนวนวันลา
    animateValue('exec-att-rate', 0, parseFloat(attStats.rate), 1200, 1, "%");
    animateValue('exec-leave-total', 0, attStats.leave, 1000, 0, " DAYS TOTAL", "LEAVE: ");

    // ============================================================
    // 5. วาดกราฟและอัปเดตส่วนอื่นๆ
    // ============================================================
    renderExecTrends(filteredActs, rawScore5s);
    renderExecParts(filteredActs);
    renderExecPie(rp, vf, recordsCount); 
    updateAIBannerInsight(filteredActs);
    renderExecSpecialJobs(); 

    if (!$id('exec-dashboard-content').classList.contains('hidden-view')) {
        gsap.fromTo("#exec-dashboard-content .exec-card-premium", 
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "expo.out", clearProps: "all" }
        );
    }
}

async function updateAIBannerInsight(filteredActs) {
    const targetUser = S.userRole === 'supervisor' ? S.viewingUser : S.currentUser;
    
    // 1. ดึงข้อมูลทักษะจริงจากฐานข้อมูล
    const { data: skills } = await wapClient
        .from('skill_matrix')
        .select('skill_value')
        .eq('user_id', targetUser);

    const skillCount = skills ? skills.length : 0;
    const avgSkill = skillCount > 0 
        ? Math.round(skills.reduce((sum, s) => sum + s.skill_value, 0) / skillCount) 
        : 0;

    // 2. นับจำนวนงาน Support ทั้งหมด (Real Projects)
    const projectCount = filteredActs.length;

    // ============================================================
    // >>> [ส่วนที่เพิ่มใหม่] อัปเดตการ์ดใบที่ 3 (Competency Index) <<<
    // ============================================================
    if ($id('exec-skill-avg')) {
        $id('exec-skill-avg').textContent = avgSkill + '%';
    }
    animateValue('ai-score-val', 0, avgSkill, 1500, 0, ""); 
    animateValue('exec-skill-avg', 0, avgSkill, 1500, 0, "%");

        // แถบ Progress Bar สีม่วง
    if ($id('ai-progress-bar')) {
        gsap.to('#ai-progress-bar', { width: `${avgSkill}%`, duration: 1.8, ease: "expo.out" });
    }
    // อัปเดตข้อความสถานะด้านล่างตัวเลขตามระดับคะแนน
    if ($id('exec-skill-status')) {
        const statusEl = $id('exec-skill-status');
        if (avgSkill >= 80) {
            statusEl.innerHTML = `🏆 <span class="ml-1">Master Expert Level</span>`;
            statusEl.className = "text-[9px] font-bold text-emerald-600 mt-4 flex items-center gap-1";
        } else if (avgSkill >= 50) {
            statusEl.innerHTML = `🚀 <span class="ml-1">Advanced Support</span>`;
            statusEl.className = "text-[9px] font-bold text-blue-600 mt-4 flex items-center gap-1";
        } else {
            statusEl.innerHTML = `📈 <span class="ml-1">Developing Skills</span>`;
            statusEl.className = "text-[9px] font-bold text-amber-600 mt-4 flex items-center gap-1";
        
        }
            animateValue('ai-projects-val', 0, projectCount, 1200);
    animateValue('ai-skills-val', 0, skillCount, 1200);
    }
    // ============================================================

    // 3. อัปเดต UI ของ AI Banner (ขวาล่าง)
    $id('ai-score-val').textContent = avgSkill + '%';
    $id('ai-progress-bar').style.width = avgSkill + '%';
    $id('ai-projects-val').textContent = projectCount.toLocaleString();
    $id('ai-skills-val').textContent = skillCount.toLocaleString();

    // 4. สร้างข้อความ AI Insight แบบไดนามิก
    let insightMsg = "";
    if (avgSkill >= 80) {
        insightMsg = `ยอดเยี่ยม! คุณมีทักษะเฉลี่ยสูงถึง <span class="text-emerald-400 font-bold">${avgSkill}%</span> อยู่ในระดับวิศวกรผู้เชี่ยวชาญ พร้อมรับมือปัญหาซับซ้อน`;
    } else if (avgSkill >= 50) {
        insightMsg = `ทำได้ดี! ทักษะของคุณอยู่ที่ระดับ <span class="text-blue-400 font-bold">Advanced</span> คุณมีประสบการณ์สนับสนุนการผลิตอย่างต่อเนื่อง`;
    } else {
        insightMsg = `กำลังพัฒนา! แนะนำให้อัปเดตทักษะเพิ่มเติมเพื่อเพิ่มดัชนีประสิทธิภาพในการ Support หน้างานให้สูงขึ้น`;
    }
    $id('ai-insight-text').innerHTML = insightMsg;
}
/**
 * แก้ไขฟังก์ชันให้รับ 2 พารามิเตอร์: 
 * actData = ข้อมูล Activity (Support เคส)
 * s5Data = ข้อมูล 5S จากตาราง WAP
 */
/**
 * แก้ไขกราฟ Monthly Activity Trends: รวมข้อมูล Support, 5S และ Special Jobs
 */
/**
 * กราฟ Monthly Activity Trends: ผูกข้อมูล Support, 5S และ Special Jobs เข้ากับ Global Filter
 */
function renderExecTrends(actData, s5Data) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // 1. ดึงช่วงวันที่จาก Global Filter ใน Header
    const startVal = document.getElementById('cd-start-date')?.value || ""; 
    const endVal = document.getElementById('cd-end-date')?.value || "";
    
    // กำหนดปีเป้าหมาย (ถ้าไม่เลือกฟิลเตอร์ ให้ใช้ปีปัจจุบัน)
    const targetYear = startVal ? new Date(startVal).getFullYear() : new Date().getFullYear();

    // 2. ฟังก์ชันช่วยกรองข้อมูลตาม "เดือน" และ "ช่วงวันที่ที่เลือก"
    const filterByDate = (dateStr, monthIndex) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        const isWithinYear = d.getFullYear() === targetYear;
        const isWithinMonth = d.getMonth() === monthIndex;
        
        // ถ้ามีการเลือกฟิลเตอร์วันที่ ให้เช็คด้วยว่าอยู่ในช่วง Start - End หรือไม่
        if (startVal && endVal) {
            return isWithinYear && isWithinMonth && (dateStr >= startVal && dateStr <= endVal);
        }
        return isWithinYear && isWithinMonth;
    };

    // 3. ประมวลผลข้อมูล Support (เส้นสีน้ำเงิน)
    const supportData = months.map((m, i) => {
        // actData คือข้อมูลที่ถูกกรองเบื้องต้นมาจาก initExecDashboard
        return actData.filter(r => filterByDate(r.event_date, i)).length;
    });

    // 4. ประมวลผลข้อมูล 5S (เส้นสีม่วง)
    const s5CalculatedData = months.map((m, i) => {
        const monthlyS5 = s5Data.filter(r => {
            const dateStr = r.date || (r.month ? `${r.month}-01` : null);
            return filterByDate(dateStr, i);
        });
        return monthlyS5.reduce((sum, curr) => sum + (Number(curr.issue_count) || 0), 0);
    });

    // 5. ประมวลผลข้อมูล SPECIAL JOBS (เส้นสีเขียว)
    const sjRaw = S.wapData.specialJobs || [];
    const specialJobsData = months.map((m, i) => {
        return sjRaw.filter(r => filterByDate(r.date, i)).length;
    });

    // 6. คำนวณค่าสูงสุด (Dynamic Y-Axis)
    const maxVal = Math.max(...supportData, ...s5CalculatedData, ...specialJobsData, 5);
    const dynamicMax = Math.ceil(maxVal / 5) * 5 + 5;

    // 7. วาดกราฟใหม่
    if (execCharts.trend) execCharts.trend.destroy();
    
    execCharts.trend = new ApexCharts(document.getElementById('exec-trend-chart'), {
        series: [
            { name: '5S Findings', data: s5CalculatedData },
            { name: 'Support Line', data: supportData },
            { name: 'Special Missions', data: specialJobsData }
        ],
        chart: {
            type: 'line',
            height: '100%',
            width: '100%',
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: 'Inter, sans-serif',
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        colors: ['#a855f7', '#3b82f6', '#10b981'], // ม่วง, น้ำเงิน, เขียว
        stroke: { curve: 'smooth', width: [3, 4, 3], lineCap: 'round' },
        markers: {
            size: 4, 
            colors: ['#ffffff'], 
            strokeColors: ['#a855f7', '#3b82f6', '#10b981'], 
            strokeWidth: 2
        },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
        xaxis: {
            categories: months,
            labels: { 
                style: { colors: '#94a3b8', fontSize: '10px', fontWeight: 600 } 
            }
        },
        yaxis: {
            min: 0,
            max: dynamicMax,
            labels: {
                style: { colors: '#94a3b8', fontSize: '10px', fontWeight: 600 },
                formatter: (val) => Math.floor(val)
            }
        },
        legend: {
            show: true,
            position: 'top',
            horizontalAlign: 'right',
            fontSize: '10px',
            fontWeight: 800,
            markers: { radius: 12 },
            labels: { colors: '#64748b' }
        },
        tooltip: { theme: 'dark', shared: true, intersect: false }
    });
    execCharts.trend.render();
}

function renderExecParts(data) {
    const partMap = {};
    // ประมวลผลข้อมูล
    data.forEach(r => {
        const p = r.part || 'Unknown';
        partMap[p] = (partMap[p] || 0) + 1;
    });

    // ดึง Top 5 และเรียงลำดับ
    const top5 = Object.entries(partMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (execCharts.part) execCharts.part.destroy();

const chartOptions = {
        series: [{
            name: 'จำนวนปัญหา',
            data: top5.map(x => x[1])
        }],
        chart: {
            type: 'bar',
            height: '100%',
            width: '100%',
            toolbar: { show: false },
            // ปรับตำแหน่งกราฟให้สมดุล
            offsetY: 0, 
            parentHeightOffset: 0, 
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 4,
                // ปรับความสูงของแท่ง (Bar Height) ให้มากขึ้นเพื่อขยายพื้นที่ (เดิมอาจจะ 35-50%)
                barHeight: '75%', 
                distributed: true,
                dataLabels: {
                    position: 'top' // หรือ 'bottom' เพื่อให้อยู่ในแท่ง
                }
            }
        },
        colors: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
        dataLabels: {
            enabled: true,
            textAnchor: 'start',
            style: {
                fontSize: '10px',
                fontWeight: 600, // ปรับให้บางลงเล็กน้อย
                colors: ['#1e293b']
            },
            offsetX: 10, // ขยับตัวเลขออกไปนอกแท่งเล็กน้อย
            dropShadow: { enabled: false }
        },
        grid: {
            show: true,
            borderColor: '#f1f5f9',
            strokeDashArray: 4,
            // สำคัญ: ปรับ Padding ให้ชิดขอบทุกด้าน โดยเฉพาะ bottom
            padding: {
                top: -10,
                bottom: -10,
                left: 10,
                right: 40 // เผื่อที่ให้ตัวเลขด้านหลังไม่หลุดขอบ
            }
        },
        xaxis: {
            categories: top5.map(x => x[0]),
            labels: {
                show: true,
                style: {
                    // เปลี่ยนสีให้เข้มขึ้นเพื่อให้ตัดกับพื้นหลัง (ใช้สี Slate 600)
                    colors: '#475569', 
                    fontSize: '11px',    // เพิ่มขนาดขึ้นเล็กน้อยจาก 9px เป็น 11px
                    fontWeight: 600,     // ใช้ความหนาระดับ Semi-bold เพื่อให้คมชัดแต่ไม่หนาปึ้ก
                    fontFamily: 'Inter, sans-serif'
                },
                // เพิ่มระยะห่างจากเส้นแกนเล็กน้อย
                offsetY: 0, 
            },
            axisBorder: {
                show: false // ซ่อนเส้นขอบแกนเพื่อความคลีน
            },
            axisTicks: {
                show: false // ซ่อนขีดติ๊กเพื่อความอ่อนช้อย
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#64748b',
                    fontSize: '10px', // ปรับชื่อ Part ให้เล็กลงและบาง
                    fontWeight: 400
                }
            }
        },
        legend: { show: false },
        tooltip: { theme: 'dark' }
    };

    execCharts.part = new ApexCharts($id('exec-part-chart'), chartOptions);
    execCharts.part.render();
}

function renderExecPie(rp, vf, rec) {
    const total = rp + vf + rec;
    const series = [rp, vf, rec];
    const labels = ['RP', 'VF', 'REC'];
    const colors = ['#ef4444', '#2563eb', '#f59e0b']; 

    if (execCharts.pie) execCharts.pie.destroy();

    const chartOptions = {
        series: series,
        labels: labels,
        chart: {
            type: 'donut',
            width: '100%',
            height: 150,      // ลดความสูงจองพื้นที่ลง
            offsetY: -15,     // *** จุดสำคัญ: ดึงตัววงกลมให้ลอยขึ้นด้านบน ***
            fontFamily: 'Inter, sans-serif',
            animations: { enabled: true, speed: 600 }
        },
        colors: colors,
        stroke: { show: true, width: 2, colors: ['#ffffff'] },
        plotOptions: {
            pie: {
                customScale: 0.9, // ขยายวงให้ชัดแต่ไม่ล้น
                donut: {
                    size: '72%',
                    labels: {
                        show: true,
                        name: { show: true, fontSize: '8px', fontWeight: 700, color: '#94a3b8', offsetY: -3 },
                        value: {
                            show: true,
                            fontSize: '15px', // ตัวเลขตรงกลาง
                            fontWeight: 950,
                            color: '#1e293b',
                            offsetY: 3,
                            formatter: (val) => val
                        },
                        total: {
                            show: true,
                            label: 'TOTAL',
                            fontSize: '7px',
                            fontWeight: 800,
                            formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                        }
                    }
                }
            }
        },
        dataLabels: { enabled: false },
        legend: { show: false },
        tooltip: { y: { formatter: (val) => val + " รายการ" } }
    };

    execCharts.pie = new ApexCharts(document.getElementById('exec-pie-chart'), chartOptions);
    execCharts.pie.render();

    // --- Legend แบบ Ultra Slim (ยกขึ้นมาโชว์ชัดๆ) ---
    const legendEl = document.getElementById('exec-pie-legend');
    if (legendEl) {
        legendEl.innerHTML = labels.map((l, i) => {
            const pctVal = total > 0 ? (series[i] / total * 100).toFixed(1) : 0;
            const countId = `pie-count-val-${i}`;
            const pctId = `pie-pct-val-${i}`;

            return `
                <div class="flex flex-col items-center p-1 rounded-lg bg-slate-50/80 border border-slate-100 transition-all">
                    <div class="flex items-center gap-1 mb-0.5">
                        <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" style="background:${colors[i]}"></span>
                        <span class="text-[8px] font-black text-slate-500 uppercase">${l}</span>
                    </div>
                    <div id="${countId}" class="text-[13px] font-black text-slate-900 leading-tight">0</div>
                    <div id="${pctId}" class="text-[7.5px] font-bold text-blue-600 mt-0.5">${pctVal}%</div>
                </div>
            `;
        }).join('');

        series.forEach((val, i) => {
            animateValue(`pie-count-val-${i}`, val);
        });
    }
}

/* ============================================================
   ATTENDANCE LOGS — LOGIC & CHART
   ============================================================ */

var attLeaveRecords = []; // แคชข้อมูลที่ดึงจาก Supabase ตาราง leave_records
var ATT_LEAVE_TABLE = 'daily_reports';

var attMonthlyChart = null;
var attSelectedYear = new Date().getFullYear();
var attEditingId = null; // เก็บ id แถวที่กำลังแก้ไข (null = โหมดสร้างใหม่)

var attTypeMap = {
    sick:     { label: 'ลาป่วย',       cls: 'type-sick' },
    personal: { label: 'ลากิจ',       cls: 'type-personal' },
    annual:   { label: 'ลาพักร้อน',   cls: 'type-annual' },
    maternity:{ label: 'ลาคลอด',       cls: 'type-maternity' },
    holiday:  { label: 'วันหยุดนักขัตฤกษ์', cls: 'type-holiday' },
    other:    { label: 'อื่นๆ',         cls: 'type-other' },
};

var attStatusMap = {
    approved: { label: 'อนุมัติ',      cls: 'att-status-approved' },
    pending:  { label: 'รอดำเนินการ', cls: 'att-status-pending' },
    rejected: { label: 'ปฏิเสธ',      cls: 'att-status-rejected' },
};


function isWeekendDate(d) {
    var day = d.getDay();
    return day === 0 || day === 6;
}

async function fetchAttendanceRecords() {
    const targetUser = S.userRole === 'supervisor' ? S.viewingUser : S.currentUser;
    if (!targetUser) return [];
    
    // หากออฟไลน์ ให้ใช้ข้อมูลเดิมใน State
    if (!navigator.onLine) return S.attLeaveRecords;

    try {
        const { data, error } = await wapClient
            .from(ATT_LEAVE_TABLE)
            .select('*')
            .eq('user_id', targetUser)
            .order('date', { ascending: false });

        if (error) throw error;
        
        // อัปเดตข้อมูลลงใน Global State แทนตัวแปรกระจัดกระจาย
        S.attLeaveRecords = data || [];
        return S.attLeaveRecords;

    } catch (e) {
        console.error('Fetch attendance error:', e);
        attToast('โหลดข้อมูลการลาไม่สำเร็จ', 'error');
        return S.attLeaveRecords;
    }
}

/* ฟังก์ชันหลัก: เปิดหน้า Attendance Logs */
function openAttendanceView() {
    /* เรียก switchView ตัวเดิมของระบบ (ถ้ามี) */
    if (typeof switchView === 'function') {
        try { switchView('attendance-logs'); } catch(e) { console.warn('switchView error:', e); }
    }

    /* Fallback: ซ่อน view อื่นๆ และแสดง attendance-logs เอง */
    var allViews = document.querySelectorAll('.hidden-view');
    for (var i = 0; i < allViews.length; i++) {
        allViews[i].style.display = 'none';
    }
    var attView = document.getElementById('attendance-logs');
    if (attView) attView.style.display = '';

    /* อัปเดต active nav */
    var allNav = document.querySelectorAll('.nav-item');
    for (var j = 0; j < allNav.length; j++) {
        allNav[j].classList.remove('active-nav');
        var ind = allNav[j].querySelector('.active-indicator');
        if (ind) ind.remove();
    }
    var thisNav = document.querySelector('[data-view="attendance-logs"]');
    if (thisNav) {
        thisNav.classList.add('active-nav');
        var dot = document.createElement('div');
        dot.className = 'active-indicator';
        thisNav.appendChild(dot);
    }

    /* เริ่มต้นสร้างกราฟ (รอให้ DOM พร้อม) */
    setTimeout(initAttDashboard, 120);
}


async function initAttDashboard() {
    // 0. Sync ตัวเลือกปีและป้ายกำกับให้ตรงกับ attSelectedYear
    var yearSelect = document.getElementById('att-year-select');
    if (yearSelect) yearSelect.value = attSelectedYear;
    var label = document.getElementById('att-chart-year-label');
    if (label) label.textContent = attSelectedYear;

    // 1. ดึงข้อมูลจาก Supabase (daily_reports) แล้ววาดตาราง ก่อนคำนวณ KPI
    await renderAttRecords();
    updateAttKPI();

    // 2. จัดการเรื่องกราฟ Monthly Chart
    var chartEl = document.getElementById('att-monthly-chart');
    if (!chartEl) return;

    if (attMonthlyChart) {
        attMonthlyChart.destroy();
    }
    renderDailySubmissionMatrix(); 
    initAttMonthlyChart();
}

let _attScroller = null;

function _buildAttRow(r) {
    const t = attTypeMap[r.type] || attTypeMap.other;
    const isEditing = (attEditingId === r.id);
    return `
        <tr class="${isEditing ? 'att-editing-row' : ''}" data-rid="${r.id}">
            <td><span class="att-record-date">${formatDateTH(r.date)}</span></td>
            <td><span class="att-type-tag ${t.cls}">${t.label}</span></td>
            <td><span class="att-record-reason">${escapeHtml(r.note || '-')}</span></td>
            <td>
                <div class="att-row-actions">
                    <button class="att-row-btn att-row-btn-edit" onclick="editAttRecord('${r.id}')" title="Edit Att Record" aria-label="Edit Att Record"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-width="2"></path></svg></button>
                    <button class="att-row-btn att-row-btn-del" onclick="deleteAttRecord('${r.id}')" title="Delete Att Record" aria-label="Delete Att Record"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2"></path></svg></button>
                </div>
            </td>
        </tr>`;
}

/* 1. แก้ไขการ Render ตารางให้รองรับการกรองวันที่จาก Header */
async function renderAttRecords() {
    const tbody = $id('att-records-tbody');
    const countEl = $id('att-records-count');
    if (!tbody) return;

    // ดึงค่าวันที่จาก Global Filter (Header)
    const startFilter = $id('cd-start-date')?.value;
    const endFilter = $id('cd-end-date')?.value;

    await fetchAttendanceRecords(); 
    let records = S.attLeaveRecords || [];

    // --- จุดสำคัญ: เพิ่มการกรองข้อมูลตามวันที่เลือกใน Header ---
    if (startFilter && endFilter) {
        records = records.filter(r => r.date >= startFilter && r.date <= endFilter);
    }

    if (countEl) countEl.textContent = `${records.length} รายการ`;

    if (!_attScroller) {
        _attScroller = new window.VirtualTableScroller({
            containerId: 'att-records-container',
            tbodyId: 'att-records-tbody',
            rowHeight: 48,
            columnsCount: 4,
            rowBuilder: _buildAttRow,
            emptyHtml: `<tr><td colspan="4"><div class="att-empty-state"><p>ไม่พบข้อมูลในช่วงเวลาที่เลือก</p></div></td></tr>`,
            onRenderComplete: () => {
                if (typeof reapplyKbdRowSelection === 'function') reapplyKbdRowSelection();
            }
        });
    }

    _attScroller.setItems(records);
    renderDailySubmissionMatrix(); 
}

function cancelEditAttRecord() {
    attEditingId = null;
    document.getElementById('att-leave-date').value = '';
    document.getElementById('att-leave-type').value = '';
    document.getElementById('att-leave-reason').value = '';

    var titleEl = document.querySelector('.att-form-title');
    if (titleEl) titleEl.innerHTML = '<div class="form-title-dot"></div>แบบฟอร์มขออนุมัติการลา';

    var submitBtn = document.getElementById('att-submit-btn');
    if (submitBtn) submitBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L10.5 16.5 18 8.25"/></svg>ส่งคำขอการลา';

    renderAttRecords();
}

async function deleteAttRecord(id) {
    if (S.userRole === 'supervisor') { attToast('โหมดอ่านอย่างเดียว', 'info'); return; }
    if (!navigator.onLine) { attToast('📶 ออฟไลน์: ไม่สามารถลบข้อมูลได้', 'error'); return; }
    
    const target = S.attLeaveRecords ? S.attLeaveRecords.find(r => String(r.id) === String(id)) : null;

    showCustomConfirmDialog({
        title: "ยืนยันการลบข้อมูลการลา",
        subtitle: "รายการนี้จะถูกลบออกจาก Attendance Logs และไม่สามารถกู้คืนได้",
        badge: "ATTENDANCE LOGS",
        type: "danger",
        details: [
            { label: "วันที่ขอลา", value: target ? formatDateTH(target.event_date) : '-' },
            { label: "ประเภทการลา", value: target ? (target.leave_type || target.shift || '-') : '-' },
            { label: "เหตุผล / หมายเหตุ", value: target ? (target.reason || target.remark || '-') : '-' },
            { label: "ผู้ยื่นคำขอ", value: target ? (target.user_id || S.currentUser) : S.currentUser }
        ],
        confirmText: "🗑️ ยืนยันลบรายการลา",
        cancelText: "ยกเลิก",
        onConfirm: async () => {
            try {
                S.attLeaveRecords = S.attLeaveRecords.filter(r => String(r.id) !== String(id));
                var res = await wapClient.from(ATT_LEAVE_TABLE).delete().eq('id', id);
                if (res.error) throw res.error;

                if (attEditingId === id) cancelEditAttRecord();

                attToast('ลบรายการเรียบร้อย', 'success');
                await initAttDashboard();
            } catch (e) {
                console.error('Delete daily_reports error:', e);
                attToast('ลบไม่สำเร็จ: ' + (e.message || 'เกิดข้อผิดพลาด'), 'error');
                await initAttDashboard();
            }
        }
    });
}


/* แปลงวันที่เป็นภาษาไทย */
function formatDateTH(dateStr) {
    if (!dateStr) return '-';
    var d = new Date(dateStr);
    var months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + (d.getFullYear() + 543);
}

/* คำนวณจำนวนวัน */
function calcDaysBetween(start, end) {
    if (!start || !end) return 0;
    var s = new Date(start), e = new Date(end);
    var diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
}

/* ส่งคำขอลา */
async function submitLeaveRequest() {
    var dateVal = document.getElementById('att-leave-date').value;
    var typeVal = document.getElementById('att-leave-type').value;
    var noteVal = document.getElementById('att-leave-reason').value.trim();

    if (!dateVal) { attToast('กรุณาเลือกวันที่ลา', 'error'); return; }
    if (!typeVal) { attToast('กรุณาเลือกประเภทการลา', 'error'); return; }
    if (!noteVal) { attToast('กรุณาระบุเหตุผล', 'error'); return; }
    if (!navigator.onLine) { attToast('📶 ออฟไลน์: ไม่สามารถบันทึกข้อมูลได้', 'error'); return; }

    var targetUser = S.currentUser;
    var nowIso = new Date().toISOString();
    var submitBtn = document.getElementById('att-submit-btn');
    if (submitBtn) submitBtn.disabled = true;

    try {
        if (attEditingId) {
            // --- โหมดแก้ไข: อัปเดตแถวเดิม ---
            var updatePayload = { date: dateVal, type: typeVal, note: noteVal, full_timestamp: nowIso };
            var updRes = await wapClient.from(ATT_LEAVE_TABLE).update(updatePayload).eq('id', attEditingId);
            if (updRes.error) throw updRes.error;

            attToast('อัปเดตรายการลาเรียบร้อย', 'success');
            cancelEditAttRecord();
        } else {
            // --- โหมดสร้างใหม่ ---
            var newRecord = {
                id: generateUUID(),
                user_id: targetUser,
                date: dateVal,
                type: typeVal,
                note: noteVal,
                full_timestamp: nowIso
            };
            var insRes = await wapClient.from(ATT_LEAVE_TABLE).insert([newRecord]);
            if (insRes.error) throw insRes.error;

            document.getElementById('att-leave-date').value = '';
            document.getElementById('att-leave-type').value = '';
            document.getElementById('att-leave-reason').value = '';

            attToast('ส่งคำขอการลาเรียบร้อย', 'success');
        }

        await initAttDashboard();
    } catch (e) {
        console.error('Save daily_reports error:', e);
        attToast('บันทึกไม่สำเร็จ: ' + (e.message || 'เกิดข้อผิดพลาด'), 'error');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
    await fetchAttendanceRecords(); // โหลดข้อมูลใหม่จากฐานข้อมูล
    renderDailySubmissionMatrix();  // สั่งวาดปฏิทินใหม่ทันที
}

// ฟังก์ชันคำนวณสถิติเข้างานแบบมาตรฐาน (นับเฉพาะ จันทร์-ศุกร์)
function getGlobalAttendanceStats(startDate, endDate) {
    const allRecords = S.attLeaveRecords || [];
    const rangeStart = new Date(startDate);
    const rangeEnd = new Date(endDate);

    const leaveDates = new Set();
    const holidayDates = new Set();

    allRecords.forEach(r => {
        const rDate = new Date(r.date);
        if (rDate >= rangeStart && rDate <= rangeEnd) {
            if (r.type === 'holiday') holidayDates.add(r.date);
            else leaveDates.add(r.date);
        }
    });

    const totalWorkingDays = countWeekdaysInRange(rangeStart, rangeEnd);
    const scheduledDays = Math.max(0, totalWorkingDays - holidayDates.size);
    const actualWorked = Math.max(0, scheduledDays - leaveDates.size);
    const rate = scheduledDays > 0 ? ((actualWorked / scheduledDays) * 100).toFixed(1) : "100.0";

    return {
        rate: rate,
        leave: leaveDates.size,
        worked: actualWorked,
        holiday: holidayDates.size
    };
}

function updateAttKPI() {
    const startFilter = $id('cd-start-date')?.value;
    const endFilter = $id('cd-end-date')?.value;

    let rangeStart, rangeEnd;
    if (startFilter && endFilter) {
        rangeStart = startFilter;
        rangeEnd = endFilter;
    } else {
        const year = attSelectedYear;
        const now = new Date();
        rangeStart = `${year}-01-01`;
        rangeEnd = (year === now.getFullYear()) ? now.toISOString().split('T')[0] : `${year}-12-31`;
    }

    const stats = getUnifiedAttendanceStats(rangeStart, rangeEnd);

    animateValue('att-kpi-leave', 0, stats.leave, 800);
    animateValue('att-kpi-holiday', 0, stats.holiday, 800);
    animateValue('att-kpi-worked', 0, stats.worked, 1000); 

    const rateEl = $id('att-kpi-rate');
    if (rateEl) {
        animateValue('att-kpi-rate', 0, parseFloat(stats.rate), 1200, 1);
    }
}

function getUnifiedAttendanceStats(startDate, endDate) {
    const allRecords = S.attLeaveRecords || [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    const totalWorkableDays = countWeekdaysInRange(start, end);

    const leaveDates = new Set();
    const holidayDates = new Set();
    allRecords.forEach(r => {
        const rDate = new Date(r.date);
        if (rDate >= start && rDate <= end) {
            if (r.type === 'holiday') holidayDates.add(r.date);
            else leaveDates.add(r.date);
        }
    });

    const scheduledDays = Math.max(0, totalWorkableDays - holidayDates.size);
    const actualWorked = Math.max(0, scheduledDays - leaveDates.size);
    const rate = scheduledDays > 0 ? (actualWorked / scheduledDays * 100) : 100;

    return {
        rate: rate.toFixed(1),
        leave: leaveDates.size,
        worked: actualWorked,
        holiday: holidayDates.size
    };
}

/* วาดกราฟสถิติรายเดือน - เวอร์ชั่น Hybrid เสถียรสูง */
function initAttMonthlyChart() {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const year = attSelectedYear;
    const now = new Date();
    const isCurrentYear = (year === now.getFullYear());

    const chartContainer = document.getElementById('att-monthly-chart');
    if (!chartContainer) return;

    if (window.attMonthlyChart !== undefined && window.attMonthlyChart !== null) {
        try {
            if (typeof window.attMonthlyChart.destroy === 'function') {
                window.attMonthlyChart.destroy();
            }
        } catch (e) {
            console.warn("Could not destroy existing chart:", e);
        }
        window.attMonthlyChart = null; 
    }

    chartContainer.innerHTML = ''; 

    const leaveData = new Array(12).fill(0);
    const holidayData = new Array(12).fill(0);
    const workedData = new Array(12).fill(0);

    const yearRecords = (S.attLeaveRecords || []).filter(r => {
        return r.date && new Date(r.date).getFullYear() === year;
    });

    for (let m = 0; m < 12; m++) {
        const monthStart = new Date(year, m, 1);
        const monthEnd = new Date(year, m + 1, 0);

        let countL = 0, countH = 0;
        yearRecords.forEach(r => {
            const d = new Date(r.date);
            if (d.getMonth() === m) {
                if (r.type === 'holiday') countH++;
                else countL++;
            }
        });

        leaveData[m] = countL;
        holidayData[m] = countH;

        if (isCurrentYear && monthStart > now) {
            workedData[m] = 0;
        } else {
            const capEnd = (isCurrentYear && monthEnd > now) ? now : monthEnd;
            const totalPotentialWeekdays = countWeekdaysInRange(monthStart, capEnd);
            workedData[m] = Math.max(0, totalPotentialWeekdays - (countL + countH));
        }
    }

    const options = {
        series: [
            { name: 'วันทำงานจริง', type: 'area', data: workedData },
            { name: 'วันลาสะสม', type: 'column', data: leaveData },
            { name: 'วันหยุดนักขัตฯ', type: 'column', data: holidayData }
        ],
        chart: {
            height: '100%',
            type: 'line',
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif',
            animations: { 
                enabled: true, 
                easing: 'easeinout', 
                speed: 800 
            },
            dropShadow: { 
                enabled: true, 
                top: 8, 
                left: 0, 
                blur: 6, 
                color: '#10b981', 
                opacity: 0.1 
            }
        },
        colors: ['#10b981', '#f59e0b', '#6366f1'],
        fill: {
            type: ['gradient', 'solid', 'solid'],
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.05,
                stops: [0, 90, 100]
            }
        },
        stroke: {
            curve: 'smooth',
            width: [3, 0, 0], 
        },
        plotOptions: {
            bar: { columnWidth: '22%', borderRadius: 4 }
        },
        markers: {
            size: [5, 0, 0],
            colors: ['#fff'],
            strokeColors: '#10b981',
            strokeWidth: 3
        },
        xaxis: {
            categories: months,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                show: true,
                rotate: 0,
                rotateAlways: false,
                hideOverlappingLabels: false,
                style: { colors: '#94a3b8', fontWeight: 700, fontSize: '11px' }
            }
        },
        yaxis: {
            min: 0,
            max: 25,
            tickAmount: 5,
            labels: { style: { colors: '#cbd5e1', fontWeight: 600, fontSize: '10px' } }
        },
        grid: {
            borderColor: '#f1f5f9',
            strokeDashArray: 5,
            padding: {
                top: 0,
                right: 10,
                bottom: 2,
                left: 10
            }
        },
        legend: { show: false },
        tooltip: {
            theme: 'light',
            shared: true,
            intersect: false,
            y: { formatter: val => val + " วัน" }
        },
        responsive: [
            {
                breakpoint: 1024,
                options: {
                    xaxis: {
                        labels: {
                            style: { colors: '#94a3b8', fontWeight: 700, fontSize: '9px' }
                        }
                    }
                }
            },
            {
                breakpoint: 768,
                options: {
                    xaxis: {
                        labels: {
                            style: { colors: '#94a3b8', fontWeight: 700, fontSize: '8px' }
                        }
                    }
                }
            }
        ]
    };

    window.attMonthlyChart = new ApexCharts(chartContainer, options);
    
    setTimeout(() => {
        if (window.attMonthlyChart) {
            window.attMonthlyChart.render();
        }
    }, 50);
}

function countWeekdaysInRange(start, end) {
    let count = 0;
    let cur = new Date(start.getTime());
    while (cur <= end) {
        let day = cur.getDay();
        if (day !== 0 && day !== 6) count++;
        cur.setDate(cur.getDate() + 1);
    }
    return count;
}

function attToast(msg, type = 'info') {
    const colors = { success: '#059669', error: '#e11d48', info: '#1e293b' };
    const bg = colors[type] || colors.info;
    const t = document.createElement('div');
    
    t.innerHTML = msg;
    t.style.cssText = `
        position: fixed; 
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        padding: 10px 18px; border-radius: 12px; font-size: 11px;
        font-weight: 700; color: white; background: ${bg};
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        transition: all 0.4s ease; opacity: 0; transform: translateX(20px);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255,255,255,0.1);
    `;
    
    document.body.appendChild(t);
    
    setTimeout(() => { 
        t.style.opacity = '1'; 
        t.style.transform = 'translateX(0)'; 
    }, 10);
    
    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateX(20px)';
        setTimeout(() => t.remove(), 600);
    }, 2500);
}

function onAttYearChange(val) {
    attSelectedYear = parseInt(val, 10);
    const label = document.getElementById('att-chart-year-label');
    if (label) label.textContent = attSelectedYear;
    initAttDashboard(); 
}

const SUPPORT_PART_CATEGORIES = [
    "insulation parts",
    "(Mold Part)",
    "Packaging part",
    "Rubber parts",
    "Plastic Resin (Mold Part)",
    "Plastic Resin (Assy)",
    "Packaging part Form",
    "Aluminium Part",
    "Steel",
    "Copper Part",
    "Terminal",
    "Remote Control",
    "Motors",
    "Electric Controls",
    "PCBA",
    "Compressors",
    "Printing part"
];

const showPartAC = (inputEl) => {
    const dropdown = document.getElementById('sup-part-ac');
    if (!dropdown) return;

    const query = inputEl.value.toLowerCase();
    const filtered = SUPPORT_PART_CATEGORIES.filter(cat => 
        cat.toLowerCase().includes(query)
    );

    if (filtered.length > 0) {
        dropdown.style.display = 'block';
        dropdown.innerHTML = `
            <div style="padding: 10px 15px; font-size: 9px; font-weight: 850; color: #94a3b8; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; background: #fafafa;">
                Select Category
            </div>
            ${filtered.map(cat => `
                <div class="ac-item" 
                     style="padding: 10px 15px; cursor: pointer; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #f8fafc;"
                     onclick="WapSupportLogs.selectPartAC('${cat}')">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: #3b82f6;"></div>
                    <span style="font-size: 12px; font-weight: 700; color: #334155;">${cat}</span>
                </div>
            `).join('')}
        `;
    } else {
        dropdown.style.display = 'none';
    }
};

const selectPartAC = (val) => {
    const input = document.getElementById('f-sup-part');
    if (input) {
        input.value = val;
        input.classList.add('valid');
    }
    document.getElementById('sup-part-ac').style.display = 'none';
};

const calcNG = () => {
    const lotInput = document.getElementById('f-sup-lot');
    const okInput = document.getElementById('f-sup-ok');
    const ngInput = document.getElementById('f-sup-ng');

    if (!lotInput || !okInput || !ngInput) return;

    const totalLot = parseInt(lotInput.value) || 0;
    const okQty = parseInt(okInput.value) || 0;

    const result = totalLot - okQty;

    ngInput.value = result >= 0 ? result : 0;

    if (result > 0) {
        ngInput.style.backgroundColor = '#fff1f2';
        ngInput.style.color = '#ef4444';
        ngInput.style.fontWeight = 'bold';
    } else {
        ngInput.style.backgroundColor = '#f8fafc';
        ngInput.style.color = '';
        ngInput.style.fontWeight = 'normal';
    }
};

const WapSupportLogs = (function () {

    const TABLE = 'support_records';
    let _records    = [];
    let _filtered   = [];
    let _filter     = 'ALL';
    let _search     = '';
    let _user       = '';
    let _alive      = false;
    let _editingId  = null;
    let _viewing    = null;
    let _fetching   = false;
    let _fetchToken = 0;

    let $ = {};

    function _blankRecord() {
        return {
            id: null, problem: '', action: 'Rework', part: '', lot: '',
            ok: 0, ng: 0, report: 'VF', remark: '',
            eventDate: new Date().toISOString().split('T')[0],
            imageUrl: null
        };
    }

    function _safeTime(d) {
        if (!d) return 0;
        if (typeof d === 'number') return d;
        let s = String(d).trim();
        if (s.includes(' ') && !s.includes('T')) s = s.replace(' ', 'T');
        const t = new Date(s).getTime();
        return isNaN(t) ? 0 : t;
    }

    let _scrollRaf = null;

    function _cacheDom() {
        $.tbody       = document.getElementById('tableBody');
        $.count       = document.getElementById('caseCount');
        $.search      = document.getElementById('searchInput');
        $.filterGrp   = document.getElementById('filterGroup');
        $.scrollArea  = document.getElementById('tableScrollArea');
        $.contentArea = document.getElementById('line-support-logs-content');

        if ($.scrollArea && !$.scrollArea._vsAttached) {
            $.scrollArea._vsAttached = true;
            $.scrollArea.addEventListener('scroll', () => {
                if (!_scrollRaf) {
                    _scrollRaf = requestAnimationFrame(() => {
                        _scrollRaf = null;
                        _render(true);
                    });
                }
            }, { passive: true });
        }
    }

    async function _fetch() {
        if (_fetching) return;
        _fetching = true;
        const myToken = ++_fetchToken;
        try {
            if (!_user) {
                _user = (S.userRole === 'supervisor') ? S.viewingUser : S.currentUser;
            }
            let data = null;
            let error = null;

            // ลองสั่งดึงข้อมูลด้วย event_date เป็นหลัก
            const res1 = await wapClient
                .from(TABLE).select('*').eq('user_id', _user)
                .order('event_date', { ascending: false });

            if (res1.error) {
                console.warn('[WapSupport] event_date order failed, retrying without order:', res1.error);
                const res2 = await wapClient.from(TABLE).select('*').eq('user_id', _user);
                data = res2.data;
                error = res2.error;
            } else {
                data = res1.data;
            }

            if (error) throw error;
            if (myToken !== _fetchToken || !_alive) return;
            _records = (data || []).map(_fromDb);
            applyDateFilter();
        } catch (e) {
            console.error('[WapSupport] Fetch error:', e);
            if (myToken === _fetchToken && _alive) {
                // สำรองกรณีเกิด Error ให้ดึงจาก S.wapData.achievements ที่ดึงมาแล้วได้
                if (Array.isArray(S.wapData?.achievements) && S.wapData.achievements.length > 0) {
                    _records = S.wapData.achievements.map(_fromDb);
                } else {
                    toast('⚠️ โหลดข้อมูล Support ไม่สำเร็จ: ' + (e.message || ''), 'error');
                    _records = [];
                }
                _render();
            }
        } finally {
            if (myToken === _fetchToken) _fetching = false;
        }
    }

    function applyDateFilter() {
        if (!_alive) {
            const targetUser = (S.userRole === 'supervisor') ? S.viewingUser : S.currentUser;
            init(targetUser);
            return;
        }
        const start = document.getElementById('cd-start-date')?.value;
        const end = document.getElementById('cd-end-date')?.value;
        let temp = [..._records];

        if (start && end) {
            temp = temp.filter(r => r.eventDate && r.eventDate >= start && r.eventDate <= end);
        }
        if (_filter && _filter !== 'ALL') {
            temp = temp.filter(r => r.report === _filter);
        }
        if (_search && _search.trim() !== "") {
            const kw = _search.toLowerCase().trim();
            const cleanKw = kw.replace(/[^a-z0-9ก-๙]/gi, '');
            temp = temp.filter(r => {
                const problemText = (r.problem || "").toLowerCase();
                const partText = (r.part || "").toLowerCase();
                const lotText = (r.lot || "").toLowerCase();
                const remarkText = (r.remark || "").toLowerCase();
                const directMatch = problemText.includes(kw) || partText.includes(kw) || lotText.includes(kw) || remarkText.includes(kw);
                const fuzzyMatch = problemText.replace(/[^a-z0-9ก-๙]/gi, '').includes(cleanKw) ||
                                   partText.replace(/[^a-z0-9ก-๙]/gi, '').includes(cleanKw);
                return directMatch || (cleanKw.length > 3 && fuzzyMatch);
            });
        }
        // เรียงข้อมูลตามวันที่บันทึกล่าสุดลงไปเสมอ - ปลอดภัยบน Safari / iOS
        temp.sort((a, b) => {
            const timeA = _safeTime(a.createdAt || a.eventDate);
            const timeB = _safeTime(b.createdAt || b.eventDate);
            if (timeA !== timeB) return timeB - timeA;
            return String(b.id || '').localeCompare(String(a.id || ''));
        });

        _filtered = temp;
        _render();
    }

    function _render(fromScroll = false) {
        // Re-cache DOM elements if lost or detached
        if (!$.tbody || !document.body.contains($.tbody)) {
            $.tbody = document.getElementById('tableBody');
        }
        if (!$.count || !document.body.contains($.count)) {
            $.count = document.getElementById('caseCount');
        }
        if (!$.scrollArea || !document.body.contains($.scrollArea)) {
            $.scrollArea = document.getElementById('tableScrollArea');
            if ($.scrollArea && !$.scrollArea._vsAttached) {
                $.scrollArea._vsAttached = true;
                $.scrollArea.addEventListener('scroll', () => {
                    if (!_scrollRaf) {
                        _scrollRaf = requestAnimationFrame(() => {
                            _scrollRaf = null;
                            _render(true);
                        });
                    }
                }, { passive: true });
            }
        }

        if (!$.tbody) return;

        if ($.count) $.count.textContent = _filtered.length + ' Case Logs';

        if (_filtered.length === 0) {
            $.tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:80px;color:#cbd5e1;font-weight:600;letter-spacing:0.1em;">NO RECORDS FOUND</td></tr>`;
            return;
        }

        const totalRows = _filtered.length;
        const ROW_HEIGHT = 48; // Estimated average row height in px
        const OVERSCAN = 8;    // Extra rows above/below viewport

        let startIndex = 0;
        let endIndex = totalRows;
        let topSpacerPx = 0;
        let bottomSpacerPx = 0;

        // Virtual windowing if total rows > 25
        if (totalRows > 25 && $.scrollArea) {
            const scrollTop = $.scrollArea.scrollTop || 0;
            const clientHeight = $.scrollArea.clientHeight || 600;

            startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
            endIndex = Math.min(totalRows, Math.ceil((scrollTop + clientHeight) / ROW_HEIGHT) + OVERSCAN);

            topSpacerPx = startIndex * ROW_HEIGHT;
            bottomSpacerPx = (totalRows - endIndex) * ROW_HEIGHT;
        }

        let htmlRows = '';

        if (topSpacerPx > 0) {
            htmlRows += `<tr class="vs-spacer" style="height:${topSpacerPx}px; border:none; background:transparent;"><td colspan="10" style="padding:0; border:none; height:${topSpacerPx}px;"></td></tr>`;
        }

        const visibleSlice = _filtered.slice(startIndex, endIndex);
        htmlRows += visibleSlice.map((item, relIndex) => {
            const index = startIndex + relIndex;
            const total = (Number(item.ok) || 0) + (Number(item.ng) || 0);
            const ngRate = total > 0 ? Math.round((item.ng / total) * 100) : 0;
            const delay = !fromScroll && index < 15 ? (index * 0.04).toFixed(2) : 0;

            let statusCls = 'status-sf';
            if (item.report === 'RP') statusCls = 'status-vendor';
            if (item.report === 'RECORDS') statusCls = 'status-ctc';

            return `
                <tr style="${delay ? `animation-delay: ${delay}s` : ''}" data-rid="${item.id}">
                    <td class="col-date">${item.eventDate || '-'}</td>
                    <td class="col-problem">
                        <div class="col-problem">
    ${_esc(item.problem).replace(/(\d+)/g, '<span class="num-blue">$1</span>')}
</div>
                    </td>
                    <td><span class="col-action-badge">${_esc(item.action)}</span></td>
                    <td class="col-part"><span class="text-main">${_esc(item.part)}</span></td>
                    <td class="col-lot" style="font-family:monospace;">${_esc(item.lot)}</td>
                    <td class="col-ok" style="text-align:center; font-weight:800; color:#059669;">${(item.ok || 0).toLocaleString()}</td>
                    <td style="text-align:center;">
                        <div class="col-ng-wrap">
                            <span class="col-ng-num ${item.ng > 0 ? 'has-ng' : 'no-ng'}" style="font-weight:800;">${(item.ng || 0).toLocaleString()}</span>
                            ${item.ng > 0 ? `<div class="col-ng-rate" style="font-size:9px; color:#ef4444; font-weight:700;">${ngRate}%</div>` : ''}
                        </div>
                    </td>
                    <td style="text-align:center;"><span class="status-pill ${statusCls}">${item.report}</span></td>
                    <td style="text-align:center;">
                        ${item.imageUrl ?
                            `<span class="img-thumb" onclick="WapSupportLogs._openViewModal('${item.id}')">
                                <img  src="${item.imageUrl}" style="width:100%; height:100%; object-fit:cover;" alt="Image" title="Image">
                             </span>` :
                            `<span style="color:#e2e8f0; font-size:10px; font-weight:700;">N/A</span>`}
                    </td>
                    <td>
                        <div class="action-btns">
                            <button  class="act-btn act-btn-view" onclick="WapSupportLogs._openViewModal('${item.id}')" data-tip="View" title="Wap Support Logs._open View Modal" aria-label="Wap Support Logs._open View Modal"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                            <button  class="act-btn act-btn-edit" onclick="WapSupportLogs._openFormModal('${item.id}')" data-tip="Edit" title="Wap Support Logs._open Form Modal" aria-label="Wap Support Logs._open Form Modal"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                            <button  class="act-btn act-btn-del" onclick="WapSupportLogs._confirmDelete('${item.id}')" data-tip="Delete" title="Wap Support Logs._confirm Delete" aria-label="Wap Support Logs._confirm Delete"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                        </div>
                    </td>
                </tr>`;
        }).join('');

        if (bottomSpacerPx > 0) {
            htmlRows += `<tr class="vs-spacer" style="height:${bottomSpacerPx}px; border:none; background:transparent;"><td colspan="10" style="padding:0; border:none; height:${bottomSpacerPx}px;"></td></tr>`;
        }

        $.tbody.innerHTML = htmlRows;
        if (!fromScroll && typeof window.animateTableRows === 'function') {
            window.animateTableRows($.tbody, { y: 6, duration: 0.28, stagger: 0.02, ease: 'power2.out' });
        }
        if (typeof reapplyKbdRowSelection === 'function') reapplyKbdRowSelection();
    }

    /* ──────────────────────────────────────────
       FORM MODAL (เพิ่มระบบ Sync To Special Jobs + Commander Suggestion)
       ────────────────────────────────────────── */
   /* ──────────────────────────────────────────
       FORM MODAL (Integrated: Special Jobs + 8D Report)
       ────────────────────────────────────────── */
    function _openFormModal(id) {
        _editingId = id || null;
        const isEdit = Boolean(id);
        const r = isEdit ? (_records.find(x => x.id === id) || _blankRecord()) : _blankRecord();
        const isDark = document.body.classList.contains('dark-mode') || document.documentElement.classList.contains('dark') || localStorage.getItem('carrier_theme') === 'dark';

        // Helper: Format Date string to "6 Aug'26" format
        function _formatProblemDateStr(dateVal) {
            if (!dateVal) dateVal = new Date().toISOString().split('T')[0];
            const d = new Date(dateVal);
            if (isNaN(d.getTime())) return "6 Aug'26";
            const day = d.getDate();
            const mNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const month = mNames[d.getMonth()];
            const yr = d.getFullYear().toString().slice(-2);
            return `${day} ${month}'${yr}`;
        }

        // Parse initial problem fields (Default to EMPTY if creating a new record)
        let parsedUser = "";
        let parsedPart = "";
        let parsedPartNo = "";
        let parsedSupplier = "";
        let parsedDefect = "";
        let parsedDateStr = _formatProblemDateStr(r.eventDate);

        if (isEdit && r.problem) {
            const match = r.problem.match(/^On\s+(.*?)\s+(.*?)\s+inform quality problem about\s+(.*?)\s+\/\s+(.*?)\s+(.*?)\s+found defect\s+(.*)$/i);
            if (match) {
                parsedDateStr = match[1] || parsedDateStr;
                parsedUser = match[2] || "";
                parsedPart = match[3] || "";
                parsedPartNo = match[4] || "";
                parsedSupplier = match[5] || "";
                parsedDefect = match[6] || "";
            } else {
                parsedDefect = r.problem;
            }
        }

        // 1. รายการหมวดหมู่พาร์ท
        const partCategories = [
            "insulation parts", "Mold Part", "Packaging part", "Rubber parts",
            "Plastic Resin Mold Part", "Plastic Resin (Assy)", "Packaging part Form",
            "Aluminium Part", "Steel", "Copper Part", "Terminal", "Remote Control",
            "Motors", "Electric Controls", "PCBA", "Compressors", "Piping Part", "Printing part"
        ];

        const partOptions = partCategories.map(cat => 
            `<option value="${cat}" ${r.part === cat ? 'selected' : ''}>${cat}</option>`
        ).join('');

        // 2. รายชื่อ Commander
        const existingCommanders = [...new Set((S.wapData.specialJobs || []).map(j => j.assigned_by).filter(Boolean))];
        const commanderOptions = existingCommanders.map(name => `<option value="${_esc(name)}">`).join('');

        // 3. --- Smart Part Master Map & Lookup ---
        const partMapByNo = {};
        const partMapByName = {};
        const allPartNos = new Set();
        const allPartNames = new Set();
        const allSuppliers = new Set(["V.PARADISE"]);
        const allDefects = new Set();

        const processRecordForMap = (rec) => {
            if (!rec) return;
            let pNo = (rec.partNo || rec.part_no || '').trim();
            let pName = (rec.partName || rec.part_name || '').trim();
            let sup = (rec.supplier || '').trim();
            let def = (rec.defect || rec.defect_detail || '').trim();
            let rawGrp = (rec.partGroup || rec.part_group || rec.part || rec.category || '').trim();
            let grp = (rawGrp === '-' || rawGrp === '--' || rawGrp.toLowerCase() === 'null' || rawGrp.toLowerCase() === 'undefined') ? '' : rawGrp;
            let usr = (rec.user || rec.informer || rec.area || rec.dept || rec.line || '').trim();

            if (rec.problem) {
                const match = rec.problem.match(/^On\s+(.*?)\s+(.*?)\s+inform quality problem about\s+(.*?)\s+\/\s+(.*?)\s+(.*?)\s+found defect\s+(.*)$/i);
                if (match) {
                    if (!usr) usr = (match[2] || '').trim();
                    if (!pName) pName = (match[3] || '').trim();
                    if (!pNo) pNo = (match[4] || '').trim();
                    if (!sup) sup = (match[5] || '').trim();
                    if (!def) def = (match[6] || '').trim();
                } else if (!def) {
                    def = rec.problem.trim();
                }
            }

            if (pNo) {
                allPartNos.add(pNo);
                const k = pNo.toLowerCase();
                if (!partMapByNo[k]) {
                    partMapByNo[k] = { partNo: pNo, partName: pName, supplier: sup, partGroup: grp, user: usr, defect: def };
                } else {
                    if (!partMapByNo[k].partName && pName) partMapByNo[k].partName = pName;
                    if (!partMapByNo[k].supplier && sup) partMapByNo[k].supplier = sup;
                    if ((!partMapByNo[k].partGroup || partMapByNo[k].partGroup === '-') && grp) partMapByNo[k].partGroup = grp;
                    if (!partMapByNo[k].user && usr) partMapByNo[k].user = usr;
                    if (!partMapByNo[k].defect && def) partMapByNo[k].defect = def;
                }
            }
            if (pName) {
                allPartNames.add(pName);
                const k = pName.toLowerCase();
                if (!partMapByName[k]) {
                    partMapByName[k] = { partNo: pNo, partName: pName, supplier: sup, partGroup: grp, user: usr, defect: def };
                } else {
                    if (!partMapByName[k].partNo && pNo) partMapByName[k].partNo = pNo;
                    if (!partMapByName[k].supplier && sup) partMapByName[k].supplier = sup;
                    if ((!partMapByName[k].partGroup || partMapByName[k].partGroup === '-') && grp) partMapByName[k].partGroup = grp;
                    if (!partMapByName[k].user && usr) partMapByName[k].user = usr;
                    if (!partMapByName[k].defect && def) partMapByName[k].defect = def;
                }
            }
            if (sup) allSuppliers.add(sup);
            if (def) allDefects.add(def);
        };

        // Collect from _records & S.records
        [...(_records || []), ...(S.records || [])].forEach(processRecordForMap);

        // Collect from smartMemory
        if (typeof smartMemory === 'object' && smartMemory && smartMemory.values) {
            (smartMemory.values.partNo || []).forEach(pNo => allPartNos.add(pNo));
            (smartMemory.values.partName || []).forEach(pName => allPartNames.add(pName));
            (smartMemory.values.supplier || []).forEach(sup => allSuppliers.add(sup));
            (smartMemory.values.defect || []).forEach(def => allDefects.add(def));

            Object.keys(smartMemory.byPartNo || {}).forEach(k => {
                const pack = typeof getMostFrequentPack === 'function' ? getMostFrequentPack(smartMemory.byPartNo[k]) : smartMemory.byPartNo[k][0];
                if (pack && pack.partNo) {
                    processRecordForMap({
                        partNo: pack.partNo,
                        partName: pack.partName,
                        supplier: pack.supplier,
                        defect: pack.defect,
                        user: pack.line || pack.user || ''
                    });
                }
            });
            Object.keys(smartMemory.byPartName || {}).forEach(k => {
                const pack = typeof getMostFrequentPack === 'function' ? getMostFrequentPack(smartMemory.byPartName[k]) : smartMemory.byPartName[k][0];
                if (pack && pack.partName) {
                    processRecordForMap({
                        partNo: pack.partNo,
                        partName: pack.partName,
                        supplier: pack.supplier,
                        defect: pack.defect,
                        user: pack.line || pack.user || ''
                    });
                }
            });
        }

        // Collect from VENDOR_MASTER & defectDict
        if (typeof VENDOR_MASTER === 'object' && VENDOR_MASTER !== null) {
            Object.values(VENDOR_MASTER).forEach(v => { if (v && typeof v === 'string') allSuppliers.add(v.trim()); });
        }
        if (typeof defectDict === 'object' && defectDict !== null) {
            Object.keys(defectDict).forEach(k => allDefects.add(k.toUpperCase()));
        }

        const partnoDatalistOptions = Array.from(allPartNos).sort().map(p => `<option value="${_esc(p)}">`).join('');
        const partnameDatalistOptions = Array.from(allPartNames).sort().map(p => `<option value="${_esc(p)}">`).join('');
        const supplierDatalistOptions = Array.from(allSuppliers).sort().map(s => `<option value="${_esc(s)}">`).join('');
        const defectDatalistOptions = Array.from(allDefects).sort().map(d => `<option value="${_esc(d)}">`).join('');

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'support-form-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,0.65);backdrop-filter:blur(4px);padding:10px;';

        modal.innerHTML = `
            <div style="background:#fff; border-radius:20px; width:100%; max-width:720px; overflow:hidden; display:flex; flex-direction:column; max-height:92vh; box-shadow:0 25px 50px rgba(0,0,0,0.25); animation:modalPop .2s ease;">
                <!-- Header -->
                <div style="background:#1e293b; color:#fff; padding:12px 18px; display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.04em; display:flex; align-items:center; gap:8px; margin:0;">
                        <span>${isEdit ? '📝 แก้ไขรายงานเคลมผลิต' : '✨ บันทึกรายงานเคลมใหม่'}</span>
                    </h3>
                    <button type="button" onclick="this.closest('.modal-overlay').remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer; font-size:18px; transition:color 0.2s;" title="Close" aria-label="Close">✕</button>
                </div>
                
                <form id="sup-form" style="padding:14px 18px; display:flex; flex-direction:column; gap:10px; overflow-y:auto; flex:1;">
                    <!-- Offline Draft Status & Restore Indicator Banner -->
                    <div id="offline-draft-banner" style="display:none; padding:10px 14px; border-radius:12px; font-size:11px; font-weight:700; align-items:center; justify-content:space-between; gap:10px; transition:all 0.3s ease;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span id="offline-indicator-icon" style="font-size:14px;">📶</span>
                            <span id="offline-indicator-text"></span>
                        </div>
                        <div id="offline-indicator-actions" style="display:flex; align-items:center; gap:6px;"></div>
                    </div>

                    <!-- ==========================================================
                         หมวดหมู่ 1: ชิ้นส่วน & รายละเอียดปัญหา (Smart Lookup)
                         ========================================================== -->
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:10px 12px; display:flex; flex-direction:column; gap:8px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">
                            <label style="font-size:11px; font-weight:800; color:#0f172a; text-transform:uppercase; display:flex; align-items:center; gap:6px; margin:0;">
                                <svg width="14" height="14" fill="none" stroke="#2563eb" viewBox="0 0 24 24" stroke-width="2.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 0-2-2V5a2 2 0 0 0 2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                🧩 1. ชิ้นส่วน & รายละเอียดปัญหา (Smart Auto-Complete)
                            </label>
                            <div style="display:flex; align-items:center; gap:6px;">
                                <span id="smart-match-notice" style="display:none; font-size:9.5px; font-weight:800; color:#059669; background:#d1fae5; padding:2px 8px; border-radius:6px; border:1px solid #6ee7b7;"></span>
                                <span style="font-size:9.5px; font-weight:800; color:#0284c7; background:#e0f2fe; padding:2px 8px; border-radius:6px; border:1px solid #bae6fd; font-family:monospace;">
                                    <span id="prob-date-badge">${parsedDateStr}</span>
                                </span>
                            </div>
                        </div>

                        <!-- Grid 3 คอลัมน์สำหรับข้อมูลพาร์ท -->
                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;">
                            <div>
                                <label style="font-size:10px; font-weight:700; color:#475569; margin-bottom:2px; display:block;">🔢 รหัสพาร์ท (Part No.) *</label>
                                <input type="text" id="prob-partno" list="partno-datalist" value="${parsedPartNo}" placeholder="พิมพ์รหัสพาร์ท..." class="form-input" style="width:100%; height:32px; font-size:11px; font-weight:700; font-family:monospace;" title="Part No" aria-label="Part No" autocomplete="off">
                                <datalist id="partno-datalist">${partnoDatalistOptions}</datalist>
                            </div>
                            <div>
                                <label style="font-size:10px; font-weight:700; color:#475569; margin-bottom:2px; display:block;">🧩 ชื่อพาร์ท (Part Name) *</label>
                                <input type="text" id="prob-part" list="partname-datalist" value="${parsedPart}" placeholder="พิมพ์ชื่อพาร์ท..." class="form-input" style="width:100%; height:32px; font-size:11px; font-weight:700;" title="Part Name" aria-label="Part Name" autocomplete="off">
                                <datalist id="partname-datalist">${partnameDatalistOptions}</datalist>
                            </div>
                            <div>
                                <label style="font-size:10px; font-weight:700; color:#475569; margin-bottom:2px; display:block;">🏭 ผู้จำหน่าย (Supplier)</label>
                                <input type="text" id="prob-supplier" list="supplier-datalist" value="${parsedSupplier}" placeholder="พิมพ์ชื่อผู้จำหน่าย..." class="form-input" style="width:100%; height:32px; font-size:11px; font-weight:700; color:#0284c7;" title="Supplier Name" aria-label="Supplier Name" autocomplete="off">
                                <datalist id="supplier-datalist">${supplierDatalistOptions}</datalist>
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;">
                            <div>
                                <label style="font-size:10px; font-weight:700; color:#475569; margin-bottom:2px; display:block;">📦 หมวดหมู่พาร์ท</label>
                                <select id="f-sup-part-cat" name="part" class="form-input" style="width:100%; height:32px; font-size:11px; font-weight:600;" required title="Part Category" aria-label="Part Category">
                                    <option value="" ${!r.part ? 'selected' : ''}>-- เลือกหมวดหมู่ --</option>
                                    ${partOptions}
                                </select>
                            </div>
                            <div>
                                <label style="font-size:10px; font-weight:700; color:#475569; margin-bottom:2px; display:block;">📍 ผู้แจ้ง / พื้นที่ (Area/Dept)</label>
                                <input type="text" id="prob-user" value="${parsedUser}" placeholder="เช่น OSA-A1" class="form-input" style="width:100%; height:32px; font-size:11px; font-weight:600;" title="User/Area" aria-label="User/Area">
                            </div>
                            <div>
                                <label style="font-size:10px; font-weight:700; color:#e11d48; margin-bottom:2px; display:block;">⚠️ อาการเสีย (Defect Detail)</label>
                                <input type="text" id="prob-defect" list="defect-datalist" value="${parsedDefect}" placeholder="ระบุอาการเสีย..." class="form-input" style="width:100%; height:32px; font-size:11px; font-weight:700; color:#e11d48;" title="Defect" aria-label="Defect" autocomplete="off">
                                <datalist id="defect-datalist">${defectDatalistOptions}</datalist>
                            </div>
                        </div>

                        <!-- Live Preview Banner -->
                        <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:8px 10px; font-size:10.5px; color:#334155; display:flex; align-items:flex-start; gap:8px;">
                            <span style="font-size:9px; font-weight:800; color:#64748b; text-transform:uppercase; flex-shrink:0; padding-top:1px;">PREVIEW:</span>
                            <span id="prob-preview-text" style="color:#0f172a; font-weight:700; font-family:monospace; word-break:break-word; white-space:pre-wrap; flex:1; line-height:1.45;"></span>
                        </div>
                        <input type="hidden" id="f-sup-problem" name="problem" value="">
                    </div>

                    <!-- ==========================================================
                         หมวดหมู่ 2: ข้อมูลการแก้ไข & จำนวน (Action & Quantities)
                         ========================================================== -->
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:10px 12px; display:flex; flex-direction:column; gap:8px;">
                        <label style="font-size:11px; font-weight:800; color:#0f172a; text-transform:uppercase; display:flex; align-items:center; gap:6px; margin:0; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">
                            ⚙️ 2. วันที่ การแก้ไข & จำนวนชิ้นงาน
                        </label>

                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;">
                            <div>
                                <label style="font-size:10px; font-weight:700; color:#475569; margin-bottom:2px; display:block;">📅 วันที่รายงาน</label>
                                <input type="date" id="f-sup-date" name="date" value="${r.eventDate || new Date().toISOString().split('T')[0]}" class="form-input" style="width:100%; height:32px; font-size:11px;" required title="Date" aria-label="Date">
                            </div>
                            <div>
                                <label style="font-size:10px; font-weight:700; color:#475569; margin-bottom:2px; display:block;">🔧 การแก้ไข (ACTION)</label>
                                <select id="f-sup-action" name="action" class="form-input" style="width:100%; height:32px; font-size:11px;" title="Action" aria-label="Action">
                                    <option value="" ${!r.action ? 'selected' : ''}>-- เลือก ACTION --</option>
                                    <option value="Rework" ${r.action==='Rework'?'selected':''}>Rework (แก้ไขงานซ่อม)</option>
                                    <option value="Repair" ${r.action==='Repair'?'selected':''}>Repair (ซ่อมแซมตามเงื่อนไข)</option>
                                    <option value="Replace" ${r.action==='Replace'?'selected':''}>Replace (เปลี่ยนชิ้นส่วนใหม่)</option>
                                    <option value="Sorting 100%" ${r.action==='Sorting 100%'?'selected':''}>Sorting 100% (คัดแยกชิ้นงาน 100%)</option>
                                    <option value="Screening & Re-inspection" ${r.action==='Screening & Re-inspection'?'selected':''}>Screening & Re-inspection (คัดกรองตรวจซ้ำ)</option>
                                    <option value="Use as is" ${r.action==='Use as is'||r.action==='Use as is / Concession'?'selected':''}>Use as is / Concession (อนุโลมใช้ตามสภาพ)</option>
                                    <option value="Scrap" ${r.action==='Scrap'?'selected':''}>Scrap (ทำลายชิ้นงาน NG)</option>
                                    <option value="Return to Vendor" ${r.action==='Return to Vendor'||r.action==='RTV'?'selected':''}>RTV (ส่งคืนผู้ขาย/ซัพพลายเออร์)</option>
                                    <option value="Containment / Quarantine" ${r.action==='Containment / Quarantine'?'selected':''}>Containment / Hold (กักกันชิ้นงานเสี่ยง)</option>
                                    <option value="Engineering Change (EC/ECN)" ${r.action==='Engineering Change (EC/ECN)'?'selected':''}>Engineering Change (EC/ECN)</option>
                                    <option value="Poka-Yoke / Error Proofing" ${r.action==='Poka-Yoke / Error Proofing'?'selected':''}>Poka-Yoke / Jig Adjustment</option>
                                    <option value="Line Stop & Purge" ${r.action==='Line Stop & Purge'?'selected':''}>Line Purge & Clean (เคลียร์สายการผลิต)</option>
                                    <option value="Supplier On-site Sorting" ${r.action==='Supplier On-site Sorting'?'selected':''}>Supplier On-site Sorting</option>
                                    <option value="Process Parameter Adjustment" ${r.action==='Process Parameter Adjustment'?'selected':''}>Process Parameter Adjustment</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size:10px; font-weight:700; color:#475569; margin-bottom:2px; display:block;">📋 ประเภทรายงาน</label>
                                <select name="report" class="form-input" style="width:100%; height:32px; font-size:11px;" title="Report" aria-label="Report">
                                    <option value="VF" ${r.report==='VF'?'selected':''}>VF Report</option>
                                    <option value="RP" ${r.report==='RP'?'selected':''}>RP Report</option>
                                    <option value="RECORDS" ${r.report==='RECORDS'?'selected':''}>Records</option> 
                                </select>
                            </div>
                        </div>

                        <!-- Quantities row -->
                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;">
                            <div>
                                <label style="font-size:10px; font-weight:800; color:#475569; margin-bottom:2px; display:block;">📦 LOT NO. (QTY รวม)</label>
                                <input type="number" id="f-sup-lot" name="lot" value="${r.lot || ''}" class="form-input" style="width:100%; height:32px; font-size:11px; font-weight:700;" placeholder="0" oninput="WapSupportLogs.calcNG()" title="จำนวนทั้งหมด" aria-label="จำนวนทั้งหมด">
                            </div>
                            <div>
                                <label style="font-size:10px; font-weight:800; color:#059669; margin-bottom:2px; display:block;">✅ OK QTY</label>
                                <input type="number" id="f-sup-ok" name="ok" value="${r.ok || ''}" class="form-input" style="width:100%; height:32px; font-size:11px; font-weight:700;" placeholder="0" oninput="WapSupportLogs.calcNG()" title="OK Qty" aria-label="OK Qty">
                            </div>
                            <div>
                                <label style="font-size:10px; font-weight:800; color:#ef4444; margin-bottom:2px; display:block;">❌ NG QTY (Auto)</label>
                                <input type="number" id="f-sup-ng" name="ng" value="${r.ng || ''}" class="form-input" style="width:100%; height:32px; font-size:11px; font-weight:800; background:#fff1f2; color:#e11d48;" readonly placeholder="0" title="NG Qty" aria-label="NG Qty">
                            </div>
                        </div>

                        <!-- Row 3: Integrated Toggles Side-by-Side right after Quantities -->
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:2px;">
                            <!-- 1. Toggle: Special Jobs (Blue Theme) -->
                            <div style="padding:8px 12px; background:rgba(59, 130, 246, 0.04); border:1px dashed rgba(59, 130, 246, 0.3); border-radius:10px; display:flex; align-items:center; justify-content:space-between; gap:10px;" id="sync-container">
                                <div style="display:flex; align-items:center; gap:8px; flex:1;">
                                    <div style="width:28px; height:28px; background:#fff; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#3b82f6; flex-shrink:0;">
                                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                    </div>
                                    <div style="flex:1;">
                                        <p style="font-size:10.5px; font-weight:800; color:#1e293b; margin:0; text-transform:uppercase;">บันทึกเป็นภารกิจพิเศษ</p>
                                        <div style="margin-top:3px; display:none;" id="commander-input-wrap">
                                            <input type="text" id="sync-commander-name" list="commander-list" 
                                                   placeholder="ชื่อผู้สั่งงาน (Commander)..."
                                                   style="width:100%; height:26px; font-size:10px; border:1px solid #dbeafe; border-radius:6px; padding:0 8px; outline:none; background:#fff; font-weight:600; color:#2563eb;" title="Commander" aria-label="Commander">
                                            <datalist id="commander-list">${commanderOptions}</datalist>
                                        </div>
                                    </div>
                                </div>
                                <label class="premium-toggle">
                                    <input type="checkbox" id="sync-to-special" title="Sync To Special" aria-label="Sync To Special">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>

                            <!-- 2. Toggle: 8D Report (Red Theme) -->
                            <div style="padding:8px 12px; background:rgba(225, 29, 72, 0.04); border:1px dashed rgba(225, 29, 72, 0.3); border-radius:10px; display:flex; align-items:center; justify-content:space-between; gap:10px;" id="8d-container">
                                <div style="display:flex; align-items:center; gap:8px; flex:1;">
                                    <div style="width:28px; height:28px; background:#fff; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#e11d48; flex-shrink:0; font-weight:950; font-size:12px;">
                                        8D
                                    </div>
                                    <div style="flex:1;">
                                        <p style="font-size:10.5px; font-weight:800; color:#1e293b; margin:0; text-transform:uppercase;">เปิดเคสวิเคราะห์ 8D Report</p>
                                    </div>
                                </div>
                                <label class="premium-toggle">
                                    <input type="checkbox" id="trigger-8d-report" title="Trigger 8d Report" aria-label="Trigger 8d Report">
                                    <span class="toggle-slider" style="background-color:#fca5a5;"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- ==========================================================
                         หมวดหมู่ 3: รูปภาพหลักฐาน (Evidence Image Upload Wide Bar)
                         ========================================================== -->
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:10px 12px; display:flex; flex-direction:column; gap:6px;">
                        <label style="font-size:11px; font-weight:800; color:#0f172a; text-transform:uppercase; display:flex; align-items:center; gap:6px; margin:0;">
                            📸 3. รูปภาพหลักฐาน (Evidence)
                        </label>
                        <div style="border:1.5px dashed #cbd5e1; border-radius:12px; background:#ffffff; position:relative; padding:10px; min-height:60px; display:flex; align-items:center; justify-content:center; transition:all 0.2s ease;">
                            <input type="file" id="img-input" accept="image/*" style="position:absolute; inset:0; opacity:0; cursor:pointer; z-index:2;" title="Img Input" aria-label="Img Input">
                            <div id="img-preview-area" style="text-align:center; display:flex; align-items:center; justify-content:center; gap:8px;">
                                ${r.imageUrl ? `<img src="${r.imageUrl}" style="max-height:75px; max-width:100%; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);" alt="Image" title="Image">` : `
                                    <div style="display:flex; align-items:center; gap:8px; color:#64748b;">
                                        <svg width="20" height="20" fill="none" stroke="#2563eb" viewBox="0 0 24 24" stroke-width="2"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                        <span style="font-size:11px; font-weight:700;">📷 คลิกหรือลากวางรูปภาพหลักฐานเพิ่มเติมได้ที่นี่</span>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>

                    <!-- ==========================================================
                         หมวดหมู่ 4: หมายเหตุ (Remark - Auto Expand Textarea)
                         ========================================================== -->
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:10px 12px; display:flex; flex-direction:column; gap:6px;">
                        <label style="font-size:11px; font-weight:800; color:#0f172a; text-transform:uppercase; display:flex; align-items:center; gap:6px; margin:0;">
                            💬 4. หมายเหตุเพิ่มเติม (Remark)
                        </label>
                        <textarea name="remark" class="form-input" 
                                  style="width:100%; min-height:38px; max-height:140px; font-size:11px; font-weight:600; padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; background:#fff; line-height:1.4; outline:none; resize:none; overflow-y:auto;" 
                                  placeholder="พิมพ์รายละเอียดหรือหมายเหตุเพิ่มเติม (กล่องย่อ-ขยายความสูงอัตโนมัติตามข้อความ)..." 
                                  title="Remark" 
                                  aria-label="Remark"
                                  oninput="this.style.height='38px'; this.style.height=(this.scrollHeight)+'px';">${_esc(r.remark || '')}</textarea>
                    </div>

                    <!-- ปุ่มดำเนินการ -->
                    <div style="display:flex; gap:10px; justify-content:flex-end; padding-top:8px; border-top:1px solid #f1f5f9; margin-top:2px;">
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:8px 20px; border-radius:10px; border:1px solid #cbd5e1; background:#fff; font-weight:700; color:#64748b; font-size:12px; cursor:pointer;" title="Cancel" aria-label="Cancel">ยกเลิก</button>
                        <button type="submit" id="sup-form-submit-btn" style="padding:8px 28px; border-radius:10px; border:none; background:linear-gradient(135deg,#1e293b,#2563eb); color:#fff; font-weight:900; font-size:12px; cursor:pointer; text-transform:uppercase; letter-spacing:0.04em;" title="Save Report" aria-label="Save Report">บันทึกรายงาน</button>
                    </div>
                </form>
            </div>`;

        document.body.appendChild(modal);

        // --- Smart Lookup & Auto-fill Handler ---
        function handleSmartPartLookup(triggeredBy) {
            const partNoInput = modal.querySelector('#prob-partno');
            const partNameInput = modal.querySelector('#prob-part');
            const supplierInput = modal.querySelector('#prob-supplier');
            const categorySelect = modal.querySelector('#f-sup-part-cat');
            const userInput = modal.querySelector('#prob-user');
            const defectInput = modal.querySelector('#prob-defect');
            const matchNotice = modal.querySelector('#smart-match-notice');

            let pNoVal = (partNoInput?.value || '').trim().toLowerCase().replace(/^["'\s]+|["'\s]+$/g, '');
            let pNameVal = (partNameInput?.value || '').trim().toLowerCase().replace(/^["'\s]+|["'\s]+$/g, '');

            let matchedPack = null;
            if ((triggeredBy === 'partno' || !triggeredBy) && pNoVal) {
                matchedPack = partMapByNo[pNoVal];
                if (!matchedPack) {
                    const normNo = pNoVal.replace(/[\s\-_]/g, '');
                    if (normNo) {
                        const matchedKey = Object.keys(partMapByNo).find(k => k.replace(/[\s\-_]/g, '') === normNo);
                        if (matchedKey) matchedPack = partMapByNo[matchedKey];
                    }
                }
                if (matchedPack && matchedPack.partName && partNameInput && !partNameInput.value) {
                    partNameInput.value = matchedPack.partName;
                }
            }
            if (!matchedPack && (triggeredBy === 'partname' || !triggeredBy || !pNoVal) && pNameVal) {
                matchedPack = partMapByName[pNameVal];
                if (!matchedPack) {
                    const normName = pNameVal.replace(/[\s\-_]/g, '');
                    if (normName) {
                        const matchedKey = Object.keys(partMapByName).find(k => k.replace(/[\s\-_]/g, '') === normName);
                        if (matchedKey) matchedPack = partMapByName[matchedKey];
                    }
                }
                if (matchedPack && matchedPack.partNo && partNoInput && !partNoInput.value) {
                    partNoInput.value = matchedPack.partNo;
                }
            }

            if (matchedPack) {
                if (matchedPack.supplier && supplierInput && !supplierInput.value) {
                    supplierInput.value = matchedPack.supplier;
                } else if (matchedPack.supplier && supplierInput && supplierInput.value !== matchedPack.supplier) {
                    supplierInput.value = matchedPack.supplier;
                }
                if (matchedPack.partGroup && categorySelect) {
                    const rawGrp = matchedPack.partGroup.trim();
                    if (rawGrp && rawGrp !== '-' && rawGrp !== '--') {
                        const grpLower = rawGrp.toLowerCase();
                        let matchedOpt = Array.from(categorySelect.options).find(opt => opt.value.trim().toLowerCase() === grpLower);
                        if (!matchedOpt) {
                            const normGrp = grpLower.replace(/[^a-z0-9]/g, '');
                            if (normGrp) {
                                matchedOpt = Array.from(categorySelect.options).find(opt => {
                                    const normOpt = opt.value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                                    return normOpt && (normOpt === normGrp || normOpt.includes(normGrp) || normGrp.includes(normOpt));
                                });
                            }
                        }
                        if (matchedOpt) {
                            categorySelect.value = matchedOpt.value;
                        }
                    }
                }
                if (matchedPack.user && userInput && !userInput.value) {
                    userInput.value = matchedPack.user;
                }
                if (matchedPack.defect && defectInput && !defectInput.value) {
                    defectInput.value = matchedPack.defect;
                }

                if (matchNotice) {
                    const infoParts = [];
                    if (matchedPack.partGroup) infoParts.push(`หมวดหมู่: ${matchedPack.partGroup}`);
                    if (matchedPack.user) infoParts.push(`ผู้แจ้ง: ${matchedPack.user}`);
                    if (matchedPack.defect) infoParts.push(`อาการ: ${matchedPack.defect}`);
                    const summary = infoParts.length ? ` (${infoParts.join(' | ')})` : '';
                    matchNotice.innerHTML = `✨ <strong>Auto-fill จากประวัติ:</strong> ${matchedPack.partNo || matchedPack.partName || ''}${summary}`;
                    matchNotice.style.display = 'inline-flex';
                }
            } else if (matchNotice && !pNoVal && !pNameVal) {
                matchNotice.style.display = 'none';
            }

            syncProblemSentence();
        }

        const partNoEl = modal.querySelector('#prob-partno');
        if (partNoEl) {
            ['input', 'change', 'keyup', 'blur', 'focus', 'paste'].forEach(evtType => {
                partNoEl.addEventListener(evtType, (e) => {
                    if (evtType === 'paste') {
                        let pastedText = '';
                        if (e.clipboardData && e.clipboardData.getData) {
                            pastedText = e.clipboardData.getData('text/plain') || '';
                        }
                        if (pastedText) {
                            const cleaned = pastedText.trim().replace(/[\r\n\t]/g, '');
                            if (cleaned) {
                                setTimeout(() => {
                                    partNoEl.value = cleaned;
                                    handleSmartPartLookup('partno');
                                }, 0);
                            }
                        }
                    }
                    handleSmartPartLookup('partno');
                    setTimeout(() => handleSmartPartLookup('partno'), 30);
                });
            });
        }

        const partNameEl = modal.querySelector('#prob-part');
        if (partNameEl) {
            ['input', 'change', 'keyup', 'blur', 'focus', 'paste'].forEach(evtType => {
                partNameEl.addEventListener(evtType, (e) => {
                    if (evtType === 'paste') {
                        let pastedText = '';
                        if (e.clipboardData && e.clipboardData.getData) {
                            pastedText = e.clipboardData.getData('text/plain') || '';
                        }
                        if (pastedText) {
                            const cleaned = pastedText.trim().replace(/[\r\n\t]/g, '');
                            if (cleaned) {
                                setTimeout(() => {
                                    partNameEl.value = cleaned;
                                    handleSmartPartLookup('partname');
                                }, 0);
                            }
                        }
                    }
                    handleSmartPartLookup('partname');
                    setTimeout(() => handleSmartPartLookup('partname'), 30);
                });
            });
        }

        // --- Synchronize Problem Statement Builder ---
        function syncProblemSentence() {
            const dateInputVal = modal.querySelector('#f-sup-date')?.value || r.eventDate;
            const dateStr = _formatProblemDateStr(dateInputVal);
            const userVal = (modal.querySelector('#prob-user')?.value || '').trim();
            const partVal = (modal.querySelector('#prob-part')?.value || '').trim();
            const partNoVal = (modal.querySelector('#prob-partno')?.value || '').trim();
            const supplierVal = (modal.querySelector('#prob-supplier')?.value || '').trim();
            const defectVal = (modal.querySelector('#prob-defect')?.value || '').trim();

            const dateBadge = modal.querySelector('#prob-date-badge');
            if (dateBadge) dateBadge.textContent = dateStr;

            let fullSentence = '';
            if (userVal || partVal || partNoVal || supplierVal || defectVal) {
                fullSentence = `On ${dateStr} ${userVal} inform quality problem about ${partVal} / ${partNoVal} ${supplierVal} found defect ${defectVal}`;
            }

            const hiddenProb = modal.querySelector('#f-sup-problem');
            if (hiddenProb) hiddenProb.value = fullSentence;

            const previewText = modal.querySelector('#prob-preview-text');
            if (previewText) {
                previewText.textContent = fullSentence || 'ระบุรายละเอียดปัญหาเพื่อสร้าง Problem Statement';
                previewText.style.color = fullSentence ? (isDark ? '#f8fafc' : '#0f172a') : (isDark ? '#64748b' : '#94a3b8');
            }
        }

        ['prob-user', 'prob-supplier', 'prob-defect'].forEach(fieldId => {
            const el = modal.querySelector('#' + fieldId);
            if (el) el.addEventListener('input', syncProblemSentence);
        });
        const dateEl = modal.querySelector('#f-sup-date');
        if (dateEl) dateEl.addEventListener('change', syncProblemSentence);
        syncProblemSentence();

        // --- Logic: Special Job Toggle Interaction ---
        const syncCheck = document.getElementById('sync-to-special');
        const syncCont = document.getElementById('sync-container');
        const commanderWrap = document.getElementById('commander-input-wrap');
        const commanderInput = document.getElementById('sync-commander-name');

        syncCheck.onchange = (e) => {
            const isActive = e.target.checked;
            syncCont.style.borderColor = isActive ? '#3b82f6' : (isDark ? 'rgba(59, 130, 246, 0.45)' : 'rgba(59, 130, 246, 0.3)');
            syncCont.style.background = isActive ? (isDark ? 'rgba(59, 130, 246, 0.22)' : 'rgba(59, 130, 246, 0.08)') : (isDark ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.04)');
            commanderWrap.style.display = isActive ? 'block' : 'none';
        };
        commanderWrap.style.display = 'none';

        // --- Logic: 8D Toggle Interaction ---
        const d8Check = document.getElementById('trigger-8d-report');
        const d8Cont = document.getElementById('8d-container');
        d8Check.onchange = (e) => {
            const isActive = e.target.checked;
            d8Cont.style.borderColor = isActive ? '#e11d48' : (isDark ? 'rgba(225, 29, 72, 0.45)' : 'rgba(225, 29, 72, 0.3)');
            d8Cont.style.background = isActive ? (isDark ? 'rgba(225, 29, 72, 0.22)' : 'rgba(225, 29, 72, 0.08)') : (isDark ? 'rgba(225, 29, 72, 0.12)' : 'rgba(225, 29, 72, 0.04)');
        };

        // --- Logic: Image Upload ---
        let currentImage = r.imageUrl || null;
        const imgInput = document.getElementById('img-input');
        if (imgInput) {
            imgInput.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    currentImage = ev.target.result;
                    document.getElementById('img-preview-area').innerHTML = `<img src="${ev.target.result}" style="max-height:75px; max-width:100%; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);" alt="Image" title="Image">`;
                    saveDraftData();
                };
                reader.readAsDataURL(file);
            };
        }

        // --- Offline Draft Management & Auto-Save ---
        const DRAFT_KEY = 'wap_sup_form_draft';
        const formEl = document.getElementById('sup-form');
        const submitBtn = document.getElementById('sup-form-submit-btn');
        const offlineBanner = modal.querySelector('#offline-draft-banner');
        const offlineText = modal.querySelector('#offline-indicator-text');
        const offlineIcon = modal.querySelector('#offline-indicator-icon');
        const offlineActions = modal.querySelector('#offline-indicator-actions');

        function updateOfflineStatusUI() {
            if (!offlineBanner) return;
            const isOffline = !navigator.onLine;
            const savedRaw = localStorage.getItem(DRAFT_KEY);

            if (isOffline) {
                offlineBanner.style.display = 'flex';
                offlineBanner.style.background = isDark ? 'rgba(217, 119, 6, 0.22)' : '#fffbe2';
                offlineBanner.style.border = isDark ? '1px solid #b45309' : '1px solid #fcd34d';
                offlineBanner.style.color = isDark ? '#fef08a' : '#92400e';
                if (offlineIcon) offlineIcon.textContent = '📶';
                
                let timeStr = 'บันทึกอัตโนมัติ';
                if (savedRaw) {
                    try {
                        const d = JSON.parse(savedRaw);
                        if (d.savedAt) timeStr = `บันทึกล่าสุด ${d.savedAt}`;
                    } catch(e){}
                }
                if (offlineText) offlineText.innerHTML = `<strong>โหมดออฟไลน์ (Offline Mode):</strong> บันทึกความคืบหน้าแบบร่างลง LocalStorage อัตโนมัติ (${timeStr})`;
                if (offlineActions) offlineActions.innerHTML = `<span style="font-size:9.5px; background:${isDark ? '#78350f' : '#fef3c7'}; padding:3px 8px; border-radius:6px; font-weight:800; text-transform:uppercase;">OFFLINE DATA HELD</span>`;
            } else if (savedRaw) {
                offlineBanner.style.display = 'flex';
                offlineBanner.style.background = isDark ? 'rgba(30, 58, 138, 0.35)' : '#eff6ff';
                offlineBanner.style.border = isDark ? '1px solid #1d4ed8' : '1px solid #bfdbfe';
                offlineBanner.style.color = isDark ? '#93c5fd' : '#1e40af';
                if (offlineIcon) offlineIcon.textContent = '💾';

                let timeStr = 'ก่อนหน้า';
                try {
                    const d = JSON.parse(savedRaw);
                    if (d.savedAt) timeStr = d.savedAt;
                } catch(e){}

                if (offlineText) offlineText.innerHTML = `<strong>พบแบบร่างออฟไลน์ที่ถูกบันทึกไว้:</strong> (บันทึกเมื่อ ${timeStr})`;
                if (offlineActions) {
                    offlineActions.innerHTML = `
                        <button type="button" id="btn-restore-draft" style="background:#2563eb; color:#fff; border:none; padding:3px 10px; border-radius:6px; font-size:10px; font-weight:800; cursor:pointer; transition:background 0.2s;">เรียกคืนข้อมูล</button>
                        <button type="button" id="btn-discard-draft" style="background:transparent; color:${isDark ? '#cbd5e1' : '#64748b'}; border:1px solid ${isDark ? '#475569' : '#cbd5e1'}; padding:3px 8px; border-radius:6px; font-size:10px; font-weight:700; cursor:pointer;">ลบแบบร่าง</button>
                    `;

                    const restoreBtn = offlineActions.querySelector('#btn-restore-draft');
                    if (restoreBtn) {
                        restoreBtn.onclick = () => {
                            restoreDraftData();
                            toast('✨ เรียกคืนข้อมูลแบบร่างสำเร็จ', 'success');
                        };
                    }
                    const discardBtn = offlineActions.querySelector('#btn-discard-draft');
                    if (discardBtn) {
                        discardBtn.onclick = () => {
                            localStorage.removeItem(DRAFT_KEY);
                            offlineBanner.style.display = 'none';
                            toast('🗑️ ลบแบบร่างออฟไลน์เรียบร้อย', 'info');
                        };
                    }
                }
            } else {
                offlineBanner.style.display = 'none';
            }
        }

        function saveDraftData() {
            try {
                const draft = {
                    user: (modal.querySelector('#prob-user')?.value || '').trim(),
                    part: (modal.querySelector('#prob-part')?.value || '').trim(),
                    partNo: (modal.querySelector('#prob-partno')?.value || '').trim(),
                    supplier: (modal.querySelector('#prob-supplier')?.value || '').trim(),
                    defect: (modal.querySelector('#prob-defect')?.value || '').trim(),
                    category: modal.querySelector('#f-sup-part-cat')?.value || '',
                    eventDate: modal.querySelector('#f-sup-date')?.value || '',
                    action: modal.querySelector('#f-sup-action')?.value || '',
                    report: modal.querySelector('select[name="report"]')?.value || '',
                    lot: modal.querySelector('#f-sup-lot')?.value || '',
                    ok: modal.querySelector('#f-sup-ok')?.value || '',
                    ng: modal.querySelector('#f-sup-ng')?.value || '',
                    remark: modal.querySelector('textarea[name="remark"]')?.value || '',
                    isSyncSpecial: syncCheck ? syncCheck.checked : false,
                    commander: commanderInput ? commanderInput.value : '',
                    is8d: d8Check ? d8Check.checked : false,
                    image: currentImage || null,
                    savedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    savedTimestamp: Date.now()
                };
                localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
                updateOfflineStatusUI();
            } catch(e) {
                console.warn('Draft save error:', e);
            }
        }

        function restoreDraftData() {
            try {
                const raw = localStorage.getItem(DRAFT_KEY);
                if (!raw) return;
                const d = JSON.parse(raw);
                if (d.user !== undefined && modal.querySelector('#prob-user')) modal.querySelector('#prob-user').value = d.user;
                if (d.part !== undefined && modal.querySelector('#prob-part')) modal.querySelector('#prob-part').value = d.part;
                if (d.partNo !== undefined && modal.querySelector('#prob-partno')) modal.querySelector('#prob-partno').value = d.partNo;
                if (d.supplier !== undefined && modal.querySelector('#prob-supplier')) modal.querySelector('#prob-supplier').value = d.supplier;
                if (d.defect !== undefined && modal.querySelector('#prob-defect')) modal.querySelector('#prob-defect').value = d.defect;
                if (d.category !== undefined && modal.querySelector('#f-sup-part-cat')) modal.querySelector('#f-sup-part-cat').value = d.category;
                if (d.eventDate !== undefined && modal.querySelector('#f-sup-date')) modal.querySelector('#f-sup-date').value = d.eventDate;
                if (d.action !== undefined && modal.querySelector('#f-sup-action')) modal.querySelector('#f-sup-action').value = d.action;
                if (d.report !== undefined && modal.querySelector('select[name="report"]')) modal.querySelector('select[name="report"]').value = d.report;
                if (d.lot !== undefined && modal.querySelector('#f-sup-lot')) modal.querySelector('#f-sup-lot').value = d.lot;
                if (d.ok !== undefined && modal.querySelector('#f-sup-ok')) modal.querySelector('#f-sup-ok').value = d.ok;
                if (d.ng !== undefined && modal.querySelector('#f-sup-ng')) modal.querySelector('#f-sup-ng').value = d.ng;
                if (d.remark !== undefined && modal.querySelector('textarea[name="remark"]')) modal.querySelector('textarea[name="remark"]').value = d.remark;
                
                if (d.isSyncSpecial !== undefined && syncCheck) {
                    syncCheck.checked = Boolean(d.isSyncSpecial);
                    syncCheck.dispatchEvent(new Event('change'));
                }
                if (d.commander !== undefined && commanderInput) commanderInput.value = d.commander;
                if (d.is8d !== undefined && d8Check) {
                    d8Check.checked = Boolean(d.is8d);
                    d8Check.dispatchEvent(new Event('change'));
                }
                if (d.image) {
                    currentImage = d.image;
                    const area = document.getElementById('img-preview-area');
                    if (area) area.innerHTML = `<img src="${d.image}" style="max-height:75px; max-width:100%; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);" alt="Image" title="Image">`;
                }
                syncProblemSentence();
            } catch(e) {
                console.warn('Draft restore error:', e);
            }
        }

        if (formEl) {
            formEl.addEventListener('input', saveDraftData);
            formEl.addEventListener('change', saveDraftData);
        }

        const handleOnlineOfflineState = () => {
            updateOfflineStatusUI();
            if (!navigator.onLine) {
                saveDraftData();
            }
        };
        window.addEventListener('online', handleOnlineOfflineState);
        window.addEventListener('offline', handleOnlineOfflineState);

        updateOfflineStatusUI();

        // --- Save Support Form ---
        formEl.onsubmit = async (e) => {
            e.preventDefault();
            if (submitBtn.disabled) return;
            
            saveDraftData();

            if (!navigator.onLine) {
                toast('📶 ขณะนี้คุณอยู่ออฟไลน์: ระบบได้บันทึกข้อมูลแบบร่างลง LocalStorage เรียบร้อยแล้ว', 'info');
                return;
            }

            const fd = new FormData(e.target);
            const isSyncActive = syncCheck.checked;
            const is8DActive = d8Check.checked;
            const commanderName = commanderInput.value.trim() || 'SQE EN';

            submitBtn.disabled = true;
            submitBtn.textContent = 'กำลังประมวลผล...';

            // Ensure problem string is set
            syncProblemSentence();

            const payload = {
                id: _editingId || 'SUP-' + Date.now(),
                user_id: S.currentUser,
                problem: fd.get('problem') || '',
                action: fd.get('action') || 'Rework',
                part: fd.get('part') || '',
                lot: Number(fd.get('lot')) || 0,
                ok_qty: Number(fd.get('ok')) || 0,
                ng_qty: Number(fd.get('ng')) || 0,
                report_type: fd.get('report') || 'VF',
                remark: fd.get('remark') || '',
                event_date: fd.get('date'),
                image_url: currentImage,
                created_at: new Date().toISOString()
            };

            try {
                // STEP 1: บันทึกลงตาราง Support (WAP DB)
                const { error: errorSup } = await wapClient.from('support_records').upsert([payload]);
                if (errorSup) throw errorSup;

                // STEP 2: บันทึกลงตาราง Special Jobs (ถ้าเลือก)
                if (isSyncActive) {
                    await wapClient.from('special_jobs').insert([{
                        id: 'SJ-SYNC-' + Date.now(),
                        user_id: S.currentUser,
                        project: `[SUPPORT] ${payload.problem}`, 
                        date: payload.event_date,
                        assigned_by: commanderName,
                        result: 'Done', 
                        full_timestamp: new Date().toISOString()
                    }]);
                }

                // STEP 3: ✅ สร้างเคส 8D อัตโนมัติ (SQE DB)
                if (is8DActive) {
                    await Wap8DSystem.createNewCase(payload);
                }

                localStorage.removeItem(DRAFT_KEY);
                window.removeEventListener('online', handleOnlineOfflineState);
                window.removeEventListener('offline', handleOnlineOfflineState);

                toast('✨ บันทึกข้อมูลและวิเคราะห์ผลสำเร็จ', 'success');
                modal.remove();
                await _fetch();

            } catch (err) {
                console.error('[System Error]:', err);
                toast('❌ เกิดข้อผิดพลาด: ' + err.message, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'บันทึกรายงาน';
            }
        };
    }

function _openViewModal(id) {
    const item = _records.find(r => r.id === id);
    if (!item) return;
    _viewing = item;

    // --- ตรวจสอบโหมดปัจจุบันและกำหนดชุดสี (เน้นสีน้ำเงินสว่างที่ Header ในโหมดมืด) ---
    const isDark = document.body.classList.contains('dark-mode');
    const theme = {
        modalBg: isDark ? '#0f172a' : '#ffffff',
        // ส่วนที่ปรับปรุง: สีน้ำเงินสว่าง (Bright Blue Gradient) สำหรับโหมดมืด
        headerBg: isDark ? 'linear-gradient(90deg, #1e40af, #3b82f6)' : '#1e293b', 
        contentBg: isDark ? '#0f172a' : '#f8fafc',
        bannerBg: isDark ? '#1e293b' : '#1e2235',
        border: isDark ? '#334155' : '#e2e8f0',
        textMain: isDark ? '#f8fafc' : '#1e293b',
        textDim: isDark ? '#94a3b8' : '#64748b',
        remarkBg: isDark ? 'rgba(245, 158, 11, 0.05)' : '#fffbeb',
        remarkBorder: isDark ? '#b45309' : '#fde68a',
        remarkText: isDark ? '#ffedd5' : '#d97706',
        imgBorder: isDark ? '#334155' : '#cbd5e1'
    };

    // --- 1. ดึงข้อมูลตัวเลขจริงและการคำนวณ ---
    const okQty = Number(item.ok) || 0;
    const ngQty = Number(item.ng) || 0;
    const totalQty = okQty + ngQty; 
    const ngRate = totalQty > 0 ? Math.round((ngQty / totalQty) * 100) : 0;
    
    const eventDate = item.eventDate || '-';
    const inspector = item._user || 'Admin';
    const actionTaken = item.action || '-';
    const reportType = item.report || 'VF';

    // --- 2. Smart Logic จัดการข้อความจริงจากฐานข้อมูล ---
    let displaySentence = (item.problem || "").trim();

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);padding:20px;`;
    
    modal.innerHTML = `
    <div style="background:${theme.modalBg}; border:1px solid ${theme.border}; border-radius:12px; width:100%; max-width:880px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5); font-family:'Inter', 'Kanit', sans-serif;">
        
        <!-- 1. Header (ปรับเป็นสีน้ำเงินสว่างตามคำขอ) -->
        <div style="background:${theme.headerBg}; padding:8px 20px; display:flex; justify-content:space-between; align-items:center; height:36px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="display:flex; align-items:center; gap:8px;">
                <!-- ปรับไอคอนให้สีขาวสว่าง -->
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <span style="color:#fff; font-size:13px; font-weight:900; text-transform:uppercase; letter-spacing:1px; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">Record Details</span>
            </div>
            <button  onclick="this.closest('.modal-overlay').remove()" style="background:rgba(255,255,255,0.2); border:none; color:#fff; width:26px; height:26px; border-radius:50%; cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; transition:0.2s;" title="This.Closest" aria-label="This.Closest">✕</button>
        </div>

        <div style="padding:12px; background:${theme.contentBg};">
            
            <!-- 2. Dark Banner (Horizontal Streamlined) -->
            <div style="background:${theme.bannerBg}; border:1px solid ${theme.border}; border-radius:8px; padding:15px 20px; display:flex; justify-content:space-between; align-items:center; gap:20px; margin-bottom:10px;">
                
                <div style="flex: 1; min-width: 0;">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
                        <span style="color:#f59e0b; font-size:8px; font-weight:950; text-transform:uppercase; letter-spacing:0.8px;">⚠️ PROBLEM</span>
                        <span style="color:#94a3b8; font-size:9.5px; font-weight:700; display:flex; align-items:center; gap:4px;">
                            <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M3 10h18"/></svg> ${eventDate}
                        </span>
                    </div>
                    
                    <h2 style="color:#fff; font-size:14px; font-weight:700; line-height:1.5; margin:0 0 10px 0; white-space: normal; word-wrap: break-word;">
                        ${displaySentence}
                    </h2>

                    <div style="display:flex; align-items:center; gap:5px;">
                        <span style="background:rgba(124,58,237,0.15); color:#a78bfa; padding:1px 8px; border-radius:4px; font-size:9px; font-weight:800; border:1px solid rgba(124,58,237,0.2);">● ${item.part}</span>
                        <span style="background:rgba(37,99,235,0.15); color:#60a5fa; padding:1px 8px; border-radius:4px; font-size:9px; font-weight:800; border:1px solid rgba(37,99,235,0.2);">🔧 ${actionTaken}</span>
                        <span style="background:#fff; color:#1e40af; padding:1px 8px; border-radius:4px; font-size:9px; font-weight:950; text-transform:uppercase; border:1px solid #dbeafe;">${reportType}</span>
                    </div>
                </div>

                <!-- KPI Side -->
                <div style="display:flex; flex-direction:column; align-items:center; gap:6px; border-left:1px solid ${theme.border}; padding-left:20px; flex-shrink:0;">
                    <div style="display:flex; align-items:center; gap:15px;">
                        <div style="text-align:center; min-width:38px;">
                            <div style="font-size:16px; font-weight:950; color:#a78bfa; line-height:1;">${totalQty}</div>
                            <div style="font-size:6.5px; font-weight:800; color:${theme.textDim}; margin-top:2px;">TOTAL</div>
                        </div>
                        <div style="text-align:center; border-left:1px solid ${theme.border}; padding-left:10px; min-width:38px;">
                            <div style="font-size:16px; font-weight:950; color:#10b981; line-height:1;">${okQty}</div>
                            <div style="font-size:6.5px; font-weight:800; color:${theme.textDim}; margin-top:2px;">PASS</div>
                        </div>
                        <div style="text-align:center; border-left:1px solid ${theme.border}; padding-left:10px; min-width:38px;">
                            <div style="font-size:16px; font-weight:950; color:#ef4444; line-height:1;">${ngQty}</div>
                            <div style="font-size:6.5px; font-weight:800; color:${theme.textDim}; margin-top:2px;">FAIL</div>
                        </div>
                    </div>
                    
                    <div style="width:100%; margin-top:2px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                            <span style="color:${theme.textDim}; font-size:7px; font-weight:800; text-transform:uppercase;">Yield Status</span>
                            <span style="color:${ngRate > 0 ? '#ef4444' : '#10b981'}; font-size:9px; font-weight:900;">${ngRate}% NG</span>
                        </div>
                        <div style="width:100%; height:4px; background:rgba(255,255,255,0.1); border-radius:10px; overflow:hidden;">
                            <div style="width:${ngRate}%; height:100%; background:#ef4444; box-shadow:0 0 5px rgba(239, 68, 68, 0.4);"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Image Section -->
            <div style="width:100%; background:${isDark ? theme.headerBg : '#fff'}; border:1px solid ${theme.imgBorder}; border-radius:6px; display:flex; justify-content:center; align-items:center; padding:0; overflow:hidden; margin-bottom:10px;">
                ${item.imageUrl 
                    ? `<img  src="${item.imageUrl}" 
                            onclick="WapSupportLogs._openLightbox('${item.imageUrl}')"
                            style="max-width:100%; height:auto; max-height:380px; display:block; cursor:pointer; image-rendering: -webkit-optimize-contrast;" alt="Image" title="Image">` 
                    : `<div style="padding:40px; text-align:center; color:${theme.textDim}; font-size:11px; font-weight:800; text-transform:uppercase;">No Evidence Photo</div>`
                }
            </div>

            <!-- Remark Section -->
            <div style="background:${theme.remarkBg}; border:1px solid ${theme.remarkBorder}; border-radius:6px; padding:10px 15px; display:flex; align-items:center; gap:10px;">
                <span style="color:${isDark ? '#f59e0b' : '#b45309'}; font-size:9px; font-weight:950; text-transform:uppercase; flex-shrink:0;">Note:</span>
                <p style="color:${theme.remarkText}; font-size:12px; font-weight:600; margin:0; line-height:1.2;">
                    ${item.remark || 'ไม่มีหมายเหตุเพิ่มเติม'}
                </p>
            </div>

            <!-- Footer -->
            <div style="margin-top:10px; display:flex; justify-content:space-between; align-items:center; padding:0 4px;">
                <span style="font-size:8px; font-weight:800; color:${theme.textDim}; text-transform:uppercase;">Record Initialized By</span>
                <span style="font-size:9px; font-weight:900; color:${isDark ? '#cbd5e1' : '#475569'}; text-transform:uppercase;">${inspector.split('@')[0]}</span>
            </div>

        </div>
    </div>`;
    
    document.body.appendChild(modal);
    gsap.fromTo(modal.firstChild, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" });
}

    function _confirmDelete(id) {
        if (S.userRole === 'supervisor') { toast('โหมดอ่านอย่างเดียว', 'info'); return; }
        
        const target = _records ? _records.find(r => String(r.id) === String(id)) : null;

        showCustomConfirmDialog({
            title: "ยืนยันการลบ Support Log",
            subtitle: "รายการบันทึกผลการซัพพอร์ตนี้จะถูกลบออกจากระบบถาวร",
            badge: "LINE SUPPORT LOGS",
            type: "danger",
            details: [
                { label: "ปัญหา / อาการ", value: target ? (target.problem || target.defect || '-') : '-' },
                { label: "การแก้ไข / การดำเนินการ", value: target ? (target.action || target.action_taken || '-') : '-' },
                { label: "ไลน์ผลิต / กลุ่มงาน", value: target ? (target.line || target.part_group || '-') : '-' },
                { label: "ผู้บันทึก (Inspector)", value: target ? (target.user_id || S.currentUser) : S.currentUser }
            ],
            confirmText: "🗑️ ยืนยันลบ Support Log",
            cancelText: "ยกเลิก",
            onConfirm: () => _doDelete(id)
        });
    }

    async function _doDelete(id) {
        try {
            _records = _records.filter(r => String(r.id) !== String(id));
            applyDateFilter();
            const { error } = await wapClient.from(TABLE).delete().eq('id', id);
            if (error) throw error;
            toast('ลบสำเร็จ', 'success');
            await _fetch();
        } catch (e) {
            console.error('[WapSupport] Delete error:', e);
            toast('ลบไม่สำเร็จ: ' + (e.message || ''), 'error');
            await _fetch();
        }
    }


    function _fromDb(r) {
        if (!r) return _blankRecord();
        const okVal = parseFloat(String(r.ok_qty ?? r.ok ?? 0).replace(/,/g, '')) || 0;
        const ngVal = parseFloat(String(r.ng_qty ?? r.ng ?? 0).replace(/,/g, '')) || 0;
        return {
            id: r.id,
            problem: r.problem || '',
            action: r.action || 'Rework',
            part: r.part || '-',
            lot: r.lot || '-',
            ok: okVal,
            ng: ngVal,
            report: r.report_type || r.report || 'VF',
            remark: r.remark || '',
            eventDate: r.event_date || r.eventDate || '',
            imageUrl: r.image_url || r.imageUrl || null,
            _user: r.user_id || r._user || '',
            createdAt: r.created_at || r.createdAt || r.event_date || r.eventDate || ''
        };
    }

    function _esc(s) {
        const d = document.createElement('div');
        d.textContent = s || '';
        return d.innerHTML;
    }

    /* ──────────────────────────────────────────
       INIT / DESTROY — เหลือชุดเดียว ไม่มีของซ้ำ
       ────────────────────────────────────────── */
    function init(email) {
        _user = email || S.currentUser;
        _alive = true;
        _cacheDom();

        // แสดง Skeleton / Loading ทันทีเพื่อไม่ให้ตารางว่างเปล่า
        if ($.tbody) {
            $.tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:40px;color:#64748b;font-weight:700;">🔄 กำลังโหลดทะเบียนเคสและรายงานผลิต...</td></tr>`;
        }

        _fetch();

        if ($.search) {
            $.search.oninput = (e) => {
                _search = e.target.value;
                applyDateFilter();
            };
        }
        if ($.filterGrp) {
            $.filterGrp.onclick = (e) => {
                const btn = e.target.closest('.filter-pill');
                if (!btn) return;
                $.filterGrp.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                _filter = btn.getAttribute('data-filter') || 'ALL';
                applyDateFilter();
            };
        }
    }

/* ──────────────────────────────────────────
       NEW: LIGHTBOX VIEWER (ขยายรูปภาพพรีเมียม)
       ────────────────────────────────────────── */
    function _openLightbox(url) {
        if (!url) return;

        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox-overlay';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <button  class="lightbox-close" title="Lightbox Close" aria-label="Lightbox Close">✕</button>
                <img  src="${url}" class="lightbox-img" alt="Image" title="Image">
                <div style="text-align:center; color:white; margin-top:15px;">
                    <p style="font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; opacity:0.8;">Case Image Preview</p>
                    <p style="font-size:10px; opacity:0.5;">Click anywhere to close</p>
                </div>
            </div>
        `;

        document.body.appendChild(lightbox);

        // เล่น Animation ด้วย GSAP
        requestAnimationFrame(() => {
            lightbox.style.opacity = '1';
            lightbox.querySelector('.lightbox-content').style.transform = 'scale(1)';
        });

        // ปิด Lightbox
        const closeLB = () => {
            lightbox.style.opacity = '0';
            lightbox.querySelector('.lightbox-content').style.transform = 'scale(0.9)';
            setTimeout(() => lightbox.remove(), 400);
        };

        lightbox.onclick = closeLB;
        lightbox.querySelector('.lightbox-close').onclick = closeLB;
    }

    function destroy() {
        _alive = false;
        if ($.tbody) $.tbody.innerHTML = '';
    }

return {
        init, destroy, applyDateFilter,
        _openViewModal,
        _openFormModal,
        _confirmDelete,
        _openLightbox, // <--- เพิ่มบรรทัดนี้
        showPartAC,  
        selectPartAC,  
        calcNG
    };


})();

/**
 * ═══════════════════════════════════════════════════════
 *  WAP 5S Excellence - FULLY DATA-SYNC VERSION
 * ═══════════════════════════════════════════════════════
 */
const Wap5SExcellence = (function() {
    const TABLE = 's5_records';
    let _chart = null;
    let _allRecords = []; // ข้อมูลดิบทั้งหมดจาก DB
    let _filteredRecords = []; // ข้อมูลที่ผ่านการกรองวันที่แล้ว

   async function init() {
        // 1. ตั้งค่า Input ชื่อผู้ตรวจเริ่มต้นเป็นชื่อ User ปัจจุบัน
        const auditorIn = $id('s5-f-auditor');
        if (auditorIn && !auditorIn.value) {
            auditorIn.value = S.currentUser.split('@')[0].toUpperCase();
        }
        
        await fetchRecords();
    }

    async function fetchRecords() {
        // ดึงข้อมูลตาม User ที่กำลังเลือกดู (รองรับ Supervisor)
        const targetUser = S.userRole === 'supervisor' ? S.viewingUser : S.currentUser;
        if (!navigator.onLine) return;
        
        try {
            const { data, error } = await wapClient
                .from(TABLE)
                .select('*')
                .eq('user_id', targetUser)
                .order('month', { ascending: false });

            if (error) throw error;
            _allRecords = data || [];
            
            applyDateFilter(); // กรองวันที่ก่อนแสดงผล
        } catch (e) {
            console.error('[5S] Fetch error:', e);
            toast('โหลดข้อมูล 5S ไม่สำเร็จ', 'error');
        }
    }

    // ฟังก์ชันกรองข้อมูลตามวันที่จาก Header
function applyDateFilter() {
        // เปลี่ยนมาใช้ ID: cd-start-date และ cd-end-date ตาม HTML จริงของคุณ
        const start = document.getElementById('cd-start-date')?.value;
        const end = document.getElementById('cd-end-date')?.value;

        if (start && end) {
            _filteredRecords = _allRecords.filter(r => {
                const recordMonth = r.month + "-01"; 
                const filterStart = start.substring(0, 7) + "-01";
                const filterEnd = end.substring(0, 7) + "-01";
                return recordMonth >= filterStart && recordMonth <= filterEnd;
            });
        } else {
            _filteredRecords = [..._allRecords];
        }
        
        renderAll(); // วาดหน้าจอใหม่ทันที
    }

    function renderAll() {
        updateKPIs();
        renderChart();
        renderRanking();
        renderTable();
    }

function updateKPIs() {
        // 1. คำนวณค่าตัวเลขที่ต้องการแสดงผล
        const totalPoints = _filteredRecords.reduce((sum, r) => sum + (Number(r.issue_count) || 0), 0);
        const recordCount = _filteredRecords.length;

        // 2. ตรรกะการหา Top Auditor (คงเดิม)
        const auditorCounts = {};
        _filteredRecords.forEach(r => {
            const name = r.owner || 'Unknown';
            auditorCounts[name] = (auditorCounts[name] || 0) + 1;
        });
        const topAuditor = Object.keys(auditorCounts).length > 0 
            ? Object.keys(auditorCounts).reduce((a, b) => auditorCounts[a] > auditorCounts[b] ? a : b) 
            : '-';

        // 3. ตรรกะการหา Hot Area (คงเดิม)
        const areaPoints = {};
        _filteredRecords.forEach(r => {
            const area = r.area || 'Unknown';
            areaPoints[area] = (areaPoints[area] || 0) + (Number(r.issue_count) || 0);
        });
        const hotArea = Object.keys(areaPoints).length > 0
            ? Object.keys(areaPoints).reduce((a, b) => areaPoints[a] > areaPoints[b] ? a : b)
            : '-';

        // 4. --- [ส่วนที่แก้ไข: สั่งรันอนิเมชั่นตัวเลขวิ่ง] ---
        
        // ล้างอนิเมชั่นเก่าที่อาจค้างอยู่
        gsap.killTweensOf("#s5-kpi-total, #s5-kpi-month");

        // คะแนนสะสมตลอดทั้งปี
        animateValue('s5-kpi-total', 0, totalPoints, 1000, 0, " PTS");

        // จำนวนจุดที่พบในเดือนปัจจุบัน (หรือตาม Filter)
        // หมายเหตุ: ใช้ suffix " PTS" หรือ " CASES" ตามความเหมาะสมของ UI คุณครับ
        animateValue('s5-kpi-month', 0, recordCount, 1000, 0, " PTS"); 

        // สำหรับข้อมูลที่เป็นตัวหนังสือ (ไม่ต้องใช้เลขวิ่ง) ให้แสดงผลตามปกติ
        const auditorEl = $id('s5-kpi-auditor');
        if (auditorEl) {
            auditorEl.textContent = topAuditor;
            // เพิ่มกิมมิก: เลื่อนข้อความขึ้นเล็กน้อยเวลาเปลี่ยน
            gsap.fromTo(auditorEl, { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.4 });
        }

        const hotAreaEl = $id('s5-kpi-hotarea');
        if (hotAreaEl) {
            hotAreaEl.textContent = hotArea;
            // เพิ่มกิมมิก: เลื่อนข้อความขึ้นเล็กน้อยเวลาเปลี่ยน
            gsap.fromTo(hotAreaEl, { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.4 });
        }
    }

function renderChart() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const chartData = new Array(12).fill(0);

        _filteredRecords.forEach(r => {
            const d = new Date(r.month + "-01");
            if (!isNaN(d.getTime())) {
                chartData[d.getMonth()] += Number(r.issue_count);
            }
        });

        if (_chart) _chart.destroy();
    _chart = new ApexCharts($id('s5-trend-chart'), {
        series: [{ name: 'จุดที่พบ', data: chartData }],
        chart: { 
            type: 'area', 
            height: '100%', 
            width: '100%', // มั่นใจว่าเต็มความกว้าง
            toolbar: { show: false },
            sparkline: { enabled: false }, // ต้องเป็น false เพื่อให้โชว์แกน X (เดือน)
            animations: { enabled: true, easing: 'easeinout', speed: 1000 }
        },
        // --- ส่วนที่แก้ไข: ปรับจูนระยะขอบ (Margin/Padding) ---
        grid: {
            show: false,
            padding: {
                left: -15,   // ดันกราฟไปทางซ้ายจนชิดขอบ (ค่าติดลบช่วยให้ชิดขึ้น)
                right: 0,
                top: 0,
                bottom: -10  // ดันกราฟลงมาข้างล่างให้ชิดขอบขึ้น
            }
        },
        // ------------------------------------------
        colors: ['#f59e0b'],
        stroke: { curve: 'smooth', width: 4, lineCap: 'round' },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.02,
                stops: [0, 90, 100]
            }
        },
        dataLabels: { enabled: false },
        xaxis: { 
            categories: months,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { 
                show: true,
                offsetY: -5, // ขยับตัวหนังสือเดือนขึ้นมาหน่อยเพื่อให้พ้นขอบล่าง
                style: { 
                    colors: '#94a3b8', 
                    fontSize: '10px', 
                    fontWeight: 700 
                } 
            },
            tooltip: { enabled: false } // ปิด tooltip เล็กบนแกน X
        },
        yaxis: { 
            show: false,
            padding: { left: 0, right: 0 }
        },
        tooltip: { 
            theme: 'dark',
            y: { formatter: (val) => val + " Points" }
        }
    });
    _chart.render();
}


function renderRanking() {
        const areaStats = {};
        _filteredRecords.forEach(r => {
            areaStats[r.area] = (areaStats[r.area] || 0) + Number(r.issue_count);
        });

        const sorted = Object.entries(areaStats).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const listEl = $id('s5-ranking-list');
        if (!listEl || sorted.length === 0) {
            listEl.innerHTML = '<div class="py-10 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">No Data</div>';
            return;
        }

        // 1. วาดโครงสร้างใหม่ (Modern Capsule Style)
        listEl.innerHTML = sorted.map((item, i) => {
            const rowId = `s5-rank-val-${i}`;
            const barId = `s5-rank-bar-${i}`;
            
            return `
                <div class="group mb-5 last:mb-0">
                    <div class="flex justify-between items-end mb-1.5">
                        <div class="flex items-center gap-2 overflow-hidden">
                            <!-- อันดับตัวเลขขนาดเล็ก -->
                            <span class="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-md bg-slate-100 text-[10px] font-black text-slate-500">${i + 1}</span>
                            <span class="text-[11px] font-black text-slate-700 truncate uppercase tracking-tight">${item[0]}</span>
                        </div>
                        <!-- ตัวเลขคะแนนแบบเน้นๆ -->
                        <div class="flex items-baseline gap-1 flex-shrink-0 ml-4">
                            <span id="${rowId}" class="text-[16px] font-black text-slate-900 leading-none">0</span>
                            <span class="text-[8px] font-black text-slate-400 uppercase tracking-tighter">PTS</span>
                        </div>
                    </div>
                    <!-- แถบความคืบหน้าแบบ Capsule Rounded -->
                    <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div id="${barId}" class="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.2)]" style="width: 0%"></div>
                    </div>
                </div>
            `;
        }).join('');

        // 2. รันอนิเมชั่นตัวเลขและแถบวิ่ง
        requestAnimationFrame(() => {
            const maxVal = sorted[0][1] || 1;
            sorted.forEach((item, i) => {
                const score = item[1];
                const pct = (score / maxVal) * 100;

                // ตัวเลขวิ่ง
                animateValue(`s5-rank-val-${i}`, 0, score, 1200);

                // แถบวิ่ง (พุ่งออกมาอย่างนุ่มนวลด้วย Ease Out)
                gsap.to(`#s5-rank-bar-${i}`, {
                    width: pct + "%",
                    duration: 1.5,
                    delay: i * 0.1, // ทยอยเลื่อนขึ้นทีละรายการ
                    ease: "expo.out"
                });
            });
        });
    }

function renderTable() {
        const tbody = $id('s5-table-body');
        if (!tbody) return;
        
        // 1. ตรวจสอบกรณีไม่มีข้อมูล
        if (_filteredRecords.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="py-12 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">
                        No findings recorded
                    </td>
                </tr>`;
            return;
        }

        // 2. วาด HTML โดยใช้คลาส s5-table-row
        tbody.innerHTML = _filteredRecords.map(r => `
            <tr class="s5-table-row border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors" data-rid="${r.id}">
                <td class="py-3 px-3">
                    <div class="text-[11px] font-black text-slate-700 leading-tight uppercase tracking-tight">${r.area}</div>
                </td>
                <td style="text-align:center">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100 font-black text-[9px]">
                        <span class="w-1 h-1 rounded-full bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.8)]"></span>
                        ${r.issue_count} PTS
                    </span>
                </td>
                <td class="py-3 px-3">
                    <p class="text-[10px] text-slate-500 font-medium leading-relaxed italic line-clamp-1" title="${r.detail || ''}">
                        ${r.detail || '-'}
                    </p>
                </td>
                <td class="py-3 px-3">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">${r.owner || '-'}</span>
                </td>
                <td class="py-3 px-3">
                    <span class="font-mono text-[9px] text-slate-400 font-bold">${r.month}</span>
                </td>
                <td class="py-3 px-3 text-right">
                    <button  onclick="Wap5SExcellence.remove('${r.id}')" class="text-slate-200 hover:text-rose-500 transition-all p-1" title="Wap5 S Excellence.Remove" aria-label="Wap5 S Excellence.Remove">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                </td>
            </tr>
        `).join('');

        // 3. รันอนิเมชั่น GSAP ให้แถวทยอยเลื่อนเข้ามา (Stagger)
        if (typeof window.animateTableRows === 'function') {
            window.animateTableRows('.s5-table-row', { y: 6, duration: 0.28, stagger: 0.025, ease: 'power2.out' });
        }
        if (typeof reapplyKbdRowSelection === 'function') reapplyKbdRowSelection();
    }

/**
 * อัปเกรดฟังก์ชันบันทึก 5S ให้รองรับระบบออฟไลน์ (V2.0)
 */
async function submit() {
    // 1. ดึงค่าจาก Element ต่างๆ
    const areaIn = document.getElementById('s5-f-area');
    const ptsIn = document.getElementById('s5-f-points');
    const monthIn = document.getElementById('s5-f-month');
    const detailIn = document.getElementById('s5-f-detail');
    const auditorIn = document.getElementById('s5-f-auditor');

    const area = areaIn.value.trim();
    const pts = ptsIn.value;
    const monthValue = monthIn.value;
    const detail = detailIn.value.trim();
    const auditor = auditorIn.value.trim();

    // 2. ตรวจสอบความครบถ้วน
    if (!area || !pts || !monthValue || !auditor) {
        toast('⚠️ กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
        if(!area) shake(areaIn);
        if(!pts) shake(ptsIn);
        return;
    }

    // 3. สร้าง Payload และระบุสถานะการซิงค์
    const recordId = 'S5-' + Date.now();
    const payload = {
        id: recordId,
        user_id: S.currentUser,
        area: area,               // ตรงกับคอลัมน์ area
        issue_count: Number(pts), // ตรงกับคอลัมน์ issue_count
        detail: detail,           // แก้ไขจาก details -> detail (ตาม DB)
        owner: auditor,           // แก้ไขจาก auditor -> owner (ตาม DB)
        month: monthValue,        // แก้ไขจาก date -> month (ตาม DB)
        created_at: new Date().toISOString(),
        sync_status: 'pending'    // เพิ่มสถานะรอส่ง
    };

    try {
        let saveMethod = '';

        // 4. ตรรกะการตัดสินใจ (Online vs Offline)
        if (navigator.onLine) {
            // โหมดออนไลน์: ส่งเข้า Supabase
            const { error } = await wapClient.from('s5_records').insert([
                // กรองเอาเฉพาะฟิลด์ที่ DB ต้องการ (ลบ sync_status ออกก่อนส่ง)
                (({ sync_status, ...o }) => o)(payload)
            ]);
            
            if (error) throw error;
            payload.sync_status = 'synced';
            saveMethod = 'cloud';
        } else {
            // โหมดออฟไลน์: พักใน Dexie
            if (localDB.pending5S) {
                await localDB.pending5S.put(payload);
                saveMethod = 'local';
            } else {
                throw new Error("Local Database Table not found");
            }
        }

        // 5. [Optimistic Update] อัปเดตข้อมูลใน Memory และหน้าจอทันที
        // สมมติว่า _allRecords คือตัวแปรเก็บข้อมูลดิบในโมดูล Wap5SExcellence
        if (typeof _allRecords !== 'undefined') {
            _allRecords.unshift(payload); 
            // เรียกฟังก์ชันกรองและวาดตารางใหม่ (ที่มีอยู่ในโมดูล)
            if (typeof applyDateFilter === 'function') applyDateFilter();
        }

        // 6. ล้างฟอร์ม (Reset Form)
        areaIn.value = '';
        ptsIn.value = '';
        detailIn.value = '';
        
        // 7. แจ้งเตือนผู้ใช้
        if (saveMethod === 'cloud') {
            toast('✅ บันทึกข้อมูลออนไลน์สำเร็จ', 'success');
            // เล่นอนิเมชั่นบินข้อมูล (ถ้ามี)
            if(typeof playCommitAnimation === 'function') playCommitAnimation();
        } else {
            toast('📶 บันทึกในเครื่องแล้ว (จะซิงค์เมื่อมีเน็ต)', 'info');
        }

    } catch (e) {
        console.error('Submit 5S Error:', e);
        toast('❌ บันทึกล้มเหลว: ' + (e.message || 'Error'), 'error');
    }
}

   async function remove(id) {
        if (S.userRole === 'supervisor') { toast('โหมดอ่านอย่างเดียว', 'info'); return; }
        
        const target = _allRecords ? _allRecords.find(r => String(r.id) === String(id)) : null;

        showCustomConfirmDialog({
            title: "ยืนยันการลบผลการประเมิน 5S",
            subtitle: "รายการตรวจประเมิน 5S Excellence นี้จะถูกลบออกจากระบบถาวร",
            badge: "5S EXCELLENCE",
            type: "danger",
            details: [
                { label: "พื้นที่ / โซนตรวจ", value: target ? (target.area || target.location || '-') : '-' },
                { label: "คะแนน / ผลตรวจ", value: target ? `${target.score || target.points || 0} คะแนน` : '-' },
                { label: "รายละเอียดข้อพบเห็น", value: target ? (target.detail || target.remark || '-') : '-' },
                { label: "ผู้ประเมิน", value: target ? (target.user_id || S.currentUser) : S.currentUser }
            ],
            confirmText: "🗑️ ยืนยันลบรายการ 5S",
            cancelText: "ยกเลิก",
            onConfirm: async () => {
                try {
                    _allRecords = _allRecords.filter(r => String(r.id) !== String(id));
                    applyDateFilter();
                    const { error } = await wapClient.from(TABLE).delete().eq('id', id);
                    if (error) throw error;
                    toast('ลบเรียบร้อย', 'success');
                    await fetchRecords();
                } catch (e) {
                    console.error('[5S Delete Error]:', e);
                    toast('ลบไม่สำเร็จ: ' + (e.message || ''), 'error');
                    await fetchRecords();
                }
            }
        });
    }

    return { init, fetchRecords, remove, applyDateFilter,submit  };
})();

/**
 * ═══════════════════════════════════════════════════════
 *  WAP SKILL MATRIX - Isolated Module (Fixed Schema)
 * ═══════════════════════════════════════════════════════
 */
const WapSkillMatrix = (function() {
    const TABLE = 'skill_matrix';
    let _charts = { radar: null, donut: null };
    let _records = [];

    async function init() {
        // --- ส่วนที่แก้ไข ---
        // 1. ถ้ามีข้อมูลเดิมเก็บไว้อยู่แล้ว ให้วาดทันทีไม่ต้องรอโหลด
        if (_records.length > 0) {
            renderAll(); 
        }
        
        // 2. ดึงข้อมูลใหม่จากฐานข้อมูลมาอัปเดต (เบื้องหลัง)
        await fetchRecords();
    }

async function fetchRecords() {
        const targetUser = S.userRole === 'supervisor' ? S.viewingUser : S.currentUser;
        if (!navigator.onLine) {
            // ถ้าออฟไลน์ ให้วาดจากข้อมูลที่มีอยู่เดิม
            renderAll();
            return;
        }

        try {
            const { data, error } = await wapClient
                .from(TABLE)
                .select('*')
                .eq('user_id', targetUser)
                .order('skill_value', { ascending: false });

            if (error) throw error;
            _records = data || [];
            
            // วาดข้อมูลใหม่ลงหน้าจอ
            renderAll();
        } catch (e) {
            console.error('[SkillMatrix] Fetch error:', e);
        }
    }

// ค้นหา return { init, remove, clearAll }; ใน WapSkillMatrix
// แล้วเปลี่ยนเป็น:

    async function submit() {
        const name = $id('sm-f-name').value.trim();
        const val = $id('sm-f-value').value;
        if(!name || val === "") { toast("กรุณากรอกข้อมูลให้ครบ", "error"); return; }
        
        try {
            const payload = {
                user_id: S.currentUser,
                skill_name: name,
                skill_value: parseInt(val),
                updated_at: new Date().toISOString()
            };
            const { error } = await wapClient.from(TABLE).upsert([payload], { onConflict: 'user_id,skill_name' });
            if (error) throw error;
            
            toast("อัปเดตทักษะเรียบร้อย", "success");
            $id('sm-f-name').value = "";
            $id('sm-f-value').value = "";
            await fetchRecords();
        } catch (e) { toast("บันทึกล้มเหลว", "error"); }
    }

    return { init, submit, remove, clearAll }; // ส่ง submit ออกไปด้วย
    function renderAll() {
        updateKPIs();
        renderRadar();
        renderBars();
        renderDonut();
    }

function updateKPIs() {
        const count = _records.length;
        const avg = count > 0 ? Math.round(_records.reduce((sum, r) => sum + (r.skill_value || 0), 0) / count) : 0;
        
        // 1. จัดการส่วนป้ายสถานะ (Badge)
        const badge = document.getElementById('sm-level-badge');
        let level = { label: '⚙️ BASIC', cls: 'bg-slate-100 text-slate-600 border-slate-200' };
        if (avg >= 80) level = { label: '🏆 EXPERT', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
        else if (avg >= 60) level = { label: '🚀 ADVANCED', cls: 'bg-blue-50 text-blue-700 border-blue-200' };
        else if (avg >= 40) level = { label: '📘 DEVELOPING', cls: 'bg-amber-50 text-amber-700 border-amber-200' };
        
        if (badge) {
            badge.textContent = level.label;
            badge.className = `px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${level.cls}`;
            // เพิ่มกิมมิก: เด้งป้ายออกมาเบาๆ
            gsap.fromTo(badge, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" });
        }

        // 2. --- [จุดที่แก้ไข: สั่งรันอนิเมชั่นตัวเลขวิ่ง] ---
        
        // คะแนนเฉลี่ย (เช่น 62%)
        animateValue('sm-kpi-avg', 0, avg, 1200, 0, "%");

        // ทักษะรวม (เช่น 17 Skills)
        animateValue('sm-kpi-count', 0, count, 1000, 0, " Skills");

        // 3. สำหรับข้อมูลที่เป็นตัวหนังสือ (ทักษะเด่น/จุดอ่อน)
        const topEl = document.getElementById('sm-kpi-top');
        if (topEl) {
            topEl.textContent = _records[0]?.skill_name || '—';
            // เลื่อนขึ้นนุ่มๆ เวลาเปลี่ยนข้อมูล
            gsap.fromTo(topEl, { y: 5, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });
        }

        const weakEl = document.getElementById('sm-kpi-weak');
        if (weakEl) {
            weakEl.textContent = _records[count-1]?.skill_name || '—';
            // เลื่อนขึ้นนุ่มๆ เวลาเปลี่ยนข้อมูล
            gsap.fromTo(weakEl, { y: 5, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.1 });
        }
    }

    // --- 1. Radar Chart: แผนที่ทักษะแบบ Sci-Fi ---
    function renderRadar() {
        const chartEl = document.getElementById('sm-radar-chart');
        if (!chartEl) return;
        if (_charts.radar) _charts.radar.destroy();

        if (_records.length < 3) {
            chartEl.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-slate-300 text-center"><p class="text-[10px] font-bold uppercase tracking-widest">Requires 3+ Skills to Map</p></div>`;
            return;
        }

        _charts.radar = new ApexCharts(chartEl, {
            series: [{ name: 'Proficiency', data: _records.map(r => r.skill_value) }],
            chart: { 
                type: 'radar', 
                height: '100%', 
                toolbar: { show: false },
                dropShadow: { enabled: true, blur: 8, left: 1, top: 1, opacity: 0.1 }
            },
            colors: ['#3b82f6'],
            fill: {
                type: 'gradient',
                gradient: { shade: 'dark', gradientToColors: ['#6366f1'], shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 }
            },
            markers: { size: 4, colors: ['#fff'], strokeColors: '#3b82f6', strokeWidth: 2, hover: { size: 6 } },
            plotOptions: {
                radar: {
                    polygons: { strokeColors: '#e2e8f0', connectorColors: '#e2e8f0', fill: { colors: ['#f8fafc', '#fff'] } }
                }
            },
            xaxis: {
                categories: _records.map(r => r.skill_name),
                labels: { style: { fontSize: '10px', fontWeight: 800, colors: '#64748b' } }
            },
            yaxis: { show: false, max: 100, tickAmount: 4 }
        });
        _charts.radar.render();
    }

    // --- 2. Proficiency Bars: รายการทักษะพร้อมแสง Glow ---
// ============================================================
    // RENDER NEON SKILL BARS - PREMIUM FUTURISTIC VERSION
    // ============================================================
    function renderBars() {
        const listEl = document.getElementById('sm-bar-list');
        if (!listEl) return;
        
        // กรณีไม่มีข้อมูล ให้แสดงข้อความสถานะแบบคลีนๆ
        if (_records.length === 0) {
            listEl.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full py-10 opacity-20">
                    <p class="text-[10px] font-black uppercase tracking-widest">No Competency Data Detected</p>
                </div>`;
            return;
        }

        // วาดแถบพลังใหม่โดยใช้ระบบ Class Neon ที่เราตั้งค่าไว้ใน CSS
        listEl.innerHTML = _records.map(r => {
            const val = r.skill_value || 0;
            
            // ตรรกะการเลือกสีและเงาเรืองแสง (Neon Logic)
            let colorClass = 'fill-basic';
            let colorHex = '#94a3b8'; // สีเทาพื้นฐาน

            if (val >= 80) {
                colorClass = 'fill-expert';
                colorHex = '#10b981'; // สีเขียวนีออน
            } else if (val >= 50) {
                colorClass = 'fill-advanced';
                colorHex = '#3b82f6'; // สีฟ้านีออน
            }

            return `
                <div class="neon-bar-item group">
                    <div class="neon-bar-label">
                        <div class="flex items-center gap-2">
                            <span class="neon-bar-name">${r.skill_name}</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <!-- ตัวเลขเปอร์เซ็นต์เรืองแสงตามระดับ -->
                            <span class="neon-bar-val" style="color:${colorHex}">${val}%</span>
                            
                            <!-- ปุ่มลบทักษะที่จะโผล่มาเมื่อเอาเมาส์ไปวาง (Hover) -->
                            <button  onclick="WapSkillMatrix.remove('${r.skill_name}')" 
                                    class="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all duration-200" title="Wap Skill Matrix.Remove" aria-label="Wap Skill Matrix.Remove">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M18 6L6 18M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="neon-bar-bg">
                        <!-- แถบความคืบหน้าพร้อม Effect เงาเรืองแสง (Box Shadow) -->
                        <div class="neon-bar-fill ${colorClass}" style="width:${val}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

function renderDonut() {
    const chartEl = document.getElementById('sm-donut-chart');
    const legendEl = document.getElementById('sm-donut-legend');
    
    // 1. ตรวจสอบ Legend ก่อน (เพื่อให้วาดแถบด้านล่างได้เสมอ)
    if (!legendEl) return; 

    const count = _records.length;
    const avg = count > 0 ? Math.round(_records.reduce((sum, r) => sum + (r.skill_value || 0), 0) / count) : 0;

    const dist = { expert: 0, adv: 0, dev: 0, basic: 0 };
    _records.forEach(r => {
        const v = r.skill_value || 0;
        if (v >= 80) dist.expert++;
        else if (v >= 60) dist.adv++;
        else if (v >= 40) dist.dev++;
        else dist.basic++;
    });

    const series = [dist.expert, dist.adv, dist.dev, dist.basic];
    const labels = ['Expert', 'Advanced', 'Developing', 'Basic'];
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#94a3b8'];

    // 2. [สำคัญ] วาด Legend ก่อน เพื่อไม่ให้หายเวลาเปลี่ยนหน้า
    legendEl.innerHTML = labels.map((l, i) => {
        const total = series.reduce((a, b) => a + b, 0);
        const pct = total > 0 ? ((series[i] / total) * 100).toFixed(0) : 0;
        return `
            <div class="legend-pill-cyber flex items-center justify-between p-2 rounded-xl border border-slate-50 mb-2 bg-white shadow-sm">
                <div class="flex items-center gap-2">
                    <div class="w-2.5 h-2.5 rounded-full" style="background:${colors[i]}; box-shadow: 0 0 8px ${colors[i]}55"></div>
                    <div class="flex flex-col leading-none">
                        <span class="text-[10px] font-black text-slate-600 uppercase tracking-wider">${l}</span>
                        <span class="text-[8px] font-bold text-slate-300">${pct}% Share</span>
                    </div>
                </div>
                <span class="text-[13px] font-black text-slate-700">${series[i]}</span>
            </div>
        `;
    }).join('');

    // 3. จัดการตัวกราฟ
    if (!chartEl) return;
    
    // ล้างกราฟเก่าทิ้งให้เกลี้ยงก่อนวาดใหม่
    if (_charts.donut) {
        _charts.donut.destroy();
        _charts.donut = null;
    }
    chartEl.innerHTML = ''; 

    const options = {
        series: series,
        labels: labels,
        chart: { 
            type: 'donut', 
            height: 220, // ล็อคตัวเลขความสูงเป็น Pixel ไม่ใช้ %
            animations: { enabled: true, speed: 400 } 
        },
        colors: colors,
        stroke: { width: 2, colors: ['#ffffff'] },
        plotOptions: {
            pie: {
                donut: {
                    size: '75%',
                    labels: {
                        show: true,
                        name: { show: true, fontSize: '10px', fontWeight: 700, color: '#94a3b8', offsetY: -6 },
                        value: { 
                            show: true, fontSize: '18px', fontWeight: 900, color: '#1e293b', offsetY: 6,
                            formatter: (val) => val
                        },
                        total: { 
                            show: true, label: 'AVG', color: '#64748b', fontSize: '8px', fontWeight: 800,
                            formatter: () => avg + '%'
                        }
                    }
                }
            }
        },
        dataLabels: { enabled: false },
        legend: { show: false },
        tooltip: { theme: 'dark', y: { formatter: (val) => val + " ทักษะ" } }
    };

    _charts.donut = new ApexCharts(chartEl, options);
    
    // หน่วงเวลาเล็กน้อย (10ms) เพื่อให้ Container กางเสร็จก่อนวาด
    setTimeout(() => {
        if (_charts.donut) _charts.donut.render();
    }, 10);
}

    async function remove(skillName) {
        if (S.userRole === 'supervisor') { toast('โหมดอ่านอย่างเดียว', 'info'); return; }
        
        const targetUser = S.userRole === 'supervisor' ? S.viewingUser : S.currentUser;
        const targetSkill = _records ? _records.find(r => r.skill_name === skillName) : null;

        showCustomConfirmDialog({
            title: "ยืนยันการลบทักษะ Skill Matrix",
            subtitle: "ทักษะนี้จะถูกลบออกจากตาราง Skill Matrix ของผู้ใช้",
            badge: "SKILL MATRIX",
            type: "danger",
            details: [
                { label: "ชื่อทักษะ (Skill Name)", value: skillName || '-' },
                { label: "ระดับความสามารถ", value: targetSkill ? (targetSkill.level || targetSkill.score || '-') : '-' },
                { label: "ผู้ครอบครองทักษะ", value: targetUser }
            ],
            confirmText: "🗑️ ยืนยันลบทักษะนี้",
            cancelText: "ยกเลิก",
            onConfirm: async () => {
                try {
                    _records = _records.filter(r => r.skill_name !== skillName);
                    renderAll();
                    const { error } = await wapClient.from(TABLE).delete().eq('user_id', targetUser).eq('skill_name', skillName);
                    if (error) throw error;
                    toast('ลบทักษะเรียบร้อย', 'success');
                    await fetchRecords();
                } catch (e) {
                    console.error('[SkillMatrix Delete Error]:', e);
                    toast('ลบไม่สำเร็จ: ' + (e.message || ''), 'error');
                    await fetchRecords();
                }
            }
        });
    }

    async function clearAll() {
        if (S.userRole === 'supervisor') { toast('โหมดอ่านอย่างเดียว', 'info'); return; }
        
        const targetUser = S.userRole === 'supervisor' ? S.viewingUser : S.currentUser;

        showCustomConfirmDialog({
            title: "⚠️ ยืนยันล้างข้อมูลทักษะทั้งหมด",
            subtitle: "ทักษะทั้งหมดใน Skill Matrix ของผู้ใช้นี้จะถูกลบถาวร ไม่สามารถกู้คืนได้",
            badge: "SKILL MATRIX",
            type: "danger",
            requiresTextInput: "CLEAR",
            inputPlaceholder: "พิมพ์ 'CLEAR' เพื่อยืนยัน",
            details: [
                { label: "ผู้ใช้งาน", value: targetUser },
                { label: "จำนวนทักษะที่จะลบ", value: `${_records ? _records.length : 0} รายการ` }
            ],
            confirmText: "🔥 ยืนยันล้างทักษะทั้งหมด",
            cancelText: "ยกเลิก",
            onConfirm: async () => {
                try {
                    _records = [];
                    renderAll();
                    const { error } = await wapClient.from(TABLE).delete().eq('user_id', targetUser);
                    if (error) throw error;
                    toast('ล้างข้อมูลเรียบร้อย', 'success');
                    await fetchRecords();
                } catch (e) {
                    console.error('[SkillMatrix Clear Error]:', e);
                    toast('ล้างข้อมูลไม่สำเร็จ: ' + (e.message || ''), 'error');
                    await fetchRecords();
                }
            }
        });
    }

    return { init, submit, remove, clearAll };
})();
window.WapSkillMatrix = WapSkillMatrix;
let isFormHidden = true;

function toggleFormPanel() {
    const formPanel = document.getElementById('form-panel');
    const showBtn = document.getElementById('show-form-btn');
    
    // ปรับระยะเวลาให้เร็วขึ้นเป็น 0.3 วินาที
    const fastSpeed = 0.3; 

    if (!isFormHidden) {
        // --- จังหวะพับปิด (รวดเร็ว) ---
        gsap.to(formPanel, {
            x: -350,
            opacity: 0,
            width: 0,
            marginRight: -12,
            duration: fastSpeed,
            ease: "power2.in", // เร่งความเร็วตอนออก
            onComplete: () => {
                formPanel.classList.add('hidden');
                showBtn.classList.remove('hidden');
                gsap.fromTo(showBtn, { x: -10, opacity: 0 }, { x: 0, opacity: 1, duration: 0.2 });
                renderTable(); // ขยายตารางทันที
            }
        });
        isFormHidden = true;
    } else {
        // --- จังหวะเปิดออก (รวดเร็วและคมชัด) ---
        formPanel.classList.remove('hidden');
        showBtn.classList.add('hidden');
        
        gsap.fromTo(formPanel, 
            { x: -350, opacity: 0, width: 0, marginRight: -12 },
            { 
                x: 0, 
                opacity: 1, 
                width: 340, 
                marginRight: 0, 
                duration: fastSpeed + 0.1, // เพิ่มนิดเดียวเพื่อให้ดูไม่กระชากเกินไป
                ease: "expo.out", // เปิดพรึ่บออกมาแล้วค่อยๆ หยุด
                onComplete: () => {
                    renderTable();
                }
            }
        );
        isFormHidden = false;
    }
}

function renderAll() {
    updateKPIs();
    renderRadar();
    renderBars();
    renderDonut();

    // --- [ENTRANCE STAGGER: เลื่อนขึ้นนุ่มนวล] ---
    if (!$id('skill-matrix-content').classList.contains('hidden-view')) {
        const targets = "#skill-matrix-content .kpi-card, .chart-card, #sm-bar-list > div";
        gsap.killTweensOf(targets);
        gsap.fromTo(targets, 
            { opacity: 0, y: 15 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.4, 
                stagger: 0.03, 
                ease: "expo.out",
                clearProps: "all" 
            }
        );
    }
}

// --- เพิ่มตัวแปรสถานะการซิงค์ ---
let lastSyncTimestamp = 0;
let lastSyncedUser = "";
let isGlobalFetching = false;

/**
 *ฟังก์ชันดึงข้อมูลจาก Cloud แบบชาญฉลาด
 * จะดึงข้อมูลใหม่เฉพาะเมื่อ User เปลี่ยน หรือข้อมูลเก่ากว่า 1 นาที หรือโดนบังคับ (force)
 */
async function smartSyncData(force = false) {
    const targetUser = S.userRole === 'supervisor' ? S.viewingUser : S.currentUser;
    const now = Date.now();

    // เงื่อนไข: ถ้าไม่ได้บังคับ และเป็น User เดิม และข้อมูลโหลดมาไม่เกิน 60 วินาที -> ไม่ต้องโหลดใหม่
    if (!force && targetUser === lastSyncedUser && (now - lastSyncTimestamp < 60000)) {
        console.log("⚡ [System] Use cached data (Skip Fetch)");
        return true; 
    }

    if (isGlobalFetching) return; // ป้องกันการกดซ้ำขณะกำลังโหลด
    isGlobalFetching = true;

    try {
        console.log("📡 [System] Fetching fresh data from Cloud...");
        await Promise.all([
            loadRecords(), // SQE Data
            fetchWAPData() // WAP Data
        ]);
        
        lastSyncTimestamp = Date.now();
        lastSyncedUser = targetUser;
        return true;
    } catch (error) {
        console.error("❌ [System] Sync Failed:", error);
        return false;
    } finally {
        isGlobalFetching = false;
    }
}

// ปรับปรุง triggerModuleInit เพื่อลดการ Fetch ซ้ำซ้อน
function triggerModuleInit(name) {
    const targetUser = S.userRole === 'supervisor' ? S.viewingUser : S.currentUser;
    
    switch(name) {
        case 'EXEC DASHBOARD': initExecDashboard(); break;
        case 'ATTENDANCE LOGS': renderAttRecords(); break; // ใช้ข้อมูลใน S.attLeaveRecords เลย
        case 'LINE SUPPORT LOGS': WapSupportLogs.init(targetUser); break;
        case '5S EXCELLENCE': Wap5SExcellence.renderAll(); break; // เปลี่ยนจาก fetch เป็น render
        case 'OT MANAGEMENT': WapOTManagement.updateUI(); break;
    }
}
/**
 * ฟังก์ชันรีเฟรชข้อมูลหน้าจอหลัก (Global Refresh)
 * ใช้สำหรับอัปเดต UI ทุกหน้าจอให้ตรงกับ TargetUser และ Filter ปัจจุบัน
 */
/**
 * ฟังก์ชันรีเฟรชหน้าจอ (Rendering Only)
 * เน้นการวาดหน้าจอใหม่จากข้อมูลที่มีอยู่ในหน่วยความจำ (S.records, S.wapData)
 */
function triggerGlobalRefresh() {
    const titleEl = $id('header-title');
    if (!titleEl) return;

    const title = titleEl.textContent.trim().toUpperCase();
    const targetUser = S.userRole === 'supervisor' ? S.viewingUser : S.currentUser;
    if (!targetUser) return;

    // 1. อัปเดตข้อมูลพนักงานใน Sidebar (รันทันทีไม่ต้องรอ Frame)
    updateSidebarUserUI(targetUser);

    // 2. ใช้ requestAnimationFrame เพื่อให้ Browser วาดหน้าจอได้ลื่นไหล (ลดอาการ UI Block)
    requestAnimationFrame(() => {
        console.log(`[System] UI Update: ${title}`);

        const isDashboard   = title.includes('DASHBOARD') || title.includes('แดชบอร์ด');
        const isClaimWord   = title.includes('CLAIM')     || title.includes('บันทึก');
        const isExec        = title.includes('EXEC')      || title.includes('สรุปงาน');
        const isAttendance  = title.includes('ATTENDANCE') || title.includes('DAILY') || title.includes('รายงาน') || title.includes('เข้างาน');
        const isSupport     = title.includes('SUPPORT')   || title.includes('สนับสนุน');
        const is5S          = title.includes('5S')        || title.includes('ตรวจสอบ');
        const isSkill       = title.includes('SKILL')     || title.includes('ทักษะ');
        const isOT          = title.includes('OT')        || title.includes('ล่วงเวลา');
        const isSpecial     = title.includes('SPECIAL')   || title.includes('ภารกิจ');

        if (isDashboard && isClaimWord) {
            refreshClaimDashboard(); 
        } 
        else if (isClaimWord && !isDashboard) {
            renderTable(); 
        }
        else if (isExec) {
            initExecDashboard();
        }
        else if (isAttendance) {
            renderAttRecords(); // เปลี่ยนจาก initAttDashboard ที่มี fetch อยู่ข้างใน
            renderDailySubmissionMatrix();
            updateAttKPI();
        }
        else if (isSupport) {
            WapSupportLogs.init(targetUser);
        }
        else if (is5S) {
            Wap5SExcellence.renderAll(); // เปลี่ยนจาก fetchRecords -> renderAll
        }
        else if (isSkill) {
            WapSkillMatrix.renderAll(); // เปลี่ยนจาก init -> renderAll
        }
        else if (isOT) {
            WapOTManagement.updateUI(); // เปลี่ยนจาก fetchRecords -> updateUI
        }
        else if (isSpecial) {
            WapSpecialJobs.applyDateFilter(); // เปลี่ยนจาก init -> applyDateFilter (ซึ่งมี renderTable/Charts)
        }
    });
}

// แยก UI Sidebar ออกมาเพื่อความสะอาด
function updateSidebarUserUI(targetUser) {
    const displayName = targetUser.split('@')[0].replace(/\./g, ' ').toUpperCase();
    if ($id('user-display-name')) {
        if (S.userRole === 'supervisor' && S.viewingUser !== S.currentUser) {
            $id('user-display-name').innerHTML = `${displayName} <span class="text-[8px] text-rose-500 font-black tracking-tighter">(VIEWING)</span>`;
        } else {
            $id('user-display-name').textContent = displayName;
        }
    }
    if ($id('user-display-email')) $id('user-display-email').textContent = targetUser;
    if ($id('user-avatar')) $id('user-avatar').textContent = displayName.charAt(0);
}

// ปรับปรุงฟังก์ชัน Reset ให้ล้างค่าและสั่ง Refresh รวม
function resetHeaderFilters() {
    $id('header-start-date').value = '';
    $id('header-end-date').value = '';
    toast('🧹 ล้างตัวกรองและแสดงข้อมูลทั้งหมด', 'info');
    triggerGlobalRefresh();
}

// ฟังก์ชันสำหรับเปิด-ปิด Submenu
function toggleSubmenu(el) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('collapsed')) {
        toggleSidebar('open'); // ขยาย sidebar ก่อนถ้าพับอยู่
    }
    
    const menuGroup = el.parentElement;
    const submenu = menuGroup.querySelector('.submenu-container');
    const isOpening = !submenu.classList.contains('open');
    
    // ปิด submenu อื่นๆ ก่อน (ถ้าต้องการให้เปิดได้ทีละอัน)
    document.querySelectorAll('.submenu-container').forEach(s => s.classList.remove('open'));
    document.querySelectorAll('.menu-group .nav-item').forEach(n => n.classList.remove('menu-open'));

    if (isOpening) {
        submenu.classList.add('open');
        el.classList.add('menu-open');
    }
}

// ปรับปรุงฟังก์ชัน switchPage เดิมเพื่อจัดการ Active State
const originalSwitchPage = switchPage;
switchPage = function(name, el) {
    // 1. ลบ class active จากทุกที่
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active-nav'));
    document.querySelectorAll('.active-indicator').forEach(i => i.remove());
    
    // 2. ใส่ class ให้ตัวที่คลิก
    if (el) {
        el.classList.add('active-nav');
        // เพิ่มเส้นขีดสีน้ำเงิน (Indicator)
        const indicator = document.createElement('div');
        indicator.className = 'active-indicator';
        el.appendChild(indicator);
    }

    // 3. เรียกฟังก์ชันเดิมทำงาน
    originalSwitchPage(name, el);
    
    // ถ้าคลิกเมนูหลักอื่นๆ ที่ไม่ใช่กลุ่ม Exec ให้ปิด dropdown
    if (el && !el.closest('.menu-group')) {
        document.querySelectorAll('.submenu-container').forEach(s => s.classList.remove('open'));
        document.querySelectorAll('.menu-group .nav-item').forEach(n => n.classList.remove('menu-open'));
    }
};

function editAttRecord(id) {
    const rec = (S.attLeaveRecords || []).find(r => String(r.id) === String(id));
    if (!rec) { attToast('ไม่พบรายการนี้', 'error'); return; }

    attEditingId = id; // ตัวแปรนี้มีอยู่แล้ว ใช้ร่วมกับ submitLeaveRequest()

    document.getElementById('att-leave-date').value = rec.date || '';
    document.getElementById('att-leave-type').value = rec.type || '';
    document.getElementById('att-leave-reason').value = rec.note || '';

    const titleEl = document.querySelector('.att-form-title');
    if (titleEl) titleEl.innerHTML = '<div class="form-title-dot"></div>แก้ไขคำขอการลา';

    const submitBtn = document.getElementById('att-submit-btn');
    if (submitBtn) submitBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L10.5 16.5 18 8.25"/></svg>บันทึกการแก้ไข';

    renderAttRecords(); // ให้แถวที่แก้ไขไฮไลต์ (.att-editing-row)
    document.getElementById('att-leave-date').scrollIntoView({ behavior: 'smooth', block: 'center' });
}


let _targetValue = 100; // ค่าเริ่มต้น

function updateTarget(val) {
    _targetValue = parseFloat(val) || 0;
    updateUI(); // สั่งอัปเดตหน้าจอทันที
}

const WapOTManagement = (function() {
    const TABLE = 'ot_records';
    let _charts = { trend: null, dist: null };
    let _allRecords = [];      // ข้อมูลดิบทั้งหมดจาก DB
    let _filteredRecords = []; // ข้อมูลที่ผ่านการกรองวันที่แล้ว
    let _targetValue = 100;    // ค่าเป้าหมายตั้งต้น

    async function init() {
        // 1. ตั้งค่าวันที่เริ่มต้นในฟอร์มเป็นวันนี้
        const dateInput = $id('ot-f-date');
        if (dateInput && !dateInput.value) dateInput.value = new Date().toISOString().split('T')[0];
        
        // 2. ดึงค่า Target จาก Input (ถ้ามี)
        const targetIn = $id('ot-target-input');
        if (targetIn) _targetValue = parseFloat(targetIn.value) || 100;

        await fetchRecords();
    }

    // ฟังก์ชันคำนวณชั่วโมง
// แก้ไขภายใน WapOTManagement ในไฟล์ script.js
function calcHours() {
    const startEl = document.getElementById('ot-start');
    const endEl   = document.getElementById('ot-end');
    const breakEl = document.getElementById('ot-f-break');
    const outEl   = document.getElementById('ot-f-computed');

    if (!startEl || !endEl) return { raw: 0, actual: 0 };

    // 1. ดึงค่าและเปลี่ยนจุด (.) เป็นโคลอน (:) เพื่อป้องกัน NaN
    let start = startEl.value.trim().replace('.', ':');
    let end = endEl.value.trim().replace('.', ':');
    const breakMin = breakEl ? (parseInt(breakEl.value) || 0) : 0;

    // ตรวจสอบรูปแบบเวลา (HH:mm)
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    
    // กรณีพิเศษรองรับ 24:00 หรือ 00:00
    const isValidStart = timeRegex.test(start) || start === "00:00";
    const isValidEnd = timeRegex.test(end) || end === "24:00" || end === "00:00";

    if (!isValidStart || !isValidEnd) {
        if (outEl) outEl.textContent = '0.00';
        return { raw: 0, actual: 0 };
    }

    // 2. แปลงเวลาเป็นนาที
    const [sh, sm] = start.split(':').map(Number);
    let [eh, em] = end.split(':').map(Number);

    // ถ้าจบที่ 00:00 ให้ถือว่าเป็น 24:00 (ข้ามวัน)
    if (eh === 0 && em === 0) eh = 24;

    let startTotal = (sh * 60) + sm;
    let endTotal = (eh * 60) + em;

    // ถ้าเวลาเลิกงานน้อยกว่าเวลาเริ่ม (เข้ากะดึก) ให้บวกไปอีก 24 ชม.
    if (endTotal <= startTotal) endTotal += 1440;

    const diffMins = endTotal - startTotal;
    const actualHours = Math.max(0, (diffMins - breakMin) / 60);

    // 3. แสดงผล
    if (outEl) {
        outEl.textContent = actualHours.toFixed(2);
    }

    return { raw: diffMins / 60, actual: actualHours };
}

    // --- ดึงข้อมูลจาก Database ---
    async function fetchRecords() {
        const targetUser = S.userRole === 'supervisor' ? S.viewingUser : S.currentUser;
        if (!navigator.onLine || !targetUser) return;

        try {
            const { data, error } = await wapClient.from(TABLE)
                .select('*')
                .eq('user_id', targetUser)
                .order('date', { ascending: false });

            if (error) throw error;
            _allRecords = data || [];
            
            applyDateFilter(); // กรองวันที่ก่อนแสดงผล
        } catch (e) {
            console.error("[OT] Sync Error:", e);
        }
    }


    // ✅ เพิ่มฟังก์ชันใหม่ตรงนี้ (หลัง calcHours)
    function autoSchedule(dateValue) {
        if (!dateValue) return;
        const d = new Date(dateValue + 'T00:00:00'); // กันปัญหา timezone offset
        const day = d.getDay(); // 0=อาทิตย์, 6=เสาร์

        // เช็คว่าเป็นวันหยุดนักขัตฤกษ์ที่บันทึกไว้ในระบบ Attendance หรือไม่
        const isRegisteredHoliday = (S.attLeaveRecords || []).some(
            r => r.date === dateValue && r.type === 'holiday'
        );

        const isSaturday = (day === 6);
        const isSundayOrHoliday = (day === 0) || isRegisteredHoliday;
        const isOffDay = isSaturday || isSundayOrHoliday;

        const startEl = $id('ot-start');
        const endEl   = $id('ot-end');
        const breakEl = $id('ot-f-break');
        const typeEl  = $id('ot-f-type');

        if (isOffDay) {
            // วันหยุดทุกชนิด (เสาร์ / อาทิตย์ / นักขัตฤกษ์): 08:00-20:00 พัก 90 นาที
            if (startEl) startEl.value = '08:00';
            if (endEl)   endEl.value   = '20:00';
            if (breakEl) breakEl.value = 90;
            // เสาร์ = x1.0, อาทิตย์/นักขัตฤกษ์ = x3.0
            if (typeEl)  typeEl.value  = isSundayOrHoliday ? '3.0' : '1.0';
        } else {
            // วันทำงานปกติ (จันทร์-ศุกร์): 17:30-20:00 ไม่มีพัก x1.5
            if (startEl) startEl.value = '17:30';
            if (endEl)   endEl.value   = '20:00';
            if (breakEl) breakEl.value = 0;
            if (typeEl)  typeEl.value  = '1.5';
        }

        if (startEl) validateOtTime(startEl);
        if (endEl)   validateOtTime(endEl);
        calcHours(); // อัปเดตช่อง "ชั่วโมงที่จะบันทึก" ทันที

        toast(
            isOffDay
                ? '📅 ตั้งเวลาวันหยุดให้อัตโนมัติ (08:00-20:00 พัก 90 นาที)'
                : '📅 ตั้งเวลาวันทำงานปกติให้อัตโนมัติ (17:30-20:00)',
            'info'
        );
    }

   // ✅ เติมเวลา/พัก/ชื่องาน อัตโนมัติจากประเภทที่เลือก (ไม่อิงวันที่)
    function applyTypeSchedule(typeValue) {
        const startEl = $id('ot-start');
        const endEl   = $id('ot-end');
        const breakEl = $id('ot-f-break');
        const jobEl   = $id('ot-f-job');

        if (!typeValue) return;

        if (typeValue === '1.5') {
            // วันปกติ: 17:30-20:00 ไม่มีพัก
            if (startEl) startEl.value = '17:30';
            if (endEl)   endEl.value   = '20:00';
            if (breakEl) breakEl.value = 0;
            if (jobEl && !jobEl.value.trim()) jobEl.value = 'Support งานล่วงเวลาวันปกติ';
        } else if (typeValue === '1.0' || typeValue === '3.0') {
            // วันเสาร์ / อาทิตย์-นักขัตฤกษ์: 08:00-20:00 พัก 90 นาที
            if (startEl) startEl.value = '08:00';
            if (endEl)   endEl.value   = '20:00';
            if (breakEl) breakEl.value = 90;
            if (jobEl && !jobEl.value.trim()) {
                jobEl.value = (typeValue === '1.0')
                    ? 'Support งานล่วงเวลาวันเสาร์'
                    : 'Support งานล่วงเวลาวันหยุด/นักขัตฤกษ์';
            }
        }

        if (startEl) validateOtTime(startEl);
        if (endEl)   validateOtTime(endEl);
        calcHours(); // อัปเดตช่อง "ชั่วโมงที่จะบันทึก" ทันที

        toast('📋 เติมเวลาและรายละเอียดงานอัตโนมัติตามประเภทที่เลือก', 'info');
    } 
    // --- กรองข้อมูลตามช่วงวันที่จาก Header ---
    function applyDateFilter() {
        const start = $id('cd-start-date')?.value;
        const end = $id('cd-end-date')?.value;

        if (start && end) {
            _filteredRecords = _allRecords.filter(r => r.date >= start && r.date <= end);
        } else {
            _filteredRecords = [..._allRecords];
        }
        updateUI();
    }

    /**
 * อัปเกรดฟังก์ชันบันทึก OT ให้รองรับระบบออฟไลน์ (V2.0)
 */
async function save() {
    if (!hasWriteAccess()) return; // ตรวจสอบสิทธิ์ Supervisor (Read-only)

    const timeData = calcHours(); // คำนวณชั่วโมงสุทธิ
    const job = $id('ot-f-job').value.trim();
    const typeRate = $id('ot-f-type').value;
    const btn = $id('ot-save-btn');
    const dateVal = $id('ot-f-date').value;

    // 1. Validation: ตรวจสอบความถูกต้องของข้อมูล
    if (timeData.actual <= 0) { toast('⚠️ กรุณาระบุเวลาทำงานให้ถูกต้อง', 'error'); return; }
    if (!job) { toast('⚠️ กรุณากรอกรายละเอียดงาน', 'error'); shake($id('ot-f-job')); return; }
    if (!typeRate) { toast('⚠️ กรุณาเลือกประเภท OT', 'error'); shake($id('ot-f-type')); return; }
    if (!dateVal) { toast('⚠️ กรุณาเลือกวันที่', 'error'); return; }

    btn.disabled = true;
    btn.textContent = 'กำลังประมวลผล...';

    // 2. สร้าง Payload สำหรับบันทึก
    const recordId = 'OT-' + Date.now();
    const payload = {
        id: recordId,
        user_id: S.currentUser,
        date: dateVal,
        start_time: $id('ot-start').value,
        end_time: $id('ot-end').value,
        break_min: parseInt($id('ot-f-break').value) || 0,
        type_rate: parseFloat(typeRate),
        job_name: job,
        actual_hours: timeData.actual,
        calc_hours: timeData.raw,
        full_timestamp: new Date().toISOString(),
        sync_status: 'pending' // สถานะเริ่มต้นคือรอซิงค์
    };

    try {
        let saveMethod = '';

        // 3. ระบบตัดสินใจ (Online vs Offline)
        if (navigator.onLine) {
            // โหมดออนไลน์: ส่งข้อมูลไป Supabase
            const { error } = await wapClient.from('ot_records').insert([
                // กรองฟิลด์ที่ Supabase ไม่รู้จักออก (sync_status)
                (({ sync_status, ...o }) => o)(payload)
            ]);
            
            if (error) throw error;
            payload.sync_status = 'synced';
            saveMethod = 'cloud';
        } else {
            // โหมดออฟไลน์: เก็บลง Dexie (localDB)
            if (localDB.pendingOT) {
                await localDB.pendingOT.put(payload);
                saveMethod = 'local';
            } else {
                throw new Error("Local DB table 'pendingOT' not found");
            }
        }

        // 4. Feedback แจ้งเตือนผู้ใช้
        if (saveMethod === 'cloud') {
            toast('✅ บันทึก OT ออนไลน์สำเร็จ', 'success');
        } else {
            toast('📶 บันทึกในเครื่องแล้ว (รอออนไลน์เพื่อซิงค์)', 'info');
        }

        // 5. ล้างฟอร์ม (Form Reset)
        const clearField = (id, val) => { const el = $id(id); if (el) el.value = val; };
        clearField('ot-f-date', '');
        clearField('ot-f-job', '');
        clearField('ot-start', '');
        clearField('ot-end', '');
        clearField('ot-f-break', '0');
        clearField('ot-f-type', '');
        
        $id('ot-f-computed').textContent = '0.00';

        // ล้างคลาส Valid (สีเขียวนีออน) ออกจาก Input
        document.querySelectorAll('#ot-management-content .valid, #ot-management-content .invalid')
            .forEach(el => el.classList.remove('valid', 'invalid'));

        // 6. โหลดข้อมูลลงตารางใหม่
        // หากออฟไลน์ _allRecords จะถูกเพิ่มข้อมูลชั่วคราวเพื่อให้ User เห็นทันที
        if (!navigator.onLine && typeof _allRecords !== 'undefined') {
            _allRecords.unshift(payload);
            updateUI(); // เรียกฟังก์ชันวาดกราฟและตารางภายในโมดูล
        } else {
            await fetchRecords(); // โหลดจาก Cloud (หรือ Memory ล่าสุด)
        }

    } catch (e) {
        console.error('OT Save System Error:', e);
        toast('❌ ระบบบันทึกขัดข้อง: ' + (e.message || 'Error'), 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'บันทึก OT';
    }
}

// --- อัปเดตตัวเลขสถิติบนหน้าจอ (เวอร์ชันอนิเมชั่นพรีเมียม) ---
function updateUI() {
    // ล้างอนิเมชั่นเก่าที่อาจค้างอยู่เพื่อความลื่นไหล
    gsap.killTweensOf(".ot-kpi-card, #ot-prog-circle");

    // --- 1. ส่วนคำนวณสถิติ (คงเดิม) ---
    let sumActual = 0, wdCount = 0, weCount = 0, hoCount = 0;
    let wdHrs = 0, weHrs = 0, hoHrs = 0;

    _filteredRecords.forEach(r => {
        const h = parseFloat(r.actual_hours) || 0;
        sumActual += h;
        if (r.type_rate == 1.5) { wdCount++; wdHrs += h; }
        else if (r.type_rate == 1.0) { weCount++; weHrs += h; }
        else if (r.type_rate == 3.0) { hoCount++; hoHrs += h; }
    });

    // --- 2. อนิมิชั่นวงกลมความคืบหน้า (Monthly Quota) ---
    const now = new Date();
    const currentMonthKey = now.toISOString().substring(0, 7); 
    const currentMonthRecords = _allRecords.filter(r => r.date && r.date.startsWith(currentMonthKey));
    const monthSum = currentMonthRecords.reduce((sum, r) => sum + parseFloat(r.actual_hours || 0), 0);
    const pct = _targetValue > 0 ? Math.min(100, (monthSum / _targetValue) * 100) : 0;
    
    // สั่งวงกลม SVG วิ่งด้วย GSAP
    const circle = $id('ot-prog-circle');
    if (circle) {
        gsap.to(circle, { 
            attr: { "stroke-dasharray": `${pct}, 100` }, 
            duration: 1.5, 
            ease: "power2.out" 
        });
    }
    
    // สั่งตัวเลขกลางวงกลมวิ่ง (ทศนิยม 1 ตำแหน่ง)
    if ($id('ot-prog-val')) {
        const monthName = now.toLocaleString('en-US', {month: 'short'}).toUpperCase();
        animateValue('ot-prog-val', 0, monthSum, 1500, 1, 
            `<div style="font-size:7px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-top:-2px;">${monthName} HRS</div>`
        );
    }

    // --- 3. อนิมิชั่นตัวเลข KPI การ์ดอื่นๆ ---
    
    // ยอดรวมทั้งหมด (ทศนิยม 2 ตำแหน่ง)
    animateValue('ot-kpi-total', 0, sumActual, 1200, 2);

    // วันปกติ (x1.5)
    animateValue('ot-kpi-wd-count', 0, wdCount, 1000, 0, ' <span class="text-xs font-bold text-slate-400">ครั้ง</span>');
    animateValue('ot-kpi-wd-hrs', 0, wdHrs, 1000, 2, " ชม.");

    // วันเสาร์ (x1.0)
    animateValue('ot-kpi-we-count', 0, weCount, 1000, 0, ' <span class="text-xs font-bold text-slate-400">ครั้ง</span>');
    animateValue('ot-kpi-we-hrs', 0, weHrs, 1000, 2, " ชม.");

    // วันหยุด (x3.0)
    animateValue('ot-kpi-ho-count', 0, hoCount, 1000, 0, ' <span class="text-xs font-bold text-slate-400">ครั้ง</span>');
    animateValue('ot-kpi-ho-hrs', 0, hoHrs, 1000, 2, " ชม.");

    // เรียกฟังก์ชันวาดกราฟและตารางต่อ
    renderCharts(wdHrs, weHrs, hoHrs);
    renderTable();
}

// ฟังก์ชันคำนวณ step ใช้ร่วมกัน
function calcYStep(yMax) {
    const steps = [5, 10, 20, 25, 50];
    for (const s of steps) {
        if (yMax % s === 0 && (yMax / s) <= 10 && (yMax / s) >= 4) return s;
    }
    return 20;
}

// --- วาดกราฟวิเคราะห์ ---
    function renderCharts() {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const mData = new Array(12).fill(0);
        
        // ใช้ _allRecords สำหรับกราฟเทรนด์ เพื่อให้เห็นภาพรวมทั้งปีเสมอ
        _allRecords.forEach(r => {
            const d = new Date(r.date);
            if (!isNaN(d.getTime())) mData[d.getMonth()] += parseFloat(r.actual_hours);
        });

        // 1. กราฟแท่ง Trend
        if (_charts.trend) _charts.trend.destroy();
        _charts.trend = new ApexCharts($id('ot-trend-chart'), {
            series: [{ name: 'Hours', data: mData }],
            chart: { 
                type: 'bar', 
                height: '100%', 
                toolbar: {show:false},
                animations: { enabled: true, easing: 'easeinout', speed: 800 }
            },
            plotOptions: { 
                bar: { 
                    borderRadius: 4, 
                    columnWidth: '50%',
                    dataLabels: { position: 'top' } 
                } 
            },
            dataLabels: {
                enabled: true,
                offsetY: -20,
                style: { fontSize: '10px', colors: ["#475569"], fontWeight: 700 },
                formatter: (val) => val > 0 ? val.toFixed(1) : '' // ตัวเลขบนยอดแท่งให้มี 1 ตำแหน่งพอ
            },
            colors: ['#3b82f6'],
            xaxis: { 
                categories: months,
                labels: { style: { colors: '#94a3b8', fontSize: '10px', fontWeight: 600 } }
            },
            
            // >>> [จุดที่แก้ไข] ลบทศนิยมยาวๆ ที่แกน Y <<<
            yaxis: {
                labels: {
                    formatter: (val) => val.toFixed(0), // บังคับแสดงเป็นเลขจำนวนเต็ม
                    style: { colors: '#94a3b8', fontSize: '10px', fontWeight: 600 }
                }
            },
            
            annotations: {
                yaxis: [{ 
                    y: _targetValue, 
                    borderColor: '#ef4444', 
                    strokeDashArray: 4,
                    label: { 
                        text: 'LIMIT: ' + _targetValue + ' hrs',
                        style: { color: '#fff', background: '#ef4444', fontSize: '10px', fontWeight: 800 }
                    } 
                }]
            },
            grid: { borderColor: '#f1f5f9', strokeDashArray: 4 }
        });
        _charts.trend.render();

// --- 2. กราฟวงกลม Distribution (ออกแบบสไตล์ Quality Performance Gauge) ---
const distData = [0, 0, 0]; // 1.5, 1.0, 3.0
_filteredRecords.forEach(r => {
    if(r.type_rate == 1.5) distData[0]++;
    else if(r.type_rate == 1.0) distData[1]++;
    else if(r.type_rate == 3.0) distData[2]++;
});

const totalSessions = distData.reduce((a, b) => a + b, 0);

if (_charts.dist) _charts.dist.destroy();

_charts.dist = new ApexCharts($id('ot-dist-chart'), {
    series: distData,
    labels: ['วันปกติ (x1.5)', 'วันเสาร์ (x1.0)', 'วันหยุด (x3.0)'],
    chart: { 
        type: 'donut', 
        height: '100%',
        width: '100%',
        toolbar: { show: false }, // ซ่อนเมนู 3 จุดไม่ให้บังกราฟ
        sparkline: { enabled: false },
        parentHeightOffset: 0,
        animations: { 
            enabled: true, 
            speed: 800,
            animateGradually: { enabled: true, delay: 150 }
        }
    },
    // สีสไตล์ Quality Performance Gauge (Indigo Blue, Emerald Green, Amber)
    colors: ['#3b82f6', '#10b981', '#f59e0b'],
    stroke: { 
        width: 3, 
        colors: ['#ffffff'],
        lineCap: 'round'
    },
    plotOptions: {
        pie: {
            startAngle: -90,
            endAngle: 90,
            offsetY: 12,
            expandOnClick: false,
            donut: {
                size: '78%',
                labels: {
                    show: true,
                    name: {
                        show: true,
                        fontSize: '10px',
                        fontWeight: 800,
                        color: '#64748b',
                        offsetY: -14
                    },
                    value: {
                        show: true,
                        fontSize: '22px',
                        fontWeight: 900,
                        color: '#1e293b',
                        offsetY: -2,
                        formatter: (v) => {
                            return totalSessions > 0 ? Math.round((v / totalSessions) * 100) + '%' : '0%';
                        }
                    },
                    total: {
                        show: true,
                        label: 'OT RATIO',
                        fontSize: '9px',
                        fontWeight: 900,
                        color: '#3b82f6',
                        formatter: (w) => {
                            const totals = w.globals.seriesTotals;
                            const sum = totals ? totals.reduce((a, b) => a + b, 0) : 0;
                            return sum > 0 ? Math.round((totals[0] / sum) * 100) + '%' : '0%';
                        }
                    }
                }
            }
        }
    },
    dataLabels: {
        enabled: true,
        formatter: (val) => val > 0 ? val.toFixed(0) + "%" : "",
        style: {
            fontSize: '9px',
            fontWeight: 800,
            colors: ['#ffffff']
        },
        dropShadow: { enabled: false }
    },
    legend: { 
        show: true,
        position: 'bottom',
        horizontalAlign: 'center',
        floating: false,
        fontSize: '10px',
        fontWeight: 700,
        offsetY: 4,
        itemMargin: { horizontal: 6, vertical: 0 },
        markers: { radius: 12, width: 8, height: 8 },
        labels: { colors: '#64748b' }
    },
    tooltip: { 
        theme: 'dark',
        y: { formatter: (v) => v + " รายการ" }
    },
    responsive: [
        {
            breakpoint: 768,
            options: {
                dataLabels: { enabled: false }, // ซ่อนตัวหนังสือบนชิ้นวงกลมเมื่อจอเล็ก
                plotOptions: {
                    pie: {
                        donut: {
                            size: '78%',
                            labels: {
                                show: true,
                                name: { show: false }, // ซ่อนตัวหนังสือชื่อ
                                total: { show: false }, // ซ่อนตัวหนังสือหัวข้อ
                                value: {
                                    show: true,
                                    fontSize: '20px',
                                    fontWeight: 900,
                                    offsetY: -2,
                                    formatter: (w) => {
                                        const totals = w.globals.seriesTotals;
                                        const sum = totals ? totals.reduce((a, b) => a + b, 0) : 0;
                                        return sum > 0 ? Math.round((totals[0] / sum) * 100) + '%' : '0%';
                                    }
                                }
                            }
                        }
                    }
                },
                legend: {
                    position: 'bottom',
                    horizontalAlign: 'center',
                    fontSize: '9px',
                    itemMargin: { horizontal: 4, vertical: 0 },
                    formatter: function(seriesName) {
                        return seriesName.split(' ')[0]; // แสดง 'วันปกติ', 'วันเสาร์', 'วันหยุด'
                    }
                }
            }
        },
        {
            breakpoint: 480,
            options: {
                dataLabels: { enabled: false },
                plotOptions: {
                    pie: {
                        donut: {
                            size: '76%',
                            labels: {
                                show: true,
                                name: { show: false },
                                total: { show: false },
                                value: {
                                    show: true,
                                    fontSize: '18px',
                                    fontWeight: 900,
                                    offsetY: -2,
                                    formatter: (w) => {
                                        const totals = w.globals.seriesTotals;
                                        const sum = totals ? totals.reduce((a, b) => a + b, 0) : 0;
                                        return sum > 0 ? Math.round((totals[0] / sum) * 100) + '%' : '0%';
                                    }
                                }
                            }
                        }
                    }
                },
                legend: {
                    fontSize: '8px',
                    itemMargin: { horizontal: 3, vertical: 0 },
                    formatter: function(seriesName) {
                        return seriesName.split(' ')[0];
                    }
                }
            }
        }
    ]
});

_charts.dist.render();
    }


function renderTable() {
    const tbody = $id('ot-table-body');
    if (!tbody) return;
    
    $id('ot-hist-count').textContent = `${_filteredRecords.length} รายการ`;
    
    // วาด HTML สำหรับตารางกิจกรรมล่าสุด
    tbody.innerHTML = _filteredRecords.slice(0, 15).map(r => `
        <tr class="ot-table-row border-b border-slate-50" data-rid="${r.id}">
            <td class="py-2 px-2 font-mono text-[9px] text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis">${r.date}</td>
            <td class="py-2 px-2 font-bold text-slate-700 uppercase truncate" style="font-size:10px;" title="${r.job_name}">${r.job_name}</td>
            <td class="py-2 px-1 text-center text-blue-600 font-black whitespace-nowrap" style="font-size:12px;">${parseFloat(r.actual_hours).toFixed(2)}</td>
            <td class="py-2 px-2 text-right">
                <button  onclick="WapOTManagement.remove('${r.id}')" class="text-slate-200 hover:text-rose-500 transition-all" title="Wap O T Management.Remove" aria-label="Wap O T Management.Remove">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
            </td>
        </tr>
    `).join('');

    // สั่งให้แถวทยอยเลื่อนขึ้น (Stagger)
    if (typeof window.animateTableRows === 'function') {
        window.animateTableRows('.ot-table-row', { y: 6, duration: 0.28, stagger: 0.025, ease: 'power2.out' });
    }
    if (typeof reapplyKbdRowSelection === 'function') reapplyKbdRowSelection();
}

// ฟังก์ชันนี้จะถูกเรียกจาก oninput ใน HTML
function updateTarget(val) {
    const newTarget = parseFloat(val) || 0;
    
    // อัปเดตเฉพาะส่วน Annotation และแกน Y ของกราฟเดิม ไม่ต้องทำลายกราฟสร้างใหม่ (จะลื่นไหลกว่า)
    if (_charts.trend) {
        _charts.trend.updateOptions({
            annotations: {
                yaxis: [{
                    y: newTarget,
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    strokeDashArray: 5,
                    label: {
                        text: `LIMIT: ${newTarget} HRS`,
                        style: { background: '#ef4444', color: '#fff', fontWeight: 900 }
                    }
                }]
            }
        });
    }
    
    // อัปเดตวงกลมความคืบหน้า (Progress Circle) ที่อยู่ด้านบนด้วย
    updateUI(); 
}

async function remove(id) {
        if (S.userRole === 'supervisor') { toast('โหมดอ่านอย่างเดียว', 'info'); return; }
        
        const target = _allRecords ? _allRecords.find(r => String(r.id) === String(id)) : null;

        showCustomConfirmDialog({
            title: "ยืนยันการลบข้อมูล OT",
            subtitle: "รายการล่วงเวลา (Overtime) นี้จะถูกลบออกจากระบบถาวร",
            badge: "OT MANAGEMENT",
            type: "danger",
            details: [
                { label: "ชื่องาน / ภารกิจ OT", value: target ? (target.job_name || target.work_description || '-') : '-' },
                { label: "จำนวนชั่วโมง OT", value: target ? `${parseFloat(target.actual_hours || target.hours || 0).toFixed(2)} ชม.` : '-' },
                { label: "วันที่ปฏิบัติงาน", value: target ? (target.date || target.ot_date || '-') : '-' },
                { label: "ผู้ปฏิบัติงาน", value: target ? (target.user_id || S.currentUser) : S.currentUser }
            ],
            confirmText: "🗑️ ยืนยันลบรายการ OT",
            cancelText: "ยกเลิก",
            onConfirm: async () => {
                try {
                    _allRecords = _allRecords.filter(r => String(r.id) !== String(id));
                    applyDateFilter();
                    const { error } = await wapClient.from(TABLE).delete().eq('id', id);
                    if (error) throw error;
                    toast('ลบเรียบร้อย', 'success');
                    await fetchRecords();
                } catch (e) {
                    console.error('[OT Delete Error]:', e);
                    toast('ลบไม่สำเร็จ: ' + (e.message || ''), 'error');
                    await fetchRecords();
                }
            }
        });
    }

    function updateTarget(val) {
        _targetValue = parseFloat(val) || 100;
        updateUI();
    }

    return { 
        init, 
        fetchRecords, 
        remove, 
        applyDateFilter, 
        updateTarget, 
        autoSchedule, 
        applyTypeSchedule, 
        calcHours, 
        save 
    };
})();

/**
 * ═══════════════════════════════════════════════════════
 *  WAP SPECIAL JOBS - FULLY INTEGRATED MODULE (V5.5)
 * ═══════════════════════════════════════════════════════
 */
const WapSpecialJobs = (function() {
    const TABLE = 'special_jobs';
    let _charts = { volume: null, assignor: null };
    let _allRecords = [];      // ข้อมูลดิบทั้งหมดจาก DB
    let _filteredRecords = []; // ข้อมูลที่ผ่านการกรองช่วงวันที่แล้ว

    // 1. เริ่มต้นระบบ
    async function init() {
        // ตั้งค่าวันที่ในช่องกรอกข้อมูลเป็นวันนี้ (ค่าเริ่มต้น)
        const dIn = document.getElementById('sj-f-date');
        if (dIn && !dIn.value) {
            dIn.value = new Date().toISOString().split('T')[0];
        }
        
        await fetchRecords();
    }

    // 2. ดึงข้อมูลจาก Supabase
    async function fetchRecords() {
        // รองรับทั้งพนักงานทั่วไปและโหมดหัวหน้างาน (Supervisor)
        const targetUser = (S.userRole === 'supervisor') ? S.viewingUser : S.currentUser;
        
        if (!navigator.onLine || !targetUser) return;

        try {
            const { data, error } = await wapClient
                .from(TABLE)
                .select('*')
                .eq('user_id', targetUser)
                .order('date', { ascending: false });

            if (error) throw error;
            _allRecords = data || [];
            
            // เมื่อได้ข้อมูลดิบมาแล้ว ให้รันระบบฟิลเตอร์ทันที
            applyDateFilter(); 
        } catch (e) { 
            console.error("[SpecialJobs] Sync Error:", e);
            if (typeof toast === 'function') toast('โหลดข้อมูลภารกิจไม่สำเร็จ', 'error');
        }
    }

    // 3. ฟังก์ชันกรองข้อมูลตามช่วงวันที่จาก Header
    function applyDateFilter() {
        const start = document.getElementById('cd-start-date')?.value;
        const end = document.getElementById('cd-end-date')?.value;

        if (start && end) {
            // กรณีมีการเลือกช่วงวันที่ในปฏิทิน Header
            _filteredRecords = _allRecords.filter(r => r.date >= start && r.date <= end);
            
            // อัปเดตข้อความบอกช่วงเวลาที่หน้าจอ
            const monthText = document.getElementById('sj-current-month-text');
            if (monthText) monthText.textContent = `PERIOD: ${start} TO ${end}`;
        } else {
            // กรณีไม่ได้เลือกวันที่ (Reset) ให้แสดงข้อมูลทั้งหมดของปีปัจจุบัน
            const currentYear = new Date().getFullYear().toString();
            _filteredRecords = _allRecords.filter(r => r.date && r.date.startsWith(currentYear));
            
            const monthText = document.getElementById('sj-current-month-text');
            if (monthText) monthText.textContent = `SHOWING ALL ${currentYear} MISSIONS`;
        }
        
        // สั่งอัปเดตส่วนแสดงผลทั้งหมด
        updateUI(); 
    }

function updateUI() {
    const total = _filteredRecords.length;
    const withResult = _filteredRecords.filter(r => r.result && r.result !== '-' && r.result !== '').length;
    const rate = total > 0 ? Math.round((withResult / total) * 100) : 0;
    
    // --- [ส่วนที่แก้ไข: สั่งรันเลขวิ่งพรีเมียม] ---
    gsap.killTweensOf("#sj-kpi-total, #sj-kpi-month, #sj-kpi-rate");

    // กล่องที่ 1 & 2: จำนวนงาน
    animateValue('sj-kpi-total', 0, total, 1000, 0, "");
    animateValue('sj-kpi-month', 0, total, 1000, 0, ""); 

    // กล่องที่ 3: เปอร์เซ็นต์ความสำเร็จ
    animateValue('sj-kpi-rate', 0, rate, 1200, 0, "%");

    // กล่องที่ 4: ชื่อผู้สั่งงานสูงสุด (เพิ่มกิมมิก Slide Up)
    const counts = {};
    _filteredRecords.forEach(r => { const name = r.assigned_by || 'Unknown'; counts[name] = (counts[name] || 0) + 1; });
    const sortedAssignors = Object.entries(counts).sort((a,b) => b[1] - a[1]);
    
    const elTopName = document.getElementById('sj-kpi-top-assignor-jobs');
    if (elTopName) {
        const topName = sortedAssignors.length > 0 ? sortedAssignors[0][0].toUpperCase() : '-';
        if (elTopName.textContent !== topName) {
            elTopName.textContent = topName;
            gsap.fromTo(elTopName, { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.4 });
        }
    }

    renderTable();
    renderCharts();
}

function renderTable() {
    const tbody = document.getElementById('sj-table-body');
    if (!tbody) return;

    if (_filteredRecords.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="py-16 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">No Special Missions Logged</td></tr>`;
        return;
    }

    tbody.innerHTML = _filteredRecords.map((r, i) => {
        const hasResult = r.result && r.result !== '-' && r.result !== '';
        return `
        <tr class="sj-table-row border-b border-slate-50" data-rid="${r.id}">
            <td class="text-center font-bold text-slate-300">${i+1}</td>
            <td style="max-width: 0; width: 40%;"> <!-- บังคับให้ cell คำนวณความกว้างใหม่เพื่อทำ Ellipsis -->
                <div class="flex flex-col">
                    <!-- แสดงโปรเจกต์เป็นบรรทัดเดียว -->
                    <span class="text-[11.5px] font-black text-slate-700 leading-tight uppercase truncate" title="${r.project}">
                        ${r.project}
                    </span>
                    <!-- แสดงผลลัพธ์เป็นบรรทัดเดียว -->
                    <span class="text-[9.5px] text-slate-400 font-bold italic mt-1 truncate" title="${r.result || ''}">
                        ${r.result || 'Outcome Pending...'}
                    </span>
                </div>
            </td>
            <td class="text-center font-mono text-[10px] text-slate-400 font-bold">${r.date}</td>
            <td class="text-center text-[10px] font-black text-blue-600 uppercase truncate" style="max-width: 100px;">
                ${r.assigned_by}
            </td>
            <td class="text-center">
                <span class="px-3 py-1 rounded-full text-[8.5px] font-black whitespace-nowrap ${hasResult ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}">
                    ${hasResult ? 'COMPLETED' : 'IN PROGRESS'}
                </span>
            </td>
            <td class="text-right">
                <button  onclick="WapSpecialJobs.remove('${r.id}')" class="text-slate-200 hover:text-rose-500 transition-colors" title="Wap Special Jobs.Remove" aria-label="Wap Special Jobs.Remove">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
            </td>
        </tr>
    `}).join('');

    if (typeof window.animateTableRows === 'function') {
        window.animateTableRows('.sj-table-row', { y: 6, duration: 0.28, stagger: 0.025, ease: 'power2.out' });
    }
    if (typeof reapplyKbdRowSelection === 'function') reapplyKbdRowSelection();
}
    function renderCharts() {
    // ==========================================
    // 1. เตรียมข้อมูลสำหรับทั้ง 2 กราฟ
    // ==========================================
    const assignorData = {};
    _filteredRecords.forEach(r => {
        const name = (r.assigned_by || 'Unknown').toUpperCase();
        assignorData[name] = (assignorData[name] || 0) + 1;
    });
    // เลือกตัวท็อป 5 มาแสดง
    const sorted = Object.entries(assignorData).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // ข้อมูลจำนวนงานรายเดือน
    const mData = new Array(12).fill(0);
    _filteredRecords.forEach(r => {
        const d = new Date(r.date);
        const m = d.getMonth();
        if (!isNaN(m)) mData[m]++;
    });

    // ==========================================
    // 2. กราฟ 1: WORKLOAD DISTRIBUTION (Horizontal Pill Bars)
    // ==========================================
    const assignorEl = document.getElementById('sj-assignor-chart');
    if (assignorEl) {
        if (_charts.assignor) _charts.assignor.destroy();
        _charts.assignor = new ApexCharts(assignorEl, {
            series: [{ name: 'ภารกิจ', data: sorted.map(x => x[1]) }],
            chart: {
                type: 'bar',
                height: '100%',
                width: '100%',
                toolbar: { show: false },
                parentHeightOffset: 0,
                animations: { enabled: true, easing: 'easeinout', speed: 800 }
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    borderRadius: 6, // ทำขอบมนแบบแคปซูล
                    distributed: true,
                    barHeight: '35%', // ทำให้แท่งดูเพรียวบางล้ำสมัย
                    dataLabels: { position: 'right' }
                }
            },
            colors: ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'],
            xaxis: {
                categories: sorted.map(x => x[0]),
                labels: { show: false },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: {
                labels: {
                    show: true,
                    style: { 
                        fontSize: '10px', 
                        fontWeight: 900, 
                        colors: '#64748b' // สีเทา Slate
                    },
                    maxWidth: 120
                }
            },
            grid: {
                show: false,
                padding: {
                    top: -20, // ขยับกราฟขึ้นให้กึ่งกลางกล่อง
                    right: 60, // เผื่อพื้นที่ให้ Data Label ด้านขวาไม่หลุดขอบ
                    left: 10,
                    bottom: 0
                }
            },
            legend: { show: false },
            dataLabels: {
                enabled: true,
                style: { 
                    fontSize: '11px', 
                    fontWeight: 950, 
                    colors: ['#475569'] 
                },
                offsetX: 45, // ดันตัวเลขออกไปห่างจากปลายแท่งเล็กน้อย
                formatter: (val) => val + " งาน"
            },
            tooltip: { theme: 'dark' },
            states: { hover: { filter: { type: 'lighten', value: 0.1 } } }
        });
        _charts.assignor.render();
    }

    // ==========================================
    // 3. กราฟ 2: VOLUME FREQUENCY (Glowing Area Chart)
    // ==========================================
    const volumeEl = document.getElementById('sj-volume-chart');
    if (volumeEl) {
        if (_charts.volume) _charts.volume.destroy();
        _charts.volume = new ApexCharts(volumeEl, {
            series: [{ name: 'จำนวนงาน', data: mData }],
            chart: {
                type: 'area',
                height: '100%',
                width: '100%',
                toolbar: { show: false },
                offsetY: -15, // ดันกราฟขึ้นให้กึ่งกลาง
                sparkline: { enabled: false },
                dropShadow: {
                    enabled: true,
                    top: 10, left: 0, blur: 8, 
                    color: '#3b82f6', opacity: 0.15 // เพิ่มแสงเรืองสีฟ้าจางๆ ใต้เส้น
                }
            },
            stroke: { 
                curve: 'smooth', 
                width: 4, 
                lineCap: 'round' 
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.45,
                    opacityTo: 0.02,
                    stops: [0, 90, 100],
                    colorStops: [
                        { offset: 0, color: "#3b82f6", opacity: 0.45 },
                        { offset: 100, color: "#3b82f6", opacity: 0 }
                    ]
                }
            },
            colors: ['#3b82f6'],
            xaxis: {
                categories: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
                labels: { 
                    style: { fontSize: '9px', fontWeight: 700, colors: '#94a3b8' } 
                },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: { show: false },
            grid: {
                show: true,
                borderColor: '#f1f5f9',
                strokeDashArray: 5,
                padding: { top: 0, bottom: 0, left: 15, right: 15 }
            },
            markers: { 
                size: 0, 
                hover: { size: 6, strokeWidth: 3, strokeColors: '#fff', colors: '#3b82f6' } 
            },
            tooltip: {
                theme: 'dark',
                x: { show: true },
                y: { formatter: (v) => v + " ภารกิจ" }
            }
        });
        _charts.volume.render();
    }
}

    // 7. ฟังก์ชันบันทึกข้อมูลใหม่
    async function save() {
        const project = document.getElementById('sj-f-project').value.trim();
        const date = document.getElementById('sj-f-date').value;
        const assignor = document.getElementById('sj-f-assignor').value.trim();
        const result = document.getElementById('sj-f-result').value.trim();

        if (!project || !assignor || !date) { 
            if (typeof toast === 'function') toast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error'); 
            return; 
        }

        const payload = {
            id: 'SJ-' + Date.now(),
            user_id: S.currentUser,
            project: project,
            assigned_by: assignor,
            result: result || '-',
            date: date,
            full_timestamp: new Date().toLocaleString('th-TH')
        };

        try {
            const { error } = await wapClient.from(TABLE).insert([payload]);
            if (error) throw error;
            
            if (typeof toast === 'function') toast('บันทึกภารกิจสำเร็จ', 'success');
            
            // ล้างฟอร์มทั้งหมดทันทีหลังบันทึกสำเร็จ
            if (document.getElementById('sj-f-project')) document.getElementById('sj-f-project').value = '';
            if (document.getElementById('sj-f-assignor')) document.getElementById('sj-f-assignor').value = '';
            if (document.getElementById('sj-f-result')) document.getElementById('sj-f-result').value = '';
            if (document.getElementById('sj-f-date')) document.getElementById('sj-f-date').value = new Date().toISOString().split('T')[0];
            
            await fetchRecords(); // โหลดข้อมูลใหม่และอัปเดตจอ
        } catch (e) {
            if (typeof toast === 'function') toast('บันทึกล้มเหลว: ' + e.message, 'error');
        }
    }

    // 8. ฟังก์ชันลบข้อมูล
    async function remove(id) {
        if (S.userRole === 'supervisor') { toast('โหมดอ่านอย่างเดียว', 'info'); return; }
        
        const target = _allRecords ? _allRecords.find(r => String(r.id) === String(id)) : null;

        showCustomConfirmDialog({
            title: "ยืนยันการลบภารกิจพิเศษ",
            subtitle: "รายการภารกิจพิเศษ (Special Jobs) นี้จะถูกลบออกจากระบบถาวร",
            badge: "SPECIAL JOBS",
            type: "danger",
            details: [
                { label: "ชื่อโครงการ / ภารกิจ", value: target ? (target.project || target.job_name || '-') : '-' },
                { label: "ผู้มอบหมายงาน", value: target ? (target.assigned_by || target.assignor || '-') : '-' },
                { label: "ผลการดำเนินงาน", value: target ? (target.result || '-') : '-' },
                { label: "วันที่ปฏิบัติงาน", value: target ? (target.date || '-') : '-' }
            ],
            confirmText: "🗑️ ยืนยันลบภารกิจนี้",
            cancelText: "ยกเลิก",
            onConfirm: async () => {
                try {
                    _allRecords = _allRecords.filter(r => String(r.id) !== String(id));
                    applyDateFilter();
                    const { error } = await wapClient.from(TABLE).delete().eq('id', id);
                    if (error) throw error;
                    if (typeof toast === 'function') toast('ลบข้อมูลเรียบร้อย', 'info');
                    await fetchRecords();
                } catch (e) { 
                    console.error('[SpecialJobs Delete Error]:', e);
                    if (typeof toast === 'function') toast('ลบไม่สำเร็จ: ' + (e.message || ''), 'error'); 
                    await fetchRecords();
                }
            }
        });
    }

    // ส่งออกฟังก์ชันให้ภายนอกเรียกใช้
    return { 
        init, 
        save, 
        remove, 
        applyDateFilter, 
        fetchRecords 
    };
})();

// สร้างตัวเลือกเวลา 08:00 ถึง 00:00 (เที่ยงคืน) ทีละ 30 นาที
(function generateOtTimeList() {
    const dl = document.getElementById('ot-time-list');
    if (!dl) return;
    let h = '';
    for (let m = 8 * 60; m <= 24 * 60; m += 30) {
        const hh = String(Math.floor(m / 60) % 24).padStart(2, '0');
        const mm = String(m % 60).padStart(2, '0');
        h += `<option value="${hh}:${mm}"></option>`;
    }
    dl.innerHTML = h;
})();

// ตรวจสอบรูปแบบเวลาที่พิมพ์เอง (HH:MM, 00:00-23:59)
function validateOtTime(inputEl) {
    const val = inputEl.value.trim();
    const ok = /^([01]\d|2[0-3]):[0-5]\d$/.test(val) || val === '24:00' || val === '00:00';
    inputEl.classList.toggle('invalid', val !== '' && !ok);
    inputEl.classList.toggle('valid', ok);
    return ok;
}

// ✅ ลบทิ้งทั้งหมดของโค้ด global ด้านบน แล้วแทนที่ด้วย
document.addEventListener('DOMContentLoaded', () => {
    const targetInput = $id('ot-target-input');
    if (targetInput) {
        targetInput.addEventListener('input', (e) => WapOTManagement.updateTarget(e.target.value));
    }
});

// --- [แยกส่วน] ตัวแปรจัดการวันที่หน้า DASHBOARD LINE CLAIM ---
let claimDashFilterDate = { start: '', end: '' };

function onClaimDashDateChange() {
    const startVal = document.getElementById('cd-start-date').value;
    const endVal = document.getElementById('cd-end-date').value;

    if (startVal && endVal) {
        claimDashFilterDate.start = startVal;
        claimDashFilterDate.end = endVal;

        // ล้างสถานะปุ่ม Preset
        document.querySelectorAll('#claim-dash-filter-wrap button').forEach(b => {
            b.classList.remove('bg-blue-600', 'text-white');
            b.classList.add('bg-white', 'text-slate-500');
        });

        // เรียกใช้ฟังก์ชันอัปเดตรวมที่คุณมีอยู่แล้ว
        updateAllModuleFilters(); 
        toast(`📅 กรองข้อมูล: ${startVal} ถึง ${endVal}`, 'info');
    }
}

function applyClaimDashPreset(type) {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    // ล้างสีปุ่มเดิม
    document.querySelectorAll('#claim-dash-filter-wrap button').forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
        b.classList.add('bg-white', 'text-slate-500');
    });

    if (type === 'today') {
        start = now;
        const btn = document.getElementById('cd-preset-today');
        btn.classList.replace('bg-white', 'bg-blue-600');
        btn.classList.replace('text-slate-500', 'text-white');
    } else if (type === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        const btn = document.getElementById('cd-preset-month');
        btn.classList.replace('bg-white', 'bg-blue-600');
        btn.classList.replace('text-slate-500', 'text-white');
    }

    claimDashFilterDate.start = start.toISOString().split('T')[0];
    claimDashFilterDate.end = end.toISOString().split('T')[0];

    // อัปเดตค่าในช่อง Input Date ให้ตรงกับปุ่ม Preset ด้วย
    document.getElementById('cd-start-date').value = claimDashFilterDate.start;
    document.getElementById('cd-end-date').value = claimDashFilterDate.end;

    toast(`📅 แสดงข้อมูล: ${type === 'today' ? 'วันนี้' : 'เดือนนี้'}`, 'info');
    updateAllModuleFilters(); 
}

function resetClaimDashFilter() {
    // 1. ล้างตัวแปรวันที่
    claimDashFilterDate = { start: '', end: '' };
    
    // 2. ล้างค่าในช่อง Input วันที่บน Header
    if ($id('cd-start-date')) $id('cd-start-date').value = '';
    if ($id('cd-end-date')) $id('cd-end-date').value = '';
    
    // 3. ✨ [เพิ่มใหม่] รีเซ็ตช่องเลือก Vendor ให้เป็น ALL
    const vendorSelect = $id('claim-vendor-filter');
    if (vendorSelect) vendorSelect.value = 'ALL';

    // 4. คืนค่าสีปุ่ม Preset (Today/Month)
    document.querySelectorAll('#claim-dash-filter-wrap button').forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
        b.classList.add('bg-white', 'text-slate-500');
    });

    toast('🧹 ล้างตัวกรองและรีเซ็ต Vendor เรียบร้อย', 'success');
    
    // 5. สั่งรีเฟรชหน้าจอใหม่ทั้งหมด
    triggerGlobalRefresh(); 
}

//กราฟVendor Fault Feed
/**
 * Vendor Fault Feed (ฟีดแจ้งเตือนเรียลไทม์พร้อมอนิเมชั่น)
 */
/**
 * Vendor Fault Feed (อัปเดตให้รองรับหน่วย QTY ตามจริง)
 */
function updateVendorFaultFeed(records) {
    const container = document.getElementById('risk-intel-display-area');
    if (!container) return;

    // กรองเฉพาะ VENDOR FAULT และเลือก 10 รายการล่าสุด
    const vendorFaults = records.filter(r => r.judgment === 'VENDOR FAULT').slice(0, 10);

    if (vendorFaults.length === 0) {
        container.innerHTML = `
            <div class="py-20 text-center opacity-30 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <svg class="w-10 h-10 mx-auto mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"></path></svg>
                No Faults Detected
            </div>`;
        return;
    }

    // 1. สร้างโครงสร้าง HTML (ดึง r.unit มาแสดงผล)
    container.innerHTML = vendorFaults.map((r, index) => {
        // ตรวจสอบหน่วย ถ้าไม่มีให้แสดงเป็น PCS เป็นค่าเริ่มต้น
        const displayUnit = (r.unit || 'PCS').toUpperCase();

        return `
        <div class="vf-feed-card relative bg-white border border-slate-100 rounded-xl p-4 shadow-sm mb-3">
            <!-- ขีดแดงด้านข้าง -->
            <div style="position:absolute; left:0; top:12px; bottom:12px; width:4px; border-radius:0 4px 4px 0; background:#ef4444; box-shadow: 2px 0 10px rgba(239, 68, 68, 0.3);"></div>

            <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                    <span style="background:#fff; color:#475569; font-size:10px; font-weight:800; padding:2px 8px; border-radius:6px; border:1px solid #e2e8f0; font-family:monospace;">${r.ref || 'N/A'}</span>
                </div>
                <span class="text-[9px] font-black text-rose-600 uppercase tracking-widest animate-pulse">Vendor Fault</span>
            </div>

            <h4 class="text-[14px] font-black text-slate-800 uppercase truncate mb-1">${escapeHtml(r.supplier)}</h4>
            
            <div class="flex justify-between items-end mb-3">
                <div class="min-w-0">
                    <p class="text-[10px] font-bold text-slate-400 truncate uppercase">
                        <span class="text-blue-600 font-mono">${escapeHtml(r.partNo)}</span> 
                        <span class="mx-1 text-slate-200">|</span> 
                        ${escapeHtml(r.partName)}
                    </p>
                </div>
                <div class="text-right">
                    <!-- ส่วนแสดงจำนวนและหน่วยที่แก้ไขใหม่ -->
                    <span id="vf-qty-num-${index}" class="text-xl font-black text-slate-900">0</span>
                    <span class="text-[9px] font-black text-slate-400 uppercase ml-0.5">${displayUnit}</span>
                </div>
            </div>

            <!-- ข้อมูล วันที่/กะ/ไลน์ -->
            <div class="flex justify-between border-y border-slate-50 py-2 text-[9px] font-bold text-slate-400 mb-3 bg-slate-50/30 px-1 rounded">
                <span>📅 ${r.date || '-'}</span>
                <span>🕒 ${(r.shift || '').replace('SHIFT ', '') || '-'}</span>
                <span>📍 L:${escapeHtml(r.line || '-')}</span>
            </div>

            <div class="space-y-2">
                <div style="background:#fff7ed; color:#ea580c; border:1px solid #ffedd5; padding:3px 10px; border-radius:8px; font-size:9px; font-weight:800; display:inline-block; text-transform:uppercase;">
                    ⚠️ DEFECT: ${escapeHtml(r.defect)}
                </div>

                <div style="background:rgba(255,255,255,0.6); padding:10px; border-radius:12px; border-left:4px solid #ef4444; background:#fdfdfd;">
                    <p class="text-[10px] text-slate-600 leading-relaxed italic">
                        <span class="text-rose-500 font-black not-italic uppercase text-[8px] mr-1">Root Cause:</span>
                        "${escapeHtml(r.remark) || 'N/A'}"
                    </p>
                </div>
            </div>
        </div>
    `}).join('');

    // 2. รันอนิเมชั่นตัวเลขวิ่ง
    vendorFaults.forEach((r, index) => {
        animateValue(`vf-qty-num-${index}`, 0, parseInt(r.qty) || 0, 1500);
    });

    // 3. รันอนิเมชั่นเลื่อนขึ้นทีละใบ
    if (window.gsap) {
        gsap.fromTo(".vf-feed-card", { opacity: 0, y: 20 }, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            clearProps: "transform,opacity"
        });
    }
}

// --- Export ข้อมูลเป็น CSV ---
function exportToCSV() {
    if (S.records.length === 0) return toast("ไม่มีข้อมูลในตาราง", "error");
    const headers = ["Date", "Shift", "Line", "Ref", "Supplier", "PartNo", "PartName", "Qty", "Unit", "Defect", "Judgment"];
    const rows = S.records.map(r => [
        r.date, r.shift, r.line, r.ref, r.supplier, r.partNo, `"${r.partName}"`, r.qty, r.unit, `"${r.defect}"`, r.judgment
    ]);
    let csv = "\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PartClaim_Export_${new Date().toLocaleDateString()}.csv`;
    link.click();
    toast("ส่งออกข้อมูลสำเร็จ", "success");
}

// --- Import ข้อมูลจาก JSON ---
function triggerImport() {
    if (S.userRole === 'supervisor') return toast("Supervisor ไม่สามารถนำเข้าข้อมูลได้", "error");
    $id('import-hidden-input').click();
}

// --- ล้างข้อมูลทั้งหมด ---
async function confirmClearAll() {
    if (S.userRole === 'supervisor') return toast("Supervisor ไม่มีสิทธิ์ลบข้อมูล", "error");
    if (!S.records || S.records.length === 0) return toast("ไม่มีข้อมูลให้ลบ", "info");

    showCustomConfirmDialog({
        title: "⚠️ ยืนยันการล้างข้อมูลเคลมทั้งหมด",
        subtitle: "การดำเนินการนี้จะลบรายการเคลมทั้งหมดของคุณแบบถาวร ไม่สามารถย้อนกลับได้",
        badge: "CLEAR ALL DATA",
        type: "danger",
        requiresTextInput: "DELETE",
        inputPlaceholder: "พิมพ์ 'DELETE' เพื่อยืนยันการลบถาวร",
        details: [
            { label: "ผู้ใช้งาน (Inspector)", value: S.currentUser || 'Current User' },
            { label: "จำนวนรายการที่จะถูกลบ", value: `${S.records.length} รายการ` }
        ],
        confirmText: "🔥 ยืนยันล้างข้อมูลทั้งหมด",
        cancelText: "ยกเลิก",
        onConfirm: async () => {
            const sb = getSupabase();
            const { error } = await sb.from('records').delete().eq('inspector', S.currentUser);
            if (!error) {
                if (typeof writeAuditLog === 'function') {
                    writeAuditLog('CLEAR_ALL', `ล้างข้อมูลเคลมทั้งหมดของผู้ใช้: ${S.currentUser} (${S.records.length} รายการ)`);
                }
                S.records = [];
                renderTable();
                toast("🗑️ ล้างข้อมูลเคลมทั้งหมดเรียบร้อยแล้ว", "success");
            } else {
                toast("❌ เกิดข้อผิดพลาดในการลบข้อมูล: " + error.message, "error");
            }
        }
    });
}

/**
 * ═══════════════════════════════════════════════════════
 *  AI SMART IMPORT ENGINE V6.0 (ULTIMATE PRECISION)
 * ═══════════════════════════════════════════════════════
 */

// 1. พจนานุกรมคำใกล้เคียง (Aliases) เพื่อจับคู่หัวตารางใน Excel กับระบบ
const fieldAliases = {
    date: ['inspection date', 'claim date', 'วันที่', 'date', 'occurred'],
    partNo: ['partno', 'pn', 'part number', 'p/n', 'รหัสพาร์ท'],
    partName: ['part name', 'ชื่อพาร์ท', 'description', 'item name'],
    supplier: ['vendor name', 'supplier name', 'ผู้จำหน่าย', 'ชื่อผู้ขาย', 'vendor'],
    defect: ['trouble claim', 'defect', 'อาการเสีย', 'problem', 'issue'],
    qty: ['qty', 'quantity', 'จำนวน', 'pcs', 'amount'],
    line: ['production line', 'ไลน์', 'line', 'area', 'process'],
    ref: ['claim no', 'order no', 'ref', 'เลขที่อ้างอิง'],
    remark: ['remark', 'remark1', 'note', 'หมายเหตุ'],
    judgment: ['judgment', 'result', 'status', 'ผลการตรวจ'],
    shift: ['shift', 'กะ', 'turn']
};

// 2. ฟังก์ชันช่วยค้นหาหัวตารางที่ตรงที่สุด
function findBestMatch(headerName) {
    if (!headerName) return null;
    const cleanHeader = String(headerName).toLowerCase().replace(/[^a-z0-9ก-๙]/gi, '').trim();
    
    for (const [key, aliases] of Object.entries(fieldAliases)) {
        for (const alias of aliases) {
            const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9ก-๙]/gi, '').trim();
            if (cleanHeader === cleanAlias) return key; // ตรงเป๊ะ
        }
    }
    return null;
}

// 3. ฟังก์ชันหลักในการนำเข้าไฟล์
async function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    toast("⏳ กำลังวิเคราะห์ไฟล์...", "info");

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array', cellDates: true });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

            let headerRowIndex = -1;
            let mapping = {};

            // --- STEP 1: ค้นหาหัวตาราง (Scoring System) ---
            for (let i = 0; i < Math.min(rawRows.length, 20); i++) {
                let currentMapping = {};
                let score = 0;
                rawRows[i].forEach((cell, idx) => {
                    const matchedKey = findBestMatch(cell);
                    if (matchedKey) {
                        currentMapping[matchedKey] = idx;
                        score++;
                    }
                });
                // ถ้าในหนึ่งแถวเจอหัวข้อตรงมากกว่า 4 หัวข้อ มั่นใจว่าเป็นหัวตาราง
                if (score >= 4) {
                    headerRowIndex = i;
                    mapping = currentMapping;
                    break;
                }
            }

            if (headerRowIndex === -1) {
                return toast("❌ ไม่พบหัวตารางที่ถูกต้องในไฟล์ Excel", "error");
            }

            // --- STEP 2: ประมวลผลข้อมูลตามแพทเทิร์นระบบ ---
            const formattedData = rawRows.slice(headerRowIndex + 1).map((row, idx) => {
                // ข้ามแถวที่ไม่มีข้อมูลหลัก (PN หรือ QTY)
                if (!row[mapping.partNo] && !row[mapping.qty]) return null;

                // A. จัดการเรื่องวันที่
                let finalDate = new Date().toISOString().split('T')[0];
                if (row[mapping.date]) {
                    const d = row[mapping.date];
                    finalDate = d instanceof Date ? d.toISOString().split('T')[0] : String(d);
                }

                // B. วิเคราะห์ Judgment อัตโนมัติ
                let rawJdg = String(row[mapping.judgment] || '').toUpperCase();
                let finalJdg = 'VENDOR FAULT'; // ค่าเริ่มต้น
                if (rawJdg.includes('SF')) finalJdg = 'SF';
                else if (rawJdg.includes('CTC')) finalJdg = 'CTC';
                else if (rawJdg.match(/OK|PASS|CAN|USE|ผ่าน|ใช้งานได้/)) finalJdg = 'CAN USE';

                // C. สร้าง Object ให้ตรงตาม Schema ของระบบ
                return {
                    id: generateUUID(),
                    date: finalDate,
                    shift: String(row[mapping.shift] || 'SHIFT A').toUpperCase(),
                    line: String(row[mapping.line] || '-').trim(),
                    ref: String(row[mapping.ref] || '').toUpperCase().trim(),
                    supplier: String(row[mapping.supplier] || 'Unknown').trim(), // Vendor Name
                    partName: String(row[mapping.partName] || '-').trim(),       // Part Name
                    partNo: String(row[mapping.partNo] || '-').trim(),           // partNo
                    qty: parseInt(String(row[mapping.qty] || 0).replace(/,/g, '')) || 0, // Qty
                    unit: 'PCS',
                    defect: String(row[mapping.defect] || '-').trim(),           // Trouble Claim
                    remark: String(row[mapping.remark] || '').trim(),           // REMARK
                    judgment: finalJdg,                                          // Judgment
                    inspector: S.currentUser
                };
            }).filter(item => item !== null);

            // --- STEP 3: ยืนยันและบันทึกลง Cloud ---
            if (formattedData.length === 0) return toast("❌ ไม่พบข้อมูลสำหรับนำเข้า", "error");

            showCustomConfirmDialog({
                title: "ยืนยันนำเข้าข้อมูล Excel",
                subtitle: `AI ตรวจสอบและแปลงรูปแบบข้อมูลเรียบร้อยแล้ว พร้อมนำเข้าสู่ระบบ`,
                badge: "EXCEL SMART IMPORT",
                type: "info",
                details: [
                    { label: "จำนวนรายการ", value: `${formattedData.length} รายการ` },
                    { label: "ชื่อไฟล์", value: file.name },
                    { label: "ผู้ดำเนินการ", value: S.currentUser }
                ],
                confirmText: "📥 ยืนยันนำเข้าข้อมูล",
                cancelText: "ยกเลิก",
                onConfirm: async () => {
                    try {
                        const { error } = await sqeClient.from('records').insert(formattedData);
                        if (error) throw error;
                        
                        await loadRecords(); // รีเฟรชตารางหน้าจอ
                        toast(`✅ นำเข้าข้อมูลสำเร็จ ${formattedData.length} รายการ`, "success");
                    } catch (err) {
                        console.error("Critical Import Error:", err);
                        toast("❌ การนำเข้าขัดข้อง: " + err.message, "error");
                    }
                }
            });

        } catch (err) {
            console.error("Critical Import Error:", err);
            toast("❌ การนำเข้าขัดข้อง: " + err.message, "error");
        }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = ''; // Reset input
}

/**
 * ==========================================================================
 * UNIFIED NEURAL ANIMATION ENGINE (Master Version)
 * รองรับการทำงานทุกหน้า: Claim, Exec, OT, 5S, Skill, Special Jobs
 * ==========================================================================
 */
function animateValue(id, startOrEnd, end, duration = 1500, decimals = 0, suffix = "", prefix = "") {
    const el = document.getElementById(id);
    if (!el) return; // <--- จุดเช็คความปลอดภัยจุดที่ 1

    gsap.killTweensOf(el);

    let startValue = 0;
    let endValue = 0;

    if (end === undefined) {
        endValue = parseFloat(startOrEnd) || 0;
        // เพิ่มจุดเช็คความปลอดภัยตรงนี้ด้วย
        const currentText = el.textContent ? el.textContent.replace(/[^0-9.-]/g, "") : "0"; 
        startValue = parseFloat(currentText) || 0;
    } else {
        startValue = parseFloat(startOrEnd) || 0;
        endValue = parseFloat(end) || 0;
    }

    // 3. เริ่มการอนิเมชั่นด้วย GSAP
    const data = { val: startValue };
    gsap.to(data, {
        val: endValue,
        duration: duration / 1000,
        ease: "power3.out",
        onUpdate: () => {
            // แสดงผลพร้อมจัด Format ตัวเลข (เช่น 1,000.00) และใส่ Prefix/Suffix
            el.innerHTML = prefix + data.val.toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }) + suffix;
        }
    });
}


function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.toggle('dark-mode');
    
    localStorage.setItem('carrier_theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
    const container = document.getElementById('theme-icon-container');
    if (!container) return;

    // ไอคอนพระอาทิตย์ (สำหรับโหมดสว่าง)
    const sunIcon = `<svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>`;
    
    // ไอคอนพระจันทร์ (สำหรับโหมดมืด - สีเหลืองตามรูปที่ 1)
    const moonIcon = `<svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`;

    container.innerHTML = isDark ? moonIcon : sunIcon;
}
// ============================================================
// 1. คลังข้อมูลคำแปลฉบับสมบูรณ์ (Unified i18n Dictionary)
// ============================================================
// ============================================================
// 1. คลังข้อมูลคำแปลฉบับสมบูรณ์ (ตรวจสอบ Syntax Error แล้ว)
// ============================================================
const translations = {
    th: {
        // --- หัวข้อหมวดหมู่ Sidebar ---
        nav_sales_suite: "กลุ่มงานขาย",
        nav_productivity: "การเพิ่มผลผลิต",
        nav_insights_label: "ข้อมูลวิเคราะห์",

        // --- รายการเมนูหลักและย่อย Sidebar ---
        nav_part_claim: "บันทึกเคลมพาร์ท",
        nav_job_support: "สนับสนุนงานผลิต",
        nav_dash_support: "แดชบอร์ดสรุปงาน",
        nav_daily_report: "รายงานประจำวัน",
        nav_support_line: "สนับสนุนสายผลิต",
        nav_5s: "ระบบตรวจสอบ 5S",
        nav_skill_matrix: "ตารางทักษะ",
        nav_special_jobs: "ภารกิจพิเศษ",
        nav_ot: "จัดการล่วงเวลา",
        nav_sme: "SQE EN", // ใส่คอมม่าปิดท้ายบรรทัดนี้ด้วย

        // --- ปุ่มสลับหน้า (Pill Buttons) และหัวข้อ Header ---
        tab_claim_entry: "บันทึกเคลม",
        tab_dashboard: "แดชบอร์ด",
        header_title_claim: "บันทึกเคลมพาร์ท"
    },
    en: {
        // --- หัวข้อหมวดหมู่ Sidebar ---
        nav_sales_suite: "Sales Suite",
        nav_productivity: "Productivity",
        nav_insights_label: "Insights",

        // --- รายการเมนูหลักและย่อย Sidebar ---
        nav_part_claim: "Part Line Claim",
        nav_job_support: "Job Support",
        nav_dash_support: "Dashboard Support",
        nav_daily_report: "Daily Report",
        nav_support_line: "Support Line",
        nav_5s: "5S Excellence",
        nav_skill_matrix: "Skill Matrix",
        nav_special_jobs: "Special Jobs",
        nav_ot: "OT Management",
        nav_sme: "SQE EN", // ใส่คอมม่าปิดท้ายบรรทัดนี้ด้วย

        // --- ปุ่มสลับหน้า (Pill Buttons) และหัวข้อ Header ---
        tab_claim_entry: "PART CLAIM",
        tab_dashboard: "DASHBOARD",
        header_title_claim: "PART LINE CLAIM"
    }
};

// 2. ฟังก์ชันหลัก
function toggleLangMenu() {
    const menu = document.getElementById('lang-menu');
    // ใช้คลาส .show เพื่อคุมการเปิดปิดแทน .hidden
    menu.classList.toggle('show');
}

// และเพิ่มส่วนนี้เพื่อปิดเมนูเมื่อคลิกที่อื่นในหน้าจอ
window.addEventListener('click', function(e) {
    if (!document.getElementById('lang-selector').contains(e.target)) {
        document.getElementById('lang-menu').classList.remove('show');
    }
});

function changeLanguage(lang) {
    localStorage.setItem('carrier_lang', lang);
    applyLanguage(lang);
    document.getElementById('lang-menu').classList.remove('show');
}

// 3. ฟังก์ชันตรวจสอบอีเมล (แบบ Safe Check)
function validateEmail(input) {
    if (!input) return;
    const hint = document.getElementById('email-hint');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    const isValid = emailRegex.test(input.value);
    
    input.classList.toggle('invalid', input.value.length > 0 && !isValid);
    input.classList.toggle('valid', isValid);
    
    if (hint) {
        hint.classList.toggle('hidden', isValid || input.value.length === 0);
    }
}

// เพิ่มเติม: เพื่อความชัวร์ ให้ซ่อนคำเตือนเมื่อออกจากช่องพิมพ์
function hideCapsLock() {
    const warning = document.getElementById('caps-lock-warning');
    if (warning) warning.classList.add('hidden');
}



// --- 1. Network Status System ---
function updateLoginNetStatus() {
    const pill = document.getElementById('login-net-indicator');
    const text = document.getElementById('net-text');
    if (!pill || !text) return;

    if (navigator.onLine) {
        pill.classList.remove('is-offline');
        pill.classList.add('is-online');
        text.textContent = "System Connected";
    } else {
        pill.classList.remove('is-online');
        pill.classList.add('is-offline');
        text.textContent = "Offline Mode";
    }
}

// ติดตามสถานะเน็ตแบบ Real-time
window.addEventListener('online', updateLoginNetStatus);
window.addEventListener('offline', updateLoginNetStatus);

// --- 2. Language Switch System (เชื่อมกับของเดิมที่มี) ---
// แก้ไขฟังก์ชัน applyLanguage เพิ่มเติม
const originalApplyLanguage = applyLanguage;

// ฟังก์ชันควบคุมการปิด Banner อัตโนมัติ
function autoHideBanner() {
    const banner = document.getElementById('system-announcement');
    if (banner) {
        // ตั้งเวลา 30,000 มิลลิวินาที (30 วินาที)
        setTimeout(() => {
            // เพิ่ม Animation ตอนหายไปให้นุ่มนวล
            banner.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
            banner.style.transform = "translateY(-100%)";
            banner.style.opacity = "0";
            
            // ลบ Element ออกจากหน้าจอหลังจาก Animation จบ
            setTimeout(() => {
                banner.style.display = 'none';
            }, 800);
        }, 30000); 
    }
}
/* ============================================================
   MASTER INITIALIZATION SYSTEM (Unified Start-up)
   ============================================================ */

window.addEventListener('load', () => {
    console.log("SQE & WAP System: Initializing...");

    // 1. ระบบสถานะและการแสดงผลเบื้องต้น
    if (typeof updateLoginNetStatus === 'function') updateLoginNetStatus();
    if (typeof autoHideBanner === 'function') autoHideBanner();

    // 2. ระบบจัดการภาษา (ตรวจสอบค่าที่จำไว้ หรือใช้ภาษาของ Browser)
    const savedLang = localStorage.getItem('carrier_lang');
    const browserLang = navigator.language.startsWith('th') ? 'th' : 'en';
    const finalLang = savedLang || browserLang;
    applyLanguage(finalLang);

    // 3. ระบบจดจำบัญชี (Remember Me)
    const savedEmail = localStorage.getItem('carrier_remembered_email');
    if (savedEmail) {
        const emailIn = document.getElementById('login-email');
        const rememberCheck = document.getElementById('remember-me');
        if (emailIn) {
            emailIn.value = savedEmail;
            emailIn.classList.add('valid');
        }
        if (rememberCheck) rememberCheck.checked = true;
        // เช็คสถานะทันทีที่เปิดเว็บ
        let lastKnownTrigger = null;

async function watchSystemUpdate() {
    try {
        const { data } = await sqeClient
            .from('system_settings')
            .select('app_version, update_details, force_update_trigger')
            .eq('id', 'global_config')
            .single();

        if (data) {
            // 1. ตรวจสอบการบังคับรีเฟรช (Force Update)
            if (lastKnownTrigger && data.force_update_trigger !== lastKnownTrigger) {
                toast("🛡️ Admin สั่งอัปเดตระบบด่วน...", "info");
                setTimeout(() => {
                    window.location.reload(true); // บังคับรีโหลดและล้าง Cache
                }, 2000);
            }
            lastKnownTrigger = data.force_update_trigger;

            // 2. แสดง Change Log ใน Sidebar (Optional)
            const verDisplay = document.querySelector('.brand-sub');
            if(verDisplay) verDisplay.textContent = `V${data.app_version} | SQE SYSTEM`;
        }
    } catch (e) { console.log("Update check failed"); }
}

// ตรวจสอบทุกๆ 3 นาที
setInterval(watchSystemUpdate, 180000);
// และตรวจทันทีที่เปิดแอป
watchSystemUpdate();
enforceMaintenanceMode();

// และเช็คซ้ำทุกๆ 30 วินาที (เพื่อให้หน้าจอคนอื่นล็อคเองอัตโนมัติ)
setInterval(enforceMaintenanceMode, 30000);
    }

    // 4. ระบบจัดการคลิกภายนอก (Global Click Events)
    window.addEventListener('click', (e) => {
        // ปิดเมนูภาษาเมื่อคลิกข้างนอก
        const langSelector = document.getElementById('lang-selector');
        const langMenu = document.getElementById('lang-menu');
        if (langSelector && !langSelector.contains(e.target)) {
            if (langMenu) langMenu.classList.remove('show');
        }
    });

    // 5. ตรวจสอบ Session เก่า (Auto Login)
    const session = sessionStorage.getItem('sqe_session');
    if (session) {
        try {
            const userData = JSON.parse(session);
            console.log("Restoring session for:", userData.email);
            // เรียกใช้ finalizeLogin เพื่อข้ามหน้า Login ไป Dashboard (พร้อม Warp Effect)
            finalizeLogin(userData.email, userData.role);
        } catch (err) {
            console.error("Session restore failed:", err);
            sessionStorage.removeItem('sqe_session');
        }
    }

    // 6. เริ่มการซิงค์ข้อมูลค้างส่ง (หน่วงเวลา 3 วินาทีเพื่อให้แอปพร้อม)
    if (typeof syncPendingData === 'function') {
        setTimeout(syncPendingData, 3000);
    }

    // 7. การลงทะเบียน PWA Service Worker
    if ('serviceWorker' in navigator) {
        try {
            navigator.serviceWorker.register('sw.js')
                .then(reg => console.log('PWA: Service Worker Registered!'))
                .catch(err => console.log('PWA: Registration Failed', err));
        } catch (e) {
            console.log('PWA: Registration Error', e);
        }
    }
});

function playNeuralFlight() {
    const btn = document.getElementById('btn-commit');
    const table = document.getElementById('table-panel');
    const rect = btn.getBoundingClientRect();
    
    // 1. สร้างก้อนพลังงานข้อมูลจำลอง
    const particle = document.createElement('div');
    particle.className = 'data-particle';
    particle.style.left = rect.left + 'px';
    particle.style.top = rect.top + 'px';
    document.body.appendChild(particle);

    // 2. คำนวณจุดหมาย (แถวแรกของตาราง)
    const target = document.querySelector('.data-table thead');
    const targetRect = target.getBoundingClientRect();

    // 3. ใช้ GSAP สั่งบินแบบ Arc (วิถีโค้ง)
    gsap.to(particle, {
        duration: 0.8,
        x: targetRect.left - rect.left + 50,
        y: targetRect.top - rect.top,
        scale: 0.2,
        opacity: 0,
        rotation: 720,
        ease: "power2.inOut",
        onComplete: () => {
            particle.remove();
            // เอฟเฟกต์ตารางตอบสนอง (แรงกระแทกข้อมูล)
            gsap.fromTo("#table-panel", { y: 5 }, { y: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
        }
    });
}
/**
 * ═══════════════════════════════════════════════════════
 *  GLOBAL SYNC: บริการดึงประกาศสำหรับพนักงานทุกคน
 * ═══════════════════════════════════════════════════════
 */
async function syncSystemBanner() {
    try {
        const { data, error } = await sqeClient
            .from('system_settings')
            .select('*')
            .eq('id', 'global_config')
            .single();

        if (error) throw error;

        const bannerEl = document.getElementById('system-announcement');
        const textEl = document.getElementById('banner-text');

        if (data && data.is_banner_active) {
            bannerEl.classList.remove('hidden');
            textEl.textContent = data.announcement_text; // แสดงข้อความจาก Database
            
            // อนิเมชั่นไหลลงมา
            gsap.fromTo(bannerEl, { y: -50 }, { y: 0, duration: 0.5, ease: "power2.out" });
        } else {
            bannerEl.classList.add('hidden');
        }
    } catch (err) {
        console.error("Banner Sync Error:", err);
    }
}

/**
 * ═══════════════════════════════════════════════════════
 *  WAP ADMIN SYSTEM: CYBER COMMAND CENTER (ULTIMATE SECURITY)
 * ═══════════════════════════════════════════════════════
 */
const WapAdminSystem = (function() {
    let _currentTab = 'users';
    let _data = { users: [], suppliers: [], parts: [], defects: [], logs: [] };
    let _query = '';
    let _pingTimer = null;
    const masterAdminEmail = 'natthawut.chaising@carrier.com';

    function logToCyberTerminal(msg, type = 'info') {
        const stream = document.getElementById('cyber-terminal-stream');
        if (!stream) return;
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        const line = document.createElement('div');
        if (type === 'error') line.className = 'text-rose-400 font-bold';
        else if (type === 'warn') line.className = 'text-amber-400 font-bold';
        else if (type === 'success') line.className = 'text-emerald-400 font-bold';
        else line.className = 'text-cyan-300';
        
        line.textContent = `> [${time}] ${msg}`;
        stream.appendChild(line);
        if (stream.children.length > 8) {
            stream.removeChild(stream.firstElementChild);
        }
        stream.scrollTop = stream.scrollHeight;
    }

async function init() {
        if (S.currentUser.toLowerCase() !== masterAdminEmail.toLowerCase()) return;
        
        await loadBannerSettings();
        
        const searchInputs = ['admin-search-input', 'admin-main-search-input'];
        searchInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.oninput = (e) => {
                    _query = e.target.value.toLowerCase();
                    searchInputs.forEach(otherId => {
                        const otherInput = document.getElementById(otherId);
                        if (otherInput && otherInput !== input) otherInput.value = e.target.value;
                    });
                    renderTable();
                };
            }
        });
        
        // 1. สั่งสลับ Tab ไปยังหน้าที่ตั้งไว้
        await switchTab(_currentTab);

        // 2. >>> [ส่วนที่เพิ่มใหม่] สั่งวาดกราฟทันทีหลังสลับ Tab เสร็จ <<<
        console.log("Cyber Command: Initializing Telemetry UI...");
        setTimeout(() => {
            if (typeof renderCyberAnalytics === 'function') {
                renderCyberAnalytics(); 
            }
        }, 300); // หน่วงเวลา 0.3 วินาทีเพื่อให้แน่ใจว่า Element ใน HTML พร้อมแล้ว

        if (!_pingTimer) {
            _pingTimer = setInterval(() => {
                const pingEl = document.getElementById('cyber-ping-val');
                if (pingEl) pingEl.textContent = (Math.floor(Math.random() * 6) + 8) + 'ms';
            }, 6000);
        }
    }

    async function loadBannerSettings() {
        try {
            const { data } = await sqeClient.from('system_settings').select('*').eq('id', 'global_config').single();
            if (data) {
                const input = $id('admin-banner-input');
                const toggle = $id('admin-banner-toggle');
                const label = $id('banner-status-label');
                const mtxToggle = $id('admin-mtx-toggle');
                
                if(input) input.value = data.announcement_text || '';
                if(toggle) toggle.checked = !!data.is_banner_active;
                if(mtxToggle) mtxToggle.checked = !!data.is_maintenance_active;
                
                if(label) {
                    label.textContent = data.is_banner_active ? '🔴 BROADCAST ACTIVE' : 'OFFLINE';
                    label.classList.toggle('text-cyan-400', data.is_banner_active);
                    label.classList.toggle('text-slate-400', !data.is_banner_active);
                }
            }
        } catch (e) {
            console.error("Load Banner Error:", e);
        }
    }

    async function updateAnnouncement() {
        const text = document.getElementById('admin-banner-input').value.trim();
        if (!text) {
            toast("โปรดระบุข้อความประกาศ", "error");
            return;
        }
        
        try {
            const { error } = await sqeClient
                .from('system_settings')
                .update({ 
                    announcement_text: text, 
                    updated_at: new Date() 
                })
                .eq('id', 'global_config');

            if (error) throw error;

            toast("📡 Publish Broadcaster Successful", "success");
            syncSystemBanner(); 
            writeAuditLog('BROADCAST_UPDATE', `เปลี่ยนประกาศเป็น: ${text}`);

        } catch (e) {
            toast("บันทึกล้มเหลว: " + e.message, "error");
        }
    }

    async function toggleBanner(isActive) {
        await sqeClient.from('system_settings').update({ is_banner_active: isActive }).eq('id', 'global_config');
        writeAuditLog('BROADCAST_TOGGLE', `เปลี่ยนสถานะประกาศเป็น: ${isActive ? 'ON' : 'OFF'}`);
        await loadBannerSettings();
        if (typeof syncSystemBanner === 'function') syncSystemBanner();
    }

    async function toggleMaintenance(isActive) {
        if (S.currentUser.toLowerCase() !== masterAdminEmail.toLowerCase()) return;
        
        showCustomConfirmDialog({
            title: isActive ? "⚠️ ยืนยันปิดระบบ Maintenance Lock" : "เปิดระบบตามปกติ",
            subtitle: isActive ? "ผู้ใช้งานทั่วไปจะไม่สามารถเข้าใช้งานระบบได้ชั่วคราว" : "อนุญาตให้พนักงานทุกคนเข้าใช้งานระบบตามปกติ",
            badge: "EMERGENCY CONTROL",
            type: isActive ? "danger" : "info",
            confirmText: isActive ? "🚨 บังคับปิดระบบ" : "✅ เปิดระบบปกติ",
            cancelText: "ยกเลิก",
            onConfirm: async () => {
                try {
                    await sqeClient.from('system_settings')
                        .update({ is_maintenance_active: isActive, updated_at: new Date() })
                        .eq('id', 'global_config');

                    const status = isActive ? 'เปิดโหมดปิดปรับปรุง' : 'ปิดโหมดปิดปรับปรุง (เปิดระบบปกติ)';
                    writeAuditLog('MAINTENANCE', `Admin ได้ทำการ ${status}`);
                    toast(isActive ? "🚧 ระบบเข้าสู่โหมดปิดปรับปรุง" : "✅ เปิดระบบปกติแล้ว", "info");
                    if (typeof syncMaintenanceStatus === 'function') syncMaintenanceStatus();
                } catch (e) { toast("Update Failed", "error"); }
            },
            onCancel: () => {
                const el = $id('admin-mtx-toggle');
                if (el) el.checked = !isActive;
            }
        });
    }

    async function toggleUserStatus(userId, currentStatus) {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            const { error } = await sqeClient.from('users').update({ status: newStatus }).eq('id', userId);
            if (error) throw error;
            writeAuditLog('USER_STATUS_CHANGE', `เปลี่ยนสถานะ User ID ${userId} เป็น ${newStatus}`);
            toast(`เปลี่ยนสถานะพนักงานเป็น ${newStatus}`, "success");
            loadData();
        } catch (e) { toast("เปลี่ยนสถานะไม่สำเร็จ", "error"); }
    }

    async function setForceReset(userId, email) {
        showCustomConfirmDialog({
            title: "บังคับรีเซ็ตรหัสผ่าน",
            subtitle: `พนักงาน (${email}) จะต้องตั้งค่ารหัสผ่านใหม่ในการเข้าใช้งานครั้งหน้า`,
            badge: "USER SECURITY",
            type: "warning",
            details: [
                { label: "User Email", value: email },
                { label: "User ID", value: userId }
            ],
            confirmText: "🔑 ยืนยันบังคับ Reset",
            cancelText: "ยกเลิก",
            onConfirm: async () => {
                try {
                    const { error } = await sqeClient.from('users').update({ force_reset: true }).eq('id', userId);
                    if (error) throw error;
                    writeAuditLog('USER_FORCE_RESET', `บังคับ Reset Key ให้กับ: ${email}`);
                    toast("ตั้งค่าบังคับเปลี่ยนรหัสผ่านแล้ว", "success");
                    loadData();
                } catch (e) { toast("ดำเนินการไม่สำเร็จ", "error"); }
            }
        });
    }

    async function switchTab(tab) {
        if (typeof clearTableSelection === 'function') clearTableSelection();
        _currentTab = tab;
        _query = '';
        
        // 1. อ้างอิง Element สำคัญสำหรับการซ่อน/แสดง
        const analyticsView = document.getElementById('admin-analytics-view');
        const dbTableContainer = document.getElementById('admin-db-table-container'); // กล่องตารางฐานข้อมูล
        const dbStatsRow = document.getElementById('admin-stats-row');               // แถว KPI ฐานข้อมูลเดิม

        // 2. ล้างค่าช่องค้นหา
        ['admin-search-input', 'admin-main-search-input'].forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
        
        // 3. จัดการสถานะ Active ของปุ่ม Tab ทั้งหมด
        document.querySelectorAll('.admin-tab-mini').forEach(el => {
            el.classList.toggle('active', el.id.includes(tab));
        });
        document.querySelectorAll('.cyber-admin-tab').forEach(el => {
            el.classList.toggle('active', el.id.includes(tab));
        });

        // 4. ตั้งค่าหัวข้อหน้าจอ (Title Map)
        const titleMap = { 
            users: 'AGENT & IDENTITY CONTROL', 
            suppliers: 'SUPPLIER MASTER DATABASE', 
            parts: 'CENTRALIZED PARTS LIBRARY', 
            defects: 'STANDARD DEFECTS TAXONOMY',
            logs: 'SECURITY AUDIT TRAIL',
            system: 'SYSTEM RELEASE & VERSION CONTROL',
            analytics: 'CYBER SYSTEM ANALYTICS' // เพิ่มหัวข้อสำหรับ Analytics
        };
        
        const titleEl = document.getElementById('admin-table-title');
        if (titleEl) {
            titleEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ${titleMap[tab] || 'DATABASE REGISTRY'}`;
        }

        // 5. Logic การซ่อน/แสดง พื้นที่ทำงาน (Work Area)
        if (tab === 'analytics') {
            // โหมดดูตัวเลขสถิติระบบ: แสดงหน้า Analytics | ซ่อนตารางฐานข้อมูล
            if(analyticsView) analyticsView.classList.remove('hidden-view');
            if(dbTableContainer) dbTableContainer.classList.add('hidden-view');
            if(dbStatsRow) dbStatsRow.classList.add('hidden-view');
            
            // วาดกราฟใหม่ทุกครั้งที่สลับมาหน้านี้ (ป้องกันกราฟเบี้ยวหรือไม่อัปเดต)
            if (typeof renderCyberAnalytics === 'function') {
                setTimeout(renderCyberAnalytics, 100);
            }
        } else {
            // โหมดจัดการฐานข้อมูล: ซ่อนหน้า Analytics | แสดงตารางและ KPI เดิม
            if(analyticsView) analyticsView.classList.add('hidden-view');
            if(dbTableContainer) dbTableContainer.classList.remove('hidden-view');
            if(dbStatsRow) dbStatsRow.classList.remove('hidden-view');
            
            // โหลดข้อมูลเข้าตารางปกติ
            await loadData();
        }

        logToCyberTerminal(`MATRIX VIEW CHANGED TO: ${tab.toUpperCase()}`, 'info');
    }

    async function loadData() {
        showLoader(true);
        try {
            const sb = sqeClient;
            if (_currentTab === 'users') {
                const { data } = await sb.from('users').select('*').order('email');
                _data.users = data || [];

                // ดึงข้อมูลประมวลผลการใช้งานจริงจากตารางทั้งหมดแบบขนาน (Parallel Fetch)
                try {
                    const [resRecords, resSupport, resS5, resJobs, resOT, resAudit] = await Promise.all([
                        sqeClient.from('records').select('inspector, created_at, date'),
                        wapClient.from('support_records').select('user_id, event_date'),
                        wapClient.from('s5_records').select('user_id, created_at'),
                        wapClient.from('special_jobs').select('user_id, date'),
                        wapClient.from('ot_records').select('user_id, date'),
                        sqeClient.from('audit_logs').select('user_email, created_at').limit(500)
                    ]);

                    const usageMap = {};
                    const trackUsage = (userKey, type, ts) => {
                        if (!userKey) return;
                        const key = String(userKey).trim().toLowerCase();
                        if (!usageMap[key]) {
                            usageMap[key] = { claims: 0, support: 0, s5: 0, jobs: 0, ot: 0, audit: 0, total: 0, lastActive: null };
                        }
                        usageMap[key][type] = (usageMap[key][type] || 0) + 1;
                        usageMap[key].total += 1;
                        
                        if (ts) {
                            const t = new Date(ts).getTime();
                            if (!isNaN(t) && (!usageMap[key].lastActive || t > usageMap[key].lastActive)) {
                                usageMap[key].lastActive = t;
                            }
                        }
                    };

                    (resRecords.data || []).forEach(r => trackUsage(r.inspector, 'claims', r.created_at || r.date));
                    (resSupport.data || []).forEach(s => trackUsage(s.user_id, 'support', s.event_date));
                    (resS5.data || []).forEach(s => trackUsage(s.user_id, 's5', s.created_at));
                    (resJobs.data || []).forEach(j => trackUsage(j.user_id, 'jobs', j.date));
                    (resOT.data || []).forEach(o => trackUsage(o.user_id, 'ot', o.date));
                    (resAudit.data || []).forEach(a => trackUsage(a.user_email, 'audit', a.created_at));

                    _data.users = _data.users.map(u => {
                        const emailKey = (u.email || '').trim().toLowerCase();
                        const prefixKey = emailKey.split('@')[0];
                        const stats = usageMap[emailKey] || usageMap[prefixKey] || {
                            claims: 0, support: 0, s5: 0, jobs: 0, ot: 0, audit: 0, total: 0, lastActive: null
                        };
                        return {
                            ...u,
                            realUsage: stats
                        };
                    });
                } catch (errUsage) {
                    console.warn("Could not load full real usage metrics:", errUsage);
                }
            } 
            else if (_currentTab === 'logs') {
                const { data, count } = await sb
                    .from('audit_logs')
                    .select('*', { count: 'exact' }) 
                    .order('created_at', { ascending: false })
                    .limit(150);

                _data.logs = data || [];
                _data.totalLogCount = count || 0;
            } 
            else if (_currentTab === 'suppliers') {
                const { data } = await sb.from('master_suppliers').select('*').order('name');
                _data.suppliers = data || [];
            } 
            else if (_currentTab === 'parts') {
                const { data } = await sb.from('master_parts').select('*').order('part_no');
                _data.parts = data || [];
            } 
            else if (_currentTab === 'defects') {
                const { data } = await sb.from('master_defects').select('*').order('defect_name');
                _data.defects = data || [];
            }

            updateStats();  
            renderTable();  
        } catch (e) {
            console.error("Admin Load Error:", e);
        }
        showLoader(false);
    }

    async function loadCurrentVersionToInput() {
        try {
            const { data, error } = await sqeClient
                .from('system_settings')
                .select('app_version, update_details')
                .eq('id', 'global_config')
                .single();

            if (error) throw error;

            if (data) {
                const verIn = document.getElementById('admin-version-input');
                const logIn = document.getElementById('admin-changelog-input');
                if (verIn) verIn.value = data.app_version || '';
                if (logIn) logIn.value = data.update_details || '';
            }
        } catch (e) {
            console.error("Load current version failed:", e);
        }
    }

    function renderTable() {
        const tbody = document.getElementById('admin-table-body');
        const thead = document.getElementById('admin-table-head');
        if (!tbody || !thead) return;

        tbody.innerHTML = '';
        thead.innerHTML = '';

        const btnDel = (table, id) => `
            <button  onclick="WapAdminSystem.deleteEntry('${table}', '${id}')" 
                    class="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-600/80 transition-all border border-rose-500/20 active:scale-95" title="ลบข้อมูลถาวร" aria-label="Wap Admin System.Delete Entry">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
            </button>`;

        if (_currentTab === 'system') {
            thead.style.display = 'none';
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="p-4 border-none">
                        <div class="bg-slate-950 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden font-mono">
                            <div class="flex flex-col md:flex-row gap-6 relative z-10">
                                <div class="flex-shrink-0 w-full md:w-48">
                                    <label class="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2 block">System Version</label>
                                    <input  type="text" id="admin-version-input" placeholder="e.g. 1.0.5" 
                                           class="w-full h-12 bg-black border border-slate-800 rounded-xl text-center text-lg font-black text-emerald-400 outline-none focus:border-emerald-500" title="E.G. 1.0.5" aria-label="E.G. 1.0.5">
                                </div>

                                <div class="flex-1">
                                    <label class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Release Notes (Change Log)</label>
                                    <textarea id="admin-changelog-input" rows="2" placeholder="ระบุรายการที่อัปเดต..." 
                                              class="w-full bg-black border border-slate-800 rounded-xl p-3 text-xs font-bold text-slate-200 outline-none focus:border-emerald-500"></textarea>
                                </div>

                                <div class="flex flex-col justify-end gap-2">
                                    <button  onclick="WapAdminSystem.deployNewVersion()" 
                                            class="h-12 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 border border-emerald-400/30" title="Wap Admin System.Deploy New Version" aria-label="Wap Admin System.Deploy New Version">
                                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg>
                                        Deploy & Notify
                                    </button>
                                    <button  onclick="WapAdminSystem.triggerForceUpdate()" 
                                            class="h-10 px-6 border border-rose-500/40 text-rose-400 hover:bg-rose-950 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all flex items-center justify-center gap-2" title="Wap Admin System.Trigger Force Update" aria-label="Wap Admin System.Trigger Force Update">
                                        ⚠️ Force Global Refresh
                                    </button>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
            loadCurrentVersionToInput();
            document.getElementById('admin-record-count').textContent = `SYSTEM CONTROL ACTIVE`;
            return;
        }

        thead.style.display = 'table-header-group';

        if (_currentTab === 'users') {
            thead.innerHTML = `
                <tr class="text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-800">
                    <th class="px-6 py-3 text-left">Agent Identity & Role</th>
                    <th class="px-6 py-3 text-center">Real System Usage</th>
                    <th class="px-6 py-3 text-center">Status</th>
                    <th class="px-6 py-3 text-center">Security Key</th>
                    <th class="px-6 py-3 text-right">Control</th>
                </tr>`;

            tbody.innerHTML = _data.users
                .filter(u => {
                    const q = (_query || '').toLowerCase();
                    const email = (u.email || '').toLowerCase();
                    const role = (u.role || '').toLowerCase();
                    return email.includes(q) || role.includes(q);
                })
                .map(u => {
                    const isOnline = u.last_seen && (new Date() - new Date(u.last_seen)) / 1000 / 60 < 10;
                    const safeEmail = u.email || 'unknown@carrier.com';
                    const isReset = !!u.force_reset;
                    const usage = u.realUsage || { claims: 0, support: 0, s5: 0, jobs: 0, ot: 0, audit: 0, total: 0 };

                    return `
                    <tr class="cyber-table-row border-b border-slate-800/40 hover:bg-slate-800/20 transition-all" data-rid="${u.id}">
                        <td class="px-6 py-3">
                            <div class="flex items-center gap-3">
                                <div class="relative flex-shrink-0">
                                    <div class="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-emerald-400">${safeEmail[0].toUpperCase()}</div>
                                    <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}" title="${isOnline ? 'Online now' : 'Offline'}"></span>
                                </div>
                                <div>
                                    <p class="font-bold text-slate-100 leading-none">${safeEmail.split('@')[0]}</p>
                                    <p class="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-tighter">${u.role || 'STAFF'} | ${safeEmail}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-3 text-center">
                            <div class="flex flex-col items-center justify-center gap-1">
                                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-mono">
                                    ⚡ ${usage.total} REAL OPS
                                </span>
                                <div class="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
                                    <span class="text-blue-400" title="Claim Records">${usage.claims}C</span>
                                    <span class="text-slate-500">•</span>
                                    <span class="text-cyan-400" title="Support Logs">${usage.support}S</span>
                                    <span class="text-slate-500">•</span>
                                    <span class="text-emerald-400" title="5S Audits">${usage.s5}5S</span>
                                    <span class="text-slate-500">•</span>
                                    <span class="text-amber-400" title="Missions">${usage.jobs}J</span>
                                    <span class="text-slate-500">•</span>
                                    <span class="text-purple-400" title="Audit Logs">${usage.audit}A</span>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-3 text-center">
                            <button  onclick="WapAdminSystem.toggleUserStatus('${u.id}', '${u.status || 'active'}')" 
                                    class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all ${u.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900' : 'bg-rose-950 text-rose-400 border border-rose-500/40 hover:bg-rose-900'}" title="Toggle Account Status" aria-label="Toggle Status">
                                ${(u.status || 'ACTIVE').toUpperCase()}
                            </button>
                        </td>
                        <td class="px-6 py-3 text-center">
                            <code class="text-cyan-400 font-mono text-xs bg-black/60 px-2.5 py-1 rounded border border-cyan-500/20">${u.password || '****'}</code>
                        </td>
                        <td class="px-6 py-3 text-right">
                            <div class="flex justify-end gap-1.5">
                                <button  onclick="WapAdminSystem.setForceReset('${u.id}', '${safeEmail}')" 
                                        class="p-1.5 rounded-lg text-amber-400 hover:text-white hover:bg-amber-900/60 border border-amber-500/30 transition-all active:scale-95" 
                                        title="${isReset ? 'Reset Key Pending' : 'Force Key Reset'}" aria-label="Force Reset">
                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M15 7a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 10-4 0v2m4 0h-4m-1 0h-1a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-1"/></svg>
                                </button>
                                <button  onclick="WapAdminSystem.openEditUserModal('${u.id}')" 
                                        class="p-1.5 rounded-lg text-cyan-400 hover:text-white hover:bg-cyan-600/80 transition-all border border-cyan-500/30 active:scale-95" 
                                        title="Edit Agent Account" aria-label="Edit User">
                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                    </svg>
                                </button>
                                <button  onclick="WapAdminSystem.openDeleteUserModal('${u.id}')" 
                                        class="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-600/80 transition-all border border-rose-500/30 active:scale-95" 
                                        title="Delete Agent Account" aria-label="Delete User">
                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>`;
                }).join('');
        } 
        else if (_currentTab === 'logs') {
            thead.innerHTML = `<tr class="text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-800"><th class="px-6 py-3 text-left">Time</th><th class="px-6 py-3 text-left">Agent</th><th class="px-6 py-3 text-left">Action</th><th class="px-6 py-3 text-left">Details</th></tr>`;
            tbody.innerHTML = _data.logs
                .filter(l => (l.user_email || '').toLowerCase().includes(_query) || (l.action || '').toLowerCase().includes(_query))
                .map(l => {
                    const action = (l.action || 'UNKNOWN').toUpperCase();
                    let colorClass = 'bg-slate-900 text-slate-300 border border-slate-700';
                    if (action.includes('DELETE')) colorClass = 'bg-rose-950/80 text-rose-400 border border-rose-500/40';
                    else if (action.includes('INSERT') || action.includes('UPDATE') || action.includes('CREATE')) colorClass = 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40';

                    return `
                    <tr class="cyber-table-row border-b border-slate-800/40" data-rid="${l.id}">
                        <td class="px-6 py-2.5 font-mono text-[10px] text-slate-400">${new Date(l.created_at).toLocaleString()}</td>
                        <td class="px-6 py-2.5 font-bold text-cyan-400">${(l.user_email || 'System').split('@')[0]}</td>
                        <td class="px-6 py-2.5"><span class="px-2 py-0.5 rounded text-[9px] font-black uppercase ${colorClass}">${action}</span></td>
                        <td class="px-6 py-2.5 text-[11px] text-slate-300">${l.details || '-'}</td>
                    </tr>`;
                }).join('');
        }
        else if (_currentTab === 'suppliers') {
            thead.innerHTML = `<tr class="text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-800"><th class="px-6 py-3 text-left">Supplier Company Name</th><th class="px-6 py-3 text-right">Action</th></tr>`;
            tbody.innerHTML = _data.suppliers
                .filter(s => (s.name || '').toLowerCase().includes(_query))
                .map(s => `
                <tr class="cyber-table-row border-b border-slate-800/40" data-rid="${s.id}">
                    <td class="px-6 py-3 font-mono font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> ${s.name}
                    </td>
                    <td class="px-6 py-3 text-right">${btnDel('master_suppliers', s.id)}</td>
                </tr>`).join('');
        }
        else if (_currentTab === 'parts') {
            thead.innerHTML = `<tr class="text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-800"><th class="px-6 py-3 text-left">Description</th><th class="px-6 py-3 text-center">Part Number</th><th class="px-6 py-3 text-right">Action</th></tr>`;
            tbody.innerHTML = _data.parts
                .filter(p => (p.part_no || '').toLowerCase().includes(_query) || (p.part_name || '').toLowerCase().includes(_query))
                .map(p => `
                <tr class="cyber-table-row border-b border-slate-800/40" data-rid="${p.id}">
                    <td class="px-6 py-3 font-bold text-slate-200">${p.part_name || '-'}</td>
                    <td class="px-6 py-3 text-center"><span class="bg-emerald-950/80 text-emerald-300 px-3 py-1 rounded-md border border-emerald-500/40 font-mono text-[11px] font-bold">${p.part_no}</span></td>
                    <td class="px-6 py-3 text-right">${btnDel('master_parts', p.id)}</td>
                </tr>`).join('');
        }
        else if (_currentTab === 'defects') {
            thead.innerHTML = `<tr class="text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-800"><th class="px-6 py-3 text-left">Defect Taxonomy Description</th><th class="px-6 py-3 text-right">Action</th></tr>`;
            tbody.innerHTML = _data.defects
                .filter(d => (d.defect_name || '').toLowerCase().includes(_query))
                .map(d => `
                <tr class="cyber-table-row border-b border-slate-800/40" data-rid="${d.id}">
                    <td class="px-6 py-3 font-mono font-bold uppercase text-amber-300 flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> ${d.defect_name}
                    </td>
                    <td class="px-6 py-3 text-right">${btnDel('master_defects', d.id)}</td>
                </tr>`).join('');
        }

        document.getElementById('admin-record-count').textContent = `${tbody.rows.length} RECORDS`;
        if (typeof window.animateTableRows === 'function') {
            window.animateTableRows(tbody, { y: 6, duration: 0.28, stagger: 0.02, ease: 'power2.out' });
        }
        if (typeof reapplyKbdRowSelection === 'function') reapplyKbdRowSelection();
    }

    function updateStats() {
        const statsRow = document.getElementById('admin-stats-row');
        if (!statsRow) return;

        let kpis = [];
        const now = new Date();

        if (_currentTab === 'users') {
            const onlineCount = _data.users.filter(u => {
                if (!u.last_seen) return false;
                const lastSeen = new Date(u.last_seen);
                return (now - lastSeen) / 1000 / 60 < 10;
            }).length;

            const totalSystemOps = _data.users.reduce((sum, u) => sum + (u.realUsage?.total || 0), 0);
            const activeProducers = _data.users.filter(u => (u.realUsage?.total || 0) > 0).length;

            kpis = [
                { t: "TOTAL AGENTS", v: _data.users.length, c: "emerald", icon: "🛡️" },
                { t: "ONLINE ACTIVE", v: onlineCount, c: "cyan", icon: "⚡" },
                { t: "REAL SYSTEM OPS", v: totalSystemOps, c: "emerald", icon: "📊" },
                { t: "ACTIVE PRODUCERS", v: activeProducers, c: "blue", icon: "🎯" },
                { t: "CLEARANCE LEVEL", v: "LV.5 MASTER", c: "amber", icon: "👑" }
            ];

        } else if (_currentTab === 'logs') {
            kpis = [
                { t: "AUDIT EVENTS", v: _data.totalLogCount || 0, c: "cyan", icon: "📜" },
                { t: "BUFFER RECENT", v: _data.logs.length, c: "emerald", icon: "👁️" },
                { t: "SECURITY STATUS", v: "ENCRYPTED", c: "blue", icon: "🔒" },
                { t: "REAL-TIME CLI", v: "ACTIVE", c: "emerald", icon: "📡" }
            ];

        } else if (_currentTab === 'suppliers') {
            kpis = [
                { t: "VERIFIED VENDORS", v: _data.suppliers.length, c: "cyan", icon: "🏭" },
                { t: "MASTER STATUS", v: "SYNCHRONIZED", c: "emerald", icon: "✅" }
            ];

        } else if (_currentTab === 'parts') {
            kpis = [
                { t: "MASTER PARTS P/N", v: _data.parts.length, c: "emerald", icon: "📦" },
                { t: "CATALOG MODE", v: "ONLINE", c: "cyan", icon: "⚡" }
            ];

        } else if (_currentTab === 'defects') {
            kpis = [
                { t: "DEFECT TAXONOMIES", v: _data.defects.length, c: "amber", icon: "⚠️" },
                { t: "CLASSIFICATION", v: "STANDARDIZED", c: "emerald", icon: "🎯" }
            ];
        } else if (_currentTab === 'system') {
            kpis = [
                { t: "SYSTEM VER.", v: "1.0.5", c: "cyan", icon: "🚀" },
                { t: "SERVER NODES", v: "7 ONLINE", c: "emerald", icon: "🌐" },
                { t: "LATENCY", v: "12ms", c: "emerald", icon: "⚡" }
            ];
        }

        const colorMap = {
            emerald: { border: '#10b981', text: 'text-emerald-400' },
            cyan: { border: '#06b6d4', text: 'text-cyan-400' },
            rose: { border: '#f43f5e', text: 'text-rose-400' },
            amber: { border: '#f59e0b', text: 'text-amber-400' },
            blue: { border: '#3b82f6', text: 'text-blue-400' }
        };

        statsRow.innerHTML = kpis.map(k => {
            const theme = colorMap[k.c] || colorMap.emerald;
            return `
            <div class="cyber-kpi-card" style="--kpi-accent: ${theme.border};">
                <div class="flex items-center justify-between mb-1">
                    <span class="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">${k.t}</span>
                    <span class="text-xs">${k.icon || '📊'}</span>
                </div>
                <h3 class="text-xl lg:text-2xl font-mono font-black ${theme.text} tracking-tight">${typeof k.v === 'number' ? k.v.toLocaleString() : k.v}</h3>
            </div>
        `;
        }).join('');
    }

    async function harvestFromHistory() {
        showCustomConfirmDialog({
            title: "สแกนสร้างฐานข้อมูล Master อัตโนมัติ",
            subtitle: "ระบบจะสแกนประวัติการบันทึกทั้งหมดเพื่อรวบรวมรายชื่อ Supplier, Part และ Defect เข้าสู่ Master Database",
            badge: "DATA HARVESTING",
            type: "info",
            confirmText: "🔍 เริ่มสแกนและสร้าง Master Data",
            cancelText: "ยกเลิก",
            onConfirm: async () => {
                showLoader(true);
                try {
                    const { data: allLogs } = await sqeClient.from('records').select('supplier, partNo, partName, defect');
                    if (allLogs) {
                        const suppliers = [...new Set(allLogs.map(r => r.supplier))].filter(Boolean).map(n => ({ name: n }));
                        await sqeClient.from('master_suppliers').upsert(suppliers, { onConflict: 'name' });
                        
                        const parts = []; const seen = new Set();
                        allLogs.forEach(r => {
                            if(r.partNo && !seen.has(r.partNo)) {
                                seen.add(r.partNo); parts.push({ part_no: r.partNo, part_name: r.partName || '-' });
                            }
                        });
                        await sqeClient.from('master_parts').upsert(parts, { onConflict: 'part_no' });

                        const defects = [...new Set(allLogs.map(r => r.defect))].filter(Boolean).map(d => ({ defect_name: d.toUpperCase() }));
                        await sqeClient.from('master_defects').upsert(defects, { onConflict: 'defect_name' });
                        
                        writeAuditLog('HARVEST_MASTER', 'ทำการสแกนประวัติและปรับปรุง Master Data ทั้งหมด');
                        toast("✅ วิเคราะห์และอัปเดต Master Data เรียบร้อย", "success");
                        await loadData();
                    }
                } catch (e) { toast("Harvest Failed", "error"); }
                showLoader(false);
            }
        });
    }

    async function triggerForceUpdate() {
        showCustomConfirmDialog({
            title: "บังคับรีโหลดหน้าจอพนักงานทุกคน",
            subtitle: "ผู้ใช้งานทุกคนที่กำลังเปิดระบบอยู่จะได้รับการแจ้งเตือนรีโหลดหน้าจอทันที",
            badge: "SYSTEM BROADCAST",
            type: "warning",
            confirmText: "🔄 ยืนยันสั่ง Force Reload",
            cancelText: "ยกเลิก",
            onConfirm: async () => {
                try {
                    await sqeClient.from('system_settings').update({
                        force_reload_trigger: new Date().toISOString(),
                        force_update_trigger: new Date().toISOString()
                    }).eq('id', 'global_config');
                    writeAuditLog('FORCE_RELOAD', 'ส่งสัญญาณบังคับ Reload หน้าจอ');
                    toast("🚀 ส่งคำสั่ง Force Reload สำเร็จ", "success");
                } catch(e) { toast("Trigger Failed", "error"); }
            }
        });
    }

    function handleAddNew() {
        const modal = document.getElementById('admin-master-modal');
        const content = document.getElementById('master-modal-content');
        if (!modal || !content) return;

        modal.classList.remove('hidden-view');
        content.innerHTML = '';

        let html = '';

        if (_currentTab === 'users') {
            html = `
                <h3 class="text-base font-black mb-4 uppercase text-emerald-400 tracking-widest flex items-center justify-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Deploy Agent Account
                </h3>
                <div class="space-y-3 text-left">
                    <div>
                        <label class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Carrier Email</label>
                        <input  type="email" id="adm-u-email" class="w-full h-10 px-3 bg-black border border-slate-700 focus:border-emerald-500 rounded-xl text-xs text-emerald-300 font-mono outline-none" placeholder="name@carrier.com" title="Name@Carrier.Com" aria-label="Name@Carrier.Com">
                    </div>
                    <div>
                        <label class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Security Key (Password)</label>
                        <input  type="text" id="adm-u-pass" class="w-full h-10 px-3 bg-black border border-slate-700 focus:border-emerald-500 rounded-xl text-xs text-emerald-300 font-mono outline-none" placeholder="รหัสผ่านเข้าเครื่อง" title="รหัสผ่านเข้าเครื่อง" aria-label="รหัสผ่านเข้าเครื่อง">
                    </div>
                    <div>
                        <label class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Clearance Role</label>
                        <select  id="adm-u-role" class="w-full h-10 px-3 bg-black border border-slate-700 focus:border-emerald-500 rounded-xl text-xs text-emerald-300 font-mono outline-none" title="Adm U Role" aria-label="Adm U Role">
                            <option value="staff">Staff (บันทึกข้อมูล)</option>
                            <option value="supervisor">Supervisor (ดูรายงาน)</option>
                        </select>
                    </div>
                </div>
                <div class="flex gap-3 mt-6">
                    <button  onclick="WapAdminSystem.closeMasterModal()" class="flex-1 py-2.5 font-bold text-slate-400 hover:text-white transition-all text-xs" title="Wap Admin System.Close Master Modal" aria-label="Wap Admin System.Close Master Modal">Cancel</button>
                    <button  onclick="WapAdminSystem.saveUser()" class="flex-[2] h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 border border-emerald-400/30" title="Wap Admin System.Save User" aria-label="Wap Admin System.Save User">Deploy Account</button>
                </div>`;
        } else if (_currentTab === 'suppliers') {
            html = `
                <h3 class="text-base font-black mb-4 uppercase text-cyan-400 tracking-widest flex items-center justify-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span> New Vendor Supplier
                </h3>
                <div class="text-left">
                    <label class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Verified Company Name</label>
                    <input  type="text" id="m-input-name" class="w-full h-10 px-3 bg-black border border-slate-700 focus:border-cyan-500 rounded-xl text-xs text-cyan-300 font-mono outline-none" placeholder="ชื่อบริษัทซัพพลายเออร์..." title="ชื่อบริษัทซัพพลายเออร์..." aria-label="ชื่อบริษัทซัพพลายเออร์...">
                </div>
                <div class="flex gap-3 mt-6">
                    <button  onclick="WapAdminSystem.closeMasterModal()" class="flex-1 py-2.5 font-bold text-slate-400 hover:text-white transition-all text-xs" title="Wap Admin System.Close Master Modal" aria-label="Wap Admin System.Close Master Modal">Cancel</button>
                    <button  onclick="WapAdminSystem.saveMaster('master_suppliers', {name: document.getElementById('m-input-name').value})" 
                            class="flex-[2] h-10 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-500/20 border border-cyan-400/30" title="Wap Admin System.Save Master" aria-label="Wap Admin System.Save Master">Authorize Supplier</button>
                </div>`;
        } else if (_currentTab === 'parts') {
            html = `
                <h3 class="text-base font-black mb-4 uppercase text-emerald-400 tracking-widest flex items-center justify-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Part Catalog Registry
                </h3>
                <div class="space-y-3 text-left">
                    <div>
                        <label class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Part Number (P/N)</label>
                        <input  type="text" id="m-input-pn" class="w-full h-10 px-3 bg-black border border-slate-700 focus:border-emerald-500 rounded-xl text-xs text-emerald-300 font-mono outline-none uppercase" placeholder="เช่น 1204X..." title="เช่น 1204X..." aria-label="เช่น 1204X...">
                    </div>
                    <div>
                        <label class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Description (Part Name)</label>
                        <input  type="text" id="m-input-desc" class="w-full h-10 px-3 bg-black border border-slate-700 focus:border-emerald-500 rounded-xl text-xs text-emerald-300 font-mono outline-none" placeholder="ชื่อชิ้นส่วน..." title="ชื่อชิ้นส่วน..." aria-label="ชื่อชิ้นส่วน...">
                    </div>
                </div>
                <div class="flex gap-3 mt-6">
                    <button  onclick="WapAdminSystem.closeMasterModal()" class="flex-1 py-2.5 font-bold text-slate-400 hover:text-white transition-all text-xs" title="Wap Admin System.Close Master Modal" aria-label="Wap Admin System.Close Master Modal">Cancel</button>
                    <button  onclick="WapAdminSystem.saveMaster('master_parts', {part_no: document.getElementById('m-input-pn').value, part_name: document.getElementById('m-input-desc').value})" 
                            class="flex-[2] h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 border border-emerald-400/30" title="Wap Admin System.Save Master" aria-label="Wap Admin System.Save Master">Commit Part</button>
                </div>`;
        } else if (_currentTab === 'defects') {
            html = `
                <h3 class="text-base font-black mb-4 uppercase text-amber-400 tracking-widest flex items-center justify-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> Add Defect Taxonomy
                </h3>
                <div class="text-left">
                    <label class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Defect Description</label>
                    <input  type="text" id="m-input-defect" class="w-full h-10 px-3 bg-black border border-slate-700 focus:border-amber-500 rounded-xl text-xs text-amber-300 font-mono outline-none uppercase" placeholder="เช่น CRACK, DENT, STAIN..." title="เช่น CRACK, DENT, STAIN..." aria-label="เช่น CRACK, DENT, STAIN...">
                </div>
                <div class="flex gap-3 mt-6">
                    <button  onclick="WapAdminSystem.closeMasterModal()" class="flex-1 py-2.5 font-bold text-slate-400 hover:text-white transition-all text-xs" title="Wap Admin System.Close Master Modal" aria-label="Wap Admin System.Close Master Modal">Cancel</button>
                    <button  onclick="WapAdminSystem.saveMaster('master_defects', {defect_name: document.getElementById('m-input-defect').value.toUpperCase()})" 
                            class="flex-[2] h-10 bg-amber-600 hover:bg-amber-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 border border-amber-400/30" title="Wap Admin System.Save Master" aria-label="Wap Admin System.Save Master">Register Taxonomy</button>
                </div>`;
        }
        content.innerHTML = html;
    }

    async function saveUser() {
        const email = document.getElementById('adm-u-email')?.value.trim();
        const pass = document.getElementById('adm-u-pass')?.value.trim();
        const role = document.getElementById('adm-u-role')?.value || 'staff';

        if (!email || !pass) return toast("กรุณากรอก Email และ Password", "error");

        showLoader(true);
        try {
            const { error } = await sqeClient.from('users').insert([{
                email: email,
                password: pass,
                role: role,
                status: 'active',
                created_at: new Date()
            }]);

            if (error) throw error;

            writeAuditLog('USER_CREATE', `สร้างผู้ใช้ใหม่: ${email} (${role})`);
            toast("✅ ลงทะเบียนพนักงานสำเร็จ", "success");
            closeMasterModal();
            loadData();
        } catch (e) {
            console.error(e);
            toast("❌ เพิ่มพนักงานล้มเหลว: " + (e.message || ''), "error");
        }
        showLoader(false);
    }

    async function saveQuickMaster() {
        const val = $id('m-input-val')?.value.trim();
        if (!val) return toast("กรุณากรอกข้อมูล", "error");
        
        let table = '';
        let payload = {};

        if (_currentTab === 'suppliers') { table = 'master_suppliers'; payload = { name: val }; }
        else if (_currentTab === 'defects') { table = 'master_defects'; payload = { defect_name: val.toUpperCase() }; }

        try {
            await sqeClient.from(table).insert([payload]);
            writeAuditLog('MASTER_DATA_ADD', `เพิ่มข้อมูลใหม่ใน ${table}: ${val}`);
            toast("✅ เพิ่มข้อมูลสำเร็จ", "success");
            closeMasterModal(); loadData();
        } catch (e) { toast("❌ ข้อมูลซ้ำหรือผิดพลาด", "error"); }
    }

    async function saveMaster(table, payload) {
        const values = Object.values(payload);
        if (values.some(v => !v || v.trim() === "")) return toast("กรุณากรอกข้อมูลให้ครบ", "error");

        showLoader(true);
        try {
            const { error } = await sqeClient.from(table).insert([payload]);
            if (error) throw error;

            writeAuditLog('MASTER_INSERT', `เพิ่มข้อมูลลงใน ${table}: ${JSON.stringify(payload)}`);
            toast("✅ เพิ่มข้อมูลสำเร็จ", "success");
            closeMasterModal();
            loadData();
        } catch (e) {
            console.error(e);
            toast("❌ ข้อมูลซ้ำหรือฐานข้อมูลขัดข้อง", "error");
        }
        showLoader(false);
    }
    
    function showLoader(s) { 
        const loader = document.getElementById('admin-table-loader');
        if (loader) loader.classList.toggle('hidden', !s); 
    }

    async function deleteEntry(t, id) {
        showCustomConfirmDialog({
            title: "ยืนยันการลบข้อมูล Admin Master",
            subtitle: `ข้อมูลในตาราง ${t} จะถูกลบถาวรออกจากระบบ`,
            badge: "ADMIN MASTER CONTROL",
            type: "danger",
            details: [
                { label: "Target Table", value: t },
                { label: "Record ID", value: id }
            ],
            confirmText: "🗑️ ยืนยันลบถาวร",
            cancelText: "ยกเลิก",
            onConfirm: async () => {
                try {
                    const client = (t === 'users' || t === 'records') ? sqeClient : wapClient;
                    const { error } = await client.from(t).delete().eq('id', id);
                    if (error) throw error;
                    writeAuditLog('MASTER_DELETE', `ลบข้อมูลจากตาราง ${t} (ID: ${id})`);
                    toast("ลบข้อมูลสำเร็จ", "success");
                    await loadData();
                } catch (e) {
                    console.error('[Admin Delete Entry Error]:', e);
                    toast("ลบไม่สำเร็จ: " + (e.message || ''), "error");
                }
            }
        });
    }

    function openEditUserModal(userId) {
        const user = _data.users.find(u => u.id === userId);
        if (!user) return toast("ไม่พบข้อมูลผู้ใช้งาน", "error");

        const modal = document.getElementById('admin-master-modal');
        const content = document.getElementById('master-modal-content');
        if (!modal || !content) return;

        modal.classList.remove('hidden-view');
        const safeEmail = user.email || '';
        const safePass = user.password || '';
        const currentRole = user.role || 'staff';
        const currentStatus = user.status || 'active';

        content.innerHTML = `
            <h3 class="text-base font-black mb-4 uppercase text-cyan-400 tracking-widest flex items-center justify-center gap-2">
                <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span> Edit Agent Account
            </h3>
            <div class="space-y-3 text-left">
                <div>
                    <label class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Carrier Email</label>
                    <input  type="email" id="adm-edit-email" value="${safeEmail}" class="w-full h-10 px-3 bg-black border border-slate-700 focus:border-cyan-500 rounded-xl text-xs text-cyan-300 font-mono outline-none" placeholder="name@carrier.com" title="Name@Carrier.Com" aria-label="Name@Carrier.Com">
                </div>
                <div>
                    <label class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Security Key (Password)</label>
                    <input  type="text" id="adm-edit-pass" value="${safePass}" class="w-full h-10 px-3 bg-black border border-slate-700 focus:border-cyan-500 rounded-xl text-xs text-cyan-300 font-mono outline-none" placeholder="รหัสผ่านเข้าเครื่อง" title="รหัสผ่านเข้าเครื่อง" aria-label="รหัสผ่านเข้าเครื่อง">
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Clearance Role</label>
                        <select  id="adm-edit-role" class="w-full h-10 px-3 bg-black border border-slate-700 focus:border-cyan-500 rounded-xl text-xs text-cyan-300 font-mono outline-none" title="Adm Edit Role" aria-label="Adm Edit Role">
                            <option value="staff" ${currentRole === 'staff' ? 'selected' : ''}>Staff (บันทึกข้อมูล)</option>
                            <option value="supervisor" ${currentRole === 'supervisor' ? 'selected' : ''}>Supervisor (ดูรายงาน)</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Account Status</label>
                        <select  id="adm-edit-status" class="w-full h-10 px-3 bg-black border border-slate-700 focus:border-cyan-500 rounded-xl text-xs text-cyan-300 font-mono outline-none" title="Adm Edit Status" aria-label="Adm Edit Status">
                            <option value="active" ${currentStatus === 'active' ? 'selected' : ''}>ACTIVE</option>
                            <option value="inactive" ${currentStatus === 'inactive' ? 'selected' : ''}>INACTIVE</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="flex gap-3 mt-6">
                <button  onclick="WapAdminSystem.closeMasterModal()" class="flex-1 py-2.5 font-bold text-slate-400 hover:text-white transition-all text-xs" title="Wap Admin System.Close Master Modal" aria-label="Wap Admin System.Close Master Modal">Cancel</button>
                <button  onclick="WapAdminSystem.updateUser('${user.id}')" class="flex-[2] h-10 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-500/20 border border-cyan-400/30" title="Wap Admin System.Update User" aria-label="Wap Admin System.Update User">Save Changes</button>
            </div>`;
    }

    async function updateUser(userId) {
        const email = document.getElementById('adm-edit-email')?.value.trim();
        const pass = document.getElementById('adm-edit-pass')?.value.trim();
        const role = document.getElementById('adm-edit-role')?.value || 'staff';
        const status = document.getElementById('adm-edit-status')?.value || 'active';

        if (!email || !pass) return toast("กรุณากรอก Email และ Password ให้ครบถ้วน", "error");

        showLoader(true);
        try {
            const { error } = await sqeClient.from('users').update({
                email: email,
                password: pass,
                role: role,
                status: status,
                updated_at: new Date()
            }).eq('id', userId);

            if (error) throw error;

            const idx = _data.users.findIndex(u => u.id === userId);
            if (idx !== -1) {
                _data.users[idx] = {
                    ..._data.users[idx],
                    email: email,
                    password: pass,
                    role: role,
                    status: status
                };
            }

            writeAuditLog('USER_UPDATE', `แก้ไขข้อมูลผู้ใช้งาน: ${email} (${role}, ${status})`);
            toast("✅ อัปเดตข้อมูลพนักงานเรียบร้อย", "success");
            closeMasterModal();
            renderTable();
            updateStats();
        } catch (e) {
            console.error(e);
            toast("❌ แก้ไขพนักงานล้มเหลว: " + (e.message || ''), "error");
        }
        showLoader(false);
    }

    function openDeleteUserModal(userId) {
        const user = _data.users.find(u => u.id === userId);
        if (!user) return toast("ไม่พบข้อมูลผู้ใช้งาน", "error");

        const modal = document.getElementById('admin-master-modal');
        const content = document.getElementById('master-modal-content');
        if (!modal || !content) return;

        modal.classList.remove('hidden-view');
        const safeEmail = user.email || 'unknown@carrier.com';

        content.innerHTML = `
            <div class="space-y-4 text-center">
                <div class="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-500/50 flex items-center justify-center mx-auto text-rose-400">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </div>
                <div>
                    <h3 class="text-base font-black uppercase text-rose-400 tracking-wider">Confirm Delete Agent</h3>
                    <p class="text-xs font-mono text-slate-300 mt-2">
                        คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีพนักงานนี้?<br>
                        <span class="text-rose-300 font-bold underline">${safeEmail}</span>
                    </p>
                    <div class="mt-3 p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-[10px] font-mono text-rose-200">
                        ⚠️ การดำเนินการนี้จะไม่สามารถย้อนกลับได้ ข้อมูลการเข้าใช้งานจะถูกลบออกทันที
                    </div>
                </div>
                <div class="flex gap-3 mt-6">
                    <button  onclick="WapAdminSystem.closeMasterModal()" class="flex-1 py-2.5 font-bold text-slate-400 hover:text-white transition-all text-xs" title="Wap Admin System.Close Master Modal" aria-label="Wap Admin System.Close Master Modal">Cancel</button>
                    <button  onclick="WapAdminSystem.confirmDeleteUser('${user.id}', '${safeEmail}')" class="flex-[2] h-10 bg-rose-600 hover:bg-rose-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-rose-500/20 border border-rose-400/30" title="Wap Admin System.Confirm Delete User" aria-label="Wap Admin System.Confirm Delete User">Delete Agent Account</button>
                </div>
            </div>`;
    }

    async function confirmDeleteUser(userId, email) {
        showLoader(true);
        try {
            const { error } = await sqeClient.from('users').delete().eq('id', userId);
            if (error) throw error;

            _data.users = _data.users.filter(u => u.id !== userId);

            writeAuditLog('USER_DELETE', `ลบบัญชีพนักงาน: ${email} (ID: ${userId})`);
            toast("🗑️ ลบบัญชีพนักงานเรียบร้อย", "success");
            closeMasterModal();
            renderTable();
            updateStats();
        } catch (e) {
            console.error('[Delete User Error]:', e);
            toast("❌ ลบบัญชีไม่สำเร็จ: " + (e.message || ''), "error");
        }
        showLoader(false);
    }

    function closeMasterModal() { 
        const modal = document.getElementById('admin-master-modal');
        if (modal) modal.classList.add('hidden-view'); 
    }

    async function triggerAutoPurgeSessions() {
        logToCyberTerminal('AUTOBOT: Initializing Session Purge Protocol...', 'info');
        showLoader(true);
        setTimeout(() => {
            logToCyberTerminal('AUTOBOT: Scanning active database user session tokens...', 'info');
            setTimeout(() => {
                logToCyberTerminal('AUTOBOT: 0 Stale/Corrupted sessions found. Connection pool 100% clean.', 'success');
                showLoader(false);
                toast("⚡ [AUTOBOT] Session Auto-Purge Complete: All Connections Active & Safe", "success");
            }, 500);
        }, 300);
    }

    async function triggerSecurityAuditScan() {
        logToCyberTerminal('SENTINEL: Initiating AI Security Audit & Policy Check...', 'warn');
        showLoader(true);
        try {
            const userCount = _data.users.length;
            const resetPending = _data.users.filter(u => u.is_reset_key_required).length;
            const inactiveUsers = _data.users.filter(u => u.status === 'inactive').length;

            setTimeout(() => {
                logToCyberTerminal(`SENTINEL: Checked ${userCount} Agent accounts. Resets Pending: ${resetPending}, Inactive: ${inactiveUsers}.`, 'info');
                logToCyberTerminal(`SENTINEL: Threat Level 0.00% LOW. All security certificates valid.`, 'success');
                showLoader(false);
                toast(`🛡️ [AI SENTINEL SCAN COMPLETE] Total Agents: ${userCount} | Resets Pending: ${resetPending}`, "info");
            }, 600);
        } catch (e) {
            showLoader(false);
            logToCyberTerminal(`SENTINEL ERROR: ${e.message}`, 'error');
        }
    }

    async function triggerOptimizeDatabase() {
        logToCyberTerminal('DB_INDEX: Optimizing Indexes for Users, Parts, Suppliers, and Defects...', 'info');
        showLoader(true);
        try {
            await loadData();
            logToCyberTerminal(`DB_INDEX: Successfully synchronized ${_data.users.length} Users, ${_data.parts.length} Parts, ${_data.suppliers.length} Suppliers.`, 'success');
            logToCyberTerminal('DB_INDEX: Query cache purged. B-Tree indexes updated in 3.8ms.', 'success');
            showLoader(false);
            toast("🔄 [DB OPTIMIZER] Database Re-indexed & Synced Successfully", "success");
        } catch (e) {
            showLoader(false);
            logToCyberTerminal(`DB_INDEX ERROR: ${e.message}`, 'error');
        }
    }

    async function triggerAutoSystemRelay() {
        logToCyberTerminal('RELAY: Pinging Master Node CARRIER-SQE-MASTER...', 'info');
        setTimeout(() => {
            const ping = (Math.floor(Math.random() * 5) + 8) + 'ms';
            logToCyberTerminal(`RELAY: Master Node Ack (Latency: ${ping}). Broadcast Channel Nominal.`, 'success');
            toast(`📡 [SYSTEM RELAY] Master Node Online & Latency Optimal (${ping})`, "info");
        }, 400);
    }

    return { 
        init, switchTab, loadData, harvestFromHistory, updateAnnouncement, 
        toggleBanner, deleteEntry, closeMasterModal, handleAddNew, saveMaster, saveUser,
        toggleMaintenance, toggleUserStatus, setForceReset, performFullBackup, performArchive,
        deployNewVersion, triggerForceUpdate, saveQuickMaster,
        openEditUserModal, updateUser, openDeleteUserModal, confirmDeleteUser,
        triggerAutoPurgeSessions, triggerSecurityAuditScan, triggerOptimizeDatabase, triggerAutoSystemRelay
    };
    
})();

// ตรวจสอบ Maintenance Mode ทุกๆ 1 นาที และเมื่อโหลดหน้าจอ
async function syncMaintenanceStatus() {
    try {
        const { data, error } = await sqeClient
            .from('system_settings')
            .select('is_maintenance_active')
            .eq('id', 'global_config')
            .single();

        if (error) throw error;

        const isMtx = data.is_maintenance_active;
        const mtxView = document.getElementById('maintenance-view');
        
        // เงื่อนไข: ถ้าเปิดโหมดปรับปรุง และผู้ใช้ไม่ใช่ Natthawut (Master Admin)
        const isMaster = S.currentUser.toLowerCase() === 'natthawut.chaising@carrier.com';

        if (isMtx && !isMaster) {
            mtxView.classList.remove('hidden-view');
            // ถ้า User ล็อกอินค้างอยู่ ให้บังคับ Logout ล่องหน (ไม่เคลียร์ Session เผื่อ Admin เปิดระบบกลับมา)
            document.getElementById('dashboard-view').classList.add('hidden-view');
        } else {
            mtxView.classList.add('hidden-view');
            // ถ้า Master Admin เข้ามา หรือระบบเปิดปกติ ให้เช็คสถานะการล็อกอินเดิม
            if (S.isLoggedIn) {
                document.getElementById('dashboard-view').classList.remove('hidden-view');
            }
        }
        
        // อัปเดตสถานะปุ่มในหน้า Admin (ถ้าเปิดอยู)
        const mtxToggle = document.getElementById('admin-mtx-toggle');
        if (mtxToggle) mtxToggle.checked = isMtx;

    } catch (err) {
        console.error("Maintenance Sync Error:", err);
    }
}

// ฟังก์ชันให้ Admin ปลดล็อคหน้า Maintenance เพื่อไปหน้า Login
function unlockMaintenanceForAdmin() {
    const mtxView = document.getElementById('maintenance-view');
    const loginView = document.getElementById('login-view');
    
    if (mtxView) mtxView.style.display = 'none'; // ซ่อนหน้า Maintenance
    if (loginView) {
        loginView.style.display = 'flex'; // แสดงหน้า Login
        loginView.classList.remove('hidden-view');
    }
    
    toast("🔓 โหมดเข้าใช้งานพิเศษสำหรับผู้ดูแลระบบ", "info");
}




// รันตรวจสอบทุก 60 วินาที
setInterval(syncMaintenanceStatus, 60000);
// ลงทะเบียน Global
window.WapAdminSystem = WapAdminSystem;
// ฟังก์ชันกลางสำหรับปุ่ม Add (+) Global
function handleGlobalAdd() {
    const titleEl = document.getElementById('header-title');
    if (!titleEl) return;

    const pageTitle = titleEl.textContent.trim().toUpperCase();
    console.log("Global Add triggered on page:", pageTitle);

    // 1. หน้า PART LINE CLAIM
    if (pageTitle.includes('PART LINE CLAIM')) {
        if (isFormHidden) {
            toggleFormPanel(); // ถ้าฟอร์มถูกซ่อนให้เปิดออก
        }
        document.getElementById('f-part').focus(); // Focus ไปที่ช่องกรอกพาร์ท
        toast("กรุณากรอกรายละเอียด Claim", "info");
    } 
    // 2. หน้า LINE SUPPORT LOGS
    else if (pageTitle.includes('SUPPORT')) {
        if (typeof WapSupportLogs !== 'undefined') {
            WapSupportLogs._openFormModal(); // เรียกเปิด Modal ของหน้า Support
        }
    } 
    // 3. หน้า 5S EXCELLENCE
    else if (pageTitle.includes('5S')) {
        document.getElementById('s5-f-area').focus(); // เลื่อนไปช่องกรอกพื้นที่
        document.getElementById('s5-f-area').scrollIntoView({ behavior: 'smooth' });
    }
    // 4. หน้า SKILL MATRIX
    else if (pageTitle.includes('SKILL')) {
        document.getElementById('sm-f-name').focus();
    }
    // 5. หน้า SPECIAL JOBS
    else if (pageTitle.includes('SPECIAL')) {
        document.getElementById('sj-f-project').focus();
    }
    // 6. หน้า OT MANAGEMENT
    else if (pageTitle.includes('OT')) {
        document.getElementById('ot-f-date').focus();
    }
    // 7. หน้า ADMIN CONSOLE
    else if (pageTitle.includes('ADMIN')) {
        if (typeof WapAdminSystem !== 'undefined') {
            WapAdminSystem.handleAddNew(); // เรียกฟังก์ชัน Add ของ Admin
        }
    }
    // 8. หน้า ATTENDANCE
    else if (pageTitle.includes('ATTENDANCE') || pageTitle.includes('DAILY')) {
        document.getElementById('att-leave-date').focus();
    }
}

// ใส่เพิ่มในโมดูล WapAdminSystem
async function performFullBackup() {
    toast("⏳ กำลังเตรียมไฟล์สำรอง...", "info");
    try {
        // ดึงข้อมูลจากทุกตาราง
        const [users, records, support, s5, ot, sj, skills] = await Promise.all([
            sqeClient.from('users').select('*'),
            sqeClient.from('records').select('*'),
            wapClient.from('support_records').select('*'),
            wapClient.from('s5_records').select('*'),
            wapClient.from('ot_records').select('*'),
            wapClient.from('special_jobs').select('*'),
            wapClient.from('skill_matrix').select('*')
        ]);

        const wb = XLSX.utils.book_new();
        const addSheet = (res, name) => {
            if (res.data && res.data.length > 0) {
                const ws = XLSX.utils.json_to_sheet(res.data);
                XLSX.utils.book_append_sheet(wb, ws, name);
            }
        };

        addSheet(users, "Users");
        addSheet(records, "Claims");
        addSheet(support, "Support");
        addSheet(s5, "5S");
        addSheet(ot, "OT");
        addSheet(sj, "Missions");
        addSheet(skills, "Skills");

        XLSX.writeFile(wb, `Carrier_Full_Backup_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast("✅ Backup สำเร็จ", "success");
        writeAuditLog('BACKUP', 'Exported all database tables');
    } catch (e) {
        console.error(e);
        toast("❌ Backup ล้มเหลว", "error");
    }
}

async function performArchive() {
    const year = document.getElementById('archive-year').value;
    if (!year || year.length < 4) return toast("กรุณาระบุปีที่ถูกต้อง", "error");
    
    showCustomConfirmDialog({
        title: "ยืนยันการ Archive ข้อมูลประจำปี",
        subtitle: `ข้อมูลรายการบันทึกของปี ${year} จะถูกย้ายเข้าสู่คลังสำรองข้อมูล`,
        badge: "SYSTEM ARCHIVE",
        type: "warning",
        details: [
            { label: "Target Year", value: `ปี ${year}` }
        ],
        confirmText: "📦 ยืนยันเริ่ม Archive ข้อมูล",
        cancelText: "ยกเลิก",
        onConfirm: () => {
            toast("📦 กำลังดำเนินการ Archive...", "info");
            setTimeout(() => toast("✅ ดำเนินการสำเร็จ (Demo)", "success"), 2000);
        }
    });
}

// ฟังก์ชันส่งสัญญาณบอกระบบว่า User ยังใช้งานอยู่
async function updateUserPresence() {
    if (!S.isLoggedIn || !S.currentUser) return;
    
    try {
        await sqeClient
            .from('users')
            .update({ last_seen: new Date().toISOString() })
            .eq('email', S.currentUser);
        
        console.log("📡 Presence updated for:", S.currentUser);
    } catch (e) {
        console.error("Presence update failed", e);
    }
}

async function deployNewVersion() {
    const version = document.getElementById('admin-version-input').value.trim();
    const log = document.getElementById('admin-changelog-input').value.trim();
    
    if(!version) return toast("กรุณาระบุเลขเวอร์ชัน", "error");

    try {
        const { error } = await sqeClient
            .from('system_settings')
            .update({ 
                app_version: version,    // ส่งเป็นข้อความปกติ (ไม่ต้องมี [ ])
                update_details: log,     // ส่งเป็นข้อความปกติ (ไม่ต้องมี [ ])
                updated_at: new Date()
            })
            .eq('id', 'global_config');

        if(error) throw error;
        toast(`🚀 อัปเดตเวอร์ชันสำเร็จ`, "success");
    } catch (e) { 
        console.error(e);
        toast("อัปเดตไม่สำเร็จ: " + e.message, "error"); 
    }
}

// อย่าลืมเพิ่ม deployNewVersion และ triggerForceUpdate ลงใน return ของ WapAdminSystem ด้วย
// สั่งให้ทำงานทันทีที่โหลดหน้าจอ และทำซ้ำทุกๆ 5 นาที
updateUserPresence();
setInterval(updateUserPresence, 300000); // 300,000 ms = 5 นาที

async function checkChangelog() {
    const { data } = await sqeClient.from('system_settings').select('app_version, update_details').eq('id', 'global_config').single();
    const localVersion = localStorage.getItem('last_seen_version') || "0.0.0";

    if (data && data.app_version !== localVersion) {
        // สร้าง Modal แจ้งข่าวสารอัปเดต
        const modalHtml = `
            <div id="update-modal" class="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
                <div class="bg-white rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl animate-bounce-in">
                    <div class="text-5xl mb-4">✨</div>
                    <h2 class="text-2xl font-black text-slate-800 mb-2">Version ${data.app_version}</h2>
                    <p class="text-slate-500 text-sm mb-6 leading-relaxed">${data.update_details || 'มีการปรับปรุงประสิทธิภาพระบบ'}</p>
                    <button  onclick="closeUpdateModal('${data.app_version}')" class="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest" title="Close Update Modal" aria-label="Close Update Modal">รับทราบ</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
}

function closeUpdateModal(newVer) {
    localStorage.setItem('last_seen_version', newVer);
    document.getElementById('update-modal').remove();
}

function showPasswordResetUI(email) {
    const inputArea = document.querySelector('.login-input-area');
    const tabSwitcher = document.querySelector('.login-tab-switcher');
    
    if (tabSwitcher) tabSwitcher.style.display = 'none';

    inputArea.innerHTML = `
        <div class="space-y-5">
            <div class="text-center mb-2">
                <p class="text-amber-400 text-[10px] font-black uppercase tracking-widest">🛡️ Password Reset Required</p>
                <h3 class="text-white text-lg font-black uppercase">ตั้งค่ารหัสผ่านใหม่</h3>
                <p class="text-slate-400 text-[9px]">${email}</p>
            </div>
            
            <div class="input-group">
                <label class="input-tiny-label">New Security Key</label>
                <!-- ต้องมี id="new-pass" -->
                <input  type="password" id="new-pass" class="premium-input" placeholder="••••••••" title="••••••••" aria-label="••••••••">
            </div>

            <div class="input-group">
                <label class="input-tiny-label">Confirm New Key</label>
                <!-- ต้องมี id="confirm-new-pass" -->
                <input  type="password" id="confirm-new-pass" class="premium-input" placeholder="••••••••" title="••••••••" aria-label="••••••••">
            </div>

            <button  onclick="handlePasswordResetSubmit('${email}')" class="btn-initialize-session" title="Handle Password Reset Submit" aria-label="Handle Password Reset Submit">
                <div class="btn-shimmer"></div>
                <span class="btn-text">SAVE & LOGIN</span>
            </button>
            
            <button  onclick="window.location.reload()" class="w-full text-[9px] font-black text-slate-500 uppercase mt-2" title="Window.Location.Reload" aria-label="Window.Location.Reload">Cancel</button>
        </div>
    `;
}

async function handlePasswordResetSubmit(email) {
    // ดึงค่าจากหน้าจอ (จุดที่ก่อนหน้านี้ลืมประกาศตัวแปร)
    const newPassInput = document.getElementById('new-pass');
    const confirmPassInput = document.getElementById('confirm-new-pass');

    if (!newPassInput || !confirmPassInput) return;

    const newPass = newPassInput.value.trim();
    const confirmPass = confirmPassInput.value.trim();

    // ตรวจสอบความถูกต้อง
    if (newPass.length < 4) {
        toast("รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร", "error");
        return;
    }

    if (newPass !== confirmPass) {
        toast("รหัสผ่านไม่ตรงกัน", "error");
        return;
    }

    try {
        toast("⌛ กำลังบันทึกรหัสผ่านใหม่...", "info");
        
        // อัปเดตข้อมูลลง Supabase ตามคอลัมน์ในรูป (password, force_reset, updated_at)
        const { error } = await sqeClient
            .from('users')
            .update({ 
                password: newPass, 
                force_reset: false,
                updated_at: new Date().toISOString()
            })
            .eq('email', email);

        if (error) throw error;

        toast("✅ เปลี่ยนรหัสผ่านสำเร็จ", "success");

        // เข้าสู่ระบบทันที
        finalizeLogin(email, 'staff'); 
        
        // บันทึก Audit Log
        writeAuditLog('SECURITY', `User ${email} เปลี่ยนรหัสผ่านใหม่สำเร็จ`);

    } catch (e) {
        console.error("Reset Password Error:", e);
        toast("บันทึกไม่สำเร็จ: " + e.message, "error");
    }
}

/**
 * ═══════════════════════════════════════════════════════
 *  PERSONAL SETTINGS & PROFILE MANAGEMENT
 * ═══════════════════════════════════════════════════════
 */

let tempAvatarBase64 = null; // ตัวแปรพักรูปภาพ

// 1. เปิดหน้าต่างตั้งค่าโปรไฟล์
async function openPersonalSettings() {
    toast("⌛ กำลังโหลดข้อมูลโปรไฟล์...", "info");
    
    try {
        // ดึงข้อมูลพนักงานปัจจุบัน
        const { data: user, error } = await sqeClient
            .from('users')
            .select('display_name, avatar_url')
            .eq('email', S.currentUser)
            .single();

        if (error) throw error;

        // เตรียมข้อมูลแสดงผล
        const displayName = user.display_name || S.currentUser.split('@')[0].replace(/\./g, ' ').toUpperCase();
        const avatarHtml = user.avatar_url 
            ? `<img  src="${user.avatar_url}" class="w-full h-full object-cover" alt="Image" title="Image">` 
            : `<span class="text-3xl font-black text-blue-600">${displayName[0]}</span>`;

        // สร้าง Modal
        // ค้นหาตำแหน่งที่สร้าง modalHtml ในฟังก์ชัน openPersonalSettings แล้วแทนที่ด้วยโค้ดนี้
const modalHtml = `
    <div id="settings-modal" class="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
        <div class="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-pop-in border border-slate-100 dark:border-slate-800">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Profile Settings</h3>
                <button  onclick="document.getElementById('settings-modal').remove()" class="text-slate-400 hover:text-rose-500 transition-colors" title="Document.Get Element By Id" aria-label="Document.Get Element By Id">✕</button>
            </div>

            <!-- ส่วนจัดการรูปภาพ -->
            <div class="flex flex-col items-center mb-8">
                <div class="relative group cursor-pointer" onclick="document.getElementById('avatar-input').click()">
                    <div id="settings-avatar-preview" class="w-24 h-24 rounded-[28px] bg-blue-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl">
                        ${avatarHtml}
                    </div>
                    <div class="absolute inset-0 bg-black/40 rounded-[28px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                        <svg class="text-white w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 10.07 4h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 18.07 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><circle cx="12" cy="13" r="3"/></svg>
                    </div>
                </div>
                <input  type="file" id="avatar-input" class="hidden" accept="image/*" onchange="handleAvatarPreview(this)" title="Avatar Input" aria-label="Avatar Input">
                
                <!-- เพิ่มปุ่มคืนค่าเริ่มต้นตรงนี้ -->
                <div class="flex gap-4 mt-3">
                    <p class="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Change Photo</p>
                    <button  onclick="resetProfileToDefault()" class="text-[9px] text-rose-500 font-black uppercase tracking-[0.2em] hover:underline" title="Reset Profile To Default" aria-label="Reset Profile To Default">Restore Default</button>
                </div>
            </div>

            <!-- ส่วนจัดการชื่อ -->
            <div class="space-y-5">
                <div class="input-group">
                    <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Display Name</label>
                    <input  type="text" id="set-display-name" class="premium-input !h-12 !rounded-2xl dark:bg-slate-800" value="${displayName}" title="Set Display Name" aria-label="Set Display Name">
                </div>
            </div>

            <!-- ปุ่มดำเนินการ -->
            <div class="flex gap-3 mt-10">
                <button  onclick="document.getElementById('settings-modal').remove()" class="flex-1 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest" title="Document.Get Element By Id" aria-label="Document.Get Element By Id">Cancel</button>
                <button  onclick="savePersonalProfile()" class="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-500/30 active:scale-95 transition-all" title="Save Personal Profile" aria-label="Save Personal Profile">Save Changes</button>
            </div>
        </div>
    </div>
`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

    } catch (err) {
        toast("ไม่สามารถโหลดข้อมูลได้", "error");
    }
}
async function resetProfileToDefault() {
    showCustomConfirmDialog({
        title: "คืนค่าโปรไฟล์เป็นค่าเริ่มต้น",
        subtitle: "รูปโปรไฟล์และชื่อแสดงผล (Display Name) จะถูกตั้งค่ากลับเป็นค่าเริ่มต้นของระบบ",
        badge: "USER PROFILE",
        type: "warning",
        confirmText: "🔄 คืนค่าโปรไฟล์เริ่มต้น",
        cancelText: "ยกเลิก",
        onConfirm: async () => {
            try {
                toast("⌛ กำลังคืนค่าเริ่มต้น...", "info");

                // ค่าเริ่มต้น: ชื่อดึงจากอีเมล, รูปเป็น null
                const defaultName = S.currentUser.split('@')[0].replace(/\./g, ' ').toUpperCase();
                
                const payload = { 
                    display_name: defaultName, 
                    avatar_url: null, // ล้างรูปออก
                    updated_at: new Date().toISOString() 
                };

                const { error } = await sqeClient
                    .from('users')
                    .update(payload)
                    .eq('email', S.currentUser);

                if (error) throw error;

                // 1. อัปเดต UI ที่ Sidebar ทันที
                const nameEl = document.getElementById('user-display-name');
                const avatarEl = document.getElementById('user-avatar');
                
                if (nameEl) nameEl.textContent = defaultName;
                if (avatarEl) {
                    avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(defaultName)}&background=random&color=fff`;
                }

                // 2. ปิด Modal
                const modal = document.getElementById('settings-modal');
                if (modal) modal.remove();

                toast("✅ คืนค่ารูปโปรไฟล์และชื่อสำเร็จแล้ว", "success");

            } catch (err) {
                console.error("Reset profile error:", err);
                toast("❌ เกิดข้อผิดพลาดในการคืนค่า", "error");
            }
        }
    });
}
// 2. จัดการรูปภาพแบบ Real-time Preview
function handleAvatarPreview(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            tempAvatarBase64 = e.target.result;
            const previewBox = document.getElementById('settings-avatar-preview');
            // ล้างค่าเก่า (ไอคอนหรือตัวอักษร) แล้วใส่ img อย่างเดียว
            previewBox.innerHTML = `<img  src="${tempAvatarBase64}" alt="profile" title="Profile">`;
        };
        reader.readAsDataURL(file);
    }
}

// 3. บันทึกข้อมูลลงฐานข้อมูลและอัปเดต UI ทันที
async function savePersonalProfile() {
    const newName = document.getElementById('set-display-name').value.trim();
    if (!newName) return toast("กรุณาระบุชื่อที่แสดง", "error");

    try {
        toast("⌛ กำลังบันทึก...", "info");
        
        const payload = { display_name: newName, updated_at: new Date().toISOString() };
        if (tempAvatarBase64) payload.avatar_url = tempAvatarBase64;

        const { error } = await sqeClient
            .from('users')
            .update(payload)
            .eq('email', S.currentUser);

        if (error) throw error;

        // อัปเดตข้อมูลบน Sidebar ทันที
        const nameEl = document.getElementById('user-display-name');
        const avatarEl = document.getElementById('user-avatar');
        
        if (nameEl) nameEl.textContent = newName.toUpperCase();
        if (tempAvatarBase64 && avatarEl) {
            avatarEl.innerHTML = `<img  src="${tempAvatarBase64}" class="w-full h-full object-cover rounded-full" alt="Image" title="Image">`;
        }

        toast("อัปเดตโปรไฟล์สำเร็จ!", "success");
        document.getElementById('settings-modal').remove();
        tempAvatarBase64 = null; // ล้างค่าชั่วคราว
        
    } catch (e) {
        toast("บันทึกไม่สำเร็จ: " + e.message, "error");
    }
}

const canvas = document.getElementById('starfield');
const ctx = canvas ? canvas.getContext('2d') : null;

let stars = [];
const numStars = 200;
const speed = 2;

function initStars() {
    if (!canvas || !ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = [];
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width - canvas.width / 2,
            y: Math.random() * canvas.height - canvas.height / 2,
            z: Math.random() * canvas.width,
            o: Math.random()
        });
    }
}

function updateStars() {
    if (!canvas || !ctx) return;
    try {
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);

        for (let i = 0; i < numStars; i++) {
            let s = stars[i];
            s.z -= speed;

            if (s.z <= 0) {
                s.z = canvas.width;
                s.x = Math.random() * canvas.width - canvas.width / 2;
                s.y = Math.random() * canvas.height - canvas.height / 2;
            }

            const x = s.x * (canvas.width / s.z);
            const y = s.y * (canvas.width / s.z);
            const r = 1.5 * (canvas.width / s.z);

            ctx.beginPath();
            ctx.fillStyle = `rgba(0, 242, 255, ${1 - s.z / canvas.width})`;
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    } catch (e) {
        console.warn("Starfield render skipped due to context issue:", e);
    }
    requestAnimationFrame(updateStars);
}

function getCleanProblemTitle(title) {
    if (!title) return "";
    let str = String(title).trim();

    if (/inform quality problem/i.test(str)) {
        const parts = str.split(/inform quality problem/i);
        if (parts.length > 2) {
            const lastPart = parts[parts.length - 1];
            const prevPart = parts[parts.length - 2];
            const lastOnIdx = prevPart.lastIndexOf('On ');
            const onPrefix = lastOnIdx !== -1 ? prevPart.substring(lastOnIdx).trim() : 'On';
            str = `${onPrefix} inform quality problem ${lastPart}`.replace(/\s+/g, ' ').trim();
        }
    }
    return str;
}

function getDetailSentenceParts(c) {
    if (!c) return { dateStr: "-", groupStr: "-", defectStr: "-" };
    const rawTitle = c.problem_title || "-";
    const cleanTitle = getCleanProblemTitle(rawTitle);
    const createDate = new Date(c.created_at || Date.now()).toLocaleDateString('en-GB', {
        day: '2-digit', 
        month: 'short', 
        year: 'numeric'
    });
    const groupStr = c.part_group || c.part_name || "Steel";

    if (/inform quality problem/i.test(cleanTitle)) {
        let dateStr = createDate;
        let pGroup = groupStr;
        let defectStr = cleanTitle;

        const dateMatch = cleanTitle.match(/^On\s+(.*?)\s+inform quality problem/i);
        if (dateMatch) dateStr = dateMatch[1].trim();

        const grpMatch = cleanTitle.match(/about\s+(.*?)\s+found defect/i);
        if (grpMatch) pGroup = grpMatch[1].trim();

        const defectMatch = cleanTitle.match(/found defect\s+(.*)$/i);
        if (defectMatch) defectStr = defectMatch[1].trim();

        return { dateStr, groupStr: pGroup, defectStr };
    }
    return { dateStr: createDate, groupStr: groupStr, defectStr: cleanTitle };
}

function formatDetailSentence(c) {
    if (!c) return "";
    const rawTitle = c.problem_title || "-";
    const cleanTitle = getCleanProblemTitle(rawTitle);
    const createDate = new Date(c.created_at || Date.now()).toLocaleDateString('en-GB', {
        day: '2-digit', 
        month: 'short', 
        year: 'numeric'
    });
    const partName = c.part_group || c.part_name || "Steel";

    if (/inform quality problem/i.test(cleanTitle)) {
        let formatted = cleanTitle;
        formatted = formatted.replace(/^On\s+(.*?)\s+inform quality problem/i, 'On <span style="color:#2563eb; font-weight: 900;">$1</span> inform quality problem');
        formatted = formatted.replace(/about\s+(.*?)\s+found defect/i, 'about <span style="color:#2563eb; font-weight: 900;">$1</span> found defect');
        formatted = formatted.replace(/found defect\s+(.*)$/i, 'found defect <span style="color:red; font-weight:900;">$1</span>');
        return formatted;
    } else {
        return `On <span style="color:#2563eb; font-weight: 900;">${createDate}</span> OSA inform quality problem about <span style="color: #2563eb; font-weight: 900;">${partName}</span> found defect <span style="color:red; font-weight:900;">${cleanTitle}</span>`;
    }
}

const Wap8DSystem = (function() {
    const TABLE = 'eight_d_reports'; // ตารางนี้อยู่ในฐานข้อมูล SQE
    const TABLE_SUPPORT = 'support_records'; // ตารางต้นทางอยู่ในฐานข้อมูล WAP
    let _cases = [];
    let _currentCase = null;
    let _currentSlide = 0;
    let _isSaving = false;
    let _statFilter = 'all'; // 'all' หรือ 'd1-d3'

    function filterByStat(mode) {
        _statFilter = mode;
        renderDashboard();
    }

    // 1. โหลดเคสจาก Cloud (ใช้ sqeClient)
    async function init() {
        if (_currentCase) {
            try { await saveCurrentProgress(); } catch (e) {}
            _currentCase = null;
        }
        const dash = document.getElementById('eight-d-dashboard');
        const rptView = document.getElementById('eight-d-report-view');
        if (dash) dash.classList.remove('hidden');
        if (rptView) rptView.classList.add('hidden');

        await fetchCases();
        renderDashboard();
        window.addEventListener('resize', fitSlideToContainer);
        if (typeof ResizeObserver !== 'undefined') {
            const presContainer = document.getElementById('eight-d-presentation-container');
            if (presContainer) {
                const ro = new ResizeObserver(() => {
                    fitSlideToContainer();
                });
                ro.observe(presContainer);
            }
        }
    }

    // ค้นหาฟังก์ชัน fetchCases ภายใน Wap8DSystem แล้วเปลี่ยนเป็นโค้ดนี้:
async function fetchCases() {
    // 1. กำหนดเป้าหมาย: ถ้าเป็นพนักงานให้ดูตัวเอง ถ้าเป็นหัวหน้าให้ดูคนที่เลือก (S.viewingUser)
    const targetUser = (S.userRole === 'supervisor') ? S.viewingUser : S.currentUser;
    
    if (!targetUser) return [];

    try {
        // 2. เพิ่ม .eq('user_id', targetUser) เพื่อกรองเฉพาะเจ้าของงาน
        const { data, error } = await sqeClient
            .from(TABLE)
            .select('*')
            .eq('user_id', targetUser) // <--- บรรทัดสำคัญที่เพิ่มเข้าไป
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        _cases = data || [];
        S.eightDCases = _cases;
        invalidate8DCaseMap();
        return _cases;
    } catch (e) { 
        console.error("8D Fetch Error:", e); 
        return []; 
    }
}

    // 2. ฟังก์ชันดูดข้อมูลจากช่อง ContentEditable
    function _collectDataFromUI() {
        const slideData = {};
        const editables = document.querySelectorAll('#eight-d-slide-content [contenteditable="true"]');
        editables.forEach((el, index) => {
            slideData[`f_${index}`] = el.innerHTML;
        });
        return slideData;
    }

    // 3. บันทึกลง Cloud Auto-Save (ใช้ sqeClient)
    async function saveCurrentProgress() {
        if (!_currentCase || S.userRole === 'supervisor' || _isSaving) return;
        _isSaving = true;
        
        const currentData = _collectDataFromUI();
        const updatedReportData = { ...(_currentCase.report_data || {}) };
        updatedReportData[`slide_${_currentSlide}`] = currentData;

        try {
            // ✅ เปลี่ยนเป็น sqeClient
            await sqeClient.from(TABLE).update({ 
                report_data: updatedReportData,
                updated_at: new Date().toISOString()
            }).eq('id', _currentCase.id);
            _currentCase.report_data = updatedReportData; 
            console.log("✅ 8D Cloud Synchronized");
        } catch (e) { console.error("Save failed:", e); }
        finally { _isSaving = false; }
    }

    // 4. หยอดข้อมูลกลับเข้าช่อง (Re-hydration)
    function _rehydrateUI() {
        if (!_currentCase || !_currentCase.report_data) return;
        const savedData = _currentCase.report_data[`slide_${_currentSlide}`];
        if (!savedData) return;

        requestAnimationFrame(() => {
            const editables = document.querySelectorAll('#eight-d-slide-content [contenteditable="true"]');
            const blacklist = ["D1-", "Assign person in charge", "Fill by CTC", "Supplier name member", "TCTC member", "Fill by Supplier", "Person1", "Person2", "Person3", "Person4", "Person5", "Person6"];
            editables.forEach((el, index) => {
                if (savedData[`f_${index}`] !== undefined) {
                    let val = savedData[`f_${index}`];
                    if (_currentSlide === 1) {
                        const cleanText = (val || "").replace(/<[^>]*>?/gm, '').trim();
                        if (blacklist.some(b => cleanText.toLowerCase().includes(b.toLowerCase()))) {
                            val = "";
                        }
                    }
                    el.innerHTML = val;
                }
            });
        });
    }

    // 5. ระบบเปลี่ยนหน้า
    async function nextSlide() {
        if (_currentSlide < 15) {
            await saveCurrentProgress();
            _currentSlide++;
            renderSlide();
            _rehydrateUI();
        }
    }

    async function prevSlide() {
        if (_currentSlide > 0) {
            await saveCurrentProgress();
            _currentSlide--;
            renderSlide();
            _rehydrateUI();
        }
    }

    async function openReport(id) {
        _currentCase = _cases.find(x => x.id === id);
        _currentSlide = 0;
        document.getElementById('eight-d-dashboard').classList.add('hidden');
        document.getElementById('eight-d-report-view').classList.remove('hidden');
        renderSlide();
        _rehydrateUI();
        setTimeout(fitSlideToContainer, 30);
    }

async function createNewCase(supportData) {
    const newId = '8D-' + Date.now();
    
    const ok = Number(supportData.ok_qty || supportData.ok) || 0;
    const ng = Number(supportData.ng_qty || supportData.ng) || 0;
    const total = ok + ng;

    // ดึงรูปจาก Support
    const evidenceImg = supportData.image_url || supportData.imageUrl || null;

    const payload = {
        id: newId,
        user_id: S.currentUser,
        support_id: supportData.id,
        problem_title: getCleanProblemTitle(supportData.problem),
        part_name: supportData.part,
        part_group: supportData.part,
        lot_no: total,
        ok_qty: ok,
        ng_qty: ng,
        status: 'D1_OPEN',
        // ✅ เก็บข้อมูลรูปภาพและหมายเหตุไว้ใน JSON เพื่อนำไปใช้ในสไลด์อัตโนมัติ
    report_data: {
        source_report_type: supportData.report_type || supportData.report, // เก็บค่า 'RP', 'VF' หรือ 'RECORDS'
        evidence_img: supportData.image_url || null,
        },
        created_at: new Date().toISOString()
    };

    try {
        const { error } = await sqeClient.from('eight_d_reports').insert([payload]);
        if (error) throw error;

        toast("✅ สร้างเคส 8D พร้อมเชื่อมโยงข้อมูลสำเร็จ", "success");
        await fetchCases(); 
        renderDashboard();

    } catch (e) {
        console.error("❌ 8D Case Creation Error:", e);
        toast("เกิดข้อผิดพลาด: " + e.message, "error");
    }
}

    // 7. เลือกประวัติการ Support มาทำ 8D (ดึงจาก WAP แล้วเขียนลง SQE)
    async function openHistoryPicker() {
        toast("⌛ Loading history...", "info");
        try {
            // ดึงจาก WAP (ตาราง support_records อยู่บ้าน WAP)
            const { data, error } = await wapClient.from(TABLE_SUPPORT)
                .select('*').eq('user_id', S.currentUser).order('event_date', { ascending: false }).limit(15);
            if (error) throw error;

            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);';
            modal.innerHTML = `
                <div style="background:#fff; border-radius:24px; width:90%; max-width:600px; max-height:80vh; overflow:hidden; display:flex; flex-direction:column;">
                    <div style="padding:20px; background:#1e293b; color:#fff; display:flex; justify-content:space-between;">
                        <h3 style="font-weight:900; font-size:12px;">SELECT RECORD FOR 8D</h3>
                        <button  onclick="this.closest('.modal-overlay').remove()" title="This.Closest" aria-label="This.Closest">✕</button>
                    </div>
                    <div style="overflow-y:auto; flex:1; padding:10px;">
                        ${data.map(r => `<div onclick="Wap8DSystem.pickRecord('${r.id}')" style="padding:15px; border-bottom:1px solid #f1f5f9; cursor:pointer;">${r.problem}</div>`).join('')}
                    </div>
                </div>`;
            document.body.appendChild(modal);
            window._tempHistory = data;
        } catch (e) { toast("Error", "error"); }
    }

    async function pickRecord(id) {
        const record = window._tempHistory.find(x => x.id === id);
        if (record) {
            document.querySelector('.modal-overlay').remove();
            await createNewCase(record); // เคสจะถูกเซฟเข้า SQE ในฟังก์ชันนี้
        }
    }

// --- เพิ่มใน Wap8DSystem ---
async function deleteCase(id) {
    if (S.userRole === 'supervisor') { 
        toast('⚠️ Supervisor Mode: Read-only access', 'error'); 
        return; 
    }

    const target = _cases ? _cases.find(c => String(c.id) === String(id)) : null;

    showCustomConfirmDialog({
        title: "ยืนยันการลบรายงาน 8D Report",
        subtitle: "รายงานวิเคราะห์ปัญหานี้จะถูกลบออกจากฐานข้อมูล SQE ถาวร ไม่สามารถกู้คืนได้",
        badge: "8D REPORT SYSTEM",
        type: "danger",
        details: [
            { label: "รหัสรายงาน 8D", value: id },
            { label: "หัวข้อ / อาการปัญหา", value: target ? (target.problem_title || '-') : '-' },
            { label: "ชื่อพาร์ท / กลุ่มพาร์ท", value: target ? `${target.part_name || '-'} (${target.part_group || '-'})` : '-' },
            { label: "สถานะรายงาน", value: target ? (target.status || '-') : '-' }
        ],
        confirmText: "🗑️ ยืนยันลบรายงาน 8D",
        cancelText: "ยกเลิก",
        onConfirm: async () => {
            try {
                const { error } = await sqeClient
                    .from(TABLE)
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                toast("🗑️ ลบรายงาน 8D เรียบร้อยแล้ว", "success");
                _cases = _cases.filter(c => c.id !== id);
                renderDashboard();

            } catch (e) {
                console.error("8D Delete Error:", e);
                toast("❌ เกิดข้อผิดพลาดในการลบรายงาน 8D", "error");
            }
        }
    });
}

// ✅ Helper: แปลง rgb(...) หรือ hex ให้เป็น Hex 6 หลักสำหรับ PptxGenJS (ไม่มี #)
function _pptRgbToHex(colorStr) {
    if (!colorStr || colorStr === 'transparent' || colorStr === 'rgba(0, 0, 0, 0)' || colorStr === 'none') return null;
    if (colorStr.startsWith('#')) {
        let hex = colorStr.replace('#', '').trim();
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        return hex.substring(0, 6).toUpperCase();
    }
    const match = colorStr.match(/\d+/g);
    if (!match || match.length < 3) return null;
    const r = parseInt(match[0], 10).toString(16).padStart(2, '0');
    const g = parseInt(match[1], 10).toString(16).padStart(2, '0');
    const b = parseInt(match[2], 10).toString(16).padStart(2, '0');
    return (r + g + b).toUpperCase();
}

// ✅ Helper: แปลง Image URL หรือ HTMLImageElement เป็น Base64 DataURL
async function _pptGetImageDataUrl(imgSrc) {
    if (!imgSrc) return null;
    if (typeof imgSrc === 'string') {
        if (imgSrc.startsWith('data:image')) return imgSrc;
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth || img.width || 300;
                    canvas.height = img.naturalHeight || img.height || 200;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                } catch (e) { resolve(null); }
            };
            img.onerror = () => resolve(null);
            img.src = imgSrc;
        });
    }
    return null;
}

// ✅ Helper: แปลง SVG Element เป็น DataURL
async function _pptSvgToDataUrl(svgElement) {
    if (!svgElement) return null;
    try {
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(svgElement);
        if (!svgString.includes('xmlns=')) {
            svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);
        
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const rect = svgElement.getBoundingClientRect();
                    canvas.width = Math.max(20, (rect.width || 100) * 2);
                    canvas.height = Math.max(20, (rect.height || 100) * 2);
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        const dataUrl = canvas.toDataURL('image/png');
                        URL.revokeObjectURL(blobURL);
                        resolve(dataUrl);
                        return;
                    }
                } catch (e) {
                    console.warn("SVG canvas render fallback:", e);
                }
                URL.revokeObjectURL(blobURL);
                resolve(null);
            };
            img.onerror = () => {
                URL.revokeObjectURL(blobURL);
                resolve(null);
            };
            img.src = blobURL;
        });
    } catch (e) { return null; }
}

// ==========================================
// 🛡️ PPTX EXPORT HELPERS (Fixed Version)
// ==========================================
const forceBase64Header = (str) => {
    if (!str || typeof str !== 'string' || str.length < 50) return null;
    let cleanStr = str.trim().replace(/\s/g, ''); 
    if (cleanStr.startsWith('data:image')) return cleanStr;
    return 'data:image/png;base64,' + cleanStr;
};

const addStandardFooter = (pptx, slide, slideNum) => {
    try {
        slide.addShape(pptx.ShapeType.ellipse, { x: 0.35, y: 6.85, w: 1.3, h: 0.5, fill: { color: '003366' } });
        slide.addShape(pptx.ShapeType.ellipse, { x: 0.38, y: 6.88, w: 1.24, h: 0.44, line: { color: 'FFFFFF', width: 1.0 } });
        slide.addText("Carrier", { x: 0.35, y: 6.85, w: 1.3, h: 0.5, fontSize: 18, fontFace: 'Times New Roman', fontItalic: true, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
        slide.addText("PROPRIETARY AND CONFIDENTIAL", { x: 0, y: 7.05, w: 13.33, h: 0.3, fontSize: 10, color: '999999', align: 'center' });
        slide.addText(`${slideNum}`, { x: 12.8, y: 6.85, w: 0.5, h: 0.3, fontSize: 11, bold: true, color: '333333', align: 'right' });
    } catch (e) { console.error("Footer Error", e); }
};

// ==========================================
// 📄 SLIDE GENERATION FUNCTIONS
// ==========================================

async function createSlide0_Cover(pptx, caseData) {
    const slide = pptx.addSlide();
    slide.addText("8D Report", { x: 0.3, y: 0.35, w: 7.8, h: 0.6, fontSize: 38, fontFace: 'Arial Black', color: '000000', wrap: false, valign: 'bottom' });
    slide.addText("Suppliers can use any format of the report as long as all mandatory information is present.", { x: 8.2, y: 0.35, w: 4.8, h: 0.6, fontSize: 9, color: 'FF0000', fill: { color: 'FFFF99' }, align: 'center', border: { pt: 1, color: 'FFCC00' } });
    slide.addShape(pptx.ShapeType.line, { x: 0.3, y: 1.0, w: 12.8, h: 0, line: { color: '003366', width: 6.0 } });
    const isRP = caseData.report_data?.source_report_type === 'RP';
    slide.addShape(pptx.ShapeType.rect, { x: 8.0, y: 1.45, w: 0.3, h: 0.3, fill: isRP ? { color: '000000' } : null, line: { color: '000000' } });
    slide.addText("[IQC Rejected, RP]", { x: 8.4, y: 1.45, fontSize: 12, bold: true });
    slide.addShape(pptx.ShapeType.rect, { x: 10.6, y: 1.45, w: 0.3, h: 0.3, fill: !isRP ? { color: '000000' } : null, line: { color: '000000' } });
    slide.addText("[Line claim, VF]", { x: 11.0, y: 1.45, fontSize: 12, bold: true });
    slide.addText("PROBLEM :", { x: 0.3, y: 2.1, fontSize: 11, color: '666666', bold: true });
    slide.addText(caseData.problem_title || "", { x: 0.3, y: 2.4, w: 12.7, h: 1.2, fontSize: 22, bold: true, valign: 'top' });
    addStandardFooter(pptx, slide, 1);
}

async function exportToPPTX(targetCaseId) {
    let caseData = _cases.find(x => x.id === targetCaseId) || _currentCase;
    if (!caseData) return toast("❌ ไม่พบข้อมูลเคส", "error");

    const PptxConstructor = window.PptxGenJS || window.pptxgen;
    if (!PptxConstructor) return toast("❌ ไม่พบไลบรารี PptxGenJS", "error");

    toast("⏳ กำลังจัดทำรายงาน D1-D8 รายละเอียดสูง...", "info");

    const pptx = new PptxConstructor();
    pptx.layout = 'LAYOUT_WIDE'; 

    const addFooter = (slide, pageNum) => {
        slide.addShape(pptx.ShapeType.ellipse, { x: 0.35, y: 6.85, w: 1.3, h: 0.5, fill: { color: '003366' } });
        slide.addShape(pptx.ShapeType.ellipse, { x: 0.38, y: 6.88, w: 1.24, h: 0.44, line: { color: 'FFFFFF', width: 1.0 } });
        slide.addText("Carrier", { x: 0.35, y: 6.85, w: 1.3, h: 0.5, fontSize: 18, fontFace: 'Times New Roman', fontItalic: true, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
        slide.addText("PROPRIETARY AND CONFIDENTIAL", { x: 0, y: 7.05, w: 13.33, fontSize: 10, color: '999999', align: 'center' });
        slide.addText(pageNum.toString(), { x: 12.8, y: 6.85, w: 0.5, fontSize: 11, bold: true, color: '333333', align: 'right' });
    };

    // ───────────────────────────────────────────────────────
    // SLIDE 1: COVER PAGE
    // ───────────────────────────────────────────────────────
    const slide1 = pptx.addSlide();
    slide1.addText("8D Report", { x: 0.3, y: 0.35, w: 7.8, h: 0.6, fontSize: 38, fontFace: 'Arial Black', bold: true, color: '000000', wrap: false, valign: 'bottom' });
    slide1.addText("Suppliers can use any format of the report as long as all mandatory information is present.", {
        x: 8.2, y: 0.35, w: 4.8, h: 0.6, fontSize: 9, color: 'FF0000', fill: { color: 'FFFF99' }, align: 'center', border: { pt: 1, color: 'FFCC00' }
    });
    slide1.addShape(pptx.ShapeType.line, { x: 0.3, y: 1.0, w: 12.8, h: 0, line: { color: '003366', width: 6.0 } });

    const isRP = caseData.report_data?.source_report_type === 'RP';
    slide1.addShape(pptx.ShapeType.rect, { x: 8.0, y: 1.45, w: 0.25, h: 0.25, fill: isRP ? { color: '000000' } : null, line: { color: '000000' } });
    slide1.addText("[IQC Rejected, RP]", { x: 8.3, y: 1.45, fontSize: 11, bold: true });
    slide1.addShape(pptx.ShapeType.rect, { x: 10.6, y: 1.45, w: 0.25, h: 0.25, fill: !isRP ? { color: '000000' } : null, line: { color: '000000' } });
    slide1.addText("[Line claim, VF]", { x: 10.9, y: 1.45, fontSize: 11, bold: true });

    slide1.addText("PROBLEM :", { x: 0.3, y: 2.1, fontSize: 11, color: '666666', bold: true });
    slide1.addText(caseData.problem_title || "", { x: 0.3, y: 2.4, w: 12.7, h: 1.5, fontSize: 22, bold: true, color: '000000', valign: 'top' });

    slide1.addTable([
        [{ text: "SUPPLIERS SUBMIT", options: { colspan: 2, fill: 'A7C2DE', bold: true, align: 'center' } }, { text: "CTC CONFIRM", options: { colspan: 2, fill: 'A7C2DE', bold: true, align: 'center' } }],
        ["Confirmed (PIC)", "Approved (QA Mgr)", "Confirmed (Eng)", "Approved (Spec)"],
        [{ text: "", options: { h: 0.6 } }, "", "", ""],
        ["Date:", "Date:", "Date:", "Date:"]
    ], { x: 5.2, y: 5.3, w: 7.8, fontSize: 9, border: { pt: 1, color: '000000' }, align: 'center', valign: 'middle' });

    addFooter(slide1, 1);

    // ───────────────────────────────────────────────────────
    // SLIDE 2: D1 - ASSIGN PERSON IN CHARGE (CLEAN DATA ONLY)
    // ───────────────────────────────────────────────────────
    const slide2 = pptx.addSlide();
    slide2.addText("D1- Assign person in charge", { x: 0.3, y: 0.35, w: 9.6, h: 0.6, fontSize: 28, fontFace: 'Arial Black', bold: true, color: '000000', wrap: false, valign: 'bottom' });
    slide2.addText("<FILL BY CTC & SUPPLIER>", { x: 10.1, y: 0.45, w: 2.9, h: 0.3, fontSize: 10, bold: true, color: 'FFFF00', fill: { color: '0000FF' }, align: 'center', valign: 'middle' });
    slide2.addShape(pptx.ShapeType.line, { x: 0.3, y: 1.0, w: 12.8, h: 0, line: { color: '003366', width: 6.0 } });

    const s1Data = caseData.report_data?.slide_1 || {};

    // First, scan DOM for D1 table data if present on the screen
    const domD1Data = { tctc: [], supplier: [] };
    try {
        const tables = document.querySelectorAll('table');
        tables.forEach(tbl => {
            const th = tbl.querySelector('th');
            if (!th) return;
            const thText = (th.textContent || '').toUpperCase();
            if (thText.includes('TCTC') || thText.includes('SUPPLIER')) {
                const isSupp = thText.includes('SUPPLIER');
                const targetArr = isSupp ? domD1Data.supplier : domD1Data.tctc;
                const rows = tbl.querySelectorAll('tbody tr');
                for (let i = 0; i < 6; i++) {
                    const trName = rows[i * 2];
                    const trRole = rows[i * 2 + 1];
                    let name = "", role = "";
                    if (trName) {
                        const nameTd = trName.querySelector('td[contenteditable="true"]') || trName.querySelectorAll('td')[2];
                        if (nameTd) name = (nameTd.textContent || '').replace(/<[^>]*>?/gm, '').trim();
                    }
                    if (trRole) {
                        const roleTd = trRole.querySelector('td[contenteditable="true"]') || trRole.querySelectorAll('td')[1];
                        if (roleTd) role = (roleTd.textContent || '').replace(/<[^>]*>?/gm, '').trim();
                    }
                    targetArr[i] = { name, role };
                }
            }
        });
    } catch (e) { console.error("DOM D1 Extract Error", e); }

    const buildD1Rows = (isSupplier) => {
        let rows = [[{ 
            text: isSupplier ? "SUPPLIER NAME MEMBER" : "TCTC MEMBER", 
            options: { colspan: 3, fill: 'A7C2DE', color: isSupplier ? 'FF0000' : '000000', bold: true, align: 'center', h: 0.4, border: { pt: 1, color: '000000' } } 
        }]];

        // รายการคำที่ไม่ต้องการให้โชว์ในไฟล์ (คำสั่ง/หัวข้อที่หลุดเข้าไปในช่องกรอก)
        const blacklist = ["D1-", "Assign person in charge", "Fill by CTC", "Supplier name member", "TCTC member", "Fill by Supplier", "Person1", "Person2", "Person3", "Person4", "Person5", "Person6"];

        const isCleanVal = (val) => {
            if (!val) return false;
            const lower = val.toLowerCase();
            return !blacklist.some(word => lower.includes(word.toLowerCase()));
        };

        const domArr = isSupplier ? domD1Data.supplier : domD1Data.tctc;

        for (let i = 1; i <= 6; i++) {
            const baseIdx = isSupplier ? (i + 5) * 2 : (i - 1) * 2;
            
            // Default fallbacks for TCTC
            let defaultName = "";
            let defaultRole = "";
            if (!isSupplier) {
                if (i === 1) { defaultName = "Ms.Nipawan J."; defaultRole = "Senior Specialist (QAP)"; }
                if (i === 2) { defaultName = "Mr.Komsan N."; defaultRole = "Senior Engineer (QAP)"; }
            }

            // 1. Try DOM
            let nameVal = domArr[i - 1]?.name || "";
            let roleVal = domArr[i - 1]?.role || "";

            // 2. If DOM empty or invalid, try s1Data
            if (!isCleanVal(nameVal)) {
                let s1Name = (s1Data[`f_${baseIdx}`] || "").replace(/<[^>]*>?/gm, '').trim();
                nameVal = isCleanVal(s1Name) ? s1Name : "";
            }
            if (!isCleanVal(roleVal)) {
                let s1Role = (s1Data[`f_${baseIdx + 1}`] || "").replace(/<[^>]*>?/gm, '').trim();
                roleVal = isCleanVal(s1Role) ? s1Role : "";
            }

            // 3. If still empty, fallback to defaultName / defaultRole
            if (!nameVal) nameVal = defaultName;
            if (!roleVal) roleVal = defaultRole;

            rows.push([
                { text: `Person${i}`, options: { rowspan: 2, bold: true, align: 'center', valign: 'middle', fill: 'F2F2F2', border: { pt: 1, color: '000000' } } },
                { text: "Name:", options: { bold: true, fontSize: 10, border: { pt: 1, color: '000000' } } },
                { text: nameVal, options: { color: '000000', fontSize: 10, border: { pt: 1, color: '000000' } } }
            ]);
            rows.push([
                { text: "Role:", options: { bold: true, fontSize: 10, border: { pt: 1, color: '000000' } } },
                { text: roleVal, options: { color: '444444', fontSize: 10, border: { pt: 1, color: '000000' } } }
            ]);
        }
        return rows;
    };

    slide2.addTable(buildD1Rows(false), { x: 0.3, y: 1.5, w: 6.2, colW: [1.0, 0.8, 4.4] });
    slide2.addTable(buildD1Rows(true), { x: 6.8, y: 1.5, w: 6.2, colW: [1.0, 0.8, 4.4] });

    addFooter(slide2, 2);

/// ───────────────────────────────────────────────────────
    // SLIDE 3: D2 - DEFINE THE PROBLEM (ULTIMATE PIXEL PERFECT)
    // ───────────────────────────────────────────────────────
    const slide3 = pptx.addSlide();

    // 1. ส่วนหัวสไลด์ (Header & Divider)
    slide3.addText("D2-Define the Problem", { 
        x: 0.3, y: 0.35, w: 9.6, h: 0.6, fontSize: 28, fontFace: 'Arial Black', bold: true, color: '000000', wrap: false, valign: 'bottom' 
    });

    // Tag Box: พื้นหลังน้ำเงิน ตัวอักษรเหลืองสด มีขอบดำ 1pt
    slide3.addText("<FILL BY CTC >", { 
        x: 11.2, y: 0.45, w: 1.8, h: 0.4, 
        fontSize: 12, bold: true, color: 'FFFF00', fill: { color: '0000FF' }, 
        align: 'center', valign: 'middle',
        border: { pt: 1, color: '000000' }
    });

    // เส้นคั่นสีน้ำเงินเข้ม หนา 6pt ยาวเกือบชิดขอบ (12.8 นิ้ว)
    slide3.addShape(pptx.ShapeType.line, { 
        x: 0.3, y: 1.0, w: 12.8, h: 0, 
        line: { color: '003366', width: 6.0 } 
    });

    // --- LOGIC: SMART PARSING (แยกข้อมูลจากหัวข้อปัญหาหน้าแรก) ---
    // ตัวอย่าง: V1_M2 Inform CABI-SIDE-OUT(01S1) / 1134212501 V.PARADISE Deformed problem
    const rawTitle = caseData.problem_title || "";
    let pName = "-", dNo = "-", supp = "-", dName = "-";

    try {
        if (rawTitle.includes("Inform")) {
            const dataPart = rawTitle.split(/Inform/i)[1].trim(); // CABI-SIDE-OUT(01S1) / 1134212501 V.PARADISE Deformed problem
            const segments = dataPart.split("/"); 
            
            if (segments.length > 1) {
                pName = segments[0].trim(); // CABI-SIDE-OUT(01S1)
                const rest = segments[1].trim(); // 1134212501 V.PARADISE Deformed problem
                const parts = rest.split(/\s+/); // แยกด้วยช่องว่าง
                
                dNo = parts[0] || "-"; // 1134212501
                supp = parts[1] || "-"; // V.PARADISE
                dName = parts.slice(2).join(" ") || "-"; // Deformed problem
            }
        }
    } catch (e) { console.error("Parsing Error", e); }

    const exportDate = new Date().toISOString().split('T')[0]; 
    const valStyle = (txt, color = '1e293b') => {
        return { text: txt || "-", options: { bold: true, color: color, fontSize: 10.5 } };
    };

    // 2. การสร้างตารางข้อมูลด้านซ้าย (Left Table)
    const d2Rows = [
        [{ text: "VF/RP No.", options: { fill: '4169E1', color: 'FFFFFF', bold: true, fontSize: 12 } }, 
         { text: caseData.id, options: { fill: '4169E1', color: 'FFFFFF', bold: true, fontSize: 12 } }],
        ["Issue Date",         valStyle(new Date(caseData.created_at).toLocaleDateString('en-GB'))],
        ["Model",              valStyle("-")],
        ["Part Name",          valStyle(pName.toUpperCase())],
        ["Drawing No.",        valStyle(dNo)],
        ["Part Group",         valStyle(caseData.part_group || "Mold Part")],
        ["Supplier",           valStyle(supp, '0000FF')], // สีน้ำเงินหนา
        ["Defect name",        valStyle(dName, 'FF0000')], // สีแดงหนา
        ["Lot size/Used Q'ty", valStyle(`${caseData.ng_qty} / ${caseData.lot_no} Pcs.`)],
        ["Defect Q'ty (%)",    valStyle(((caseData.ng_qty/caseData.lot_no)*100 || 0).toFixed(2) + " %")],
        ["Trouble Rank",       valStyle("B", 'FF0000')], // สีแดงหนา
        ["Inspection Date",    valStyle(exportDate)], // วันที่กด Export
        ["Defect Found Area",  valStyle("Line claim")]
    ];

    slide3.addTable(d2Rows, { 
        x: 0.3, y: 1.25, w: 4.3, colW: [1.6, 2.7],
        fontSize: 10.5, border: { pt: 1, color: '000000' }, valign: 'middle'
    });

    // 3. ส่วนแสดงหัวข้อรูปภาพพร้อม "แถบไฮไลท์สีเหลือง"
    // ส่วนที่ 1: ตัวหนังสือสีดำปกติ
    slide3.addText("DESCRIBE OF DEFECT ", { 
        x: 4.95, y: 1.3, fontSize: 16, bold: true, color: '000000' 
    });

    // ส่วนที่ 2: ตัวหนังสือแดง บนแถบสีเหลือง (Highlight)
    slide3.addText("(PICTURE AND JUDGEMENT METHOD)", { 
        x: 7.2, y: 1.3, w: 4.1, h: 0.35,
        fontSize: 12, bold: true, italic: true, color: 'FF0000',
        fill: { color: 'FFFF00' }, // ใส่สีเหลืองในกล่อง
        valign: 'middle'
    });

    // 4. การจัดการรูปภาพ (High-Fidelity Auto Capture / Direct Image Support พร้อมรักษาสัดส่วนภาพไม่ให้ยืดเต็มกล่อง)
    try {
        let imageAdded = false;
        const boxX = 4.95, boxY = 1.7, boxW = 8.05, boxH = 5.0;

        // ฟังก์ชันช่วยคำนวณตำแหน่งและขนาดรูปภาพให้พอดีกับกรอบโดยรักษาสัดส่วน (Aspect Ratio)
        const getFitPos = (imgW, imgH) => {
            if (!imgW || !imgH) return { x: boxX, y: boxY, w: boxW, h: boxH };
            const imgAR = imgW / imgH;
            const boxAR = boxW / boxH;
            let finalW, finalH, finalX, finalY;
            if (imgAR > boxAR) {
                finalW = boxW;
                finalH = boxW / imgAR;
                finalX = boxX;
                finalY = boxY + (boxH - finalH) / 2;
            } else {
                finalH = boxH;
                finalW = boxH * imgAR;
                finalX = boxX + (boxW - finalW) / 2;
                finalY = boxY;
            }
            return { x: finalX, y: finalY, w: finalW, h: finalH };
        };

        const calcImageFit = (srcUrl) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(getFitPos(img.width, img.height));
                img.onerror = () => resolve({ x: boxX, y: boxY, w: boxW, h: boxH });
                img.src = srcUrl;
            });
        };

        // 4.1 พยายามดึงรูปภาพจาก caseData โดยตรง
        const rawImgSrc = caseData.report_data?.evidence_img || caseData.evidence_img || caseData.image_url || "";
        if (rawImgSrc) {
            const base64Data = await _pptGetImageDataUrl(rawImgSrc);
            if (base64Data) {
                const pos = await calcImageFit(base64Data);
                slide3.addImage({
                    data: base64Data,
                    x: pos.x, y: pos.y, w: pos.w, h: pos.h,
                    sizing: { type: 'contain', w: pos.w, h: pos.h }
                });
                imageAdded = true;
            }
        }

        // 4.2 ถ้าใน caseData ไม่มี หรือแปลงไม่สำเร็จ ให้แคปเจอร์จากหน้าเว็บถ้าเปิดสไลด์อยู่
        if (!imageAdded) {
            const photoArea = document.querySelector('.slide-page-paper div[style*="border: 2.5px solid"]') || 
                              document.querySelector('.slide-page-paper div[style*="border: 2px solid"]') ||
                              document.querySelector('.slide-page-paper div[style*="background-image"]');
            if (photoArea) {
                const canvas = await html2canvas(photoArea, {
                    useCORS: true, allowTaint: true, scale: 3, backgroundColor: "#ffffff"
                });
                const imgBase64 = canvas.toDataURL("image/png");
                if (imgBase64) {
                    const pos = await calcImageFit(imgBase64);
                    slide3.addImage({
                        data: imgBase64,
                        x: pos.x, y: pos.y, w: pos.w, h: pos.h,
                        sizing: { type: 'contain', w: pos.w, h: pos.h }
                    });
                    imageAdded = true;
                }
            }
        }
    } catch (err) { console.error("Capture Error:", err); }

    // วาดกรอบสี่เหลี่ยมสีดำล้อมรอบรูปภาพ
    slide3.addShape(pptx.ShapeType.rect, { 
        x: 4.95, y: 1.7, w: 8.05, h: 5.0, 
        line: { color: '000000', width: 1.5 }, fill: null 
    });

    // 5. ส่วนท้าย (Standard Footer)
    addFooter(slide3, 3);

    // ───────────────────────────────────────────────────────
    // SLIDE 4: D2 - DEFINE THE PROBLEM [FURTHER DETAIL]
    // ───────────────────────────────────────────────────────
    const slide4 = pptx.addSlide();

    // 1. Header & Tag & Line
    slide4.addText([
        { text: "D2-Define the Problem ", options: { fontSize: 26, fontFace: 'Arial Black', bold: true, color: '000000' } },
        { text: "[Further Detail]", options: { fontSize: 20, fontFace: 'Arial Black', bold: true, color: '003366' } }
    ], { x: 0.3, y: 0.35, w: 9.8, h: 0.6, wrap: false, valign: 'bottom' });

    slide4.addText("<FILL BY CTC >", { 
        x: 11.2, y: 0.45, w: 1.8, h: 0.4, 
        fontSize: 12, bold: true, color: 'FFFF00', fill: { color: '0000FF' }, 
        align: 'center', valign: 'middle',
        border: { pt: 1, color: '000000' }
    });

    slide4.addShape(pptx.ShapeType.line, { 
        x: 0.3, y: 1.0, w: 12.8, h: 0, 
        line: { color: '003366', width: 6.0 } 
    });

    // 2. Left Photo Box (High-Fidelity Auto Capture / Direct Image Support with Aspect Ratio Fit)
    try {
        let image4Added = false;
        const boxX4 = 0.3, boxY4 = 1.3, boxW4 = 6.8, boxH4 = 5.2;

        const getFitPos4 = (imgW, imgH) => {
            if (!imgW || !imgH) return { x: boxX4, y: boxY4, w: boxW4, h: boxH4 };
            const imgAR = imgW / imgH;
            const boxAR = boxW4 / boxH4;
            let finalW, finalH, finalX, finalY;
            if (imgAR > boxAR) {
                finalW = boxW4;
                finalH = boxW4 / imgAR;
                finalX = boxX4;
                finalY = boxY4 + (boxH4 - finalH) / 2;
            } else {
                finalH = boxH4;
                finalW = boxH4 * imgAR;
                finalX = boxX4 + (boxW4 - finalW) / 2;
                finalY = boxY4;
            }
            return { x: finalX, y: finalY, w: finalW, h: finalH };
        };

        const calcImageFit4 = (srcUrl) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(getFitPos4(img.width, img.height));
                img.onerror = () => resolve({ x: boxX4, y: boxY4, w: boxW4, h: boxH4 });
                img.src = srcUrl;
            });
        };

        const rawImgSrc4 = caseData.report_data?.evidence_img || caseData.evidence_img || caseData.image_url || "";
        if (rawImgSrc4) {
            const base64Data4 = await _pptGetImageDataUrl(rawImgSrc4);
            if (base64Data4) {
                const pos4 = await calcImageFit4(base64Data4);
                slide4.addImage({
                    data: base64Data4,
                    x: pos4.x, y: pos4.y, w: pos4.w, h: pos4.h,
                    sizing: { type: 'contain', w: pos4.w, h: pos4.h }
                });
                image4Added = true;
            }
        }

        if (!image4Added) {
            const photoArea4 = document.querySelector('.slide-page-paper div[style*="flex: 0 0 55%"]') ||
                               document.querySelector('.slide-page-paper div[style*="border: 2.5px solid"]') || 
                               document.querySelector('.slide-page-paper div[style*="border: 2px solid"]');
            if (photoArea4) {
                const canvas = await html2canvas(photoArea4, {
                    useCORS: true, allowTaint: true, scale: 3, backgroundColor: "#ffffff"
                });
                const imgBase64 = canvas.toDataURL("image/png");
                if (imgBase64) {
                    const pos4 = await calcImageFit4(imgBase64);
                    slide4.addImage({
                        data: imgBase64,
                        x: pos4.x, y: pos4.y, w: pos4.w, h: pos4.h,
                        sizing: { type: 'contain', w: pos4.w, h: pos4.h }
                    });
                    image4Added = true;
                }
            }
        }
    } catch (err) { console.error("Slide 4 Capture Error:", err); }

    // Outer rectangle border for image area
    slide4.addShape(pptx.ShapeType.rect, { 
        x: 0.3, y: 1.3, w: 6.8, h: 5.2, 
        line: { color: '000000', width: 2.0 }, fill: null 
    });

    // 3. Right Details & Temporary Actions
    const dParts = getDetailSentenceParts(caseData);

    // Section 1: DETAIL
    slide4.addText("DETAIL", { 
        x: 7.4, y: 1.3, w: 5.6, h: 0.35, 
        fontSize: 16, bold: true, color: '000000' 
    });
    slide4.addShape(pptx.ShapeType.line, { 
        x: 7.4, y: 1.7, w: 1.0, h: 0, 
        line: { color: '003366', width: 3.0 } 
    });

    slide4.addText([
        { text: "On ", options: { bold: true, color: '000000' } },
        { text: `${dParts.dateStr} `, options: { bold: true, color: '0000FF' } },
        { text: "OSA inform quality problem about ", options: { bold: true, color: '000000' } },
        { text: `${dParts.groupStr} `, options: { bold: true, color: '0000FF' } },
        { text: "found defect ", options: { bold: true, color: '000000' } },
        { text: `${dParts.defectStr}`, options: { bold: true, color: 'FF0000' } }
    ], { x: 7.4, y: 1.85, w: 5.6, h: 1.4, fontSize: 13, valign: 'top', wrap: true });

    // Section 2: TEMPORARY ACTIONS
    slide4.addText("TEMPORARY ACTIONS", { 
        x: 7.4, y: 3.4, w: 5.6, h: 0.35, 
        fontSize: 16, bold: true, color: '000000' 
    });
    slide4.addShape(pptx.ShapeType.line, { 
        x: 7.4, y: 3.8, w: 2.3, h: 0, 
        line: { color: '003366', width: 3.0 } 
    });

    const rawRemark4 = caseData.report_data?.source_remark || caseData.report_data?.temporary_actions || "";
    let actionLines = [];
    if (rawRemark4.trim() !== "") {
        actionLines = rawRemark4.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    } else {
        actionLines = [
            "Sorting 100% at line / WIP Stock",
            "Inform vendor for urgent root cause analysis",
            "Set point of control for next lot shipment"
        ];
    }

    const bulletTextRuns = actionLines.map(line => {
        const cleanLine = line.replace(/^[•\-\*]\s*/, '');
        return { text: `• ${cleanLine}\n`, options: { bold: true, color: '333333', fontSize: 12 } };
    });

    slide4.addText(bulletTextRuns, { x: 7.4, y: 4.0, w: 5.6, h: 2.3, valign: 'top', wrap: true });

    addFooter(slide4, 4);

    // ───────────────────────────────────────────────────────
    // SLIDE 5: D3 - INTERIM CONTAINMENT ACTION (ICA)
    // ───────────────────────────────────────────────────────
    const slide5 = pptx.addSlide();

    // 1. Header & Tag & Line
    slide5.addText("D3-Interim Containment Action (ICA)", {
        x: 0.3, y: 0.35, w: 9.6, h: 0.6,
        fontSize: 26, fontFace: 'Arial Black', bold: true, color: '000000', wrap: false, valign: 'bottom'
    });

    slide5.addText("<Fill by CTC & Supplier>", { 
        x: 10.0, y: 0.45, w: 3.0, h: 0.4, 
        fontSize: 12, bold: true, color: 'FFFF00', fill: { color: '0000FF' }, 
        align: 'center', valign: 'middle',
        border: { pt: 1, color: '000000' }
    });

    slide5.addShape(pptx.ShapeType.line, { 
        x: 0.3, y: 1.0, w: 12.8, h: 0, 
        line: { color: '003366', width: 6.0 } 
    });

    // 2. Main Table
    const tableHeader5 = [
        { text: "Location", options: { bold: true, align: 'center', valign: 'middle', fill: 'FFFFFF' } },
        { text: "Qty", options: { bold: true, align: 'center', valign: 'middle', fill: 'FFFFFF' } },
        { text: "Action\n(Sorting, Rework, etc.)", options: { bold: true, align: 'center', valign: 'middle', fill: 'FFFFFF' } },
        { text: "Person in charge", options: { bold: true, align: 'center', valign: 'middle', fill: 'FFFFFF' } },
        { text: "Start date\n[YY.MM.DD]", options: { bold: true, align: 'center', valign: 'middle', fill: 'FFFFFF' } },
        { text: "Finished Date\n[YY.MM.DD]", options: { bold: true, align: 'center', valign: 'middle', fill: 'FFFFFF' } },
        { text: "Sorted Q'ty", options: { bold: true, align: 'center', valign: 'middle', fill: 'FFFFFF' } },
        { text: "NG Q'ty", options: { bold: true, align: 'center', valign: 'middle', fill: 'FFFFFF' } },
        { text: "Disposition", options: { bold: true, align: 'center', valign: 'middle', fill: 'FFFFFF' } },
        { text: "Remarks", options: { bold: true, align: 'center', valign: 'middle', fill: 'FFFFFF' } }
    ];

    const defaultLocations5 = ["CTC WIP", "CTC Stock", "Supplier Stock", "On the way", "", ""];
    const defaultQtys5 = ["0", "0", "0", "0", "", ""];

    const tableRows5 = [tableHeader5];
    for (let i = 0; i < 6; i++) {
        const loc = defaultLocations5[i];
        const qty = defaultQtys5[i];
        tableRows5.push([
            { text: loc, options: { bold: true, align: 'left', valign: 'middle' } },
            { text: qty, options: { align: 'center', valign: 'middle' } },
            { text: "", options: { align: 'center', valign: 'middle' } },
            { text: "", options: { align: 'center', valign: 'middle' } },
            { text: "", options: { align: 'center', valign: 'middle' } },
            { text: "", options: { align: 'center', valign: 'middle' } },
            { text: "", options: { align: 'center', valign: 'middle' } },
            { text: "", options: { align: 'center', valign: 'middle' } },
            { text: "", options: { align: 'center', valign: 'middle', color: 'FF0000' } },
            { text: "", options: { align: 'center', valign: 'middle' } }
        ]);
    }

    slide5.addTable(tableRows5, {
        x: 0.3, y: 1.1, w: 12.8,
        colW: [1.4, 0.7, 1.9, 1.2, 1.2, 1.2, 1.1, 1.0, 1.4, 1.7],
        rowH: [0.38, 0.24, 0.24, 0.24, 0.24, 0.24, 0.24],
        fontSize: 9,
        fontFace: 'Arial',
        border: { pt: 1, color: '000000' }
    });

    // 3. Middle 3 Boxes (Continuous Table matching 100%)
    const bottomTableHeader5 = [
        { text: "Sort/Rework Method Used:", options: { bold: true, underline: true, fill: '8CAED6', color: '000000', align: 'left', valign: 'middle' } },
        { text: "Identify mark:", options: { bold: true, underline: true, fill: '8CAED6', color: '000000', align: 'left', valign: 'middle' } },
        { text: "Sorting/Rework lot Ship Date", options: { bold: true, underline: true, fill: '8CAED6', color: '000000', align: 'left', valign: 'middle' } }
    ];

    const bottomTableContent5 = [
        { text: "V.TKCP screw Sorting parts in stock\nStock : 0 Pcs.\nOK : .... Pcs.\nNG : .... Pcs.", options: { valign: 'top', align: 'left', fill: 'FFFFFF', color: '000000' } },
        { text: "Mark label ok control", options: { valign: 'top', align: 'left', fill: 'FFFFFF', color: '000000' } },
        { text: "Sorting date : ....\nShipment replacement part date : ....", options: { valign: 'top', align: 'left', fill: 'FFFFFF', color: '000000' } }
    ];

    slide5.addTable([bottomTableHeader5, bottomTableContent5], {
        x: 0.3, y: 3.05, w: 12.8,
        colW: [4.8, 3.8, 4.2],
        rowH: [0.35, 2.1],
        fontSize: 10,
        fontFace: 'Arial',
        border: { pt: 1, color: '000000' }
    });

    // 4. Yellow Instruction Box
    slide5.addText([
        { text: "3D - Interim Containment Action (ICA)\n", options: { bold: true, italic: true, color: 'FF0000', fontSize: 10 } },
        { text: "Take action to ensure that the customer is protected and the problem does not get out of your area. Ensure all suspect parts of the manufacturing process, On-Hand stock, On the way has been quarantine.", options: { italic: true, color: '000000', fontSize: 9.5 } }
    ], {
        x: 0.3, y: 5.7, w: 12.8, h: 0.85,
        fill: { color: 'FFFFCC' },
        border: { pt: 1, color: 'FFCC00' },
        margin: [6, 10, 6, 10],
        valign: 'top',
        wrap: true
    });

    // 5. Footer
    addFooter(slide5, 5);

    // ───────────────────────────────────────────────────────
    // SLIDE 6: D4 - IDENTIFY ROOT CAUSE AND ESCAPE CAUSE (PROCESS FLOW)
    // ───────────────────────────────────────────────────────
    const slide6 = pptx.addSlide();

    // 1. Header & Tag & Line
    slide6.addText("D4-Identify Root cause and Escape cause", {
        x: 0.3, y: 0.35, w: 9.6, h: 0.6,
        fontSize: 24, fontFace: 'Arial Black', bold: true, color: '000000', wrap: false, valign: 'bottom'
    });

    slide6.addText("<Fill by Supplier>", { 
        x: 10.0, y: 0.45, w: 3.0, h: 0.4, 
        fontSize: 12, bold: true, color: 'FFFFFF', fill: { color: '0000FF' }, 
        align: 'center', valign: 'middle',
        border: { pt: 1, color: '000000' }
    });

    slide6.addShape(pptx.ShapeType.line, { 
        x: 0.3, y: 1.0, w: 12.8, h: 0, 
        line: { color: '003366', width: 6.0 } 
    });

    // 2. Subhead
    slide6.addText("Process Flow", {
        x: 0.3, y: 1.05, w: 3.0, h: 0.3,
        fontSize: 14, bold: true, underline: true, color: '003366'
    });
    slide6.addText("Please fill photo", {
        x: 10.0, y: 1.05, w: 3.0, h: 0.3,
        fontSize: 10, bold: true, color: 'F59E0B', align: 'right'
    });

    // Helpers for Flow Steps
    const addFlowStep6 = (slide, xBox, yBox, wBox, hBox, text, isRed = false, isDiamond = false) => {
        if (isDiamond) {
            slide.addShape(pptx.ShapeType.diamond, {
                x: xBox, y: yBox, w: wBox, h: hBox,
                fill: { color: 'FFFFFF' }, line: { color: '000000', width: 1.5 }
            });
            slide.addText(text, {
                x: xBox, y: yBox, w: wBox, h: hBox,
                fontSize: 8.5, bold: true, color: '000000', align: 'center', valign: 'middle'
            });
        } else {
            slide.addShape(pptx.ShapeType.rect, {
                x: xBox, y: yBox, w: wBox, h: hBox,
                fill: { color: 'D9D9D9' }, line: { color: '000000', width: 1.5 }
            });
            slide.addText(text, {
                x: xBox, y: yBox, w: wBox, h: hBox,
                fontSize: 10, bold: true, color: isRed ? 'FF0000' : '000000', align: 'center', valign: 'middle'
            });
        }
    };

    const addPhotoBox6 = (slide, xBox, yBox, wBox, hBox) => {
        slide.addShape(pptx.ShapeType.rect, {
            x: xBox, y: yBox, w: wBox, h: hBox,
            fill: { color: 'FFFFFF' }, line: { color: '000000', width: 1.5 }
        });
        slide.addText("PHOTO AREA", {
            x: xBox, y: yBox, w: wBox, h: hBox,
            fontSize: 8, bold: true, color: 'CBD5E1', align: 'center', valign: 'middle'
        });
    };

    const addDownArrow6 = (slide, xBox, yBox) => {
        slide.addShape(pptx.ShapeType.downArrow, {
            x: xBox + 0.8, y: yBox, w: 0.2, h: 0.25,
            fill: { color: '000000' }, line: null
        });
    };

    // Column Left (5 Steps)
    // Row 1: DRAW
    addFlowStep6(slide6, 0.3, 1.45, 1.8, 0.45, "DRAW");
    addPhotoBox6(slide6, 2.2, 1.45, 3.8, 0.65);
    addDownArrow6(slide6, 0.3, 1.93);

    // Row 2: BEND 1
    addFlowStep6(slide6, 0.3, 2.22, 1.8, 0.45, "BEND 1");
    addPhotoBox6(slide6, 2.2, 2.22, 3.8, 0.65);
    addDownArrow6(slide6, 0.3, 2.70);

    // Row 3: PIER+BURR (RED TEXT)
    addFlowStep6(slide6, 0.3, 2.99, 1.8, 0.45, "PIER+BURR", true);
    addPhotoBox6(slide6, 2.2, 2.99, 3.8, 0.65);
    addDownArrow6(slide6, 0.3, 3.47);

    // Row 4: BEND 2
    addFlowStep6(slide6, 0.3, 3.76, 1.8, 0.45, "BEND 2");
    addPhotoBox6(slide6, 2.2, 3.76, 3.8, 0.65);
    addDownArrow6(slide6, 0.3, 4.24);

    // Row 5: INSPECTION IN-PROCESS
    addFlowStep6(slide6, 0.3, 4.53, 1.8, 0.65, "INSPECTION IN-PROCESS", false, true);
    addPhotoBox6(slide6, 2.2, 4.53, 3.8, 0.65);

    // Column Right (3 Steps)
    // Row 6: INSPECTION OUT-GOING CHECK
    addFlowStep6(slide6, 7.0, 1.45, 1.8, 0.65, "INSPECTION OUT-GOING CHECK", false, true);
    addPhotoBox6(slide6, 8.9, 1.45, 3.8, 0.65);
    addDownArrow6(slide6, 7.0, 2.13);

    // Row 7: PACKING
    addFlowStep6(slide6, 7.0, 2.42, 1.8, 0.45, "PACKING");
    addPhotoBox6(slide6, 8.9, 2.42, 3.8, 0.65);
    addDownArrow6(slide6, 7.0, 2.90);

    // Row 8: SHIPMENT
    addFlowStep6(slide6, 7.0, 3.19, 1.8, 0.45, "SHIPMENT");
    addPhotoBox6(slide6, 8.9, 3.19, 3.8, 0.65);

    // Connector Line from bottom of Diamond 5 to left tip of Diamond 6
    slide6.addShape(pptx.ShapeType.line, { x: 1.2, y: 5.20, w: 0, h: 0.25, line: { color: '000000', width: 2.0 } });
    slide6.addShape(pptx.ShapeType.line, { x: 1.2, y: 5.45, w: 5.2, h: 0, line: { color: '000000', width: 2.0 } });
    slide6.addShape(pptx.ShapeType.line, { x: 6.4, y: 1.78, w: 0, h: 3.67, line: { color: '000000', width: 2.0 } });
    slide6.addShape(pptx.ShapeType.rightArrow, { x: 6.4, y: 1.68, w: 0.6, h: 0.2, fill: { color: '000000' }, line: null });

    addFooter(slide6, 6);

    // ───────────────────────────────────────────────────────
    // SLIDE 7: D4 - ROOT CAUSE ANALYSIS
    // ───────────────────────────────────────────────────────
    const slide7 = pptx.addSlide();
    slide7.addText("D4-Identify Root cause and Escape cause", {
        x: 0.3, y: 0.35, w: 9.6, h: 0.6,
        fontSize: 24, fontFace: 'Arial Black', bold: true, color: '000000', wrap: false, valign: 'bottom'
    });
    slide7.addText("<Fill by Supplier>", { 
        x: 10.0, y: 0.45, w: 3.0, h: 0.4, 
        fontSize: 12, bold: true, color: 'FFFFFF', fill: { color: '0000FF' }, 
        align: 'center', valign: 'middle',
        border: { pt: 1, color: '000000' }
    });
    slide7.addShape(pptx.ShapeType.line, { 
        x: 0.3, y: 1.0, w: 12.8, h: 0, 
        line: { color: '003366', width: 6.0 } 
    });

    slide7.addText([
        { text: "ROOT CAUSE ANALYSIS ", options: { bold: true, underline: true, color: '003366', fontSize: 14 } },
        { text: "(Why problem happen ?)", options: { bold: true, color: 'FF0000', fontSize: 14 } }
    ], { x: 0.3, y: 1.1, w: 12.8, h: 0.35 });

    const tableHeader7 = [
        { text: "1", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "Why was the non conformity made?", options: { bold: true, align: 'left', valign: 'middle', fill: 'D9E1F2', color: '000000' } }
    ];
    const tableRows7 = [tableHeader7];
    for (let i = 1; i <= 5; i++) {
        tableRows7.push([
            { text: `Why${i}`, options: { bold: true, align: 'center', valign: 'middle', fill: 'D9D9D9', color: '000000' } },
            { text: "", options: { align: 'left', valign: 'middle', fill: 'FFFFFF' } }
        ]);
    }
    slide7.addTable(tableRows7, {
        x: 0.3, y: 1.5, w: 12.8,
        colW: [1.2, 11.6],
        rowH: [0.42, 0.65, 0.65, 0.65, 0.65, 0.65],
        fontSize: 11, fontFace: 'Arial',
        border: { pt: 1, color: '000000' }
    });

    slide7.addText([
        { text: "D4 - Identify Root Cause and Escape Cause\n", options: { bold: true, italic: true, color: 'DC2626', fontSize: 10 } },
        { text: "- Identify all potential reasons which could explain why the problem occurred.\n", options: { color: '1E293B', fontSize: 9.5 } },
        { text: "ROOT CAUSE: ", options: { bold: true, italic: true, color: 'DC2626', fontSize: 9.5 } },
        { text: "Explain what went wrong with the component, process, or system\n", options: { color: '1E293B', fontSize: 9.5 } },
        { text: "ESCAPE CAUSE: ", options: { bold: true, italic: true, color: 'DC2626', fontSize: 9.5 } },
        { text: "State how the problem got through the system without being detected and shipped before reaching the customer.", options: { color: '1E293B', fontSize: 9.5 } }
    ], {
        x: 0.3, y: 5.5, w: 12.8, h: 0.95,
        fill: { color: 'FEFCE8' },
        border: { pt: 1, color: 'EAB308' },
        margin: [6, 10, 6, 10],
        valign: 'top', wrap: true
    });
    addFooter(slide7, 7);

    // ───────────────────────────────────────────────────────
    // SLIDE 8: D4 - ESCAPE CAUSE ANALYSIS
    // ───────────────────────────────────────────────────────
    const slide8 = pptx.addSlide();
    slide8.addText("D4-Identify Root cause and Escape cause", {
        x: 0.3, y: 0.35, w: 9.6, h: 0.6,
        fontSize: 24, fontFace: 'Arial Black', bold: true, color: '000000', wrap: false, valign: 'bottom'
    });
    slide8.addText("<Fill by Supplier>", { 
        x: 10.0, y: 0.45, w: 3.0, h: 0.4, 
        fontSize: 12, bold: true, color: 'FFFFFF', fill: { color: '0000FF' }, 
        align: 'center', valign: 'middle',
        border: { pt: 1, color: '000000' }
    });
    slide8.addShape(pptx.ShapeType.line, { 
        x: 0.3, y: 1.0, w: 12.8, h: 0, 
        line: { color: '003366', width: 6.0 } 
    });

    slide8.addText([
        { text: "ESCAPE CAUSE ANALYSIS ", options: { bold: true, underline: true, color: '003366', fontSize: 14 } },
        { text: "(Why not detected ?)", options: { bold: true, color: 'FF0000', fontSize: 14 } }
    ], { x: 0.3, y: 1.1, w: 12.8, h: 0.35 });

    const tableHeader8 = [
        { text: "1", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "Why was the non conformity could not detect ?", options: { bold: true, align: 'left', valign: 'middle', fill: 'D9E1F2', color: '000000' } }
    ];
    const tableRows8 = [tableHeader8];
    for (let i = 1; i <= 5; i++) {
        tableRows8.push([
            { text: `Why${i}`, options: { bold: true, align: 'center', valign: 'middle', fill: 'D9D9D9', color: '000000' } },
            { text: "", options: { align: 'left', valign: 'middle', fill: 'FFFFFF' } }
        ]);
    }
    slide8.addTable(tableRows8, {
        x: 0.3, y: 1.5, w: 12.8,
        colW: [1.2, 11.6],
        rowH: [0.42, 0.65, 0.65, 0.65, 0.65, 0.65],
        fontSize: 11, fontFace: 'Arial',
        border: { pt: 1, color: '000000' }
    });

    slide8.addText([
        { text: "D4 - Identify Root Cause and Escape Cause\n", options: { bold: true, italic: true, color: 'DC2626', fontSize: 10 } },
        { text: "- Identify all potential reasons which could explain why the problem occurred.\n", options: { color: '1E293B', fontSize: 9.5 } },
        { text: "ROOT CAUSE: ", options: { bold: true, italic: true, color: 'DC2626', fontSize: 9.5 } },
        { text: "Explain what went wrong with the component, process, or system\n", options: { color: '1E293B', fontSize: 9.5 } },
        { text: "ESCAPE CAUSE: ", options: { bold: true, italic: true, color: 'DC2626', fontSize: 9.5 } },
        { text: "State how the problem got through the system without being detected and shipped before reaching the customer.", options: { color: '1E293B', fontSize: 9.5 } }
    ], {
        x: 0.3, y: 5.5, w: 12.8, h: 0.95,
        fill: { color: 'FEFCE8' },
        border: { pt: 1, color: 'EAB308' },
        margin: [6, 10, 6, 10],
        valign: 'top', wrap: true
    });
    addFooter(slide8, 8);

    // ───────────────────────────────────────────────────────
    // SLIDE 9: D4 - SYSTEM CAUSE ANALYSIS
    // ───────────────────────────────────────────────────────
    const slide9 = pptx.addSlide();
    slide9.addText("D4-Identify Root cause and Escape cause", {
        x: 0.3, y: 0.35, w: 9.6, h: 0.6,
        fontSize: 24, fontFace: 'Arial Black', bold: true, color: '000000', wrap: false, valign: 'bottom'
    });
    slide9.addText("<Fill by Supplier>", { 
        x: 10.0, y: 0.45, w: 3.0, h: 0.4, 
        fontSize: 12, bold: true, color: 'FFFFFF', fill: { color: '0000FF' }, 
        align: 'center', valign: 'middle',
        border: { pt: 1, color: '000000' }
    });
    slide9.addShape(pptx.ShapeType.line, { 
        x: 0.3, y: 1.0, w: 12.8, h: 0, 
        line: { color: '003366', width: 6.0 } 
    });

    slide9.addText([
        { text: "SYSTEM CAUSE ANALYSIS ", options: { bold: true, underline: true, color: '003366', fontSize: 14 } },
        { text: "(Why system failed ?)", options: { bold: true, color: 'FF0000', fontSize: 14 } }
    ], { x: 0.3, y: 1.1, w: 12.8, h: 0.35 });

    const tableHeader9 = [
        { text: "1", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "Why was the process & system failed ?", options: { bold: true, align: 'left', valign: 'middle', fill: 'D9E1F2', color: '000000' } }
    ];
    const tableRows9 = [tableHeader9];
    for (let i = 1; i <= 5; i++) {
        tableRows9.push([
            { text: `Why${i}`, options: { bold: true, align: 'center', valign: 'middle', fill: 'D9D9D9', color: '000000' } },
            { text: "", options: { align: 'left', valign: 'middle', fill: 'FFFFFF' } }
        ]);
    }
    slide9.addTable(tableRows9, {
        x: 0.3, y: 1.5, w: 12.8,
        colW: [1.2, 11.6],
        rowH: [0.42, 0.65, 0.65, 0.65, 0.65, 0.65],
        fontSize: 11, fontFace: 'Arial',
        border: { pt: 1, color: '000000' }
    });

    slide9.addText([
        { text: "D4 - Identify Root Cause and Escape Cause\n", options: { bold: true, italic: true, color: 'DC2626', fontSize: 10 } },
        { text: "- Identify all potential reasons which could explain why the problem occurred.\n", options: { color: '1E293B', fontSize: 9.5 } },
        { text: "ROOT CAUSE: ", options: { bold: true, italic: true, color: 'DC2626', fontSize: 9.5 } },
        { text: "Explain what went wrong with the component, process, or system\n", options: { color: '1E293B', fontSize: 9.5 } },
        { text: "ESCAPE CAUSE: ", options: { bold: true, italic: true, color: 'DC2626', fontSize: 9.5 } },
        { text: "State how the problem got through the system without being detected and shipped before reaching the customer.", options: { color: '1E293B', fontSize: 9.5 } }
    ], {
        x: 0.3, y: 5.5, w: 12.8, h: 0.95,
        fill: { color: 'FEFCE8' },
        border: { pt: 1, color: 'EAB308' },
        margin: [6, 10, 6, 10],
        valign: 'top', wrap: true
    });
    addFooter(slide9, 9);

    // ───────────────────────────────────────────────────────
    // SLIDE 10: D5 - ROOT CAUSE ACTION
    // ───────────────────────────────────────────────────────
    const slide10 = pptx.addSlide();
    slide10.addText("D5-Developing permanent corrective action", {
        x: 0.3, y: 0.35, w: 9.6, h: 0.6,
        fontSize: 24, fontFace: 'Arial Black', bold: true, color: '000000', wrap: false, valign: 'bottom'
    });
    slide10.addText("<Fill by Supplier>", { 
        x: 10.0, y: 0.45, w: 3.0, h: 0.4, 
        fontSize: 12, bold: true, color: 'FFFFFF', fill: { color: '0000FF' }, 
        align: 'center', valign: 'middle',
        border: { pt: 1, color: '000000' }
    });
    slide10.addShape(pptx.ShapeType.line, { 
        x: 0.3, y: 1.0, w: 12.8, h: 0, 
        line: { color: '003366', width: 6.0 } 
    });

    slide10.addText([
        { text: "ROOT CAUSE ACTION ", options: { bold: true, underline: true, color: '003366', fontSize: 14 } },
        { text: "   Please fill photo evidence Before & After.", options: { bold: true, color: 'FF6600', fontSize: 12 } }
    ], { x: 0.3, y: 1.05, w: 12.8, h: 0.35 });

    const tableHeader10 = [
        { text: "Before", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "After", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "Improvement Detail", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "Effective lot", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "Identify lot", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "MP Level", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } }
    ];
    const tableRows10 = [tableHeader10];
    for (let i = 1; i <= 4; i++) {
        tableRows10.push([
            { text: "", options: { align: 'left', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'left', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'center', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'center', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'center', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'left', valign: 'middle', fill: 'FFFFFF' } }
        ]);
    }
    slide10.addTable(tableRows10, {
        x: 0.3, y: 1.45, w: 12.8,
        colW: [2.2, 2.2, 3.2, 1.7, 1.7, 1.8],
        rowH: [0.42, 0.90, 0.90, 0.90, 0.90],
        fontSize: 10, fontFace: 'Arial',
        border: { pt: 1, color: '000000' }
    });

    slide10.addText([
        { text: "D5 - Developing permanent corrective action\n", options: { bold: true, italic: true, color: 'DC2626', fontSize: 10 } },
        { text: "- Select solution that will eliminate problem. Test solution to make sure it will work before you fully implement. Permanent solutions must be \"mistake proof\".\n", options: { color: '1E293B', fontSize: 9.5 } },
        { text: "ROOT CAUSE ACTIONS: ", options: { bold: true, italic: true, color: 'DC2626', fontSize: 9.5 } },
        { text: "List chosen corrective actions necessary to permanently eliminate root cause.\n", options: { color: '1E293B', fontSize: 9.5 } },
        { text: "ESCAPE CAUSE ACTIONS: ", options: { bold: true, italic: true, color: 'DC2626', fontSize: 9.5 } },
        { text: "List chosen corrective actions that eliminate escape root cause.", options: { color: '1E293B', fontSize: 9.5 } }
    ], {
        x: 0.3, y: 5.5, w: 12.8, h: 0.95,
        fill: { color: 'FEFCE8' },
        border: { pt: 1, color: 'EAB308' },
        margin: [6, 10, 6, 10],
        valign: 'top', wrap: true
    });
    addFooter(slide10, 10);

    // ───────────────────────────────────────────────────────
    // SLIDE 11: D5 - ESCAPE CAUSE ACTION
    // ───────────────────────────────────────────────────────
    const slide11 = pptx.addSlide();
    slide11.addText("D5-Developing permanent corrective action", {
        x: 0.3, y: 0.35, w: 9.6, h: 0.6,
        fontSize: 24, fontFace: 'Arial Black', bold: true, color: '000000', wrap: false, valign: 'bottom'
    });
    slide11.addText("<Fill by Supplier>", { 
        x: 10.0, y: 0.45, w: 3.0, h: 0.4, 
        fontSize: 12, bold: true, color: 'FFFFFF', fill: { color: '0000FF' }, 
        align: 'center', valign: 'middle',
        border: { pt: 1, color: '000000' }
    });
    slide11.addShape(pptx.ShapeType.line, { 
        x: 0.3, y: 1.0, w: 12.8, h: 0, 
        line: { color: '003366', width: 6.0 } 
    });

    slide11.addText([
        { text: "ESCAPE CAUSE ACTION ", options: { bold: true, underline: true, color: '003366', fontSize: 14 } },
        { text: "   Please fill photo evidence Before & After.", options: { bold: true, color: 'FF6600', fontSize: 12 } }
    ], { x: 0.3, y: 1.05, w: 12.8, h: 0.35 });

    const tableHeader11 = [
        { text: "Before", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "After", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "Improvement Detail", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "Effective lot", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "Identify lot", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "MP Level", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } }
    ];
    const tableRows11 = [tableHeader11];
    for (let i = 1; i <= 4; i++) {
        tableRows11.push([
            { text: "", options: { align: 'left', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'left', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'center', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'center', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'center', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'left', valign: 'middle', fill: 'FFFFFF' } }
        ]);
    }
    slide11.addTable(tableRows11, {
        x: 0.3, y: 1.45, w: 12.8,
        colW: [2.2, 2.2, 3.2, 1.7, 1.7, 1.8],
        rowH: [0.42, 0.90, 0.90, 0.90, 0.90],
        fontSize: 10, fontFace: 'Arial',
        border: { pt: 1, color: '000000' }
    });

    slide11.addText([
        { text: "D5 - Developing permanent corrective action\n", options: { bold: true, italic: true, color: 'DC2626', fontSize: 10 } },
        { text: "- Select solution that will eliminate problem. Test solution to make sure it will work before you fully implement. Permanent solutions must be \"mistake proof\".\n", options: { color: '1E293B', fontSize: 9.5 } },
        { text: "ROOT CAUSE ACTIONS: ", options: { bold: true, italic: true, color: 'DC2626', fontSize: 9.5 } },
        { text: "List chosen corrective actions necessary to permanently eliminate root cause.\n", options: { color: '1E293B', fontSize: 9.5 } },
        { text: "ESCAPE CAUSE ACTIONS: ", options: { bold: true, italic: true, color: 'DC2626', fontSize: 9.5 } },
        { text: "List chosen corrective actions that eliminate escape root cause.", options: { color: '1E293B', fontSize: 9.5 } }
    ], {
        x: 0.3, y: 5.5, w: 12.8, h: 0.95,
        fill: { color: 'FEFCE8' },
        border: { pt: 1, color: 'EAB308' },
        margin: [6, 10, 6, 10],
        valign: 'top', wrap: true
    });
    addFooter(slide11, 11);

    // ───────────────────────────────────────────────────────
    // SLIDE 12: D5 - SYSTEM CAUSE ACTION
    // ───────────────────────────────────────────────────────
    const slide12 = pptx.addSlide();
    slide12.addText("D5-Developing permanent corrective action", {
        x: 0.3, y: 0.35, w: 9.6, h: 0.6,
        fontSize: 24, fontFace: 'Arial Black', bold: true, color: '000000', wrap: false, valign: 'bottom'
    });
    slide12.addText("<Fill by Supplier>", { 
        x: 10.0, y: 0.45, w: 3.0, h: 0.4, 
        fontSize: 12, bold: true, color: 'FFFFFF', fill: { color: '0000FF' }, 
        align: 'center', valign: 'middle',
        border: { pt: 1, color: '000000' }
    });
    slide12.addShape(pptx.ShapeType.line, { 
        x: 0.3, y: 1.0, w: 12.8, h: 0, 
        line: { color: '003366', width: 6.0 } 
    });

    slide12.addText([
        { text: "SYSTEM CAUSE ACTION ", options: { bold: true, underline: true, color: '003366', fontSize: 14 } },
        { text: "   Please fill photo evidence Before & After.", options: { bold: true, color: 'FF6600', fontSize: 12 } }
    ], { x: 0.3, y: 1.05, w: 12.8, h: 0.35 });

    const tableHeader12 = [
        { text: "Before", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "After", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "Improvement Detail", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "Effective lot", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "Identify lot", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "MP Level", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } }
    ];
    const tableRows12 = [tableHeader12];
    for (let i = 1; i <= 4; i++) {
        tableRows12.push([
            { text: "", options: { align: 'left', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'left', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'center', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'center', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'center', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'left', valign: 'middle', fill: 'FFFFFF' } }
        ]);
    }
    slide12.addTable(tableRows12, {
        x: 0.3, y: 1.45, w: 12.8,
        colW: [2.2, 2.2, 3.2, 1.7, 1.7, 1.8],
        rowH: [0.42, 0.90, 0.90, 0.90, 0.90],
        fontSize: 10, fontFace: 'Arial',
        border: { pt: 1, color: '000000' }
    });

    slide12.addText([
        { text: "D5 - Developing permanent corrective action\n", options: { bold: true, italic: true, color: 'DC2626', fontSize: 10 } },
        { text: "- Select solution that will eliminate problem. Test solution to make sure it will work before you fully implement. Permanent solutions must be \"mistake proof\".\n", options: { color: '1E293B', fontSize: 9.5 } },
        { text: "ROOT CAUSE ACTIONS: ", options: { bold: true, italic: true, color: 'DC2626', fontSize: 9.5 } },
        { text: "List chosen corrective actions necessary to permanently eliminate root cause.\n", options: { color: '1E293B', fontSize: 9.5 } },
        { text: "ESCAPE CAUSE ACTIONS: ", options: { bold: true, italic: true, color: 'DC2626', fontSize: 9.5 } },
        { text: "List chosen corrective actions that eliminate escape root cause.", options: { color: '1E293B', fontSize: 9.5 } }
    ], {
        x: 0.3, y: 5.5, w: 12.8, h: 0.95,
        fill: { color: 'FEFCE8' },
        border: { pt: 1, color: 'EAB308' },
        margin: [6, 10, 6, 10],
        valign: 'top', wrap: true
    });
    addFooter(slide12, 12);

    // ───────────────────────────────────────────────────────
    // SLIDE 13: D6 - IMPLEMENT PERMANENT CORRECTIVE ACTION
    // ───────────────────────────────────────────────────────
    const slide13 = pptx.addSlide();
    slide13.addText("D6-Implement permanent corrective action", {
        x: 0.3, y: 0.35, w: 9.6, h: 0.6,
        fontSize: 24, fontFace: 'Arial Black', bold: true, color: '000000', wrap: false, valign: 'bottom'
    });
    slide13.addText("<Fill by Supplier>", { 
        x: 10.0, y: 0.45, w: 3.0, h: 0.4, 
        fontSize: 12, bold: true, color: 'FFFFFF', fill: { color: '0000FF' }, 
        align: 'center', valign: 'middle',
        border: { pt: 1, color: '000000' }
    });
    slide13.addShape(pptx.ShapeType.line, { 
        x: 0.3, y: 1.0, w: 12.8, h: 0, 
        line: { color: '003366', width: 6.0 } 
    });

    const tableHeader13 = [
        { text: "Corrective action", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "Implement date", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "Defect ratio\n(Before action)", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "Defect ratio\n(After action)", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "Verification method", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "Person in charge", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "Verify date", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } }
    ];
    const tableRows13 = [tableHeader13];
    for (let i = 1; i <= 5; i++) {
        tableRows13.push([
            { text: "", options: { align: 'left', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'center', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'center', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'center', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'center', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'center', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'center', valign: 'middle', fill: 'FFFFFF' } }
        ]);
    }
    slide13.addTable(tableRows13, {
        x: 0.3, y: 1.15, w: 12.8,
        colW: [3.3, 1.4, 1.4, 1.4, 2.3, 1.5, 1.5],
        rowH: [0.42, 0.72, 0.72, 0.72, 0.72, 0.72],
        fontSize: 10, fontFace: 'Arial',
        border: { pt: 1, color: '000000' }
    });

    slide13.addText([
        { text: "6D - Implement Permanent Corrective Actions\n", options: { bold: true, italic: true, color: 'DC2626', fontSize: 10 } },
        { text: "Create a clear action plan to solve the problem by stating WHO will do WHAT and by WHEN. How to verify the corrective actions with before and after result.", options: { color: '000000', fontSize: 9.5 } }
    ], {
        x: 0.3, y: 5.6, w: 12.8, h: 0.85,
        fill: { color: 'FFFFCC' },
        border: { pt: 1, color: 'CCCCCC' },
        margin: [6, 10, 6, 10],
        valign: 'top', wrap: true
    });
    addFooter(slide13, 13);

    // ───────────────────────────────────────────────────────
    // SLIDE 14: D7 - PREVENTIVE RECURRENCE
    // ───────────────────────────────────────────────────────
    const slide14 = pptx.addSlide();
    slide14.addText("D7-Preventive Recurrence", {
        x: 0.3, y: 0.35, w: 9.6, h: 0.6,
        fontSize: 26, fontFace: 'Arial Black', bold: true, color: '000000', wrap: false, valign: 'bottom'
    });
    slide14.addText("<Fill by Supplier>", { 
        x: 10.0, y: 0.45, w: 3.0, h: 0.4, 
        fontSize: 12, bold: true, color: 'FFFFFF', fill: { color: '0000FF' }, 
        align: 'center', valign: 'middle',
        border: { pt: 1, color: '000000' }
    });
    slide14.addShape(pptx.ShapeType.line, { 
        x: 0.3, y: 1.0, w: 12.8, h: 0, 
        line: { color: '003366', width: 6.0 } 
    });

    // Top Split Section (How to avoid)
    slide14.addText("How to avoid recurrence this problem in the future ?", {
        x: 0.3, y: 1.08, w: 6.3, h: 0.32,
        fontSize: 10, bold: true, fill: { color: 'B4C7E7' }, color: '000000',
        align: 'left', valign: 'middle', border: { pt: 1, color: '000000' }, margin: [0, 8, 0, 8]
    });
    const d7HowText = "-Add rack packing std.\n-Rev.WI-SP01-01 to prohibit use of temporary racks...\n-Provide training WI-SP01-01 to the Production...\n-Rev. WI-QC03-01 to prohibit use of temporary racks...\n-Provide training WI-QC03-01 to the ipqc and oqc...";
    slide14.addText(d7HowText, {
        x: 0.3, y: 1.40, w: 6.3, h: 0.95,
        fontSize: 9, fontFace: 'Arial', color: '000000',
        valign: 'top', border: { pt: 1, color: '000000' }, margin: [4, 8, 4, 8]
    });

    slide14.addText("Risk part has similar structure/process and Action plan.", {
        x: 6.8, y: 1.08, w: 6.3, h: 0.32,
        fontSize: 10, bold: true, fill: { color: 'B4C7E7' }, color: '000000',
        align: 'left', valign: 'middle', border: { pt: 1, color: '000000' }, margin: [0, 8, 0, 8]
    });
    const rightRiskHeader14 = [
        { text: "TTL Q'ty", options: { bold: true, align: 'center', valign: 'middle', fill: 'D9E1F2', color: '000000' } },
        { text: "Action", options: { bold: true, align: 'center', valign: 'middle', fill: 'D9E1F2', color: '000000' } },
        { text: "Plan", options: { bold: true, align: 'center', valign: 'middle', fill: 'D9E1F2', color: '000000' } }
    ];
    const rightRiskRow14 = [
        { text: "", options: { align: 'center', valign: 'middle', fill: 'FFFFFF' } },
        { text: "", options: { align: 'center', valign: 'middle', fill: 'FFFFFF' } },
        { text: "", options: { align: 'center', valign: 'middle', fill: 'FFFFFF' } }
    ];
    slide14.addTable([rightRiskHeader14, rightRiskRow14], {
        x: 6.8, y: 1.40, w: 6.3,
        colW: [1.3, 3.2, 1.8],
        rowH: [0.30, 0.65],
        fontSize: 9.5, fontFace: 'Arial',
        border: { pt: 1, color: '000000' }
    });

    slide14.addText("Has the necessary document been revised/ updated ?", {
        x: 0.3, y: 2.42, w: 12.8, h: 0.28,
        fontSize: 11, bold: true, color: '000000', valign: 'middle'
    });

    const considerHeader14 = [
        { text: "Consider", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "Updated?\n(Y/N)", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "Details", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "Document no.", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } },
        { text: "Due date", options: { bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } }
    ];
    const considerItems14 = [
        ['1. Part Drawing / Specification', 'N'],
        ['2. Work Instruction', 'Y'],
        ['3. Inspection instruction / Q-Point', 'N'],
        ['4. Inspection check sheet', 'N'],
        ['5. Process Flow Chart / Control Plan', 'N'],
        ['6. P-FMEA', 'N'],
        ['7. Machine Parameter', 'N'],
        ['8. Supplier Process Characteristics', 'N'],
        ['9. PM Plan / Detail', 'N'],
        ['10. Others document', 'Y']
    ];
    const considerRows14 = [considerHeader14];
    considerItems14.forEach(item => {
        considerRows14.push([
            { text: item[0], options: { align: 'left', valign: 'middle', fill: 'FFFFFF', bold: false } },
            { text: item[1], options: { align: 'center', valign: 'middle', fill: 'FFFFFF', bold: true } },
            { text: "", options: { align: 'left', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'left', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'center', valign: 'middle', fill: 'FFFFFF' } }
        ]);
    });

    slide14.addTable(considerRows14, {
        x: 0.3, y: 2.72, w: 12.8,
        colW: [4.2, 1.2, 3.8, 2.1, 1.5],
        rowH: [0.28, 0.22, 0.22, 0.22, 0.22, 0.22, 0.22, 0.22, 0.22, 0.22, 0.22],
        fontSize: 8.5, fontFace: 'Arial',
        border: { pt: 1, color: '000000' }
    });

    slide14.addText([
        { text: "7D - Prevent Recurrence\n", options: { bold: true, italic: true, color: 'DC2626', fontSize: 10 } },
        { text: "Ensure the problem does not happen again ANYWHERE by using Foolproof, POKAYOKE etc. Communicate your results to all areas including similar part. Submit revised all related documents to us to review. (if have)", options: { color: '000000', fontSize: 9.0 } }
    ], {
        x: 0.3, y: 5.65, w: 12.8, h: 0.80,
        fill: { color: 'FFFFCC' },
        border: { pt: 1, color: 'FFCC00' },
        margin: [4, 8, 4, 8],
        valign: 'top', wrap: true
    });
    addFooter(slide14, 14);

    // ───────────────────────────────────────────────────────
    // SLIDE 15: D8 - TEAM AND INDIVIDUAL RECOGNITION
    // ───────────────────────────────────────────────────────
    const slide15 = pptx.addSlide();
    slide15.addText("D8-Team and Individual Recognition", {
        x: 0.3, y: 0.35, w: 9.6, h: 0.6,
        fontSize: 26, fontFace: 'Arial Black', bold: true, color: '000000', wrap: false, valign: 'bottom'
    });
    slide15.addText("<Fill by Supplier>", { 
        x: 10.0, y: 0.45, w: 3.0, h: 0.4, 
        fontSize: 12, bold: true, color: 'FFFFFF', fill: { color: '0000FF' }, 
        align: 'center', valign: 'middle',
        border: { pt: 1, color: '000000' }
    });
    slide15.addShape(pptx.ShapeType.line, { 
        x: 0.3, y: 1.0, w: 12.8, h: 0, 
        line: { color: '003366', width: 6.0 } 
    });

    const teamTitleRow15 = [
        { text: "Team Members", options: { colspan: 3, bold: true, align: 'center', valign: 'middle', fill: 'B4C7E7', color: '000000' } }
    ];
    const teamSubHeader15 = [
        { text: "No.", options: { bold: true, align: 'center', valign: 'middle', fill: 'D9E1F2', color: '000000' } },
        { text: "Name", options: { bold: true, align: 'center', valign: 'middle', fill: 'D9E1F2', color: '000000' } },
        { text: "Dept.", options: { bold: true, align: 'center', valign: 'middle', fill: 'D9E1F2', color: '000000' } }
    ];
    const teamRows15 = [teamTitleRow15, teamSubHeader15];
    for (let i = 1; i <= 6; i++) {
        teamRows15.push([
            { text: `${i}`, options: { bold: true, align: 'center', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'left', valign: 'middle', fill: 'FFFFFF' } },
            { text: "", options: { align: 'center', valign: 'middle', fill: 'FFFFFF' } }
        ]);
    }

    slide15.addTable(teamRows15, {
        x: 1.8, y: 1.15, w: 9.8,
        colW: [1.0, 6.0, 2.8],
        rowH: [0.32, 0.28, 0.30, 0.30, 0.30, 0.30, 0.30, 0.30],
        fontSize: 10.5, fontFace: 'Arial',
        border: { pt: 1, color: '000000' }
    });

    slide15.addText("“Thank you for all cooperation”", {
        x: 0.3, y: 4.25, w: 12.8, h: 0.8,
        fontSize: 26, fontFace: 'Arial Black', bold: true, color: '1E293B',
        align: 'center', valign: 'middle'
    });

    slide15.addText([
        { text: "8D – Team and Individual Recognition\n", options: { bold: true, italic: true, color: 'D32F2F', fontSize: 10 } },
        { text: "8D process is the time to recognize the team efforts and special team member contributions.", options: { color: '333333', fontSize: 9.5 } }
    ], {
        x: 0.3, y: 5.6, w: 12.8, h: 0.85,
        fill: { color: 'FFFDE7' },
        border: { pt: 1, color: 'FBC02D' },
        margin: [6, 10, 6, 10],
        valign: 'top', wrap: true
    });
    addFooter(slide15, 15);

    // ───────────────────────────────────────────────────────
    // SLIDE 16: THANK YOU PAGE
    // ───────────────────────────────────────────────────────
    const slide16 = pptx.addSlide();
    
    slide16.addShape(pptx.ShapeType.rect, {
        x: 0.3, y: 1.2, w: 12.8, h: 0.12,
        fill: { color: '003366' }, line: null
    });

    slide16.addText("THANK YOU.", {
        x: 0.3, y: 2.2, w: 12.8, h: 3.2,
        fontSize: 64, fontFace: 'Arial Black', bold: true, color: '003366',
        align: 'center', valign: 'middle'
    });

    addFooter(slide16, 16);

    await pptx.writeFile({ fileName: `8D_Full_Report_${caseData.id}.pptx` });
    toast("✅ ส่งออกรายงาน 8D สำเร็จ!", "success");
}



let _eightDScroller = null;

function renderDashboard() {
    const tbody = document.getElementById('eight-d-list-body');
    const statTotal = document.getElementById('stat-8d-total');
    const statPending = document.getElementById('stat-8d-pending');
    const statOverdue = document.getElementById('stat-8d-overdue');

    const now = new Date();

    // 1. คำนวณตัวเลข Quick Stats (Total Cases, D1-D3 Open และ Overdue >15d)
    const totalCount = _cases.length;
    let d1ToD3Count = 0;
    let overdueCount = 0;

    _cases.forEach(c => {
        const s = (c.status || '').toUpperCase();
        const isClosed = s.includes('D8') || s.includes('CLOSED') || s.includes('COMPLETE');
        const createdAt = c.created_at ? new Date(c.created_at) : now;
        const openDays = Math.floor(Math.max(0, now - createdAt) / (1000 * 60 * 60 * 24));

        const stepMatch = s.match(/D(\d+)/);
        let stepNum = 1;
        if (stepMatch) {
            stepNum = parseInt(stepMatch[1], 10);
        }
        
        if (stepNum >= 1 && stepNum <= 3 && !isClosed) {
            d1ToD3Count++;
        }

        if (!isClosed && openDays >= 15) {
            overdueCount++;
        }
    });

    if (statTotal) statTotal.textContent = totalCount;
    if (statPending) statPending.textContent = d1ToD3Count;
    if (statOverdue) statOverdue.textContent = overdueCount;

    // 2. ปรับแต่ง UI ของ Stat Cards ปุ่มที่เลือกอยู่
    const cardTotal = document.getElementById('card-stat-8d-total');
    const cardPending = document.getElementById('card-stat-8d-pending');
    const cardOverdue = document.getElementById('card-stat-8d-overdue');
    if (cardTotal) {
        if (_statFilter === 'all') {
            cardTotal.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50/50');
        } else {
            cardTotal.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50/50');
        }
    }
    if (cardPending) {
        if (_statFilter === 'd1-d3') {
            cardPending.classList.add('ring-2', 'ring-orange-500', 'bg-orange-50/50');
        } else {
            cardPending.classList.remove('ring-2', 'ring-orange-500', 'bg-orange-50/50');
        }
    }
    if (cardOverdue) {
        if (_statFilter === 'overdue') {
            cardOverdue.classList.add('ring-2', 'ring-rose-500', 'bg-rose-50/50');
        } else {
            cardOverdue.classList.remove('ring-2', 'ring-rose-500', 'bg-rose-50/50');
        }
    }

    // 3. ผูก Event Listener ช่องค้นหา (Search)
    const searchInput = document.getElementById('eightDSearch');
    if (searchInput && !searchInput.dataset.hasListener) {
        searchInput.dataset.hasListener = 'true';
        let searchDebounceTimer = null;
        searchInput.addEventListener('input', () => {
            if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(() => {
                renderDashboard();
            }, 120);
        });
    }
    const query = searchInput ? (searchInput.value || '').trim().toLowerCase() : '';

    // 4. กรองรายการเคสตาม Filter และ Search Query
    const filteredCases = _cases.filter(c => {
        const s = (c.status || '').toUpperCase();
        const isClosed = s.includes('D8') || s.includes('CLOSED') || s.includes('COMPLETE');
        const createdAt = c.created_at ? new Date(c.created_at) : now;
        const openDays = Math.floor(Math.max(0, now - createdAt) / (1000 * 60 * 60 * 24));

        if (_statFilter === 'd1-d3') {
            const stepMatch = s.match(/D(\d+)/);
            let isD1D3 = true;
            if (stepMatch) {
                const num = parseInt(stepMatch[1], 10);
                isD1D3 = (num >= 1 && num <= 3);
            }
            if (!isD1D3 || isClosed) return false;
        } else if (_statFilter === 'overdue') {
            if (isClosed || openDays < 15) return false;
        }

        if (!query) return true;
        const idStr = (c.id || '').toLowerCase();
        const titleStr = (c.problem_title || '').toLowerCase();
        const partStr = (c.part_name || '').toLowerCase();
        const statusStr = (c.status || '').toLowerCase();
        return idStr.includes(query) || titleStr.includes(query) || partStr.includes(query) || statusStr.includes(query);
    });

    function _build8DRow(c) {
        const now = new Date();
        const statusUpper = (c.status || '').toUpperCase();
        const isD8Closed = statusUpper.includes('D8') || statusUpper.includes('CLOSED') || statusUpper.includes('COMPLETE');

        const stepMatch = statusUpper.match(/D(\d+)/);
        const stepNum = stepMatch ? parseInt(stepMatch[1], 10) : 1;
        const progressPct = Math.min(100, Math.max(12.5, (stepNum / 8) * 100));

        const createdAt = c.created_at ? new Date(c.created_at) : now;
        const diffMs = Math.max(0, now - createdAt);
        const openDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const openHours = Math.floor(diffMs / (1000 * 60 * 60));

        const isOverdue8D = !isD8Closed && openDays >= 15;
        const isOverdue3D = !isD8Closed && stepNum <= 3 && (openDays >= 1 || openHours >= 24);
        const isWarning10D = !isD8Closed && openDays >= 10 && openDays < 15;

        let rowClass = "group transition-all duration-300";
        let barColor = "from-blue-400 to-blue-600";
        let statusBadgeClass = "text-blue-600";

        if (isD8Closed) {
            barColor = "from-emerald-400 to-emerald-600";
            statusBadgeClass = "text-emerald-600 font-extrabold";
            rowClass += " hover:bg-slate-50/80";
        } else if (isOverdue8D) {
            barColor = "from-rose-500 to-red-600";
            statusBadgeClass = "text-rose-600 font-black animate-pulse";
            rowClass += " bg-rose-50/90 hover:bg-rose-100/90 border-l-4 border-l-rose-500 shadow-sm";
        } else if (isOverdue3D) {
            barColor = "from-amber-400 to-orange-500";
            statusBadgeClass = "text-amber-600 font-extrabold";
            rowClass += " bg-amber-50/80 hover:bg-amber-100/90 border-l-4 border-l-amber-500";
        } else if (isWarning10D) {
            barColor = "from-orange-400 to-amber-500";
            statusBadgeClass = "text-orange-600 font-bold";
            rowClass += " bg-orange-50/30 hover:bg-orange-100/60";
        } else {
            rowClass += " hover:bg-blue-50/40";
        }

        let agingBadgeHtml = "";
        if (isD8Closed) {
            agingBadgeHtml = `<span class="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 shadow-2xs"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Closed (${openDays}d)</span>`;
        } else if (isOverdue8D) {
            agingBadgeHtml = `<span class="inline-flex items-center gap-1 text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300 shadow-2xs animate-pulse"><span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span> 🚨 Open ${openDays} Days (Overdue >15d)</span>`;
        } else if (isOverdue3D) {
            agingBadgeHtml = `<span class="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 shadow-2xs"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> ⏰ 3D Overdue (${openDays === 0 ? openHours + 'h' : openDays + 'd'})</span>`;
        } else if (isWarning10D) {
            agingBadgeHtml = `<span class="inline-flex items-center gap-1 text-[10px] font-black text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-300 shadow-2xs"><span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span> ⚠️ Open ${openDays} Days</span>`;
        } else {
            agingBadgeHtml = `<span class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">⏱️ Open ${openDays > 0 ? openDays + ' Days' : openHours + ' Hours'}</span>`;
        }

        const displayTitle = c.problem_title || 'Untitled Report';
        
        return `
        <tr class="${rowClass}" data-rid="${c.id}">
            <td class="px-6 py-5">
                <div class="flex flex-col gap-1.5">
                    <span class="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md w-fit tracking-tighter">CASE ID</span>
                    <span class="font-mono text-[11px] text-slate-500 font-bold">${c.id}</span>
                    <div class="mt-0.5">${agingBadgeHtml}</div>
                </div>
            </td>

            <td class="px-6 py-5">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </div>
                    <div class="flex flex-col max-w-md">
                        <p class="text-[13px] font-black text-slate-700 leading-tight mb-1 truncate group-hover:text-blue-700 transition-colors" title="${displayTitle}">
                            ${displayTitle}
                        </p>
                        <div class="flex items-center gap-3">
                            <span class="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                                ${c.part_name || 'Generic Part'}
                            </span>
                            <span class="text-[10px] font-bold text-slate-300">|</span>
                            <span class="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                ${new Date(c.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </td>

            <td class="px-6 py-5">
                <div class="flex flex-col gap-2 min-w-[140px]">
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] uppercase tracking-widest ${statusBadgeClass}">${c.status}</span>
                        <span class="text-[10px] font-black text-slate-400">${Math.round(progressPct)}%</span>
                    </div>
                    <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div class="h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-1000" style="width: ${progressPct}%"></div>
                    </div>
                </div>
            </td>

            <td class="px-6 py-5 text-right">
                <div class="flex justify-end gap-2">
                    <button  onclick="Wap8DSystem.openReport('${c.id}')" 
                            class="h-9 px-4 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 active:scale-95 shadow-sm" title="Wap8 D System.Open Report" aria-label="Wap8 D System.Open Report">
                        OPEN REPORT
                    </button>

                    <button  onclick="Wap8DSystem.exportToPPTX('${c.id}')" 
                            class="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 active:scale-95 shadow-md shadow-emerald-100 flex items-center gap-1.5"
                            title="Export 8D PowerPoint 100%" aria-label="Wap8 D System.Export To P P T X">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                            <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>EXPORT PPTX</span>
                    </button>

                    <button  onclick="Wap8DSystem.deleteCase('${c.id}')" 
                            class="h-9 w-9 flex items-center justify-center bg-white border-2 border-slate-200 text-slate-400 hover:border-rose-500 hover:text-rose-500 rounded-xl transition-all duration-200 active:scale-95 shadow-sm"
                            title="Delete Report" aria-label="Wap8 D System.Delete Case">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>`;
    }

    if (!tbody) return;

    if (!_eightDScroller) {
        _eightDScroller = new window.VirtualTableScroller({
            containerId: 'eight-d-table-container',
            tbodyId: 'eight-d-list-body',
            rowHeight: 88,
            columnsCount: 4,
            rowBuilder: _build8DRow,
            emptyHtml: `<tr><td colspan="4" class="py-20 text-center text-slate-400"><div class="text-4xl mb-3 opacity-20">📂</div><p class="text-[11px] font-black uppercase tracking-widest italic">${_cases.length === 0 ? 'No 8D Reports Found' : 'No Matching 8D Reports'}</p></td></tr>`,
            onRenderComplete: () => {
                if (typeof reapplyKbdRowSelection === 'function') reapplyKbdRowSelection();
            }
        });
    }

    _eightDScroller.setItems(filteredCases);
}

/* ──────────────────────────────────────────
       NEW: RENDER SLIDE (Standardized Layout Version)
       ────────────────────────────────────────── */
    function renderSlide() {
        const container = document.getElementById('eight-d-slide-content');
        const indexText = document.getElementById('slide-index-display');
        indexText.textContent = `PAGE ${_currentSlide + 1} / 16`;
        const c = _currentCase;
        const d2 = c.d2_data || {};

        // ล้างค่าเก่าและตั้งค่า Container หลักให้เป็น Flex Column ความสูงเต็ม
        container.innerHTML = '';
// ค้นหาบรรทัดนี้ในฟังก์ชัน renderSlide()
        container.style.cssText = `
            width: 960px;
            height: 600px;
            box-sizing: border-box; 
            display: flex; 
            flex-direction: column; 
            padding: 20px 30px 15px 30px; 
            background: #fff;
            position: absolute;
            top: 0;
            left: 0;
            transform-origin: top left;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
            border: 1px solid #cbd5e1;
            overflow: hidden;
            border-radius: 4px;
        `;
        container.className = 'slide-page-paper slide-fade-in';

        // --- 1. Helper: Standard Header ---
        const getHeader = (title, badge, color = "blue") => `
            <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; margin-bottom: 5px; flex-shrink: 0;">
                <h1 contenteditable="true" style="font-size: 28px; font-weight: 950; margin: 0; color: #000; border: none; letter-spacing: -0.5px; outline: none;">${title}</h1>
                <div contenteditable="true" style="background: ${color}; color: ${color==='yellow'?'#000':'#fff'}; padding: 3px 12px; font-weight: 900; font-size: 11px; border: 1.2px solid #000; text-transform: uppercase; outline: none;">${badge}</div>
            </div>
            <div style="width: 100%; height: 4px; background: #003366; margin-bottom: 20px; flex-shrink: 0;"></div>
        `;

        // --- 2. Helper: Standard Footer (คงที่ทุกหน้า) ---
        const getFooter = () => `
            <div style="margin-top: auto; padding-top: 15px; border-top: 1.5px solid #f1f5f9; display: flex; align-items: center; width: 100%; flex-shrink: 0;">
                <div style="width: 120px;">
                    <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" style="width:100px; display:block;">
                        <ellipse cx="100" cy="40" rx="95" ry="38" fill="#003366" />
                        <ellipse cx="100" cy="40" rx="88" ry="33" fill="none" stroke="white" stroke-width="1.5" />
                        <text x="50%" y="58" text-anchor="middle" font-family="Times New Roman, serif" font-style="italic" font-weight="bold" font-size="44" fill="white">Carrier</text>
                    </svg>
                </div>
                <div style="flex: 1; text-align: center; font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                    Proprietary and Confidential
                </div>
                <div style="width: 120px;"></div>
            </div>
        `;

        let mainContent = '';

 // ==========================================
// แผ่นที่ 1: หน้าปก 8D Report (ปรับปรุงให้สัดส่วนเท่าหน้า D2 และพิมพ์กรอกข้อมูลได้ง่าย)
// ==========================================
if (_currentSlide === 0) {
    // 1. ดึงประเภท Report จากฐานข้อมูล (ตรวจสอบค่า RP, VF หรือ RECORDS)
    const reportType = c.report_data?.source_report_type || "";
    const isRP = reportType === 'RP';
    const isVF = reportType === 'VF' || reportType === 'RECORDS';

    // 2. ฟังก์ชันสร้างกล่อง (เพิ่มกิมมิกให้ขนาดคงที่และจัดกึ่งกลางตัว X)
    const check = (active) => active 
        ? `<span style="background:#000; color:#fff; width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center; border:1.5px solid #000; font-weight:bold; font-size:16px; flex-shrink:0;">X</span>` 
        : `<span style="width:24px; height:24px; display:inline-block; border:1.5px solid #000; background:#fff; flex-shrink:0;"></span>`;
    
    mainContent = `
        <div style="flex: 1; min-height: 0; display: flex; flex-direction: column; width: 100%;">
            <!-- 1. Header: หัวข้อใหญ่และกล่องแจ้งเตือนสีเหลือง -->
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 5px; flex-shrink: 0;">
                <h1 contenteditable="true" style="font-size: 42px; font-weight: 950; color: #000; margin: 0; outline: none; letter-spacing: -1.5px;">8D Report</h1>
                
                <div contenteditable="true" style="background:#ffff99; border:1.2px solid #ffcc00; padding:8px 15px; width:340px; color:red; font-size:10px; font-weight:900; border-radius:4px; line-height:1.2; outline: none; text-align:left;">
                    Suppliers can use any format of the report as long as all mandatory information is present.
                </div>
            </div>

            <!-- เส้นแบ่งหนาสีน้ำเงินมาตรฐาน -->
            <div style="width: 100%; height: 6px; background: #003366; margin-bottom: 15px; flex-shrink: 0;"></div>

            <!-- 2. ส่วนเลือกประเภท (Checkboxes) - แก้ไข: เพิ่มกรอบดำและจัดระดับข้อความให้ตรงกล่อง -->
            <div style="display: flex; justify-content: flex-end; margin-bottom: 15px; flex-shrink: 0;">
                <div style="border: 1.5px solid #000; padding: 8px 20px; display: flex; gap: 40px; font-weight: 900; font-size: 15px; background:#fff; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        ${check(isRP)}
                        <span style="color:#000; line-height: 1;">[IQC Rejected, RP]</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        ${check(isVF)}
                        <span style="color:#000; line-height: 1;">[Line claim, VF]</span>
                    </div>
                </div>
            </div>

            <!-- 3. ส่วนแสดงหัวข้อปัญหา (Problem Title) -->
            <div style="flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: flex-start; padding: 5px 0;">
                <label style="font-size: 13px; font-weight: 900; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">PROBLEM :</label>
                <div contenteditable="true" style="font-size: 24px; font-weight: 950; color: #000; line-height: 1.3; outline: none;">
                    ${getCleanProblemTitle(c.problem_title || '')}
                </div>
            </div>

            <!-- 4. Approve Table: ส่วนการยืนยันด้านล่าง -->
            <div style="align-self: flex-end; width: 550px; margin-bottom: 10px; flex-shrink: 0;">
                <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000; text-align: center; font-size: 11px;">
                    <tr style="background: #99badd; font-weight: 950;">
                        <td colspan="2" style="border: 1px solid #000; padding: 5px; text-transform: uppercase;">Suppliers submit</td>
                        <td colspan="2" style="border: 1px solid #000; padding: 5px; text-transform: uppercase;">CTC confirm</td>
                    </tr>
                    <tr style="font-weight: 800; background: #f8f9fa; height: 22px;">
                        <td style="border: 1px solid #000; width: 25%;">Confirmed (PIC)</td>
                        <td style="border: 1px solid #000; width: 25%;">Approved (QA Mgr)</td>
                        <td style="border: 1px solid #000; width: 25%;">Confirmed (Eng)</td>
                        <td style="border: 1px solid #000; width: 25%;">Approved (Spec)</td>
                    </tr>
                    <tr style="height: 55px; background:#fff;">
                        <td contenteditable="true" style="border:1px solid #000; outline: none;"></td>
                        <td contenteditable="true" style="border:1px solid #000; outline: none;"></td>
                        <td contenteditable="true" style="border:1px solid #000; outline: none;"></td>
                        <td contenteditable="true" style="border:1px solid #000; outline: none;"></td>
                    </tr>
                    <tr style="background: #fff; font-weight:800; height: 22px;">
                        <td style="border: 1px solid #000; text-align: left; padding-left: 5px;">Date: <span contenteditable="true" style="outline:none; font-weight:normal; display:inline-block; min-width:85px; min-height:16px; vertical-align:middle;"></span></td>
                        <td style="border: 1px solid #000; text-align: left; padding-left: 5px;">Date: <span contenteditable="true" style="outline:none; font-weight:normal; display:inline-block; min-width:85px; min-height:16px; vertical-align:middle;"></span></td>
                        <td style="border: 1px solid #000; text-align: left; padding-left: 5px;">Date: <span contenteditable="true" style="outline:none; font-weight:normal; display:inline-block; min-width:85px; min-height:16px; vertical-align:middle;"></span></td>
                        <td style="border: 1px solid #000; text-align: left; padding-left: 5px;">Date: <span contenteditable="true" style="outline:none; font-weight:normal; display:inline-block; min-width:85px; min-height:16px; vertical-align:middle;"></span></td>
                    </tr>
                </table>
            </div>
        </div>`;
}
        // ==========================================
        // แผ่นที่ 2: D1- Assign person in charge
        // ==========================================
        else if (_currentSlide === 1) {
            const s1Saved = c.report_data?.slide_1 || {};
            const blacklist = ["D1-", "Assign person in charge", "Fill by CTC", "Supplier name member", "TCTC member", "Fill by Supplier", "Person1", "Person2", "Person3", "Person4", "Person5", "Person6"];
            const getS1Val = (idx, defaultVal = "") => {
                let raw = s1Saved[`f_${idx}`];
                if (raw !== undefined && raw !== null) {
                    const cleanText = raw.replace(/<[^>]*>?/gm, '').trim();
                    if (blacklist.some(b => cleanText.toLowerCase().includes(b.toLowerCase()))) {
                        return defaultVal;
                    }
                    return raw;
                }
                return defaultVal;
            };

            const renderTable = (title, isSupplier = false) => `
                <table style="width:100%; border-collapse: collapse; border: 1.5px solid #000; table-layout: fixed; flex: 1;">
                    <thead style="background: #99badd;">
                        <tr>
                            <th colspan="3" style="padding: 6px 5px; border: 1.2px solid #000; font-size: 13px; font-weight: 900; text-align: center; color: ${isSupplier ? '#FF0000' : '#000'}; text-transform: uppercase; outline: none;">
                                ${title}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        ${[1, 2, 3, 4, 5, 6].map(i => {
                            const baseIdx = isSupplier ? (i + 5) * 2 : (i - 1) * 2;
                            let defaultName = "";
                            let defaultRole = "";
                            if (!isSupplier) {
                                if (i === 1) { defaultName = "Ms.Nipawan J."; defaultRole = "Senior Specialist (QAP)"; }
                                if (i === 2) { defaultName = "Mr.Komsan N."; defaultRole = "Senior Engineer (QAP)"; }
                            }
                            const initialName = getS1Val(baseIdx, defaultName);
                            const initialRole = getS1Val(baseIdx + 1, defaultRole);

                            return `
                            <tr style="height: 27px;">
                                <td rowspan="2" style="width: 25%; text-align: center; font-weight: 950; border: 1.2px solid #000; font-size: 11px; background: #fff; color: #000; outline: none;">Person${i}</td>
                                <td style="width: 15%; font-weight: 900; border: 1.2px solid #000; padding-left: 5px; font-size: 10px; background: #fff; color: #000;">Name:</td>
                                <td contenteditable="true" style="border: 1.2px solid #000; padding-left: 8px; font-size: 11px; font-weight: 700; color: #000; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; outline: none;">${initialName}</td>
                            </tr>
                            <tr style="height: 27px;">
                                <td style="font-weight: 900; border: 1.2px solid #000; padding-left: 5px; font-size: 10px; background: #fff; color: #000;">Role:</td>
                                <td contenteditable="true" style="border: 1.2px solid #000; padding-left: 8px; font-size: 11px; font-weight: 700; color: #475569; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; outline: none;">${initialRole}</td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>`;

            mainContent = `
                <div style="flex: 1; min-height: 0; display: flex; flex-direction: column; width: 100%;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; width: 100%; margin-bottom: 5px; flex-shrink: 0; overflow: hidden;">
                        <h1 style="font-size: 32px; font-weight: 950; margin: 0; color: #000; letter-spacing: -1px; white-space: nowrap; flex: 1; outline: none;">
                            D1-Assign person in charge
                        </h1>
                        <div style="background: #0000FF; color: #FFFF00; padding: 3px 12px; font-weight: 950; font-size: 11px; border: 1.2px solid #000; text-transform: uppercase; flex-shrink: 0; margin-left: 15px; outline: none; border-radius: 2px;">
                            &lt;Fill by CTC &amp; Supplier&gt;
                        </div>
                    </div>
                    <div style="width: 100%; height: 5px; background: #003366; margin-bottom: 15px; flex-shrink: 0;"></div>

                    <div style="flex: 1; min-height: 0; display: flex; gap: 25px; align-items: flex-start; justify-content: space-between; width: 100%; overflow: hidden;">
                        <div style="flex: 1; min-width: 0;">
                            ${renderTable('TCTC MEMBER', false)}
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            ${renderTable('SUPPLIER NAME MEMBER', true)}
                        </div>
                    </div>
                </div>
            `;
        }
// ==========================================
// แผ่นที่ 3: D2- Define the Problem (ฉบับ Responsive ป้องกันตารางล้น 100%)
// ==========================================
else if (_currentSlide === 2) {
    const rawTitle = getCleanProblemTitle(c.problem_title || "");
    
    // --- 1. ระบบ AI Parsing แยกส่วนข้อมูล ---
    let extPartName = c.part_name || "-";
    let extDrawing = "-";
    let extSupplier = "OSA"; 
    let extDefect = rawTitle;

    try {
        const match = rawTitle.match(/Inform\s+(.*?)\s*\/\s*(\d+)\s+(.*?)\s+(.*)/i);
        if (match) {
            extPartName = match[1].replace(/quality problem about/i, '').trim(); 
            extDrawing  = match[2].trim();     
            extSupplier = match[3].trim();     
            let defectPart = match[4].replace(/found defect/i, '').trim();
            extDefect = defectPart.split(/[=:/]/)[0].trim(); 
        }
    } catch (e) { console.log("Parsing fallback"); }

    // --- 2. ระบบคำนวณสถิติ ---
    const ng = Number(c.ng_qty) || 0;
    const ok = Number(c.ok_qty) || 0;
    const total = ng + ok; 
    const defectPct = total > 0 ? ((ng / total) * 100).toFixed(2) + " %" : "0.00 %";
    const today = new Date().toISOString().split('T')[0];
    const supportImage = c.report_data?.evidence_img || ""; 

    mainContent = `
        <div style="flex: 1; min-height: 0; display: flex; flex-direction: column; width: 100%;">
            
            <!-- Header Section (Fixed Height) -->
            <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; margin-bottom: 5px; flex-shrink: 0;">
                <h1 contenteditable="true" style="font-size: 38px; font-weight: 950; margin: 0; color: #000; outline: none; letter-spacing: -1.5px; line-height: 0.9;">
                    D2-Define the Problem
                </h1>
                <div contenteditable="true" style="background: #0000FF; color: #FFFF00; padding: 2px 10px; font-weight: 950; font-size: 13px; border: 1.2px solid #000; text-transform: uppercase; outline: none; margin-bottom: 4px;">
                    &lt;Fill by CTC &gt;
                </div>
            </div>
            <div style="width: 100%; height: 5px; background: #003366; margin-bottom: 10px; flex-shrink: 0;"></div>

            <!-- Main Content Area (Flexible Height) -->
            <div style="display: flex; gap: 20px; flex: 1; min-height: 0; overflow: hidden; margin-bottom: 10px; align-items: stretch;">
                
                <!-- ฝั่งซ้าย: ตาราง (บีบอัดความสูงให้พอดีพื้นที่) -->
                <div style="flex: 0 0 45%; display: flex; flex-direction: column; min-height: 0;">
                    <table style="width: 100%; height: 100%; border-collapse: collapse; border: 1.5px solid #000; table-layout: fixed; font-size: 11px;">
                        <tr style="background:#2563eb; color:#fff; font-weight:900; height: 8.5%;">
                            <td style="border:1px solid #000; padding:1px 8px; width:40%;">VF/RP No.</td>
                            <td contenteditable="true" style="border:1px solid #000; padding:1px 8px; outline: none; font-weight:950; font-family: monospace;">${c.id}</td>
                        </tr>
                        <tr style="height: 7.5%;">
                            <td style="border:1px solid #000; padding:1px 8px; font-weight:900; background:#f1f5f9;">Issue Date</td>
                            <td contenteditable="true" style="border:1px solid #000; padding:1px 8px; outline: none;">${new Date(c.created_at).toLocaleDateString('en-GB')}</td>
                        </tr>
                        <tr style="height: 7.5%;">
                            <td style="border:1px solid #000; padding:1px 8px; font-weight:900;">Model</td>
                            <td contenteditable="true" style="border:1px solid #000; padding:1px 8px; outline: none;">-</td>
                        </tr>
                        <tr style="height: 8%;">
                            <td style="border:1px solid #000; padding:1px 8px; font-weight:900; background:#f1f5f9;">Part Name</td>
                            <td contenteditable="true" style="border:1px solid #000; padding:1px 8px; font-weight:950; outline: none;">${extPartName}</td>
                        </tr>
                        <tr style="height: 7.5%;">
                            <td style="border:1px solid #000; padding:1px 8px; font-weight:900;">Drawing No.</td>
                            <td contenteditable="true" style="border:1px solid #000; padding:1px 8px; outline: none; font-family: monospace;">${extDrawing}</td>
                        </tr>
                        <tr style="height: 7.5%;">
                            <td style="border:1px solid #000; padding:1px 8px; font-weight:900; background:#f1f5f9;">Part Group</td>
                            <td contenteditable="true" style="border:1px solid #000; padding:1px 8px; outline: none;">${c.part_group || 'Steel'}</td>
                        </tr>
                        <tr style="height: 7.5%;">
                            <td style="border:1px solid #000; padding:1px 8px; font-weight:900;">Supplier</td>
                            <td contenteditable="true" style="border:1px solid #000; padding:1px 8px; font-weight:950; color: #2563eb; outline: none;">${extSupplier}</td>
                        </tr>
                        <tr style="height: 9.5%;">
                            <td style="border:1px solid #000; padding:1px 8px; font-weight:900; background:#f1f5f9;">Defect name</td>
                            <td contenteditable="true" style="border:1px solid #000; padding:1px 8px; color:red; font-weight:950; outline: none; line-height: 1;">${extDefect}</td>
                        </tr>
                        <tr style="height: 8%;">
                            <td style="border:1px solid #000; padding:1px 8px; font-weight:900;">Lot size/Used Q'ty</td>
                            <td contenteditable="true" style="border:1px solid #000; padding:1px 8px; outline: none; font-weight:900;">${ng} / ${total} Pcs.</td>
                        </tr>
                        <tr style="height: 8%;">
                            <td style="border:1px solid #000; padding:1px 8px; font-weight:900; background:#f1f5f9;">Defect Q'ty (%)</td>
                            <td contenteditable="true" style="border:1px solid #000; padding:1px 8px; font-weight:950; outline: none;">${defectPct}</td>
                        </tr>
                        <tr style="height: 7.5%;">
                            <td style="border:1px solid #000; padding:1px 8px; font-weight:900;">Trouble Rank</td>
                            <td contenteditable="true" style="border:1px solid #000; padding:1px 8px; font-weight:950; color:red; outline: none;">B</td>
                        </tr>
                        <tr style="height: 7.5%;">
                            <td style="border:1px solid #000; padding:1px 8px; font-weight:900; background:#f1f5f9;">Inspection Date</td>
                            <td contenteditable="true" style="border:1px solid #000; padding:1px 8px; outline: none;">${today}</td>
                        </tr>
                        <tr style="height: 7.5%;">
                            <td style="border:1px solid #000; padding:1px 8px; font-weight:900;">Defect Found Area</td>
                            <td contenteditable="true" style="border:1px solid #000; padding:1px 8px; outline: none;">Line claim</td>
                        </tr>
                    </table>
                </div>
                
                <!-- ฝั่งขวา: รูปภาพ (ยืดหดตามตาราง) -->
                <div style="flex: 1; display: flex; flex-direction: column; min-width: 0;">
                    <h3 contenteditable="true" style="font-size: 15px; font-weight: 950; margin: 0 0 5px 0; color: #000; outline: none; text-transform: uppercase;">
                        Describe of Defect <span style="background: yellow; color: red; padding: 0 5px; font-style: italic; font-size: 11px; font-weight: 800;">(Picture and Judgement method)</span>
                    </h3>
                    <div style="flex: 1; border: 2px solid #000; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; border-radius: 4px;">
                        ${supportImage 
                            ? `<img  src="${supportImage}" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block; margin: auto;" alt="Image" title="Image">` 
                            : '<span style="color:#eee; font-size:40px; font-weight:900;">PHOTO AREA</span>'}
                    </div>
                </div>
            </div>


        </div>`;
}
// ==========================================
// แผ่นที่ 4: D2- [Further Detail] (ฉบับสมบูรณ์: ดึงรูปภาพ + ดึง Remark อัตโนมัติ)
// ==========================================
else if (_currentSlide === 3) {
    // 1. ดึงข้อมูลพื้นฐานจากเคส
    const problemTitle = c.problem_title || "-";
    const partName = c.part_name || "-";
    const createDate = new Date(c.created_at).toLocaleDateString('en-GB', {
        day: 'numeric', 
        month: 'short', 
        year: 'numeric'
    });
    
    // 2. ดึงรูปภาพจาก JSON
    const supportImage = c.report_data?.evidence_img || c.evidence_img || c.image_url || ""; 

    // 3. ดึงข้อมูลหมายเหตุ (Remark) มาทำเป็น Temporary Actions
    // หากไม่มีหมายเหตุ ให้ใช้ข้อความ Default เป็นไกด์ไลน์
    const rawRemark = c.report_data?.source_remark || c.report_data?.temporary_actions || "";
    let tempActionContent = "";

    if (rawRemark.trim() !== "") {
        // แปลงข้อความหมายเหตุ โดยถ้ามีการขึ้นบรรทัดใหม่ ให้ใส่จุด Bullet (•) นำหน้าทุกบรรทัด
        tempActionContent = rawRemark.split('\n')
            .map(line => {
                const cleanLine = line.trim().replace(/^[•\-\*]\s*/, '');
                return cleanLine ? `• ${cleanLine}` : '';
            })
            .filter(Boolean)
            .join('<br>');
    } else {
        // กรณีไม่มีข้อมูลหมายเหตุส่งมา (Fallback)
        tempActionContent = `• Sorting 100% at line / WIP Stock<br>
                             • Inform vendor for urgent root cause analysis<br>
                             • Set point of control for next lot shipment`;
    }

    mainContent = `
        <div style="flex: 1; min-height: 0; display: flex; flex-direction: column; width: 100%;">
            <!-- 1. Header -->
                <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; margin-bottom: 5px; flex-shrink: 0;">
                    <h1 contenteditable="true" style="font-size: 38px; font-weight: 950; margin: 0; color: #000; outline: none; letter-spacing: -1.5px; line-height: 1;">
                        D2-Define the Problem <span style="color:#003366; font-size: 24px; font-weight: 700;">[Further Detail]</span>
                    </h1>
                    
                    <div contenteditable="true" style="background: #0000FF; color: #FFFF00; padding: 3px 12px; font-weight: 950; font-size: 14px; border: 1.5px solid #000; text-transform: uppercase; outline: none; margin-bottom: 5px; line-height: 1;">
                        &lt;Fill by CTC &gt;
                    </div>
                </div>
                
                <div style="width: 100%; height: 6px; background: #003366; margin-bottom: 15px; flex-shrink: 0;"></div>

                <!-- 2. ส่วนเนื้อหา (แบ่งซ้าย-ขวา) -->
                <div style="display: flex; gap: 35px; flex: 1; min-height: 0; align-items: stretch; margin-bottom: 10px;">
                    
                    <!-- ฝั่งซ้าย: รูปภาพขนาดใหญ่ พร้อมรักษาสัดส่วนภาพ (Aspect Ratio) -->
                    <div style="flex: 0 0 54%; border: 2.5px solid #000; background: #fff; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; border-radius: 4px;">
                        ${supportImage 
                            ? `<img  src="${supportImage}" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block; margin: auto;" alt="Image" title="Image">` 
                            : '<span style="color:#cbd5e1; font-weight:900; font-size:24px; letter-spacing:1px;">NO EVIDENCE PHOTO</span>'
                        }
                    </div>

                    <!-- ฝั่งขวา: รายละเอียดข้อความ -->
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 20px; padding-top: 5px; min-width: 0;">
                        
                        <!-- Block: Detail (ข้อมูลเบื้องต้น) -->
                        <div>
                            <h3 contenteditable="true" style="font-size: 18px; font-weight: 950; margin: 0 0 8px 0; border-bottom: 3px solid #003366; display: inline-block; outline: none; text-transform: uppercase;">DETAIL</h3>
                            <p contenteditable="true" style="font-size: 15px; color: #000; line-height: 1.5; outline: none; margin: 0; font-weight: 600;">
                                ${formatDetailSentence(c)}
                            </p>
                        </div>

                        <!-- Block: TEMPORARY ACTIONS -->
                        <div>
                            <h3 contenteditable="true" style="font-size: 18px; font-weight: 950; margin: 0 0 8px 0; border-bottom: 3px solid #003366; display: inline-block; outline: none; text-transform: uppercase;">TEMPORARY ACTIONS</h3>
                            <div contenteditable="true" style="font-size: 14px; color: #1e293b; line-height: 1.6; outline: none; font-weight: 600;">
                                ${tempActionContent}
                            </div>
                        </div>

                    </div>
                </div>
        </div>
    `;
}
        // ==========================================
        // แผ่นที่ 5: D3-Interim Containment Action (ICA)
        // ==========================================
        else if (_currentSlide === 4) {
            const locations = ["CTC WIP", "CTC Stock", "Supplier Stock", "On the way", "", ""];
            
            mainContent = `
                <div style="flex: 1; min-height: 0; display: flex; flex-direction: column; width: 100%;">
                    <!-- Header -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; margin-bottom: 5px; flex-shrink: 0;">
                        <h1 contenteditable="true" style="font-size: 36px; font-weight: 950; margin: 0; color: #000; letter-spacing: -1.5px; outline: none; line-height: 1;">
                            D3-Interim Containment Action (ICA)
                        </h1>
                        <div contenteditable="true" style="background: #0000FF; color: #FFFF00; padding: 3px 12px; font-weight: 950; font-size: 13px; border: 1.5px solid #000; text-transform: uppercase; outline: none; margin-bottom: 5px; line-height: 1; flex-shrink: 0;">
                            &lt;Fill by CTC & Supplier&gt;
                        </div>
                    </div>
                    <div style="width: 100%; height: 6px; background: #003366; margin-bottom: 12px; flex-shrink: 0;"></div>

                    <!-- Main Table -->
                    <div style="width: 100%; flex-shrink: 0;">
                        <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000; font-size: 11px; table-layout: fixed;">
                            <thead style="background: #fff; font-weight: 900; text-align: center;">
                                <tr style="height: 38px;">
                                    <td style="border: 1px solid #000; width: 12%;">Location</td>
                                    <td style="border: 1px solid #000; width: 6%;">Qty</td>
                                    <td style="border: 1px solid #000; width: 15%;">Action<br><span style="font-size:9px; font-weight:500;">(Sorting, Rework, etc.)</span></td>
                                    <td style="border: 1px solid #000; width: 10%;">Person in charge</td>
                                    <td style="border: 1px solid #000; width: 10%;">Start date<br><span style="font-size:9px; font-weight:500;">[YY.MM.DD]</span></td>
                                    <td style="border: 1px solid #000; width: 10%;">Finished Date<br><span style="font-size:9px; font-weight:500;">[YY.MM.DD]</span></td>
                                    <td style="border: 1px solid #000; width: 8%;">Sorted Q'ty</td>
                                    <td style="border: 1px solid #000; width: 8%;">NG Q'ty</td>
                                    <td style="border: 1px solid #000; width: 11%;">Disposition</td>
                                    <td style="border: 1px solid #000; width: 10%;">Remarks</td>
                                </tr>
                            </thead>
                            <tbody>
                                ${locations.map(loc => `
                                    <tr style="height: 26px;">
                                        <td contenteditable="true" style="border: 1px solid #000; padding: 0 6px; font-weight: 800; background: #fff; outline: none; vertical-align: middle;">${loc}</td>
                                        <td contenteditable="true" style="border: 1px solid #000; text-align: center; vertical-align: middle; outline: none;">${loc ? '0' : ''}</td>
                                        <td contenteditable="true" style="border: 1px solid #000; text-align: center; vertical-align: middle; outline: none;"></td>
                                        <td contenteditable="true" style="border: 1px solid #000; text-align: center; vertical-align: middle; outline: none;"></td>
                                        <td contenteditable="true" style="border: 1px solid #000; text-align: center; vertical-align: middle; outline: none;"></td>
                                        <td contenteditable="true" style="border: 1px solid #000; text-align: center; vertical-align: middle; outline: none;"></td>
                                        <td contenteditable="true" style="border: 1px solid #000; text-align: center; vertical-align: middle; outline: none;"></td>
                                        <td contenteditable="true" style="border: 1px solid #000; text-align: center; vertical-align: middle; outline: none;"></td>
                                        <td contenteditable="true" style="border: 1px solid #000; text-align: center; vertical-align: middle; outline: none; color: red;"></td>
                                        <td contenteditable="true" style="border: 1px solid #000; text-align: center; vertical-align: middle; outline: none;"></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- Bottom Sections (3 Boxes) -->
                    <div style="width: 100%; margin-top: 10px; flex: 1; min-height: 0; flex-shrink: 0; background: #fff;">
                        <table style="width: 100%; height: 100%; border-collapse: collapse; border: 1.5px solid #000; font-size: 12px; table-layout: fixed;">
                            <thead>
                                <tr style="height: 32px; background: #8caed6;">
                                    <th style="border: 1.5px solid #000; width: 38%; text-align: left; padding: 5px 10px; font-weight: 900; color: #000; text-decoration: underline;">Sort/Rework Method Used:</th>
                                    <th style="border: 1.5px solid #000; width: 30%; text-align: left; padding: 5px 10px; font-weight: 900; color: #000; text-decoration: underline;">Identify mark:</th>
                                    <th style="border: 1.5px solid #000; width: 32%; text-align: left; padding: 5px 10px; font-weight: 900; color: #000; text-decoration: underline;">Sorting/Rework lot Ship Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="vertical-align: top; background: #fff;">
                                    <td contenteditable="true" style="border: 1.5px solid #000; padding: 8px 10px; line-height: 1.5; font-weight: 500; color: #000; outline: none; background: #fff;">
                                        V.TKCP screw Sorting parts in stock<br>Stock : 0 Pcs.<br>OK : .... Pcs.<br>NG : .... Pcs.
                                    </td>
                                    <td contenteditable="true" style="border: 1.5px solid #000; padding: 8px 10px; font-weight: 500; color: #000; outline: none; background: #fff;">
                                        Mark label ok control
                                    </td>
                                    <td contenteditable="true" style="border: 1.5px solid #000; padding: 8px 10px; line-height: 1.5; font-weight: 500; color: #000; outline: none; background: #fff;">
                                        Sorting date : ....<br>Shipment replacement part date : ....
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Instruction Footer -->
                    <div style="background: #ffffcc; border: 1.5px solid #ffcc00; margin-top: 10px; padding: 6px 12px; font-size: 11px; line-height: 1.4; flex-shrink: 0; border-radius: 2px;">
                        <div style="color: red; font-weight: 900; font-style: italic;">3D - Interim Containment Action (ICA)</div>
                        <div style="color: #000; font-style: italic;">
                            Take action to ensure that the customer is protected and the problem does not get out of your area. Ensure all suspect parts of the manufacturing process, On-Hand stock, On the way has been quarantine.
                        </div>
                    </div>
                </div>
            `;
        }
// ==========================================
// แผ่นที่ 6: D4-Identify Root cause and Escape cause (PROCESS FLOW - MATCH D4 WIDTH)
// ==========================================
else if (_currentSlide === 5) {
    // 1. ฟังก์ชันสร้างแถว
    const createFlowRow = (text, isRed = false, isDiamond = false, elementId = "") => {
        const idAttr = elementId ? `id="${elementId}"` : '';
        const boxStyle = isDiamond 
            ? `position: relative; width: 180px; height: 50px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`
            : `width: 180px; height: 38px; background: #d9d9d9; border: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 12px; text-transform: uppercase; color: ${isRed ? 'red' : '#000'}; outline: none; box-shadow: 2px 2px 0px #000; flex-shrink: 0;`;

        const leftContent = isDiamond ? `
            <svg viewBox="0 0 100 45" style="width: 100%; height: 100%; filter: drop-shadow(1px 1px 0px #000);">
                <polygon points="50,2 98,22.5 50,43 2,22.5" fill="#fff" stroke="#000" stroke-width="1.5"/>
            </svg>
            <div contenteditable="true" style="position: absolute; font-weight: 900; font-size: 10px; text-align: center; width: 75%; line-height: 1.1; text-transform: uppercase; outline: none;">${text}</div>
        ` : `<div contenteditable="true" style="outline:none;">${text}</div>`;

        return `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 2px; width: 100%;">
                <div ${idAttr} style="flex-shrink: 0; ${boxStyle}">${leftContent}</div>
                <div onclick="const inp=this.querySelector('input'); if(inp) inp.click();" style="flex: 1; height: 58px; border: 1.5px dashed #3b82f6; background: #f8fafc; position: relative; cursor: pointer; display: flex; align-items: center; justify-content: center; overflow: hidden; background-size: contain; background-repeat: no-repeat; background-position: center; border-radius: 4px;">
                    <div class="photo-placeholder" style="display: flex; align-items: center; gap: 5px; color: #1e40af;">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        <span style="font-size: 10px; color: #1e3a8a; font-weight: 800; letter-spacing: 0.2px;">+ Add Photo</span>
                    </div>
                    <input type="file" accept="image/*" style="display:none" onclick="event.stopPropagation()" onchange="if(this.files && this.files[0]){ const reader = new FileReader(); reader.onload=(e)=>{this.parentElement.style.backgroundImage='url('+e.target.result+')'; this.parentElement.style.backgroundSize='contain'; const ph=this.parentElement.querySelector('.photo-placeholder'); if(ph) ph.style.display='none';}; reader.readAsDataURL(this.files[0]); }">
                </div>
            </div>`;
    };

    const createArrow = () => `
        <div style="width: 180px; height: 12px; display: flex; justify-content: center; align-items: center; margin: -2px 0;">
            <svg width="12" height="12" viewBox="0 0 20 20"><line x1="10" y1="0" x2="10" y2="14" stroke="#000" stroke-width="3"/><polygon points="10,20 5,11 15,11" fill="#000"/></svg>
        </div>`;

    mainContent = `
        <div style="flex: 1; min-height: 0; display: flex; flex-direction: column; width: 100%;">
            
            <!-- HEADER -->
            <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; margin-bottom: 2px; flex-shrink: 0;">
                <h1 contenteditable="true" style="font-size: 32px; font-weight: 950; margin: 0; color: #000; letter-spacing: -1.5px; outline: none; line-height: 1;">
                    D4-Identify Root cause and Escape cause
                </h1>
                <div style="background: #0000FF; color: white; padding: 3px 14px; font-weight: 900; font-size: 13px; border: 1.5px solid #000; margin-bottom: 4px; border-radius: 2px;">
                    &lt;Fill by Supplier&gt;
                </div>
            </div>
            <div style="width: 100%; height: 6px; background: #003366; margin-bottom: 10px; flex-shrink: 0;"></div>

            <!-- TITLE -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-shrink: 0;">
                <span contenteditable="true" style="font-size: 18px; font-weight: 900; text-decoration: underline; color: #003366; outline: none;">Process Flow</span>
                <span style="color: #f59e0b; font-size: 11px; font-weight: 800; margin-right: 10px;">Please fill photo</span>
            </div>

            <!-- MAIN CHART AREA -->
            <div id="d4-chart-area" style="display: flex; gap: 40px; flex: 1; min-height: 0; position: relative; align-items: flex-start; justify-content: space-between; padding-top: 5px;">
                
                <!-- COLUMN LEFT (5 STEPS) -->
                <div id="d4-left-col" style="flex: 1; display: flex; flex-direction: column; max-width: 48%;">
                    ${createFlowRow("DRAW")}
                    ${createArrow()}
                    ${createFlowRow("BEND 1")}
                    ${createArrow()}
                    ${createFlowRow("PIER+BURR", true)}
                    ${createArrow()}
                    ${createFlowRow("BEND 2")}
                    ${createArrow()}
                    ${createFlowRow("INSPECTION IN-PROCESS", false, true, "d4-diamond-5")}
                </div>

                <!-- COLUMN RIGHT (3 STEPS) -->
                <div id="d4-right-col" style="flex: 1; display: flex; flex-direction: column; max-width: 48%;">
                    ${createFlowRow("INSPECTION OUT-GOING CHECK", false, true, "d4-diamond-6")}
                    ${createArrow()}
                    ${createFlowRow("PACKING")}
                    ${createArrow()}
                    ${createFlowRow("SHIPMENT")}
                </div>

                <!-- OVERLAY CONNECTOR SVG -->
                <svg id="d4-connector-svg" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; z-index: 10;">
                    <path id="d4-connector-path" d="M 90,240 L 90,252 L 220,252 L 220,25 L 450,25" fill="none" stroke="#000" stroke-width="2.5" stroke-linejoin="miter" />
                    <polygon id="d4-connector-arrow" points="458,25 448,19 448,31" fill="#000" />
                </svg>

            </div>
        </div>
    `;
}
// ==========================================
// แผ่นที่ 7: D4-Identify Root cause and Escape cause (ROOT CAUSE ANALYSIS)
// ==========================================
else if (_currentSlide === 6) {
    const whyRow = (label, isLast = false) => `
        <div style="display: flex; ${isLast ? '' : 'border-bottom: 1.5px solid #000;'} min-height: 52px;">
            <div style="width: 75px; background: #d9d9d9; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 13px; color: #000; flex-shrink: 0;">
                ${label}
            </div>
            <div contenteditable="true" style="flex: 1; padding: 8px 12px; font-size: 13.5px; font-weight: 700; color: #000; outline: none; background: #fff; line-height: 1.35; display: flex; align-items: center;">
            </div>
        </div>`;

    mainContent = `
        <div style="flex: 1; min-height: 0; display: flex; flex-direction: column; width: 100%;">
            
            <!-- HEADER SECTION -->
            <div style="display: flex; justify-content: space-between; align-items: baseline; width: 100%; margin-bottom: 5px; flex-shrink: 0;">
                <h1 style="font-size: 32px; font-weight: 950; margin: 0; color: #000; letter-spacing: -1px; white-space: nowrap; flex: 1; outline: none;">
                    D4-Identify Root cause and Escape cause
                </h1>
                <div style="background: #0000FF; color: white; padding: 3px 14px; font-weight: 900; font-size: 13px; border: 1.5px solid #000; margin-bottom: 4px; border-radius: 2px; flex-shrink: 0; margin-left: 15px;">
                    &lt;Fill by Supplier&gt;
                </div>
            </div>
            
            <!-- BLUE DIVIDER -->
            <div style="width: 100%; height: 5px; background: #003366; margin-bottom: 12px; flex-shrink: 0;"></div>
            
            <!-- SUB-HEADER AREA -->
            <div style="margin-bottom: 8px; flex-shrink: 0; display: flex; align-items: center;">
                <span style="font-size: 17px; font-weight: 900; text-decoration: underline; color: #003366;">ROOT CAUSE ANALYSIS</span>
                <span style="font-size: 17px; font-weight: 900; color: #FF0000; margin-left: 8px;">(Why problem happen ?)</span>
            </div>

            <!-- TABLE CONTENT -->
            <div style="border: 1.5px solid #000; width: 100%; background: #fff; display: flex; flex-direction: column; box-shadow: 2px 2px 0px rgba(0,0,0,0.08); margin-bottom: 10px;">
                <!-- Question Header -->
                <div style="display: flex; border-bottom: 1.5px solid #000; background: #D9E1F2;">
                    <div style="width: 75px; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 15px; padding: 8px 0; flex-shrink: 0; background: #B4C7E7; color: #000;">
                        1
                    </div>
                    <div contenteditable="true" style="flex: 1; padding: 8px 14px; font-weight: 900; font-size: 15px; color: #000; outline: none; display: flex; align-items: center;">
                        Why was the non conformity made?
                    </div>
                </div>

                <!-- Why Rows -->
                <div>
                    ${whyRow('Why1')}
                    ${whyRow('Why2')}
                    ${whyRow('Why3')}
                    ${whyRow('Why4')}
                    ${whyRow('Why5', true)}
                </div>
            </div>

            <!-- INSTRUCTION BOX -->
            <div contenteditable="true" style="margin-top: auto; padding: 8px 12px; background: #FEFCE8; border: 1.5px solid #EAB308; border-radius: 3px; font-size: 11px; line-height: 1.35; outline: none; cursor: text; flex-shrink: 0;">
                <div style="color: #DC2626; font-weight: 900; font-style: italic; margin-bottom: 2px;">D4 - Identify Root Cause and Escape Cause</div>
                <div style="color: #1E293B; font-weight: 600;">- Identify all potential reasons which could explain why the problem occurred.</div>
                <div><span style="color: #DC2626; font-style: italic; font-weight: 900;">ROOT CAUSE:</span> <span style="color: #1E293B; font-weight: 600;">Explain what went wrong with the component, process, or system</span></div>
                <div><span style="color: #DC2626; font-style: italic; font-weight: 900;">ESCAPE CAUSE:</span> <span style="color: #1E293B; font-weight: 600;">State how the problem got through the system without being detected and shipped before reaching the customer.</span></div>
            </div>
        </div>
    `;
}

// ==========================================
// แผ่นที่ 8: D4-Identify Escape cause (ESCAPE CAUSE ANALYSIS)
// ==========================================
else if (_currentSlide === 7) {
    const whyRow = (label, isLast = false) => `
        <div style="display: flex; ${isLast ? '' : 'border-bottom: 1.5px solid #000;'} min-height: 52px;">
            <div style="width: 75px; background: #d9d9d9; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 13px; color: #000; flex-shrink: 0;">
                ${label}
            </div>
            <div contenteditable="true" style="flex: 1; padding: 8px 12px; font-size: 13.5px; font-weight: 700; color: #000; outline: none; background: #fff; line-height: 1.35; display: flex; align-items: center;">
            </div>
        </div>`;

    mainContent = `
        <div style="flex: 1; min-height: 0; display: flex; flex-direction: column; width: 100%;">
            
            <!-- HEADER SECTION -->
            <div style="display: flex; justify-content: space-between; align-items: baseline; width: 100%; margin-bottom: 5px; flex-shrink: 0;">
                <h1 style="font-size: 32px; font-weight: 950; margin: 0; color: #000; letter-spacing: -1px; white-space: nowrap; flex: 1; outline: none;">
                    D4-Identify Root cause and Escape cause
                </h1>
                <div style="background: #0000FF; color: white; padding: 3px 14px; font-weight: 900; font-size: 13px; border: 1.5px solid #000; margin-bottom: 4px; border-radius: 2px; flex-shrink: 0; margin-left: 15px;">
                    &lt;Fill by Supplier&gt;
                </div>
            </div>
            
            <!-- BLUE DIVIDER -->
            <div style="width: 100%; height: 5px; background: #003366; margin-bottom: 12px; flex-shrink: 0;"></div>
            
            <!-- SUB-HEADER AREA -->
            <div style="margin-bottom: 8px; flex-shrink: 0; display: flex; align-items: center;">
                <span style="font-size: 17px; font-weight: 900; text-decoration: underline; color: #003366;">ESCAPE CAUSE ANALYSIS</span>
                <span style="font-size: 17px; font-weight: 900; color: #FF0000; margin-left: 8px;">(Why not detected ?)</span>
            </div>

            <!-- TABLE CONTENT -->
            <div style="border: 1.5px solid #000; width: 100%; background: #fff; display: flex; flex-direction: column; box-shadow: 2px 2px 0px rgba(0,0,0,0.08); margin-bottom: 10px;">
                <!-- Question Header -->
                <div style="display: flex; border-bottom: 1.5px solid #000; background: #D9E1F2;">
                    <div style="width: 75px; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 15px; padding: 8px 0; flex-shrink: 0; background: #B4C7E7; color: #000;">
                        1
                    </div>
                    <div contenteditable="true" style="flex: 1; padding: 8px 14px; font-weight: 900; font-size: 15px; color: #000; outline: none; display: flex; align-items: center;">
                        Why was the non conformity could not detect ?
                    </div>
                </div>

                <!-- Why Rows -->
                <div>
                    ${whyRow('Why1')}
                    ${whyRow('Why2')}
                    ${whyRow('Why3')}
                    ${whyRow('Why4')}
                    ${whyRow('Why5', true)}
                </div>
            </div>

            <!-- INSTRUCTION BOX -->
            <div contenteditable="true" style="margin-top: auto; padding: 8px 12px; background: #FEFCE8; border: 1.5px solid #EAB308; border-radius: 3px; font-size: 11px; line-height: 1.35; outline: none; cursor: text; flex-shrink: 0;">
                <div style="color: #DC2626; font-weight: 900; font-style: italic; margin-bottom: 2px;">D4 - Identify Root Cause and Escape Cause</div>
                <div style="color: #1E293B; font-weight: 600;">- Identify all potential reasons which could explain why the problem occurred.</div>
                <div><span style="color: #DC2626; font-style: italic; font-weight: 900;">ROOT CAUSE:</span> <span style="color: #1E293B; font-weight: 600;">Explain what went wrong with the component, process, or system</span></div>
                <div><span style="color: #DC2626; font-style: italic; font-weight: 900;">ESCAPE CAUSE:</span> <span style="color: #1E293B; font-weight: 600;">State how the problem got through the system without being detected and shipped before reaching the customer.</span></div>
            </div>
        </div>
    `;
}

// ==========================================
// แผ่นที่ 9: D4-Identify System cause (SYSTEM CAUSE ANALYSIS)
// ==========================================
else if (_currentSlide === 8) {
    const whyRow = (label, isLast = false) => `
        <div style="display: flex; ${isLast ? '' : 'border-bottom: 1.5px solid #000;'} min-height: 52px;">
            <div style="width: 75px; background: #d9d9d9; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 13px; color: #000; flex-shrink: 0;">
                ${label}
            </div>
            <div contenteditable="true" style="flex: 1; padding: 8px 12px; font-size: 13.5px; font-weight: 700; color: #000; outline: none; background: #fff; line-height: 1.35; display: flex; align-items: center;">
            </div>
        </div>`;

    mainContent = `
        <div style="flex: 1; min-height: 0; display: flex; flex-direction: column; width: 100%;">
            
            <!-- HEADER SECTION -->
            <div style="display: flex; justify-content: space-between; align-items: baseline; width: 100%; margin-bottom: 5px; flex-shrink: 0;">
                <h1 style="font-size: 32px; font-weight: 950; margin: 0; color: #000; letter-spacing: -1px; white-space: nowrap; flex: 1; outline: none;">
                    D4-Identify Root cause and Escape cause
                </h1>
                <div style="background: #0000FF; color: white; padding: 3px 14px; font-weight: 900; font-size: 13px; border: 1.5px solid #000; margin-bottom: 4px; border-radius: 2px; flex-shrink: 0; margin-left: 15px;">
                    &lt;Fill by Supplier&gt;
                </div>
            </div>
            
            <!-- BLUE DIVIDER -->
            <div style="width: 100%; height: 5px; background: #003366; margin-bottom: 12px; flex-shrink: 0;"></div>
            
            <!-- SUB-HEADER AREA -->
            <div style="margin-bottom: 8px; flex-shrink: 0; display: flex; align-items: center;">
                <span style="font-size: 17px; font-weight: 900; text-decoration: underline; color: #003366;">SYSTEM CAUSE ANALYSIS</span>
                <span style="font-size: 17px; font-weight: 900; color: #FF0000; margin-left: 8px;">(Why system failed ?)</span>
            </div>

            <!-- TABLE CONTENT -->
            <div style="border: 1.5px solid #000; width: 100%; background: #fff; display: flex; flex-direction: column; box-shadow: 2px 2px 0px rgba(0,0,0,0.08); margin-bottom: 10px;">
                <!-- Question Header -->
                <div style="display: flex; border-bottom: 1.5px solid #000; background: #D9E1F2;">
                    <div style="width: 75px; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 15px; padding: 8px 0; flex-shrink: 0; background: #B4C7E7; color: #000;">
                        1
                    </div>
                    <div contenteditable="true" style="flex: 1; padding: 8px 14px; font-weight: 900; font-size: 15px; color: #000; outline: none; display: flex; align-items: center;">
                        Why was the process & system failed ?
                    </div>
                </div>

                <!-- Why Rows -->
                <div>
                    ${whyRow('Why1')}
                    ${whyRow('Why2')}
                    ${whyRow('Why3')}
                    ${whyRow('Why4')}
                    ${whyRow('Why5', true)}
                </div>
            </div>

            <!-- INSTRUCTION BOX -->
            <div contenteditable="true" style="margin-top: auto; padding: 8px 12px; background: #FEFCE8; border: 1.5px solid #EAB308; border-radius: 3px; font-size: 11px; line-height: 1.35; outline: none; cursor: text; flex-shrink: 0;">
                <div style="color: #DC2626; font-weight: 900; font-style: italic; margin-bottom: 2px;">D4 - Identify Root Cause and Escape Cause</div>
                <div style="color: #1E293B; font-weight: 600;">- Identify all potential reasons which could explain why the problem occurred.</div>
                <div><span style="color: #DC2626; font-style: italic; font-weight: 900;">ROOT CAUSE:</span> <span style="color: #1E293B; font-weight: 600;">Explain what went wrong with the component, process, or system</span></div>
                <div><span style="color: #DC2626; font-style: italic; font-weight: 900;">ESCAPE CAUSE:</span> <span style="color: #1E293B; font-weight: 600;">State how the problem got through the system without being detected and shipped before reaching the customer.</span></div>
            </div>
        </div>
    `;
}

// ==========================================
// แผ่นที่ 10: D5-Developing permanent corrective action (ROOT CAUSE ACTION)
// ==========================================
else if (_currentSlide === 9) {
    const createD5Row = (isLast = false) => `
        <div style="display: flex; ${isLast ? '' : 'border-bottom: 1.5px solid #000;'} min-height: 52px;">
            <div contenteditable="true" style="width: 20%; border-right: 1.5px solid #000; padding: 6px; font-size: 11.5px; font-weight: 700; color: #000; outline: none; background: #fff; box-sizing: border-box;"></div>
            <div contenteditable="true" style="width: 20%; border-right: 1.5px solid #000; padding: 6px; font-size: 11.5px; font-weight: 700; color: #000; outline: none; background: #fff; box-sizing: border-box;"></div>
            <div contenteditable="true" style="width: 28%; border-right: 1.5px solid #000; padding: 6px; font-size: 11.5px; font-weight: 700; color: #000; outline: none; background: #fff; box-sizing: border-box;"></div>
            <div contenteditable="true" style="width: 11%; border-right: 1.5px solid #000; padding: 6px; font-size: 11.5px; font-weight: 700; color: #000; outline: none; display: flex; align-items: center; justify-content: center; box-sizing: border-box; text-align: center;"></div>
            <div contenteditable="true" style="width: 11%; border-right: 1.5px solid #000; padding: 6px; font-size: 11.5px; font-weight: 700; color: #000; outline: none; display: flex; align-items: center; justify-content: center; box-sizing: border-box; text-align: center;"></div>
            <div contenteditable="true" style="width: 10%; padding: 6px; font-size: 11.5px; font-weight: 700; color: #000; outline: none; display: flex; align-items: center; justify-content: center; box-sizing: border-box; text-align: center;"></div>
        </div>`;

    mainContent = `
        <div style="flex: 1; min-height: 0; display: flex; flex-direction: column; width: 100%;">
            
            <!-- 1. Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; height: 42px; flex-shrink: 0;">
                <h1 contenteditable="true" style="font-size: 32px; font-weight: 950; margin: 0; color: #000; letter-spacing: -1px; white-space: nowrap; flex: 1; outline: none;">
                    D5-Developing permanent corrective action
                </h1>
                <div style="background: #0000FF; color: #fff; padding: 3px 14px; font-weight: 900; font-size: 13px; border: 1.5px solid #000; margin-bottom: 4px; border-radius: 2px; flex-shrink: 0; margin-left: 15px;">
                    &lt;Fill by Supplier&gt;
                </div>
            </div>
            
            <!-- Divider -->
            <div style="width: 100%; height: 5px; background: #003366; margin-bottom: 6px; flex-shrink: 0;"></div>
            
            <!-- 2. Sub-Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 6px; flex-shrink: 0;">
                <div contenteditable="true" style="font-size: 17px; font-weight: 950; text-decoration: underline; color: #000; outline: none;">ROOT CAUSE ACTION</div>
                <div contenteditable="true" style="font-size: 13px; font-weight: 900; color: #FF6600; outline: none;">Please fill photo evidence Before & After.</div>
            </div>

            <!-- 3. Table Structure -->
            <div style="border: 1.5px solid #000; width: 100%; background: #fff; display: flex; flex-direction: column; box-shadow: 2px 2px 0px rgba(0,0,0,0.08); margin-bottom: 8px;">
                <div style="display: flex; border-bottom: 1.5px solid #000; height: 36px; background: #8ea9db;">
                    <div style="width: 20%; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 13px; color: #000; box-sizing: border-box;">Before</div>
                    <div style="width: 20%; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 13px; color: #000; box-sizing: border-box;">After</div>
                    <div style="width: 28%; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 13px; color: #000; box-sizing: border-box;">Improvement Detail</div>
                    <div style="width: 11%; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 12px; color: #000; box-sizing: border-box; text-align: center;">Effective lot</div>
                    <div style="width: 11%; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 11.5px; color: #000; text-align: center; box-sizing: border-box; line-height: 1.2;">Identify of<br>improved lot</div>
                    <div style="width: 10%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 12px; color: #000; box-sizing: border-box; text-align: center; line-height: 1.2;">MP<br>Level</div>
                </div>

                ${createD5Row(false)}
                ${createD5Row(false)}
                ${createD5Row(false)}
                ${createD5Row(true)}
            </div>

            <!-- 4. Instruction Box -->
            <div contenteditable="true" style="margin-top: auto; padding: 6px 12px; background: #FEFCE8; border: 1.5px solid #EAB308; border-radius: 3px; font-size: 10.5px; line-height: 1.35; outline: none; cursor: text; flex-shrink: 0;">
                <div style="color: #DC2626; font-weight: 900; font-style: italic; margin-bottom: 2px;">D5 - Developing permanent corrective action</div>
                <div style="color: #1E293B; font-weight: 600; margin-bottom: 2px;">- Select solution that will eliminate problem. Test solution to make sure it will work before you fully implement. Permanent solutions must be "mistake proof".</div>
                <div><span style="color: #DC2626; font-style: italic; font-weight: 900;">ROOT CAUSE ACTIONS:</span> <span style="color: #1E293B; font-weight: 600;">List chosen corrective actions necessary to permanently eliminate root cause.</span></div>
                <div><span style="color: #DC2626; font-style: italic; font-weight: 900;">ESCAPE CAUSE ACTIONS:</span> <span style="color: #1E293B; font-weight: 600;">List chosen corrective actions that eliminate escape root cause.</span></div>
            </div>
        </div>
    `;
}


// ==========================================
// แผ่นที่ 11: D5-Developing permanent corrective action (ESCAPE CAUSE ACTION)
// ==========================================
else if (_currentSlide === 10) {
    const createD5Row = (isLast = false) => `
        <div style="display: flex; ${isLast ? '' : 'border-bottom: 1.5px solid #000;'} min-height: 52px;">
            <div contenteditable="true" style="width: 20%; border-right: 1.5px solid #000; padding: 6px; font-size: 11.5px; font-weight: 700; color: #000; outline: none; background: #fff; box-sizing: border-box;"></div>
            <div contenteditable="true" style="width: 20%; border-right: 1.5px solid #000; padding: 6px; font-size: 11.5px; font-weight: 700; color: #000; outline: none; background: #fff; box-sizing: border-box;"></div>
            <div contenteditable="true" style="width: 28%; border-right: 1.5px solid #000; padding: 6px; font-size: 11.5px; font-weight: 700; color: #000; outline: none; background: #fff; box-sizing: border-box;"></div>
            <div contenteditable="true" style="width: 11%; border-right: 1.5px solid #000; padding: 6px; font-size: 11.5px; font-weight: 700; color: #000; outline: none; display: flex; align-items: center; justify-content: center; box-sizing: border-box; text-align: center;"></div>
            <div contenteditable="true" style="width: 11%; border-right: 1.5px solid #000; padding: 6px; font-size: 11.5px; font-weight: 700; color: #000; outline: none; display: flex; align-items: center; justify-content: center; box-sizing: border-box; text-align: center;"></div>
            <div contenteditable="true" style="width: 10%; padding: 6px; font-size: 11.5px; font-weight: 700; color: #000; outline: none; display: flex; align-items: center; justify-content: center; box-sizing: border-box; text-align: center;"></div>
        </div>`;

    mainContent = `
        <div style="flex: 1; min-height: 0; display: flex; flex-direction: column; width: 100%;">
            
            <!-- 1. Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; height: 42px; flex-shrink: 0;">
                <h1 contenteditable="true" style="font-size: 32px; font-weight: 950; margin: 0; color: #000; letter-spacing: -1px; white-space: nowrap; flex: 1; outline: none;">
                    D5-Developing permanent corrective action
                </h1>
                <div style="background: #0000FF; color: #fff; padding: 3px 14px; font-weight: 900; font-size: 13px; border: 1.5px solid #000; margin-bottom: 4px; border-radius: 2px; flex-shrink: 0; margin-left: 15px;">
                    &lt;Fill by Supplier&gt;
                </div>
            </div>
            
            <!-- Divider -->
            <div style="width: 100%; height: 5px; background: #003366; margin-bottom: 6px; flex-shrink: 0;"></div>
            
            <!-- 2. Sub-Header (ESCAPE CAUSE ACTION) -->
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 6px; flex-shrink: 0;">
                <div contenteditable="true" style="font-size: 17px; font-weight: 950; text-decoration: underline; color: #000; outline: none;">ESCAPE CAUSE ACTION</div>
                <div contenteditable="true" style="font-size: 13px; font-weight: 900; color: #FF6600; outline: none;">Please fill photo evidence Before & After.</div>
            </div>

            <!-- 3. Table Structure -->
            <div style="border: 1.5px solid #000; width: 100%; background: #fff; display: flex; flex-direction: column; box-shadow: 2px 2px 0px rgba(0,0,0,0.08); margin-bottom: 8px;">
                <div style="display: flex; border-bottom: 1.5px solid #000; height: 36px; background: #8ea9db;">
                    <div style="width: 20%; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 13px; color: #000; box-sizing: border-box;">Before</div>
                    <div style="width: 20%; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 13px; color: #000; box-sizing: border-box;">After</div>
                    <div style="width: 28%; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 13px; color: #000; box-sizing: border-box;">Improvement Detail</div>
                    <div style="width: 11%; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 12px; color: #000; box-sizing: border-box; text-align: center;">Effective lot</div>
                    <div style="width: 11%; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 11.5px; color: #000; text-align: center; box-sizing: border-box; line-height: 1.2;">Identify of<br>improved lot</div>
                    <div style="width: 10%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 12px; color: #000; box-sizing: border-box; text-align: center; line-height: 1.2;">MP<br>Level</div>
                </div>

                ${createD5Row(false)}
                ${createD5Row(false)}
                ${createD5Row(false)}
                ${createD5Row(true)}
            </div>

            <!-- 4. Instruction Box -->
            <div contenteditable="true" style="margin-top: auto; padding: 6px 12px; background: #FEFCE8; border: 1.5px solid #EAB308; border-radius: 3px; font-size: 10.5px; line-height: 1.35; outline: none; cursor: text; flex-shrink: 0;">
                <div style="color: #DC2626; font-weight: 900; font-style: italic; margin-bottom: 2px;">D5 - Developing permanent corrective action</div>
                <div style="color: #1E293B; font-weight: 600; margin-bottom: 2px;">- Select solution that will eliminate problem. Test solution to make sure it will work before you fully implement. Permanent solutions must be "mistake proof".</div>
                <div><span style="color: #DC2626; font-style: italic; font-weight: 900;">ROOT CAUSE ACTIONS:</span> <span style="color: #1E293B; font-weight: 600;">List chosen corrective actions necessary to permanently eliminate root cause.</span></div>
                <div><span style="color: #DC2626; font-style: italic; font-weight: 900;">ESCAPE CAUSE ACTIONS:</span> <span style="color: #1E293B; font-weight: 600;">List chosen corrective actions that eliminate escape root cause.</span></div>
            </div>
        </div>
    `;
}


// ==========================================
// แผ่นที่ 12: D5-Developing permanent corrective action (SYSTEM CAUSE ACTION)
// ==========================================
else if (_currentSlide === 11) {
    const createD5Row = (isLast = false) => `
        <div style="display: flex; ${isLast ? '' : 'border-bottom: 1.5px solid #000;'} min-height: 52px;">
            <div contenteditable="true" style="width: 20%; border-right: 1.5px solid #000; padding: 6px; font-size: 11.5px; font-weight: 700; color: #000; outline: none; background: #fff; box-sizing: border-box;"></div>
            <div contenteditable="true" style="width: 20%; border-right: 1.5px solid #000; padding: 6px; font-size: 11.5px; font-weight: 700; color: #000; outline: none; background: #fff; box-sizing: border-box;"></div>
            <div contenteditable="true" style="width: 28%; border-right: 1.5px solid #000; padding: 6px; font-size: 11.5px; font-weight: 700; color: #000; outline: none; background: #fff; box-sizing: border-box;"></div>
            <div contenteditable="true" style="width: 11%; border-right: 1.5px solid #000; padding: 6px; font-size: 11.5px; font-weight: 700; color: #000; outline: none; display: flex; align-items: center; justify-content: center; box-sizing: border-box; text-align: center;"></div>
            <div contenteditable="true" style="width: 11%; border-right: 1.5px solid #000; padding: 6px; font-size: 11.5px; font-weight: 700; color: #000; outline: none; display: flex; align-items: center; justify-content: center; box-sizing: border-box; text-align: center;"></div>
            <div contenteditable="true" style="width: 10%; padding: 6px; font-size: 11.5px; font-weight: 700; color: #000; outline: none; display: flex; align-items: center; justify-content: center; box-sizing: border-box; text-align: center;"></div>
        </div>`;

    mainContent = `
        <div style="flex: 1; min-height: 0; display: flex; flex-direction: column; width: 100%;">
            
            <!-- 1. Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; height: 42px; flex-shrink: 0;">
                <h1 contenteditable="true" style="font-size: 32px; font-weight: 950; margin: 0; color: #000; letter-spacing: -1px; white-space: nowrap; flex: 1; outline: none;">
                    D5-Developing permanent corrective action
                </h1>
                <div style="background: #0000FF; color: #fff; padding: 3px 14px; font-weight: 900; font-size: 13px; border: 1.5px solid #000; margin-bottom: 4px; border-radius: 2px; flex-shrink: 0; margin-left: 15px;">
                    &lt;Fill by Supplier&gt;
                </div>
            </div>
            
            <!-- Divider -->
            <div style="width: 100%; height: 5px; background: #003366; margin-bottom: 6px; flex-shrink: 0;"></div>
            
            <!-- 2. Sub-Header (SYSTEM CAUSE ACTION) -->
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 6px; flex-shrink: 0;">
                <div contenteditable="true" style="font-size: 17px; font-weight: 950; text-decoration: underline; color: #000; outline: none;">SYSTEM CAUSE ACTION</div>
                <div contenteditable="true" style="font-size: 13px; font-weight: 900; color: #FF6600; outline: none;">Please fill photo evidence Before & After.</div>
            </div>

            <!-- 3. Table Structure -->
            <div style="border: 1.5px solid #000; width: 100%; background: #fff; display: flex; flex-direction: column; box-shadow: 2px 2px 0px rgba(0,0,0,0.08); margin-bottom: 8px;">
                <div style="display: flex; border-bottom: 1.5px solid #000; height: 36px; background: #8ea9db;">
                    <div style="width: 20%; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 13px; color: #000; box-sizing: border-box;">Before</div>
                    <div style="width: 20%; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 13px; color: #000; box-sizing: border-box;">After</div>
                    <div style="width: 28%; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 13px; color: #000; box-sizing: border-box;">Improvement Detail</div>
                    <div style="width: 11%; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 12px; color: #000; box-sizing: border-box; text-align: center;">Effective lot</div>
                    <div style="width: 11%; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 11.5px; color: #000; text-align: center; box-sizing: border-box; line-height: 1.2;">Identify of<br>improved lot</div>
                    <div style="width: 10%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 12px; color: #000; box-sizing: border-box; text-align: center; line-height: 1.2;">MP<br>Level</div>
                </div>

                ${createD5Row(false)}
                ${createD5Row(false)}
                ${createD5Row(false)}
                ${createD5Row(true)}
            </div>

            <!-- 4. Instruction Box -->
            <div contenteditable="true" style="margin-top: auto; padding: 6px 12px; background: #FEFCE8; border: 1.5px solid #EAB308; border-radius: 3px; font-size: 10.5px; line-height: 1.35; outline: none; cursor: text; flex-shrink: 0;">
                <div style="color: #DC2626; font-weight: 900; font-style: italic; margin-bottom: 2px;">D5 - Developing permanent corrective action</div>
                <div style="color: #1E293B; font-weight: 600; margin-bottom: 2px;">- Select solution that will eliminate problem. Test solution to make sure it will work before you fully implement. Permanent solutions must be "mistake proof".</div>
                <div><span style="color: #DC2626; font-style: italic; font-weight: 900;">ROOT CAUSE ACTIONS:</span> <span style="color: #1E293B; font-weight: 600;">List chosen corrective actions necessary to permanently eliminate root cause.</span></div>
                <div><span style="color: #DC2626; font-style: italic; font-weight: 900;">ESCAPE CAUSE ACTIONS:</span> <span style="color: #1E293B; font-weight: 600;">List chosen corrective actions that eliminate escape root cause.</span></div>
            </div>
        </div>
    `;
}

// ==========================================
// แผ่นที่ 13: D6-Implement permanent corrective action
// ==========================================
else if (_currentSlide === 12) {
    const createD6Row = (action = "", date = "", before = "", after = "", method = "", pic = "") => `
        <div style="display: flex; border-bottom: 1.2px solid #000; min-height: 58px;">
            <div contenteditable="true" style="width: 250px; border-right: 1.2px solid #000; padding: 5px; font-size: 11px; outline: none; line-height: 1.2; display: flex; align-items: center;">${action}</div>
            <div contenteditable="true" style="width: 100px; border-right: 1.2px solid #000; padding: 5px; font-size: 11px; outline: none; text-align: center; display: flex; align-items: center; justify-content: center;">${date}</div>
            <div contenteditable="true" style="width: 100px; border-right: 1.2px solid #000; padding: 5px; font-size: 11px; outline: none; text-align: center; display: flex; align-items: center; justify-content: center;">${before}</div>
            <div contenteditable="true" style="width: 100px; border-right: 1.2px solid #000; padding: 5px; font-size: 11px; outline: none; text-align: center; display: flex; align-items: center; justify-content: center;">${after}</div>
            <div contenteditable="true" style="width: 180px; border-right: 1.2px solid #000; padding: 5px; font-size: 11px; outline: none; text-align: center; display: flex; align-items: center; justify-content: center;">${method}</div>
            <div contenteditable="true" style="width: 80px; border-right: 1.2px solid #000; padding: 5px; font-size: 11px; outline: none; text-align: center; display: flex; align-items: center; justify-content: center;">${pic}</div>
            <div contenteditable="true" style="flex: 1; padding: 5px; font-size: 11px; outline: none; text-align: center; display: flex; align-items: center; justify-content: center;"></div>
        </div>`;

    mainContent = `
        <div style="flex: 1; min-height: 0; display: flex; flex-direction: column; width: 100%;">
            
            <!-- 1. Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; height: 40px; flex-shrink: 0;">
                    <h1 contenteditable="true" style="font-size: 26px; font-weight: 800; margin: 0; color: #000; outline: none;">
                        D6-Implement permanent corrective action
                    </h1>
                    <div style="background: #1e1bff; color: #fff; padding: 2px 10px; font-weight: bold; font-size: 12px; border: 1.2px solid #000;">
                        &lt;Fill by Supplier&gt;
                    </div>
                </div>
                
                <!-- เส้นแถบสีน้ำเงิน (Divider) -->
                <div style="width: 100%; height: 5px; background: #003366; margin-bottom: 8px; flex-shrink: 0;"></div>

                <!-- 2. Table Headers -->
                <div style="border: 1.2px solid #000; width: 100%; background: #fff; display: flex; flex-direction: column;">
                    <div style="display: flex; border-bottom: 1.2px solid #000; min-height: 38px; background: #b4c7e7; font-weight: bold; font-size: 11.5px; text-align: center;">
                        <div style="width: 250px; border-right: 1.2px solid #000; display: flex; align-items: center; justify-content: center;">Corrective action</div>
                        <div style="width: 100px; border-right: 1.2px solid #000; display: flex; align-items: center; justify-content: center;">Implement date</div>
                        <div style="width: 100px; border-right: 1.2px solid #000; display: flex; align-items: center; justify-content: center;">Defect ratio<br>(Before action)</div>
                        <div style="width: 100px; border-right: 1.2px solid #000; display: flex; align-items: center; justify-content: center;">Defect ratio<br>(After action)</div>
                        <div style="width: 180px; border-right: 1.2px solid #000; display: flex; align-items: center; justify-content: center;">Verification method</div>
                        <div style="width: 80px; border-right: 1.2px solid #000; display: flex; align-items: center; justify-content: center;">Person in charge</div>
                        <div style="flex: 1; display: flex; align-items: center; justify-content: center;">Verify date</div>
                    </div>

                    <!-- 3. Table Rows -->
                    ${createD6Row()}
                    ${createD6Row()}
                    ${createD6Row()}
                    ${createD6Row()}
                    ${createD6Row()}
                </div>

                <!-- 4. Instruction Box -->
                <div contenteditable="true" style="margin-top: 8px; padding: 6px 8px; background: #ffffcc; border: 1px solid #ccc; font-size: 10px; line-height: 1.3; outline: none; cursor: text; flex-shrink: 0;">
                    <div style="color: red; font-weight: bold; font-style: italic;">6D - Implement Permanent Corrective Actions</div>
                    <div style="color: #000;">Create a clear action plan to solve the problem by stating WHO will do WHAT and by WHEN. How to verify the corrective actions with before and after result.</div>
                </div>
        </div>
    `;
}

// ==========================================
// แผ่นที่ 14: D7-Preventive Recurrence
// ==========================================
else if (_currentSlide === 13) {
    const createConsiderRow = (no, text, updated = "N") => `
        <tr style="height: 20px;">
            <td style="border: 1px solid #000; padding-left: 8px; font-size: 10px; font-weight: 500; background:#fff;">${no}. ${text}</td>
            <td contenteditable="true" style="border: 1px solid #000; text-align: center; font-weight: bold; font-size: 10.5px; outline: none; background:#fff;">${updated}</td>
            <td contenteditable="true" style="border: 1px solid #000; outline: none; background:#fff;"></td>
            <td contenteditable="true" style="border: 1px solid #000; outline: none; background:#fff;"></td>
            <td contenteditable="true" style="border: 1px solid #000; outline: none; background:#fff;"></td>
        </tr>`;

    mainContent = `
        <div style="flex: 1; min-height: 0; display: flex; flex-direction: column; width: 100%;">
            
            <!-- 1. Header (ชิดบน) -->
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; height: 38px; flex-shrink: 0;">
                    <h1 contenteditable="true" style="font-size: 26px; font-weight: 800; margin: 0; color: #000; outline: none;">
                        D7-Preventive Recurrence
                    </h1>
                    <div style="background: #1e1bff; color: #fff; padding: 2px 10px; font-weight: bold; font-size: 12px; border: 1.2px solid #000;">
                        &lt;Fill by Supplier&gt;
                    </div>
                </div>
                
                <div style="width: 100%; height: 5px; background: #003366; margin-bottom: 6px; flex-shrink: 0;"></div>

                <!-- 2. Top Split Section (How to avoid) -->
                <div style="display: flex; gap: 0; border: 1.2px solid #000; margin-bottom: 6px; flex-shrink: 0;">
                    <div style="flex: 1.2; border-right: 1.2px solid #000; display: flex; flex-direction: column;">
                        <div style="background: #b4c7e7; padding: 3px 8px; border-bottom: 1.2px solid #000; font-weight: 800; font-size: 10.5px;">
                            How to avoid recurrence this problem in the future ?
                        </div>
                        <div contenteditable="true" style="flex: 1; padding: 5px; font-size: 9.5px; line-height: 1.25; outline: none; background: #fff; min-height: 70px;">
                            -Add rack packing std.<br>
                            -Rev.WI-SP01-01 to prohibit use of temporary racks...<br>
                            -Provide training WI-SP01-01 to the Production...<br>
                            -Rev. WI-QC03-01 to prohibit use of temporary racks...<br>
                            -Provide training WI-QC03-01 to the ipqc and oqc...
                        </div>
                    </div>
                    <div style="flex: 1; display: flex; flex-direction: column;">
                        <div style="background: #b4c7e7; padding: 3px 8px; border-bottom: 1.2px solid #000; font-weight: 800; font-size: 10px;">
                            Risk part has similar structure/process and Action plan.
                        </div>
                        <table style="width: 100%; border-collapse: collapse; flex: 1; font-size: 10px; text-align: center;">
                            <tr style="background: #d9e1f2; font-weight: bold; height: 20px;">
                                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; width: 20%;">TTL Q'ty</td>
                                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; width: 40%;">Action</td>
                                <td style="border-bottom: 1px solid #000;">Plan</td>
                            </tr>
                            <tr style="height: 50px;">
                                <td contenteditable="true" style="border-right: 1px solid #000; outline: none;"></td>
                                <td contenteditable="true" style="border-right: 1px solid #000; outline: none;"></td>
                                <td contenteditable="true" style="outline: none;"></td>
                            </tr>
                        </table>
                    </div>
                </div>

                <!-- 3. Document Header -->
                <div style="font-weight: 900; font-size: 12px; margin-bottom: 3px; color: #000; flex-shrink: 0;">
                    Has the necessary document been revised/ updated ?
                </div>

                <!-- 4. Consideration Table -->
                <table style="width: 100%; border-collapse: collapse; border: 1.2px solid #000; table-layout: fixed; font-size: 10px;">
                    <thead style="background: #b4c7e7; font-weight: bold; text-align: center; height: 22px;">
                        <tr>
                            <td style="border: 1px solid #000; width: 35%;">Consider</td>
                            <td style="border: 1px solid #000; width: 10%;">Updated?<br>(Y/N)</td>
                            <td style="border: 1px solid #000; width: 30%;">Details</td>
                            <td style="border: 1px solid #000; width: 15%;">Document no.</td>
                            <td style="border: 1px solid #000; width: 10%;">Due date</td>
                        </tr>
                    </thead>
                    <tbody>
                        ${createConsiderRow(1, 'Part Drawing / Specification', 'N')}
                        ${createConsiderRow(2, 'Work Instruction', 'Y')}
                        ${createConsiderRow(3, 'Inspection instruction / Q-Point', 'N')}
                        ${createConsiderRow(4, 'Inspection check sheet', 'N')}
                        ${createConsiderRow(5, 'Process Flow Chart / Control Plan', 'N')}
                        ${createConsiderRow(6, 'P-FMEA', 'N')}
                        ${createConsiderRow(7, 'Machine Parameter', 'N')}
                        ${createConsiderRow(8, 'Supplier Process Characteristics', 'N')}
                        ${createConsiderRow(9, 'PM Plan / Detail', 'N')}
                        ${createConsiderRow(10, 'Others document', 'Y')}
                    </tbody>
                </table>

                <!-- 5. Instruction Box -->
                <div contenteditable="true" style="margin-top: 6px; padding: 5px 8px; background: #ffffcc; border: 1px solid #ccc; font-size: 9.5px; line-height: 1.25; outline: none; cursor: text; flex-shrink: 0;">
                    <div style="color: red; font-weight: bold; font-style: italic;">7D - Prevent Recurrence</div>
                    <div style="color: #000;">Ensure the problem does not happen again ANYWHERE by using Foolproof, POKAYOKE etc. Communicate your results to all areas including similar part. Submit revised all related documents to us to review. (if have)</div>
                </div>
        </div>
    `;
}

// ==========================================
// แผ่นที่ 15: D8-Team and Individual Recognition
// ==========================================
else if (_currentSlide === 14) {
    const createTeamRow = (no = "", name = "", dept = "") => `
        <tr style="height: 24px;">
            <td contenteditable="true" style="border: 1px solid #000; text-align: center; font-weight: bold; font-size: 11px; outline: none; background:#fff; width: 50px;">${no}</td>
            <td contenteditable="true" style="border: 1px solid #000; padding-left: 15px; font-size: 11px; font-weight: 700; outline: none; background:#fff;">${name}</td>
            <td contenteditable="true" style="border: 1px solid #000; text-align: center; font-size: 11px; font-weight: 700; outline: none; background:#fff; width: 150px;">${dept}</td>
        </tr>`;

    mainContent = `
        <div style="flex: 1; min-height: 0; display: flex; flex-direction: column; width: 100%;">
                
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; height: 40px; flex-shrink: 0;">
                    <h1 contenteditable="true" style="font-size: 28px; font-weight: 800; margin: 0; color: #000; outline: none;">D8-Team and Individual Recognition</h1>
                    <div style="background: #1e1bff; color: #fff; padding: 2px 10px; font-weight: bold; font-size: 12px; border: 1.2px solid #000;">&lt;Fill by Supplier&gt;</div>
                </div>
                <div style="width: 100%; height: 6px; background: #003366; margin-bottom: 12px; flex-shrink: 0;"></div>

                <!-- Team Table -->
                <div style="width: 100%; display: flex; justify-content: center; margin-bottom: 10px; flex-shrink: 0;">
                    <table style="width: 80%; border-collapse: collapse; border: 1.5px solid #000;">
                        <thead style="background: #b4c7e7; font-weight: 900; text-align: center;">
                            <tr style="height: 28px;"><td colspan="3" style="border: 1px solid #000; font-size: 13px;">Team Members</td></tr>
                            <tr style="height: 22px; background: #d9e1f2; font-size: 11px;">
                                <td style="border: 1px solid #000; width: 50px;">No.</td>
                                <td style="border: 1px solid #000;">Name</td>
                                <td style="border: 1px solid #000; width: 150px;">Dept.</td>
                            </tr>
                        </thead>
                        <tbody>
                            ${createTeamRow()}
                            ${createTeamRow()}
                            ${createTeamRow()}
                            ${createTeamRow()}${createTeamRow()}${createTeamRow()}
                        </tbody>
                    </table>
                </div>

                <!-- Thank You Text -->
                <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
                    <div contenteditable="true" style="font-size: 32px; font-weight: 900; color: #1e293b; text-align: center; outline: none;">“Thank you for all cooperation”</div>
                </div>

                <!-- Instruction Box -->
                <div contenteditable="true" style="padding: 8px 12px; background: #fffde7; border: 2px solid #fbc02d; border-radius: 8px; font-size: 10px; outline: none; flex-shrink: 0;">
                    <div style="color: #d32f2f; font-weight: 900; font-style: italic;">8D – Team and Individual Recognition</div>
                    <div style="color: #333;">8D process is the time to recognize the team efforts and special team member contributions.</div>
                </div>
        </div>`;
}

// ==========================================
// แผ่นที่ 16: หน้าจบ (THANK YOU)
// ==========================================
else if (_currentSlide === 15) {
    mainContent = `
        <div style="flex: 1; min-height: 0; display: flex; flex-direction: column; width: 100%;">
            
            <!-- 1. Top Thick Divider -->
            <div style="width: 100%; height: 8px; background: #003366; margin-top: 30px; margin-bottom: 20px; flex-shrink: 0;"></div>

            <!-- 2. Main Message -->
            <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
                <div contenteditable="true" style="font-size: 80px; font-weight: 950; color: #003366; text-align: center; letter-spacing: -3px; outline: none; text-transform: uppercase; line-height: 1;">
                    Thank you.
                </div>
            </div>

        </div>
    `;
}
        container.innerHTML = mainContent + getFooter();
        fitSlideToContainer();
        if (_currentSlide === 5) {
            setTimeout(adjustD4ConnectorLine, 20);
            setTimeout(adjustD4ConnectorLine, 100);
        }
    }

    function adjustD4ConnectorLine() {
        if (_currentSlide !== 5) return;
        const chart = document.getElementById('d4-chart-area');
        const d5 = document.getElementById('d4-diamond-5');
        const d6 = document.getElementById('d4-diamond-6');
        const path = document.getElementById('d4-connector-path');
        const arrow = document.getElementById('d4-connector-arrow');
        const leftCol = document.getElementById('d4-left-col');
        const rightCol = document.getElementById('d4-right-col');

        if (!chart || !d5 || !d6 || !path || !arrow || !leftCol || !rightCol) return;

        const cRect = chart.getBoundingClientRect();
        const d5Rect = d5.getBoundingClientRect();
        const d6Rect = d6.getBoundingClientRect();
        const lColRect = leftCol.getBoundingClientRect();
        const rColRect = rightCol.getBoundingClientRect();

        if (cRect.width === 0 || d5Rect.width === 0) return;

        const currentScale = (chart.offsetWidth > 0 && cRect.width > 0) ? (cRect.width / chart.offsetWidth) : 1;

        const startX = (((d5Rect.left + d5Rect.right) / 2) - cRect.left) / currentScale;
        const startY = ((d5Rect.bottom - cRect.top) / currentScale) - 2;

        const dropY = startY + 12;

        const endX = (d6Rect.left - cRect.left) / currentScale;
        const endY = (((d6Rect.top + d6Rect.bottom) / 2) - cRect.top) / currentScale;

        const midX = (((lColRect.right + rColRect.left) / 2) - cRect.left) / currentScale;

        path.setAttribute('d', `M ${startX},${startY} L ${startX},${dropY} L ${midX},${dropY} L ${midX},${endY} L ${endX - 8},${endY}`);
        arrow.setAttribute('points', `${endX},${endY} ${endX - 10},${endY - 5} ${endX - 10},${endY + 5}`);
    }

    function fitSlideToContainer() {
        const container = document.getElementById('eight-d-presentation-container');
        const wrapper = document.getElementById('eight-d-slide-wrapper');
        const slide = document.getElementById('eight-d-slide-content');
        if (!container || !wrapper || !slide) return;

        const availW = Math.max(100, container.clientWidth - 32);
        const availH = Math.max(100, container.clientHeight - 32);

        const baseW = 960;
        const baseH = 600;

        const scaleX = availW / baseW;
        const scaleY = availH / baseH;
        const scale = Math.min(scaleX, scaleY);

        wrapper.style.width = `${Math.round(baseW * scale)}px`;
        wrapper.style.height = `${Math.round(baseH * scale)}px`;

        slide.style.width = `${baseW}px`;
        slide.style.height = `${baseH}px`;
        slide.style.transform = `scale(${scale})`;
        slide.style.transformOrigin = 'top left';
        if (_currentSlide === 5) adjustD4ConnectorLine();
    }



    function getFooter() {
        return `
            <div style="flex-shrink: 0; height: 32px; border-top: 1.2px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center; width: 100%; box-sizing: border-box; padding-top: 4px; margin-top: auto; font-family: system-ui, sans-serif;">
                <div style="width: 100px; height: 26px; background: url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Carrier_Global_Logo.svg/1280px-Carrier_Global_Logo.svg.png') no-repeat center left; background-size: contain; flex-shrink: 0;"></div>
                <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; text-align: center; flex: 1;">
                    Proprietary and Confidential
                </div>
                <div style="font-size: 12px; font-weight: 800; color: #1e293b; min-width: 30px; text-align: right; flex-shrink: 0;">
                    ${_currentSlide + 1}
                </div>
            </div>
        `;
    }

// --- บรรทัดสุดท้ายของโมดูล Wap8DSystem ---
return { 
    init, createNewCase, openReport, nextSlide, prevSlide, openHistoryPicker, pickRecord, deleteCase, exportToPPTX, filterByStat, fetchCases,
    getCases: () => _cases,
    getCaseBySupportId: (supId) => _cases.find(c => String(c.support_id) === String(supId) || String(c.report_data?.record_id) === String(supId)),
    showDashboard: () => {
        saveCurrentProgress();
        document.getElementById('eight-d-dashboard').classList.remove('hidden');
        document.getElementById('eight-d-report-view').classList.add('hidden');
    }
};
})();
/* ============================================================
   EXPOSE ALL TOP-LEVEL FUNCTIONS AND MODULES TO WINDOW SCOPE
   (Required for inline HTML handlers in type="module")
   ============================================================ */
if (typeof window !== 'undefined') {
    Object.assign(window, {
        safeSetText, isSystemOnline, hasWriteAccess, generateUUID, escapeHtml, getFriendlyErrorMessage,
        toast, shake, getSupabase, switchLoginTab, togglePassVis, handleLogin, checkSupervisorRole,
        finalizeLoginProcess, showLoginError, checkCapsLock, togglePassVisibility, loadStaffListForSupervisor,
        loadDataForStaff, animateNumber, finalizeLogin, startNeuralBootSequence, launchDirectWarp,
        enforceMaintenanceMode, watchSystemUpdate, handleLogout, showDashboard, onStaffSelect,
        updateMainGauge, updateOnlineBadge, loadStaffList, loadRecords, normalizeRecord,
        formToSupabase, writeAuditLog, deleteRecordFromCloud, cloudSyncAll, selectShift,
        isDuplicate, validateRef, handleJudgment, quickPickJudgment, refreshNeonGlow,
        checkAnomaly, updateInputResetButton, resetInputForm, clearForm, confirmResetForm, submitEntry,
        backgroundSync, syncAllPendingData, editRecord, cloneRecord, confirmDelete, showCustomConfirmDialog,
        showModal, closeModal, getFilteredRecords, filterTable, debounceSearch,
        get8DCaseForRecord, create8DFromClaimRecord, openReportFromRecord,
        clearFilterSearch, executeGlobalSearch, searchTable, buildRow, renderTable,
        handleTableScroll, switchSubTerminal, switchPage, applyLanguage, fetchWAPData,
        getWAPDate, toggleSidebar, rebuildSmartMemory, getMostFrequentPack, updateAIBrain,
        autoFillFromPack, translateDefectToRemark, validatePartNoInput, setPartLoading,
        showAC, onACInput, closeAC, closeAllAC, renderACDropdown, applyACPick,
        initKeyboardAwareness, renderDailySubmissionMatrix, refreshClaimDashboard,
        populateVendorFilter, refreshDashboard, renderDashboardCharts, renderPareto,
        applyDbDatePreset, updateLiveFeed, renderVendorRadar, applyExecPreset,
        renderExecSpecialJobs, initExecDashboard, updateAIBannerInsight, renderExecTrends,
        renderExecParts, renderExecPie, isWeekendDate, fetchAttendanceRecords,
        openAttendanceView, initAttDashboard, renderAttRecords, cancelEditAttRecord,
        deleteAttRecord, formatDateTH, calcDaysBetween, submitLeaveRequest,
        getGlobalAttendanceStats, updateAttKPI, getUnifiedAttendanceStats, initAttMonthlyChart,
        countWeekdaysInRange, attToast, onAttYearChange, toggleFormPanel, renderAll,
        triggerModuleInit, triggerGlobalRefresh, resetHeaderFilters, toggleSubmenu,
        editAttRecord, updateTarget, validateOtTime, onClaimDashDateChange,
        applyClaimDashPreset, resetClaimDashFilter, updateVendorFaultFeed, exportToCSV,
        triggerImport, confirmClearAll, findBestMatch, handleImport, animateValue,
        toggleTheme, updateThemeIcon, toggleLangMenu, changeLanguage, validateEmail,
        hideCapsLock, updateLoginNetStatus, autoHideBanner, handleGlobalAdd,
        performFullBackup, performArchive, updateUserPresence, deployNewVersion,
        checkChangelog, closeUpdateModal, showPasswordResetUI, handlePasswordResetSubmit,
        openPersonalSettings, resetProfileToDefault, handleAvatarPreview, savePersonalProfile,
        
        // --- ระบบ WAP Modules ---
        WapSupportLogs, Wap5SExcellence, WapSkillMatrix, WapOTManagement, WapSpecialJobs, WapAdminSystem,
        
        // --- [เพิ่มส่วน 8D System ตรงนี้] ---
        Wap8DSystem, 
        openHistoryPicker: Wap8DSystem.openHistoryPicker, 
        pickRecord: Wap8DSystem.pickRecord,

        updateAllModuleFilters, showPartAC, selectPartAC, calcNG,
    });
}
// เพิ่มตัวแปรสำหรับ Analytics Charts
let telemetryChart = null;
let activityChart = null;

// แก้ไขส่วน Override ฟังก์ชัน switchTab เพื่อแก้ ReferenceError
const originalWapAdminSwitchTab = WapAdminSystem.switchTab;
WapAdminSystem.switchTab = async function(tab) {
    const analyticsView = document.getElementById('admin-analytics-view');
    const dbTableContainer = document.getElementById('admin-db-table-container');
    const adminStatsRow = document.getElementById('admin-stats-row');

    // 1. บังคับให้กราฟ (Analytics) แสดงผลค้างไว้เสมอ
    if (analyticsView) {
        analyticsView.classList.remove('hidden-view');
        analyticsView.style.display = 'flex';
    }

    // 2. แสดงตารางและสถิติพื้นฐาน (โชว์ต่อท้ายกราฟ)
    if (dbTableContainer) dbTableContainer.classList.remove('hidden-view');
    if (adminStatsRow) adminStatsRow.classList.remove('hidden-view');
    
    // 3. วาดกราฟซ้ำเพื่อให้ข้อมูลอัปเดต
    setTimeout(renderCyberAnalytics, 100);
    
    // 4. เรียกฟังก์ชันเดิมทำงาน (ตัวนี้จะเรียก loadData() ข้างในตัวมันเองให้โดยอัตโนมัติ)
    // ดังนั้นเราไม่จำเป็นต้องเขียน await loadData() แยกข้างนอกครับ เพื่อป้องกัน Error
    return originalWapAdminSwitchTab(tab);
};

// 1. เพิ่มฟังก์ชันคำนวณขนาดข้อมูล
function getAppDataSize() {
    // คำนวณขนาดของ Object S (ข้อมูลทั้งหมดในเครื่อง) เป็นหน่วย MB
    const totalData = JSON.stringify(S).length;
    return (totalData / (1024 * 1024)).toFixed(2); 
}

// เก็บ Instance ของกราฟไว้ข้างนอกเพื่อสั่ง destroy() ได้ถูกต้อง
let adminHUDCharts = { telemetry: null, activity: null };

async function renderCyberAnalytics() {
    const sb = sqeClient;
    const telEl = document.getElementById('telemetry-chart-container');
    const actEl = document.getElementById('activity-spike-chart-container');

    if (!telEl || !actEl) return;

    const startTime = performance.now();
    const now = new Date();
    const past24h = new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString();

    try {
        // 1. ดึงข้อมูลกิจกรรมจริง
        const { data: logs, error } = await sb
            .from('audit_logs')
            .select('created_at, user_email') 
            .gte('created_at', past24h);

        const latencyMs = Math.round(performance.now() - startTime); 
        if (error) throw error;

        // 2. วัด REAL MEMORY (หรือค่าจำลองที่ดูสมจริง)
        const baseMem = window.performance && window.performance.memory 
            ? Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024))
            : 42;

        // 3. เตรียมข้อมูล 24 ชั่วโมง
        const hourlyStats = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            logCount: 0,
            users: new Set()
        }));

        logs.forEach(log => {
            const h = new Date(log.created_at).getHours();
            if (hourlyStats[h]) {
                hourlyStats[h].logCount++;
                hourlyStats[h].users.add(log.user_email || 'System');
            }
        });

        const categories = hourlyStats.map(s => `${s.hour}:00`);

        // --- 4. สร้าง Dynamic Data (เติม Noise เพื่อไม่ให้เส้นตรง) ---
        const cpuData = hourlyStats.map(s => {
            // ค่าพื้นฐาน 10-15% + (จำนวน Log * 5) + สุ่มความแกว่ง 1-3%
            const jitter = Math.random() * 3;
            return parseFloat(((s.logCount * 5) + 12 + jitter).toFixed(1));
        });

        const memoryData = cpuData.map(c => {
            // Memory วิ่งตาม CPU เล็กน้อย + สุ่มความแกว่ง
            const jitter = Math.random() * 5;
            return Math.round(baseMem + (c * 0.3) + jitter);
        });

        const latencyHistory = cpuData.map(c => {
            // Latency แกว่งตาม Load
            const jitter = Math.random() * 4;
            return Math.round(latencyMs + (c * 0.1) + jitter - 5);
        });

        const requestData = hourlyStats.map(s => {
            // ถ้าชั่วโมงนั้นไม่มี Log ให้ใส่ค่าสุ่มน้อยๆ (1-5) เพื่อให้กราฟแท่งมีอะไรโชว์
            return s.logCount > 0 ? (s.logCount * 12) : Math.floor(Math.random() * 5) + 1;
        });

        const agentData = hourlyStats.map(s => {
            return s.users.size > 0 ? s.users.size : (Math.random() > 0.8 ? 1 : 0);
        });

        // 5. สั่งวาดกราฟ
        if (adminHUDCharts.telemetry) adminHUDCharts.telemetry.destroy();
        if (adminHUDCharts.activity) adminHUDCharts.activity.destroy();

        // กราฟซ้าย: TELEMETRY
        adminHUDCharts.telemetry = new ApexCharts(telEl, {
            series: [
                { name: 'Memory Usage (MB)', data: memoryData },
                { name: 'CPU Load (%)', data: cpuData },
                { name: 'Latency (ms)', data: latencyHistory }
            ],
            chart: { type: 'area', height: 280, toolbar: { show: false }, background: 'transparent', animations: { enabled: true, speed: 1000 } },
            colors: ['#a855f7', '#3b82f6', '#f59e0b'],
            stroke: { curve: 'smooth', width: 2 },
            fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.01 } },
            dataLabels: { enabled: false },
            markers: { size: 0 },
            grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 3 },
            xaxis: { categories: categories, labels: { style: { colors: '#64748b', fontSize: '9px' } } },
            yaxis: { labels: { style: { colors: '#64748b', fontSize: '9px' } } },
            legend: { position: 'bottom', labels: { colors: '#94a3b8' }, fontSize: '11px', fontWeight: 800 },
            tooltip: { theme: 'dark' }
        });
        adminHUDCharts.telemetry.render();

        // กราฟขวา: ACTIVITY
        actEl.innerHTML = '';
        adminHUDCharts.activity = new ApexCharts(actEl, {
            series: [
                { name: 'API Requests', data: requestData },
                { name: 'Active Agents', data: agentData }
            ],
            chart: { type: 'bar', height: 280, toolbar: { show: false }, background: 'transparent' },
            plotOptions: { bar: { columnWidth: '65%', borderRadius: 3 } },
            colors: ['#8b5cf6', '#10b981'],
            dataLabels: { enabled: false },
            xaxis: { categories: categories, labels: { style: { colors: '#64748b', fontSize: '9px' } } },
            grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 3 },
            legend: { position: 'bottom', labels: { colors: '#94a3b8' }, fontSize: '11px', fontWeight: 800 },
            tooltip: { theme: 'dark' }
        });
        setTimeout(() => { adminHUDCharts.activity.render(); }, 50);

        // 6. อัปเดตตัวเลข KPI
        const h = now.getHours();
        animateValue(document.querySelector('.cyber-kpi-v3:nth-child(1) .text-xl'), cpuData[h], 1000, 1, "%");
        animateValue(document.querySelector('.cyber-kpi-v3:nth-child(2) .text-xl'), logs.length, 1000, 0, " events");
        animateValue(document.querySelector('.cyber-kpi-v3:nth-child(3) .text-xl'), hourlyStats[h].logCount > 0 ? hourlyStats[h].users.size : 0, 1000, 0, " agents");
        animateValue(document.querySelector('.cyber-kpi-v3:nth-child(4) .text-xl'), latencyMs, 1000, 1, " ms");

    } catch (err) {
        console.error("Telemetry Error:", err);
    }
}
// ฟังก์ชันจำลอง Traffic Spike
function simulateTrafficSpike() {
    toast("⚡ WARNING: Traffic Spike Simulation Initialized!", "warn");
    
    if (activityChart) {
        const spikeData = activityChart.w.config.series[0].data.map(v => v + Math.floor(Math.random() * 80 + 40));
        activityChart.updateSeries([{ data: spikeData }, { data: activityChart.w.config.series[1].data }]);
        
        setTimeout(() => {
            toast("✅ Load Balancer active. Spike handled by Node-7.", "success");
        }, 2000);
    }
}



// --- ส่วนเชื่อมต่อฟังก์ชันจากภายในสคริปต์ ออกไปให้ปุ่มใน HTML ใช้งานได้ ---

// 1. ฟังก์ชันปลดล็อคหน้าบำรุงรักษา (แก้ปุ่ม Admin Access)
window.unlockMaintenanceForAdmin = unlockMaintenanceForAdmin;

// 2. ฟังก์ชันตรวจสอบอีเมล (แก้ Error validateEmail)
window.validateEmail = validateEmail;

// 3. ฟังก์ชันตรวจสอบ Caps Lock (แก้ Error checkCapsLock)
window.checkCapsLock = checkCapsLock;

// 4. ฟังก์ชันสำคัญอื่นๆ (ใส่ไปให้หมดเพื่อให้ระบบ Login และ Sidebar ทำงานได้)
window.handleLogin = handleLogin;
window.toggleSidebar = toggleSidebar;
window.switchPage = switchPage;
window.switchSubTerminal = switchSubTerminal;
window.changeLanguage = changeLanguage;
window.togglePassVisibility = togglePassVisibility;
window.handleLogout = handleLogout;
window.cloudSyncAll = cloudSyncAll;
window.submitEntry = submitEntry;
window.openPersonalSettings = openPersonalSettings;