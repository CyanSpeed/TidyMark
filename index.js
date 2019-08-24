"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const app = electron_1.remote.app;
const BrowserWindow = electron_1.remote.BrowserWindow;
const dialog = electron_1.remote.dialog;
const textarea = document.getElementById("textarea");
const { ipcRenderer } = require("electron");
var editor;
amdRequire.config({
    'vs/nls': {
        availableLanguages: {
            '*': 'zh-cn'
        },
    }
});
amdRequire(['vs/editor/editor.main'], () => {
    onModuleLoaded();
});
// monaco-editor初始化
function onModuleLoaded() {
    editor = monaco.editor.create(document.getElementById('monacoContainer'), {
        value: [
            '',
        ].join('\n'),
        language: 'markdown',
        automaticLayout: true,
        theme: "vs-light",
    });
    editor.onDidChangeModelContent((e) => {
        textarea.value = editor.getValue();
        // alert(textarea.value);
    });
    var refreshEditor = document.getElementById("refreshEditor");
    refreshEditor.onclick = (e) => {
        editor.setValue(textarea.value);
    };
}
//点击"确认",隐藏窗口和遮盖层
var closeBtn = document.getElementById('popboxSubmit');
var popbox = document.getElementById('popbox');
var bg = document.getElementById('bg');
closeBtn.onclick = function () {
    popbox.style.display = "none";
    bg.style.display = "none";
    return false;
};
//# sourceMappingURL=index.js.map