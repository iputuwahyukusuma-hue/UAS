const API_URL = '/api/notes';
let currentEditId = null;

// 1. READ CATATAN DARI DATABASE
async function muatCatatan() {
    try {
        const response = await fetch(API_URL);
        const dataCatatan = await response.json();
        const container = document.getElementById('notesContainer');
        container.innerHTML = '';

        dataCatatan.forEach(note => {
            const card = document.createElement('div');
            const warnaClass = `bg-${(note.color || 'Putih').toLowerCase()}`;
            card.className = `note-card ${warnaClass}`;
            
            card.onclick = (e) => {
                if(e.target.classList.contains('btn-delete')) return;
                setModeEdit(note);
            };

            // Membuat variasi tanggal opsional di card bawah (seperti gambar)
            const opsiTanggal = note.created_at ? new Date(note.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : '';

            card.innerHTML = `
                <div class="card-pin">📌</div>
                <div>
                    <h3 class="note-title">${escapeHTML(note.title)}</h3>
                    <p class="note-content">${escapeHTML(note.content || '')}</p>
                </div>
                <div class="card-footer">
                    <span class="card-date">${opsiTanggal}</span>
                    <button class="btn-delete" onclick="hapusCatatan(${note.id})">🗑️</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error(error);
    }
}

// 2. CREATE ATAU UPDATE
document.getElementById('noteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const color = document.getElementById('colorSelect').value;

    try {
        let url = API_URL;
        let method = 'POST';

        if (currentEditId) {
            url = `${API_URL}/${currentEditId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, color })
        });

        if (!response.ok) throw new Error('Gagal memproses data');

        resetForm();
        muatCatatan();
    } catch (error) {
        alert(error.message);
    }
});

// 3. DELETE CATATAN
async function hapusCatatan(id) {
    if(!confirm('Hapus catatan ini?')) return;
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) {
            if(currentEditId === id) resetForm();
            muatCatatan();
        }
    } catch (error) {
        alert('Gagal menghapus');
    }
}

function setModeEdit(note) {
    currentEditId = note.id;
    document.getElementById('title').value = note.title;
    document.getElementById('content').value = note.content;
    document.getElementById('colorSelect').value = note.color || 'Putih';
    document.getElementById('submitBtn').innerText = 'Perbarui';
    document.getElementById('cancelBtn').style.display = 'inline-block';
}

function resetForm() {
    currentEditId = null;
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    document.getElementById('colorSelect').value = 'Putih';
    document.getElementById('submitBtn').innerText = '+ Tambah';
    document.getElementById('cancelBtn').style.display = 'none';
}

document.getElementById('cancelBtn').addEventListener('click', resetForm);

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

// Fitur auto-expand tinggi kotak input ketika diklik (Efek Google Keep asli)
const txtArea = document.getElementById('content');
txtArea.addEventListener('focus', () => { txtArea.style.height = '120px'; });
txtArea.addEventListener('blur', () => { if(txtArea.value==="") txtArea.style.height = '44px'; });

window.addEventListener('DOMContentLoaded', muatCatatan);