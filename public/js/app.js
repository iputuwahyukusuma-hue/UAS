const API_URL = '/api/notes';
let currentEditId = null;

// 1. MUAT CATATAN (READ)
async function muatCatatan() {
    try {
        const response = await fetch(API_URL);
        const dataCatatan = await response.json();
        const container = document.getElementById('notesContainer');
        container.innerHTML = '';

        dataCatatan.forEach(note => {
            const card = document.createElement('div');
            card.className = 'note-card';
            card.onclick = (e) => {
                if(e.target.classList.contains('btn-delete')) return;
                setModeEdit(note);
            };

            card.innerHTML = `
                <div>
                    <h3 class="note-title">${escapeHTML(note.title)}</h3>
                    <p class="note-content">${escapeHTML(note.content || '')}</p>
                </div>
                <button class="btn-delete" onclick="hapusCatatan(${note.id})">Hapus</button>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error(error);
    }
}

// 2. SIMPAN DATA (CREATE & UPDATE)
document.getElementById('noteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

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
            body: JSON.stringify({ title, content })
        });

        if (!response.ok) throw new Error('Gagal memproses data');

        resetForm();
        muatCatatan();
    } catch (error) {
        alert(error.message);
    }
});

// 3. HAPUS DATA (DELETE)
async function hapusCatatan(id) {
    if(!confirm('Apakah Anda yakin ingin menghapus catatan ini?')) return;
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
    document.getElementById('submitBtn').innerText = 'Perbarui';
    document.getElementById('cancelBtn').style.display = 'inline-block';
}

function resetForm() {
    currentEditId = null;
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    document.getElementById('submitBtn').innerText = 'Simpan';
    document.getElementById('cancelBtn').style.display = 'none';
}

document.getElementById('cancelBtn').addEventListener('click', resetForm);

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

window.addEventListener('DOMContentLoaded', muatCatatan);