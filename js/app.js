/**
 * Priest 个人主页 - 项目卡片渲染逻辑
 * index.html 显示前 6 个项目，projects.html 显示全部项目
 */

/**
 * 生成单个项目卡片的 HTML
 * @param {Object} project - 项目数据对象
 * @param {string} project.title - 项目名称
 * @param {string} project.desc - 项目简介
 * @param {string} project.url - 项目链接地址
 * @param {string} project.linkText - 卡片底部显示的链接文本
 * @param {string} project.gradient - 渐变类型 (lottery/yijing/liuren/xmas/roguelike)
 * @param {string} [project.thumbnail] - 缩略图相对路径 (可选)
 * @param {string} [project.aiTag] - AI 标签文本 (可选)
 * @returns {string} 卡片 HTML 字符串
 */
function createCardHTML(project, animDelay) {
  var aiTagHTML = project.aiTag
    ? '<span class="ai-tag">' + escapeHTML(project.aiTag) + '</span>'
    : '';

  // 缩略图：优先使用真实页面截图；无 thumbnail 字段时直接显示渐变
  // - loading="lazy" 懒加载；decoding="async" 异步解码避免阻塞
  // - onload 触发 .card-thumb--loaded 切换 opacity（与 CSS 配合实现淡入）
  // - onerror 时隐藏 img，让底层渐变作为兜底
  var thumbHTML = '';
  if (project.thumbnail) {
    thumbHTML = '<img class="card-thumb" src="' + escapeAttr(project.thumbnail) +
      '" alt="' + escapeAttr(project.title) +
      '" loading="lazy" decoding="async"' +
      ' onload="this.classList.add(\'card-thumb--loaded\')"' +
      ' onerror="this.style.display=\'none\'">';
  }

  // stagger 入场动画延迟（renderCards 传入）
  var animStyle = (typeof animDelay === 'number' && animDelay > 0)
    ? ' style="animation-delay:' + animDelay + 'ms"'
    : '';

  return '' +
    '<a href="' + escapeAttr(project.url) + '" target="_blank" rel="noopener" class="card" aria-label="' + escapeAttr(project.title) + '"' + animStyle + '>' +
      '<div class="card-image card-image--' + escapeAttr(project.gradient) + '">' +
        thumbHTML +
        '<span class="card-shine" aria-hidden="true"></span>' +
      '</div>' +
      '<div class="card-body">' +
        '<h3 class="card-title">' + escapeHTML(project.title) + '</h3>' +
        '<p class="card-desc">' + escapeHTML(project.desc) + '</p>' +
        '<p class="card-link">' + escapeHTML(project.linkText) +
          ' <svg class="card-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
            '<path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
          '</svg>' +
        '</p>' +
        aiTagHTML +
      '</div>' +
    '</a>';
}

/**
 * 生成占位卡片 HTML (用于项目不足 6 个时补位)
 * @returns {string}
 */
function createPlaceholderHTML() {
  return '' +
    '<div class="card card--placeholder">' +
      '<div class="card-image card-image--placeholder">' +
        '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M12 5v14M5 12h14" stroke="#A8A8A8" stroke-width="1.5" stroke-linecap="round"/>' +
        '</svg>' +
      '</div>' +
      '<div class="card-body">' +
        '<h3 class="card-title">\u66f4\u591a\u9879\u76ee\u656c\u8bf7\u671f\u5f85</h3>' +
        '<p class="card-desc">\u6301\u7eed\u63a2\u7d22\u4e2d\uff0c\u65b0\u9879\u76ee\u5373\u5c06\u4e0a\u7ebf</p>' +
      '</div>' +
    '</div>';
}

/**
 * 转义 HTML 文本内容中的特殊字符
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 转义属性值中的特殊字符
 * @param {string} str
 * @returns {string}
 */
function escapeAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * 渲染项目卡片到指定容器
 * @param {HTMLElement} container - 卡片容器 DOM 元素
 * @param {Array} projects - 项目数据数组
 * @param {number} limit - 最大显示数量 (0 表示全部)
 * @param {boolean} showPlaceholder - 是否在末尾添加占位卡片
 */
function renderCards(container, projects, limit, showPlaceholder) {
  if (!container) return;

  var list = limit > 0 ? projects.slice(0, limit) : projects;
  var html = '';
  var realCount = 0;

  for (var i = 0; i < list.length; i++) {
    // stagger 动画：每张延迟 60ms 入场，提升列表渐显观感
    html += createCardHTML(list[i], realCount * 60);
    realCount++;
  }

  if (showPlaceholder) {
    // 不足 6 个时用占位卡补齐到 6 个
    var total = realCount;
    var needed = total < 6 ? 6 - total : (total % 3 === 0 ? 0 : 3 - (total % 3));
    for (var j = 0; j < needed; j++) {
      // 占位卡沿用 stagger（紧跟真实卡片之后）
      html += createPlaceholderHTML(realCount * 60);
      realCount++;
    }
  }

  container.innerHTML = html;
}

/**
 * 更新二级页面的统计数据
 * @param {Array} projects - 项目数据数组
 */
function updateStats(projects) {
  var totalEl = document.getElementById('stat-total');
  var aiEl = document.getElementById('stat-ai');

  if (totalEl) {
    totalEl.textContent = projects.length;
  }

  if (aiEl) {
    var aiCount = projects.filter(function(p) { return p.aiTag; }).length;
    aiEl.textContent = aiCount;
  }
}

/**
 * 加载项目数据并渲染
 * @param {string} containerId - 卡片容器元素 ID
 * @param {number} limit - 最大显示数量 (0 = 全部)
 * @param {boolean} showPlaceholder - 是否显示占位卡片
 */
function loadProjects(containerId, limit, showPlaceholder) {
  function render(projects) {
    var container = document.getElementById(containerId);
    renderCards(container, projects, limit, showPlaceholder);

    // 二级页面统计
    if (limit === 0) {
      updateStats(projects);
    }
  }

  // 优先使用页面内联数据（<script> 标签加载，兼容 file:// 本地打开）
  if (window.PROJECTS) {
    render(window.PROJECTS);
    return;
  }

  // 兜底：fetch 远程 JSON（http/https 部署环境）
  fetch('projects.json')
    .then(function(res) { return res.json(); })
    .then(render)
    .catch(function(err) {
      console.error('Failed to load projects.json:', err);
      var container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '<p style="color:#A8A8A8;padding:40px;text-align:center;">\u9879\u76ee\u6570\u636e\u52a0\u8f7d\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5</p>';
      }
    });
}
