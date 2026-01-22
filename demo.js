document.addEventListener('DOMContentLoaded', function() {
    // --- MOCK DATA ---
    const MOCK_CONFIG = {
        collections: ["baza_wektorow_gbert_base", "ustawa_karna", "kodeks_cywilny"],
        jurabks: ["StGB", "BGB", "ZPO", "UStG"],
        experts: ["default", "prawo_karne", "prawo_cywilne", "podatki"]
    };

    const MOCK_SOURCES = [
        {jurabk: "StGB", paragraph_ref: "§ 242", score: 0.89, chunk_id: "frag_001", title: "Strafgesetzbuch"},
        {jurabk: "BGB", paragraph_ref: "§ 433", score: 0.76, chunk_id: "frag_023", title: "Bürgerliches Gesetzbuch"}
    ];

    const MOCK_ANSWERS = [
        "Zgodnie z § 242 StGB, kradzież definiowana jest jako zabór cudzej rzeczy ruchomej z zamiarem przywłaszczenia...",
        "Umowa sprzedaży regulowana jest w § 433 BGB. Wymaga ona złożenia oferty i przyjęcia...",
        "W przypadku naruszenia umowy, strona pokrzywdzona może domagać się odszkodowania..."
    ];

    // --- ELEMENTY UI ---
    const resizer = document.getElementById('resizer');
    const sidebar = document.getElementById('sidebar');
    const scratchpad = document.getElementById('scratchpadContent');
    const tokenCounter = document.getElementById('tokenCounter');
    const modal = document.getElementById('resultModal');
    const modalBody = document.getElementById('modalBody');
    const closeBtn = document.querySelector('.close');
    const queryInput = document.getElementById('queryInput');

    let currentGeneratedAnswer = "";

    // --- MOCK FETCH (zamiast prawdziwego API) ---
    async function mockFetch(url, options) {
        await new Promise(r => setTimeout(r, 500)); // Symulacja opóźnienia sieci
        
        if (url === '/api/get_ui_config') {
            return {json: async () => MOCK_CONFIG};
        }
        
        if (url === '/api/generate_answer') {
            const randomAnswer = MOCK_ANSWERS[Math.floor(Math.random() * MOCK_ANSWERS.length)];
            return {
                json: async () => ({
                    status: "success",
                    answer: randomAnswer,
                    sources: MOCK_SOURCES
                })
            };
        }
        
        if (url === '/api/convert_only') {
            return {
                json: async () => ({
                    status: "success",
                    text: "To jest przykładowy tekst z wczytanego pliku PDF/DOCX..."
                })
            };
        }
        
        if (url === '/api/generate_final_report') {
            const body = JSON.parse(options.body);
            return {
                json: async () => ({
                    status: "success",
                    report: `📄 RAPORT KOŃCOWY\n\nSynteza zebranych informacji:\n${body.text.substring(0, 200)}...\n\n✅ Wnioski: Demo działa poprawnie!`
                })
            };
        }
    }

    // --- NADPISANIE fetch DLA DEMO ---
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (url.startsWith('/api/')) {
            return mockFetch(url, options);
        }
        return originalFetch(url, options);
    };

    // --- RESZTA KODU BEZ ZMIAN ---
    async function setupUI() {
        try {
            const response = await fetch('/api/get_ui_config');
            const config = await response.json();

            const colSelect = document.getElementById('filter-collection');
            const jurSelect = document.getElementById('filter-jurabk');
            const expSelect = document.getElementById('expert-select');

            config.collections.forEach(val => {
                let opt = document.createElement('option');
                opt.value = val;
                opt.textContent = val;
                colSelect.appendChild(opt);
            });

            config.jurabks.forEach(val => {
                let opt = document.createElement('option');
                opt.value = val;
                opt.textContent = val;
                jurSelect.appendChild(opt);
            });

            config.experts.forEach(val => {
                let opt = document.createElement('option');
                opt.value = val;
                opt.textContent = val;
                expSelect.appendChild(opt);
            });

            console.log("✅ Filtry załadowane (DEMO MODE)");
        } catch (e) {
            console.error("❌ Błąd podczas ładowania filtrów:", e);
        }
    }

    setupUI();

    resizer.addEventListener('mousedown', (e) => {
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
        resizer.classList.add('active');
    });

    function resize(e) {
        let newWidth = window.innerWidth - e.clientX;
        if (newWidth > 50 && newWidth < (window.innerWidth * 0.8)) {
            sidebar.style.width = newWidth + 'px';
        }
    }

    function stopResize() {
        document.removeEventListener('mousemove', resize);
        resizer.classList.remove('active');
    }

    async function sendQuery() {
        const query = queryInput.value;
        if (!query) return alert("Wpisz pytanie!");

        const selectedCollection = document.getElementById('filter-collection').value;
        const selectedJuraBK = document.getElementById('filter-jurabk').value;
        const selectedExpert = document.getElementById('expert-select').value;

        const payload = {
            query: query,
            collection: selectedCollection || "baza_wektorow_gbert_base",
            jurabk: selectedJuraBK,
            expert: selectedExpert
        };

        try {
            const response = await fetch('/api/generate_answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            
            if (data.status === "success") {
                showModal(data.answer, data.sources);
            } else {
                alert("Błąd: " + data.message);
            }
        } catch (error) {
            console.error("Błąd połączenia:", error);
        }
    }

    function showModal(answer, sources) {
        currentGeneratedAnswer = answer;
        
        let sourcesHtml = '<hr><h4>Quellen / Oryginał:</h4>';
        if (sources && sources.length > 0) {
            sources.forEach(source => {
                sourcesHtml += `
                    <div style="background: #f4f4f4; padding: 10px; margin-bottom: 5px; border-left: 3px solid #007bff; font-size: 0.85em;">
                        <strong>${source.jurabk} ${source.paragraph_ref}</strong> | 
                        Score: ${source.score} | 
                        Fragment: ${source.chunk_id} <br>
                        <small>Dokument: ${source.title}</small>
                    </div>`;
            });
        } else {
            sourcesHtml += '<p>Keine detaillierten Quellen gefunden.</p>';
        }

        modalBody.innerHTML = `<div>${answer}</div> ${sourcesHtml}`;
        modal.style.display = "block";
    }

    const sendBtn = document.querySelector('.btn-send');
    if (sendBtn) sendBtn.addEventListener('click', sendQuery);
    
    const cleanBtn = document.querySelector('.btn-clean');
    if (cleanBtn) {
        cleanBtn.addEventListener('click', () => {
            queryInput.value = "";
        });
    }

    const loadBtn = document.querySelector('.btn-load');
    if (loadBtn) {
        loadBtn.addEventListener('click', () => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.pdf,.epub,.docx,.txt,.xml,.html'; 

            fileInput.onchange = async e => { 
                const file = e.target.files[0];
                if (!file) return;

                const originalText = loadBtn.innerText;
                loadBtn.innerText = "LOADING...";
                loadBtn.disabled = true;

                const formData = new FormData();
                formData.append('file', file);

                try {
                    const response = await fetch('/api/convert_only', {
                        method: 'POST',
                        body: formData
                    });
                    const data = await response.json();
                    if (data.status === "success") {
                        queryInput.value = data.text;
                    } else {
                        alert("Błąd: " + data.message);
                    }
                } catch (error) {
                    console.error("Błąd:", error);
                } finally {
                    loadBtn.innerText = originalText;
                    loadBtn.disabled = false;
                }
            }
            fileInput.click();
        });
    }
    
    const addToSidebarBtn = document.getElementById('addToSidebar');
    if (addToSidebarBtn) {
        addToSidebarBtn.addEventListener('click', () => {
            const entry = document.createElement('div');
            entry.className = 'scratchpad-entry';
            entry.innerHTML = `<p>${currentGeneratedAnswer}</p><hr>`;
            scratchpad.appendChild(entry);
            updateTokenCounter();
            modal.style.display = "none";
        });
    }
    
    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = "none";
    };

    function updateTokenCounter() {
        const text = scratchpad.innerText;
        const tokens = Math.round(text.length / 4);
        tokenCounter.innerText = `Tokeny: ~${tokens}`;
    }

    const saveToFileBtn = document.getElementById('saveToFile');
    if (saveToFileBtn) {
        saveToFileBtn.addEventListener('click', () => {
            const content = document.getElementById('modalBody').innerText;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Analiza_RAG_${new Date().toISOString().slice(0,10)}.txt`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        });
    }

    const finalReportBtn = document.querySelector('.btn-final');
    if (finalReportBtn) {
        finalReportBtn.addEventListener('click', async () => {
            const sidebarContent = document.getElementById('scratchpadContent').innerText;

            if (!sidebarContent.trim()) {
                return alert("Panel boczny jest pusty! Dodaj tam najpierw jakieś wyniki.");
            }

            const originalText = finalReportBtn.innerText;
            finalReportBtn.innerText = "GENEROWANIE RAPORTU...";
            finalReportBtn.disabled = true;

            try {
                const response = await fetch('/api/generate_final_report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: sidebarContent })
                });

                const data = await response.json();

                if (data.status === "success") {
                    showModal(data.report, []);
                } else {
                    alert("Błąd raportu: " + data.message);
                }
            } catch (error) {
                console.error("Błąd:", error);
                alert("Błąd połączenia z serwerem.");
            } finally {
                finalReportBtn.innerText = originalText;
                finalReportBtn.disabled = false;
            }
        });
    }

});