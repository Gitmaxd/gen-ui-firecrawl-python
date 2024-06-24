import os
from typing import Dict
from pydantic import BaseModel, Field
from langchain_core.tools import tool

class CurrentLocationInput(BaseModel):
    pass  # No input needed for this tool

@tool("get_current_location", args_schema=CurrentLocationInput)
def get_current_location() -> Dict:
    """A tool to request the user's current location."""
    return {
        "action": "request_location",
        "message": "Please allow access to your current location."
    }