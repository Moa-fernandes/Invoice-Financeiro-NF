from fastapi import APIRouter, Body, HTTPException
from typing import List
from datetime import date
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

from app.models.nota_emitida import NotaEmitida
from app.models.recebimento_nf import RecebimentoNF
from app.models.despesa import Despesa
from app.models.divida import DividaObrigacao
from app.models.tributacao import Tributacao

import os

router = APIRouter()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
mongo_client = AsyncIOMotorClient(MONGO_URL)
db = mongo_client["recrinanceiro"]


def parse_id(doc):
    if not doc:
        return doc
    doc['id'] = str(doc.get('_id', doc.get('id')))
    doc.pop('_id', None)
    return doc


# ---------- HOME ----------
@router.get("/")
async def root():
    return {"message": "Bem-vindo à API do Recrinanceiro (MongoDB)"}


# ---------- NOTAS EMITIDAS ----------
@router.get("/notas-emitidas")
async def listar_notas_emitidas():
    notas = []
    cursor = db.notas.find({})
    async for nota in cursor:
        nota = parse_id(nota)
        nota_id = nota.get('id')

        # Usar 0.0 como valor padrão
        valor = float(nota.get('valor') or 0)

        # Total recebido (todos os recebimentos para esta nota)
        recebimentos = await db.recebimentos.find({"nota_fiscal_id": nota_id}).to_list(length=100)
        valor_recebido = sum(float(r.get('valor_recebido') or 0) for r in recebimentos)

        # Total glosa (todos os registros de glosa para esta nota)
        glosas = await db.glosas.find({"nota_id": nota_id}).to_list(length=100)
        valor_glosa = sum(float(g.get('valor_glosa') or 0) for g in glosas)

        # Total tributado (todos os tributos para esta nota)
        tributos = await db.tributos.find({"nota_fiscal_id": nota_id}).to_list(length=100)
        valor_tributado = sum(float(t.get('valor') or 0) for t in tributos)

        # Valor pendente = valor da nota - tudo que já foi subtraído
        valor_pendente = valor - valor_recebido - valor_glosa - valor_tributado

        # Garantir que não fica negativo
        valor_pendente = max(valor_pendente, 0)

        nota['valor_recebido'] = valor_recebido
        nota['valor_glosa'] = valor_glosa
        nota['valor_tributado'] = valor_tributado
        nota['valor_pendente'] = valor_pendente

        notas.append(nota)
    return notas


@router.post("/notas-emitidas", response_model=NotaEmitida)
async def criar_nota_emitida(nota: NotaEmitida=Body(...)):
    doc = nota.dict()
    doc.pop("id", None)  # não salve id vindo do front!
    res = await db.notas.insert_one(doc)
    doc['id'] = str(res.inserted_id)
    await db.notas.update_one({'_id': res.inserted_id}, {'$set': {'id': doc['id']}})
    return parse_id(doc)


@router.put("/notas-emitidas/{id}", response_model=NotaEmitida)
async def editar_nota_emitida(id: str, nota: NotaEmitida=Body(...)):
    result = await db.notas.update_one({"_id": ObjectId(id)}, {"$set": nota.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Nota não encontrada.")
    doc = await db.notas.find_one({"_id": ObjectId(id)})
    return parse_id(doc)


@router.delete("/notas-emitidas/{id}")
async def deletar_nota_emitida(id: str):
    result = await db.notas.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 1:
        return {"message": "Nota excluída."}
    raise HTTPException(status_code=404, detail="Nota não encontrada.")


# ---------- RECEBIMENTOS DE NF ----------
@router.get("/recebimentos-nf")
async def listar_recebimentos_nf():
    receb = []
    cursor = db.recebimentos.find({})
    async for r in cursor:
        receb.append(parse_id(r))
    return receb


@router.post("/recebimentos-nf", response_model=RecebimentoNF)
async def criar_recebimento_nf(receb: RecebimentoNF=Body(...)):
    nota = await db.notas.find_one({"id": receb.nota_fiscal_id})
    if not nota:
        raise HTTPException(status_code=404, detail="Nota não encontrada.")

    # Validação extra no backend para evitar exceder o valor
    valor = float(nota.get("valor", 0))
    recebimentos = await db.recebimentos.find({"nota_fiscal_id": receb.nota_fiscal_id}).to_list(length=100)
    valor_recebido = sum(float(r.get('valor_recebido', 0)) for r in recebimentos)
    glosas = await db.glosas.find({"nota_id": receb.nota_fiscal_id}).to_list(length=100)
    valor_glosa = sum(float(g.get('valor_glosa', 0)) for g in glosas)
    tributos = await db.tributos.find({"nota_fiscal_id": receb.nota_fiscal_id}).to_list(length=100)
    valor_tributado = sum(float(t.get('valor', 0)) for t in tributos)
    valor_pendente = valor - valor_recebido - valor_glosa - valor_tributado

    if receb.valor_recebido > valor_pendente:
        raise HTTPException(status_code=400, detail="Valor excede o pendente da nota.")

    doc = receb.dict()
    res = await db.recebimentos.insert_one(doc)
    doc['_id'] = res.inserted_id
    return parse_id(doc)


@router.put("/recebimentos-nf/{id}", response_model=RecebimentoNF)
async def editar_recebimento_nf(id: str, receb: RecebimentoNF=Body(...)):
    result = await db.recebimentos.update_one({"_id": ObjectId(id)}, {"$set": receb.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Recebimento não encontrado.")
    doc = await db.recebimentos.find_one({"_id": ObjectId(id)})
    return parse_id(doc)


@router.delete("/recebimentos-nf/{id}")
async def deletar_recebimento_nf(id: str):
    result = await db.recebimentos.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 1:
        return {"message": "Recebimento excluído."}
    raise HTTPException(status_code=404, detail="Recebimento não encontrado.")


# ---------- DESPESAS ----------
@router.get("/despesas")
async def listar_despesas():
    despesas = []
    cursor = db.despesas.find({})
    async for desp in cursor:
        despesas.append(parse_id(desp))
    return despesas


@router.post("/despesas", response_model=Despesa)
async def criar_despesa(despesa: Despesa=Body(...)):
    doc = despesa.dict()
    doc.pop("id", None)  # Não envie id do frontend!
    res = await db.despesas.insert_one(doc)
    doc['id'] = str(res.inserted_id)
    await db.despesas.update_one({'_id': res.inserted_id}, {'$set': {'id': doc['id']}})
    return parse_id(doc)


@router.put("/despesas/{id}", response_model=Despesa)
async def editar_despesa(id: str, despesa: Despesa=Body(...)):
    result = await db.despesas.update_one({"_id": ObjectId(id)}, {"$set": despesa.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Despesa não encontrada.")
    doc = await db.despesas.find_one({"_id": ObjectId(id)})
    return parse_id(doc)


@router.delete("/despesas/{id}")
async def deletar_despesa(id: str):
    result = await db.despesas.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 1:
        return {"message": "Despesa excluída."}
    raise HTTPException(status_code=404, detail="Despesa não encontrada.")


# ---------- DIVIDAS / OBRIGAÇÕES ----------
@router.get("/dividas-obrigacoes")
async def listar_dividas():
    dividas = []
    cursor = db.dividas.find({})
    async for d in cursor:
        dividas.append(parse_id(d))
    return dividas


@router.post("/dividas-obrigacoes", response_model=DividaObrigacao)
async def criar_divida(divida: DividaObrigacao=Body(...)):
    doc = divida.dict()
    doc.pop("id", None)  # não salva id do front!
    res = await db.dividas.insert_one(doc)
    doc['id'] = str(res.inserted_id)
    await db.dividas.update_one({'_id': res.inserted_id}, {'$set': {'id': doc['id']}})
    return parse_id(doc)


@router.put("/dividas-obrigacoes/{id}", response_model=DividaObrigacao)
async def editar_divida(id: str, divida: DividaObrigacao=Body(...)):
    result = await db.dividas.update_one({"_id": ObjectId(id)}, {"$set": divida.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Dívida não encontrada.")
    doc = await db.dividas.find_one({"_id": ObjectId(id)})
    return parse_id(doc)


@router.delete("/dividas-obrigacoes/{id}")
async def deletar_divida(id: str):
    result = await db.dividas.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 1:
        return {"message": "Dívida excluída."}
    raise HTTPException(status_code=404, detail="Dívida não encontrada.")


# ---------- GLOSAS ----------
@router.get("/glosas")
async def listar_glosas():
    glosas = []
    cursor = db.glosas.find({})
    async for g in cursor:
        glosas.append(parse_id(g))
    return glosas


@router.post("/glosas")
async def criar_glosa(dados=Body(...)):
    res = await db.glosas.insert_one(dados)
    doc = await db.glosas.find_one({"_id": res.inserted_id})
    return parse_id(doc)


@router.delete("/glosas/{id}")
async def deletar_glosa(id: str):
    result = await db.glosas.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 1:
        return {"message": "Glosa excluída."}
    raise HTTPException(status_code=404, detail="Glosa não encontrada.")


# ---------- TRIBUTAÇÕES ----------
@router.get("/tributacoes")
async def listar_tributacoes():
    tributos = []
    cursor = db.tributos.find({})
    async for t in cursor:
        tributos.append(parse_id(t))
    return tributos


@router.post("/tributacoes", response_model=Tributacao)
async def criar_tributacao(tributo: Tributacao=Body(...)):
    # Busca sempre pelo campo id (string!) criado no passo anterior
    nota = await db.notas.find_one({"id": tributo.nota_fiscal_id})
    if not nota:
        raise HTTPException(status_code=404, detail="Nota não encontrada.")

    valor_total = float(nota.get("valor", 0))

    recebimentos = await db.recebimentos.find({"nota_fiscal_id": tributo.nota_fiscal_id}).to_list(length=100)
    valor_recebido = sum(float(r.get('valor_recebido', 0)) for r in recebimentos)

    glosas = await db.glosas.find({"nota_id": tributo.nota_fiscal_id}).to_list(length=100)
    valor_glosa = sum(float(g.get('valor_glosa', 0)) for g in glosas)

    tributos_aplicados = await db.tributos.find({"nota_fiscal_id": tributo.nota_fiscal_id}).to_list(length=100)
    valor_tributado = sum(float(t.get('valor', 0)) for t in tributos_aplicados)

    valor_pendente = valor_total - valor_recebido - valor_glosa - valor_tributado
    valor_pendente = max(valor_pendente, 0)

    valor_tributo = round(valor_pendente * (tributo.percentual / 100), 2)
    tributo_dict = tributo.dict()
    tributo_dict["valor"] = valor_tributo

    res = await db.tributos.insert_one(tributo_dict)
    doc = await db.tributos.find_one({"_id": res.inserted_id})
    return parse_id(doc)


@router.delete("/tributacoes/{id}")
async def deletar_tributacao(id: str):
    result = await db.tributos.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 1:
        return {"message": "Tributação excluída."}
    raise HTTPException(status_code=404, detail="Tributação não encontrada.")
