// 图片压缩工具 JavaScript 代码
document.addEventListener('DOMContentLoaded', function() {
    // 单张模式DOM元素
    const fileInput = document.getElementById('imageInput');
    const compressionRatioInput = document.getElementById('compressionRatio');
    const compressionSlider = document.getElementById('compressionSlider');
    const qualityValue = document.getElementById('qualityValue');
    const compressButton = document.getElementById('compressButton');
    const resetButton = document.getElementById('resetButton');
    const originalPreview = document.getElementById('originalPreview');
    const compressedPreview = document.getElementById('compressedPreview');
    const originalInfoBox = document.getElementById('originalInfoBox');
    const compressedInfoBox = document.getElementById('compressedInfoBox');
    const downloadLink = document.getElementById('downloadLink');
    const successMessage = document.getElementById('successMessage');
    const dropZone = document.getElementById('dropZone');
    
    // 批量模式DOM元素
    const batchImageInput = document.getElementById('batchImageInput');
    const batchCompressionRatioInput = document.getElementById('batchCompressionRatio');
    const batchCompressionSlider = document.getElementById('batchCompressionSlider');
    const batchQualityValue = document.getElementById('batchQualityValue');
    const batchCompressButton = document.getElementById('batchCompressButton');
    const batchDropZone = document.getElementById('batchDropZone');
    const fileList = document.getElementById('fileList');
    const downloadAllButton = document.getElementById('downloadAllButton');
    const clearAllButton = document.getElementById('clearAllButton');
    const totalFilesCount = document.getElementById('totalFilesCount');
    const totalOriginalSize = document.getElementById('totalOriginalSize');
    const totalCompressedSize = document.getElementById('totalCompressedSize');
    const totalCompressionRatio = document.getElementById('totalCompressionRatio');
    
    // 模式切换
    const singleModeBtn = document.getElementById('singleModeBtn');
    const batchModeBtn = document.getElementById('batchModeBtn');
    const singleModeContainer = document.getElementById('singleModeContainer');
    const batchModeContainer = document.getElementById('batchModeContainer');
    
    // 当前上传的文件（单张模式）
    let currentFile = null;
    
    // 批量模式的文件列表
    let batchFiles = [];
    
    // 文件大小格式化函数
    function formatFileSize(bytes) {
        if (bytes < 1024) {
            return bytes + ' B';
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(2) + ' KB';
        } else {
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }
    }
    
    // 模式切换功能
    singleModeBtn.addEventListener('click', function() {
        singleModeBtn.classList.add('active');
        batchModeBtn.classList.remove('active');
        singleModeContainer.classList.add('active');
        batchModeContainer.classList.remove('active');
    });
    
    batchModeBtn.addEventListener('click', function() {
        batchModeBtn.classList.add('active');
        singleModeBtn.classList.remove('active');
        batchModeContainer.classList.add('active');
        singleModeContainer.classList.remove('active');
    });
    
    // ===================== 单张模式功能 =====================
    
    // 同步滑块和数字输入框的值
    compressionSlider.addEventListener('input', function() {
        compressionRatioInput.value = this.value;
        qualityValue.textContent = this.value + '%';
    });
    
    compressionRatioInput.addEventListener('input', function() {
        // 确保输入值在1-100之间
        let value = parseInt(this.value);
        if (value < 1) value = 1;
        if (value > 100) value = 100;
        if (isNaN(value)) value = 80;
        
        compressionSlider.value = value;
        qualityValue.textContent = value + '%';
    });
    
    // 拖放功能
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropZone.classList.add('drag-active');
    }
    
    function unhighlight() {
        dropZone.classList.remove('drag-active');
    }
    
    dropZone.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect(files[0]);
        }
    }
    
    // 当用户选择文件时立即显示预览
    fileInput.addEventListener('change', function() {
        if (fileInput.files.length === 0) return;
        handleFileSelect(fileInput.files[0]);
    });
    
    function handleFileSelect(file) {
        // 检查文件类型
        if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
            showError('请上传 PNG 或 JPG/JPEG 格式的图片');
            fileInput.value = '';
            return;
        }
        
        currentFile = file;
        
        // 显示加载状态
        originalPreview.innerHTML = `<div class="placeholder loading">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm0 15a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0v-3a1 1 0 0 1 1-1zm10-5a1 1 0 0 1-1 1h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 1 1zM7 12a1 1 0 0 1-1 1H3a1 1 0 0 1 0-2h3a1 1 0 0 1 1 1zm12.071 7.071a1 1 0 0 1-1.414 0l-2.121-2.121a1 1 0 0 1 1.414-1.414l2.121 2.121a1 1 0 0 1 0 1.414zM8.464 8.464a1 1 0 0 1-1.414 0L4.93 6.344a1 1 0 0 1 1.414-1.415L8.464 7.05a1 1 0 0 1 0 1.414zM4.93 19.071a1 1 0 0 1 0-1.414l2.121-2.121a1 1 0 0 1 1.414 1.414l-2.121 2.121a1 1 0 0 1-1.414 0zM15.536 8.464a1 1 0 0 1 0-1.414l2.12-2.121a1 1 0 1 1 1.415 1.414l-2.121 2.121a1 1 0 0 1-1.414 0z"/></svg>
            <span>加载中...</span>
        </div>`;
        
        // 显示原始图片预览
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                originalPreview.innerHTML = `<img src="${img.src}" alt="原始图片">`;
                
                // 显示原始文件信息
                originalInfoBox.innerHTML = `
                    <div class="file-info-title">原始图片信息</div>
                    <div class="size-info">
                        <div class="size-label">文件大小</div>
                        <div class="size-value">${formatFileSize(file.size)}</div>
                    </div>
                    <div class="size-info">
                        <div class="size-label">图片尺寸</div>
                        <div class="size-value">${img.width} × ${img.height} 像素</div>
                    </div>
                    <div class="size-info">
                        <div class="size-label">文件类型</div>
                        <div class="size-value">${file.type.split('/')[1].toUpperCase()}</div>
                    </div>
                `;
                
                // 重置压缩预览
                compressedPreview.innerHTML = `<div class="placeholder loading">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm0 15a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0v-3a1 1 0 0 1 1-1zm10-5a1 1 0 0 1-1 1h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 1 1zM7 12a1 1 0 0 1-1 1H3a1 1 0 0 1 0-2h3a1 1 0 0 1 1 1zm12.071 7.071a1 1 0 0 1-1.414 0l-2.121-2.121a1 1 0 0 1 1.414-1.414l2.121 2.121a1 1 0 0 1 0 1.414zM8.464 8.464a1 1 0 0 1-1.414 0L4.93 6.344a1 1 0 0 1 1.414-1.415L8.464 7.05a1 1 0 0 1 0 1.414zM4.93 19.071a1 1 0 0 1 0-1.414l2.121-2.121a1 1 0 0 1 1.414 1.414l-2.121 2.121a1 1 0 0 1-1.414 0zM15.536 8.464a1 1 0 0 1 0-1.414l2.12-2.121a1 1 0 1 1 1.415 1.414l-2.121 2.121a1 1 0 0 1-1.414 0z"/></svg>
                    <span>正在压缩...</span>
                </div>`;
                
                // 重置压缩信息区域
                compressedInfoBox.innerHTML = `
                    <div class="file-info-title">压缩后图片信息</div>
                    <div class="empty-file-info">正在压缩...</div>
                `;
                
                // 启用压缩按钮，但改为"重新压缩"文字
                compressButton.disabled = false;
                compressButton.textContent = '重新压缩';
                
                // 自动应用默认压缩质量
                const defaultQuality = 80;
                compressionRatioInput.value = defaultQuality;
                compressionSlider.value = defaultQuality;
                qualityValue.textContent = defaultQuality + '%';
                
                // 自动执行压缩
                setTimeout(() => {
                    compressImage(file, defaultQuality, function(compressedDataUrl, compressedSize, originalSize, width, height) {
                        // 显示压缩后的图片
                        compressedPreview.innerHTML = `<img src="${compressedDataUrl}" alt="压缩后图片">`;
                        
                        // 更新压缩后文件信息
                        const compressionPercentage = Math.round((1 - compressedSize / originalSize) * 100);
                        compressedInfoBox.innerHTML = `
                            <div class="file-info-title">压缩后图片信息</div>
                            <div class="size-info">
                                <div class="size-label">文件大小</div>
                                <div class="size-value">${formatFileSize(compressedSize)}</div>
                            </div>
                            <div class="size-info">
                                <div class="size-label">图片尺寸</div>
                                <div class="size-value">${width} × ${height} 像素</div>
                            </div>
                            <div class="size-info">
                                <div class="size-label">压缩率</div>
                                <div class="size-value compression-ratio">${compressionPercentage}%</div>
                            </div>
                            <div class="size-info">
                                <div class="size-label">质量设置</div>
                                <div class="size-value">${defaultQuality}%</div>
                            </div>
                        `;
                        
                        // 设置下载链接
                        downloadLink.href = compressedDataUrl;
                        downloadLink.download = `compressed_${file.name}`;
                        downloadLink.style.display = 'inline-block';
                        downloadLink.textContent = '下载压缩后的图片';
                        
                        // 显示重置按钮
                        resetButton.style.display = 'inline-block';
                        
                        // 显示成功消息
                        successMessage.style.display = 'flex';
                    });
                }, 500);
            };
        };
        reader.readAsDataURL(file);
    }
    
    // 显示错误消息
    function showError(message) {
        alert(message);
    }
    
    // 压缩图片
    compressButton.addEventListener('click', function() {
        if (!currentFile) {
            showError('请先上传一张图片');
            return;
        }
        
        // 显示加载状态
        compressButton.textContent = '压缩中...';
        compressButton.disabled = true;
        compressedPreview.innerHTML = `<div class="placeholder loading">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm0 15a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0v-3a1 1 0 0 1 1-1zm10-5a1 1 0 0 1-1 1h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 1 1zM7 12a1 1 0 0 1-1 1H3a1 1 0 0 1 0-2h3a1 1 0 0 1 1 1zm12.071 7.071a1 1 0 0 1-1.414 0l-2.121-2.121a1 1 0 0 1 1.414-1.414l2.121 2.121a1 1 0 0 1 0 1.414zM8.464 8.464a1 1 0 0 1-1.414 0L4.93 6.344a1 1 0 0 1 1.414-1.415L8.464 7.05a1 1 0 0 1 0 1.414zM4.93 19.071a1 1 0 0 1 0-1.414l2.121-2.121a1 1 0 0 1 1.414 1.414l-2.121 2.121a1 1 0 0 1-1.414 0zM15.536 8.464a1 1 0 0 1 0-1.414l2.12-2.121a1 1 0 1 1 1.415 1.414l-2.121 2.121a1 1 0 0 1-1.414 0z"/></svg>
            <span>正在压缩...</span>
        </div>`;
        
        const compressionRatio = parseInt(compressionRatioInput.value);
        
        // 验证压缩比例
        if (compressionRatio < 1 || compressionRatio > 100) {
            showError('压缩比例必须在1-100之间');
            compressionRatioInput.value = 80;
            compressionSlider.value = 80;
            qualityValue.textContent = '80%';
            compressButton.textContent = '压缩图片';
            compressButton.disabled = false;
            return;
        }
        
        // 使用setTimeout让UI有时间更新
        setTimeout(() => {
            compressImage(currentFile, compressionRatio, function(compressedDataUrl, compressedSize, originalSize, width, height) {
                // 显示压缩后的图片
                compressedPreview.innerHTML = `<img src="${compressedDataUrl}" alt="压缩后图片">`;
                
                // 更新压缩后文件信息
                const compressionPercentage = Math.round((1 - compressedSize / originalSize) * 100);
                compressedInfoBox.innerHTML = `
                    <div class="file-info-title">压缩后图片信息</div>
                    <div class="size-info">
                        <div class="size-label">文件大小</div>
                        <div class="size-value">${formatFileSize(compressedSize)}</div>
                    </div>
                    <div class="size-info">
                        <div class="size-label">图片尺寸</div>
                        <div class="size-value">${width} × ${height} 像素</div>
                    </div>
                    <div class="size-info">
                        <div class="size-label">压缩率</div>
                        <div class="size-value compression-ratio">${compressionPercentage}%</div>
                    </div>
                    <div class="size-info">
                        <div class="size-label">质量设置</div>
                        <div class="size-value">${compressionRatio}%</div>
                    </div>
                `;
                
                // 设置下载链接
                downloadLink.href = compressedDataUrl;
                downloadLink.download = `compressed_${currentFile.name}`;
                downloadLink.style.display = 'inline-block';
                downloadLink.textContent = '下载压缩后的图片';
                
                // 显示重置按钮
                resetButton.style.display = 'inline-block';
                
                // 显示成功消息
                successMessage.style.display = 'flex';
                
                // 恢复按钮状态
                compressButton.textContent = '重新压缩';
                compressButton.disabled = false;
            });
        }, 100);
    });
    
    // 图片压缩函数
    function compressImage(file, compressionRatio, callback) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = function() {
                // 创建画布进行压缩
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // 计算压缩后的尺寸
                let width = img.width;
                let height = img.height;
                
                // 根据压缩比例调整质量
                const quality = Math.max(0.1, Math.min(1, compressionRatio / 100));
                
                // 设置画布尺寸
                canvas.width = width;
                canvas.height = height;
                
                // 绘制图片
                ctx.drawImage(img, 0, 0, width, height);
                
                // 获取压缩后的图片数据
                const compressedDataUrl = canvas.toDataURL(file.type, quality);
                
                // 计算压缩后的大小
                const compressedSize = Math.round(compressedDataUrl.length * 0.75); // 大致估算base64转换后的大小
                
                if (callback) {
                    callback(compressedDataUrl, compressedSize, file.size, width, height);
                }
            };
        };
        
        reader.readAsDataURL(file);
    }
    
    // 重置按钮
    resetButton.addEventListener('click', function() {
        // 重置所有状态
        currentFile = null;
        fileInput.value = '';
        compressionRatioInput.value = 80;
        compressionSlider.value = 80;
        qualityValue.textContent = '80%';
        
        // 重置预览
        originalPreview.innerHTML = `<div class="placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 5H4v14l9.292-9.294a1 1 0 0 1 1.414 0L20 15.01V5zM2 3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H2.992A.993.993 0 0 1 2 20.007V3.993zM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>
            <span>请上传图片</span>
        </div>`;
        
        compressedPreview.innerHTML = `<div class="placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 5H4v14l9.292-9.294a1 1 0 0 1 1.414 0L20 15.01V5zM2 3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H2.992A.993.993 0 0 1 2 20.007V3.993zM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>
            <span>等待压缩</span>
        </div>`;
        
        // 重置文件信息区域
        originalInfoBox.innerHTML = `
            <div class="file-info-title">原始图片信息</div>
            <div class="empty-file-info">请上传图片查看详细信息</div>
        `;
        
        compressedInfoBox.innerHTML = `
            <div class="file-info-title">压缩后图片信息</div>
            <div class="empty-file-info">等待压缩</div>
        `;
        
        // 隐藏下载链接和重置按钮
        downloadLink.style.display = 'none';
        resetButton.style.display = 'none';
        
        // 隐藏成功消息
        successMessage.style.display = 'none';
        
        // 禁用压缩按钮
        compressButton.textContent = '压缩图片';
        compressButton.disabled = true;
    });
    
    // ===================== 批量模式功能 =====================
    
    // 同步滑块和数字输入框的值（批量模式）
    batchCompressionSlider.addEventListener('input', function() {
        batchCompressionRatioInput.value = this.value;
        batchQualityValue.textContent = this.value + '%';
        
        // 当用户调整质量时，启用批量压缩按钮以便重新压缩
        if (batchFiles.length > 0) {
            batchCompressButton.disabled = false;
            batchCompressButton.textContent = '重新压缩';
        }
    });
    
    // 拖放功能（批量模式）
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        batchDropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        batchDropZone.addEventListener(eventName, highlightBatch, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        batchDropZone.addEventListener(eventName, unhighlightBatch, false);
    });
    
    function highlightBatch() {
        batchDropZone.classList.add('drag-active');
    }
    
    function unhighlightBatch() {
        batchDropZone.classList.remove('drag-active');
    }
    
    batchDropZone.addEventListener('drop', handleBatchDrop, false);
    
    function handleBatchDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            batchImageInput.files = files;
            handleBatchSelect(files);
        }
    }
    
    // 当用户选择多个文件时处理
    batchImageInput.addEventListener('change', function() {
        if (batchImageInput.files.length === 0) return;
        handleBatchSelect(batchImageInput.files);
    });
    
    function handleBatchSelect(fileList) {
        let validFiles = [];
        
        // 过滤出有效的图片文件
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            if (file.type.match('image/jpeg') || file.type.match('image/png')) {
                validFiles.push({
                    file: file,
                    id: generateUniqueId(),
                    originalSize: file.size,
                    compressedSize: 0,
                    compressedDataUrl: null,
                    status: 'processing', // 改为'processing'，表示即将自动处理
                    width: 0,
                    height: 0
                });
            }
        }
        
        if (validFiles.length === 0) {
            showError('请上传 PNG 或 JPG/JPEG 格式的图片');
            batchImageInput.value = '';
            return;
        }
        
        // 添加到文件列表
        batchFiles = [...batchFiles, ...validFiles];
        
        // 更新UI
        updateBatchFileList();
        
        // 禁用批量压缩按钮，避免重复压缩
        batchCompressButton.disabled = true;
        batchCompressButton.textContent = '处理中...';
        
        // 启用清空列表按钮
        clearAllButton.disabled = false;
        
        // 设置默认压缩质量
        const defaultQuality = 80;
        batchCompressionRatioInput.value = defaultQuality;
        batchCompressionSlider.value = defaultQuality;
        batchQualityValue.textContent = defaultQuality + '%';
        
        // 自动批量压缩
        let processedCount = 0;
        
        // 找出所有新添加的文件（状态为'processing'）
        const filesToProcess = batchFiles.filter(item => item.status === 'processing');
        
        // 显示处理提示信息
        if (filesToProcess.length > 0) {
            const batchMessage = document.createElement('div');
            batchMessage.id = 'batchMessage';
            batchMessage.className = 'batch-message';
            batchMessage.innerHTML = `<div class="message-content">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" class="rotating-icon"><path d="M12 2a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm0 15a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0v-3a1 1 0 0 1 1-1zm10-5a1 1 0 0 1-1 1h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 1 1zM7 12a1 1 0 0 1-1 1H3a1 1 0 0 1 0-2h3a1 1 0 0 1 1 1zm12.071 7.071a1 1 0 0 1-1.414 0l-2.121-2.121a1 1 0 0 1 1.414-1.414l2.121 2.121a1 1 0 0 1 0 1.414zM8.464 8.464a1 1 0 0 1-1.414 0L4.93 6.344a1 1 0 0 1 1.414-1.415L8.464 7.05a1 1 0 0 1 0 1.414zM4.93 19.071a1 1 0 0 1 0-1.414l2.121-2.121a1 1 0 0 1 1.414 1.414l-2.121 2.121a1 1 0 0 1-1.414 0zM15.536 8.464a1 1 0 0 1 0-1.414l2.12-2.121a1 1 0 1 1 1.415 1.414l-2.121 2.121a1 1 0 0 1-1.414 0z"/></svg>
                <span>正在处理 0/${filesToProcess.length} 张图片</span>
            </div>`;
            
            // 如果已经存在，则移除旧的
            const existingMessage = document.getElementById('batchMessage');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            // 插入到文件列表前面
            const fileListContainer = document.querySelector('.file-list-container');
            fileListContainer.parentNode.insertBefore(batchMessage, fileListContainer);
        }
        
        // 逐个处理文件
        filesToProcess.forEach((fileItem, index) => {
            setTimeout(() => {
                // 更新处理进度
                const batchMessage = document.getElementById('batchMessage');
                if (batchMessage) {
                    const messageSpan = batchMessage.querySelector('span');
                    messageSpan.textContent = `正在处理 ${processedCount + 1}/${filesToProcess.length} 张图片`;
                }
                
                compressImage(fileItem.file, defaultQuality, function(compressedDataUrl, compressedSize, originalSize, width, height) {
                    const fileIndex = batchFiles.findIndex(item => item.id === fileItem.id);
                    
                    if (fileIndex !== -1) {
                        batchFiles[fileIndex].compressedDataUrl = compressedDataUrl;
                        batchFiles[fileIndex].compressedSize = compressedSize;
                        batchFiles[fileIndex].status = 'success';
                        batchFiles[fileIndex].width = width;
                        batchFiles[fileIndex].height = height;
                    }
                    
                    processedCount++;
                    
                    // 更新UI
                    updateBatchFileList();
                    updateBatchStats();
                    
                    // 更新处理进度
                    if (batchMessage) {
                        const messageSpan = batchMessage.querySelector('span');
                        messageSpan.textContent = `正在处理 ${processedCount}/${filesToProcess.length} 张图片`;
                    }
                    
                    // 如果全部处理完毕
                    if (processedCount === filesToProcess.length) {
                        // 恢复按钮状态
                        batchCompressButton.disabled = false;
                        batchCompressButton.textContent = '批量压缩';
                        
                        // 启用下载全部按钮
                        downloadAllButton.disabled = false;
                        
                        // 移除处理消息
                        if (batchMessage) {
                            // 显示成功信息
                            batchMessage.innerHTML = `<div class="message-content success">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                <span>全部 ${filesToProcess.length} 张图片处理完成！</span>
                            </div>`;
                            
                            // 3秒后自动消失
                            setTimeout(() => {
                                batchMessage.classList.add('fade-out');
                                setTimeout(() => {
                                    batchMessage.remove();
                                }, 300);
                            }, 3000);
                        }
                    }
                });
            }, index * 200); // 间隔处理，避免浏览器卡顿
        });
    }
    
    // 生成唯一ID
    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    
    // 更新批量文件列表UI
    function updateBatchFileList() {
        if (batchFiles.length === 0) {
            fileList.innerHTML = '<div class="empty-list">请上传图片文件</div>';
            return;
        }
        
        let html = '';
        
        batchFiles.forEach(fileItem => {
            let statusClass = 'file-status-' + fileItem.status;
            let statusText = '';
            
            switch (fileItem.status) {
                case 'waiting':
                    statusText = '等待压缩';
                    break;
                case 'processing':
                    statusText = '压缩中...';
                    break;
                case 'success':
                    statusText = '压缩成功';
                    break;
                case 'error':
                    statusText = '压缩失败';
                    break;
            }
            
            let compressionRate = fileItem.compressedSize > 0 
                ? Math.round((1 - fileItem.compressedSize / fileItem.originalSize) * 100) + '%' 
                : '-';
            
            let actionButtons = '';
            
            if (fileItem.status === 'success') {
                actionButtons = `
                    <button class="btn-primary download-btn" data-id="${fileItem.id}">下载</button>
                    <button class="btn-secondary remove-btn" data-id="${fileItem.id}">删除</button>
                `;
            } else if (fileItem.status === 'waiting' || fileItem.status === 'error') {
                actionButtons = `
                    <button class="btn-secondary compress-one-btn" data-id="${fileItem.id}">压缩</button>
                    <button class="btn-secondary remove-btn" data-id="${fileItem.id}">删除</button>
                `;
            } else {
                actionButtons = `
                    <button class="btn-secondary remove-btn" data-id="${fileItem.id}">删除</button>
                `;
            }
            
            html += `
                <div class="file-item" data-id="${fileItem.id}">
                    <div class="file-name" title="${fileItem.file.name}">${fileItem.file.name}</div>
                    <div class="file-size">${formatFileSize(fileItem.originalSize)}</div>
                    <div class="file-size">${fileItem.compressedSize > 0 ? formatFileSize(fileItem.compressedSize) : '-'}</div>
                    <div class="file-ratio">${compressionRate}</div>
                    <div class="file-status ${statusClass}">${statusText}</div>
                    <div class="file-action">
                        ${actionButtons}
                    </div>
                </div>
            `;
        });
        
        fileList.innerHTML = html;
        
        // 添加事件监听器
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                downloadSingleFile(id);
            });
        });
        
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                removeFile(id);
            });
        });
        
        document.querySelectorAll('.compress-one-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                compressOneFile(id);
            });
        });
    }
    
    // 更新批量统计信息
    function updateBatchStats() {
        totalFilesCount.textContent = batchFiles.length;
        
        let totalOriginalSizeBytes = 0;
        let totalCompressedSizeBytes = 0;
        let compressedFilesCount = 0;
        
        batchFiles.forEach(fileItem => {
            totalOriginalSizeBytes += fileItem.originalSize;
            
            if (fileItem.status === 'success') {
                totalCompressedSizeBytes += fileItem.compressedSize;
                compressedFilesCount++;
            }
        });
        
        totalOriginalSize.textContent = formatFileSize(totalOriginalSizeBytes);
        
        if (compressedFilesCount > 0) {
            totalCompressedSize.textContent = formatFileSize(totalCompressedSizeBytes);
            const ratio = Math.round((1 - totalCompressedSizeBytes / totalOriginalSizeBytes) * 100);
            totalCompressionRatio.textContent = ratio + '%';
            
            // 启用下载全部按钮
            downloadAllButton.disabled = false;
        } else {
            totalCompressedSize.textContent = '0 KB';
            totalCompressionRatio.textContent = '0%';
            
            // 禁用下载全部按钮
            downloadAllButton.disabled = true;
        }
    }
    
    // 压缩单个文件
    function compressOneFile(id) {
        const fileIndex = batchFiles.findIndex(item => item.id === id);
        
        if (fileIndex === -1) return;
        
        // 更新状态
        batchFiles[fileIndex].status = 'processing';
        updateBatchFileList();
        
        const compressionRatio = parseInt(batchCompressionRatioInput.value);
        
        compressImage(batchFiles[fileIndex].file, compressionRatio, function(compressedDataUrl, compressedSize, originalSize, width, height) {
            batchFiles[fileIndex].compressedDataUrl = compressedDataUrl;
            batchFiles[fileIndex].compressedSize = compressedSize;
            batchFiles[fileIndex].status = 'success';
            batchFiles[fileIndex].width = width;
            batchFiles[fileIndex].height = height;
            
            updateBatchFileList();
            updateBatchStats();
        });
    }
    
    // 批量压缩按钮事件
    batchCompressButton.addEventListener('click', function() {
        if (batchFiles.length === 0) {
            showError('请先上传图片');
            return;
        }
        
        const compressionRatio = parseInt(batchCompressionRatioInput.value);
        
        // 验证压缩比例
        if (compressionRatio < 1 || compressionRatio > 100) {
            showError('压缩比例必须在1-100之间');
            batchCompressionRatioInput.value = 80;
            batchCompressionSlider.value = 80;
            batchQualityValue.textContent = '80%';
            return;
        }
        
        // 禁用按钮
        batchCompressButton.disabled = true;
        batchCompressButton.textContent = '压缩中...';
        
        // 重置所有已经成功的文件为'waiting'状态，以便重新压缩
        batchFiles.forEach(item => {
            if (item.status === 'success') {
                item.status = 'waiting';
            }
        });
        
        // 更新UI
        updateBatchFileList();
        
        // 找出所有等待压缩或错误的文件
        const waitingFiles = batchFiles.filter(item => item.status === 'waiting' || item.status === 'error');
        let processedCount = 0;
        
        // 如果没有需要处理的文件，直接返回
        if (waitingFiles.length === 0) {
            batchCompressButton.disabled = false;
            return;
        }
        
        // 显示处理提示信息
        const batchMessage = document.createElement('div');
        batchMessage.id = 'batchMessage';
        batchMessage.className = 'batch-message';
        batchMessage.innerHTML = `<div class="message-content">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" class="rotating-icon"><path d="M12 2a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm0 15a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0v-3a1 1 0 0 1 1-1zm10-5a1 1 0 0 1-1 1h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 1 1zM7 12a1 1 0 0 1-1 1H3a1 1 0 0 1 0-2h3a1 1 0 0 1 1 1zm12.071 7.071a1 1 0 0 1-1.414 0l-2.121-2.121a1 1 0 0 1 1.414-1.414l2.121 2.121a1 1 0 0 1 0 1.414zM8.464 8.464a1 1 0 0 1-1.414 0L4.93 6.344a1 1 0 0 1 1.414-1.415L8.464 7.05a1 1 0 0 1 0 1.414zM4.93 19.071a1 1 0 0 1 0-1.414l2.121-2.121a1 1 0 0 1 1.414 1.414l-2.121 2.121a1 1 0 0 1-1.414 0zM15.536 8.464a1 1 0 0 1 0-1.414l2.12-2.121a1 1 0 1 1 1.415 1.414l-2.121 2.121a1 1 0 0 1-1.414 0z"/></svg>
            <span>重新压缩中 0/${waitingFiles.length} 张图片</span>
        </div>`;
        
        // 如果已经存在，则移除旧的
        const existingMessage = document.getElementById('batchMessage');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // 插入到文件列表前面
        const fileListContainer = document.querySelector('.file-list-container');
        fileListContainer.parentNode.insertBefore(batchMessage, fileListContainer);
        
        // 逐个处理文件
        waitingFiles.forEach((fileItem, index) => {
            fileItem.status = 'processing';
            updateBatchFileList();
            
            setTimeout(() => {
                // 更新处理进度
                const messageSpan = batchMessage.querySelector('span');
                messageSpan.textContent = `重新压缩中 ${processedCount + 1}/${waitingFiles.length} 张图片`;
                
                compressImage(fileItem.file, compressionRatio, function(compressedDataUrl, compressedSize, originalSize, width, height) {
                    const fileIndex = batchFiles.findIndex(item => item.id === fileItem.id);
                    
                    if (fileIndex !== -1) {
                        batchFiles[fileIndex].compressedDataUrl = compressedDataUrl;
                        batchFiles[fileIndex].compressedSize = compressedSize;
                        batchFiles[fileIndex].status = 'success';
                        batchFiles[fileIndex].width = width;
                        batchFiles[fileIndex].height = height;
                    }
                    
                    processedCount++;
                    
                    // 更新UI
                    updateBatchFileList();
                    updateBatchStats();
                    
                    // 更新处理进度
                    messageSpan.textContent = `重新压缩中 ${processedCount}/${waitingFiles.length} 张图片`;
                    
                    // 如果全部处理完毕
                    if (processedCount === waitingFiles.length) {
                        // 恢复按钮状态
                        batchCompressButton.disabled = false;
                        batchCompressButton.textContent = '批量压缩';
                        
                        // 启用下载全部按钮
                        downloadAllButton.disabled = false;
                        
                        // 显示成功信息
                        batchMessage.innerHTML = `<div class="message-content success">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            <span>全部 ${waitingFiles.length} 张图片重新压缩完成！</span>
                        </div>`;
                        
                        // 3秒后自动消失
                        setTimeout(() => {
                            batchMessage.classList.add('fade-out');
                            setTimeout(() => {
                                batchMessage.remove();
                            }, 300);
                        }, 3000);
                    }
                });
            }, index * 200); // 间隔处理，避免浏览器卡顿
        });
    });
    
    // 下载单个压缩后的文件
    function downloadSingleFile(id) {
        const fileItem = batchFiles.find(item => item.id === id);
        
        if (!fileItem || fileItem.status !== 'success') return;
        
        const link = document.createElement('a');
        link.href = fileItem.compressedDataUrl;
        link.download = `compressed_${fileItem.file.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // 下载所有压缩后的文件
    downloadAllButton.addEventListener('click', function() {
        const successFiles = batchFiles.filter(item => item.status === 'success');
        
        if (successFiles.length === 0) {
            showError('没有可下载的文件');
            return;
        }
        
        // 如果只有一个文件，直接下载
        if (successFiles.length === 1) {
            downloadSingleFile(successFiles[0].id);
            return;
        }
        
        // 多个文件，使用JSZip打包下载
        const zip = new JSZip();
        let count = 0;
        
        // 显示下载状态
        downloadAllButton.disabled = true;
        downloadAllButton.textContent = '打包中...';
        
        successFiles.forEach(fileItem => {
            // 从dataURL提取base64数据
            const base64Data = fileItem.compressedDataUrl.split(',')[1];
            zip.file(`compressed_${fileItem.file.name}`, base64Data, {base64: true});
            
            count++;
            if (count === successFiles.length) {
                // 生成ZIP文件并下载
                zip.generateAsync({type: 'blob'}).then(function(content) {
                    saveAs(content, 'compressed_images.zip');
                    
                    // 恢复按钮状态
                    downloadAllButton.disabled = false;
                    downloadAllButton.textContent = '下载全部';
                });
            }
        });
    });
    
    // 删除单个文件
    function removeFile(id) {
        const fileIndex = batchFiles.findIndex(item => item.id === id);
        
        if (fileIndex === -1) return;
        
        batchFiles.splice(fileIndex, 1);
        updateBatchFileList();
        updateBatchStats();
        
        if (batchFiles.length === 0) {
            clearAllButton.disabled = true;
            batchCompressButton.disabled = true;
        }
    }
    
    // 清空文件列表
    clearAllButton.addEventListener('click', function() {
        // 询问用户是否确认清空
        if (confirm('确定要清空所有文件吗？')) {
            batchFiles = [];
            updateBatchFileList();
            updateBatchStats();
            
            batchImageInput.value = '';
            clearAllButton.disabled = true;
            batchCompressButton.disabled = true;
            downloadAllButton.disabled = true;
        }
    });
}); 