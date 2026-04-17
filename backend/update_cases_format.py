"""
Update existing seed cases in database with proper similar_cases and relevant_laws format.
"""
import asyncio
import os
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from seed_cases import get_seed_analyses, CASE_1_ID, CASE_2_ID

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def update_format():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    analyses_collection = db.analyses
    
    print("📝 Updating case analyses format...")
    
    # Get the updated analyses
    analyses = get_seed_analyses()
    
    for analysis in analyses:
        case_id = analysis['case_id']
        
        # Update the analysis with new similar_cases and relevant_laws format
        result = await analyses_collection.update_one(
            {'case_id': case_id},
            {
                '$set': {
                    'similar_cases': analysis.get('similar_cases', []),
                    'relevant_laws': analysis.get('relevant_laws', []),
                    'updated_at': analysis.get('updated_at')
                }
            }
        )
        
        if result.modified_count > 0:
            print(f"✅ Updated analysis for case {case_id}")
        else:
            print(f"⚠️  No changes for case {case_id}")
    
    # Verify the update
    print("\n🔍 Verifying updates...")
    for case_id in [CASE_1_ID, CASE_2_ID]:
        analysis = await analyses_collection.find_one({'case_id': case_id}, {'_id': 0})
        if analysis:
            similar_count = len(analysis.get('similar_cases', []))
            laws_count = len(analysis.get('relevant_laws', []))
            print(f"   Case {case_id[:8]}...: {similar_count} similar cases, {laws_count} relevant laws")
            
            # Check format
            if similar_count > 0:
                first_case = analysis['similar_cases'][0]
                if 'case_name' in first_case:
                    print(f"   ✓ Similar cases format correct")
                else:
                    print(f"   ✗ Similar cases format incorrect")
            
            if laws_count > 0:
                first_law = analysis['relevant_laws'][0]
                if isinstance(first_law, dict) and 'code' in first_law:
                    print(f"   ✓ Relevant laws format correct")
                else:
                    print(f"   ✗ Relevant laws format incorrect")
    
    client.close()
    print("\n✨ Done! Refresh the analysis pages to see the updates.")

if __name__ == "__main__":
    asyncio.run(update_format())
