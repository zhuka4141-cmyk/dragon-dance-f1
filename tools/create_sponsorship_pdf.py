from pathlib import Path

from reportlab.lib.colors import Color, HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
OUTPUT = ASSETS / "design-studio-creative-brief.pdf"
WIDTH, HEIGHT = 1440, 810
INK = HexColor("#090909")
PAPER = HexColor("#F3F2ED")
RED = HexColor("#E01823")
MUTED = HexColor("#989894")
LIGHT_LINE = Color(1, 1, 1, alpha=0.18)
DARK_LINE = Color(0, 0, 0, alpha=0.18)

pdfmetrics.registerFont(UnicodeCIDFont("MSung-Light"))
CJK = "MSung-Light"
LATIN = "Helvetica"
LATIN_BOLD = "Helvetica-Bold"


def text_width(text, font, size):
    return pdfmetrics.stringWidth(text, font, size)


def fit_text(text, font, size, width):
    lines, current = [], ""
    for character in text:
        candidate = current + character
        if current and text_width(candidate, font, size) > width:
            lines.append(current.rstrip())
            current = character.lstrip()
        else:
            current = candidate
    if current:
        lines.append(current.rstrip())
    return lines


def draw_lines(c, text, x, y, width, size=20, leading=31, color=INK, font=CJK):
    c.setFont(font, size)
    c.setFillColor(color)
    for line in fit_text(text, font, size, width):
        c.drawString(x, y, line)
        y -= leading
    return y


def draw_cover_image(c, image_path, x, y, width, height):
    from PIL import Image

    with Image.open(image_path) as image:
        image_width, image_height = image.size
    scale = max(width / image_width, height / image_height)
    draw_width = image_width * scale
    draw_height = image_height * scale
    c.saveState()
    clip = c.beginPath()
    clip.rect(x, y, width, height)
    c.clipPath(clip, stroke=0, fill=0)
    c.drawImage(
        str(image_path),
        x + (width - draw_width) / 2,
        y + (height - draw_height) / 2,
        draw_width,
        draw_height,
        mask="auto",
    )
    c.restoreState()


def wordmark(c, x, y, dark=False):
    c.setFont(LATIN_BOLD, 17)
    c.setFillColor(PAPER if dark else INK)
    c.drawString(x, y, "TEAM DRAGON DANCE")
    c.setStrokeColor(RED)
    c.setLineWidth(3)
    c.line(x, y - 12, x + 110, y - 12)


def folio(c, page, dark=False):
    c.setFillColor(PAPER if dark else INK)
    c.setFont(LATIN_BOLD, 10)
    c.drawRightString(WIDTH - 60, 45, f"{page:02d} / 07")
    c.setStrokeColor(LIGHT_LINE if dark else DARK_LINE)
    c.setLineWidth(1)
    c.line(60, 65, WIDTH - 60, 65)


def label(c, text, x, y, dark=False):
    c.setFillColor(RED)
    c.setFont(LATIN_BOLD, 11)
    c.drawString(x, y, text)
    c.setStrokeColor(PAPER if dark else INK)
    c.setLineWidth(1)
    c.line(x, y - 15, x + 72, y - 15)


def page_one(c):
    c.setFillColor(INK)
    c.rect(0, 0, WIDTH, HEIGHT, fill=1, stroke=0)
    draw_cover_image(c, ASSETS / "race-car.jpg", 810, 0, 630, HEIGHT)
    c.setFillColor(Color(0, 0, 0, alpha=0.4))
    c.rect(810, 0, 630, HEIGHT, fill=1, stroke=0)
    c.setFillColor(PAPER)
    c.rect(0, 0, 810, HEIGHT, fill=1, stroke=0)
    c.setFillColor(RED)
    c.rect(60, 730, 118, 9, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont(CJK, 76)
    c.drawString(60, 590, "贊助計劃書")
    c.setFont(LATIN_BOLD, 20)
    c.drawString(64, 546, "TEAM DRAGON DANCE")
    c.setFillColor(RED)
    c.setFont(LATIN_BOLD, 12)
    c.drawString(64, 500, "STEM RACING HONG KONG & MACAU")
    c.setFillColor(INK)
    c.setFont(LATIN, 12)
    c.drawString(64, 474, "BY SPONSERSHIP AND MARKETING MANAGER : BRIAN")
    c.setStrokeColor(DARK_LINE)
    c.line(64, 430, 730, 430)
    draw_lines(
        c,
        "您的支持，不僅點燃一群年輕工程師的夢想，更將貴品牌與香港文化、教育、創新、的直接掛鉤",
        64,
        374,
        620,
        size=24,
        leading=38,
    )
    c.setFillColor(MUTED)
    c.setFont(LATIN_BOLD, 12)
    c.drawString(64, 120, "AD&FD POHL LEUNG SING TAK COLLEGE")
    c.setFillColor(PAPER)
    c.setFont(LATIN_BOLD, 14)
    c.drawString(852, 84, "TEAM DRAGON DANCE")
    folio(c, 1)


def page_two(c):
    c.setFillColor(PAPER)
    c.rect(0, 0, WIDTH, HEIGHT, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont(LATIN_BOLD, 22)
    c.drawString(60, 730, "TEAM DRAGON DANCE")
    c.setFillColor(RED)
    c.setFont(LATIN_BOLD, 11)
    c.drawString(60, 698, "CONTENTS")
    c.setFont(LATIN_BOLD, 168)
    c.drawRightString(WIDTH - 60, 635, "02")
    entries = [
        ("(1)", "我們與比賽", "隊伍和賽事"),
        ("(2)", "共同的願景", "文化 , 國際 & 社會價值"),
        ("(3)", "資金與宣傳", "資金流向與宣傳渠道"),
        ("(4)", "贊助方案", "方案參考"),
        ("(5)", "聯絡方法", "隊伍資料"),
    ]
    start_y = 535
    for index, (number, title, detail) in enumerate(entries):
        y = start_y - index * 88
        c.setStrokeColor(DARK_LINE)
        c.line(60, y - 22, WIDTH - 60, y - 22)
        c.setFillColor(RED)
        c.setFont(LATIN_BOLD, 12)
        c.drawString(60, y, number)
        c.setFillColor(INK)
        c.setFont(CJK, 26)
        c.drawString(160, y - 4, title)
        c.setFillColor(MUTED)
        c.setFont(CJK, 16)
        c.drawRightString(WIDTH - 60, y, detail)
    wordmark(c, 60, 107)
    folio(c, 2)


def page_three(c):
    c.setFillColor(INK)
    c.rect(0, 0, WIDTH, HEIGHT, fill=1, stroke=0)
    c.setFillColor(RED)
    c.rect(0, 0, 22, HEIGHT, fill=1, stroke=0)
    wordmark(c, 60, 736, dark=True)
    label(c, "(1)", 60, 683, dark=True)
    c.setFillColor(PAPER)
    c.setFont(LATIN_BOLD, 26)
    c.drawString(60, 610, "STEM RACING")
    c.setFont(LATIN, 17)
    c.drawString(60, 578, "TEAM DRAGON DANCE")
    c.setStrokeColor(LIGHT_LINE)
    c.line(60, 536, WIDTH - 60, 536)
    stats = [("180 萬", "青少年"), ("65", "個國家"), ("20 米", "賽道"), ("1 秒", "決勝")]
    for index, (value, name) in enumerate(stats):
        x = 60 + index * 300
        c.setFillColor(RED if index == 3 else PAPER)
        c.setFont(CJK, 37)
        c.drawString(x, 460, value)
        c.setFillColor(MUTED)
        c.setFont(CJK, 16)
        c.drawString(x, 428, name)
    c.setFillColor(PAPER)
    c.setFont(CJK, 26)
    c.drawString(60, 356, "STEM RACING—F1 官方支持的全球最大型青少年工程競賽")
    draw_lines(c, "讓 9 至 19 歲的學生像真正的 F1 車隊一樣戰鬥：設計、製造、競速、宣傳", 60, 310, 1150, size=20, leading=31, color=PAPER)
    c.setFillColor(RED)
    c.setFont(CJK, 18)
    c.drawString(60, 202, "關於我們")
    draw_lines(
        c,
        "DRAGON DANCE，一支扎根香港的隊伍。我們汲取往昔經驗，加入新血，我們將香港百年「舞火龍」文化融入 STEM RACING，象徵團結、堅毅與不屈不撓的精神——正如一支 F1 車隊，各司其職為同一個目標全力以赴",
        60,
        165,
        1140,
        size=19,
        leading=31,
        color=PAPER,
    )
    folio(c, 3, dark=True)


def page_four(c):
    c.setFillColor(PAPER)
    c.rect(0, 0, WIDTH, HEIGHT, fill=1, stroke=0)
    label(c, "(2)", 60, 730)
    c.setFillColor(INK)
    c.setFont(CJK, 50)
    c.drawString(60, 635, "共同的願景")
    c.setFillColor(RED)
    c.setFont(CJK, 29)
    c.drawString(60, 582, "傳承文化，驅動未來")
    draw_lines(
        c,
        "舞火龍是香港非物質文化遺產，象徵團結、堅毅與不屈。您的支持，使文化傳承與創新，讓這份技藝在國際年輕一代眼前重生。",
        60,
        505,
        590,
        size=19,
        leading=31,
    )
    c.setFillColor(INK)
    c.setFont(LATIN_BOLD, 16)
    c.drawString(60, 327, "TEAM DRAGON DANCE")
    cards = [
        ("文化價值：", "傳承文化，驅動未來", "舞火龍是香港非物質文化遺產，象徵團結、堅毅與不屈。您的支持，使文化傳承與創新，讓這份技藝在國際年輕一代眼前重生。"),
        ("國際舞台：", "從校內展演到香港區初賽（4 月 28 日）再戰區決賽（5 月 23 日）目標 12 月底贏得香港區冠軍，進軍世界賽。", "您的品牌，隨我們征戰國際，與全球頂尖隊伍同框，觸及 65 個國家、數百萬觀眾。"),
        ("社會價值：", "支持香港年輕一代以實力傳遞香港文化故事。", "您的企業標誌，將與教育、創新、文化保育這三個社會最重視的價值緊緊相連。"),
    ]
    card_width = 400
    for index, (heading, title, body) in enumerate(cards):
        x = 60 + index * 440
        c.setFillColor(INK)
        c.rect(x, 110, card_width, 180, fill=1, stroke=0)
        c.setFillColor(RED)
        c.setFont(CJK, 17)
        c.drawString(x + 22, 255, heading)
        draw_lines(c, title, x + 22, 220, card_width - 44, size=16, leading=23, color=PAPER)
        draw_lines(c, body, x + 22, 160, card_width - 44, size=13, leading=20, color=MUTED)
    folio(c, 4)


def page_five(c):
    c.setFillColor(INK)
    c.rect(0, 0, WIDTH, HEIGHT, fill=1, stroke=0)
    draw_cover_image(c, ASSETS / "race-car.jpg", 0, 0, 570, HEIGHT)
    c.setFillColor(Color(0, 0, 0, alpha=0.25))
    c.rect(0, 0, 570, HEIGHT, fill=1, stroke=0)
    label(c, "(3)", 640, 730, dark=True)
    c.setFillColor(PAPER)
    c.setFont(CJK, 50)
    c.drawString(640, 635, "資金與宣傳")
    c.setFillColor(RED)
    c.setFont(CJK, 18)
    c.drawString(640, 580, "資金")
    draw_lines(c, "本賽事模擬真實產業環境，車隊需自主籌措營運經費，涵蓋設計、製造、報名與行銷，藉此培養學生財務、行銷與決策實戰能力。", 640, 545, 680, size=18, leading=29, color=PAPER)
    draw_lines(c, "您的支持將助我們經營隊伍例如 3D 打印耗材、團隊制服 , 宣傳物料或日常後勤或到其他國家參賽所需的各種資源，以優化車隊營運效率並提升比賽競爭力。", 640, 390, 680, size=17, leading=27, color=MUTED)
    c.setFillColor(RED)
    c.setFont(CJK, 18)
    c.drawString(640, 250, "宣傳")
    draw_lines(c, "我們通過 社交媒體平台宣傳贊助商實現廣泛曝光，同時，我們將在車隊制服及比賽賽車上顯著展示貴公司標誌，於賽事現場及線上內容中持續強化品牌識別。線上線下同步曝光，最大化品牌推廣效益。", 640, 215, 680, size=17, leading=27, color=PAPER)
    c.setFillColor(PAPER)
    c.setFont(LATIN_BOLD, 14)
    c.drawString(60, 104, "貴公司 LOGO 例：")
    c.setFillColor(RED)
    c.setFont(LATIN_BOLD, 15)
    c.drawString(60, 78, "INSTAGRAM")
    wordmark(c, 640, 108, dark=True)
    folio(c, 5, dark=True)


def page_six(c):
    c.setFillColor(PAPER)
    c.rect(0, 0, WIDTH, HEIGHT, fill=1, stroke=0)
    label(c, "(4)", 60, 730)
    c.setFillColor(INK)
    c.setFont(CJK, 50)
    c.drawString(60, 635, "贊助方案")
    c.setFillColor(MUTED)
    c.setFont(CJK, 18)
    c.drawString(60, 590, "贊助等級")
    plans = [
        ("龍", "方案「龍」為 2500 港元", "在社交媒體中作感謝及把標誌放在制服和賽車上"),
        ("龖", "方案「龖」為 3000 港元", "把標誌放在商品上"),
        ("龘", "方案「龘」為 3500 港元", "一條宣傳短片"),
    ]
    for index, (symbol, amount, return_text) in enumerate(plans):
        x = 60 + index * 440
        c.setFillColor(INK)
        c.rect(x, 220, 400, 300, fill=1, stroke=0)
        c.setFillColor(RED)
        c.setFont(CJK, 72)
        c.drawString(x + 26, 410, symbol)
        c.setFillColor(PAPER)
        draw_lines(c, amount, x + 26, 340, 340, size=20, leading=29, color=PAPER)
        c.setStrokeColor(LIGHT_LINE)
        c.line(x + 26, 286, x + 374, 286)
        draw_lines(c, return_text, x + 26, 253, 340, size=16, leading=25, color=MUTED)
    c.setFillColor(INK)
    c.setFont(CJK, 16)
    c.drawString(60, 150, "贊助類型")
    c.drawString(60, 120, "贊助回報")
    c.setFillColor(MUTED)
    c.setFont(CJK, 15)
    c.drawString(60, 88, "條款細則歡迎隨時聯絡作查詢  表格供方案參考")
    wordmark(c, 1110, 108)
    folio(c, 6)


def page_seven(c):
    c.setFillColor(INK)
    c.rect(0, 0, WIDTH, HEIGHT, fill=1, stroke=0)
    c.setFillColor(RED)
    c.rect(60, 625, 140, 8, fill=1, stroke=0)
    c.setFillColor(PAPER)
    c.setFont(LATIN_BOLD, 62)
    c.drawString(60, 520, "CONTACT US")
    c.setFillColor(MUTED)
    c.setFont(LATIN, 20)
    c.drawString(64, 477, "THE WAY TO CONTA US")
    c.setStrokeColor(LIGHT_LINE)
    c.line(60, 425, WIDTH - 60, 425)
    contact = [
        ("E-MAIL:", "DRAGONDANCE@LSTC.EDU.HK"),
        ("PHONE:", "+852-60116515"),
        ("ADDRESS", "ESTATE SECONDARY SCHOOL NO. 2, SHEK WAI KOK ESTATE, TSUEN WAN, N.T., HONG KONG"),
        ("SOCIAL MEDIA:", "@TEAM_DRAGON_DANCE"),
    ]
    y = 360
    for key, value in contact:
        c.setFillColor(RED)
        c.setFont(LATIN_BOLD, 11)
        c.drawString(60, y, key)
        c.setFillColor(PAPER)
        if key == "ADDRESS":
            y = draw_lines(c, value, 290, y, 870, size=20, leading=30, color=PAPER, font=LATIN)
        else:
            c.setFont(LATIN_BOLD, 22)
            c.drawString(290, y, value)
            y -= 37
        y -= 30
    wordmark(c, 60, 108, dark=True)
    folio(c, 7, dark=True)


def build_pdf():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    document = canvas.Canvas(str(OUTPUT), pagesize=(WIDTH, HEIGHT), pageCompression=1)
    document.setTitle("Dragon Dance Sponsorship Proposal")
    document.setAuthor("Team Dragon Dance")
    document.setSubject("Dragon Dance sponsorship proposal")
    for draw_page in [page_one, page_two, page_three, page_four, page_five, page_six, page_seven]:
        draw_page(document)
        document.showPage()
    document.save()


if __name__ == "__main__":
    build_pdf()
