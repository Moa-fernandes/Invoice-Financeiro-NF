from pydantic import BaseModel
from typing import Optional

class RecebimentoNF(BaseModel):
    nota_fiscal_id: str  
    data_recebimento: str  
    valor_recebido: float
    forma_pagamento: str
    observacoes: Optional[str] = None
