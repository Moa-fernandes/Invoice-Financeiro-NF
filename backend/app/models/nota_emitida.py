from pydantic import BaseModel, Field
from typing import Optional

class NotaEmitida(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")  # Aceita _id do Mongo, mas expõe como "id" para o Front
    numero_nf: str
    data_real: str
    data_emissao: str
    valor: float
    paciente: str
    servico: str
    observacoes: Optional[str] = None

    class Config:
        allow_population_by_field_name = True  # Permite tanto "id" quanto "_id" (usado pelo FastAPI/Mongo)
        arbitrary_types_allowed = True
