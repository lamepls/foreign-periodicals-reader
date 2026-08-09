const els = {
  url: document.getElementById("articleUrl"),
  fetchBtn: document.getElementById("fetchBtn"),
  title: document.getElementById("titleField"),
  author: document.getElementById("authorField"),
  date: document.getElementById("dateField"),
  urlField: document.getElementById("urlField"),
  desc: document.getElementById("descField"),
  body: document.getElementById("bodyField"),
  copyBtn: document.getElementById("copyBtn"),
  downloadBtn: document.getElementById("downloadBtn"),
  printBtn: document.getElementById("printBtn"),
  saveLocalBtn: document.getElementById("saveLocalBtn"),
  savedList: document.getElementById("savedList"),
  docxUpload: document.getElementById("docxUpload"),
  uploadName: document.getElementById("uploadName"),
  previewTitle: document.getElementById("previewTitle"),
  previewSubtitle: document.getElementById("previewSubtitle"),
  previewDesc: document.getElementById("previewDesc"),
  previewBody: document.getElementById("previewBody"),
  previewMeta: document.getElementById("previewMeta"),
  toast: document.getElementById("toast"),
};

let currentId = null;
const STORAGE_KEY = "natgeo_reader_articles";

function showToast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.add("show");
  setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function getArticles() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveArticles(articles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .slice(0, 40) || "article";
}

function generateId(title) {
  return slugify(title) + "-" + Date.now().toString(36);
}

function getArticleData() {
  return {
    id: currentId,
    title: els.title.value.trim(),
    author: els.author.value.trim(),
    published: els.date.value.trim(),
    url: els.urlField.value.trim(),
    description: els.desc.value.trim(),
    body: els.body.value.trim(),
  };
}

function setArticleData(data) {
  currentId = data.id || null;
  els.title.value = data.title || "";
  els.author.value = data.author || "";
  els.date.value = data.published || "";
  els.urlField.value = data.url || "";
  els.desc.value = data.description || "";
  els.body.value = data.body || "";
  renderPreview();
  renderSavedList();
}

function splitBody(body) {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function renderPreview() {
  const data = getArticleData();
  els.previewTitle.textContent = data.title || "（未命名文章）";

  const parts = [];
  if (data.author) parts.push(`By ${data.author}`);
  if (data.published) parts.push(data.published);
  if (data.url) parts.push(data.url);
  els.previewSubtitle.textContent = parts.join("  |  ");
  els.previewMeta.textContent = data.published
    ? `National Geographic · ${data.published}`
    : "National Geographic";

  els.previewDesc.textContent = data.description || "";
  els.previewDesc.style.display = data.description ? "block" : "none";

  const paras = splitBody(data.body);
  els.previewBody.innerHTML = paras
    .map((p, i) => `<p>[${i + 1}] ${escapeHtml(p)}</p>`)
    .join("");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderSavedList() {
  const articles = getArticles();
  const ids = Object.keys(articles).reverse();
  els.savedList.innerHTML = "";
  if (ids.length === 0) {
    els.savedList.innerHTML =
      '<li style="color:#9ca3af; cursor:default;">暂无保存的文章</li>';
    return;
  }
  ids.forEach((id) => {
    const item = articles[id];
    const li = document.createElement("li");
    li.className = id === currentId ? "active" : "";
    li.innerHTML = `<span>${escapeHtml(item.title || "未命名")}</span><span class="delete" data-id="${id}">×</span>`;
    li.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete")) {
        e.stopPropagation();
        delete articles[id];
        saveArticles(articles);
        if (currentId === id) {
          clearEditor();
        }
        renderSavedList();
      } else {
        setArticleData(item);
      }
    });
    els.savedList.appendChild(li);
  });
}

function clearEditor() {
  currentId = null;
  els.title.value = "";
  els.author.value = "";
  els.date.value = "";
  els.urlField.value = "";
  els.desc.value = "";
  els.body.value = "";
  renderPreview();
  renderSavedList();
}

async function fetchArticle() {
  const url = els.url.value.trim();
  if (!url) {
    showToast("请输入链接");
    return;
  }
  els.fetchBtn.disabled = true;
  els.fetchBtn.textContent = "获取中…";
  try {
    const resp = await fetch("/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.error || "请求失败");
    }
    currentId = generateId(data.title || "article");
    setArticleData({ ...data, id: currentId });
    showToast("已获取文章信息");
  } catch (err) {
    showToast(err.message);
  } finally {
    els.fetchBtn.disabled = false;
    els.fetchBtn.textContent = "获取信息";
  }
}

function buildHtmlForWord() {
  const data = getArticleData();
  const paras = splitBody(data.body)
    .map((p, i) => `<p style="margin:0 0 16pt 0;line-height:1.5;text-align:justify;font-family:'Times New Roman',serif;font-size:16pt;">[${i + 1}] ${escapeHtml(p)}</p>`)
    .join("");

  const metaParts = [];
  if (data.author) metaParts.push(`By ${escapeHtml(data.author)}`);
  if (data.published) metaParts.push(escapeHtml(data.published));
  if (data.url) metaParts.push(escapeHtml(data.url));

  return `
    <html>
      <body style="font-family:'Times New Roman',serif;color:#000;">
        <h1 style="text-align:center;font-size:22pt;margin:0 0 8pt 0;">${escapeHtml(data.title || "")}</h1>
        <p style="text-align:center;font-size:11pt;font-style:italic;color:#555;margin:0 0 18pt 0;">${metaParts.join("  |  ")}</p>
        ${data.description ? `<p style="text-align:justify;font-size:11pt;font-style:italic;color:#444;margin:0 0 18pt 0;">${escapeHtml(data.description)}</p>` : ""}
        ${paras}
      </body>
    </html>
  `;
}

async function copyToWord() {
  const html = buildHtmlForWord();
  try {
    const blob = new Blob([html], { type: "text/html" });
    await navigator.clipboard.write([
      new ClipboardItem({ "text/html": blob }),
    ]);
    showToast("已复制，可直接粘贴到 Word");
  } catch (err) {
    // 降级：复制纯文本
    const data = getArticleData();
    const text = `${data.title}\n\n${data.description}\n\n${splitBody(data.body)
      .map((p, i) => `[${i + 1}] ${p}`)
      .join("\n\n")}`;
    await navigator.clipboard.writeText(text);
    showToast("已复制纯文本版本");
  }
}

async function downloadDocx() {
  const data = getArticleData();
  if (!data.title) {
    showToast("请先填写标题");
    return;
  }
  try {
    const resp = await fetch("/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.error || "下载失败");
    }
    const blob = await resp.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const filename =
      data.title.replace(/[^\w\-]+/g, "_").slice(0, 50) + ".docx";
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast("DOCX 下载成功");
  } catch (err) {
    showToast(err.message);
  }
}

function saveLocal() {
  const data = getArticleData();
  if (!data.title) {
    showToast("请至少填写标题");
    return;
  }
  if (!data.id) {
    currentId = generateId(data.title);
    data.id = currentId;
  }
  const articles = getArticles();
  articles[data.id] = data;
  saveArticles(articles);
  renderSavedList();
  showToast("已保存到浏览器本地");
}

function printArticle() {
  window.print();
}

// 事件绑定
async function uploadDocx(file) {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const resp = await fetch("/upload", {
      method: "POST",
      body: formData,
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.error || "导入失败");
    }
    currentId = generateId(data.title || "imported-article");
    setArticleData({
      id: currentId,
      title: data.title || "",
      author: "",
      published: "",
      url: "",
      description: "",
      body: data.body || "",
    });
    showToast("DOCX 导入成功");
  } catch (err) {
    showToast(err.message);
  }
}

els.fetchBtn.addEventListener("click", fetchArticle);
els.docxUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  els.uploadName.textContent = file.name;
  uploadDocx(file);
});
[
  els.title,
  els.author,
  els.date,
  els.urlField,
  els.desc,
  els.body,
].forEach((el) => el.addEventListener("input", renderPreview));

els.copyBtn.addEventListener("click", copyToWord);
els.downloadBtn.addEventListener("click", downloadDocx);
els.printBtn.addEventListener("click", printArticle);
els.saveLocalBtn.addEventListener("click", saveLocal);

els.url.addEventListener("keydown", (e) => {
  if (e.key === "Enter") fetchArticle();
});

// 初始化：尝试载入一个空的编辑区并渲染列表
renderPreview();
renderSavedList();
