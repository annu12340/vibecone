"""
Clean up cases - keep only 5 cases (3 completed + 2 pending)
"""
import asyncio
import os
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Cases to keep (3 completed + 2 pending)
CASES_TO_KEEP = [
    'b28d2e7f-2e5c-4b3f-af12-222222222222',  # Kavita Sharma - complete
    'a17c1f6e-1d4b-4a2e-9e01-111111111111',  # Arjun Deshpande - complete  
    '77948ddb-102c-4571-9e0c-aaaaaaaaaaaa',  # Theft Case Salem - complete
    '26b4e5c0-c52b-4514-b48e-0659cbbfb978',  # Rohit Kumar - pending
    '3ad053d3-3861-4d39-a0b8-c16d6a6f2a25',  # Rohit Kumar 2 - pending
]

async def cleanup():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    cases_collection = db.cases
    analyses_collection = db.analyses
    
    # Count before
    before_count = await cases_collection.count_documents({})
    print(f"📊 Cases before cleanup: {before_count}")
    
    # Delete cases not in keep list
    result = await cases_collection.delete_many({
        'id': {'$nin': CASES_TO_KEEP}
    })
    print(f"🗑️  Deleted {result.deleted_count} cases")
    
    # Delete orphaned analyses
    analyses_result = await analyses_collection.delete_many({
        'case_id': {'$nin': CASES_TO_KEEP}
    })
    print(f"🗑️  Deleted {analyses_result.deleted_count} orphaned analyses")
    
    # Count after
    after_count = await cases_collection.count_documents({})
    print(f"📊 Cases after cleanup: {after_count}")
    
    # Show remaining cases
    print("\n✅ Remaining cases:")
    async for case in cases_collection.find({}, {'_id': 0, 'id': 1, 'title': 1, 'status': 1}):
        print(f"   - {case['status']}: {case['title'][:60]}")
    
    client.close()
    print("\n✨ Cleanup complete!")

if __name__ == "__main__":
    asyncio.run(cleanup())
