"""
Script to populate database with additional cases for map visualization.
Run with: python populate_map_data.py
"""
import asyncio
import os
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from seed_additional_cases import get_all_additional_cases, get_case_distribution

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def populate():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    cases_collection = db.cases
    
    # Get all additional cases
    additional_cases = get_all_additional_cases()
    
    print(f"📊 Preparing to add {len(additional_cases)} cases to database...")
    print("\n📍 State-wise distribution:")
    distribution = get_case_distribution()
    for state, count in sorted(distribution.items(), key=lambda x: x[1], reverse=True):
        print(f"   {state}: {count} cases")
    
    # Check existing cases
    existing_count = await cases_collection.count_documents({})
    print(f"\n📁 Current cases in database: {existing_count}")
    
    # Insert additional cases
    if additional_cases:
        try:
            result = await cases_collection.insert_many(additional_cases, ordered=False)
            print(f"\n✅ Successfully added {len(result.inserted_ids)} cases to database")
        except Exception as e:
            # Handle duplicate key errors gracefully
            if "duplicate key" in str(e):
                print(f"\n⚠️  Some cases already exist, skipping duplicates")
            else:
                print(f"\n❌ Error inserting cases: {e}")
    
    # Final count
    final_count = await cases_collection.count_documents({})
    print(f"📁 Total cases in database: {final_count}")
    
    # Show state-wise distribution from database
    print("\n🗺️  Map will now show cases from:")
    pipeline = [
        {
            "$group": {
                "_id": "$jurisdiction",
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    
    async for doc in cases_collection.aggregate(pipeline):
        print(f"   {doc['_id']}: {doc['count']} cases")
    
    client.close()
    print("\n✨ Done! Refresh the /map page to see updated data.")

if __name__ == "__main__":
    asyncio.run(populate())
