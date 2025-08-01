from pydantic import BaseModel
from typing import Optional

class Despesa(BaseModel):
    id: Optional[str] = None   
    descricao: str
    categoria: str
    data_pagamento: str        
    valor: float
    observacoes: Optional[str] = None
