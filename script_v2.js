document.addEventListener('DOMContentLoaded', () => {
    const kissBtn = document.getElementById('kiss-btn');
    const fernOverlay = document.getElementById('fern-overlay');
    const fernMsg = fernOverlay.querySelector('.fern-message');
    const fernSub = fernOverlay.querySelector('.fern-message.sub');

    // --- 設定AIzaSyD-7piW3djXwy7iXjEFRIOHfrMPTiDZLVA ---
    const GEMINI_API_KEY = "";

    let attemptCount = 0;

    async function fetchDynamicReaction(count) {
        const randomSeed = Math.random().toString(36).substring(7);
        const prompt = `あなたは葬送のフリーレンのフェルンです。不躾な相手（${count}回目）に冷たく。1行目にセリフ、2行目に状況。SEED:${randomSeed}`;

        try {
            // URLを最も標準的でエラーの少ない「v1」パスに変更します
            // もしこれでも404なら、モデル名の指定方法をさらにシンプルにします
            const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // 404が出た場合、URLをもう一つの形式にリトライする
                const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
                const retryResponse = await fetch(fallbackUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });

                if (!retryResponse.ok) {
                    const retryData = await retryResponse.json();
                    return {
                        main: "「通信失敗」",
                        sub: `HTTP ${retryResponse.status}: ${retryData.error ? retryData.error.message : 'Not Found'}`
                    };
                }
                const retryData = await retryResponse.json();
                const rawText = retryData.candidates[0].content.parts[0].text.trim();
                const lines = rawText.split('\n').filter(l => l.trim().length > 0);
                return { main: lines[0], sub: lines[1] || "（軽蔑）" };
            }

            const rawText = data.candidates[0].content.parts[0].text.trim();
            const lines = rawText.split('\n').filter(l => l.trim().length > 0);
            return {
                main: lines[0] || "「えっちです。」",
                sub: lines[1] || "（ゴミを見るような目）"
            };

        } catch (error) {
            return { main: "「接続エラー」", sub: error.message };
        }
    }

    if (kissBtn) {
        kissBtn.addEventListener('click', async () => {
            attemptCount++;
            for (let i = 0; i < 8; i++) createHeart();
            kissBtn.disabled = true;
            kissBtn.innerText = "交信中...";
            const reaction = await fetchDynamicReaction(attemptCount);
            setTimeout(() => {
                fernMsg.innerText = reaction.main;
                fernSub.innerText = reaction.sub;
                showFernReaction(reaction.main.includes("失敗"));
                kissBtn.disabled = false;
                kissBtn.innerText = "投げキッスを試みる";
            }, 600);
        });
    }

    function createHeart() {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerHTML = '💋';
        heart.style.left = `${kissBtn.offsetLeft + kissBtn.offsetWidth / 2 + (Math.random() * 100 - 50)}px`;
        heart.style.top = `${kissBtn.offsetTop}px`;
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 1500);
    }

    function showFernReaction(isError = false) {
        fernOverlay.classList.remove('hidden');
        document.body.style.backgroundColor = isError ? 'rgba(255, 0, 0, 0.1)' : 'rgba(75, 0, 130, 0.1)';
        if (!isError) setTimeout(() => { fernOverlay.classList.add('hidden'); document.body.style.backgroundColor = ''; }, 4000);
    }

    const magicCircle = document.querySelector('.magic-circle');
    window.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth / 2 - e.pageX) / 40;
        const y = (window.innerHeight / 2 - e.pageY) / 40;
        if (magicCircle) magicCircle.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    });
});

