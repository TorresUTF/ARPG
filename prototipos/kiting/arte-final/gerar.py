"""Recorta as folhas geradas no Nano Banana (pasta fonte/) e monta as peças do jogo.

Uso: python3 gerar.py
Saída: os PNGs nesta pasta e arte.js (window.ARTE e window.ARTE_PPM).
Os ícones ainda não têm arte final: vêm da pixel art (../arte/arte.js).
"""
import base64, io, json, os, re
import numpy as np
from PIL import Image
from scipy import ndimage

AQUI = os.path.dirname(os.path.abspath(__file__))
PPM = 80  # pixels de arte por metro nas peças novas (a pixel art usa 20)


def grade(arquivo, cols, linhas):
    im = np.asarray(Image.open(os.path.join(AQUI, "fonte", arquivo)).convert("RGB")).astype(np.float32)
    H, W, _ = im.shape
    cw, ch = W / cols, H / linhas
    return [im[int(r * ch):int((r + 1) * ch), int(c * cw):int((c + 1) * cw)] for r in range(linhas) for c in range(cols)]


def cor_para_alfa(c, g):
    """Tira o cinza de fundo g: devolve cor e alfa (como o 'color to alpha' de editores de imagem)."""
    a = np.where(c > g, (c - g) / (255 - g), (g - c) / g).max(axis=2)
    a = np.clip(a, 0, 1)
    f = np.where(a[..., None] > 1e-3, (c - g) / np.maximum(a[..., None], 1e-3) + g, c)
    return np.clip(f, 0, 255), a


def sem_fundo(cel, solido):
    borda = np.concatenate([cel[0], cel[-1], cel[:, 0], cel[:, -1]])
    g = np.median(borda, axis=0)
    cor, alfa = cor_para_alfa(cel, g)
    if solido:
        # objeto sólido: fica opaco tudo que não é fundo. Fundo = cinza sem cor (inclui a sombra no chão)
        # ligado à borda, ou buraco grande quase igual ao cinza. Brilho colorido não é fundo e fica opaco.
        sat = cel.max(axis=2) - cel.min(axis=2)
        neutro = (sat < 16) & (np.abs(cel.mean(axis=2) - g.mean()) < 60)
        rot, n = ndimage.label(neutro)
        toca = set(np.unique(np.concatenate([rot[0], rot[-1], rot[:, 0], rot[:, -1]]))) - {0}
        perto = np.abs(cel - g).max(axis=2) < 12
        rot2, n2 = ndimage.label(perto)
        tam = ndimage.sum(np.ones_like(rot2), rot2, range(1, n2 + 1))
        fundo = np.isin(rot, list(toca)) | np.isin(rot2, [i + 1 for i in range(n2) if tam[i] > 400])
        objeto = ndimage.binary_opening(~fundo, iterations=1)
        alfa = np.where(objeto, 1.0, alfa)
        cor = np.where(objeto[..., None], cel, cor)
    alfa = np.where(alfa < 0.04, 0, alfa)
    return np.dstack([cor, alfa * 255]).astype(np.uint8)


def caixa(rgba):
    ys, xs = np.nonzero(rgba[..., 3] > 20)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def montar(celulas, quadro_px, ocupa=0.94, base=False):
    """Põe as células num mesmo quadro quadrado, com a mesma escala para todas."""
    caixas = [caixa(c) for c in celulas]
    maior = max(max(x1 - x0, y1 - y0) for x0, y0, x1, y1 in caixas)
    alt = max(y1 - y0 for _, y0, _, y1 in caixas)
    esc = quadro_px * ocupa / maior
    saida = []
    for c, (x0, y0, x1, y1) in zip(celulas, caixas):
        im = Image.fromarray(c).crop((x0, y0, x1, y1))
        w, h = max(1, round((x1 - x0) * esc)), max(1, round((y1 - y0) * esc))
        im = im.resize((w, h), Image.LANCZOS)
        q = Image.new("RGBA", (quadro_px, quadro_px))
        px = (quadro_px - w) // 2
        # base: todos os quadros com o pé na mesma altura, para não "pular" na animação
        py = (quadro_px + round(alt * esc)) // 2 - h if base else (quadro_px - h) // 2
        q.alpha_composite(im, (px, py))
        saida.append(q)
    return saida


def balanco(q, graus):
    w, h = q.size
    return q.rotate(graus, resample=Image.BICUBIC, center=(w / 2, h * 0.9))


def folha(quadros):
    w, h = quadros[0].size
    f = Image.new("RGBA", (w * len(quadros), h))
    for i, q in enumerate(quadros):
        f.alpha_composite(q, (i * w, 0))
    return f


pecas = {}

# Chefe: 7 estados; o segundo quadro de cada estado é um leve balanço nas cordas.
chefe = [sem_fundo(c, True) for c in grade("chefe.jpg", 4, 2)[:7]]
q = montar(chefe, 240, base=True)  # 3 m
for i, nome in enumerate(["normal", "circulo", "saturno", "linha", "recuperacao", "atordoado"]):
    pecas["boneco_" + nome] = folha([q[i], balanco(q[i], 2)])
pecas["boneco_atingido"] = folha([q[6]])

# Jogador: 11 quadros, na ordem do CONTRATO.md.
jog = [sem_fundo(c, True) for c in grade("personagem.jpg", 4, 3)[:11]]
pecas["jogador"] = folha(montar(jog, 128, base=True))  # 1,6 m

# Tiros e efeitos: brilhos semitransparentes, sem parte opaca.
ef = [sem_fundo(c, False) for c in grade("efeitos.jpg", 4, 4)]
pecas["tiro_aa"] = folha(montar([ef[0]], 48, ocupa=0.98))
pecas["tiro_q"] = folha(montar([ef[1]], 96, ocupa=0.98))
pecas["tiro_w"] = folha(montar([ef[2]], 96, ocupa=0.98))
pecas["marca"] = folha(montar([ef[3]], 256, ocupa=0.95))
gemas = [sem_fundo(c, False) for c in grade("efeitos.jpg", 4, 4)[4:6]]
pecas["carga"] = folha(montar([gemas[0]], 32, ocupa=0.7) + montar([gemas[1]], 32, ocupa=1.0))
pecas["destino"] = folha(montar([ef[6]], 48, ocupa=0.9))
pecas["explosao"] = folha(montar(ef[8:12], 256))
pecas["aparo"] = folha(montar(ef[12:15], 160))

# Piso: 4 ladrilhos de 4 m. As bordas de todos viram o mesmo trecho do ladrilho liso (deslocado meio
# ladrilho), então qualquer ladrilho emenda sem costura com qualquer outro. Escurecido para os personagens se destacarem.
LADO = 320  # 4 m
pisos = [Image.fromarray(c.astype(np.uint8)).resize((LADO, LADO), Image.LANCZOS) for c in grade("chao.jpg", 2, 2)]
base = np.roll(np.asarray(pisos[0], np.float32), (LADO // 2, LADO // 2), axis=(0, 1))
u = np.abs(np.linspace(-1, 1, LADO))
peso = np.clip((1 - np.maximum.outer(u, u)) / 0.35, 0, 1)[..., None]  # 1 no meio, 0 na borda
pecas["chao"] = folha([Image.fromarray(((np.asarray(p, np.float32) * peso + base * (1 - peso)) * 0.8).astype(np.uint8)).convert("RGBA") for p in pisos])

for nome, im in pecas.items():
    im.save(os.path.join(AQUI, nome + ".png"), optimize=True)

# arte.js: peças novas + piso e ícones da pixel art
antigo = open(os.path.join(AQUI, "..", "arte", "arte.js"), encoding="utf-8").read()
arte = {k: v for k, v in re.findall(r'"?(\w+)"?\s*:\s*"(data:image/png;base64,[^"]+)"', antigo) if k in ("icones",)}
for nome, im in pecas.items():
    b = io.BytesIO(); im.save(b, "PNG", optimize=True)
    arte[nome] = "data:image/png;base64," + base64.b64encode(b.getvalue()).decode()
ppm = {nome: PPM for nome in pecas}
with open(os.path.join(AQUI, "arte.js"), "w", encoding="utf-8") as f:
    f.write("// Gerado por gerar.py. Arte final em teste (Nano Banana), ícones ainda da pixel art.\n")
    f.write("window.ARTE = " + json.dumps(arte, indent=0) + ";\n")
    f.write("window.ARTE_PPM = " + json.dumps(ppm) + ";\n")
print({k: v.size for k, v in pecas.items()}, sorted(arte))
