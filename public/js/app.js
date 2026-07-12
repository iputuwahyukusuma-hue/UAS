const API_URL = '/api/notes';
let currentEditId = null;
let semuaCatatan = []; 
let halamanAktif = 'catatan'; // 'catatan', 'pengingat', 'arsip', 'sampah'

// ==========================================
// 1. NAVIGATION & SEARCH HANDLER
// ==========================================
document.getElementById('searchBar').addEventListener('input', (e) => {
    const kataKunci = e.target.value.toLowerCase();
    renderGrid(semuaCatatan, kataKunci);
});

const daftarMenu = {
    'menuCatatan': 'catatan',
    'menuPengingat': 'pengingat',
    'menuArsip': 'arsip',
    'menuSampah': 'sampah'
};

Object.keys(daftarMenu).forEach(menuId => {
    document.getElementById(menuId).addEventListener('click', () => {
        Object.keys(daftarMenu).forEach(id => document.getElementById(id).classList.remove('active'));
        document.getElementById(menuId).classList.add('active');
        
        halamanAktif = daftarMenu[menuId];
        const formContainer = document.querySelector('.form-container');
        
        if (halamanAktif === 'catatan') {
            formContainer.style.display = 'block';
        } else {
            formContainer.style.display = 'none'; 
        }
        
        document.getElementById('searchBar').value = '';
        renderGrid(semuaCatatan);
    });
});

// ==========================================
// 2. CORE RENDER ENGINE
// ==========================================
async function muatCatatan() {
    try {
        const response = await fetch(API_URL);
        semuaCatatan = await response.json();
        renderGrid(semuaCatatan);
    } catch (error) {
        console.error("Koneksi backend bermasalah:", error);
    }
}

function renderGrid(data, filterKataKunci = '') {
    const container = document.getElementById('notesContainer');
    container.innerHTML = '';

    // FILTER DATA BERDASARKAN HALAMAN AKTIF
    let dataTerfilter = data.filter(note => {
        // Jika di halaman sampah, hanya tampilkan yang is_deleted = 1
        if (halamanAktif === 'sampah') return note.is_deleted === 1;
        
        // Untuk halaman selain sampah, sembunyikan semua yang sudah dihapus
        if (note.is_deleted === 1) return false; 
        
        if (halamanAktif === 'catatan') return note.is_archived === 0;
        if (halamanAktif === 'arsip') return note.is_archived === 1;
        if (halamanAktif === 'pengingat') return note.reminder_time !== null && note.is_archived === 0;
        return true;
    });

    if (filterKataKunci) {
        dataTerfilter = dataTerfilter.filter(note => 
            note.title.toLowerCase().includes(filterKataKunci) || 
            (note.content && note.content.toLowerCase().includes(filterKataKunci))
        );
    }

    dataTerfilter.forEach(note => {
        const card = document.createElement('div');
        const namaWarna = (note.color || 'putih').toLowerCase();
        card.className = `note-card bg-${namaWarna}`;
        
        card.onclick = (e) => {
            if (e.target.classList.contains('dots-icon') || e.target.type === 'checkbox' || halamanAktif === 'sampah') return;
            setModeEdit(note);
        };

        let kontenHTML = `<p class="note-content">${escapeHTML(note.content || '')}</p>`;
        if (note.is_checklist === 1 || (note.content && note.content.includes('☐'))) {
            const baris = (note.content || '').split('\n');
            kontenHTML = '<div class="checklist-container" style="display:flex; flex-direction:column; gap:4px; margin-top:5px;">';
            baris.forEach(textBaris => {
                const bersih = textBaris.replace(/☐\s*/g, '').trim();
                if (bersih || textBaris.includes('☐')) {
                    kontenHTML += `<label style="display:flex; align-items:center; gap:8px; font-size:14px;"><input type="checkbox"> <span>${escapeHTML(bersih)}</span></label>`;
                }
            });
            kontenHTML += '</div>';
        }

        let badgeReminderHTML = '';
        if (note.reminder_time && note.is_deleted !== 1) {
            const opsiWaktu = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
            const waktuFormat = new Date(note.reminder_time).toLocaleDateString('id-ID', opsiWaktu);
            badgeReminderHTML = `<div style="display:inline-flex; align-items:center; gap:4px; background: rgba(0,0,0,0.06); padding: 4px 8px; border-radius: 12px; font-size: 11px; margin-top:8px; color:#3c4043; font-weight:500;">⏰ ${waktuFormat}</div>`;
        }

        // PENGKONDISIAN TOMBOL DROPDOWN (HALAMAN BIASA VS HALAMAN SAMPAH)
        let dropdownMenuHTML = '';
        if (halamanAktif === 'sampah') {
            dropdownMenuHTML = `
                <button onclick="pulihkanDariSampah(event, ${note.id})">Pulihkan Catatan</button>
                <button onclick="hapusPermanen(event, ${note.id})" style="color: red;">Hapus Permanen</button>
            `;
        } else {
            const teksTombolArsip = note.is_archived === 1 ? 'Pulihkan dari Arsip' : 'Arsipkan';
            dropdownMenuHTML = `
                <button onclick="picuEditDropdown(event, ${JSON.stringify(note).replace(/"/g, '&quot;')})">Edit</button>
                <button onclick="buatSalinanCatatan(event, ${JSON.stringify(note).replace(/"/g, '&quot;')})">Buat Salinan</button>
                <button onclick="toggleStatusArsip(event, ${JSON.stringify(note).replace(/"/g, '&quot;')})">${teksTombolArsip}</button>
                <button onclick="pindahkanKeSampah(event, ${note.id})">Hapus</button>
            `;
        }

        card.innerHTML = `
            <div class="card-pin">📌</div>
            <div>
                <h3 class="note-title">${escapeHTML(note.title)}</h3>
                ${kontenHTML}
                ${badgeReminderHTML}
            </div>
            <div class="card-footer" style="margin-top:12px;">
                <span class="card-date"></span>
                <div class="menu-dots-container">
                    <span class="dots-icon" onclick="toggleMenuAction(event, ${note.id})">⋮</span>
                    <div id="dropdown-${note.id}" class="card-dropdown-menu">
                        ${dropdownMenuHTML}
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// ==========================================
// 3. LOGIKA CRUD & SAMPAH ENGINE
// ==========================================

// A. Hapus Sementara (Pindahkan ke Sampah)
async function pindahkanKeSampah(e, id) {
    e.stopPropagation();
    try {
        // Ambil data catatan lama terlebih dahulu
        const note = semuaCatatan.find(n => n.id === id);
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...note, is_deleted: 1 })
        });
        muatCatatan();
    } catch (error) { console.error(error); }
}

// B. Pulihkan Catatan dari Sampah
async function pulihkanDariSampah(e, id) {
    e.stopPropagation();
    try {
        const note = semuaCatatan.find(n => n.id === id);
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...note, is_deleted: 0 })
        });
        muatCatatan();
    } catch (error) { console.error(error); }
}

// C. Hapus Permanen dari Database
async function hapusPermanen(e, id) {
    e.stopPropagation();
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) muatCatatan();
    } catch (error) { console.error(error); }
}

// D. Toggle Status Arsip
async function toggleStatusArsip(e, note) {
    e.stopPropagation();
    const statusBaru = note.is_archived === 1 ? 0 : 1;
    try {
        await fetch(`${API_URL}/${note.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...note, is_archived: statusBaru })
        });
        muatCatatan();
    } catch (error) { console.error(error); }
}

// E. Form Submit Handler
document.getElementById('noteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const color = document.getElementById('colorSelect').value;
    const is_checklist = parseInt(document.getElementById('isChecklist').value);
    let reminder_time = document.getElementById('reminderTime').value || null;

    try {
        let url = API_URL; let method = 'POST';
        if (currentEditId) { url = `${API_URL}/${currentEditId}`; method = 'PUT'; }

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, color, is_checklist, reminder_time, is_archived: 0, is_deleted: 0 })
        });

        if (!response.ok) throw new Error('Gagal memproses data');
        resetForm(); muatCatatan();
    } catch (error) { alert(error.message); }
});

async function buatSalinanCatatan(e, note) {
    e.stopPropagation();
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: `${note.title} (Salinan)`, content: note.content, color: note.color, is_checklist: note.is_checklist, reminder_time: note.reminder_time, is_archived: 0, is_deleted: 0 })
        });
        muatCatatan();
    } catch (error) { console.error(error); }
}

// ==========================================
// 4. UTILITIES & TOGGLES
// ==========================================
function setModeEdit(note) {
    currentEditId = note.id;
    document.getElementById('title').value = note.title;
    document.getElementById('content').value = note.content;
    document.getElementById('colorSelect').value = note.color;
    document.getElementById('colorSelect').dispatchEvent(new Event('change'));
    document.getElementById('isChecklist').value = note.is_checklist;
    document.getElementById('iconChecklist').style.background = note.is_checklist === 1 ? "#feefc3" : "transparent";

    if (note.reminder_time) {
        document.getElementById('reminderTime').value = new Date(note.reminder_time).toISOString().slice(0, 16);
        document.getElementById('reminderInputContainer').style.display = 'block';
    } else {
        document.getElementById('reminderTime').value = '';
        document.getElementById('reminderInputContainer').style.display = 'none';
    }
    document.getElementById('submitBtn').innerText = 'Perbarui';
    document.getElementById('cancelBtn').style.display = 'inline-block';
}

function resetForm() {
    currentEditId = null;
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    document.getElementById('colorSelect').value = 'Putih';
    document.getElementById('colorSelect').dispatchEvent(new Event('change'));
    document.getElementById('isChecklist').value = "0";
    document.getElementById('iconChecklist').style.background = "transparent";
    document.getElementById('reminderTime').value = '';
    document.getElementById('reminderInputContainer').style.display = 'none';
    document.getElementById('submitBtn').innerText = '+ Tambah';
    document.getElementById('cancelBtn').style.display = 'none';
}

function toggleMenuAction(e, id) {
    e.stopPropagation();
    document.querySelectorAll('.card-dropdown-menu').forEach(menu => { if(menu.id !== `dropdown-${id}`) menu.style.display = 'none'; });
    const targetMenu = document.getElementById(`dropdown-${id}`);
    targetMenu.style.display = targetMenu.style.display === 'block' ? 'none' : 'block';
}

function picuEditDropdown(e, note) { e.stopPropagation(); setModeEdit(note); }

document.getElementById('colorSelect').addEventListener('change', (e) => {
    const form = document.getElementById('noteForm');
    const warna = e.target.value.toLowerCase();
    form.style.backgroundColor = warna === 'kuning' ? '#fff4cc' : warna === 'biru' ? '#cbf0f8' : warna === 'hijau' ? '#d7eff2' : '#ffffff';
});

document.getElementById('iconReminder').addEventListener('click', () => {
    const container = document.getElementById('reminderInputContainer');
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('iconChecklist').addEventListener('click', () => {
    const isChecklistInput = document.getElementById('isChecklist');
    const txtArea = document.getElementById('content');
    if (isChecklistInput.value === "0") {
        isChecklistInput.value = "1"; document.getElementById('iconChecklist').style.background = "#feefc3";
        if (!txtArea.value.startsWith("☐ ")) txtArea.value = "☐ " + txtArea.value.replace(/\n/g, "\n☐ ");
    } else {
        isChecklistInput.value = "0"; document.getElementById('iconChecklist').style.background = "transparent";
        txtArea.value = txtArea.value.replace(/☐ /g, "");
    }
    txtArea.focus();
});

document.getElementById('cancelBtn').addEventListener('click', resetForm);
window.onclick = () => { document.querySelectorAll('.card-dropdown-menu').forEach(menu => menu.style.display = 'none'); };
function escapeHTML(str) { return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)); }

window.addEventListener('DOMContentLoaded', muatCatatan);