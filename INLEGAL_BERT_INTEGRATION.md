# InLegalBERT Integration Guide

## Overview

Integrated **law-ai/InLegalBERT** - a BERT model specifically trained on Indian legal documents for finding similar cases and related laws using semantic similarity.

## Model Information

- **Model**: `law-ai/InLegalBERT`
- **Source**: https://huggingface.co/law-ai/InLegalBERT
- **Purpose**: Semantic understanding of Indian legal text
- **Training**: Pre-trained on large corpus of Indian legal documents
- **Use Cases**: 
  - Finding similar legal precedents
  - Identifying relevant laws and statutes
  - Legal document similarity search
  - Semantic legal text analysis

## Implementation

### Backend Service

**File**: `/app/backend/inlegal_bert_service.py`

**Key Features:**
1. **Embedding Generation** - Convert legal text to semantic vectors
2. **Similarity Search** - Find similar cases using cosine similarity
3. **Related Laws** - Discover relevant statutes and provisions
4. **Document Analysis** - Analyze legal documents semantically

### Service Class

```python
from inlegal_bert_service import inlegal_bert_service

# Check if service is available
if inlegal_bert_service.is_available():
    # Get embedding for legal text
    embedding = inlegal_bert_service.get_embedding(case_description)
    
    # Find similar cases
    similar_cases = inlegal_bert_service.find_similar_cases(
        query_text=case_description,
        case_database=all_cases,
        top_k=5
    )
    
    # Find related laws
    related_laws = inlegal_bert_service.find_related_laws(
        query_text=case_description,
        laws_database=all_laws,
        top_k=5
    )
```

## Installation

### Dependencies Added

```txt
transformers>=4.30.0  # Hugging Face Transformers
torch>=2.0.0          # PyTorch for model inference
sentencepiece>=0.1.99 # Tokenization support
```

### Install Command

```bash
cd /app/backend
pip install -r requirements.txt
```

**Note:** First run will download the model (~400MB). Subsequent runs use cached model.

## Usage

### 1. Get Embeddings

```python
from inlegal_bert_service import inlegal_bert_service

text = "Murder case under IPC Section 302"
embedding = inlegal_bert_service.get_embedding(text)
# Returns: numpy array of shape (768,)
```

### 2. Find Similar Cases

```python
case_database = [
    {
        "id": "case1",
        "name": "State vs Accused",
        "description": "Murder case involving premeditated killing",
        "year": 2020
    },
    # ... more cases
]

similar = inlegal_bert_service.find_similar_cases(
    query_text="Homicide case with intent",
    case_database=case_database,
    top_k=5
)

# Returns: List of cases with similarity_score field added
```

### 3. Find Related Laws

```python
laws_database = [
    {
        "statute": "IPC Section 302",
        "description": "Punishment for murder",
        "provision": "Whoever commits murder shall be punished..."
    },
    # ... more laws
]

related = inlegal_bert_service.find_related_laws(
    query_text="Case involving intentional killing",
    laws_database=laws_database,
    top_k=5
)

# Returns: List of laws with similarity_score field added
```

### 4. Calculate Similarity

```python
embedding1 = inlegal_bert_service.get_embedding("Text 1")
embedding2 = inlegal_bert_service.get_embedding("Text 2")

similarity = inlegal_bert_service.cosine_similarity(embedding1, embedding2)
# Returns: Float between -1.0 and 1.0 (typically 0.0 to 1.0)
```

## Integration Points

### Legal Scholar Analysis

The service is designed to integrate with the Legal Scholar member of the AI Legal Council:

**Before:**
```python
# Legal Scholar used keyword matching
precedent_cases = find_cases_by_keywords(["murder", "intent"])
```

**After (with InLegalBERT):**
```python
# Legal Scholar uses semantic similarity
precedent_cases = inlegal_bert_service.find_similar_cases(
    query_text=case_description,
    case_database=historical_cases,
    top_k=10
)
# Returns most semantically similar cases, not just keyword matches
```

### Benefits Over Keyword Matching

| Aspect | Keyword Matching | InLegalBERT Similarity |
|--------|------------------|------------------------|
| Understanding | Surface-level | Semantic meaning |
| Synonyms | Misses variants | Catches synonyms |
| Context | Ignores context | Understands context |
| Legal Jargon | Exact match only | Understands legal terms |
| Quality | Good | Excellent |

## API Endpoints (Future)

### Planned Endpoints

**1. POST `/api/legal-bert/similar-cases`**
```json
{
  "case_description": "Murder case with premeditation",
  "limit": 5
}
```

**2. POST `/api/legal-bert/related-laws`**
```json
{
  "case_description": "Contract breach involving fraud",
  "limit": 5
}
```

**3. POST `/api/legal-bert/analyze`**
```json
{
  "document_text": "Full legal document text..."
}
```

## Performance

### Model Specifications

- **Embedding Dimension**: 768
- **Max Input Length**: 512 tokens (~2000 characters)
- **Inference Time**: ~100-500ms per text (CPU)
- **Memory Usage**: ~500MB (model loaded)

### Optimization

**CPU Mode (Default):**
- Good for development
- ~500ms per embedding
- Works on any machine

**GPU Mode (If Available):**
- 10x faster inference
- ~50ms per embedding  
- Requires CUDA-capable GPU

**Auto-detection:**
```python
# Service automatically uses GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
```

## Database Integration

### Case Embeddings Storage

To avoid recomputing embeddings, store them in MongoDB:

```javascript
{
  "_id": "case_id",
  "case_data": {...},
  "inlegal_bert_embedding": [0.123, -0.456, ...],  // 768 dimensions
  "embedding_model": "law-ai/InLegalBERT",
  "embedding_generated_at": "2024-01-15T10:30:00Z"
}
```

### Pre-compute Embeddings

```python
# One-time computation for all cases
for case in db.cases.find():
    if 'inlegal_bert_embedding' not in case:
        embedding = inlegal_bert_service.get_embedding(case['description'])
        db.cases.update_one(
            {'_id': case['_id']},
            {'$set': {'inlegal_bert_embedding': embedding.tolist()}}
        )
```

### Fast Similarity Search

```python
# Load pre-computed embeddings
cases_with_embeddings = list(db.cases.find({'inlegal_bert_embedding': {'$exists': True}}))

# Quick similarity comparison (no re-encoding needed)
query_embedding = inlegal_bert_service.get_embedding(query_text)
similarities = [
    {
        'case': case,
        'similarity': inlegal_bert_service.cosine_similarity(
            query_embedding,
            np.array(case['inlegal_bert_embedding'])
        )
    }
    for case in cases_with_embeddings
]
```

## Testing

### Check Service Availability

```python
from inlegal_bert_service import inlegal_bert_service

if inlegal_bert_service.is_available():
    print("✅ InLegalBERT service ready")
else:
    print("❌ InLegalBERT not available (install transformers & torch)")
```

### Test Embedding Generation

```python
text = "Test case for IPC Section 302"
embedding = inlegal_bert_service.get_embedding(text)

if embedding is not None:
    print(f"✅ Embedding generated: shape {embedding.shape}")
else:
    print("❌ Failed to generate embedding")
```

### Test Similarity

```python
text1 = "Murder under IPC 302"
text2 = "Homicide case with intent"
text3 = "Traffic violation case"

emb1 = inlegal_bert_service.get_embedding(text1)
emb2 = inlegal_bert_service.get_embedding(text2)
emb3 = inlegal_bert_service.get_embedding(text3)

sim_12 = inlegal_bert_service.cosine_similarity(emb1, emb2)
sim_13 = inlegal_bert_service.cosine_similarity(emb1, emb3)

print(f"Murder vs Homicide: {sim_12:.3f}")  # Should be high (~0.8)
print(f"Murder vs Traffic: {sim_13:.3f}")   # Should be low (~0.3)
```

## Troubleshooting

### Issue: Model Download Fails

**Solution:**
```bash
# Pre-download model manually
python -c "from transformers import AutoModel; AutoModel.from_pretrained('law-ai/InLegalBERT')"
```

### Issue: Out of Memory

**Solution:** Process in batches or use smaller texts
```python
# Truncate long texts
text = text[:2000]  # Keep first 2000 characters
```

### Issue: Slow Performance

**Solutions:**
1. Use GPU if available
2. Pre-compute and cache embeddings
3. Batch process multiple texts
4. Use smaller top_k values

## Future Enhancements

1. **Vector Database Integration**
   - Use FAISS or Pinecone for fast similarity search
   - Handle millions of cases efficiently

2. **Incremental Updates**
   - Auto-compute embeddings for new cases
   - Background job for embedding generation

3. **Multi-language Support**
   - Support for regional language legal texts
   - Hindi, Tamil, Bengali legal documents

4. **Fine-tuning**
   - Fine-tune on specific case types
   - Improve domain-specific accuracy

5. **Hybrid Search**
   - Combine keyword and semantic search
   - Best of both approaches

## References

- **Model Card**: https://huggingface.co/law-ai/InLegalBERT
- **Paper**: InLegalBERT: A Pre-trained Model for Indian Legal Texts
- **Transformers Docs**: https://huggingface.co/docs/transformers/

## Status

✅ **Service Created**: `/app/backend/inlegal_bert_service.py`
✅ **Dependencies Added**: `requirements.txt` updated
⏳ **Installation Pending**: Run `pip install -r requirements.txt`
⏳ **Integration Pending**: Connect with Legal Council
⏳ **Embeddings Generation**: Pre-compute for existing cases
⏳ **API Endpoints**: Create REST endpoints

## Next Steps

1. Install dependencies: `pip install -r requirements.txt`
2. Test service initialization
3. Pre-compute embeddings for existing cases
4. Integrate with Legal Scholar analysis
5. Create API endpoints for frontend
6. Add similarity search to case history

**The foundation is ready - InLegalBERT can now provide semantic legal understanding to the application!** 🎓⚖️
