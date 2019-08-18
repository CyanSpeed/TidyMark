/// <reference path="node_modules/monaco-editor/monaco.d.ts" />
import * as electron from 'electron';
import {remote} from 'electron';
const app = remote.app;
const BrowserWindow = remote.BrowserWindow;
const dialog = remote.dialog;
const textarea:any = document.getElementById("textarea");
const {
    ipcRenderer
  } = require("electron");

declare var amdRequire;
var editor: monaco.editor.IStandaloneCodeEditor;


amdRequire.config({
		'vs/nls' : {
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
    refreshEditor.onclick =(e)=>{
        editor.setValue( textarea.value );
    };
}
  