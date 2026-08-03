// ============================================================
// 辅助功能：禁用移动端/桌面端的一些默认行为
// ============================================================

// 禁用双击放大（尤其对移动端）
document.addEventListener('dblclick', function (e) {
    e.preventDefault();
}, { passive: false });

// 禁用长按上下文菜单（复制/粘贴等）
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

// 禁用文字选择（避免干扰点击交互）
document.addEventListener('selectstart', function (e) {
    e.preventDefault();
});

// ============================================================
// 可选的输入框回车键行为（仅做UI提示，具体逻辑由Vue处理）
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    const userInput = document.getElementById('input');
    if (userInput) {
        userInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                // 这里仅保留一个空操作，或触发一个自定义事件，
                // 但为了避免与Vue冲突，我们什么都不做。
                // 实际回车确认已在Vue中通过全局键盘监听实现。
                // 此处的存在只是为了保留原有结构，但不影响功能。
            }
        });
    }
});

// 注：原文件中的数字键盘、确认按钮、axios请求等全部移除，
// 因为相关交互已由 HTML 中的 Vue 实例完整接管，且所有数据均存储在 localStorage 中。