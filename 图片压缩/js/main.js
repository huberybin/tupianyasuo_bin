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

// 初始化
function init() {
    // 设置拖放区域事件
    setupDragAndDrop();
    
    // 设置文件输入事件
    fileInput.addEventListener('change', handleFileSelect);
    
    // 设置质量滑块事件
    qualitySlider.addEventListener('input', handleQualityChange);
    
    // 设置下载按钮事件
    downloadBtn.addEventListener('click', downloadCompressedImage);
    
    // 设置重置按钮事件
    resetBtn.addEventListener('click', resetUI);
}

// 设置拖放功能
function setupDragAndDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    dropZone.addEventListener('drop', handleDrop, false);
}

// 阻止默认行为
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// 高亮拖放区域
function highlight() {
    dropZone.classList.add('highlight');
}

// 取消高亮拖放区域
function unhighlight() {
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
function handleFiles(files) {
    if (files.length === 0) return;
    
    const file = files[0];
    
    // 检查文件类型
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        alert('请上传 PNG 或 JPG 格式的图片！');
        return;
    }
    
    // 保存当前文件
    currentFile = file;
    
    // 显示原始图片
    displayOriginalImage(file);
    
    // 显示设置和预览区域
    settingsPanel.style.display = 'block';
    previewSection.style.display = 'block';
    
    // 压缩图片
    compressImage();
}

// 显示原始图片
function displayOriginalImage(file) {
    // 创建图片URL并设置预览
    const objectUrl = URL.createObjectURL(file);
    originalPreview.src = objectUrl;
    
    // 显示文件大小
    originalSize.textContent = `大小: ${formatFileSize(file.size)}`;
    
    // 获取并显示图片尺寸
    const img = new Image();
    img.onload = function() {
        originalDimensions.textContent = `尺寸: ${this.width} x ${this.height}`;
        URL.revokeObjectURL(this.src); // 释放URL
    };
    img.src = objectUrl;
}

// 处理质量滑块变化
function handleQualityChange() {
    qualityValue.textContent = `${qualitySlider.value}%`;
    compressImage();
}

// 压缩图片
async function compressImage() {
    if (!currentFile) return;
    
    try {
        // 获取压缩质量值 (0-1)
        const quality = parseInt(qualitySlider.value) / 100;
        
        // 压缩选项
        const options = {
            maxSizeMB: 10, // 最大文件大小限制
            maxWidthOrHeight: 4096, // 最大宽度或高度
            useWebWorker: true, // 使用Web Worker提高性能
            fileType: currentFile.type, // 保持原始文件类型
            quality: quality // 压缩质量
        };
        
        console.log(`开始压缩图片, 质量: ${quality}`);
        
        // 执行压缩
        compressedBlob = await imageCompression(currentFile, options);
        
        console.log(`压缩完成, 原始大小: ${formatFileSize(currentFile.size)}, 压缩后: ${formatFileSize(compressedBlob.size)}`);
        
        // 显示压缩后的图片
        displayCompressedImage(compressedBlob);
        
    } catch (error) {
        console.error('压缩失败:', error);
        alert('图片压缩失败，请重试或选择其他图片。');
    }
}

// 显示压缩后的图片
function displayCompressedImage(blob) {
    // 创建图片URL并设置预览
    const objectUrl = URL.createObjectURL(blob);
    compressedPreview.src = objectUrl;
    
    // 显示文件大小
    compressedSize.textContent = `大小: ${formatFileSize(blob.size)}`;
    
    // 获取并显示图片尺寸
    const img = new Image();
    img.onload = function() {
        compressedDimensions.textContent = `尺寸: ${this.width} x ${this.height}`;
        URL.revokeObjectURL(this.src); // 释放URL
    };
    img.src = objectUrl;
}

// 下载压缩后的图片
function downloadCompressedImage() {
    if (!compressedBlob) return;
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = URL.createObjectURL(compressedBlob);
    
    // 设置文件名
    const extension = currentFile.name.split('.').pop();
    const baseName = currentFile.name.substring(0, currentFile.name.lastIndexOf('.'));
    const fileName = `${baseName}_compressed.${extension}`;
    link.download = fileName;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 释放URL
    URL.revokeObjectURL(link.href);
}

// 重置UI
function resetUI() {
    // 重置文件输入
    fileInput.value = '';
    
    // 清除当前文件数据
    currentFile = null;
    compressedBlob = null;
    
    // 隐藏设置和预览区域
    settingsPanel.style.display = 'none';
    previewSection.style.display = 'none';
    
    // 清除预览图片
    originalPreview.src = '';
    compressedPreview.src = '';
    
    // 重置信息显示
    originalSize.textContent = '大小: -- MB';
    compressedSize.textContent = '大小: -- MB';
    originalDimensions.textContent = '尺寸: -- x --';
    compressedDimensions.textContent = '尺寸: -- x --';
    
    // 重置质量滑块
    qualitySlider.value = 80;
    qualityValue.textContent = '80%';
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 初始化应用
document.addEventListener('DOMContentLoaded', init);