from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
import httpx
import json
import asyncio
from sqlalchemy.orm import Session
from dataclasses import dataclass
from enum import Enum

from ..models.models import User, Organization, Webhook, IntegrationConfig
from ..core.config import settings
from ..core.security import audit_logger

class IntegrationType(Enum):
    SALESFORCE = "salesforce"
    HUBSPOT = "hubspot"
    SLACK = "slack"
    MICROSOFT_TEAMS = "microsoft_teams"
    WEBHOOK = "webhook"
    SIEM = "siem"

class WebhookEventType(Enum):
    SCREENING_CREATED = "screening.created"
    SCREENING_COMPLETED = "screening.completed"
    SCREENING_MATCHED = "screening.matched"
    CASE_ASSIGNED = "case.assigned"
    CASE_STATUS_CHANGED = "case.status_changed"
    USER_CREATED = "user.created"
    USER_DELETED = "user.deleted"
    ORGANIZATION_CREATED = "organization.created"

@dataclass
class IntegrationResult:
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class IntegrationError(Exception):
    """Base exception for integration errors"""
    pass

class BaseIntegration(ABC):
    """Abstract base class for all integrations"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.enabled = config.get("enabled", False)
    
    @abstractmethod
    async def test_connection(self) -> IntegrationResult:
        """Test connection to the external service"""
        pass
    
    @abstractmethod
    async def sync_customer_data(self, customer_data: Dict[str, Any]) -> IntegrationResult:
        """Sync customer data to external system"""
        pass
    
    @abstractmethod
    async def get_customer_data(self, customer_id: str) -> IntegrationResult:
        """Get customer data from external system"""
        pass

class SalesforceIntegration(BaseIntegration):
    """Salesforce CRM Integration"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.instance_url = config.get("instance_url")
        self.client_id = config.get("client_id")
        self.client_secret = config.get("client_secret")
        self.username = config.get("username")
        self.password = config.get("password")
        self.security_token = config.get("security_token")
        self.access_token = None
    
    async def authenticate(self) -> bool:
        """Authenticate with Salesforce using OAuth 2.0"""
        try:
            auth_url = f"{self.instance_url}/services/oauth2/token"
            
            data = {
                "grant_type": "password",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "username": self.username,
                "password": self.password + self.security_token
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(auth_url, data=data)
                response.raise_for_status()
                
                auth_data = response.json()
                self.access_token = auth_data["access_token"]
                self.instance_url = auth_data["instance_url"]
                
                return True
        except Exception as e:
            audit_logger.log_action(
                "system", "salesforce_auth_failed", "integration", 
                {"error": str(e)}, 
                False
            )
            return False
    
    async def test_connection(self) -> IntegrationResult:
        """Test Salesforce connection"""
        if not await self.authenticate():
            return IntegrationResult(
                success=False,
                message="Authentication failed",
                error="Invalid Salesforce credentials"
            )
        
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            test_url = f"{self.instance_url}/services/data/v52.0/sobjects/Account/describe"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(test_url, headers=headers)
                response.raise_for_status()
                
                return IntegrationResult(
                    success=True,
                    message="Salesforce connection successful"
                )
        except Exception as e:
            return IntegrationResult(
                success=False,
                message="Connection test failed",
                error=str(e)
            )
    
    async def sync_customer_data(self, customer_data: Dict[str, Any]) -> IntegrationResult:
        """Create or update customer in Salesforce"""
        if not self.access_token:
            if not await self.authenticate():
                return IntegrationResult(
                    success=False,
                    message="Authentication required",
                    error="Not authenticated with Salesforce"
                )
        
        try:
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            }
            
            # Map AMLtab customer data to Salesforce fields
            salesforce_data = {
                "Name": customer_data.get("name", ""),
                "Email__c": customer_data.get("email", ""),
                "Phone": customer_data.get("phone", ""),
                "Website": customer_data.get("website", ""),
                "Industry": customer_data.get("industry", ""),
                "Description": customer_data.get("description", ""),
                "AML_Screening_Status__c": customer_data.get("screening_status", ""),
                "AML_Last_Screened__c": customer_data.get("last_screened", ""),
                "AML_Risk_Level__c": customer_data.get("risk_level", ""),
                "Customer_ID__c": customer_data.get("customer_id", "")
            }
            
            # Check if customer already exists
            search_url = f"{self.instance_url}/services/data/v52.0/query/"
            query = f"SELECT Id FROM Account WHERE Customer_ID__c = '{customer_data.get('customer_id', '')}'"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    search_url,
                    headers=headers,
                    params={"q": query}
                )
                response.raise_for_status()
                
                result = response.json()
                
                if result["totalSize"] > 0:
                    # Update existing customer
                    account_id = result["records"][0]["Id"]
                    update_url = f"{self.instance_url}/services/data/v52.0/sobjects/Account/{account_id}"
                    
                    response = await client.patch(
                        update_url,
                        headers=headers,
                        json=salesforce_data
                    )
                    response.raise_for_status()
                    
                    action = "updated"
                else:
                    # Create new customer
                    create_url = f"{self.instance_url}/services/data/v52.0/sobjects/Account/"
                    
                    response = await client.post(
                        create_url,
                        headers=headers,
                        json=salesforce_data
                    )
                    response.raise_for_status()
                    
                    action = "created"
            
            audit_logger.log_action(
                "system", "salesforce_sync", "integration", 
                {"customer_id": customer_data.get("customer_id"), "action": action}, 
                True
            )
            
            return IntegrationResult(
                success=True,
                message=f"Customer {action} in Salesforce successfully",
                data={"action": action}
            )
            
        except Exception as e:
            return IntegrationResult(
                success=False,
                message="Failed to sync customer data",
                error=str(e)
            )
    
    async def get_customer_data(self, customer_id: str) -> IntegrationResult:
        """Get customer data from Salesforce"""
        if not self.access_token:
            if not await self.authenticate():
                return IntegrationResult(
                    success=False,
                    message="Authentication required",
                    error="Not authenticated with Salesforce"
                )
        
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            search_url = f"{self.instance_url}/services/data/v52.0/query/"
            query = f"SELECT Id, Name, Email__c, Phone, Website, Industry, Description, AML_Screening_Status__c, AML_Last_Screened__c, AML_Risk_Level__c FROM Account WHERE Customer_ID__c = '{customer_id}'"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    search_url,
                    headers=headers,
                    params={"q": query}
                )
                response.raise_for_status()
                
                result = response.json()
                
                if result["totalSize"] == 0:
                    return IntegrationResult(
                        success=False,
                        message="Customer not found in Salesforce",
                        error="Customer not found"
                    )
                
                account = result["records"][0]
                customer_data = {
                    "id": account["Id"],
                    "name": account["Name"],
                    "email": account.get("Email__c", ""),
                    "phone": account.get("Phone", ""),
                    "website": account.get("Website", ""),
                    "industry": account.get("Industry", ""),
                    "description": account.get("Description", ""),
                    "screening_status": account.get("AML_Screening_Status__c", ""),
                    "last_screened": account.get("AML_Last_Screened__c", ""),
                    "risk_level": account.get("AML_Risk_Level__c", "")
                }
                
                return IntegrationResult(
                    success=True,
                    message="Customer data retrieved successfully",
                    data=customer_data
                )
                
        except Exception as e:
            return IntegrationResult(
                success=False,
                message="Failed to get customer data",
                error=str(e)
            )

class HubSpotIntegration(BaseIntegration):
    """HubSpot CRM Integration"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.api_key = config.get("api_key")
        self.base_url = "https://api.hubapi.com"
    
    async def test_connection(self) -> IntegrationResult:
        """Test HubSpot connection"""
        try:
            headers = {"Authorization": f"Bearer {self.api_key}"}
            test_url = f"{self.base_url}/contacts/v1/lists/all/contacts/all"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(test_url, headers=headers, params={"count": 1})
                response.raise_for_status()
                
                return IntegrationResult(
                    success=True,
                    message="HubSpot connection successful"
                )
        except Exception as e:
            return IntegrationResult(
                success=False,
                message="Connection test failed",
                error=str(e)
            )
    
    async def sync_customer_data(self, customer_data: Dict[str, Any]) -> IntegrationResult:
        """Create or update contact in HubSpot"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            # Map AMLtab customer data to HubSpot contact properties
            contact_data = {
                "properties": [
                    {"property": "email", "value": customer_data.get("email", "")},
                    {"property": "firstname", "value": customer_data.get("first_name", "")},
                    {"property": "lastname", "value": customer_data.get("last_name", "")},
                    {"property": "phone", "value": customer_data.get("phone", "")},
                    {"property": "website", "value": customer_data.get("website", "")},
                    {"property": "company", "value": customer_data.get("company", "")},
                    {"property": "industry", "value": customer_data.get("industry", "")},
                    {"property": "aml_screening_status", "value": customer_data.get("screening_status", "")},
                    {"property": "aml_last_screened", "value": customer_data.get("last_screened", "")},
                    {"property": "aml_risk_level", "value": customer_data.get("risk_level", "")},
                    {"property": "customer_id", "value": customer_data.get("customer_id", "")}
                ]
            }
            
            # Check if contact exists by email
            search_url = f"{self.base_url}/contacts/v1/contact/email/{customer_data.get('email')}/profile"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(search_url, headers=headers)
                
                if response.status_code == 200:
                    # Update existing contact
                    update_url = f"{self.base_url}/contacts/v1/contact/vid/{response.json()['vid']}/profile"
                    response = await client.post(update_url, headers=headers, json=contact_data)
                    response.raise_for_status()
                    action = "updated"
                else:
                    # Create new contact
                    create_url = f"{self.base_url}/contacts/v1/contact"
                    response = await client.post(create_url, headers=headers, json=contact_data)
                    response.raise_for_status()
                    action = "created"
            
            return IntegrationResult(
                success=True,
                message=f"Contact {action} in HubSpot successfully",
                data={"action": action}
            )
            
        except Exception as e:
            return IntegrationResult(
                success=False,
                message="Failed to sync contact data",
                error=str(e)
            )
    
    async def get_customer_data(self, customer_id: str) -> IntegrationResult:
        """Get contact data from HubSpot by customer_id"""
        try:
            headers = {"Authorization": f"Bearer {self.api_key}"}
            
            # Search for contact by customer_id property
            search_url = f"{self.base_url}/contacts/v1/search/query"
            query = f"customer_id:{customer_id}"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    search_url,
                    headers=headers,
                    params={"q": query}
                )
                response.raise_for_status()
                
                result = response.json()
                
                if not result.get("contacts"):
                    return IntegrationResult(
                        success=False,
                        message="Contact not found in HubSpot",
                        error="Contact not found"
                    )
                
                contact = result["contacts"][0]["properties"]
                customer_data = {
                    "id": result["contacts"][0]["vid"],
                    "email": contact.get("email", {}).get("value", ""),
                    "first_name": contact.get("firstname", {}).get("value", ""),
                    "last_name": contact.get("lastname", {}).get("value", ""),
                    "phone": contact.get("phone", {}).get("value", ""),
                    "website": contact.get("website", {}).get("value", ""),
                    "company": contact.get("company", {}).get("value", ""),
                    "industry": contact.get("industry", {}).get("value", ""),
                    "screening_status": contact.get("aml_screening_status", {}).get("value", ""),
                    "last_screened": contact.get("aml_last_screened", {}).get("value", ""),
                    "risk_level": contact.get("aml_risk_level", {}).get("value", "")
                }
                
                return IntegrationResult(
                    success=True,
                    message="Contact data retrieved successfully",
                    data=customer_data
                )
                
        except Exception as e:
            return IntegrationResult(
                success=False,
                message="Failed to get contact data",
                error=str(e)
            )

class WebhookIntegration:
    """Webhook system for real-time notifications"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def register_webhook(self, org_id: str, url: str, events: List[str], 
                              headers: Dict[str, str] = None) -> IntegrationResult:
        """Register a new webhook for an organization"""
        try:
            webhook = Webhook(
                org_id=org_id,
                url=url,
                events=events,
                headers=headers or {},
                is_active=True,
                created_at=datetime.utcnow()
            )
            
            self.db.add(webhook)
            self.db.commit()
            self.db.refresh(webhook)
            
            audit_logger.log_action(
                "system", "webhook_registered", "integration", 
                {"org_id": org_id, "url": url, "events": events}, 
                True
            )
            
            return IntegrationResult(
                success=True,
                message="Webhook registered successfully",
                data={"webhook_id": webhook.id}
            )
            
        except Exception as e:
            return IntegrationResult(
                success=False,
                message="Failed to register webhook",
                error=str(e)
            )
    
    async def send_webhook_event(self, org_id: str, event_type: str, 
                               payload: Dict[str, Any]) -> List[IntegrationResult]:
        """Send webhook event to all registered webhooks for an organization"""
        results = []
        
        # Get all active webhooks for the organization
        webhooks = self.db.query(Webhook).filter(
            Webhook.org_id == org_id,
            Webhook.is_active == True,
            Webhook.events.contains([event_type])
        ).all()
        
        for webhook in webhooks:
            result = await self._send_single_webhook(webhook, event_type, payload)
            results.append(result)
        
        return results
    
    async def _send_single_webhook(self, webhook: Webhook, event_type: str, 
                                 payload: Dict[str, Any]) -> IntegrationResult:
        """Send a single webhook event"""
        try:
            headers = {
                "Content-Type": "application/json",
                "X-Event-Type": event_type,
                "X-Organization-ID": webhook.org_id,
                "User-Agent": "AMLtab-Webhook/2.0"
            }
            
            # Add custom headers
            headers.update(webhook.headers)
            
            # Add timestamp to payload
            webhook_payload = {
                "event": event_type,
                "timestamp": datetime.utcnow().isoformat(),
                "organization_id": webhook.org_id,
                "data": payload
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    webhook.url,
                    headers=headers,
                    json=webhook_payload
                )
                response.raise_for_status()
                
                audit_logger.log_action(
                    "system", "webhook_sent", "integration", 
                    {"webhook_id": webhook.id, "event": event_type, "status": response.status_code}, 
                    True
                )
                
                return IntegrationResult(
                    success=True,
                    message="Webhook sent successfully",
                    data={"status_code": response.status_code}
                )
                
        except Exception as e:
            audit_logger.log_action(
                "system", "webhook_failed", "integration", 
                {"webhook_id": webhook.id, "event": event_type, "error": str(e)}, 
                False
            )
            
            return IntegrationResult(
                success=False,
                message="Failed to send webhook",
                error=str(e)
            )

class SIEMIntegration:
    """SIEM (Security Information and Event Management) Integration"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.enabled = config.get("enabled", False)
        self.siem_url = config.get("siem_url")
        self.api_key = config.get("api_key")
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def send_security_event(self, event_type: str, event_data: Dict[str, Any]) -> IntegrationResult:
        """Send security event to SIEM system"""
        if not self.enabled:
            return IntegrationResult(
                success=False,
                message="SIEM integration not enabled",
                error="Integration disabled"
            )
        
        try:
            # Format event for SIEM
            siem_event = {
                "timestamp": datetime.utcnow().isoformat(),
                "event_type": event_type,
                "source": "AMLtab",
                "version": "2.0",
                "data": event_data
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.siem_url,
                    headers=self.headers,
                    json=siem_event
                )
                response.raise_for_status()
                
                return IntegrationResult(
                    success=True,
                    message="Security event sent to SIEM",
                    data={"event_id": response.json().get("event_id")}
                )
                
        except Exception as e:
            return IntegrationResult(
                success=False,
                message="Failed to send security event",
                error=str(e)
            )

class IntegrationManager:
    """Manager for all integrations"""
    
    def __init__(self, db: Session):
        self.db = db
        self.integrations = {}
        self.webhook_manager = WebhookIntegration(db)
    
    def register_integration(self, integration_type: IntegrationType, 
                           config: Dict[str, Any]) -> BaseIntegration:
        """Register an integration"""
        if integration_type == IntegrationType.SALESFORCE:
            integration = SalesforceIntegration(config)
        elif integration_type == IntegrationType.HUBSPOT:
            integration = HubSpotIntegration(config)
        else:
            raise ValueError(f"Unsupported integration type: {integration_type}")
        
        self.integrations[integration_type] = integration
        return integration
    
    async def test_all_integrations(self) -> Dict[str, IntegrationResult]:
        """Test all configured integrations"""
        results = {}
        
        for integration_type, integration in self.integrations.items():
            if integration.enabled:
                result = await integration.test_connection()
                results[integration_type.value] = result
            else:
                results[integration_type.value] = IntegrationResult(
                    success=False,
                    message="Integration disabled",
                    error="Integration not configured"
                )
        
        return results
    
    async def sync_customer_to_all(self, customer_data: Dict[str, Any]) -> Dict[str, IntegrationResult]:
        """Sync customer data to all enabled integrations"""
        results = {}
        
        for integration_type, integration in self.integrations.items():
            if integration.enabled:
                result = await integration.sync_customer_data(customer_data)
                results[integration_type.value] = result
        
        return results
    
    async def send_webhook_event(self, org_id: str, event_type: str, 
                               payload: Dict[str, Any]) -> List[IntegrationResult]:
        """Send webhook event"""
        return await self.webhook_manager.send_webhook_event(org_id, event_type, payload)

# Usage example:
"""
# Initialize integration manager
integration_manager = IntegrationManager(db)

# Register integrations
salesforce_config = {
    "enabled": True,
    "instance_url": "https://your-instance.salesforce.com",
    "client_id": "your_client_id",
    "client_secret": "your_client_secret",
    "username": "your_username",
    "password": "your_password",
    "security_token": "your_security_token"
}

hubspot_config = {
    "enabled": True,
    "api_key": "your_hubspot_api_key"
}

integration_manager.register_integration(IntegrationType.SALESFORCE, salesforce_config)
integration_manager.register_integration(IntegrationType.HUBSPOT, hubspot_config)

# Test integrations
results = await integration_manager.test_all_integrations()

# Sync customer data
customer_data = {
    "customer_id": "CUST-12345",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "company": "Example Corp",
    "screening_status": "completed",
    "risk_level": "low"
}

sync_results = await integration_manager.sync_customer_to_all(customer_data)

# Send webhook event
webhook_results = await integration_manager.send_webhook_event(
    org_id="org-123",
    event_type="screening.completed",
    payload={"screening_id": "scr-123", "status": "completed"}
)
"""