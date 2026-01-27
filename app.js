document.addEventListener('DOMContentLoaded', function() {
    const queryInput = document.getElementById('queryInput');
    const expertSelect = document.getElementById('expert-select');
    const modal = document.getElementById('resultModal');
    const modalBody = document.getElementById('modalBody');
    const scratchpad = document.getElementById('scratchpadContent');
    const closeBtn = document.querySelector('.close');
    const clearModalBtn = document.getElementById('clearModal');
    const addToSidebarBtn = document.getElementById('addToSidebar');
    const anonymizeInfoModal = document.getElementById('anonymizeInfoModal');
    const closeAnonymizeBtn = document.querySelector('.close-anonymize');

    let currentGeneratedAnswer = "";

    async function handleQuery(isDirect = false) {
    const query = queryInput.value.trim();
    if (!query) return alert("Geben Sie eine Frage ein!");

    const selectedValue = expertSelect.value;
    const selectedText = expertSelect.options[expertSelect.selectedIndex].text;
    const sendBtn = document.querySelector('.btn-send');
    const directBtn = document.querySelector('.btn-direct');
    const activeBtn = isDirect ? directBtn : sendBtn;
    const originalText = activeBtn.innerText;
    
    activeBtn.innerText = "VERBINDUNG...";
    activeBtn.disabled = true;

    await new Promise(r => setTimeout(r, 700));

    let responsePrefix = `Interessante Frage: "${query}"\n\n`;
    let expertResponse = "";

    if (selectedValue === "karne") {
        expertResponse = "Wusste ich, dass Sie Strafrecht wählen würden! Bei der Analyse Ihrer Meldung im Hinblick auf das StGB ist auf Art. 1 § 1 sowie eine Reihe von Tatsachen zu achten. Der Täter kann strafrechtlich verantwortlich gemacht werden gemäß den zur Zeit der Tat geltenden Vorschriften. Die vorläufige Analyse weist auf die Notwendigkeit hin, den Sachverhalt hinsichtlich der Vorsätzlichkeit der Handlung und eventueller Umstände, die die Rechtswidrigkeit ausschließen, zu überprüfen.";
    } else if (selectedValue === "podatkowe") {
        expertResponse = "Steuern sind meine Spezialität! Als Antwort auf Ihre Anfrage habe ich eine vorläufige Analyse der Steuerpflichten vorbereitet. Gemäß dem EStG/KStG ist der Zeitpunkt der Entstehung der Steuerpflicht, die korrekte Bemessungsgrundlage sowie die Möglichkeit der Anwendung von Vergünstigungen und Abzügen zu berücksichtigen. Entscheidend wird sein festzustellen, ob wir es mit einem steuerpflichtigen Einkommen und dem zutreffenden Steuersatz zu tun haben.";
    } else if (selectedValue === "anonimizacja") {
        expertResponse = "Experte für Anonymisierung meldet sich. Ihre Frage erfordert die Entfernung sensibler Daten. Das System hat potenzielle personenbezogene Daten, Personenkennzahlen, Adressen und andere schützenswerte Informationen gemäß DSGVO erkannt. Ich führe den Anonymisierungsprozess durch unter Beibehaltung des inhaltlichen Kontexts des Dokuments.";
    } else {
        expertResponse = "Wählen Sie einen Experten aus der Dropdown-Liste, um eine fachliche Antwort zu erhalten.";
    }

    currentGeneratedAnswer = responsePrefix + expertResponse;
    showModal(currentGeneratedAnswer, isDirect, selectedText);
    
    activeBtn.innerText = originalText;
    activeBtn.disabled = false;
}

    function showModal(answer, isDirect, expertName) {
        let sourcesHtml = isDirect ? 
            '<hr><p style="color: #666; font-size: 0.9em; margin-top: 15px;">Direktmodus (DEMO) - ohne RAG</p>' : 
            `<hr><h4 style="margin-top: 20px;">Quellen (Simulation):</h4>
            <div style="background: #1e1e1e; padding: 15px; border-left: 4px solid var(--accent); margin-top: 10px;">
                <strong>📄 Mustergesetz_v2.pdf</strong><br>
                <span style="font-size: 0.85em; color: #95a5a6;">Abschnitt: Art. 15-23, Relevanz: 92%</span>
            </div>
            <div style="background: #1e1e1e; padding: 15px; border-left: 4px solid var(--accent); margin-top: 10px;">
                <strong>📄 Vorschriftenkodex_2024.pdf</strong><br>
                <span style="font-size: 0.85em; color: #95a5a6;">Abschnitt: Kapitel IV, Relevanz: 87%</span>
            </div>`;

        modalBody.innerHTML = `
            <div style="background: #1e1e1e; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                <strong style="color: var(--accent);">Gewählter Experte:</strong> ${expertName}
            </div>
            <div style="white-space: pre-wrap; font-size: 1.05em; line-height: 1.6;">${answer}</div>
            ${sourcesHtml}
        `;
        modal.style.display = "block";
    }

    document.querySelector('.btn-send').onclick = () => handleQuery(false);
    document.querySelector('.btn-direct').onclick = () => handleQuery(true);
    document.querySelector('.btn-clean').onclick = () => { queryInput.value = ""; };

    const anonymizeBtn = document.querySelector('.btn-anonymize');
    if (anonymizeBtn) {
        anonymizeBtn.onclick = () => {
            if (anonymizeInfoModal) anonymizeInfoModal.style.display = "block";
        };
    }

    if (closeAnonymizeBtn) {
        closeAnonymizeBtn.onclick = () => { 
            anonymizeInfoModal.style.display = "none"; 
        };
    }

    if (clearModalBtn) {
        clearModalBtn.onclick = () => {
            modalBody.innerHTML = "<p style='color: gray;'>Der Inhalt wurde gelöscht.</p>";
            currentGeneratedAnswer = "";
        };
    }

    if (addToSidebarBtn) {
        addToSidebarBtn.onclick = () => {
            if (!currentGeneratedAnswer) return;
            const entry = document.createElement('div');
            entry.innerHTML = `<p style="margin-bottom: 10px;">${currentGeneratedAnswer}</p><hr style="margin: 15px 0; border-color: #444;">`;
            scratchpad.appendChild(entry);
            modal.style.display = "none";
        };
    }

    if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";
    
    window.onclick = (e) => { 
        if (e.target == modal) modal.style.display = "none";
        if (e.target == anonymizeInfoModal) anonymizeInfoModal.style.display = "none";
    };
});
