"""Assemble chapter JSON files into crack-up-capitalism/data.js.
Usage: python3 tools/build_cuc.py crack-up-capitalism/chapters
"""
import json, sys, pathlib

ORDER = ["intro"] + [f"ch{i}" for i in range(1, 12)] + ["outro"]

META = {
  "pitch": "一本關於「國家正在被切成碎片」的書。史洛伯迪安追蹤半世紀以來，[[市場激進派|market radicals]]如何夢想並實際打造出成千上萬的[[特區|zones]]——自由港、避稅天堂、科技園區、特許城市、私人城市，乃至區塊鏈上的「雲端國家」——讓資本得以[[退出|exit]]民主的管轄。",
  "bigidea": "資本主義的未來不是一個更大、更統一的全球市場，而是一張被**打洞、打碎**的地圖：在國家的領土上鑿出無數「例外空間」，讓有錢人與企業在裡頭享受低稅、少監管、沒有選票干擾的秩序。作者稱之為 [[裂解資本主義|crack-up capitalism]]——它的終極夢想，是一個**沒有民主的世界**（a world without democracy）。",
  "keys": [
    {"zh": "特區", "en": "Zone", "explain": "在國家內部劃出的法律例外區：稅、勞動、關稅、甚至司法規則都不同。全球約有**五千四百**多個，是本書的基本單位。"},
    {"zh": "裂解／打孔", "en": "Crack-up / Perforation", "explain": "國家主權像一張被打了許多孔的紙：不是被消滅，而是被**穿孔**。資本從孔洞中流進流出。"},
    {"zh": "退出", "en": "Exit (vs. Voice)", "explain": "借自赫緒曼（Albert O. Hirschman）。不滿時，與其「發聲」參與民主，不如「退出」到另一個管轄區——像消費者換品牌一樣換國家。"},
    {"zh": "市場激進派", "en": "Market radicals", "explain": "傅利曼、海耶克學派、羅斯巴德、無政府資本主義者、提爾、新反動派等。他們想把市場邏輯推到政治本身。"},
    {"zh": "系出同門／部族", "en": "Phyle", "explain": "源自科幻小說的詞：不靠土地、而靠認同、契約或訂閱結合的「部族」。預示了網路國家、加密社群的想像。"}
  ],
  "spectrum": [
    {"zh": "避稅天堂", "en": "Tax haven", "ex": "開曼、列支敦斯登", "p": "p2"},
    {"zh": "自由港／出口加工區", "en": "Free port / EPZ", "ex": "香港、深圳、高雄加工出口區（1966）", "p": "p1"},
    {"zh": "金融城中城", "en": "City within a city", "ex": "倫敦金絲雀碼頭", "p": "p1"},
    {"zh": "城市國家", "en": "City-state", "ex": "新加坡", "p": "p1"},
    {"zh": "種族化的家園", "en": "Homeland / Bantustan", "ex": "南非西斯凱", "p": "p2"},
    {"zh": "法律泡泡", "en": "Legal bubble", "ex": "杜拜國際金融中心", "p": "p3"},
    {"zh": "特許／私人城市", "en": "Charter / private city", "ex": "宏都拉斯 Próspera", "p": "p3"},
    {"zh": "雲端國家", "en": "Network / cloud state", "ex": "加密社群、元宇宙", "p": "p3"}
  ],
  "parts": [
    "以**香港、倫敦、新加坡**為原型：一座座被市場派神話化的「島嶼」，示範如何在國家之內建出低稅、低民主、高效率的飛地。",
    "從**南非家園、國家分裂、新中世紀主義到列支敦斯登**：市場派如何擁抱分離主義、種族與文化認同，夢想以「部族」與私人王國取代民族國家。",
    "從**索馬利亞、杜拜、宏都拉斯到元宇宙**：特區被包裝成可輸出、可加盟的「國家套裝」，最後連領土都拋棄，飛上雲端。"
  ],
  "themes": [
    {"zh": "AI 治理", "en": "AI governance", "kw": ["AI", "人工智慧", "演算法", "algorithm"]},
    {"zh": "區塊鏈／DAO", "en": "Blockchain / DAO", "kw": ["區塊鏈", "blockchain", "DAO", "智慧合約", "smart contract", "加密", "crypto"]},
    {"zh": "數位主權", "en": "Digital sovereignty", "kw": ["主權", "sovereign"]},
    {"zh": "資料治理／隱私", "en": "Data governance", "kw": ["資料", "data", "隱私", "privacy"]},
    {"zh": "平台治理", "en": "Platform governance", "kw": ["平台", "platform"]},
    {"zh": "網路國家／雲端社群", "en": "Network state", "kw": ["網路國家", "network state", "雲端", "cloud", "元宇宙", "metaverse"]},
    {"zh": "數位身分／公民權", "en": "Digital identity", "kw": ["身分", "identity", "公民", "citizenship", "居留", "residency"]},
    {"zh": "監管沙盒／特區", "en": "Regulatory sandbox", "kw": ["沙盒", "sandbox", "監理", "監管", "regulat"]},
    {"zh": "金融科技／數位貨幣", "en": "FinTech / CBDC", "kw": ["貨幣", "currency", "CBDC", "金融", "fintech", "稅", "tax"]},
    {"zh": "智慧城市／監控", "en": "Smart city / surveillance", "kw": ["智慧城市", "smart city", "監控", "surveillance", "感測"]},
    {"zh": "自動化與勞動", "en": "Automation & labor", "kw": ["勞動", "勞工", "labor", "自動化", "automation", "工作"]},
    {"zh": "雲端／基礎設施", "en": "Cloud & infrastructure", "kw": ["基礎設施", "infrastructure", "資料中心", "data center", "海底電纜"]}
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
    out = pathlib.Path(__file__).resolve().parent.parent / "crack-up-capitalism" / "data.js"
    out.write_text("window.BOOK = " + json.dumps({"meta": META, "chapters": chapters}, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    print("wrote", out, len(chapters), "chapters")

if __name__ == "__main__":
    main(sys.argv[1])
