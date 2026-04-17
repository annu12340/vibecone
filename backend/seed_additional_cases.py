"""
Additional seed cases for populating the India map with diverse state-wise distribution.
Maharashtra will have the highest count (8 cases).
"""
from datetime import datetime, timezone, timedelta
from uuid import uuid4

def _iso(days_ago: int = 0) -> str:
    return (datetime.now(timezone.utc) - timedelta(days=days_ago)).isoformat()

# Maharashtra Cases (8 cases - highest)
MAHARASHTRA_CASES = [
    {
        "id": str(uuid4()),
        "title": "Land Dispute - Mumbai Suburban District",
        "description": "Property dispute regarding ancestral land in Andheri",
        "case_type": "Civil",
        "jurisdiction": "Mumbai",
        "judge_name": "Hon. Justice P. K. Desai",
        "charges": ["Property Act Section 6"],
        "status": "complete",
        "created_at": _iso(30),
    },
    {
        "id": str(uuid4()),
        "title": "Contract Breach - Pune Commercial Court",
        "description": "Business contract violation case",
        "case_type": "Corporate / Financial",
        "jurisdiction": "Pune",
        "judge_name": "Hon. Justice S. M. Patil",
        "charges": ["Contract Act 1872 - Section 73"],
        "status": "pending",
        "created_at": _iso(25),
    },
    {
        "id": str(uuid4()),
        "title": "Assault Case - Nagpur District",
        "description": "Physical assault incident",
        "case_type": "Criminal",
        "jurisdiction": "Nagpur",
        "judge_name": "Hon. Justice R. K. Sharma",
        "charges": ["IPC Section 323", "IPC Section 506"],
        "status": "complete",
        "created_at": _iso(20),
    },
    {
        "id": str(uuid4()),
        "title": "Divorce Petition - Mumbai Family Court",
        "description": "Contested divorce proceedings",
        "case_type": "Family",
        "jurisdiction": "Greater Mumbai",
        "judge_name": "Hon. Justice M. A. Khan",
        "charges": [],
        "status": "pending",
        "created_at": _iso(15),
    },
    {
        "id": str(uuid4()),
        "title": "Cyber Crime - Thane District",
        "description": "Online fraud and identity theft",
        "case_type": "Criminal",
        "jurisdiction": "Maharashtra",
        "judge_name": "Hon. Justice V. B. Joshi",
        "charges": ["IT Act Section 66C", "IPC Section 420"],
        "status": "pending",
        "created_at": _iso(12),
    },
    {
        "id": str(uuid4()),
        "title": "Labour Dispute - Nashik Industrial Court",
        "description": "Factory worker rights violation",
        "case_type": "Employment",
        "jurisdiction": "Maharashtra",
        "judge_name": "Hon. Justice A. S. Kulkarni",
        "charges": ["Industrial Disputes Act 1947"],
        "status": "complete",
        "created_at": _iso(10),
    },
    {
        "id": str(uuid4()),
        "title": "Environmental Violation - Mumbai High Court",
        "description": "Illegal construction near coastal area",
        "case_type": "Constitutional",
        "jurisdiction": "Bombay High Court",
        "judge_name": "Hon. Justice N. J. Jamadar",
        "charges": ["Environment Protection Act 1986"],
        "status": "pending",
        "created_at": _iso(8),
    },
    {
        "id": str(uuid4()),
        "title": "Cheque Bounce - Aurangabad Court",
        "description": "Dishonour of cheque case",
        "case_type": "Corporate / Financial",
        "jurisdiction": "Maharashtra",
        "judge_name": "Hon. Justice K. R. Deshmukh",
        "charges": ["Negotiable Instruments Act Section 138"],
        "status": "pending",
        "created_at": _iso(5),
    },
]

# Karnataka Cases (5 cases)
KARNATAKA_CASES = [
    {
        "id": str(uuid4()),
        "title": "Software Patent Case - Bangalore",
        "description": "Intellectual property dispute",
        "case_type": "Corporate / Financial",
        "jurisdiction": "Karnataka",
        "judge_name": "Hon. Justice S. R. Rao",
        "charges": ["Patents Act 1970"],
        "status": "pending",
        "created_at": _iso(18),
    },
    {
        "id": str(uuid4()),
        "title": "Traffic Accident Claim - Mysore",
        "description": "Motor vehicle accident compensation",
        "case_type": "Civil",
        "jurisdiction": "Karnataka",
        "judge_name": "Hon. Justice M. Nataraj",
        "charges": [],
        "status": "complete",
        "created_at": _iso(22),
    },
    {
        "id": str(uuid4()),
        "title": "Tenant Eviction - Bangalore",
        "description": "Rental property dispute",
        "case_type": "Civil",
        "jurisdiction": "Bengaluru",
        "judge_name": "Hon. Justice P. K. Reddy",
        "charges": ["Karnataka Rent Act"],
        "status": "pending",
        "created_at": _iso(14),
    },
    {
        "id": str(uuid4()),
        "title": "Corruption Case - Karnataka High Court",
        "description": "Government official bribery",
        "case_type": "Criminal",
        "jurisdiction": "Karnataka High Court",
        "judge_name": "Hon. Justice A. S. Bopanna",
        "charges": ["Prevention of Corruption Act 1988"],
        "status": "complete",
        "created_at": _iso(11),
    },
    {
        "id": str(uuid4()),
        "title": "Will Dispute - Hubli",
        "description": "Inheritance property contestation",
        "case_type": "Family",
        "jurisdiction": "Karnataka",
        "judge_name": "Hon. Justice V. Sreenivasan",
        "charges": [],
        "status": "pending",
        "created_at": _iso(7),
    },
]

# Tamil Nadu Cases (4 cases)
TAMIL_NADU_CASES = [
    {
        "id": str(uuid4()),
        "title": "Land Acquisition - Chennai",
        "description": "Government land acquisition dispute",
        "case_type": "Constitutional",
        "jurisdiction": "Chennai",
        "judge_name": "Hon. Justice M. Duraiswamy",
        "charges": ["Land Acquisition Act 2013"],
        "status": "pending",
        "created_at": _iso(19),
    },
    {
        "id": str(uuid4()),
        "title": "Consumer Rights - Coimbatore",
        "description": "Product defect compensation",
        "case_type": "Civil",
        "jurisdiction": "Tamil Nadu",
        "judge_name": "Hon. Justice S. Manikumar",
        "charges": ["Consumer Protection Act 2019"],
        "status": "complete",
        "created_at": _iso(16),
    },
    {
        "id": str(uuid4()),
        "title": "Temple Trust Dispute - Madurai",
        "description": "Religious endowment case",
        "case_type": "Civil",
        "jurisdiction": "Tamil Nadu",
        "judge_name": "Hon. Justice T. S. Sivagnanam",
        "charges": [],
        "status": "pending",
        "created_at": _iso(13),
    },
    {
        "id": str(uuid4()),
        "title": "Theft Case - Salem",
        "description": "Burglary and theft charges",
        "case_type": "Criminal",
        "jurisdiction": "Tamil Nadu",
        "judge_name": "Hon. Justice K. Ravichandran",
        "charges": ["IPC Section 379", "IPC Section 457"],
        "status": "complete",
        "created_at": _iso(9),
    },
]

# West Bengal Cases (3 cases)
WEST_BENGAL_CASES = [
    {
        "id": str(uuid4()),
        "title": "Labour Strike - Kolkata",
        "description": "Industrial workers strike action",
        "case_type": "Employment",
        "jurisdiction": "Kolkata",
        "judge_name": "Hon. Justice Soumen Sen",
        "charges": ["Trade Unions Act 1926"],
        "status": "pending",
        "created_at": _iso(17),
    },
    {
        "id": str(uuid4()),
        "title": "Bank Fraud - Howrah",
        "description": "Financial fraud investigation",
        "case_type": "Corporate / Financial",
        "jurisdiction": "West Bengal",
        "judge_name": "Hon. Justice Debangsu Basak",
        "charges": ["Banking Regulation Act 1949", "IPC Section 420"],
        "status": "complete",
        "created_at": _iso(23),
    },
    {
        "id": str(uuid4()),
        "title": "Education Admission Scam - Kolkata",
        "description": "Illegal admissions in educational institution",
        "case_type": "Criminal",
        "jurisdiction": "Calcutta High Court",
        "judge_name": "Hon. Justice Abhijit Gangopadhyay",
        "charges": ["IPC Section 420", "IPC Section 120B"],
        "status": "pending",
        "created_at": _iso(6),
    },
]

# Rajasthan Cases (3 cases)
RAJASTHAN_CASES = [
    {
        "id": str(uuid4()),
        "title": "Water Rights Dispute - Jaipur",
        "description": "Agricultural water allocation",
        "case_type": "Civil",
        "jurisdiction": "Jaipur",
        "judge_name": "Hon. Justice Sandeep Mehta",
        "charges": [],
        "status": "pending",
        "created_at": _iso(24),
    },
    {
        "id": str(uuid4()),
        "title": "Mining License Case - Udaipur",
        "description": "Illegal mining operations",
        "case_type": "Constitutional",
        "jurisdiction": "Rajasthan",
        "judge_name": "Hon. Justice Pankaj Mithal",
        "charges": ["Mines and Minerals Act 1957"],
        "status": "complete",
        "created_at": _iso(15),
    },
    {
        "id": str(uuid4()),
        "title": "Domestic Violence - Jodhpur",
        "description": "Family violence case",
        "case_type": "Domestic Violence",
        "jurisdiction": "Rajasthan",
        "judge_name": "Hon. Justice Rekha Borana",
        "charges": ["DV Act 2005", "IPC Section 498A"],
        "status": "pending",
        "created_at": _iso(10),
    },
]

# Gujarat Cases (3 cases)
GUJARAT_CASES = [
    {
        "id": str(uuid4()),
        "title": "GST Evasion - Ahmedabad",
        "description": "Tax evasion case",
        "case_type": "Corporate / Financial",
        "jurisdiction": "Ahmedabad",
        "judge_name": "Hon. Justice J. B. Pardiwala",
        "charges": ["GST Act 2017"],
        "status": "pending",
        "created_at": _iso(21),
    },
    {
        "id": str(uuid4()),
        "title": "Communal Riot Case - Surat",
        "description": "Public violence charges",
        "case_type": "Criminal",
        "jurisdiction": "Gujarat",
        "judge_name": "Hon. Justice A. Y. Kogje",
        "charges": ["IPC Section 147", "IPC Section 148"],
        "status": "complete",
        "created_at": _iso(26),
    },
    {
        "id": str(uuid4()),
        "title": "Real Estate Fraud - Vadodara",
        "description": "Property builder fraud",
        "case_type": "Corporate / Financial",
        "jurisdiction": "Gujarat",
        "judge_name": "Hon. Justice N. V. Anjaria",
        "charges": ["IPC Section 420", "RERA Act 2016"],
        "status": "pending",
        "created_at": _iso(12),
    },
]

# Bihar Cases (2 cases)
BIHAR_CASES = [
    {
        "id": str(uuid4()),
        "title": "Caste Atrocity - Patna",
        "description": "SC/ST Act violation",
        "case_type": "Criminal",
        "jurisdiction": "Patna",
        "judge_name": "Hon. Justice Chakradhari Sharan Singh",
        "charges": ["SC/ST Act 1989"],
        "status": "pending",
        "created_at": _iso(28),
    },
    {
        "id": str(uuid4()),
        "title": "Land Dispute - Gaya",
        "description": "Agricultural land ownership",
        "case_type": "Civil",
        "jurisdiction": "Bihar",
        "judge_name": "Hon. Justice Ashwani Kumar Singh",
        "charges": [],
        "status": "complete",
        "created_at": _iso(14),
    },
]

# Madhya Pradesh Cases (2 cases)
MP_CASES = [
    {
        "id": str(uuid4()),
        "title": "Forest Rights - Bhopal",
        "description": "Tribal forest land rights",
        "case_type": "Constitutional",
        "jurisdiction": "Bhopal",
        "judge_name": "Hon. Justice Sheel Nagu",
        "charges": ["Forest Rights Act 2006"],
        "status": "pending",
        "created_at": _iso(19),
    },
    {
        "id": str(uuid4()),
        "title": "Kidnapping Case - Indore",
        "description": "Abduction and ransom demand",
        "case_type": "Criminal",
        "jurisdiction": "Madhya Pradesh",
        "judge_name": "Hon. Justice Vijay Kumar Shukla",
        "charges": ["IPC Section 363", "IPC Section 384"],
        "status": "complete",
        "created_at": _iso(11),
    },
]

def get_all_additional_cases():
    """Return all additional seed cases."""
    return (
        MAHARASHTRA_CASES +
        KARNATAKA_CASES +
        TAMIL_NADU_CASES +
        WEST_BENGAL_CASES +
        RAJASTHAN_CASES +
        GUJARAT_CASES +
        BIHAR_CASES +
        MP_CASES
    )

def get_case_distribution():
    """Return state-wise case count."""
    return {
        "Maharashtra": len(MAHARASHTRA_CASES),
        "Karnataka": len(KARNATAKA_CASES),
        "Tamil Nadu": len(TAMIL_NADU_CASES),
        "West Bengal": len(WEST_BENGAL_CASES),
        "Rajasthan": len(RAJASTHAN_CASES),
        "Gujarat": len(GUJARAT_CASES),
        "Bihar": len(BIHAR_CASES),
        "Madhya Pradesh": len(MP_CASES),
    }
