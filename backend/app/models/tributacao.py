from pydantic import BaseModel
from typing import Optional
from datetime import date

class Tributacao(BaseModel):
    nota_fiscal_id: str   
    tipo: str
    percentual: float
    data: str  
    valor: Optional[float] = None
