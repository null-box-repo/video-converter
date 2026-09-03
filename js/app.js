'use strict';
// .. Client-side logic for video converter

const $ = (id) => document.getElementById(id);

const dropzone = $('dropzone');
const fileInput = $('fileInput');
const previewWrap = $('previewWrap');
const preview = $('preview');
const fileName = $('fileName');
const fileSize = $('fileSize');
const formatsCard = $('formatsCard');
const formatList = $('formatList');
const formatSearch = $('formatSearch');
const saveCard = $('saveCard');
const saveDir = $('saveDir');
const convertBtn = $('convertBtn');
const btnLabel = convertBtn.querySelector('.btn-label');
const spinner = convertBtn.querySelector('.spinner');
const resultCard = $('resultCard');
const resultBox = $('resultBox');
const saveBtn = $('saveBtn');
const saveBtnLabel = $('saveBtnLabel');
const saveStatus = $('saveStatus');
const errorEl = $('error');
const themeToggle = $('themeToggle');

let formats = [];
let selectedFormat = null;
let currentFile = null;
let lastConvertedBlob = null;
let lastConvertedExt = '';
let currentFileExt = '';
let isConverting = false;

const VIDEO_EXTS = [
  'mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', 'wmv',
  'ogv', 'vob', '3gp', '3g2', 'm2v', 'ts', 'mts', 'm2ts', 'f4v', 'asf',
  'rm', 'rmvb', 'wtv', 'swf', 'amv', 'gif',
  'h264', 'hevc', 'vc1', 'avs2', 'avs3', 'vvc',
  'mxf', 'dv', 'gxf', 'nut'
];

const CONVERSION_MAP = {
  'mp4':  ['mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', 'wmv', '3gp', 'gif', 'ts', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  'mkv':  ['mp4', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', 'wmv', '3gp', 'gif', 'ts', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  'mov':  ['mp4', 'mkv', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', 'wmv', '3gp', 'gif', 'ts', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  'avi':  ['mp4', 'mkv', 'mov', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', 'wmv', '3gp', 'gif', 'ts', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  'flv':  ['mp4', 'mkv', 'mov', 'avi', 'webm', 'mpeg', 'mpg', 'm4v', 'wmv', '3gp', 'gif', 'ts', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  'webm': ['mp4', 'mkv', 'mov', 'avi', 'flv', 'mpeg', 'mpg', 'm4v', 'wmv', '3gp', 'gif', 'ts', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  'mpeg': ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpg', 'm4v', 'wmv', '3gp', 'gif', 'ts', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  'mpg':  ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'm4v', 'wmv', '3gp', 'gif', 'ts', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  'm4v':  ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'wmv', '3gp', 'gif', 'ts', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  'wmv':  ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', '3gp', 'gif', 'ts', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  '3gp':  ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', 'wmv', 'gif', 'ts', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  '3g2':  ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', 'wmv', 'gif', 'ts', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  'ts':   ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', 'wmv', 'gif', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  'mts':  ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', 'wmv', 'gif', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  'm2ts': ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', 'wmv', 'gif', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  'm2v':  ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', 'wmv', 'gif', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  'f4v':  ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', 'wmv', 'gif', 'ts', 'ogv', 'swf', 'mxf', 'dv'],
  'asf':  ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', 'wmv', 'gif', 'ts', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  'rm':   ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', 'wmv', 'gif', 'ts', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  'rmvb': ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', 'wmv', 'gif', 'ts', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  'wtv':  ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', 'wmv', 'gif', 'ts', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  'swf':  ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'gif', 'ts', 'ogv', 'f4v', 'mxf', 'dv'],
  'amv':  ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'gif', 'ts', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  'vob':  ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'gif', 'ts', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  'ogv':  ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'gif', 'ts', 'f4v', 'swf', 'mxf', 'dv'],
  'mxf':  ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', 'wmv', 'gif', 'ts', 'ogv', 'f4v', 'swf', 'dv'],
  'dv':   ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', 'wmv', 'gif', 'ts', 'ogv', 'f4v', 'swf', 'mxf'],
  'gxf':  ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', 'wmv', 'gif', 'ts', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  'nut':  ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', 'wmv', 'gif', 'ts', 'ogv', 'f4v', 'swf', 'mxf', 'dv'],
  'gif':  ['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', 'wmv', '3gp', 'ts', 'ogv', 'f4v', 'swf', 'mxf', 'dv']
};

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('theme', theme); } catch (e) {}
}
themeToggle.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  applyTheme(cur);
});

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = false;
}
function clearError() { errorEl.hidden = true; }

function fmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function getFileExt(name) {
  return (name || '').split('.').pop().toLowerCase();
}

function isVideoFile(ext) {
  return VIDEO_EXTS.includes(ext);
}

function getSupportedFormats(inputExt) {
  if (!inputExt || !CONVERSION_MAP[inputExt]) return [];
  return CONVERSION_MAP[inputExt];
}

function resetAll() {
  currentFile = null;
  selectedFormat = null;
  lastConvertedBlob = null;
  lastConvertedExt = '';
  currentFileExt = '';
  previewWrap.hidden = true;
  formatsCard.hidden = true;
  saveCard.hidden = true;
  resultCard.hidden = true;
  convertBtn.hidden = false;
  convertBtn.disabled = true;
  fileInput.value = '';
  preview.src = '';
  preview.load();
  renderFormats();
}

fetch('/api/formats')
  .then((r) => r.json())
  .then((data) => {
    formats = (data.formats || []).map((f) => ({ name: f[0], ext: f[1], group: f[2] || 'other' }));
    renderFormats();
  })
  .catch(() => showError('Failed to load format list'));

function renderFormats(filter) {
  const q = (filter || '').trim().toLowerCase();
  const supported = currentFileExt ? getSupportedFormats(currentFileExt) : [];
  const formatNames = formats.map((f) => f.ext);

  formatList.innerHTML = '';

  if (!currentFileExt) {
    const empty = document.createElement('p');
    empty.className = 'hint';
    empty.textContent = 'Select a video file first';
    formatList.appendChild(empty);
    return;
  }

  const filtered = formats.filter((f) => {
    if (!supported.includes(f.ext)) return false;
    if (q && !f.name.toLowerCase().includes(q) && !f.ext.includes(q)) return false;
    return true;
  });

  if (!filtered.length) {
    const empty = document.createElement('p');
    empty.className = 'hint';
    empty.textContent = q ? 'No matching formats' : 'No supported formats for this file';
    formatList.appendChild(empty);
    return;
  }

  const wrap = document.createElement('div');
  wrap.className = 'buttons';
  filtered.forEach((f, fi) => {
    const b = document.createElement('button');
    b.className = 'fmt' + (selectedFormat === f.name ? ' active' : '');
    b.dataset.name = f.name;
    b.dataset.ext = f.ext;
    b.textContent = f.name.toLowerCase();
    b.title = f.name + ' -> .' + f.ext;
    b.style.animation = 'pop .3s ease both';
    b.style.animationDelay = (fi * 0.02) + 's';
    b.onclick = () => selectFormat(f.name);
    wrap.appendChild(b);
  });
  formatList.appendChild(wrap);
}

function updateConvertBtn() {
  convertBtn.disabled = !(currentFile && selectedFormat);
}

function selectFormat(name) {
  if (selectedFormat === name) {
    selectedFormat = null;
  } else {
    selectedFormat = name;
  }
  document.querySelectorAll('.fmt').forEach((b) => {
    b.classList.toggle('active', b.dataset.name === selectedFormat);
  });
  updateConvertBtn();
}

formatSearch.addEventListener('input', () => renderFormats(formatSearch.value));

function handleFile(file) {
  if (!file) return;
  currentFile = file;
  clearError();
  fileName.textContent = file.name;
  fileSize.textContent = fmtSize(file.size);
  previewWrap.hidden = false;
  formatsCard.hidden = false;
  saveCard.hidden = false;
  resultCard.hidden = true;
  saveBtn.hidden = true;
  saveStatus.hidden = true;
  lastConvertedBlob = null;
  selectedFormat = null;
  currentFileExt = getFileExt(file.name);

  if (!isVideoFile(currentFileExt)) {
    showError('Only video files are supported');
    formatsCard.hidden = true;
    saveCard.hidden = true;
    return;
  }

  renderFormats(formatSearch.value);
  updateConvertBtn();
  const url = URL.createObjectURL(file);
  preview.src = url;
  preview.load();
}

previewWrap.addEventListener('click', () => {
  if (!previewWrap.hidden) resetAll();
});

$('browseBtn').addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
dropzone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));
dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('over'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('over'));
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('over');
  if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});

convertBtn.addEventListener('click', async () => {
  if (!currentFile || !selectedFormat) return;
  clearError();
  saveStatus.hidden = true;
  convertBtn.disabled = true;
  isConverting = true;
  btnLabel.textContent = 'Converting...';
  spinner.hidden = false;
  try {
    const res = await fetch('/api/convert', {
      method: 'POST',
      headers: {
        'Content-Type': currentFile.type || 'application/octet-stream',
        'X-Format': selectedFormat,
        'X-Filename': encodeURIComponent(currentFile.name)
      },
      body: currentFile
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.detail || 'Conversion failed');
    }
    const blob = await res.blob();
    const ext = (formats.find((f) => f.name === selectedFormat) || {}).ext || '';
    lastConvertedBlob = blob;
    lastConvertedExt = ext;
    const url = URL.createObjectURL(blob);
    resultBox.innerHTML = '';
    const video = document.createElement('video');
    video.src = url;
    video.controls = true;
    video.style.maxWidth = '100%';
    video.style.borderRadius = '12px';
    resultBox.appendChild(video);
    saveBtn.hidden = false;
    saveBtnLabel.textContent = 'Save (' + fmtSize(blob.size) + ')';
    resultCard.hidden = false;
  } catch (e) {
    showError(e.message);
  } finally {
    isConverting = false;
    convertBtn.disabled = false;
    btnLabel.textContent = 'Convert';
    spinner.hidden = true;
  }
});

saveBtn.addEventListener('click', async () => {
  if (!lastConvertedBlob) return;
  saveBtn.disabled = true;
  saveStatus.hidden = true;
  try {
    const dir = saveDir.value;
    const baseName = currentFile ? currentFile.name.replace(/\.[^.]+$/, '') : 'converted';
    const outName = baseName + '.' + lastConvertedExt;
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': lastConvertedBlob.type || 'application/octet-stream',
        'X-Save-Dir': dir,
        'X-Filename': encodeURIComponent(outName)
      },
      body: lastConvertedBlob
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Save failed');
    saveStatus.textContent = 'Saved: ' + data.path;
    saveStatus.className = 'save-status ok';
    saveStatus.hidden = false;
  } catch (e) {
    saveStatus.textContent = 'Error: ' + e.message;
    saveStatus.className = 'save-status err';
    saveStatus.hidden = false;
  } finally {
    saveBtn.disabled = false;
  }
});

const refreshModal = $('refreshModal');
const modalCancel = $('modalCancel');
const modalRefresh = $('modalRefresh');
let pendingRefresh = false;

window.addEventListener('beforeunload', (e) => {
  if (!isConverting) return;
  e.preventDefault();
  e.returnValue = '';
  refreshModal.hidden = false;
  pendingRefresh = true;
});

modalCancel.addEventListener('click', () => {
  refreshModal.hidden = true;
  pendingRefresh = false;
});

modalRefresh.addEventListener('click', () => {
  refreshModal.hidden = true;
  pendingRefresh = false;
  window.location.reload();
});

refreshModal.addEventListener('click', (e) => {
  if (e.target === refreshModal) {
    refreshModal.hidden = true;
    pendingRefresh = false;
  }
});
