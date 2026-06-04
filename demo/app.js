document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const historyList = document.getElementById('history-list');
    const newAnalysisBtn = document.getElementById('new-analysis-btn');
    const mainContent = document.getElementById('main-content');
    
    // State
    let analyses = [];
    let activeAnalysisId = null;
    let pollingInterval = null;

    // Helper: Format Time Strings (MM:SS) to Seconds
    function parseTimestampToSeconds(timeStr) {
        if (!timeStr) return 0;
        
        // Clean the string: remove any extra spaces
        let str = timeStr.toString().trim();
        
        // If there's a range like "00:02 - 00:05", split and take the first one
        if (str.includes('-')) {
            str = str.split('-')[0].trim();
        }
        
        // Extract all digits and colons (e.g. from "[00:02]" or "00:02s")
        const cleanMatch = str.match(/[\d:]+/);
        if (!cleanMatch) return 0;
        str = cleanMatch[0];
        
        const parts = str.split(':').map(Number);
        if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            return parts[0] * 60 + parts[1];
        } else if (parts.length === 1) {
            return parts[0];
        }
        return 0;
    }

    // Helper: Format Date
    function formatDate(isoStr) {
        const d = new Date(isoStr);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }

    // Load History
    async function loadHistory(selectIdAfterLoad = null) {
        try {
            const res = await fetch('/api/analyses/');
            analyses = await res.json();
            renderSidebar();
            
            if (selectIdAfterLoad) {
                selectAnalysis(selectIdAfterLoad);
            } else if (analyses.length > 0 && !activeAnalysisId) {
                selectAnalysis(analyses[0].id);
            } else if (analyses.length === 0) {
                showUploadScreen();
            }
        } catch (err) {
            console.error('Error loading history:', err);
        }
    }

    // Render Sidebar List
    function renderSidebar() {
        historyList.innerHTML = '';
        if (analyses.length === 0) {
            historyList.innerHTML = '<div style="text-align:center; padding:2rem 1rem; color:var(--text-muted); font-size:0.85rem;">No analysis history yet.</div>';
            return;
        }

        analyses.forEach(item => {
            const el = document.createElement('div');
            el.className = `history-item ${activeAnalysisId === item.id ? 'active' : ''}`;
            el.addEventListener('click', () => selectAnalysis(item.id));

            const scoreHtml = item.status === 'COMPLETED' 
                ? `<span class="score-badge">${item.creative_score.toFixed(1)}</span>`
                : `<span class="status-badge status-${item.status.toLowerCase()}">${item.status}</span>`;

            el.innerHTML = `
                <div class="history-item-header">
                    <div class="history-item-title" title="${item.original_name}">${item.original_name}</div>
                    ${scoreHtml}
                </div>
                <div class="history-item-details">
                    <span>${item.mode.replace('_', ' ')}</span>
                    <span>${formatDate(item.created_at)}</span>
                </div>
            `;
            historyList.appendChild(el);
        });
    }

    // Select Item
    async function selectAnalysis(id) {
        activeAnalysisId = id;
        renderSidebar();
        
        // Clear any active polling before starting new views
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }

        try {
            const res = await fetch(`/api/analyses/${id}/`);
            const item = await res.json();
            
            if (item.status === 'PENDING' || item.status === 'PROCESSING') {
                showProcessingScreen(item);
                startPolling(item.id);
            } else if (item.status === 'FAILED') {
                showFailedScreen(item);
            } else if (item.status === 'COMPLETED') {
                showDashboardScreen(item);
            }
        } catch (err) {
            console.error('Error loading item:', err);
            mainContent.innerHTML = `<div class="error-card"><div class="error-card-title">Error</div><div class="error-card-text">Failed to fetch analysis details: ${err.message}</div></div>`;
        }
    }

    // Poll Status
    function startPolling(id) {
        pollingInterval = setInterval(async () => {
            try {
                const res = await fetch(`/api/analyses/${id}/`);
                const item = await res.json();
                
                if (item.status === 'COMPLETED' || item.status === 'FAILED') {
                    clearInterval(pollingInterval);
                    pollingInterval = null;
                    // Reload history to refresh scores/badges
                    loadHistory(id);
                } else {
                    // Update processing status steps dynamically
                    updateProcessingSteps(item);
                }
            } catch (err) {
                console.error('Error polling status:', err);
            }
        }, 2000);
    }

    // UI: Show Upload Screen
    function showUploadScreen() {
        activeAnalysisId = null;
        renderSidebar();
        if (pollingInterval) clearInterval(pollingInterval);

        mainContent.innerHTML = `
            <div class="upload-screen">
                <div class="upload-card">
                    <h2 style="font-size:2rem; font-weight:700; margin-bottom:0.5rem;">Creative Video Analyzer</h2>
                    <p style="color:var(--text-secondary); margin-bottom:2.5rem;">Upload a mobile game ad video to run AI-powered creative scoring, hook audits, trope breakdowns, and synchronized timeline breakdowns.</p>
                    
                    <form id="upload-form">
                        <div class="upload-dropzone" id="dropzone">
                            <div class="upload-icon">⚡</div>
                            <h3 style="font-size:1.1rem; font-weight:600; margin-bottom:0.25rem;">Select Video File</h3>
                            <p>Drag and drop your video file here, or click to browse</p>
                            <p style="font-size:0.75rem; color:var(--text-muted); margin-top:0.5rem;">Supports MP4, MOV, WebM (Max 50MB)</p>
                            <input type="file" id="video-file" class="file-input" accept="video/*" required />
                        </div>
                        
                        <div id="file-info" style="display:none; text-align:left; background:rgba(255,255,255,0.02); border:1px solid var(--glass-border); border-radius:8px; padding:0.75rem 1rem; margin-bottom:1.5rem;">
                            <div style="font-weight:500; font-size:0.9rem;" id="selected-file-name">filename.mp4</div>
                            <div style="font-size:0.75rem; color:var(--text-muted);" id="selected-file-size">0 MB</div>
                        </div>

                        <div class="form-group">
                            <label for="mode-select">Analysis Execution Mode</label>
                            <select id="mode-select" class="form-select">
                                <option value="combination">Combination Mode (Gemini Audio + Gemma 31B Visual & Synthesis) - Recommended</option>
                                <option value="gemini_only">Gemini Only Mode (gemini-2.5-flash for audio & visual)</option>
                                <option value="31b_only_no_audio">Gemma 31B Visual Only Mode (gemma-4-31b-it - no audio analysis)</option>
                            </select>
                            <div class="mode-description" id="mode-desc">
                                **Combination Mode** uploads to Gemini 2.5 Flash to extract voiceover and SFX cues, then runs Ffmpeg to strip audio, and uploads silent visuals to Gemma-31B to compile a detailed, synthesized timeline.
                            </div>
                        </div>

                        <button type="submit" class="submit-btn" id="upload-submit-btn">Launch Creative Analysis</button>
                    </form>
                </div>
            </div>
        `;

        // Wire up upload form listeners
        const dropzone = document.getElementById('dropzone');
        const fileInput = document.getElementById('video-file');
        const fileInfo = document.getElementById('file-info');
        const fileNameDisp = document.getElementById('selected-file-name');
        const fileSizeDisp = document.getElementById('selected-file-size');
        const form = document.getElementById('upload-form');
        const modeSelect = document.getElementById('mode-select');
        const modeDesc = document.getElementById('mode-desc');

        modeSelect.addEventListener('change', () => {
            if (modeSelect.value === 'combination') {
                modeDesc.innerHTML = '**Combination Mode** uploads to Gemini 2.5 Flash to extract voiceover and SFX cues, strips audio with ffmpeg, and uploads silent visuals to Gemma-31B to compile a detailed, synthesized timeline.';
            } else if (modeSelect.value === 'gemini_only') {
                modeDesc.innerHTML = '**Gemini Only Mode** passes the entire video (visuals and audio) directly to Gemini 2.5 Flash for a fast, single-step analysis.';
            } else if (modeSelect.value === '31b_only_no_audio') {
                modeDesc.innerHTML = '**Gemma 31B Visual Only Mode** strips audio and processes visuals only on the Gemma-31B model. (Requires Ffmpeg on the server).';
            }
        });

        dropzone.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                updateFileInfo();
            }
        });

        fileInput.addEventListener('change', updateFileInfo);

        function updateFileInfo() {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                fileNameDisp.textContent = file.name;
                fileSizeDisp.textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
                fileInfo.style.display = 'block';
            } else {
                fileInfo.style.display = 'none';
            }
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!fileInput.files.length) return;

            const submitBtn = document.getElementById('upload-submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Uploading Video File...';

            const formData = new FormData();
            formData.append('video', fileInput.files[0]);
            formData.append('mode', modeSelect.value);

            try {
                const res = await fetch('/api/analyze/', {
                    method: 'POST',
                    body: formData
                });
                
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to submit analysis');
                }

                const result = await res.json();
                loadHistory(result.id);
            } catch (err) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Launch Creative Analysis';
                alert('Upload failed: ' + err.message);
            }
        });
    }

    // UI: Show Processing Screen
    function showProcessingScreen(item) {
        mainContent.innerHTML = `
            <div class="progress-screen">
                <div class="spinner-container">
                    <div class="spinner"></div>
                    <div class="spinner-pulse"></div>
                </div>
                <h2 class="progress-title">Analyzing Video Creative</h2>
                <p class="progress-subtitle">Synthesizing mobile gaming tropes and hooks. This can take up to 60-90 seconds.</p>
                
                <div class="progress-steps">
                    <div class="step-item" id="step-upload">
                        <div class="step-bullet">1</div>
                        <span>Upload original video to storage</span>
                    </div>
                    <div class="step-item" id="step-audio">
                        <div class="step-bullet">2</div>
                        <span>Extract audio cues and chimes (Gemini)</span>
                    </div>
                    <div class="step-item" id="step-ffmpeg">
                        <div class="step-bullet">3</div>
                        <span>Generate silent video track (FFmpeg)</span>
                    </div>
                    <div class="step-item" id="step-visual">
                        <div class="step-bullet">4</div>
                        <span>Evaluate visuals & overlays (Gemma 31B)</span>
                    </div>
                    <div class="step-item" id="step-saving">
                        <div class="step-bullet">5</div>
                        <span>Compile structured score card</span>
                    </div>
                </div>
            </div>
        `;
        updateProcessingSteps(item);
    }

    // Update steps based on state
    function updateProcessingSteps(item) {
        const stepUpload = document.getElementById('step-upload');
        const stepAudio = document.getElementById('step-audio');
        const stepFfmpeg = document.getElementById('step-ffmpeg');
        const stepVisual = document.getElementById('step-visual');
        const stepSaving = document.getElementById('step-saving');

        if (!stepUpload) return; // Guard in case view changed

        // Step 1: Upload is always completed since we have DB ID
        stepUpload.className = 'step-item completed';

        if (item.status === 'PENDING') {
            stepAudio.className = 'step-item active';
        } else if (item.status === 'PROCESSING') {
            stepUpload.className = 'step-item completed';
            
            if (item.mode === 'gemini_only') {
                // Gemini only skips step 3 & 4
                stepAudio.innerHTML = '<div class="step-bullet">2</div><span>Querying gemini-2.5-flash for complete review...</span>';
                stepAudio.className = 'step-item active';
                stepFfmpeg.style.display = 'none';
                stepVisual.style.display = 'none';
                stepSaving.className = 'step-item';
            } else if (item.mode === '31b_only_no_audio') {
                stepAudio.style.display = 'none';
                stepFfmpeg.className = 'step-item active';
                stepVisual.className = 'step-item';
                stepSaving.className = 'step-item';
            } else {
                // Combination Mode steps
                stepAudio.className = 'step-item completed';
                stepFfmpeg.className = 'step-item active';
                stepVisual.className = 'step-item';
                stepSaving.className = 'step-item';
            }
        }
    }

    // UI: Show Failed Screen
    function showFailedScreen(item) {
        mainContent.innerHTML = `
            <div style="max-width: 600px; margin: 4rem auto; text-align: center;">
                <div style="font-size: 4rem; color: var(--accent-rose); margin-bottom: 1.5rem;">❌</div>
                <h2 style="font-size: 1.8rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--accent-rose);">Creative Analysis Failed</h2>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">An error occurred while running the LLM analysis models.</p>
                
                <div class="error-card" style="text-align: left;">
                    <div class="error-card-title">Error Trace</div>
                    <div class="error-card-text">${item.error_message || 'Unknown server error.'}</div>
                </div>

                <div style="display:flex; justify-content:center; gap: 1rem; margin-top: 2rem;">
                    <button class="new-analysis-btn" style="background:var(--glass-bg); color:var(--text-primary); border:1px solid var(--glass-border);" id="fail-back-btn">Back to Upload</button>
                    <button class="new-analysis-btn" id="fail-retry-btn">Retry Analysis</button>
                </div>
            </div>
        `;

        document.getElementById('fail-back-btn').addEventListener('click', showUploadScreen);
        document.getElementById('fail-retry-btn').addEventListener('click', () => retryAnalysis(item.id));
    }

    // UI: Show Completed Dashboard Screen
    function showDashboardScreen(item) {
        const reports = item.raw_analysis || {};
        const timeline = reports.timeline || [];
        const trope = reports.trope_analysis || {};
        const hook = reports.hook || {};
        const audit = reports.audit || {};
        const score = reports.creative_score || item.creative_score || 0;
        const hookScore = hook.scroll_stopper_rating || item.hook_rating || 0;

        mainContent.innerHTML = `
            <div class="dashboard-screen">
                <!-- Left Column: Video & Timeline -->
                <div class="player-panel">
                    <div class="video-card">
                        <video id="video-player" controls preload="auto">
                            <source src="${item.video_url}" type="video/mp4">
                            Your browser does not support the HTML5 video tag.
                        </video>
                        <div class="video-info-strip">
                            <div class="video-name" title="${item.original_name}">${item.original_name}</div>
                            <button class="reanalyze-btn" id="reanalyze-btn">Re-run Analysis</button>
                        </div>
                    </div>

                    <div class="timeline-container">
                        <h3>Chronological Video Timeline</h3>
                        <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:1rem; display:flex; gap:0.25rem; align-items:center;">
                            <span>💡</span>
                            <span>Click on any timeline card below to jump to that moment in the video.</span>
                        </div>
                        <div class="timeline-list" id="timeline-list">
                            <!-- Timeline Cards render here -->
                        </div>
                    </div>
                </div>

                <!-- Right Column: Audit Dashboard Reports -->
                <div class="report-panel">
                    <!-- Scores Summary Grid -->
                    <div class="scores-summary-card">
                        <div class="score-box">
                            <div style="position:relative; display:flex; align-items:center; justify-content:center;">
                                <svg class="gauge-svg">
                                    <defs>
                                        <linearGradient id="cyan-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stop-color="var(--accent-cyan)" />
                                            <stop offset="100%" stop-color="var(--accent-blue)" />
                                        </linearGradient>
                                    </defs>
                                    <circle class="gauge-bg" cx="60" cy="60" r="50"></circle>
                                    <circle class="gauge-fill gauge-fill-score" id="creative-gauge" cx="60" cy="60" r="50"></circle>
                                </svg>
                                <span class="score-label" id="score-val">0.0</span>
                            </div>
                            <div class="score-box-title">Creative CTR Score</div>
                            <div class="score-desc">Estimated conversion power (1.0 - 10.0)</div>
                        </div>

                        <div class="score-box">
                            <div style="position:relative; display:flex; align-items:center; justify-content:center;">
                                <svg class="gauge-svg">
                                    <defs>
                                        <linearGradient id="purple-pink-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stop-color="var(--accent-purple)" />
                                            <stop offset="100%" stop-color="var(--accent-rose)" />
                                        </linearGradient>
                                    </defs>
                                    <circle class="gauge-bg" cx="60" cy="60" r="50"></circle>
                                    <circle class="gauge-fill gauge-fill-hook" id="hook-gauge" cx="60" cy="60" r="50"></circle>
                                </svg>
                                <span class="score-label" id="hook-val">0</span>
                            </div>
                            <div class="score-box-title">Hook Stopper Rating</div>
                            <div class="score-desc">First 3s retention potential (1 - 10)</div>
                        </div>
                    </div>

                    <!-- Trope Analysis Details -->
                    <div class="trope-card">
                        <h3>🎯 Game Ad Trope Profile</h3>
                        <div class="trope-grid">
                            <div class="trope-item">
                                <div class="trope-title">Ad Format Type</div>
                                <div class="trope-value">${trope.ad_format_type || 'N/A'}</div>
                            </div>
                            <div class="trope-item">
                                <div class="trope-title">Gameplay Mechanics</div>
                                <div class="trope-value">${trope.gameplay_type_shown || 'N/A'}</div>
                            </div>
                            <div class="trope-item">
                                <div class="trope-title">Has Story Sequence?</div>
                                <div class="trope-value">${trope.has_story_narrative ? 'Yes' : 'No'}</div>
                            </div>
                            <div class="trope-item">
                                <div class="trope-title">Fail Ad Format?</div>
                                <div class="trope-value">${trope.is_fail_ad ? 'Yes' : 'No'}</div>
                            </div>
                            ${trope.story_summary ? `
                            <div class="trope-item trope-item-full">
                                <div class="trope-title">Narrative Plot Summary</div>
                                <div class="trope-value" style="font-weight:normal; line-height:1.45;">${trope.story_summary}</div>
                            </div>` : ''}
                        </div>
                    </div>

                    <!-- Hook Breakdown -->
                    <div class="hook-card">
                        <h3 style="display:flex; justify-content:space-between; align-items:center;">
                            <span>🪝 Visual Hook Audit</span>
                            <span style="font-size:0.8rem; background:rgba(139, 92, 246, 0.15); color:var(--accent-purple); padding:0.25rem 0.5rem; border-radius:4px;">${hook.hook_type || 'N/A'}</span>
                        </h3>
                        <div class="hook-desc">${hook.analysis || 'No Hook Analysis provided.'}</div>
                        ${hook.suggestions ? `
                        <div class="hook-sugg-box">
                            <div class="hook-sugg-title">Optimized Hook Suggestion</div>
                            <div class="hook-sugg-content">${hook.suggestions}</div>
                        </div>` : ''}
                    </div>

                    <!-- Strengths and Weaknesses -->
                    <div class="audit-container">
                        <div class="audit-column audit-good">
                            <h3>👍 What Went Well</h3>
                            <div class="audit-list" id="strengths-list">
                                <!-- Strengths -->
                            </div>
                        </div>
                        <div class="audit-column audit-bad">
                            <h3>👎 What Went Wrong</h3>
                            <div class="audit-list" id="weaknesses-list">
                                <!-- Weaknesses -->
                            </div>
                        </div>
                    </div>

                    <!-- Actionable UA Feedback Recommendations -->
                    <div class="rec-card">
                        <h3>🚀 Actionable UA Creative Optimization</h3>
                        <div class="rec-list" id="recs-list">
                            <!-- Recommendations -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Interactive Video Seeking Logic
        const videoPlayer = document.getElementById('video-player');
        const timelineList = document.getElementById('timeline-list');

        timeline.forEach(seg => {
            const card = document.createElement('div');
            card.className = 'timeline-segment-card';
            
            // On click, parse time and seek video
            card.addEventListener('click', () => {
                const seconds = parseTimestampToSeconds(seg.timestamp_start);
                if (videoPlayer) {
                    videoPlayer.currentTime = seconds;
                    
                    // Attempt playback
                    const playPromise = videoPlayer.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.log("Autoplay prevented, trying with video muted...");
                            videoPlayer.muted = true;
                            videoPlayer.play().catch(e => console.error("Video play failed:", e));
                        });
                    }
                }
                
                // Highlight active card
                document.querySelectorAll('.timeline-segment-card').forEach(c => c.style.borderColor = '');
                card.style.borderColor = 'var(--accent-cyan)';
            });

            card.innerHTML = `
                <div class="segment-header">
                    <span class="segment-time">⏱ ${seg.timestamp_start} - ${seg.timestamp_end}</span>
                    <span class="segment-pacing">${seg.pacing_and_emotion}</span>
                </div>
                <div class="segment-desc"><strong>Visuals:</strong> ${seg.visuals}</div>
                <div class="segment-audio">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    <div><strong>Audio:</strong> ${seg.audio}</div>
                </div>
            `;
            timelineList.appendChild(card);
        });

        // Load Strengths
        const strengthsList = document.getElementById('strengths-list');
        const goodItems = audit.what_went_well || [];
        if (goodItems.length === 0) {
            strengthsList.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem;">No strengths listed.</div>';
        } else {
            goodItems.forEach(text => {
                strengthsList.innerHTML += `<div class="audit-item"><span class="audit-icon">✓</span><div>${text}</div></div>`;
            });
        }

        // Load Weaknesses
        const weaknessesList = document.getElementById('weaknesses-list');
        const badItems = audit.what_went_wrong || [];
        if (badItems.length === 0) {
            weaknessesList.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem;">No friction points listed.</div>';
        } else {
            badItems.forEach(text => {
                weaknessesList.innerHTML += `<div class="audit-item"><span class="audit-icon">✗</span><div>${text}</div></div>`;
            });
        }

        // Load Actionable UA recommendations
        const recsList = document.getElementById('recs-list');
        const recItems = audit.actionable_feedback || [];
        if (recItems.length === 0) {
            recsList.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem;">No recommendations generated.</div>';
        } else {
            recItems.forEach((text, i) => {
                recsList.innerHTML += `
                    <div class="rec-item">
                        <div class="rec-num">${i + 1}</div>
                        <div class="rec-text">${text}</div>
                    </div>
                `;
            });
        }

        // Animate Radial Gauges
        setTimeout(() => {
            animateGauge('creative-gauge', 'score-val', score, 10);
            animateGauge('hook-gauge', 'hook-val', hookScore, 10, true);
        }, 100);

        // Wire Re-run Analysis
        document.getElementById('reanalyze-btn').addEventListener('click', () => retryAnalysis(item.id));
    }

    // Radial Gauge Animation
    function animateGauge(gaugeId, valId, value, maxVal, isInt = false) {
        const gaugeFill = document.getElementById(gaugeId);
        const valText = document.getElementById(valId);
        if (!gaugeFill || !valText) return;

        const maxOffset = 314.16; // 2 * PI * r (r=50)
        const percent = Math.min(value / maxVal, 1.0);
        const targetOffset = maxOffset * (1 - percent);
        
        gaugeFill.style.strokeDashoffset = targetOffset;
        
        // Counter animation
        let count = 0;
        const duration = 1000; // 1s
        const steps = 60;
        const stepVal = value / steps;
        const stepTime = duration / steps;
        
        const counter = setInterval(() => {
            count += stepVal;
            if (count >= value) {
                clearInterval(counter);
                valText.textContent = isInt ? Math.round(value) : value.toFixed(1);
            } else {
                valText.textContent = isInt ? Math.round(count) : count.toFixed(1);
            }
        }, stepTime);
    }

    // Retry/Re-run Request
    async function retryAnalysis(id) {
        if (!confirm('Are you sure you want to re-run the creative analysis for this video?')) return;
        
        try {
            const res = await fetch(`/api/analyses/${id}/reanalyze/`, {
                method: 'POST'
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || 'Failed to trigger reanalysis');
            loadHistory(id);
        } catch (err) {
            alert('Reanalysis trigger failed: ' + err.message);
        }
    }

    // Bind Event Listeners
    newAnalysisBtn.addEventListener('click', showUploadScreen);

    // Initial Load
    loadHistory();
});
