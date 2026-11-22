# -*- coding: utf-8 -*-
"""
Rascunho do Ferreiro de Cinzas (TASK-14) - script do Blender 5.x.

COMO RODAR
  No Blender: aba Scripting > abrir este arquivo > Run Script.
  Sem interface (exporta o .glb):
    blender -b --factory-startup --python prototipos/ferreiro-3d/rascunho_ferreiro.py -- --exportar src/apresentacao/arte/ferreiro.glb
  Sem "--exportar" o script só monta a cena.

ATENÇÃO: rodar de novo APAGA TUDO da cena (objetos, malhas, esqueletos,
animações e materiais), inclusive o trabalho feito à mão. Este script é só um
ponto de partida: depois de refinar o modelo, não rode de novo.

O QUE ELE FAZ
  Monta um corpo feio de propósito (blocos e cilindros), um esqueleto, a foice
  (mão direita do Ferreiro) e o martelo (mão esquerda) e as 15 animações da
  ficha (design_draft.md, "Ficha do modelo do Ferreiro"). Tudo no lugar: a
  `raiz` e o objeto do esqueleto nunca saem da origem.
  1 unidade = 1 m. Origem entre os pés, no chão. Olha para -Y (vista Front).
  O lado direito do Ferreiro é -X; o esquerdo é +X.
"""
import math
import sys

import bpy
import bmesh
from mathutils import Vector, Euler

# ---------------------------------------------------------------- limpeza

def limpar_cena():
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for colecao in (bpy.data.meshes, bpy.data.armatures, bpy.data.actions,
                    bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for item in list(colecao):
            colecao.remove(item)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)

# ---------------------------------------------------------------- materiais

def material(nome, cor):
    m = bpy.data.materials.new(nome)
    m.diffuse_color = cor
    m.use_nodes = True
    no = m.node_tree.nodes.get("Principled BSDF")
    if no:
        no.inputs["Base Color"].default_value = cor
        no.inputs["Roughness"].default_value = 0.8
    return m

# ---------------------------------------------------------------- formas

class Forma:
    """Acumula blocos e cilindros numa malha só, lembrando qual osso pesa cada vértice."""
    def __init__(self):
        self.bm = bmesh.new()
        self.grupos = {}     # nome do osso -> lista de índices de vértices

    def _fim(self, osso, verts, faces, mat):
        for f in faces:
            f.material_index = mat
        self.grupos.setdefault(osso, []).extend(v.index for v in verts)

    def caixa(self, osso, centro, tam, mat=0, rot=(0, 0, 0)):
        r = bmesh.ops.create_cube(self.bm, size=1.0)
        verts = r["verts"]
        bmesh.ops.scale(self.bm, vec=Vector(tam), verts=verts)
        bmesh.ops.rotate(self.bm, verts=verts, cent=(0, 0, 0),
                         matrix=Euler([math.radians(a) for a in rot]).to_matrix())
        bmesh.ops.translate(self.bm, vec=Vector(centro), verts=verts)
        self.bm.verts.index_update()
        faces = list({f for v in verts for f in v.link_faces})
        self._fim(osso, verts, faces, mat)

    def cilindro(self, osso, centro, raio, altura, mat=0, rot=(0, 0, 0), raio2=None):
        r = bmesh.ops.create_cone(self.bm, cap_ends=True, segments=10,
                                  radius1=raio, radius2=raio if raio2 is None else raio2,
                                  depth=altura)
        verts = r["verts"]
        bmesh.ops.rotate(self.bm, verts=verts, cent=(0, 0, 0),
                         matrix=Euler([math.radians(a) for a in rot]).to_matrix())
        bmesh.ops.translate(self.bm, vec=Vector(centro), verts=verts)
        self.bm.verts.index_update()
        faces = list({f for v in verts for f in v.link_faces})
        self._fim(osso, verts, faces, mat)

    def criar_objeto(self, nome, materiais):
        malha = bpy.data.meshes.new(nome)
        self.bm.to_mesh(malha)
        self.bm.free()
        for m in materiais:
            malha.materials.append(m)
        obj = bpy.data.objects.new(nome, malha)
        bpy.context.scene.collection.objects.link(obj)
        for osso, idx in self.grupos.items():
            obj.vertex_groups.new(name=osso).add(idx, 1.0, 'REPLACE')
        return obj

# ---------------------------------------------------------------- esqueleto
# (cabeça, cauda, pai) por osso. Lado D = direito do Ferreiro = -X.
def _lado(sufixo, sx):
    x = 0.45 * sx
    return {
        "braco_" + sufixo:    ((x, 0, 1.70), (x, 0, 1.28), "torso"),
        "antebraco_" + sufixo: ((x, 0, 1.28), (x, 0, 0.88), "braco_" + sufixo),
        "mao_" + sufixo:      ((x, 0, 0.88), (x, 0, 0.74), "antebraco_" + sufixo),
        "coxa_" + sufixo:     ((0.2 * sx, 0, 1.00), (0.2 * sx, 0, 0.52), "quadril"),
        "canela_" + sufixo:   ((0.2 * sx, 0, 0.52), (0.2 * sx, 0, 0.08), "coxa_" + sufixo),
    }

OSSOS = {
    "raiz":    ((0, 0, 0), (0, 0, 0.2), None),
    "quadril": ((0, 0, 1.00), (0, 0, 1.25), "raiz"),
    "torso":   ((0, 0, 1.25), (0, 0, 1.78), "quadril"),
    "cabeca":  ((0, 0, 1.78), (0, 0, 2.20), "torso"),
}
OSSOS.update(_lado("D", -1))
OSSOS.update(_lado("E", 1))
# Armas: osso `cabo_*` da arma sai da mão e desce até perto do chão (o cabo passa pela mão,
# a lâmina/cabeça fica na ponta de baixo). O osso "ponta_*" marca o fim da arma.
OSSOS["cabo_foice"] = ((-0.45, 0, 0.88), (-0.45, 0, 0.12), "mao_D")
OSSOS["ponta_foice"] = ((-0.45, 0, 0.12), (-0.45, 0, 0.04), "cabo_foice")
OSSOS["cabo_martelo"] = ((0.45, 0, 0.88), (0.45, 0, 0.12), "mao_E")
OSSOS["ponta_martelo"] = ((0.45, 0, 0.12), (0.45, 0, 0.04), "cabo_martelo")

# ---------------------------------------------------------------- modelagem

def montar_corpo(mats):
    f = Forma()
    f.caixa("quadril", (0, 0, 1.125), (0.52, 0.32, 0.26), 1)
    f.caixa("torso", (0, 0, 1.52), (0.72, 0.42, 0.52), 1)
    f.caixa("torso", (0, 0, 1.80), (0.90, 0.40, 0.10), 2)          # ombreira larga (linha dos ombros)
    f.caixa("cabeca", (0, -0.02, 2.00), (0.32, 0.32, 0.40), 0)
    f.caixa("cabeca", (0, -0.17, 2.04), (0.28, 0.03, 0.06), 3)     # fresta do elmo: mostra a frente
    for suf, sx in (("D", -1), ("E", 1)):
        x = 0.45 * sx
        f.cilindro("braco_" + suf, (x, 0, 1.49), 0.09, 0.42, 1)
        f.cilindro("antebraco_" + suf, (x, 0, 1.08), 0.08, 0.40, 0)
        f.caixa("mao_" + suf, (x, 0, 0.81), (0.14, 0.14, 0.14), 2)
        f.cilindro("coxa_" + suf, (0.2 * sx, 0, 0.76), 0.13, 0.48, 1)
        f.cilindro("canela_" + suf, (0.2 * sx, 0, 0.32), 0.10, 0.44, 1)
        f.caixa("canela_" + suf, (0.2 * sx, -0.08, 0.05), (0.22, 0.40, 0.10), 2)   # pé
    return f.criar_objeto("corpo", mats)

def montar_foice(mats):
    f = Forma()
    f.cilindro("cabo_foice", (-0.45, 0, 0.99), 0.03, 1.90, 2)
    f.caixa("cabo_foice", (-0.45, -0.35, 0.10), (0.05, 0.70, 0.12), 3)   # lâmina aponta para a frente (-Y)
    f.caixa("cabo_foice", (-0.45, -0.68, 0.17), (0.05, 0.10, 0.20), 3)   # ponta da lâmina
    return f.criar_objeto("foice", mats)

def montar_martelo(mats):
    f = Forma()
    f.cilindro("cabo_martelo", (0.45, 0, 0.99), 0.035, 1.90, 2)
    f.caixa("cabo_martelo", (0.45, 0, 0.12), (0.30, 0.22, 0.20), 3)      # cabeça do martelo
    return f.criar_objeto("martelo", mats)

def montar_esqueleto():
    arm = bpy.data.armatures.new("Ferreiro_esqueleto")
    obj = bpy.data.objects.new("Ferreiro", arm)
    bpy.context.scene.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode='EDIT')
    eb = {}
    for nome, (cab, cau, pai) in OSSOS.items():   # pais vêm antes dos filhos no dicionário
        b = arm.edit_bones.new(nome)
        b.head, b.tail, b.roll = Vector(cab), Vector(cau), 0.0
        if pai:
            b.parent = eb[pai]
        eb[nome] = b
    bpy.ops.object.mode_set(mode='OBJECT')
    return obj

def montar_modelo():
    mats = [material("pele_cinza", (0.45, 0.42, 0.40, 1)),
            material("roupa_escura", (0.18, 0.14, 0.12, 1)),
            material("madeira_couro", (0.35, 0.22, 0.12, 1)),
            material("metal", (0.55, 0.57, 0.60, 1))]
    esq = montar_esqueleto()
    for obj in (montar_corpo(mats), montar_foice(mats), montar_martelo(mats)):
        obj.parent = esq
        mod = obj.modifiers.new("Esqueleto", 'ARMATURE')
        mod.object = esq
    return esq

# ---------------------------------------------------------------- poses
# Rotações em graus (rx, ry, rz) no espaço local de cada osso, ordem 'XZY'.
# Braços: rx negativo = para a frente, rx positivo = para trás; rz positivo =
# para o lado direito do Ferreiro (-X) no braço D (negativo no braço E);
# ry gira o braço no plano horizontal (positivo = para o lado direito).
# Torso: rx positivo = inclina para a frente. Coxa: rx negativo = coxa à frente.
# Canela: rx positivo = dobra o joelho.
FPS = 24

GUARDA = {
    "braco_D": (-45, 0, 8), "antebraco_D": (0, 0, 0),
    "braco_E": (-45, 0, -8), "antebraco_E": (0, 0, 0),
    "torso": (0, 0, 0), "cabeca": (0, 0, 0), "quadril": (0, 0, 0),
    "coxa_D": (0, 0, 0), "canela_D": (0, 0, 0),
    "coxa_E": (0, 0, 0), "canela_E": (0, 0, 0),
}
AGACHA = {"coxa_D": (-55, 0, 0), "canela_D": (100, 0, 0),
          "coxa_E": (-55, 0, 0), "canela_E": (100, 0, 0), "torso": (20, 0, 0)}
G = {}  # pose de guarda sem alterações

# nome -> lista de (frame, {osso: (rx, ry, rz)}); o que não aparece fica na guarda.
ACOES = {
    "varredura_inicio": [(1, G), (10, {"braco_D": (-30, 100, 0), "braco_E": (35, 0, -20),
                                       "torso": (10, 0, 0)})],
    "varredura_meio": [(1, {"braco_D": (-30, 100, 0), "braco_E": (35, 0, -20), "torso": (10, 0, 0)}),
                       (6, {"braco_D": (-35, 20, 0), "braco_E": (35, 0, -20), "torso": (15, 0, 0)}),
                       (12, {"braco_D": (-35, -80, 0), "braco_E": (35, 0, -20), "torso": (15, 0, 0)})],
    "varredura_fim": [(1, {"braco_D": (-35, -80, 0), "braco_E": (35, 0, -20), "torso": (15, 0, 0)}),
                      (12, G)],
    "martelada_inicio": [(1, G), (10, {"braco_E": (-155, 0, -8), "braco_D": (-110, 0, 25),
                                       "torso": (-10, 0, 0)})],
    "martelada_meio": [(1, {"braco_E": (-155, 0, -8), "braco_D": (-110, 0, 25), "torso": (-10, 0, 0)}),
                       (5, {"braco_E": (-45, 0, -8), "braco_D": (-60, 0, 25), "torso": (35, 0, 0),
                            "coxa_D": (-30, 0, 0), "coxa_E": (-30, 0, 0),
                            "canela_D": (50, 0, 0), "canela_E": (50, 0, 0)})],
    "martelada_fim": [(1, {"braco_E": (-45, 0, -8), "braco_D": (-60, 0, 25), "torso": (35, 0, 0),
                           "coxa_D": (-30, 0, 0), "coxa_E": (-30, 0, 0),
                           "canela_D": (50, 0, 0), "canela_E": (50, 0, 0)}),
                      (14, G)],
    "pulo_inicio": [(1, G), (7, {**AGACHA, "braco_D": (25, 0, 10), "braco_E": (25, 0, -10)}),
                    (15, {"braco_D": (0, 0, 88), "braco_E": (0, 0, -88), "torso": (-5, 0, 0)})],
    "pulo_meio": [(1, {"braco_D": (0, 0, 88), "braco_E": (0, 0, -88), "torso": (-5, 0, 0)}),
                  (4, {**AGACHA, "coxa_D": (-65, 0, 0), "coxa_E": (-65, 0, 0), "torso": (30, 0, 0),
                       "braco_D": (-20, 0, 40), "braco_E": (-20, 0, -40)})],
    "pulo_fim": [(1, {**AGACHA, "coxa_D": (-65, 0, 0), "coxa_E": (-65, 0, 0), "torso": (30, 0, 0),
                      "braco_D": (-20, 0, 40), "braco_E": (-20, 0, -40)}),
                 (14, G)],
    "foice_alta_inicio": [(1, G), (10, {"braco_D": (80, 0, 0), "braco_E": (-60, 0, -8),
                                        "torso": (0, 30, 0)})],
    "foice_alta_meio": [(1, {"braco_D": (80, 0, 0), "braco_E": (-60, 0, -8), "torso": (0, 30, 0)}),
                        (4, {"braco_D": (-85, 70, 0), "braco_E": (-60, 0, -8), "torso": (0, 0, 0)}),
                        (10, {"braco_D": (-85, -60, 0), "braco_E": (-60, 0, -8), "torso": (0, -20, 0)})],
    "foice_alta_fim": [(1, {"braco_D": (-85, -60, 0), "braco_E": (-60, 0, -8), "torso": (0, -20, 0)}),
                       (12, G)],
    "andar": [(1, {"coxa_D": (-25, 0, 0), "coxa_E": (25, 0, 0), "canela_E": (30, 0, 0),
                   "torso": (3, 0, 0)}),
              (13, {"coxa_D": (25, 0, 0), "coxa_E": (-25, 0, 0), "canela_D": (30, 0, 0),
                    "torso": (3, 0, 0)}),
              (25, {"coxa_D": (-25, 0, 0), "coxa_E": (25, 0, 0), "canela_E": (30, 0, 0),
                    "torso": (3, 0, 0)})],
    "sprint": [(1, {"coxa_D": (-55, 0, 0), "coxa_E": (35, 0, 0), "canela_E": (80, 0, 0),
                    "torso": (30, 0, 0), "cabeca": (-15, 0, 0),
                    "braco_D": (-20, 0, 8), "braco_E": (30, 0, -8)}),
               (7, {"coxa_D": (35, 0, 0), "coxa_E": (-55, 0, 0), "canela_D": (80, 0, 0),
                    "torso": (30, 0, 0), "cabeca": (-15, 0, 0),
                    "braco_D": (30, 0, 8), "braco_E": (-20, 0, -8)}),
               (13, {"coxa_D": (-55, 0, 0), "coxa_E": (35, 0, 0), "canela_E": (80, 0, 0),
                     "torso": (30, 0, 0), "cabeca": (-15, 0, 0),
                     "braco_D": (-20, 0, 8), "braco_E": (30, 0, -8)})],
    "cansado": [(1, {"torso": (22, 0, 0), "cabeca": (25, 0, 0), "braco_D": (-5, 0, 6),
                     "braco_E": (-5, 0, -6), "coxa_D": (-8, 0, 0), "coxa_E": (-8, 0, 0),
                     "canela_D": (16, 0, 0), "canela_E": (16, 0, 0)}),
                (17, {"torso": (30, 0, 0), "cabeca": (30, 0, 0), "braco_D": (-8, 0, 8),
                      "braco_E": (-8, 0, -8), "coxa_D": (-12, 0, 0), "coxa_E": (-12, 0, 0),
                      "canela_D": (22, 0, 0), "canela_E": (22, 0, 0)}),
                (33, {"torso": (22, 0, 0), "cabeca": (25, 0, 0), "braco_D": (-5, 0, 6),
                      "braco_E": (-5, 0, -6), "coxa_D": (-8, 0, 0), "coxa_E": (-8, 0, 0),
                      "canela_D": (16, 0, 0), "canela_E": (16, 0, 0)})],
}
NOMES_ACOES = ["varredura_inicio", "varredura_meio", "varredura_fim",
               "martelada_inicio", "martelada_meio", "martelada_fim",
               "pulo_inicio", "pulo_meio", "pulo_fim",
               "foice_alta_inicio", "foice_alta_meio", "foice_alta_fim",
               "andar", "sprint", "cansado"]

def criar_acoes(esq):
    """Uma Action por entrada de ACOES; só rotações de ossos (nada de translação)."""
    esq.animation_data_create()
    for pb in esq.pose.bones:
        pb.rotation_mode = 'XZY'
    for nome in NOMES_ACOES:
        acao = bpy.data.actions.new(nome)
        acao.use_fake_user = True
        esq.animation_data.action = acao
        for frame, pose in ACOES[nome]:
            for osso, base in GUARDA.items():
                rx, ry, rz = pose.get(osso, base)
                pb = esq.pose.bones[osso]
                pb.rotation_euler = Euler((math.radians(rx), math.radians(ry), math.radians(rz)), 'XZY')
                pb.keyframe_insert("rotation_euler", frame=frame)
        # pernas do "pulo" etc. saem de GUARDA; ossos de arma e raiz ficam sem chave
    esq.animation_data.action = None

def exportar(caminho):
    bpy.ops.export_scene.gltf(
        filepath=caminho, export_format='GLB',
        export_animations=True, export_animation_mode='ACTIONS',
        export_force_sampling=False, export_optimize_animation_size=True,
        export_apply=False, export_yup=True, export_skins=True)

def principal():
    limpar_cena()
    esq = montar_modelo()
    criar_acoes(esq)
    bpy.context.scene.render.fps = FPS
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    if "--exportar" in args:
        exportar(args[args.index("--exportar") + 1])
    return esq

ferreiro = principal()
