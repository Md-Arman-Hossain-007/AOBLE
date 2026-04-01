from elasticsearch import Elasticsearch
from ..core.config import settings

es_client = Elasticsearch(
    settings.ELASTICSEARCH_URL,
    # Add retry logic and timeouts for production resilience
    retry_on_timeout=True,
    max_retries=3
)

def get_es_client():
    return es_client
