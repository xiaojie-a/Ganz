// sync-gitee.js - Gitee 同步核心模块

const GITEE_CONFIG = {
    // 替换为你的信息
    owner: 'jikezhan',      // 例如: 'zhangsan'
    repo: 'finance-data',          // 仓库名
    path: 'data.json',             // 文件路径
    token: '4cd1726b6a4f5bac7025c2a6a625ba90'     // 例如: 'abc123...'
};

const API_BASE = 'https://gitee.com/api/v5';

// ============================================================
// 1. 获取文件的 SHA
// ============================================================
async function getFileSHA() {
    const url = `${API_BASE}/repos/${GITEE_CONFIG.owner}/${GITEE_CONFIG.repo}/contents/${GITEE_CONFIG.path}`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITEE_CONFIG.token}`,
                'Accept': 'application/json'
            }
        });
        
        if (response.status === 404) {
            return null;
        }
        
        if (!response.ok) {
            throw new Error(`获取文件失败: ${response.status}`);
        }
        
        const data = await response.json();
        return data.sha;
    } catch (error) {
        console.error('获取文件SHA失败:', error);
        return null;
    }
}

// ============================================================
// 2. 从 Gitee 拉取数据
// ============================================================
async function pullFromGitee() {
    const url = `${API_BASE}/repos/${GITEE_CONFIG.owner}/${GITEE_CONFIG.repo}/contents/${GITEE_CONFIG.path}`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITEE_CONFIG.token}`,
                'Accept': 'application/json'
            }
        });
        
        if (response.status === 404) {
            console.log('📭 云端无数据，首次使用');
            return null;
        }
        
        if (!response.ok) {
            throw new Error(`拉取失败: ${response.status}`);
        }
        
        const data = await response.json();
        // Gitee 返回的内容是 Base64 编码
        const content = atob(data.content);
        const jsonData = JSON.parse(content);
        
        console.log('📥 从 Gitee 拉取数据成功');
        return jsonData;
    } catch (error) {
        console.error('拉取数据失败:', error);
        return null;
    }
}

// ============================================================
// 3. 上传数据到 Gitee
// ============================================================
async function pushToGitee(data) {
    const sha = await getFileSHA();
    
    // 将数据转为 Base64
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
    
    const url = `${API_BASE}/repos/${GITEE_CONFIG.owner}/${GITEE_CONFIG.repo}/contents/${GITEE_CONFIG.path}`;
    
    const body = {
        message: `更新数据 ${new Date().toLocaleString()}`,
        content: content,
        branch: 'master'
    };
    
    if (sha) {
        body.sha = sha;
    }
    
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITEE_CONFIG.token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`上传失败: ${error.message || response.status}`);
        }
        
        console.log('📤 数据上传到 Gitee 成功');
        return true;
    } catch (error) {
        console.error('上传数据失败:', error);
        return false;
    }
}

// ============================================================
// 4. 合并本地和远程数据
// ============================================================
function mergeData(localData, remoteData) {
    if (!remoteData) return localData;
    if (!localData) return remoteData;
    
    const merged = {
        platforms: [],
        srys: [],
        ...remoteData
    };
    
    // 合并平台
    const platformMap = new Map();
    for (const p of (remoteData.platforms || [])) {
        platformMap.set(p.id, p);
    }
    for (const p of (localData.platforms || [])) {
        platformMap.set(p.id, p);
    }
    merged.platforms = Array.from(platformMap.values());
    
    // 合并每个平台的数据
    for (const p of merged.platforms) {
        const remoteItems = remoteData[p.id] || [];
        const localItems = localData[p.id] || [];
        const itemMap = new Map();
        for (const item of remoteItems) {
            itemMap.set(item.id, item);
        }
        for (const item of localItems) {
            itemMap.set(item.id, item);
        }
        merged[p.id] = Array.from(itemMap.values());
    }
    
    // 合并 srys
    const srysMap = new Map();
    for (const item of (remoteData.srys || [])) {
        srysMap.set(item.id, item);
    }
    for (const item of (localData.srys || [])) {
        srysMap.set(item.id, item);
    }
    merged.srys = Array.from(srysMap.values());
    
    return merged;
}

// ============================================================
// 5. 导出所有本地数据
// ============================================================
function gatherLocalData() {
    const data = {
        platforms: JSON.parse(localStorage.getItem('platforms_list') || '[]'),
        srys: JSON.parse(localStorage.getItem('srys_data') || '[]')
    };
    
    for (const p of data.platforms) {
        const key = 'platform_' + p.id + '_data';
        data[p.id] = JSON.parse(localStorage.getItem(key) || '[]');
    }
    
    return data;
}

// ============================================================
// 6. 将数据写入 localStorage
// ============================================================
function writeToLocal(data) {
    if (data.platforms) {
        localStorage.setItem('platforms_list', JSON.stringify(data.platforms));
    }
    if (data.srys) {
        localStorage.setItem('srys_data', JSON.stringify(data.srys));
    }
    for (const p of (data.platforms || [])) {
        if (data[p.id]) {
            const key = 'platform_' + p.id + '_data';
            localStorage.setItem(key, JSON.stringify(data[p.id]));
        }
    }
}

// ============================================================
// 7. 同步主流程
// ============================================================
async function syncWithGitee() {
    console.log('🔄 正在同步...');
    
    try {
        // 1. 从 Gitee 拉取
        const remoteData = await pullFromGitee();
        
        // 2. 收集本地数据
        const localData = gatherLocalData();
        
        // 3. 合并数据
        const merged = mergeData(localData, remoteData);
        
        // 4. 写回本地
        writeToLocal(merged);
        
        // 5. 上传到 Gitee
        const success = await pushToGitee(merged);
        
        if (success) {
            console.log('✅ 同步完成！');
            return { success: true, data: merged };
        } else {
            console.log('⚠️ 同步完成，但上传失败');
            return { success: false, data: merged };
        }
    } catch (error) {
        console.error('同步失败:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================
// 8. 仅拉取（不合并上传）
// ============================================================
async function pullOnly() {
    const remoteData = await pullFromGitee();
    if (remoteData) {
        writeToLocal(remoteData);
        console.log('📥 已拉取云端数据到本地');
        return remoteData;
    }
    return null;
}

// ============================================================
// 9. 仅上传（不拉取）
// ============================================================
async function pushOnly() {
    const localData = gatherLocalData();
    const success = await pushToGitee(localData);
    return success;
}

// ============================================================
// 导出（支持浏览器和 Cordova）
// ============================================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        syncWithGitee,
        pullOnly,
        pushOnly,
        gatherLocalData,
        writeToLocal,
        mergeData,
        GITEE_CONFIG
    };
} else {
    // 浏览器环境
    window.syncWithGitee = syncWithGitee;
    window.pullOnly = pullOnly;
    window.pushOnly = pushOnly;
    window.gatherLocalData = gatherLocalData;
    window.writeToLocal = writeToLocal;
    window.mergeData = mergeData;
}