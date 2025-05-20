document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    startCountdown()

    if (!slug || !slug.includes('-')) {
      document.body.innerHTML = '<h2>Invalid guide link.</h2>';
      return;
    }
  
    const shortId = slug.split('-').pop(); // 最后 8 位
    
    try {
      const res = await fetch(`/.netlify/functions/get-guide-by-short-id?short_id=${shortId}`);
      const data = await res.json();
      console.log(data)
      if (!data || data.error) {
        document.body.innerHTML = '<h2>Guide not found.</h2>';
        return;
      }
  
      renderGuide(data);


    } catch (err) {
      console.error(err);
      document.body.innerHTML = '<h2>Error loading guide.</h2>';
    }
  });
  
  function renderGuide(article) {
    // document.title = article.title;

    // 设置页面标题
    document.title = `${article.title} | Summitgearhub`;

    // 移除已存在的动态 meta（避免重复）
    document.querySelectorAll('[data-dynamic-meta]').forEach(el => el.remove());

    // 创建并插入 meta 标签函数
    function addMetaTag(name, content, property = false) {
        const tag = document.createElement('meta');
        tag.setAttribute(property ? 'property' : 'name', name);
        tag.setAttribute('content', content);
        tag.setAttribute('data-dynamic-meta', 'true'); // 标记可识别
        document.head.appendChild(tag);
    }

    // 提取用于 SEO 的信息
    const description = article.content?.blocks?.find(b => b.type === 'paragraph')?.text?.slice(0, 160) || 'Explore this expert outdoor guide.';
    const seoImage = article.img || article.content?.cover || '';
    const url = window.location.href;

    // 标准 Meta 标签
    addMetaTag('description', description);
    addMetaTag('keywords', (article.label?.categories || []).join(', '));
    addMetaTag('author', article.name || article.content?.author || '');

    // Open Graph 标签
    addMetaTag('og:title', article.title, true);
    addMetaTag('og:description', description, true);
    addMetaTag('og:image', seoImage, true);
    addMetaTag('og:type', 'article', true);
    addMetaTag('og:url', url, true);
    addMetaTag('og:site_name', 'Summitgearhub', true);

    // Twitter Card 标签（可选）
    addMetaTag('twitter:card', 'summary_large_image');
    addMetaTag('twitter:title', article.title);
    addMetaTag('twitter:description', description);
    addMetaTag('twitter:image', seoImage);


    // 标题
    const h1 = document.querySelector('h1');
    if (h1) h1.textContent = article.title;
  
    // 主图
    const image = document.querySelector('.guide-detail-image');
    if (image && article.img) {
      image.src = article.img;
      image.alt = article.title;
    }
  
    // 头像
    const avatarImg = document.querySelector('.author-avatar');
    if (avatarImg && article.content.avatar) {
      avatarImg.src = article.content.avatar;
      avatarImg.alt = article.name || 'Author';
    }

    // 作者姓名
    const authorNameEl = document.querySelector('.author-name');
    if (authorNameEl && article.name) {
        authorNameEl.textContent = `${article.name}`;
    }
    
    // 发布时间
    const dateEl = document.querySelector('.article-date');
    if (dateEl && article.created_at) {
    const date = new Date(article.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    dateEl.innerHTML = `<i class="far fa-calendar-alt"></i> ${date}`;
    }

    // 标签 Guide Level（如 Beginner / Advanced）
    const levelWrapper = document.querySelector('.guide-level');
    if (levelWrapper && article.guide_level) {
        const level = article.guide_level.toLowerCase(); // 用于添加 class
        const capitalized = level.charAt(0).toUpperCase() + level.slice(1); // 格式化首字母大写
        levelWrapper.className = `guide-level ${level}`; // 设置样式类
        levelWrapper.textContent = capitalized;
    }

    // 设置文章标签（第一个为 featured_type，其余来自 label.categories）
    const tagsContainer = document.querySelector('.guide-tags');
    const categories = article.label?.categories || [];
    const featuredType = article.featured_type;

    if (tagsContainer) {
        let html = '';

        // 第一个标签：featured_type
        if (featuredType) {
            html += `<span class="guide-category">${featuredType}</span>`;
        }

        // 其余标签
        categories.forEach(cat => {
            html += `<span class="guide-category" style="background:var(--light-gray); color:var(--primary-color); border-radius:4px; padding:2px 10px;">${cat}</span>`;
        });

        tagsContainer.innerHTML = html;
    }


    // 内容区渲染
    const contentContainer = document.querySelector('.guide-detail-body');
    if (!contentContainer) return;

    console.log(article)
  
    const blocks = article.content?.blocks || [];
    let html = '';
  
    blocks.forEach(block => {
        switch (block.type) {
          case 'heading':
            html += `<h2>${block.text}</h2>`;
            break;
          case 'paragraph':
            html += `<p>${block.text}</p>`;
            break;
          case 'image':
            html += `<img src="${block.src}" alt="${block.alt || ''}" loading="lazy" style="margin: 1.5rem 0; max-width: 100%;">`;
            break;
          case 'list':
            const tag = block.style === 'ordered' ? 'ol' : 'ul';
            html += `<${tag}>${block.items.map(i => `<li>${i}</li>`).join('')}</${tag}>`;
            break;
          case 'quote':
            html += `<blockquote>${block.text}</blockquote>`;
            break;
          case 'links':
            html += block.items.map(link => `<p><a href="${link.url}" target="_blank">${link.label}</a></p>`).join('');
            break;
          default:
            if (block.text) html += `<p>${block.text}</p>`;
            break;
        }
      });
      
      contentContainer.innerHTML = html;

    // ✅ 添加结构化数据 JSON-LD 到 <head>
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      },
      "headline": article.title,
      "description": description,
      "image": seoImage,
      "author": {
        "@type": "Person",
        "name": article.name || article.content?.author || "Summitgearhub"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Summitgearhub",
        "logo": {
          "@type": "ImageObject",
          "url": "https://summitgearhub.com/img/logo.svg"
        }
      },
      "datePublished": article.published_at || article.created_at || new Date().toISOString(),
      "dateModified": article.updated_at || article.created_at || new Date().toISOString()
    };

    const ldScript = document.createElement('script');
    ldScript.type = 'application/ld+json';
    ldScript.setAttribute('data-dynamic-meta', 'true');
    ldScript.textContent = JSON.stringify(structuredData);
    document.head.appendChild(ldScript);
  }


  // 倒计时器
async function startCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;

    try {
        // Fetch the end time from the Netlify function
        const response = await fetch('/.netlify/functions/get-activities');  // 调用Netlify函数
        const data = await response.json();
        
        // 获取从函数中返回的活动结束时间
        const countdownDate = new Date(data.endTime);  // 假设endTime是一个ISO格式的时间字符串

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = countdownDate - now;

            // Calculate time units
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Update DOM
            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');

            // If countdown is over
            if (distance < 0) {
                clearInterval(countdownInterval);
                countdownElement.innerHTML = 'Promotion Ended';
            }
        }

        // Initial call to update the countdown immediately
        updateCountdown();

        // Update countdown every second
        const countdownInterval = setInterval(updateCountdown, 1000);

    } catch (error) {
        console.error('Error fetching end time:', error);
    }
}