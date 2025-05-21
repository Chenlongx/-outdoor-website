// document.addEventListener('DOMContentLoaded', async () => {
//     const params = new URLSearchParams(window.location.search);
//     const slug = params.get('slug');
//     startCountdown()

//     if (!slug || !slug.includes('-')) {
//       document.body.innerHTML = '<h2>Invalid guide link.</h2>';
//       return;
//     }
  
//     const shortId = slug.split('-').pop(); // 最后 8 位
    
//     try {
//       const res = await fetch(`/.netlify/functions/get-guide-by-short-id?short_id=${shortId}`);
//       const data = await res.json();
//       console.log(data)
//       if (!data || data.error) {
//         document.body.innerHTML = '<h2>Guide not found.</h2>';
//         return;
//       }
  
//       renderGuide(data);


//     } catch (err) {
//       console.error(err);
//       document.body.innerHTML = '<h2>Error loading guide.</h2>';
//     }
//   });
  
//   function renderGuide(article) {
//     // document.title = article.title;

//     // 设置页面标题
//     document.title = `${article.title} | Summitgearhub`;

//     // 移除已存在的动态 meta（避免重复）
//     document.querySelectorAll('[data-dynamic-meta]').forEach(el => el.remove());

//     // 创建并插入 meta 标签函数
//     function addMetaTag(name, content, property = false) {
//         const tag = document.createElement('meta');
//         tag.setAttribute(property ? 'property' : 'name', name);
//         tag.setAttribute('content', content);
//         tag.setAttribute('data-dynamic-meta', 'true'); // 标记可识别
//         document.head.appendChild(tag);
//     }

//     // 提取用于 SEO 的信息
//     const description = article.content?.blocks?.find(b => b.type === 'paragraph')?.text?.slice(0, 160) || 'Explore this expert outdoor guide.';
//     const seoImage = article.img || article.content?.cover || '';
//     const url = window.location.href;

//     // 标准 Meta 标签
//     addMetaTag('description', description);
//     addMetaTag('keywords', (article.label?.categories || []).join(', '));
//     addMetaTag('author', article.name || article.content?.author || '');

//     // Open Graph 标签
//     addMetaTag('og:title', article.title, true);
//     addMetaTag('og:description', description, true);
//     addMetaTag('og:image', seoImage, true);
//     addMetaTag('og:type', 'article', true);
//     addMetaTag('og:url', url, true);
//     addMetaTag('og:site_name', 'Summitgearhub', true);

//     // Twitter Card 标签（可选）
//     addMetaTag('twitter:card', 'summary_large_image');
//     addMetaTag('twitter:title', article.title);
//     addMetaTag('twitter:description', description);
//     addMetaTag('twitter:image', seoImage);


//     // 标题
//     const h1 = document.querySelector('h1');
//     if (h1) h1.textContent = article.title;
  
//     // 主图
//     const image = document.querySelector('.guide-detail-image');
//     if (image && article.img) {
//       image.src = article.img;
//       image.alt = article.title;
//     }
  
//     // 头像
//     const avatarImg = document.querySelector('.author-avatar');
//     if (avatarImg && article.content.avatar) {
//       avatarImg.src = article.content.avatar;
//       avatarImg.alt = article.name || 'Author';
//     }

//     // 作者姓名
//     const authorNameEl = document.querySelector('.author-name');
//     if (authorNameEl && article.name) {
//         authorNameEl.textContent = `${article.name}`;
//     }
    
//     // 发布时间
//     const dateEl = document.querySelector('.article-date');
//     if (dateEl && article.created_at) {
//     const date = new Date(article.created_at).toLocaleDateString(undefined, {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric'
//     });
//     dateEl.innerHTML = `<i class="far fa-calendar-alt"></i> ${date}`;
//     }

//     // 标签 Guide Level（如 Beginner / Advanced）
//     const levelWrapper = document.querySelector('.guide-level');
//     if (levelWrapper && article.guide_level) {
//         const level = article.guide_level.toLowerCase(); // 用于添加 class
//         const capitalized = level.charAt(0).toUpperCase() + level.slice(1); // 格式化首字母大写
//         levelWrapper.className = `guide-level ${level}`; // 设置样式类
//         levelWrapper.textContent = capitalized;
//     }

//     // 设置文章标签（第一个为 featured_type，其余来自 label.categories）
//     const tagsContainer = document.querySelector('.guide-tags');
//     const categories = article.label?.categories || [];
//     const featuredType = article.featured_type;

//     if (tagsContainer) {
//         let html = '';

//         // 第一个标签：featured_type
//         if (featuredType) {
//             html += `<span class="guide-category">${featuredType}</span>`;
//         }

//         // 其余标签
//         categories.forEach(cat => {
//             html += `<span class="guide-category" style="background:var(--light-gray); color:var(--primary-color); border-radius:4px; padding:2px 10px;">${cat}</span>`;
//         });

//         tagsContainer.innerHTML = html;
//     }


//     // 内容区渲染
//     const contentContainer = document.querySelector('.guide-detail-body');
//     if (!contentContainer) return;

//     console.log(article)
  
//     const blocks = article.content?.blocks || [];
//     let html = '';
  
//     blocks.forEach(block => {
//         switch (block.type) {
//           case 'heading':
//             html += `<h2>${block.text}</h2>`;
//             break;
//           case 'paragraph':
//             html += `<p>${block.text}</p>`;
//             break;
//           case 'image':
//             html += `<img src="${block.src}" alt="${block.alt || ''}" loading="lazy" decoding="async" style="margin: 1.5rem 0; max-width: 100%;">`;
//             break;
//           case 'list':
//             const tag = block.style === 'ordered' ? 'ol' : 'ul';
//             html += `<${tag}>${block.items.map(i => `<li>${i}</li>`).join('')}</${tag}>`;
//             break;
//           case 'quote':
//             html += `<blockquote>${block.text}</blockquote>`;
//             break;
//           case 'links':
//             html += block.items.map(link => `<p><a href="${link.url}" target="_blank">${link.label}</a></p>`).join('');
//             break;
//           default:
//             if (block.text) html += `<p>${block.text}</p>`;
//             break;
//         }
//       });
      
//       contentContainer.innerHTML = html;

//     // ✅ 添加结构化数据 JSON-LD 到 <head>
//     const structuredData = {
//       "@context": "https://schema.org",
//       "@type": "Article",
//       "mainEntityOfPage": {
//         "@type": "WebPage",
//         "@id": window.location.href
//       },
//       "headline": article.title,
//       "description": description,
//       "image": seoImage,
//       "author": {
//         "@type": "Person",
//         "name": article.name || article.content?.author || "Summitgearhub"
//       },
//       "publisher": {
//         "@type": "Organization",
//         "name": "Summitgearhub",
//         "logo": {
//           "@type": "ImageObject",
//           "url": "https://summitgearhub.com/img/logo.svg"
//         }
//       },
//       "datePublished": article.published_at || article.created_at || new Date().toISOString(),
//       "dateModified": article.updated_at || article.created_at || new Date().toISOString()
//     };

//     const ldScript = document.createElement('script');
//     ldScript.type = 'application/ld+json';
//     ldScript.setAttribute('data-dynamic-meta', 'true');
//     ldScript.textContent = JSON.stringify(structuredData);
//     document.head.appendChild(ldScript);
//   }


//   // 倒计时器
// async function startCountdown() {
//     const countdownElement = document.getElementById('countdown');
//     if (!countdownElement) return;

//     try {
//         // Fetch the end time from the Netlify function
//         const response = await fetch('/.netlify/functions/get-activities');  // 调用Netlify函数
//         const data = await response.json();
        
//         // 获取从函数中返回的活动结束时间
//         const countdownDate = new Date(data.endTime);  // 假设endTime是一个ISO格式的时间字符串

//         function updateCountdown() {
//             const now = new Date().getTime();
//             const distance = countdownDate - now;

//             // Calculate time units
//             const days = Math.floor(distance / (1000 * 60 * 60 * 24));
//             const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//             const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
//             const seconds = Math.floor((distance % (1000 * 60)) / 1000);

//             // Update DOM
//             document.getElementById('days').textContent = days.toString().padStart(2, '0');
//             document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
//             document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
//             document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');

//             // If countdown is over
//             if (distance < 0) {
//                 clearInterval(countdownInterval);
//                 countdownElement.innerHTML = 'Promotion Ended';
//             }
//         }

//         // Initial call to update the countdown immediately
//         updateCountdown();

//         // Update countdown every second
//         const countdownInterval = setInterval(updateCountdown, 1000);

//     } catch (error) {
//         console.error('Error fetching end time:', error);
//     }
// }






// guide-article.js
(() => {
  // 1. 解析 slug
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug || !slug.includes('-')) {
    document.body.innerHTML = '<h2>Invalid guide link.</h2>';
    return;
  }
  const shortId = slug.split('-').pop();

  // 2. 从后端拉取文章数据
  async function fetchGuide() {
    try {
      const res = await fetch(`/.netlify/functions/get-guide-by-short-id?short_id=${shortId}`);
      const data = await res.json();
      if (!data || data.error) {
        document.body.innerHTML = '<h2>Guide not found.</h2>';
        return null;
      }
      return data;
    } catch (err) {
      console.error(err);
      document.body.innerHTML = '<h2>Error loading guide.</h2>';
      return null;
    }
  }

  // 3. 首屏关键渲染：title、h1、主图、首段
  function renderCritical(article) {
    document.title = `${article.title} | Summitgearhub`;

    const h1 = document.querySelector('h1');
    if (h1) h1.textContent = article.title;

    const heroImg = document.querySelector('.guide-detail-image');
    if (heroImg && article.img) {
      heroImg.src = article.img;
      heroImg.alt = article.title;
    }

    // optional: 渲染第一段文字，避免白屏
    const firstPara = article.content?.blocks?.find(b => b.type === 'paragraph');
    if (firstPara) {
      const p = document.createElement('p');
      p.textContent = firstPara.text;
      const container = document.querySelector('.guide-detail-body');
      if (container) container.appendChild(p);
    }
  }

  // 4. 次要渲染：Meta 标签、剩余内容、倒计时
  function renderNonCritical(article) {
    // —— 4.1 批量插入 Meta / OG / Twitter 标签 —— 
    const fragMeta = document.createDocumentFragment();
    function addMeta(name, content, property = false) {
      const m = document.createElement('meta');
      m.setAttribute(property ? 'property' : 'name', name);
      m.setAttribute('content', content);
      fragMeta.appendChild(m);
    }
    const description = article.content?.blocks?.find(b=>b.type==='paragraph')?.text.slice(0,160) 
                        || 'Explore this expert outdoor guide.';
    const seoImage = article.img || article.content?.cover || '';
    const url = window.location.href;

    addMeta('description', description);
    addMeta('keywords', (article.label?.categories||[]).join(','));
    addMeta('author', article.name||'');
    addMeta('og:title', article.title, true);
    addMeta('og:description', description, true);
    addMeta('og:image', seoImage, true);
    addMeta('og:type','article', true);
    addMeta('og:url',url, true);
    addMeta('og:site_name','Summitgearhub', true);
    addMeta('twitter:card','summary_large_image');
    addMeta('twitter:title',article.title);
    addMeta('twitter:description',description);
    addMeta('twitter:image',seoImage);
    document.head.appendChild(fragMeta);

    // —— 4.2 头像 / 作者 / 日期 / 级别 / 标签 —— 
    const avatar = document.querySelector('.author-avatar');
    if (avatar && article.content.avatar) avatar.src = article.content.avatar;

    const nameEl = document.querySelector('.author-name');
    if (nameEl) nameEl.textContent = article.name || '';

    const dateEl = document.querySelector('.article-date');
    if (dateEl && article.created_at) {
      const d = new Date(article.created_at);
      dateEl.innerHTML = `<i class="far fa-calendar-alt"></i> ${d.toLocaleDateString(undefined,{
        year:'numeric',month:'short',day:'numeric'
      })}`;
    }

    const levelEl = document.querySelector('.guide-level');
    if (levelEl && article.guide_level) {
      const lvl = article.guide_level.toLowerCase();
      levelEl.className = `guide-level ${lvl}`;
      levelEl.textContent = article.guide_level[0].toUpperCase() + article.guide_level.slice(1);
    }

    const tagsContainer = document.querySelector('.guide-tags');
    if (tagsContainer) {
      const featured = article.featured_type ? 
        `<span class="guide-category">${article.featured_type}</span>` : '';
      const cats = (article.label?.categories||[])
        .map(c=>`<span class="guide-category">${c}</span>`).join('');
      tagsContainer.innerHTML = featured + cats;
    }

    // —— 4.3 渲染其余内容块 —— 
    const body = document.querySelector('.guide-detail-body');
    if (body) {
      const blocks = article.content?.blocks || [];
      const html = blocks.map(block => {
        switch (block.type) {
          case 'heading':   return `<h2>${block.text}</h2>`;
          case 'paragraph': return `<p>${block.text}</p>`;
          case 'image':     return `<img src="${block.src}" alt="${block.alt||''}" loading="lazy" decoding="async" style="margin:1.5rem 0;max-width:100%;">`;
          case 'list':
            const tag = block.style==='ordered'?'ol':'ul';
            return `<${tag}>${block.items.map(i=>`<li>${i}</li>`).join('')}</${tag}>`;
          case 'quote':     return `<blockquote>${block.text}</blockquote>`;
          case 'links':     return block.items.map(l=>`<p><a href="${l.url}" target="_blank">${l.label}</a></p>`).join('');
          default:          return block.text?`<p>${block.text}</p>`:'';
        }
      }).join('');
      body.innerHTML += html;
    }

    // —— 4.4 启动倒计时 —— 
    startCountdown();
  }

  // 5. 倒计时函数（保持原有逻辑）
  async function startCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;
    try {
      const res = await fetch('/.netlify/functions/get-activities');
      const data = await res.json();
      const countdownDate = new Date(data.endTime).getTime();

      function update() {
        const now = Date.now();
        const diff = countdownDate - now;
        const days = Math.floor(diff / (1000*60*60*24));
        const hours = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
        const minutes = Math.floor((diff % (1000*60*60)) / (1000*60));
        const seconds = Math.floor((diff % (1000*60)) / 1000);
        document.getElementById('days').textContent = String(days).padStart(2,'0');
        document.getElementById('hours').textContent = String(hours).padStart(2,'0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2,'0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2,'0');
        if (diff < 0) {
          clearInterval(timer);
          countdownElement.textContent = 'Promotion Ended';
        }
      }
      update();
      const timer = setInterval(update, 1000);
    } catch(e) {
      console.error('Countdown error', e);
    }
  }

  // 6. 主流程
  fetchGuide().then(article => {
    if (!article) return;
    renderCritical(article);

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => renderNonCritical(article));
    } else {
      setTimeout(() => renderNonCritical(article), 200);
    }
  });

})();
