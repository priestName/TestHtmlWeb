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
 * @param {string} [project.aiTag] - AI 标签文本 (可选)
 * @returns {string} 卡片 HTML 字符串
 */
function createCardHTML(project) {
  var aiTagHTML = project.aiTag
    ? '<span class="ai-tag">' + escapeHTML(project.aiTag) + '</span>'
    : '';

  return '' +
    '<a href="' + escapeAttr(project.url) + '" target="_blank" rel="noopener" class="card">' +
      '<div class="card-image card-image--' + escapeAttr(project.gradient) + '"></div>' +
      '<div class="card-body">' +
        '<h3 class="card-title">' + escapeHTML(project.title) + '</h3>' +
        '<p class="card-desc">' + escapeHTML(project.desc) + '</p>' +
        '<p class="card-link">' + escapeHTML(project.linkText) + ' \u2192</p>' +
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

  for (var i = 0; i < list.length; i++) {
    html += createCardHTML(list[i]);
  }

  if (showPlaceholder) {
    // 不足 6 个时用占位卡补齐到 6 个
    var total = list.length;
    var needed = total < 6 ? 6 - total : (total % 3 === 0 ? 0 : 3 - (total % 3));
    for (var j = 0; j < needed; j++) {
      html += createPlaceholderHTML();
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
