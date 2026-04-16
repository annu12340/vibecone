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


async def get_similar_cases_with_bert(db, case_description: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Helper function to find similar cases using InLegalBERT
    
    Args:
        db: MongoDB database instance
        case_description: Description of the case to search for
        limit: Number of similar cases to return
        
    Returns:
        List of similar cases with similarity scores
    """
    if not inlegal_bert_service.is_available():
        logger.warning("InLegalBERT not available for similar case search")
        return []
    
    try:
        # Fetch all cases from MongoDB (excluding the _id field)
        cases = await db.cases.find({}, {"_id": 0}).to_list(1000)
        
        if not cases:
            logger.info("No cases found in database for similarity search")
            return []
        
        # Prepare case database for BERT service
        # Each case needs a text field for embedding
        case_database = []
        for case in cases:
            # Build searchable text from case data
            case_text_parts = []
            
            if case.get('title'):
                case_text_parts.append(f"Title: {case['title']}")
            if case.get('description'):
                case_text_parts.append(f"Description: {case['description']}")
            if case.get('case_type'):
                case_text_parts.append(f"Type: {case['case_type']}")
            if case.get('charges'):
                charges = ", ".join(case['charges'])
                case_text_parts.append(f"Charges: {charges}")
            
            # Add eCourts metadata if available
            ecourts = case.get('ecourts_metadata', {})
            if isinstance(ecourts, dict) and ecourts.get('acts_and_sections'):
                acts = ", ".join(ecourts['acts_and_sections'])
                case_text_parts.append(f"Acts: {acts}")
            
            case_text = " | ".join(case_text_parts)
            
            case_database.append({
                'id': case.get('id'),
                'title': case.get('title', 'Unknown'),
                'case_type': case.get('case_type', ''),
                'jurisdiction': case.get('jurisdiction', ''),
                'status': case.get('status', ''),
                'description': case.get('description', ''),
                'text': case_text,  # This is what BERT will use
            })
        
        logger.info(f"Searching {len(case_database)} cases for similarity to query")
        
        # Use BERT service to find similar cases
        similar_cases = inlegal_bert_service.find_similar_cases(
            query_text=case_description,
            case_database=case_database,
            top_k=limit
        )
        
        logger.info(f"Found {len(similar_cases)} similar cases")
        return similar_cases
        
    except Exception as e:
        logger.error(f"Error in get_similar_cases_with_bert: {str(e)}")
        return []


async def get_related_laws_with_bert(db, case_description: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Helper function to find related laws using InLegalBERT
    
    Args:
        db: MongoDB database instance
        case_description: Description of the case or legal query
        limit: Number of related laws to return
        
    Returns:
        List of related laws with similarity scores
    """
    if not inlegal_bert_service.is_available():
        logger.warning("InLegalBERT not available for related laws search")
        return []
    
    try:
        # Fetch all laws from MongoDB (excluding the _id field)
        laws = await db.laws.find({}, {"_id": 0}).to_list(200)
        
        if not laws:
            logger.info("No laws found in database for similarity search")
            return []
        
        # Prepare laws database for BERT service
        # Each law needs a text field for embedding
        laws_database = []
        for law in laws:
            # Build searchable text from law data
            law_text_parts = []
            
            if law.get('code'):
                law_text_parts.append(f"Code: {law['code']}")
            if law.get('title'):
                law_text_parts.append(f"Title: {law['title']}")
            if law.get('summary'):
                law_text_parts.append(f"Summary: {law['summary']}")
            if law.get('category'):
                law_text_parts.append(f"Category: {law['category']}")
            
            law_text = " | ".join(law_text_parts)
            
            laws_database.append({
                'id': law.get('id'),
                'code': law.get('code', ''),
                'title': law.get('title', ''),
                'category': law.get('category', ''),
                'summary': law.get('summary', ''),
                'max_penalty': law.get('max_penalty', ''),
                'text': law_text,  # This is what BERT will use
            })
        
        logger.info(f"Searching {len(laws_database)} laws for relevance to query")
        
        # Use BERT service to find related laws
        related_laws = inlegal_bert_service.find_related_laws(
            query_text=case_description,
            laws_database=laws_database,
            top_k=limit
        )
        
        logger.info(f"Found {len(related_laws)} related laws")
        return related_laws
        
    except Exception as e:
        logger.error(f"Error in get_related_laws_with_bert: {str(e)}")
        return []
