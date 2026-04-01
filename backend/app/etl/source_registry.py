# Custom registry for high-priority sources provided by the user
SOURCE_REGISTRY = [
    {
        "identifier": "un_scsanctions",
        "title": "United Nations Security Council Sanctions",
        "url": "https://scsanctions.un.org/resources/xml/en/consolidated.xml",
        "publisher": "United Nations",
        "type": "sanctions"
    },
    {
        "identifier": "us_ofac_sdn",
        "title": "OFAC SDN List (United States)",
        "url": "https://ofac.treasury.gov/sanctions-list-service",
        "publisher": "US Treasury",
        "type": "sanctions"
    },
    {
        "identifier": "eu_fsf",
        "title": "EU Consolidated Sanctions List",
        "url": "https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList.xml",
        "publisher": "European Union",
        "type": "sanctions"
    },
    {
        "identifier": "gb_hmt",
        "title": "UK Sanctions List",
        "url": "https://sanctionslist.fcdo.gov.uk/docs/UK-Sanctions-List.xml",
        "publisher": "UK Government",
        "type": "sanctions"
    },
    {
        "identifier": "ca_asf",
        "title": "Canada Consolidated Sanctions List",
        "url": "https://www.international.gc.ca/world-monde/assets/pdfs/international_relations-relations_internationales/sanctions/consolidated_sanctions_list.csv",
        "publisher": "Canada Government",
        "type": "sanctions"
    },
    {
        "identifier": "au_dfat",
        "title": "Australia Sanctions List",
        "url": "https://www.dfat.gov.au/sites/default/files/consolidated-list.csv",
        "publisher": "Australia Government",
        "type": "sanctions"
    },
    {
        "identifier": "interpol_red",
        "title": "Interpol Red Notices",
        "url": "https://www.interpol.int/How-we-work/Notices/Red-Notices/View-Red-Notices",
        "publisher": "Interpol",
        "type": "crime"
    },
    {
        "identifier": "fbi_wanted",
        "title": "FBI Most Wanted",
        "url": "https://api.fbi.gov/wanted/v1/list",
        "publisher": "FBI",
        "type": "crime"
    },
    {
        "identifier": "wikidata",
        "title": "Wikidata Political Office Holders (PEP)",
        "url": "https://query.wikidata.org/",
        "publisher": "Wikimedia Foundation",
        "type": "pep"
    },
    {
        "identifier": "opencorporates",
        "title": "OpenCorporates",
        "url": "https://api.opencorporates.com/",
        "publisher": "OpenCorporates",
        "type": "corporate"
    }
]

def sync_source_registry(db_session):
    from ..models.models import OSSource
    for entry in SOURCE_REGISTRY:
        source = db_session.query(OSSource).filter(OSSource.identifier == entry["identifier"]).first()
        if not source:
            source = OSSource(identifier=entry["identifier"])
            db_session.add(source)
        
        source.title = entry["title"]
        source.source_url = entry["url"]
        source.publisher = entry["publisher"]
        source.type = entry["type"]
    
    db_session.commit()
