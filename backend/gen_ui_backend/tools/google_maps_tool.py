import os
from typing import Dict
from pydantic import BaseModel, Field
from langchain.pydantic_v1 import BaseModel
from langchain_core.tools import tool
import googlemaps

class AddressInput(BaseModel):
    address: str = Field(..., description="The address, GPS coordinates, or location to display on the map")

@tool("display_map_location", args_schema=AddressInput)
def display_map_location(address: str) -> Dict:
    """A tool to fetch the map location data for a given address, GPS Coordinates, or location."""
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    if not api_key:
        raise ValueError("Missing GOOGLE_MAPS_API_KEY in environment variables.")

    gmaps = googlemaps.Client(key=api_key)
    
    try:
        geocode_result = gmaps.geocode(address)
        if geocode_result:
            location = geocode_result[0]['geometry']['location']
            return {
                "address": address,
                "latitude": location['lat'],
                "longitude": location['lng'],
                "location": location
            }
        else:
            return {"error": "Address not found"}
    except Exception as e:
        return {"error": str(e)}