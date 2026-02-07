document.addEventListener('DOMContentLoaded', () => {
    const kissBtn = document.getElementById('kiss-btn');
    const fernOverlay = document.getElementById('fern-overlay');
    const fernMsg = fernOverlay.querySelector('.fern-message');
    const fernSub = fernOverlay.querySelector('.fern-message.sub');

    // --- 設定 ---
    const GEMINI_API_KEY = "AIzaSyD-7piW3djXwy7iXjEFRIOHfrMPTiDZLVA";

    let attemptCount = 0;

    async function fetchDynamicReaction(count) {
        const randomSeed = Math.random().toString(36).substring(7);
        // 回答がJSON形式になりやすいように明示
        const prompt = `あなたは葬送のフリーレンのフェルンです。不躾に投げキッスをしてきた相手に対して、冷たく突き放す短い一言を授けてください。SEED:${randomSeed}
        回答は必ず以下の形式にしてください：
        セリフ
        （状況描写）`;

        try {
            // URL：最も標準的なv1betaを使用
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 1.0,
                        maxOutputTokens: 100
                    },
                    safetySettings: [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" }
                    ]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    main: "「通信失敗」",
                    sub: `HTTP ${response.status}: ${data.error ? data.error.message : 'Error'}`
                };
            }

            if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
                return { main: "「……不潔です。」", sub: "（AIが回答を拒否しました）" };
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
            console.log("Kiss button clicked");
            attemptCount++;

            // ハート演出
            for (let i = 0; i < 8; i++) createHeart();

            kissBtn.disabled = true;
            kissBtn.innerText = "反応待機中...";

            try {
                const reaction = await fetchDynamicReaction(attemptCount);
                console.log("Reaction received:", reaction);

                fernMsg.innerText = reaction.main;
                fernSub.innerText = reaction.sub;
                showFernReaction(reaction.main.includes("失敗") || reaction.main.includes("エラー"));
            } catch (e) {
                console.error("Interaction error:", e);
            } finally {
                kissBtn.disabled = false;
                kissBtn.innerText = "投げキッスを試みる";
            }
        });
    }

    function createHeart() {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerHTML = '💋';
        heart.style.left = `${kissBtn.offsetLeft + kissBtn.offsetWidth / 2 + (Math.random() * 100 - 50)}px`;
        heart.style.top = `${kissBtn.offsetTop}px`;
        heart.style.position = 'absolute';
        heart.style.zIndex = '1000';
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 1500);
    }

    function showFernReaction(isError = false) {
        fernOverlay.classList.remove('hidden');
        document.body.style.backgroundColor = isError ? 'rgba(255, 0, 0, 0.1)' : 'rgba(75, 0, 130, 0.1)';

        // エラーでない場合のみ自動で閉じる
        if (!isError) {
            setTimeout(() => {
                fernOverlay.classList.add('hidden');
                document.body.style.backgroundColor = '';
            }, 4000);
        }
    }

    // 魔法陣のパララックス（既存）
    const magicCircle = document.querySelector('.magic-circle');
    window.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth / 2 - e.pageX) / 40;
        const y = (window.innerHeight / 2 - e.pageY) / 40;
        if (magicCircle) magicCircle.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    });
});