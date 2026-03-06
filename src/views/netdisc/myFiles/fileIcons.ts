/**
 * 根据文件名后缀匹配文件类型
 * @param fileName 文件名称
 * @returns 文件类型，如 'image', 'txt', 'excel', 'word', 'pdf', 'ppt', 'video', 'radio', 'zip', 'csv', 'sql', 'other'，或 false（无法匹配）
 */
function matchType(fileName: string): string | boolean {
  // 后缀获取
  let suffix = '';
  let result: string | boolean = '';

  try {
    const fileArr = fileName.split('.');
    //console.log('File Array:', fileArr); // 打印文件名分割结果
    suffix = fileArr[fileArr.length - 1].toLowerCase(); // 获取文件后缀并转换为小写
    //console.log('Suffix:', suffix); // 打印后缀
  } catch (err) {
    suffix = '';
  }

  // fileName无后缀返回 false
  if (!suffix) {
    result = false;
    return result;
  }

  // 图片格式
  const imglist = ['png', 'jpg', 'jpeg', 'bmp', 'gif'];
  if (imglist.includes(suffix)) {
    result = 'image';
    return result;
  }

  // 文本文件
  const txtlist = ['txt'];
  if (txtlist.includes(suffix)) {
    result = 'txt';
    return result;
  }

  // Excel 文件
  const excelist = ['xls', 'xlsx'];
  if (excelist.includes(suffix)) {
    result = 'excel';
    return result;
  }

  // Word 文件
  const wordlist = ['doc', 'docx'];
  if (wordlist.includes(suffix)) {
    result = 'word';
    return result;
  }

  // PDF 文件
  const pdflist = ['pdf'];
  if (pdflist.includes(suffix)) {
    result = 'pdf';
    return result;
  }

  // PowerPoint 文件
  const pptlist = ['ppt'];
  if (pptlist.includes(suffix)) {
    result = 'ppt';
    return result;
  }

  // 视频文件
  const videolist = ['mp4', 'm2v', 'mkv'];
  if (videolist.includes(suffix)) {
    result = 'video';
    return result;
  }

  // 音频文件
  const radiolist = ['mp3', 'wav', 'wmv'];
  if (radiolist.includes(suffix)) {
    result = 'radio';
    return result;
  }

  // 压缩包文件
  const packagelist = ['zip', 'rar', 'tar'];
  if (packagelist.includes(suffix)) {
    result = 'zip';
    return result;
  }

  // CSV 文件
  const CSVlist = ['csv'];
  if (CSVlist.includes(suffix)) {
    result = 'csv';
    return result;
  }

  // SQL 文件
  const SQLlist = ['sql'];
  if (SQLlist.includes(suffix)) {
    result = 'sql';
    return result;
  }

  // 其他 文件类型
  result = 'other';
  return result;
}

export {
  matchType
};
