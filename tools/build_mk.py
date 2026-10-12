"""Assemble chapter JSON files into mckinsey-logical-writing/data.js.
Usage: python3 tools/build_mk.py mckinsey-logical-writing/chapters
"""
import json, sys, pathlib

ORDER = ["pre", "ch1", "ch2", "ch3", "ch4", "ch5", "outro"]

META = {
  "pitch": "曾任職麥肯錫的溝通專家照屋華子，用你每天都在寫的**商務電子郵件**當練習場，把邏輯思考拆成可以一步步練習的「基本形式」：先想清楚主題與期待的回應，再用「引言→正文→總結」組織，用 [[MECE|Mutually Exclusive, Collectively Exhaustive]] 與 [[So What?／Why So?|So What? / Why So?]] 架構內容，最後用視覺化與精準用字讓人一看就懂。",
  "bigidea": "一封「看得懂」的郵件，不是靠文筆，而是靠**結構**：收訊者不必讀完整封信，跳著看也能抓到重點、知道你要他做什麼。只要寫信前確認「主題」與「期待的回應」，正文用「結論＋支持結論的理由」排好，再用五大檢核把關，任何報告、提案與口頭說明都適用。",
  "steps": [
    {"zh": "掌握全局", "en": "See the whole", "ch": "ch1", "what": "記住「引言→正文→總結」的基本順序，以及「基本形式」要滿足的五大檢核。", "bad": "想到哪寫到哪，收訊者必須讀完整封信才知道你要說什麼。", "tool": "五大檢核、邏輯說服的傳達公式"},
    {"zh": "重點確認", "en": "Fix the theme & response", "ch": "ch2", "what": "寫信前先確認兩件事：這封信的**主題**是什麼？你期待對方做出什麼**回應**？", "bad": "主題模糊、沒說清楚希望對方做什麼，雙方都浪費時間。", "tool": "把主題改寫成「提問」、明確寫出期待的回應"},
    {"zh": "架構組織", "en": "Structure", "ch": "ch3", "what": "正文就是對「提問」的答案：先寫結論（So What?），再寫支持結論的理由（Why So?），理由用 MECE 分類。", "bad": "結論和理由對不上、分類重複或遺漏、過度省略讓語意支離破碎。", "tool": "So What?／Why So?、MECE、結構方格"},
    {"zh": "視覺化", "en": "Make it visible", "ch": "ch4", "what": "讓結構「看得見」：結論先行、用空格與符號表現層級、加上標題、段首放切入點。", "bad": "長篇大段的文字，對方跳著讀就會誤解。", "tool": "標題、縮排與符號、段首切入點"},
    {"zh": "用字精準", "en": "Choose words", "ch": "ch5", "what": "用「具．簡．邏．好」四字訣檢查每一句話：具體性、簡潔度、邏輯性、好感度。", "bad": "用語抽象、冗長、前後接不起來，或語氣讓人不舒服。", "tool": "具體性、簡潔度、邏輯性、好感度"}
  ],
  "checks": [
    {"q": "對方明白「**主題**」嗎？", "tip": "一開頭就讓收訊者知道這封信在談什麼。"},
    {"q": "你期待什麼「**回應**」？", "tip": "明確寫出希望對方做什麼、何時之前。"},
    {"q": "內容已清楚「**分類**」？", "tip": "正文依 MECE 分成幾個不重複、不遺漏的類別。"},
    {"q": "類別「**重點**」夠明顯嗎？", "tip": "每一類先寫 So What?（結論），再寫 Why So?（理由）。"},
    {"q": "「**具．簡．邏．好**」是否具備？", "tip": "具體、簡潔、有邏輯，而且讓人有好感。"}
  ],
  "contrast": [
    ["讀信方式", "必須讀完整封信才知道內容", "跳著看也能抓到重點"],
    ["主題", "埋在信件中間，甚至沒寫", "引言一開始就說清楚"],
    ["期待的回應", "沒說，或含糊帶過", "明確寫出要對方做什麼"],
    ["正文組織", "依想到的順序寫", "結論先行，理由用 MECE 分類"],
    ["版面", "一大段文字", "標題、空格與符號表現層級"],
    ["用字", "抽象、冗長、語氣生硬", "具體、簡潔、有邏輯、有好感"]
  ],
  "keys": [
    {"zh": "引言→正文→總結", "en": "Introduction → Body → Conclusion", "ch": "ch1", "explain": "所有「看得懂」的訊息共同的大前提順序，郵件、報告、口頭說明都適用。"},
    {"zh": "主題與期待的回應", "en": "Theme & expected response", "ch": "ch2", "explain": "寫信前必須先確認的兩件事；把主題改寫成「提問」，正文就是它的答案。"},
    {"zh": "So What?／Why So?", "en": "So What? / Why So?", "ch": "ch3", "explain": "把答案分成「結論」與「支持結論的要素」。往上問 So What?（所以呢？）得到結論，往下問 Why So?（為什麼？）得到理由。"},
    {"zh": "MECE", "en": "Mutually Exclusive, Collectively Exhaustive", "ch": "ch3", "explain": "彼此獨立、互無遺漏的分類原則。訣竅在於選對「切入點」。"},
    {"zh": "結構方格", "en": "Structure grid", "ch": "ch3", "explain": "本書把邏輯說明畫成圖：頂端是應回答的提問，其下是結論（So What?），再下是支持結論的理由，形式越簡單越好。"},
    {"zh": "具．簡．邏．好", "en": "Concrete · Concise · Logical · Likeable", "ch": "ch5", "explain": "用字的四字訣：具體性、簡潔度、邏輯性、好感度。"}
  ],
  "themes": [
    {"zh": "AI 寫作助理", "en": "AI writing assistants", "kw": ["AI", "LLM", "生成", "寫作助理", "Copilot"]},
    {"zh": "提示工程", "en": "Prompt engineering", "kw": ["提示", "prompt"]},
    {"zh": "AI 代理溝通", "en": "Agent messaging", "kw": ["代理", "agent", "協定", "protocol"]},
    {"zh": "知識管理", "en": "Knowledge management", "kw": ["知識", "knowledge", "文件", "wiki"]},
    {"zh": "需求規格", "en": "Requirements", "kw": ["需求", "規格", "requirement", "spec"]},
    {"zh": "資料敘事／儀表板", "en": "Data storytelling", "kw": ["儀表板", "dashboard", "資料敘事", "視覺化", "visual"]},
    {"zh": "非同步協作", "en": "Async collaboration", "kw": ["非同步", "async", "遠距", "協作", "Slack", "Teams"]},
    {"zh": "資訊架構", "en": "Information architecture", "kw": ["資訊架構", "架構", "結構化", "structur"]},
    {"zh": "決策支援", "en": "Decision support", "kw": ["決策", "decision"]},
    {"zh": "跨文化溝通", "en": "Cross-cultural comms", "kw": ["跨文化", "多語", "翻譯", "translat"]}
  ]
}

def main(src):
    src = pathlib.Path(src)
    chapters = []
    for cid in ORDER:
        p = src / f"{cid}.json"
        if not p.exists():
            print("missing", cid); continue
        d = json.loads(p.read_text(encoding="utf-8"))
        if isinstance(d, list): d = d[0]
        d["id"] = cid
        chapters.append(d)
    out = pathlib.Path(__file__).resolve().parent.parent / "mckinsey-logical-writing" / "data.js"
    out.write_text("window.BOOK = " + json.dumps({"meta": META, "chapters": chapters}, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    print("wrote", out, len(chapters), "chapters")

if __name__ == "__main__":
    main(sys.argv[1])
