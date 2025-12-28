document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const homeSelection = document.getElementById('home-selection');
    const analyzeInputSection = document.getElementById('analysis-input-section');
    const generateInputSection = document.getElementById('generation-input-section');
    const backBtns = document.querySelectorAll('.back-btn');

    // Selection Cards
    const selectionCards = document.querySelectorAll('.selection-card');

    // Result Elements
    const resultsSection = document.getElementById('results-section');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const problemsContainer = document.getElementById('problems-container');
    const answersContainer = document.getElementById('answers-container');

    // --- State Management ---
    let sourceScopeFiles = [];
    let targetScopeFiles = [];
    let generatedProblemsData = []; // Store generated data for export

    // --- Navigation Logic ---
    // --- Navigation Logic ---
    if (selectionCards.length > 0) {
        selectionCards.forEach(card => {
            card.addEventListener('click', () => {
                const targetId = card.getAttribute('data-target');
                const targetEl = document.getElementById(targetId);

                if (targetEl && homeSelection) {
                    // Start fade out
                    homeSelection.classList.add('fade-out');
                    homeSelection.style.pointerEvents = 'none';

                    // Wait for transition duration (300ms)
                    setTimeout(() => {
                        homeSelection.style.display = 'none';
                        homeSelection.classList.remove('fade-out');
                        homeSelection.style.pointerEvents = '';

                        // Hide all sections first
                        if (analyzeInputSection) analyzeInputSection.style.display = 'none';
                        if (generateInputSection) generateInputSection.style.display = 'none';

                        // Show target
                        targetEl.style.display = 'block';

                        // Trigger slide animation
                        targetEl.style.animation = 'none';
                        targetEl.offsetHeight; // forced reflow
                        targetEl.style.animation = 'slideUp 0.4s ease-out';
                    }, 300);

                } else {
                    console.error(`Navigation Error: Target ${targetId} or Home Selection not found`);
                }
            });
        });
    }

    if (backBtns.length > 0) {
        backBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                console.log('Navigating Back to Home');
                // Hide inputs
                if (analyzeInputSection) analyzeInputSection.style.display = 'none';
                if (generateInputSection) generateInputSection.style.display = 'none';

                // Show Home
                if (homeSelection) homeSelection.style.display = 'grid';
            });
        });
    }

    function propsExist(...args) {
        return args.every(arg => arg !== null && arg !== undefined);
    }
    const ctx = document.getElementById('scopeChart').getContext('2d');

    let chartInstance = null;

    // State for Scope Files
    // State for Scope Files (Already declared above)

    // --- Data Elements & Buttons (Restored) ---
    const analyzeStepBtn = document.getElementById('analyze-step-btn');
    const generateStepBtn = document.getElementById('generate-step-btn');
    const scopeTableBody = document.getElementById('scope-table-body');
    const questionsTableBody = document.getElementById('questions-table-body');
    const killerContent = document.getElementById('killer-analysis-content');
    const strategyContent = document.getElementById('strategy-content');

    // --- Input Tab Switching (Legacy Removed) ---
    // (Removed: UI changed to split layout)
    // Note: These elements no longer exist in HTML, leaving this block empty or removed.

    // --- Event Listeners ---
    if (analyzeStepBtn) analyzeStepBtn.addEventListener('click', handleAnalysis);
    if (generateStepBtn) generateStepBtn.addEventListener('click', handleGeneration);

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Deactivate all result tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Activate clicked result tab
            const tabName = btn.getAttribute('data-tab');
            btn.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });

    // --- Sub-Tab Switching Logic (Analysis Section) ---
    const subTabBtns = document.querySelectorAll('.sub-tab-btn');
    const subTabContents = document.querySelectorAll('.sub-tab-content');
    const analysisNextBtn = document.getElementById('analysis-next-btn');

    if (subTabBtns.length > 0) {
        subTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                const targetContent = document.getElementById(targetId);

                if (targetContent) {
                    // Deactivate all sub-tabs
                    subTabBtns.forEach(b => b.classList.remove('active'));
                    subTabContents.forEach(c => {
                        c.classList.remove('active');
                        c.style.display = 'none';
                    });

                    // Activate clicked
                    btn.classList.add('active');
                    targetContent.classList.add('active');
                    targetContent.style.display = 'block';

                    // Reset animation
                    targetContent.style.animation = 'none';
                    targetContent.offsetHeight; // Trigger reflow
                    targetContent.style.animation = 'slideUp 0.3s ease-out';
                }
            });
        });
    }



    // --- File Upload Handlers ---

    // 1. Exam Paper (Source - Single)
    setupSingleFileUpload('exam-paper-file', 'exam-paper');

    // 2. Old Scope (Source - Multi)
    setupMultiFileUpload('exam-scope-file', 'scope-file-list', sourceScopeFiles);

    // 3. New Scope (Target - Multi)
    setupMultiFileUpload('target-scope-file', 'target-file-list', targetScopeFiles);

    // --- Generic Handlers ---
    function setupSingleFileUpload(inputId, textareaId) {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const textarea = document.getElementById(textareaId);
                textarea.value = event.target.result;
                highlightElement(textarea);
            };
            reader.readAsText(file);
        });
    }

    function setupMultiFileUpload(inputId, listContainerId, fileArray) {
        const input = document.getElementById(inputId);
        const listContainer = document.getElementById(listContainerId); // Check element exists
        if (!input) return;

        input.addEventListener('change', (e) => {
            const newFiles = Array.from(e.target.files);
            if (newFiles.length === 0) return;

            newFiles.forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    fileArray.push({
                        id: Date.now() + Math.random(),
                        name: file.name,
                        size: formatBytes(file.size),
                        content: event.target.result
                    });
                    // Only render if container exists
                    if (listContainer) renderFileList(listContainerId, fileArray);
                };
                reader.readAsText(file);
            });
            e.target.value = '';
        });
    }

    function renderFileList(containerId, fileArray) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        fileArray.forEach(file => {
            const item = document.createElement('div');
            item.className = 'file-item';
            item.innerHTML = `
                <div class="file-info">
                    <i class="fa-regular fa-file-lines file-icon"></i>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${file.size}</span>
                </div>
                <button class="remove-file-btn">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            `;

            // Remove handler using closure over current fileArray state
            item.querySelector('.remove-file-btn').addEventListener('click', () => {
                const idx = fileArray.findIndex(f => f.id === file.id);
                if (idx > -1) {
                    fileArray.splice(idx, 1);
                    renderFileList(containerId, fileArray);
                }
            });

            container.appendChild(item);
        });
    }

    // --- Core Logic ---
    function handleAnalysis() {
        const loadingText = analyzeStepBtn.innerHTML;
        analyzeStepBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 분석 중...';
        analyzeStepBtn.disabled = true;

        // Simulate delay & processing
        setTimeout(() => {
            // Using logic: Analyze ONLY source files
            const mockData = generateMockData(sourceScopeFiles, []); // No targets
            renderResults(mockData);

            // Show Results Section and Switch to Analysis Tab
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth' });

            // Activate Analysis Tab
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            document.querySelector('[data-tab="analysis"]').classList.add('active');
            document.getElementById('analysis').classList.add('active');

            analyzeStepBtn.innerHTML = loadingText;
            analyzeStepBtn.disabled = false;
        }, 1200);
    }

    function handleGeneration() {
        const loadingText = generateStepBtn.innerHTML;
        generateStepBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 생성 중...';
        generateStepBtn.disabled = true;

        setTimeout(() => {
            // Analyze source AND generate based on target
            const mockData = generateMockData(sourceScopeFiles, targetScopeFiles);
            renderResults(mockData);

            // Show Results Section
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth' });

            // Activate Variation Tab
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            document.querySelector('[data-tab="variation"]').classList.add('active');
            document.getElementById('variation').classList.add('active');

            generateStepBtn.innerHTML = loadingText;
            generateStepBtn.disabled = false;
        }, 1500);
    }

    function renderResults(data) {
        renderScopeTable(data.scope);
        renderChart(data.scope);
        renderQuestionTable(data.questions);
        renderKillerAnalysis(data.killerAnalysis);
        renderStrategy(data.strategy);
        renderVariationProblems(data.variations);
    }

    // --- Rendering Helpers ---
    function renderScopeTable(scopeData) {
        scopeTableBody.innerHTML = scopeData.map(item => `
            <tr>
                <td>${item.source}</td>
                <td>${item.count}</td>
                <td>${item.percentage}%</td>
            </tr>
        `).join('');
    }

    function renderChart(scopeData) {
        if (chartInstance) {
            chartInstance.destroy();
        }

        const labels = scopeData.map(d => d.source);
        const data = scopeData.map(d => d.count);
        const colors = ['#6366f1', '#a855f7', '#ec4899', '#22c55e', '#f59e0b'];

        chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94a3b8',
                            font: { family: 'Inter' }
                        }
                    }
                }
            }
        });
    }

    function renderQuestionTable(questions) {
        questionsTableBody.innerHTML = questions.map(q => `
            <tr>
                <td>${q.no}</td>
                <td><span class="badge ${q.type === '서답형/서술형' ? 'badge-sub' : 'badge-mc'}">${q.type}</span> / ${q.category}</td>
                <td>${q.source}</td>
                <td>${q.modified ? '<span style="color:var(--danger-color)">변형됨</span>' : '<span style="color:var(--success-color)">원문</span>'}</td>
            </tr>
        `).join('');
    }

    function renderKillerAnalysis(analysis) {
        killerContent.innerHTML = `
            <h3>킬러 문항: #${analysis.questionNo}번</h3>
            <p><strong>선정 이유:</strong> ${analysis.reason}</p>
            <p style="margin-top:1rem"><strong>핵심 난이도 요소:</strong> ${analysis.difficulty}</p>
        `;
    }

    function renderStrategy(strategy) {
        strategyContent.innerHTML = `
            <p>${strategy.summary}</p>
            <ul style="margin-top:1rem; padding-left:1.5rem">
                ${strategy.tips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
        `;
    }

    function renderVariationProblems(variations) {
        // Add Download Button
        const controlsHtml = `
            <div style="display:flex; justify-content:flex-end; margin-bottom:1rem;">
                <button id="download-html-btn" class="analyze-btn" style="padding:0.5rem 1rem; font-size:0.9rem; background-color:var(--success-color);">
                    <i class="fa-solid fa-file-arrow-down"></i> HTML 다운로드
                </button>
            </div>
        `;

        problemsContainer.innerHTML = controlsHtml + variations.problems.map((prob, index) => `
            <div class="problem-item" id="p-${index}">
                <div class="problem-header">
                    <span>${index + 1}번. [${prob.type}]</span>
                    <span>출처: ${prob.source}</span>
                </div>
                <div class="problem-content">
                    <p style="margin-bottom:1rem; font-weight:600; padding:0.5rem; border:1px dashed transparent; transition:border 0.2s;" contenteditable="true" class="editable-area">${prob.questionText}</p>
                    ${prob.passage ? `<div style="background:#1e293b; padding:1rem; border-radius:8px; margin-bottom:1rem; font-family:serif; line-height:1.8; border:1px dashed transparent;" contenteditable="true" class="editable-area">${prob.passage}</div>` : ''}
                    ${prob.choices ? renderChoices(prob.choices, index) : `<textarea class="subjective-input" placeholder="정답을 입력하세요..."></textarea>`}
                </div>
            </div>
        `).join('');

        answersContainer.innerHTML = variations.problems.map((prob, index) => `
            <div style="margin-bottom:1.5rem">
                <h4 style="color:var(--primary-color)">${index + 1}번 정답</h4>
                <p><strong>정답:</strong> <span contenteditable="true" class="editable-area">${prob.answer}</span></p>
                <p style="color:var(--text-scnd); font-size:0.95rem" contenteditable="true" class="editable-area">${prob.explanation}</p>
            </div>
        `).join('');

        // Attach Download Listener
        document.getElementById('download-html-btn').addEventListener('click', downloadHTML);

        // Add visual cues for editable areas
        document.querySelectorAll('.editable-area').forEach(el => {
            el.addEventListener('focus', () => el.style.borderColor = 'var(--primary-color)');
            el.addEventListener('blur', () => el.style.borderColor = 'transparent');
        });
    }

    function renderChoices(choices, qIndex) {
        return `<div class="choices" style="display:grid; gap:0.5rem">
            ${choices.map((c, i) => `
                <div style="display:flex; gap:0.5rem; align-items:center;">
                    <input type="radio" name="q-${qIndex}" disabled>
                    <span contenteditable="true" class="editable-area" style="padding:0.2rem; width:100%;">${i + 1}. ${c}</span>
                </div>
            `).join('')}
        </div>`;
    }

    function downloadHTML() {
        const title = "변형문제_생성결과";
        const content = document.getElementById('problems-container').cloneNode(true);
        const answers = document.getElementById('answers-container').cloneNode(true);

        // Remove UI elements from clone
        const btn = content.querySelector('#download-html-btn');
        if (btn && btn.parentElement) btn.parentElement.remove();

        const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
        .problem-item { margin-bottom: 2rem; border-bottom: 1px solid #ccc; padding-bottom: 2rem; }
        .problem-header { color: #666; font-size: 0.9rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; }
        .question-text { font-weight: bold; margin-bottom: 1rem; }
        .passage { background: #f1f5f9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-family: serif; }
        .choices { display: grid; gap: 0.5rem; }
        .answer-section { margin-top: 4rem; border-top: 2px dashed #ccc; padding-top: 2rem; }
        h4 { color: #4f46e5; margin-bottom: 0.5rem; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div class="problems">
        ${content.innerHTML}
    </div>
    <div class="answer-section">
        <h2>정답 및 해설</h2>
        ${answers.innerHTML}
    </div>
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}_${new Date().toISOString().slice(0, 10)}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function highlightElement(el) {
        el.style.backgroundColor = '#1e293b';
        setTimeout(() => el.style.backgroundColor = '', 300);
    }

    function formatBytes(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    // --- Mock Data Generator (Professional Ver.) ---
    function generateMockData(sourceFiles = [], targetFiles = []) {
        // 1. Setup Source Names (Analysis Basis)
        let sources = sourceFiles.map(f => f.name);
        if (sources.length === 0) sources = ['교과서_English I.md', '2023_9월_모의고사.txt', '부교재_올림포스.md'];

        // 2. Setup Target Names (Generation Basis)
        let targets = targetFiles.map(f => f.name);
        // Fallback: if no target files, use sources for variation (generative variations of same text)
        if (targets.length === 0) targets = sources.map(s => s + " (심화변형)");

        // 3. Generate Questions (Strict Logic)
        const totalQuestions = 25; // Standard Korean Exam Size
        const questions = [];
        const sourceCounts = {};
        sources.forEach(s => sourceCounts[s] = 0);

        // Define Professional Categories
        const objCategories = ['주제 추론', '함축 의미', '요지 파악', '어법성 판단(밑줄)', '어휘 적절성(반의어)', '빈칸 추론(단어)', '빈칸 추론(장문)', '무관한 문장', '글의 순서 A-B-C', '문장 삽입', '요약문 완성'];
        const subCategories = ['조건 영작', '요약문 빈칸 채우기', '어법 오류 수정', '지칭 대상 서술'];

        for (let i = 1; i <= totalQuestions; i++) {
            // Weighted Random Source
            const srcIndex = Math.floor(Math.random() * sources.length);
            const source = sources[srcIndex];
            sourceCounts[source]++;

            const isSub = i >= 20; // 20~25 are subjective
            questions.push({
                no: i,
                type: isSub ? '서술형' : '객관식',
                category: isSub ? subCategories[i % subCategories.length] : objCategories[i % objCategories.length],
                source: source,
                modified: Math.random() > 0.3 // 70% modification rate for realism
            });
        }

        // 4. Summarize Scope
        const scopeSummary = sources.map(s => ({
            source: s,
            count: sourceCounts[s],
            percentage: ((sourceCounts[s] / totalQuestions) * 100).toFixed(1)
        })).sort((a, b) => b.count - a.count);

        // 5. Killer Analysis (Professional Text)
        const killerQ = questions.find(q => q.category.includes('빈칸') || q.category.includes('어법')) || questions[15];

        // 6. Variations (Apply Pattern to Target)
        const variations = [];
        // Generate 2 examples
        variations.push({
            type: '객관식',
            source: targets[0] || "신규 범위 (Target)",
            questionText: "다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?",
            passage: "In the realm of physics, the observer effect suggests that the mere act of observation ________ the phenomenon being observed. This presents a unique challenge to...",
            choices: ["1. alters", "2. preserves", "3. distorts", "4. influences", "5. modifies"],
            answer: "2. preserves (보존한다)",
            explanation: "관찰자 효과(Observer Effect)의 핵심은 관찰 행위가 대상을 변화시킨다는 것입니다. 따라서 'preserves(보존한다)'는 글의 요지와 정반대되는 진술입니다."
        });

        variations.push({
            type: '서술형',
            source: targets[Math.floor(Math.random() * targets.length)] || "신규 범위",
            questionText: "다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B)에 들어갈 말을 본문에서 찾아 쓰시오.",
            passage: "History is not merely a collection of dates, but a complex tapestry of cause and effect. (A) ________ understanding the context, we cannot hope to (B) ________ the future.",
            choices: null,
            answer: "(A) Without, (B) predict",
            explanation: "조건문 맥락에서 문맥 이해 없이는 미래 예측이 불가능하다는 논리 구조가 필요합니다."
        });

        return {
            scope: scopeSummary,
            questions: questions,
            killerAnalysis: {
                questionNo: killerQ.no,
                reason: `이 문항은 <strong>${killerQ.category}</strong> 유형으로, 원문의 핵심 어휘를 반의어로 변형하여(Paraphrasing) 오답을 유도하는 '매력적 오답' 전략이 사용되었습니다. 단순 해석을 넘어 문맥의 논리적 모순을 발견해야 합니다.`,
                difficulty: "최상 (정답률 예상 30% 미만)"
            },
            strategy: {
                summary: `이번 시험은 <strong>${scopeSummary[0].source}</strong>의 비중이 <strong>${scopeSummary[0].percentage}%</strong>로 핵심적인 변별력을 가집니다. 특히 객관식 중반부에서 <strong>추론형 문항(빈칸, 함축의미)</strong>이 다수 배치되어 체감 난이도가 높을 것으로 예상됩니다.`,
                tips: [
                    "<strong>조건 영작(서술형)</strong>: 신규 범위 어휘를 활용한 구문 전환(Transformation) 연습 집중",
                    "<strong>어법성 판단</strong>: 관계사/접속사 파트의 2중 한정 구분 문제 대비",
                    "<strong>흐름 파악</strong>: 접속사가 생략된 글의 논리 구조 재구성 훈련 필요"
                ]
            },
            variations: { problems: variations }
        };
    }
});
