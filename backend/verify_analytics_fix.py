import sys
import os
from pprint import pprint

# Add backend to path
sys.path.append('/Users/md.armanhossain/Documents/Cellbunq/AMLtab/backend')

try:
    from app.services.analytics import AnalyticsService, InternalUserStats
    from app.schemas.analytics import UserActivityStats
    import pydantic
    
    print(f"Pydantic version: {pydantic.__version__}")
    
    # Check AnalyticsService location
    import app.services.analytics
    print(f"AnalyticsService file: {app.services.analytics.__file__}")
    
    # Check if InternalUserStats is recognized
    print(f"InternalUserStats: {InternalUserStats}")
    
    # Test UserActivityStats instantiation
    try:
        user_stats = InternalUserStats(
            total_users=7,
            active_users=1,
            screenings_per_user={'admin': 10},
            last_login_stats={},
            role_distribution={}
        )
        
        ua = UserActivityStats(
            active_user_rate=14.2,
            screenings_per_active_user=10.0,
            most_active_user=("admin", 10),
            user_retention=85.0
        )
        print("UserActivityStats instantiation SUCCESS")
    except Exception as ve:
        print(f"UserActivityStats instantiation FAILURE: {ve}")
        
except Exception as e:
    print(f"Import Error: {e}")
    import traceback
    traceback.print_exc()
