"""Assemble chapter JSON files into ai-survival-logic/data.js.
Usage: python3 tools/build_cs.py ai-survival-logic/chapters
"""
import json, sys, pathlib

ORDER = ["pre"] + [f"ch{i}" for i in range(1, 27)]

META = {
  "pitch": "iKala 共同創辦人暨執行長、前 Google 工程師程世嘉，用他在 AI 產業第一線的經驗回答大家最焦慮的問題：AI 會不會取代我？他的答案是：**會取代你的，是會使用 AI 的人**。全書從職場、學習、商業到技術趨勢，說明在 AI 成為標配的世界裡，什麼會變、什麼不會變，以及個人與企業該如何借力使力。",
  "bigidea": "AI 會成為像水電一樣的基礎設施，真正的差距在於**人怎麼用它**。個人要善用生成式 AI 提升產能，同時鍛鍊 AI 無法取代的能力：問對問題、批判性思考、邏輯表達、同理心與成長心態；企業不必急著「轉型成 AI 公司」，而是先建立好的數據策略，順勢加值，不重新發明輪子，並把資安與 AI 可信度放在第一位。",
  "journey": [
    {"zh": "職場與工作", "en": "When AI becomes standard, your uniqueness matters more", "msg": "當 AI 成為標配，你的獨特性更重要：會取代你的是會使用 AI 的人；善用生成式 AI 讓產能超車；不變的東西更有價值；職場是共學場域；未來的同事可能是機器人；鍛鍊同理心。"},
    {"zh": "學習與思考", "en": "Living with AI, you can't outsource your brain", "msg": "與 AI 共處，你的腦袋不能外包：成為心態開放的雜學者、重視人文、邏輯表達與語文能力、從解決問題中學習、問對問題、批判性思考、成長心態，以及找到良師。"},
    {"zh": "商業與經營", "en": "Know AI's strengths and weaknesses, leverage it", "msg": "了解 AI 的強項與短板，借力使力：如何搭上 AI 列車、順勢加值而不大變身、理解比生成更重要、在科技巨頭肩上找機會、先有數據策略、建立讓使用者信任的 AI 大腦、向世界學習經營心法。"},
    {"zh": "當前與未來", "en": "AI technology in progress", "msg": "看懂 AI 技術現在進行式：AI 助理、機器人與 AI 醫療、「少即是多」的設計趨勢、認清科技巨頭的算盤、不為面子重新發明輪子、資安與 AI 可信度是重中之重。"}
  ],
  "skills": [
    {"zh": "善用生成式 AI", "short": "用 AI", "ch": "ch2"},
    {"zh": "同理心", "short": "同理心", "ch": "ch6"},
    {"zh": "跨域雜學", "short": "雜學", "ch": "ch7"},
    {"zh": "人文素養", "short": "人文", "ch": "ch8"},
    {"zh": "邏輯、表達與語文", "short": "表達", "ch": "ch9"},
    {"zh": "解決問題", "short": "解題", "ch": "ch10"},
    {"zh": "問對問題", "short": "提問", "ch": "ch11"},
    {"zh": "批判性思考", "short": "批判", "ch": "ch12"},
    {"zh": "成長心態", "short": "成長", "ch": "ch13"},
    {"zh": "深入對話與找良師", "short": "對話", "ch": "ch14"}
  ],
  "biz": [
    {"zh": "不急著大變身，先找能順勢加值的地方", "tip": "在既有產品與流程上加入 AI。", "ch": "ch16"},
    {"zh": "重視 AI 的「理解」能力，而不只是「生成」", "tip": "讓 AI 理解你的資料與使用者。", "ch": "ch17"},
    {"zh": "站在科技巨頭的肩膀上，找到自己不可取代的位置", "tip": "善用大廠的模型與平台。", "ch": "ch18"},
    {"zh": "發展 AI 策略前，先有好的數據策略", "tip": "資料管線沒拉好，就沒有後面的 AI 應用。", "ch": "ch19"},
    {"zh": "建立讓使用者信任的「AI 大腦」", "tip": "從失敗的 AI 公關危機中學習。", "ch": "ch20"},
    {"zh": "不為了面子重新發明輪子", "tip": "評估是否真的需要自建模型。", "ch": "ch25"},
    {"zh": "把資安與 AI 可信度放在第一位", "tip": "導入 AI 的同時建立防護。", "ch": "ch26"}
  ],
  "contrast": [
    ["面對 AI 的心態", "焦慮會不會被取代", "思考如何讓 AI 幫自己做得更好"],
    ["工作方式", "照舊做事", "把生成式 AI 當成標配工具，產能超車"],
    ["學習", "以為離開學校就學完了", "成長心態、從解決問題中持續學習"],
    ["與 AI 互動", "照單全收 AI 的答案", "問對問題，並用批判性思考檢驗結果"],
    ["企業導入", "急著轉型成 AI 公司、什麼都自己做", "先有數據策略，順勢加值，借力科技巨頭"],
    ["競爭優勢", "技術本身", "不變的能力：同理心、人文、溝通與信任"]
  ],
  "themes": [
    {"zh": "生成式 AI 與工作", "en": "GenAI at work", "kw": ["生成式", "ChatGPT", "Copilot", "Gemini", "產能"]},
    {"zh": "AI 代理與助理", "en": "AI agents", "kw": ["代理", "助理", "agent"]},
    {"zh": "提示工程與提問", "en": "Prompting", "kw": ["提示", "prompt", "提問", "問對問題"]},
    {"zh": "數據策略", "en": "Data strategy", "kw": ["數據", "資料", "data"]},
    {"zh": "RAG 與企業知識", "en": "RAG & knowledge", "kw": ["RAG", "知識", "檢索"]},
    {"zh": "AI 信任與資安", "en": "Trust & security", "kw": ["資安", "信任", "可信", "security"]},
    {"zh": "開源與主權 AI", "en": "Open & sovereign AI", "kw": ["開源", "主權", "TAIDE", "Llama"]},
    {"zh": "AI 與教育", "en": "AI in education", "kw": ["教育", "學習", "學生", "課程"]},
    {"zh": "人機協作", "en": "Human-AI collaboration", "kw": ["協作", "人機", "同事", "機器人"]},
    {"zh": "職涯發展", "en": "Careers", "kw": ["職涯", "職場", "工作者", "人才"]},
    {"zh": "平台與科技巨頭", "en": "Big Tech platforms", "kw": ["巨頭", "平台", "Google", "Microsoft", "OpenAI"]},
    {"zh": "AI 醫療", "en": "Medical AI", "kw": ["醫療", "健康", "醫師"]}
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
    out = pathlib.Path(__file__).resolve().parent.parent / "ai-survival-logic" / "data.js"
    out.write_text("window.BOOK = " + json.dumps({"meta": META, "chapters": chapters}, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    print("wrote", out, len(chapters), "chapters")

if __name__ == "__main__":
    main(sys.argv[1])
