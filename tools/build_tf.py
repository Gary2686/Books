"""Assemble chapter JSON files into technofeudalism/data.js.
Usage: python3 tools/build_tf.py technofeudalism/chapters
"""
import json, sys, pathlib

ORDER = ["pre"] + [f"ch{i}" for i in range(1, 8)] + ["appx"]

META = {
  "pitch": "希臘前財政部長瓦魯法克斯寫給已故父親的一封長信。他的結論很驚人：資本主義不是被社會主義推翻，而是被它自己養大的東西殺死了——[[雲端資本|cloud capital]]。亞馬遜、Google、蘋果、Meta、阿里巴巴、騰訊等平台不再靠「市場」與「利潤」運作，而是像中世紀領主一樣，在自己的[[數位領地|digital fief]]上收取[[雲端租金|cloud rent]]。",
  "bigidea": "資本主義的兩根支柱——**市場**與**利潤**——正在被取代：市場被平台的演算法封地取代，利潤被雲端租金取代。雲端資本是一種前所未見的資本：它不生產商品，而是**改造我們的行為**，再讓我們免費替它打造自己。作者稱這個新體制為 [[科技封建主義|technofeudalism]]。",
  "classIntro": "在科技封建主義下，價值的流向被重新排列。從上到下：",
  "classes": [
    {"zh": "雲端資本家／雲端領主", "en": "Cloudalists", "c": "var(--p2)", "explain": "擁有雲端資本的極少數人（平台與其大股東）。他們不靠賣東西賺錢，而是向所有想接觸用戶的人收過路費。", "ex": "Amazon · Google · Apple · Meta · 阿里巴巴 · 騰訊"},
    {"zh": "附庸資本家", "en": "Vassal capitalists", "c": "var(--p1)", "explain": "傳統資本家（品牌商、賣家、開發者、媒體）。他們仍生產商品、剝削勞工，但必須把越來越大比例的利潤以雲端租金上繳給平台。", "ex": "平台賣家 · App 開發者 · 新聞媒體"},
    {"zh": "雲端無產者", "en": "Cloud proles", "c": "var(--p3)", "explain": "在雲端資本指揮下工作的有薪勞工：倉庫揀貨員、外送員、內容審查員。演算法就是他們的監工。", "ex": "倉儲工 · 外送員 · 零工"},
    {"zh": "雲端佃農", "en": "Cloud serfs", "c": "var(--p0)", "explain": "我們每一個用戶。我們滑手機、上傳、評論、點讚，無償地為雲端資本「再生產」與增值——就像封建佃農在領主土地上勞動。", "ex": "你、我、每一位用戶"}
  ],
  "flow": "價值流向：**雲端佃農**的免費勞動 → 打造並強化雲端資本 → **附庸資本家**為了接觸用戶繳交雲端租金 → 流向**雲端領主**。與此同時，各國央行在 2008 年後印出的錢（雲端金融）為這一切提供了資金。",
  "keys": [
    {"zh": "雲端資本", "en": "Cloud capital", "explain": "伺服器、光纖、演算法、AI 與資料構成的網路化機器。它是「被生產出來的行為改造工具」，能指揮人、而不只是生產物品。"},
    {"zh": "雲端租金", "en": "Cloud rent", "explain": "平台向使用其數位領地的賣家、開發者收取的費用。它不是在競爭市場中賺來的利潤，而是封建式的地租。"},
    {"zh": "雲端佃農", "en": "Cloud serfs", "explain": "所有無償為平台產生內容與資料的用戶。我們的「勞動」直接成為雲端資本的一部分。"},
    {"zh": "附庸資本家", "en": "Vassal capitalists", "explain": "仍在生產、但必須依附平台、向雲端領主進貢的傳統企業。"},
    {"zh": "技術官僚結構", "en": "Technostructure", "explain": "借自高伯瑞（J. K. Galbraith）：大企業中負責規劃、廣告與管理需求的經理人體系，是雲端資本的前身。"},
    {"zh": "全球米諾陶", "en": "Global Minotaur", "explain": "作者對 1971 年後美國以貿易赤字吸納全球資金、再由華爾街回流的全球循環機制的比喻；2008 年後它倒下了。"}
  ],
  "contrast": [
    ["核心場域", "市場：買賣雙方分散、競爭", "數位領地：平台擁有、演算法撮合"],
    ["統治階級的收入", "利潤 profit", "雲端租金 cloud rent"],
    ["資本的功能", "生產商品", "改造行為、指揮注意力"],
    ["誰為資本增值", "受薪勞工（商品勞動）", "用戶無償勞動（雲端佃農）"],
    ["傳統資本家的位置", "統治階級", "附庸：向雲端領主進貢"],
    ["經濟的引擎", "利潤驅動投資", "央行資金（雲端金融）驅動雲端資本累積"],
    ["我們的身分", "勞工與消費者", "勞工、消費者、也是雲端佃農"]
  ],
  "parts": [
    "從赫西俄德的古希臘哀歌、父親的冶金實驗室，到二戰後的布列敦森林、尼克森震撼與「全球米諾陶」：資本主義如何一路蛻變到 2008 年。",
    "雲端資本是什麼、為什麼它能改造行為；2008 年後央行的錢如何流向雲端領主，讓利潤讓位給租金；以及為什麼要把這個新體制叫做「封建」。",
    "科技封建如何重塑中美新冷戰與美元霸權；以及作者設想的出路：員工一人一股一票的公司、公共數位貨幣、雲端無產者與雲端佃農的大聯合。"
  ],
  "themes": [
    {"zh": "生成式 AI／大模型", "en": "Generative AI", "kw": ["AI", "人工智慧", "模型", "LLM", "代理", "agent"]},
    {"zh": "演算法推薦", "en": "Recommender systems", "kw": ["推薦", "演算法", "algorithm", "注意力", "attention"]},
    {"zh": "平台治理／反壟斷", "en": "Platform governance", "kw": ["平台", "platform", "壟斷", "antitrust", "反托拉斯"]},
    {"zh": "資料所有權", "en": "Data ownership", "kw": ["資料", "數據", "data", "隱私", "privacy"]},
    {"zh": "數位貨幣／CBDC", "en": "Digital money / CBDC", "kw": ["貨幣", "CBDC", "穩定幣", "stablecoin", "支付", "payment", "加密", "crypto"]},
    {"zh": "雲端算力寡占", "en": "Cloud & compute", "kw": ["雲端運算", "算力", "compute", "AWS", "伺服器", "資料中心", "GPU"]},
    {"zh": "數位勞動／零工", "en": "Digital labor", "kw": ["勞動", "勞工", "labor", "零工", "gig", "外送", "工作"]},
    {"zh": "地緣科技／晶片", "en": "Tech geopolitics", "kw": ["晶片", "chip", "中美", "冷戰", "台灣", "地緣", "制裁"]},
    {"zh": "數位公共財／合作社", "en": "Digital commons", "kw": ["公共", "commons", "合作社", "coop", "開源", "open source", "DAO"]},
    {"zh": "數位身分與主權", "en": "Identity & sovereignty", "kw": ["身分", "identity", "主權", "sovereign"]},
    {"zh": "企業治理", "en": "Corporate governance", "kw": ["公司", "股東", "治理", "governance", "一人一股"]},
    {"zh": "金融科技", "en": "FinTech", "kw": ["金融", "finance", "銀行", "bank", "央行", "central bank"]}
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
    out = pathlib.Path(__file__).resolve().parent.parent / "technofeudalism" / "data.js"
    out.write_text("window.BOOK = " + json.dumps({"meta": META, "chapters": chapters}, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    print("wrote", out, len(chapters), "chapters")

if __name__ == "__main__":
    main(sys.argv[1])
