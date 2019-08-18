const markdownIt = require('markdown-it');
const archiver = require('archiver');

const mdit = new markdownIt({
  html: true,
  linkify: true,
  typographer: true
})
  .use(require("markdown-it-container"), "tip")
  .use(require("markdown-it-container"), "warning")
  .use(require("markdown-it-container"), "danger")
  .use(require("markdown-it-katex"))
  .use(require("markdown-it-underline"))
  .use(require("markdown-it-emoji"))
  .use(require("markdown-it-footnote"))
  .use(require("markdown-it-mark"))
  .use(require("markdown-it-sup"))
  .use(require("markdown-it-sub"))
  .use(require("markdown-it-checkbox"))
  .use(require("markdown-it-abbr"))
  // .use(require("markdown-it-toc-and-anchor").default, {
  //     anchorLink: false
  // })
  .use(require("markdown-it-highlightjs"))
  .use(require("markdown-it-plantuml"))
  .use(require("markdown-it-multimd-table"))
  .use(require("markdown-it-meta"));

let defaultRender =
  mdit.renderer.rules.link_open ||
  function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
  };
mdit.renderer.rules.link_open = function (
  tokens,
  idx,
  options,
  env,
  self
) {
  var aIndex = tokens[idx].attrIndex("target");
  if (aIndex < 0) {
      tokens[idx].attrPush(["target", "_blank"]);
  } else {
      tokens[idx].attrs[aIndex][1] = "_blank";
  }
  return defaultRender(tokens, idx, options, env, self);
};

  function renderHTML(str) {
      try {
          window.markdownText = str;
          let r = mdit.render(str, {
              tocCallback: function (tocMarkdown, tocArray, tocHtml) {
                  let data = {
                      Key: "TOC",
                      Value: JSON.stringify(tocArray)
                  };
                  //window.external.notify(JSON.stringify(data));
              }
          });
          let container = document.getElementById("previewContainer");
          container.innerHTML = r;
      } catch (ex) {
          console.log(ex);
      }
  }
  
  function exportWholeHTML(title, style) {
      let r = mdit.render(window.markdownText);
      let basicHTML = `<!DOCTYPE html><html><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>${title}</title><style>${style}</style></head><body>${r}</body></html>`;
      let data = {
          Key: "HTML",
          Value: basicHTML
      };
      window.external.notify(JSON.stringify(data)); 
  }

  function exportOnlyHTML(title) {
      let r = mdit.render(window.markdownText);
      let basicHTML = `<!DOCTYPE html><html><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>${title}</title></head><body>${r}</body></html>`;
      let data = {
          Key: "HTML",
          Value: basicHTML
      };
      window.external.notify(JSON.stringify(data));
  }

  function getHTMLWithStyle (style) {
      let r = mdit.render(window.markdownText);
      let basicHTML = `<!DOCTYPE html><html><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title></title><style>${style}</style></head><body>${r}</body></html>`;
      return basicHTML;
  }

  function getRenderHTML() {
      let r = mdit.render(window.markdownText);
      return r;
  }

const {
  remote,
  ipcRenderer
} = require("electron");
const {
  Menu,
  MenuItem,
  dialog
} = remote;
const fs = require("fs");
const textarea = document.getElementById("textarea");

// 右键textarea菜单
const menu = new Menu();
menu.append(new MenuItem({
  label: "全选",
  role: "selectall"
}));
menu.append(new MenuItem({
  type: "separator"
}));
menu.append(new MenuItem({
  label: "勾选",
  type: "checkbox",
  checked: true
}));
// textarea.addEventListener(
//   "contextmenu",
//   e => {
//     e.preventDefault();
//     menu.popup({
//       window: remote.getCurrentWindow()
//     });
//   },
//   false
// );

var inervalId;
window.onload = ((e)=>{
      inervalId = setInterval(function() {
      renderHTML(textarea.value);
      let charCount = document.getElementById("charCount");
      charCount.innerText = textarea.value.length + " 字符";
    }, 500);
});

// 是否已保存， 当前文档路径
let isSaveed, currentFilePath;

// 初始化
function initEditor() {
  document.title = "TidyMark - " + "新建文件.md";
  isSaveed = false;
  currentFilePath = "";
  textarea.value="";
  document.getElementById("refreshEditor").click();
}
initEditor();

// 如果没有保存，文档右上角有*
// textarea.oninput = function () {
//   if (isSaveed) document.title += " *";
//   isSaveed = false;
// };

// 监听主进程
ipcRenderer.on("actions", (event, data) => {
  switch (data) {
    case "new":
      // 新建
      isSaveFile();
      document.getElementById("refreshEditor").click();
      break;
    case "open":
      // 打开
      // 1、询问是否保存当前文档
      isSaveFile();
      // 2、选择路径，读取文件内容到记事本
      dialog.showOpenDialog({
          properties: ["openFile"]
        },
        filePaths => {
          if (filePaths) {
            textarea.value = fs.readFileSync(filePaths[0]);
            document.getElementById("refreshEditor").click();
          }
        }
      );
      break;
    case "save":
      // 保存
      saveFilePath();
      break;
    case "export":
      // 保存
      exportFilePath();
      break;
    case "exit":
      // 退出
      isSaveFile();
      ipcRenderer.send('exit-app');
      clearInterval(inervalId);// 清除定时任务
  }
});

/**
 * 询问是否保存已有内容
 * 是-执行保存功能-初始化记事本；
 *
 */
function isSaveFile() {
  if (!isSaveed) {
    const index = dialog.showMessageBox(null, {
      type: "question",
      buttons: ["保存", "不保存"],
      defaultId: 0,
      message: "是否保存文件",
      title: "是否保存文件"
    });
    if (index === 0) {
      saveFilePath();
      initEditor();
    }
    textarea.value = "";
  } else {
    textarea.value = "";
    initEditor();
  }
}

/**
 * 判断是否有保存路径
 * 有- 直接保存
 * 无 - 选择路径
 *
 */
function saveFilePath() {
  if (!currentFilePath) {
    const filePaths = dialog.showSaveDialog({
      defaultPath: "新建文件.md",
      filters: [{
        name: "All Files",
        extensions: ["*"]
      }]
    });
    if (filePaths) {
      currentFilePath = filePaths;
      fs.writeFileSync(currentFilePath, textarea.value);
      isSaveed = true;
      document.title = "TidyMark - " + currentFilePath;    
      renderHTML(textarea.value);
    }
  } else {
    fs.writeFileSync(currentFilePath, textarea.value);
    isSaveed = true;
    document.title = "TidyMark - " + currentFilePath;
  }
}

function exportFilePath() {
    const zipfilePaths = dialog.showSaveDialog({
      defaultPath: "新建文件.zip",
      filters: [{
        name: "All Files",
        extensions: ["*"]
      }]
    });
    if (zipfilePaths) {
      var htmlpath = __dirname + "\\exportDoc\\indexDoc.html";
      fs.writeFileSync(htmlpath, getHTMLWithStyle());
      isSaveed = true;

      // 创建一个可写文件流，以便把压缩的数据导入
      var output = fs.createWriteStream(zipfilePaths);
      //archiv对象，设置等级
      var archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
      });

      output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
      });
      
      // This event is fired when the data source is drained no matter what was the data source.
      // It is not part of this library but rather from the NodeJS Stream API.
      // @see: https://nodejs.org/api/stream.html#stream_event_end
      output.on('end', function() {
        console.log('Data has been drained');
      });
      
      // good practice to catch warnings (ie stat failures and other non-blocking errors)
      archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
          // log warning
        } else {
          // throw error
          throw err;
        }
      });
      
      // good practice to catch this error explicitly
      archive.on('error', function(err) {
        throw err;
      });

      //管道连接
      archive.pipe(output);
      //压缩文件夹到压缩包
      archive.directory(__dirname + "\\exportDoc\\", false);
      //开始压缩
      archive.finalize();
      
    }
}

