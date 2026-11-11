#!/usr/bin/env python3
"""Gera a pixel art do protótipo do kiting, conforme arte/CONTRATO.md.
Uso: python3 gerar.py <pasta_saida> [amostra.png]
Escala: 1 m = 20 px de arte; o jogo amplia 2x."""
import sys, os, math, random, base64, io
from PIL import Image, ImageDraw

SAIDA = sys.argv[1]
os.makedirs(SAIDA, exist_ok=True)

def hexa(c, a=255):
    c = c.lstrip("#")
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4)) + (a,)

CONTORNO = "#0b1220"
CONT = hexa(CONTORNO)
VAZIO = (0, 0, 0, 0)

def nova(w, h=None):
    return Image.new("RGBA", (w, h or w), VAZIO)

def de_grade(linhas, paleta):
    h, w = len(linhas), len(linhas[0])
    img = nova(w, h)
    for y, l in enumerate(linhas):
        assert len(l) == w, (y, len(l), l)
        for x, ch in enumerate(l):
            if ch != ".":
                img.putpixel((x, y), hexa(paleta[ch]))
    return img

def folha(quadros):
    w, h = quadros[0].size
    f = nova(w * len(quadros), h)
    for i, q in enumerate(quadros):
        f.paste(q, (i * w, 0))
    return f

def contornar(img, cor=CONT):
    fonte = img.copy()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            if fonte.getpixel((x, y))[3]:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and fonte.getpixel((nx, ny))[3]:
                    img.putpixel((x, y), cor)
                    break
    return img

def silhueta(img, cor):
    out = img.copy()
    for y in range(img.height):
        for x in range(img.width):
            p = img.getpixel((x, y))
            if p[3] and p != CONT:
                out.putpixel((x, y), cor)
    return out

def pontos(img, lista, cor):
    for (x, y) in lista:
        if 0 <= x < img.width and 0 <= y < img.height:
            img.putpixel((x, y), cor)

# ================================================================ jogador
PJ = {
    "o": CONTORNO,
    "L": "#a9d8ff", "M": "#4da3ff", "D": "#2b6fc2", "N": "#1c4a8a",
    "s": "#f3cfa6", "t": "#d9a77c", "e": "#1a2233",
    "g": "#d5dbe6", "G": "#7b8698", "y": "#ffd166", "w": "#ffffff",
    "n": "#3a4356",
}
# Corpo (capuz + capa), 24 colunas, sem a arma e sem os pés.
CORPO = [
    "........................",
    "........................",
    "..........ooooooo.......",
    "........ooLLLLLLMoo.....",
    ".......oLLLLLMMMMMMo....",
    "......oLLLMMMMMMMMMMo...",
    "......oLLMMMMMoooooMo...",
    "......oLMMMMMossssso....",
    "......oLMMMMossessteo...",
    "......oMMMMMossessteo...",
    "......oMMMMMosssssso....",
    "......oDMMMMMosstoo.....",
    "......oDMMMMMMoooo......",
    ".....oDDMMMMMMMMo.......",
    ".....oDMMMMMMMMMo.......",
    ".....oDMMMMMMMMMo.......",
    ".....oDDMMMMMMMDo.......",
    ".....oNDDMMMMMDDo.......",
    ".....oNDDDMMMDDNo.......",
    "......oNNDDDDDNo........",
    "......ooooooooo.........",
]
PES = {
    "juntos": ["......onno.onno.........", "......oooo.oooo.........", "........................"],
    "a":      [".....onno...onno........", ".....oooo...onno........", "............oooo........"],
    "b":      [".......onnonno..........", ".......ooooooo..........", "........................"],
    "c":      [".....onno...onno........", ".....onno...oooo........", ".....oooo..............."],
}
# Arma: grade pequena colada por cima, com a posição (x, y) do canto.
ARMA = ["..oooooooo", ".oGggggggo", "ssGGGGGooo", "ssoooooo.."]
ARMA_ALTA = ["....oo", "...ogo", "..ogGo", ".ogGo.", "ssGo..", "sso..."]

def jogador(pes="juntos", sobe=0, arma=(13, 12), arma_grade=ARMA, extra=None):
    img = nova(24)
    corpo = de_grade(CORPO, PJ)
    img.alpha_composite(corpo, (0, sobe))
    img.alpha_composite(de_grade(PES[pes], PJ), (0, 21))
    if arma:
        img.alpha_composite(de_grade(arma_grade, PJ), (arma[0], arma[1] + sobe))
    if extra:
        extra(img)
    return img

def brilho_cano(img):   # preparo do tiro: ponta da arma acesa
    pontos(img, [(23, 13), (23, 14), (22, 12)], hexa("#ffd166"))
    pontos(img, [(23, 13)], hexa("#ffffff"))

def clarao(img):        # tiro: clarão na ponta
    y = hexa("#ffd166"); w = hexa("#ffffff")
    pontos(img, [(21, 11), (22, 10), (21, 15), (22, 16), (23, 13), (22, 13), (22, 12), (22, 14)], y)
    pontos(img, [(21, 13), (21, 12), (21, 14)], w)

def rastro(img):        # avanço: riscos de velocidade atrás
    c1 = hexa("#a9d8ff"); c2 = hexa("#4da3ff", 160)
    for y, x0, n in [(6, 0, 4), (10, 1, 4), (14, 0, 3), (18, 1, 3)]:
        for i in range(n):
            img.putpixel((x0 + i, y), c1 if i >= n - 2 else c2)

def quadros_jogador():
    q = []
    q.append(jogador())                                   # parado 1
    q.append(jogador(sobe=1))                             # parado 2 (respira)
    q.append(jogador(pes="a"))                            # andando 1..4
    q.append(jogador(pes="b", sobe=1))
    q.append(jogador(pes="c"))
    q.append(jogador(pes="b", sobe=1))
    q.append(jogador(extra=brilho_cano))                  # preparo do tiro
    q.append(jogador(arma=(12, 12), extra=clarao))        # tiro (recuo de 1 px)
    q.append(jogador(pes="a", sobe=1, extra=rastro))      # avanço
    q.append(jogador(arma=(15, 6), arma_grade=ARMA_ALTA)) # aparo: arma erguida em guarda
    q.append(silhueta(jogador(), hexa("#ffffff")))        # atingido: clarão branco
    return q

# ================================================================ boneco
def rampa(base):
    r, g, b = hexa(base)[:3]
    def mist(f, alvo):
        return tuple(int(v + (a - v) * f) for v, a in zip((r, g, b), alvo)) + (255,)
    return [mist(0.5, (255, 255, 255)), mist(0.2, (255, 255, 255)), (r, g, b, 255),
            mist(0.3, (10, 14, 30)), mist(0.55, (10, 14, 30))]

def boneco(base, rosto="bravo", corda="#e9e2d0", amassa=0, tomba=0, extra=None):
    """Boneco de treino vivo: corpo redondo de barro, dois pinos de madeira em cima,
    uma corda amarrada na barriga. amassa = quantos px o corpo desce/achata."""
    T = 48
    img = nova(T)
    c = rampa(base)
    cx, cy = 23.5, 25.5 + amassa / 2
    rx, ry = 17.5 + amassa / 2, 17.0 - amassa / 2
    dentro = lambda x, y: ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1.0
    # pinos de madeira (atrás do corpo)
    mad = [hexa("#b98a55"), hexa("#8a6238"), hexa("#5f4124")]
    for bx in (12, 31):
        topo = 4 + amassa + (tomba if bx == 31 else 0)
        for y in range(topo, topo + 9):
            for x in range(bx, bx + 5):
                img.putpixel((x, y), mad[0] if x == bx else mad[1] if x < bx + 4 else mad[2])
        for x in range(bx, bx + 5):
            img.putpixel((x, topo), mad[0])
    # corpo sombreado, luz de cima à esquerda
    for y in range(T):
        for x in range(T):
            if not dentro(x, y):
                continue
            d = ((x - (cx - 6)) / rx) ** 2 + ((y - (cy - 7)) / ry) ** 2
            i = 0 if d < 0.07 else 1 if d < 0.32 else 2 if d < 1.05 else 3 if d < 1.8 else 4
            # pontilhado na passagem entre tons, para dar textura de barro
            if (x + y) % 2 == 0:
                d2 = d * 1.12
                i = max(i, 0 if d2 < 0.07 else 1 if d2 < 0.32 else 2 if d2 < 1.05 else 3 if d2 < 1.8 else 4)
            img.putpixel((x, y), c[i])
    # corda na barriga
    co = hexa(corda); co2 = tuple(int(v * 0.7) for v in co[:3]) + (255,)
    yc = 34 + amassa
    for x in range(T):
        curva = int(round(2.2 * (1 - ((x - cx) / rx) ** 2))) if abs(x - cx) < rx else 0
        for k in range(3):
            y = yc + curva + k
            if dentro(x, y):
                img.putpixel((x, y), co2 if (x + k) % 4 == 0 or k == 2 else co)
    # nó da corda
    for (x, y) in [(36, yc + 1), (37, yc + 1), (36, yc + 2), (37, yc + 2), (38, yc + 3), (37, yc + 4), (38, yc + 5)]:
        if dentro(x, y):
            img.putpixel((x, y), co)
    # rosto virado para a direita
    oy = 20 + amassa
    W = hexa("#ffffff")
    def olho(x0, y0):
        for y in range(y0, y0 + 5):
            for x in range(x0, x0 + 4):
                img.putpixel((x, y), W)
        pontos(img, [(x0 + 2, y0 + 2), (x0 + 3, y0 + 2), (x0 + 2, y0 + 3), (x0 + 3, y0 + 3), (x0 + 2, y0 + 4), (x0 + 3, y0 + 4)], CONT)
    def sobrancelhas():
        for i in range(5):
            pontos(img, [(22 + i, oy - 4 + i // 2), (22 + i, oy - 3 + i // 2)], CONT)
            pontos(img, [(37 - i, oy - 4 + i // 2), (37 - i, oy - 3 + i // 2)], CONT)
    if rosto == "bravo":
        olho(23, oy); olho(33, oy); sobrancelhas()
        for x in range(27, 33):
            pontos(img, [(x, oy + 9)], CONT)
        pontos(img, [(26, oy + 10), (33, oy + 10)], CONT)
    elif rosto == "grito":   # preparando golpe: olhos acesos, boca aberta
        for (x0) in (23, 33):
            for y in range(oy, oy + 5):
                for x in range(x0, x0 + 4):
                    img.putpixel((x, y), W)
        sobrancelhas()
        for y in range(oy + 8, oy + 12):
            for x in range(27, 33):
                img.putpixel((x, y), CONT)
        pontos(img, [(28, oy + 8), (30, oy + 8), (31, oy + 8)], W)  # dentes
    elif rosto == "cansado":  # olhos fechados, gota de suor
        for x in range(22, 27):
            pontos(img, [(x, oy + 3)], CONT)
        for x in range(32, 37):
            pontos(img, [(x, oy + 3)], CONT)
        pontos(img, [(23, oy + 4), (25, oy + 4), (33, oy + 4), (35, oy + 4)], CONT)
        for y in range(oy + 8, oy + 11):
            for x in range(28, 32):
                img.putpixel((x, y), CONT)
    elif rosto == "tonto":    # olhos em X, boca torta
        for x0 in (22, 32):
            for i in range(5):
                pontos(img, [(x0 + i, oy + i), (x0 + 4 - i, oy + i)], CONT)
        pontos(img, [(26, oy + 10), (27, oy + 9), (28, oy + 10), (29, oy + 9), (30, oy + 10), (31, oy + 9), (32, oy + 10)], CONT)
    contornar(img)
    if extra:
        extra(img)
    return img

def suor(dy):
    def f(img):
        a = hexa("#bfe6ff"); b = hexa("#ffffff")
        pontos(img, [(43, 12 + dy), (42, 13 + dy), (43, 13 + dy), (44, 13 + dy), (42, 14 + dy), (43, 14 + dy), (44, 14 + dy), (43, 15 + dy)], a)
        pontos(img, [(42, 13 + dy)], b)
    return f

def estrelas(fase):
    def f(img):
        w = hexa("#ffffff"); a = hexa("#bfe6ff")
        centros = [(10, 5), (23, 2), (37, 5)] if fase == 0 else [(16, 3), (30, 3), (42, 8)]
        for (x, y) in centros:
            pontos(img, [(x, y - 2), (x, y - 1), (x, y), (x, y + 1), (x, y + 2), (x - 2, y), (x - 1, y), (x + 1, y), (x + 2, y)], w)
            pontos(img, [(x - 1, y - 1), (x + 1, y - 1), (x - 1, y + 1), (x + 1, y + 1)], a)
    return f

COR_BONECO = {"normal": "#c9793f", "circulo": "#3d55e8", "saturno": "#f0c419", "linha": "#2fc46a",
              "recuperacao": "#5d4a45", "atordoado": "#9aa0ae"}

def quadros_boneco(estado):
    b = COR_BONECO[estado]
    if estado == "normal":
        return [boneco(b), boneco(b, amassa=1)]
    if estado in ("circulo", "saturno", "linha"):
        corda = "#6e5210" if estado == "saturno" else "#e9e2d0"
        return [boneco(b, rosto="grito", corda=corda), boneco(b, rosto="grito", corda=corda, amassa=1)]
    if estado == "recuperacao":
        return [boneco(b, rosto="cansado", corda="#8f897c", amassa=3, extra=suor(0)),
                boneco(b, rosto="cansado", corda="#8f897c", amassa=4, extra=suor(2))]
    if estado == "atordoado":
        return [boneco(b, rosto="tonto", corda="#d8d3c6", tomba=2, extra=estrelas(0)),
                boneco(b, rosto="tonto", corda="#d8d3c6", tomba=2, extra=estrelas(1))]

# ================================================================ tiros
PT = {"o": CONTORNO, "y": "#ffd166", "Y": "#fff3c4", "c": "#e8962e",
      "w": "#ffffff", "b": "#bfe6ff", "B": "#6bb8ff", "a": "#3f86d9",
      "p": "#c77dff", "P": "#f0d9ff", "q": "#8a45d6"}
TIRO_AA = [
    "........",
    "........",
    "..cyyy..",
    "ccyYYYy.",
    "ccyYYYy.",
    "..cyyy..",
    "........",
    "........",
]
TIRO_Q = [
    "................",
    "................",
    "................",
    "................",
    "........bbbbb...",
    "..a..BBbwwwwwb..",
    "....aBBbwwwwwwb.",
    "aaaBBBbwwwwwwwb.",
    ".aaBBBbwwwwwwwb.",
    "....aBBbwwwwwwb.",
    "..a..BBbwwwwwb..",
    "........bbbbb...",
    "................",
    "................",
    "................",
    "................",
]
TIRO_W = [
    "................",
    "................",
    "................",
    ".........ppp....",
    "..q....ppPPPpp..",
    "......ppPPPPppq.",
    ".q.qqpppPPpppqq.",
    "..qqqppppppppqq.",
    ".q.qqpppppppqqq.",
    "......ppppppqqq.",
    "..q....ppqqqqq..",
    ".........qqq....",
    "................",
    "................",
    "................",
    "................",
]

# ================================================================ chão
def chao():
    rnd = random.Random(11)
    base, clara, junta, graos, musgo = hexa("#1a1f2a"), hexa("#202737"), hexa("#11141c"), hexa("#262d3d"), hexa("#1d2b2e")
    quadros = []
    for v in range(4):
        img = Image.new("RGBA", (20, 20), base)
        for i in range(20):
            img.putpixel((i, 0), junta); img.putpixel((0, i), junta)
        for i in range(1, 20):
            img.putpixel((i, 1), clara); img.putpixel((1, i), clara)
        for _ in range(5):
            img.putpixel((rnd.randrange(3, 19), rnd.randrange(3, 19)), graos)
        if v == 1:   # rachadura
            pontos(img, [(6, 8), (7, 9), (8, 9), (9, 10), (10, 11), (10, 12), (11, 13), (12, 13), (13, 14)], junta)
            pontos(img, [(7, 10), (9, 11), (11, 14)], clara)
        elif v == 2:  # pedrinhas
            pontos(img, [(13, 6), (14, 6), (13, 7), (14, 7), (6, 14), (7, 14)], graos)
            pontos(img, [(14, 8), (13, 8), (7, 15)], junta)
        elif v == 3:  # musgo discreto no canto
            pontos(img, [(2, 2), (3, 2), (2, 3), (4, 2), (2, 4), (3, 3), (5, 3), (3, 5)], musgo)
        quadros.append(img)
    return folha(quadros)

# ================================================================ efeitos
ROXO, ROXO_C, ROXO_E = hexa("#c77dff"), hexa("#f0d9ff"), hexa("#8a45d6")

def anel(T, r0, r1, cor_de, tracejado=None):
    """Anel de pixels entre os raios r0 e r1. cor_de(x, y, ang, d) devolve a cor ou None."""
    img = nova(T)
    c = (T - 1) / 2
    for y in range(T):
        for x in range(T):
            d = math.hypot(x - c, y - c)
            if r0 <= d <= r1:
                cor = cor_de(x, y, math.atan2(y - c, x - c), d)
                if cor:
                    img.putpixel((x, y), cor)
    return img

def marca():
    def cor(x, y, ang, d):
        seg = int((ang + math.pi) / (2 * math.pi) * 16) % 16
        if seg % 4 == 3:
            return None           # quatro cortes: lê como selo, não como área de golpe
        return ROXO_C if d < 23.4 else ROXO if d < 24.6 else ROXO_E
    img = anel(64, 22.5, 25.5, cor)
    # quatro pontas em losango nas diagonais
    for sx, sy in ((1, 1), (1, -1), (-1, 1), (-1, -1)):
        cx, cy = 31.5 + sx * 20.5, 31.5 + sy * 20.5
        for dx in range(-2, 3):
            for dy in range(-2, 3):
                if abs(dx) + abs(dy) <= 2:
                    img.putpixel((int(round(cx + dx)), int(round(cy + dy))), ROXO_C if abs(dx) + abs(dy) <= 1 else ROXO)
    return img

CARGA = [
    ["..qq..", ".q..q.", "q....q", "q....q", ".q..q.", "..qq.."],
    ["..pp..", ".pPPp.", "pPPppq", "pPpppq", ".pppq.", "..qq.."],
]

def explosao():
    quadros = []
    rnd = random.Random(3)
    raios = [(8, 15), (16, 23), (23, 28), (28, 30.5)]
    for i, (r0, r1) in enumerate(raios):
        def cor(x, y, ang, d, i=i, r0=r0, r1=r1):
            if i == 3 and (x + y) % 2:
                return None
            if i == 2 and (x * 3 + y * 5) % 7 == 0:
                return None
            meio = (r0 + r1) / 2
            return hexa("#ffffff") if (i == 0 and d < meio) else ROXO_C if d < meio else ROXO if i < 2 else ROXO_E
        img = anel(64, r0, r1, cor)
        if i == 0:   # miolo claro
            nucleo = anel(64, 0, 8, lambda x, y, a, d: hexa("#ffffff") if d < 5 else ROXO_C)
            img.alpha_composite(nucleo)
        # faíscas
        for k in range(10):
            ang = k * math.pi / 5 + i * 0.3
            rr = r1 + 1.5 if i < 3 else r1 - 4
            x, y = int(round(31.5 + math.cos(ang) * rr)), int(round(31.5 + math.sin(ang) * rr))
            if 1 <= x < 63 and 1 <= y < 63 and i < 3:
                pontos(img, [(x, y), (x + 1, y), (x, y + 1), (x + 1, y + 1)], ROXO_C if i < 2 else ROXO)
        quadros.append(img)
    return folha(quadros)

def aparo():
    quadros = []
    w, a, b = hexa("#ffffff"), hexa("#bfe6ff"), hexa("#6bb8ff")
    # 1: escudo surgindo; 2: escudo cheio; 3: escudo se desfazendo
    def q1(x, y, ang, d):
        return a if d < 13.2 else b
    def q2(x, y, ang, d):
        return w if d < 13.6 else a if d < 14.6 else b
    def q3(x, y, ang, d):
        seg = int((ang + math.pi) / (2 * math.pi) * 12) % 12
        return None if seg % 2 else b
    quadros.append(anel(32, 12.2, 14.0, q1))
    f2 = anel(32, 12.2, 15.4, q2)
    for (x, y) in [(15, 0), (16, 0), (15, 31), (16, 31), (0, 15), (0, 16), (31, 15), (31, 16)]:
        f2.putpixel((x, y), w)
    quadros.append(f2)
    quadros.append(anel(32, 13.6, 15.4, q3))
    return folha(quadros)

PD = {"B": "#4da3ff", "L": "#a9d8ff", "o": CONTORNO}
DESTINO = [
    "............",
    ".LB......BL.",
    ".BBB....BBB.",
    "..BBB..BBB..",
    "...BB..BB...",
    "............",
    "............",
    "...BB..BB...",
    "..BBB..BBB..",
    ".BBB....BBB.",
    ".LB......BL.",
    "............",
]

# ================================================================ ícones
def icones():
    qs = []
    # Q: projétil claro com rastro
    i = nova(22); d = ImageDraw.Draw(i)
    d.ellipse([10, 6, 19, 15], fill=hexa("#bfe6ff"))
    d.ellipse([12, 8, 17, 13], fill=hexa("#ffffff"))
    for y, x0 in [(8, 4), (10, 2), (11, 2), (13, 4)]:
        d.line([x0, y, 9, y], fill=hexa("#6bb8ff"))
    qs.append(i)
    # W: selo roxo (a marca)
    i = nova(22); d = ImageDraw.Draw(i)
    d.ellipse([3, 3, 18, 18], outline=ROXO, width=2)
    d.polygon([(10, 6), (15, 10), (15, 11), (11, 15), (10, 15), (6, 11), (6, 10)], fill=ROXO_C)
    d.rectangle([10, 10, 11, 11], fill=ROXO_E)
    qs.append(i)
    # E: seta de avanço com riscos
    i = nova(22); d = ImageDraw.Draw(i)
    d.polygon([(11, 4), (19, 10), (19, 11), (11, 17), (11, 13), (7, 13), (7, 8), (11, 8)], fill=hexa("#4da3ff"))
    d.polygon([(12, 7), (17, 10), (17, 11), (12, 14), (12, 12), (8, 12), (8, 9), (12, 9)], fill=hexa("#a9d8ff"))
    for y, x0, x1 in [(8, 2, 4), (10, 1, 5), (11, 1, 5), (13, 2, 4)]:
        d.line([x0, y, x1, y], fill=hexa("#a9d8ff"))
    qs.append(i)
    # R: escudo (aparo)
    i = nova(22); d = ImageDraw.Draw(i)
    d.polygon([(4, 3), (17, 3), (17, 11), (11, 18), (10, 18), (4, 11)], fill=hexa("#7b8698"))
    d.polygon([(6, 5), (15, 5), (15, 10), (11, 15), (10, 15), (6, 10)], fill=hexa("#d5dbe6"))
    d.rectangle([10, 5, 11, 15], fill=hexa("#ffd166"))
    d.rectangle([6, 8, 15, 9], fill=hexa("#ffd166"))
    qs.append(i)
    return folha(qs)

# ================================================================ gerar
pecas = {
    "chao": chao(),
    "jogador": folha(quadros_jogador()),
    "tiro_aa": de_grade(TIRO_AA, PT),
    "tiro_q": de_grade(TIRO_Q, PT),
    "tiro_w": de_grade(TIRO_W, PT),
    "marca": marca(),
    "carga": folha([de_grade(g, PT) for g in CARGA]),
    "explosao": explosao(),
    "aparo": aparo(),
    "destino": de_grade(DESTINO, PD),
    "icones": icones(),
}
for e in COR_BONECO:
    pecas["boneco_" + e] = folha(quadros_boneco(e))
pecas["boneco_atingido"] = silhueta(boneco(COR_BONECO["normal"]), hexa("#ffffff"))

linhas = []
for nome, img in pecas.items():
    img.save(os.path.join(SAIDA, nome + ".png"))
    buf = io.BytesIO(); img.save(buf, "PNG")
    linhas.append('  %s: "data:image/png;base64,%s"' % (nome, base64.b64encode(buf.getvalue()).decode()))
with open(os.path.join(SAIDA, "arte.js"), "w") as f:
    f.write("// Gerado pela conversa da pixel art. Veja CONTRATO.md.\nwindow.ARTE = {\n" + ",\n".join(linhas) + "\n};\n")

# ================================================================ amostra
def quadro(nome, i, w):
    return pecas[nome].crop((i * w, 0, (i + 1) * w, pecas[nome].height))

def amostra(caminho):
    E = 2
    W, H = 480, 320
    rnd = random.Random(5)
    cena = Image.new("RGBA", (W, H))
    for y in range(0, H, 20):
        for x in range(0, W, 20):
            cena.paste(quadro("chao", rnd.choice([0, 0, 0, 0, 1, 2, 3]), 20), (x, y))
    cena = cena.resize((W * E, H * E), Image.NEAREST)
    camada = Image.new("RGBA", cena.size, VAZIO)
    d = ImageDraw.Draw(camada)
    bx, by, m = 620, 340, 40
    d.ellipse([bx - 5 * m, by - 5 * m, bx + 5 * m, by + 5 * m], fill=(255, 90, 90, 70), outline=(255, 90, 90, 255), width=2)
    d.ellipse([bx - 3 * m, by - 3 * m, bx + 3 * m, by + 3 * m], fill=VAZIO, outline=(255, 90, 90, 255), width=2)
    d.ellipse([bx - 1.4 * m, by - 1.4 * m, bx + 1.4 * m, by + 1.4 * m], fill=(255, 90, 90, 70), outline=(255, 90, 90, 255), width=2)
    cena = Image.alpha_composite(cena, camada)
    def por(img, x, y):
        s = img.resize((img.width * E, img.height * E), Image.NEAREST)
        cena.alpha_composite(s, (x - s.width // 2, y - s.height // 2))
    por(quadro("boneco_saturno", 0, 48), bx, by)
    por(pecas["marca"], bx, by)
    for k in range(3):
        ang = -math.pi / 2 + (k - 1) * 0.5
        por(quadro("carga", 1 if k < 2 else 0, 6), int(bx + math.cos(ang) * 60), int(by + math.sin(ang) * 60))
    por(quadro("jogador", 6, 24), 250, 360)
    por(pecas["tiro_aa"], 330, 358)
    por(pecas["tiro_q"], 420, 250)
    por(pecas["tiro_w"], 400, 470)
    por(pecas["destino"], 150, 470)
    # fileira de cima: estados do boneco
    for i, e in enumerate(["normal", "circulo", "saturno", "linha", "recuperacao", "atordoado"]):
        por(quadro("boneco_" + e, 0, 48), 70 + i * 108, 70)
    por(pecas["boneco_atingido"], 70 + 6 * 108, 70)
    # fileira de baixo: quadros do jogador
    for i in range(11):
        por(quadro("jogador", i, 24), 40 + i * 56, 580)
        if i == 9:
            por(quadro("aparo", 1, 32), 40 + i * 56, 580)
    for i in range(4):
        por(quadro("icones", i, 22), 700 + i * 52, 584)
    for i in range(4):
        por(quadro("explosao", i, 64), 60 + i * 110, 200) if False else None
    cena.convert("RGB").save(caminho)

if len(sys.argv) > 2:
    amostra(sys.argv[2])
