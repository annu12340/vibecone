"""
InLegalBERT Integration Service
Uses law-ai/InLegalBERT model for finding similar cases and related laws
"""

import logging
from typing import List, Dict, Any, Optional
import numpy as np
from functools import lru_cache

logger = logging.getLogger(__name__)

# Try to import transformers
try:
    from transformers import AutoTokenizer, AutoModel
    import torch
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    logger.warning("Transformers not available. Install with: pip install transformers torch")


class InLegalBERTService:
    """Service for using InLegalBERT model to find similar cases and laws"""
    
    def __init__(self):
        self.model_name = "law-ai/InLegalBERT"
        self.model = None
        self.tokenizer = None
        self.device = None
        
        if TRANSFORMERS_AVAILABLE:
            self._initialize_model()
        else:
            logger.warning("InLegalBERT service initialized without transformers library")
    
    def _initialize_model(self):
        """Initialize the InLegalBERT model"""
        try:
            logger.info(f"Loading InLegalBERT model: {self.model_name}")
            
            # Set device
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            logger.info(f"Using device: {self.device}")
            
            # Load tokenizer and model
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModel.from_pretrained(self.model_name)
            self.model.to(self.device)
            self.model.eval()
            
            logger.info("InLegalBERT model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading InLegalBERT model: {str(e)}")
            self.model = None
            self.tokenizer = None
    
    def is_available(self) -> bool:
        """Check if the service is available"""
        return TRANSFORMERS_AVAILABLE and self.model is not None and self.tokenizer is not None
    
    def get_embedding(self, text: str) -> Optional[np.ndarray]:
        """
        Get BERT embedding for a text
        
        Args:
            text: Input text to encode
            
        Returns:
            Numpy array of embeddings or None if service unavailable
        """
        if not self.is_available():
            return None
        
        try:
            # Truncate text if too long (BERT has max 512 tokens)
            text = text[:2000]  # Rough approximation
            
            # Tokenize
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                max_length=512,
                padding=True
            )
            
            # Move to device
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Get embeddings
            with torch.no_grad():
                outputs = self.model(**inputs)
                # Use [CLS] token embedding as sentence representation
                embedding = outputs.last_hidden_state[:, 0, :].cpu().numpy()
            
            return embedding[0]  # Return first (and only) embedding
            
        except Exception as e:
            logger.error(f"Error getting embedding: {str(e)}")
            return None
    
    def cosine_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Calculate cosine similarity between two embeddings"""
        try:
            # Normalize embeddings
            norm1 = np.linalg.norm(embedding1)
            norm2 = np.linalg.norm(embedding2)
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
            
            # Calculate cosine similarity
            similarity = np.dot(embedding1, embedding2) / (norm1 * norm2)
            return float(similarity)
            
        except Exception as e:
            logger.error(f"Error calculating similarity: {str(e)}")
            return 0.0
    
    def find_similar_cases(
        self,
        query_text: str,
        case_database: List[Dict[str, Any]],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Find similar cases using semantic similarity
        
        Args:
            query_text: Case description to search for
            case_database: List of cases with 'description' or 'text' field
            top_k: Number of top similar cases to return
            
        Returns:
            List of similar cases with similarity scores
        """
        if not self.is_available():
            logger.warning("InLegalBERT not available, returning empty results")
            return []
        
        try:
            # Get query embedding
            query_embedding = self.get_embedding(query_text)
            if query_embedding is None:
                return []
            
            # Calculate similarities for all cases
            similarities = []
            for case in case_database:
                case_text = case.get('description') or case.get('text') or case.get('summary', '')
                if not case_text:
                    continue
                
                case_embedding = self.get_embedding(case_text)
                if case_embedding is None:
                    continue
                
                similarity = self.cosine_similarity(query_embedding, case_embedding)
                
                similarities.append({
                    'case': case,
                    'similarity': similarity
                })
            
            # Sort by similarity and return top k
            similarities.sort(key=lambda x: x['similarity'], reverse=True)
            top_cases = similarities[:top_k]
            
            # Format results
            results = []
            for item in top_cases:
                result = item['case'].copy()
                result['similarity_score'] = round(item['similarity'], 4)
                results.append(result)
            
            logger.info(f"Found {len(results)} similar cases")
            return results
            
        except Exception as e:
            logger.error(f"Error finding similar cases: {str(e)}")
            return []
    
    def find_related_laws(
        self,
        query_text: str,
        laws_database: List[Dict[str, Any]],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Find related laws using semantic similarity
        
        Args:
            query_text: Case description or legal query
            laws_database: List of laws with 'description' or 'text' field
            top_k: Number of top related laws to return
            
        Returns:
            List of related laws with similarity scores
        """
        if not self.is_available():
            logger.warning("InLegalBERT not available, returning empty results")
            return []
        
        try:
            # Get query embedding
            query_embedding = self.get_embedding(query_text)
            if query_embedding is None:
                return []
            
            # Calculate similarities for all laws
            similarities = []
            for law in laws_database:
                law_text = law.get('description') or law.get('text') or law.get('provision', '')
                if not law_text:
                    continue
                
                law_embedding = self.get_embedding(law_text)
                if law_embedding is None:
                    continue
                
                similarity = self.cosine_similarity(query_embedding, law_embedding)
                
                similarities.append({
                    'law': law,
                    'similarity': similarity
                })
            
            # Sort by similarity and return top k
            similarities.sort(key=lambda x: x['similarity'], reverse=True)
            top_laws = similarities[:top_k]
            
            # Format results
            results = []
            for item in top_laws:
                result = item['law'].copy()
                result['similarity_score'] = round(item['similarity'], 4)
                results.append(result)
            
            logger.info(f"Found {len(results)} related laws")
            return results
            
        except Exception as e:
            logger.error(f"Error finding related laws: {str(e)}")
            return []
    
    def analyze_legal_document(self, document_text: str) -> Dict[str, Any]:
        """
        Analyze a legal document and extract key information
        
        Args:
            document_text: Full text of legal document
            
        Returns:
            Dictionary with analysis results
        """
        if not self.is_available():
            return {
                "error": "InLegalBERT service not available",
                "embedding_available": False
            }
        
        try:
            # Get embedding
            embedding = self.get_embedding(document_text)
            
            if embedding is None:
                return {
                    "error": "Failed to generate embedding",
                    "embedding_available": False
                }
            
            # Get embedding statistics
            embedding_norm = float(np.linalg.norm(embedding))
            embedding_mean = float(np.mean(embedding))
            embedding_std = float(np.std(embedding))
            
            return {
                "embedding_available": True,
                "embedding_dimension": len(embedding),
                "embedding_norm": embedding_norm,
                "embedding_mean": embedding_mean,
                "embedding_std": embedding_std,
                "document_length": len(document_text),
                "model": self.model_name
            }
            
        except Exception as e:
            logger.error(f"Error analyzing document: {str(e)}")
            return {
                "error": str(e),
                "embedding_available": False
            }


# Create singleton instance
inlegal_bert_service = InLegalBERTService()


def get_similar_cases_with_bert(case_description: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Helper function to find similar cases using InLegalBERT
    
    Args:
        case_description: Description of the case to search for
        limit: Number of similar cases to return
        
    Returns:
        List of similar cases with similarity scores
    """
    # This will be integrated with actual case database
    # For now, returns empty list or mocked data
    
    if not inlegal_bert_service.is_available():
        logger.warning("InLegalBERT not available for similar case search")
        return []
    
    # TODO: Integrate with actual case database from MongoDB
    # For now, return empty list
    return []


def get_related_laws_with_bert(case_description: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Helper function to find related laws using InLegalBERT
    
    Args:
        case_description: Description of the case or legal query
        limit: Number of related laws to return
        
    Returns:
        List of related laws with similarity scores
    """
    # This will be integrated with actual laws database
    # For now, returns empty list or mocked data
    
    if not inlegal_bert_service.is_available():
        logger.warning("InLegalBERT not available for related laws search")
        return []
    
    # TODO: Integrate with actual laws database from MongoDB
    # For now, return empty list
    return []
