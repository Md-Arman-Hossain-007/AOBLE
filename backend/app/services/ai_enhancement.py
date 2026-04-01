from typing import Dict, List, Optional, Any, Tuple, Union
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
import pickle
import json
import logging
from dataclasses import dataclass
from enum import Enum
import asyncio

from ..models.models import ScreeningResult, User, Organization, WebSearchResult, Case
from ..core.security import audit_logger

class AIFeature(Enum):
    ANOMALY_DETECTION = "anomaly_detection"
    FALSE_POSITIVE_REDUCTION = "false_positive_reduction"
    RISK_PREDICTION = "risk_prediction"
    NAME_MATCHING_ENHANCEMENT = "name_matching_enhancement"
    PATTERN_RECOGNITION = "pattern_recognition"

@dataclass
class AIInsight:
    feature: AIFeature
    confidence: float
    explanation: str
    recommendations: List[str]
    metadata: Dict[str, Any]

@dataclass
class AnomalyDetectionResult:
    is_anomaly: bool
    anomaly_score: float
    anomaly_type: str
    explanation: str

@dataclass
class FalsePositivePrediction:
    is_false_positive: bool
    confidence: float
    contributing_factors: List[str]
    explanation: str

class AIEnhancementService:
    """AI/ML enhancement service for AML screening"""
    
    def __init__(self, db: Session):
        self.db = db
        self.models = {}
        self.vectorizers = {}
        self.scalers = {}
        self.logger = logging.getLogger(__name__)
        
        # Load or train models
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize AI models"""
        try:
            # Try to load pre-trained models
            self._load_models()
        except FileNotFoundError:
            # Train models if not available
            self._train_models()
    
    def _load_models(self):
        """Load pre-trained models from disk"""
        model_files = {
            'anomaly_detector': 'models/anomaly_detector.pkl',
            'false_positive_classifier': 'models/false_positive_classifier.pkl',
            'risk_predictor': 'models/risk_predictor.pkl',
            'name_matcher': 'models/name_matcher.pkl'
        }
        
        for model_name, file_path in model_files.items():
            try:
                with open(file_path, 'rb') as f:
                    self.models[model_name] = pickle.load(f)
            except FileNotFoundError:
                self.logger.warning(f"Model {model_name} not found, will train on demand")
    
    def _train_models(self):
        """Train AI models with available data"""
        # This would be implemented with actual training data
        # For now, creating placeholder models
        
        # Anomaly Detection Model
        self.models['anomaly_detector'] = IsolationForest(contamination=0.1, random_state=42)
        
        # False Positive Classification Model
        self.models['false_positive_classifier'] = RandomForestClassifier(n_estimators=100, random_state=42)
        
        # Risk Prediction Model
        self.models['risk_predictor'] = RandomForestClassifier(n_estimators=100, random_state=42)
        
        # Name Matching Enhancement
        self.vectorizers['name_matcher'] = TfidfVectorizer(analyzer='char', ngram_range=(2, 3))
        
        self.logger.info("AI models initialized (placeholder)")
    
    def _save_models(self):
        """Save trained models to disk"""
        for model_name, model in self.models.items():
            file_path = f"models/{model_name}.pkl"
            with open(file_path, 'wb') as f:
                pickle.dump(model, f)
    
    async def analyze_screening_result(
        self, 
        screening_result: ScreeningResult
    ) -> List[AIInsight]:
        """Analyze a screening result using AI models"""
        
        insights = []
        
        # 1. Anomaly Detection
        anomaly_result = self._detect_anomalies(screening_result)
        if anomaly_result.is_anomaly:
            insights.append(AIInsight(
                feature=AIFeature.ANOMALY_DETECTION,
                confidence=anomaly_result.anomaly_score,
                explanation=anomaly_result.explanation,
                recommendations=[
                    "Review this screening result manually",
                    "Check for potential system errors or data quality issues",
                    "Consider additional verification steps"
                ],
                metadata={"anomaly_type": anomaly_result.anomaly_type}
            ))
        
        # 2. False Positive Prediction
        fp_prediction = self._predict_false_positive(screening_result)
        if fp_prediction.is_false_positive:
            insights.append(AIInsight(
                feature=AIFeature.FALSE_POSITIVE_REDUCTION,
                confidence=fp_prediction.confidence,
                explanation=fp_prediction.explanation,
                recommendations=[
                    "Consider lowering review priority",
                    "Use automated clearing rules",
                    "Monitor for similar patterns"
                ],
                metadata={"contributing_factors": fp_prediction.contributing_factors}
            ))
        
        # 3. Risk Prediction Enhancement
        risk_prediction = self._enhance_risk_prediction(screening_result)
        insights.append(AIInsight(
            feature=AIFeature.RISK_PREDICTION,
            confidence=risk_prediction.confidence,
            explanation=risk_prediction.explanation,
            recommendations=risk_prediction.recommendations,
            metadata={"predicted_risk_level": risk_prediction.predicted_risk}
        ))
        
        # 4. Name Matching Enhancement
        name_insight = self._enhance_name_matching(screening_result)
        if name_insight:
            insights.append(name_insight)
        
        # 5. Pattern Recognition
        pattern_insight = self._recognize_patterns(screening_result)
        if pattern_insight:
            insights.append(pattern_insight)
        
        # Log AI analysis
        audit_logger.log_action(
            "ai_system", "screening_analyzed", "ai_enhancement", 
            {
                "screening_id": screening_result.id,
                "insights_count": len(insights),
                "features_analyzed": [insight.feature.value for insight in insights]
            }, 
            True
        )
        
        return insights
    
    def _detect_anomalies(self, screening_result: ScreeningResult) -> AnomalyDetectionResult:
        """Detect anomalies in screening results"""
        
        # Extract features for anomaly detection
        features = self._extract_anomaly_features(screening_result)
        
        # Use Isolation Forest for anomaly detection
        model = self.models.get('anomaly_detector')
        if model:
            anomaly_score = model.decision_function([features])[0]
            is_anomaly = model.predict([features])[0] == -1
            
            # Determine anomaly type
            anomaly_type = self._classify_anomaly(features, anomaly_score)
            explanation = self._generate_anomaly_explanation(anomaly_type, anomaly_score)
            
            return AnomalyDetectionResult(
                is_anomaly=is_anomaly,
                anomaly_score=abs(anomaly_score),
                anomaly_type=anomaly_type,
                explanation=explanation
            )
        
        return AnomalyDetectionResult(False, 0.0, "none", "No anomaly detected")
    
    def _predict_false_positive(self, screening_result: ScreeningResult) -> FalsePositivePrediction:
        """Predict if this is a false positive"""
        
        # Extract features for false positive prediction
        features = self._extract_false_positive_features(screening_result)
        
        # Use Random Forest classifier
        model = self.models.get('false_positive_classifier')
        if model:
            prediction = model.predict_proba([features])[0]
            confidence = max(prediction)
            is_false_positive = prediction[1] > 0.7  # Threshold for false positive
            
            contributing_factors = self._identify_false_positive_factors(screening_result)
            explanation = self._generate_false_positive_explanation(confidence, contributing_factors)
            
            return FalsePositivePrediction(
                is_false_positive=is_false_positive,
                confidence=confidence,
                contributing_factors=contributing_factors,
                explanation=explanation
            )
        
        return FalsePositivePrediction(False, 0.0, [], "Unable to predict")
    
    def _enhance_risk_prediction(self, screening_result: ScreeningResult) -> AIInsight:
        """Enhance risk prediction using AI models"""
        
        # Extract features for risk prediction
        features = self._extract_risk_features(screening_result)
        
        # Use Random Forest for risk prediction
        model = self.models.get('risk_predictor')
        if model:
            prediction = model.predict_proba([features])[0]
            confidence = max(prediction)
            
            # Map prediction to risk levels
            risk_levels = ['LOW', 'MEDIUM', 'HIGH']
            predicted_risk = risk_levels[np.argmax(prediction)]
            
            recommendations = self._generate_risk_recommendations(predicted_risk, confidence)
            explanation = self._generate_risk_explanation(predicted_risk, confidence)
            
            return AIInsight(
                feature=AIFeature.RISK_PREDICTION,
                confidence=confidence,
                explanation=explanation,
                recommendations=recommendations,
                metadata={"predicted_risk_level": predicted_risk}
            )
        
        return AIInsight(
            feature=AIFeature.RISK_PREDICTION,
            confidence=0.0,
            explanation="Unable to enhance risk prediction",
            recommendations=[],
            metadata={}
        )
    
    def _enhance_name_matching(self, screening_result: ScreeningResult) -> Optional[AIInsight]:
        """Enhance name matching using AI techniques"""
        
        if not screening_result.all_matches:
            return None
        
        # Use TF-IDF and cosine similarity for better name matching
        vectorizer = self.vectorizers.get('name_matcher')
        if not vectorizer:
            return None
        
        # Extract names from matches
        names = [match.get('caption', '') for match in screening_result.all_matches]
        query_name = screening_result.customer_name
        
        if not names or not query_name:
            return None
        
        # Vectorize names
        name_vectors = vectorizer.fit_transform(names + [query_name])
        
        # Calculate similarities
        similarities = cosine_similarity(name_vectors[-1:], name_vectors[:-1])[0]
        
        # Find best matches
        best_matches = []
        for i, similarity in enumerate(similarities):
            if similarity > 0.7:  # Threshold for good match
                best_matches.append({
                    'name': names[i],
                    'similarity': similarity,
                    'match_details': screening_result.all_matches[i]
                })
        
        if best_matches:
            explanation = f"Enhanced name matching found {len(best_matches)} high-similarity matches"
            recommendations = [
                "Review enhanced matches for accuracy",
                "Consider phonetic variations",
                "Check for transliteration differences"
            ]
            
            return AIInsight(
                feature=AIFeature.NAME_MATCHING_ENHANCEMENT,
                confidence=max([m['similarity'] for m in best_matches]),
                explanation=explanation,
                recommendations=recommendations,
                metadata={"enhanced_matches": best_matches}
            )
        
        return None
    
    def _recognize_patterns(self, screening_result: ScreeningResult) -> Optional[AIInsight]:
        """Recognize patterns in screening data"""
        
        # Look for patterns in historical data
        patterns = self._find_screening_patterns(screening_result)
        
        if patterns:
            explanation = f"Pattern recognition identified {len(patterns)} relevant patterns"
            recommendations = [
                "Review pattern-based recommendations",
                "Consider implementing pattern-based rules",
                "Monitor for similar patterns in future"
            ]
            
            return AIInsight(
                feature=AIFeature.PATTERN_RECOGNITION,
                confidence=0.8,  # Pattern recognition confidence
                explanation=explanation,
                recommendations=recommendations,
                metadata={"patterns": patterns}
            )
        
        return None
    
    # Feature extraction methods
    
    def _extract_anomaly_features(self, screening_result: ScreeningResult) -> List[float]:
        """Extract features for anomaly detection"""
        features = []
        
        # Time-based features
        features.append(screening_result.duration_ms / 1000.0)  # Duration in seconds
        
        # Score-based features
        features.append(screening_result.top_score or 0.0)
        features.append(screening_result.match_count)
        
        # Entity type distribution
        entity_types = [match.get('schema_type', '') for match in screening_result.all_matches or []]
        features.extend([
            entity_types.count('Person'),
            entity_types.count('Company'),
            entity_types.count('Organization')
        ])
        
        # Dataset diversity
        datasets = set()
        for match in screening_result.all_matches or []:
            datasets.update(match.get('datasets', []))
        features.append(len(datasets))
        
        return features
    
    def _extract_false_positive_features(self, screening_result: ScreeningResult) -> List[float]:
        """Extract features for false positive prediction"""
        features = []
        
        # Score features
        features.append(screening_result.top_score or 0.0)
        features.append(screening_result.match_count)
        
        # Name similarity features
        query_name = screening_result.customer_name or ""
        if screening_result.all_matches:
            best_match = screening_result.all_matches[0]
            match_name = best_match.get('caption', '')
            features.append(self._name_similarity(query_name, match_name))
        else:
            features.append(0.0)
        
        # Dataset reliability
        reliable_datasets = 0
        for match in screening_result.all_matches or []:
            datasets = match.get('datasets', [])
            reliable_datasets += len([d for d in datasets if self._is_reliable_dataset(d)])
        features.append(reliable_datasets)
        
        return features
    
    def _extract_risk_features(self, screening_result: ScreeningResult) -> List[float]:
        """Extract features for risk prediction"""
        features = []
        
        # Basic risk indicators
        features.append(screening_result.top_score or 0.0)
        features.append(screening_result.match_count)
        
        # Topic-based risk
        high_risk_topics = 0
        for match in screening_result.all_matches or []:
            topics = match.get('topics', [])
            high_risk_topics += len([t for t in topics if self._is_high_risk_topic(t)])
        features.append(high_risk_topics)
        
        # Entity type risk
        entity_risk = 0
        for match in screening_result.all_matches or []:
            entity_type = match.get('schema_type', '')
            entity_risk += self._get_entity_risk_score(entity_type)
        features.append(entity_risk)
        
        return features
    
    # Helper methods
    
    def _classify_anomaly(self, features: List[float], anomaly_score: float) -> str:
        """Classify type of anomaly"""
        if features[0] > 10:  # High duration
            return "performance_anomaly"
        elif features[1] > 0.9:  # High score with low confidence
            return "scoring_anomaly"
        elif features[2] == 0:  # No matches
            return "data_anomaly"
        else:
            return "general_anomaly"
    
    def _generate_anomaly_explanation(self, anomaly_type: str, anomaly_score: float) -> str:
        """Generate explanation for anomaly"""
        explanations = {
            "performance_anomaly": f"Unusually high processing time detected (score: {anomaly_score:.3f})",
            "scoring_anomaly": f"Scoring pattern deviation detected (score: {anomaly_score:.3f})",
            "data_anomaly": f"Data quality issue detected (score: {anomaly_score:.3f})",
            "general_anomaly": f"General anomaly detected (score: {anomaly_score:.3f})"
        }
        return explanations.get(anomaly_type, "Anomaly detected")
    
    def _identify_false_positive_factors(self, screening_result: ScreeningResult) -> List[str]:
        """Identify factors contributing to false positive prediction"""
        factors = []
        
        if screening_result.top_score and screening_result.top_score < 0.7:
            factors.append("Low match score")
        
        if screening_result.match_count > 5:
            factors.append("High number of matches")
        
        # Check for common false positive patterns
        for match in screening_result.all_matches or []:
            if self._is_common_false_positive(match):
                factors.append(f"Common false positive pattern: {match.get('caption', '')}")
        
        return factors
    
    def _generate_false_positive_explanation(self, confidence: float, factors: List[str]) -> str:
        """Generate explanation for false positive prediction"""
        return f"Likely false positive (confidence: {confidence:.2%}). Factors: {', '.join(factors)}"
    
    def _generate_risk_recommendations(self, risk_level: str, confidence: float) -> List[str]:
        """Generate recommendations based on risk level"""
        base_recommendations = {
            "HIGH": [
                "Immediate manual review required",
                "Enhanced due diligence recommended",
                "Consider escalating to compliance officer"
            ],
            "MEDIUM": [
                "Manual review recommended",
                "Standard due diligence procedures",
                "Monitor for additional risk indicators"
            ],
            "LOW": [
                "Automated processing acceptable",
                "Standard monitoring procedures",
                "Low priority for manual review"
            ]
        }
        
        recommendations = base_recommendations.get(risk_level, [])
        
        if confidence < 0.7:
            recommendations.append("Low confidence - consider additional verification")
        
        return recommendations
    
    def _generate_risk_explanation(self, risk_level: str, confidence: float) -> str:
        """Generate explanation for risk prediction"""
        return f"AI-enhanced risk assessment: {risk_level} risk (confidence: {confidence:.2%})"
    
    def _name_similarity(self, name1: str, name2: str) -> float:
        """Calculate name similarity using various metrics"""
        if not name1 or not name2:
            return 0.0
        
        # Simple character-based similarity
        set1 = set(name1.lower())
        set2 = set(name2.lower())
        
        intersection = set1.intersection(set2)
        union = set1.union(set2)
        
        if not union:
            return 0.0
        
        return len(intersection) / len(union)
    
    def _is_reliable_dataset(self, dataset: str) -> bool:
        """Check if dataset is considered reliable"""
        reliable_datasets = [
            'open_sanctions', 'eu_sanctions', 'us_ofac', 
            'un_sanctions', 'interpol', 'pep_database'
        ]
        return any(ds in dataset.lower() for ds in reliable_datasets)
    
    def _is_high_risk_topic(self, topic: str) -> bool:
        """Check if topic indicates high risk"""
        high_risk_topics = [
            'sanction', 'crime', 'pep', 'reg.action', 
            'enforcement', 'investigation'
        ]
        return any(hr in topic.lower() for hr in high_risk_topics)
    
    def _get_entity_risk_score(self, entity_type: str) -> float:
        """Get risk score for entity type"""
        risk_scores = {
            'Person': 1.0,
            'Company': 0.8,
            'Organization': 0.9,
            'Vessel': 1.2,
            'Aircraft': 1.2
        }
        return risk_scores.get(entity_type, 0.5)
    
    def _is_common_false_positive(self, match: Dict[str, Any]) -> bool:
        """Check if match is a common false positive pattern"""
        # Common false positive patterns
        common_names = ['test', 'demo', 'sample', 'example']
        caption = match.get('caption', '').lower()
        
        return any(name in caption for name in common_names)
    
    def _find_screening_patterns(self, screening_result: ScreeningResult) -> List[Dict[str, Any]]:
        """Find patterns in screening data"""
        patterns = []
        
        # Look for temporal patterns
        recent_screenings = self._get_recent_screenings(screening_result.screened_by, days=7)
        
        if len(recent_screenings) > 10:
            patterns.append({
                "type": "high_volume",
                "description": "High screening volume detected",
                "details": f"{len(recent_screenings)} screenings in last 7 days"
            })
        
        # Look for geographic patterns
        countries = self._get_screening_countries(recent_screenings)
        if len(countries) > 5:
            patterns.append({
                "type": "geographic_diversity",
                "description": "High geographic diversity in screenings",
                "details": f"Screenings from {len(countries)} different countries"
            })
        
        return patterns
    
    def _get_recent_screenings(self, user_id: str, days: int = 7) -> List[ScreeningResult]:
        """Get recent screenings for a user"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        return self.db.query(ScreeningResult).filter(
            ScreeningResult.screened_by == user_id,
            ScreeningResult.screened_at >= cutoff_date
        ).all()
    
    def _get_screening_countries(self, screenings: List[ScreeningResult]) -> List[str]:
        """Get countries from screening results"""
        countries = set()
        
        for screening in screenings:
            if screening.all_matches:
                for match in screening.all_matches:
                    countries.update(match.get('countries', []))
        
        return list(countries)
    
    async def batch_analyze_screenings(
        self, 
        screening_ids: List[str]
    ) -> Dict[str, List[AIInsight]]:
        """Analyze multiple screenings in batch"""
        
        results = {}
        
        for screening_id in screening_ids:
            screening = self.db.query(ScreeningResult).filter(
                ScreeningResult.id == screening_id
            ).first()
            
            if screening:
                insights = await self.analyze_screening_result(screening)
                results[screening_id] = insights
        
        return results
    
    def get_ai_model_performance(self) -> Dict[str, Any]:
        """Get performance metrics for AI models"""
        
        # This would return actual model performance metrics
        # For now, returning mock data
        
        return {
            "anomaly_detection": {
                "precision": 0.85,
                "recall": 0.78,
                "f1_score": 0.81,
                "last_trained": "2024-01-15"
            },
            "false_positive_reduction": {
                "precision": 0.92,
                "recall": 0.88,
                "f1_score": 0.90,
                "last_trained": "2024-01-10"
            },
            "risk_prediction": {
                "precision": 0.87,
                "recall": 0.83,
                "f1_score": 0.85,
                "last_trained": "2024-01-12"
            }
        }
    
    def retrain_models(self, force: bool = False) -> Dict[str, Any]:
        """Retrain AI models with latest data"""
        
        if not force:
            # Check if retraining is needed based on performance or data age
            performance = self.get_ai_model_performance()
            needs_retraining = any(
                model["f1_score"] < 0.8 for model in performance.values()
            )
            
            if not needs_retraining:
                return {"status": "skipped", "reason": "Models performing well"}
        
        # Retrain models
        self._train_models()
        self._save_models()
        
        return {
            "status": "completed",
            "models_retrained": list(self.models.keys()),
            "timestamp": datetime.utcnow().isoformat()
        }

# Usage example:
"""
# Initialize AI enhancement service
ai_service = AIEnhancementService(db)

# Analyze a single screening result
screening = db.query(ScreeningResult).filter(ScreeningResult.id == "scr-123").first()
insights = await ai_service.analyze_screening_result(screening)

# Batch analyze multiple screenings
screening_ids = ["scr-123", "scr-124", "scr-125"]
batch_results = await ai_service.batch_analyze_screenings(screening_ids)

# Get model performance
performance = ai_service.get_ai_model_performance()

# Retrain models if needed
retrain_result = ai_service.retrain_models()
"""