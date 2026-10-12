"""Assemble chapter JSON files into political-philosophy-of-ai/data.js.
Usage: python3 tools/build_ai.py political-philosophy-of-ai/chapters
"""
import json, sys, pathlib

ORDER = ["intro", "ch2", "ch3", "ch4", "ch5", "ch6", "ch7"]

META = {
  "pitch": "比利時哲學家科克爾柏格把政治哲學的經典工具——自由、平等與正義、民主、權力——一一拿來檢視人工智慧。他從卡夫卡《審判》的約瑟夫．K 說起：在二十一世紀，一個人可能因為演算法的錯誤配對而被捕，卻沒人能說清楚為什麼。",
  "bigidea": "人工智慧**不是政治上中立**的工具。它在監控、預測、分類、推薦與決策的過程中，悄悄改變了誰享有自由、誰被平等對待、民主如何運作、權力落在誰手上。因此 AI 的問題不只是技術或倫理問題，而是**政治**問題：需要公民共同討論、共同決定。",
  "values": [
    {"zh": "自由", "short": "自由", "en": "Freedom", "ch": "ch2",
     "q": "AI 會讓我們更不自由嗎？",
     "threat": "監控與預測式執法可能剝奪[[消極自由|negative liberty]]；演算法與[[助推|nudge]]可能繞過我們的自主性來操縱行為；平台與機器人勞動牽涉剝削與「機器人奴隸」的問題；AI 也影響選舉與言論自由。",
     "who": "柏林（消極／積極自由）、彌爾、塞勒與桑斯坦（助推）、盧梭、馬克思"},
    {"zh": "平等與正義", "short": "平等", "en": "Equality & Justice", "ch": "ch3",
     "q": "演算法偏見為什麼是錯的？",
     "threat": "訓練資料與模型設計中的[[偏見|bias]]會造成歧視，例如司法風險評估工具 COMPAS 的爭議。AI 可能複製甚至放大既有的不平等。",
     "who": "羅爾斯、諾齊克（自由主義的正義理論）；馬克思（階級）；艾莉斯．楊等認同政治理論家"},
    {"zh": "民主", "short": "民主", "en": "Democracy", "ch": "ch4",
     "q": "AI 會威脅民主嗎？",
     "threat": "[[同溫層|echo chambers]]與訊息泡泡、民粹主義、選民操控（如劍橋分析）、以專家與演算法取代公民判斷，甚至走向**機器極權主義**。",
     "who": "柏拉圖、盧梭、哈伯瑪斯（審議民主）、慕芙與洪席耶（爭勝／基進民主）、鄂蘭（極權主義與平庸之惡）"},
    {"zh": "權力", "short": "權力", "en": "Power", "ch": "ch5",
     "q": "AI 如何行使與重新分配權力？",
     "threat": "經由數據的**監控**與**（自我）規訓**：我們不只被平台觀察，也在演算法的回饋中自己塑造自己。AI 可能成為科技資本主義的工具。",
     "who": "馬克思、傅柯（規訓、知識／權力、主體化）、祖博夫（監控資本主義）"},
    {"zh": "非人類", "short": "非人類", "en": "Non-humans", "ch": "ch6",
     "q": "政治只關乎人類嗎？",
     "threat": "AI 與機器人對動物和自然環境造成影響（如能源消耗與氣候）；動物與自然的政治地位，以及 AI 本身是否可能擁有政治地位。",
     "who": "動物權與環境政治理論、後人類主義"}
  ],
  "contrast": [
    ["AI 的本質", "中立的工具，好壞看人怎麼用", "帶有政治意涵的技術，會重塑價值與權力"],
    ["演算法偏見", "技術瑕疵，修正資料就好", "牽涉平等與正義的政治問題"],
    ["推薦系統", "貼心的個人化服務", "可能製造同溫層，削弱民主審議"],
    ["監控", "換取安全與效率的代價", "剝奪消極自由，形成規訓權力"],
    ["誰來決定 AI", "工程師、企業與專家", "公民透過民主參與共同決定"],
    ["政治的範圍", "只關乎人類", "也要考慮動物、環境，甚至技術本身"]
  ],
  "thinkers": [
    {"zh": "以撒．柏林", "en": "Isaiah Berlin", "ch": "ch2", "explain": "區分**消極自由**（不受干涉）與**積極自由**（自我實現、自我主宰），是分析 AI 監控與操縱的起點。"},
    {"zh": "約翰．彌爾", "en": "John Stuart Mill", "ch": "ch2", "explain": "傷害原則與言論自由的經典辯護，用來檢視 AI 內容審查與平台治理。"},
    {"zh": "塞勒與桑斯坦", "en": "Richard Thaler & Cass Sunstein", "ch": "ch2", "explain": "提出**助推**（nudge）與自由家長主義。AI 讓助推變得個人化、隱形而強大。"},
    {"zh": "約翰．羅爾斯", "en": "John Rawls", "ch": "ch3", "explain": "正義即公平、無知之幕與差異原則，提供判斷演算法分配是否公正的標準。"},
    {"zh": "艾莉斯．楊", "en": "Iris Marion Young", "ch": "ch3", "explain": "從認同與群體壓迫的角度批判普世的自由主義正義觀，幫助理解偏見對特定群體的傷害。"},
    {"zh": "柏拉圖", "en": "Plato", "ch": "ch4", "explain": "質疑由無知大眾統治的民主，主張由有知識者治理。今天的「讓專家與 AI 決策」是同一問題的新版本。"},
    {"zh": "哈伯瑪斯", "en": "Jürgen Habermas", "ch": "ch4", "explain": "審議民主與公共領域：民主需要理性溝通。AI 推薦與假訊息可能破壞這個條件。"},
    {"zh": "香塔爾．慕芙", "en": "Chantal Mouffe", "ch": "ch4", "explain": "爭勝民主：民主不是消除衝突，而是讓對手（而非敵人）能正當地爭論。"},
    {"zh": "漢娜．鄂蘭", "en": "Hannah Arendt", "ch": "ch4", "explain": "極權主義的起源與**平庸之惡**：當人只是照系統指令做事而不思考，AI 可能成為新的極權工具。"},
    {"zh": "馬克思", "en": "Karl Marx", "ch": "ch5", "explain": "從生產關係與剝削看 AI：AI 可能是科技資本主義的工具。"},
    {"zh": "米歇爾．傅柯", "en": "Michel Foucault", "ch": "ch5", "explain": "規訓、監控與知識／權力：AI 不只壓迫我們，也塑造我們成為某種主體。"}
  ],
  "parts": [
    "AI 如何威脅自由（監控、操縱、剝削、政治參與），以及演算法偏見為什麼違反平等與正義：從自由主義到階級與認同理論。",
    "AI 對民主的衝擊：從柏拉圖的專家統治、審議與爭勝民主、同溫層與民粹，到鄂蘭的極權主義分析；以及馬克思與傅柯視角下的數據權力。",
    "把政治的範圍擴大到非人類：動物、自然環境，以及 AI 本身的政治地位。"
  ],
  "pending": {"ch5": "第5章 權力：經由數據的監控與（自我）規訓", "ch6": "第6章 關於非人類的問題？環境政治與後人類主義", "ch7": "第7章 結論：政治技術"},
  "notice": "",
  "themes": [
    {"zh": "AI 法規與治理", "en": "AI governance", "kw": ["法規", "法案", "AI Act", "治理", "governance", "監管", "regulat"]},
    {"zh": "演算法公平性", "en": "Algorithmic fairness", "kw": ["公平", "fair", "偏見", "bias", "歧視"]},
    {"zh": "可解釋與問責", "en": "Explainability", "kw": ["可解釋", "explain", "透明", "問責", "課責", "accountab"]},
    {"zh": "推薦與同溫層", "en": "Recommenders", "kw": ["推薦", "同溫層", "泡泡", "recommend", "echo"]},
    {"zh": "深偽與選舉", "en": "Deepfakes & elections", "kw": ["深偽", "deepfake", "選舉", "election", "假訊息"]},
    {"zh": "監控與隱私", "en": "Surveillance", "kw": ["監控", "surveillance", "隱私", "privacy", "臉部辨識"]},
    {"zh": "助推與操縱", "en": "Nudging & manipulation", "kw": ["助推", "nudge", "操縱", "操控", "manipulat"]},
    {"zh": "平台與零工勞動", "en": "Platform labor", "kw": ["勞動", "零工", "labor", "gig", "剝削"]},
    {"zh": "AI 代理與責任", "en": "AI agents & liability", "kw": ["代理", "agent", "責任", "liabil"]},
    {"zh": "公民參與設計", "en": "Participatory design", "kw": ["參與", "particip", "公民", "審議"]},
    {"zh": "算力與環境", "en": "Compute & environment", "kw": ["能源", "能耗", "環境", "碳", "energy", "climate"]},
    {"zh": "資料主權", "en": "Data sovereignty", "kw": ["資料", "數據", "data", "主權"]}
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
    missing = [c for c in ORDER if c not in {x["id"] for x in chapters}]
    if missing:
        META["notice"] = "目前從 Google Drive 只能讀到原書約七成（到第5章前半）。" + "、".join(META["pending"].get(c, c) for c in missing) + " 尚待補上全文，補齊後會加入。"
    out = pathlib.Path(__file__).resolve().parent.parent / "political-philosophy-of-ai" / "data.js"
    out.write_text("window.BOOK = " + json.dumps({"meta": META, "chapters": chapters}, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    print("wrote", out, len(chapters), "chapters", "missing:", missing)

if __name__ == "__main__":
    main(sys.argv[1])
