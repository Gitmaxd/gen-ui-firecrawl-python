"use client";

import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useLoadScript } from '@react-google-maps/api';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const containerStyle = {
  width: '100%',
  height: '400px'
};

// Move this outside of the component
const libraries = ['places'];

export interface CurrentLocationProps {
  requestLocation: boolean;
}

export function CurrentLocationLoading(): JSX.Element {
  return (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-[20px] w-[200px]" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[400px] w-full" />
      </CardContent>
    </Card>
  );
}

export function CurrentLocation({ requestLocation }: CurrentLocationProps): JSX.Element {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState<google.maps.LatLngLiteral | null>(null);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [locationFound, setLocationFound] = useState(false);

  const handleLocationRequest = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(pos);
          setLocationFound(true);
          if (infoWindow) {
            infoWindow.setPosition(pos);
            infoWindow.setContent("Location found.");
            infoWindow.open(map);
          }
          if (map) {
            map.setCenter(pos);
          }
        },
        () => {
          handleLocationError(true);
        }
      );
    } else {
      handleLocationError(false);
    }
  }, [map, infoWindow, center]);

  useEffect(() => {
    if (requestLocation) {
      handleLocationRequest();
    }
  }, [requestLocation, handleLocationRequest]);

  const handleLocationError = (browserHasGeolocation: boolean) => {
    const content = browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation.";
    if (infoWindow && map) {
      infoWindow.setPosition(center);
      infoWindow.setContent(content);
      infoWindow.open(map);
    }
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <CurrentLocationLoading />;
  }

  return (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle>Your Current Location</CardTitle>
      </CardHeader>
      <CardContent>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center || { lat: 0, lng: 0 }}
          zoom={15}
          onLoad={(map) => {
            setMap(map);
            setInfoWindow(new google.maps.InfoWindow());
          }}
        >
          {locationFound && center && <Marker position={center} />}
        </GoogleMap>
        <Button onClick={handleLocationRequest} className="mt-4">
          Refresh Location
        </Button>
      </CardContent>
    </Card>
  );
}