"""Assemble chapter JSON files into prediction-machines/data.js.
Usage: python3 tools/build_pm.py prediction-machines/chapters
"""
import json, sys, pathlib

ORDER = [f"ch{i}" for i in range(1, 20)]

META = {
  "pitch": "三位多倫多大學經濟學家用最簡單的經濟學看 AI：撇開炒作，AI 的本質就是讓[[預測|prediction]]變得便宜。就像電腦讓算術變便宜、網路讓搜尋與溝通變便宜，當預測的成本大幅下降，我們會在更多地方用預測，而與預測互補的東西——數據、判斷、行動——會變得更值錢。",
  "bigidea": "把每個決策拆成**預測、判斷、行動、結果**，再加上**輸入、訓練、回饋**三種數據。AI 把其中的預測變便宜了，於是人類的[[判斷|judgment]]（知道哪個結果比較好、錯誤的代價是什麼）變得更重要。企業要做的，是用[[AI 畫布|AI canvas]]逐一拆解工作流程中的決策，找出預測變便宜後，哪些工作會改變、策略需要怎麼調整，以及要承擔哪些取捨與風險。",
  "econ": [
    {"zh": "預測的用量增加", "en": "We use more prediction", "arrow": "↑", "ch": "ch2", "explain": "當一項東西變便宜，我們會用得更多，而且會把它用在以前不會用的地方。許多原本不被看成「預測問題」的事情（例如翻譯、駕駛），都被重新定義成預測問題。"},
    {"zh": "替代品的價值下降", "en": "Substitutes lose value", "arrow": "↓", "ch": "ch2", "explain": "過去由人類做的預測，價值會因機器預測變便宜而下降。"},
    {"zh": "互補品的價值上升", "en": "Complements gain value", "arrow": "↑", "ch": "ch2", "explain": "數據、判斷與行動是預測的互補品。預測越便宜，它們越值錢，尤其是人類判斷。"}
  ],
  "flow": [
    {"id": "prediction", "zh": "預測", "en": "Prediction", "data": False, "canvas": 1, "ask": "你需要知道什麼才能做決定？", "explain": "利用已知的資訊，產生你不知道的資訊。AI 讓這一步變便宜，它位在決策的中心。"},
    {"id": "judgment", "zh": "判斷", "en": "Judgment", "data": False, "canvas": 2, "ask": "各種結果與錯誤的代價和價值為何？", "explain": "決定不同結果的相對價值與報酬，例如誤判的代價有多高。預測越便宜，判斷越有價值。"},
    {"id": "action", "zh": "行動", "en": "Action", "data": False, "canvas": 3, "ask": "你要做的是什麼？", "explain": "根據預測與判斷採取的行動。擁有行動的一方，常是能從預測中取得價值的一方。"},
    {"id": "outcome", "zh": "結果", "en": "Outcome", "data": False, "canvas": 4, "ask": "怎樣算成功？如何衡量？", "explain": "行動帶來的結果，也是衡量決策好壞的標準。"},
    {"id": "input", "zh": "輸入", "en": "Input data", "data": True, "canvas": 5, "ask": "做預測時，演算法需要哪些數據？", "explain": "輸入數據：每次做預測時餵給演算法的資料。"},
    {"id": "training", "zh": "訓練", "en": "Training data", "data": True, "canvas": 6, "ask": "需要哪些數據來訓練預測機器？", "explain": "訓練數據：用來建立、訓練預測演算法的歷史資料。"},
    {"id": "outcome_fb", "zh": "回饋", "en": "Feedback data", "data": True, "canvas": 7, "ask": "如何用結果來改善演算法？", "explain": "回饋數據：用實際結果來改善演算法，讓預測機器持續學習。"}
  ],
  "contrast": [
    ["決策的瓶頸", "預測太貴、太難", "判斷與行動"],
    ["人類的角色", "做預測，也做判斷", "專注於判斷、例外處理與行動"],
    ["數據的價值", "附帶產物", "核心資產：輸入、訓練、回饋三種數據"],
    ["工作設計", "以預測困難為前提的流程", "拆解工作流程，重新設計職務"],
    ["企業策略", "預測只是改善效率的工具", "預測夠好時，可能改變商業模式本身"],
    ["主要風險", "預測不準", "偏誤、被操縱、隱私、集中化與錯誤的回饋"]
  ],
  "themes": [
    {"zh": "生成式 AI 經濟學", "en": "Economics of GenAI", "kw": ["生成式", "LLM", "大型語言模型", "GPT"]},
    {"zh": "AI 代理與自動化", "en": "AI agents & automation", "kw": ["代理", "agent", "自動化", "automat"]},
    {"zh": "數據策略", "en": "Data strategy", "kw": ["數據", "資料", "data"]},
    {"zh": "人機分工", "en": "Human-machine division", "kw": ["分工", "人機", "判斷", "human"]},
    {"zh": "MLOps 與回饋迴路", "en": "MLOps & feedback", "kw": ["回饋", "MLOps", "迴路", "feedback", "持續學習"]},
    {"zh": "AI 風險與治理", "en": "AI risk & governance", "kw": ["風險", "治理", "risk", "governance", "偏誤"]},
    {"zh": "平台競爭", "en": "Platform competition", "kw": ["平台", "platform", "競爭", "壟斷"]},
    {"zh": "勞動與不平等", "en": "Labor & inequality", "kw": ["勞動", "工作", "不平等", "就業", "職務"]},
    {"zh": "決策支援系統", "en": "Decision support", "kw": ["決策支援", "儀表板", "decision support"]},
    {"zh": "隱私", "en": "Privacy", "kw": ["隱私", "privacy"]}
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
    out = pathlib.Path(__file__).resolve().parent.parent / "prediction-machines" / "data.js"
    out.write_text("window.BOOK = " + json.dumps({"meta": META, "chapters": chapters}, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    print("wrote", out, len(chapters), "chapters")

if __name__ == "__main__":
    main(sys.argv[1])
