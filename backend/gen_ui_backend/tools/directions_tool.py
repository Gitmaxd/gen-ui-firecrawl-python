import os
import requests
from typing import Dict
from pydantic import BaseModel, Field
from langchain_core.tools import tool

class DirectionsInput(BaseModel):
    origin: str = Field(..., description="The starting point for directions")
    destination: str = Field(..., description="The destination point for directions")

@tool("get_directions", args_schema=DirectionsInput)
def get_directions(origin: str, destination: str) -> Dict:
    """A tool to fetch directions between two locations using Google Maps."""
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    if not api_key:
        raise ValueError("Missing GOOGLE_MAPS_API_KEY in environment variables.")

    base_url = "https://maps.googleapis.com/maps/api/directions/json"
    params = {
        "origin": origin,
        "destination": destination,
        "key": api_key
    }

    response = requests.get(base_url, params=params)
    
    if response.status_code == 200:
        directions_data = response.json()
        if directions_data["status"] == "OK":
            route = directions_data["routes"][0]
            legs = route["legs"][0]
            steps = [{"instruction": step["html_instructions"], "distance": step["distance"]["text"]} for step in legs["steps"]]
            
            return {
                "origin": origin,
                "destination": destination,
                "distance": legs["distance"]["text"],
                "duration": legs["duration"]["text"],
                "steps": steps,
                "polyline": route["overview_polyline"]["points"]
            }
        else:
            return {"error": f"Directions not found: {directions_data['status']}"}
    else:
        return {"error": f"API request failed with status code: {response.status_code}"}