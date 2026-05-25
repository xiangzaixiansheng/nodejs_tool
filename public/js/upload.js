/**
 * 分片上传模块
 */
(function () {
    const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB per chunk
    const MAX_CONCURRENT = 3; // 最大并发上传数

    let currentFile = null;
    let uploadState = null; // { uploadId, totalChunks, uploadedChunks, status }

    const container = document.getElementById('page-upload');
    container.innerHTML = `
        <h1 class="page-title">分片上传</h1>
        <p class="page-desc">支持大文件分片上传，断点续传，多并发上传</p>

        <div class="upload-card">
            <div class="upload-zone" id="dropZone">
                <div class="upload-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                </div>
                <p class="upload-text">将文件拖拽到此处，或 <label for="fileInput" class="upload-link">点击选择文件</label></p>
                <p class="upload-hint">支持任意文件类型，单文件最大 100MB</p>
                <input type="file" id="fileInput" style="display: none" />
            </div>

            <!-- 文件信息 -->
            <div class="file-info" id="fileInfo" style="display:none">
                <div class="file-meta">
                    <div class="file-name" id="fileName"></div>
                    <div class="file-size" id="fileSize"></div>
                </div>
                <div class="file-actions">
                    <button class="btn btn-primary" id="btnUpload" onclick="startUpload()">开始上传</button>
                    <button class="btn btn-secondary" id="btnPause" onclick="pauseUpload()" style="display:none">暂停</button>
                    <button class="btn btn-secondary" id="btnResume" onclick="resumeUpload()" style="display:none">继续</button>
                    <button class="btn btn-ghost" id="btnCancel" onclick="cancelUpload()">取消</button>
                </div>
            </div>

            <!-- 进度 -->
            <div class="progress-section" id="progressSection" style="display:none">
                <div class="progress-header">
                    <span id="progressText">上传中...</span>
                    <span id="progressPercent">0%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill" style="width: 0%"></div>
                </div>
                <div class="progress-detail">
                    <span id="chunkDetail">0 / 0 分片</span>
                    <span id="speedText"></span>
                </div>
            </div>

            <!-- 上传完成 -->
            <div class="upload-success" id="uploadSuccess" style="display:none">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span>上传完成</span>
            </div>
        </div>

        <!-- 配置面板 -->
        <div class="config-panel">
            <h3>上传配置</h3>
            <div class="config-grid">
                <div class="config-item">
                    <label>分片大小</label>
                    <select id="chunkSizeSelect">
                        <option value="1048576">1 MB</option>
                        <option value="2097152" selected>2 MB</option>
                        <option value="5242880">5 MB</option>
                        <option value="10485760">10 MB</option>
                    </select>
                </div>
                <div class="config-item">
                    <label>并发数</label>
                    <select id="concurrencySelect">
                        <option value="1">1</option>
                        <option value="3" selected>3</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                    </select>
                </div>
            </div>
        </div>
    `;

    // Styles
    const style = document.createElement('style');
    style.textContent = `
        .upload-card {
            background: #fff;
            border-radius: 12px;
            padding: 24px;
            border: 1px solid var(--border);
            margin-bottom: 20px;
        }
        .upload-zone {
            border: 2px dashed var(--border);
            border-radius: var(--radius);
            padding: 48px 24px;
            text-align: center;
            transition: all 0.2s;
            cursor: pointer;
        }
        .upload-zone:hover, .upload-zone.drag-over {
            border-color: var(--accent);
            background: var(--accent-light);
        }
        .upload-icon { margin-bottom: 12px; }
        .upload-text { font-size: 14px; color: var(--text); margin-bottom: 4px; }
        .upload-link { color: var(--accent); cursor: pointer; font-weight: 500; }
        .upload-hint { font-size: 12px; color: var(--text-secondary); }

        .file-info {
            margin-top: 16px;
            padding: 16px;
            background: var(--bg);
            border-radius: var(--radius);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .file-name { font-weight: 500; font-size: 14px; }
        .file-size { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
        .file-actions { display: flex; gap: 8px; }

        .btn {
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            border: none;
            transition: all 0.15s;
        }
        .btn-primary { background: var(--accent); color: #fff; }
        .btn-primary:hover { background: #4338ca; }
        .btn-primary:disabled { background: #a5b4fc; cursor: not-allowed; }
        .btn-secondary { background: #f3f4f6; color: var(--text); border: 1px solid var(--border); }
        .btn-secondary:hover { background: #e5e7eb; }
        .btn-ghost { background: transparent; color: var(--text-secondary); }
        .btn-ghost:hover { color: var(--text); background: #f3f4f6; }

        .progress-section { margin-top: 16px; }
        .progress-header { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
        .progress-bar { height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--accent); border-radius: 4px; transition: width 0.3s; }
        .progress-detail { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); margin-top: 6px; }

        .upload-success {
            margin-top: 16px;
            padding: 12px 16px;
            background: #ecfdf5;
            border-radius: var(--radius);
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #065f46;
            font-weight: 500;
        }

        .config-panel {
            background: #fff;
            border-radius: 12px;
            padding: 20px 24px;
            border: 1px solid var(--border);
        }
        .config-panel h3 { font-size: 14px; font-weight: 600; margin-bottom: 12px; }
        .config-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
        .config-item label { display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
        .config-item select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--border);
            border-radius: 6px;
            font-size: 13px;
            background: #fff;
        }
    `;
    document.head.appendChild(style);

    // Drop zone events
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
            selectFile(e.dataTransfer.files[0]);
        }
    });
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            selectFile(e.target.files[0]);
        }
    });

    function selectFile(file) {
        currentFile = file;
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = formatSize(file.size);
        document.getElementById('fileInfo').style.display = 'flex';
        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('uploadSuccess').style.display = 'none';
        document.getElementById('btnUpload').style.display = '';
        document.getElementById('btnPause').style.display = 'none';
        document.getElementById('btnResume').style.display = 'none';
        uploadState = null;
    }

    let paused = false;
    let activeRequests = [];

    window.startUpload = async function () {
        if (!currentFile) return;
        paused = false;

        const chunkSize = parseInt(document.getElementById('chunkSizeSelect').value, 10);
        const concurrency = parseInt(document.getElementById('concurrencySelect').value, 10);
        const totalChunks = Math.ceil(currentFile.size / chunkSize);

        document.getElementById('btnUpload').style.display = 'none';
        document.getElementById('btnPause').style.display = '';
        document.getElementById('progressSection').style.display = '';
        document.getElementById('uploadSuccess').style.display = 'none';

        try {
            // Step 1: Init upload
            const initRes = await fetch('/upload/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: currentFile.name,
                    totalSize: currentFile.size,
                    chunkSize,
                }),
            });
            const initData = await initRes.json();
            if (!initData.success) throw new Error(initData.error);

            const { uploadId } = initData.data;
            uploadState = { uploadId, totalChunks, uploadedChunks: new Set(), status: 'uploading' };

            // Step 2: Upload chunks with concurrency
            const startTime = Date.now();
            let uploadedBytes = 0;

            const uploadChunk = async (index) => {
                if (paused || uploadState.uploadedChunks.has(index)) return;

                const start = index * chunkSize;
                const end = Math.min(start + chunkSize, currentFile.size);
                const blob = currentFile.slice(start, end);

                const formData = new FormData();
                formData.append('chunk', blob, `chunk-${index}`);
                formData.append('uploadId', uploadId);
                formData.append('chunkIndex', String(index));

                const res = await fetch('/upload/chunk', { method: 'POST', body: formData });
                const data = await res.json();
                if (!data.success) throw new Error(data.error);

                uploadState.uploadedChunks.add(index);
                uploadedBytes += (end - start);

                // Update progress
                const progress = Math.round((uploadState.uploadedChunks.size / totalChunks) * 100);
                document.getElementById('progressFill').style.width = `${progress}%`;
                document.getElementById('progressPercent').textContent = `${progress}%`;
                document.getElementById('chunkDetail').textContent = `${uploadState.uploadedChunks.size} / ${totalChunks} 分片`;

                const elapsed = (Date.now() - startTime) / 1000;
                const speed = uploadedBytes / elapsed;
                document.getElementById('speedText').textContent = `${formatSize(speed)}/s`;
            };

            // Concurrent upload
            const indices = Array.from({ length: totalChunks }, (_, i) => i);
            await concurrentRun(indices, uploadChunk, concurrency);

            if (paused) return;

            // Step 3: Merge
            document.getElementById('progressText').textContent = '合并中...';
            const mergeRes = await fetch('/upload/merge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uploadId }),
            });
            const mergeData = await mergeRes.json();
            if (!mergeData.success) throw new Error(mergeData.error);

            // Done
            uploadState.status = 'done';
            document.getElementById('progressSection').style.display = 'none';
            document.getElementById('uploadSuccess').style.display = 'flex';
            document.getElementById('btnPause').style.display = 'none';
            document.getElementById('btnCancel').style.display = 'none';

        } catch (err) {
            document.getElementById('progressText').textContent = `上传失败: ${err.message}`;
            document.getElementById('btnPause').style.display = 'none';
            document.getElementById('btnResume').style.display = '';
        }
    };

    window.pauseUpload = function () {
        paused = true;
        document.getElementById('btnPause').style.display = 'none';
        document.getElementById('btnResume').style.display = '';
        document.getElementById('progressText').textContent = '已暂停';
    };

    window.resumeUpload = async function () {
        if (!uploadState || !currentFile) return;
        paused = false;
        document.getElementById('btnPause').style.display = '';
        document.getElementById('btnResume').style.display = 'none';
        document.getElementById('progressText').textContent = '上传中...';

        const chunkSize = parseInt(document.getElementById('chunkSizeSelect').value, 10);
        const concurrency = parseInt(document.getElementById('concurrencySelect').value, 10);
        const { uploadId, totalChunks } = uploadState;

        try {
            const startTime = Date.now();
            let uploadedBytes = uploadState.uploadedChunks.size * chunkSize;

            const uploadChunk = async (index) => {
                if (paused || uploadState.uploadedChunks.has(index)) return;

                const start = index * chunkSize;
                const end = Math.min(start + chunkSize, currentFile.size);
                const blob = currentFile.slice(start, end);

                const formData = new FormData();
                formData.append('chunk', blob, `chunk-${index}`);
                formData.append('uploadId', uploadId);
                formData.append('chunkIndex', String(index));

                const res = await fetch('/upload/chunk', { method: 'POST', body: formData });
                const data = await res.json();
                if (!data.success) throw new Error(data.error);

                uploadState.uploadedChunks.add(index);
                uploadedBytes += (end - start);

                const progress = Math.round((uploadState.uploadedChunks.size / totalChunks) * 100);
                document.getElementById('progressFill').style.width = `${progress}%`;
                document.getElementById('progressPercent').textContent = `${progress}%`;
                document.getElementById('chunkDetail').textContent = `${uploadState.uploadedChunks.size} / ${totalChunks} 分片`;

                const elapsed = (Date.now() - startTime) / 1000;
                if (elapsed > 0) {
                    const speed = (uploadedBytes - uploadState.uploadedChunks.size * chunkSize + (end - start)) / elapsed;
                    document.getElementById('speedText').textContent = `${formatSize(speed)}/s`;
                }
            };

            const remaining = Array.from({ length: totalChunks }, (_, i) => i)
                .filter(i => !uploadState.uploadedChunks.has(i));
            await concurrentRun(remaining, uploadChunk, concurrency);

            if (paused) return;

            // Merge
            document.getElementById('progressText').textContent = '合并中...';
            const mergeRes = await fetch('/upload/merge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uploadId }),
            });
            const mergeData = await mergeRes.json();
            if (!mergeData.success) throw new Error(mergeData.error);

            uploadState.status = 'done';
            document.getElementById('progressSection').style.display = 'none';
            document.getElementById('uploadSuccess').style.display = 'flex';
            document.getElementById('btnPause').style.display = 'none';
            document.getElementById('btnCancel').style.display = 'none';
        } catch (err) {
            document.getElementById('progressText').textContent = `上传失败: ${err.message}`;
            document.getElementById('btnPause').style.display = 'none';
            document.getElementById('btnResume').style.display = '';
        }
    };

    window.cancelUpload = function () {
        paused = true;
        currentFile = null;
        uploadState = null;
        document.getElementById('fileInfo').style.display = 'none';
        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('uploadSuccess').style.display = 'none';
        document.getElementById('btnCancel').style.display = '';
        fileInput.value = '';
    };

    async function concurrentRun(items, fn, limit) {
        const executing = new Set();
        for (const item of items) {
            if (paused) break;
            const p = fn(item).then(() => executing.delete(p));
            executing.add(p);
            if (executing.size >= limit) {
                await Promise.race(executing);
            }
        }
        await Promise.all(executing);
    }

    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
})();
