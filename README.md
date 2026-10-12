# Books · 互動精讀

一本書一個網頁，依章節分層，附中英對照、視覺化、記憶卡、測驗與未來資管議題激盪。

| 書 | 網頁 |
|---|---|
| Quinn Slobodian《黑暗資本》*Crack-Up Capitalism* (2023) | [`crack-up-capitalism/`](crack-up-capitalism/) |
| Yanis Varoufakis《雲端封建時代》*Technofeudalism* (2023) | [`technofeudalism/`](technofeudalism/) |
| Yuval Noah Harari《連結》*Nexus* (2024) | [`nexus/`](nexus/) |
| Mark Coeckelbergh《AI世代》*The Political Philosophy of AI* (2022) | [`political-philosophy-of-ai/`](political-philosophy-of-ai/) |
| 照屋華子《麥肯錫邏輯說服術》*ロジカル・シンキング練習帳* (2018) | [`mckinsey-logical-writing/`](mckinsey-logical-writing/) |
| Fredmund Malik《公司策略與公司治理》*Corporate Policy and Governance* (2008) | [`malik-corporate-policy/`](malik-corporate-policy/) |
| Kahneman, Sibony & Sunstein《雜訊》*Noise: A Flaw in Human Judgment* (2021) | [`noise/`](noise/) |

## 瀏覽方式
- **GitHub Pages**（推薦，不佔本地空間）：Repo → Settings → Pages → Source 選 `Deploy from a branch`，分支選這個分支、資料夾 `/ (root)`，即可在 `https://<帳號>.github.io/Books/` 線上閱讀。
- 或下載後直接用瀏覽器開啟 `crack-up-capitalism/index.html`（地圖與字型需要網路）。

## 結構
- `<書名>/chapters/*.json`：每章的結構化內容（敘事、時間軸、人物、概念、金句、機制、論證、資管前沿、記憶卡、測驗）
- `<書名>/data.js`：由 `tools/build_*.py` 組合產生
- 筆記、收藏、記憶卡進度存在瀏覽器 localStorage，可在「我的筆記」頁匯出 Markdown／備份 JSON。
