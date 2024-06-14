import os
from typing import Dict, Union

from langchain.pydantic_v1 import BaseModel, Field
from langchain_core.tools import tool
from firecrawl import FirecrawlApp


class WebDataInput(BaseModel):
    url: str = Field(..., description="The url to scrape")


@tool("get_web_data", args_schema=WebDataInput, return_direct=True)
def get_web_data(url: str) -> Union[Dict, str]:
    """A tool to fetch the current website data, given a url."""
    firecrawl_api_key = os.environ.get("FIRECRAWL_API_KEY")
    if not firecrawl_api_key:
        raise ValueError("Missing FIRECRAWL_API_KEY secret.")

    app = FirecrawlApp(api_key=firecrawl_api_key)

    params = {
        "pageOptions": {
            "screenshot": True,
        },
    }

    try:
        scraped_data = app.scrape_url(url, params)
        print("Debug: Full API Response -", scraped_data)
        metadata = scraped_data.get("metadata", {})
        title = metadata.get("title", "")
        description = metadata.get("description", "")
        screenshot = metadata.get("screenshot", "")

        return {
            "url": url,
            "title": title,
            "description": description,
            "screenshot": screenshot,
        }
    except Exception as err:
        print(err)
        return "There was an error fetching the website data. Please check the URL."