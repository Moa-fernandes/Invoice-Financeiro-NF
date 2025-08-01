from pydantic import BaseModel
from typing import Optional

class DividaObrigacao(BaseModel):
    id: Optional[str] = None   
    credor: str
    descricao: str
    data_vencimento: str       
    valor: float
    foi_pago: bool
