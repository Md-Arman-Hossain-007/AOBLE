"""
Stats API Verification Script
Compares API response with direct database queries to ensure accuracy
"""
import requests
import psycopg2
import json
from datetime import datetime, timedelta

# Configuration
API_URL = "http://localhost:8000/api"
DB_CONFIG = {
    "dbname": "aml_db",  # Update with your DB name
    "user": "postgres",
    "password": "postgres",
    "host": "localhost",
    "port": "5432"
}
AUTH_TOKEN = "your_token_here"  # Update with your auth token

def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(**DB_CONFIG)

def verify_stats_api():
    """Verify stats API returns accurate data"""
    
    print("\n" + "="*70)
    print("Stats API Verification Script")
    print("="*70)
    
    # 1. Call the stats API
    print("\n1️⃣  Calling stats API...")
    try:
        response = requests.get(
            f"{API_URL}/stats",
            headers={"Authorization": f"Bearer {AUTH_TOKEN}"},
            params={"period": "30d"}
        )
        response.raise_for_status()
        api_data = response.json()
        print("✅ API call successful")
    except Exception as e:
        print(f"❌ API call failed: {e}")
        return
    
    # 2. Query database directly
    print("\n2️⃣  Querying database for verification...")
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get current month start
        now = datetime.utcnow()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Query 1: Individual screenings V1
        cur.execute("""
            SELECT COUNT(*)
            FROM screenings s
            JOIN users u ON u.username = s.user_id
            WHERE u.org_id = (
                SELECT org_id FROM users WHERE username = (
                    SELECT username FROM users WHERE username = (
                        SELECT current_user
                    )
                )
            )
            AND s.timestamp >= %s
            AND (s.company_name IS NULL OR s.company_name = '')
        """, (start_of_month,))
        v1_individual = cur.fetchone()[0]
        
        # Query 2: Individual screenings V2
        cur.execute("""
            SELECT COUNT(*)
            FROM screening_results sr
            JOIN users u ON u.username = sr.screened_by
            WHERE u.org_id = (
                SELECT org_id FROM users WHERE username = (
                    SELECT current_user
                )
            )
            AND sr.screened_at >= %s
            AND sr.schema_type = 'Person'
        """, (start_of_month,))
        v2_individual = cur.fetchone()[0]
        
        total_individual = v1_individual + v2_individual
        
        # Query 3: Entity screenings V1
        cur.execute("""
            SELECT COUNT(*)
            FROM screenings s
            JOIN users u ON u.username = s.user_id
            WHERE u.org_id = (
                SELECT org_id FROM users WHERE username = (
                    SELECT current_user
                )
            )
            AND s.timestamp >= %s
            AND s.company_name IS NOT NULL
            AND s.company_name != ''
        """, (start_of_month,))
        v1_entity = cur.fetchone()[0]
        
        # Query 4: Entity screenings V2
        cur.execute("""
            SELECT COUNT(*)
            FROM screening_results sr
            JOIN users u ON u.username = sr.screened_by
            WHERE u.org_id = (
                SELECT org_id FROM users WHERE username = (
                    SELECT current_user
                )
            )
            AND sr.screened_at >= %s
            AND sr.schema_type != 'Person'
        """, (start_of_month,))
        v2_entity = cur.fetchone()[0]
        
        total_entity = v1_entity + v2_entity
        
        # Query 5: Active monitoring
        cur.execute("""
            SELECT COUNT(*)
            FROM monitored_entities me
            JOIN users u ON u.username = me.user_id
            WHERE u.org_id = (
                SELECT org_id FROM users WHERE username = (
                    SELECT current_user
                )
            )
            AND me.status = 'active'
        """)
        total_monitoring = cur.fetchone()[0]
        
        # Query 6: Total OS entities
        cur.execute("""
            SELECT COUNT(*)
            FROM os_entities
            WHERE is_active = true
        """)
        total_os_entities = cur.fetchone()[0]
        
        # Query 7: Matches this month
        cur.execute("""
            SELECT COUNT(*)
            FROM screening_results sr
            JOIN users u ON u.username = sr.screened_by
            WHERE u.org_id = (
                SELECT org_id FROM users WHERE username = (
                    SELECT current_user
                )
            )
            AND sr.match_count > 0
            AND sr.screened_at >= %s
        """, (start_of_month,))
        total_matches = cur.fetchone()[0]
        
        cur.close()
        conn.close()
        
        print("✅ Database queries successful")
        
    except Exception as e:
        print(f"❌ Database query failed: {e}")
        return
    
    # 3. Compare results
    print("\n3️⃣  Comparing API response with database...")
    print("\n" + "-"*70)
    print(f"{'Metric':<45} {'API':<12} {'DB':<12} {'Match'}")
    print("-"*70)
    
    # Service summary comparison
    api_individual = next((s['count'] for s in api_data.get('service_summary', []) 
                           if 'Individuals' in s['name']), 0)
    print(f"{'Individual Screenings (Monthly)':<45} {api_individual:<12} {total_individual:<12} {'✅' if api_individual == total_individual else '❌'}")
    
    api_entity = next((s['count'] for s in api_data.get('service_summary', []) 
                       if 'Corporates' in s['name']), 0)
    print(f"{'Entity Screenings (Monthly)':<45} {api_entity:<12} {total_entity:<12} {'✅' if api_entity == total_entity else '❌'}")
    
    api_monitoring = next((s['count'] for s in api_data.get('service_summary', []) 
                           if 'Monitoring' in s['name']), 0)
    # Monitoring is split evenly, so we check total
    api_monitoring_total = api_monitoring * 2  # Since it's split in half
    print(f"{'Active Monitoring (Total)':<45} {api_monitoring_total:<12} {total_monitoring:<12} {'✅' if api_monitoring_total == total_monitoring else '⚠️'}")
    
    api_db_entities = api_data.get('database_names', 0)
    print(f"{'Database Entities':<45} {api_db_entities:<12} {total_os_entities:<12} {'✅' if api_db_entities == total_os_entities else '❌'}")
    
    api_matches = api_data.get('total_matches', 0)
    print(f"{'Matches This Month':<45} {api_matches:<12} {total_matches:<12} {'✅' if api_matches == total_matches else '❌'}")
    
    # Summary stats
    print("\n" + "-"*70)
    print("Summary Statistics:")
    print("-"*70)
    summary = api_data.get('summary', {})
    print(f"Total Screenings: {summary.get('total_screenings', 0)}")
    print(f"Total Rescreenings: {summary.get('total_rescreenings', 0)}")
    print(f"Total Billing: ${summary.get('total_billing', 0)}")
    print(f"Active Monitoring: {summary.get('total_active_monitoring', 0)}")
    print(f"Match Rate: {api_data.get('match_rate', 0)}%")
    
    # Breakdown charts
    print("\n" + "-"*70)
    print("Individual Breakdown (Last 6 Months):")
    print("-"*70)
    for item in api_data.get('breakdown_individual', []):
        print(f"  {item['label']:<10} New: {item['new']:>5}  Updated: {item['updated']:>5}  Removed: {item['removed']:>5}")
    
    print("\n" + "-"*70)
    print("Corporate Breakdown (Last 6 Months):")
    print("-"*70)
    for item in api_data.get('breakdown_corporate', []):
        print(f"  {item['label']:<10} New: {item['new']:>5}  Updated: {item['updated']:>5}  Removed: {item['removed']:>5}")
    
    print("\n" + "="*70)
    print("✅ Verification complete!")
    print("="*70)
    
    # Check for discrepancies
    if (api_individual == total_individual and 
        api_entity == total_entity and 
        api_db_entities == total_os_entities and
        api_matches == total_matches):
        print("\n🎉 All metrics match! API is returning accurate data.")
    else:
        print("\n⚠️  Some metrics don't match. Review the queries above.")

if __name__ == "__main__":
    print("\n⚠️  Before running this script:")
    print("   1. Update DB_CONFIG with your database credentials")
    print("   2. Update AUTH_TOKEN with your authentication token")
    print("   3. Ensure the backend server is running on port 8000")
    print("   4. Install required packages: pip install requests psycopg2-binary")
    
    confirm = input("\nHave you updated the configuration? (y/n): ").strip().lower()
    if confirm == 'y':
        verify_stats_api()
    else:
        print("\nPlease update the configuration and try again.")
