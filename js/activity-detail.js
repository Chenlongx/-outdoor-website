// 页面加载时初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 倒计时器
    startCountdown()

    // 查询活动获取信息
    const params = new URLSearchParams(window.location.search);
    const activityId = params.get('id');
    console.log(activityId)
    if (!activityId) {
        console.warn('No activity ID found in URL.');
        return;
    }
    const activity = await fetchActivityById(activityId);
    if (activity) {
      renderActivityDetail(activity);
    }
})


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


// 查询活动获取信息
async function fetchActivityById(activityId) {
    try {
      const response = await fetch(`/.netlify/functions/fetch-activity-detail?id=${activityId}`);
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data; // 这是活动的详细数据
    } catch (error) {
      console.error('Error fetching activity:', error);
      return null;
    }
  }


  function renderActivityDetail(activity) {
    console.log(activity)
    const title = activity.description?.title || activity.name;
    const duration = activity.description?.duration || activity.duration || 'N/A';
    const difficulty = activity.description?.difficulty || 'Unspecified';
    const start = activity.start_time?.split('T')[0] || '';
    const end = activity.end_time?.split('T')[0] || '';
    const highlights = activity.description?.highlights || [];
    const detailed =  activity.description?.included|| [];
    const description = activity.description?.content || 'No description provided';
    const gear = activity.description?.what_to_bring || [];
    const suitable = activity.description?.suitable_for || [];

  
    // 标题
    document.getElementById('activity-title').textContent = title;
  
    // 活动信息
    document.getElementById('activity-meta').innerHTML = `
      <span><i class="fas fa-calendar"></i> 开放时间：${start} – ${end}</span> |
      <span><i class="fas fa-clock"></i> 时长：${duration}</span> |
      <span><i class="fas fa-user-friends"></i> 难度：<span class="difficulty-label">${difficulty}</span></span>
    `;
  
    // 图片（仅插入第一张）
    const imgContainer = document.getElementById('activity-image');
    const firstImg = Array.isArray(activity.content_images) ? activity.content_images[0] : activity.content_images;
    if (firstImg?.url) {
      imgContainer.innerHTML = `<img src="${firstImg.url}" alt="${firstImg.alt || ''}" style="width:100%;height:auto;display:block;">`;
    }
  
    // 亮点
    const highlightsList = document.getElementById('activity-highlights');
    highlightsList.innerHTML = highlights.map(h => `<li>✅ ${h}</li>`).join('');
    
    // 详细介绍（Detailed Description）
    const detailedText = document.getElementById('activity-description');
    if(detailedText){
        detailedText.textContent = detailed.join('、');
    }


    // 适合人群
    const suitableText = document.getElementById('suitable-for-list');
    if (suitableText) {
        suitableText.textContent = suitable.join('、');
    }

    // 兼容装备
    const gearText = document.getElementById('gear-items');
    if (gearText) {
        gearText.textContent = gear.join('、');
    }

  }