"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const app = electron_1.remote.app;
const BrowserWindow = electron_1.remote.BrowserWindow;
const dialog = electron_1.remote.dialog;
const textarea = document.getElementById("textarea");
const { ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");
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
            "",
        ].join('\n'),
        language: 'markdown',
        automaticLayout: true,
        wordWrap: "bounded",
        theme: "vs-light",
    });
    //提示项设值
    monaco.languages.registerCompletionItemProvider('markdown', {
        provideCompletionItems: function (model, position) {
            // get editor content before the pointer
            var textUntilPosition = model.getValueInRange({
                startLineNumber: position.lineNumber,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            });
            // 获取当前行数
            const line = position.lineNumber;
            // 获取当前列数
            const column = position.column;
            // 获取当前输入行的所有内容
            const content = model.getLineContent(line);
            // 通过下标来获取当前光标后一个内容，即为刚输入的内容
            const sym = content[column - 2];
            var suggestions = [];
            if (sym == '!') {
                suggestions.push({
                    label: '![title](path)',
                    kind: monaco.languages.CompletionItemKind['Function'],
                    insertText: '[title](path)',
                    detail: '插入图片'
                });
            }
            else if (sym == '#') {
                suggestions.push({
                    label: '##',
                    kind: monaco.languages.CompletionItemKind['Function'],
                    insertText: '#',
                    detail: '2级标题'
                });
                suggestions.push({
                    label: '###',
                    kind: monaco.languages.CompletionItemKind['Function'],
                    insertText: '##',
                    detail: '3级标题'
                });
                suggestions.push({
                    label: '####',
                    kind: monaco.languages.CompletionItemKind['Function'],
                    insertText: '###',
                    detail: '4级标题'
                });
                suggestions.push({
                    label: '#####',
                    kind: monaco.languages.CompletionItemKind['Function'],
                    insertText: '####',
                    detail: '5级标题'
                });
                suggestions.push({
                    label: '######',
                    kind: monaco.languages.CompletionItemKind['Function'],
                    insertText: '#####',
                    detail: '6级标题'
                });
            }
            else if (sym == '*') {
                suggestions.push({
                    label: '**text**',
                    kind: monaco.languages.CompletionItemKind['Function'],
                    insertText: '* **',
                    detail: '粗体'
                });
                suggestions.push({
                    label: '***text***',
                    kind: monaco.languages.CompletionItemKind['Function'],
                    insertText: '** ***',
                    detail: '粗斜体'
                });
            }
            else if (sym == '`') {
                suggestions.push({
                    label: '```',
                    kind: monaco.languages.CompletionItemKind['Function'],
                    insertText: '``',
                    detail: '区块引用'
                });
                suggestions.push({
                    label: '***text***',
                    kind: monaco.languages.CompletionItemKind['Function'],
                    insertText: '** ***',
                    detail: '粗斜体'
                });
            }
            else if (sym == '/') {
                const currentPath = getCurrentPath(localStorage.getItem('currentFilePath'));
                const userKeyInStr = getUserKeyIn(content, position.column - 1);
                console.log("userKeyInStr=" + userKeyInStr + "column=" + position.column);
                const finalPath = path.resolve(currentPath, userKeyInStr);
                console.log("finalPath=" + finalPath);
                var files = fs.readdirSync(finalPath);
                files.forEach(function (name) {
                    const extn = name.includes('.') ? name.substring(name.lastIndexOf('.') + 1) : '';
                    suggestions.push({
                        label: name,
                        kind: monaco.languages.CompletionItemKind['File'],
                        insertText: name,
                    });
                });
            }
            return {
                suggestions
            };
        },
        triggerCharacters: ['!', '#', '*', '/', '`'] // 触发提示的字符，可以写多个
    });
    function getUserKeyIn(lineText, toCharacter) {
        let tempArr = lineText.lastIndexOf('\(') > lineText.lastIndexOf('"') ?
            lineText.substr(0, toCharacter).split('\(') :
            lineText.substr(0, toCharacter).split('"');
        return tempArr[tempArr.length - 1];
    }
    const getCurrentPath = (fileName) => fileName.substring(0, fileName.lastIndexOf(path.sep));
    editor.onDidChangeModelContent((e) => {
        textarea.value = editor.getValue();
        textarea.click();
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
var dragging = false;
var doc = document;
var dragBtn = document.getElementById('dragbar');
var editordiv = document.getElementById('monacoContainer');
var previewdiv = document.getElementById('previewContainer');
var wrapWidth = editordiv.clientWidth;
var clickX, leftOffset, index, nextW2, nextW;
previewdiv.style.left = (50 + dragBtn.offsetLeft) + "px";
previewdiv.style.width = (document.body.clientWidth - dragBtn.offsetLeft) + "px";
window.onresize = function (e) {
    previewdiv.style.left = (50 + dragBtn.offsetLeft) + "px";
    previewdiv.style.width = (document.body.clientWidth - dragBtn.offsetLeft) + "px";
    console.log("resize");
};
dragBtn.onmousedown = function (event) {
    dragging = true;
    leftOffset = editordiv.offsetLeft;
    // index = $(this).index(dragBtn);
    console.log("mousedown");
};
document.onmouseup = function (e) {
    dragging = false;
    // e.cancelable = true; //禁止事件冒泡
    console.log("mouseup");
};
document.onmousemove = function (e) {
    console.log("mousemove");
    if (dragging) {
        //----------------------------------------------------------------
        clickX = e.pageX;
        console.log('鼠标位置：' + clickX);
        editordiv.style.width = clickX + "px";
        dragBtn.style.left = clickX + "px";
        previewdiv.style.left = (50 + clickX) + "px";
        previewdiv.style.width = (document.body.clientWidth - clickX) + "px";
    }
};
//# sourceMappingURL=index.js.map