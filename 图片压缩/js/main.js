// DOM 元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const settingsPanel = document.getElementById('settingsPanel');
const previewSection = document.getElementById('previewSection');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const originalDimensions = document.getElementById('originalDimensions');
const compressedDimensions = document.getElementById('compressedDimensions');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');

// 当前处理的图片数据
let currentFile = null;
let compressedBlob = null;

// 初始化拖放区域
function initDropZone() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    dropZone.addEventListener('drop', handleDrop, false);
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
}

// 阻止默认行为
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// 高亮拖放区域
function highlight(e) {
    dropZone.classList.add('highlight');
}

// 取消高亮拖放区域
function unhighlight(e) {
    dropZone.classList.remove('highlight');
}

// 处理拖放文件
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// 处理文件选择
function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

// 处理文件
async function handleFiles(files) {
    if (files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件！');
        return;
    }
    
    currentFile = file;
    await displayFileInfo(file);
    showUI();
    await compressImage();
}

// 显示文件信息
async function displayFileInfo(file) {
    // 显示原始图片预览
    originalPreview.src = URL.createObjectURL(file);
    
    // 显示原始文件大小
    originalSize.textContent = `大小: ${formatFileSize(file.size)}`;
    
    // 获取并显示图片尺寸
    const dimensions = await getImageDimensions(file);
    originalDimensions.textContent = `尺寸: ${dimensions.width} x ${dimensions.height}`;
}

// 获取图片尺寸
function getImageDimensions(file) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
        };
        img.src = URL.createObjectURL(file);
    });
}

// 显示UI元素
function showUI() {
    settingsPanel.style.display = 'block';
    previewSection.style.display = 'block';
}

// 压缩图片
async function compressImage() {
    if (!currentFile) return;

    const quality = parseInt(qualitySlider.value) / 100;
    
    // 添加第一个调试输出
    console.log(`当前质量: ${quality}, 原始文件大小: ${formatFileSize(currentFile.size)}`);
    
    try {
        const options = {
            maxSizeMB: 10,
            maxWidthOrHeight: 2048,
            useWebWorker: true,
            quality
        };
    
        compressedBlob = await imageCompression(currentFile, options);
        
        // 添加第二个调试输出
        console.log(`压缩后文件大小: ${formatFileSize(compressedBlob.size)}`);
        
        // 显示压缩后的预览
        compressedPreview.src = URL.createObjectURL(compressedBlob);
        
        // 更新压缩后的文件信息
        compressedSize.textContent = `大小: ${formatFileSize(compressedBlob.size)}`;
        const dimensions = await getImageDimensions(compressedBlob);
        compressedDimensions.textContent = `尺寸: ${dimensions.width} x ${dimensions.height}`;
        
    } catch (error) {
        console.error('压缩失败:', error);
        alert('图片压缩失败，请重试！');
    }
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 下载压缩后的图片
function downloadCompressedImage() {
    if (!compressedBlob) return;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(compressedBlob);
    
    // 生成文件名
    const extension = currentFile.name.split('.').pop();
    const filename = `${currentFile.name.replace(`.${extension}`, '')}_compressed.${extension}`;
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 重置
function reset() {
    currentFile = null;
    compressedBlob = null;
    fileInput.value = '';
    originalPreview.src = '';
    compressedPreview.src = '';
    originalSize.textContent = '大小: -- MB';
    compressedSize.textContent = '大小: -- MB';
    originalDimensions.textContent = '尺寸: -- x --';
    compressedDimensions.textContent = '尺寸: -- x --';
    qualitySlider.value = 80;
    qualityValue.textContent = '80%';
    settingsPanel.style.display = 'none';
    previewSection.style.display = 'none';
}

// 事件监听
qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = `${e.target.value}%`;
    compressImage();
});

downloadBtn.addEventListener('click', downloadCompressedImage);
resetBtn.addEventListener('click', reset);

// 初始化
initDropZone(); 