// 确保在HTML中引入image-compression.js库
// <script src="https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.0/dist/browser-image-compression.js"></script>

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
const progressBar = document.getElementById('progressBar') || createProgressBar();
const compressionRatio = document.getElementById('compressionRatio') || createCompressionRatioElement();
const formatSelector = document.getElementById('formatSelector') || createFormatSelector();
const keepSizeCheckbox = document.getElementById('keepSizeCheckbox') || createKeepSizeCheckbox();
const loadingSpinner = document.getElementById('loadingSpinner') || createLoadingSpinner();

// 当前处理的图片数据
let currentFile = null;
let compressedBlob = null;
let originalObjectURL = null;
let compressedObjectURL = null;

// 检查浏览器兼容性
function checkBrowserCompatibility() {
    const features = {
        fileReader: typeof FileReader !== 'undefined',
        fileAPI: window.File && window.FileReader && window.FileList && window.Blob,
        dragAndDrop: 'draggable' in document.createElement('span'),
        urlObject: window.URL && window.URL.createObjectURL
    };
    
    const incompatibleFeatures = Object.keys(features).filter(feature => !features[feature]);
    
    if (incompatibleFeatures.length > 0) {
        alert(`您的浏览器不支持以下功能，可能导致应用无法正常工作：${incompatibleFeatures.join(', ')}。\n请使用最新版Chrome、Firefox、Edge或Safari浏览器。`);
        return false;
    }
    
    return true;
}

// 创建进度条元素
function createProgressBar() {
    const container = document.createElement('div');
    container.id = 'progressContainer';
    container.style.display = 'none';
    container.style.width = '100%';
    container.style.marginTop = '15px';
    
    const progress = document.createElement('div');
    progress.id = 'progressBar';
    progress.style.width = '0%';
    progress.style.height = '5px';
    progress.style.backgroundColor = '#4CAF50';
    progress.style.borderRadius = '3px';
    progress.style.transition = 'width 0.3s';
    
    container.appendChild(progress);
    document.querySelector(settingsPanel.parentNode).insertBefore(container, previewSection);
    
    return progress;
}

// 创建压缩比率显示元素
function createCompressionRatioElement() {
    const ratioEl = document.createElement('div');
    ratioEl.id = 'compressionRatio';
    ratioEl.className = 'stat-item';
    ratioEl.textContent = '压缩比: --';
    document.querySelector('.stats-compressed').appendChild(ratioEl);
    return ratioEl;
}

// 创建格式选择器
function createFormatSelector() {
    const container = document.createElement('div');
    container.className = 'setting-item';
    
    const label = document.createElement('label');
    label.textContent = '输出格式:';
    label.htmlFor = 'formatSelector';
    
    const select = document.createElement('select');
    select.id = 'formatSelector';
    
    const formats = [
        { value: 'original', text: '保持原格式' },
        { value: 'jpeg', text: 'JPEG' },
        { value: 'png', text: 'PNG' },
        { value: 'webp', text: 'WebP' }
    ];
    
    formats.forEach(format => {
        const option = document.createElement('option');
        option.value = format.value;
        option.textContent = format.text;
        select.appendChild(option);
    });
    
    container.appendChild(label);
    container.appendChild(select);
    
    document.querySelector('.settings').appendChild(container);
    
    select.addEventListener('change', () => {
        if (currentFile) compressImage();
    });
    
    return select;
}

// 创建保持原尺寸选项
function createKeepSizeCheckbox() {
    const container = document.createElement('div');
    container.className = 'setting-item';
    
    const label = document.createElement('label');
    label.className = 'checkbox-label';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'keepSizeCheckbox';
    checkbox.checked = true;
    
    const span = document.createElement('span');
    span.textContent = '保持原始尺寸';
    
    label.appendChild(checkbox);
    label.appendChild(span);
    container.appendChild(label);
    
    document.querySelector('.settings').appendChild(container);
    
    checkbox.addEventListener('change', () => {
        if (currentFile) compressImage();
    });
    
    return checkbox;
}

// 创建加载动画
function createLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.id = 'loadingSpinner';
    spinner.className = 'loading-spinner';
    spinner.style.display = 'none';
    
    document.querySelector(previewSection.parentNode).appendChild(spinner);
    
    return spinner;
}

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
    
    if (files.length > 1) {
        alert('一次只能处理一个图片文件。系统将处理您选择的第一个文件。');
    }
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件！支持的格式：JPEG, PNG, WebP, GIF, BMP等。');
        return;
    }
    
    // 清除之前的资源
    clearResources();
    
    currentFile = file;
    await displayFileInfo(file);
    showUI();
    await compressImage();
}

// 显示文件信息
async function displayFileInfo(file) {
    try {
        // 显示加载中动画
        loadingSpinner.style.display = 'block';
        
        // 释放之前的对象URL
        if (originalObjectURL) {
            URL.revokeObjectURL(originalObjectURL);
        }
        
        // 创建新的对象URL
        originalObjectURL = URL.createObjectURL(file);
        originalPreview.src = originalObjectURL;
        
        // 显示原始文件大小
        originalSize.textContent = `大小: ${formatFileSize(file.size)}`;
        
        // 获取并显示图片尺寸
        const dimensions = await getImageDimensions(file);
        originalDimensions.textContent = `尺寸: ${dimensions.width} x ${dimensions.height}`;
    } catch (error) {
        console.error('显示文件信息失败:', error);
        alert('无法读取图片信息，请检查文件是否损坏。');
    } finally {
        // 隐藏加载中动画
        loadingSpinner.style.display = 'none';
    }
}

// 获取图片尺寸
function getImageDimensions(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
            URL.revokeObjectURL(img.src); // 清理对象URL
        };
        
        img.onerror = () => {
            reject(new Error('无法加载图片以获取尺寸'));
            URL.revokeObjectURL(img.src); // 清理对象URL
        };
        
        img.src = URL.createObjectURL(file);
    });
}

// 显示UI元素
function showUI() {
    settingsPanel.style.display = 'block';
    previewSection.style.display = 'flex'; // 使用flex可以更好地布局
    document.getElementById('progressContainer').style.display = 'block';
}

// 压缩图片
async function compressImage() {
    if (!currentFile) return;

    try {
        // 显示加载动画和进度条
        loadingSpinner.style.display = 'block';
        progressBar.style.width = '0%';
        
        // 获取压缩设置
        const quality = parseInt(qualitySlider.value) / 100;
        const keepOriginalSize = keepSizeCheckbox.checked;
        const outputFormat = formatSelector.value;
        
        console.log(`准备压缩 - 质量: ${quality}, 原始文件大小: ${formatFileSize(currentFile.size)}`);
    
        // 设置压缩选项
        const options = {
            maxSizeMB: 10, // 设置较大值，让quality参数控制压缩程度
            maxWidthOrHeight: keepOriginalSize ? 0 : 2048,
            useWebWorker: true,
            quality: quality,
            onProgress: (progress) => {
                progressBar.style.width = `${progress * 100}%`;
            }
        };
        
        // 如果选择了特定输出格式
        if (outputFormat !== 'original') {
            options.fileType = `image/${outputFormat}`;
        }
    
        console.log(`开始压缩...`, options);
        
        // 释放之前的压缩对象URL
        if (compressedObjectURL) {
            URL.revokeObjectURL(compressedObjectURL);
            compressedObjectURL = null;
        }
        
        // 调用压缩库进行压缩
        compressedBlob = await imageCompression(currentFile, options);
        compressedObjectURL = URL.createObjectURL(compressedBlob);
        
        console.log(`压缩完成 - 压缩后文件大小: ${formatFileSize(compressedBlob.size)}`);
        
        // 显示压缩后的预览
        compressedPreview.src = compressedObjectURL;
        
        // 更新压缩后的文件信息
        compressedSize.textContent = `大小: ${formatFileSize(compressedBlob.size)}`;
        const dimensions = await getImageDimensions(compressedBlob);
        compressedDimensions.textContent = `尺寸: ${dimensions.width} x ${dimensions.height}`;
        
        // 计算并显示压缩比
        const ratio = (compressedBlob.size / currentFile.size * 100).toFixed(1);
        compressionRatio.textContent = `压缩比: ${ratio}%`;
        compressionRatio.style.color = ratio < 50 ? '#4CAF50' : (ratio < 80 ? '#FF9800' : '#F44336');
        
        // 启用下载按钮
        downloadBtn.disabled = false;
        
    } catch (error) {
        console.error('压缩失败:', error);
        alert(`图片压缩失败: ${error.message || '未知错误'}，请重试！`);
        
        // 禁用下载按钮
        downloadBtn.disabled = true;
    } finally {
        // 隐藏加载动画，完成进度条
        loadingSpinner.style.display = 'none';
        progressBar.style.width = '100%';
        
        // 延迟后隐藏进度条
        setTimeout(() => {
            progressBar.style.width = '0%';
        }, 1000);
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
    if (!compressedBlob) {
        alert('没有可下载的压缩图片');
        return;
    }
    
    try {
        const link = document.createElement('a');
        
        // 使用已存在的对象URL或创建新的
        link.href = compressedObjectURL || URL.createObjectURL(compressedBlob);
        
        // 生成文件名
        let filename = currentFile.name;
        const extension = filename.split('.').pop().toLowerCase();
        
        // 根据输出格式修改扩展名
        const outputFormat = formatSelector.value;
        if (outputFormat !== 'original') {
            filename = filename.replace(new RegExp(`\\.${extension}$`), '') + '.' + outputFormat;
        }
        
        // 添加压缩标记
        filename = filename.replace(new RegExp(`(\\.[^.]+)$`), '_compressed$1');
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 如果创建了新的对象URL，需要释放
        if (!compressedObjectURL) {
            URL.revokeObjectURL(link.href);
        }
        
        console.log('图片下载完成:', filename);
    } catch (error) {
        console.error('下载失败:', error);
        alert('下载压缩图片失败，请重试！');
    }
}

// 清除资源
function clearResources() {
    // 释放对象URL
    if (originalObjectURL) {
        URL.revokeObjectURL(originalObjectURL);
        originalObjectURL = null;
    }
    
    if (compressedObjectURL) {
        URL.revokeObjectURL(compressedObjectURL);
        compressedObjectURL = null;
    }
    
    compressedBlob = null;
}

// 重置
function reset() {
    clearResources();
    
    currentFile = null;
    fileInput.value = '';
    originalPreview.src = '';
    compressedPreview.src = '';
    originalSize.textContent = '大小: -- MB';
    compressedSize.textContent = '大小: -- MB';
    originalDimensions.textContent = '尺寸: -- x --';
    compressedDimensions.textContent = '尺寸: -- x --';
    compressionRatio.textContent = '压缩比: --';
    compressionRatio.style.color = '';
    
    // 恢复默认设置
    qualitySlider.value = 80;
    qualityValue.textContent = '80%';
    if (formatSelector) formatSelector.value = 'original';
    if (keepSizeCheckbox) keepSizeCheckbox.checked = true;
    
    // 隐藏UI
    settingsPanel.style.display = 'none';
    previewSection.style.display = 'none';
    document.getElementById('progressContainer').style.display = 'none';
    progressBar.style.width = '0%';
    
    // 禁用下载按钮
    downloadBtn.disabled = true;
    
    console.log('应用已重置');
}

// 保存用户设置到本地存储
function saveUserPreferences() {
    if (!window.localStorage) return;
    
    try {
        const preferences = {
            quality: qualitySlider.value,
            keepOriginalSize: keepSizeCheckbox.checked,
            outputFormat: formatSelector.value
        };
        
        localStorage.setItem('imageCompressorPreferences', JSON.stringify(preferences));
    } catch (error) {
        console.error('保存用户偏好设置失败:', error);
    }
}

// 加载用户设置
function loadUserPreferences() {
    if (!window.localStorage) return;
    
    try {
        const savedPreferences = localStorage.getItem('imageCompressorPreferences');
        if (savedPreferences) {
            const preferences = JSON.parse(savedPreferences);
            
            qualitySlider.value = preferences.quality || 80;
            qualityValue.textContent = `${qualitySlider.value}%`;
            
            if (keepSizeCheckbox && preferences.keepOriginalSize !== undefined) {
                keepSizeCheckbox.checked = preferences.keepOriginalSize;
            }
            
            if (formatSelector && preferences.outputFormat) {
                formatSelector.value = preferences.outputFormat;
            }
        }
    } catch (error) {
        console.error('加载用户偏好设置失败:', error);
    }
}

// 事件监听
qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = `${e.target.value}%`;
    if (currentFile) {
        // 使用防抖，避免拖动时过于频繁地压缩
        clearTimeout(qualitySlider.debounceTimer);
        qualitySlider.debounceTimer = setTimeout(() => compressImage(), 300);
    }
});

qualitySlider.addEventListener('change', saveUserPreferences);
if (keepSizeCheckbox) keepSizeCheckbox.addEventListener('change', saveUserPreferences);
if (formatSelector) formatSelector.addEventListener('change', saveUserPreferences);

downloadBtn.addEventListener('click', downloadCompressedImage);
resetBtn.addEventListener('click', reset);

// 页面关闭或刷新前清理资源
window.addEventListener('beforeunload', clearResources);

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    if (checkBrowserCompatibility()) {
        initDropZone();
        loadUserPreferences();
        
        // 默认禁用下载按钮，直到有压缩图片
        downloadBtn.disabled = true;
        
        console.log('图片压缩工具初始化完成');
    }
});