// 压缩图片
async function compressImage() {
    if (!currentFile) return;

    const quality = parseFloat(qualitySlider.value) / 100;
    console.log(`准备压缩 - 质量: ${quality}, 原始文件大小: ${formatFileSize(currentFile.size)}`);

    try {
        // 导入browser-image-compression库
        const imageCompression = window.imageCompression;
        if (!imageCompression) {
            console.error('imageCompression库未正确加载');
            alert('压缩库未加载，请刷新页面重试');
            return;
        }

        const options = {
            maxSizeMB: 5, // 最大文件大小
            maxWidthOrHeight: 2048, // 最大宽度或高度
            useWebWorker: true, // 使用Web Worker提高性能
            quality: quality // 设置压缩质量
        };

        console.log(`开始压缩...质量: ${quality}`);
        
        // 执行压缩
        compressedBlob = await imageCompression(currentFile, options);
        
        console.log(`压缩完成 - 质量: ${quality}, 压缩后文件大小: ${formatFileSize(compressedBlob.size)}`);
        
        // 显示压缩后的预览
        const compressedUrl = URL.createObjectURL(compressedBlob);
        compressedPreview.src = compressedUrl;
        compressedPreview.onload = async function() {
            // 更新压缩后的文件信息
            compressedSize.textContent = `大小: ${formatFileSize(compressedBlob.size)}`;
            const dimensions = await getImageDimensions(compressedBlob);
            compressedDimensions.textContent = `尺寸: ${dimensions.width} x ${dimensions.height}`;
            // 确保下载按钮可用
            downloadBtn.disabled = false;
        };
        
    } catch (error) {
        console.error('压缩失败:', error);
        alert('图片压缩失败，请重试！');
    }
}