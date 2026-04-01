from sqlalchemy.orm import Session
from ..models.models import WebSearchResult
import datetime
import json
from typing import List, Dict

class WebSearchService:
    def search_and_archive(self, db: Session, query: str, entity_id: str = None) -> List[Dict]:
        """
        Simulates a web search, archives the results in PostgreSQL, and returns them.
        In production, this would call SerpAPI, Google Search API, etc.
        """
        # 1. Check if we have a recent cached result (last 24h)
        yesterday = datetime.datetime.utcnow() - datetime.timedelta(days=1)
        cached = db.query(WebSearchResult).filter(
            WebSearchResult.query == query,
            WebSearchResult.created_at >= yesterday
        ).first()
        
        if cached:
            return cached.results_json

        # 2. Simulate Web Search Response
        simulated_results = [
            {
                "title": f"News: {query} listed in recent compliance report",
                "link": f"https://example-compliance-news.com/report/{query.replace(' ', '-')}",
                "snippet": f"Recent findings suggest {query} has been mentioned in global KYC/AML databases..."
            },
            {
                "title": f"Official Records for {query}",
                "link": f"https://example-govt-records.gov/search?q={query.replace(' ', '+')}",
                "snippet": f"Public government filings related to {query} are available for review..."
            }
        ]

        # 3. Archive in DB
        new_result = WebSearchResult(
            query=query,
            entity_id=entity_id,
            results_json=simulated_results,
            provider="SimulatedProvider"
        )
        db.add(new_result)
        db.commit()
        
        return simulated_results

web_search_service = WebSearchService()
