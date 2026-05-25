/**
 * 文件管理模块
 */
(function () {
    const container = document.getElementById('page-files');
    container.innerHTML = `
        <div class="files-header">
            <div>
                <h1 class="page-title">文件管理</h1>
                <p class="page-desc">已上传文件列表</p>
            </div>
            <button class="btn btn-primary" onclick="loadFileList()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:-2px"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                刷新
            </button>
        </div>
        <div class="files-table-wrapper">
            <table class="files-table">
                <thead>
                    <tr>
                        <th>文件名</th>
                        <th>大小</th>
                        <th>状态</th>
                        <th>上传时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody id="filesTableBody">
                    <tr><td colspan="5" class="empty-state">暂无文件</td></tr>
                </tbody>
            </table>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .files-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
        }
        .files-table-wrapper {
            background: #fff;
            border-radius: 12px;
            border: 1px solid var(--border);
            overflow: hidden;
        }
        .files-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        .files-table th {
            text-align: left;
            padding: 12px 16px;
            background: var(--bg);
            font-weight: 500;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border);
            white-space: nowrap;
        }
        .files-table td {
            padding: 12px 16px;
            border-bottom: 1px solid var(--border);
            vertical-align: middle;
        }
        .files-table tr:last-child td { border-bottom: none; }
        .files-table tr:hover td { background: var(--bg); }
        .empty-state {
            text-align: center;
            color: var(--text-secondary);
            padding: 48px 16px !important;
        }
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 500;
        }
        .status-done { background: #ecfdf5; color: #065f46; }
        .status-uploading { background: #eff6ff; color: #1e40af; }
        .status-merging { background: #fef3c7; color: #92400e; }
        .status-error { background: #fef2f2; color: #991b1b; }
        .action-link {
            color: var(--accent);
            text-decoration: none;
            font-size: 12px;
            cursor: pointer;
        }
        .action-link:hover { text-decoration: underline; }
    `;
    document.head.appendChild(style);

    window.loadFileList = async function () {
        try {
            const res = await fetch('/upload/list');
            const data = await res.json();
            if (!data.success) return;

            const tbody = document.getElementById('filesTableBody');
            if (!data.data || data.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="empty-state">暂无文件</td></tr>';
                return;
            }

            tbody.innerHTML = data.data.map(file => `
                <tr>
                    <td title="${file.filename}">
                        <span style="max-width:240px;display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle">
                            ${escapeHtml(file.filename)}
                        </span>
                    </td>
                    <td>${formatSize(file.size)}</td>
                    <td><span class="status-badge status-${file.status}">${statusText(file.status)}</span></td>
                    <td>${formatDate(file.createdAt)}</td>
                    <td>
                        ${file.path ? `<a class="action-link" href="${file.path}" target="_blank" download>下载</a>` : '-'}
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            document.getElementById('filesTableBody').innerHTML =
                `<tr><td colspan="5" class="empty-state">加载失败: ${err.message}</td></tr>`;
        }
    };

    function statusText(status) {
        const map = { done: '已完成', uploading: '上传中', merging: '合并中', error: '失败' };
        return map[status] || status;
    }

    function formatSize(bytes) {
        if (!bytes) return '-';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function formatDate(ts) {
        if (!ts) return '-';
        const d = new Date(ts);
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
})();
