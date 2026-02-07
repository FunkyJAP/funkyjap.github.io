document.addEventListener('DOMContentLoaded', () => {
    const kissBtn = document.getElementById('kiss-btn');
    const fernOverlay = document.getElementById('fern-overlay');
    const fernMsg = fernOverlay.querySelector('.fern-message');
    const fernSub = fernOverlay.querySelector('.fern-message.sub');

    const GEMINI_API_KEY = "AIzaSyD-7piW3djXwy7iXjEFRIOHfrMPTiDZLVA".trim();
    let attemptCount = 0;

    // Ver 10.0 の「力技の探索」を完全に復元
    async function tryConnectAndReact(count) {
        let debugLog = "【交信準備中...】\n";

        try {
            // 1. モデルリストを取得
            const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
            const listData = await listResp.json();
            if (!listResp.ok) throw new Error(`API接続失敗: ${listData.error?.message}`);

            const modelNames = (listData.models || []).map(m => m.name);
            const candidates = modelNames.filter(name =>
                (name.includes("flash") || name.includes("pro")) && !name.includes("2.5")
            );
            if (candidates.length === 0) candidates.push(...modelNames);

            // 3. 表現の多様性と形式を極限まで固定するプロンプト
            const prompt = `
                あなたは「葬送のフリーレン」のフェルンです。
                相手から「だいすきだよ。」と投げキッス（${count}回目）をされています。
                
                【絶対ルール】
                1. 最初の言葉に「えっち」を使うことを【禁止】します。別の言葉（不潔、軽蔑、通報、無駄遣い、理解不能など）で始めてください。
                2. 丁寧な敬語（〜です、〜ます）を厳守。
                3. ◆より後ろの（）内には、フェルンの【様子や表情のみ】を書き、セリフは【一切含めない】でください。

                【出力形式】
                セリフのすべて◆（表情や様子の描写）

                【出力例】
                何その無意味な仕草は。技術リソースをドブに捨てている自覚はありますか？◆（冷たい視線を向け、鼻で笑う）
            `;

            // 4. 当たるまで順番にリクエスト
            for (const fullName of candidates) {
                try {
                    const url = `https://generativelanguage.googleapis.com/v1beta/${fullName}:generateContent?key=${GEMINI_API_KEY}`;
                    const resp = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: {
                                temperature: 0.98,
                                maxOutputTokens: 250,
                                topP: 0.9
                            }
                        })
                    });
                    const data = await resp.json();

                    if (resp.ok) {
                        let rawText = data.candidates[0].content.parts[0].text.trim();

                        // 不要なラベリングの削除
                        rawText = rawText.replace(/^(セリフ[:：]|出力[:：]|フェルン[:：])/i, '').trim();

                        let mainText = "";
                        let subText = "（静かに軽蔑している）";

                        if (rawText.includes('◆')) {
                            const parts = rawText.split('◆');
                            mainText = parts[0].trim();
                            subText = parts[1] ? parts[1].trim() : subText;
                        } else {
                            // ◆がない場合の救済：最後の（）を探す
                            const lastParen = rawText.lastIndexOf('（');
                            if (lastParen !== -1) {
                                mainText = rawText.substring(0, lastParen).trim();
                                subText = rawText.substring(lastParen).trim();
                            } else {
                                mainText = rawText;
                            }
                        }

                        // （）内からセリフっぽいものを除去する最後のフィルター
                        subText = subText.replace(/[「」""''『』].*?[「」""''『』]/g, '').replace(/「|」/g, '');

                        return { success: true, main: mainText || "「……。」", sub: subText };
                    }
                } catch (e) { continue; }
            }

            return { success: false, main: "「魔力が……」", sub: "有効な通信路が見つかりませんでした。" };

        } catch (e) {
            return { success: false, main: "「遮断」", sub: e.message };
        }
    }

    if (kissBtn) {
        kissBtn.addEventListener('click', async () => {
            attemptCount++;
            for (let i = 0; i < 8; i++) createHeart();

            kissBtn.disabled = true;
            kissBtn.innerText = "交信中...";

            const result = await tryConnectAndReact(attemptCount);

            fernMsg.innerText = result.main;
            fernSub.innerText = result.sub;

            showFernReaction(!result.success);

            kissBtn.disabled = false;
            kissBtn.innerText = "投げキッスを試みる";
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

    fernOverlay.addEventListener('click', () => {
        fernOverlay.classList.add('hidden');
        document.body.style.backgroundColor = '';
    });

    function showFernReaction(isError = false) {
        fernOverlay.classList.remove('hidden');
        document.body.style.backgroundColor = isError ? 'rgba(255, 0, 0, 0.2)' : 'rgba(75, 0, 130, 0.1)';

        if (!isError) {
            setTimeout(() => {
                fernOverlay.classList.add('hidden');
                document.body.style.backgroundColor = '';
            }, 5000);
        }
    }

    const magicCircle = document.querySelector('.magic-circle');
    window.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth / 2 - e.pageX) / 40;
        const y = (window.innerHeight / 2 - e.pageY) / 40;
        if (magicCircle) magicCircle.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    });

    // --- Falling Leaves Logic ---
    const leavesContainer = document.getElementById('leaves-container');
    const leafCountLimit = 25; // 同時に表示する最大数

    function createLeaf() {
        if (document.querySelectorAll('.leaf').length > leafCountLimit) return;

        const leaf = document.createElement('div');
        leaf.classList.add('leaf');

        // ランダムな種類 (色/形)
        const type = Math.floor(Math.random() * 3) + 1;
        if (type > 1) leaf.classList.add(`type-${type}`);

        // ランダムな初期位置とアニメーション設定
        const startLeft = Math.random() * 100; // 0-100%
        const fallDuration = 10 + Math.random() * 15; // 10-25s
        const swayDuration = 3 + Math.random() * 4; // 3-7s
        const delay = Math.random() * 5; // 0-5s
        const sizeScale = 0.5 + Math.random() * 1.5; // 0.5-2.0x

        leaf.style.left = `${startLeft}%`;
        leaf.style.animationDuration = `${fallDuration}s, ${swayDuration}s`;
        leaf.style.animationDelay = `${delay}s`;
        leaf.style.transform = `scale(${sizeScale})`;

        leavesContainer.appendChild(leaf);

        // アニメーション終了後に削除
        setTimeout(() => {
            leaf.remove();
        }, (fallDuration + delay) * 1000);
    }

    // 定期的に葉っぱを生成
    setInterval(createLeaf, 800);
    // 初回にいくつか生成
    for (let i = 0; i < 10; i++) setTimeout(createLeaf, i * 300);
});

