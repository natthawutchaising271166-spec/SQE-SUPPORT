/* ==========================================================================
   SQE & WAP Support Portal — FULLY UNIFIED SCRIPT (V5.5)
   ========================================================================== */
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
// ตรวจสอบว่ามี Library Dexie แล้วหรือยัง
const localDB = new Dexie("CarrierOfflineDB");

// กำหนดโครงสร้างตาราง (ชื่อตาราง: pendingClaims)
localDB.version(1).stores({
    pendingClaims: "id, date, sync_status" 
});

// ฟังก์ชันตรวจสอบสถานะเน็ตแบบ Real-time
function isSystemOnline() {
    return navigator.onLine;
}

// 1. Configuration - แยกฐานข้อมูล SQE และ WAP ชัดเจน
const SQE_URL = 'https://xgkjxvljdhpniakgzatf.supabase.co';
const SQE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhna2p4dmxqZGhwbmlha2d6YXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NDkxMjYsImV4cCI6MjA5MzAyNTEyNn0.os0bmAoR7CCefdsuQzGC9eLPnEJ64Ny8rxx0lFMXXAU';

const WAP_URL = 'https://dyhpjyokvtwejayptwyk.supabase.co';
const WAP_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5aHBqeW9rdnR3ZWpheXB0d3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNzE4MjcsImV4cCI6MjA5Mjg0NzgyN30.KSU9-0zZ3w7Z6wmOTqVvZZv4_Y0cMYOfp_ZyWWB7UCQ';

let sqeClient = supabase.createClient(SQE_URL, SQE_KEY);
let wapClient  = supabase.createClient(WAP_URL, WAP_KEY);

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
        skills: []
    },
    activeFilter: 'ALL',
    searchKeyword: '',
    selectedShift: 'SHIFT A',
    editingId: null,
    isOnline: navigator.onLine,
    loginRole: 'staff'
};


const ROW_HEIGHT = 56; 
let virtualTableState = { allRows: [], prevStart: -1, prevEnd: -1 };

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

// เพิ่มฟังก์ชันนี้ไว้ใน Global Scope
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

function getSupabase() {
    try {
        if (!sqeClient && window.supabase) sqeClient = window.supabase.createClient(SQE_URL, SQE_KEY);
        return sqeClient;
    } catch (err) {
        return null;
    }
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
    // 1. อ้างอิง UI Elements
    const emailEl = $id('login-email');
    const passEl = $id('login-pass');
    const errEl = $id('login-error');
    const btnText = $id('login-btn-text');
    const btnSpinner = $id('login-spinner');
    const btn = $id('login-btn');
    const rememberMe = $id('remember-me') ? $id('remember-me').checked : false;

    const email = emailEl.value.trim().toLowerCase();
    const pass = passEl.value;

    // 2. ตรวจสอบความถูกต้องเบื้องต้น (UX Validation)
    errEl.classList.add('hidden');
    if (!email) { showLoginError("กรุณากรอกอีเมล"); return; }
    if (!email.includes('@')) { showLoginError("โปรดระบุอีเมลองค์กรที่ถูกต้อง"); return; }
    if (S.loginRole === 'staff' && !pass) { showLoginError("กรุณากรอก Security Key"); return; }

    // 3. แสดงสถานะ Loading
    btnText.classList.add('hidden');
    btnSpinner.classList.remove('hidden');
    btn.disabled = true;

    try {
        const sb = getSupabase();
        if (!sb) throw new Error('NO_CLIENT');

        // 4. ตรวจสอบข้อมูลในตาราง users (Supabase SQE)
        const { data: userData, error: userErr } = await sb
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (userErr && userErr.code !== 'PGRST116') throw userErr;

        let finalUserData = userData;

        if (userData) {
            // ตรวจสอบสิทธิ์ (Role) ว่าตรงกับที่เลือกใน Tab หรือไม่
            if (userData.role !== S.loginRole) throw new Error('ROLE_MISMATCH');
            
            // ตรวจสอบรหัสผ่าน (เฉพาะ Staff)
            if (S.loginRole === 'staff' && userData.password && userData.password !== pass) {
                throw new Error('WRONG_PASSWORD');
            }
        } else {
            // --- กรณีไม่พบ User: สมัครให้อัตโนมัติ ---
            const { data: newUser, error: insertErr } = await sb.from('users').insert([
                { 
                    email, 
                    password: S.loginRole === 'staff' ? pass : 'supervisor', 
                    role: S.loginRole 
                }
            ]).select().single();
            
            if (insertErr) throw insertErr;
            finalUserData = newUser;
        }

        // 5. ตรวจสอบบทบาท Supervisor เชิงลึก (จากฟังก์ชันที่คุณต้องการรวม)
        if (S.loginRole === 'supervisor') {
            await checkSupervisorRole(finalUserData.email); 
        }

        // 6. ลอกอินสำเร็จ: จัดการ Remember Me และเข้าสู่ระบบ
        finalizeLoginProcess(email, S.loginRole, rememberMe);

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

/**
 * ตรวจสอบสถานะ Supervisor จาก Profile
 */
async function checkSupervisorRole(email) {
    try {
        const sb = getSupabase();
        // ดึงข้อมูลจากตาราง users (หรือ profiles ตามโครงสร้างของคุณ)
        const { data: profile, error } = await sb
            .from('users') 
            .select('role, email')
            .eq('email', email)
            .single();

        if (error) throw error;

        // ตรวจสอบคำว่า supervisor ในบทบาท
        const supervisorRoles = ['supervisor', 'manager', 'lead', 'หัวหน้างาน'];
        isSupervisor = supervisorRoles.some(r => 
            profile.role && profile.role.toLowerCase().includes(r.toLowerCase())
        );
        
        return isSupervisor;
    } catch (err) {
        console.error('checkSupervisorRole error:', err);
        isSupervisor = (S.loginRole === 'supervisor'); // fallback
        return isSupervisor;
    }
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
   UPDATED: finalizeLogin with Premium Warp Speed Effect
   ============================================================ */
function finalizeLogin(email, role) {
    // 1. อ้างอิง Elements ที่ต้องการเล่นแอนิเมชั่น
    const loginCard = document.querySelector('.modern-glass-card');
    const brandHeader = document.querySelector('.login-brand-header');
    const bgScene = document.querySelector('.background-scene');
    const footerInfo = document.querySelector('.login-footer-info');
    const banner = document.getElementById('system-announcement');

    // 2. เริ่มสร้าง Timeline แอนิเมชั่น
    const warpTL = gsap.timeline({
        onComplete: () => {
            // --- จังหวะที่แอนิเมชั่นวาร์ปจบ: ทำการเปลี่ยนข้อมูลจริง (Logic เดิมของคุณ) ---
            S.currentUser = email;
            S.userRole = role;
            S.viewingUser = email;
            S.isLoggedIn = true;
            sessionStorage.setItem('sqe_session', JSON.stringify({ email, role }));

            // สลับหน้าจอ Login เป็น Dashboard
            document.getElementById('login-view').classList.add('hidden-view');
            document.getElementById('dashboard-view').classList.remove('hidden-view');

            // เรียกฟังก์ชันตั้งค่า Dashboard เดิมของคุณ
            showDashboard();

            // จังหวะที่ 3: เผยหน้า Dashboard ใหม่อย่างนุ่มนวล
            gsap.fromTo("#dashboard-view", 
                { opacity: 0, scale: 1.05 }, 
                { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }
            );

            // คืนค่าพื้นหลังวิดีโอให้กลับมาเป็นปกติ
            gsap.to(bgScene, {
                scale: 1,
                filter: "blur(0px) brightness(1)",
                duration: 1.5,
                ease: "expo.out"
            });
        }
    });

    // 3. ลำดับการเล่น Warp Effect
    warpTL
        // ขั้นแรก: ซ่อนประกาศ (ถ้ามี)
        .to(banner, { y: -50, opacity: 0, duration: 0.3 })
        
        // ขั้นที่สอง: การ์ดลอกอินและโลโก้ "ยุบตัว" และจางหายไปด้านหลัง
        .to([loginCard, brandHeader, footerInfo], {
            scale: 0.7,
            opacity: 0,
            y: 40,
            duration: 0.5,
            stagger: 0.1,
            ease: "back.in(1.7)"
        })
        
        // ขั้นที่สาม: พื้นหลังวิดีโอซูมพุ่งเข้ามา (Warp Speed) และขาวสว่างขึ้น
        .to(bgScene, {
            scale: 2,
            filter: "blur(30px) brightness(2.5)",
            duration: 0.8,
            ease: "power4.inOut"
        }, "-=0.4"); // เริ่มซูมก่อนการ์ดหายจบเล็กน้อยเพื่อให้ดูต่อเนื่อง
}

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
    document.getElementById('dashboard-view').classList.add('hidden-view');
    document.getElementById('login-view').classList.remove('hidden-view');

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

    // ✅ 1. ประกาศค่ามุมไว้ที่นี่ เพื่อให้ใช้ได้ทั้งฟังก์ชัน (แก้ปัญหา ReferenceError)
    const minAngle = -120;
    const maxAngle = 120;
    const angleRange = maxAngle - minAngle; // 240 องศา

    // 2. วาดขีด Ticks
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

    // 3. Logic กำหนดสี
    let color = "#ef4444"; 
    let label = "CRITICAL";
    if (pct >= 95) { color = "#10b981"; label = "PERFECT"; }
    else if (pct >= 85) { color = "#3b82f6"; label = "GOOD"; }
    else if (pct >= 70) { color = "#f59e0b"; label = "STABLE"; }

    // 4. อัปเดต UI ตัวเลข
    if (valText) {
        valText.innerHTML = `${Math.round(pct)}<span style="font-size: 0.6em; margin-left: 2px; font-weight: 800;">%</span>`;
    }
    
    // 5. อัปเดตสถานะ Badge
    if (statusLabel) {
        if (statusText) statusText.textContent = label;
        statusLabel.style.color = color;
        statusLabel.style.borderColor = color;
        const dot = statusLabel.querySelector('span');
        if (dot) dot.style.background = color;
    }

    // 6. อัปเดตเส้นสี (Progress Arc)
    if (arc) {
        const circumference = 2 * Math.PI * 75;
        const totalArcLength = (angleRange / 360) * circumference;
        const drawLength = (pct / 100) * totalArcLength;
        arc.style.strokeDasharray = `${drawLength} ${circumference}`;
        arc.style.stroke = color;
    }

    // 7. หมุนเข็ม (เรียกใช้ minAngle ได้แล้ว)
    if (needle) {
        const needleAngle = minAngle + (pct * (angleRange / 100));
        needle.style.transform = `rotate(${needleAngle}deg)`;
    }

    // 8. อัปเดตข้อความ Footer
    const footStatus = document.getElementById('yield-status-text');
    if(footStatus) {
        footStatus.textContent = label;
        footStatus.style.color = color;
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
        inspector: r.inspector || ''
    };
}

function formToSupabase(rec) {
    return {
        id: rec.id, date: rec.date, shift: rec.shift, line: rec.line, ref: rec.ref, supplier: rec.supplier,
        partNo: rec.partNo, partName: rec.partName, qty: parseInt(rec.qty) || 0, unit: rec.unit,
        defect: rec.defect, remark: rec.remark, judgment: rec.judgment, inspector: rec.inspector
    };
}



// ฟังก์ชัน 2: สั่งลบข้อมูลใน Database และ Local State
async function deleteRecordFromCloud(id) {
    const sb = getSupabase(); // ดึงตัวเชื่อมต่อ Supabase
    
    // 1. ลบใน Cloud (ถ้า Online)
    if (sb && navigator.onLine) {
        try {
            const { error } = await sb.from('records').delete().eq('id', id);
            if (error) throw error;
        } catch (e) {
            console.error("Cloud Delete Error:", e);
            toast('❌ ไม่สามารถลบข้อมูลในระบบ Cloud ได้', 'error');
            return false; // หยุดทำงานถ้าลบใน DB ไม่สำเร็จ
        }
    }

    // 2. ลบในหน่วยความจำเครื่อง (Local State)
    // กรองเอาเฉพาะข้อมูลที่ไม่ใช่ ID ที่เราเพิ่งสั่งลบ
    S.records = S.records.filter(r => String(r.id) !== String(id));
    
    // 3. อัปเดตสมอง AI (เพื่อให้จดจำรายการใหม่หลังลบ)
    rebuildSmartMemory();
    updateAIBrain();

    return true; // ยืนยันว่าลบสำเร็จ
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
        if (el.value && el.value !== '' && el.value !== '-' && el.value !== '0') {
            el.classList.add('valid');
        } else {
            el.classList.remove('valid');
        }
    });

    // 3. [Neural Interaction]: ตรวจสอบความสมบูรณ์ของฟอร์มเพื่อเปิดโหมด Pulse เรืองแสงที่ปุ่ม
    // เงื่อนไข: ต้องมี Part No, Ref No, Qty > 0 และเลือก Judgment แล้ว
    const isFormComplete = 
        $id('f-part').value.trim() !== '' && 
        $id('f-ref').value.trim() !== '' && 
        hasQty && 
        $id('judgmentSelect').value !== '';

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

function clearForm() { resetInputForm(); }

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

async function syncPendingData() {
    // 1. เช็คเน็ตก่อน ถ้าออฟไลน์ให้หยุดทำงานทันที
    if (!isSystemOnline()) return;

    try {
        // 2. เข้าถึงตารางอย่างปลอดภัย
        const table = localDB.pendingClaims;
        if (!table) {
            console.warn("[Sync] ไม่พบตาราง pendingClaims ใน IndexedDB");
            return;
        }

        // 3. ดึงข้อมูลทั้งหมดที่ค้างอยู่ในเครื่องมาเป็น Array
        const pendingItems = await table.toArray();
        
        if (pendingItems.length === 0) return;

        console.log(`🔄 [Auto-Sync] พบข้อมูลค้างส่ง ${pendingItems.length} รายการ กำลังดำเนินการ...`);
        
        let successCount = 0;

        for (const record of pendingItems) {
            try {
                // ส่งข้อมูลไป Supabase (ใช้ฟังก์ชันแปลงข้อมูลของคุณ)
                const { error } = await sqeClient.from('records').upsert([formToSupabase(record)]);
                
                if (!error) {
                    // ถ้า Supabase รับข้อมูลแล้ว -> ลบออกจากเครื่องทันที
                    await table.delete(record.id);
                    
                    // อัปเดตสถานะในหน่วยความจำ Global (ถ้ามีรายการนั้นแสดงอยู่บนจอ)
                    const idx = S.records.findIndex(r => r.id === record.id);
                    if (idx !== -1) {
                        S.records[idx].sync_status = 'synced';
                    }
                    successCount++;
                }
            } catch (err) {
                console.error(`❌ [Sync Loop] รายการ ID: ${record.id} ส่งไม่สำเร็จ:`, err);
            }
        }

        if (successCount > 0) {
            toast(`✨ ซิงค์ข้อมูลสำเร็จ ${successCount} รายการ`, 'success');
            renderTable(); // วาดตารางใหม่เพื่อให้จุดสถานะเปลี่ยนเป็นสีเขียว
        }

    } catch (criticalErr) {
        console.error("⚠️ [Sync Critical Error]:", criticalErr);
    }
}

// เมื่อเน็ตกลับมา (Online) ให้เริ่มซิงค์ทันที
window.addEventListener('online', () => {
    if (typeof updateOnlineBadge === 'function') updateOnlineBadge();
    syncPendingData();
});

// ตั้งให้เช็คการซิงค์ทุกๆ 60 วินาที (เผื่อกรณีเน็ตมาแต่ Event ไม่ทำงาน)
setInterval(syncPendingData, 60000);


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

// ฟังก์ชัน 1: แสดงหน้าต่างยืนยันก่อนลบ
function confirmDelete(id) {
    // ใช้ Confirm Dialog มาตรฐานของ Browser เพื่อความรวดเร็วและแน่นอน
    if (confirm("⚠️ ยืนยันการลบรายการนี้หรือไม่?\nการลบข้อมูลนี้จะไม่สามารถกู้คืนได้")) {
        
        // สั่งรันฟังก์ชันลบ และรอผลลัพธ์
        deleteRecordFromCloud(id).then(success => {
            if (success) {
                // ถ้าลบสำเร็จ ให้สั่งวาดตารางใหม่ทันที
                renderTable(); 
                toast('🗑️ ลบข้อมูลเรียบร้อยแล้ว', 'success');
            }
        });
    }
}

function showModal(title, message, onConfirm) {
    const root = $id('modal-root');
    root.innerHTML = `<div class="modal-overlay" onclick="if(event.target===this)closeModal()"><div class="modal-box"><h3 class="text-lg font-bold text-slate-800 mb-2">${escapeHtml(title)}</h3><p class="text-sm text-slate-500 mb-6">${escapeHtml(message)}</p><div class="flex gap-3"><button onclick="closeModal()" class="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-500 bg-slate-50">ยกเลิก</button><button id="modal-confirm-btn" class="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-500 text-white">ยืนยัน</button></div></div></div>`;
    $id('modal-confirm-btn').onclick = () => { closeModal(); onConfirm && onConfirm(); };
}
function closeModal() { $id('modal-root').innerHTML = ''; }

function getFilteredRecords() {
    let filtered = S.records;
    
    // --- เพิ่มการกรองตามวันที่จาก Header ---
    const start = ''; 
    const end = '';
    if (start && end) {
        filtered = filtered.filter(r => r.date >= start && r.date <= end);
    }

    // กรองตาม Judgment (ALL, SF, VENDOR...)
    if (S.activeFilter !== 'ALL') filtered = filtered.filter(r => r.judgment === S.activeFilter);
    
    // กรองตามคำค้นหา
    if (S.searchKeyword) {
        const kw = S.searchKeyword.toLowerCase();
        filtered = filtered.filter(r =>
            (r.ref || '').toLowerCase().includes(kw) ||
            (r.partNo || '').toLowerCase().includes(kw) ||
            (r.partName || '').toLowerCase().includes(kw) ||
            (r.supplier || '').toLowerCase().includes(kw) ||
            (r.defect || '').toLowerCase().includes(kw) ||
            (r.line || '').toLowerCase().includes(kw) ||
            (r.remark || '').toLowerCase().includes(kw)
        );
    }
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

        <!-- แก้ไขจุดนี้: SUPPLIER/PART INFO -->
        <td class="col-part-combo" style="max-width: 280px;">
            <div style="display: flex; flex-direction: column; gap: 1px;">
                <!-- บรรทัดบน: ชื่อ Supplier (CSS จะเปลี่ยนเป็นสีขาวหนาใน Dark Mode) -->
                <span style="font-weight: 800; color: #1e293b; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(r.supplier)}">
                    ${escapeHtml(r.supplier || '-')}
                </span>
                
                <!-- บรรทัดล่าง: ชื่อพาร์ท และ หมายเลขพาร์ท -->
                <span style="font-size: 9px; color: #64748b; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center;">
                    <span style="flex-shrink: 1; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(r.partName || '-')}</span>
                    <span style="margin: 0 4px; opacity: 0.5;">/</span>
                    <!-- หมายเลขพาร์ท (CSS จะเปลี่ยนเป็นสีฟ้าเลเซอร์ใน Dark Mode) -->
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
                <button class="row-btn row-btn-clone" data-tip="คัดลอก" onclick="cloneRecord('${r.id}')"><svg style="width: 10px; height: 10px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                <button class="row-btn row-btn-edit" data-tip="แก้ไข" onclick="editRecord('${r.id}')"><svg style="width: 10px; height: 10px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                <button class="row-btn row-btn-del" data-tip="ลบ" onclick="confirmDelete('${r.id}')"><svg style="width: 10px; height: 10px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
            </div>
        </td>
    </tr>`;
}



/* ============================================================
   UPGRADED: PART LINE CLAIM VIRTUAL RENDERER (V7.0 - Transform Base)
   ============================================================ */
const FIXED_ROW_HEIGHT = 56; // ความสูงแถวคงที่ (รวม Border/Padding)
const HEADER_HEIGHT = 40;    // ความสูงของหัวตาราง

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

    /**
     * 4. สร้างโครงสร้างใหม่ (Virtual DOM Structure)
     * แก้ไขจุดนี้: ใส่ data-i18n ให้กับทุกหัวข้อคอลัมน์ (<th>)
     */
    container.innerHTML = `
        <div id="table-runway" style="position: relative; width: 100%; height: ${total * FIXED_ROW_HEIGHT + HEADER_HEIGHT}px;">
            <div id="table-content-wrapper" style="position: absolute; top: 0; left: 0; right: 0; will-change: transform;">
                <table class="data-table" style="table-layout: fixed; width: 100%; border-collapse: separate; border-spacing: 0;">
                    <colgroup>
                        <col style="width: 45px;">   <!-- # -->
                        <col style="width: 100px;">  <!-- DATE -->
                        <col style="width: 130px;">  <!-- REF/LINE -->
                        <col style="width: 280px;">  <!-- SUPPLIER/PART -->
                        <col style="width: 70px;">   <!-- QTY -->
                        <col style="width: 140px;">  <!-- DEFECT -->
                        <col style="width: 180px;">  <!-- REMARK -->
                        <col style="width: 140px;">  <!-- STATUS -->
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

    // 5. รีเซ็ตตำแหน่งการเลื่อน และผูก Event ใหม่
    container.scrollTop = 0;
    container.removeEventListener('scroll', handleTableScroll);
    container.addEventListener('scroll', handleTableScroll, { passive: true });

    // 6. [จุดสำคัญ] สั่งแปลภาษาหัวตารางทันทีหลังวาด HTML
    const currentLang = localStorage.getItem('carrier_lang') || 'en';
    applyLanguage(currentLang);

    // 7. สั่งวาดข้อมูลแถวแรกๆ
    handleTableScroll();
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
    const viewHeight = container.clientHeight;
    
    // 1. คำนวณหา Index ของแถวที่ต้องแสดงผล
    // เราใช้ BUFFER 3-5 แถวเพื่อให้ตอนเลื่อนเร็วๆ ไม่เห็นพื้นที่สีขาว
    const BUFFER = 3;
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
    
    // ใช้ Transform แทนการเปลี่ยน Margin/Padding เพื่อให้ลื่นไหล (60 FPS)
    tbody.style.transform = `translateY(${offsetY}px)`;

    // 4. วนลูปสร้างเฉพาะ HTML ของแถวในช่วงที่คำนวณได้
    let loopHtml = '';
    for (let i = startIdx; i < endIdx; i++) {
        loopHtml += buildRow(allData[i], i);
    }

    // 5. ฉีดข้อมูลเข้าสู่ Tbody
    tbody.innerHTML = loopHtml;
}

/**
 * ปรับปรุง: ฟังก์ชันสลับหน้าย่อยให้ "ฉลาดเรื่องภาษา" (Smart i18n Aware)
 */
function switchSubTerminal(view) {
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
 * 1. รวมศูนย์การเปลี่ยนหน้า (Unified Switch Page System)
 * จัดการ: Sidebar, Header Tools, Page Visibility และ Module Initialization
 */
function switchPage(name, el) {
    const pageNameUpper = name.toUpperCase();
    const titleEl = document.getElementById('header-title');
    const subNav = document.getElementById('terminal-sub-nav'); 
    const claimOpTools = document.getElementById('claim-op-tools'); 
    const dashFilterWrap = document.getElementById('claim-dash-filter-wrap'); 
    
    // อ้างอิง Badge และ Selector
    const staffWrap = document.getElementById('staff-selector-wrap');
    const onlineBadge = document.getElementById('online-badge');

    // --- STEP 1: Reset Global UI States ---
    if (staffWrap) staffWrap.classList.add('hidden');
    if (onlineBadge) onlineBadge.classList.add('hidden');
    if (document.getElementById('claim-vendor-filter')) document.getElementById('claim-vendor-filter').classList.add('hidden');
    if (document.getElementById('vendor-divider')) document.getElementById('vendor-divider').classList.add('hidden');

    // --- STEP 2: Manage Header Visibility & Tools ---
    if (pageNameUpper === 'PART LINE CLAIM') {
        if (subNav) subNav.classList.remove('hidden'); 
        if (claimOpTools) {
            claimOpTools.classList.remove('hidden');
            claimOpTools.classList.add('flex');
        }
        if (dashFilterWrap) dashFilterWrap.classList.add('hidden');
        
        switchSubTerminal('entry'); // เริ่มต้นที่หน้าตารางเสมอ
    } else {
        if (subNav) subNav.classList.add('hidden'); 
        if (claimOpTools) claimOpTools.classList.add('hidden');
        if (dashFilterWrap) {
            dashFilterWrap.classList.remove('hidden');
            dashFilterWrap.classList.add('flex');
        }
        if (titleEl) titleEl.textContent = pageNameUpper;
    }

    // --- STEP 3: Sidebar Active State ---
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active-nav'));
    document.querySelectorAll('.active-indicator').forEach(i => i.remove());
    if (el) {
        el.classList.add('active-nav');
        const indicator = document.createElement('div');
        indicator.className = 'active-indicator';
        el.appendChild(indicator);
    }

    // --- STEP 4: Switch Visibility (Page Containers) ---
    const pages = [
        'entry-terminal-content', 'overview-cockpit-content', 'exec-dashboard-content',
        'attendance-logs', 'line-support-logs-content', 'five-s-content',
        'skill-matrix-content', 'special-jobs-content', 'ot-management-content'
    ];
    pages.forEach(id => {
        const pageEl = document.getElementById(id);
        if (pageEl) pageEl.classList.add('hidden-view');
    });

    const targetIdMap = {
        'PART LINE CLAIM': 'entry-terminal-content',
        'EXEC DASHBOARD': 'exec-dashboard-content',
        'ATTENDANCE LOGS': 'attendance-logs',
        'LINE SUPPORT LOGS': 'line-support-logs-content',
        '5S EXCELLENCE': 'five-s-content',
        'SKILL MATRIX': 'skill-matrix-content',
        'SPECIAL JOBS': 'special-jobs-content',
        'OT MANAGEMENT': 'ot-management-content'
    };

    const targetId = targetIdMap[pageNameUpper];
    if (targetId) {
        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.classList.remove('hidden-view');
        
        // กำหนดผู้ใช้เป้าหมาย (สำหรับ Supervisor)
        const targetUser = (S.userRole === 'supervisor') ? S.viewingUser : S.currentUser;

        // --- STEP 5: Module Initialization ---
        switch(pageNameUpper) {
            case 'PART LINE CLAIM': renderTable(); break;
            case 'EXEC DASHBOARD': initExecDashboard(); break;
            case 'ATTENDANCE LOGS': initAttDashboard(); break;
            case 'LINE SUPPORT LOGS': WapSupportLogs.init(targetUser); break;
            case '5S EXCELLENCE': Wap5SExcellence.init(); break;
            case 'SKILL MATRIX': WapSkillMatrix.init(); break;
            case 'SPECIAL JOBS': WapSpecialJobs.init(); break;
            case 'OT MANAGEMENT': WapOTManagement.init(); break;
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

/* ============================================================
   [FIX 2] DOM SAFE BRIDGE (Null Protection)
   ============================================================ */

function animateValue(id, start, end, duration = 1500, decimals = 0, suffix = "", prefix = "") {
    const el = document.getElementById(id);
    if (!el) {
        // แทนที่จะปล่อยให้พัง ให้ข้ามไปเงียบๆ (Silent Fail)
        console.warn(`[UI Warning] Element ID: ${id} not found. Animation skipped.`);
        return; 
    }

    gsap.killTweensOf(el);
    const data = { val: start };
    gsap.to(data, {
        val: end,
        duration: duration / 1000,
        ease: "power3.out",
        onUpdate: () => {
            el.innerHTML = prefix + data.val.toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }) + suffix;
        }
    });
}

// ฟังก์ชันช่วยเขียน Text แบบปลอดภัย
function safeSetText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

async function fetchWAPData() {
    if (!navigator.onLine) return false;
    const targetUser = S.userRole === 'supervisor' ? S.viewingUser : S.currentUser;
    if (!targetUser) return false;

    try {
        // ดึงข้อมูลจาก 5 ตารางหลักของ WAP พร้อมกัน (Parallel Fetch)
        const [resAct, resS5, resAtt, resOT, resSkill] = await Promise.all([
            wapClient.from('support_records').select('*').eq('user_id', targetUser).order('event_date', { ascending: false }),
            wapClient.from('s5_records').select('*').eq('user_id', targetUser).order('month', { ascending: false }),
            wapClient.from('daily_reports').select('*').eq('user_id', targetUser).order('date', { ascending: false }),
            wapClient.from('ot_records').select('*').eq('user_id', targetUser).order('date', { ascending: false }),
            wapClient.from('skill_matrix').select('*').eq('user_id', targetUser)
        ]);

        // ตรวจสอบ Error
        if (resAct.error) throw resAct.error;
        if (resS5.error) throw resS5.error;

        // บันทึกลง Global State
        S.wapData.achievements = resAct.data || []; 
        S.wapData.score5s = resS5.data || [];
        S.attLeaveRecords = resAtt.data || []; // สำหรับหน้า Attendance
        S.otRecords = resOT.data || [];        // สำหรับหน้า OT (ถ้ามี State แยก)
        S.skillRecords = resSkill.data || [];  // สำหรับหน้า Skill Matrix
        
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

function showAC(type, inputEl) { renderACDropdown(type, inputEl); }
function onACInput(type, inputEl) { renderACDropdown(type, inputEl); updateInputResetButton(); }
function closeAC() { closeAllAC(); }
function closeAllAC() { document.querySelectorAll('.ac-dropdown.open').forEach(d => d.classList.remove('open')); }

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

function initKeyboardAwareness() {
    const inputs = document.querySelectorAll('.form-input, .form-textarea, .login-input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function () { setTimeout(() => this.classList.add('keyboard-focus-active'), 300); });
        input.addEventListener('blur', function () { this.classList.remove('keyboard-focus-active'); });
    });
}


// ============================================================
// 1. ประกาศฟังก์ชันไว้ด้านนอกสุด (Global Scope) 
// เพื่อให้ปุ่ม Reset และ Event Listener เรียกใช้ได้พร้อมกัน
// ============================================================
const updateAllModuleFilters = () => {
    const titleEl = document.getElementById('header-title');
    if (!titleEl) return;
    
    const currentTitle = titleEl.textContent.trim().toUpperCase();
    
    // 1. หน้า Dashboard หลัก (ตรวจสอบทั้ง LINE CLAIM / บันทึกเคลม และ DASHBOARD / แดชบอร์ด)
    if ((currentTitle.includes('LINE CLAIM') || currentTitle.includes('บันทึกเคลม')) && 
        (currentTitle.includes('DASHBOARD') || currentTitle.includes('แดชบอร์ด'))) {
        refreshClaimDashboard();
    }
    
    // 2. หน้า Exec Dashboard (ตรวจสอบ EXEC / สรุปงาน)
    if (currentTitle.includes('EXEC') || currentTitle.includes('สรุปงาน')) {
        initExecDashboard();
    }

    // 3. หน้า 5S Excellence (5S มักใช้ทับศัพท์ แต่ดัก 'ตรวจสอบ' เผื่อไว้)
    if (typeof Wap5SExcellence !== 'undefined' && Wap5SExcellence.applyDateFilter) {
        if (currentTitle.includes('5S') || currentTitle.includes('ตรวจสอบ')) {
            Wap5SExcellence.applyDateFilter();
        }
    }
    
    // 4. หน้า Special Jobs (ตรวจสอบ SPECIAL / ภารกิจ)
    if (typeof WapSpecialJobs !== 'undefined' && WapSpecialJobs.applyDateFilter) {
        if (currentTitle.includes('SPECIAL') || currentTitle.includes('ภารกิจ')) {
            WapSpecialJobs.applyDateFilter();
        }
    }

    // 5. หน้า OT Management (ตรวจสอบ OT / ล่วงเวลา)
    if (typeof WapOTManagement !== 'undefined' && WapOTManagement.applyDateFilter) {
        if (currentTitle.includes('OT') || currentTitle.includes('ล่วงเวลา')) {
            WapOTManagement.applyDateFilter();
        }
    }

    // 6. หน้า Line Support Logs (ตรวจสอบ SUPPORT / สนับสนุน)
    if (typeof WapSupportLogs !== 'undefined' && WapSupportLogs.applyDateFilter) {
        if (currentTitle.includes('SUPPORT') || currentTitle.includes('สนับสนุน')) {
            WapSupportLogs.applyDateFilter();
        }
    }

    // 7. หน้า Attendance / Daily Report (ตรวจสอบ ATTENDANCE / DAILY / เข้างาน / รายงานประจำวัน)
    if (currentTitle.includes('ATTENDANCE') || currentTitle.includes('DAILY') || 
        currentTitle.includes('เข้างาน') || currentTitle.includes('รายงาน')) {
        initAttDashboard();
    }
};
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
        renderTable();
        if (charts.yield || charts.trend) {
            const activePage = $id('overview-cockpit-content');
            if (activePage && !activePage.classList.contains('hidden-view')) refreshDashboard();
        }
const execPage = $id('exec-dashboard-content');
if (execPage && !execPage.classList.contains('hidden-view')) {
    initExecDashboard();
}
const attPage = $id('attendance-logs');
if (attPage && !attPage.classList.contains('hidden-view') && typeof initAttMonthlyChart === 'function') {
    initAttMonthlyChart();
}
if (window.innerWidth <= 768) $id('sidebar').classList.add('collapsed');
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
        const subSet = filtered.filter(r => r.judgment === judgmentKey);
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
                footEl.innerHTML = '<span id="' + `kpi-${prefix}-footer-unit-0` + '">0</span> PCS';
                animateValue(`kpi-${prefix}-footer-unit-0`, 0, 0, 600);
            } else if (activeUnits.length === 1) {
                const [unit, val] = activeUnits[0];
                footEl.innerHTML = `<span id="kpi-${prefix}-footer-unit-0">0</span> ${escapeHtml(unit)}`;
                animateValue(`kpi-${prefix}-footer-unit-0`, 0, val, 900);
            } else {
                footEl.innerHTML = activeUnits.map(([unit], idx) => `<span id="kpi-${prefix}-footer-unit-${idx}" style="font-weight:900">0</span> <span style="opacity:.7">${escapeHtml(unit)}</span>`).join(' | ');
                activeUnits.forEach(([unit, val], idx) => {
                    animateValue(`kpi-${prefix}-footer-unit-${idx}`, 0, val, 900);
                });
            }
        }
    };

    ['sf', 'ctc', 'ok', 'vendor'].forEach(k =>
        updateFaultCard(k, k === 'ok' ? 'CAN USE' : k.toUpperCase().includes('VENDOR') ? 'VENDOR FAULT' : k.toUpperCase())
    );

    // --- [3. Yield & Speedometer Calculation] ---
    const okQty = getQty(filtered.filter(r => r.judgment === 'CAN USE'));
    const yieldRate = totalQty > 0 ? Math.round((okQty / totalQty) * 100) : 0;
    
    // ✅ เรียกใช้ฟังก์ชันหน้าปัดตรงนี้!
    updateMainGauge(yieldRate); 

    // อัปเดตตัวเลข Yield ใน Pill เล็ก (ถ้ามี)
    animateValue('yield-pill', 0, yieldRate, 1200, 0, "%");

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
// ส่วนนี้มีอยู่ในโค้ดเดิมของคุณแล้ว แต่ต้องตรวจสอบให้แน่ใจว่าเรียกใช้ function วาดกราฟใหม่
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // สั่งให้วาด Dashboard ใหม่เพื่อให้กราฟคำนวณความกว้างหน้าจอใหม่
        if (typeof refreshClaimDashboard === 'function') {
            refreshClaimDashboard();
        }
    }, 250);
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
    const minAngle = -120; // ตำแหน่ง 0%
    const maxAngle = 120;  // ตำแหน่ง 100%
    const targetAngle = minAngle + (yieldRate / 100) * (maxAngle - minAngle);

    // 1. อัปเดตตัวเลขเปอร์เซ็นต์ (ใช้วิ่งจากค่าเดิม)
    animateValue('gauge-yield-text', 0, yieldRate, 1500);

    // 2. หมุนเข็ม (Needle Animation) - ใช้ GSAP
    gsap.to("#gauge-needle-group", {
        rotation: targetAngle,
        duration: 2,
        ease: "elastic.out(1, 0.75)", // มีการดีดเบาๆ เหมือนเข็มจริง
        transformOrigin: "100px 115px"
    });

    // 3. วาดเส้นสี (Progress Segment)
    const progressPath = document.getElementById('gauge-progress-path');
    if (progressPath) {
        // คำนวณ arcLength (240 องศาคือความยาวเต็ม)
        const radius = 75;
        const totalArcLength = (240 / 360) * (2 * Math.PI * radius);
        const currentLength = (yieldRate / 100) * totalArcLength;
        
        progressPath.style.transition = "stroke-dasharray 2s cubic-bezier(0.4, 0, 0.2, 1)";
        progressPath.setAttribute('stroke-dasharray', `${currentLength}, 1000`);

        // เปลี่ยนสีตามเกณฑ์
        let color = "#ef4444"; 
        let status = "CRITICAL";
        let badgeCls = "border-rose-100 text-rose-500";

        if (yieldRate >= 95) {
            color = "#10b981"; status = "EXCELLENT"; badgeCls = "border-emerald-100 text-emerald-500";
        } else if (yieldRate >= 85) {
            color = "#f59e0b"; status = "STABLE"; badgeCls = "border-amber-100 text-amber-500";
        }

        progressPath.setAttribute('stroke', color);
        const badge = document.getElementById('gauge-status-badge');
        if (badge) {
            badge.textContent = status;
            badge.className = `mt-2 px-5 py-1 rounded-lg border-2 bg-white text-[11px] font-black uppercase tracking-widest shadow-sm ${badgeCls}`;
        }
        
        // อัปเดตข้อความ Footer
        safeSetText('yield-status-text', status);
        const statusEl = document.getElementById('yield-status-text');
        if (statusEl) statusEl.style.color = color;
    }

    // 4. วาดขีดสเกล (Ticks) ให้ทับซ้อนกับพื้นหลัง (วาดเพียงครั้งเดียว)
    const ticksGroup = document.getElementById('gauge-ticks-group');
    if (ticksGroup && ticksGroup.innerHTML === "") {
        let ticksHtml = "";
        for (let i = 0; i <= 50; i++) {
            const angle = minAngle + (i / 50) * (maxAngle - minAngle);
            const isMajor = i % 10 === 0;
            const tickLen = isMajor ? 14 : 7;
            const rOuter = 75 + (isMajor ? 4 : 0); //Major tick ยาวกว่าปกติ
            const rInner = rOuter - tickLen;
            
            const rad = (angle - 90) * (Math.PI / 180);
            const x1 = 100 + rOuter * Math.cos(rad);
            const y1 = 115 + rOuter * Math.sin(rad);
            const x2 = 100 + rInner * Math.cos(rad);
            const y2 = 115 + rInner * Math.sin(rad);
            
            ticksHtml += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${isMajor ? '#cbd5e1' : '#e2e8f0'}" stroke-width="${isMajor ? 2 : 1}" />`;
        }
        ticksGroup.innerHTML = ticksHtml;
    }


    // ============================================================
    // 2. MONTHLY TRENDS CHART (APEXCHARTS - เหมือนเดิมแต่สมบูรณ์ขึ้น)
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
        const qty = parseInt(r.qty) || 0;
        const ref = r.ref || 'N/A';
        const j = (r.judgment || '').toUpperCase();

        if (mIdx >= 0 && mIdx < 12) {
            if (j === 'CAN USE') { dataSet[mIdx].OK.pcs += qty; dataSet[mIdx].OK.lots.add(ref); }
            else if (j === 'SF') { dataSet[mIdx].SF.pcs += qty; dataSet[mIdx].SF.lots.add(ref); }
            else if (j === 'CTC') { dataSet[mIdx].CTC.pcs += qty; dataSet[mIdx].CTC.lots.add(ref); }
            else if (j.includes('VENDOR')) { dataSet[mIdx].VENDOR.pcs += qty; dataSet[mIdx].VENDOR.lots.add(ref); }
            
            dataSet[mIdx].TotalPcs += qty;
        }
    });

    // 2.3 อัปเดตตัวเลขสถิติประกอบกราฟ Trend
    const totalsArray = dataSet.map(d => d.TotalPcs);
    const activeData = totalsArray.filter(t => t > 0);
    
    safeSetText('trend-max', totalsArray.length ? Math.max(...totalsArray).toLocaleString() : 0);
    safeSetText('trend-min', activeData.length ? Math.min(...activeData).toLocaleString() : 0);
    safeSetText('trend-avg', activeData.length ? Math.round(activeData.reduce((a, b) => a + b, 0) / activeData.length).toLocaleString() : 0);
    safeSetText('trend-total-pcs', `PCS ${totalsArray.reduce((a, b) => a + b, 0).toLocaleString()}`);

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
            <div class="pareto-item opacity-0" style="margin-bottom: 14px; transform: translateY(10px);">
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
        gsap.to(".pareto-item", { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" });
    }

    // อัปเดตข้อความแนะนำ (Strategy Insight)
    if (insightEl && top5.length >= 1) {
        // ป้องกัน Error หากไม่มีฟังก์ชัน escapeHtml ให้แสดงชื่อตรงๆ
        const topName = typeof escapeHtml === 'function' ? escapeHtml(top5[0][0]) : top5[0][0];
        insightEl.innerHTML = `ซัพพลายเออร์อันดับที่ 1-2 (<span class="font-bold text-slate-800">${topName}</span>) เป็นกลุ่มเสี่ยงวิกฤตที่ต้องควบคุม`;
    }
}

// ฟังก์ชันล้างสถานะปุ่ม Active (ใช้สีขาวปกติ)
function clearDbPresetActive() {
    const ids = ['db-preset-today', 'db-preset-week', 'db-preset-month'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            // ปรับสีกลับเป็นแบบมาตรฐาน (พื้นหลังขาว ตัวอักษรเทาเข้ม)
            el.className = "h-6 px-1.5 text-[8px] font-bold bg-white rounded border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700";
        }
    });
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
        lineStats[line].totalQty += (parseInt(r.qty) || 0);
        lineStats[line].latestPart = r.partName;
        lineStats[line].latestSupplier = r.supplier;
    });

    const sortedLines = Object.entries(lineStats).sort((a, b) => b[1].count - a[1].count).slice(0, 5);
    if (sortedLines.length === 0) { feedContainer.innerHTML = `<p class="text-center py-10 text-slate-300 font-bold uppercase text-[10px]">No Data</p>`; return; }

    const maxCase = sortedLines[0][1].count;

 feedContainer.innerHTML = sortedLines.map(([lineName, data], i) => `
        <div class="line-card">
            <div class="flex justify-between items-start">
                <div class="flex items-center gap-3">
                    <div class="rank-badge">${i + 1}</div>
                    <div>
                        <div class="text-[13px] font-black text-slate-800 uppercase">LINE: ${lineName}</div>
                        <div class="text-[9px] font-bold text-blue-500 uppercase mt-0.5">LATEST: ${data.latestSupplier}</div>
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-[16px] font-black text-blue-700">${data.count.toLocaleString()}</span>
                    <span class="text-[9px] font-bold text-slate-400 uppercase ml-1">CASES</span>
                </div>
            </div>

            <!-- Progress Bar -->
            <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-3">
                <div id="line-bar-${i}" class="h-full bg-blue-600 rounded-full" style="width: 0%"></div>
            </div>

            <div class="flex justify-between items-center mt-2">
                <span class="text-[10px] text-slate-400 italic font-medium">"${data.latestPart}"</span>
                <div class="pcs-summary-tag">
                    <span class="text-[9px] text-slate-400 mr-1">Σ</span>
                    <span>${data.totalQty.toLocaleString()}</span>
                    <span class="text-[8px] ml-0.5">PCS</span>
                </div>
            </div>
        </div>
    `).join('');

    // เริ่มรัน Animation
    sortedLines.forEach(([name, data], i) => {
        animateValue(`line-case-val-${i}`, 0, data.count, 1500);
        animateValue(`line-qty-val-${i}`, 0, data.totalQty, 1500);
        gsap.to(`#line-bar-${i}`, { width: `${(data.count / maxCase) * 100}%`, duration: 1.5, ease: "power2.out", delay: i * 0.1 });
    });
    gsap.to(".line-card", { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "back.out(1.7)" });
}

// 1. เปลี่ยนชื่อตัวแปร Global
let vendorRiskChart = null; 

function renderVendorRadar(filtered) {
    const container = document.getElementById('vendor-radar-chart');
    if (!container) return;

    // 1. ดึงข้อมูลเฉพาะ VENDOR FAULT และรวม QTY
    const vendorMap = {};
    filtered.filter(r => r.judgment === 'VENDOR FAULT').forEach(r => {
        const supplier = r.supplier || 'Unknown';
        vendorMap[supplier] = (vendorMap[supplier] || 0) + Number(r.qty || 0);
    });

    // 2. เรียงลำดับจากมากไปน้อย
    const sorted = Object.entries(vendorMap).sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) {
        container.innerHTML = `<div class="py-20 text-center opacity-30 font-black text-[10px] uppercase">No Risk Data</div>`;
        return;
    }

    // 3. กำหนดสีชุดใหม่ (Indigo -> Violet -> Royal Blue -> Azure)
    // เพื่อให้แตกต่างจาก Pareto (ที่เป็น Red/Orange)
    const riskColors = [
        '#6366f1', // Indigo (อันดับ 1)
        '#8b5cf6', // Violet (อันดับ 2)
        '#3b82f6', // Royal Blue (อันดับ 3)
        '#0ea5e9', // Sky Blue (อันดับ 4)
        '#64748b'  // Slate (อื่นๆ)
    ];

    const maxVal = sorted[0][1];

    // 4. สร้าง HTML เนื้อหา
    container.className = 'vendor-ranking-wrapper';
    container.innerHTML = sorted.map(([name, qty], i) => {
        const color = riskColors[i] || riskColors[4];
        const pct = (qty / maxVal) * 100;
        
        return `
            <div class="ranking-row opacity-0" style="transform: translateX(-10px)">
                <div class="flex items-center justify-between">
                    <div class="flex items-center flex-1 min-w-0">
                        <div class="rank-square" style="background: ${color}">${i + 1}</div>
                        <span class="rank-name-text">${name}</span>
                    </div>
                    <div class="flex items-baseline gap-1 ml-4">
                        <span id="v-rank-num-${i}" class="rank-value-num">0</span>
                        <span class="text-[9px] font-black text-slate-400">PCS</span>
                    </div>
                </div>
                <div class="thick-progress-bg">
                    <div id="v-rank-bar-${i}" class="thick-progress-fill" style="width: 0%; background: ${color}"></div>
                </div>
            </div>
        `;
    }).join('');

    // 5. รันอนิเมชั่น
    sorted.forEach(([name, qty], i) => {
        // ตัวเลขวิ่งนิ่งๆ
        animateValue(`v-rank-num-${i}`, 0, qty, 1500);
        // แถบพลังเลื่อนตาม
        setTimeout(() => {
            const bar = document.getElementById(`v-rank-bar-${i}`);
            if(bar) bar.style.width = ((qty / maxVal) * 100) + '%';
        }, 150 + (i * 100));
    });

    // ใช้ GSAP ทำให้รายการค่อยๆ เลื่อนเข้า
    gsap.to(".ranking-row", {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out"
    });
}

// 3. ตรวจสอบใน refreshClaimDashboard (ประมาณบรรทัด 980) 
// ต้องมีการเรียกใช้ renderVendorRadar(filtered); เสมอ

function applyExecPreset(preset) {
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    $id('pre-' + preset).classList.add('active');
    
    const now = new Date();
    let start = new Date();
    if (preset === 'today') start = now;
    if (preset === 'week') start.setDate(now.getDate() - 7);
    if (preset === 'month') start = new Date(now.getFullYear(), now.getMonth(), 1);
    if (preset === 'year') start = new Date(now.getFullYear(), 0, 1);
    
    $id('exec-start').value = start.toISOString().split('T')[0];
    $id('exec-end').value = now.toISOString().split('T')[0];
    
    initExecDashboard();
}


// ฟังก์ชันคำนวณสถิติการเข้างานชุดกลาง (Shared Calculation)
function getGlobalAttendanceStats(year) {
    const targetYear = year || new Date().getFullYear();
    const allRecords = S.attLeaveRecords || [];
    
    // 1. กรองเฉพาะรายการในปีที่เลือก
    const yearRecords = allRecords.filter(r => r.date && new Date(r.date).getFullYear() === targetYear);
    
    // 2. แยกประเภทการลาและวันหยุด
    const leaveRecords = yearRecords.filter(r => r.type !== 'holiday'); 
    const holidayRecords = yearRecords.filter(r => r.type === 'holiday');

    const leaveTaken = leaveRecords.length;
    const publicHolidays = holidayRecords.length;

    // 3. คำนวณวันทำงานสะสม (จันทร์-ศุกร์)
    const now = new Date();
    const rangeStart = new Date(targetYear, 0, 1);
    let rangeEnd;
    
    // ถ้าเป็นปีปัจจุบัน ให้คำนวณถึงแค่วันนี้ ถ้าเป็นปีเก่าให้คำนวณถึงสิ้นปี
    if (targetYear === now.getFullYear()) rangeEnd = now;
    else if (targetYear < now.getFullYear()) rangeEnd = new Date(targetYear, 11, 31);
    else rangeEnd = rangeStart;

    const totalWeekdays = countWeekdaysInRange(rangeStart, rangeEnd);
    const totalWorked = Math.max(0, totalWeekdays - leaveTaken - publicHolidays);

    // 4. คำนวณอัตราเข้างาน (%)
    const scheduledDays = totalWorked + leaveTaken;
    const rate = scheduledDays > 0 ? ((totalWorked / scheduledDays) * 100).toFixed(1) : "100.0";

    return {
        rate: rate,
        leave: leaveTaken,
        worked: totalWorked,
        holiday: publicHolidays
    };
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
    
    // --- [ANIMATION: กล่องที่ 1 - TOTAL SUPPORT] ---
    animateValue('exec-kpi-support', 0, totalSup, 800); // เลขใหญ่ 159
    animateValue('exec-sub-rp', 0, rp, 1000);           // เลขย่อย RP
    animateValue('exec-sub-vf', 0, vf, 1000);           // เลขย่อย VF
    animateValue('exec-sub-records', 0, recordsCount, 1000); // เลขย่อย REC

    // ============================================================
    // 3. [แก้ไขใหม่] 5S FINDINGS (แสดงจำนวนจุดสะสมรายปี + แถบวิ่ง)
    // ============================================================
    const targetYear = start ? start.substring(0, 4) : new Date().getFullYear().toString();
    const yearly5s = rawScore5s.filter(r => r.month && r.month.startsWith(targetYear));
    const totalYearlyFindings = yearly5s.reduce((sum, curr) => sum + (Number(curr.issue_count) || 0), 0);

    const s5Label = document.querySelector('#exec-dashboard-content .exec-card-premium:nth-child(2) p');
    if (s5Label) s5Label.textContent = "TOTAL 5S FINDINGS (YEARLY)";

    // --- [ANIMATION: กล่องที่ 2 - 5S FINDINGS] ---
    animateValue('exec-5s-avg', 0, totalYearlyFindings, 1200, 0, "");
    
    if($id('exec-5s-bar')) {
        // ใช้ GSAP ทำให้แถบความคืบหน้าวิ่งจาก 0 ไปถึงเป้าหมาย
        const barPct = Math.min(100, (totalYearlyFindings / 100) * 100); 
        gsap.to('#exec-5s-bar', { width: barPct + '%', duration: 1.5, ease: "expo.out" });
    }

    // ============================================================
    // 4. ส่วน Attendance (รันเลขวิ่ง % และจำนวนวัน)
    // ============================================================
    const attStats = getGlobalAttendanceStats(parseInt(targetYear));
    
    // --- [ANIMATION: กล่องที่ 4 - ATTENDANCE RATE] ---
    // หมายเหตุ: กล่องที่ 3 (Index) จะถูกสั่งรันใน updateAIBannerInsight
    animateValue('exec-att-rate', 0, parseFloat(attStats.rate), 1200, 1, "%");
    animateValue('exec-leave-total', 0, attStats.leave, 1000, 0, " DAYS TOTAL", "LEAVE: ");

    // ============================================================
    // 5. วาดกราฟและอัปเดตส่วนอื่นๆ (คงเดิมแต่เพิ่ม Stagger Entrance)
    // ============================================================
    renderExecTrends(filteredActs, rawScore5s);
    renderExecParts(filteredActs);
    renderExecPie(rp, vf, recordsCount); 
    updateAIBannerInsight(filteredActs);

    // --- [ENTRANCE STAGGER: สั่งให้การ์ดค่อยๆ เด้งขึ้นมาทีละใบ] ---
    if (!$id('exec-dashboard-content').classList.contains('hidden-view')) {
        gsap.fromTo("#exec-dashboard-content .exec-card-premium", 
            { opacity: 0, y: 15 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.4, 
                stagger: 0.05, 
                ease: "expo.out",
                clearProps: "all" 
            }
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
function renderExecTrends(actData, s5Data) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // ============================================================
    // 1. ระบุปีเป้าหมาย (Target Year) จากตัวกรองวันที่ใน Header
    // ============================================================
    const startVal = document.getElementById('cd-start-date')?.value;
    const targetYear = startVal ? new Date(startVal).getFullYear() : new Date().getFullYear();

    // ============================================================
    // 2. ประมวลผลข้อมูล Support (เส้นสีน้ำเงิน) - กรองทั้งเดือนและปี
    // ============================================================
    const supportData = months.map((m, i) => {
        return actData.filter(r => {
            const d = new Date(r.event_date);
            return d.getMonth() === i && d.getFullYear() === targetYear;
        }).length;
    });

    // ============================================================
    // 3. ประมวลผลข้อมูล 5S (เส้นสีม่วง) - กรองทั้งเดือนและปี
    // ============================================================
    const s5CalculatedData = months.map((m, i) => {
        const monthlyS5 = s5Data.filter(r => {
            // ดึงวันที่จากคอลัมน์ date หรือ month (กรณีบันทึกเป็นรายเดือน)
            let dateStr = r.date || (r.month ? `${r.month}-01` : null);
            if (!dateStr) return false;
            
            const d = new Date(dateStr);
            return d.getMonth() === i && d.getFullYear() === targetYear;
        });

        // คำนวณหาผลรวมของจุดบกพร่องที่พบในเดือนนั้นๆ
        return monthlyS5.reduce((sum, curr) => sum + (Number(curr.issue_count) || 0), 0);
    });

    // 4. คำนวณค่าสูงสุดเพื่อตั้งค่าสเกลกราฟให้สวยงาม
    const maxVal = Math.max(...supportData, ...s5CalculatedData, 5);
    const dynamicMax = Math.ceil(maxVal / 5) * 5 + 5;

    // 5. วาดกราฟใหม่
    if (execCharts.trend) execCharts.trend.destroy();
    
    execCharts.trend = new ApexCharts(document.getElementById('exec-trend-chart'), {
        series: [
            { name: '5S Findings (จุด)', data: s5CalculatedData },
            { name: 'Support เคส (รายการ)', data: supportData }
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
        colors: ['#a855f7', '#3b82f6'], 
        stroke: { curve: 'smooth', width: [3, 4], lineCap: 'round' },
        markers: {
            size: 4, colors: ['#ffffff'], strokeColors: ['#a855f7', '#3b82f6'], strokeWidth: 2
        },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
        xaxis: {
            categories: months,
            labels: { style: { colors: '#94a3b8', fontSize: '10px', fontWeight: 600 } }
        },
        yaxis: {
            min: 0,
            max: dynamicMax,
            labels: {
                style: { colors: '#94a3b8', fontSize: '10px', fontWeight: 600 },
                formatter: (val) => Math.floor(val)
            }
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
    const labels = ['RP (Real Problem)', 'VF (Vendor Fault)', 'Records (Others)'];
    const colors = ['#ef4444', '#2563eb', '#f59e0b']; 

    if (execCharts.pie) execCharts.pie.destroy();

    const chartOptions = {
        series: series,
        labels: labels,
        chart: {
            type: 'donut',
            width: '100%',
            height: '100%',
            fontFamily: 'Inter, sans-serif',
            animations: { 
                enabled: true, 
                speed: 1000, // ความเร็วในการหมุนและคลี่ตัวของกราฟ
                animateGradually: { enabled: true, delay: 150 },
                dynamicAnimation: { enabled: true, speed: 350 }
            }
        },
        colors: colors,
        stroke: { show: true, width: 2, colors: ['#ffffff'] },
        plotOptions: {
            pie: {
                customScale: 0.85, 
                expandOnClick: true,
                donut: {
                    size: '72%',
                    labels: {
                        show: true,
                        name: { show: true, fontSize: '9px', fontWeight: 600, color: '#94a3b8', offsetY: -4 },
                        value: {
                            show: true,
                            fontSize: '18px',
                            fontWeight: 900,
                            color: '#1e293b',
                            offsetY: 4,
                            formatter: function (val) { return val; }
                        },
                        total: {
                            show: true,
                            label: 'TOTAL',
                            color: '#64748b',
                            fontSize: '8px',
                            fontWeight: 800,
                            formatter: function (w) {
                                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                            }
                        }
                    }
                }
            }
        },
        dataLabels: { enabled: false },
        legend: { show: false },
        tooltip: {
            y: { formatter: function (val) { return val + " รายการ"; } }
        }
    };

    execCharts.pie = new ApexCharts($id('exec-pie-chart'), chartOptions);
    execCharts.pie.render();

    // --- 1. สร้าง Custom Legend แบบพรีเมียม พร้อมระบุ ID ให้ตัวเลข ---
    const legendEl = $id('exec-pie-legend');
    legendEl.innerHTML = labels.map((l, i) => {
        // สร้าง ID เฉพาะสำหรับจำนวน (count) และเปอร์เซ็นต์ (pct)
        const countId = `pie-count-val-${i}`;
        const pctId = `pie-pct-val-${i}`;

        return `
            <div class="flex items-center justify-between p-2 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                <div class="flex items-center gap-3 overflow-hidden">
                    <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background:${colors[i]}"></span>
                    <div class="flex flex-col">
                        <span class="text-[10px] font-black text-slate-700 leading-none uppercase">${l.split(' ')[0]}</span>
                        <span class="text-[8px] font-bold text-slate-400 mt-1 truncate">${l}</span>
                    </div>
                </div>
                <div class="text-right">
                    <!-- กำหนด ID เพื่อให้ animateValue เข้ามาจับ -->
                    <p id="${countId}" class="text-[11px] font-black text-slate-800 leading-none">0</p>
                    <p id="${pctId}" class="text-[9px] font-bold text-blue-600 mt-1">0%</p>
                </div>
            </div>
        `;
    }).join('');

    // --- 2. สั่งรันอนิเมชั่นตัวเลขวิ่งหลังจากสร้าง HTML เสร็จสิ้น ---
    series.forEach((val, i) => {
        const pctVal = total > 0 ? (val / total * 100) : 0;
        
        // ตัวเลขจำนวน (เช่น 4, 49, 106)
        animateValue(`pie-count-val-${i}`, 0, val, 1000);
        
        // ตัวเลขเปอร์เซ็นต์ (เช่น 2.5%, 30.8%) - ใช้ทศนิยม 1 ตำแหน่ง
        animateValue(`pie-pct-val-${i}`, 0, pctVal, 1000, 1, "%");
    });
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

function countWeekdaysInRange(start, end) {
    var count = 0;
    var cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    var last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    while (cur <= last) {
        if (!isWeekendDate(cur)) count++;
        cur.setDate(cur.getDate() + 1);
    }
    return count;
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

    initAttMonthlyChart();
}

/* 1. แก้ไขการ Render ตารางให้รองรับการกรองวันที่จาก Header */
async function renderAttRecords() {
    const tbody = $id('att-records-tbody');
    const countEl = $id('att-records-count');
    if (!tbody) return;

    // ดึงค่าวันที่จาก Global Filter (Header)
    const startFilter = $id('cd-start-date')?.value;
    const endFilter = $id('cd-end-date')?.value;

    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:24px;color:#94a3b8;font-size:11px;font-weight:700;">🔄 กำลังกรองข้อมูล...</td></tr>';

    await fetchAttendanceRecords(); 
    let records = S.attLeaveRecords || [];

    // --- จุดสำคัญ: เพิ่มการกรองข้อมูลตามวันที่เลือกใน Header ---
    if (startFilter && endFilter) {
        records = records.filter(r => r.date >= startFilter && r.date <= endFilter);
    }

    if (records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4"><div class="att-empty-state"><p>ไม่พบข้อมูลในช่วงเวลาที่เลือก</p></div></td></tr>`;
        if (countEl) countEl.textContent = '0 รายการ';
        return;
    }

    let html = '';
    records.forEach(r => {
        const t = attTypeMap[r.type] || attTypeMap.other;
        const isEditing = (attEditingId === r.id);
        html += `
            <tr class="${isEditing ? 'att-editing-row' : ''}">
                <td><span class="att-record-date">${formatDateTH(r.date)}</span></td>
                <td><span class="att-type-tag ${t.cls}">${t.label}</span></td>
                <td><span class="att-record-reason">${escapeHtml(r.note || '-')}</span></td>
                <td>
                    <div class="att-row-actions">
                        <button class="att-row-btn att-row-btn-edit" onclick="editAttRecord('${r.id}')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-width="2"></path></svg></button>
                        <button class="att-row-btn att-row-btn-del" onclick="deleteAttRecord('${r.id}')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2"></path></svg></button>
                    </div>
                </td>
            </tr>`;
    });

    tbody.innerHTML = html;
    if (countEl) countEl.textContent = `${records.length} รายการ`;
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
    if (!navigator.onLine) { attToast('📶 ออฟไลน์: ไม่สามารถลบข้อมูลได้', 'error'); return; }
    if (!confirm('ต้องการลบรายการลานี้หรือไม่?')) return;

    try {
        var res = await wapClient.from(ATT_LEAVE_TABLE).delete().eq('id', id);
        if (res.error) throw res.error;

        if (attEditingId === id) cancelEditAttRecord();

        attToast('ลบรายการเรียบร้อย', 'success');
        await initAttDashboard();
    } catch (e) {
        console.error('Delete daily_reports error:', e);
        attToast('ลบไม่สำเร็จ: ' + (e.message || 'เกิดข้อผิดพลาด'), 'error');
    }
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
}

/* อัปเดต KPI สถิติการเข้างาน (เวอร์ชั่นรวมฟิลเตอร์ Header และรายปี) */
function updateAttKPI() {
    const startFilter = $id('cd-start-date')?.value;
    const endFilter = $id('cd-end-date')?.value;
    const allRecords = S.attLeaveRecords || [];

    let rangeStart, rangeEnd;
    if (startFilter && endFilter) {
        rangeStart = new Date(startFilter);
        rangeEnd = new Date(endFilter);
    } else {
        const year = attSelectedYear;
        const now = new Date();
        rangeStart = new Date(year, 0, 1);
        rangeEnd = (year === now.getFullYear()) ? now : new Date(year, 11, 31);
    }

    // 1. คำนวณจำนวนวันทั้งหมดในปฏิทินตั้งแต่วันเริ่มจนถึงวันสิ้นสุด (Total Calendar Days)
    const diffTime = Math.abs(rangeEnd - rangeStart);
    const totalCalendarDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // 2. กรองข้อมูลเฉพาะในช่วงวันที่เลือก และนับวันที่บันทึกไว้ในระบบ (ลา + วันหยุด)
    // ใช้ Set เพื่อป้องกันกรณีบันทึกซ้ำซ้อนในวันเดียวกัน
    const leaveDates = new Set();
    const holidayDates = new Set();

    allRecords.forEach(r => {
        const rDate = new Date(r.date);
        if (rDate >= rangeStart && rDate <= rangeEnd) {
            if (r.type === 'holiday') {
                holidayDates.add(r.date);
            } else {
                leaveDates.add(r.date);
            }
        }
    });

    const totalLeaveCount = leaveDates.size;
    const totalHolidayCount = holidayDates.size;

    // 3. วันทำงานสะสม = วันทั้งหมดในปฏิทิน - (วันลา + วันหยุดนักขัตฤกษ์ที่ลงบันทึกไว้)
    const actualWorkedDays = totalCalendarDays - (totalLeaveCount + totalHolidayCount);

    // 4. คำนวณอัตราเข้างาน (%)
    const scheduledDays = actualWorkedDays + totalLeaveCount;
    const rate = scheduledDays > 0 ? Math.round((actualWorkedDays / scheduledDays) * 100) : 100;

    // 5. อัปเดตตัวเลขบนหน้าจอด้วย Animation
    animateValue('att-kpi-leave', 0, totalLeaveCount, 800);
    animateValue('att-kpi-holiday', 0, totalHolidayCount, 800);
    animateValue('att-kpi-worked', 0, actualWorkedDays, 1000); 
    animateValue('att-kpi-rate', 0, rate, 1200, 0, "");
}

/**
 * Super Smooth Counter (GSAP Version) 
 * ตัวเดียวจบ ลื่นไหล ไม่กิน CPU
 */
function animateValue(id, start, end, duration) {
    const el = document.getElementById(id);
    if (!el) return;

    // สร้าง Object จำลองเพื่อเก็บค่า
    const cont = { val: start };
    
    gsap.to(cont, {
        val: end,
        duration: duration / 1000, // แปลง ms เป็นวินาที
        ease: "expo.out",
        onUpdate: () => {
            el.textContent = Math.floor(cont.val).toLocaleString();
        }
    });
}


/* วาดกราฟสถิติรายเดือน - เวอร์ชั่น Hybrid เสถียรสูง */
function initAttMonthlyChart() {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const year = attSelectedYear;
    const now = new Date();
    const isCurrentYear = (year === now.getFullYear());

    // 1. เตรียม Container
    const chartContainer = document.getElementById('att-monthly-chart');
    if (!chartContainer) return;

    // ============================================================
    // >>> [แก้ไข] ทำลายกราฟเดิมทิ้งอย่างเด็ดขาด (Anti-Overlap Logic) <<<
    // ============================================================
    if (window.attMonthlyChart !== undefined && window.attMonthlyChart !== null) {
        try {
            // ตรวจสอบว่าเป็น Instance ของ ApexCharts จริงหรือไม่ก่อนสั่ง destroy
            if (typeof window.attMonthlyChart.destroy === 'function') {
                window.attMonthlyChart.destroy();
            }
        } catch (e) {
            console.warn("Could not destroy existing chart:", e);
        }
        // ล้างค่าตัวแปรเป็น null เพื่อป้องกันการอ้างอิงค้าง
        window.attMonthlyChart = null; 
    }

    // ล้าง HTML ภายในคอนเทนเนอร์ให้เกลี้ยง 100%
    chartContainer.innerHTML = ''; 
    // ============================================================

    // 2. เตรียมโครงสร้างข้อมูล (Logic เดิม)
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

    // 3. ตั้งค่า Configuration ของกราฟ (คงความสวยงามเดิม)
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

    // 4. สั่งสร้าง Instance ใหม่เก็บไว้ใน window.attMonthlyChart เพื่อให้เรียกใช้ได้ทั่วถึง
    window.attMonthlyChart = new ApexCharts(chartContainer, options);
    
    // ใช้ Delay เล็กน้อยเพื่อให้มั่นใจว่า DOM พร้อมทำงาน (ลดโอกาสเกิด overlap ในจังหวะสลับหน้าเร็วๆ)
    setTimeout(() => {
        if (window.attMonthlyChart) {
            window.attMonthlyChart.render();
        }
    }, 50);
}

/* ฟังก์ชันช่วยคำนวณวันจันทร์-ศุกร์ (ต้องมีตัวนี้ กราฟถึงจะทำงานได้) */
function countWeekdaysInRange(start, end) {
    let count = 0;
    let cur = new Date(start.getTime());
    while (cur <= end) {
        let day = cur.getDay();
        if (day !== 0 && day !== 6) count++; // ไม่นับเสาร์-อาทิตย์
        cur.setDate(cur.getDate() + 1);
    }
    return count;
}



// ค้นหาในส่วนสคริปต์ (ประมาณบรรทัด 5360)
function attToast(msg, type = 'info') {
    const colors = { success: '#059669', error: '#e11d48', info: '#1e293b' }; // ปรับสี info ให้เข้มตาม CSS
    const bg = colors[type] || colors.info;
    const t = document.createElement('div');
    
    t.innerHTML = msg;
    t.style.cssText = `
        position: fixed; 
        bottom: 20px;     /* แก้จาก top เป็น bottom */
        right: 20px;      /* แก้จาก 15px เป็น 20px */
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

/* Year Selector — ผูกกับ select ที่ id="att-year-select" */
function onAttYearChange(val) {
    attSelectedYear = parseInt(val, 10);
    // อัปเดตข้อความหัวข้อกราฟ
    const label = document.getElementById('att-chart-year-label');
    if (label) label.textContent = attSelectedYear;
    
    // สั่งโหลดข้อมูลและวาด KPI/กราฟ ใหม่ตามปีที่เลือก
    initAttDashboard(); 
}

/**
 * ═══════════════════════════════════════════════════════
 *  WAP Support Line — FULLY FIXED & EDITABLE (V5.9 - Clean)
 * ═══════════════════════════════════════════════════════
 */
const WapSupportLogs = (function () {

    const TABLE = 'support_records';
    let _records    = [];
    let _filtered   = [];
    let _filter     = 'ALL';
    let _search     = '';
    let _user       = '';
    let _alive      = false;
    let _editingId  = null;   // แก้: ประกาศให้ถูกต้อง (เดิมเป็น implicit global)
    let _viewing    = null;   // แก้: ประกาศให้ถูกต้อง (เดิมเป็น implicit global)
    let _fetching   = false;  // กันยิง fetch ซ้อนกัน
    let _fetchToken = 0;      // กัน fetch เก่าที่ resolve ช้ามาทับผลลัพธ์ใหม่กว่า

    let $ = {};

    function _blankRecord() {
        return {
            id: null, problem: '', action: 'Rework', part: '', lot: '',
            ok: 0, ng: 0, report: 'VF', remark: '',
            eventDate: new Date().toISOString().split('T')[0],
            imageUrl: null
        };
    }

    function _cacheDom() {
        $.tbody       = document.getElementById('tableBody');
        $.count       = document.getElementById('caseCount');
        $.search      = document.getElementById('searchInput');
        $.filterGrp   = document.getElementById('filterGroup');
        $.scrollArea  = document.getElementById('tableScrollArea');
        $.contentArea = document.getElementById('line-support-logs-content');
    }

    /* ──────────────────────────────────────────
       CORE LOGIC
       ────────────────────────────────────────── */
    async function _fetch() {
        if (_fetching) return;
        _fetching = true;
        const myToken = ++_fetchToken;

        try {
            const { data, error } = await wapClient
                .from(TABLE)
                .select('*')
                .eq('user_id', _user)
                .order('created_at', { ascending: false });
            if (error) throw error;

            // ถ้ามีรอบใหม่แซงเข้ามาระหว่างรอ หรือโมดูลถูก destroy ไปแล้ว ทิ้งผลลัพธ์รอบนี้
            if (myToken !== _fetchToken || !_alive) return;

            _records = (data || []).map(_fromDb);
            applyDateFilter();
        } catch (e) {
            console.error('[WapSupport] Fetch error:', e);
            if (myToken === _fetchToken && _alive) {
                _records = [];
                _render();
            }
        } finally {
            if (myToken === _fetchToken) _fetching = false;
        }
    }

    function applyDateFilter() {
        if (!_alive) return;
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
        _filtered = temp;
        _render();
    }

    function _render() {
        if (!$.tbody) return;

        if ($.count) $.count.textContent = _filtered.length + ' Case Logs';

        if (_filtered.length === 0) {
            $.tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:80px;color:#cbd5e1;font-weight:600;letter-spacing:0.1em;">NO RECORDS FOUND</td></tr>`;
            return;
        }

        const htmlRows = _filtered.map((item, index) => {
            const total = (Number(item.ok) || 0) + (Number(item.ng) || 0);
            const ngRate = total > 0 ? Math.round((item.ng / total) * 100) : 0;
            const delay = index < 15 ? (index * 0.04).toFixed(2) : 0;

            let statusCls = 'status-sf';
            if (item.report === 'RP') statusCls = 'status-vendor';
            if (item.report === 'RECORDS') statusCls = 'status-ctc';

            return `
                <tr style="animation-delay: ${delay}s">
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
                                <img src="${item.imageUrl}" style="width:100%; height:100%; object-fit:cover;">
                             </span>` :
                            `<span style="color:#e2e8f0; font-size:10px; font-weight:700;">N/A</span>`}
                    </td>
                    <td>
                        <div class="action-btns">
                            <button class="act-btn act-btn-view" onclick="WapSupportLogs._openViewModal('${item.id}')" data-tip="View"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                            <button class="act-btn act-btn-edit" onclick="WapSupportLogs._openFormModal('${item.id}')" data-tip="Edit"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                            <button class="act-btn act-btn-del" onclick="WapSupportLogs._confirmDelete('${item.id}')" data-tip="Delete"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                        </div>
                    </td>
                </tr>`;
        }).join('');

        $.tbody.innerHTML = htmlRows;
    }

    /* ──────────────────────────────────────────
       FORM MODAL (เหลือชุดเดียว — ลบ _renderFormModal /
       _handleImgChange / _handleSubmit เดิมที่เป็น dead code ซ้ำซ้อนออก)
       ────────────────────────────────────────── */
    function _openFormModal(id) {
        _editingId = id || null;

        // แก้: ถ้าหา record ไม่เจอ (เผื่อกรณี id ผิด) ให้ fallback เป็นฟอร์มว่างแทนการพัง
        const r = id ? (_records.find(x => x.id === id) || _blankRecord()) : _blankRecord();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'support-form-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,0.6);backdrop-filter:blur(4px);';

        modal.innerHTML = `
            <div style="background:#fff; border-radius:24px; width:90%; max-width:650px; overflow:hidden; display:flex; flex-direction:column; max-height:92vh; box-shadow:0 25px 50px rgba(0,0,0,0.2); animation:modalPop .25s ease;">
                <div style="background:#161d2f; color:#fff; padding:18px 22px; display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.05em;">
                        ${id ? '📝 แก้ไขรายงานเคลมผลิต' : '✨ บันทึกรายงานเคลมใหม่'}
                    </h3>
                    <button type="button" onclick="this.closest('.modal-overlay').remove()" style="background:none; border:none; color:#64748b; cursor:pointer; font-size:20px;">✕</button>
                </div>
                <form id="sup-form" style="padding:22px; display:flex; flex-direction:column; gap:15px; overflow-y:auto;">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                        <div>
                            <label style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase; display:block; margin-bottom:5px;">📅 วันที่รายงาน</label>
                            <input type="date" name="date" value="${r.eventDate}" class="form-input" style="width:100%;" required>
                        </div>
                        <div>
                            <label style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase; display:block; margin-bottom:5px;">🔧 การแก้ไข (ACTION)</label>
                            <select name="action" class="form-input" style="width:100%;">
                                <option value="Rework" ${r.action==='Rework'?'selected':''}>Rework (ซ่อมแซม/คัดชิ้นดี)</option>
                                <option value="Replace" ${r.action==='Replace'?'selected':''}>Replace (ส่งคืนซัพพลายเออร์)</option>
                                <option value="Sorting" ${r.action==='Sorting'?'selected':''}>Sorting 100%</option>
                                <option value="Use as is" ${r.action==='Use as is'?'selected':''}>Use as is (อนุโลมใช้งาน)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase; display:block; margin-bottom:5px;">📝 รายละเอียดปัญหา</label>
                        <textarea name="problem" class="form-textarea" style="height:80px; width:100%;" required placeholder="ระบุปัญหาที่พบ...">${_esc(r.problem)}</textarea>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                        <div><label style="font-size:10px; font-weight:800; color:#64748b; display:block; margin-bottom:5px;">📦 พาร์ทชิ้นส่วน</label>
                             <input type="text" name="part" value="${_esc(r.part)}" class="form-input" style="width:100%;" placeholder="เช่น Steel part"></div>
                        <div><label style="font-size:10px; font-weight:800; color:#64748b; display:block; margin-bottom:5px;">LOT NO.</label>
                             <input type="text" name="lot" value="${_esc(r.lot)}" class="form-input" style="width:100%;" placeholder="เช่น 52"></div>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:15px;">
                        <div><label style="font-size:10px; font-weight:800; color:#059669; display:block; margin-bottom:5px;">✅ OK</label>
                             <input type="number" name="ok" value="${r.ok}" class="form-input" style="width:100%;"></div>
                        <div><label style="font-size:10px; font-weight:800; color:#ef4444; display:block; margin-bottom:5px;">❌ NG</label>
                             <input type="number" name="ng" value="${r.ng}" class="form-input" style="width:100%;"></div>
                        <div><label style="font-size:10px; font-weight:800; color:#64748b; display:block; margin-bottom:5px;">📋 ประเภท</label>
                            <select name="report" class="form-input" style="width:100%;">
                                <option value="VF" ${r.report==='VF'?'selected':''}>VF Report</option>
                                <option value="RP" ${r.report==='RP'?'selected':''}>RP Report</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style="font-size:10px; font-weight:800; color:#64748b; display:block; margin-bottom:5px;">💬 Remark</label>
                        <input type="text" name="remark" value="${_esc(r.remark)}" class="form-input" style="width:100%;" placeholder="หมายเหตุเพิ่มเติม...">
                    </div>
                    <div>
                        <label style="font-size:10px; font-weight:800; color:#64748b; display:block; margin-bottom:8px;">📸 Evidence Photo</label>
                        <div style="border:2px dashed #cbd5e1; border-radius:16px; background:#f8fafc; position:relative; min-height:120px; display:flex; align-items:center; justify-content:center;">
                            <input type="file" id="img-input" accept="image/*" style="position:absolute; inset:0; opacity:0; cursor:pointer; z-index:2;">
                            <div id="img-preview-area" style="text-align:center;" data-image="${r.imageUrl || ''}">
                                ${r.imageUrl ? `<img src="${r.imageUrl}" style="max-height:100px; border-radius:8px;">` : `<p style="font-size:11px; color:#94a3b8;">คลิกเพื่ออัปโหลดรูปภาพ</p>`}
                            </div>
                        </div>
                    </div>
                    <div style="display:flex; gap:10px; justify-content:flex-end; padding-top:10px;">
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding:10px 25px; border-radius:12px; border:1.5px solid #e2e8f0; background:#fff; font-weight:700; color:#64748b;">ยกเลิก</button>
                        <button type="submit" id="sup-form-submit-btn" style="padding:10px 30px; border-radius:12px; border:none; background:linear-gradient(135deg,#4f46e5,#3b82f6); color:#fff; font-weight:800;">บันทึกข้อมูล</button>
                    </div>
                </form>
            </div>`;

        document.body.appendChild(modal);

        // ตัวแปรเก็บรูปภาพของฟอร์มนี้โดยเฉพาะ (local ต่อ modal ไม่ปนกับ modal อื่น)
        let currentImage = r.imageUrl || null;

        const imgInput = document.getElementById('img-input');
        imgInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                currentImage = ev.target.result;
                document.getElementById('img-preview-area').innerHTML = `<img src="${ev.target.result}" style="max-height:100px; border-radius:8px;">`;
            };
            reader.readAsDataURL(file);
        };

        const formEl = document.getElementById('sup-form');
        const submitBtn = document.getElementById('sup-form-submit-btn');

        formEl.onsubmit = async (e) => {
            e.preventDefault();
            if (submitBtn.disabled) return; // กันกดซ้ำซ้อน
            submitBtn.disabled = true;
            submitBtn.textContent = 'กำลังบันทึก...';

            const fd = new FormData(e.target);
            const payload = {
                id: _editingId || 'SUP-' + Date.now(),
                user_id: S.currentUser,
                problem: fd.get('problem'),
                action: fd.get('action'),
                part: fd.get('part'),
                lot: fd.get('lot'),
                ok_qty: Number(fd.get('ok')),
                ng_qty: Number(fd.get('ng')),
                report_type: fd.get('report'),
                remark: fd.get('remark'),
                event_date: fd.get('date'),
                image_url: currentImage,
                created_at: new Date().toISOString()
            };

            try {
                const { error } = await wapClient.from(TABLE).upsert([payload]);
                if (error) throw error;
                toast('บันทึกข้อมูลสำเร็จ', 'success');
                modal.remove();
                await _fetch();
            } catch (err) {
                console.error('[WapSupport] Save error:', err);
                toast('บันทึกล้มเหลว', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'บันทึกข้อมูล';
            }
        };
    }

    /* ──────────────────────────────────────────
       VIEW MODAL
       ────────────────────────────────────────── */
function _openViewModal(id) {
    const item = _records.find(r => r.id === id);
    if (!item) return;
    _viewing = item;

    const isDark = document.body.classList.contains('dark-mode');
    
    // กำหนดธีมสี
    const theme = {
        overlay: isDark ? 'rgba(2, 6, 23, 0.85)' : 'rgba(15, 23, 42, 0.5)',
        modalBg: isDark ? '#0f172a' : '#ffffff',
        // จุดที่แก้ไข: ใส่สีน้ำเงินเข้มไล่เฉดทั้งในโหมดมืดและโหมดสว่าง
        headerBg: isDark 
            ? 'linear-gradient(180deg, #001529 0%, #002b5c 100%)' // น้ำเงินมิดไนท์สำหรับโหมดมืด
            : 'linear-gradient(180deg, #001c3d 0%, #003366 100%)', // น้ำเงินเข้มจัดสำหรับโหมดสว่าง
        headerText: '#ffffff', // สีขาวทั้งสองโหมดเพื่อให้เด่นบนพื้นน้ำเงิน
        border: isDark ? '#1e293b' : '#e2e8f0',
        mainText: isDark ? '#ffffff' : '#1e293b',
        subText: isDark ? '#94a3b8' : '#64748b',
        remarkBg: isDark ? '#020617' : '#f8fafc',
    };

    const tc = item.report === 'RP' ? 'background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);'
             : item.report === 'VF' ? 'background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2);'
             : 'background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2);';

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:${theme.overlay};backdrop-filter:blur(8px);animation:fadeIn .2s ease`;
    
    modal.innerHTML = `
    <div style="background:${theme.modalBg}; border-radius:12px; box-shadow:0 20px 50px rgba(0,0,0,0.4); width:90%; max-width:920px; overflow:hidden; border:1px solid ${theme.border}; animation:modalPop .2s ease; display:flex; flex-direction:column; max-height:95vh">
        
        <!-- Blue Header for both Dark & Light Mode -->
        <div style="background:${theme.headerBg}; padding:10px 20px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,0,0,0.2);">
            <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:10px; font-weight:800; letter-spacing:.05em; color:${theme.headerText}; text-transform:uppercase">🔍 CASE RECORD</span>
                <span style="color:rgba(255,255,255,0.5); font-size:10px; font-weight:500;">#${item.id}</span>
            </div>
            <button onclick="this.closest('.modal-overlay').remove()" style="background:none; border:none; color:rgba(255,255,255,0.7); cursor:pointer; font-size:18px; line-height:1;">✕</button>
        </div>

        <div style="flex:1; overflow-y:auto; scrollbar-width: none;">
            
            <!-- Summary Info -->
            <div style="display:flex; flex-wrap:wrap; gap:12px; justify-content:space-between; align-items:center; padding:15px 20px;">
                <div style="flex:1; min-width:280px;">
                    <p style="font-size:13px; font-weight:600; color:${theme.mainText}; line-height:1.4; margin:0 0 10px 0;">
                        On <span style="color:#3b82f6">${item.eventDate || '-'}</span> OSA inform quality problem about <span style="color:#3b82f6">${_esc(item.part)}</span> found defect <span style="color:#ef4444">${_esc(item.problem)}</span>
                    </p>
                    <div style="display:flex; gap:6px;">
                        <span style="background:${isDark?'#1e293b':'#f1f5f9'}; color:${theme.subText}; border:1px solid ${theme.border}; border-radius:4px; padding:3px 8px; font-size:9px; font-weight:700">📅 ${item.eventDate || '-'}</span>
                        <span style="background:${isDark?'#1e293b':'#f1f5f9'}; color:${theme.subText}; border:1px solid ${theme.border}; border-radius:4px; padding:3px 8px; font-size:9px; font-weight:700">🔧 ${_esc(item.action)}</span>
                        <span style="border-radius:4px; padding:3px 8px; font-size:9px; font-weight:800; ${tc}">${item.report}</span>
                    </div>
                </div>

                <!-- KPI Boxes -->
                <div style="display:flex; gap:8px;">
                    <div style="text-align:center; border:1px solid #10b981; border-radius:8px; padding:5px 10px; min-width:55px;">
                        <div style="font-size:8px; font-weight:800; color:#10b981;">OK</div>
                        <div style="font-size:16px; font-weight:900; color:#10b981;">${item.ok.toLocaleString()}</div>
                    </div>
                    <div style="text-align:center; border:1px solid #ef4444; border-radius:8px; padding:5px 10px; min-width:55px;">
                        <div style="font-size:8px; font-weight:800; color:#ef4444;">NG</div>
                        <div style="font-size:16px; font-weight:900; color:#ef4444;">${item.ng.toLocaleString()}</div>
                    </div>
                    <div style="text-align:center; border:1px solid #3b82f6; border-radius:8px; padding:5px 10px; min-width:55px;">
                        <div style="font-size:8px; font-weight:800; color:#3b82f6;">TOTAL</div>
                        <div style="font-size:16px; font-weight:900; color:#3b82f6;">${(item.ok + item.ng).toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <!-- Image Strip (Prevents distortion) -->
            <div style="width:100%; display:flex; gap:4px; background:${isDark?'#020617':'#f1f5f9'}; border-top:1px solid ${theme.border}; border-bottom:1px solid ${theme.border}; overflow-x:auto; padding:4px; scrollbar-width:none;">
                ${item.imageUrl 
                    ? `<img src="${item.imageUrl}" style="height:200px; width:auto; flex-shrink:0; object-fit:contain; border-radius:4px; background:#000;">` 
                    : ''
                }
                <img src="${item.imageUrl}" style="height:200px; width:auto; flex-shrink:0; object-fit:contain; border-radius:4px; background:#000;">
                <img src="${item.imageUrl}" style="height:200px; width:auto; flex-shrink:0; object-fit:contain; border-radius:4px; background:#000;">
            </div>

            <!-- Remark (Compact) -->
            <div style="padding:15px 20px;">
                <div style="background:${theme.remarkBg}; border:1px solid ${theme.border}; border-left:3px solid #f59e0b; padding:10px 15px; border-radius:8px;">
                    <span style="font-size:8px; font-weight:900; color:#f59e0b; text-transform:uppercase; display:block; margin-bottom:4px;">📝 REMARK / NOTE</span>
                    <p style="font-size:12px; color:${theme.mainText}; margin:0; font-weight:500; line-height:1.4; font-style: italic;">
                        "${_esc(item.remark) || 'No additional remarks found.'}"
                    </p>
                </div>
            </div>

            <!-- Slim Footer -->
            <div style="padding:8px 20px; border-top:1px solid ${theme.border}; background:${isDark?'#020617':'#f8fafc'}; display:flex; align-items:center; justify-content:space-between">
                <span style="font-size:8px; font-weight:700; color:${theme.subText}; text-transform:uppercase">Record Initialized By</span>
                <span style="font-size:9px; font-weight:800; color:${theme.mainText}">${(item._user || 'NATTHAWUT.CHAISING').split('@')[0].toUpperCase()}</span>
            </div>
        </div>
    </div>`;
    
    document.body.appendChild(modal);
}

    function _confirmDelete(id) {
        if (confirm("ยืนยันการลบ?")) _doDelete(id);
    }

    async function _doDelete(id) {
        try {
            await wapClient.from(TABLE).delete().eq('id', id);
            toast('ลบสำเร็จ', 'success');
            await _fetch();
        } catch (e) {
            console.error('[WapSupport] Delete error:', e);
            toast('ลบไม่สำเร็จ', 'error');
        }
    }

    function _fromDb(r) {
        return {
            id: r.id, problem: r.problem || '', action: r.action || 'Rework',
            part: r.part || '-', lot: r.lot || '-', ok: Number(r.ok_qty) || 0,
            ng: Number(r.ng_qty) || 0, report: r.report_type || 'VF',
            remark: r.remark || '', eventDate: r.event_date || '', imageUrl: r.image_url || null, _user: r.user_id
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
        // กันเคส init ถูกเรียกซ้ำด้วย user คนเดิมติดๆ กัน (เช่นคลิกเมนูรัวๆ)
        if (_alive && _user === email && _fetching) return;

        _user = email;
        _alive = true;
        _cacheDom();
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
                _filter = btn.getAttribute('data-filter');
                applyDateFilter();
            };
        }
    }

    function destroy() {
        _alive = false;
        if ($.tbody) $.tbody.innerHTML = '';
    }

    return {
        init, destroy, applyDateFilter,
        _openViewModal,
        _openFormModal,
        _confirmDelete
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
                toolbar: { show: false },
                // --- [1. อนิเมชั่นแบบพริ้วไหว] ---
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 1300, // ช้าลงเล็กน้อยเพื่อให้เห็นการวาดเส้นที่นุ่มนวล
                    animateGradually: { enabled: true, delay: 150 },
                    dynamicAnimation: { enabled: true, speed: 450 }
                },
                sparkline: { enabled: false }
            },
            colors: ['#f59e0b'],
            // ปรับเส้นให้หนาและมน (Round) ขึ้น
            stroke: { curve: 'smooth', width: 4, lineCap: 'round' },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.4, // ไล่เฉดสีจากส้มจาง
                    opacityTo: 0.02,  // ไปจนถึงเกือบใส
                    stops: [0, 90, 100]
                }
            },
            // --- [2. ลบเส้นตารางพื้นหลังออก] ---
            grid: {
                show: false, // ปิดเส้นตารางทั้งหมด
                padding: { left: 10, right: 10, top: 0, bottom: 0 }
            },
            dataLabels: { enabled: false },
            markers: { size: 0, hover: { size: 5, strokeWidth: 3 } },
            xaxis: { 
                categories: months,
                axisBorder: { show: false }, // ลบเส้นขอบแกน X
                axisTicks: { show: false },  // ลบขีดติ๊กแกน X
                labels: { 
                    style: { colors: '#94a3b8', fontSize: '10px', fontWeight: 600 } 
                }
            },
            yaxis: { 
                show: false // ซ่อนแกน Y เพื่อความคลีน (เพราะมีเลขกำกับบนกราฟหรือ Tooltip อยู่แล้ว)
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

        // 2. วาด HTML โดยกำหนดให้แถวเริ่มต้นที่สถานะซ่อน (Opacity 0 และเลื่อนไปทางซ้ายเล็กน้อย)
        tbody.innerHTML = _filteredRecords.map(r => `
            <tr class="s5-table-row border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors opacity-0" style="transform: translateX(-10px)">
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
                    <button onclick="Wap5SExcellence.remove('${r.id}')" class="text-slate-200 hover:text-rose-500 transition-all p-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                </td>
            </tr>
        `).join('');

        // 3. รันอนิเมชั่น GSAP ให้แถวทยอยเลื่อนเข้ามา (Stagger)
        requestAnimationFrame(() => {
            gsap.killTweensOf(".s5-table-row"); // ล้างอนิเมชั่นเก่าก่อน
            
            gsap.to(".s5-table-row", {
                opacity: 1,
                x: 0,
                duration: 0.4,
                stagger: 0.04, // ทยอยโผล่มาทีละ 0.04 วินาที
                ease: "power2.out",
                clearProps: "transform" // ล้าง transform ทิ้งหลังจบเพื่อให้ hover ทำงานปกติ
            });
        });
    }

async function submit() {
    // 1. ดึงค่าจาก Element ต่างๆ
    const area = document.getElementById('s5-f-area').value.trim();
    const pts = document.getElementById('s5-f-points').value;
    const monthValue = document.getElementById('s5-f-month').value; // ค่าจาก input type="month" (จะได้ YYYY-MM)
    const detail = document.getElementById('s5-f-detail').value.trim();
    const auditor = document.getElementById('s5-f-auditor').value.trim();

    // 2. ตรวจสอบความครบถ้วน
    if (!area || !pts || !monthValue || !auditor) {
        toast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
        return;
    }

    // 3. ปรับ Payload ให้ชื่อ Key ตรงกับคอลัมน์ใน Supabase (ตามรูปภาพ DB)
    const payload = {
        id: 'S5-' + Date.now(),
        user_id: S.currentUser,
        area: area,               // ตรงกับคอลัมน์ area
        issue_count: Number(pts), // ตรงกับคอลัมน์ issue_count
        detail: detail,           // แก้ไขจาก details -> detail (ตาม DB)
        owner: auditor,           // แก้ไขจาก auditor -> owner (ตาม DB)
        month: monthValue,        // แก้ไขจาก date -> month (ตาม DB)
        // date: null             // หรือไม่ต้องส่งไปเลยถ้าใน DB เป็น NULL อยู่แล้ว
    };

    try {
        // 4. บันทึกลงตาราง
        const { error } = await wapClient.from(TABLE).insert([payload]);
        if (error) throw error;
        
        // 5. ล้างฟอร์ม (Reset Form)
        document.getElementById('s5-f-area').value = '';
        document.getElementById('s5-f-points').value = '';
        document.getElementById('s5-f-detail').value = '';
        // ไม่ต้องล้างชื่อผู้ตรวจและเดือน เพื่อความสะดวกในการคีย์ต่อเนื่อง (ถ้าต้องการ)

        // 6. อัปเดตข้อมูลที่หน้าจอ
        await fetchRecords();
        toast('บันทึกข้อมูล 5S สำเร็จ', 'success');
    } catch (e) {
        console.error('Submit 5S Error:', e);
        toast('เกิดข้อผิดพลาด: ' + (e.message || 'บันทึกล้มเหลว'), 'error');
    }
}

   async function remove(id) {
        if (S.userRole === 'supervisor') { toast('โหมดอ่านอย่างเดียว', 'info'); return; }
        if (!confirm('ยืนยันการลบ?')) return;
        try {
            await wapClient.from(TABLE).delete().eq('id', id);
            await fetchRecords();
            toast('ลบเรียบร้อย', 'success');
        } catch (e) { console.error(e); }
    }

    return { init, fetchRecords, remove, applyDateFilter,submit  };
})();

function renderAll() {
    updateKPIs();
    renderChart();
    renderRanking();
    renderTable();

    // >>> [เพิ่ม GSAP Stagger สำหรับหน้า 5S] <<<
    if (!$id('five-s-content').classList.contains('hidden-view')) {
        gsap.killTweensOf(".s5-kpi-card, .chart-card, .s5-ranking-card, .form-container, .table-card");
        
        gsap.fromTo(".s5-kpi-card, .chart-card, .s5-ranking-card, .form-container, .table-card", 
            { opacity: 0, y: 12 },
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
        await fetchRecords();
    }

    async function fetchRecords() {
        const targetUser = S.userRole === 'supervisor' ? S.viewingUser : S.currentUser;
        if (!navigator.onLine) return;
        try {
            const { data, error } = await wapClient
                .from(TABLE)
                .select('*')
                .eq('user_id', targetUser)
                .order('skill_value', { ascending: false }); // แก้จาก value เป็น skill_value

            if (error) throw error;
            _records = data || [];
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
                            <button onclick="WapSkillMatrix.remove('${r.skill_name}')" 
                                    class="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all duration-200">
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

    // --- 3. Donut Chart: วงแหวนวิเคราะห์สัดส่วนทักษะรายบุคคล ---
    function renderDonut() {
        const chartEl = document.getElementById('sm-donut-chart');
        const legendEl = document.getElementById('sm-donut-legend');
        const count = _records.length;
        
        // คำนวณค่าเฉลี่ยทักษะทั้งหมด
        const avg = count > 0 ? Math.round(_records.reduce((sum, r) => sum + (r.skill_value || 0), 0) / count) : 0;
        
        if (!chartEl) return;
        if (_charts.donut) _charts.donut.destroy();

        // 1. แยกกลุ่มข้อมูลตามระดับความเชี่ยวชาญ
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

        // 2. ตั้งค่ากราฟ ApexCharts (สไตล์ Modern Donut)
        _charts.donut = new ApexCharts(chartEl, {
            series: series,
            labels: labels,
            chart: { 
                type: 'donut', 
                height: '100%', 
                animations: { enabled: true, speed: 1000, animateGradually: { enabled: true, delay: 150 } } 
            },
            colors: colors,
            stroke: { width: 3, colors: ['#ffffff'] }, // เส้นขอบสีขาวช่วยให้ดูหรูขึ้น
            plotOptions: {
                pie: {
                    donut: {
                        size: '82%', // วงแหวนบางลงเพื่อให้ดูโปร่งและล้ำสมัย
                        labels: {
                            show: true,
                            name: { show: true, fontSize: '11px', fontWeight: 700, color: '#94a3b8', offsetY: -10 },
                            value: { 
                                show: true, fontSize: '24px', fontWeight: 900, color: '#1e293b', offsetY: 10,
                                formatter: (val) => val
                            },
                            total: { 
                                show: true, label: 'AVERAGE', color: '#64748b', fontSize: '9px', fontWeight: 800,
                                formatter: () => avg + '%' // แสดงค่าเฉลี่ยรวมตรงกลาง
                            }
                        }
                    }
                }
            },
            dataLabels: { enabled: false }, // ปิดตัวเลข % บนตัวกราฟเพื่อให้ดูคลีน
            legend: { show: false }, // ปิด Legend มาตรฐาน เราจะใช้ Custom Pills ด้านล่างแทน
            tooltip: { 
                theme: 'dark',
                y: { formatter: (val) => val + " ทักษะ" }
            }
        });
        _charts.donut.render();

        // 3. สร้าง Custom Legend Pills (แคปซูลข้อมูล)
        if (legendEl) {
            legendEl.innerHTML = labels.map((l, i) => {
                const total = series.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((series[i] / total) * 100).toFixed(0) : 0;
                return `
                    <div class="legend-pill-cyber flex items-center justify-between p-2 rounded-xl transition-all duration-300 hover:shadow-md border border-slate-50">
                        <div class="flex items-center gap-2">
                            <!-- จุดสีเรืองแสง (Glow Dot) -->
                            <div class="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style="background:${colors[i]}; color:${colors[i]}"></div>
                            <div class="flex flex-col leading-none">
                                <span class="text-[9px] font-black text-slate-500 uppercase tracking-wider">${l}</span>
                                <span class="text-[8px] font-bold text-slate-300">${pct}% Share</span>
                            </div>
                        </div>
                        <span class="text-[12px] font-black text-slate-700">${series[i]}</span>
                    </div>
                `;
            }).join('');
        }
    }

    async function remove(skillName) {
        if (!confirm('ลบทักษะนี้?')) return;
        try {
            await wapClient.from(TABLE).delete().eq('user_id', S.currentUser).eq('skill_name', skillName);
            await fetchRecords();
            toast('ลบทักษะเรียบร้อย', 'success');
        } catch (e) { console.error(e); }
        
    }

    async function clearAll() {
        if (!confirm('ยืนยันล้างข้อมูลทั้งหมด?')) return;
        try {
            await wapClient.from(TABLE).delete().eq('user_id', S.currentUser);
            await fetchRecords();
            toast('ล้างข้อมูลสำเร็จ', 'success');
        } catch (e) { console.error(e); }
    }

    return { init,  remove, clearAll };
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
function triggerGlobalRefresh() {
    const titleEl = $id('header-title');
    if (!titleEl) return;

    // ทำความสะอาดข้อความ และรองรับการเช็คคำสำคัญ (Keyword) เพื่อให้ทำงานได้ทั้ง 2 ภาษา
    const title = titleEl.textContent.trim().toUpperCase();
    
    const targetUser = S.userRole === 'supervisor' ? S.viewingUser : S.currentUser;
    if (!targetUser) return;

    // 1. อัปเดตข้อมูลพนักงานใน Sidebar / User Hub
    const displayName = targetUser.split('@')[0].replace(/\./g, ' ').toUpperCase();
    if ($id('user-display-name')) {
        if (S.userRole === 'supervisor' && S.viewingUser !== S.currentUser) {
            $id('user-display-name').style.color = "#f59e0b"; 
            $id('user-display-name').innerHTML = `${displayName} <span class="text-[8px] text-rose-500 font-black tracking-tighter">(VIEWING)</span>`;
            $id('user-avatar').style.background = "linear-gradient(135deg, #f59e0b, #d97706)";
        } else {
            $id('user-display-name').style.color = ""; // คืนค่าสีเดิม
            $id('user-display-name').textContent = displayName;
            $id('user-avatar').style.background = "linear-gradient(135deg, #6366f1, #4338ca)";
        }
    }
    if ($id('user-display-email')) $id('user-display-email').textContent = targetUser;
    if ($id('user-avatar')) $id('user-avatar').textContent = displayName.charAt(0);

    // 2. สั่งรีเฟรชเฉพาะโมดูลที่กำลังเปิดอยู่ (เช็ค Keyword ทั้งอังกฤษและไทยพร้อมกันทุกเงื่อนไข เพื่อรองรับ i18n แบบสมบูรณ์)
    console.log(`[System] Refreshing active module: ${title} for user: ${targetUser}`);

    const isDashboard   = title.includes('DASHBOARD') || title.includes('แดชบอร์ด');
    const isClaimWord   = title.includes('CLAIM')     || title.includes('บันทึกเคลม') || title.includes('บันทึก');
    const isPartWord    = title.includes('PART')      || title.includes('บันทึกเคลม') || title.includes('บันทึก');
    const isExec        = title.includes('EXEC')      || title.includes('สรุปงาน');
    const isAttendance  = title.includes('ATTENDANCE') || title.includes('DAILY') || title.includes('รายงาน') || title.includes('เข้างาน');
    const isSupport     = title.includes('SUPPORT')   || title.includes('สนับสนุน');
    const is5S          = title.includes('5S')        || title.includes('ตรวจสอบ');
    const isSkill       = title.includes('SKILL')     || title.includes('ทักษะ');
    const isOT          = title.includes('OT')        || title.includes('ล่วงเวลา');
    const isSpecial     = title.includes('SPECIAL')   || title.includes('ภารกิจ');

    if (isDashboard && isClaimWord) {
        // หน้า Dashboard หลัก (Part Line Claim Dashboard)
        refreshClaimDashboard(); 
    } 
    else if (isPartWord && !isDashboard) {
        // หน้าตาราง Part Claim (ไม่ใช่หน้า Dashboard)
        renderTable(); 
    }
    else if (isExec) {
        // หน้าผู้บริหาร
        initExecDashboard();
    }
    else if (isAttendance) {
        // หน้าประวัติการลา / รายงานประจำวัน
        initAttDashboard();
    }
    else if (isSupport) {
        // หน้า Support Line Logs
        WapSupportLogs.init(targetUser);
    }
    else if (is5S) {
        // หน้า 5S Excellence
        Wap5SExcellence.fetchRecords();
    }
    else if (isSkill) {
        // หน้า Skill Matrix
        WapSkillMatrix.init();
    }
    else if (isOT) {
        // หน้า OT Management
        WapOTManagement.fetchRecords();
    }
    else if (isSpecial) {
        // หน้า Special Jobs
        WapSpecialJobs.init();
    }
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
function calcHours() {
    const startEl = document.getElementById('ot-start');
    const endEl   = document.getElementById('ot-end');
    const breakEl = document.getElementById('ot-f-break');
    const outEl   = document.getElementById('ot-f-computed');

    if (!startEl || !endEl) {
        console.warn('[OT] ไม่พบ input เวลา OT ในหน้านี้ — ข้าม calcHours');
        return { raw: 0, actual: 0 };
    }

    const start = startEl.value.trim();
    const end = endEl.value.trim();
    const breakMin = breakEl ? (parseInt(breakEl.value) || 0) : 0;

    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    if ((!timeRegex.test(start)) || (!timeRegex.test(end) && end !== '24:00' && end !== '00:00')) {
        if (outEl) outEl.textContent = '0.00';
        return { raw: 0, actual: 0 };
    }

    const [sh, sm] = start.split(':').map(Number);
    let [eh, em] = end.split(':').map(Number);
    if (eh === 0 && em === 0) eh = 24; // เที่ยงคืน = 24:00

// ใน WapOTManagement.calcHours
let mins = (eh * 60 + em) - (sh * 60 + sm);
if (mins < 0) mins += 1440; // เพิ่ม 24 ชั่วโมง (1440 นาที) ถ้าค่าติดลบ

    const rawHours = mins / 60;
    const actualHours = Math.max(0, (mins - breakMin) / 60);

    if (outEl) outEl.textContent = actualHours.toFixed(2);

    return { raw: +rawHours.toFixed(2), actual: +actualHours.toFixed(2) };
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

    async function save() {
        if (!hasWriteAccess()) return; // ป้องกันทันที
        const timeData = calcHours();
        const job = $id('ot-f-job').value.trim();
        const typeRate = $id('ot-f-type').value;
        const btn = $id('ot-save-btn');

        if (!navigator.onLine) { toast('📶 ออฟไลน์: บันทึกไม่ได้', 'error'); return; }
        if (timeData.actual <= 0) { toast('กรุณาระบุเวลาทำงานให้ถูกต้อง', 'error'); return; }
        if (!job) { toast('กรุณากรอกรายละเอียดงาน', 'error'); return; }
        if (!typeRate) { toast('กรุณาเลือกประเภท (Multiplier)', 'error'); return; }

        btn.disabled = true;
        btn.textContent = 'กำลังบันทึก...';

        // Mapping ข้อมูลให้ตรงกับคอลัมน์ใน Supabase ที่คุณระบุ
        const payload = {
            id: 'OT-' + Date.now(),
            user_id: S.currentUser,
            date: $id('ot-f-date').value,
start_time: $id('ot-start').value,   // เวลาเริ่ม
end_time: $id('ot-end').value,       // เวลาสิ้นสุด       // เวลาสิ้นสุด
            break_min: parseInt($id('ot-f-break').value) || 0, // เวลาพัก (นาที)
            type_rate: parseFloat(typeRate),       // ตัวคูณ (1.5, 1.0, 3.0)
            job_name: job,                         // รายละเอียดงาน
            actual_hours: timeData.actual,         // ชั่วโมงสุทธิ (หักพักแล้ว)
            calc_hours: timeData.raw,               // ชั่วโมงรวม (ยังไม่หักพัก)
            full_timestamp: new Date().toISOString() // วันเวลาที่บันทึก
        };

        try {
            const { error } = await wapClient.from(TABLE).insert([payload]);
            if (error) throw error;

            toast('✅ บันทึกข้อมูล OT เรียบร้อย', 'success');
            
const clearField = (id, val) => { const el = $id(id); if (el) el.value = val; };

// ล้างฟอร์ม
clearField('ot-f-date', '');
clearField('ot-f-job', '');
clearField('ot-start', '');
clearField('ot-end', '');
clearField('ot-f-break', '0');
clearField('ot-f-type', '');

// ล้างสีเขียวทุกฟิลด์ในหน้า
document.querySelectorAll('.form-input.valid, .form-textarea.valid, .form-select.valid')
    .forEach(el => el.classList.remove('valid'));
const computed = $id('ot-f-computed');
if (computed) computed.textContent = '0.00';
            await fetchRecords();
        } catch (e) {
            console.error(e);
            toast('❌ เกิดข้อผิดพลาดในการบันทึก', 'error');
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

// --- 2. กราฟวงกลม Distribution (ออกแบบแนว Sports Gauge) ---
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
        animations: { 
            enabled: true, 
            speed: 1500, // วิ่งช้าลงนิดนึงเพื่อโชว์จังหวะการกวาด
            animateGradually: { enabled: true, delay: 200 }
        }
    },
    // พาเลทสี Cyber Neon (Electric Blue, Acid Green, Lava Orange)
    colors: ['#00e5ff', '#39ff14', '#ff9100'],
    stroke: { 
        width: 3, 
        colors: ['#fff'], // เส้นขอบสีขาวช่วยให้สีนีออนดูเด่นขึ้น
        lineCap: 'round'  // ปลายโค้งมนเหมือนเข็มไมล์
    },
    plotOptions: {
        pie: {
            startAngle: -90, // เริ่มที่ตำแหน่ง 9 นาฬิกา
            endAngle: 90,   // จบที่ตำแหน่ง 3 นาฬิกา (กลายเป็นครึ่งวงกลมบน)
            offsetY: 25,     // เลื่อนลงมาให้สมดุลกับพื้นที่
            donut: {
                size: '82%', // วงแหวนบางลงเพื่อให้ดูเหมือนมาตรวัดดิจิทัล
                labels: {
                    show: true,
                    name: {
                        show: true,
                        fontSize: '11px',
                        fontWeight: 900,
                        color: '#94a3b8',
                        offsetY: -12
                    },
                    value: {
                        show: true,
                        fontSize: '32px', // ตัวเลขใหญ่เหมือนเลขความเร็ว
                        fontWeight: 900,
                        color: '#1e293b',
                        offsetY: 8,
                        formatter: (v) => v
                    },
                    total: {
                        show: true,
                        label: 'TOTAL TIMES', // อารมณ์นับรอบเครื่อง
                        fontSize: '9px',
                        fontWeight: 950,
                        color: '#64748b',
                        formatter: () => totalSessions
                    }
                }
            }
        }
    },
    fill: {
        type: 'gradient',
        gradient: {
            shade: 'dark',
            type: "horizontal",
            shadeIntensity: 0.1,
            // ผสมสี Metallic ให้ดูพรีเมียม
            gradientToColors: ['#0082ff', '#00f260', '#ffc107'], 
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 100]
        }
    },
    dataLabels: {
        enabled: true,
        formatter: (val) => val.toFixed(0) + "%",
        style: {
            fontSize: '10px',
            fontWeight: 900,
            colors: ['#fff']
        },
        dropShadow: { enabled: true, blur: 2, opacity: 0.5 }
    },
    legend: { 
        show: true,
        position: 'bottom',
        offsetY: -10,
        fontSize: '11px',
        fontWeight: 700,
        markers: { radius: 12, width: 10, height: 10 },
        labels: { colors: '#64748b' }
    },
    tooltip: { 
        theme: 'dark',
        y: { formatter: (v) => v + " รายการ" }
    }
});

_charts.dist.render();
    }


function renderTable() {
    const tbody = $id('ot-table-body');
    if (!tbody) return;
    
    $id('ot-hist-count').textContent = `${_filteredRecords.length} รายการ`;
    
    // วาด HTML โดยตั้งค่าเริ่มต้นให้ซ่อนและเลื่อนลงล่างเล็กน้อย
    tbody.innerHTML = _filteredRecords.slice(0, 15).map(r => `
        <tr class="ot-table-row border-b border-slate-50 opacity-0" style="transform: translateY(10px)">
            <td class="py-2.5 px-3 font-mono text-[9px] text-slate-400">${r.date}</td>
            <td class="py-2.5 px-2 font-bold text-slate-700 uppercase" style="font-size:10px;">${r.job_name}</td>
            <td class="py-2.5 px-2 text-center text-blue-600 font-black" style="font-size:12px;">${parseFloat(r.actual_hours).toFixed(2)}</td>
            <td class="py-2.5 px-3 text-right">
                <button onclick="WapOTManagement.remove('${r.id}')" class="text-slate-200 hover:text-rose-500 transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
            </td>
        </tr>
    `).join('');

    // สั่งให้แถวทยอยเลื่อนขึ้น (Stagger)
    requestAnimationFrame(() => {
        gsap.to(".ot-table-row", {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.03,
            ease: "power2.out",
            clearProps: "transform"
        });
    });
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
        if (!confirm('ลบข้อมูล OT นี้?')) return;
        try {
            await wapClient.from(TABLE).delete().eq('id', id);
            await fetchRecords();
            toast('ลบเรียบร้อย', 'success');
        } catch (e) { toast('ลบไม่สำเร็จ', 'error'); }
    }

    function updateTarget(val) {
        _targetValue = parseFloat(val) || 100;
        updateUI();
    }

    return { init, fetchRecords, remove, applyDateFilter, updateTarget, calcHours: function(){
        // เรียกใช้ฟังก์ชันคำนวณที่ทำไว้เดิม
        const start = $id('ot-start').value;
        const end = $id('ot-end').value;
        const brk = parseInt($id('ot-f-break').value) || 0;
        if(start && end) {
            const [sh, sm] = start.split(':').map(Number);
            let [eh, em] = end.split(':').map(Number);
            if(eh < sh) eh += 24;
            let mins = (eh * 60 + em) - (sh * 60 + sm);
            const actual = Math.max(0, (mins - brk) / 60);
            $id('ot-f-computed').textContent = actual.toFixed(2);
            return { actual };
        }
        return { actual: 0 };
    }, save: async function() {
        const timeData = this.calcHours();
        const job = $id('ot-f-job').value.trim();
        const typeRate = $id('ot-f-type').value;
        if (timeData.actual <= 0 || !job || !typeRate) { toast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error'); return; }

        const payload = {
            id: 'OT-' + Date.now(),
            user_id: S.currentUser,
            date: $id('ot-f-date').value,
            start_time: $id('ot-start').value,
            end_time: $id('ot-end').value,
            break_min: parseInt($id('ot-f-break').value) || 0,
            type_rate: parseFloat(typeRate),
            job_name: job,
            actual_hours: timeData.actual,
            full_timestamp: new Date().toISOString()
        };

        try {
            await wapClient.from(TABLE).insert([payload]);
            toast('บันทึก OT สำเร็จ', 'success');
            $id('ot-f-job').value = '';
            $id('ot-start').value = '';
            $id('ot-end').value = '';
            await fetchRecords();
        } catch (e) { toast('บันทึกล้มเหลว', 'error'); }
    }};
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
        <tr>
            <td class="text-center font-bold text-slate-300">${i+1}</td>
            <td>
                <div class="flex flex-col">
                    <span class="text-[11.5px] font-black text-slate-700 leading-tight uppercase">${r.project}</span>
                    <span class="text-[9.5px] text-slate-400 font-bold italic mt-1">${r.result || 'Outcome Pending...'}</span>
                </div>
            </td>
            <td class="text-center font-mono text-[10px] text-slate-400 font-bold">${r.date}</td>
            <td class="text-center text-[10px] font-black text-blue-600 uppercase">${r.assigned_by}</td>
            <td class="text-center">
                <span class="px-3 py-1 rounded-full text-[8.5px] font-black ${hasResult ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}">
                    ${hasResult ? 'MISSION COMPLETED' : 'IN PROGRESS'}
                </span>
            </td>
            <td class="text-right">
                <button onclick="WapSpecialJobs.remove('${r.id}')" class="text-slate-200 hover:text-rose-500 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
            </td>
        </tr>
    `}).join('');


    // สั่งรันอนิเมชั่นให้แถวทยอยเลื่อนเข้ามา (Stagger)
    requestAnimationFrame(() => {
        gsap.to(".sj-table-row", {
            opacity: 1,
            x: 0,
            duration: 0.4,
            stagger: 0.03, // ความเร็วในการทยอยเลื่อน
            ease: "power2.out",
            clearProps: "transform"
        });
    });
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
            
            // ล้างฟอร์ม
            document.getElementById('sj-f-project').value = '';
            document.getElementById('sj-f-result').value = '';
            
            await fetchRecords(); // โหลดข้อมูลใหม่และอัปเดตจอ
        } catch (e) {
            if (typeof toast === 'function') toast('บันทึกล้มเหลว: ' + e.message, 'error');
        }
    }

    // 8. ฟังก์ชันลบข้อมูล
    async function remove(id) {
        if (!confirm('ยืนยันการลบข้อมูลภารกิจนี้?')) return;
        try {
            const { error } = await wapClient.from(TABLE).delete().eq('id', id);
            if (error) throw error;
            if (typeof toast === 'function') toast('ลบข้อมูลเรียบร้อย', 'info');
            await fetchRecords();
        } catch (e) { 
            if (typeof toast === 'function') toast('ลบไม่สำเร็จ', 'error'); 
        }
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


function updateUI() {
    const targetInput = $id('ot-target-input');
    if (!targetInput) return;

    const targetVal = parseFloat(targetInput.value) || 100;
    if (!_charts.trend) return;

    // ① คำนวณ yMax และ yStep ใหม่ แบบเดียวกับ renderCharts
    const yMax = Math.max(targetVal + 20, 140);
    const yStep = calcYStep(yMax);

    // ② อัปเดตพร้อมกันทีเดียว: เส้นแดง + แกน Y + กริด
    _charts.trend.updateOptions({
        annotations: {
            yaxis: [{
                y: targetVal,
                strokeDashArray: 6,
                borderColor: '#ef4444',
                borderWidth: 2.5,
                label: {
                    text: 'TARGET: ' + targetVal + ' ชม.',
                    textAnchor: 'end',
                    position: 'right',
                    offsetX: -10,
                    offsetY: -4,
                    style: {
                        background: '#ffffffdd',
                        color: '#ef4444',
                        fontSize: '12px',
                        fontWeight: 900,
                        borderColor: '#ef4444',
                        borderWidth: 1,
                        padding: { left: 8, right: 8, top: 2, bottom: 2 }
                    }
                }
            }]
        },
        yaxis: {
            min: 0,
            max: yMax,
            stepSize: yStep,
            forceNiceScale: false,
            tickAmount: yMax / yStep,
            labels: {
                formatter: (val) => Number.isInteger(val) ? val + ' ชม.' : Math.round(val) + ' ชม.',
                style: { fontSize: '11px', fontWeight: 600, colors: '#94a3b8' },
                offsetX: -5,
                minWidth: 50,
                maxWidth: 55
            },
            axisBorder: { show: false },
            axisTicks: { show: true, borderType: 'solid', color: '#334155', height: 6, offsetX: -2 }
        },
        grid: {
            borderColor: '#334155',
            strokeDashArray: 0,
            position: 'back',
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } },
            tickAmount: yMax / yStep
        }
    }, false, false, function() {
        // ③ redraw ใหม่ทั้งหมดหลัง update เสร็จ ไม่ใช้ animation จะได้ไม่กระพริบ
    });
}

// ผูก event ครั้งเดียว
document.addEventListener('ot-target-input', () => {
    const targetInput = $id('ot-target-hours');
    if (targetInput) {
        targetInput.addEventListener('input', updateUI);
        targetInput.addEventListener('change', updateUI);
    }
            if (typeof WapOTManagement !== 'undefined') {
            WapOTManagement.applyDateFilter();
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
        <div class="vf-feed-card relative bg-white border border-slate-100 rounded-xl p-4 shadow-sm mb-3 opacity-0" style="transform: translateY(20px)">
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
                <span>📅 ${r.date}</span>
                <span>🕒 ${r.shift.replace('SHIFT ', '')}</span>
                <span>📍 L:${escapeHtml(r.line)}</span>
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
    gsap.to(".vf-feed-card", {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
    });
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
    if (S.userRole === 'supervisor') return toast("ไม่มีสิทธิ์ลบข้อมูล", "error");
    if (S.records.length === 0) return toast("ไม่มีข้อมูลให้ลบ", "info");
    if (confirm("⚠️ ต้องการลบข้อมูล 'ทั้งหมด' ของคุณหรือไม่?")) {
        const check = prompt("พิมพ์ 'DELETE' เพื่อยืนยันการลบถาวร:");
        if (check === 'DELETE') {
            const sb = getSupabase();
            const { error } = await sb.from('records').delete().eq('inspector', S.currentUser);
            if (!error) {
                S.records = [];
                renderTable();
                toast("ล้างข้อมูลสำเร็จ", "success");
            }
        }
    }
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

            const confirmMsg = `AI ตรวจพบข้อมูลที่ถูกต้อง ${formattedData.length} รายการ\nต้องการนำเข้าสู่ระบบใช่หรือไม่?`;
            if (confirm(confirmMsg)) {
                const { error } = await sqeClient.from('records').insert(formattedData);
                if (error) throw error;
                
                await loadRecords(); // รีเฟรชตารางหน้าจอ
                toast(`✅ นำเข้าข้อมูลสำเร็จ ${formattedData.length} รายการ`, "success");
            }

        } catch (err) {
            console.error("Critical Import Error:", err);
            toast("❌ การนำเข้าขัดข้อง: " + err.message, "error");
        }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = ''; // Reset input
}

function animateValue(id, startOrEnd, end, duration = 1500, decimals = 0, suffix = "", prefix = "") {
    const el = document.getElementById(id);
    if (!el) return;
gsap.killTweensOf(el); // ล้างคิวเก่า
    let startValue = 0;
    let endValue = 0;
    gsap.killTweensOf(el); // ล้างคิวเก่า
    // ตรวจสอบว่าถ้าส่งมาแค่ 2 ค่า (id, value) ให้ถือว่า start = 0
    if (end === undefined) {
        endValue = parseFloat(startOrEnd) || 0;
        // พยายามดึงค่าปัจจุบันที่แสดงอยู่บนจอมาเป็นค่าเริ่มต้น (ถ้ามี)
        const currentText = el.textContent.replace(/[^0-9.-]/g, "");
        startValue = parseFloat(currentText) || 0;
    } else {
        // ถ้าส่งมาครบ (id, start, end)
        startValue = parseFloat(startOrEnd) || 0;
        endValue = parseFloat(end) || 0;
    }

    gsap.killTweensOf(el);
    const data = { val: startValue };
    gsap.to(data, {
        val: endValue,
        duration: duration / 1000,
        ease: "power3.out",
        onUpdate: () => {
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
        nav_sme: "ลูกหนี้ SME", // ใส่คอมม่าปิดท้ายบรรทัดนี้ด้วย

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
        nav_sme: "SME Receivables", // ใส่คอมม่าปิดท้ายบรรทัดนี้ด้วย

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

// --- 2. Password Visibility Toggle (เวอร์ชันแก้ไข Error Null) ---
function togglePassVisibility() {
    const passInput = document.getElementById('login-pass');
    const eyeSlash = document.getElementById('eye-slash'); // อ้างอิงเส้นขีดฆ่าจาก SVG
    const eyeIcon = document.getElementById('eye-icon');   // อ้างอิงไอคอนแบบเก่า (ถ้ามี)
    
    if (!passInput) return; // ป้องกัน Error ถ้าหาช่องรหัสผ่านไม่เจอ

    if (passInput.type === 'password') {
        passInput.type = 'text';
        // ถ้าใช้ระบบ SVG (เส้นขีดฆ่า)
        if (eyeSlash) eyeSlash.style.display = 'block';
        // ถ้าใช้ระบบ Font Icon (แบบเก่า) - เช็ค null ก่อนเรียก classList
        if (eyeIcon) eyeIcon.classList.replace('lucide-eye', 'lucide-eye-off');
    } else {
        passInput.type = 'password';
        // ถ้าใช้ระบบ SVG (เส้นขีดฆ่า)
        if (eyeSlash) eyeSlash.style.display = 'none';
        // ถ้าใช้ระบบ Font Icon (แบบเก่า) - เช็ค null ก่อนเรียก classList
        if (eyeIcon) eyeIcon.classList.replace('lucide-eye-off', 'lucide-eye');
    }
}

// 2. ฟังก์ชันตรวจสอบ Caps Lock (แบบ Safe Check)
function checkCapsLock(e) {
    const warning = document.getElementById('caps-lock-warning');
    if (!warning) return; // ถ้าไม่มี Element นี้ใน HTML ให้ข้ามไปเลย ไม่ต้องแสดง Error

    if (e && typeof e.getModifierState === 'function') {
        if (e.getModifierState("CapsLock")) {
            warning.classList.remove('hidden');
        } else {
            warning.classList.add('hidden');
        }
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
/**
 * Micro-Interaction: พาร์ทบินจากฟอร์มเข้าสู่ตาราง
 */
function playCommitAnimation() {
    const btn = document.getElementById('btn-commit');
    // เป้าหมายคือตัวเลขจำนวนรายการข้างบนตาราง
    const target = document.getElementById('record-count');
    
    if (!btn || !target || !window.gsap) return;

    // 1. สร้างพาร์ทจำลอง (Ghost Element)
    const ghost = document.createElement('div');
    ghost.className = 'flying-data-node';
    
    // ใส่ไอคอนกล่องพาร์ทเข้าไปในพาร์ทจำลอง
    ghost.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`;

    // 2. คำนวณตำแหน่งเริ่มต้นจากกึ่งกลางปุ่ม
    const rect = btn.getBoundingClientRect();
    ghost.style.left = (rect.left + rect.width / 2 - 20) + 'px';
    ghost.style.top = (rect.top + rect.height / 2 - 20) + 'px';
    document.body.appendChild(ghost);

    // 3. คำนวณระยะทางไปหาเป้าหมาย
    const targetRect = target.getBoundingClientRect();
    const destX = (targetRect.left + targetRect.width / 2) - (rect.left + rect.width / 2);
    const destY = (targetRect.top + targetRect.height / 2) - (rect.top + rect.height / 2);

    // 4. สั่งบินด้วย GSAP (บินโค้ง + หมุน + ย่อตัว)
    gsap.to(ghost, {
        duration: 0.8,
        x: destX,
        y: destY,
        rotation: 360,
        scale: 0.3,
        opacity: 0.2,
        ease: "power2.inOut",
        onComplete: () => {
            ghost.remove();
            // เอฟเฟกต์ตอบสนองที่เป้าหมาย (เด้ง + เปลี่ยนสีชั่วคราว)
            gsap.fromTo(target, 
                { scale: 1.4, color: "#2563eb", backgroundColor: "#dbeafe" }, 
                { scale: 1, color: "", backgroundColor: "", duration: 0.6, ease: "back.out(2)" }
            );
        }
    });
}
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

    // 7. การลงทะเบียน PWA Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('PWA: Service Worker Registered!'))
            .catch(err => console.log('PWA: Registration Failed', err));
    }
});